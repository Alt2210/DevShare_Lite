'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Series } from '@/types';

interface SeriesSelectorProps {
  selectedSeriesId: number | null;
  onChange: (seriesId: number | null) => void;
}

export default function SeriesSelector({ selectedSeriesId, onChange }: SeriesSelectorProps) {
  const [seriesList, setSeriesList] = useState<Series[]>([]);
  const [showNewSeriesForm, setShowNewSeriesForm] = useState(false);
  const [newSeriesTitle, setNewSeriesTitle] = useState('');

  useEffect(() => {
    api.get('/user/series').then(res => setSeriesList(res.data));
  }, []);

  const handleCreateNewSeries = async () => {
    if (!newSeriesTitle.trim()) return;
    try {
      const response = await api.post('/series', { title: newSeriesTitle });
      const newSeries = response.data;
      setSeriesList([...seriesList, newSeries]);
      onChange(newSeries.id); // Tự động chọn series vừa tạo
      setShowNewSeriesForm(false);
      setNewSeriesTitle('');
    } catch (error) {
      console.error("Failed to create series", error);
      alert('Tạo series thất bại.');
    }
  };

  return (
    <div className="form-group">
      <label className="form-label">Series (Không bắt buộc)</label>
      <div className="flex items-center space-x-2">
        <select
          value={selectedSeriesId ?? ''}
          onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
          className="form-select flex-grow"
        >
          <option value="">-- Chọn series --</option>
          {seriesList.map(s => (
            <option key={s.id} value={s.id}>{s.title}</option>
          ))}
        </select>
        <button type="button" onClick={() => setShowNewSeriesForm(!showNewSeriesForm)} className="btn btn-secondary">
          {showNewSeriesForm ? 'Hủy' : '+ Mới'}
        </button>
      </div>

      {showNewSeriesForm && (
        <div className="mt-2 flex space-x-2">
          <input
            type="text"
            value={newSeriesTitle}
            onChange={(e) => setNewSeriesTitle(e.target.value)}
            placeholder="Tên series mới"
            className="form-input flex-grow"
          />
          <button type="button" onClick={handleCreateNewSeries} className="btn btn-primary">Tạo</button>
        </div>
      )}
    </div>
  );
}