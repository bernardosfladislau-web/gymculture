import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Settings, Lock, Globe, Loader2, Camera, Dumbbell } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useLanguage } from '@/lib/LanguageContext';
import SettingsSheet from '@/components/SettingsSheet';
import FollowListSheet from '@/components/FollowListSheet';

export default function Profile() {
  const { t } = useLanguage();
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser, updateUser, refetch } = useCurrentUser();
  const [profileUser, setProfileUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [followStatus, setFollowStatus] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [bio, setBio] = useState('');
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const fileRef = useRef(null);

  const isOwnProfile = !id || id === currentUser?.id;
  const targetId = id || currentUser?.id;

  useEffect(() => {
    if (!targetId) return;
    setLoading(true);
    const userFetch = isOwnProfile
      ? base44.auth.me()
      : base44.entities.User.get(targetId).catch(() => null);
    userFetch.then((u) => {
      setProfileUser(u);
      setBio(u?.bio || '');
    });
    base44.entities.CommunityPost.filter({ created_by_id: targetId }, '-created_date', 50).then(setPosts);
    base44.entities.Follow.filter({ following_id: targetId, status: 'accepted' }).then((folls) => {
      setFollowers(folls.map(f => ({ id: f.created_by_id, name: f.follower_name || f.following_name || 'User', avatar_url: f.follower_avatar_url })));
    });
    base44.entities.Follow.filter({ created_by_id: targetId, status: 'accepted' }).then((folls) => {
      setFollowing(folls.map(f => ({ id: f.following_id, name: f.following_name || 'User', avatar_url: null })));
    });
    if (!isOwnProfile && currentUser) {
      base44.entities.Follow.filter({ following_id: targetId, created_by_id: currentUser.id }).then((follows) => {
        setFollowStatus(follows[0]?.status || null);
      });
    }
    Promise.all([userFetch]).finally(() => setLoading(false));
  }, [targetId, currentUser, isOwnProfile]);

  const handleFollow = async () => {
    if (!profileUser || !currentUser) return;
    if (followStatus === 'accepted' || followStatus === 'pending') {
      const existing = await base44.entities.Follow.filter({ following_id: targetId, created_by_id: currentUser.id });
      if (existing[0]) await base44.entities.Follow.delete(existing[0].id);
      setFollowStatus(null);
      setFollowers(prev => prev.filter(f => f.id !== currentUser.id));
    } else {
      const status = profileUser.is_private ? 'pending' : 'accepted';
      await base44.entities.Follow.create({
        following_id: targetId,
        following_name: profileUser.full_name,
        follower_name: currentUser.full_name,
        follower_avatar_url: currentUser.avatar_url,
        status,
      });
      setFollowStatus(status);
      if (status === 'accepted') {
        setFollowers(prev => [...prev, { id: currentUser.id, name: currentUser.full_name, avatar_url: currentUser.avatar_url }]);
      }
    }
  };

  const handleAvatarUpload = async (file) => {
    setAvatarUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      await updateUser({ avatar_url: file_url });
      setProfileUser((u) => ({ ...u, avatar_url: file_url }));
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleSaveBio = async () => {
    await updateUser({ bio });
    setEditMode(false);
    setProfileUser((u) => ({ ...u, bio }));
  };

  const togglePrivacy = async () => {
    const newVal = !profileUser.is_private;
    await updateUser({ is_private: newVal });
    setProfileUser((u) => ({ ...u, is_private: newVal }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="px-5 pt-12">
        <p className="text-sm text-muted-foreground">{t('prof.not_found')}</p>
      </div>
    );
  }

  const canViewContent = isOwnProfile || !profileUser.is_private || followStatus === 'accepted';

  return (
    <div className="px-5 pt-12 pb-4">
      <div className="flex items-start gap-4 mb-6 animate-fade-in">
        <div className="relative">
          {profileUser.avatar_url && !avatarError ? (
            <img src={profileUser.avatar_url} alt={profileUser.full_name} className="w-20 h-20 rounded-full object-cover border-2 border-primary/30" onError={() => setAvatarError(true)} />
          ) : (
            <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center border-2 border-primary/30">
              <span className="text-2xl font-heading font-light text-primary">{(profileUser.full_name || 'U')[0].toUpperCase()}</span>
            </div>
          )}
          {isOwnProfile && (
            <>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files[0] && handleAvatarUpload(e.target.files[0])} />
              <button onClick={() => fileRef.current?.click()} className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                {avatarUploading ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} />}
              </button>
            </>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-heading font-light truncate">{profileUser.full_name}</h1>
          {isOwnProfile ? (
            editMode ? (
              <div className="mt-2 space-y-2">
                <textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder={t('prof.add_bio')} rows={2}
                  className="w-full glass-card rounded-xl px-3 py-2 bg-transparent outline-none focus:border-primary/50 border border-border/50 text-xs resize-none" />
                <button onClick={handleSaveBio} className="text-xs text-primary">{t('prof.save')}</button>
              </div>
            ) : (
              <>
                <p className="text-xs text-muted-foreground mt-1">{bio || t('prof.no_bio')}</p>
                <button onClick={() => setEditMode(true)} className="text-xs text-primary mt-1">{t('prof.edit')}</button>
              </>
            )
          ) : (
            <p className="text-xs text-muted-foreground mt-1">{profileUser.bio || t('prof.no_bio')}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-6 mb-6">
        <div className="text-center">
          <p className="text-lg font-heading font-light">{posts.length}</p>
          <p className="text-[10px] text-muted-foreground">{t('prof.posts')}</p>
        </div>
        <button onClick={() => setShowFollowers(true)} className="text-center">
          <p className="text-lg font-heading font-light">{followers.length}</p>
          <p className="text-[10px] text-muted-foreground">{t('prof.followers')}</p>
        </button>
        <button onClick={() => setShowFollowing(true)} className="text-center">
          <p className="text-lg font-heading font-light">{following.length}</p>
          <p className="text-[10px] text-muted-foreground">{t('prof.following')}</p>
        </button>
      </div>

      {isOwnProfile ? (
        <div className="space-y-2 mb-6">
          <button onClick={() => navigate('/workout-tracker')} className="w-full glass-card rounded-2xl p-4 flex items-center gap-3">
            <Dumbbell size={18} className="text-primary" />
            <span className="text-sm font-medium">Workout Tracker</span>
          </button>
          <button onClick={() => setShowSettings(true)} className="w-full glass-card rounded-2xl p-4 flex items-center gap-3">
            <Settings size={18} className="text-primary" />
            <span className="text-sm font-medium">{t('settings.title')}</span>
          </button>
          <button onClick={togglePrivacy} className="w-full glass-card rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {profileUser.is_private ? <Lock size={18} className="text-primary" /> : <Globe size={18} className="text-primary" />}
              <div className="text-left">
                <p className="text-sm font-medium">{profileUser.is_private ? t('prof.private') : t('prof.public')}</p>
                <p className="text-xs text-muted-foreground">{profileUser.is_private ? t('prof.private_desc') : t('prof.public_desc')}</p>
              </div>
            </div>
            <div className={`w-10 h-6 rounded-full transition-colors ${profileUser.is_private ? 'bg-primary' : 'bg-border'}`}>
              <div className={`w-5 h-5 rounded-full bg-background mt-0.5 transition-transform ${profileUser.is_private ? 'translate-x-4' : 'translate-x-0.5'}`} />
            </div>
          </button>
          {currentUser?.role === 'admin' && (
            <button onClick={() => navigate('/admin')} className="w-full glass-card rounded-2xl p-4 flex items-center gap-3">
              <Settings size={18} className="text-primary" />
              <span className="text-sm font-medium">{t('prof.admin_panel')}</span>
            </button>
          )}
        </div>
      ) : (
        <button
          onClick={handleFollow}
          className={`w-full rounded-2xl py-3 text-sm font-medium mb-6 transition-all ${followStatus === 'accepted' ? 'glass-card text-foreground' : followStatus === 'pending' ? 'glass-card text-muted-foreground' : 'bg-primary text-primary-foreground glow-gold'}`}
        >
          {followStatus === 'accepted' ? t('prof.following_btn') : followStatus === 'pending' ? t('prof.requested') : profileUser.is_private ? t('prof.request_follow') : t('prof.follow')}
        </button>
      )}

      <div>
        <h2 className="text-sm font-medium text-muted-foreground tracking-wide mb-3">{t('prof.posts_header')}</h2>
        {canViewContent ? (
          posts.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">{t('prof.no_posts')}</p>
          ) : (
            <div className="grid grid-cols-3 gap-1.5">
              {posts.map((p) => (
                <div key={p.id} className="aspect-square rounded-lg overflow-hidden bg-secondary">
                  {p.photo_url ? (
                    <img src={p.photo_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center p-2">
                      <p className="text-[10px] text-muted-foreground text-center line-clamp-3">{p.content}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )
        ) : (
          <div className="glass-card rounded-2xl p-8 text-center">
            <Lock size={24} className="text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">{t('prof.private_account')}</p>
            <p className="text-xs text-muted-foreground mt-1">{t('prof.follow_see')}</p>
          </div>
        )}
      </div>

      <SettingsSheet open={showSettings} onOpenChange={setShowSettings} onNavigate={navigate} />
      <FollowListSheet open={showFollowers} onOpenChange={setShowFollowers} title={t('prof.followers')} users={followers} />
      <FollowListSheet open={showFollowing} onOpenChange={setShowFollowing} title={t('prof.following')} users={following} />
    </div>
  );
}