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

function cx(...v: Array<string | false | undefined | null>) {
  return v.filter(Boolean).join(" ");
}

export default function HomePage() {
  // Vehicle select (API-driven)
  const [makes, setMakes] = useState<string[]>([]);
  const [models, setModels] = useState<string[]>([]);
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");

  // VRM lookup
  const [vrm, setVrm] = useState("");
  const [vrmStatus, setVrmStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [vrmMessage, setVrmMessage] = useState<string>("");

  // Upload
  const [imageUrl, setImageUrl] = useState<string>("");
  const [dragOver, setDragOver] = useState(false);

  // Wrap
  const [wrap, setWrap] = useState<WrapOption | null>(null);

  // Mock generate
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");

  // Load makes once
  useEffect(() => {
    (async () => {
      const res = await fetch("/api/vehicles/makes", { cache: "no-store" });
      const data = (await res.json()) as { makes: string[] };
      setMakes(data.makes ?? []);
    })().catch(() => setMakes([]));
  }, []);

  // Load models when make changes
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
      setVrmMessage("Couldn’t fetch vehicle details yet. We’ll wire this to DVLA VES with your API key.");
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

  return (
    <div className="min-h-screen bg-[#0b0714] text-white">
      {/* Clean background (logo-themed, not glowy) */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            "radial-gradient(900px 520px at 20% 0%, rgba(98,48,180,.18), transparent 58%), radial-gradient(900px 520px at 85% 10%, rgba(56,190,255,.12), transparent 60%), linear-gradient(180deg, rgba(11,7,20,1), rgba(8,6,16,1))",
        }}
      />

      {/* Header */}
      <header className="relative z-10 border-b border-white/10 bg-black/20 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 overflow-hidden rounded-xl border border-white/10 bg-white/5">
              <Image
                src="/wrapai-logo.png"
                alt="WrapAI"
                width={40}
                height={40}
                className="h-full w-full object-cover"
                priority
              />
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold tracking-wide">WrapAI</div>
              <div className="text-xs text-white/60">Wrap Before you Buy</div>
            </div>
          </div>

          <button
            onClick={resetAll}
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white/80 hover:bg-white/10"
          >
            Reset
          </button>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-6xl px-5 py-10">
        {/* Brand + SEO intro (spread out, not a wall) */}
        <section className="mb-6">
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">WrapAI — UK Wrap Preview Generator</h1>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-white/75">
            WrapAI helps you preview a vehicle wrap before you commit. Whether you drive a car, van, or bike, you can choose your
            vehicle, pick a wrap colour and finish, and generate a realistic wrap concept you can share with a wrap shop.
          </p>
        </section>

       <section className="mb-6 rounded-2xl border border-white/10 bg-white/[0.04] p-4 overflow-hidden">
  <div className="flex items-center justify-between gap-3">
    <div>
      <div className="text-sm font-semibold">Popular brands</div>
      <div className="text-xs text-white/60">Scrolls like a sponsor wall • hover to pause</div>
    </div>
  </div>

  <div className="relative mt-4">
  {/* edge fades */}
  <div className="pointer-events-none absolute left-0 top-0 h-full w-16 bg-gradient-to-r from-[#0b0714] to-transparent" />
  <div className="pointer-events-none absolute right-0 top-0 h-full w-16 bg-gradient-to-l from-[#0b0714] to-transparent" />

  <div className="wrapai-marquee">
    <div className="wrapai-marquee-track">
      {[...BRAND_LOGOS, ...BRAND_LOGOS].map((b, idx) => (
        <div key={`${b.name}-${idx}`} className="wrapai-marquee-item" title={b.name}>
          <Image
            src={b.file}
            alt={`${b.name} logo`}
            width={180}
            height={80}
            className="h-16 w-auto object-contain opacity-90"
            priority={idx < BRAND_LOGOS.length}
          />
        </div>
      ))}
    </div>
  </div>
</div>

  <style jsx>{`
    .marquee {
      width: 100%;
      overflow: hidden;
    }

    .marquee__track {
      display: flex;
      gap: 28px;
      width: max-content;
      animation: scroll 22s linear infinite;
      padding: 6px 0;
    }

    /* pause on hover */
    .group:hover .marquee__track {
      animation-play-state: paused;
    }

    .marquee__item {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 72px;
      padding: 10px 18px;
      border-radius: 16px;
      border: 1px solid rgba(255, 255, 255, 0.08);
      background: rgba(0, 0, 0, 0.18);
      backdrop-filter: blur(6px);
    }

    @keyframes scroll {
      from {
        transform: translateX(0);
      }
      to {
        transform: translateX(-50%);
      }
    }

    /* accessibility */
    @media (prefers-reduced-motion: reduce) {
      .marquee__track {
        animation: none;
      }
    }
  `}</style>
</section>

        {/* Generator */}
        <section className="grid gap-4 lg:grid-cols-[1.05fr_.95fr]">
          {/* Left: inputs */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 shadow-[0_18px_50px_rgba(0,0,0,.35)]">
            <div className="mb-3">
              <div className="text-sm font-semibold">Wrap Before you Buy</div>
              <div className="text-xs text-white/60">Upload photo or use vehicle selection • choose wrap • preview</div>
            </div>

            {/* VRM lookup */}
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <div className="text-xs font-semibold text-white/70">Registration lookup (DVLA VES)</div>
              <p className="mt-2 text-xs leading-relaxed text-white/60">
                Enter your UK registration to automatically pull your make/model. This will be connected via a server-side API
                route using the DVLA Vehicle Enquiry Service (VES) key.
              </p>

              <div className="mt-3 grid gap-2 md:grid-cols-[1fr_auto]">
                <input
                  value={vrm}
                  onChange={(e) => setVrm(e.target.value)}
                  placeholder="e.g. AB12 CDE"
                  className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-sm font-semibold text-white outline-none focus:border-white/20"
                />
                <button
                  onClick={lookupVrm}
                  className={cx(
                    "rounded-xl px-4 py-3 text-sm font-semibold transition",
                    vrmStatus === "loading"
                      ? "cursor-not-allowed border border-white/10 bg-white/5 text-white/50"
                      : "border border-white/10 bg-white/5 hover:bg-white/10"
                  )}
                  disabled={vrmStatus === "loading"}
                >
                  {vrmStatus === "loading" ? "Checking…" : "Check reg"}
                </button>
              </div>

              {vrmMessage && (
                <div className={cx("mt-2 text-xs", vrmStatus === "error" ? "text-red-200/80" : "text-white/70")}>
                  {vrmMessage}
                </div>
              )}
            </div>

            {/* Upload */}
            <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4">
              <div className="text-xs font-semibold text-white/70">Photo upload (optional)</div>
              <div
                className={cx(
                  "mt-3 rounded-2xl border border-dashed border-white/15 bg-white/5 p-4 transition",
                  dragOver && "border-white/25 bg-white/10"
                )}
                onDragEnter={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setDragOver(true);
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setDragOver(true);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setDragOver(false);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setDragOver(false);
                  const f = e.dataTransfer.files?.[0];
                  if (f) onFile(f);
                }}
              >
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div className="text-sm">
                    <div className="font-semibold">Drag & drop an image</div>
                    <div className="text-xs text-white/60">Helps later when AI rendering is enabled</div>
                  </div>
                  <label className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold hover:bg-white/10">
                    Choose file
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) onFile(f);
                      }}
                    />
                  </label>
                </div>

                {imageUrl && (
                  <div className="mt-4 overflow-hidden rounded-xl border border-white/10">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imageUrl} alt="Uploaded vehicle" className="h-56 w-full object-cover" />
                  </div>
                )}
              </div>
            </div>

            {/* Make/Model */}
            <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4">
              <div className="text-xs font-semibold text-white/70">Vehicle selection</div>
              <p className="mt-2 text-xs leading-relaxed text-white/60">
                Choose your make and model if you don’t want to upload a photo. These dropdowns are API-driven so we can expand to
                full UK coverage (cars, vans, bikes) via your database.
              </p>

              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-white/60">Make</label>
                  <select
                    value={make}
                    onChange={(e) => {
                      setMake(e.target.value);
                      setStatus("idle");
                    }}
                    className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-sm font-semibold text-white outline-none focus:border-white/20"
                  >
                    <option value="">Select make…</option>
                    {makes.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-white/60">Model</label>
                  <select
                    value={model}
                    onChange={(e) => {
                      setModel(e.target.value);
                      setStatus("idle");
                    }}
                    disabled={!make}
                    className={cx(
                      "w-full rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-sm font-semibold text-white outline-none focus:border-white/20",
                      !make && "opacity-60"
                    )}
                  >
                    <option value="">{make ? "Select model…" : "Select make first…"}</option>
                    {models.map((md) => (
                      <option key={md} value={md}>
                        {md}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Wrap selection */}
            <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4">
              <div className="flex items-end justify-between gap-3">
                <div>
                  <div className="text-xs font-semibold text-white/70">Wrap colour & finish</div>
                  <div className="mt-1 text-xs text-white/60">We’ll load full UK wrap inventories later (3M/Avery etc).</div>
                </div>
                {wrap && (
                  <div className="text-xs font-semibold text-white/80">
                    Selected: <span className="text-white">{wrap.name}</span> <span className="text-white/60">({wrap.finish})</span>
                  </div>
                )}
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {WRAPS.map((w) => {
                  const selected = wrap?.name === w.name;
                  return (
                    <button
                      key={w.name}
                      onClick={() => {
                        setWrap(w);
                        setStatus("idle");
                      }}
                      className={cx(
                        "flex items-center gap-3 rounded-xl border bg-black/25 p-3 text-left transition",
                        selected ? "border-white/30 bg-white/10" : "border-white/10 hover:border-white/20 hover:bg-white/5"
                      )}
                    >
                      <span className="h-6 w-6 rounded-full border border-white/15" style={{ background: w.hex }} />
                      <span className="min-w-0">
                        <div className="truncate text-xs font-semibold">{w.name}</div>
                        <div className="truncate text-[11px] text-white/60">{w.finish}</div>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Actions */}
            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-xs text-white/60">
                {canGenerate ? "Ready to preview." : "To preview: upload a photo (or select make/model) + choose a wrap."}
              </div>

              <button
                onClick={generate}
                disabled={!canGenerate || status === "loading"}
                className={cx(
                  "rounded-xl px-5 py-3 text-sm font-semibold transition",
                  !canGenerate || status === "loading"
                    ? "cursor-not-allowed border border-white/10 bg-white/5 text-white/40"
                    : "border border-white/15 bg-white/10 hover:bg-white/15"
                )}
              >
                {status === "loading" ? "Building preview…" : "Wrap Before you Buy"}
              </button>
            </div>
          </div>

          {/* Right: preview + SEO blocks */}
          <aside className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 shadow-[0_18px_50px_rgba(0,0,0,.35)]">
            <div className="mb-3">
              <div className="text-sm font-semibold">Preview panel</div>
              <div className="text-xs text-white/60">This is the UI shell — AI rendering comes next</div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/25">
              <div className="flex h-[360px] items-center justify-center p-6">
                {status === "idle" && (
                  <div className="text-center">
                    <div className="text-sm font-semibold">No preview yet</div>
                    <div className="mt-1 text-xs text-white/60">
                      Choose your vehicle and wrap, then click “Wrap Before you Buy”.
                    </div>
                  </div>
                )}

                {status === "loading" && (
                  <div className="text-center">
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold">
                      <span className="h-2 w-2 animate-pulse rounded-full bg-white/80" />
                      Rendering…
                    </div>
                    <div className="mt-2 text-xs text-white/60">Mock loading state</div>
                  </div>
                )}

                {status === "done" && (
                  <div className="w-full p-4">
                    <div className="mb-3 text-xs font-semibold text-white/70">Preview summary</div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="truncate text-sm font-semibold">
                            {imageUrl ? "Uploaded photo" : `${make || "—"} ${model || ""}`.trim()}
                          </div>
                          <div className="mt-1 text-xs text-white/60">
                            Wrap: {wrap ? `${wrap.name} (${wrap.finish})` : "—"}
                          </div>
                        </div>
                        <span className="h-10 w-10 rounded-xl border border-white/10" style={{ background: wrap?.hex ?? "#111319" }} />
                      </div>

                      <div className="mt-4 rounded-xl border border-dashed border-white/15 bg-black/20 p-4 text-xs text-white/60">
                        AI image result will render here once the generator is wired.
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* SEO content block — spread out (target ~2000–4000 chars overall) */}
            <div className="mt-4 space-y-3 text-sm leading-relaxed text-white/75">
              <h2 className="text-sm font-semibold text-white">Preview vehicle wraps in the UK</h2>
              <p>
                WrapAI is built for people who want a clear idea of how a new wrap will look before spending money with a wrap shop.
                If you’re comparing gloss, satin, or matte finishes, switching colours for a new look, or planning a commercial wrap
                for a van, a fast preview helps you make a confident decision.
              </p>

              <h2 className="text-sm font-semibold text-white">Cars, vans and bikes</h2>
              <p>
                The WrapAI generator is designed around common UK vehicle use cases: daily drivers, weekend cars, trade vans and
                bikes. You can upload a photo for a more accurate reference, or select your make and model. You can also use the
                registration lookup to pull vehicle details via the DVLA Vehicle Enquiry Service (VES) when enabled.
              </p>

              <h2 className="text-sm font-semibold text-white">Made to work with wrap shops</h2>
              <p>
                Once you’ve selected a wrap colour and finish, WrapAI can generate a shareable concept that you can send to a local
                wrap installer. This reduces back-and-forth, speeds up quoting, and helps shops understand what you want. Over time,
                we’ll expand to include wrap catalogues, popular colours, and market trends so your choices reflect what’s actually
                available in the UK.
              </p>

              <h2 className="text-sm font-semibold text-white">Built for plugins and websites</h2>
              <p>
                The WrapAI generator is being designed as a clean, embeddable module — meaning wrap companies can add it to their own
                HTML website as a plugin. That gives customers a modern “wrap before you buy” experience directly on the shop’s site,
                while WrapAI handles the data, selection flow and preview output.
              </p>

              <p className="text-xs text-white/60">
                Note: this is the MVP UI. Live DVLA lookup and AI image generation are integrated next.
              </p>
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
}