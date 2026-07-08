import { Outlet, Navigate } from 'react-router-dom';
import BottomNav from './BottomNav';
import { useCurrentUser } from '@/hooks/useCurrentUser';

export default function Layout() {
  const { user, loading } = useCurrentUser();

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (user && !user.has_onboarded) {
    return <Navigate to="/onboarding" replace />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-md mx-auto min-h-screen relative">
        <main className="pb-28">
          <Outlet />
        </main>
        <BottomNav />
      </div>
    </div>
  );
}