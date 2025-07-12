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
    // Tái sử dụng lớp .loading-text
    return <p className="loading-text">Đang tải...</p>;
  }

  if (error) {
    // Tái sử dụng lớp .error-message
    return <p className="error-message">{error}</p>;
  }

  return (
    <div className="container">
      {/* TÁI SỬ DỤNG: Lớp .page-title đã có cho tiêu đề trang */}
      <h1 className="page-title">Bài viết Thịnh hành</h1>
      
      {posts.length > 0 ? (
        <div className="trending-posts-list">
          {posts.map((post, index) => (
            <div key={post.id} className="trending-post-card">
              <div className="trending-post-rank">
                {index + 1}
              </div>
              <div className="trending-post-content">
                <Link href={`/posts/${post.id}`}>
                  <h2 className="trending-post-title">{post.title}</h2>
                </Link>
                <p className="trending-post-author">
                  bởi {post.user.name}
                </p>
                {/* TÁI SỬ DỤNG: Các lớp .post-tags-container và .post-tag đã có */}
                <div className="post-tags-container trending-post-tags">
                  {post.tags.map((tag: Tag) => (
                    <span key={tag.id} className="post-tag">
                      #{tag.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="loading-text">Chưa có bài viết nào thịnh hành.</p>
      )}
    </div>
  );
}