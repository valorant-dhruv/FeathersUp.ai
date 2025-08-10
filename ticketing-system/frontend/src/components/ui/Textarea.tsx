import React, { forwardRef } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, helperText, id, ...props }, ref) => {
    const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={textareaId}
            className="mb-2 block text-sm font-medium text-white"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={twMerge(
            clsx(
              'flex min-h-[80px] w-full rounded-lg border bg-dark-800 px-3 py-2 text-sm text-white placeholder:text-dark-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-dark-950 disabled:cursor-not-allowed disabled:opacity-50 resize-vertical',
              {
                'border-danger-500 focus:border-danger-500 focus:ring-danger-500': error,
                'border-dark-600': !error,
              }
            ),
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-danger-500">{error}</p>
        )}
        {helperText && !error && (
          <p className="mt-1 text-sm text-dark-400">{helperText}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export default Textarea; 