import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'CapySprint — Energy-Aware Micro-Sprint Planner',
  description:
    'Turn overwhelming to-do lists into 15-minute energy-matched focus sprints. Built for Teens Hack Houston 2026.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-slate-950 text-slate-100 antialiased selection:bg-amber-400 selection:text-slate-950`}>
        {children}
      </body>
    </html>
  );
}
