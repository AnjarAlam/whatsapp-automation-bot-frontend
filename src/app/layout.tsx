import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'WhatsApp Automation Platform',
  description: 'Production-ready SaaS WhatsApp Automation Platform for Business Owners',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="antialiased bg-slate-50 text-slate-100 min-h-screen" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
