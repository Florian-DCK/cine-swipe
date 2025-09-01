import type { Metadata } from "next";
import { Lexend } from "next/font/google";
import "./globals.css";
import Navbar from "./components/navbar";

    const lexend = Lexend({
      variable: "--font-lexend",
      subsets: ["latin"],
    });

export const metadata: Metadata = {
  title: "Ciné Swipe",
  description: "Swipe through your favorite movies",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${lexend.variable} antialiased bg-background text-primary min-h-screen flex flex-col`}
      >
        <Navbar />
        {children}
      </body>
    </html>
  );
}
