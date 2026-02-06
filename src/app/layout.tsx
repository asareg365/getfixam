import './globals.css';
import { Space_Grotesk, Inter } from 'next/font/google';
import { Toaster } from '@/components/ui/toaster';

const spaceGrotesk = Space_Grotesk({ 
  subsets: ['latin'],
  variable: '--font-headline',
});

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-body',
});

export const metadata = {
  title: 'FixAm Ghana | Trusted Local Artisans',
  description: 'Find verified plumbers, electricians, and mechanics in Berekum.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${inter.variable}`}>
      <body className="font-body antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
