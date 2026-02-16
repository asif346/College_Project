import React, { useState } from 'react';
import { MessageSquare, Send, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";

interface ImprovementSectionProps {
  onSuggestImprovement: (feedback: string) => Promise<void>;
  isGenerating: boolean;
  darkMode?: boolean;
}

const ImprovementSection: React.FC<ImprovementSectionProps> = ({ 
  onSuggestImprovement, 
  isGenerating, 
  darkMode = true 
}) => {
  const [improvementText, setImprovementText] = useState('');
  const [isImproving, setIsImproving] = useState(false);

  const handleSubmit = async () => {
    if (!improvementText.trim() || isImproving) return;
    
    setIsImproving(true);
    try {
      await onSuggestImprovement(improvementText.trim());
      setImprovementText('');
    } catch (error) {
      console.error('Improvement submission error:', error);
    } finally {
      setIsImproving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <Card className={`h-full flex flex-col transition-colors duration-300 improvement-section-mobile ${
      darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'
    }`}>
      <div className={`p-3 sm:p-4 border-b flex items-center space-x-2 flex-shrink-0 transition-colors duration-300 ${
        darkMode ? 'border-gray-700' : 'border-gray-200'
      }`}>
        <MessageSquare className={`w-4 h-4 sm:w-5 sm:h-5 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
        <h3 className={`text-base sm:text-lg font-semibold transition-colors duration-300 ${
          darkMode ? 'text-white' : 'text-black'
        }`}>
          Suggest Improvements
        </h3>
      </div>

      <div className="flex-1 p-3 sm:p-4 flex flex-col">
        <div className={`mb-3 sm:mb-4 p-3 sm:p-4 rounded-lg border transition-colors duration-300 ${
          darkMode ? 'bg-gray-800 border-gray-600' : 'bg-gray-50 border-gray-300'
        }`}>
          <h4 className={`text-xs sm:text-sm font-medium mb-2 transition-colors duration-300 ${
            darkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            💡 How to improve your website?
          </h4>
          <ul className={`text-xs space-y-1 transition-colors duration-300 ${
            darkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            <li>• "Change the color scheme to blue and white"</li>
            <li>• "Make the navigation menu sticky"</li>
            <li>• "Add a contact form section"</li>
            <li>• "Increase font size for better readability"</li>
            <li>• "Add smooth scroll animations"</li>
          </ul>
        </div>

        <div className="flex-1 flex flex-col min-h-0">
          <Textarea
            value={improvementText}
            onChange={(e) => setImprovementText(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={(e) => {
              // Scroll input into view on mobile
              setTimeout(() => {
                e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }, 100);
            }}
            placeholder="Describe what you want to improve about your website..."
            className={`flex-1 resize-none min-h-[80px] sm:min-h-[100px] improvement-textarea transition-colors duration-300 ${
              darkMode 
                ? 'bg-gray-800 border-gray-600 text-white placeholder:text-gray-400' 
                : 'bg-gray-50 border-gray-300 text-black placeholder:text-gray-500'
            }`}
            disabled={isGenerating || isImproving}
          />
          
          <div className="mt-3 sm:mt-4 flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-2 sm:space-y-0">
            <div className={`text-xs transition-colors duration-300 ${
              darkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              Press Enter to submit, Shift+Enter for new line
            </div>
            
            <Button
              onClick={handleSubmit}
              disabled={!improvementText.trim() || isGenerating || isImproving}
              className="px-3 sm:px-4 py-2 w-full sm:w-auto"
            >
              {isImproving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  <span className="text-sm">Improving...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  <span className="text-sm">Suggest Improvement</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ImprovementSection; 