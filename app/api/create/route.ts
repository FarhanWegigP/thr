import { put } from "@vercel/blob";
import { Redis } from "@upstash/redis";
import { nanoid } from "nanoid";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 30;

export type PaymentMethod = "qris" | "ewallet" | "rekening";

export interface ThrConfig {
  theme: "dark" | "pink" | "green";
  nama: string;
  ucapan: string;
  paymentMethod: PaymentMethod;
  // QRIS
  qrisUrl?: string;
  // E-wallet
  ewalletType?: string;   // "GoPay" | "OVO" | "Dana" | dll
  ewalletNumber?: string;
  ewalletName?: string;
  // Rekening
  bankName?: string;
  accountNumber?: string;
  accountName?: string;
  // Memes
  lebaranUrls: (string | null)[];
  thrUrls: (string | null)[];
  createdAt: number;
}

export async function POST(req: Request) {
  const kv = Redis.fromEnv();

  try {
    const formData = await req.formData();

    const theme = (formData.get("theme") as ThrConfig["theme"]) || "dark";
    const nama = (formData.get("nama") as string) || "";
    const ucapan = (formData.get("ucapan") as string) || "";
    const paymentMethod = (formData.get("paymentMethod") as PaymentMethod) || "qris";

    // Payment info
    let qrisUrl: string | undefined;
    let ewalletType: string | undefined;
    let ewalletNumber: string | undefined;
    let ewalletName: string | undefined;
    let bankName: string | undefined;
    let accountNumber: string | undefined;
    let accountName: string | undefined;

    if (paymentMethod === "qris") {
      const qrisFile = formData.get("qris") as File | null;
      if (!qrisFile || qrisFile.size === 0) {
        return NextResponse.json({ error: "QRIS wajib diupload" }, { status: 400 });
      }
      if (qrisFile.size > 5 * 1024 * 1024) {
        return NextResponse.json({ error: "QRIS terlalu besar, maks 5MB" }, { status: 400 });
      }
      const ext = qrisFile.name.split(".").pop() || "jpg";
      const { url } = await put(`thr/qris/${nanoid(12)}.${ext}`, qrisFile, { access: "public" });
      qrisUrl = url;

    } else if (paymentMethod === "ewallet") {
      ewalletType = (formData.get("ewalletType") as string) || "";
      ewalletNumber = (formData.get("ewalletNumber") as string) || "";
      ewalletName = (formData.get("ewalletName") as string) || "";
      if (!ewalletNumber.trim()) {
        return NextResponse.json({ error: "Nomor e-wallet wajib diisi" }, { status: 400 });
      }

    } else if (paymentMethod === "rekening") {
      bankName = (formData.get("bankName") as string) || "";
      accountNumber = (formData.get("accountNumber") as string) || "";
      accountName = (formData.get("accountName") as string) || "";
      if (!accountNumber.trim()) {
        return NextResponse.json({ error: "Nomor rekening wajib diisi" }, { status: 400 });
      }
    }

    // Memes
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
      theme, nama, ucapan, paymentMethod,
      qrisUrl, ewalletType, ewalletNumber, ewalletName,
      bankName, accountNumber, accountName,
      lebaranUrls, thrUrls,
      createdAt: Date.now(),
    };

    await kv.set(`thr:${id}`, config, { ex: 60 * 60 * 24 * 365 });
    return NextResponse.json({ id });

  } catch (err) {
    console.error("[/api/create]", err);
    return NextResponse.json({ error: "Server error, coba lagi" }, { status: 500 });
  }
}