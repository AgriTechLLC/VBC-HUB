'use client';

import * as React from 'react';
import * as ProgressPrimitive from '@radix-ui/react-progress';

import { cn } from '@/lib/utils';

export interface ExtendedProgressProps extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  color?: string;
  striped?: boolean;
  animated?: boolean;
  showLabel?: boolean;
  height?: 'sm' | 'md' | 'lg';
}

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ExtendedProgressProps
>(({ 
  className, 
  value = 0, 
  color, 
  striped = false, 
  animated = false,
  showLabel = false,
  height = 'md',
  ...props 
}, ref) => {
  // Determine height class based on size prop
  const heightClass = {
    sm: 'h-2',
    md: 'h-4',
    lg: 'h-6'
  }[height];

  // Build className for the indicator
  const indicatorClassName = cn(
    "h-full w-full flex-1 transition-all",
    color || "bg-primary",
    striped && "bg-[length:1rem_1rem] bg-[linear-gradient(45deg,rgba(255,255,255,.15)_25%,transparent_25%,transparent_50%,rgba(255,255,255,.15)_50%,rgba(255,255,255,.15)_75%,transparent_75%,transparent)]",
    animated && striped && "animate-[progress-bar-stripes_1s_linear_infinite]"
  );

  return (
    <div className="relative">
      <ProgressPrimitive.Root
        ref={ref}
        className={cn(
          'relative w-full overflow-hidden rounded-full bg-secondary',
          heightClass,
          className
        )}
        {...props}
      >
        <ProgressPrimitive.Indicator
          className={indicatorClassName}
          style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
        />
      </ProgressPrimitive.Root>
      
      {showLabel && (
        <span className="absolute right-0 top-0 -mt-6 text-xs font-medium text-muted-foreground">
          {Math.round(value || 0)}%
        </span>
      )}
    </div>
  );
});

Progress.displayName = "Progress";

export { Progress };
