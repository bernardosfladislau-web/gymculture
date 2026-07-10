import { useState } from 'react';
import { Heart, MessageCircle, Share2, Trash2, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';

export default function PostCard({ post, currentUserId, onDelete }) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.like_count || 0);
  const [showComments, setShowComments] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  const handleLike = async () => {
    if (!currentUserId) return;
    if (liked) {
      const existing = await base44.entities.Like.filter({ post_id: post.id, created_by_id: currentUserId });
      if (existing[0]) await base44.entities.Like.delete(existing[0].id);
      setLiked(false);
      setLikeCount((c) => c - 1);
      await base44.entities.CommunityPost.update(post.id, { like_count: likeCount - 1 });
    } else {
      await base44.entities.Like.create({ post_id: post.id });
      setLiked(true);
      setLikeCount((c) => c + 1);
      await base44.entities.CommunityPost.update(post.id, { like_count: likeCount + 1 });
    }
  };

  const handleDelete = async () => {
    if (onDelete) await onDelete(post);
  };

  return (
    <div className="glass-card rounded-2xl overflow-hidden animate-fade-in">
      <div className="flex items-center gap-3 p-4">
        {post.author_avatar_url && !avatarError ? (
          <img
            src={post.author_avatar_url}
            alt={post.author_name}
            className="w-9 h-9 rounded-full object-cover"
            onError={() => setAvatarError(true)}
          />
        ) : (
          <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center">
            <User size={16} className="text-muted-foreground" />
          </div>
        )}
        <span className="text-sm font-medium">{post.author_name || 'Unknown'}</span>
        {post.created_by_id === currentUserId && onDelete && (
          <button onClick={handleDelete} className="ml-auto text-muted-foreground hover:text-destructive transition-colors p-1">
            <Trash2 size={16} />
          </button>
        )}
      </div>

      {post.post_type !== 'text' && post.photo_url && !imgError && (
        <img src={post.photo_url} alt="post" className="w-full aspect-square object-cover" onError={() => setImgError(true)} />
      )}

      <div className="p-4">
        {post.content && <p className="text-sm text-foreground/90 mb-3 whitespace-pre-wrap">{post.content}</p>}
        <div className="flex items-center gap-5">
          <button onClick={handleLike} className="flex items-center gap-1.5 text-sm transition-colors">
            <Heart size={20} className={liked ? 'fill-destructive text-destructive' : 'text-muted-foreground'} />
            <span className="text-muted-foreground">{likeCount}</span>
          </button>
          <button onClick={() => setShowComments(!showComments)} className="flex items-center gap-1.5 text-sm">
            <MessageCircle size={20} className="text-muted-foreground" />
            <span className="text-muted-foreground">{post.comment_count || 0}</span>
          </button>
          <button className="ml-auto">
            <Share2 size={18} className="text-muted-foreground" />
          </button>
        </div>
      </div>
    </div>
  );
}