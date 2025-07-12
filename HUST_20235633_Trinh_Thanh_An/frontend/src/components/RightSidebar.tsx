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
      } finally {
        setLoading(false);
      }
    };

    fetchPopularSkaters();
  }, []);

  return (
    <aside className="right-sidebar">
      <div>
        <h3 className="sidebar-section-title">Popular Skaters</h3>
        {loading ? (
          <p className="loading-text">Đang tải...</p>
        ) : (
          <div className="popular-skaters-grid">
            {popularSkaters.map((skater) => (
              <Link href={`/profile/${skater.username}`} key={skater.id} className="skater-link">
                <div className="skater-avatar">
                  {skater.name.charAt(0)}
                </div>
                <span className="skater-name">{skater.name}</span>
              </Link>
            ))}
          </div>
        )}
      </div>

      <PopularPosts />

    </aside>
  );
}