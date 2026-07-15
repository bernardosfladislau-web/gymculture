import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Plus, Users, Apple, User } from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';
import { useTabHistory } from '@/lib/TabHistoryContext';

const navItems = [
  { to: '/', icon: LayoutDashboard, labelKey: 'nav.home' },
  { to: '/community', icon: Users, labelKey: 'nav.community' },
  { to: '/log-meal', icon: Plus, labelKey: 'nav.log', highlight: true },
  { to: '/nutrition-hub', icon: Apple, labelKey: 'nav.nutrition' },
  { to: '/profile', icon: User, labelKey: 'nav.profile' },
];

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const { getTabLocation } = useTabHistory();

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none">
      <div className="max-w-md mx-auto px-4 pb-[calc(1.25rem+env(safe-area-inset-bottom))] pt-2 pointer-events-auto">
        <div className="glass-card rounded-3xl flex items-center justify-around px-2 py-2 shadow-2xl">
          {navItems.map((item) => {
            const Icon = item.icon;
            if (item.highlight) {
              return (
                <button
                  key={item.to}
                  onClick={() => navigate(item.to)}
                  className="flex flex-col items-center justify-center -mt-6"
                >
                  <div className="w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center glow-gold active:scale-95 transition-transform">
                    <Icon size={26} strokeWidth={2.5} />
                  </div>
                </button>
              );
            }
            const active = isActive(item.to);
            return (
              <button
                key={item.to}
                onClick={() => navigate(getTabLocation(item.to))}
                className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all ${active ? 'text-primary' : 'text-muted-foreground'}`}
              >
                <Icon size={22} strokeWidth={2} />
                <span className="text-[10px] font-medium tracking-wide">{t(item.labelKey)}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}