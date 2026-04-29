import type { Metadata } from 'next';
import './globals.css';
import '../lib/ui/enhanced.css';

export const metadata: Metadata = {
  title: 'AEG Social Media Analytics',
  description: 'Social media analytics and marketing insights platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}