// src/app/profile/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { Post } from '@/types';
import Link from 'next/link';
import '../../styles/web.css';

interface ProfileData {
  user: {
    id: number;
    name: string;
    username: string;
    email: string;
  };
  published_posts: {
    data: Post[];
  };
  draft_posts: {
    data: Post[];
  };
}

export default function Profile() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      const fetchProfile = async () => {
        try {
          const response = await api.get('/profile');
          setProfileData(response.data);
        } catch (err: unknown) {
          setError('Không thể tải thông tin trang cá nhân.');
        } finally {
          setLoading(false);
        }
      };
      fetchProfile();
    }
  }, [user]);

  // Hàm xử lý việc xóa bài viết
  const handleDelete = async (postId: number) => {
    // Luôn hỏi xác nhận trước khi xóa
    if (!window.confirm('Bạn có chắc chắn muốn xóa bài viết này không?')) {
      return;
    }

    try {
      await api.delete(`/posts/${postId}`);
      // Cập nhật lại state để xóa bài viết khỏi giao diện ngay lập tức
      setProfileData((prevData) => {
        if (!prevData) return null;
        return {
          ...prevData,
          published_posts: {
            ...prevData.published_posts,
            data: prevData.published_posts.data.filter(p => p.id !== postId),
          },
          draft_posts: {
            ...prevData.draft_posts,
            data: prevData.draft_posts.data.filter(p => p.id !== postId),
          },
        };
      });
    } catch (err: unknown) {
      alert('Xóa bài viết thất bại.');
    }
  };

  if (authLoading || loading) {
    return <p className="text-center mt-8">Đang tải trang cá nhân...</p>;
  }
  if (error) {
    return <p className="text-center mt-8 text-red-500">{error}</p>;
  }
  if (!profileData) return null;

  // Component PostItem để tái sử dụng
  const PostItem = ({ post }: { post: Post }) => (
    <div className="card flex justify-between items-center hover:shadow-lg transition-shadow">
      <Link href={`/posts/${post.id}`} className="font-semibold hover:text-blue-600">
        {post.title}
      </Link>
      <div className="space-x-2">
        <Link href={`/posts/${post.id}/edit`} className="btn-link text-sm">Sửa</Link>
        <button onClick={() => handleDelete(post.id)} className="btn-link text-sm text-red-500 hover:text-red-600">
          Xóa
        </button>
      </div>
    </div>
  );

  return (
    <div className="container">
      <div className="card mb-8">
        <h1 className="text-3xl font-bold">{profileData.user.name}</h1>
        <p className="text-lg text-gray-600">@{profileData.user.username}</p>
        <p className="text-gray-500">{profileData.user.email}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-2xl font-bold mb-4">Bài viết đã đăng</h2>
          <div className="space-y-4">
            {profileData.published_posts.data.length > 0 ? (
              profileData.published_posts.data.map((post) => <PostItem key={post.id} post={post} />)
            ) : (
              <p>Chưa có bài viết nào được đăng.</p>
            )}
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-4">Bài viết nháp</h2>
          <div className="space-y-4">
            {profileData.draft_posts.data.length > 0 ? (
              profileData.draft_posts.data.map((post) => <PostItem key={post.id} post={post} />)
            ) : (
              <p>Không có bài viết nháp nào.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}