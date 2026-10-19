import type { Metadata } from 'next';
import './globals.css';
import { QueryProvider } from '@/components/providers/QueryProvider';
import { I18nProvider } from '@/lib/i18n/context';

export const metadata: Metadata = {
  title: 'CompanyLab ERP — Operations Workspace',
  description: 'Enterprise ERP & IT Asset Allocation Lifecycle Management',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        {/* Pretendard font supporting Korean (Hangul), Latin & Vietnamese diacritics */}
        <link
          rel="stylesheet"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.css"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function() {
              try {
                const theme = localStorage.getItem('companylab-theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
                if (theme === 'dark') {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.add('light');
                }
                const locale = localStorage.getItem('companylab-locale');
                if (locale) {
                  document.documentElement.lang = locale;
                }
              } catch (e) {}
            })();`,
          }}
        />
      </head>
      <body
        className="min-h-screen bg-background text-foreground antialiased md:min-w-[998px]"
        suppressHydrationWarning
      >
        <QueryProvider>
          <I18nProvider>{children}</I18nProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
