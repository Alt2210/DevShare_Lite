'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Series, User } from '@/types';
import Link from 'next/link';
interface SeriesWithUser extends Series {
  user: User;
  posts_count: number;
}

export default function AllSeriesPage() {
  const [seriesList, setSeriesList] = useState<SeriesWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/series')
      .then(response => {
        setSeriesList(response.data.data); 
      })
      .catch(err => {
        setError('Can not load series list.');
        console.error(err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <p className="text-center mt-12">Loading series...</p>;
  }

  if (error) {
    return <p className="text-center mt-12 text-red-500">{error}</p>;
  }

  return (
    <div className="container">
      <h1 className="text-3xl font-bold text-white mb-6">Discover Series</h1>
      
      {seriesList.length > 0 ? (
        <div className="space-y-6">
          {seriesList.map((series) => (
            <div key={series.id} className="bg-dark-card p-6 rounded-lg shadow-lg">
              <Link href={`/series/${series.slug}`} className="hover:underline">
                <h2 className="text-xl font-bold text-white">{series.title}</h2>
              </Link>
              <p className="text-sm text-slate-400 mt-1">
                by {series.user.name} • {series.posts_count} posts
              </p>
              {series.description && (
                <p className="text-slate-300 mt-2 text-sm">{series.description}</p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-slate-400">No series made</p>
      )}
    </div>
  );
}