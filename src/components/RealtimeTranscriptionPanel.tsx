import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Mic, MicOff, Play, Square } from 'lucide-react';
import { RealtimeTranscription } from '@/utils/RealtimeAudio';
import { useToast } from '@/components/ui/use-toast';

interface TranscriptEntry {
  id: string;
  text: string;
  speaker: string;
  timestamp: Date;
  isFinal: boolean;
}

interface RealtimeTranscriptionPanelProps {
  onTranscriptUpdate?: (fullTranscript: string) => void;
}

const RealtimeTranscriptionPanel: React.FC<RealtimeTranscriptionPanelProps> = ({
  onTranscriptUpdate
}) => {
  const { toast } = useToast();
  const [isActive, setIsActive] = useState(false);
  const [status, setStatus] = useState('Ready to start');
  const [transcriptEntries, setTranscriptEntries] = useState<TranscriptEntry[]>([]);
  const [currentEntry, setCurrentEntry] = useState<TranscriptEntry | null>(null);
  
  const realtimeRef = useRef<RealtimeTranscription | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new entries are added
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [transcriptEntries, currentEntry]);

  // Update parent with full transcript
  useEffect(() => {
    const fullTranscript = transcriptEntries
      .map(entry => `${entry.speaker}: ${entry.text}`)
      .join('\n');
    onTranscriptUpdate?.(fullTranscript);
  }, [transcriptEntries, onTranscriptUpdate]);

  const handleTranscript = (text: string, isFinal: boolean, speaker: string = 'Speaker') => {
    const now = new Date();
    
    if (isFinal) {
      // Add final transcript entry
      const finalEntry: TranscriptEntry = {
        id: `${now.getTime()}-${Math.random()}`,
        text: text.trim(),
        speaker,
        timestamp: now,
        isFinal: true
      };
      
      setTranscriptEntries(prev => [...prev, finalEntry]);
      setCurrentEntry(null);
    } else {
      // Update current partial transcript
      const partialEntry: TranscriptEntry = {
        id: 'current',
        text: text.trim(),
        speaker,
        timestamp: now,
        isFinal: false
      };
      
      setCurrentEntry(partialEntry);
    }
  };

  const handleError = (error: string) => {
    console.error('Transcription error:', error);
    toast({
      title: "Transcription Error",
      description: `Connection issue: ${error}. The real-time transcription service may be unavailable.`,
      variant: "destructive",
    });
    setStatus(`Error: ${error}`);
    setIsActive(false);
  };

  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus);
  };

  const startTranscription = async () => {
    try {
      setStatus('Initializing connection...');
      
      realtimeRef.current = new RealtimeTranscription(
        handleTranscript,
        handleError,
        handleStatusChange
      );
      
      await realtimeRef.current.connect();
      setIsActive(true);
      
      toast({
        title: "Transcription Started",
        description: "Real-time transcription is now active",
      });
    } catch (error) {
      console.error('Error starting transcription:', error);
      setStatus('Connection failed');
      toast({
        title: "Connection Error",
        description: "Failed to start real-time transcription. Please check your internet connection and try again.",
        variant: "destructive",
      });
    }
  };

  const stopTranscription = () => {
    if (realtimeRef.current) {
      realtimeRef.current.disconnect();
      realtimeRef.current = null;
    }
    setIsActive(false);
    setCurrentEntry(null);
    setStatus('Stopped');
    
    toast({
      title: "Transcription Stopped",
      description: "Real-time transcription has been stopped",
    });
  };

  const clearTranscript = () => {
    setTranscriptEntries([]);
    setCurrentEntry(null);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <Card className="w-full h-96">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Real-time Transcription</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant={isActive ? "default" : "secondary"}>
              {status}
            </Badge>
            {!isActive ? (
              <Button onClick={startTranscription} size="sm" className="gap-2">
                <Play className="h-4 w-4" />
                Start
              </Button>
            ) : (
              <Button onClick={stopTranscription} variant="destructive" size="sm" className="gap-2">
                <Square className="h-4 w-4" />
                Stop
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isActive ? (
              <Mic className="h-4 w-4 text-red-500 animate-pulse" />
            ) : (
              <MicOff className="h-4 w-4 text-muted-foreground" />
            )}
            <span className="text-sm text-muted-foreground">
              {isActive ? 'Listening...' : 'Not recording'}
            </span>
          </div>
          
          <Button 
            onClick={clearTranscript} 
            variant="outline" 
            size="sm"
            disabled={transcriptEntries.length === 0}
          >
            Clear
          </Button>
        </div>

        <ScrollArea ref={scrollAreaRef} className="h-64 w-full border rounded-md p-4">
        <div className="space-y-3">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  Real-time Transcription Unavailable
                </h3>
                <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                  <p>The WebSocket connection to the transcription service is failing. This could be due to:</p>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    <li>Network connectivity issues</li>
                    <li>Service deployment in progress</li>
                    <li>Temporary server unavailability</li>
                  </ul>
                  <p className="mt-2">
                    <strong>Alternative:</strong> You can still use the batch transcription by clicking the record button in the audio controls above.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {transcriptEntries.map((entry) => (
              <div key={entry.id} className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {entry.speaker}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {formatTime(entry.timestamp)}
                  </span>
                </div>
                <p className="text-sm leading-relaxed">{entry.text}</p>
              </div>
            ))}
            
            {currentEntry && (
              <div className="space-y-1 opacity-70">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {currentEntry.speaker}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {formatTime(currentEntry.timestamp)}
                  </span>
                  <Badge variant="secondary" className="text-xs">Live</Badge>
                </div>
                <p className="text-sm leading-relaxed italic">{currentEntry.text}</p>
              </div>
            )}
            
            {transcriptEntries.length === 0 && !currentEntry && (
              <div className="text-center text-muted-foreground text-sm py-8">
                {isActive ? 'Start speaking to see transcription...' : 'Click Start to begin real-time transcription'}
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default RealtimeTranscriptionPanel;