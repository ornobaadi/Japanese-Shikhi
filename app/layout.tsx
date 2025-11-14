import type { Metadata } from "next";
import { Noto_Sans_Bengali, Hind_Siliguri, Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import { LanguageProvider } from "@/contexts/LanguageContext";
import FacebookPixel from "@/components/analytics/FacebookPixel";
import GoogleAnalytics from "@/components/analytics/GoogleAnalytics";
import TikTokPixel from "@/components/analytics/TikTokPixel";

const notoSansBengali = Noto_Sans_Bengali({
  subsets: ["bengali"],
  variable: "--font-noto-bengali",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const hindSiliguri = Hind_Siliguri({
  subsets: ["bengali"],
  variable: "--font-hind-siliguri",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Japanese Shikhi - Master Japanese Language Online",
  description: "Transform your Japanese language skills with our comprehensive online courses. From beginner hiragana to advanced conversation - join thousands of successful learners today.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${notoSansBengali.variable} ${hindSiliguri.variable} ${inter.variable} antialiased`}>
          <FacebookPixel />
          <GoogleAnalytics />
          <TikTokPixel />
          <LanguageProvider>
            {children}
            <Toaster richColors position="top-right" />
          </LanguageProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
