// src/app/posts/create/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import '../../styles/web.css';

export default function CreatePost() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [status, setStatus] = useState(1);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    const tagsArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag);

    try {
      const response = await api.post('/posts', {
        title,
        content,
        status,
        tags: tagsArray,
      });
      router.push(`/posts/${response.data.id}`);
    } catch (err) {
      setError('Tạo bài viết thất bại. Vui lòng thử lại.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || !user) {
    return <p className="text-center">Đang chuyển hướng...</p>;
  }
  
  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-6">Tạo bài viết mới</h1>
      <form onSubmit={handleSubmit} className="space-y-6 card">
        {error && <p className="form-error-message">{error}</p>}
        
        <div className="form-group">
          <label htmlFor="title" className="form-label">Tiêu đề</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label htmlFor="content" className="form-label">Nội dung (hỗ trợ Markdown)</label>
          <textarea
            id="content"
            rows={10}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            className="form-textarea"
          ></textarea>
        </div>
        
        <div className="form-group">
          <label htmlFor="tags" className="form-label">Tags (cách nhau bởi dấu phẩy)</label>
          <input
            type="text"
            id="tags"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Trạng thái</label>
          <select 
            value={status} 
            onChange={(e) => setStatus(Number(e.target.value))}
            className="form-select"
          >
            <option value={1}>Công khai (Published)</option>
            <option value={0}>Bản nháp (Draft)</option>
          </select>
        </div>

        <div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-primary w-full"
          >
            {isSubmitting ? 'Đang đăng...' : 'Đăng bài'}
          </button>
        </div>
      </form>
    </div>
  );
}