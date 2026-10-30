'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronRight, ArrowLeft, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  showBackButton?: boolean;
  className?: string;
}

export function Breadcrumb({ items, showBackButton = true, className }: BreadcrumbProps) {
  const router = useRouter();

  return (
    <nav className={cn('flex items-center gap-2 text-xs text-zinc-400 py-2', className)} aria-label="Breadcrumb">
      {showBackButton && (
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl glass-pill hover:bg-white/10 text-zinc-300 hover:text-white transition-colors mr-1 font-semibold"
          title="Go back to previous page"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-cinema-accent" />
          <span>Back</span>
        </button>
      )}

      <Link
        href="/"
        className="flex items-center gap-1 hover:text-cinema-gold transition-colors font-medium"
        title="Home"
      >
        <Home className="w-3.5 h-3.5" />
      </Link>

      {items.map((item, idx) => {
        const isLast = idx === items.length - 1;

        return (
          <React.Fragment key={idx}>
            <ChevronRight className="w-3 h-3 text-zinc-600 shrink-0" />
            {isLast || !item.href ? (
              <span className="font-bold text-white truncate max-w-[200px] sm:max-w-md">
                {item.label}
              </span>
            ) : (
              <Link
                href={item.href}
                className="hover:text-cinema-gold transition-colors font-medium truncate"
              >
                {item.label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}

