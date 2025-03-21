import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Press_Start_2P } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { Toaster } from "@/components/ui/sonner";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const pressStart2P = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-pixel",
});

export const metadata: Metadata = {
  title: "Snalgo",
  description: "Snalgo,inspired by OG snake game but with integrated algorithms.",
  icons: {
    icon: "/snalgo.ico",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${pressStart2P.variable} antialiased`}
      >
        <Navbar />
        {children}
        <Toaster
          position="top-center"
          theme="dark"
          className="[--toast-font:var(--font-pixel)]"
          toastOptions={{
            className: "font-pixel",
            style: {
              border: '2px solid #00ff00',
              background: '#0a160f',
              color: '#ffffff',
            },
            unstyled: true,
            classNames: {
              toast: 
                "flex flex-col items-center gap-2 p-4 border-2 border-game-border bg-game-bg text-white shadow-pixel",
              title: "text-sm font-pixel text-game-green text-center",
              description: "text-xs font-pixel text-gray-300 text-center",
              actionButton: "font-pixel px-2 py-1 border-2 border-game-green bg-game-bg hover:bg-game-green/20",
              cancelButton: "font-pixel px-2 py-1 border-2 border-game-red bg-game-bg hover:bg-game-red/20",
              success: "border-game-green",
              error: "border-game-red",
              warning: "border-game-yellow",
              info: "border-game-blue",
              closeButton: "text-game-green hover:bg-game-green/10",
            }
          }}
        />
      </body>
    </html>
  );
}
