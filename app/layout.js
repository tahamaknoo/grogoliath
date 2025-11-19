import './globals.css';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

// We define metadata using a standard JavaScript object export,
// which is compatible with Next.js App Router for JS files.
export const metadata = {
  title: 'GroGoliath pSEO Tool',
  description: 'Programmatic SEO Dashboard.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}