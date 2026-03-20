"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

type Theme = "dark" | "pink" | "green";

const THEMES: { id: Theme; label: string; bg: string; accent: string }[] = [
  { id: "dark",  label: "Dark",  bg: "#0D0A00", accent: "#E8C45A" },
  { id: "pink",  label: "Pink",  bg: "#1A0018", accent: "#FF78B8" },
  { id: "green", label: "Green", bg: "#001A08", accent: "#D4A020" },
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

function FotoGrid({ slots, defaults, label, onChange }: {
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

function MarqueePreview({ srcs, speed }: { srcs: string[]; speed: "slow" | "medium" }) {
  return (
    <div style={{ borderRadius: 10, overflow: "hidden", border: "0.5px solid var(--border)" }}>
      <div className="marquee-outer" style={{ WebkitMaskImage: "none", maskImage: "none" }}>
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

function ThrPreview({
  theme, nama, ucapan, qrisPreview, lebaranMemes, thrMemes, onClose,
}: {
  theme: Theme; nama: string; ucapan: string; qrisPreview: string | null;
  lebaranMemes: string[]; thrMemes: string[]; onClose: () => void;
}) {
  const [step, setStep] = useState<"idle" | "reaction" | "qris">("idle");
  const namaDisplay = nama.trim() || "Tio";
  const ucapanDisplay = ucapan.trim() || "Mohon maaf lahir batin ya 🌙";
  const qrisSrc = qrisPreview || "/qris.jpeg";

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 200,
      background: "rgba(0,0,0,0.88)",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", gap: 12,
      animation: "fadeup 0.3s ease both",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", maxWidth: 340, padding: "0 16px" }}>
        <p style={{ fontSize: 10, color: "#888", letterSpacing: "0.1em" }}>PREVIEW · bisa discroll & diklik</p>
        <button onClick={onClose} style={{ background: "transparent", border: "0.5px solid #444", borderRadius: "100px", color: "#888", fontSize: 11, fontFamily: "var(--mono)", padding: "4px 14px", cursor: "pointer" }}>tutup ✕</button>
      </div>

      <div style={{ width: 300, height: 560, background: "#111", borderRadius: 40, padding: "12px 8px", boxShadow: "0 0 0 1.5px #333, 0 32px 64px rgba(0,0,0,0.8), inset 0 0 0 1px #222", position: "relative", flexShrink: 0 }}>
        <div style={{ position: "absolute", top: 12, left: "50%", transform: "translateX(-50%)", width: 60, height: 12, background: "#111", borderRadius: "0 0 10px 10px", zIndex: 10 }} />
        <div style={{ position: "absolute", right: -3, top: 80, width: 3, height: 32, background: "#333", borderRadius: 2 }} />
        <div style={{ position: "absolute", left: -3, top: 70, width: 3, height: 22, background: "#333", borderRadius: 2 }} />
        <div style={{ position: "absolute", left: -3, top: 100, width: 3, height: 40, background: "#333", borderRadius: 2 }} />
        <div style={{ position: "absolute", left: -3, top: 148, width: 3, height: 40, background: "#333", borderRadius: 2 }} />

        <div style={{ width: "100%", height: "100%", borderRadius: 30, overflow: "hidden", background: "#000", position: "relative" }}>
          <div data-theme={theme} style={{ height: "100%", overflowY: "auto", overflowX: "hidden", background: "var(--bg)", color: "var(--text)", fontFamily: "var(--mono)", fontSize: "60%", position: "relative" }}>

            {step === "reaction" && (
              <div style={{ position: "absolute", inset: 0, background: "var(--bg)", zIndex: 10, display: "flex", flexDirection: "column", gap: 12, paddingTop: 20 }}>
                <div className="marquee-outer">
                  <div className="marquee-track medium">
                    {[...thrMemes, ...thrMemes].map((src, i) => (
                      <div className="meme-card" key={i} style={{ width: 80, height: 80 }}><img src={src} alt="" /></div>
                    ))}
                  </div>
                </div>
                <p style={{ fontFamily: "var(--serif)", fontSize: 36, fontWeight: 900, fontStyle: "italic", color: "var(--gold)", paddingLeft: 20, lineHeight: 1 }}>omg...</p>
                <p style={{ fontSize: 11, color: "var(--muted)", paddingLeft: 20, lineHeight: 1.8 }}>mau dikasih THR nih? 🥺<br />serius? beneran?<br />ya udah deh—</p>
                <button className="btn" style={{ marginLeft: 20, width: "fit-content" }} onClick={() => setStep("qris")}>y →</button>
              </div>
            )}

            <div style={{ padding: "24px 16px 16px", display: "flex", flexDirection: "column", gap: 12 }}>
              <span style={{ display: "inline-block", padding: "2px 10px", border: "0.5px solid color-mix(in srgb, var(--gold) 30%, transparent)", borderRadius: 100, fontSize: 7, color: "var(--gold)", letterSpacing: "0.1em" }}>✦ RAMADHAN 1446 H ✦</span>
              <div className="marquee-outer">
                <div className="marquee-track slow">
                  {[...lebaranMemes, ...lebaranMemes].map((src, i) => (
                    <div className="meme-card" key={i} style={{ width: 80, height: 80 }}><img src={src} alt="" /></div>
                  ))}
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                <p style={{ fontFamily: "var(--serif)", fontSize: 22, fontWeight: 900, lineHeight: 1, color: "var(--text)", flex: 1 }}>
                  Minal Aidzin<br /><span style={{ fontStyle: "italic", color: "var(--gold)" }}>Wal Faidzin.</span>
                </p>
                <div style={{ width: 32, height: 32, borderRadius: "50%", boxShadow: "inset -9px -3px 0 0 var(--gold)", flexShrink: 0, marginTop: 8 }} />
              </div>
              <p style={{ fontSize: 8, color: "var(--dim)" }}>dari {namaDisplay} 🌙</p>
            </div>

            <div className="divider" />

            <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: 8 }}>
              <p style={{ fontFamily: "var(--serif)", fontSize: 14, fontWeight: 700, fontStyle: "italic", color: "var(--gold)", lineHeight: 1.4 }}>"{ucapanDisplay}"</p>
              <p style={{ fontSize: 8, color: "var(--muted)" }}>— {namaDisplay}</p>
            </div>

            <div className="divider" />

            {step === "idle" && (
              <div style={{ padding: "12px 16px" }}>
                <button className="btn" style={{ fontSize: 10, padding: "8px 18px" }} onClick={() => setStep("reaction")}>kasih THR →</button>
              </div>
            )}

            {step === "qris" && (
              <div style={{ padding: "0 16px 32px", display: "flex", flexDirection: "column", gap: 10 }}>
                <div className="marquee-outer" style={{ margin: "16px 0 8px" }}>
                  <div className="marquee-track medium">
                    {[...thrMemes, ...thrMemes].map((src, i) => (
                      <div className="meme-card" key={i} style={{ width: 80, height: 80 }}><img src={src} alt="" /></div>
                    ))}
                  </div>
                </div>
                <p style={{ fontFamily: "var(--serif)", fontSize: 16, fontWeight: 700, color: "var(--text)" }}>Yeay dapet thr</p>
                <p style={{ fontSize: 9, color: "var(--muted)" }}>Nominal bebas. Yang penting ikhlas</p>
                <div style={{ background: "var(--surface)", border: "0.5px solid var(--border)", borderRadius: 10, padding: 10 }}>
                  <div style={{ borderRadius: 8, overflow: "hidden", background: "#fff" }}>
                    <img src={qrisSrc} alt="QRIS" style={{ width: "100%", display: "block" }} />
                  </div>
                  <p style={{ fontSize: 7, color: "var(--dim)", textAlign: "center", marginTop: 6, letterSpacing: "0.06em" }}>GoPay · OVO · Dana · Semua Bank</p>
                </div>
                <div style={{ textAlign: "center", paddingTop: 12 }}>
                  <p style={{ fontFamily: "var(--serif)", fontSize: 16, fontStyle: "italic", color: "var(--text)" }}>makasih orang baik</p>
                  <p style={{ fontSize: 8, color: "var(--dim)", marginTop: 4 }}>berkah selalu — {namaDisplay} 🌙</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <p style={{ fontSize: 9, color: "#555", letterSpacing: "0.06em" }}>scroll dalam layar untuk lihat selengkapnya</p>
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
  const [namaError, setNamaError] = useState(false);
  const [ucapan, setUcapan] = useState("");
  const [qrisFile, setQrisFile] = useState<File | null>(null);
  const [qrisPreview, setQrisPreview] = useState<string | null>(null);
  const [lebaranSlots, setLebaranSlots] = useState<MemeSlot[]>(Array(5).fill(null));
  const [thrSlots, setThrSlots] = useState<MemeSlot[]>(Array(4).fill(null));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const qrisInputRef = useRef<HTMLInputElement>(null);
  const namaRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

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
    if (!nama.trim()) {
      setNamaError(true);
      namaRef.current?.focus();
      return;
    }
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
  const canSubmit = !!nama.trim() && !!qrisFile && !loading;

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

      {showPreview && (
        <ThrPreview
          theme={theme} nama={nama} ucapan={ucapan} qrisPreview={qrisPreview}
          lebaranMemes={liveLebaranMemes} thrMemes={liveThrMemes}
          onClose={() => setShowPreview(false)}
        />
      )}

      <div className="gen-inner">

        {/* Header */}
        <div className="gen-header">
          <span className="badge">✦ RAMADHAN 1446 H ✦</span>
          <div className="title-wrap" style={{ marginTop: 8 }}>
            <h1 className="title" style={{ fontSize: "clamp(26px, 8vw, 40px)" }}>
              Kirim ucapan,<br />
              <span className="accent">Tunggu transferan.</span>
            </h1>
            <div className="crescent" style={{ width: 48, height: 48, marginTop: 12 }} />
          </div>
          <p className="subtitle">Pilih tema · tulis ucapan · upload QRIS · share linknya.</p>
        </div>

        {/* 01 Tema */}
        <div className="gen-section">
          <p className="gen-label">01 / Tema</p>
          <div className="theme-grid">
            {THEMES.map((t) => (
              <button key={t.id} className={`theme-card ${theme === t.id ? "active" : ""}`} onClick={() => setTheme(t.id)}>
                <div className="theme-preview" style={{ background: t.bg }}>
                  <div className="theme-preview-moon" style={{ boxShadow: `inset -7px -3px 0 0 ${t.accent}` }} />
                  <div className="theme-preview-bar" style={{ background: t.accent }} />
                  <div className="theme-preview-bar short" style={{ background: t.accent }} />
                </div>
                <p className="theme-label">{t.label}</p>
              </button>
            ))}
          </div>
        </div>

        {/* 02 Nama & Ucapan */}
        <div className="gen-section">
          <p className="gen-label">02 / Nama & Ucapan</p>
          <div style={{ position: "relative" }}>
            <input
              ref={namaRef}
              className="gen-input"
              type="text"
              placeholder="Nama kamu — wajib diisi"
              value={nama}
              maxLength={40}
              onChange={(e) => { setNama(e.target.value); if (e.target.value.trim()) setNamaError(false); }}
              style={{ borderColor: namaError ? "#ff6b6b" : undefined }}
            />
            {namaError && (
              <p style={{ fontSize: 10, color: "#ff6b6b", marginTop: 4, letterSpacing: "0.04em" }}>
                ⚠ nama wajib diisi dulu
              </p>
            )}
          </div>
          <textarea
            className="gen-textarea"
            placeholder={"Tulis ucapan kamu di sini...\nmisal: Mohon maaf lahir batin ya bestie 🌙"}
            value={ucapan}
            maxLength={300}
            rows={4}
            onChange={(e) => setUcapan(e.target.value)}
          />
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

        {/* 04 Foto */}
        <div className="gen-section">
          <p className="gen-label">04 / Upload foto kamu <span style={{ color: "var(--dim)", textTransform: "none" }}>(opsional)</span></p>
          <p className="gen-body" style={{ fontSize: 12 }}>Hover tiap gambar untuk ganti. Default dipakai kalau nggak diganti.</p>

          <FotoGrid slots={lebaranSlots} defaults={DEFAULT_LEBARAN} label="FOTO UCAPAN LEBARAN (5 gambar)" onChange={updateLebaran} />
          <MarqueePreview srcs={liveLebaranMemes} speed="slow" />

          <FotoGrid slots={thrSlots} defaults={DEFAULT_THR} label="FOTO NGEMIS THR 😂 (4 gambar)" onChange={updateThr} />
          <MarqueePreview srcs={liveThrMemes} speed="medium" />
        </div>

        {/* Generate */}
        <div className="gen-section">
          <button
            className="btn-sm"
            style={{ width: "100%", textAlign: "center", padding: "12px" }}
            onClick={() => setShowPreview(true)}
          >
            👁 lihat tampilan dulu
          </button>
          <button
            className={`btn gen-btn ${!canSubmit ? "disabled" : ""}`}
            onClick={handleSubmit}
            disabled={!canSubmit}
            style={{
              borderColor: canSubmit ? currentTheme.accent : undefined,
              color: canSubmit ? currentTheme.accent : undefined,
            }}
          >
            {loading ? "generating..." : "Buat halaman THR →"}
          </button>
          {!nama.trim() && <p className="upload-hint">isi nama dulu ya ↑</p>}
          {nama.trim() && !qrisFile && <p className="upload-hint">upload QRIS dulu ya ↑</p>}
          {error && <p className="gen-error">⚠ {error}</p>}
        </div>

      </div>
    </main>
  );
}