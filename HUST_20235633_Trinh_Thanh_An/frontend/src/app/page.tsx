'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Post, Tag } from '@/types';
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
        setError('Could not load posts.');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  if (loading) return <p className="loading-text">Loading...</p>;
  if (error) return <p className="error-message">{error}</p>;

  return (
    <div className="container">
      <header className="home-header">
        <h1 className="home-title">
          Welcome to DevShare Lite
        </h1>
        <p className="home-subtitle">
          A place to share knowledge and experience for the developer community.
        </p>
      </header>
      
      <div className="posts-list-container">
        {posts.map((post) => {
          const snippet = post.content.substring(0, 200) + (post.content.length > 200 ? '...' : '');

          return (
            <div key={post.id} className="feed-post-card">
              <div className="post-header">
                <Link href={`/profile/${post.user.username}`}>
                  <div className="post-avatar">
                    {post.user.name.charAt(0)}
                  </div>
                </Link>
                <div>
                  <Link href={`/profile/${post.user.username}`}>
                    <p className="post-author-name">{post.user.name}</p>
                  </Link>
                  <p className="post-author-username">@{post.user.username}</p>
                </div>
              </div>

              <div className="post-content-wrapper">
                <Link href={`/posts/${post.id}`} >
                  <h2 className="post-title">
                    {post.title}
                  </h2>
                </Link>
                <p className="post-snippet">
                  {snippet}
                </p>

                <div className="post-tags-container">
                  {post.tags.map((tag: Tag) => (
                    <span key={tag.id} className="post-tag">
                      #{tag.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}