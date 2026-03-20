"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

type Theme = "dark" | "pink" | "green";
type PaymentMethod = "qris" | "ewallet" | "rekening";

const THEMES: { id: Theme; label: string; bg: string; accent: string }[] = [
  { id: "dark",  label: "Dark",  bg: "#0D0A00", accent: "#E8C45A" },
  { id: "pink",  label: "Pink",  bg: "#1A0018", accent: "#FF78B8" },
  { id: "green", label: "Green", bg: "#001A08", accent: "#D4A020" },
];

const EWALLET_OPTIONS = ["GoPay", "OVO", "Dana", "ShopeePay", "LinkAja"];

const DEFAULT_LEBARAN = [
  "/memes/lebaran1.jpeg","/memes/lebaran2.jpeg","/memes/lebaran3.jpeg",
  "/memes/lebaran4.jpeg","/memes/lebaran5.jpeg",
];
const DEFAULT_THR = [
  "/memes/thr1.jpeg","/memes/thr2.jpeg","/memes/thr3.jpeg","/memes/thr4.jpeg",
];

const STARS = Array.from({ length: 30 }, (_, i) => ({
  w: ((i * 7 + 3) % 20) / 10 + 1,
  top: ((i * 37 + 11) % 100),
  left: ((i * 53 + 17) % 100),
  dur: ((i * 13 + 20) % 30) / 10 + 2,
  delay: ((i * 19 + 5) % 40) / 10,
}));

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
  slots: MemeSlot[]; defaults: string[]; label: string;
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
      <p className="upload-hint" style={{ textAlign: "left", letterSpacing: "0.1em", color: "var(--gold)", fontSize: "10px" }}>{label}</p>
      <div className="meme-upload-grid">
        {slots.map((slot, idx) => {
          const preview = slot ? URL.createObjectURL(slot) : defaults[idx];
          return (
            <div className="meme-thumb" key={idx}>
              <img src={preview} alt={`slot ${idx + 1}`} />
              <div className="meme-thumb-overlay" style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "4px", background: "rgba(0,0,0,0.45)", opacity: 0, transition: "opacity 0.2s" }}>
                <button className="meme-action-btn" onClick={() => inputRefs.current[idx]?.click()}>ganti</button>
                {slot && <button className="meme-action-btn meme-action-reset" onClick={() => onChange(idx, null)}>reset</button>}
              </div>
              {slot && <div style={{ position: "absolute", top: 4, left: 4, width: 8, height: 8, borderRadius: "50%", background: "var(--gold)" }} />}
              <input ref={(el) => { inputRefs.current[idx] = el; }} type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => handleChange(e, idx)} />
            </div>
          );
        })}
      </div>
      <p className="upload-hint">• = sudah diganti · Click untuk ganti/reset</p>
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
      <p style={{ fontSize: 9, color: "var(--dim)", textAlign: "center", padding: "5px 0", letterSpacing: "0.06em" }}>preview gerak ↑</p>
    </div>
  );
}

function ThrPreview({ theme, nama, ucapan, qrisPreview, lebaranMemes, thrMemes, onClose,
  paymentMethod, ewalletType, ewalletNumber, ewalletName, bankName, accountNumber, accountName }: {
  theme: Theme; nama: string; ucapan: string; qrisPreview: string | null;
  lebaranMemes: string[]; thrMemes: string[]; onClose: () => void;
  paymentMethod: PaymentMethod;
  ewalletType: string; ewalletNumber: string; ewalletName: string;
  bankName: string; accountNumber: string; accountName: string;
}) {
  const [step, setStep] = useState<"idle" | "reaction" | "qris">("idle");
  const [copied, setCopied] = useState(false);
  const namaDisplay = nama.trim() || "Tio";
  const ucapanDisplay = ucapan.trim() || "Mohon maaf lahir batin ya 🌙";
  const qrisSrc = qrisPreview || "/qris.jpeg";
  const handleCopy = async (text: string) => {
    try { await navigator.clipboard.writeText(text); } catch {}
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.88)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, animation: "fadeup 0.3s ease both" }}>
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
                <div className="marquee-outer"><div className="marquee-track medium">{[...thrMemes, ...thrMemes].map((src, i) => <div className="meme-card" key={i} style={{ width: 80, height: 80 }}><img src={src} alt="" /></div>)}</div></div>
                <p style={{ fontFamily: "var(--serif)", fontSize: 36, fontWeight: 900, fontStyle: "italic", color: "var(--gold)", paddingLeft: 20, lineHeight: 1 }}>omg...</p>
                <p style={{ fontSize: 11, color: "var(--muted)", paddingLeft: 20, lineHeight: 1.8 }}>mau dikasih THR nih? 🥺<br />serius? beneran?<br />ya udah deh—</p>
                <button className="btn" style={{ marginLeft: 20, width: "fit-content" }} onClick={() => setStep("qris")}>y →</button>
              </div>
            )}
            <div style={{ padding: "24px 16px 16px", display: "flex", flexDirection: "column", gap: 12 }}>
              <span style={{ display: "inline-block", padding: "2px 10px", border: "0.5px solid color-mix(in srgb, var(--gold) 30%, transparent)", borderRadius: 100, fontSize: 7, color: "var(--gold)", letterSpacing: "0.1em" }}>✦ RAMADHAN 1447 H ✦</span>
              <div className="marquee-outer"><div className="marquee-track slow">{[...lebaranMemes, ...lebaranMemes].map((src, i) => <div className="meme-card" key={i} style={{ width: 80, height: 80 }}><img src={src} alt="" /></div>)}</div></div>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                <p style={{ fontFamily: "var(--serif)", fontSize: 22, fontWeight: 900, lineHeight: 1, color: "var(--text)", flex: 1 }}>Minal Aidzin<br /><span style={{ fontStyle: "italic", color: "var(--gold)" }}>Wal Faidzin.</span></p>
                <div style={{ width: 32, height: 32, borderRadius: "50%", boxShadow: "inset -9px -3px 0 0 var(--gold)", flexShrink: 0, marginTop: 8 }} />
              </div>
              <p style={{ fontSize: 8, color: "var(--dim)" }}>dari {namaDisplay} </p>
            </div>
            <div className="divider" />
            <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: 8 }}>
              <p style={{ fontFamily: "var(--serif)", fontSize: 14, fontWeight: 700, fontStyle: "italic", color: "var(--gold)", lineHeight: 1.4 }}>"{ucapanDisplay}"</p>
              <p style={{ fontSize: 8, color: "var(--muted)" }}>— {namaDisplay}</p>
            </div>
            <div className="divider" />
            {step === "idle" && <div style={{ padding: "12px 16px" }}><button className="btn" style={{ fontSize: 10, padding: "8px 18px" }} onClick={() => setStep("reaction")}>kasih THR →</button></div>}
            {step === "qris" && (
              <div style={{ padding: "0 16px 32px", display: "flex", flexDirection: "column", gap: 10 }}>
                <div className="marquee-outer" style={{ margin: "16px 0 8px" }}><div className="marquee-track medium">{[...thrMemes, ...thrMemes].map((src, i) => <div className="meme-card" key={i} style={{ width: 80, height: 80 }}><img src={src} alt="" /></div>)}</div></div>
                <p style={{ fontFamily: "var(--serif)", fontSize: 16, fontWeight: 700, color: "var(--text)" }}>Yeay dapet thr</p>
                {/* Payment preview */}
                {paymentMethod === "qris" && (
                  <div style={{ background: "var(--surface)", border: "0.5px solid var(--border)", borderRadius: 10, padding: 10 }}>
                    <div style={{ borderRadius: 8, overflow: "hidden", background: "#fff" }}><img src={qrisSrc} alt="QRIS" style={{ width: "100%", display: "block" }} /></div>
                  </div>
                )}
                {paymentMethod === "ewallet" && (
                  <div style={{ background: "var(--surface)", border: "0.5px solid var(--border)", borderRadius: 10, padding: 12, display: "flex", flexDirection: "column", gap: 6 }}>
                    <p style={{ fontSize: 8, color: "var(--dim)", letterSpacing: "0.1em" }}>{ewalletType.toUpperCase()}</p>
                    <p style={{ fontSize: 18, color: "var(--text)", letterSpacing: "0.08em" }}>{ewalletNumber || "—"}</p>
                    {ewalletName && <p style={{ fontSize: 9, color: "var(--muted)" }}>a.n. {ewalletName}</p>}
                    <button style={{ marginTop: 4, padding: "6px", borderRadius: 8, border: "0.5px solid var(--border)", background: "transparent", color: "var(--gold)", fontSize: 9, fontFamily: "var(--mono)", cursor: "pointer" }}
                      onClick={() => handleCopy(ewalletNumber)}>{copied ? "✓ tersalin!" : "salin nomor"}</button>
                  </div>
                )}
                {paymentMethod === "rekening" && (
                  <div style={{ background: "var(--surface)", border: "0.5px solid var(--border)", borderRadius: 10, padding: 12, display: "flex", flexDirection: "column", gap: 6 }}>
                    <p style={{ fontSize: 8, color: "var(--dim)", letterSpacing: "0.1em" }}>{bankName || "BANK"}</p>
                    <p style={{ fontSize: 18, color: "var(--text)", letterSpacing: "0.08em" }}>{accountNumber || "—"}</p>
                    {accountName && <p style={{ fontSize: 9, color: "var(--muted)" }}>a.n. {accountName}</p>}
                    <button style={{ marginTop: 4, padding: "6px", borderRadius: 8, border: "0.5px solid var(--border)", background: "transparent", color: "var(--gold)", fontSize: 9, fontFamily: "var(--mono)", cursor: "pointer" }}
                      onClick={() => handleCopy(accountNumber)}>{copied ? "✓ tersalin!" : "salin nomor rekening"}</button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      <p style={{ fontSize: 9, color: "#555", letterSpacing: "0.06em" }}>scroll dalam layar untuk lihat selengkapnya</p>
    </div>
  );
}

function DevThr() {
  const [step, setStep] = useState<"idle" | "qris" | "thanks">("idle");
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {step === "idle" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <p style={{ fontSize: 10, color: "var(--dim)", letterSpacing: "0.06em" }}>btw...</p>
          <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.8 }}>ini dibuat sama satu orang yang juga lagi nunggu-nunggu THR 🥲</p>
          <button className="btn-sm" style={{ width: "100%", textAlign: "center", padding: "12px" }} onClick={() => setStep("qris")}>kasih THR ke yang bikin &nbsp;→</button>
        </div>
      )}
      {step === "qris" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14, animation: "fadeup 0.4s ease both" }}>
          <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.8 }}>makasih udah mau... 🥺<br />nominal bebas, yang penting ikhlas</p>
          <div style={{ background: "var(--surface)", border: "0.5px solid var(--border)", borderRadius: 14, padding: 14, display: "flex", flexDirection: "column", gap: 10 }}>
            <p style={{ fontSize: 9, color: "var(--dim)", letterSpacing: "0.1em" }}>THR UNTUK YANG BIKIN</p>
            <div style={{ borderRadius: 10, overflow: "hidden", background: "#fff" }}>
              <img src="/qris.jpeg" alt="QRIS developer" style={{ width: "100%", display: "block" }} />
            </div>
            <p style={{ fontSize: 9, color: "var(--dim)", textAlign: "center", letterSpacing: "0.06em" }}>GoPay · OVO · Dana · Semua Bank</p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn" style={{ flex: 1, textAlign: "center", padding: "12px", fontSize: 12 }} onClick={() => setStep("thanks")}>udah ak tf ✓</button>
            <button className="btn-sm" style={{ flex: 1, textAlign: "center", padding: "12px" }} onClick={() => setStep("idle")}>gmw ah 😤</button>
          </div>
        </div>
      )}
      {step === "thanks" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, animation: "fadeup 0.4s ease both" }}>
          <p style={{ fontFamily: "var(--serif)", fontSize: 22, fontWeight: 700, fontStyle: "italic", color: "var(--gold)", lineHeight: 1.3 }}>makasih banyak!</p>
          <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.8 }}>beneran makasih ya 🌙<br />semoga rezekinya balik berlipat-lipat.</p>
        </div>
      )}
    </div>
  );
}

function SuccessScreen({ pageUrl, theme, onBuka }: { pageUrl: string; theme: Theme; onBuka: () => void }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    try { await navigator.clipboard.writeText(pageUrl); } catch {
      const el = document.createElement("textarea"); el.value = pageUrl;
      document.body.appendChild(el); el.select(); document.execCommand("copy"); document.body.removeChild(el);
    }
    setCopied(true); setTimeout(() => setCopied(false), 2500);
  };
  return (
    <main className="main" data-theme={theme}>
      <div className="stars" aria-hidden>{STARS.map((s, i) => <div key={i} className="star" style={{ width: `${s.w}px`, height: `${s.w}px`, top: `${s.top}%`, left: `${s.left}%`, animationDuration: `${s.dur}s`, animationDelay: `${s.delay}s` }} />)}</div>
      <div style={{ position: "relative", zIndex: 1, padding: "64px 28px 80px", display: "flex", flexDirection: "column", gap: 28, maxWidth: 480, margin: "0 auto" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <span className="badge">✦ SELESAI ✦</span>
          <h1 className="title" style={{ fontSize: "clamp(28px, 9vw, 44px)", marginTop: 8 }}>Ucapanmu<br /><span className="accent">udah jadi. 🌙</span></h1>
          <p className="subtitle">Tinggal share linknya ke siapa aja yang mau kamu mintain THR... eh maksudnya mau kamu ucapin.</p>
        </div>
        <div style={{ background: "var(--surface)", border: "0.5px solid var(--border)", borderRadius: 14, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
          <p style={{ fontSize: 9, color: "var(--dim)", letterSpacing: "0.1em" }}>LINK HALAMAN KAMU</p>
          <p style={{ fontSize: 12, color: "var(--muted)", wordBreak: "break-all", lineHeight: 1.6 }}>{pageUrl}</p>
          <button onClick={handleCopy} className="btn" style={{ width: "100%", textAlign: "center", padding: "12px", fontSize: 12 }}>
            {copied ? "✓ link tersalin!" : "salin link"}
          </button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <button className="btn" style={{ width: "100%", textAlign: "center", padding: "14px" }} onClick={onBuka}>buka halaman →</button>
          <button className="btn-sm" style={{ width: "100%", textAlign: "center", padding: "12px" }} onClick={() => window.location.href = "/"}>buat yang baru</button>
        </div>
        <div className="divider" />
        <div className="closing" style={{ textAlign: "left" }}>
          <p className="ornament">✦ &nbsp; ✦ &nbsp; ✦</p>
          <p style={{ fontFamily: "var(--serif)", fontSize: 16, fontStyle: "italic", color: "var(--muted)", lineHeight: 1.8 }}>
            sebarin ke semua kenalanmu —<br />silaturahmi terjaga, saldo ikut terjaga.
          </p>
        </div>
        <div className="divider" />
        <DevThr />
      </div>
    </main>
  );
}

export default function GeneratorPage() {
  const [theme, setTheme] = useState<Theme>("dark");
  const [nama, setNama] = useState("");
  const [namaError, setNamaError] = useState(false);
  const [ucapan, setUcapan] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("qris");
  // QRIS
  const [qrisFile, setQrisFile] = useState<File | null>(null);
  const [qrisPreview, setQrisPreview] = useState<string | null>(null);
  // E-wallet
  const [ewalletType, setEwalletType] = useState("GoPay");
  const [ewalletNumber, setEwalletNumber] = useState("");
  const [ewalletName, setEwalletName] = useState("");
  // Rekening
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  // Memes
  const [lebaranSlots, setLebaranSlots] = useState<MemeSlot[]>(Array(5).fill(null));
  const [thrSlots, setThrSlots] = useState<MemeSlot[]>(Array(4).fill(null));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [doneId, setDoneId] = useState<string | null>(null);

  const qrisInputRef = useRef<HTMLInputElement>(null);
  const namaRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const liveLebaranMemes = lebaranSlots.map((s, i) => s ? URL.createObjectURL(s) : DEFAULT_LEBARAN[i]);
  const liveThrMemes = thrSlots.map((s, i) => s ? URL.createObjectURL(s) : DEFAULT_THR[i]);

  const handleQrisChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setQrisFile(await compressImage(file, 1200, 0.85));
    setQrisPreview(URL.createObjectURL(file));
  };

  const paymentValid = () => {
    if (paymentMethod === "qris") return !!qrisFile;
    if (paymentMethod === "ewallet") return !!ewalletNumber.trim();
    if (paymentMethod === "rekening") return !!accountNumber.trim();
    return false;
  };

  const handleSubmit = async () => {
    if (!nama.trim()) { setNamaError(true); namaRef.current?.focus(); return; }
    if (!paymentValid() || loading) return;
    setLoading(true); setError(null);
    const fd = new FormData();
    fd.append("theme", theme);
    fd.append("nama", nama.trim());
    fd.append("ucapan", ucapan.trim());
    fd.append("paymentMethod", paymentMethod);
    if (paymentMethod === "qris" && qrisFile) fd.append("qris", qrisFile);
    if (paymentMethod === "ewallet") {
      fd.append("ewalletType", ewalletType);
      fd.append("ewalletNumber", ewalletNumber.trim());
      fd.append("ewalletName", ewalletName.trim());
    }
    if (paymentMethod === "rekening") {
      fd.append("bankName", bankName.trim());
      fd.append("accountNumber", accountNumber.trim());
      fd.append("accountName", accountName.trim());
    }
    lebaranSlots.forEach((f, i) => { if (f) fd.append(`lebaran_${i}`, f); });
    thrSlots.forEach((f, i) => { if (f) fd.append(`thr_${i}`, f); });
    try {
      const res = await fetch("/api/create", { method: "POST", body: fd });
      if (!res.ok) { const b = await res.json().catch(() => ({})); throw new Error(b.error || "Gagal generate"); }
      const { id } = await res.json();
      setDoneId(id);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  };

  if (doneId) {
    const pageUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/thr/${doneId}`;
    return <SuccessScreen pageUrl={pageUrl} theme={theme} onBuka={() => router.push(`/thr/${doneId}`)} />;
  }

  const currentTheme = THEMES.find((t) => t.id === theme)!;
  const canSubmit = !!nama.trim() && paymentValid() && !loading;

  return (
    <main className="main" data-theme={theme}>
      <div className="stars" aria-hidden>
        {STARS.map((s, i) => <div key={i} className="star" style={{ width: `${s.w}px`, height: `${s.w}px`, top: `${s.top}%`, left: `${s.left}%`, animationDuration: `${s.dur}s`, animationDelay: `${s.delay}s` }} />)}
      </div>

      {showPreview && (
        <ThrPreview theme={theme} nama={nama} ucapan={ucapan} qrisPreview={qrisPreview}
          lebaranMemes={liveLebaranMemes} thrMemes={liveThrMemes}
          onClose={() => setShowPreview(false)}
          paymentMethod={paymentMethod}
          ewalletType={ewalletType} ewalletNumber={ewalletNumber} ewalletName={ewalletName}
          bankName={bankName} accountNumber={accountNumber} accountName={accountName} />
      )}

      <div className="gen-inner">
        <div className="gen-header">
          <span className="badge">✦ RAMADHAN 1447 H ✦</span>
          <div className="title-wrap" style={{ marginTop: 8 }}>
            <h1 className="title" style={{ fontSize: "clamp(26px, 8vw, 40px)" }}>
              Kirim ucapan.<br /><span className="accent">Tunggu transferan.</span>
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
          <div>
            <input ref={namaRef} className="gen-input" type="text" placeholder="Nama kamu — wajib diisi" value={nama} maxLength={40}
              onChange={(e) => { setNama(e.target.value); if (e.target.value.trim()) setNamaError(false); }}
              style={{ borderColor: namaError ? "#ff6b6b" : undefined }} />
            {namaError && <p style={{ fontSize: 10, color: "#ff6b6b", marginTop: 4, letterSpacing: "0.04em" }}>⚠ nama wajib diisi dulu</p>}
          </div>
          <textarea className="gen-textarea" placeholder={"Tulis ucapan kamu di sini...\nmisal: Mohon maaf lahir batin ya seng"} value={ucapan} maxLength={300} rows={4} onChange={(e) => setUcapan(e.target.value)} />
          <p className="upload-hint" style={{ textAlign: "right" }}>{ucapan.length}/300</p>
        </div>

        {/* 03 Metode Pembayaran */}
        <div className="gen-section">
          <p className="gen-label">03 / THRnya mau dikirim kemana? </p>

          {/* Pilih metode */}
          <div className="toggle-row">
            {(["qris", "ewallet", "rekening"] as PaymentMethod[]).map((m) => (
              <button key={m} className={`toggle ${paymentMethod === m ? "on" : ""}`} onClick={() => setPaymentMethod(m)}>
                {m === "qris" ? "QRIS" : m === "ewallet" ? "GoPay / OVO / Dana" : "Rekening Bank"}
              </button>
            ))}
          </div>

          {/* QRIS */}
          {paymentMethod === "qris" && (
            <>
              <div className={`upload-zone ${qrisPreview ? "has-preview" : ""}`} onClick={() => qrisInputRef.current?.click()}>
                {qrisPreview ? <img src={qrisPreview} alt="Preview QRIS" className="upload-preview" /> : (
                  <><p className="upload-icon">⬆</p><p className="upload-text">Screenshot QRIS kamu</p><p className="upload-hint">jpg · png · webp · auto-compress</p></>
                )}
              </div>
              <input ref={qrisInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleQrisChange} />
              {qrisPreview && <button className="btn-sm" onClick={(e) => { e.stopPropagation(); setQrisFile(null); setQrisPreview(null); if (qrisInputRef.current) qrisInputRef.current.value = ""; }}>ganti foto</button>}
            </>
          )}

          {/* E-wallet */}
          {paymentMethod === "ewallet" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div className="toggle-row">
                {EWALLET_OPTIONS.map((o) => (
                  <button key={o} className={`toggle ${ewalletType === o ? "on" : ""}`} onClick={() => setEwalletType(o)}>{o}</button>
                ))}
              </div>
              <input className="gen-input" type="tel" placeholder={`Nomor ${ewalletType} — wajib`} value={ewalletNumber} onChange={(e) => setEwalletNumber(e.target.value)} />
              <input className="gen-input" type="text" placeholder="Nama pemilik (opsional)" value={ewalletName} onChange={(e) => setEwalletName(e.target.value)} />
            </div>
          )}

          {/* Rekening */}
          {paymentMethod === "rekening" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <input className="gen-input" type="text" placeholder="Nama bank (misal: BCA, BRI, Mandiri)" value={bankName} onChange={(e) => setBankName(e.target.value)} />
              <input className="gen-input" type="tel" placeholder="Nomor rekening — wajib" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} />
              <input className="gen-input" type="text" placeholder="Nama pemilik rekening" value={accountName} onChange={(e) => setAccountName(e.target.value)} />
            </div>
          )}
        </div>

        {/* 04 Foto */}
        <div className="gen-section">
          <p className="gen-label">04 / Upload foto kamu <span style={{ color: "var(--dim)", textTransform: "none" }}>(opsional)</span></p>
          <p className="gen-body" style={{ fontSize: 12 }}>Click tiap gambar untuk ganti. Ganti pakai foto kamu yang cantik/ganteng itu. Default dipakai kalau nggak diganti.</p>
          <FotoGrid slots={lebaranSlots} defaults={DEFAULT_LEBARAN} label="FOTO UCAPAN LEBARAN (5 gambar)" onChange={(i, f) => setLebaranSlots((prev) => { const n = [...prev]; n[i] = f; return n; })} />
          <MarqueePreview srcs={liveLebaranMemes} speed="slow" />
          <FotoGrid slots={thrSlots} defaults={DEFAULT_THR} label="FOTO NGEMIS THR 😂 (4 gambar)" onChange={(i, f) => setThrSlots((prev) => { const n = [...prev]; n[i] = f; return n; })} />
          <MarqueePreview srcs={liveThrMemes} speed="medium" />
        </div>

        {/* Generate */}
        <div className="gen-section">
          <button className="btn-sm" style={{ width: "100%", textAlign: "center", padding: "12px" }} onClick={() => setShowPreview(true)}>👁 lihat tampilan dulu</button>
          <button className={`btn gen-btn ${!canSubmit ? "disabled" : ""}`} onClick={handleSubmit} disabled={!canSubmit}
            style={{ borderColor: canSubmit ? currentTheme.accent : undefined, color: canSubmit ? currentTheme.accent : undefined }}>
            {loading ? "generating..." : "Buat halaman THR →"}
          </button>
          {!nama.trim() && <p className="upload-hint">isi nama dulu ya ↑</p>}
          {nama.trim() && !paymentValid() && <p className="upload-hint">isi info pembayaran dulu ya ↑</p>}
          {error && <p className="gen-error">⚠ {error}</p>}
        </div>
      </div>
    </main>
  );
}