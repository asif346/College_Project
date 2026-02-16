import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Volume2, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface VoiceNameInputProps {
  onNameCaptured: (name: string) => void;
  disabled?: boolean;
}

const VoiceNameInput: React.FC<VoiceNameInputProps> = ({ 
  onNameCaptured, 
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
      
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = 'en-US';
      
      recognitionInstance.onstart = () => {
        setIsListening(true);
        setTranscript('');
        toast({
          title: "Voice Input Active",
          description: "Please say your name clearly.",
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
        
        // Set timeout to capture name when user stops speaking
        if (finalTranscript.trim()) {
          timeoutRef.current = setTimeout(() => {
            if (finalTranscript.trim()) {
              handleNameCaptured(finalTranscript.trim());
            }
          }, 1000); // Wait 1 second after user stops speaking
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
            description: "There was an error with voice recognition. Please try typing your name instead.",
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
    }
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (recognition) {
        recognition.stop();
      }
    };
  }, [toast]);

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
    if (recognition && !isListening && !disabled) {
      try {
        recognition.start();
      } catch (error) {
        console.error('Error starting recognition:', error);
        toast({
          title: "Error",
          description: "Failed to start voice recognition. Please try typing your name instead.",
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
      if (transcript.trim()) {
        handleNameCaptured(transcript.trim());
      }
    }
  };

  const handleNameCaptured = (name: string) => {
    if (name.trim()) {
      setIsProcessing(true);
      onNameCaptured(name.trim());
      setTranscript('');
      setIsProcessing(false);
    }
  };

  const isDisabled = disabled || isProcessing;

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Voice Input Button */}
      <Button
        onClick={isListening ? stopListening : startListening}
        disabled={isDisabled}
        variant={isListening ? "destructive" : "outline"}
        size="lg"
        className={`relative transition-all duration-200 ${
          isListening 
            ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse' 
            : 'bg-white/10 hover:bg-white/20 text-white border-white/20 hover:border-white/40'
        } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''} h-16 w-16 rounded-full`}
      >
        {isListening ? (
          <MicOff className="h-6 w-6" />
        ) : isProcessing ? (
          <Loader2 className="h-6 w-6 animate-spin" />
        ) : (
          <Mic className="h-6 w-6" />
        )}
        
        {/* Audio level indicator */}
        {isListening && (
          <div className="absolute inset-0 rounded-full border-2 border-red-400 animate-ping opacity-75" />
        )}
      </Button>

      {/* Audio Level Visualization */}
      {isListening && (
        <div className="flex items-center space-x-2">
          <div className="flex items-end space-x-1 h-8">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="w-1 bg-red-400 rounded-full transition-all duration-100"
                style={{
                  height: `${Math.max(4, (audioLevel / 100) * 20 * (i + 1))}px`,
                  opacity: 0.3 + (i * 0.15)
                }}
              />
            ))}
          </div>
          <Volume2 className="h-4 w-4 text-red-400 animate-pulse" />
        </div>
      )}

      {/* Transcript Display */}
      {transcript && (
        <div className="text-center">
          <div className="bg-white/10 rounded-lg p-3 text-sm text-white/80 backdrop-blur-sm">
            <span className="font-medium">Listening:</span> {transcript}
            {isListening && (
              <span className="inline-block w-2 h-2 bg-red-400 rounded-full ml-2 animate-pulse" />
            )}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="text-center">
        <p className="text-gray-400 text-sm">
          {isListening ? "Say your name clearly..." : "Click the microphone to speak your name"}
        </p>
      </div>
    </div>
  );
};

export default VoiceNameInput; 