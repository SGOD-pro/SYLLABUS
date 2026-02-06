import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
// import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { ClerkLoading, ClerkProvider } from "@clerk/nextjs";
import { AuthBootstrapper } from "@/components/auth/AuthBootstrapper";
import { ThemeProvider } from "@/components/theme-provider";

// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

const inter = Inter({
  variable: "--font-inter"
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
        <ClerkProvider>
            <ThemeProvider attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange>
              <Toaster />
              <AuthBootstrapper />
              {children}
            </ThemeProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
