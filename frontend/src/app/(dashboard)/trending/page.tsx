'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Post, Tag } from '@/types';
import Link from 'next/link';

export default function TrendingPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/trending')
      .then(response => {
        setPosts(response.data.data);
      })
      .catch(err => {
        setError('Không thể tải danh sách bài viết thịnh hành.');
        console.error(err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <p className="text-center mt-12">Đang tải...</p>;
  }

  if (error) {
    return <p className="text-center mt-12 text-red-500">{error}</p>;
  }

  return (
    <div className="container">
      <h1 className="text-3xl font-bold text-white mb-6">Bài viết Thịnh hành</h1>
      
      {posts.length > 0 ? (
        <div className="space-y-6">
          {posts.map((post, index) => (
            <div key={post.id} className="card flex items-start space-x-4">
              <div className="text-2xl font-bold text-slate-500">
                {index + 1}
              </div>
              <div className="flex-1">
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
            </div>
          ))}
        </div>
      ) : (
        <p className="text-slate-400">Chưa có bài viết nào thịnh hành.</p>
      )}
    </div>
  );
}