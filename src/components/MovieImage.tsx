'use client';

import React, { useState, useEffect } from 'react';
import Image, { ImageProps } from 'next/image';
import { Film } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MovieImageProps extends Omit<ImageProps, 'src'> {
  src: string;
  fallbackSrc?: string;
  containerClassName?: string;
}

const DEFAULT_POSTER_FALLBACK = 'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg';

export function MovieImage({
  src,
  fallbackSrc = DEFAULT_POSTER_FALLBACK,
  alt,
  className,
  containerClassName,
  ...props
}: MovieImageProps) {
  const [currentSrc, setCurrentSrc] = useState<string>(src || fallbackSrc);
  const [hasFailed, setHasFailed] = useState<boolean>(false);

  useEffect(() => {
    setCurrentSrc(src || fallbackSrc);
    setHasFailed(false);
  }, [src, fallbackSrc]);

  const handleError = () => {
    if (currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
    } else {
      setHasFailed(true);
    }
  };

  if (hasFailed) {
    return (
      <div
        className={cn(
          'w-full h-full flex flex-col items-center justify-center bg-zinc-900 border border-white/10 text-zinc-500 p-2 text-center select-none',
          containerClassName
        )}
      >
        <Film className="w-6 h-6 mb-1 text-[#f5c518]/70" />
        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 line-clamp-1">
          {alt || 'MovieStars'}
        </span>
      </div>
    );
  }

  return (
    <Image
      {...props}
      src={currentSrc}
      alt={alt}
      className={className}
      onError={handleError}
      unoptimized={true}
    />
  );
}

