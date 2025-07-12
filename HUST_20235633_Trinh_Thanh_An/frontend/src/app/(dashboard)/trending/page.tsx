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
        setError('Could not load trending posts.');
        console.error(err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <p className="loading-text">Loading...</p>;
  }

  if (error) {
    return <p className="error-message">{error}</p>;
  }

  return (
    <div className="container">
      {}
      <h1 className="page-title">Treding Post</h1>
      
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
                {}
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
        <p className="loading-text">No post.</p>
      )}
    </div>
  );
}