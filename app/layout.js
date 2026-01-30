import "./globals.css";
import { DM_Sans } from "next/font/google";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-body"
});

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
      <body className={`${dmSans.variable}`} suppressHydrationWarning={true}>
        {children}
      </body>
    </html>
  );
}
