import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Mic, MicOff, Square, FileText, Loader2, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from '@/components/ui/use-toast';

interface ImprovedAudioRecordingProps {
  onRecordingStart: () => void;
  onRecordingStop: (audioBlob?: Blob) => void;
  transcriptText?: string;
  isProcessing?: boolean;
}

export function ImprovedAudioRecording({ 
  onRecordingStart, 
  onRecordingStop,
  transcriptText,
  isProcessing = false
}: ImprovedAudioRecordingProps) {
  const { toast } = useToast();
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const requestMicrophonePermission = async (): Promise<MediaStream | null> => {
    try {
      // Clear any previous permission errors
      setPermissionError(null);
      
      console.log("Requesting microphone access...");
      
      // Check if running in Capacitor (Android/iOS native app)
      const isCapacitor = (window as any).Capacitor !== undefined;
      console.log("Running in Capacitor:", isCapacitor);
      
      // Check if we're on iOS/Safari
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
                   (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
      
      // Different constraints for different platforms
      const constraints: MediaStreamConstraints = {
        audio: isIOS ? {
          // Simplified constraints for iOS
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } : {
          // More advanced constraints for other platforms
          sampleRate: 44100,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      console.log("Microphone access granted successfully");
      
      toast({
        title: "Microphone Access Granted",
        description: "Recording is ready to start",
      });
      
      return stream;
    } catch (error: any) {
      console.error('Microphone permission error:', error);
      
      const isCapacitor = (window as any).Capacitor !== undefined;
      let errorMessage = 'Unable to access microphone. ';
      
      switch (error.name) {
        case 'NotAllowedError':
        case 'PermissionDeniedError':
          if (isCapacitor) {
            errorMessage += 'Please enable microphone permission in your device\'s app settings (Settings → Apps → HA Nursing Scribe → Permissions → Microphone).';
          } else {
            errorMessage += 'Please allow microphone access in your browser settings and try again.';
          }
          break;
        case 'NotFoundError':
          errorMessage += 'No microphone found. Please check your device.';
          break;
        case 'NotReadableError':
          errorMessage += 'Microphone is being used by another application.';
          break;
        case 'OverconstrainedError':
          errorMessage += 'Microphone constraints cannot be satisfied.';
          break;
        case 'NotSupportedError':
          errorMessage += 'HTTPS connection required for microphone access.';
          break;
        default:
          errorMessage += `Error: ${error.message}`;
      }
      
      setPermissionError(errorMessage);
      
      toast({
        title: "Microphone Access Error",
        description: errorMessage,
        variant: "destructive",
      });
      
      return null;
    }
  };

  const handleToggleRecording = async () => {
    if (!isRecording) {
      // Start recording
      const stream = await requestMicrophonePermission();
      if (!stream) return;

      try {
        streamRef.current = stream;
        
        // Check MediaRecorder support and determine best MIME type
        let mimeType = 'audio/webm;codecs=opus';
        
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          // Fallback options for different browsers/devices
          const fallbackTypes = [
            'audio/webm',
            'audio/mp4',
            'audio/ogg;codecs=opus',
            'audio/wav'
          ];
          
          mimeType = fallbackTypes.find(type => MediaRecorder.isTypeSupported(type)) || '';
        }
        
        const recorder = new MediaRecorder(stream, {
          mimeType: mimeType || undefined
        });
        
        const chunks: Blob[] = [];
        
        recorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            chunks.push(event.data);
          }
        };
        
        recorder.onstop = () => {
          const audioBlob = new Blob(chunks, { type: mimeType || 'audio/webm' });
          setAudioChunks([]);
          onRecordingStop(audioBlob);
          
          // Clean up stream
          if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
          }
        };
        
        recorder.onerror = (event: any) => {
          console.error('MediaRecorder error:', event.error);
          toast({
            title: "Recording Error",
            description: `Recording failed: ${event.error?.message || 'Unknown error'}`,
            variant: "destructive",
          });
          stopRecording();
        };
        
        setMediaRecorder(recorder);
        setAudioChunks(chunks);
        
        // Start recording with regular data intervals
        recorder.start(1000);
        setIsRecording(true);
        onRecordingStart();
        
        toast({
          title: "Recording Started",
          description: "Speak clearly into your device's microphone",
        });
        
      } catch (error: any) {
        console.error('Error starting recording:', error);
        
        // Clean up stream on error
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
        
        toast({
          title: "Recording Error",
          description: `Failed to start recording: ${error.message}`,
          variant: "destructive",
        });
      }
    } else {
      stopRecording();
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
    }
    setIsRecording(false);
    setMediaRecorder(null);
  };

  return (
    <div className="space-y-6">
      <Card className="p-8 border-2 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className={cn(
              "p-4 rounded-full transition-all duration-300 shadow-md",
              isRecording ? "bg-red-100 dark:bg-red-900/20 animate-pulse" : "bg-muted"
            )}>
              {isRecording ? (
                <Mic className="h-8 w-8 text-red-500 animate-pulse" />
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
              "px-12 py-6 font-bold text-lg transition-all duration-200 min-h-[60px] min-w-[200px]",
              "touch-manipulation select-none", // Better for mobile/tablet
              "active:scale-95 hover:shadow-lg",
              isRecording && "bg-red-500 hover:bg-red-600 shadow-red-200"
            )}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-6 w-6 mr-3 animate-spin" />
                Processing...
              </>
            ) : isRecording ? (
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
        
        {/* Permission Error Alert */}
        {permissionError && (
          <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border-2 border-yellow-200 dark:border-yellow-800">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-1">
                  Microphone Access Required
                </h4>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  {permissionError}
                </p>
                <div className="mt-3 text-xs text-yellow-600 dark:text-yellow-400 space-y-1">
                  <p><strong>On Android tablet app:</strong> Settings → Apps → HA Nursing Scribe → Permissions → Microphone → Allow</p>
                  <p><strong>On iPad/iPhone:</strong> Settings → Safari → Camera & Microphone → Allow</p>
                  <p><strong>On web browser:</strong> Click the microphone icon in your browser's address bar and allow access</p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {isRecording && (
          <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border-2 border-red-200 dark:border-red-800 animate-pulse">
            <p className="text-base text-red-700 dark:text-red-300 font-semibold flex items-center">
              <span className="w-3 h-3 bg-red-500 rounded-full mr-3 animate-ping"></span>
              Recording in progress - Patient conversations are being processed for documentation
            </p>
          </div>
        )}
        
        {isProcessing && (
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border-2 border-blue-200 dark:border-blue-800">
            <p className="text-base text-blue-700 dark:text-blue-300 font-semibold flex items-center">
              <Loader2 className="h-4 w-4 mr-3 animate-spin" />
              Processing audio with AI - Transcribing and extracting form data...
            </p>
          </div>
        )}
      </Card>

      {/* Transcript Display */}
      {transcriptText && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Latest Conversation Transcript
              </CardTitle>
              <Badge variant="secondary" className="text-xs">
                Just Processed
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-32 w-full rounded-md border p-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground mb-2">
                  Recorded conversation:
                </p>
                <p className="text-sm leading-relaxed">
                  {transcriptText}
                </p>
              </div>
            </ScrollArea>
            <p className="text-xs text-muted-foreground mt-2">
              This transcript was used to automatically fill form fields. You can edit any field manually if needed.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}