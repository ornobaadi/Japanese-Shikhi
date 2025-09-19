import type { Metadata } from "next";
import { DM_Sans, Noto_Sans_Bengali, Hind_Siliguri } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

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
        <body className={`${dmSans.variable} ${notoSansBengali.variable} ${hindSiliguri.variable} antialiased`}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
