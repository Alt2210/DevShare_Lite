'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Heart, Bookmark } from 'lucide-react';
import api from '@/lib/api';
import { formatNumber } from '@/lib/utils';

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
      {}
      <h3 className="sidebar-section-title">Popular Posts</h3>
      {loading ? (
        <p className="loading-text">Loading...</p>
      ) : (
        <ul className="popular-posts-list">
          {posts.map((post) => (
            <li className="popular-post-item" key={post.id}>
              <Link href={`/posts/${post.id}`} className="popular-post-link">
                {post.title}
              </Link>
              <div className="popular-post-stats">
                <div className="post-stat">
                  <Heart className="post-stat-icon" />
                  <span>{formatNumber(post.likes_count)}</span>
                </div>
                <div className="post-stat">
                  <Bookmark className="post-stat-icon" />
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