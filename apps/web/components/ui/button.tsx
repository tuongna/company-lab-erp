import React from 'react';

export function Button({
  children,
  variant = 'primary',
  onClick,
  disabled = false,
  className = '',
  type = 'button',
  title,
}: {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit';
  title?: string;
}) {
  const base =
    'inline-flex items-center justify-center font-medium text-xs rounded-lg transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer gap-1.5 shrink-0 select-none';
  const variants = {
    primary:
      'bg-primary text-primary-foreground hover:bg-primary-hover px-3 py-1.5 shadow-sm active:scale-[0.98]',
    secondary:
      'bg-surface text-foreground hover:bg-surface-subtle border border-border px-3 py-1.5 shadow-xs active:scale-[0.98]',
    ghost: 'text-muted hover:text-foreground hover:bg-surface-subtle p-1.5',
    danger: 'bg-rose-600 hover:bg-rose-700 text-white px-3 py-1.5 shadow-sm active:scale-[0.98]',
  };
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      title={title}
      className={`${base} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}
