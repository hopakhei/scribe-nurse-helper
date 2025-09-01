export class AudioRecorder {
  private stream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private processor: ScriptProcessorNode | null = null;
  private source: MediaStreamAudioSourceNode | null = null;

  constructor(private onAudioData: (audioData: Float32Array) => void) {}

  async start() {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 24000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      
      this.audioContext = new AudioContext({
        sampleRate: 24000,
      });
      
      this.source = this.audioContext.createMediaStreamSource(this.stream);
      this.processor = this.audioContext.createScriptProcessor(4096, 1, 1);
      
      this.processor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        this.onAudioData(new Float32Array(inputData));
      };
      
      this.source.connect(this.processor);
      this.processor.connect(this.audioContext.destination);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      throw error;
    }
  }

  stop() {
    if (this.source) {
      this.source.disconnect();
      this.source = null;
    }
    if (this.processor) {
      this.processor.disconnect();
      this.processor = null;
    }
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}

export const encodeAudioForAPI = (float32Array: Float32Array): string => {
  const int16Array = new Int16Array(float32Array.length);
  for (let i = 0; i < float32Array.length; i++) {
    const s = Math.max(-1, Math.min(1, float32Array[i]));
    int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
  }
  
  const uint8Array = new Uint8Array(int16Array.buffer);
  let binary = '';
  const chunkSize = 0x8000;
  
  for (let i = 0; i < uint8Array.length; i += chunkSize) {
    const chunk = uint8Array.subarray(i, Math.min(i + chunkSize, uint8Array.length));
    binary += String.fromCharCode.apply(null, Array.from(chunk));
  }
  
  return btoa(binary);
};

export class RealtimeTranscription {
  private ws: WebSocket | null = null;
  private recorder: AudioRecorder | null = null;
  private isConnected = false;

  constructor(
    private onTranscript: (text: string, isFinal: boolean, speaker?: string) => void,
    private onError: (error: string) => void,
    private onStatusChange: (status: string) => void
  ) {}

  async connect() {
    try {
      this.onStatusChange('Connecting to transcription service...');
      
      // Use the correct WebSocket URL format for Supabase edge functions
      const wsUrl = `wss://liuimkjmebgliurclubd.functions.supabase.co/realtime-transcription`;

      console.log('Connecting to WebSocket:', wsUrl);
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.isConnected = true;
        this.onStatusChange('Connected - Starting microphone...');
        this.startRecording();
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleRealtimeEvent(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        this.isConnected = false;
        this.onStatusChange('Disconnected');
        this.stopRecording();
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.onError('Connection error occurred');
        this.onStatusChange('Connection failed');
      };

    } catch (error) {
      console.error('Error connecting to realtime transcription:', error);
      this.onError('Failed to connect to transcription service');
    }
  }

  private async startRecording() {
    try {
      this.recorder = new AudioRecorder((audioData) => {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
          const encodedAudio = encodeAudioForAPI(audioData);
          this.ws.send(JSON.stringify({
            type: 'input_audio_buffer.append',
            audio: encodedAudio
          }));
        }
      });

      await this.recorder.start();
      this.onStatusChange('Recording - Speak naturally...');
    } catch (error) {
      console.error('Error starting recording:', error);
      this.onError('Failed to access microphone');
    }
  }

  private stopRecording() {
    if (this.recorder) {
      this.recorder.stop();
      this.recorder = null;
    }
  }

  private handleRealtimeEvent(event: any) {
    console.log('Realtime event:', event.type, event);

    switch (event.type) {
      case 'session.created':
        this.onStatusChange('Session created');
        break;
        
      case 'session.updated':
        this.onStatusChange('Ready for transcription');
        break;

      case 'input_audio_buffer.speech_started':
        this.onStatusChange('Speech detected...');
        break;

      case 'input_audio_buffer.speech_stopped':
        this.onStatusChange('Processing speech...');
        break;

      case 'conversation.item.input_audio_transcription.completed':
        if (event.transcript) {
          this.onTranscript(event.transcript, true, 'Speaker');
        }
        break;

      case 'conversation.item.input_audio_transcription.failed':
        this.onError('Transcription failed');
        break;

      case 'response.audio_transcript.delta':
        if (event.delta) {
          this.onTranscript(event.delta, false, 'AI');
        }
        break;

      case 'response.audio_transcript.done':
        this.onStatusChange('Ready for next input');
        break;

      case 'error':
        this.onError(event.message || 'Unknown error occurred');
        break;

      default:
        // Handle other event types silently
        break;
    }
  }

  disconnect() {
    this.stopRecording();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isConnected = false;
    this.onStatusChange('Disconnected');
  }

  isRecording() {
    return this.isConnected && this.recorder !== null;
  }
}