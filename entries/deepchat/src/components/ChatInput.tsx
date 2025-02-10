import React, { useState, useCallback, memo } from 'react';

interface ChatInputProps {
  onSendMessage: (message: string) => Promise<void>;
  isLoading: boolean;
}

export const ChatInput = memo(({ onSendMessage, isLoading }: ChatInputProps) => {
  const [input, setInput] = useState('');

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    
    await onSendMessage(input);
    setInput('');
  }, [input, isLoading, onSendMessage]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  }, []);

  return (
    <div className="border-t p-2 sm:p-4 bg-white">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          placeholder={!isLoading ? "Type your message..." : "Initializing model..."}
          className="flex-1 rounded-lg border p-2 focus:outline-none focus:border-blue-500"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700 transition-colors disabled:bg-gray-400"
        >
          {isLoading ? 'Generating...' : 'Send'}
        </button>
      </form>
    </div>
  );
});

ChatInput.displayName = 'ChatInput';