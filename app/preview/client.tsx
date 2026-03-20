"use client";
import { useState, useRef } from "react";

const DEFAULT_LEBARAN = [
  "/memes/lebaran1.jpeg",
  "/memes/lebaran2.jpeg",
  "/memes/lebaran3.jpeg",
  "/memes/lebaran4.jpeg",
  "/memes/lebaran5.jpeg",
];
const DEFAULT_THR = [
  "/memes/thr1.jpeg",
  "/memes/thr2.jpeg",
  "/memes/thr3.jpeg",
  "/memes/thr4.jpeg",
];

function resolveMemes(slots: (string | null)[], defaults: string[]): string[] {
  return slots.map((s, i) => s ?? defaults[i]);
}

interface Config {
  theme: "dark" | "pink" | "green";
  nama: string;
  ucapan: string;
  qrisUrl: string;
  lebaranUrls: (string | null)[];
  thrUrls: (string | null)[];
  createdAt: number;
}

const STARS = Array.from({ length: 40 }, (_, i) => ({
  w: ((i * 7 + 3) % 20) / 10 + 1,
  top: ((i * 37 + 11) % 100),
  left: ((i * 53 + 17) % 100),
  dur: ((i * 13 + 20) % 30) / 10 + 2,
  delay: ((i * 19 + 5) % 40) / 10,
}));

export default function PreviewClient({ config }: { config: Config }) {
  const [step, setStep] = useState<"idle" | "reaction" | "qris">("idle");
  const qrisRef = useRef<HTMLDivElement>(null);

  const memesLebaran = resolveMemes(config.lebaranUrls, DEFAULT_LEBARAN);
  const memesTHR = resolveMemes(config.thrUrls, DEFAULT_THR);
  const namaDisplay = config.nama?.trim() || "Tio";
  const ucapanDisplay = config.ucapan?.trim() || "Mohon maaf lahir batin ya 🌙";

  return (
    <main className="main" data-theme={config.theme} style={{ minHeight: "100vh" }}>
      <div className="stars" aria-hidden>
        {STARS.map((s, i) => (
          <div key={i} className="star" style={{
            width: `${s.w}px`, height: `${s.w}px`,
            top: `${s.top}%`, left: `${s.left}%`,
            animationDuration: `${s.dur}s`,
            animationDelay: `${s.delay}s`,
          }} />
        ))}
      </div>

      {step === "reaction" && (
        <div className="reaction-overlay">
          <div className="reaction-content">
            <div className="marquee-outer" style={{ marginBottom: "24px" }}>
              <div className="marquee-track medium">
                {[...memesTHR, ...memesTHR].map((src, i) => (
                  <div className="meme-card" key={i}><img src={src} alt="" /></div>
                ))}
              </div>
            </div>
            <p className="reaction-title">omg...</p>
            <p className="reaction-body">
              mau dikasih THR nih? 🥺<br />serius? beneran?<br />ya udah deh—
            </p>
            <button className="btn" onClick={() => {
              setStep("qris");
              setTimeout(() => qrisRef.current?.scrollIntoView({ behavior: "smooth" }), 120);
            }}>y &nbsp;→</button>
          </div>
        </div>
      )}

      <section className="hero">
        <span className="badge">✦ RAMADHAN 1447 H ✦</span>
        <div className="marquee-outer">
          <div className="marquee-track slow">
            {[...memesLebaran, ...memesLebaran].map((src, i) => (
              <div className="meme-card" key={i}><img src={src} alt="" /></div>
            ))}
          </div>
        </div>
        <div className="title-wrap">
          <h1 className="title">
            Minal Aidzin<br /><span className="accent">Wal Faidzin.</span>
          </h1>
          <div className="crescent" />
        </div>
        <p className="subtitle">dari {namaDisplay} 🌙</p>
      </section>

      <div className="divider" />

      <section className="message">
        <p className="message-hook">"{ucapanDisplay}"</p>
        <p className="message-body">— {namaDisplay}</p>
      </section>

      <div className="divider" />

      {step === "idle" && (
        <section className="cta">
          <button className="btn" onClick={() => setStep("reaction")}>kasih THR &nbsp;→</button>
        </section>
      )}

      {step === "qris" && (
        <>
          <section style={{ paddingTop: "40px" }}>
            <div className="marquee-outer" style={{ marginBottom: "32px" }}>
              <div className="marquee-track medium">
                {[...memesTHR, ...memesTHR].map((src, i) => (
                  <div className="meme-card" key={i}><img src={src} alt="" /></div>
                ))}
              </div>
            </div>
          </section>
          <section className="qris-section" ref={qrisRef}>
            <div className="qris-inner">
              <p className="qris-title">Yeay dapet thr</p>
              <p className="qris-body">Nominal bebas. Yang penting ikhlas</p>
              <div className="qris-frame">
                <div className="qris-glow" />
                <div className="qris-img-wrap">
                  <img src={config.qrisUrl} alt="QRIS" className="qris-img" />
                </div>
                <p className="qris-caption">GoPay · OVO · Dana · Semua Bank</p>
              </div>
              <div className="tags">
                {["scan dari app manapun","auto berkah","pahala berlipat","rezeki dilancarkan"].map(t => (
                  <span className="tag" key={t}>{t}</span>
                ))}
              </div>
            </div>
            <div className="divider" style={{ margin: "32px 0" }} />
            <div className="closing">
              <p className="ornament">✦ &nbsp; ✦ &nbsp; ✦</p>
              <p className="closing-title">makasih orang baik</p>
              <p className="closing-sub">berkah selalu — {namaDisplay} 🌙</p>
            </div>
          </section>
        </>
      )}
    </main>
  );
}