import React, { forwardRef } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  label?: string;
  error?: string;
  helperText?: string;
  options: SelectOption[];
  placeholder?: string;
  onChange?: (value: string) => void;
  value?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, helperText, options, placeholder, onChange, value, id, ...props }, ref) => {
    const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      if (onChange) {
        onChange(e.target.value);
      }
    };

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={selectId}
            className="mb-2 block text-sm font-medium text-white"
          >
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          value={value || ''}
          className={twMerge(
            clsx(
              'flex h-10 w-full rounded-lg border bg-dark-800 px-3 py-2 text-sm text-white focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-dark-950 disabled:cursor-not-allowed disabled:opacity-50',
              {
                'border-danger-500 focus:border-danger-500 focus:ring-danger-500': error,
                'border-dark-600': !error,
              }
            ),
            className
          )}
          onChange={handleChange}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
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

Select.displayName = 'Select';

export default Select; 