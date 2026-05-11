import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PolyPost — write once, post everywhere",
  description: "Compose once, fan it out to X, LinkedIn, Instagram, Threads, Bluesky and more. Schedule, queue, ship.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
