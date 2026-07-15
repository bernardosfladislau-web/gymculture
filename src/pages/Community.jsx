import { useState, useEffect, useCallback } from 'react';
import { Plus, Loader2, X, Camera } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useLanguage } from '@/lib/LanguageContext';
import PostCard from '@/components/PostCard';
import CommentSection from '@/components/CommentSection';
import MobileHeader from '@/components/MobileHeader';
import PullToRefresh from '@/components/PullToRefresh';
import { Button } from '@/components/ui/button';

export default function Community() {
  const { t } = useLanguage();
  const { user } = useCurrentUser();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [expandedComments, setExpandedComments] = useState(null);

  const fetchPosts = useCallback(async () => {
    const data = await base44.entities.CommunityPost.list('-created_date', 50);
    setPosts(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleDelete = async (post) => {
    await base44.entities.CommunityPost.delete(post.id);
    setPosts((p) => p.filter((x) => x.id !== post.id));
  };

  return (
    <>
      <MobileHeader
        title={t('comm.title')}
        right={
          <button onClick={() => setShowCreate(true)} className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center glow-gold active:scale-95 transition-transform">
            <Plus size={20} />
          </button>
        }
      />
      <PullToRefresh onRefresh={fetchPosts}>
        <div className="px-5">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
            </div>
          ) : posts.length === 0 ? (
            <div className="glass-card rounded-2xl p-8 text-center">
              <p className="text-sm text-muted-foreground">{t('comm.no_posts')}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <div key={post.id}>
                  <PostCard post={post} currentUserId={user?.id} onDelete={post.created_by_id === user?.id ? handleDelete : undefined} />
                  {expandedComments === post.id && (
                    <div className="mt-2">
                      <CommentSection postId={post.id} currentUserId={user?.id} currentUser={user} />
                    </div>
                  )}
                  {expandedComments !== post.id && (
                    <button onClick={() => setExpandedComments(post.id)} className="text-xs text-primary px-4 pt-1">
                      {t('comm.view_comments')}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </PullToRefresh>

      {showCreate && <CreatePostModal user={user} onClose={() => setShowCreate(false)} onPosted={(p) => { setPosts((prev) => [p, ...prev]); setShowCreate(false); }} />}
    </>
  );
}

function CreatePostModal({ user, onClose, onPosted }) {
  const { t } = useLanguage();
  const [text, setText] = useState('');
  const [photoUrl, setPhotoUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [posting, setPosting] = useState(false);

  const handleUpload = async (file) => {
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setPhotoUrl(file_url);
    } finally {
      setUploading(false);
    }
  };

  const handlePost = async () => {
    if (!text.trim() && !photoUrl) return;
    setPosting(true);
    try {
      const post = await base44.entities.CommunityPost.create({
        post_type: photoUrl ? 'meal_photo' : 'text',
        content: text.trim() || undefined,
        photo_url: photoUrl || undefined,
        author_name: user?.full_name,
        author_avatar_url: user?.avatar_url,
        like_count: 0,
        comment_count: 0,
      });
      onPosted(post);
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-end sm:items-center justify-center" onClick={onClose}>
      <div className="glass-card rounded-t-3xl sm:rounded-3xl w-full max-w-md p-6 animate-fade-in" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-heading font-light">{t('comm.new_post')}</h2>
          <button onClick={onClose}><X size={20} className="text-muted-foreground" /></button>
        </div>
        <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder={t('comm.share')}
          rows={3} className="w-full glass-card rounded-2xl px-4 py-3 bg-transparent outline-none focus:border-primary/50 border border-border/50 text-sm resize-none" />
        {photoUrl && <img src={photoUrl} alt="preview" className="w-full max-h-64 object-contain rounded-2xl mt-3" />}
        <div className="flex items-center gap-3 mt-4">
          <label className="cursor-pointer">
            <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files[0] && handleUpload(e.target.files[0])} />
            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
              {uploading ? <Loader2 size={18} className="animate-spin text-primary" /> : <Camera size={18} className="text-muted-foreground" />}
            </div>
          </label>
          <Button onClick={handlePost} disabled={posting || (!text.trim() && !photoUrl)} className="flex-1 bg-primary text-primary-foreground">
            {posting ? <Loader2 size={18} className="animate-spin" /> : t('comm.post')}
          </Button>
        </div>
      </div>
    </div>
  );
}