import { notFound } from 'next/navigation';
import { I18nProvider } from '@/lib/i18n/context';
import { AppLayout } from '@/components/layout/AppLayout';
import { Locale } from '@/lib/i18n/types';

const VALID_LOCALES = ['vi', 'en', 'ko'];

export function generateStaticParams() {
  return VALID_LOCALES.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!VALID_LOCALES.includes(locale)) {
    notFound();
  }

  return (
    <I18nProvider initialLocale={locale as Locale}>
      <AppLayout>{children}</AppLayout>
    </I18nProvider>
  );
}
