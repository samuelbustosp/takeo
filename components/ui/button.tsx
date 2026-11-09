import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    const variants = {
      default: 'bg-orange-600 hover:bg-orange-500 text-white shadow-md shadow-orange-600/20 border border-transparent',
      destructive: 'bg-red-600 hover:bg-red-500 text-white shadow-md shadow-red-600/20 border border-transparent',
      outline: 'border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 hover:bg-orange-50/50 dark:hover:bg-orange-950/20 hover:border-orange-500/40 text-zinc-800 dark:text-zinc-200',
      secondary: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-zinc-700 border border-transparent',
      ghost: 'hover:bg-zinc-100 dark:hover:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 border border-transparent',
      link: 'text-orange-600 underline-offset-4 hover:underline p-0 h-auto',
    };

    const sizes = {
      default: 'h-10 px-4 py-2 text-sm rounded-xl font-bold',
      sm: 'h-8 px-3 rounded-lg text-xs font-semibold',
      lg: 'h-12 px-6 rounded-2xl text-base font-extrabold',
      icon: 'h-9 w-9 rounded-xl',
    };

    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center gap-2 whitespace-nowrap transition-colors duration-150 outline-none focus:outline-none focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 cursor-pointer select-none',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button };
