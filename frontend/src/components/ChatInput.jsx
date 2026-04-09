import React, { useState } from 'react';

export default function ChatInput({ onSendMessage, disabled }) {
  const [text, setText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSendMessage(text);
    setText('');
  };

  return (
    <div className="bg-[#F8FAFC] pb-6 pt-2 select-none">
      <div className="max-w-5xl mx-auto px-4">
        <form onSubmit={handleSubmit} className="relative flex items-center shadow-sm rounded-full bg-white border border-gray-200 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={disabled}
            placeholder="Ask anything about this bug..."
            className="w-full bg-transparent px-6 py-4 pr-16 text-base text-gblack-800 focus:outline-none"
          />
          <button 
            type="submit" 
            disabled={disabled || !text.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-blue-600 hover:bg-blue-700 text-black rounded-full disabled:opacity-50 transition-colors shadow-sm"
          >
           <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
          </button>
        </form>
        <div className="text-center mt-3 text-xs text-black-400 font-medium tracking-wide">
          DebugMate AI Assistant. Check messages for accuracy.
        </div>
      </div>
    </div>
  );
}
