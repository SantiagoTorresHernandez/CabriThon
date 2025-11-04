import * as React from 'react';

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number; // 0-100
}

export const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(({ value, className = '', ...props }, ref) => {
  return (
    <div ref={ref} className={`w-full h-2 rounded-full bg-gray-200/60 overflow-hidden ${className}`} {...props}>
      <div
        className="h-full rounded-full bg-gradient-to-r from-[#29BF12] to-[#FFBA49] transition-all"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
});

Progress.displayName = 'Progress';
