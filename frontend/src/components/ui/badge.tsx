import React from 'react';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'outline' | 'gradient';
  children?: React.ReactNode;
}

export function Badge({ variant = 'default', className = '', children, ...props }: BadgeProps) {
  const variants: Record<string, string> = {
    default: 'bg-gray-200 text-gray-800',
    success: 'bg-[#29BF12] text-white',
    warning: 'bg-[#FFBA49] text-white',
    danger: 'bg-red-500 text-white',
    outline: 'border border-gray-300 text-gray-700',
    gradient: 'bg-gradient-to-r from-[#29BF12] to-[#FFBA49] text-white',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${variants[variant]} ${className}`} {...props}>
      {children}
    </span>
  );
}
