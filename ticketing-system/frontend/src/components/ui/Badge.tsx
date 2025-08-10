import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className,
}) => {
  const baseClasses = 'inline-flex items-center rounded-full font-medium';
  
  const variants = {
    default: 'bg-dark-700 text-white',
    success: 'bg-success-900 text-success-300',
    warning: 'bg-warning-900 text-warning-300',
    danger: 'bg-danger-900 text-danger-300',
    info: 'bg-primary-900 text-primary-300',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-xs',
    lg: 'px-3 py-1 text-sm',
  };

  const classes = twMerge(
    clsx(
      baseClasses,
      variants[variant],
      sizes[size],
      className
    )
  );

  return (
    <span className={classes}>
      {children}
    </span>
  );
};

export default Badge; 