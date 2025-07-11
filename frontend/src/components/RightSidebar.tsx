// frontend/src/components/RightSidebar.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { User } from '@/types';
import PopularPosts from './PopularPosts';

export default function RightSidebar() {
  const [popularSkaters, setPopularSkaters] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPopularSkaters = async () => {
      try {
        const response = await api.get('/popular-skaters');
        setPopularSkaters(response.data);
      } catch (error) {
        console.error("Failed to fetch popular skaters:", error);
        // Có thể set một giá trị mặc định hoặc hiển thị lỗi
      } finally {
        setLoading(false);
      }
    };

    fetchPopularSkaters();
  }, []);

  return (
    <aside className="w-80 bg-dark-nav p-6 hidden lg:flex flex-col space-y-8">
      {/* Popular Skaters Section */}
      <div>
        <h3 className="font-bold text-white mb-4">Popular Skaters</h3>
        {loading ? (
          <p className="text-slate-400">Đang tải...</p>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            {popularSkaters.map((skater) => (
              <Link href={`/profile/${skater.username}`} key={skater.id} className="flex flex-col items-center space-y-2 group">
                <div className="w-16 h-16 bg-dark-card rounded-full flex items-center justify-center font-bold text-lg text-white group-hover:ring-2 group-hover:ring-accent transition-all">
                  {skater.name.charAt(0)}
                </div>
                <span className="text-sm text-slate-300 group-hover:text-white transition-colors">{skater.name}</span>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Popular Searches Section */}
      <PopularPosts />

    </aside>
  );
}