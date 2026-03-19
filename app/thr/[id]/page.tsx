import { Redis } from "@upstash/redis";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ThrClient from "./client";

export const dynamic = "force-dynamic";

export interface ThrConfig {
  theme: "dark" | "pink" | "green";
  nama: string;
  ucapan: string;
  qrisUrl: string;
  lebaranUrls: (string | null)[];
  thrUrls: (string | null)[];
  createdAt: number;
}

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  return {
    title: "THR 🌙",
    description: "ada pesan penting buat kamu...",
    openGraph: {
      title: "THR 🌙",
      description: "ada yang mau disampaiin...",
    },
  };
}

export default async function ThrPage({
  params,
}: {
  params: { id: string };
}) {
  const kv = Redis.fromEnv();
  const config = await kv.get<ThrConfig>(`thr:${params.id}`);

  if (!config) {
    notFound();
  }

  return <ThrClient config={config} />;
}