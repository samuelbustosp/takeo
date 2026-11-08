import * as React from 'react';
import { cn } from '@/lib/utils';

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {}

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, ...props }, ref) => (
    <label
      ref={ref}
      className={cn(
        'text-xs sm:text-sm font-semibold text-zinc-700 dark:text-zinc-300 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 select-none block',
        className
      )}
      {...props}
    />
  )
);
Label.displayName = 'Label';

export { Label };
