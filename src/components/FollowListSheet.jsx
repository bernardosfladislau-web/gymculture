import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useLanguage } from '@/lib/LanguageContext';
import { User } from 'lucide-react';

export default function FollowListSheet({ open, onOpenChange, title, users }) {
  const { t } = useLanguage();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-border/50 max-w-md rounded-3xl max-h-[70vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-heading font-light text-gradient-gold">{title}</DialogTitle>
        </DialogHeader>
        {users.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">{t('prof.none')}</p>
        ) : (
          <div className="space-y-2">
            {users.map((u) => (
              <button
                key={u.id}
                onClick={() => {
                  onOpenChange(false);
                  window.location.href = `/profile/${u.id}`;
                }}
                className="w-full flex items-center gap-3 p-3 rounded-2xl glass-card active:scale-[0.98] transition-transform text-left"
              >
                {u.avatar_url ? (
                  <img src={u.avatar_url} alt={u.name} className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                    <User size={16} className="text-muted-foreground" />
                  </div>
                )}
                <span className="text-sm font-medium truncate">{u.name}</span>
              </button>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}