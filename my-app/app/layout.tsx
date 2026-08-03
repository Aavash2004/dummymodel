import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import CursorEffect from "./cursor";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Intern App",
  description: "A clean, modern, and minimalist web application.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground selection:bg-zinc-900 selection:text-white">
        <CursorEffect />
          <Navbar />
          <div className="flex-1">{children}</div>
          <Footer />
  
      </body>
    </html>
  );
}

