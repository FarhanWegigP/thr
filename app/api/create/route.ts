    import { put } from "@vercel/blob";
    import { Redis } from "@upstash/redis";
const kv = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

    import { nanoid } from "nanoid";
    import { NextResponse } from "next/server";

    export const runtime = "nodejs";
    // Allow large file uploads (memes + QRIS)
    export const maxDuration = 30;

    export interface ThrConfig {
    theme: "dark" | "pink" | "green";
    qrisUrl: string;
    memeUrls: string[];
    createdAt: number;
    }

    export async function POST(req: Request) {
    try {
        const formData = await req.formData();

        const theme = (formData.get("theme") as ThrConfig["theme"]) || "dark";
        const qrisFile = formData.get("qris") as File | null;
        const memeFiles = formData.getAll("memes") as File[];

        if (!qrisFile) {
        return NextResponse.json({ error: "QRIS wajib diisi" }, { status: 400 });
        }

        // Validate QRIS file size (max 5MB)
        if (qrisFile.size > 5 * 1024 * 1024) {
        return NextResponse.json(
            { error: "QRIS terlalu besar, maks 5MB" },
            { status: 400 }
        );
        }

        // Upload QRIS → Vercel Blob
        const qrisExt = qrisFile.name.split(".").pop() || "jpg";
        const { url: qrisUrl } = await put(
        `thr/qris/${nanoid(12)}.${qrisExt}`,
        qrisFile,
        { access: "public" }
        );

        // Upload custom memes (if any) → Vercel Blob
        const memeUrls: string[] = [];
        for (const meme of memeFiles.slice(0, 9)) {
        // Max 9 memes, max 3MB each
        if (meme.size > 3 * 1024 * 1024) continue;
        const ext = meme.name.split(".").pop() || "jpg";
        const { url } = await put(
            `thr/memes/${nanoid(12)}.${ext}`,
            meme,
            { access: "public" }
        );
        memeUrls.push(url);
        }

        // Save config → Vercel KV (TTL: 1 year)
        const id = nanoid(8);
        const config: ThrConfig = {
        theme,
        qrisUrl,
        memeUrls,
        createdAt: Date.now(),
        };

        await kv.set(`thr:${id}`, config, { ex: 60 * 60 * 24 * 365 });

        return NextResponse.json({ id });
    } catch (err) {
        console.error("[/api/create]", err);
        return NextResponse.json(
        { error: "Server error, coba lagi" },
        { status: 500 }
        );
    }
    }