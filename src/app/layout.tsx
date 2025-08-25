import BaseMiniKitProvider from "@/components/MinikitsProvider";
import type { Metadata } from "next";
import { Geist, Geist_Mono, Orbitron, Press_Start_2P } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
  weight: ["400", "900"],
});

const pressStart2P = Press_Start_2P({
  variable: "--font-press-start-2p",
  subsets: ["latin"],
  weight: ["400"],
});

export const metadata: Metadata = {
  title: "QuizBlaster",
  description: "QuizBlaster is a platform for learning and competing in quizzes", 
  icons: {
    icon: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${orbitron.variable} ${pressStart2P.variable} antialiased`}
      >
        <BaseMiniKitProvider>
          {children}
        </BaseMiniKitProvider>
      </body>
    </html>
  );
}
