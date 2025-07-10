// src/app/posts/[id]/edit/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { Post } from '@/types';

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
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Form giống hệt trang Create Post */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">Tiêu đề</label>
          <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"/>
        </div>
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700">Nội dung (hỗ trợ Markdown)</label>
          <textarea id="content" rows={10} value={content} onChange={(e) => setContent(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"></textarea>
        </div>
        <div>
          <label htmlFor="tags" className="block text-sm font-medium text-gray-700">Tags (cách nhau bởi dấu phẩy)</label>
          <input type="text" id="tags" value={tags} onChange={(e) => setTags(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"/>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Trạng thái</label>
          <select value={status} onChange={(e) => setStatus(Number(e.target.value))} className="mt-1 block w-full pl-3 pr-10 py-2 rounded-md">
            <option value={1}>Công khai (Published)</option>
            <option value={0}>Bản nháp (Draft)</option>
          </select>
        </div>
        <div>
          <button type="submit" disabled={isSubmitting} className="w-full flex justify-center py-2 px-4 border rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400">
            {isSubmitting ? 'Đang cập nhật...' : 'Cập nhật bài viết'}
          </button>
        </div>
      </form>
    </div>
  );
}