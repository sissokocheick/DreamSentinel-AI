import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'DreamSentinel AI | Somnia Event Contracts',
  description: 'Autonomous Agent Swarm, Copy-Trading Vaults, and PvP Duels for DreamDEX Event Contracts.',
  icons: {
    icon: '/logo.jpg',
  },
  openGraph: {
    title: 'DreamSentinel AI | Somnia Event Contracts',
    description: 'Autonomous Agent Swarm, Copy-Trading Vaults, and PvP Duels for DreamDEX Event Contracts.',
    images: ['/logo.jpg'],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DreamSentinel AI | Somnia Event Contracts',
    description: 'The Autonomous Swarm Intelligence for Prediction Markets.',
    images: ['/logo.jpg'],
  }
};

import { Toaster } from 'sonner';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-background text-slate-100 antialiased selection:bg-cyan-500 selection:text-black">
        {children}
        <Toaster theme="dark" position="bottom-right" toastOptions={{ className: 'font-mono text-xs border-surfaceBorder bg-surface/90 backdrop-blur-md' }} />
      </body>
    </html>
  );
}
