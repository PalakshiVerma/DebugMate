import React from 'react';

export default function Sidebar({ sessions, activeSessionId, onSelectSession, onNewSession, onDeleteSession }) {
  return (
    <aside className="w-72 bg-gray-50 border-r border-gray-200 flex flex-col h-screen">
      <div className="p-4 flex items-center justify-between border-b border-gray-200">
        <div className="flex items-center gap-2 text-blue-600 font-bold text-lg">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor"/>
            <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          DebugMate
        </div>
        <button 
          onClick={onNewSession}
          className="p-1.5 hover:bg-gray-200 rounded text-gray-600 transition-colors"
          title="New Session"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-0.5">
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-1">History</div>
        
        {sessions.length === 0 ? (
          <div className="px-1 text-sm text-gray-400">No sessions yet.</div>
        ) : (
          sessions.map(session => (
            <div 
              key={session.id}
              onClick={() => onSelectSession(session.id)}
              className={`group flex flex-col p-2.5 rounded-lg cursor-pointer transition-colors ${
                activeSessionId === session.id 
                  ? 'bg-blue-100/50 text-blue-900 border-l-4 border-blue-500' 
                  : 'hover:bg-gray-100 text-gray-800 border-l-4 border-transparent'
              }`}
            >
              <div className="flex justify-between items-start">
                <span className={`font-semibold text-sm truncate ${activeSessionId === session.id ? 'text-blue-800' : 'text-gray-800'}`}>
                  {session.title || 'Unknown Session'}
                </span>
                <button 
                  onClick={(e) => { e.stopPropagation(); onDeleteSession(session.id); }}
                  className="text-gray-400 hover:text-red-500 transition-colors p-0.5 rounded ml-1 shrink-0"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                </button>
              </div>
              <span className="text-xs text-gray-500 truncate mt-1">
                {session.error || 'No error log'}
              </span>
              <span className="text-[10px] text-gray-400 font-medium mt-1.5">
                {new Date(session.updatedAt || session.createdAt).toLocaleString(undefined, {
                  month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
                })}
              </span>
            </div>
          ))
        )}
      </div>
    </aside>
  );
}
