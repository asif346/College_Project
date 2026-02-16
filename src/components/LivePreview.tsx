
import React from 'react';
import { Eye, ExternalLink, Code, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface LivePreviewProps {
  code: string;
  isGenerating?: boolean;
}

const LivePreview: React.FC<LivePreviewProps> = ({ code, isGenerating = false }) => {
  const openInNewTab = () => {
    const blob = new Blob([code], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  return (
    <Card className="bg-card border-border h-full flex flex-col">
      <div className="p-4 border-b border-border flex items-center justify-between flex-shrink-0">
        <div className="flex items-center space-x-2">
          <Eye className="w-5 h-5 text-purple-500" />
          <h3 className="text-lg font-semibold text-card-foreground">Live Preview</h3>
        </div>
        
        {code && !isGenerating && (
          <Button
            variant="outline"
            size="sm"
            onClick={openInNewTab}
            className="text-muted-foreground"
          >
            <ExternalLink className="w-4 h-4 mr-1" />
            Open in New Tab
          </Button>
        )}
      </div>

      <div className="p-4 flex-1 flex flex-col">
        <div className="border border-border rounded-lg overflow-hidden flex-1 flex">
          {isGenerating || !code ? (
            <div className="w-full h-full flex items-center justify-center bg-muted">
              <div className="text-center">
                <div className="flex items-center justify-center space-x-2 mb-4">
                  {isGenerating ? (
                    <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                  ) : (
                    <Code className="w-8 h-8 text-muted-foreground" />
                  )}
                </div>
                <h4 className="text-lg font-semibold text-foreground mb-2">
                  {isGenerating ? 'Creating Your Website...' : 'Preview Ready'}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {isGenerating 
                    ? 'AI is generating your website code. Preview will appear shortly!'
                    : 'Your website preview will appear here when code is generated.'
                  }
                </p>
                {isGenerating && (
                  <div className="mt-4 flex justify-center">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <iframe
              srcDoc={code}
              className="w-full h-full border-0"
              title="Website Preview"
              sandbox="allow-scripts allow-same-origin"
            />
          )}
        </div>
      </div>
    </Card>
  );
};

export default LivePreview;
