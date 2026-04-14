import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AuthLayout } from '../layouts/AuthLayout';
import { RecruiterLayout } from '../layouts/RecruiterLayout';
import { CandidateLayout } from '../layouts/CandidateLayout';

// Pages
import { Login } from '../pages/auth/Login';
import { Dashboard as RecruiterDashboard } from '../pages/recruiter/Dashboard';
import { Assessment } from '../pages/candidate/Assessment';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/auth/login" replace />
  },
  {
    path: '/auth',
    element: <AuthLayout />,
    children: [
      { path: 'login', element: <Login /> }
    ]
  },
  {
    path: '/recruiter',
    element: <RecruiterLayout />,
    children: [
      { path: 'dashboard', element: <RecruiterDashboard /> },
      { path: 'tests', element: <div className="text-white">Tests Page Stub</div> },
      { path: 'library', element: <div className="text-white">Question Library Stub</div> },
      { path: 'settings', element: <div className="text-white">Settings Stub</div> },
    ]
  },
  {
    path: '/candidate',
    element: <CandidateLayout />,
    children: [
      { path: 'dashboard', element: <Navigate to="/candidate/assessment/1" replace /> },
      { path: 'assessment/:id', element: <Assessment /> }
    ]
  }
]);
