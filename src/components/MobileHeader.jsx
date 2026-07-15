import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

export default function MobileHeader({ title, showBack = false, onBack, right, logo = false }) {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-lg border-b border-border/30">
      <div className="px-5 pt-[calc(0.75rem+env(safe-area-inset-top))] pb-3">
        <div className="flex items-center justify-between h-7">
          {showBack ? (
            <button
              onClick={onBack || (() => navigate(-1))}
              className="flex items-center gap-1 text-muted-foreground active:scale-95 transition-transform"
            >
              <ChevronLeft size={22} strokeWidth={2} />
              {title && <span className="text-base font-heading font-light text-foreground truncate max-w-[60vw]">{title}</span>}
            </button>
          ) : logo ? (
            <h1 className="text-xl font-heading font-light text-gradient-gold">GymCulture</h1>
          ) : (
            <h1 className="text-xl font-heading font-light">{title}</h1>
          )}
          {right && <div className="flex items-center gap-2">{right}</div>}
        </div>
      </div>
    </header>
  );
}