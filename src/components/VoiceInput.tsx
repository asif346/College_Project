import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Volume2, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useVoiceShortcuts } from "@/hooks/use-voice-shortcuts";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface VoiceInputProps {
  onSendMessage: (message: string) => void;
  isGenerating: boolean;
  disabled?: boolean;
}

const VoiceInput: React.FC<VoiceInputProps> = ({ 
  onSendMessage, 
  isGenerating, 
  disabled = false 
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const [audioLevel, setAudioLevel] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = 'en-US';
      
      recognitionInstance.onstart = () => {
        setIsListening(true);
        setTranscript('');
        toast({
          title: "Voice Input Active",
          description: "Start speaking now. I'll automatically send your message when you stop.",
        });
      };
      
      recognitionInstance.onresult = (event: any) => {
        let finalTranscript = '';
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }
        
        const fullTranscript = finalTranscript + interimTranscript;
        setTranscript(fullTranscript);
        
        // Reset timeout when user is speaking
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        
        // Set timeout to send message when user stops speaking
        if (finalTranscript.trim()) {
          timeoutRef.current = setTimeout(() => {
            if (finalTranscript.trim() && !isGenerating) {
              handleSendVoiceMessage(finalTranscript.trim());
            }
          }, 1500); // Wait 1.5 seconds after user stops speaking
        }
      };
      
      recognitionInstance.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        setTranscript('');
        
        if (event.error === 'not-allowed') {
          toast({
            title: "Microphone Access Denied",
            description: "Please allow microphone access to use voice input.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Voice Input Error",
            description: "There was an error with voice recognition. Please try again.",
            variant: "destructive",
          });
        }
      };
      
      recognitionInstance.onend = () => {
        setIsListening(false);
        setTranscript('');
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
      
      setRecognition(recognitionInstance);
    } else {
      toast({
        title: "Voice Input Not Supported",
        description: "Your browser doesn't support speech recognition. Please use text input instead.",
        variant: "destructive",
      });
    }
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (recognition) {
        recognition.stop();
      }
    };
  }, [toast, isGenerating]);

  // Simulate audio level for visual feedback
  useEffect(() => {
    let animationFrame: number;
    
    if (isListening) {
      const animate = () => {
        setAudioLevel(Math.random() * 100);
        animationFrame = requestAnimationFrame(animate);
      };
      animate();
    } else {
      setAudioLevel(0);
    }
    
    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [isListening]);

  const startListening = () => {
    if (recognition && !isListening && !isGenerating && !disabled) {
      try {
        recognition.start();
      } catch (error) {
        console.error('Error starting recognition:', error);
        toast({
          title: "Error",
          description: "Failed to start voice recognition. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const stopListening = () => {
    if (recognition && isListening) {
      recognition.stop();
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (transcript.trim() && !isGenerating) {
        handleSendVoiceMessage(transcript.trim());
      }
    }
  };

  const handleSendVoiceMessage = (message: string) => {
    if (message.trim() && !isGenerating) {
      setIsProcessing(true);
      onSendMessage(message);
      setTranscript('');
      setIsProcessing(false);
    }
  };

  const isDisabled = disabled || isGenerating || isProcessing;

  // Add keyboard shortcuts
  useVoiceShortcuts({
    onStartVoice: startListening,
    onStopVoice: stopListening,
    isListening,
    disabled: isDisabled
  });

  return (
    <>
      {/* Voice Input Button */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={isListening ? stopListening : startListening}
              disabled={isDisabled}
              variant={isListening ? "destructive" : "outline"}
              size="icon"
              className={`relative transition-all duration-200 h-[60px] w-[60px] rounded-2xl ${
                isListening 
                  ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse' 
                  : 'hover:bg-primary hover:text-primary-foreground'
              } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isListening ? (
                <MicOff className="h-5 w-5" />
              ) : isProcessing ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Mic className="h-5 w-5" />
              )}
              
              {/* Audio level indicator */}
              {isListening && (
                <div className="absolute inset-0 rounded-2xl border-2 border-red-400 animate-ping opacity-75" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>
              {isListening 
                ? "Click to stop recording (or press Space)" 
                : "Click to start voice input (or press Ctrl+Shift+V)"
              }
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Transcript Display - Show as toast notification */}
      {transcript && isListening && (
        <div className="fixed top-4 right-4 z-50 bg-muted/95 backdrop-blur-sm rounded-lg p-3 text-sm text-muted-foreground border border-border shadow-lg max-w-md">
          <div className="flex items-center space-x-2">
            <div className="flex items-end space-x-1 h-6">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="w-1 bg-red-500 rounded-full transition-all duration-100"
                  style={{
                    height: `${Math.max(3, (audioLevel / 100) * 15 * (i + 1))}px`,
                    opacity: 0.3 + (i * 0.2)
                  }}
                />
              ))}
            </div>
            <span className="font-medium">Listening:</span> {transcript}
            <span className="inline-block w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          </div>
        </div>
      )}
    </>
  );
};

export default VoiceInput; 