import React from 'react';

export function Avatar({
  initials = 'NL',
  className = '',
}: {
  initials?: string;
  className?: string;
}) {
  return (
    <span
      className={`w-7.5 h-7.5 shrink-0 rounded-full bg-blue-100 dark:bg-blue-950 text-primary font-bold text-[11px] inline-grid place-items-center ${className}`}
    >
      {initials}
    </span>
  );
}
