import { Outlet, Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export function AuthLayout() {
  const { user } = useAuthStore();

  // Already logged in — send to portal
  if (user) {
    const dest = user.role === 'recruiter' ? '/recruiter' : '/candidate';
    return <Navigate to={dest} replace />;
  }

  return (
    <div className="auth-layout">
      {/* Animated background grid */}
      <div className="auth-bg">
        <div className="auth-grid" />
        <div className="auth-glow auth-glow-1" />
        <div className="auth-glow auth-glow-2" />
      </div>

      {/* Branding */}
      <div className="auth-brand">
        <div className="auth-logo">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="8" fill="#388bfd" />
            <path d="M8 16L13 11L18 16L13 21L8 16Z" fill="white" opacity="0.9" />
            <path d="M14 16L19 11L24 16L19 21L14 16Z" fill="white" opacity="0.5" />
          </svg>
          <span className="auth-logo-text">SyntaxArena</span>
        </div>
        <p className="auth-tagline">Enterprise Coding Assessment Platform</p>
      </div>

      <div className="auth-content">
        <Outlet />
      </div>

      <style>{`
        .auth-layout {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
          gap: 32px;
        }
        .auth-bg {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 0;
        }
        .auth-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(56,139,253,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(56,139,253,0.04) 1px, transparent 1px);
          background-size: 40px 40px;
        }
        .auth-glow {
          position: absolute;
          border-radius: 50%;
          filter: blur(120px);
          opacity: 0.12;
        }
        .auth-glow-1 {
          width: 600px; height: 600px;
          background: #388bfd;
          top: -200px; left: -100px;
        }
        .auth-glow-2 {
          width: 400px; height: 400px;
          background: #a371f7;
          bottom: -100px; right: -100px;
        }
        .auth-brand {
          position: relative;
          z-index: 1;
          text-align: center;
        }
        .auth-logo {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          margin-bottom: 8px;
        }
        .auth-logo-text {
          font-size: 1.6rem;
          font-weight: 800;
          background: linear-gradient(135deg, #388bfd, #a371f7);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          letter-spacing: -0.5px;
        }
        .auth-tagline {
          color: var(--color-text-secondary);
          font-size: 0.85rem;
        }
        .auth-content {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 440px;
          padding: 0 16px;
        }
      `}</style>
    </div>
  );
}
