import './globals.css';
import { Inter, Space_Grotesk } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], variable: '--font-body' });
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-headline' });

export const metadata = {
  title: 'FixAm Ghana | Find Trusted Local Artisans',
  description: 'Connecting Berekum to verified plumbers, electricians, and mechanics.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body className="font-body antialiased min-h-screen flex flex-col">
        {children}
      </body>
    </html>
  );
}
