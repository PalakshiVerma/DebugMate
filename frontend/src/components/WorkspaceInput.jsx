import React, { useState } from 'react';

export default function WorkspaceInput({ onSubmit, isLoading }) {
  const [language, setLanguage] = useState('JavaScript');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [expected, setExpected] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!code || !error) return;
    onSubmit({ language, code, error, expected });
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 pb-10">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-black-800 tracking-tight">Start Debugging</h1>
        <p className="text-black-500 mt-2">Paste your failing snippet and the error log below.</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Unified Input Container */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all">
          
          <div className="flex border-b border-gray-100 bg-gray-50/50 px-3 py-2">
            <select 
              value={language} 
              onChange={(e) => setLanguage(e.target.value)}
              className="text-sm bg-transparent text-gray-600 font-medium focus:outline-none cursor-pointer"
            >
              <option value="JavaScript">JavaScript / Node.js</option>
              <option value="Python">Python</option>
              <option value="TypeScript">TypeScript</option>
              <option value="React">React</option>
              <option value="Java">Java</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <textarea
            required
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Paste your code snippet here..."
            className="w-full min-h-[250px] p-4 text-sm font-mono text-black-800 bg-transparent resize-y focus:outline-none"
          />

          <div className="border-t border-gray-100">
            <textarea
              required
              value={error}
              onChange={(e) => setError(e.target.value)}
              placeholder="Paste the error output or describe the failure..."
              className="w-full min-h-[100px] p-4 text-sm text-black-700 bg-red-50/30 resize-y focus:outline-none"
            />
          </div>
          
          <div className="border-t border-gray-100">
            <input
              type="text"
              value={expected}
              onChange={(e) => setExpected(e.target.value)}
              placeholder="Expected behavior (optional)"
              className="w-full p-3 text-sm text-black-500 bg-transparent focus:outline-none"
            />
          </div>
        </div>

        <div className="flex items-center justify-end">
      <button 
    type="submit" 
    disabled={isLoading || !code || !error}
    className="bg-blue-600 hover:bg-blue-700 text-black font-medium py-2 px-6 rounded shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
  >
    {isLoading ? 'Analyzing...' : 'Initialize Session →'}
  </button>
   </div>
      </form>
    </div>
  );
}
