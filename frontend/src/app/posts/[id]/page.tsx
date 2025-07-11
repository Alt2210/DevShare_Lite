// src/app/posts/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter} from 'next/navigation';
import api from '@/lib/api';
import { Post, Tag, Comment as CommentType } from '@/types';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '@/context/AuthContext';
import CommentForm from '@/components/CommentForm';
import Link from 'next/link';
import { Heart, Bookmark } from 'lucide-react';


// Component để hiển thị một bình luận và các trả lời của nó
function CommentItem({ comment, postId }: { comment: CommentType, postId: number }) {
  const { user } = useAuth();
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replies, setReplies] = useState(comment.replies || []);
  

  const handleReplyAdded = (newReply: CommentType) => {
    setReplies([...replies, newReply]);
    setShowReplyForm(false);
  };
  
  return (
    <div className="pl-0">
      {/* Card cho bình luận */}
      <div className="p-4 bg-dark-card rounded-lg">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center font-bold text-white text-sm">
            {comment.user.name.charAt(0)}
          </div>
          <p className="font-semibold text-white">{comment.user.name}</p>
        </div>
        <p className="text-slate-300 whitespace-pre-wrap mt-3">{comment.content}</p>
        {user && (
          <button onClick={() => setShowReplyForm(!showReplyForm)} className="text-sm text-accent font-semibold mt-2">
            {showReplyForm ? 'Hủy' : 'Trả lời'}
          </button>
        )}
      </div>

      {showReplyForm && (
        <div className="pl-12 mt-2">
           <CommentForm postId={postId} parentId={comment.id} onCommentAdded={handleReplyAdded} />
        </div>
      )}

      {replies && replies.length > 0 && (
        <div className="pl-6 mt-4 space-y-4 border-l-2 border-slate-700">
          {replies.map(reply => (
            <CommentItem key={reply.id} comment={reply} postId={postId} />
          ))}
        </div>
      )}
    </div>
  );
}

// Component chính của trang
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
        setLikeCount(response.data.likes_count); 
        setIsLiked(response.data.is_liked_by_user); 
        setIsSaved(response.data.is_saved_by_user);
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
        comments: [...post.comments, newComment],
      });
    }
  };
  
  if (loading) return <p className="text-center mt-8">Đang tải...</p>;
  if (!post) return <p className="text-center mt-8 text-red-500">Không tìm thấy bài viết.</p>;

  return (
    <div>
      <article>
        <div className="mb-4">
          {post.tags.map((tag: Tag) => (
            <span key={tag.id} className="text-accent font-semibold text-sm mr-2">#{tag.name}</span>
          ))}
        </div>
        <h1 className="text-4xl font-extrabold text-white mb-4">{post.title}</h1>
        <div className="text-slate-400 text-sm mb-8">
          <span>Đăng bởi <strong>{post.user.name}</strong></span>
        </div>

        {/* Áp dụng prose và prose-invert để style nội dung Markdown */}
        <div className="prose prose-invert max-w-none prose-p:text-slate-300 prose-headings:text-white prose-strong:text-white prose-a:text-accent">
          <ReactMarkdown>{post.content}</ReactMarkdown>
        </div>
      </article>

      <div className="flex items-center space-x-4 mt-8">
        <button onClick={handleToggleLike} className="flex items-center space-x-2 text-slate-400 hover:text-white">
          <Heart className={isLiked ? 'text-red-500 fill-current' : ''} />
          
        </button>
        <button onClick={handleToggleSave} className="flex items-center space-x-2 text-slate-400 hover:text-white">
          <Bookmark className={isSaved ? 'text-yellow-400 fill-current' : ''} />
          
        </button>
      </div>

      <section className="mt-12">
        <h2 className="text-2xl font-bold mb-6 text-white">Bình luận ({post.comments.length})</h2>
        {user ? <CommentForm postId={post.id} onCommentAdded={handleCommentAdded} /> : <p className="text-slate-400">Vui lòng <Link href="/login" className="text-accent font-semibold">đăng nhập</Link> để bình luận.</p>}
        <div className="space-y-6 mt-8">
          {post.comments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} postId={post.id} />
          ))}
        </div>
      </section>
    </div>
  );
}