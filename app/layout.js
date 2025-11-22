import './globals.css';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

// This metadata object is standard JavaScript and defines the title for the browser tab.
export const metadata = {
  title: 'GroGoliath pSEO Tool',
  description: 'Programmatic SEO Dashboard.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      {/* We add suppressHydrationWarning to ignore attributes injected by 
         browser extensions (like Grammarly) which cause the mismatch error.
      */}
      <body className={inter.className} suppressHydrationWarning={true}>
        {children}
      </body>
    </html>
  );
}