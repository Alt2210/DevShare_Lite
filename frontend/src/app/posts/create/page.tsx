// src/app/posts/create/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';

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
      <form onSubmit={handleSubmit} className="space-y-6 bg-dark-card p-6 rounded-lg">
        {error && <p className="text-red-400">{error}</p>}
        
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-slate-300 mb-1">Tiêu đề</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full bg-dark-bg p-3 border border-slate-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        <div>
          <label htmlFor="content" className="block text-sm font-medium text-slate-300 mb-1">Nội dung (hỗ trợ Markdown)</label>
          <textarea
            id="content"
            rows={10}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            className="w-full bg-dark-bg p-3 border border-slate-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-accent"
          ></textarea>
        </div>
        
        <div>
          <label htmlFor="tags" className="block text-sm font-medium text-slate-300 mb-1">Tags (cách nhau bởi dấu phẩy)</label>
          <input
            type="text"
            id="tags"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="w-full bg-dark-bg p-3 border border-slate-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Trạng thái</label>
          <select 
            value={status} 
            onChange={(e) => setStatus(Number(e.target.value))}
            className="w-full bg-dark-bg p-3 border border-slate-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value={1}>Công khai (Published)</option>
            <option value={0}>Bản nháp (Draft)</option>
          </select>
        </div>

        <div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-accent hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent disabled:bg-slate-600"
          >
            {isSubmitting ? 'Đang đăng...' : 'Đăng bài'}
          </button>
        </div>
      </form>
    </div>
  );
}