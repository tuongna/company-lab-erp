import React from 'react';

export function Badge({
  children,
  tone = 'neutral',
}: {
  children: React.ReactNode;
  tone?: string;
}) {
  const neutralTone = {
    bg: 'bg-slate-500/10 text-slate-700 dark:text-slate-300 border border-slate-500/20',
    dot: 'bg-slate-400',
  };
  const tones: Record<string, { bg: string; dot: string }> = {
    success: {
      bg: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20',
      dot: 'bg-emerald-500',
    },
    warning: {
      bg: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20',
      dot: 'bg-amber-500',
    },
    danger: {
      bg: 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20',
      dot: 'bg-rose-500',
    },
    info: {
      bg: 'bg-sky-500/10 text-sky-700 dark:text-sky-400 border border-sky-500/20',
      dot: 'bg-sky-500',
    },
    neutral: neutralTone,
  };
  const t = tone && tones[tone] ? tones[tone]! : neutralTone;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium ${t.bg}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${t.dot}`} />
      {children}
    </span>
  );
}
