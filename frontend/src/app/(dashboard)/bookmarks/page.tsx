
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Post, Tag } from '@/types';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

export default function BookmarksPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  // Bảo vệ route: Nếu chưa đăng nhập, chuyển về trang login
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Lấy dữ liệu
  useEffect(() => {
    if (user) {
      api.get('/bookmarks')
        .then(response => {
          setPosts(response.data.data);
        })
        .catch(err => {
          setError('Không thể tải danh sách bài viết đã lưu.');
          console.error(err);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [user]);

  if (loading || authLoading) {
    return <p className="text-center mt-12">Đang tải...</p>;
  }

  if (error) {
    return <p className="text-center mt-12 text-red-500">{error}</p>;
  }

  return (
    <div className="container">
      <h1 className="text-3xl font-bold text-white mb-6">Bài viết đã lưu</h1>
      
      {posts.length > 0 ? (
        <div className="space-y-6">
          {posts.map((post) => (
            <div key={post.id} className="bg-dark-card p-4 rounded-lg shadow-md">
              <Link href={`/posts/${post.id}`} className="hover:underline">
                <h2 className="text-xl font-bold text-white">{post.title}</h2>
              </Link>
              <p className="text-sm text-slate-400 mt-1">
                bởi {post.user.name}
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                {post.tags.map((tag: Tag) => (
                  <span key={tag.id} className="bg-accent/10 text-accent text-xs font-medium px-2.5 py-1 rounded-full">
                    #{tag.name}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-slate-400">Bạn chưa lưu bài viết nào.</p>
      )}
    </div>
  );
}