import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "THR dari Tio 🌙",
  description: "ada pesan penting dari Tio buat kamu...",
  openGraph: {
    title: "THR dari Tio 🌙",
    description: "ada yang mau Tio sampein...",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
