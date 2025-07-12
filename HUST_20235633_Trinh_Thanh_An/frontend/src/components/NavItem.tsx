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
      className={`nav-item ${isActive ? 'active' : ''}`}
    >
      <Icon className="nav-item-icon" />
      <span className="nav-item-label">{label}</span>
    </Link>
  );
}