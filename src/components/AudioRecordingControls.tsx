
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Mic, MicOff, Square } from "lucide-react";
import { cn } from "@/lib/utils";

interface AudioRecordingControlsProps {
  onRecordingStart: () => void;
  onRecordingStop: () => void;
}

export function AudioRecordingControls({ 
  onRecordingStart, 
  onRecordingStop 
}: AudioRecordingControlsProps) {
  const [isRecording, setIsRecording] = useState(false);

  const handleToggleRecording = async () => {
    try {
      if (isRecording) {
        setIsRecording(false);
        onRecordingStop();
      } else {
        // Request microphone permissions for Android
        if ('navigator' in window && 'mediaDevices' in navigator) {
          await navigator.mediaDevices.getUserMedia({ audio: true });
        }
        setIsRecording(true);
        onRecordingStart();
      }
    } catch (error) {
      console.error('Error accessing microphone:', error);
      // Handle permission denied or hardware issues
      alert('Microphone access is required for audio recording. Please grant permission and try again.');
    }
  };

  return (
    <Card className="p-8 mb-8 border-2 shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <div className={cn(
            "p-4 rounded-full transition-all duration-300 shadow-md",
            isRecording ? "bg-recording-active/10 animate-pulse" : "bg-muted"
          )}>
            {isRecording ? (
              <Mic className="h-8 w-8 text-recording-active animate-pulse" />
            ) : (
              <MicOff className="h-6 w-6 text-muted-foreground" />
            )}
          </div>
          <div>
            <h3 className="font-bold text-xl mb-1">
              {isRecording ? "Recording Active" : "Ready to Record"}
            </h3>
            <p className="text-base text-muted-foreground">
              {isRecording 
                ? "Listening to conversation... Tap Stop when finished"
                : "Start recording to begin AI-assisted documentation"
              }
            </p>
          </div>
        </div>
        
        <Button
          onClick={handleToggleRecording}
          size="lg"
          variant={isRecording ? "destructive" : "default"}
          className={cn(
            "px-12 py-6 font-bold text-lg transition-all duration-200 min-h-[60px] min-w-[200px] touch-manipulation",
            "active:scale-95 hover:shadow-lg",
            isRecording && "bg-recording-active hover:bg-recording-active/90 shadow-red-200"
          )}
        >
          {isRecording ? (
            <>
              <Square className="h-6 w-6 mr-3" />
              Stop Scribing
            </>
          ) : (
            <>
              <Mic className="h-6 w-6 mr-3" />
              Start Scribing
            </>
          )}
        </Button>
      </div>
      
      {isRecording && (
        <div className="mt-6 p-4 bg-recording-active/5 rounded-xl border-2 border-recording-active/20 animate-pulse">
          <p className="text-base text-recording-active font-semibold flex items-center">
            <span className="w-3 h-3 bg-recording-active rounded-full mr-3 animate-ping"></span>
            Recording in progress - Patient conversations are being processed for documentation
          </p>
        </div>
      )}
    </Card>
  );
}
