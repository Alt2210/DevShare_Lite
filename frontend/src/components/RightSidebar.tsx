// src/components/RightSidebar.tsx
'use client';

import PopularSearches from './PopularSearches';

// Dữ liệu giả
const popularSkaters = [
  { name: 'Wijoyo', avatar: 'W' },
  { name: 'Thomas', avatar: 'T' },
  { name: 'Johny', avatar: 'J' },
  { name: 'Andy', avatar: 'A' },
  { name: 'Budi', avatar: 'B' },
  { name: 'Tony', avatar: 'T' },
];

export default function RightSidebar() {
  return (
    <aside className="w-80 bg-dark-nav p-6 hidden lg:flex flex-col space-y-8">
      {/* Popular Skaters Section */}
      <div>
        <h3 className="font-bold text-white mb-4">Popular Skaters</h3>
        <div className="grid grid-cols-3 gap-4">
          {popularSkaters.map((skater) => (
            <div key={skater.name} className="flex flex-col items-center space-y-2">
              <div className="w-16 h-16 bg-dark-card rounded-full flex items-center justify-center font-bold text-lg text-white">
                {skater.avatar}
              </div>
              <span className="text-sm text-slate-300">{skater.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Popular Searches Section */}
      <PopularSearches />

    </aside>
  );
}