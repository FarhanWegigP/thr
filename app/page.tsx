"use client";
import { useState, useRef } from "react";

const memesLebaran = [
  "/memes/lebaran1.jpeg",
  "/memes/lebaran2.jpeg",
  "/memes/lebaran3.jpeg",
  "/memes/lebaran4.jpeg",
  "/memes/lebaran5.jpeg",
];

const memesTHR = [
  "/memes/thr1.jpeg",
  "/memes/thr2.jpeg",
  "/memes/thr3.jpeg",
  "/memes/thr4.jpeg",
];

export default function Home() {
  const [step, setStep] = useState<"idle" | "reaction" | "qris">("idle");
  const qrisRef = useRef<HTMLDivElement>(null);

  const handleReveal = () => setStep("reaction");

  const handleShowQris = () => {
    setStep("qris");
    setTimeout(() => {
      qrisRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 120);
  };

  const handleDownload = () => {
    const a = document.createElement("a");
    a.href = "/qris.jpeg";
    a.download = "qris-tio.jpeg";
    a.click();
  };

  return (
    <main className="main">

      {/* STARS */}
      <div className="stars" aria-hidden>
        {Array.from({ length: 40 }).map((_, i) => (
          <div key={i} className="star" style={{
            width: `${Math.random() * 2 + 1}px`,
            height: `${Math.random() * 2 + 1}px`,
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            animationDuration: `${(Math.random() * 3 + 2).toFixed(1)}s`,
            animationDelay: `${(Math.random() * 4).toFixed(1)}s`,
          }} />
        ))}
      </div>

{step === "reaction" && (
  <div className="reaction-overlay">
    <div className="reaction-content">

      <div className="marquee-outer" style={{ marginBottom: "24px" }}>
        <div className="marquee-track medium">
          {[...memesTHR, ...memesTHR].map((src, i) => (
            <div className="meme-card" key={i}>
              <img src={src} alt="meme thr" />
            </div>
          ))}
        </div>
      </div>

      <p className="reaction-title">omg...</p>
      <p className="reaction-body">
        mau dikasih THR nih? 🥺<br />
        serius? beneran?<br />
        ya udah deh kalau gitu—
      </p>
      <button className="btn" onClick={handleShowQris}>
        pencet = orang baik &nbsp;→
      </button>

    </div>
  </div>
)}

      {/* HERO */}
      <section className="hero">
        <span className="badge">✦ RAMADHAN 1446 H ✦</span>

        <div className="marquee-outer">
          <div className="marquee-track slow">
            {[...memesLebaran, ...memesLebaran].map((src, i) => (
              <div className="meme-card" key={i}>
                <img src={src} alt="meme lebaran" />
              </div>
            ))}
          </div>
        </div>

        <div className="title-wrap">
          <h1 className="title">
            Minal Aidzin<br />
            <span className="accent">Wal Faidzin.</span>
          </h1>
          <div className="crescent" />
        </div>

        <p className="subtitle">dari Tio 🌙</p>
      </section>

      <div className="divider" />

      {/* CTA */}
      {step === "idle" && (
        <section className="cta">
          <button className="btn" onClick={handleReveal}>
            kasih Tio thr &nbsp;→
          </button>
        </section>
      )}

      {/* QRIS */}
      {step === "qris" && (
        <>
          <section className="reaction-section">
            <div className="marquee-outer" style={{ marginBottom: "32px", marginTop: "40px" }}>
              <div className="marquee-track medium">
                {[...memesTHR, ...memesTHR].map((src, i) => (
                  <div className="meme-card" key={i}>
                    <img src={src} alt="meme thr" />
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="qris-section" ref={qrisRef}>
            <div className="qris-inner">
              <p className="qris-title">Yeay dapet thr</p>
              <p className="qris-body">
                Nominal bebas. Yang penting ikhlas
              </p>

<div className="qris-frame">
  <div className="qris-glow" />
  <div className="qris-img-wrap">
    <img src="/qris.jpeg" alt="QRIS Tio" className="qris-img" />
  </div>
  <button className="btn-download" onClick={handleDownload}>
    ↓ &nbsp; download QRIS
  </button>
  <p className="qris-caption">
    GoPay · OVO · Dana · Semua Bank
  </p>
</div>

<div className="tags">
  {[
    "scan dari app manapun",
    "langsung masuk",
    "auto berkah",
    "pahala berlipat",
    "makin ganteng",
    "makin cantik",
    "dosa berkurang",
    "rezeki dilancarkan",
  ].map(t => (
    <span className="tag" key={t}>{t}</span>
  ))}
</div>
            </div>

            <div className="divider" style={{ margin: "32px 0" }} />

            <div className="closing">
              <p className="ornament">✦ &nbsp; ✦ &nbsp; ✦</p>
              <p className="closing-title">makasih orang baik</p>
              <p className="closing-sub">berkah selalu — Tio </p>
            </div>
          </section>
        </>
      )}

    </main>
  );
}