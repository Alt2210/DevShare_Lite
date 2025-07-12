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

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      api.get('/bookmarks')
        .then(response => {
          setPosts(response.data.data);
        })
        .catch(err => {
          setError('Can not load bookmarked posts.');
          console.error(err);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [user]);

  if (loading || authLoading) {
    return <p className="status-message">Loading...</p>;
  }

  if (error) {
    return <p className="status-message status-message--error">{error}</p>;
  }

  return (
    <div className="container">
      <h1 className="page-title">Bookmarks</h1>
      
      {posts.length > 0 ? (
        <div className="posts-list">
          {posts.map((post) => (
            <div key={post.id} className="card">
              <Link href={`/posts/${post.id}`}>
                <h2 className="post-card-title">{post.title}</h2>
              </Link>
              <p className="post-meta">
                by {post.user.name}
              </p>
              <div className="tags-container">
                {post.tags.map((tag: Tag) => (
                  <span key={tag.id} className="tag-badge">
                    #{tag.name}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-slate-400">You have not saved a post</p>
      )}
    </div>
  );
}