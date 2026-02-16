
import React from 'react';
import { Plus, Trash2, MessageSquare, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
}

interface ChatManagementProps {
  isOpen: boolean;
  onClose: () => void;
  chatSessions: ChatSession[];
  currentChat: ChatSession;
  onNewChat: () => void;
  onDeleteChat: (chatId: string) => void;
  onSwitchChat: (chat: ChatSession) => void;
  darkMode?: boolean;
}

const ChatManagement: React.FC<ChatManagementProps> = ({
  isOpen,
  onClose,
  chatSessions,
  currentChat,
  onNewChat,
  onDeleteChat,
  onSwitchChat,
  darkMode = true
}) => {
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[var(--z-popover)] transition-opacity duration-300"
          onClick={onClose}
        />
      )}
      
      {/* Sliding Panel */}
      <div className={`fixed left-0 top-0 h-full w-72 sm:w-80 border-r z-[var(--z-tooltip)] transform transition-all duration-300 ease-in-out bg-background border-border ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-3 sm:p-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-foreground" />
              <h2 className="text-base sm:text-lg font-semibold text-foreground">Chat Sessions</h2>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="rounded-full hover:bg-muted text-muted-foreground hover:text-foreground h-8 w-8 sm:h-10 sm:w-10"
            >
              <X className="w-3 h-3 sm:w-4 sm:h-4" />
            </Button>
          </div>

          {/* New Chat Button */}
          <div className="p-3 sm:p-4 border-b border-border">
            <Button
              onClick={onNewChat}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-10 sm:h-12"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Chat
            </Button>
          </div>

          {/* Chat Sessions List */}
          <ScrollArea className="flex-1 p-3 sm:p-4">
            <div className="space-y-2">
              {/* Current Chat */}
              <Card className="p-2.5 sm:p-3 bg-muted border-border">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xs sm:text-sm font-medium truncate text-foreground">
                      {currentChat.title}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Current • {formatTime(currentChat.createdAt)}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDeleteChat(currentChat.id)}
                    className="text-red-400 hover:text-red-300 ml-2 hover:bg-red-900/20 h-7 w-7 sm:h-8 sm:w-8"
                  >
                    <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                  </Button>
                </div>
              </Card>

              {/* Previous Chat Sessions */}
              {chatSessions.map((chat) => (
                <Card
                  key={chat.id}
                  className="p-2.5 sm:p-3 cursor-pointer bg-card border-border hover:bg-muted transition-colors touch-manipulation"
                  onClick={() => onSwitchChat(chat)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xs sm:text-sm font-medium truncate text-foreground">
                        {chat.title}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {chat.messages.length} messages • {formatTime(chat.createdAt)}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteChat(chat.id);
                      }}
                      className="text-red-400 hover:text-red-300 ml-2 hover:bg-red-900/20 h-7 w-7 sm:h-8 sm:w-8"
                    >
                      <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                    </Button>
                  </div>
                </Card>
              ))}

              {chatSessions.length === 0 && (
                <div className="text-center py-6 sm:py-8">
                  <MessageSquare className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 opacity-50 text-muted-foreground" />
                  <p className="text-xs sm:text-sm text-muted-foreground">No previous chats</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
    </>
  );
};

export default ChatManagement;
