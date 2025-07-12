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
    return <p className="status-message">Loading series...</p>;
  }

  if (error) {
    return <p className="status-message status-message--error">{error}</p>;
  }

  return (
    <div className="container">
      <h1 className="page-title">Discover Series</h1>
      
      {seriesList.length > 0 ? (
        <div className="series-list">
          {seriesList.map((series) => (
            <div key={series.id} className="card">
              <Link href={`/series/${series.slug}`} className="link">
                <h2 className="post-card-title">{series.title}</h2>
              </Link>
              <p className="post-meta">
                by {series.user.name} • {series.posts_count} posts
              </p>
              {series.description && (
                <p className="series-description">{series.description}</p>
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