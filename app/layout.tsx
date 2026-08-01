import type { Metadata } from "next";
import "./globals.css";
import RootLayoutWrapper from "@/components/RootLayoutWrapper";
import AnimatedBackground from "@/components/AnimatedBackground";

export const metadata: Metadata = {
  title: "The Torch Marketing Hub",
  description: "The Torch Boise — Promotions & Marketing Dashboard",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ display: "flex", minHeight: "100vh" }}>
        <AnimatedBackground />
        <RootLayoutWrapper />
        <main className="main-content" style={{
          flex: 1, padding: "32px 28px", overflowY: "auto",
          position: "relative", zIndex: 1, marginLeft: 0,
        }}>
          {children}
        </main>
        <style>{`
          @media (min-width: 769px) { .main-content { margin-left: 220px !important; } }
          @media (max-width: 768px) {
            .main-content {
              margin-left: 0 !important;
              padding: 80px 16px 32px !important;
              width: 100vw; max-width: 100vw; box-sizing: border-box;
            }
          }
        `}</style>
      </body>
    </html>
  );
}
