import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { BookOpen, LayoutDashboard, LogOut, Code2 } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const NAV_ITEMS = [
  { to: '/candidate', label: 'My Assessments', icon: LayoutDashboard, end: true },
  { to: '/candidate/practice', label: 'Practice Area', icon: BookOpen },
];

export function CandidateLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  return (
    <div className="candidate-shell">
      {/* Minimal topbar — sterile environment */}
      <header className="candidate-topbar">
        <div className="c-logo">
          <div className="c-logo-icon">
            <Code2 size={16} color="white" />
          </div>
          <span className="c-logo-text">SyntaxArena</span>
        </div>

        <nav className="c-nav">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `c-nav-item ${isActive ? 'c-nav-item--active' : ''}`}
            >
              <item.icon size={16} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="c-topbar-right">
          <div className="user-avatar-sm">
            {user?.name?.[0]?.toUpperCase() ?? 'C'}
          </div>
          <span className="c-user-name">{user?.name}</span>
          <button
            className="btn-ghost"
            onClick={() => { logout(); navigate('/login'); }}
            aria-label="Logout"
          >
            <LogOut size={16} />
          </button>
        </div>
      </header>

      <main className="c-page-content fade-in">
        <Outlet />
      </main>

      <style>{`
        .candidate-shell {
          display: flex;
          flex-direction: column;
          height: 100vh;
          overflow: hidden;
          background: var(--color-bg-primary);
        }

        .candidate-topbar {
          height: 52px;
          min-height: 52px;
          background: var(--color-bg-secondary);
          border-bottom: 1px solid var(--color-border);
          display: flex;
          align-items: center;
          padding: 0 20px;
          gap: 24px;
        }

        .c-logo {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-right: 8px;
        }
        .c-logo-icon {
          width: 28px;
          height: 28px;
          background: linear-gradient(135deg, #388bfd, #1f6feb);
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .c-logo-text {
          font-size: 0.95rem;
          font-weight: 700;
          background: linear-gradient(135deg, #388bfd, #a371f7);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .c-nav {
          display: flex;
          align-items: center;
          gap: 4px;
          flex: 1;
        }
        .c-nav-item {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          border-radius: 6px;
          color: var(--color-text-secondary);
          text-decoration: none;
          font-size: 0.85rem;
          font-weight: 500;
          transition: all 0.15s ease;
        }
        .c-nav-item:hover {
          background: var(--color-bg-elevated);
          color: var(--color-text-primary);
        }
        .c-nav-item--active {
          background: rgba(56,139,253,0.12);
          color: var(--color-accent-blue);
        }

        .c-topbar-right {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-left: auto;
        }
        .user-avatar-sm {
          width: 28px;
          height: 28px;
          background: linear-gradient(135deg, #3fb950, #2ea043);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.8rem;
          font-weight: 700;
          color: white;
        }
        .c-user-name {
          font-size: 0.85rem;
          font-weight: 500;
          color: var(--color-text-secondary);
        }

        .c-page-content {
          flex: 1;
          overflow-y: auto;
          padding: 24px;
        }
      `}</style>
    </div>
  );
}
