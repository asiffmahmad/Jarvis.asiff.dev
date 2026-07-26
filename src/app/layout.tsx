import type { Metadata } from "next";
import { Inter, Orbitron } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

/**
 * JARVIS Root Layout
 *
 * Configures the Orbitron (heading) and Inter (body) fonts from
 * the Design DNA, wraps the application in the client-side Providers
 * component, and sets global metadata.
 */

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: {
    default: "JARVIS — Content Automation Suite",
    template: "%s | JARVIS",
  },
  description:
    "Premium AI-powered content automation suite. Create, schedule, and analyze content across all social media platforms.",
  keywords: [
    "content automation",
    "AI content",
    "social media",
    "scheduling",
    "analytics",
  ],
  authors: [{ name: "JARVIS" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${orbitron.variable} dark`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-jarvis-bg-deepest font-body antialiased" suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
