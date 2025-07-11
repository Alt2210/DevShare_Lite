// src/app/search/page.tsx
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import api from '@/lib/api';
import { Post } from '@/types';
import Link from 'next/link';

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q');

  const [posts, setPosts] = useState<Post[]>([]);
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
        setPosts(response.data.data);
      } catch (err) {
        setError('Không thể thực hiện tìm kiếm.');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query]);

  if (loading) return <p className="text-center mt-8">Đang tìm kiếm...</p>;
  if (error) return <p className="text-center mt-8 text-red-500">{error}</p>;

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">
        Kết quả tìm kiếm cho: "{query}"
      </h1>
      <div className="space-y-4">
        {posts.length > 0 ? (
          posts.map((post) => (
            <Link key={post.id} href={`/posts/${post.id}`} className="block p-4 bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
              <h2 className="text-xl font-semibold">{post.title}</h2>
              <p className="text-gray-600">bởi {post.user.name}</p>
            </Link>
          ))
        ) : (
          <p>Không tìm thấy bài viết nào phù hợp.</p>
        )}
      </div>
    </div>
  );
}

// Bọc component trong Suspense để sử dụng useSearchParams
export default function SearchPage() {
  return (
    <Suspense>
      <SearchResults />
    </Suspense>
  );
}