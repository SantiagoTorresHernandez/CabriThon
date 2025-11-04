import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, style, ...props }, ref) => (
    <button
      ref={ref}
      className={`px-4 py-2 rounded-lg font-semibold transition-all ${className || ''}`}
      style={{
        backgroundColor: '#29BF12',
        color: 'white',
        ...style,
      }}
      {...props}
    />
  )
);

Button.displayName = 'Button';
