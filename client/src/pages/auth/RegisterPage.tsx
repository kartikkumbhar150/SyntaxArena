import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import type { UserRole } from '../../types';

export function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [role, setRole] = useState<UserRole>('candidate');
  const [companyName, setCompanyName] = useState('');
  const { register, isLoading, error, clearError } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await register({ name, email, password, role, companyName: role === 'recruiter' ? companyName : undefined });
    const user = useAuthStore.getState().user;
    if (user) {
      navigate(user.role === 'recruiter' ? '/recruiter' : '/candidate', { replace: true });
    }
  };

  return (
    <div className="auth-card slide-up">
      <div className="auth-card-header">
        <h2 className="auth-card-title">Create an account</h2>
        <p className="auth-card-subtitle">Join SyntaxArena to get started</p>
      </div>

      {/* Role selector */}
      <div className="role-selector">
        {(['candidate', 'recruiter'] as UserRole[]).map((r) => (
          <button
            key={r}
            type="button"
            className={`role-option ${role === r ? 'role-option--active' : ''}`}
            onClick={() => { clearError(); setRole(r); }}
          >
            <span className="role-option-icon">
              {r === 'candidate' ? '👨‍💻' : '🏢'}
            </span>
            <span>{r === 'candidate' ? 'Candidate' : 'Recruiter'}</span>
          </button>
        ))}
      </div>

      {error && (
        <div className="auth-error" onClick={clearError}>
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label htmlFor="name" className="form-label">Full Name</label>
          <input
            id="name"
            type="text"
            className="input-field"
            placeholder="John Doe"
            value={name}
            onChange={(e) => { clearError(); setName(e.target.value); }}
            required
          />
        </div>

        {role === 'recruiter' && (
          <div className="form-group">
            <label htmlFor="company" className="form-label">Company Name</label>
            <input
              id="company"
              type="text"
              className="input-field"
              placeholder="Acme Corp"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              required
            />
          </div>
        )}

        <div className="form-group">
          <label htmlFor="reg-email" className="form-label">Email address</label>
          <input
            id="reg-email"
            type="email"
            className="input-field"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => { clearError(); setEmail(e.target.value); }}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="reg-password" className="form-label">Password</label>
          <div className="input-wrapper">
            <input
              id="reg-password"
              type={showPass ? 'text' : 'password'}
              className="input-field"
              placeholder="••••••••"
              value={password}
              onChange={(e) => { clearError(); setPassword(e.target.value); }}
              required
              minLength={8}
            />
            <button
              type="button"
              className="input-icon-btn"
              onClick={() => setShowPass((v) => !v)}
            >
              {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <span className="form-hint">Minimum 8 characters</span>
        </div>

        <button
          type="submit"
          className="btn-primary"
          style={{ width: '100%', justifyContent: 'center' }}
          disabled={isLoading}
        >
          {isLoading ? <span className="spinner" /> : (
            <><UserPlus size={16} /> Create Account</>
          )}
        </button>
      </form>

      <div className="auth-divider">
        <span>Already have an account?</span>
        <Link to="/login" className="auth-link">Sign in</Link>
      </div>

      <style>{`
        .auth-card { background:var(--color-bg-secondary);border:1px solid var(--color-border);border-radius:16px;padding:36px;width:100%; }
        .auth-card-header { margin-bottom:20px; }
        .auth-card-title { font-size:1.4rem;font-weight:700;color:var(--color-text-primary);margin-bottom:4px; }
        .auth-card-subtitle { font-size:0.875rem;color:var(--color-text-secondary); }
        .role-selector { display:flex;gap:8px;margin-bottom:20px; }
        .role-option {
          flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;
          padding:12px;background:var(--color-bg-tertiary);border:1px solid var(--color-border);
          border-radius:10px;cursor:pointer;color:var(--color-text-secondary);
          font-size:0.85rem;font-weight:500;transition:all 0.15s ease;
        }
        .role-option:hover { border-color:var(--color-text-muted);color:var(--color-text-primary); }
        .role-option--active { border-color:var(--color-accent-blue);background:rgba(56,139,253,0.1);color:var(--color-accent-blue); }
        .role-option-icon { font-size:1.4rem; }
        .auth-error { display:flex;align-items:center;gap:8px;padding:10px 14px;background:rgba(248,81,73,0.12);border:1px solid rgba(248,81,73,0.3);border-radius:8px;color:var(--color-accent-red);font-size:0.875rem;margin-bottom:16px;cursor:pointer; }
        .auth-form { display:flex;flex-direction:column;gap:14px; }
        .form-group { display:flex;flex-direction:column;gap:6px; }
        .form-label { font-size:0.85rem;font-weight:500;color:var(--color-text-secondary); }
        .form-hint { font-size:0.75rem;color:var(--color-text-muted); }
        .input-wrapper { position:relative; }
        .input-wrapper .input-field { padding-right:40px; }
        .input-icon-btn { position:absolute;right:12px;top:50%;transform:translateY(-50%);background:none;border:none;color:var(--color-text-muted);cursor:pointer;display:flex;align-items:center;padding:0; }
        .input-icon-btn:hover { color:var(--color-text-primary); }
        .auth-divider { display:flex;align-items:center;justify-content:center;gap:8px;margin-top:20px;font-size:0.875rem;color:var(--color-text-secondary); }
        .auth-link { color:var(--color-accent-blue);text-decoration:none;font-weight:600; }
        .spinner { width:16px;height:16px;border:2px solid rgba(255,255,255,0.3);border-top-color:white;border-radius:50%;animation:spin 0.6s linear infinite; }
        @keyframes spin { to { transform:rotate(360deg); } }
      `}</style>
    </div>
  );
}
