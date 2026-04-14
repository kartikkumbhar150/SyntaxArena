import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { LayoutDashboard, Library, FileText, Settings, LogOut } from 'lucide-react';

export function RecruiterLayout() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated || user?.role !== 'recruiter') {
    return <Navigate to="/auth/login" replace />;
  }

  const navItems = [
    { name: 'Dashboard', path: '/recruiter/dashboard', icon: LayoutDashboard },
    { name: 'Tests', path: '/recruiter/tests', icon: FileText },
    { name: 'Question Library', path: '/recruiter/library', icon: Library },
    { name: 'Settings', path: '/recruiter/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex">
      {/* Sidebar */}
      <div className="w-64 bg-neutral-900 border-r border-neutral-800 flex flex-col">
        <div className="p-6">
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
            SyntaxArena
          </h1>
          <p className="text-xs text-neutral-500 mt-1">Recruiter Portal</p>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-blue-500/10 text-blue-400' 
                    : 'text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200'
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-neutral-800">
          <div className="flex items-center space-x-3 mb-4 px-2">
            <div className="w-8 h-8 rounded-full bg-neutral-700 flex items-center justify-center">
              {user.name.charAt(0)}
            </div>
            <div className="text-sm">
              <p className="font-medium text-neutral-200">{user.name}</p>
              <p className="text-xs text-neutral-500 truncate w-32">{user.email}</p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="w-full flex items-center space-x-3 px-4 py-2 text-neutral-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto bg-neutral-950">
        <div className="p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
