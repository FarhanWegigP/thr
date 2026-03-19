"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

type Theme = "dark" | "pink" | "green";

const THEMES: {
  id: Theme;
  label: string;
  emoji: string;
  bg: string;
  accent: string;
  surface: string;
}[] = [
  {
    id: "dark",
    label: "Malam Emas",
    emoji: "🌙",
    bg: "#0D0A00",
    accent: "#E8C45A",
    surface: "#1A1500",
  },
  {
    id: "pink",
    label: "Manis",
    emoji: "🌸",
    bg: "#1A0018",
    accent: "#FF78B8",
    surface: "#260020",
  },
  {
    id: "green",
    label: "Lebaran",
    emoji: "🌿",
    bg: "#001A08",
    accent: "#D4A020",
    surface: "#002410",
  },
];

export default function GeneratorPage() {
  const [theme, setTheme] = useState<Theme>("dark");
  const [qrisFile, setQrisFile] = useState<File | null>(null);
  const [qrisPreview, setQrisPreview] = useState<string | null>(null);
  const [memeFiles, setMemeFiles] = useState<File[]>([]);
  const [useMemes, setUseMemes] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const qrisInputRef = useRef<HTMLInputElement>(null);
  const memeInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleQrisChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setQrisFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setQrisPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleMemeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setMemeFiles((prev) => [...prev, ...files].slice(0, 9));
    // reset input so same file can be re-added after removal
    e.target.value = "";
  };

  const removeMeme = (idx: number) => {
    setMemeFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async () => {
    if (!qrisFile || loading) return;
    setLoading(true);
    setError(null);

    const fd = new FormData();
    fd.append("theme", theme);
    fd.append("qris", qrisFile);
    if (useMemes) {
      memeFiles.forEach((f) => fd.append("memes", f));
    }

    try {
      const res = await fetch("/api/create", { method: "POST", body: fd });
      if (!res.ok) throw new Error("Gagal generate, coba lagi ya");
      const { id } = await res.json();
      router.push(`/thr/${id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  };

  const currentTheme = THEMES.find((t) => t.id === theme)!;

  return (
    <main className="main" data-theme={theme}>
      {/* Stars */}
      <div className="stars" aria-hidden>
        {Array.from({ length: 30 }).map((_, i) => (
          <div
            key={i}
            className="star"
            style={{
              width: `${Math.random() * 2 + 1}px`,
              height: `${Math.random() * 2 + 1}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDuration: `${(Math.random() * 3 + 2).toFixed(1)}s`,
              animationDelay: `${(Math.random() * 4).toFixed(1)}s`,
            }}
          />
        ))}
      </div>

      <div className="gen-inner">
        {/* Header */}
        <div className="gen-header">
          <span className="badge">✦ BUAT THR KAMU ✦</span>
          <h1 className="title" style={{ fontSize: "clamp(28px, 9vw, 44px)", marginTop: "8px" }}>
            Bikin Halaman<br />
            <span className="accent">THR-mu.</span>
          </h1>
          <p className="subtitle">
            Pilih tema · upload QRIS · share linknya.<br />
            Selesai dalam 30 detik.
          </p>
        </div>

        {/* Step 1: Theme */}
        <div className="gen-section">
          <p className="gen-label">01 / Pilih Tema</p>
          <div className="theme-grid">
            {THEMES.map((t) => (
              <button
                key={t.id}
                className={`theme-card ${theme === t.id ? "active" : ""}`}
                onClick={() => setTheme(t.id)}
                style={
                  {
                    "--t-bg": t.bg,
                    "--t-accent": t.accent,
                    "--t-surface": t.surface,
                  } as React.CSSProperties
                }
              >
                <div className="theme-preview" style={{ background: t.bg }}>
                  <div
                    className="theme-preview-moon"
                    style={{
                      boxShadow: `inset -7px -3px 0 0 ${t.accent}`,
                    }}
                  />
                  <div
                    className="theme-preview-bar"
                    style={{ background: t.accent }}
                  />
                  <div
                    className="theme-preview-bar short"
                    style={{ background: t.accent }}
                  />
                </div>
                <p className="theme-label">
                  {t.emoji} {t.label}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Step 2: QRIS */}
        <div className="gen-section">
          <p className="gen-label">02 / Upload QRIS kamu</p>
          <div
            className={`upload-zone ${qrisPreview ? "has-preview" : ""}`}
            onClick={() => qrisInputRef.current?.click()}
          >
            {qrisPreview ? (
              <img
                src={qrisPreview}
                alt="Preview QRIS"
                className="upload-preview"
              />
            ) : (
              <>
                <p className="upload-icon">⬆</p>
                <p className="upload-text">
                  Screenshot QRIS GoPay / OVO / Dana
                </p>
                <p className="upload-hint">jpg · png · webp · maks 5MB</p>
              </>
            )}
          </div>
          <input
            ref={qrisInputRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleQrisChange}
          />
          {qrisPreview && (
            <button
              className="btn-sm"
              onClick={(e) => {
                e.stopPropagation();
                setQrisFile(null);
                setQrisPreview(null);
                if (qrisInputRef.current) qrisInputRef.current.value = "";
              }}
            >
              ganti foto
            </button>
          )}
        </div>

        {/* Step 3: Memes */}
        <div className="gen-section">
          <p className="gen-label">
            03 / Meme{" "}
            <span style={{ color: "var(--dim)", textTransform: "none" }}>
              (opsional)
            </span>
          </p>
          <div className="toggle-row">
            <p className="gen-body">Mau pakai meme sendiri?</p>
            <button
              className={`toggle ${!useMemes ? "on" : ""}`}
              onClick={() => setUseMemes(false)}
            >
              Pakai default
            </button>
            <button
              className={`toggle ${useMemes ? "on" : ""}`}
              onClick={() => setUseMemes(true)}
            >
              Upload sendiri
            </button>
          </div>

          {useMemes && (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <div className="meme-upload-grid">
                {memeFiles.map((f, i) => (
                  <div className="meme-thumb" key={i}>
                    <img src={URL.createObjectURL(f)} alt={`meme ${i + 1}`} />
                    <button className="meme-remove" onClick={() => removeMeme(i)}>
                      ✕
                    </button>
                  </div>
                ))}
                {memeFiles.length < 9 && (
                  <div
                    className="meme-add"
                    onClick={() => memeInputRef.current?.click()}
                  >
                    +
                  </div>
                )}
              </div>
              <input
                ref={memeInputRef}
                type="file"
                accept="image/*"
                multiple
                style={{ display: "none" }}
                onChange={handleMemeChange}
              />
              <p className="upload-hint">
                {memeFiles.length}/9 gambar · bisa lebaran, lucu-lucu, bebas
              </p>
            </div>
          )}
        </div>

        {/* Generate */}
        <div className="gen-section">
          <button
            className={`btn gen-btn ${!qrisFile || loading ? "disabled" : ""}`}
            onClick={handleSubmit}
            disabled={!qrisFile || loading}
            style={{
              borderColor: qrisFile && !loading ? currentTheme.accent : undefined,
              color: qrisFile && !loading ? currentTheme.accent : undefined,
            }}
          >
            {loading ? "generating..." : "Buat halaman THR →"}
          </button>
          {!qrisFile && (
            <p className="upload-hint">upload QRIS dulu ya ↑</p>
          )}
          {error && <p className="gen-error">⚠ {error}</p>}
        </div>
      </div>
    </main>
  );
}