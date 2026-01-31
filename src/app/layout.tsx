import type { Metadata } from 'next';
import { Toaster } from "@/components/ui/toaster";
import './globals.css';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';

export const metadata: Metadata = {
  title: "Fixam – Smart Repairs & Services",
  description:
    "Fixam connects you to trusted repair experts and service providers in Ghana.",
  openGraph: {
    title: "Fixam",
    description:
      "Find trusted technicians, artisans & service providers with Fixam.",
    url: "https://getfixam.com",
    siteName: "Fixam",
    images: [
      {
        url: "https://getfixam.com/og-image.png",
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_GH",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        {children}
        <Toaster />
        <FirebaseErrorListener />
      </body>
    </html>
  );
}
