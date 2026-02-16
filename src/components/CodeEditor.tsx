
import React, { useEffect, useRef, useState } from 'react';
import { Code, Copy, FileText, Palette, Zap, Eye, Monitor, ExternalLink, Download, MessageSquare } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";

interface CodeEditorProps {
  code: {
    html: string;
    css: string;
    js: string;
  };
  isGenerating: boolean;
  activeTab: string;
  onTabChange: (tab: string) => void;
  combinedCode: string;
  isWebsiteLive?: boolean;
  darkMode?: boolean;
  defaultViewMode?: 'code' | 'preview';
  onOpenImprovement?: () => void;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ 
  code, 
  isGenerating, 
  activeTab, 
  onTabChange,
  combinedCode,
  isWebsiteLive = false,
  darkMode = true,
  defaultViewMode = 'code',
  onOpenImprovement
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const [viewMode, setViewMode] = useState<'code' | 'preview'>(defaultViewMode);

  // Update view mode when defaultViewMode prop changes
  useEffect(() => {
    setViewMode(defaultViewMode);
  }, [defaultViewMode]);

  // Auto-scroll effect for code content
  useEffect(() => {
    if (scrollRef.current && viewMode === 'code') {
      const scrollElement = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [code, viewMode]);

  const copyToClipboard = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      toast({
        title: "Copied!",
        description: "Code copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Error", 
        description: "Failed to copy code",
        variant: "destructive",
      });
    }
  };

  // const downloadCode = async () => {
  //   try {
  //     // Import JSZip dynamically
  //     const JSZip = (await import('jszip')).default;
  //     const zip = new JSZip();

  //     // Add files to zip
  //     if (code.html) {
  //       zip.file("index.html", code.html);
  //     }
  //     if (code.css) {
  //       zip.file("styles.css", code.css);
  //     }
  //     if (code.js) {
  //       zip.file("script.js", code.js);
  //     }

  //     // Generate zip file
  //     const content = await zip.generateAsync({ type: "blob" });
      
  //     // Create download link
  //     const url = URL.createObjectURL(content);
  //     const a = document.createElement('a');
  //     a.href = url;
  //     a.download = "website-code.zip";
  //     document.body.appendChild(a);
  //     a.click();
  //     document.body.removeChild(a);
  //     URL.revokeObjectURL(url);

  //     toast({
  //       title: "Downloaded!",
  //       description: "Code files downloaded as ZIP",
  //     });
  //   } catch (error) {
  //     toast({
  //       title: "Error",
  //       description: "Failed to download code files",
  //       variant: "destructive",
  //     });
  //   }
  // };

  const getActiveCode = () => {
    switch (activeTab) {
      case 'html': return code.html;
      case 'css': return code.css;
      case 'js': return code.js;
      default: return '';
    }
  };

  const tabs = [
    { id: 'html', label: 'HTML', icon: FileText, color: 'text-orange-400' },
    { id: 'css', label: 'CSS', icon: Palette, color: 'text-blue-400' },
    { id: 'js', label: 'JavaScript', icon: Zap, color: 'text-yellow-400' }
  ];

  const openInNewTab = () => {
    const blob = new Blob([combinedCode], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  return (
    <div className={`lg:border-l h-full flex flex-col transition-colors duration-300 ${
      darkMode ? 'bg-gray-900 lg:border-gray-700' : 'bg-white lg:border-gray-200'
    }`}>
      <div className={`border-b flex-shrink-0 transition-colors duration-300 ${
        darkMode ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-white'
      }`}>
        {/* Header */}
        <div className="p-3 sm:p-4 md:p-5 flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-4 min-w-0 flex-1">
            <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
              {viewMode === 'code' ? (
                <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center transition-colors duration-300 ${
                  darkMode ? 'bg-white' : 'bg-black'
                }`}>
                  <Code className={`w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 transition-colors duration-300 ${
                    darkMode ? 'text-black' : 'text-white'
                  }`} />
                </div>
              ) : (
                <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center transition-colors duration-300 ${
                  darkMode ? 'bg-gray-700' : 'bg-gray-300'
                }`}>
                  <Eye className={`w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 transition-colors duration-300 ${
                    darkMode ? 'text-white' : 'text-black'
                  }`} />
                </div>
              )}
              <h3 className={`text-base sm:text-lg md:text-xl font-bold transition-colors duration-300 truncate ${
                darkMode ? 'text-white' : 'text-black'
              }`}>
                {viewMode === 'code' ? 'Code Editor' : 'Live Preview'}
              </h3>
              {isGenerating && viewMode === 'code' && (
                <div className={`hidden sm:flex items-center space-x-2 px-2 sm:px-3 py-1 rounded-full transition-colors duration-300 ${
                  darkMode ? 'bg-gray-800' : 'bg-gray-200'
                }`}>
                  <div className={`w-2 h-2 rounded-full animate-pulse transition-colors duration-300 ${
                    darkMode ? 'bg-white' : 'bg-black'
                  }`}></div>
                  <span className={`text-xs font-medium transition-colors duration-300 ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>Generating...</span>
                </div>
              )}
            </div>

            {/* View Toggle */}
            <div className={`flex items-center rounded-xl p-1 transition-colors duration-300 ${
              darkMode ? 'bg-gray-800' : 'bg-gray-200'
            }`}>
              <Button
                variant={viewMode === 'code' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('code')}
                className={`h-6 sm:h-8 px-2 sm:px-3 rounded-lg text-xs font-medium transition-all duration-200 ${
                  viewMode === 'code'
                    ? darkMode
                      ? 'bg-white text-black hover:bg-gray-100'
                      : 'bg-black text-white hover:bg-gray-800'
                    : darkMode
                      ? 'text-gray-400 hover:text-white hover:bg-gray-700'
                      : 'text-gray-600 hover:text-black hover:bg-gray-300'
                }`}
                title="Code View"
              >
                <Code className="w-3 h-3 sm:mr-1" />
                <span className="hidden sm:inline">Code</span>
              </Button>
              <Button
                variant={viewMode === 'preview' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('preview')}
                className={`h-6 sm:h-8 px-2 sm:px-3 rounded-lg text-xs font-medium transition-all duration-200 ${
                  viewMode === 'preview'
                    ? darkMode
                      ? 'bg-white text-black hover:bg-gray-100'
                      : 'bg-black text-white hover:bg-gray-800'
                    : darkMode
                      ? 'text-gray-400 hover:text-white hover:bg-gray-700'
                      : 'text-gray-600 hover:text-black hover:bg-gray-300'
                }`}
                disabled={!combinedCode}
                title="Preview"
              >
                <Monitor className="w-3 h-3 sm:mr-1" />
                <span className="hidden sm:inline">Preview</span>
              </Button>
            </div>
          </div>
          
          <div className="flex items-center space-x-1 sm:space-x-2">
            {viewMode === 'code' && (
              <>
                {/* <Button
                  variant="outline"
                  size="sm"
                  onClick={downloadCode}
                  disabled={!code.html && !code.css && !code.js}
                  className={`h-7 w-7 sm:h-9 sm:w-9 p-0 border transition-colors duration-200 ${
                    darkMode
                      ? 'bg-gray-800 border-gray-600 hover:bg-gray-700 text-gray-300'
                      : 'bg-gray-100 border-gray-300 hover:bg-gray-200 text-gray-700'
                  }`}
                  title="Download Code Files"
                >
                  <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button> */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(getActiveCode())}
                  disabled={!getActiveCode()}
                  className={`h-7 w-7 sm:h-9 sm:w-9 p-0 border transition-colors duration-200 ${
                    darkMode
                      ? 'bg-gray-800 border-gray-600 hover:bg-gray-700 text-gray-300'
                      : 'bg-gray-100 border-gray-300 hover:bg-gray-200 text-gray-700'
                  }`}
                  title={`Copy ${activeTab.toUpperCase()}`}
                >
                  <Copy className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
              </>
            )}
            {/* {viewMode === 'preview' && (
              <Button
                variant="outline"
                size="sm"
                onClick={openInNewTab}
                disabled={!combinedCode}
                className={`h-7 w-7 sm:h-9 sm:w-9 p-0 border transition-colors duration-200 ${
                  darkMode
                    ? 'bg-gray-800 border-gray-600 hover:bg-gray-700 text-gray-300'
                    : 'bg-gray-100 border-gray-300 hover:bg-gray-200 text-gray-700'
                }`}
                title="Open in New Tab"
              >
                <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4" />
              </Button>
            )} */}
            {/* {viewMode === 'preview' && isWebsiteLive && onOpenImprovement && (
              <Button
                variant="default"
                size="sm"
                onClick={onOpenImprovement}
                className="h-7 sm:h-9 px-2 sm:px-3 bg-purple-600 hover:bg-purple-700 text-white border-0"
                title="Open Improvement Section"
              >
                <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
                <span className="text-xs font-medium hidden sm:inline">Improvement</span>
              </Button>
            )} */}
          </div>
        </div>

        {/* Tabs - Only show in code view */}
        {viewMode === 'code' && (
          <div className={`flex border-b overflow-x-auto transition-colors duration-300 ${
            darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-100'
          }`}>
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              const hasCode = code[tab.id as keyof typeof code];
              
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`px-3 sm:px-4 md:px-6 py-2 sm:py-3 text-xs sm:text-sm font-medium border-b-2 transition-all duration-200 flex items-center space-x-1 sm:space-x-2 whitespace-nowrap ${
                    isActive
                      ? darkMode
                        ? 'border-white text-white bg-gray-900'
                        : 'border-black text-black bg-white'
                      : darkMode
                        ? 'border-transparent text-gray-400 hover:text-gray-300 hover:bg-gray-700'
                        : 'border-transparent text-gray-600 hover:text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Icon className={`w-3 h-3 sm:w-4 sm:h-4 ${isActive ? tab.color : ''}`} />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.id.toUpperCase()}</span>
                  {hasCode && (
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-400 rounded-full animate-pulse"></div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Content Area - Full height and width for preview */}
      <div className="flex-1 overflow-hidden">
        {viewMode === 'code' ? (
          <ScrollArea className="h-full" ref={scrollRef}>
            <pre className={`p-3 sm:p-4 md:p-6 text-xs sm:text-sm overflow-x-auto min-h-full transition-colors duration-300 ${
              darkMode ? 'bg-gray-900' : 'bg-white'
            }`}>
              <code className={`font-mono whitespace-pre leading-relaxed transition-colors duration-300 ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                {getActiveCode() || (
                  <div className={`italic text-center py-8 sm:py-12 transition-colors duration-300 ${
                    darkMode ? 'text-gray-500' : 'text-gray-500'
                  }`}>
                    <div className="text-2xl sm:text-4xl mb-3 sm:mb-4">📝</div>
                    <div className="text-sm sm:text-base">Your {activeTab.toUpperCase()} code will appear here...</div>
                  </div>
                )}
              </code>
            </pre>
          </ScrollArea>
        ) : (
          // Full height and width preview
          <div className="h-full w-full flex flex-col">
            {!combinedCode || !isWebsiteLive ? (
              <div className={`w-full h-full flex items-center justify-center transition-colors duration-300 ${
                darkMode ? 'bg-gray-800' : 'bg-gray-100'
              }`}>
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-2 mb-6">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors duration-300 ${
                      darkMode ? 'bg-white' : 'bg-black'
                    }`}>
                      <div className="flex space-x-1">
                        <div className={`w-2 h-2 rounded-full animate-bounce transition-colors duration-300 ${
                          darkMode ? 'bg-black' : 'bg-white'
                        }`}></div>
                        <div className={`w-2 h-2 rounded-full animate-bounce transition-colors duration-300 ${
                          darkMode ? 'bg-black' : 'bg-white'
                        }`} style={{ animationDelay: '0.1s' }}></div>
                        <div className={`w-2 h-2 rounded-full animate-bounce transition-colors duration-300 ${
                          darkMode ? 'bg-black' : 'bg-white'
                        }`} style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                  <h4 className={`text-xl font-bold mb-3 transition-colors duration-300 ${
                    darkMode ? 'text-white' : 'text-black'
                  }`}>
                    Making Website Live...
                  </h4>
                  <p className={`text-sm max-w-sm mx-auto leading-relaxed transition-colors duration-300 ${
                    darkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Please wait while we prepare your website preview
                  </p>
                </div>
              </div>
            ) : (
              <>
                <iframe
                  srcDoc={combinedCode}
                  className="w-full h-full border-0"
                  title="Website Preview"
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals allow-top-navigation"
                />
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CodeEditor;
