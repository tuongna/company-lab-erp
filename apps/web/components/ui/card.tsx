import React from 'react';

export function Card({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`bg-surface border border-border rounded-xl shadow-[var(--card-shadow)] text-foreground ${className}`}
    >
      {children}
    </section>
  );
}
