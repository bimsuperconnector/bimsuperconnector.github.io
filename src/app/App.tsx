import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '../features/auth/AuthContext';
import { RootLayout } from '../layouts/RootLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { PortalRoute } from './PortalRoute';
import { ReviewerRoute } from './ReviewerRoute';
import { LandingPage } from '../pages/LandingPage';
import { LoginPage } from '../pages/LoginPage';
import { TermsPage } from '../pages/TermsPage';
import { PrivacyPage } from '../pages/PrivacyPage';
import { DashboardPage } from '../pages/DashboardPage';
import { OnboardingPage } from '../features/onboarding/OnboardingPage';
import { ReviewQueuePage } from '../features/review/ReviewQueuePage';
import { ProfilePage } from '../features/profile/ProfilePage';

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <Routes>
          <Route element={<RootLayout />}>
            <Route index element={<LandingPage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="terms" element={<TermsPage />} />
            <Route path="privacy" element={<PrivacyPage />} />
            <Route
              path="onboarding"
              element={
                <ProtectedRoute>
                  <OnboardingPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="dashboard"
              element={
                <PortalRoute>
                  <DashboardPage />
                </PortalRoute>
              }
            />
            <Route
              path="profile"
              element={
                <PortalRoute>
                  <ProfilePage />
                </PortalRoute>
              }
            />
            <Route
              path="review"
              element={
                <ReviewerRoute>
                  <ReviewQueuePage />
                </ReviewerRoute>
              }
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
