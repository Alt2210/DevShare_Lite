// frontend/src/components/PopularPosts.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Heart, Bookmark } from 'lucide-react';
import api from '@/lib/api';
import { formatNumber } from '@/lib/utils';

// Sửa lại interface, bỏ slug
interface PopularPost {
  id: number;
  title: string;
  likes_count: number;
  saves_count: number;
}

export default function PopularPosts() {
  const [posts, setPosts] = useState<PopularPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPopularPosts = async () => {
      try {
        const response = await api.get('/posts/popular');
        setPosts(response.data);
      } catch (error) {
        console.error("Failed to fetch popular posts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPopularPosts();
  }, []);

  return (
    <div>
      <h3 className="font-bold text-white mb-4">Popular Posts</h3>
      {loading ? (
        <p className="text-slate-400">Đang tải...</p>
      ) : (
        <ul className="space-y-3">
          {posts.map((post) => (
            <li key={post.id}>
              {/* Sửa href từ post.slug thành post.id */}
              <Link href={`/posts/${post.id}`} className="text-slate-300 hover:text-white transition-colors block">
                {post.title}
              </Link>
              <div className="flex items-center space-x-4 mt-1 text-xs text-slate-400">
                <div className="flex items-center space-x-1">
                  <Heart className="w-3.5 h-3.5" />
                  <span>{formatNumber(post.likes_count)}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>{formatNumber(post.saves_count)}</span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}