import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AutoDrift | Precision Car Detailing & Custom Quote Builder",
  description:
    "Explore transparent car detailing packages, paint correction, interior steam restoration, and ceramic coatings tailored to your vehicle size. Instant real-time quotes.",
  keywords: [
    "car detailing",
    "auto detailing Philippines",
    "ceramic coating",
    "paint correction",
    "car wash",
    "interior detail",
    "car detailing prices",
  ],
  icons: {
    icon: "/images/icon.png",
    shortcut: "/images/icon.png",
    apple: "/images/icon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark bg-black">
      <body className={`${inter.className} bg-black text-zinc-100 antialiased selection:bg-red-600 selection:text-white min-h-screen`}>
        {children}
      </body>
    </html>
  );
}
