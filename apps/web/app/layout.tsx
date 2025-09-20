import type { Metadata } from "next";
import { IBM_Plex_Sans_Arabic, Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-latin" });
const plexArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-arabic",
});

export const metadata: Metadata = {
  title: "Saudi Casting Marketplace",
  description:
    "High-trust casting marketplace connecting verified talent, guardians, and professional hirers.",
  metadataBase: new URL("https://saudi-casting-marketplace.example"),
  openGraph: {
    title: "Saudi Casting Marketplace",
    description:
      "End-to-end casting workflows tailored for the Saudi entertainment ecosystem.",
    url: "https://saudi-casting-marketplace.example",
    siteName: "Saudi Casting Marketplace",
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${plexArabic.variable} min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
