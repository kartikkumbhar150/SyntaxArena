import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const { login, isLoading, error, clearError } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login({ email, password });
    const user = useAuthStore.getState().user;
    if (user) {
      const dest = from ?? (user.role === 'recruiter' ? '/recruiter' : '/candidate');
      navigate(dest, { replace: true });
    }
  };

  return (
    <div className="auth-card slide-up">
      <div className="auth-card-header">
        <h2 className="auth-card-title">Welcome back</h2>
        <p className="auth-card-subtitle">Sign in to your SyntaxArena account</p>
      </div>

      {error && (
        <div className="auth-error" onClick={clearError}>
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label htmlFor="email" className="form-label">Email address</label>
          <input
            id="email"
            type="email"
            className="input-field"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => { clearError(); setEmail(e.target.value); }}
            required
            autoComplete="email"
          />
        </div>

        <div className="form-group">
          <label htmlFor="password" className="form-label">Password</label>
          <div className="input-wrapper">
            <input
              id="password"
              type={showPass ? 'text' : 'password'}
              className="input-field"
              placeholder="••••••••"
              value={password}
              onChange={(e) => { clearError(); setPassword(e.target.value); }}
              required
              autoComplete="current-password"
            />
            <button
              type="button"
              className="input-icon-btn"
              onClick={() => setShowPass((v) => !v)}
              aria-label="Toggle password visibility"
            >
              {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          className="btn-primary"
          style={{ width: '100%', justifyContent: 'center' }}
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="spinner" />
          ) : (
            <>
              <LogIn size={16} />
              Sign In
            </>
          )}
        </button>
      </form>

      <div className="auth-divider">
        <span>Don't have an account?</span>
        <Link to="/register" className="auth-link">Create one</Link>
      </div>

      <style>{`
        .auth-card {
          background: var(--color-bg-secondary);
          border: 1px solid var(--color-border);
          border-radius: 16px;
          padding: 36px;
          width: 100%;
        }
        .auth-card-header { margin-bottom: 24px; }
        .auth-card-title {
          font-size: 1.4rem;
          font-weight: 700;
          color: var(--color-text-primary);
          margin-bottom: 4px;
        }
        .auth-card-subtitle {
          font-size: 0.875rem;
          color: var(--color-text-secondary);
        }
        .auth-error {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 14px;
          background: rgba(248,81,73,0.12);
          border: 1px solid rgba(248,81,73,0.3);
          border-radius: 8px;
          color: var(--color-accent-red);
          font-size: 0.875rem;
          margin-bottom: 16px;
          cursor: pointer;
        }
        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .form-label {
          font-size: 0.85rem;
          font-weight: 500;
          color: var(--color-text-secondary);
        }
        .input-wrapper {
          position: relative;
        }
        .input-wrapper .input-field {
          padding-right: 40px;
        }
        .input-icon-btn {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: var(--color-text-muted);
          cursor: pointer;
          display: flex;
          align-items: center;
          padding: 0;
          transition: color 0.15s;
        }
        .input-icon-btn:hover { color: var(--color-text-primary); }
        .auth-divider {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-top: 20px;
          font-size: 0.875rem;
          color: var(--color-text-secondary);
        }
        .auth-link {
          color: var(--color-accent-blue);
          text-decoration: none;
          font-weight: 600;
          transition: opacity 0.15s;
        }
        .auth-link:hover { opacity: 0.8; }
        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
