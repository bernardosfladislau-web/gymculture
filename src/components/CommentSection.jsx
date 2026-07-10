import { useState, useEffect } from 'react';
import { Send } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { getRelativeTime } from '@/lib/relativeTime';

export default function CommentSection({ postId, currentUserId, currentUser }) {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.Comment.filter({ post_id: postId }, 'created_date')
      .then(setComments)
      .finally(() => setLoading(false));
  }, [postId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    const comment = await base44.entities.Comment.create({
      post_id: postId,
      content: text.trim(),
      author_name: currentUser?.full_name,
      author_avatar_url: currentUser?.avatar_url,
    });
    setComments((c) => [...c, comment]);
    setText('');
    await base44.entities.CommunityPost.update(postId, { comment_count: (comments.length + 1) });
  };

  const handleDelete = async (comment) => {
    await base44.entities.Comment.delete(comment.id);
    setComments((c) => c.filter((cm) => cm.id !== comment.id));
    await base44.entities.CommunityPost.update(postId, { comment_count: comments.length - 1 });
  };

  if (loading) return <p className="text-xs text-muted-foreground px-4 py-2">Loading...</p>;

  return (
    <div className="px-4 pb-4 space-y-3">
      {comments.map((c) => (
        <div key={c.id} className="flex items-start gap-2">
          <img
            src={c.author_avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(c.author_name || 'U')}&background=3D1F6E&color=E8E0F5&size=64`}
            alt={c.author_name}
            className="w-7 h-7 rounded-full object-cover flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <div className="glass-card rounded-xl px-3 py-2">
              <span className="text-xs font-medium mr-2">{c.author_name || 'Unknown'}</span>
              <span className="text-xs text-foreground/90">{c.content}</span>
            </div>
            <span className="text-[10px] text-muted-foreground ml-2 mt-0.5 inline-block">{getRelativeTime(c.created_date)}</span>
            {c.created_by_id === currentUserId && (
              <button onClick={() => handleDelete(c)} className="text-[10px] text-muted-foreground hover:text-destructive ml-2 mt-0.5">
                Delete
              </button>
            )}
          </div>
        </div>
      ))}
      {comments.length === 0 && <p className="text-xs text-muted-foreground">No comments yet.</p>}
      <form onSubmit={handleSubmit} className="flex items-center gap-2 pt-1">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add a comment..."
          className="flex-1 glass-card rounded-full px-4 py-2 text-sm bg-transparent border border-border/50 focus:border-primary/50 outline-none"
        />
        <button type="submit" className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center active:scale-95 transition-transform">
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}