import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import WorkspaceInput from './components/WorkspaceInput';
import AIResponse from './components/AIResponse';
import ChatInput from './components/ChatInput';

const BACKEND_URL = window.location.hostname === "localhost" 
  ? "http://localhost:3000" 
  : "https://debugmate-br7x.onrender.com";


function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function getLocalSessions() {
  const data = localStorage.getItem("debugSessionsReact");
  return data ? JSON.parse(data) : [];
}

function setLocalSessions(sessions) {
  localStorage.setItem("debugSessionsReact", JSON.stringify(sessions));
}

export default function App() {
  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const bottomRef = useRef(null);

  useEffect(() => {
    setSessions(getLocalSessions().sort((a,b) => new Date(b.updatedAt) - new Date(a.updatedAt)));
  }, []);

  const saveSessions = (newSessions) => {
    setSessions(newSessions.sort((a,b) => new Date(b.updatedAt) - new Date(a.updatedAt)));
    setLocalSessions(newSessions);
  };

  const activeSession = sessions.find(s => s.id === activeSessionId);

  // Auto-scroll
  useEffect(() => {
    if (activeSession && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeSession?.messages, loading]);

  const handleNewSessionClick = () => {
    setActiveSessionId(null);
  };

  const handleDeleteSession = (id) => {
    const fresh = sessions.filter(s => s.id !== id);
    saveSessions(fresh);
    if (activeSessionId === id) setActiveSessionId(null);
  };

  const handleInitialSubmit = async ({ language, code, error, expected }) => {
    setLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/suggest-fix`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language, code, error, expected })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed");

      const newSess = {
        id: generateUUID(),
        title: data.title || (`${language} issue`),
        language,
        code,
        error,
        expected,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messages: [
          {
            role: "assistant",
            isStructured: true,
            content: {
              summary: data.summary,
              cause: data.cause,
              fixSteps: data.fixSteps,
              fixedCode: data.fixedCode
            },
            text: `Summary: ${data.summary}\nCause: ${data.cause}`
          }
        ]
      };
      saveSessions([newSess, ...sessions]);
      setActiveSessionId(newSess.id);
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (text) => {
    if (!activeSession) return;
    
    // Add user message
    const newMessage = { role: "user", text };
    let updatedMsgs = [...activeSession.messages, newMessage];
    
    const updatedSess = { ...activeSession, messages: updatedMsgs, updatedAt: new Date().toISOString() };
    saveSessions(sessions.map(s => s.id === updatedSess.id ? updatedSess : s));
    
    setLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/chat-debug`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language: activeSession.language,
          code: activeSession.code,
          error: activeSession.error,
          messages: updatedMsgs.map(m => ({ role: m.role, text: m.text }))
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed");

      const assistantMsg = { role: "assistant", text: data.reply };
      const finalSess = { 
        ...updatedSess, 
        messages: [...updatedSess.messages, assistantMsg],
        updatedAt: new Date().toISOString()
      };
      
      saveSessions(sessions.map(s => s.id === finalSess.id ? finalSess : s));
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC]">
      <Sidebar 
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={setActiveSessionId}
        onNewSession={handleNewSessionClick}
        onDeleteSession={handleDeleteSession}
      />
      
      <main className="flex-1 flex flex-col relative overflow-hidden bg-white">
        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto px-6 sm:px-12 lg:px-24">
          {!activeSessionId ? (
            <WorkspaceInput onSubmit={handleInitialSubmit} isLoading={loading} />
          ) : (
            <div className="w-full mx-auto pt-8 pb-32">
              
              {/* Context Summary Bar */}
              <div className="mb-10 p-6 bg-gray-50 border border-gray-100 rounded-xl shadow-sm">
                <div className="flex justify-between items-start mb-3">
                  <h2 className="text-xl font-bold text-gray-800 tracking-tight">{activeSession.title}</h2>
                  <span className="text-xs font-mono font-medium text-blue-700 bg-blue-100 px-3 py-1 rounded-full">
                     {activeSession.language}
                  </span>
                </div>
                <div className="text-sm font-mono text-gray-500 bg-gray-100 p-4 rounded-lg border border-gray-200 overflow-x-auto">
                   <span className="font-semibold text-gray-400 uppercase tracking-widest text-[10px] block mb-2">Original snippet</span>
                   {activeSession.code}
                </div>
              </div>
              
              <div className="mt-8 flex flex-col">
                {activeSession.messages.map((msg, i) => {
                  const isLastAssistantMessage = msg.role === 'assistant' && i === activeSession.messages.length - 1;
                  
                  return (
                    <div key={i} className="mb-2 w-full">
                      <AIResponse message={msg} />
                      
                      {/* Mapping Quick actions directly beneath the LAST assistant message */}
                      {isLastAssistantMessage && !loading && (
                        <div className="flex gap-3 mt-4 animate-fade-in-up">
                          {["Explain simpler", "Show only code", "Why this happened"].map(actionText => (
                            <button
                              key={actionText}
                              onClick={() => handleSendMessage(actionText)}
                              className="px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-600 hover:text-gray-900 border border-gray-200 text-sm font-medium rounded-full transition-colors shadow-sm"
                            >
                              {actionText}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
                
                {/* Loading State Spinner */}
                {loading && (
                  <div className="flex items-center gap-4 text-blue-500 my-8 px-2 animate-pulse">
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    <span className="text-[15px] font-medium tracking-wide">Analyzing your code...</span>
                  </div>
                )}
                
                <div ref={bottomRef} className="h-4" />
              </div>
            </div>
          )}
        </div>

        {/* Fixed Chat Input Area */}
        {activeSessionId && (
          <div className="w-full shrink-0">
             <ChatInput onSendMessage={handleSendMessage} disabled={loading} />
          </div>
        )}
      </main>
    </div>
  );
}
