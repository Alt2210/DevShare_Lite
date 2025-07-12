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
      alert('Failed to add comment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="comment-form">
      <textarea
        rows={3}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write your comment..."
        required
        className="comment-form-textarea"
      />
      <button
        type="submit"
        disabled={isSubmitting}
        className="btn btn-primary comment-form-submit"
      >
        {isSubmitting ? 'Sending...' : 'Send'}
      </button>
    </form>
  );
}