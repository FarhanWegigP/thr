import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Buat Ucapanmu ",
  openGraph: {
    title: "Ucapan Lebaran ",
    description: "ada ucapan lebaran buat kamu...",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}