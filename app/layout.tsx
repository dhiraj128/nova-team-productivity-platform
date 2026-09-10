import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/components/providers/AuthProvider';

export const metadata: Metadata = {
  title: 'NOVA — Team Productivity Platform',
  description: 'Plan. Collaborate. Deliver. High-velocity team productivity platform.',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-surface text-on-surface min-h-screen font-sans antialiased selection:bg-primary selection:text-on-primary">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
