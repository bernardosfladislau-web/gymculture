import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
import { TabHistoryProvider } from '@/lib/TabHistoryContext';
import { LanguageProvider } from '@/lib/LanguageContext';
import LanguageSelect from '@/pages/LanguageSelect';
import Layout from '@/components/Layout';
import Onboarding from '@/pages/Onboarding';
import Dashboard from '@/pages/Dashboard';
import LogMeal from '@/pages/LogMeal';
import Community from '@/pages/Community';
import NutritionHub from '@/pages/NutritionHub';
import NutritionItemDetail from '@/pages/NutritionItemDetail';
import Profile from '@/pages/Profile';
import SubmitRecipe from '@/pages/SubmitRecipe';
import AdminPanel from '@/pages/AdminPanel';
import WorkoutTracker from '@/pages/WorkoutTracker';
import ProtectedRoute from '@/components/ProtectedRoute';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
// Add page imports here

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, isAuthenticated } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (authError?.type === 'user_not_registered') {
    return <UserNotRegisteredError />;
  }

  // Authenticated users must select a language before entering the app
  if (isAuthenticated && !localStorage.getItem('app_language')) {
    return <LanguageSelect />;
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
        <Route path="/onboarding" element={<Onboarding />} />
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/log-meal" element={<LogMeal />} />
          <Route path="/community" element={<Community />} />
          <Route path="/nutrition-hub" element={<NutritionHub />} />
          <Route path="/nutrition-hub/:id" element={<NutritionItemDetail />} />
          <Route path="/submit-recipe" element={<SubmitRecipe />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/:id" element={<Profile />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/workout-tracker" element={<WorkoutTracker />} />
        </Route>
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <LanguageProvider>
        <QueryClientProvider client={queryClientInstance}>
          <Router>
          <ScrollToTop />
          <TabHistoryProvider>
            <AuthenticatedApp />
          </TabHistoryProvider>
        </Router>
        <Toaster />
        </QueryClientProvider>
      </LanguageProvider>
    </AuthProvider>
  )
}

export default App