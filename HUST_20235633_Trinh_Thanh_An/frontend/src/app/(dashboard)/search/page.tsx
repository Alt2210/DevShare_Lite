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

  if (loading) return <p className="text-center mt-8">Searching...</p>;
  if (error) return <p className="text-center mt-8 text-red-500">{error}</p>;

  return (
    <div className="container">
      <h1 className="text-3xl font-bold mb-8 text-white">
        Results for: "{query}"
      </h1>
      
      {}
      {posts.length === 0 && users.length === 0 ? (
        <p className="text-slate-400">Can not find suitable result</p>
      ) : (
        <div className="space-y-10">
          {}
          {users.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold mb-4 text-white">Users</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {users.map((user) => (
                  <Link key={user.id} href={`/profile/${user.username}`} className="card flex items-center space-x-4 hover:bg-slate-800 transition-colors">
                    <div className="w-12 h-12 bg-slate-700 rounded-full flex items-center justify-center font-bold text-white text-lg shrink-0">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-white">{user.name}</p>
                      <p className="text-sm text-slate-400">@{user.username}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {}
          {posts.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold mb-4 text-white">Post</h2>
              <div className="space-y-4">
                {posts.map((post) => (
                  <Link key={post.id} href={`/posts/${post.id}`} className="card block hover:bg-slate-800 transition-colors">
                    <h3 className="text-xl font-semibold text-white">{post.title}</h3>
                    <p className="text-gray-400 text-sm mt-1">bởi {post.user.name}</p>
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