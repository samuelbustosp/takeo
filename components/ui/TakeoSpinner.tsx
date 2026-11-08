import React from 'react';
import { cn } from '@/lib/utils';

interface TakeoSpinnerProps {
  size?: number | string;
  className?: string;
  label?: string;
}

export function TakeoSpinner({
  size = 56,
  className = '',
  label,
}: TakeoSpinnerProps) {
  return (
    <div className={cn('inline-flex flex-col items-center justify-center gap-3 select-none', className)}>
      <svg
        viewBox="100 80 312 340"
        width={size}
        height={size}
        fill="none"
        className="overflow-visible"
        aria-hidden="true"
      >
        {/* Blinking / pulsing 'T' mark (pure white / high contrast without any background box) */}
        <path
          d="M 144 98 L 368 98 A 18 18 0 0 1 386 116 L 386 138 A 18 18 0 0 1 368 156 L 299 156 A 14 14 0 0 0 285 170 L 285 306 A 14 14 0 0 1 271 320 L 241 320 A 14 14 0 0 1 227 306 L 227 170 A 14 14 0 0 0 213 156 L 144 156 A 18 18 0 0 1 126 138 L 126 116 A 18 18 0 0 1 144 98 Z"
          className="fill-orange-500 dark:fill-white animate-pulse"
        />
        {/* Drawing yellow smile curve */}
        <path
          d="M 143 406 Q 256 270 369 406 A 6 6 0 0 1 364 414 Q 256 338 148 414 A 6 6 0 0 1 143 406 Z"
          fill="var(--brand-yellow, #FFD000)"
          className="animate-logo-smile"
        />
      </svg>
      {label && (
        <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 animate-pulse tracking-wide">
          {label}
        </span>
      )}
    </div>
  );
}
