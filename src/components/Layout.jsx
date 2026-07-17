import { Navigate } from 'react-router-dom';
import BottomNav from './BottomNav';
import AnimatedOutlet from './AnimatedOutlet';
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
    <div className="min-h-screen bg-background text-foreground no-bounce">
      <div className="max-w-md mx-auto min-h-screen relative">
        <main className="relative pb-[calc(7rem+env(safe-area-inset-bottom))] no-bounce overflow-x-hidden">
          <AnimatedOutlet />
        </main>
        <BottomNav />
      </div>
    </div>
  );
}