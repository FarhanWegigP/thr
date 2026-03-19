import { put } from "@vercel/blob";
import { Redis } from "@upstash/redis";
import { nanoid } from "nanoid";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 30;

export interface ThrConfig {
  theme: "dark" | "pink" | "green";
  nama: string;
  ucapan: string;
  qrisUrl: string;
  lebaranUrls: (string | null)[];  // null = pakai default
  thrUrls: (string | null)[];      // null = pakai default
  createdAt: number;
}

export async function POST(req: Request) {
  const kv = Redis.fromEnv();

  try {
    const formData = await req.formData();

    const theme = (formData.get("theme") as ThrConfig["theme"]) || "dark";
    const nama = (formData.get("nama") as string) || "";
    const ucapan = (formData.get("ucapan") as string) || "";
    const qrisFile = formData.get("qris") as File | null;

    if (!qrisFile) {
      return NextResponse.json({ error: "QRIS wajib diisi" }, { status: 400 });
    }

    if (qrisFile.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "QRIS terlalu besar, maks 5MB" }, { status: 400 });
    }

    // Upload QRIS
    const qrisExt = qrisFile.name.split(".").pop() || "jpg";
    const { url: qrisUrl } = await put(
      `thr/qris/${nanoid(12)}.${qrisExt}`,
      qrisFile,
      { access: "public" }
    );

    // Upload lebaran memes (slot 0–4, null if not uploaded)
    const lebaranUrls: (string | null)[] = [];
    for (let i = 0; i < 5; i++) {
      const file = formData.get(`lebaran_${i}`) as File | null;
      if (file && file.size > 0) {
        const ext = file.name.split(".").pop() || "jpg";
        const { url } = await put(`thr/memes/${nanoid(12)}.${ext}`, file, { access: "public" });
        lebaranUrls.push(url);
      } else {
        lebaranUrls.push(null);
      }
    }

    // Upload THR memes (slot 0–3, null if not uploaded)
    const thrUrls: (string | null)[] = [];
    for (let i = 0; i < 4; i++) {
      const file = formData.get(`thr_${i}`) as File | null;
      if (file && file.size > 0) {
        const ext = file.name.split(".").pop() || "jpg";
        const { url } = await put(`thr/memes/${nanoid(12)}.${ext}`, file, { access: "public" });
        thrUrls.push(url);
      } else {
        thrUrls.push(null);
      }
    }

    const id = nanoid(8);
    const config: ThrConfig = {
      theme,
      nama,
      ucapan,
      qrisUrl,
      lebaranUrls,
      thrUrls,
      createdAt: Date.now(),
    };

    await kv.set(`thr:${id}`, config, { ex: 60 * 60 * 24 * 365 });

    return NextResponse.json({ id });
  } catch (err) {
    console.error("[/api/create]", err);
    return NextResponse.json({ error: "Server error, coba lagi" }, { status: 500 });
  }
}