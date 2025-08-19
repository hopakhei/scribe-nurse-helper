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

  const handleToggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      onRecordingStop();
    } else {
      setIsRecording(true);
      onRecordingStart();
    }
  };

  return (
    <Card className="p-6 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className={cn(
            "p-3 rounded-full transition-colors",
            isRecording ? "bg-recording-active/10" : "bg-muted"
          )}>
            {isRecording ? (
              <Mic className="h-6 w-6 text-recording-active animate-pulse" />
            ) : (
              <MicOff className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
          <div>
            <h3 className="font-semibold text-lg">
              {isRecording ? "Recording Active" : "Ready to Record"}
            </h3>
            <p className="text-sm text-muted-foreground">
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
            "px-8 py-3 font-semibold transition-all",
            isRecording && "bg-recording-active hover:bg-recording-active/90"
          )}
        >
          {isRecording ? (
            <>
              <Square className="h-4 w-4 mr-2" />
              Stop Scribing
            </>
          ) : (
            <>
              <Mic className="h-4 w-4 mr-2" />
              Start Scribing
            </>
          )}
        </Button>
      </div>
      
      {isRecording && (
        <div className="mt-4 p-3 bg-recording-active/5 rounded-lg border border-recording-active/20">
          <p className="text-sm text-recording-active font-medium">
            🔴 Recording in progress - Patient conversations are being processed for documentation
          </p>
        </div>
      )}
    </Card>
  );
}