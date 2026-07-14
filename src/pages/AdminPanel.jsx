import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Check, X, Flag, ChevronLeft, UserCog } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useLanguage } from '@/lib/LanguageContext';
import { Button } from '@/components/ui/button';

export default function AdminPanel() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { user } = useCurrentUser();
  const [tab, setTab] = useState('submissions');
  const [submissions, setSubmissions] = useState([]);
  const [reports, setReports] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      base44.entities.NutritionItem.filter({ status: 'pending' }, '-created_date'),
      base44.entities.Report.filter({ status: 'pending' }, '-created_date'),
      base44.entities.User.list('-created_date', 100),
    ]).then(([subs, reps, usrs]) => {
      setSubmissions(subs);
      setReports(reps);
      setUsers(usrs);
    }).finally(() => setLoading(false));
  }, []);

  if (user && user.role !== 'admin') {
    return (
      <div className="px-5 pt-20 text-center">
        <Shield size={32} className="text-muted-foreground mx-auto mb-4" />
        <p className="text-sm text-muted-foreground">{t('admin.access_required')}</p>
        <Button onClick={() => navigate('/')} className="mt-4 bg-primary text-primary-foreground">{t('admin.go_home')}</Button>
      </div>
    );
  }

  const handleApprove = async (item) => {
    await base44.entities.NutritionItem.update(item.id, { status: 'approved' });
    setSubmissions((s) => s.filter((x) => x.id !== item.id));
  };

  const handleReject = async (item) => {
    await base44.entities.NutritionItem.update(item.id, { status: 'rejected' });
    setSubmissions((s) => s.filter((x) => x.id !== item.id));
  };

  const handleResolveReport = async (report, resolve) => {
    if (resolve && report.item_type === 'post') {
      await base44.entities.CommunityPost.delete(report.item_id);
    }
    await base44.entities.Report.update(report.id, { status: resolve ? 'resolved' : 'dismissed' });
    setReports((r) => r.filter((x) => x.id !== report.id));
  };

  const toggleAdminRole = async (u) => {
    if (u.id === user.id) return;
    const newRole = u.role === 'admin' ? 'user' : 'admin';
    await base44.entities.User.update(u.id, { role: newRole });
    setUsers((prev) => prev.map((x) => (x.id === u.id ? { ...x, role: newRole } : x)));
  };

  return (
    <div className="px-5 pt-12 pb-8">
      <button onClick={() => navigate('/profile')} className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
        <ChevronLeft size={16} /> {t('admin.back')}
      </button>

      <div className="flex items-center gap-2 mb-6">
        <Shield size={22} className="text-primary" />
        <h1 className="text-2xl font-heading font-light">{t('admin.title')}</h1>
      </div>

      <div className="flex gap-2 mb-6">
        <button onClick={() => setTab('submissions')} className={`flex-1 py-2.5 rounded-xl text-xs font-medium transition-all ${tab === 'submissions' ? 'bg-primary text-primary-foreground' : 'glass-card text-muted-foreground'}`}>
          {t('admin.submissions')} ({submissions.length})
        </button>
        <button onClick={() => setTab('reports')} className={`flex-1 py-2.5 rounded-xl text-xs font-medium transition-all ${tab === 'reports' ? 'bg-primary text-primary-foreground' : 'glass-card text-muted-foreground'}`}>
          {t('admin.reports')} ({reports.length})
        </button>
        <button onClick={() => setTab('users')} className={`flex-1 py-2.5 rounded-xl text-xs font-medium transition-all ${tab === 'users' ? 'bg-primary text-primary-foreground' : 'glass-card text-muted-foreground'}`}>
          {t('admin.users')} ({users.length})
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      ) : tab === 'submissions' ? (
        submissions.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">{t('admin.no_submissions')}</p>
        ) : (
          <div className="space-y-3">
            {submissions.map((item) => (
              <div key={item.id} className="glass-card rounded-2xl p-4 animate-fade-in">
                <div className="flex items-start gap-3">
                  {item.photo_url && <img src={item.photo_url} alt={item.name} className="w-16 h-16 rounded-xl object-cover" />}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-primary capitalize">{item.category?.replace('_', ' ')}</p>
                    <h4 className="text-sm font-medium truncate">{item.name}</h4>
                    <div className="flex items-center gap-3 mt-1 text-[11px] text-muted-foreground">
                      <span>{item.calories} cal</span>
                      <span>{item.protein}g P</span>
                      <span>{item.fat}g F</span>
                      <span>{item.carbs}g C</span>
                    </div>
                    {item.submitter_name && <p className="text-[10px] text-muted-foreground mt-1">by {item.submitter_name}</p>}
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <Button onClick={() => handleApprove(item)} className="flex-1 bg-primary text-primary-foreground text-xs py-2 h-9">
                    <Check size={14} /> {t('admin.approve')}
                  </Button>
                  <Button onClick={() => handleReject(item)} variant="ghost" className="flex-1 text-destructive border border-destructive/30 text-xs py-2 h-9">
                    <X size={14} /> {t('admin.reject')}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : tab === 'reports' ? (
        reports.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">{t('admin.no_reports')}</p>
        ) : (
          <div className="space-y-3">
            {reports.map((report) => (
              <div key={report.id} className="glass-card rounded-2xl p-4 animate-fade-in">
                <div className="flex items-start gap-3">
                  <Flag size={16} className="text-destructive mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium capitalize">{report.item_type}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{report.reason}</p>
                    {report.reporter_name && <p className="text-[10px] text-muted-foreground mt-1">by {report.reporter_name}</p>}
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <Button onClick={() => handleResolveReport(report, true)} className="flex-1 bg-destructive text-destructive-foreground text-xs py-2 h-9">
                    Remove Content
                  </Button>
                  <Button onClick={() => handleResolveReport(report, false)} variant="ghost" className="flex-1 text-xs py-2 h-9 border border-border">
                    Dismiss
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        users.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">{t('admin.no_users')}</p>
        ) : (
          <div className="space-y-3">
            {users.map((u) => (
              <div key={u.id} className="glass-card rounded-2xl p-4 flex items-center gap-3 animate-fade-in">
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-medium text-primary">{(u.full_name || 'U')[0]?.toUpperCase()}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{u.full_name || 'Unknown'}</p>
                  <p className="text-[11px] text-muted-foreground">{t('admin.role')}: {u.role || 'user'}</p>
                </div>
                {u.id !== user.id && (
                  <Button
                    onClick={() => toggleAdminRole(u)}
                    variant={u.role === 'admin' ? 'ghost' : 'default'}
                    className={`text-xs h-8 px-3 ${u.role === 'admin' ? 'border border-destructive/30 text-destructive' : 'bg-primary text-primary-foreground'}`}
                  >
                    <UserCog size={14} />
                    {u.role === 'admin' ? t('admin.remove_admin') : t('admin.make_admin')}
                  </Button>
                )}
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}