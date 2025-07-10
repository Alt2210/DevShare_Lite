// src/app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Post, Tag } from '@/types'; // Import các type cần thiết
import Link from 'next/link';

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await api.get('/posts');
        setPosts(response.data.data);
      } catch (err) {
        setError('Không thể tải bài viết.');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  if (loading) return <p className="text-center mt-12">Đang tải...</p>;
  if (error) return <p className="text-center mt-12 text-red-500">{error}</p>;

  return (
    // Sử dụng max-w-5xl và mx-auto để căn giữa nội dung và giới hạn chiều rộng
    <div className="max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <header className="text-center mb-10">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
          Chào mừng đến với DevShare Lite
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-slate-600">
          Nơi chia sẻ kiến thức và kinh nghiệm cho cộng đồng lập trình viên.
        </p>
      </header>
      
      {/* Lưới hiển thị các bài viết */}
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          // Component card cho mỗi bài viết
          <Link key={post.id} href={`/posts/${post.id}`} className="block p-6 bg-white rounded-xl shadow-md ring-1 ring-slate-200 hover:shadow-xl hover:ring-slate-300 transition-all duration-300">
            <div className="flex items-center space-x-4 mb-4">
               {/* Avatar giả */}
              <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center font-bold text-slate-500">
                {post.user.name.charAt(0)}
              </div>
              <div>
                <p className="font-semibold text-slate-800">{post.user.name}</p>
                <p className="text-sm text-slate-500">@{post.user.username}</p>
              </div>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">{post.title}</h2>
            
            {/* Hiển thị tags */}
            <div className="flex flex-wrap gap-2 mt-4">
              {post.tags.map((tag: Tag) => (
                <span key={tag.id} className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-1 rounded-full">
                  #{tag.name}
                </span>
              ))}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}