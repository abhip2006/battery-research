import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ThemeProvider } from '@/components/layout/ThemeProvider';
import { Toaster } from 'react-hot-toast';
import '@/styles/globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Battery Intelligence Platform | US Industry Dashboard',
  description:
    'Comprehensive analysis of the US battery manufacturing landscape, technology evolution, and market dynamics',
  keywords: [
    'battery industry',
    'lithium-ion',
    'LFP',
    'NMC',
    'energy storage',
    'electric vehicles',
    'manufacturing',
    'USA',
  ],
  authors: [{ name: 'Battery Industry Research Team' }],
  openGraph: {
    title: 'Battery Intelligence Platform',
    description:
      'Interactive dashboard analyzing the US battery manufacturing landscape, technology trends, and market evolution',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: 'var(--background)',
                color: 'var(--foreground)',
                border: '1px solid var(--border)',
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
