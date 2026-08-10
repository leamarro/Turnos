"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Playfair_Display,
  Bebas_Neue,
  Montserrat,
  Poppins,
  Caveat,
  Oswald,
  Quicksand,
} from "next/font/google";
import { Plus, X, Upload, ImageDown, Wand2 } from "lucide-react";
import { haptic } from "@/lib/haptics";

const playfair = Playfair_Display({ subsets: ["latin"], weight: ["600", "700", "800"] });
const montserrat = Montserrat({ subsets: ["latin"], weight: ["600", "700", "800"] });
const bebas = Bebas_Neue({ subsets: ["latin"], weight: "400" });
const poppins = Poppins({ subsets: ["latin"], weight: ["600", "700", "800"] });
const caveat = Caveat({ subsets: ["latin"], weight: ["600", "700"] });
const oswald = Oswald({ subsets: ["latin"], weight: ["500", "600", "700"] });
const quicksand = Quicksand({ subsets: ["latin"], weight: ["500", "600", "700"] });

const FONT_OPTIONS = [
  { name: "Playfair Display", family: playfair.style.fontFamily },
  { name: "Montserrat", family: montserrat.style.fontFamily },
  { name: "Bebas Neue", family: bebas.style.fontFamily },
  { name: "Poppins", family: poppins.style.fontFamily },
  { name: "Caveat", family: caveat.style.fontFamily },
  { name: "Oswald", family: oswald.style.fontFamily },
  { name: "Quicksand", family: quicksand.style.fontFamily },
];

const GRADIENTS = [
  { name: "Rosa", c1: "#ff9a9e", c2: "#fecfef", accent: "#e63946" },
  { name: "Naranja", c1: "#ffb75e", c2: "#ed8f03", accent: "#c92c2c" },
  { name: "Violeta", c1: "#a18cd1", c2: "#fbc2eb", accent: "#7c3aed" },
  { name: "Azul", c1: "#2193b0", c2: "#6dd5ed", accent: "#0369a1" },
  { name: "Verde", c1: "#0ba360", c2: "#3cba92", accent: "#065f46" },
  { name: "Fuego", c1: "#8e0e00", c2: "#1f1c18", accent: "#ffb703" },
  { name: "Oscuro", c1: "#232526", c2: "#414345", accent: "#f5b700" },
  { name: "Morado", c1: "#41295a", c2: "#2f0743", accent: "#ff7eb3" },
];

type BgMode = "gradient" | "solid" | "photo";
type TextMode = "auto" | "claro" | "oscuro";
type Effect = "none" | "dots" | "circles" | "stripes";
type Overlay = "none" | "soft" | "strong";

type Config = {
  emoji: string;
  title: string;
  service: string;
  schedules: string[];
  cta: string;
  handle: string;
  font: string;
  bgMode: BgMode;
  c1: string;
  c2: string;
  accent: string;
  textMode: TextMode;
  effect: Effect;
  frame: boolean;
  photo: string | null;
  photoBlur: boolean;
  overlay: Overlay;
};

type Preset = { name: string; patch: Partial<Config> };

const PRESETS: Preset[] = [
  {
    name: "Minimal",
    patch: {
      bgMode: "solid",
      c1: "#EFEAE7",
      c2: "#EFEAE7",
      accent: "#9a3412",
      font: playfair.style.fontFamily,
      textMode: "auto",
      effect: "none",
      frame: false,
      overlay: "soft",
    },
  },
  {
    name: "Noche",
    patch: {
      bgMode: "gradient",
      c1: "#232526",
      c2: "#414345",
      accent: "#f5b700",
      font: bebas.style.fontFamily,
      textMode: "auto",
      effect: "circles",
      frame: false,
      overlay: "soft",
    },
  },
  {
    name: "Rosa",
    patch: {
      bgMode: "gradient",
      c1: "#ff9a9e",
      c2: "#fecfef",
      accent: "#e63946",
      font: playfair.style.fontFamily,
      textMode: "auto",
      effect: "none",
      frame: false,
      overlay: "soft",
    },
  },
  {
    name: "Verano",
    patch: {
      bgMode: "gradient",
      c1: "#0f766e",
      c2: "#134e4a",
      accent: "#fbbf24",
      font: poppins.style.fontFamily,
      textMode: "auto",
      effect: "dots",
      frame: false,
      overlay: "soft",
    },
  },
  {
    name: "Tinta",
    patch: {
      bgMode: "solid",
      c1: "#141414",
      c2: "#141414",
      accent: "#f59e0b",
      font: montserrat.style.fontFamily,
      textMode: "auto",
      effect: "none",
      frame: false,
      overlay: "soft",
    },
  },
];

const W = 1080;
const H = 1920;

/* ---------------- Helpers de dibujo ---------------- */

function setLetterSpacing(ctx: CanvasRenderingContext2D, px: number) {
  try {
    (ctx as unknown as { letterSpacing: string }).letterSpacing = `${px}px`;
  } catch {
    /* noop */
  }
}

function hexToRgb(hex: string) {
  const m = hex.replace("#", "");
  const n = parseInt(m, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function luminance(hex: string) {
  const { r, g, b } = hexToRgb(hex);
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number) {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const test = line ? line + " " + w : w;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = w;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

type Palette = {
  lightText: boolean;
  text: string;
  textSoft: string;
  textFaint: string;
  cardBg: string;
  cardBorder: string;
  emojiBg: string;
  emojiBorder: string;
};

function getPalette(c: Config): Palette {
  let bgDark: boolean;
  if (c.bgMode === "photo") {
    bgDark = c.textMode === "oscuro" ? false : true;
  } else {
    const lum = (luminance(c.c1) + luminance(c.c2)) / 2;
    bgDark = lum < 140;
  }
  const lightText =
    c.textMode === "claro" ? true : c.textMode === "oscuro" ? false : bgDark;
  return {
    lightText,
    text: lightText ? "#ffffff" : "#201a16",
    textSoft: lightText ? "rgba(255,255,255,0.92)" : "rgba(32,26,22,0.92)",
    textFaint: lightText ? "rgba(255,255,255,0.75)" : "rgba(32,26,22,0.62)",
    cardBg: lightText ? "rgba(255,255,255,0.13)" : "rgba(0,0,0,0.05)",
    cardBorder: lightText ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.14)",
    emojiBg: lightText ? "rgba(255,255,255,0.14)" : "rgba(0,0,0,0.06)",
    emojiBorder: lightText ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.18)",
  };
}

/* ---------------- Fondo, patrones y efectos ---------------- */

function drawPattern(ctx: CanvasRenderingContext2D, c: Config, pal: Palette) {
  if (c.effect === "none") return;
  const col = pal.lightText ? "255,255,255" : "32,26,22";
  ctx.save();
  if (c.effect === "dots") {
    ctx.fillStyle = `rgba(${col},0.08)`;
    for (let y = 55; y < H; y += 110) {
      for (let x = 55; x < W; x += 110) {
        ctx.beginPath();
        ctx.arc(x, y, 3.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  } else if (c.effect === "circles") {
    ctx.strokeStyle = `rgba(${col},0.07)`;
    ctx.lineWidth = 3;
    const spots: Array<[number, number, number]> = [
      [150, 300, 120],
      [930, 420, 150],
      [880, 1520, 130],
      [180, 1620, 170],
      [540, 900, 110],
    ];
    spots.forEach(([x, y, r]) => {
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.stroke();
    });
  } else if (c.effect === "stripes") {
    ctx.strokeStyle = `rgba(${col},0.06)`;
    ctx.lineWidth = 60;
    ctx.translate(W / 2, H / 2);
    ctx.rotate(Math.PI / 4);
    for (let x = -H; x < W + H; x += 220) {
      ctx.beginPath();
      ctx.moveTo(x, -H);
      ctx.lineTo(x, H);
      ctx.stroke();
    }
  }
  ctx.restore();
}

function drawFrame(ctx: CanvasRenderingContext2D, c: Config) {
  if (!c.frame) return;
  roundRect(ctx, 42, 42, W - 84, H - 84, 56);
  ctx.lineWidth = 6;
  ctx.strokeStyle = c.accent;
  ctx.globalAlpha = 0.9;
  ctx.stroke();
  ctx.globalAlpha = 1;
}

function drawBackground(
  ctx: CanvasRenderingContext2D,
  c: Config,
  photo: HTMLImageElement | null,
  pal: Palette
) {
  if (c.bgMode === "photo" && photo) {
    if (c.photoBlur) ctx.filter = "blur(28px)";
    const iw = photo.naturalWidth;
    const ih = photo.naturalHeight;
    const scale = Math.max(W / iw, H / ih);
    const dw = iw * scale;
    const dh = ih * scale;
    ctx.drawImage(photo, (W - dw) / 2, (H - dh) / 2, dw, dh);
    if (c.photoBlur) ctx.filter = "none";
  } else if (c.bgMode === "solid") {
    ctx.fillStyle = c.c1;
    ctx.fillRect(0, 0, W, H);
  } else {
    const g = ctx.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, c.c1);
    g.addColorStop(1, c.c2);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  }

  let alpha = 0;
  if (c.overlay === "strong") alpha = pal.lightText ? 0.32 : 0.12;
  else if (c.overlay === "soft") alpha = pal.lightText ? 0.16 : 0.05;
  if (c.bgMode === "photo" && pal.lightText && alpha < 0.18) alpha = 0.18;
  if (alpha > 0) {
    ctx.fillStyle = `rgba(0,0,0,${alpha})`;
    ctx.fillRect(0, 0, W, H);
  }

  if (pal.lightText) {
    const top = ctx.createLinearGradient(0, 0, 0, 700);
    top.addColorStop(0, "rgba(0,0,0,0.38)");
    top.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = top;
    ctx.fillRect(0, 0, W, 700);

    const bottom = ctx.createLinearGradient(0, H, 0, H - 700);
    bottom.addColorStop(0, "rgba(0,0,0,0)");
    bottom.addColorStop(1, "rgba(0,0,0,0.4)");
    ctx.fillStyle = bottom;
    ctx.fillRect(0, H - 700, W, 700);
  }

  drawPattern(ctx, c, pal);
}

/* ---------------- Bloques de contenido ---------------- */

function drawEmoji(ctx: CanvasRenderingContext2D, c: Config, pal: Palette) {
  if (!c.emoji) return;
  const cx = W / 2;
  const cy = 250;
  ctx.beginPath();
  ctx.arc(cx, cy, 96, 0, Math.PI * 2);
  ctx.fillStyle = pal.emojiBg;
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = pal.emojiBorder;
  ctx.stroke();
  ctx.font = '100px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(c.emoji, cx, cy + 4);
}

function drawEyebrow(ctx: CanvasRenderingContext2D, c: Config, pal: Palette) {
  if (!c.service) return;
  ctx.font = `700 44px ${c.font}`;
  ctx.fillStyle = pal.textSoft;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  setLetterSpacing(ctx, 8);
  ctx.fillText(c.service.toUpperCase(), W / 2, 462);
  setLetterSpacing(ctx, 0);
}

function drawTitle(ctx: CanvasRenderingContext2D, c: Config, pal: Palette) {
  const maxW = W - 144;
  const centerY = 600;
  let size = 150;
  let lines: string[] = [];
  for (;;) {
    ctx.font = `800 ${size}px ${c.font}`;
    lines = wrapText(ctx, c.title || "Turnos Disponibles", maxW);
    const fits = lines.length <= 3 && lines.every((l) => ctx.measureText(l).width <= maxW);
    if (fits || size <= 54) break;
    size -= 6;
  }
  const lh = size * 1.06;
  const top = centerY - ((lines.length - 1) * lh) / 2;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = pal.text;
  if (pal.lightText) {
    ctx.shadowColor = "rgba(0,0,0,0.35)";
    ctx.shadowBlur = 26;
    ctx.shadowOffsetY = 6;
  }
  lines.forEach((l, i) => ctx.fillText(l, W / 2, top + i * lh));
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;
}

function drawScheduleCard(ctx: CanvasRenderingContext2D, c: Config, pal: Palette) {
  const rows = c.schedules.filter((s) => s.trim());
  if (rows.length === 0) return 860;

  const left = 96;
  const right = W - 96;
  const pad = 56;
  const labelH = 54;
  const cap = 620;
  const top = 860;

  let rh = rows.length <= 6 ? 92 : 76;
  let fs = rows.length <= 6 ? 46 : 39;
  let need = pad + labelH + rows.length * rh + pad;
  if (need > cap) {
    rh = 68;
    fs = 34;
    need = pad + labelH + rows.length * rh + pad;
  }
  const bottom = top + Math.min(need, cap);
  const maxRows = Math.max(1, Math.floor((Math.min(need, cap) - pad - labelH) / rh));
  const shown = rows.slice(0, maxRows);
  const truncated = rows.length > maxRows;

  roundRect(ctx, left, top, right - left, bottom - top, 56);
  ctx.fillStyle = pal.cardBg;
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = pal.cardBorder;
  ctx.stroke();

  ctx.font = `700 ${fs - 6}px ${c.font}`;
  ctx.fillStyle = pal.textFaint;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  setLetterSpacing(ctx, 6);
  ctx.fillText("HORARIOS", left + pad, top + pad + 22);
  setLetterSpacing(ctx, 0);

  const rowStartY = top + pad + labelH;
  ctx.font = `600 ${fs}px ${c.font}`;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";

  shown.forEach((r, i) => {
    const cy = rowStartY + i * rh + rh / 2;
    ctx.beginPath();
    ctx.arc(left + pad + 14, cy, 13, 0, Math.PI * 2);
    ctx.fillStyle = c.accent;
    ctx.fill();
    ctx.fillStyle = pal.textSoft;
    ctx.fillText(r, left + pad + 54, cy);
  });

  if (truncated) {
    ctx.font = `600 ${fs - 10}px ${c.font}`;
    ctx.fillStyle = pal.textFaint;
    ctx.fillText("… y más", left + pad + 54, bottom - 40);
  }

  return bottom;
}

function drawCTA(ctx: CanvasRenderingContext2D, c: Config, cardBottom: number) {
  if (!c.cta) return;
  let size = 50;
  ctx.font = `800 ${size}px ${c.font}`;
  let lines = wrapText(ctx, c.cta, 720);
  while (lines.length > 2 && size > 34) {
    size -= 4;
    ctx.font = `800 ${size}px ${c.font}`;
    lines = wrapText(ctx, c.cta, 720);
  }
  const lh = size * 1.35;
  let w = 0;
  lines.forEach((l) => (w = Math.max(w, ctx.measureText(l).width)));
  w = Math.min(920, w + 90);
  const h = Math.max(130, lines.length * lh + 56);
  const topY = Math.min(1590, cardBottom + 150);
  const y = topY - h / 2;
  const x = (W - w) / 2;

  roundRect(ctx, x, y, w, h, 64);
  ctx.fillStyle = c.accent;
  ctx.shadowColor = "rgba(0,0,0,0.3)";
  ctx.shadowBlur = 24;
  ctx.shadowOffsetY = 6;
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

  const textTop = y + (h - lines.length * lh) / 2 + size / 2;
  ctx.font = `800 ${size}px ${c.font}`;
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  lines.forEach((l, i) => ctx.fillText(l, W / 2, textTop + i * lh));
}

function drawHandle(ctx: CanvasRenderingContext2D, c: Config, pal: Palette) {
  if (!c.handle) return;
  ctx.font = `600 40px ${c.font}`;
  ctx.fillStyle = pal.textFaint;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(c.handle, W / 2, H - 130);
}

function drawStory(
  canvas: HTMLCanvasElement,
  c: Config,
  photo: HTMLImageElement | null
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const pal = getPalette(c);
  ctx.clearRect(0, 0, W, H);
  drawBackground(ctx, c, photo, pal);
  drawEmoji(ctx, c, pal);
  drawEyebrow(ctx, c, pal);
  drawTitle(ctx, c, pal);
  const cardBottom = drawScheduleCard(ctx, c, pal);
  drawCTA(ctx, c, cardBottom);
  drawHandle(ctx, c, pal);
  drawFrame(ctx, c);
}

/* ---------------- Componente ---------------- */

const inputCls =
  "w-full border border-gray-200 dark:border-gray-700 dark:bg-[#1f1f1f] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-black dark:focus:border-white dark:text-gray-100";

const chipOn =
  "px-3 py-1.5 rounded-full text-xs font-medium bg-black dark:bg-white text-white dark:text-black";
const chipOff =
  "px-3 py-1.5 rounded-full text-xs font-medium text-gray-500 border border-gray-200 dark:border-gray-700";

function Seg({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <div className="flex bg-gray-100 dark:bg-[#1f1f1f] rounded-xl p-1">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition ${
            value === o.value
              ? "bg-white dark:bg-[#333] shadow-sm dark:text-gray-100"
              : "text-gray-500"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export default function HistoriasPage() {
  const [config, setConfig] = useState<Config>({
    emoji: "✨",
    title: "Turnos Disponibles",
    service: "Pestañas · Manicura",
    schedules: ["Lunes a Viernes · 9 a 18 hs", "Sábados · 9 a 13 hs"],
    cta: "Respondé esta historia para reservar tu turno",
    handle: "@tuusuario",
    font: FONT_OPTIONS[0].family,
    bgMode: "gradient",
    c1: GRADIENTS[0].c1,
    c2: GRADIENTS[0].c2,
    accent: GRADIENTS[0].accent,
    textMode: "auto",
    effect: "none",
    frame: false,
    photo: null,
    photoBlur: false,
    overlay: "soft",
  });
  const [swatchIndex, setSwatchIndex] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const photoRef = useRef<HTMLImageElement | null>(null);
  const configRef = useRef(config);
  configRef.current = config;

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    drawStory(canvas, configRef.current, photoRef.current);
  }, []);

  useEffect(() => {
    redraw();
  }, [config, redraw]);

  useEffect(() => {
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(redraw);
    }
  }, [redraw]);

  const set = (patch: Partial<Config>) => setConfig((c) => ({ ...c, ...patch }));

  const applySwatch = (i: number) => {
    const g = GRADIENTS[i];
    setSwatchIndex(i);
    set({ bgMode: "gradient", c1: g.c1, c2: g.c2, accent: g.accent });
  };

  const applyPreset = (p: Preset) => {
    setSwatchIndex(-1);
    haptic();
    set(p.patch);
  };

  const onPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        photoRef.current = img;
        set({ photo: String(reader.result), bgMode: "photo" });
        redraw();
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const removePhoto = () => {
    photoRef.current = null;
    set({ photo: null, bgMode: "gradient" });
  };

  const download = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    haptic();
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "historia-turnos-disponibles.png";
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 2000);
    }, "image/png");
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#1a1a1a]">
      <div className="sr-only" aria-hidden>
        <span className={playfair.className}>.</span>
        <span className={montserrat.className}>.</span>
        <span className={bebas.className}>.</span>
        <span className={poppins.className}>.</span>
        <span className={caveat.className}>.</span>
        <span className={oswald.className}>.</span>
        <span className={quicksand.className}>.</span>
      </div>

      <div className="max-w-6xl mx-auto px-4 pt-6 pb-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">Historias</h1>
          <button
            onClick={download}
            className="flex items-center gap-1.5 bg-black dark:bg-white text-white dark:text-black text-sm px-4 py-2.5 rounded-xl font-medium active:scale-95 transition"
          >
            <ImageDown size={16} />
            Descargar
          </button>
        </div>

        <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
          {/* ===== EDITOR ===== */}
          <div className="bg-white dark:bg-[#252525] rounded-2xl shadow-sm dark:shadow-none dark:border dark:border-gray-800 p-5 space-y-5">
            <div className="flex items-center gap-2">
              <Wand2 size={16} className="text-gray-400" />
              <h2 className="text-sm font-semibold text-gray-600 dark:text-gray-300">
                Personalizá tu historia
              </h2>
            </div>

            {/* Plantillas */}
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Plantillas</label>
              <div className="flex flex-wrap gap-2">
                {PRESETS.map((p) => (
                  <button
                    key={p.name}
                    onClick={() => applyPreset(p)}
                    className={chipOff}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5">Emoji</label>
                  <input
                    value={config.emoji}
                    onChange={(e) => set({ emoji: e.target.value })}
                    maxLength={4}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5">Tipografía</label>
                  <select
                    value={config.font}
                    onChange={(e) => set({ font: e.target.value })}
                    className={inputCls}
                  >
                    {FONT_OPTIONS.map((f) => (
                      <option key={f.name} value={f.family}>
                        {f.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Título principal</label>
                <input
                  value={config.title}
                  onChange={(e) => set({ title: e.target.value })}
                  className={inputCls}
                  placeholder="Turnos Disponibles"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Servicio / subtítulo</label>
                <input
                  value={config.service}
                  onChange={(e) => set({ service: e.target.value })}
                  className={inputCls}
                  placeholder="Pestañas · Manicura"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Días y horarios</label>
                <div className="space-y-2">
                  {config.schedules.map((s, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input
                        value={s}
                        onChange={(e) => {
                          const schedules = [...config.schedules];
                          schedules[i] = e.target.value;
                          set({ schedules });
                        }}
                        className={inputCls}
                        placeholder="Ej: Martes 14 a 18 hs"
                      />
                      <button
                        onClick={() => {
                          const schedules = config.schedules.filter((_, j) => j !== i);
                          set({ schedules });
                        }}
                        className="p-2 text-gray-300 hover:text-red-400 transition shrink-0"
                        aria-label="Quitar horario"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => set({ schedules: [...config.schedules, ""] })}
                    className="flex items-center gap-1 text-xs text-gray-500 border border-gray-200 dark:border-gray-700 rounded-full px-3 py-1.5"
                  >
                    <Plus size={14} />
                    Agregar horario
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Mensaje / llamada a la acción</label>
                <input
                  value={config.cta}
                  onChange={(e) => set({ cta: e.target.value })}
                  className={inputCls}
                  placeholder="Respondé esta historia para reservar"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Usuario de Instagram</label>
                <input
                  value={config.handle}
                  onChange={(e) => set({ handle: e.target.value })}
                  className={inputCls}
                  placeholder="@tuusuario"
                />
              </div>

              {/* Fondo */}
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Fondo</label>
                <Seg
                  value={config.bgMode}
                  onChange={(v) => set({ bgMode: v as BgMode })}
                  options={[
                    { value: "gradient", label: "Gradiente" },
                    { value: "solid", label: "Color" },
                    { value: "photo", label: "Foto" },
                  ]}
                />

                {config.bgMode === "gradient" && (
                  <>
                    <div className="flex gap-2 flex-wrap mt-3">
                      {GRADIENTS.map((g, i) => (
                        <button
                          key={g.name}
                          type="button"
                          onClick={() => applySwatch(i)}
                          className={`w-8 h-8 rounded-full border-2 transition ${
                            swatchIndex === i
                              ? "border-black dark:border-white scale-110"
                              : "border-transparent"
                          }`}
                          style={{ background: `linear-gradient(135deg, ${g.c1}, ${g.c2})` }}
                          aria-label={g.name}
                        />
                      ))}
                    </div>
                    <div className="flex items-center gap-4 mt-3">
                      <label className="flex flex-col gap-1 text-[11px] text-gray-400">
                        Color A
                        <input
                          type="color"
                          value={config.c1}
                          onChange={(e) => {
                            setSwatchIndex(-1);
                            set({ c1: e.target.value });
                          }}
                          className="w-10 h-8 rounded cursor-pointer border-0"
                        />
                      </label>
                      <label className="flex flex-col gap-1 text-[11px] text-gray-400">
                        Color B
                        <input
                          type="color"
                          value={config.c2}
                          onChange={(e) => {
                            setSwatchIndex(-1);
                            set({ c2: e.target.value });
                          }}
                          className="w-10 h-8 rounded cursor-pointer border-0"
                        />
                      </label>
                      <label className="flex flex-col gap-1 text-[11px] text-gray-400">
                        Acento
                        <input
                          type="color"
                          value={config.accent}
                          onChange={(e) => {
                            setSwatchIndex(-1);
                            set({ accent: e.target.value });
                          }}
                          className="w-10 h-8 rounded cursor-pointer border-0"
                        />
                      </label>
                    </div>
                  </>
                )}

                {config.bgMode === "solid" && (
                  <div className="flex items-center gap-4 mt-3">
                    <label className="flex flex-col gap-1 text-[11px] text-gray-400">
                      Color de fondo
                      <input
                        type="color"
                        value={config.c1}
                        onChange={(e) => set({ c1: e.target.value, c2: e.target.value })}
                        className="w-10 h-8 rounded cursor-pointer border-0"
                      />
                    </label>
                    <label className="flex flex-col gap-1 text-[11px] text-gray-400">
                      Acento
                      <input
                        type="color"
                        value={config.accent}
                        onChange={(e) => set({ accent: e.target.value })}
                        className="w-10 h-8 rounded cursor-pointer border-0"
                      />
                    </label>
                  </div>
                )}

                {config.bgMode === "photo" && (
                  <div className="space-y-3 mt-3">
                    <div className="flex items-center gap-3 flex-wrap">
                      <label className="flex items-center gap-1.5 text-xs text-gray-500 border border-gray-200 dark:border-gray-700 rounded-full px-3 py-1.5 cursor-pointer">
                        <Upload size={13} />
                        {config.photo ? "Cambiar foto" : "Subir foto"}
                        <input type="file" accept="image/*" className="hidden" onChange={onPhoto} />
                      </label>
                      {config.photo && (
                        <button
                          onClick={removePhoto}
                          className="text-xs text-red-400 border border-gray-200 dark:border-gray-700 rounded-full px-3 py-1.5"
                        >
                          Quitar foto
                        </button>
                      )}
                    </div>
                    {config.photo && (
                      <label className="flex items-center gap-2 text-xs text-gray-500">
                        <input
                          type="checkbox"
                          checked={config.photoBlur}
                          onChange={(e) => set({ photoBlur: e.target.checked })}
                        />
                        Desenfocar el fondo
                      </label>
                    )}
                  </div>
                )}
              </div>

              {/* Texto */}
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Color del texto</label>
                <div className="flex gap-2">
                  {(
                    [
                      { v: "auto", label: "Automático" },
                      { v: "claro", label: "Claro" },
                      { v: "oscuro", label: "Oscuro" },
                    ] as const
                  ).map((o) => (
                    <button
                      key={o.v}
                      onClick={() => set({ textMode: o.v })}
                      className={config.textMode === o.v ? chipOn : chipOff}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Efectos */}
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Efectos</label>
                <div className="flex gap-2 flex-wrap items-center">
                  <select
                    value={config.effect}
                    onChange={(e) => set({ effect: e.target.value as Effect })}
                    className={inputCls + " !w-auto"}
                  >
                    <option value="none">Sin efecto</option>
                    <option value="dots">Puntos</option>
                    <option value="circles">Círculos</option>
                    <option value="stripes">Rayas</option>
                  </select>
                  <button
                    onClick={() => set({ frame: !config.frame })}
                    className={config.frame ? chipOn : chipOff}
                  >
                    Marco
                  </button>
                </div>
                <div className="flex gap-2 mt-2">
                  {(
                    [
                      { v: "none", label: "Sin oscurecer" },
                      { v: "soft", label: "Oscurecer" },
                      { v: "strong", label: "Oscurecer más" },
                    ] as const
                  ).map((o) => (
                    <button
                      key={o.v}
                      onClick={() => set({ overlay: o.v })}
                      className={config.overlay === o.v ? chipOn : chipOff}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ===== PREVIEW ===== */}
          <div className="lg:sticky lg:top-20">
            <div className="bg-white dark:bg-[#252525] rounded-2xl shadow-sm dark:shadow-none dark:border dark:border-gray-800 p-4">
              <div className="relative w-full max-w-[280px] sm:max-w-[320px] aspect-[9/16] rounded-xl overflow-hidden bg-black mx-auto">
                <canvas
                  ref={canvasRef}
                  width={W}
                  height={H}
                  className="absolute inset-0 w-full h-full"
                />
              </div>

              <p className="text-center text-xs text-gray-400 mt-3">
                Se descarga en 1080×1920 px (historia 9:16)
              </p>

              <button
                onClick={download}
                className="w-full mt-3 flex items-center justify-center gap-1.5 bg-black dark:bg-white text-white dark:text-black py-3 rounded-xl text-sm font-medium active:scale-95 transition"
              >
                <ImageDown size={16} />
                Descargar imagen
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
