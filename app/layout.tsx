import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Resume Builder — YU Template',
  description: 'Build a professional resume based on the YU student template',
  // Favicon is provided by the App Router file convention: app/icon.png.
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
