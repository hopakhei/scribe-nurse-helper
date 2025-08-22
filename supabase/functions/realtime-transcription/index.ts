import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const { headers } = req;
  const upgradeHeader = headers.get("upgrade") || "";

  if (upgradeHeader.toLowerCase() !== "websocket") {
    return new Response("Expected WebSocket connection", { status: 400 });
  }

  const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openAIApiKey) {
    return new Response("OpenAI API key not configured", { status: 500 });
  }

  console.log('Upgrading to WebSocket connection');
  const { socket, response } = Deno.upgradeWebSocket(req);

  let openAISocket: WebSocket | null = null;
  let sessionCreated = false;

  socket.onopen = () => {
    console.log('Client WebSocket connected');
    
    // Connect to OpenAI Realtime API
    openAISocket = new WebSocket("wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-10-01", {
      headers: {
        "Authorization": `Bearer ${openAIApiKey}`,
        "OpenAI-Beta": "realtime=v1"
      }
    });

    openAISocket.onopen = () => {
      console.log('Connected to OpenAI Realtime API');
    };

    openAISocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('Received from OpenAI:', data.type);

      // Handle session created event
      if (data.type === 'session.created' && !sessionCreated) {
        sessionCreated = true;
        console.log('Session created, sending configuration...');
        
        // Configure session for transcription
        const sessionConfig = {
          type: 'session.update',
          session: {
            modalities: ['text', 'audio'],
            instructions: 'You are a medical transcription assistant. Listen to conversations and provide accurate real-time transcription with speaker identification.',
            voice: 'alloy',
            input_audio_format: 'pcm16',
            output_audio_format: 'pcm16',
            input_audio_transcription: {
              model: 'whisper-1'
            },
            turn_detection: {
              type: 'server_vad',
              threshold: 0.5,
              prefix_padding_ms: 300,
              silence_duration_ms: 1000
            },
            temperature: 0.3,
            max_response_output_tokens: 'inf'
          }
        };
        
        openAISocket?.send(JSON.stringify(sessionConfig));
      }

      // Forward all messages to client
      socket.send(JSON.stringify(data));
    };

    openAISocket.onerror = (error) => {
      console.error('OpenAI WebSocket error:', error);
      socket.send(JSON.stringify({ type: 'error', message: 'OpenAI connection error' }));
    };

    openAISocket.onclose = () => {
      console.log('OpenAI WebSocket closed');
      socket.close();
    };
  };

  socket.onmessage = (event) => {
    try {
      const message = JSON.parse(event.data);
      console.log('Received from client:', message.type);
      
      // Forward client messages to OpenAI
      if (openAISocket && openAISocket.readyState === WebSocket.OPEN) {
        openAISocket.send(event.data);
      } else {
        console.error('OpenAI socket not ready');
        socket.send(JSON.stringify({ type: 'error', message: 'OpenAI connection not ready' }));
      }
    } catch (error) {
      console.error('Error parsing client message:', error);
      socket.send(JSON.stringify({ type: 'error', message: 'Invalid message format' }));
    }
  };

  socket.onclose = () => {
    console.log('Client WebSocket disconnected');
    openAISocket?.close();
  };

  socket.onerror = (error) => {
    console.error('Client WebSocket error:', error);
    openAISocket?.close();
  };

  return response;
});