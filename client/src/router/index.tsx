import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { RoleGuard } from './RoleGuard';
import { AuthLayout } from '../layouts/AuthLayout';
import { RecruiterLayout } from '../layouts/RecruiterLayout';
import { CandidateLayout } from '../layouts/CandidateLayout';

// Auth pages
import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';

// Recruiter pages
import { RecruiterDashboard } from '../pages/recruiter/RecruiterDashboard';
import { CreateTestPage } from '../pages/recruiter/CreateTestPage';
import { QuestionLibraryPage } from '../pages/recruiter/QuestionLibraryPage';
import { CandidateReportPage } from '../pages/recruiter/CandidateReportPage';
import { InviteManagePage } from '../pages/recruiter/InviteManagePage';

// Candidate pages
import { CandidateDashboard } from '../pages/candidate/CandidateDashboard';
import { OnboardingPage } from '../pages/candidate/OnboardingPage';
import { PracticeAreaPage } from '../pages/candidate/PracticeAreaPage';
import { AssessmentPage } from '../pages/candidate/AssessmentPage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/login" replace />,
  },
  {
    path: '/',
    element: <AuthLayout />,
    children: [
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
    ],
  },
  {
    path: '/recruiter',
    element: (
      <RoleGuard allowedRoles={['recruiter', 'admin']}>
        <RecruiterLayout />
      </RoleGuard>
    ),
    children: [
      { index: true, element: <RecruiterDashboard /> },
      { path: 'create-test', element: <CreateTestPage /> },
      { path: 'questions', element: <QuestionLibraryPage /> },
      { path: 'invites', element: <InviteManagePage /> },
      { path: 'reports/:reportId', element: <CandidateReportPage /> },
    ],
  },
  {
    path: '/candidate',
    element: (
      <RoleGuard allowedRoles={['candidate']}>
        <CandidateLayout />
      </RoleGuard>
    ),
    children: [
      { index: true, element: <CandidateDashboard /> },
      { path: 'onboarding/:token', element: <OnboardingPage /> },
      { path: 'practice', element: <PracticeAreaPage /> },
      { path: 'assessment/:assessmentId', element: <AssessmentPage /> },
    ],
  },
  {
    // Public assessment entry via invite link
    path: '/join/:token',
    element: <OnboardingPage />,
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
