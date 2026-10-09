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
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#090d16",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-[#090d16] text-slate-100 antialiased selection:bg-cyan-500 selection:text-black`}>
        {children}
      </body>
    </html>
  );
}
