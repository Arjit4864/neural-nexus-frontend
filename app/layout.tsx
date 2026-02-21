import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { CursorSpotlight } from "./components/CursorSpotlight";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Neural Nexus | AI Interview Prep",
  description: "An intelligent command center to automate and master the interview process.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="aurora-background"></div>
        <CursorSpotlight />
        {children}
      </body>
    </html>
  );
}