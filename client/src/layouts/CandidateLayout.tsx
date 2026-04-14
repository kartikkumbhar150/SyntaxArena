import { Outlet, Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useProctoring } from '../lib/useProctoring';
import { useEffect, useRef } from 'react';

export function CandidateLayout() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const { startWebcam, events } = useProctoring();
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      startWebcam(videoRef.current);
    }
  }, [startWebcam]);

  if (!isAuthenticated || user?.role !== 'candidate') {
    return <Navigate to="/auth/login" replace />;
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col">
      {/* Top Navigation - Distraction Free */}
      <header className="h-14 bg-neutral-900 border-b border-neutral-800 flex items-center justify-between px-6 z-10 w-full shrink-0">
        <div className="flex items-center space-x-4">
          <h1 className="text-lg font-bold bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">
            SyntaxArena
          </h1>
          <span className="text-neutral-500 text-sm border-l border-neutral-700 pl-4">Assessment Environment</span>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="relative group">
            <video 
              ref={videoRef} 
              autoPlay 
              muted 
              playsInline 
              className="w-16 h-12 object-cover rounded border border-neutral-700 bg-neutral-950" 
            />
            {events.length > 0 && (
              <div className="absolute top-0 right-0 -mr-2 -mt-2 bg-red-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full animate-bounce">
                {events.length}
              </div>
            )}
          </div>

          <div className={`text-sm px-3 py-1 rounded-full flex items-center shadow-[0_0_10px_rgba(16,185,129,0.2)] border ${events.length > 0 ? 'bg-red-500/10 text-red-500 border-red-500/30' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'}`}>
            <div className={`w-2 h-2 rounded-full mr-2 animate-pulse ${events.length > 0 ? 'bg-red-500' : 'bg-emerald-400'}`}></div>
            {events.length > 0 ? 'Integrity Warning' : 'Proctoring Active'}
          </div>
          
          <button onClick={logout} className="text-xs text-neutral-400 hover:text-white transition-colors">
            Exit
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden w-full relative">
        <Outlet />
      </main>
    </div>
  );
}
