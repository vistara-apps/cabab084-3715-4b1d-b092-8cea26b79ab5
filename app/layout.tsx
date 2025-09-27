import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { ThemeProvider } from './components/ThemeProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'FairPlay Nexus - Provably Fair Gaming & DeFi',
  description: 'Provably Fair Gaming and DeFi Yield, Powered by Blockchain',
  keywords: ['DeFi', 'Gaming', 'Blockchain', 'Base', 'Lending', 'NFT'],
  authors: [{ name: 'FairPlay Nexus' }],
  openGraph: {
    title: 'FairPlay Nexus',
    description: 'Provably Fair Gaming and DeFi Yield, Powered by Blockchain',
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
        <ThemeProvider>
          <Providers>
            {children}
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
