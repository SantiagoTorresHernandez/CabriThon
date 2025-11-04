import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

export function Card({ className = '', children, ...props }: CardProps) {
  return (
    <div
      className={`relative group rounded-2xl border border-white/50 bg-white/85 backdrop-blur-md shadow-sm ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className = '', children }: { className?: string; children?: React.ReactNode }) {
  return <div className={`px-4 sm:px-6 pt-4 ${className}`}>{children}</div>;
}

export function CardContent({ className = '', children }: { className?: string; children?: React.ReactNode }) {
  return <div className={`px-4 sm:px-6 pb-4 ${className}`}>{children}</div>;
}
