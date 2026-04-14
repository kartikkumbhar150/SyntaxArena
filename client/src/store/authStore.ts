import { create } from 'zustand';
import { User, Role } from '../types';

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    login: (userData: User) => void;
    logout: () => void;
    setRole: (role: Role) => void; // mainly for prototyping
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isAuthenticated: false,
    login: (userData) => set({ user: userData, isAuthenticated: true }),
    logout: () => set({ user: null, isAuthenticated: false }),
    setRole: (role) => set((state) => ({
        user: state.user ? { ...state.user, role } : null
    })),
}));
