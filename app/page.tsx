"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

type Theme = "dark" | "pink" | "green";

const THEMES: { id: Theme; label: string; emoji: string; bg: string; accent: string }[] = [
  { id: "dark",  label: "Malam Emas", emoji: "🌙", bg: "#0D0A00", accent: "#E8C45A" },
  { id: "pink",  label: "Manis",      emoji: "🌸", bg: "#1A0018", accent: "#FF78B8" },
  { id: "green", label: "Lebaran",    emoji: "🌿", bg: "#001A08", accent: "#D4A020" },
];

const DEFAULT_LEBARAN = [
  "/memes/lebaran1.jpeg","/memes/lebaran2.jpeg","/memes/lebaran3.jpeg",
  "/memes/lebaran4.jpeg","/memes/lebaran5.jpeg",
];
const DEFAULT_THR = [
  "/memes/thr1.jpeg","/memes/thr2.jpeg","/memes/thr3.jpeg","/memes/thr4.jpeg",
];

async function compressImage(file: File, maxWidth = 1200, quality = 0.82): Promise<File> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const scale = Math.min(1, maxWidth / img.width);
      const canvas = document.createElement("canvas");
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(
        (blob) => resolve(new File([blob!], file.name, { type: "image/jpeg" })),
        "image/jpeg", quality
      );
      URL.revokeObjectURL(url);
    };
    img.src = url;
  });
}

type MemeSlot = File | null;

function MemeGrid({ slots, defaults, label, onChange }: {
  slots: MemeSlot[];
  defaults: string[];
  label: string;
  onChange: (idx: number, file: File | null) => void;
}) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>, idx: number) => {
    const file = e.target.files?.[0];
    if (!file) return;
    onChange(idx, await compressImage(file));
    e.target.value = "";
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      <p className="upload-hint" style={{ textAlign: "left", letterSpacing: "0.1em", color: "var(--gold)", fontSize: "10px" }}>
        {label}
      </p>
      <div className="meme-upload-grid">
        {slots.map((slot, idx) => {
          const preview = slot ? URL.createObjectURL(slot) : defaults[idx];
          return (
            <div className="meme-thumb" key={idx}>
              <img src={preview} alt={`slot ${idx + 1}`} />
              <div className="meme-thumb-overlay" style={{
                position: "absolute", inset: 0, display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center", gap: "4px",
                background: "rgba(0,0,0,0.45)", opacity: 0, transition: "opacity 0.2s",
              }}>
                <button className="meme-action-btn" onClick={() => inputRefs.current[idx]?.click()}>ganti</button>
                {slot && <button className="meme-action-btn meme-action-reset" onClick={() => onChange(idx, null)}>reset</button>}
              </div>
              {slot && <div style={{ position: "absolute", top: 4, left: 4, width: 8, height: 8, borderRadius: "50%", background: "var(--gold)" }} />}
              <input ref={(el) => { inputRefs.current[idx] = el; }} type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => handleChange(e, idx)} />
            </div>
          );
        })}
      </div>
      <p className="upload-hint">• = sudah diganti · hover untuk ganti/reset</p>
    </div>
  );
}

// Mini marquee preview strip
function MarqueePreview({ srcs, speed }: { srcs: string[]; speed: "slow" | "medium" }) {
  return (
    <div style={{ borderRadius: 10, overflow: "hidden", border: "0.5px solid var(--border)" }}>
      <div className="marquee-outer" style={{ mask: "none", WebkitMaskImage: "none" }}>
        <div className={`marquee-track ${speed}`} style={{ gap: 6 }}>
          {[...srcs, ...srcs].map((src, i) => (
            <div key={i} style={{ width: 72, height: 72, borderRadius: 8, overflow: "hidden", flexShrink: 0, background: "var(--surface)" }}>
              <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
          ))}
        </div>
      </div>
      <p style={{ fontSize: 9, color: "var(--dim)", textAlign: "center", padding: "5px 0", letterSpacing: "0.06em" }}>
        preview gerak ↑
      </p>
    </div>
  );
}

// Phone mockup with iframe
function PhoneMockup({ src }: { src: string }) {
  return (
    <div style={{
      position: "sticky", top: 24,
      display: "flex", flexDirection: "column", alignItems: "center", gap: 12,
    }}>
      <p className="gen-label" style={{ alignSelf: "flex-start" }}>LIVE PREVIEW</p>
      <div style={{
        width: 220, height: 440,
        background: "#111",
        borderRadius: 32,
        padding: "10px 6px",
        boxShadow: "0 0 0 1.5px #333, 0 0 40px rgba(0,0,0,0.6), inset 0 0 0 1px #222",
        position: "relative",
      }}>
        {/* notch */}
        <div style={{
          position: "absolute", top: 10, left: "50%", transform: "translateX(-50%)",
          width: 50, height: 10, background: "#111",
          borderRadius: "0 0 8px 8px", zIndex: 10,
        }} />
        <div style={{
          width: "100%", height: "100%",
          borderRadius: 24, overflow: "hidden",
          background: "#000",
        }}>
          <iframe
            src={src}
            style={{ width: "100%", height: "100%", border: "none", transform: "scale(1)", transformOrigin: "top left" }}
            title="preview"
          />
        </div>
      </div>
      <p style={{ fontSize: 9, color: "var(--dim)", letterSpacing: "0.06em" }}>interaktif · bisa diklik</p>
    </div>
  );
}

const STARS = Array.from({ length: 30 }, (_, i) => ({
  w: ((i * 7 + 3) % 20) / 10 + 1,
  top: ((i * 37 + 11) % 100),
  left: ((i * 53 + 17) % 100),
  dur: ((i * 13 + 20) % 30) / 10 + 2,
  delay: ((i * 19 + 5) % 40) / 10,
}));

export default function GeneratorPage() {
  const [theme, setTheme] = useState<Theme>("dark");
  const [nama, setNama] = useState("");
  const [ucapan, setUcapan] = useState("");
  const [qrisFile, setQrisFile] = useState<File | null>(null);
  const [qrisPreview, setQrisPreview] = useState<string | null>(null);
  const [lebaranSlots, setLebaranSlots] = useState<MemeSlot[]>(Array(5).fill(null));
  const [thrSlots, setThrSlots] = useState<MemeSlot[]>(Array(4).fill(null));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewSrc, setPreviewSrc] = useState("/preview?theme=dark");

  const qrisInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Update iframe src whenever theme/nama/ucapan changes (debounced)
  useEffect(() => {
    const t = setTimeout(() => {
      const params = new URLSearchParams({
        theme,
        nama: nama || "Tio",
        ucapan: ucapan || "Mohon maaf lahir batin ya 🌙",
      });
      setPreviewSrc(`/preview?${params.toString()}`);
    }, 600);
    return () => clearTimeout(t);
  }, [theme, nama, ucapan]);

  const liveLebaranMemes = lebaranSlots.map((s, i) => s ? URL.createObjectURL(s) : DEFAULT_LEBARAN[i]);
  const liveThrMemes = thrSlots.map((s, i) => s ? URL.createObjectURL(s) : DEFAULT_THR[i]);

  const handleQrisChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const compressed = await compressImage(file, 1200, 0.85);
    setQrisFile(compressed);
    setQrisPreview(URL.createObjectURL(compressed));
  };

  const updateLebaran = (idx: number, file: File | null) =>
    setLebaranSlots((prev) => { const n = [...prev]; n[idx] = file; return n; });
  const updateThr = (idx: number, file: File | null) =>
    setThrSlots((prev) => { const n = [...prev]; n[idx] = file; return n; });

  const handleSubmit = async () => {
    if (!qrisFile || loading) return;
    setLoading(true);
    setError(null);
    const fd = new FormData();
    fd.append("theme", theme);
    fd.append("nama", nama.trim());
    fd.append("ucapan", ucapan.trim());
    fd.append("qris", qrisFile);
    lebaranSlots.forEach((f, i) => { if (f) fd.append(`lebaran_${i}`, f); });
    thrSlots.forEach((f, i) => { if (f) fd.append(`thr_${i}`, f); });
    try {
      const res = await fetch("/api/create", { method: "POST", body: fd });
      if (!res.ok) { const b = await res.json().catch(() => ({})); throw new Error(b.error || "Gagal generate"); }
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
      <div className="stars" aria-hidden>
        {STARS.map((s, i) => (
          <div key={i} className="star" style={{
            width: `${s.w}px`, height: `${s.w}px`,
            top: `${s.top}%`, left: `${s.left}%`,
            animationDuration: `${s.dur}s`, animationDelay: `${s.delay}s`,
          }} />
        ))}
      </div>

      {/* 2-column layout on wide screen */}
      <div style={{
        display: "flex",
        gap: 0,
        maxWidth: 900,
        margin: "0 auto",
        alignItems: "flex-start",
      }}>
        {/* ── LEFT: FORM ── */}
        <div className="gen-inner" style={{ flex: 1, minWidth: 0 }}>

          {/* Header */}
          <div className="gen-header">
            <span className="badge">✦ BUAT THR KAMU ✦</span>
            <div className="title-wrap" style={{ marginTop: 8 }}>
              <h1 className="title" style={{ fontSize: "clamp(28px, 9vw, 44px)" }}>
                Bikin Halaman<br /><span className="accent">THR-mu.</span>
              </h1>
              <div className="crescent" style={{ width: 48, height: 48, marginTop: 12 }} />
            </div>
            <p className="subtitle">Pilih tema · tulis ucapan · upload QRIS · share linknya.</p>
          </div>

          {/* 01 Theme */}
          <div className="gen-section">
            <p className="gen-label">01 / Pilih Tema</p>
            <div className="theme-grid">
              {THEMES.map((t) => (
                <button key={t.id} className={`theme-card ${theme === t.id ? "active" : ""}`} onClick={() => setTheme(t.id)}>
                  <div className="theme-preview" style={{ background: t.bg }}>
                    <div className="theme-preview-moon" style={{ boxShadow: `inset -7px -3px 0 0 ${t.accent}` }} />
                    <div className="theme-preview-bar" style={{ background: t.accent }} />
                    <div className="theme-preview-bar short" style={{ background: t.accent }} />
                  </div>
                  <p className="theme-label">{t.emoji} {t.label}</p>
                </button>
              ))}
            </div>
          </div>

          {/* 02 Nama & Ucapan */}
          <div className="gen-section">
            <p className="gen-label">02 / Nama & Ucapan</p>
            <input className="gen-input" type="text" placeholder="Nama kamu (misal: Tio)" value={nama} maxLength={40} onChange={(e) => setNama(e.target.value)} />
            <textarea className="gen-textarea" placeholder={"Tulis ucapan kamu di sini...\nmisal: Mohon maaf lahir batin ya bestie 🌙"} value={ucapan} maxLength={300} rows={4} onChange={(e) => setUcapan(e.target.value)} />
            <p className="upload-hint" style={{ textAlign: "right" }}>{ucapan.length}/300</p>
          </div>

          {/* 03 QRIS */}
          <div className="gen-section">
            <p className="gen-label">03 / Upload QRIS kamu</p>
            <div className={`upload-zone ${qrisPreview ? "has-preview" : ""}`} onClick={() => qrisInputRef.current?.click()}>
              {qrisPreview ? (
                <img src={qrisPreview} alt="Preview QRIS" className="upload-preview" />
              ) : (
                <>
                  <p className="upload-icon">⬆</p>
                  <p className="upload-text">Screenshot QRIS GoPay / OVO / Dana</p>
                  <p className="upload-hint">jpg · png · webp · auto-compress</p>
                </>
              )}
            </div>
            <input ref={qrisInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleQrisChange} />
            {qrisPreview && (
              <button className="btn-sm" onClick={(e) => { e.stopPropagation(); setQrisFile(null); setQrisPreview(null); if (qrisInputRef.current) qrisInputRef.current.value = ""; }}>
                ganti foto
              </button>
            )}
          </div>

          {/* 04 Memes */}
          <div className="gen-section">
            <p className="gen-label">04 / Meme <span style={{ color: "var(--dim)", textTransform: "none" }}>(opsional)</span></p>
            <p className="gen-body" style={{ fontSize: 12 }}>Hover tiap gambar untuk ganti. Preview marquee langsung update.</p>

            <MemeGrid slots={lebaranSlots} defaults={DEFAULT_LEBARAN} label="MARQUEE LEBARAN (5 gambar)" onChange={updateLebaran} />
            {/* Mini marquee preview lebaran */}
            <MarqueePreview srcs={liveLebaranMemes} speed="slow" />

            <MemeGrid slots={thrSlots} defaults={DEFAULT_THR} label="MARQUEE MINTA THR (4 gambar)" onChange={updateThr} />
            {/* Mini marquee preview thr */}
            <MarqueePreview srcs={liveThrMemes} speed="medium" />
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
            {!qrisFile && <p className="upload-hint">upload QRIS dulu ya ↑</p>}
            {error && <p className="gen-error">⚠ {error}</p>}
          </div>
        </div>

        {/* ── RIGHT: PHONE MOCKUP (hidden on mobile) ── */}
        <div style={{
          width: 280, flexShrink: 0,
          padding: "48px 24px 48px 0",
          display: "none",
        }} className="phone-mockup-col">
          <PhoneMockup src={previewSrc} />
        </div>
      </div>
    </main>
  );
}