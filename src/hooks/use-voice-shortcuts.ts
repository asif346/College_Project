import { useEffect, useRef } from 'react';

interface UseVoiceShortcutsProps {
  onStartVoice: () => void;
  onStopVoice: () => void;
  isListening: boolean;
  disabled?: boolean;
}

export const useVoiceShortcuts = ({
  onStartVoice,
  onStopVoice,
  isListening,
  disabled = false
}: UseVoiceShortcutsProps) => {
  const isListeningRef = useRef(isListening);

  useEffect(() => {
    isListeningRef.current = isListening;
  }, [isListening]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only trigger if not in an input field
      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.contentEditable === 'true') {
        return;
      }

      // Ctrl/Cmd + Shift + V to toggle voice input
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'V') {
        event.preventDefault();
        if (disabled) return;
        
        if (isListeningRef.current) {
          onStopVoice();
        } else {
          onStartVoice();
        }
      }

      // Space bar to stop voice input (when listening)
      if (event.key === ' ' && isListeningRef.current) {
        event.preventDefault();
        onStopVoice();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onStartVoice, onStopVoice, disabled]);
}; 