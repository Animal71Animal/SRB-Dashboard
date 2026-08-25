import type { Metadata } from "next";
import "./globals.css";
import RootLayoutWrapper from "@/components/RootLayoutWrapper";
import AnimatedBackground from "@/components/AnimatedBackground";
import VenueSwitcher from "@/components/VenueSwitcher";

export const metadata: Metadata = {
  title: "The Torch Operations Center",
  description: "The Torch Boise — Promotions, Marketing & Operations",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ display: "flex", minHeight: "100vh" }}>
        <AnimatedBackground />
        <RootLayoutWrapper />
        <VenueSwitcher />
        <main
          className="toc-main"
          style={{
            flex: 1,
            padding: "32px 28px",
            overflowY: "auto",
            position: "relative",
            zIndex: 1,
            marginLeft: 0,
            paddingTop: "calc(var(--header-height) + 36px)",
          }}
        >
          {children}
        </main>
      </body>
    </html>
  );
}
