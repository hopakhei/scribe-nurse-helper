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
    toast({
      title: "Transcription Error",
      description: error,
      variant: "destructive",
    });
    setStatus('Error occurred');
  };

  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus);
  };

  const startTranscription = async () => {
    try {
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
      toast({
        title: "Error",
        description: "Failed to start real-time transcription",
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