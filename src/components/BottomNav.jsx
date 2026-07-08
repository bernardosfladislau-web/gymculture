import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Plus, Users, Apple, User } from 'lucide-react';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Home' },
  { to: '/community', icon: Users, label: 'Community' },
  { to: '/log-meal', icon: Plus, label: 'Log', highlight: true },
  { to: '/nutrition-hub', icon: Apple, label: 'Foods' },
  { to: '/profile', icon: User, label: 'Profile' },
];

export default function BottomNav() {
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none">
      <div className="max-w-md mx-auto px-4 pb-5 pt-2 pointer-events-auto">
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
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all ${
                    isActive ? 'text-primary' : 'text-muted-foreground'
                  }`
                }
              >
                <Icon size={22} strokeWidth={2} />
                <span className="text-[10px] font-medium tracking-wide">{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      </div>
    </nav>
  );
}