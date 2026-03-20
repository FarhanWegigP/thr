import { Redis } from "@upstash/redis";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ThrClient from "./client";

export const dynamic = "force-dynamic";

export type PaymentMethod = "qris" | "ewallet" | "rekening";

export interface ThrConfig {
  theme: "dark" | "pink" | "green";
  nama: string;
  ucapan: string;
  paymentMethod: PaymentMethod;
  qrisUrl?: string;
  ewalletType?: string;
  ewalletNumber?: string;
  ewalletName?: string;
  bankName?: string;
  accountNumber?: string;
  accountName?: string;
  lebaranUrls: (string | null)[];
  thrUrls: (string | null)[];
  createdAt: number;
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  return {
    title: "Ucapan Lebaran",
    description: "ada pesan penting buat kamu...",
    openGraph: { title: "Ucapan Lebaran", description: "ada ucapan lebaran buat kamu..." },
  };
}

export default async function ThrPage({ params }: { params: { id: string } }) {
  const kv = Redis.fromEnv();
  const config = await kv.get<ThrConfig>(`thr:${params.id}`);
  if (!config) notFound();
  return <ThrClient config={config} />;
}