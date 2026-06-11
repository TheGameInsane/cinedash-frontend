import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import { AuthProvider } from "@/lib/AuthContext";
import "./globals.css";
import Navbar from "@/components/Navbar";

const outfit = Outfit({ 
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "CineDash — Your Personal Cinema Universe",
  description: "Track your watch history, get personalized recommendations, and explore cinema analytics — all in one beautiful dashboard.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${outfit.variable} font-sans bg-slate-950 text-slate-50 antialiased min-h-screen flex flex-col`}>
        <AuthProvider>
          <div className="absolute top-0 left-0 right-0 z-100">
            <Navbar />
          </div>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}