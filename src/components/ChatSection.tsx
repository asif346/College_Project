
import React, { useState, useRef, useEffect } from 'react';
import { Send, MessageSquare, Sparkles, Code, Palette, Zap } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  isStreaming?: boolean;
  id?: string;
}

interface ChatSectionProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
  isGenerating: boolean;
  currentlyGeneratingCode?: string;
  onTabChange?: (tab: string) => void;
  generatedCode?: { html: string; css: string; js: string };
  userName?: string;
  darkMode?: boolean;
}

const StreamingText: React.FC<{ text: string; speed?: number; onComplete?: () => void }> = ({ 
  text, 
  speed = 15, 
  onComplete 
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const textRef = useRef(text);

  // Reset when text changes (but only if it's actually different)
  useEffect(() => {
    if (text !== textRef.current) {
      setDisplayedText('');
      setCurrentIndex(0);
      setIsComplete(false);
      textRef.current = text;
    }
  }, [text]);

  // Handle streaming logic
  useEffect(() => {
    if (text && currentIndex < text.length && !isComplete) {
      const timer = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);
      return () => clearTimeout(timer);
    } else if (text && currentIndex >= text.length && !isComplete) {
      setIsComplete(true);
      onComplete?.();
    }
  }, [currentIndex, text, speed, isComplete, onComplete]);

  return <span>{displayedText}</span>;
};

const ChatSection: React.FC<ChatSectionProps> = React.memo(({ 
  messages, 
  onSendMessage, 
  isGenerating,
  currentlyGeneratingCode,
  onTabChange,
  generatedCode,
  userName = '',
  darkMode = true
}) => {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollPositionRef = useRef<number>(0);

  // Preserve scroll position when component re-renders
  useEffect(() => {
    if (scrollRef.current) {
      const scrollElement = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        // Store current scroll position
        scrollPositionRef.current = scrollElement.scrollTop;
      }
    }
  });

  // Restore scroll position after render
  useEffect(() => {
    if (scrollRef.current) {
      const scrollElement = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement && scrollPositionRef.current > 0) {
        scrollElement.scrollTop = scrollPositionRef.current;
      }
    }
  });

  // Auto-scroll to bottom when messages change or when generating
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isGenerating, currentlyGeneratingCode]);

  // Also auto-scroll when the scroll container is available
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isGenerating, currentlyGeneratingCode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isGenerating) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const formatMessageContent = (content: string, isLatest: boolean = false, isStreaming: boolean = false, messageIndex: number = 0, messageTimestamp: number = 0) => {
    // Check if this is a response with code sections
    const sections = content.split(/(?=HTML:|CSS:|JS:|EXPLANATION:)/);
    
    if (sections.length > 1) {
      return sections.map((section, index) => {
        if (section.startsWith('EXPLANATION:')) {
          const explanation = section.replace('EXPLANATION:', '').trim();
          return (
            <div key={index} className="mb-6">
              <div className="bg-background p-4 rounded-xl border border-border shadow-sm">
                <div className="flex items-center space-x-2 mb-3">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-primary-foreground" />
                  </div>
                  <span className="text-sm font-semibold text-foreground">
                    AI Plan & Explanation
                  </span>
                </div>
                <div className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                  {isLatest && isStreaming ? <StreamingText key={`explanation-${messageIndex}-${messageTimestamp}`} text={explanation} speed={15} /> : explanation}
                </div>
              </div>
            </div>
          );
        }
        return null;
      }).filter(Boolean);
    }
    
    return (
      <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
        {isLatest && isStreaming ? <StreamingText key={`content-${messageIndex}-${messageTimestamp}`} text={content} speed={15} /> : content}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full w-full bg-background transition-colors duration-300">
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full px-3 sm:px-4 py-4 sm:py-6 md:py-8 mobile-chat-container" ref={scrollRef}>
        {messages.length === 0 ? (
          <div className="space-y-6 sm:space-y-8 pt-2 sm:pt-4 md:pt-8 max-w-2xl mx-auto">
            <div className="text-center">
              <div className={`w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg transition-colors duration-300 ${isGenerating ? 'animate-spin' : ''}`}>
                <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-primary-foreground transition-colors duration-300" />
              </div>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 text-foreground transition-colors duration-300">
                {userName ? `Welcome back, ${userName}!` : 'Welcome to Re:Zero AI'}
              </h3>
              <p className="text-sm sm:text-base md:text-lg mb-4 sm:mb-6 max-w-lg mx-auto px-2 sm:px-4 leading-relaxed text-muted-foreground transition-colors duration-300">
                {userName ? `Let's create something amazing together, ${userName}.` : 'Transform your ideas into stunning websites with AI-powered code generation'}
              </p>
              
              <div className="bg-muted p-3 sm:p-4 rounded-lg mb-4 sm:mb-6 max-w-md mx-auto">
                <p className="text-xs sm:text-sm text-muted-foreground">
                  <strong>Note:</strong> It can take up to 20-30 seconds to generate your website
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-6 md:space-y-8 max-w-4xl mx-auto">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[95%] sm:max-w-[90%] md:max-w-[85%] p-3 sm:p-4 md:p-5 rounded-2xl shadow-lg transition-colors duration-300 ${
                    message.role === 'user'
                      ? 'bg-background text-foreground border border-border' 
                      : 'bg-background text-foreground border border-border'
                  }`}
                >
                  {message.role === 'assistant' ? (
                    <div className="space-y-3 sm:space-y-4">
                      {formatMessageContent(
                        message.content, 
                        index === messages.length - 1, 
                        message.isStreaming,
                        index,
                        message.timestamp
                      )}
                      
                      {/* Code Generation Buttons */}
                      {!message.isStreaming && generatedCode && (generatedCode.html || generatedCode.css || generatedCode.js) && (
                        <div className="flex flex-wrap gap-2 sm:gap-3 mt-3 sm:mt-4">
                          {generatedCode.html && (
                            <button
                              onClick={() => onTabChange?.('html')}
                              className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-all duration-200 shadow-sm hover:shadow-md text-xs sm:text-sm"
                            >
                              <Code className="w-3 h-3 sm:w-4 sm:h-4" />
                              <span className="font-medium">HTML Generated</span>
                            </button>
                          )}
                          {generatedCode.css && (
                            <button
                              onClick={() => onTabChange?.('css')}
                              className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200 shadow-sm hover:shadow-md text-xs sm:text-sm"
                            >
                              <Palette className="w-3 h-3 sm:w-4 sm:h-4" />
                              <span className="font-medium">CSS Generated</span>
                            </button>
                          )}
                          {generatedCode.js && (
                            <button
                              onClick={() => onTabChange?.('js')}
                              className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-all duration-200 shadow-sm hover:shadow-md text-xs sm:text-sm"
                            >
                              <Zap className="w-3 h-3 sm:w-4 sm:h-4" />
                              <span className="font-medium">JavaScript Generated</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-sm md:text-base leading-relaxed text-foreground">{message.content}</div>
                  )}
                </div>
              </div>
            ))}
            {isGenerating && (
              <div className="flex justify-start">
                <div className="p-4 md:p-5 rounded-2xl border shadow-lg bg-background border-border transition-colors duration-300">
                  <div className="flex items-center space-x-3">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 rounded-full animate-bounce bg-foreground transition-colors duration-300"></div>
                      <div className="w-2 h-2 rounded-full animate-bounce bg-foreground transition-colors duration-300" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 rounded-full animate-bounce bg-foreground transition-colors duration-300" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-sm md:text-base font-medium text-foreground transition-colors duration-300">AI is creating your website...</span>
                  </div>
                </div>
              </div>
            )}
            {currentlyGeneratingCode && (
              <div className="flex justify-start">
                <div className="bg-background p-4 md:p-5 rounded-2xl border border-border shadow-lg">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      {currentlyGeneratingCode === 'html' && (
                        <>
                          <div className="w-6 h-6 bg-orange-100 rounded-lg flex items-center justify-center">
                            <Code className="w-4 h-4 text-orange-600" />
                          </div>
                          <span className="text-sm md:text-base text-orange-600 font-semibold">Generating HTML...</span>
                        </>
                      )}
                      {currentlyGeneratingCode === 'css' && (
                        <>
                          <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Palette className="w-4 h-4 text-blue-600" />
                          </div>
                          <span className="text-sm md:text-base text-blue-600 font-semibold">Generating CSS...</span>
                        </>
                      )}
                      {currentlyGeneratingCode === 'js' && (
                        <>
                          <div className="w-6 h-6 bg-yellow-100 rounded-lg flex items-center justify-center">
                            <Zap className="w-4 h-4 text-yellow-600" />
                          </div>
                          <span className="text-sm md:text-base text-yellow-600 font-semibold">Generating JavaScript...</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
        </ScrollArea>
      </div>

      <div className="flex-shrink-0 p-3 sm:p-4 border-t bg-background border-border transition-colors duration-300 chat-input-container mobile-input-area">
        <form onSubmit={handleSubmit} className="flex items-end space-x-2 sm:space-x-4 max-w-4xl mx-auto">
          <div className="flex-1 relative">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={(e) => {
                // Scroll input into view on mobile
                setTimeout(() => {
                  e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 100);
              }}
              placeholder={`What would you like to create today${userName ? `, ${userName}` : ''}?`}
              className="min-h-[50px] sm:min-h-[60px] max-h-[100px] sm:max-h-[120px] resize-none rounded-2xl border-2 focus:ring-0 text-sm px-3 sm:px-4 py-2 sm:py-3 transition-all duration-200 border-input focus:border-ring bg-background text-foreground placeholder:text-muted-foreground"
              disabled={isGenerating}
            />
          </div>
          
          {/* Voice Input Button */}
          <div className="flex items-center h-[50px] sm:h-[60px]">
            
          </div>
          
          {/* Send Button */}
          <div className="flex items-center h-[50px] sm:h-[60px]">
            <Button
              type="submit"
              disabled={!input.trim() || isGenerating}
              className="rounded-2xl px-4 sm:px-6 py-2 sm:py-3 h-[50px] w-[50px] sm:h-[60px] sm:w-[60px] min-w-[50px] sm:min-w-[60px] transition-all duration-200 disabled:opacity-50 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Send className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
});

export default ChatSection;
