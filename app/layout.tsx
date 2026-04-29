import type { Metadata } from 'next';
import './globals.css';
import '../lib/ui/enhanced.css';

export const metadata: Metadata = {
  title: 'OmniPulse | Platinum Social Intelligence',
  description: 'A-List Talent Social Media Analytics Platform',
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