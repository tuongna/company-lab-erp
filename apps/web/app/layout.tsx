import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CLT-ERP — IT Asset Operations',
  description: 'Enterprise IT Asset Allocation & Lifecycle Management',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className="min-h-screen bg-slate-50 antialiased">{children}</body>
    </html>
  );
}
