"use client";
import { useState, useRef } from "react";
import type { ThrConfig } from "./page";

const DEFAULT_LEBARAN = [
  "/memes/lebaran1.jpeg","/memes/lebaran2.jpeg","/memes/lebaran3.jpeg",
  "/memes/lebaran4.jpeg","/memes/lebaran5.jpeg",
];
const DEFAULT_THR = [
  "/memes/thr1.jpeg","/memes/thr2.jpeg","/memes/thr3.jpeg","/memes/thr4.jpeg",
];

function resolveMemes(slots: (string | null)[], defaults: string[]): string[] {
  return slots.map((s, i) => s ?? defaults[i]);
}

// Payment display component
function PaymentInfo({ config }: { config: ThrConfig }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (text: string) => {
    try { await navigator.clipboard.writeText(text); } catch { /* ignore */ }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (config.paymentMethod === "qris" && config.qrisUrl) {
    return (
      <div className="qris-frame">
        <div className="qris-glow" />
        <div className="qris-img-wrap">
          <img src={config.qrisUrl} alt="QRIS" className="qris-img" />
        </div>
        <button className="btn-download" onClick={async () => {
          try {
            const res = await fetch(config.qrisUrl!);
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url; a.download = "qris-thr.jpeg";
            document.body.appendChild(a); a.click();
            document.body.removeChild(a); URL.revokeObjectURL(url);
          } catch { window.open(config.qrisUrl, "_blank"); }
        }}>↓ &nbsp; download QRIS</button>
        <p className="qris-caption">GoPay · OVO · Dana · Semua Bank</p>
      </div>
    );
  }

  if (config.paymentMethod === "ewallet") {
    const number = config.ewalletNumber || "";
    return (
      <div className="qris-frame">
        <div className="qris-glow" />
        <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <p style={{ fontSize: 10, color: "var(--dim)", letterSpacing: "0.1em" }}>
              {config.ewalletType?.toUpperCase() || "E-WALLET"}
            </p>
          </div>
          <div style={{ background: "var(--bg)", borderRadius: 10, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 6 }}>
            <p style={{ fontSize: 11, color: "var(--dim)", letterSpacing: "0.06em" }}>NOMOR</p>
            <p style={{ fontSize: 22, color: "var(--text)", fontFamily: "var(--mono)", letterSpacing: "0.08em" }}>{number}</p>
            {config.ewalletName && <p style={{ fontSize: 12, color: "var(--muted)" }}>a.n. {config.ewalletName}</p>}
          </div>
          <button className="btn" style={{ width: "100%", textAlign: "center", fontSize: 12, padding: "10px" }}
            onClick={() => handleCopy(number)}>
            {copied ? "✓ tersalin!" : "salin nomor"}
          </button>
        </div>
      </div>
    );
  }

  if (config.paymentMethod === "rekening") {
    const number = config.accountNumber || "";
    return (
      <div className="qris-frame">
        <div className="qris-glow" />
        <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ background: "var(--bg)", borderRadius: 10, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <p style={{ fontSize: 11, color: "var(--dim)", letterSpacing: "0.06em" }}>BANK</p>
              <p style={{ fontSize: 12, color: "var(--gold)", fontWeight: 500 }}>{config.bankName || "—"}</p>
            </div>
            <div style={{ height: "0.5px", background: "var(--border)" }} />
            <p style={{ fontSize: 11, color: "var(--dim)", letterSpacing: "0.06em" }}>NOMOR REKENING</p>
            <p style={{ fontSize: 22, color: "var(--text)", fontFamily: "var(--mono)", letterSpacing: "0.08em" }}>{number}</p>
            {config.accountName && <p style={{ fontSize: 12, color: "var(--muted)" }}>a.n. {config.accountName}</p>}
          </div>
          <button className="btn" style={{ width: "100%", textAlign: "center", fontSize: 12, padding: "10px" }}
            onClick={() => handleCopy(number)}>
            {copied ? "✓ tersalin!" : "salin nomor rekening"}
          </button>
        </div>
      </div>
    );
  }

  return null;
}

export default function ThrClient({ config }: { config: ThrConfig }) {
  const [step, setStep] = useState<"idle" | "reaction" | "qris">("idle");
  const qrisRef = useRef<HTMLDivElement>(null);

  const memesLebaran = resolveMemes(config.lebaranUrls ?? [], DEFAULT_LEBARAN);
  const memesTHR = resolveMemes(config.thrUrls ?? [], DEFAULT_THR);
  const namaDisplay = config.nama?.trim() || "Tio";
  const ucapanDisplay = config.ucapan?.trim() || "Minal Aidzin Wal Faidzin, mohon maaf lahir dan batin ";

  const handleReveal = () => setStep("reaction");
  const handleShowQris = () => {
    setStep("qris");
    setTimeout(() => qrisRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 120);
  };

  return (
    <main className="main" data-theme={config.theme}>
      <div className="stars" aria-hidden>
        {Array.from({ length: 40 }).map((_, i) => (
          <div key={i} className="star" style={{
            width: `${((i * 7 + 3) % 20) / 10 + 1}px`, height: `${((i * 7 + 3) % 20) / 10 + 1}px`,
            top: `${((i * 37 + 11) % 100)}%`, left: `${((i * 53 + 17) % 100)}%`,
            animationDuration: `${((i * 13 + 20) % 30) / 10 + 2}s`,
            animationDelay: `${((i * 19 + 5) % 40) / 10}s`,
          }} />
        ))}
      </div>

      {step === "reaction" && (
        <div className="reaction-overlay">
          <div className="reaction-content">
            <div className="marquee-outer" style={{ marginBottom: "24px" }}>
              <div className="marquee-track medium">
                {[...memesTHR, ...memesTHR].map((src, i) => (
                  <div className="meme-card" key={i}><img src={src} alt="meme thr" /></div>
                ))}
              </div>
            </div>
            <p className="reaction-title">omg...</p>
            <p className="reaction-body">
              mau dikasih THR nih? 🥺<br />serius? beneran?<br />ya udah deh kalau gitu—
            </p>
            <button className="btn" onClick={handleShowQris}>y &nbsp;→</button>
          </div>
        </div>
      )}

      <section className="hero">
        <span className="badge">✦ RAMADHAN 1446 H ✦</span>
        <div className="marquee-outer">
          <div className="marquee-track slow">
            {[...memesLebaran, ...memesLebaran].map((src, i) => (
              <div className="meme-card" key={i}><img src={src} alt="meme lebaran" /></div>
            ))}
          </div>
        </div>
        <div className="title-wrap">
          <h1 className="title">Minal Aidzin<br /><span className="accent">Wal Faidzin.</span></h1>
          <div className="crescent" />
        </div>
        <p className="subtitle">dari {namaDisplay} </p>
      </section>

      <div className="divider" />

      <section className="message">
        <p className="message-hook">"{ucapanDisplay}"</p>
        <p className="message-body">— {namaDisplay}</p>
      </section>

      <div className="divider" />

      {step === "idle" && (
        <section className="cta">
          <button className="btn" onClick={handleReveal}>kasih THR &nbsp;→</button>
        </section>
      )}

      {step === "qris" && (
        <>
          <section style={{ paddingTop: "40px" }}>
            <div className="marquee-outer" style={{ marginBottom: "32px" }}>
              <div className="marquee-track medium">
                {[...memesTHR, ...memesTHR].map((src, i) => (
                  <div className="meme-card" key={i}><img src={src} alt="meme thr" /></div>
                ))}
              </div>
            </div>
          </section>

          <section className="qris-section" ref={qrisRef}>
            <div className="qris-inner">
              <p className="qris-title">Yeay dapet thr</p>
              <p className="qris-body">Nominal bebas. Yang penting ikhlas</p>
              <PaymentInfo config={config} />
              <div className="tags">
                {["langsung masuk","auto berkah","pahala berlipat","makin ganteng","makin cantik","dosa berkurang","rezeki dilancarkan"].map((t) => (
                  <span className="tag" key={t}>{t}</span>
                ))}
              </div>
            </div>

            <div className="divider" style={{ margin: "32px 0" }} />

            <div className="closing">
              <p className="ornament">✦ &nbsp; ✦ &nbsp; ✦</p>
              <p className="closing-title">makasih orang baik</p>
              <p className="closing-sub">berkah selalu — {namaDisplay} </p>
            </div>

            <div className="divider" style={{ margin: "32px 0" }} />

            <div style={{ padding: "0 28px 64px", display: "flex", flexDirection: "column", gap: 10 }}>
              <p style={{ fontSize: 10, color: "var(--dim)", letterSpacing: "0.06em" }}>mau bikin yang sama?</p>
              <p style={{ fontFamily: "var(--serif)", fontSize: 20, fontWeight: 700, fontStyle: "italic", color: "var(--text)", lineHeight: 1.3 }}>
                Kirim ucapan.<br /><span style={{ color: "var(--gold)" }}>Tunggu transferan.</span>
              </p>
              <a href="/">
                <button className="btn" style={{ fontSize: 12, padding: "12px 24px" }}>
                  bikin ucapanmu sendiri →
                </button>
              </a>
            </div>
          </section>
        </>
      )}
    </main>
  );
}