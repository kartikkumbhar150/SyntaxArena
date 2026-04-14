import { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { Role } from '../../types';

export function Login() {
  const login = useAuthStore((state) => state.login);
  const [role, setRole] = useState<Role>('candidate');

  const handleDemoLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login({
      id: Math.random().toString(36).substr(2, 9),
      email: `${role}@demo.com`,
      name: role === 'recruiter' ? 'Alice (Recruiter)' : 'Bob (Candidate)',
      role
    });
  };

  return (
    <div className="text-center">
      <h2 className="text-2xl font-bold mb-6">Sign in to SyntaxArena</h2>
      
      <form onSubmit={handleDemoLogin} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-neutral-400 mb-1 text-left">Demo Role</label>
          <select 
            className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
            value={role}
            onChange={(e) => setRole(e.target.value as Role)}
          >
            <option value="candidate">Candidate</option>
            <option value="recruiter">Recruiter</option>
          </select>
        </div>
        
        <button 
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          Login as {role === 'recruiter' ? 'Recruiter' : 'Candidate'}
        </button>
      </form>
    </div>
  );
}
