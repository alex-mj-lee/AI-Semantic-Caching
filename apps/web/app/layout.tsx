import "./globals.css";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Boardy AI Cache - Intelligent Semantic Caching",
  description:
    "Advanced AI-powered semantic caching system with intelligent query classification and real-time analytics",
  keywords:
    "AI, semantic cache, machine learning, query optimization, intelligent caching",
  authors: [{ name: "Boardy Team" }],
  viewport: "width=device-width, initial-scale=1",
  robots: "index, follow",
  openGraph: {
    title: "Boardy AI Cache - Intelligent Semantic Caching",
    description:
      "Advanced AI-powered semantic caching system with intelligent query classification",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Boardy AI Cache - Intelligent Semantic Caching",
    description:
      "Advanced AI-powered semantic caching system with intelligent query classification",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.className}>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="theme-color" content="#3b82f6" />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
