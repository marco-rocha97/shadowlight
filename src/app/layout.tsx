import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Shadow Light Studios — Short‑form Content Agency",
  description:
    "Shadowlight.video is a short‑form video agency specializing in organic, paid, and UGC content for top‑tier creators, entrepreneurs, and brands.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
