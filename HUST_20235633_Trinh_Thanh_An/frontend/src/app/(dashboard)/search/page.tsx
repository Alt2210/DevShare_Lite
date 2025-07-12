'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import api from '@/lib/api';
import { Post, User } from '@/types';
import Link from 'next/link';

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q');

  const [posts, setPosts] = useState<Post[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!query) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const fetchResults = async () => {
      try {
        const response = await api.get(`/search`, { params: { q: query } });
        setPosts(response.data.posts.data);
        setUsers(response.data.users.data);
      } catch (err) {
        setError('Can not load search results.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query]);

  if (loading) return <p className="status-message">Searching...</p>;
  if (error) return <p className="status-message status-message--error">{error}</p>;

  return (
    <div className="container">
      <h1 className="page-title">
        Results for: "{query}"
      </h1>
      
      {posts.length === 0 && users.length === 0 ? (
        <p className="text-slate-400">Can not find suitable result</p>
      ) : (
        <div className="space-y-10">
          {users.length > 0 && (
            <section>
              <h2 className="section-title">Users</h2>
              <div className="search-results-grid">
                {users.map((user) => (
                  <Link key={user.id} href={`/profile/${user.username}`} className="card card-hover user-info">
                    <div className="user-avatar">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <p className="user-name">{user.name}</p>
                      <p className="user-username">@{user.username}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {posts.length > 0 && (
            <section>
              <h2 className="section-title">Post</h2>
              <div className="search-results-list">
                {posts.map((post) => (
                  <Link key={post.id} href={`/posts/${post.id}`} className="card card-hover block">
                    <h3 className="post-card-title">{post.title}</h3>
                    <p className="post-meta">by {post.user.name}</p>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense>
      <SearchResults />
    </Suspense>
  );
}