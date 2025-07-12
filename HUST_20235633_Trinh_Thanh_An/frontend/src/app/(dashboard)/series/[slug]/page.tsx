'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import api from '@/lib/api';
import { Series } from '@/types';
import PostCard from '@/components/PostCard'; 

export default function SeriesDetailPage() {
  const [series, setSeries] = useState<Series | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const params = useParams();
  const { slug } = params;

  useEffect(() => {
    if (typeof slug === 'string') {
      api.get(`/series/${slug}`)
        .then(response => {
          setSeries(response.data);
        })
        .catch(err => {
          setError('Could not load series details.');
          console.error(err);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [slug]);

  if (loading) {
    return <p className="status-message">Loading details...</p>;
  }

  if (error) {
    return <p className="status-message status-message--error">{error}</p>;
  }

  if (!series) {
    return null; 
  }

  return (
    <div className="container">
      <header className="page-header">
        <p className="page-subtitle">Series</p>
        <h1 className="series-page-title">{series.title}</h1>
        {series.description && (
          <p className="series-page-description">
            {series.description}
          </p>
        )}
      </header>

      {series.posts && series.posts.length > 0 ? (
        <div className="posts-list">
          {series.posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <p className="text-slate-400 text-center py-8">There is no published post in this series</p>
      )}
    </div>
  );
}