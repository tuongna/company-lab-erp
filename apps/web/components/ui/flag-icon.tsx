import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import VN from 'country-flag-icons/react/3x2/VN';
import US from 'country-flag-icons/react/3x2/US';
import KR from 'country-flag-icons/react/3x2/KR';
import { Locale } from '@/lib/i18n/types';
import { cn } from '@/lib/utils';

export const flagIconVariants = cva(
  'rounded-[2px] overflow-hidden shrink-0 border border-black/10 dark:border-white/15 shadow-2xs',
  {
    variants: {
      size: {
        sm: 'w-[15px] h-[10px]',
        md: 'w-[18px] h-[12px]',
        lg: 'w-[24px] h-[16px]',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  },
);

export interface FlagIconProps
  extends React.ComponentPropsWithoutRef<typeof VN>, VariantProps<typeof flagIconVariants> {
  code: Locale | string;
}

const flagComponents: Record<string, typeof VN> = {
  vi: VN,
  en: US,
  ko: KR,
};

export function FlagIcon({ code, size, className, ...props }: FlagIconProps) {
  const Component = flagComponents[code];
  if (!Component) return null;

  return (
    <Component
      aria-hidden="true"
      className={cn(flagIconVariants({ size }), className)}
      {...props}
    />
  );
}
