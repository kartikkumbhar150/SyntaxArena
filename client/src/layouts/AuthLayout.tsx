import { Outlet, Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export function AuthLayout() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);

  if (isAuthenticated && user) {
    return <Navigate to={user.role === 'recruiter' ? '/recruiter/dashboard' : '/candidate/dashboard'} replace />;
  }

  return (
    <div className="min-h-screen bg-neutral-900 text-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-neutral-800 rounded-xl shadow-2xl overflow-hidden border border-neutral-700">
        <div className="p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
