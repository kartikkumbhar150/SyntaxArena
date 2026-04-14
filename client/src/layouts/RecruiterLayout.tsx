import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  PlusCircle,
  BookOpen,
  Link2,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Bell,
  Settings,
  Code2,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const NAV_ITEMS = [
  { to: '/recruiter', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/recruiter/create-test', label: 'Create Test', icon: PlusCircle },
  { to: '/recruiter/questions', label: 'Question Library', icon: BookOpen },
  { to: '/recruiter/invites', label: 'Manage Invites', icon: Link2 },
];

export function RecruiterLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="recruiter-shell">
      {/* ── Sidebar ── */}
      <aside className={`sidebar ${collapsed ? 'sidebar--collapsed' : ''}`}>
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="logo-icon">
            <Code2 size={20} color="white" />
          </div>
          {!collapsed && (
            <span className="logo-text">SyntaxArena</span>
          )}
        </div>

        {/* Role badge */}
        {!collapsed && (
          <div className="role-badge">
            <span className="role-badge-dot" />
            Recruiter Portal
          </div>
        )}

        {/* Nav */}
        <nav className="sidebar-nav">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              title={collapsed ? item.label : undefined}
            >
              <item.icon size={18} />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Bottom actions */}
        <div className="sidebar-footer">
          <button className="nav-item" title={collapsed ? 'Settings' : undefined}>
            <Settings size={18} />
            {!collapsed && <span>Settings</span>}
          </button>
          <button className="nav-item" onClick={handleLogout} title={collapsed ? 'Logout' : undefined}>
            <LogOut size={18} />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>

        {/* Collapse toggle */}
        <button
          className="sidebar-collapse-btn"
          onClick={() => setCollapsed((c) => !c)}
          aria-label="Toggle sidebar"
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </aside>

      {/* ── Main ── */}
      <div className="main-area">
        {/* Topbar */}
        <header className="topbar">
          <div className="topbar-left">
            <h1 className="topbar-title">Recruiter Portal</h1>
          </div>
          <div className="topbar-right">
            <button className="btn-ghost" aria-label="Notifications">
              <Bell size={18} />
            </button>
            <div className="user-avatar-wrapper">
              <div className="user-avatar">
                {user?.name?.[0]?.toUpperCase() ?? 'R'}
              </div>
              <div className="user-info">
                <span className="user-name">{user?.name}</span>
                <span className="user-email">{user?.email}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="page-content fade-in">
          <Outlet />
        </main>
      </div>

      <style>{`
        .recruiter-shell {
          display: flex;
          height: 100vh;
          overflow: hidden;
          background: var(--color-bg-primary);
        }

        /* ── Sidebar ── */
        .sidebar {
          width: 240px;
          min-width: 240px;
          background: var(--color-bg-secondary);
          border-right: 1px solid var(--color-border);
          display: flex;
          flex-direction: column;
          padding: 16px 12px;
          gap: 4px;
          transition: width 0.2s ease, min-width 0.2s ease;
          position: relative;
          overflow: hidden;
        }
        .sidebar--collapsed {
          width: 64px;
          min-width: 64px;
        }

        .sidebar-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 4px 16px;
          border-bottom: 1px solid var(--color-border-subtle);
          margin-bottom: 8px;
        }
        .logo-icon {
          width: 36px;
          height: 36px;
          background: linear-gradient(135deg, #388bfd, #1f6feb);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .logo-text {
          font-size: 1rem;
          font-weight: 700;
          background: linear-gradient(135deg, #388bfd, #a371f7);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          white-space: nowrap;
        }

        .role-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 4px 8px;
          background: rgba(56,139,253,0.1);
          border: 1px solid rgba(56,139,253,0.2);
          border-radius: 20px;
          font-size: 0.72rem;
          font-weight: 600;
          color: var(--color-accent-blue);
          margin-bottom: 12px;
          white-space: nowrap;
        }
        .role-badge-dot {
          width: 6px;
          height: 6px;
          background: var(--color-accent-green);
          border-radius: 50%;
          animation: pulse 2s infinite;
        }

        .sidebar-nav {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .sidebar-footer {
          display: flex;
          flex-direction: column;
          gap: 2px;
          padding-top: 8px;
          border-top: 1px solid var(--color-border-subtle);
        }

        .sidebar-collapse-btn {
          position: absolute;
          bottom: 80px;
          right: -12px;
          width: 24px;
          height: 24px;
          background: var(--color-bg-elevated);
          border: 1px solid var(--color-border);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: var(--color-text-secondary);
          transition: all 0.15s ease;
          z-index: 10;
        }
        .sidebar-collapse-btn:hover {
          background: var(--color-bg-tertiary);
          color: var(--color-text-primary);
        }

        /* ── Main Area ── */
        .main-area {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .topbar {
          height: 56px;
          min-height: 56px;
          background: var(--color-bg-secondary);
          border-bottom: 1px solid var(--color-border);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 24px;
        }
        .topbar-title {
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--color-text-secondary);
          letter-spacing: 0.02em;
          text-transform: uppercase;
        }
        .topbar-right {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .user-avatar-wrapper {
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          padding: 4px 10px 4px 4px;
          border-radius: 8px;
          transition: background 0.15s;
        }
        .user-avatar-wrapper:hover {
          background: var(--color-bg-elevated);
        }
        .user-avatar {
          width: 32px;
          height: 32px;
          background: linear-gradient(135deg, #388bfd, #a371f7);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.85rem;
          font-weight: 700;
          color: white;
        }
        .user-info {
          display: flex;
          flex-direction: column;
        }
        .user-name {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--color-text-primary);
          line-height: 1.2;
        }
        .user-email {
          font-size: 0.72rem;
          color: var(--color-text-muted);
        }

        .page-content {
          flex: 1;
          overflow-y: auto;
          padding: 28px;
        }
      `}</style>
    </div>
  );
}
