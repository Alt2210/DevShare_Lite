// src/components/CommentForm.tsx
'use client';

import { useState } from 'react';
import api from '@/lib/api';
import { Comment } from '@/types';

interface CommentFormProps {
  postId: number;
  parentId?: number;
  onCommentAdded: (comment: Comment) => void;
}

export default function CommentForm({ postId, parentId, onCommentAdded }: CommentFormProps) {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    
    setIsSubmitting(true);
    const url = parentId ? `/comments/${parentId}/replies` : `/posts/${postId}/comments`;
    
    try {
      const response = await api.post(url, { content });
      onCommentAdded(response.data);
      setContent('');
    } catch (err) {
      console.error(err);
      alert('Không thể gửi bình luận.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4">
      <textarea
        rows={3}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Viết bình luận của bạn..."
        required
        // Style cho dark mode
        className="w-full p-3 bg-dark-card border border-slate-700 rounded-md text-slate-300 focus:outline-none focus:ring-2 focus:ring-accent"
      />
      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-2 px-4 py-2 bg-accent text-white font-semibold rounded-md hover:opacity-90 disabled:bg-slate-600"
      >
        {isSubmitting ? 'Đang gửi...' : 'Gửi'}
      </button>
    </form>
  );
}