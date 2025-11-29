import type { Metadata } from "next";
import { Signika } from "next/font/google";
import "./globals.css";

const signika = Signika({
  variable: "--font-signika",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Kerabie Email – Reliable Business Email for Growing Teams",
    template: "%s | Kerabie Email",
  },
  description:
    "Kerabie Email provides fast, secure, and professional business email built for reliability and productivity. Designed for teams, entrepreneurs, and web hosts.",
  keywords: [
    "business email",
    "professional email",
    "email hosting",
    "secure email",
    "reliable email",
    "Kerabie",
    "business communication",
  ],
  metadataBase: new URL("https://kerabie.email"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    siteName: "Kerabie Email",
    title: "Kerabie Email – Reliable Business Email for Growing Teams",
    description:
      "A fast, secure, modern business email platform designed for clarity, reliability, and productivity.",
    url: "https://kerabie.email",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Kerabie Email Dashboard",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Kerabie Email",
    description:
      "Fast, secure, professional business email built for growing teams.",
    images: ["/og-image.jpg"],
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${signika.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
