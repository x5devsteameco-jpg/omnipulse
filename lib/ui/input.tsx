'use client';

import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export function Input({
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  className = '',
  id,
  ...props
}: InputProps) {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="space-y-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-[var(--color-text-secondary)]"
        >
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--color-text-dim)]">
            {leftIcon}
          </div>
        )}
        <input
          id={inputId}
          className={`
            w-full bg-[var(--color-surface)] border rounded-[var(--radius-md)]
            text-[var(--color-text-primary)] placeholder-[var(--color-text-dim)]
            transition-colors duration-200
            focus:outline-none focus:ring-2 focus:ring-offset-0
            disabled:opacity-50 disabled:cursor-not-allowed
            ${leftIcon ? 'pl-10' : 'pl-4'}
            ${rightIcon ? 'pr-10' : 'pr-4'}
            ${error
              ? 'border-[var(--color-error)] focus:ring-[var(--color-error)]/30'
              : 'border-[var(--color-border)] focus:border-[var(--brand-primary)] focus:ring-[var(--brand-primary)]/30'
            }
            py-2
            ${className}
          `}
          {...props}
        />
        {rightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-[var(--color-text-dim)]">
            {rightIcon}
          </div>
        )}
      </div>
      {error && (
        <p className="text-sm text-[var(--color-error)]">{error}</p>
      )}
      {hint && !error && (
        <p className="text-sm text-[var(--color-text-dim)]">{hint}</p>
      )}
    </div>
  );
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export function Textarea({
  label,
  error,
  hint,
  className = '',
  id,
  ...props
}: TextareaProps) {
  const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="space-y-1.5">
      {label && (
        <label
          htmlFor={textareaId}
          className="block text-sm font-medium text-[var(--color-text-secondary)]"
        >
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        className={`
          w-full bg-[var(--color-surface)] border rounded-[var(--radius-md)]
          text-[var(--color-text-primary)] placeholder-[var(--color-text-dim)]
          transition-colors duration-200
          focus:outline-none focus:ring-2 focus:ring-offset-0
          disabled:opacity-50 disabled:cursor-not-allowed
          px-4 py-2 min-h-[100px] resize-y
          ${error
            ? 'border-[var(--color-error)] focus:ring-[var(--color-error)]/30'
            : 'border-[var(--color-border)] focus:border-[var(--brand-primary)] focus:ring-[var(--brand-primary)]/30'
          }
          ${className}
        `}
        {...props}
      />
      {error && (
        <p className="text-sm text-[var(--color-error)]">{error}</p>
      )}
      {hint && !error && (
        <p className="text-sm text-[var(--color-text-dim)]">{hint}</p>
      )}
    </div>
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export function Select({
  label,
  error,
  options,
  className = '',
  id,
  ...props
}: SelectProps) {
  const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="space-y-1.5">
      {label && (
        <label
          htmlFor={selectId}
          className="block text-sm font-medium text-[var(--color-text-secondary)]"
        >
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={`
          w-full bg-[var(--color-surface)] border rounded-[var(--radius-md)]
          text-[var(--color-text-primary)]
          transition-colors duration-200
          focus:outline-none focus:ring-2 focus:ring-offset-0
          disabled:opacity-50 disabled:cursor-not-allowed
          px-4 py-2
          ${error
            ? 'border-[var(--color-error)] focus:ring-[var(--color-error)]/30'
            : 'border-[var(--color-border)] focus:border-[var(--brand-primary)] focus:ring-[var(--brand-primary)]/30'
          }
          ${className}
        `}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="text-sm text-[var(--color-error)]">{error}</p>
      )}
    </div>
  );
}
