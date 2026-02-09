"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

type WrapOption = { name: string; finish: "Gloss" | "Satin" | "Matte"; hex: string };

const WRAPS: WrapOption[] = [
  { name: "Gloss Black", finish: "Gloss", hex: "#0B0D12" },
  { name: "Satin Black", finish: "Satin", hex: "#12151C" },
  { name: "Matte White", finish: "Matte", hex: "#F3F4F6" },
  { name: "Nardo Grey", finish: "Satin", hex: "#8E939A" },
  { name: "Miami Blue", finish: "Gloss", hex: "#2ED4FF" },
  { name: "Midnight Purple", finish: "Gloss", hex: "#5B2BD8" },
  { name: "British Racing Green", finish: "Satin", hex: "#0D3B2E" },
];

const BRAND_LOGOS = [
  { name: "Audi", file: "/brands/audi.svg" },
  { name: "BMW", file: "/brands/bmw.svg" },
  { name: "Lamborghini", file: "/brands/lamborghini.svg" },
  { name: "Mercedes", file: "/brands/mercedes.svg" },
  { name: "Porsche", file: "/brands/porsche.svg" },
  { name: "Tesla", file: "/brands/tesla.svg" },
  { name: "Volkswagen", file: "/brands/volkswagen.svg" },
];

export default function HomePage() {
  // Vehicle select (API-driven)
  const [makes, setMakes] = useState<string[]>([]);
  const [models, setModels] = useState<string[]>([]);
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");

  // VRM lookup (DVLA VES later)
  const [vrm, setVrm] = useState("");
  const [vrmStatus, setVrmStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [vrmMessage, setVrmMessage] = useState("");

  // Upload
  const [imageUrl, setImageUrl] = useState<string>("");
  const [dragOver, setDragOver] = useState(false);

  // Wrap
  const [wrap, setWrap] = useState<WrapOption | null>(null);

  // Mock generate
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/vehicles/makes", { cache: "no-store" });
      const data = (await res.json()) as { makes: string[] };
      setMakes(data.makes ?? []);
    })().catch(() => setMakes([]));
  }, []);

  useEffect(() => {
    if (!make) {
      setModels([]);
      setModel("");
      return;
    }
    (async () => {
      const res = await fetch(`/api/vehicles/models?make=${encodeURIComponent(make)}`, { cache: "no-store" });
      const data = (await res.json()) as { models: string[] };
      setModels(data.models ?? []);
      setModel("");
    })().catch(() => {
      setModels([]);
      setModel("");
    });
  }, [make]);

  const canGenerate = useMemo(() => {
    const hasVehicle = !!imageUrl || (!!make && !!model);
    return hasVehicle && !!wrap;
  }, [imageUrl, make, model, wrap]);

  function onFile(file: File) {
    if (!file.type.startsWith("image/")) return;
    const url = URL.createObjectURL(file);
    setImageUrl(url);
    setStatus("idle");
  }

  async function lookupVrm() {
    const cleaned = vrm.replace(/\s+/g, "").toUpperCase();
    if (!cleaned) return;

    setVrmStatus("loading");
    setVrmMessage("");
    try {
      const res = await fetch(`/api/vrm?vrm=${encodeURIComponent(cleaned)}`, { cache: "no-store" });
      if (!res.ok) throw new Error("Lookup failed");
      const data = (await res.json()) as { make?: string; model?: string; message?: string };

      if (data.make) setMake(data.make);
      if (data.model) setModel(data.model);

      setVrmStatus("done");
      setVrmMessage(data.message ?? "Vehicle details found.");
      setStatus("idle");
    } catch {
      setVrmStatus("error");
      setVrmMessage("DVLA VES lookup not wired yet (we’ll add your API key on Vercel and connect it).");
    }
  }

  async function generate() {
    if (!canGenerate) return;
    setStatus("loading");
    await new Promise((r) => setTimeout(r, 850));
    setStatus("done");
  }

  function resetAll() {
    setMake("");
    setModel("");
    setWrap(null);
    setImageUrl("");
    setStatus("idle");
    setVrm("");
    setVrmStatus("idle");
    setVrmMessage("");
  }

  // Duplicate logos for seamless loop
  const marqueeLogos = [...BRAND_LOGOS, ...BRAND_LOGOS];

  return (
    <div className="wrapai-shell">
      {/* Topbar */}
      <div className="wrapai-topbar">
        <div className="wrapai-container">
          <div className="wrapai-nav">
            <div className="wrapai-brand">
              <div className="wrapai-brandMark">
                <Image src="/wrapai-logo.png" alt="WrapAI" width={44} height={44} className="h-full w-full object-cover" priority />
              </div>
              <div className="wrapai-brandText">
                <strong>WrapAI</strong>
                <span>Wrap Before you Buy</span>
              </div>
            </div>

            <div className="wrapai-navLinks">
              <a className="wrapai-link" href="#generator">Generator</a>
              <a className="wrapai-link" href="#how">How it works</a>
              <a className="wrapai-link" href="#uk">UK Wraps</a>
              <button className="wrapai-cta" onClick={() => document.getElementById("generator")?.scrollIntoView({ behavior: "smooth" })}>
                Wrap Before you Buy
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Hero (add class "has-photo" if you add public/hero/track.jpg) */}
      <section className="wrapai-hero" id="top">
        <div className="wrapai-container">
          <div className="wrapai-heroInner">
            <div className="wrapai-heroGrid">
              <div>
                <h1 className="wrapai-heroTitle">
                  WrapAI <span className="accent">Preview</span> Generator
                </h1>
                <p className="wrapai-heroSub">
                  Preview car, van, and bike wraps in the UK before you book an installer. Choose your vehicle, pick a wrap colour
                  and finish, and create a shareable concept for your local wrap shop.
                </p>

                <div className="wrapai-heroBadges">
                  <span className="wrapai-pill">Cars • Vans • Bikes</span>
                  <span className="wrapai-pill">UK Wrap Colours</span>
                  <span className="wrapai-pill">DVLA VES Ready</span>
                </div>
              </div>

              <div className="wrapai-card">
                <div className="wrapai-sectionTitle">Quick start</div>

                <div className="grid gap-2">
                  <label className="wrapai-small wrapai-muted">Registration (optional)</label>
                  <div className="grid gap-2" style={{ gridTemplateColumns: "1fr auto" }}>
                    <input
                      className="wrapai-input"
                      value={vrm}
                      onChange={(e) => setVrm(e.target.value)}
                      placeholder="AB12 CDE"
                    />
                    <button className="wrapai-btn" onClick={lookupVrm} disabled={vrmStatus === "loading"}>
                      {vrmStatus === "loading" ? "Checking…" : "Check"}
                    </button>
                  </div>
                  {vrmMessage && <div className="wrapai-small wrapai-muted">{vrmMessage}</div>}

                  <div className="grid gap-2 mt-2" style={{ gridTemplateColumns: "1fr 1fr" }}>
                    <div>
                      <label className="wrapai-small wrapai-muted">Make</label>
                      <select className="wrapai-select" value={make} onChange={(e) => setMake(e.target.value)}>
                        <option value="">Select make…</option>
                        {makes.map((m) => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="wrapai-small wrapai-muted">Model</label>
                      <select className="wrapai-select" value={model} onChange={(e) => setModel(e.target.value)} disabled={!make}>
                        <option value="">{make ? "Select model…" : "Select make first…"}</option>
                        {models.map((md) => (
                          <option key={md} value={md}>{md}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid gap-2 mt-2" style={{ gridTemplateColumns: "1fr auto" }}>
                    <button
                      className={`wrapai-btn wrapai-btnPrimary ${(!make || !model) ? "opacity-60 cursor-not-allowed" : ""}`}
                      onClick={() => document.getElementById("generator")?.scrollIntoView({ behavior: "smooth" })}
                      disabled={!make || !model}
                    >
                      Open Generator
                    </button>
                    <button className="wrapai-btn" onClick={resetAll}>Reset</button>
                  </div>
                </div>
              </div>
            </div>

            {/* Big moving sponsor-wall logos */}
            <div className="wrapai-card" style={{ marginTop: 18, overflow: "hidden" }}>
              <div className="wrapai-sectionTitle">Popular brands</div>
              <div className="wrapai-marquee">
                <div className="wrapai-fadeL" />
                <div className="wrapai-fadeR" />
                <div className="wrapai-marquee-track">
                  {marqueeLogos.map((b, idx) => (
                    <div className="wrapai-marquee-item" key={`${b.name}-${idx}`} title={b.name}>
                      <Image
                        src={b.file}
                        alt={`${b.name} logo`}
                        width={260}
                        height={120}
                        className="h-16 w-auto object-contain"
                        priority={idx < BRAND_LOGOS.length}
                      />
                    </div>
                  ))}
                </div>
              </div>
              <div className="wrapai-small wrapai-muted" style={{ marginTop: 8 }}>
                Sponsor-wall style strip. Hover to pause.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Solid colour block (Assetto style) */}
      <section className="wrapai-block wrapai-blockYellow" id="how">
        <div className="wrapai-container">
          <div className="wrapai-section">
            <div className="wrapai-sectionTitle">How it works</div>
            <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
              <div className="wrapai-card" style={{ background: "rgba(0,0,0,0.06)", borderColor: "rgba(0,0,0,0.18)" }}>
                <strong>1) Choose your vehicle</strong>
                <div className="wrapai-small muted">Use make/model or (soon) registration lookup via DVLA VES.</div>
              </div>
              <div className="wrapai-card" style={{ background: "rgba(0,0,0,0.06)", borderColor: "rgba(0,0,0,0.18)" }}>
                <strong>2) Pick a wrap</strong>
                <div className="wrapai-small muted">Select gloss/satin/matte colours and popular finishes.</div>
              </div>
              <div className="wrapai-card" style={{ background: "rgba(0,0,0,0.06)", borderColor: "rgba(0,0,0,0.18)" }}>
                <strong>3) Preview & share</strong>
                <div className="wrapai-small muted">Generate a concept and send it to a local wrap shop.</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Generator section (clean, shop-friendly) */}
      <section className="wrapai-block wrapai-blockPurple" id="generator">
        <div className="wrapai-container">
          <div className="wrapai-section">
            <div className="wrapai-sectionTitle">Wrap generator</div>

            <div className="grid gap-4" style={{ gridTemplateColumns: "1.05fr 0.95fr" }}>
              {/* Inputs */}
              <div className="wrapai-card">
                <div className="grid gap-3">
                  <div>
                    <strong style={{ textTransform: "uppercase", letterSpacing: "0.04em" }}>Upload photo (optional)</strong>
                    <div className="wrapai-small wrapai-muted">
                      Uploading isn’t required yet — it’s there for when AI rendering is enabled.
                    </div>
                  </div>

                  <div
                    className="wrapai-card"
                    style={{
                      borderStyle: "dashed",
                      background: "rgba(0,0,0,0.16)",
                      borderColor: dragOver ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.12)",
                    }}
                    onDragEnter={(e) => { e.preventDefault(); e.stopPropagation(); setDragOver(true); }}
                    onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setDragOver(true); }}
                    onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setDragOver(false); }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setDragOver(false);
                      const f = e.dataTransfer.files?.[0];
                      if (f) onFile(f);
                    }}
                  >
                    <div className="grid gap-2" style={{ gridTemplateColumns: "1fr auto" }}>
                      <div>
                        <div style={{ fontWeight: 900 }}>Drag & drop an image</div>
                        <div className="wrapai-small wrapai-muted">PNG/JPG • local preview only</div>
                      </div>
                      <label className="wrapai-btn" style={{ cursor: "pointer", display: "inline-flex", alignItems: "center" }}>
                        Choose file
                        <input
                          type="file"
                          accept="image/*"
                          style={{ display: "none" }}
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) onFile(f);
                          }}
                        />
                      </label>
                    </div>

                    {imageUrl && (
                      <div style={{ marginTop: 12, borderRadius: 14, overflow: "hidden", border: "1px solid rgba(255,255,255,0.10)" }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={imageUrl} alt="Uploaded vehicle" style={{ width: "100%", height: 240, objectFit: "cover" }} />
                      </div>
                    )}
                  </div>

                  <div className="grid gap-3" style={{ gridTemplateColumns: "1fr 1fr" }}>
                    <div>
                      <label className="wrapai-small wrapai-muted">Make</label>
                      <select className="wrapai-select" value={make} onChange={(e) => { setMake(e.target.value); setStatus("idle"); }}>
                        <option value="">Select make…</option>
                        {makes.map((m) => <option key={m} value={m}>{m}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="wrapai-small wrapai-muted">Model</label>
                      <select className="wrapai-select" value={model} onChange={(e) => { setModel(e.target.value); setStatus("idle"); }} disabled={!make}>
                        <option value="">{make ? "Select model…" : "Select make first…"}</option>
                        {models.map((md) => <option key={md} value={md}>{md}</option>)}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="wrapai-small wrapai-muted">Wrap colour & finish</label>
                    <div className="grid gap-2" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", marginTop: 8 }}>
                      {WRAPS.map((w) => {
                        const selected = wrap?.name === w.name;
                        return (
                          <button
                            key={w.name}
                            onClick={() => { setWrap(w); setStatus("idle"); }}
                            className="wrapai-btn"
                            style={{
                              textAlign: "left",
                              display: "flex",
                              gap: 10,
                              alignItems: "center",
                              justifyContent: "flex-start",
                              background: selected ? "rgba(255,255,255,0.14)" : "rgba(255,255,255,0.08)",
                              borderColor: selected ? "rgba(46,212,255,0.40)" : "rgba(255,255,255,0.14)",
                            }}
                          >
                            <span
                              style={{
                                width: 18,
                                height: 18,
                                borderRadius: 999,
                                background: w.hex,
                                border: "1px solid rgba(255,255,255,0.18)",
                              }}
                            />
                            <span style={{ fontWeight: 900 }}>{w.name}</span>
                            <span className="wrapai-small wrapai-muted" style={{ marginLeft: "auto" }}>{w.finish}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid gap-2" style={{ gridTemplateColumns: "1fr auto auto" }}>
                    <button
                      className={`wrapai-btn wrapai-btnPrimary ${(!canGenerate || status === "loading") ? "opacity-60 cursor-not-allowed" : ""}`}
                      onClick={generate}
                      disabled={!canGenerate || status === "loading"}
                    >
                      {status === "loading" ? "Building…" : "Wrap Before you Buy"}
                    </button>
                    <button className="wrapai-btn" onClick={resetAll}>Reset</button>
                  </div>

                  <div className="wrapai-small wrapai-muted">
                    {canGenerate
                      ? "Ready to preview."
                      : "To preview: upload a photo (or select make/model) + choose a wrap."}
                  </div>
                </div>
              </div>

              {/* Preview + SEO */}
              <div className="wrapai-card" id="uk">
                <strong style={{ textTransform: "uppercase", letterSpacing: "0.04em" }}>Preview</strong>
                <div className="wrapai-small wrapai-muted">UI shell now • AI rendering next</div>

                <div className="wrapai-card" style={{ marginTop: 12, background: "rgba(0,0,0,0.18)" }}>
                  {status === "idle" && (
                    <div>
                      <div style={{ fontWeight: 900 }}>No preview yet</div>
                      <div className="wrapai-small wrapai-muted">
                        Choose your vehicle and wrap, then click “Wrap Before you Buy”.
                      </div>
                    </div>
                  )}
                  {status === "loading" && (
                    <div>
                      <div style={{ fontWeight: 900 }}>Rendering…</div>
                      <div className="wrapai-small wrapai-muted">Mock loading state</div>
                    </div>
                  )}
                  {status === "done" && (
                    <div>
                      <div style={{ fontWeight: 900 }}>Preview summary</div>
                      <div className="wrapai-small wrapai-muted">
                        {imageUrl ? "Uploaded photo" : `${make} ${model}`} • {wrap ? `${wrap.name} (${wrap.finish})` : "—"}
                      </div>
                      <div className="wrapai-card" style={{ marginTop: 10, borderStyle: "dashed", background: "rgba(0,0,0,0.14)" }}>
                        AI image result will render here once wired.
                      </div>
                    </div>
                  )}
                </div>

                {/* SEO copy (spread out, 2000–4000 chars overall across the page) */}
                <div style={{ marginTop: 14 }} className="wrapai-small">
                  <h2 style={{ fontWeight: 1000, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 6 }}>
                    Vehicle wrap preview tool (UK)
                  </h2>
                  <p className="wrapai-muted">
                    WrapAI is a UK-focused wrap preview generator that helps you visualise a new colour or finish before you commit.
                    If you’re deciding between gloss, satin, or matte, comparing dark tones to brighter colours, or planning a clean
                    motorsport-inspired look, a fast preview reduces guesswork. It’s especially useful when you’re speaking to a wrap
                    shop and want to show what you mean rather than describing it.
                  </p>

                  <h2 style={{ fontWeight: 1000, textTransform: "uppercase", letterSpacing: "0.04em", marginTop: 12, marginBottom: 6 }}>
                    Cars, vans and bikes
                  </h2>
                  <p className="wrapai-muted">
                    WrapAI is being built for cars, vans and bikes — from daily drivers and weekend builds to commercial vans that need
                    a professional finish. Uploading a photo gives the best reference once AI is enabled, but you can also select make
                    and model to get started quickly. We’re also integrating DVLA Vehicle Enquiry Service (VES) so you can enter a UK
                    registration and automatically pull vehicle details.
                  </p>

                  <h2 style={{ fontWeight: 1000, textTransform: "uppercase", letterSpacing: "0.04em", marginTop: 12, marginBottom: 6 }}>
                    Built for real wrap shops
                  </h2>
                  <p className="wrapai-muted">
                    The goal is a cleaner customer journey: pick a wrap concept, share it, then get an accurate quote. WrapAI will
                    evolve to include wrap catalogues and availability so customers choose colours that are actually common in the UK.
                    This also sets us up to offer an embeddable plugin that wrap companies can add to any HTML website to capture leads
                    and speed up quoting.
                  </p>
                </div>
              </div>
            </div>

            {/* Extra SEO spread (keeps it “not a wall”) */}
            <div className="wrapai-card" style={{ marginTop: 16 }}>
              <div className="wrapai-sectionTitle">Why people use WrapAI</div>
              <div className="wrapai-small wrapai-muted">
                People search for wrap previews because the “final look” depends on finish, lighting, and vehicle lines. WrapAI is built
                to help you explore popular wrap colours, compare styles, and plan a result you’ll actually be happy with — before you
                pay for materials or book a slot. It’s ideal for customers who want a clean, motorsport-inspired aesthetic, a stealth
                satin look, or a bright statement colour that stands out.
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}