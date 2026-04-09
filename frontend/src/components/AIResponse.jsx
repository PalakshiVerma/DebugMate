import React, { useState } from 'react';

const CodeBlock = ({ code }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative mt-4 mb-6">
      <div className="absolute right-3 top-3 z-10">
        <button 
          onClick={handleCopy}
          className="bg-gray-700 hover:bg-gray-600 text-black-200 text-xs px-3 py-1.5 rounded shadow-sm focus:outline-none transition-colors"
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <pre className="bg-code-bg text-black-100 p-6 rounded-xl overflow-x-auto text-sm sm:text-base font-mono leading-relaxed shadow-lg">
        <code>{code}</code>
      </pre>
    </div>
  );
};

export default function AIResponse({ message }) {
  // If standard chat message
  if (!message.isStructured || !message.content) {
    return (
      <div className="my-6 animate-fade-in-up">
        <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
          <div className={`max-w-[85%] rounded-2xl px-6 py-4 shadow-sm ${
            message.role === 'user' 
              ? 'bg-blue-600 text-black' 
              : 'bg-white border border-gray-100 text-black-800'
          }`}>
            <p className="whitespace-pre-wrap text-[15px] leading-relaxed">{message.text}</p>
          </div>
        </div>
      </div>
    );
  }

  const { summary, cause, fixSteps, fixedCode } = message.content;

  // Single container, internal sections, typography focus
  return (
    <div className="my-10 animate-fade-in-up">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-full bg-blue-100 text-black-600 flex items-center justify-center shadow-sm">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
        </div>
        <h2 className="text-2xl font-semibold text-black-900 tracking-tight">Here's what's wrong</h2>
      </div>

      <div className="space-y-12 pl-2">
        {summary && (
          <section>
            <p className="text-xl font-medium text-black-800 leading-relaxed border-l-4 border-blue-500 pl-4">{summary}</p>
          </section>
        )}

        {cause && (
          <section>
            <h3 className="text-sm font-bold text-black-400 uppercase tracking-wider mb-4">Root Cause</h3>
            <p className="text-gray-700 leading-relaxed text-lg">{cause}</p>
          </section>
        )}

        {fixSteps && fixSteps.length > 0 && (
          <section>
            <h3 className="text-sm font-bold text-green-600 uppercase tracking-wider mb-4">Fix Steps</h3>
            <ul className="list-decimal list-outside ml-6 text-gray-800 space-y-4 text-lg">
              {fixSteps.map((step, idx) => (
                <li key={idx} className="pl-3 leading-relaxed">{step}</li>
              ))}
            </ul>
          </section>
        )}

        {fixedCode && (
          <section>
            <h3 className="text-sm font-bold text-black-400 uppercase tracking-wider mb-4">Suggested Code</h3>
            <CodeBlock code={fixedCode} />
          </section>
        )}
      </div>
    </div>
  );
}
