import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import VN from 'country-flag-icons/react/3x2/VN';
import US from 'country-flag-icons/react/3x2/US';
import KR from 'country-flag-icons/react/3x2/KR';
import { Locale } from '@/lib/i18n/types';
import { cn } from '@/lib/utils';

export const flagIconVariants = cva(
  'shadow-2xs shrink-0 overflow-hidden rounded-[0.125rem] border border-black/10 dark:border-white/15',
  {
    variants: {
      size: {
        sm: 'h-[0.625rem] w-[0.9375rem]',
        md: 'h-[0.75rem] w-[1.125rem]',
        lg: 'h-4 w-6',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  },
);

export interface FlagIconProps
  extends React.SVGProps<SVGSVGElement>, VariantProps<typeof flagIconVariants> {
  code: Locale | string;
}

const flagComponents: Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
  vi: VN as unknown as React.ComponentType<React.SVGProps<SVGSVGElement>>,
  en: US as unknown as React.ComponentType<React.SVGProps<SVGSVGElement>>,
  ko: KR as unknown as React.ComponentType<React.SVGProps<SVGSVGElement>>,
};

export function FlagIcon({
  code,
  size,
  className,
  preserveAspectRatio = 'none',
  ...props
}: FlagIconProps) {
  const Component = flagComponents[code];
  if (!Component) return null;

  return (
    <Component
      aria-hidden="true"
      preserveAspectRatio={preserveAspectRatio}
      className={cn(flagIconVariants({ size }), className)}
      {...props}
    />
  );
}
