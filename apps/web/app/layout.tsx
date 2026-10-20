import type { Metadata } from 'next';
import './globals.css';
import { QueryProvider } from '@/components/providers/QueryProvider';

export const metadata: Metadata = {
  title: 'CompanyLab ERP — Operations Workspace',
  description: 'Enterprise ERP & IT Asset Allocation Lifecycle Management',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
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
              } catch (e) {}
            })();`,
          }}
        />
      </head>
      <body
        className="min-h-screen overflow-x-hidden bg-background text-foreground antialiased"
        suppressHydrationWarning
      >
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
