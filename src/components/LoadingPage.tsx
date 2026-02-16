
import React, { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { Progress } from "@/components/ui/progress";

interface LoadingPageProps {
  userName: string;
}

const LoadingPage: React.FC<LoadingPageProps> = ({ userName }) => {
  const [progress, setProgress] = useState(0);
  const [currentMessage, setCurrentMessage] = useState(0);

  const messages = [
    `Welcome back, ${userName}! Setting up your workspace...`,
    'Initializing AI models...',
    'Preparing code generation tools...',
    'Almost ready!'
  ];

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 2;
      });
    }, 60);

    const messageInterval = setInterval(() => {
      setCurrentMessage(prev => (prev + 1) % messages.length);
    }, 750);

    return () => {
      clearInterval(progressInterval);
      clearInterval(messageInterval);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 sm:w-96 sm:h-96 bg-white/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 sm:w-80 sm:h-80 bg-gray-400/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 w-full max-w-2xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="text-center">
          {/* Logo section */}
          <div className="mb-8 sm:mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-white/20 to-white/5 rounded-2xl backdrop-blur-sm border border-white/10 mb-4 sm:mb-6 group animate-pulse">
              <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-white animate-spin" style={{ animationDuration: '3s' }} />
            </div>
            
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold text-white mb-3 sm:mb-4 tracking-tight animate-fade-in">
              Re:Zero
            </h1>
            
            <div className="w-16 sm:w-24 h-0.5 bg-gradient-to-r from-transparent via-white/60 to-transparent mx-auto mb-4 sm:mb-6" />
          </div>

          {/* Loading content */}
          <div className="space-y-6 sm:space-y-8">
            <div className="space-y-3 sm:space-y-4">
              <h2 className="text-lg sm:text-2xl text-white font-medium transition-all duration-500 px-4">
                {messages[currentMessage]}
              </h2>
              
              <div className="max-w-xs sm:max-w-md mx-auto space-y-2 sm:space-y-3 px-4">
                <Progress 
                  value={progress} 
                  className="h-2 bg-gray-800/50 backdrop-blur-sm"
                />
                <p className="text-gray-400 text-sm">
                  {progress}% Complete
                </p>
              </div>
            </div>

            {/* Floating elements animation */}
            <div className="flex justify-center space-x-3 sm:space-x-4 mt-6 sm:mt-8">
              <div className="w-2 h-2 sm:w-3 sm:h-3 bg-white/20 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
              <div className="w-2 h-2 sm:w-3 sm:h-3 bg-white/20 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 sm:w-3 sm:h-3 bg-white/20 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-12 sm:mt-16 opacity-60">
            <p className="text-gray-500 text-sm px-4">
              Powered by advanced language models
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingPage;
