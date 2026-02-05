import type { Metadata } from "next";
import {Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "next-themes";

// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

const inter=Inter({
  variable:"--font-inter"
})
export const metadata: Metadata = {
  title: "SYLLABUS",
  description: "  An adaptive study planner designed for Indian engineering students. No more last-minute panic. No more missed prerequisites.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} antialiased`}
      >
        <ThemeProvider attribute="class" defaultTheme='dark' enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
