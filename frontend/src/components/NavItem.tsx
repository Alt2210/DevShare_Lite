// src/components/NavItem.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';

interface NavItemProps {
  href: string;
  icon: React.ElementType;
  label: string;
}

export default function NavItem({ href, icon: Icon, label }: NavItemProps) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={`flex items-center space-x-3 rounded-md px-3 py-2 text-sm font-medium transition-colors duration-200 ${
        isActive
          ? 'bg-accent text-white' // Style khi active
          : 'text-slate-400 hover:bg-dark-card hover:text-white' // Style mặc định
      }`}
    >
      <Icon className="h-5 w-5" />
      <span>{label}</span>
    </Link>
  );
}