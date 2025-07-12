'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Post, Tag, Comment as CommentType } from '@/types';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '@/context/AuthContext';
import CommentForm from '@/components/CommentForm';
import Link from 'next/link';
import { Heart, Bookmark, Pencil } from 'lucide-react';

function CommentItem({ comment, postId, onCommentUpdated }: { comment: CommentType, postId: number, onCommentUpdated: (updatedComment: CommentType) => void }) {
  const { user } = useAuth();
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replies, setReplies] = useState(comment.replies || []);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(comment.content);

  const handleReplyAdded = (newReply: CommentType) => {
    setReplies([...replies, newReply]);
    setShowReplyForm(false);
  };

  const handleUpdateComment = async () => {
    if (!editedContent.trim()) return;
    try {
      const response = await api.put(`/comments/${comment.id}`, { content: editedContent });
      onCommentUpdated(response.data);
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update comment", error);
      alert('Failed to update comment. Please try again.');
    }
  };

  return (
    <div className="comment-item">
      <div className="card">
        <div className="user-info">
          <div className="user-avatar">{comment.user.name.charAt(0)}</div>
          <p className="user-name">{comment.user.name}</p>
        </div>

        {isEditing ? (
          <div className="comment-edit-form">
            <textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className="comment-edit-textarea"
              rows={3}
            />
            <div className="comment-edit-actions">
              <button onClick={() => setIsEditing(false)} className="btn btn-secondary">Cancel</button>
              <button onClick={handleUpdateComment} className="btn btn-primary">Save</button>
            </div>
          </div>
        ) : (
          <div className="comment-content">
            <ReactMarkdown>{comment.content}</ReactMarkdown>
          </div>
        )}
        
        <div className="comment-actions">
          {user && (
            <button onClick={() => setShowReplyForm(!showReplyForm)} className="comment-action-btn text-accent">
              {showReplyForm ? 'Cancel' : 'Reply'}
            </button>
          )}
          {user && user.id === comment.user_id && !isEditing && (
            <button onClick={() => setIsEditing(true)} className="comment-action-btn text-slate-400 hover:text-white">
              Edit
            </button>
          )}
        </div>
      </div>
      {showReplyForm && (
        <div className="pl-12 mt-2">
          <CommentForm postId={postId} parentId={comment.id} onCommentAdded={handleReplyAdded} />
        </div>
      )}
      {replies?.length > 0 && (
        <div className="comment-replies">
          {replies.map(reply => (
            <CommentItem key={reply.id} comment={reply} postId={postId} onCommentUpdated={onCommentUpdated} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function PostDetail() {
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const params = useParams();
  const { id } = params;
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!id) return;
    const fetchPost = async () => {
      try {
        const response = await api.get(`/posts/${id}`);
        setPost(response.data);
        setLikeCount(response.data.likes_count || 0);
        setIsLiked(response.data.is_liked_by_user || false);
        setIsSaved(response.data.is_saved_by_user || false);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [id]);

  const handleToggleLike = async () => {
    if (!user) return router.push('/login');
    if (!post) return;
    try {
      await api.post(`/posts/${post.id}/toggle-like`);
      setIsLiked(!isLiked);
      setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
    } catch (error) {
      console.error("Failed to toggle like", error);
    }
  };

  const handleToggleSave = async () => {
    if (!user) return router.push('/login');
    if (!post) return;
    try {
      const response = await api.post(`/posts/${post.id}/toggle-save`);
      setIsSaved(response.data.is_saved);
    } catch (error) {
      console.error("Failed to toggle save", error);
    }
  };

  const handleCommentAdded = (newComment: CommentType) => {
    if (post) {
      setPost({
        ...post,
        comments: [...(post.comments || []), newComment],
      });
    }
  };

  const handleCommentUpdated = (updatedComment: CommentType) => {
    if (!post) return;
    const updateRepliesRecursively = (comments: CommentType[]): CommentType[] => {
      return comments.map(comment => {
        if (comment.id === updatedComment.id) {
          return { ...comment, ...updatedComment };
        }
        if (comment.replies && comment.replies.length > 0) {
          return { ...comment, replies: updateRepliesRecursively(comment.replies) };
        }
        return comment;
      });
    };
    setPost(prevPost => {
        if (!prevPost) return null;
        return {
            ...prevPost,
            comments: updateRepliesRecursively(prevPost.comments || [])
        }
    });
  };

  if (loading) return <p className="status-message">Loading...</p>;
  if (!post) return <p className="status-message status-message--error">Can not find the post</p>;

  return (
    <div>
      <article>
        {post.series && (
          <div className="series-banner">
            <span className="text-slate-400 text-sm">A part of series: </span>
            <Link href={`/series/${post.series.slug}`} className="link text-sm">
              {post.series.title}
            </Link>
          </div>
        )}

        <div className="tags-container">
          {post.tags?.map((tag: Tag) => (
            <span key={tag.id} className="tag-badge">#{tag.name}</span>
          ))}
        </div>
        <h1 className="page-title">{post.title}</h1>
        <div className="post-meta">
          <span>Posted by{' '}<Link href={`/profile/${post.user.username}`} className="link text-white">{post.user.name}</Link></span>
        </div>
        <div className="post-content">
          <ReactMarkdown>{post.content}</ReactMarkdown>
        </div>
      </article>

      <div className="post-actions">
        <button onClick={handleToggleLike} className={`icon-button ${isLiked ? 'active-like' : ''}`}>
          <Heart />
          <span>{likeCount} Like</span>
        </button>
        <button onClick={handleToggleSave} className={`icon-button ${isSaved ? 'active-save' : ''}`}>
          <Bookmark />
          <span>{isSaved ? 'Saved' : 'Save'}</span>
        </button>
        {user && user.id === post.user.id && (
          <Link href={`/posts/${post.id}/edit`} className="icon-button">
            <Pencil />
            <span>Edit</span>
          </Link>
        )}
      </div>

      {post.series && post.series.posts?.length > 1 && (
        <aside className="mt-12 card">
          <h3 className="text-xl font-bold mb-4 text-white">Other posts in series &quot;{post.series.title}&quot;</h3>
          <ul className="space-y-3">
            {post.series.posts.map((p, index) => (
              <li key={p.id} className="flex items-start space-x-4 p-2 rounded-md transition-colors hover:bg-slate-800/50">
                <span className="text-slate-400 font-semibold pt-1">{index + 1}.</span>
                <div>
                  {p.id === post.id ? (<span className="font-bold text-white">{p.title} (This post)</span>) : (<Link href={`/posts/${p.id}`} className="font-semibold hover:text-white hover:underline text-slate-300">{p.title}</Link>)}
                </div>
              </li>
            ))}
          </ul>
        </aside>
      )}

      <section className="comments-section">
        <h2 className="section-title">Bình luận ({post.comments?.length ?? 0})</h2>
        {user ? <CommentForm postId={post.id} onCommentAdded={handleCommentAdded} /> : <p className="text-slate-400">Vui lòng <Link href="/login" className="link">đăng nhập</Link> để bình luận.</p>}
        <div className="comments-list">
          {post.comments?.map((comment) => (
            <CommentItem key={comment.id} comment={comment} postId={post.id} onCommentUpdated={handleCommentUpdated} />
          ))}
        </div>
      </section>
    </div>
  );
}