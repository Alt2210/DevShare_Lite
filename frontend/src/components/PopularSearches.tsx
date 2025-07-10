// src/components/PopularSearches.tsx
'use client';

// Dữ liệu giả để hiển thị
const popularSearches = [
  { name: 'Skateboard Trick', count: '21,983,590' },
  { name: 'Tutorial skateboard flip and jump', count: '7,098,765' },
  { name: 'First time Learn using skateboard', count: '7,098,765' },
  { name: 'Safety Equipment', count: '21,983,590' },
];

export default function PopularSearches() {
  return (
    <div className="bg-dark-card rounded-lg p-4">
      <h3 className="font-bold text-white mb-4">Popular Searches</h3>
      <div className="space-y-3">
        {popularSearches.map((item) => (
          <div key={item.name} className="flex justify-between items-center text-sm">
            <span className="text-slate-300">{item.name}</span>
            <span className="text-slate-500">{item.count}</span>
          </div>
        ))}
      </div>
      <button className="w-full text-center text-sm text-accent font-semibold mt-4">
        See All Popular Searches
      </button>
    </div>
  );
}