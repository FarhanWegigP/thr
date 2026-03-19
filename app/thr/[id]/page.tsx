    import { Redis } from "@upstash/redis";
const kv = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});
    import { notFound } from "next/navigation";
    import type { Metadata } from "next";
    import ThrClient from "./client";

    export interface ThrConfig {
    theme: "dark" | "pink" | "green";
    qrisUrl: string;
    memeUrls: string[];
    createdAt: number;
    }

    // Dynamic metadata per page
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
    const config = await kv.get<ThrConfig>(`thr:${params.id}`);

    if (!config) {
        notFound();
    }

    return <ThrClient config={config} />;
    }