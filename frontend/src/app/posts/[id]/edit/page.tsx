// src/app/posts/[id]/edit/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { Post } from '@/types';
import '../../styles/web.css';

export default function EditPost() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const { id } = params;

  // State cho dữ liệu bài viết
  const [post, setPost] = useState<Post | null>(null);

  // State cho form
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [status, setStatus] = useState(1);
  
  // State điều khiển
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch dữ liệu bài viết cần sửa
  useEffect(() => {
    if (!id) return;
    const fetchPost = async () => {
      try {
        const response = await api.get(`/posts/${id}`);
        const fetchedPost = response.data;
        setPost(fetchedPost);
        // Điền dữ liệu đã có vào form
        setTitle(fetchedPost.title);
        setContent(fetchedPost.content);
        setStatus(fetchedPost.status);
        setTags(fetchedPost.tags.map((tag: any) => tag.name).join(', '));
      } catch (err) {
        setError('Không tìm thấy bài viết.');
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [id]);
  
  // Kiểm tra quyền và chuyển hướng
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login');
      } else if (post && user.id !== post.user.id) {
        // Nếu user không phải tác giả, không cho phép sửa
        setError('Bạn không có quyền sửa bài viết này.');
        router.push(`/posts/${id}`);
      }
    }
  }, [user, post, authLoading, router, id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    const tagsArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag);

    try {
      await api.put(`/posts/${id}`, {
        title,
        content,
        status,
        tags: tagsArray,
      });
      router.push(`/posts/${id}`); // Chuyển về trang chi tiết sau khi sửa
    } catch (err) {
      setError('Cập nhật thất bại. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || authLoading) return <p>Đang tải...</p>;
  if (error) return <p className="text-red-500 text-center mt-8">{error}</p>;

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Sửa bài viết</h1>
      <form onSubmit={handleSubmit} className="space-y-6 card">
        <div className="form-group">
          <label htmlFor="title" className="form-label">Tiêu đề</label>
          <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} required className="form-input"/>
        </div>
        <div className="form-group">
          <label htmlFor="content" className="form-label">Nội dung (hỗ trợ Markdown)</label>
          <textarea id="content" rows={10} value={content} onChange={(e) => setContent(e.target.value)} required className="form-textarea"></textarea>
        </div>
        <div className="form-group">
          <label htmlFor="tags" className="form-label">Tags (cách nhau bởi dấu phẩy)</label>
          <input type="text" id="tags" value={tags} onChange={(e) => setTags(e.target.value)} className="form-input"/>
        </div>
        <div className="form-group">
          <label className="form-label">Trạng thái</label>
          <select value={status} onChange={(e) => setStatus(Number(e.target.value))} className="form-select">
            <option value={1}>Công khai (Published)</option>
            <option value={0}>Bản nháp (Draft)</option>
          </select>
        </div>
        <div>
          <button type="submit" disabled={isSubmitting} className="btn btn-primary w-full">
            {isSubmitting ? 'Đang cập nhật...' : 'Cập nhật bài viết'}
          </button>
        </div>
      </form>
    </div>
  );
}