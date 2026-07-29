import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import ThemeRegistry from '../theme/ThemeRegistry';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Mailly - Email Marketing Platform',
  description: 'Manage contacts, design campaigns, and grow your audience with Mailly.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="h-full">
        <ThemeRegistry>
          {children}
        </ThemeRegistry>
      </body>
    </html>
  );
}
