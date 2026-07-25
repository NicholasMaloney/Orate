import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// The home page defaults to Orate.

export const metadata: Metadata = {
  title: {
    default: "Orate",
    template: "%s | Orate" // The %s is replaced with the sub page’s title
  },
  description: "A teacher-facing builder for playable phoneme Wordle and Word Search activities.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // {children} is replaced with whichever page is currently being rendered. 
    // Putting the header "<SiteHeader />" above children makes it appear on every route automatically.
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <a
          href="#main-content"
          className="sr-only z-50 rounded-md bg-blue-700 px-4 py-2 text-white focus:fixed focus:left-4 focus:top-4 focus:not-sr-only"
        >
          Skip to main content
        </a>

        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
