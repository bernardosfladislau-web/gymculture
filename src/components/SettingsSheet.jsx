import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useLanguage } from '@/lib/LanguageContext';
import { Settings as SettingsIcon, LogOut, Trash2, Globe, Target, ChevronRight } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export default function SettingsSheet({ open, onOpenChange, onNavigate }) {
  const { t, resetLanguage } = useLanguage();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  if (!open) return null;

  const handleChangeLanguage = () => {
    onOpenChange(false);
    resetLanguage();
  };

  const handleChangeGoals = () => {
    onOpenChange(false);
    onNavigate('/onboarding');
  };

  const handleLogout = () => {
    onOpenChange(false);
    base44.auth.logout('/login');
  };

  const handleDeleteAccount = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDeleteAccount = async () => {
    setDeleting(true);
    try {
      const me = await base44.auth.me();
      await Promise.all([
        base44.entities.WaterLog.deleteMany({ created_by_id: me.id }),
        base44.entities.MealLog.deleteMany({ created_by_id: me.id }),
        base44.entities.CommunityPost.deleteMany({ created_by_id: me.id }),
        base44.entities.Like.deleteMany({ created_by_id: me.id }),
        base44.entities.Comment.deleteMany({ created_by_id: me.id }),
        base44.entities.Follow.deleteMany({ created_by_id: me.id }),
      ]);
      await base44.entities.User.delete(me.id);
    } catch {
      // proceed with logout regardless
    }
    setShowDeleteConfirm(false);
    onOpenChange(false);
    base44.auth.logout('/login');
  };

  return (
    <>
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-end justify-center" onClick={() => onOpenChange(false)}>
      <div className="glass-card rounded-t-3xl w-full max-w-md p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] animate-fade-in" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2 mb-6">
          <SettingsIcon size={20} className="text-primary" />
          <h2 className="text-lg font-heading font-light">{t('settings.title')}</h2>
        </div>

        <div className="space-y-2">
          <button onClick={handleChangeGoals} className="w-full glass-card rounded-2xl p-4 flex items-center gap-3 active:scale-[0.98] transition-transform">
            <Target size={18} className="text-primary" />
            <span className="text-sm font-medium flex-1 text-left">{t('settings.change_goals')}</span>
            <ChevronRight size={16} className="text-muted-foreground" />
          </button>

          <button onClick={handleChangeLanguage} className="w-full glass-card rounded-2xl p-4 flex items-center gap-3 active:scale-[0.98] transition-transform">
            <Globe size={18} className="text-primary" />
            <span className="text-sm font-medium flex-1 text-left">{t('settings.change_language')}</span>
            <ChevronRight size={16} className="text-muted-foreground" />
          </button>

          <button onClick={handleLogout} className="w-full glass-card rounded-2xl p-4 flex items-center gap-3 active:scale-[0.98] transition-transform">
            <LogOut size={18} className="text-destructive" />
            <span className="text-sm font-medium flex-1 text-left text-destructive">{t('settings.logout')}</span>
          </button>

          <button onClick={handleDeleteAccount} className="w-full glass-card rounded-2xl p-4 flex items-center gap-3 active:scale-[0.98] transition-transform">
            <Trash2 size={18} className="text-destructive" />
            <span className="text-sm font-medium flex-1 text-left text-destructive">{t('settings.delete_account')}</span>
          </button>
        </div>
      </div>
    </div>

      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-heading font-light">{t('settings.delete_account')}</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              {t('settings.delete_confirm')}
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)} className="flex-1">
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDeleteAccount} disabled={deleting} className="flex-1">
              {deleting ? 'Deleting...' : t('settings.delete_account')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}