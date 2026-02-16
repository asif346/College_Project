
import React, { useState, useEffect } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import VoiceNameInput from "./VoiceNameInput";

interface LandingPageProps {
  onComplete: (name: string) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onComplete }) => {
  const [name, setName] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    setIsVisible(true);
    const timer = setTimeout(() => setCurrentStep(1), 500);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onComplete(name.trim());
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 sm:w-96 sm:h-96 bg-white/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 sm:w-80 sm:h-80 bg-gray-400/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 w-full max-w-2xl mx-auto px-4 sm:px-6 md:px-8">
        {/* Main content container */}
        <div className={`text-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          {/* Logo/Brand section - moved down slightly */}
          <div className="mb-8 sm:mb-12 mt-4 sm:mt-8">
            <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-white/20 to-white/5 rounded-2xl backdrop-blur-sm border border-white/10 mb-4 sm:mb-6 group hover:scale-105 transition-all duration-300">
              <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-white group-hover:text-gray-200 transition-colors duration-300" />
            </div>
            
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold text-white mb-3 sm:mb-4 tracking-tight">
              Re:Zero
            </h1>
            
            <div className="w-16 sm:w-24 h-0.5 bg-gradient-to-r from-transparent via-white/60 to-transparent mx-auto mb-4 sm:mb-6" />
            
            <p className="text-base sm:text-xl text-gray-300 font-light leading-relaxed max-w-lg mx-auto px-4">
              Your intelligent AI companion for creating exceptional web experiences
            </p>
          </div>

          {/* Introduction text */}
          <div className={`mb-8 sm:mb-12 transition-all duration-1000 delay-300 ${currentStep >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <p className="text-base sm:text-lg text-gray-400 mb-6 sm:mb-8 leading-relaxed px-4">
              Before we begin crafting something extraordinary together,
            </p>
            
            <h2 className="text-xl sm:text-2xl text-white font-medium mb-2 px-4">
              Can you tell me your name?
            </h2>
            
            <p className="text-gray-500 text-sm px-4">
              I'd like to personalize our conversation
            </p>
          </div>

          {/* Input form */}
          <div className={`transition-all duration-1000 delay-500 ${currentStep >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8 px-4">
              
              <div className="relative max-w-md mx-auto">
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full h-12 sm:h-14 bg-white/5 border border-white/20 rounded-xl px-4 sm:px-6 text-white placeholder:text-gray-500 text-base sm:text-lg focus:border-white/40 focus:bg-white/10 transition-all duration-300 backdrop-blur-sm"
                  autoFocus
                />
              </div>
              
              <Button
                type="submit"
                disabled={!name.trim()}
                className="group bg-white text-black hover:bg-gray-100 disabled:bg-gray-800 disabled:text-gray-600 h-12 sm:h-14 px-6 sm:px-8 rounded-xl font-medium text-base sm:text-lg transition-all duration-300 disabled:cursor-not-allowed w-full sm:w-auto"
              >
                <span className="mr-2">Continue</span>
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-0.5 transition-transform duration-200" />
              </Button>
            </form>
          </div>

          {/* Footer text */}
          <div className={`mt-12 sm:mt-16 transition-all duration-1000 delay-700 ${currentStep >= 1 ? 'opacity-100' : 'opacity-0'}`}>
            <p className="text-gray-600 text-sm px-4">
              Powered by advanced language models
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
