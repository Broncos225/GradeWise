import type {Metadata} from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'GradeWise',
  description: 'Calculadora de notas y planificador de éxito académico.',
  manifest: '/manifest.json',
  icons: {
    apple: 'https://placehold.co/192x192.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#89d5f2" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Inter&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">{children}</body>
    </html>
  );
}
