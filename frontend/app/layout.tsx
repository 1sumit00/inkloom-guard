import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Inkloom Guard — Intelligent Brand Governance & Pre-Publication Co-Pilot",
  description: "Enterprise Brand Governance & Multi-Modal Pre-Publication Co-Pilot",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}

