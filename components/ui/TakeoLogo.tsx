import React from 'react';

interface TakeoLogoProps extends React.SVGProps<SVGSVGElement> {
  variant?: 'icon' | 'rounded' | 'mark' | 'full';
  size?: number | string;
  className?: string;
  primaryColor?: string;
  tColor?: string;
  accentColor?: string;
  animated?: boolean;
}

export function TakeoLogo({
  variant = 'rounded',
  size = 40,
  className = '',
  primaryColor = '#FF6B00',
  tColor = '#FFFFFF',
  accentColor = 'var(--brand-yellow, #FFD000)',
  animated = true,
  ...props
}: TakeoLogoProps) {
  const markElements = (
    <>
      {/* Pure White T with App-Icon Safe Margins */}
      <path
        d="M 144 98 L 368 98 A 18 18 0 0 1 386 116 L 386 138 A 18 18 0 0 1 368 156 L 299 156 A 14 14 0 0 0 285 170 L 285 306 A 14 14 0 0 1 271 320 L 241 320 A 14 14 0 0 1 227 306 L 227 170 A 14 14 0 0 0 213 156 L 144 156 A 18 18 0 0 1 126 138 L 126 116 A 18 18 0 0 1 144 98 Z"
        fill={variant === 'mark' ? 'currentColor' : tColor}
      />
      {/* Warm Golden Yellow Smile (animated draw from left to right) */}
      <path
        d="M 143 406 Q 256 270 369 406 A 6 6 0 0 1 364 414 Q 256 338 148 414 A 6 6 0 0 1 143 406 Z"
        fill={accentColor}
        className={animated ? 'animate-logo-smile' : undefined}
      />
    </>
  );

  if (variant === 'mark') {
    return (
      <svg
        viewBox="0 0 512 512"
        width={size}
        height={size}
        className={className}
        {...props}
      >
        {markElements}
      </svg>
    );
  }

  if (variant === 'full') {
    return (
      <svg
        viewBox="0 0 340 80"
        height={size}
        className={className}
        fill="none"
        {...props}
      >
        <rect x="8" y="8" width="64" height="64" rx="16" fill={primaryColor} />
        <g transform="translate(8, 8) scale(0.125)">
          {markElements}
        </g>
        <text
          x="88"
          y="47"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontSize="34"
          fontWeight="900"
          letterSpacing="1.5"
          className="fill-zinc-900 dark:fill-white"
        >
          TAKEO
        </text>
        <text
          x="89"
          y="63"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontSize="11"
          fontWeight="700"
          letterSpacing="2.5"
          fill={primaryColor}
        >
          PEDÍ. LISTO.
        </text>
      </svg>
    );
  }

  const rx = variant === 'rounded' ? 112 : 0;

  return (
    <svg
      viewBox="0 0 512 512"
      width={size}
      height={size}
      className={className}
      {...props}
    >
      <rect width="512" height="512" rx={rx} fill={primaryColor} />
      {markElements}
    </svg>
  );
}
