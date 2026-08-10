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
  Anton,
  Archivo_Black,
  Abril_Fatface,
  Lobster,
  Pacifico,
  Dancing_Script,
  Zilla_Slab,
  Space_Grotesk,
  Inter,
  Rowdies,
} from "next/font/google";
import { Plus, X, Upload, ImageDown, Wand2, Trash2 } from "lucide-react";
import { haptic } from "@/lib/haptics";

const playfair = Playfair_Display({ subsets: ["latin"], weight: ["600", "700", "800"] });
const montserrat = Montserrat({ subsets: ["latin"], weight: ["600", "700", "800"] });
const bebas = Bebas_Neue({ subsets: ["latin"], weight: "400" });
const poppins = Poppins({ subsets: ["latin"], weight: ["600", "700", "800"] });
const caveat = Caveat({ subsets: ["latin"], weight: ["600", "700"] });
const oswald = Oswald({ subsets: ["latin"], weight: ["500", "600", "700"] });
const quicksand = Quicksand({ subsets: ["latin"], weight: ["500", "600", "700"] });
const anton = Anton({ subsets: ["latin"], weight: "400" });
const archivo = Archivo_Black({ subsets: ["latin"], weight: "400" });
const abril = Abril_Fatface({ subsets: ["latin"], weight: "400" });
const lobster = Lobster({ subsets: ["latin"], weight: "400" });
const pacifico = Pacifico({ subsets: ["latin"], weight: "400" });
const dancing = Dancing_Script({ subsets: ["latin"], weight: ["500", "700"] });
const zilla = Zilla_Slab({ subsets: ["latin"], weight: ["500", "600", "700"] });
const grotesk = Space_Grotesk({ subsets: ["latin"], weight: ["500", "600", "700"] });
const inter = Inter({ subsets: ["latin"], weight: ["600", "700", "800"] });
const rowdies = Rowdies({ subsets: ["latin"], weight: ["400", "700"] });

const FONT_OPTIONS = [
  { name: "Playfair Display", family: playfair.style.fontFamily },
  { name: "Montserrat", family: montserrat.style.fontFamily },
  { name: "Bebas Neue", family: bebas.style.fontFamily },
  { name: "Poppins", family: poppins.style.fontFamily },
  { name: "Caveat", family: caveat.style.fontFamily },
  { name: "Oswald", family: oswald.style.fontFamily },
  { name: "Quicksand", family: quicksand.style.fontFamily },
  { name: "Anton", family: anton.style.fontFamily },
  { name: "Archivo Black", family: archivo.style.fontFamily },
  { name: "Abril Fatface", family: abril.style.fontFamily },
  { name: "Lobster", family: lobster.style.fontFamily },
  { name: "Pacifico", family: pacifico.style.fontFamily },
  { name: "Dancing Script", family: dancing.style.fontFamily },
  { name: "Zilla Slab", family: zilla.style.fontFamily },
  { name: "Space Grotesk", family: grotesk.style.fontFamily },
  { name: "Inter", family: inter.style.fontFamily },
  { name: "Rowdies", family: rowdies.style.fontFamily },
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
  { name: "Océano", c1: "#2b5876", c2: "#4e4376", accent: "#ffd166" },
  { name: "Atardecer", c1: "#ff512f", c2: "#dd2476", accent: "#fff1e6" },
  { name: "Sol", c1: "#f9d423", c2: "#ff4e50", accent: "#8b1e1e" },
  { name: "Menta", c1: "#11998e", c2: "#38ef7d", accent: "#064e3b" },
  { name: "Cielo", c1: "#30cfd0", c2: "#330867", accent: "#ffd166" },
  { name: "Lila", c1: "#c471f5", c2: "#fa71cd", accent: "#4a0072" },
  { name: "Bosque", c1: "#134e5e", c2: "#71b280", accent: "#fdfbf7" },
  { name: "Marino", c1: "#000046", c2: "#1cb5e0", accent: "#ffe259" },
  { name: "Sangría", c1: "#870000", c2: "#190a05", accent: "#f4a261" },
  { name: "Melocotón", c1: "#ffd89b", c2: "#f857a6", accent: "#b5179e" },
];

const SOLIDS = [
  { name: "Crema", hex: "#EFEAE7" },
  { name: "Blanco", hex: "#ffffff" },
  { name: "Negro", hex: "#141414" },
  { name: "Gris claro", hex: "#e5e7eb" },
  { name: "Gris", hex: "#9ca3af" },
  { name: "Azul", hex: "#1e3a8a" },
  { name: "Celeste", hex: "#a5d8ff" },
  { name: "Verde", hex: "#0f5132" },
  { name: "Menta", hex: "#b7e4c7" },
  { name: "Rosa", hex: "#f8a8c0" },
  { name: "Rosa pastel", hex: "#ffdbe5" },
  { name: "Lavanda", hex: "#e0d5f5" },
  { name: "Violeta", hex: "#6d28d9" },
  { name: "Lila", hex: "#c084fc" },
  { name: "Rojo", hex: "#b91c1c" },
  { name: "Naranja", hex: "#ea580c" },
  { name: "Ámbar", hex: "#f59e0b" },
  { name: "Dorado", hex: "#caa64c" },
  { name: "Beige", hex: "#f1e6d3" },
  { name: "Marrón", hex: "#6b4423" },
];

type BgMode = "gradient" | "solid" | "photo";
type TextMode = "auto" | "claro" | "oscuro";
type Effect = "none" | "dots" | "circles" | "stripes" | "squares" | "hearts";
type Overlay = "none" | "soft" | "strong";
type PhotoFilter = "none" | "bw" | "sepia" | "warm" | "cool" | "vivid";

const PHOTO_FILTERS: Array<{ v: PhotoFilter; label: string }> = [
  { v: "none", label: "Original" },
  { v: "bw", label: "B/N" },
  { v: "sepia", label: "Sepia" },
  { v: "warm", label: "Cálido" },
  { v: "cool", label: "Frío" },
  { v: "vivid", label: "Vivo" },
];

function filterCss(f: PhotoFilter) {
  switch (f) {
    case "bw":
      return "grayscale(1) contrast(1.05)";
    case "sepia":
      return "sepia(0.85) contrast(1.05)";
    case "warm":
      return "saturate(1.35) sepia(0.22) brightness(1.03)";
    case "cool":
      return "saturate(1.15) hue-rotate(12deg) brightness(1.02)";
    case "vivid":
      return "saturate(1.6) contrast(1.1)";
    default:
      return "none";
  }
}

function photoBaseSize(aspect: number) {
  let w = 720;
  let h = 720 / aspect;
  if (h > 1100) {
    h = 1100;
    w = h * aspect;
  }
  if (w > W - 96) {
    w = W - 96;
    h = w / aspect;
  }
  return { w, h };
}

type ElementId =
  | "emoji"
  | "service"
  | "title"
  | "schedules"
  | "cta"
  | "handle"
  | "photo";
type ELayout = {
  x: number;
  y: number;
  scale: number;
  rotation: number;
  z: number;
  visible: boolean;
  manual: boolean;
};
type Layout = Record<ElementId, ELayout>;
type El = { x: number; y: number; scale: number; rotation: number };
type Box = {
  id: ElementId;
  x: number;
  y: number;
  cx: number;
  cy: number;
  w: number;
  h: number;
  scale: number;
  rotation: number;
  z: number;
  visible: boolean;
};

const ELEMENT_NAMES: Record<ElementId, string> = {
  emoji: "Emoji",
  service: "Subtítulo",
  title: "Título",
  schedules: "Horarios",
  cta: "Botón",
  handle: "Usuario",
  photo: "Foto",
};

const defaultLayout = (): Layout => ({
  emoji: { x: W / 2, y: 250, scale: 1, rotation: 0, z: 0, visible: true, manual: false },
  service: { x: W / 2, y: 462, scale: 1, rotation: 0, z: 1, visible: true, manual: false },
  title: { x: W / 2, y: 600, scale: 1, rotation: 0, z: 2, visible: true, manual: false },
  schedules: { x: W / 2, y: 860, scale: 1, rotation: 0, z: 3, visible: true, manual: false },
  cta: { x: W / 2, y: 1510, scale: 1, rotation: 0, z: 4, visible: true, manual: false },
  handle: { x: W / 2, y: H - 130, scale: 1, rotation: 0, z: 5, visible: true, manual: false },
  photo: { x: W / 2, y: H / 2, scale: 1, rotation: 0, z: 6, visible: false, manual: false },
});

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
  photoFilter: PhotoFilter;
  photoAspect: number;
  overlay: Overlay;
  layout: Layout;
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
  {
    name: "Mediterráneo",
    patch: {
      bgMode: "gradient",
      c1: "#ffffff",
      c2: "#e8f4f8",
      accent: "#0e7490",
      font: poppins.style.fontFamily,
      textMode: "auto",
      effect: "none",
      frame: false,
      overlay: "none",
    },
  },
  {
    name: "Neón",
    patch: {
      bgMode: "gradient",
      c1: "#0f0c29",
      c2: "#302b63",
      accent: "#22d3ee",
      font: oswald.style.fontFamily,
      textMode: "auto",
      effect: "dots",
      frame: true,
      overlay: "strong",
    },
  },
  {
    name: "Pastel",
    patch: {
      bgMode: "gradient",
      c1: "#fbc2eb",
      c2: "#a6c1ee",
      accent: "#e64980",
      font: caveat.style.fontFamily,
      textMode: "auto",
      effect: "circles",
      frame: false,
      overlay: "none",
    },
  },
  {
    name: "Café",
    patch: {
      bgMode: "solid",
      c1: "#3e2723",
      c2: "#3e2723",
      accent: "#d7a86e",
      font: playfair.style.fontFamily,
      textMode: "auto",
      effect: "none",
      frame: false,
      overlay: "soft",
    },
  },
  {
    name: "Océano",
    patch: {
      bgMode: "gradient",
      c1: "#2b5876",
      c2: "#4e4376",
      accent: "#ffd166",
      font: montserrat.style.fontFamily,
      textMode: "auto",
      effect: "stripes",
      frame: false,
      overlay: "soft",
    },
  },
  {
    name: "Romántico",
    patch: {
      bgMode: "gradient",
      c1: "#ffdbe5",
      c2: "#ff8fab",
      accent: "#c9184a",
      font: lobster.style.fontFamily,
      textMode: "auto",
      effect: "hearts",
      frame: false,
      overlay: "none",
    },
  },
  {
    name: "Gold",
    patch: {
      bgMode: "solid",
      c1: "#141414",
      c2: "#141414",
      accent: "#d4af37",
      font: archivo.style.fontFamily,
      textMode: "auto",
      effect: "none",
      frame: false,
      overlay: "soft",
    },
  },
  {
    name: "Corporativo",
    patch: {
      bgMode: "solid",
      c1: "#0f172a",
      c2: "#0f172a",
      accent: "#38bdf8",
      font: inter.style.fontFamily,
      textMode: "auto",
      effect: "squares",
      frame: false,
      overlay: "none",
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
  } else if (c.effect === "squares") {
    ctx.strokeStyle = `rgba(${col},0.1)`;
    ctx.lineWidth = 3;
    for (let y = 70; y < H; y += 150) {
      for (let x = 70; x < W; x += 150) {
        ctx.strokeRect(x, y, 46, 46);
      }
    }
  } else if (c.effect === "hearts") {
    ctx.fillStyle = `rgba(${col},0.09)`;
    const spots: Array<[number, number, number]> = [
      [190, 330, 60],
      [890, 480, 80],
      [180, 1430, 70],
      [890, 1560, 90],
      [540, 780, 50],
      [760, 260, 45],
    ];
    spots.forEach(([x, y, s]) => drawHeart(ctx, x, y, s));
  }
  ctx.restore();
}

function drawHeart(ctx: CanvasRenderingContext2D, x: number, y: number, s: number) {
  ctx.beginPath();
  ctx.moveTo(x, y + s * 0.85);
  ctx.bezierCurveTo(x - s, y + s * 0.3, x - s * 0.5, y - s * 0.45, x, y + s * 0.05);
  ctx.bezierCurveTo(x + s * 0.5, y - s * 0.45, x + s, y + s * 0.3, x, y + s * 0.85);
  ctx.closePath();
  ctx.fill();
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

function titleMeasure(ctx: CanvasRenderingContext2D, c: Config) {
  const maxW = W - 144;
  let size = 150;
  let lines: string[] = [];
  for (;;) {
    ctx.font = `800 ${size}px ${c.font}`;
    lines = wrapText(ctx, c.title || "Turnos Disponibles", maxW);
    const fits = lines.length <= 3 && lines.every((l) => ctx.measureText(l).width <= maxW);
    if (fits || size <= 54) break;
    size -= 6;
  }
  return { size, lines };
}

function scheduleGeom(c: Config) {
  const rows = c.schedules.filter((s) => s.trim());
  let rh = rows.length <= 6 ? 92 : 76;
  let fs = rows.length <= 6 ? 46 : 39;
  let need = 56 + 54 + rows.length * rh + 56;
  if (need > 620) {
    rh = 68;
    fs = 34;
    need = 56 + 54 + rows.length * rh + 56;
  }
  return { rows, rh, fs, h: Math.min(need, 620) };
}

function ctaMeasure(ctx: CanvasRenderingContext2D, c: Config) {
  let size = 50;
  ctx.font = `800 ${size}px ${c.font}`;
  let lines = wrapText(ctx, c.cta, 720);
  while (lines.length > 2 && size > 34) {
    size -= 4;
    ctx.font = `800 ${size}px ${c.font}`;
    lines = wrapText(ctx, c.cta, 720);
  }
  let w = Math.max(...lines.map((l) => ctx.measureText(l).width));
  w = Math.min(920, w + 90);
  const h = Math.max(130, lines.length * size * 1.35 + 56);
  return { w, h, size, lines };
}

function computeAllBoxes(ctx: CanvasRenderingContext2D, c: Config): Box[] {
  const L = c.layout;
  const out: Box[] = [];
  const base = (id: ElementId, cx: number, cy: number, w: number, h: number): Box => ({
    id,
    x: cx - w / 2,
    y: cy - h / 2,
    cx,
    cy,
    w,
    h,
    scale: L[id].scale,
    rotation: (L[id].rotation * Math.PI) / 180,
    z: L[id].z,
    visible: L[id].visible,
  });

  {
    const scale = L.emoji.scale;
    const cx = L.emoji.manual ? L.emoji.x : W / 2;
    const cy = L.emoji.manual ? L.emoji.y : 250;
    const d = 192 * scale;
    out.push(base("emoji", cx, cy, d, d));
  }
  {
    const scale = L.service.scale;
    ctx.font = `700 44px ${c.font}`;
    const tw = ctx.measureText((c.service || " ").toUpperCase()).width;
    const cx = L.service.manual ? L.service.x : W / 2;
    const cy = L.service.manual ? L.service.y : 462;
    out.push(base("service", cx, cy, tw * scale, 60 * scale));
  }
  {
    const scale = L.title.scale;
    const { size, lines } = titleMeasure(ctx, c);
    const tw = Math.max(...lines.map((l) => ctx.measureText(l).width));
    const cx = L.title.manual ? L.title.x : W / 2;
    const cy = L.title.manual ? L.title.y : 600;
    out.push(base("title", cx, cy, tw * scale, lines.length * size * 1.06 * scale));
  }
  {
    const scale = L.schedules.scale;
    const { h } = scheduleGeom(c);
    const w = (W - 192) * scale;
    const cx = L.schedules.manual ? L.schedules.x : 96 + w / 2;
    const cy = L.schedules.manual ? L.schedules.y : 860 + h / 2;
    out.push(base("schedules", cx, cy, w, h * scale));
  }
  {
    const scale = L.cta.scale;
    const card = out.find((b) => b.id === "schedules")!;
    const cardBottom = card.y + card.h;
    const geom = ctaMeasure(ctx, c);
    const cx = L.cta.manual ? L.cta.x : W / 2;
    const cy = L.cta.manual
      ? L.cta.y
      : Math.min(1590, cardBottom + 150) - geom.h / 2;
    out.push(base("cta", cx, cy, geom.w * scale, geom.h * scale));
  }
  {
    const scale = L.photo.scale;
    const { w, h } = photoBaseSize(c.photoAspect || 1);
    const cx = L.photo.manual ? L.photo.x : W / 2;
    const cy = L.photo.manual ? L.photo.y : H / 2;
    out.push(base("photo", cx, cy, w * scale, h * scale));
  }
  {
    const scale = L.handle.scale;
    ctx.font = `600 40px ${c.font}`;
    const tw = ctx.measureText(c.handle || " ").width;
    const cx = L.handle.manual ? L.handle.x : W / 2;
    const cy = L.handle.manual ? L.handle.y : H - 130;
    out.push(base("handle", cx, cy, tw * scale, 40 * scale));
  }
  return out;
}

function rotPoint(
  cx: number,
  cy: number,
  px: number,
  py: number,
  a: number
): { x: number; y: number } {
  return {
    x: cx + px * Math.cos(a) - py * Math.sin(a),
    y: cy + px * Math.sin(a) + py * Math.cos(a),
  };
}

function drawEmoji(ctx: CanvasRenderingContext2D, c: Config, pal: Palette, el: El) {
  if (!c.emoji) return;
  ctx.save();
  ctx.translate(el.x, el.y);
  ctx.scale(el.scale, el.scale);
  ctx.rotate(el.rotation);
  ctx.beginPath();
  ctx.arc(0, 0, 96, 0, Math.PI * 2);
  ctx.fillStyle = pal.emojiBg;
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = pal.emojiBorder;
  ctx.stroke();
  ctx.font = '100px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(c.emoji, 0, 4);
  ctx.restore();
}

function drawEyebrow(ctx: CanvasRenderingContext2D, c: Config, pal: Palette, el: El) {
  if (!c.service) return;
  ctx.save();
  ctx.translate(el.x, el.y);
  ctx.scale(el.scale, el.scale);
  ctx.rotate(el.rotation);
  ctx.font = `700 44px ${c.font}`;
  ctx.fillStyle = pal.textSoft;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  setLetterSpacing(ctx, 8);
  ctx.fillText(c.service.toUpperCase(), 0, 0);
  setLetterSpacing(ctx, 0);
  ctx.restore();
}

function drawTitle(ctx: CanvasRenderingContext2D, c: Config, pal: Palette, el: El) {
  ctx.save();
  ctx.translate(el.x, el.y);
  ctx.scale(el.scale, el.scale);
  ctx.rotate(el.rotation);
  const { size, lines } = titleMeasure(ctx, c);
  const lh = size * 1.06;
  const top = -((lines.length - 1) * lh) / 2;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = pal.text;
  if (pal.lightText) {
    ctx.shadowColor = "rgba(0,0,0,0.35)";
    ctx.shadowBlur = 26;
    ctx.shadowOffsetY = 6;
  }
  lines.forEach((l, i) => ctx.fillText(l, 0, top + i * lh));
  ctx.restore();
}

function drawScheduleCard(ctx: CanvasRenderingContext2D, c: Config, pal: Palette, el: El) {
  const { rows, rh, fs, h } = scheduleGeom(c);
  if (rows.length === 0) return;
  ctx.save();
  ctx.translate(el.x, el.y);
  ctx.scale(el.scale, el.scale);
  ctx.rotate(el.rotation);
  const pad = 56;
  const labelH = 54;
  const w = W - 192;
  const hl = -h / 2;
  const wl = -w / 2;
  roundRect(ctx, wl, hl, w, h, 56);
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
  ctx.fillText("HORARIOS", wl + pad, hl + pad + 22);
  setLetterSpacing(ctx, 0);

  const rowStartY = hl + pad + labelH;
  const maxRows = Math.max(1, Math.floor((h - pad - labelH) / rh));
  const shown = rows.slice(0, maxRows);
  const truncated = rows.length > maxRows;

  ctx.font = `600 ${fs}px ${c.font}`;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  shown.forEach((r, i) => {
    const cy = rowStartY + i * rh + rh / 2;
    ctx.beginPath();
    ctx.arc(wl + pad + 14, cy, 13, 0, Math.PI * 2);
    ctx.fillStyle = c.accent;
    ctx.fill();
    ctx.fillStyle = pal.textSoft;
    ctx.fillText(r, wl + pad + 54, cy);
  });

  if (truncated) {
    ctx.font = `600 ${fs - 10}px ${c.font}`;
    ctx.fillStyle = pal.textFaint;
    ctx.fillText("… y más", wl + pad + 54, h / 2 - 40);
  }
  ctx.restore();
}

function drawCTA(ctx: CanvasRenderingContext2D, c: Config, pal: Palette, el: El) {
  if (!c.cta) return;
  ctx.save();
  ctx.translate(el.x, el.y);
  ctx.scale(el.scale, el.scale);
  ctx.rotate(el.rotation);
  const { w, h, size, lines } = ctaMeasure(ctx, c);
  const lh = size * 1.35;
  roundRect(ctx, -w / 2, -h / 2, w, h, 64);
  ctx.fillStyle = c.accent;
  ctx.shadowColor = "rgba(0,0,0,0.3)";
  ctx.shadowBlur = 24;
  ctx.shadowOffsetY = 6;
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

  const textTop = -h / 2 + (h - lines.length * lh) / 2 + size / 2;
  ctx.font = `800 ${size}px ${c.font}`;
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  lines.forEach((l, i) => ctx.fillText(l, 0, textTop + i * lh));
  ctx.restore();
}

function drawHandle(ctx: CanvasRenderingContext2D, c: Config, pal: Palette, el: El) {
  if (!c.handle) return;
  ctx.save();
  ctx.translate(el.x, el.y);
  ctx.scale(el.scale, el.scale);
  ctx.rotate(el.rotation);
  ctx.font = `600 40px ${c.font}`;
  ctx.fillStyle = pal.textFaint;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(c.handle, 0, 0);
  ctx.restore();
}

function drawPhoto(
  ctx: CanvasRenderingContext2D,
  c: Config,
  pal: Palette,
  el: El,
  photo: HTMLImageElement | null
) {
  if (!c.photo || !photo) return;
  ctx.save();
  ctx.translate(el.x, el.y);
  ctx.scale(el.scale, el.scale);
  ctx.rotate(el.rotation);
  const { w, h } = photoBaseSize(c.photoAspect || 1);
  roundRect(ctx, -w / 2, -h / 2, w, h, 56);
  ctx.clip();
  ctx.filter = filterCss(c.photoFilter);
  const iw = photo.naturalWidth;
  const ih = photo.naturalHeight;
  const s = Math.max(w / iw, h / ih);
  const dw = iw * s;
  const dh = ih * s;
  ctx.drawImage(photo, -dw / 2, -dh / 2, dw, dh);
  ctx.filter = "none";
  ctx.restore();

  if (pal.lightText) {
    ctx.save();
    ctx.translate(el.x, el.y);
    ctx.scale(el.scale, el.scale);
    ctx.rotate(el.rotation);
    ctx.strokeStyle = "rgba(255,255,255,0.25)";
    ctx.lineWidth = 3;
    roundRect(ctx, -w / 2 - 2, -h / 2 - 2, w + 4, h + 4, 58);
    ctx.stroke();
    ctx.restore();
  }
}

function drawSelection(ctx: CanvasRenderingContext2D, box: Box) {
  const a = box.rotation;
  ctx.save();
  ctx.translate(box.cx, box.cy);
  ctx.rotate(a);
  ctx.setLineDash([16, 12]);
  ctx.lineWidth = 4;
  ctx.strokeStyle = "rgba(255,255,255,0.9)";
  ctx.strokeRect(-box.w / 2 - 4, -box.h / 2 - 4, box.w + 8, box.h + 8);
  ctx.strokeStyle = "rgba(0,0,0,0.5)";
  ctx.lineWidth = 2;
  ctx.strokeRect(-box.w / 2 - 4, -box.h / 2 - 4, box.w + 8, box.h + 8);
  ctx.setLineDash([]);
  ctx.restore();

  const br = rotPoint(box.cx, box.cy, box.w / 2, box.h / 2, a);
  const tc = rotPoint(box.cx, box.cy, 0, -box.h / 2 - 14, a);

  const r = 26;
  ctx.beginPath();
  ctx.arc(br.x, br.y, r, 0, Math.PI * 2);
  ctx.fillStyle = "#ffffff";
  ctx.fill();
  ctx.lineWidth = 5;
  ctx.strokeStyle = "#111111";
  ctx.stroke();
  ctx.lineWidth = 3;
  ctx.strokeStyle = "#111111";
  ctx.beginPath();
  ctx.moveTo(br.x - r * 0.5, br.y + r * 0.4);
  ctx.lineTo(br.x + r * 0.4, br.y - r * 0.5);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(br.x - r * 0.5, br.y + r * 0.1);
  ctx.lineTo(br.x + r * 0.1, br.y - r * 0.5);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(tc.x, tc.y, r, 0, Math.PI * 2);
  ctx.fillStyle = "#ffffff";
  ctx.fill();
  ctx.lineWidth = 5;
  ctx.strokeStyle = "#111111";
  ctx.stroke();
  ctx.font = '28px sans-serif';
  ctx.fillStyle = "#111111";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("↻", tc.x, tc.y + 2);
}

function drawStory(
  canvas: HTMLCanvasElement,
  c: Config,
  photo: HTMLImageElement | null,
  selectedBox?: Box
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const pal = getPalette(c);
  ctx.clearRect(0, 0, W, H);
  drawBackground(ctx, c, photo, pal);
  const boxes = computeAllBoxes(ctx, c);
  const order = boxes
    .filter((b) => b.visible)
    .sort((a, b) => a.z - b.z);
  for (const b of order) {
    const el: El = { x: b.cx, y: b.cy, scale: b.scale, rotation: b.rotation };
    if (b.id === "emoji") drawEmoji(ctx, c, pal, el);
    else if (b.id === "service") drawEyebrow(ctx, c, pal, el);
    else if (b.id === "title") drawTitle(ctx, c, pal, el);
    else if (b.id === "schedules") drawScheduleCard(ctx, c, pal, el);
    else if (b.id === "cta") drawCTA(ctx, c, pal, el);
    else if (b.id === "photo") drawPhoto(ctx, c, pal, el, photo);
    else drawHandle(ctx, c, pal, el);
  }
  drawFrame(ctx, c);
  if (selectedBox) drawSelection(ctx, selectedBox);
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
    photoFilter: "none",
    photoAspect: 1,
    overlay: "soft",
    layout: defaultLayout(),
  });
  const [swatchIndex, setSwatchIndex] = useState(0);
  const [solidIndex, setSolidIndex] = useState(-1);
  const [selected, setSelected] = useState<ElementId | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const photoRef = useRef<HTMLImageElement | null>(null);
  const configRef = useRef(config);
  configRef.current = config;

  const dragRef = useRef<null | {
    mode: "move" | "resize" | "rotate";
    id: ElementId;
    startX: number;
    startY: number;
    baseX: number;
    baseY: number;
    baseScale: number;
    anchorX: number;
    anchorY: number;
    dist: number;
    centerX: number;
    centerY: number;
    startAngle: number;
    baseRotation: number;
  }>(null);

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const box = selected
      ? computeAllBoxes(ctx, configRef.current).find((b) => b.id === selected)
      : undefined;
    drawStory(canvas, configRef.current, photoRef.current, box);
  }, [selected]);

  useEffect(() => {
    redraw();
  }, [config, selected, redraw]);

  useEffect(() => {
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(redraw);
    }
  }, [redraw]);

  const set = (patch: Partial<Config>) => setConfig((c) => ({ ...c, ...patch }));

  const applySwatch = (i: number) => {
    const g = GRADIENTS[i];
    setSwatchIndex(i);
    setSolidIndex(-1);
    set({ bgMode: "gradient", c1: g.c1, c2: g.c2, accent: g.accent });
  };

  const matchSolid = (hex: string) =>
    SOLIDS.findIndex((s) => s.hex.toLowerCase() === hex.toLowerCase());

  const applySolid = (i: number) => {
    const s = SOLIDS[i];
    setSolidIndex(i);
    setSwatchIndex(-1);
    set({ bgMode: "solid", c1: s.hex, c2: s.hex });
  };

  const applyPreset = (p: Preset) => {
    setSwatchIndex(-1);
    setSolidIndex(p.patch.c1 ? matchSolid(p.patch.c1) : -1);
    setSelected(null);
    haptic();
    set({ ...p.patch, layout: defaultLayout() });
  };

  const resetElement = (id: ElementId) => {
    setConfig((c) => ({ ...c, layout: { ...c.layout, [id]: defaultLayout()[id] } }));
  };

  const resetAll = () => {
    setSelected(null);
    haptic();
    setConfig((c) => ({ ...c, layout: defaultLayout() }));
  };

  const deleteElement = (id: ElementId) => {
    setSelected(null);
    haptic();
    setConfig((c) => ({
      ...c,
      layout: { ...c.layout, [id]: { ...c.layout[id], visible: false } },
    }));
  };

  const showElement = (id: ElementId) => {
    haptic();
    setConfig((c) => ({
      ...c,
      layout: { ...c.layout, [id]: { ...c.layout[id], visible: true } },
    }));
    setSelected(id);
  };

  const moveLayer = (id: ElementId, dir: 1 | -1) => {
    setConfig((c) => {
      const z = c.layout[id].z;
      const other = (Object.keys(c.layout) as ElementId[]).find(
        (o) => o !== id && c.layout[o].visible && c.layout[o].z === z + dir
      );
      if (!other) return c;
      return {
        ...c,
        layout: {
          ...c.layout,
          [id]: { ...c.layout[id], z: c.layout[other].z },
          [other]: { ...c.layout[other], z },
        },
      };
    });
  };

  const hiddenIds = (Object.keys(config.layout) as ElementId[]).filter(
    (id) => !config.layout[id].visible
  );

  const toCanvas = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) * W) / rect.width,
      y: ((e.clientY - rect.top) * H) / rect.height,
    };
  };

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const p = toCanvas(e);
    const boxes = computeAllBoxes(ctx, configRef.current);

    if (selected) {
      const b = boxes.find((bx) => bx.id === selected);
      if (!b || !b.visible) {
        setSelected(null);
      } else {
        const a = b.rotation;
        const br = rotPoint(b.cx, b.cy, b.w / 2, b.h / 2, a);
        const tc = rotPoint(b.cx, b.cy, 0, -b.h / 2 - 14, a);
        if (Math.hypot(p.x - br.x, p.y - br.y) < 56) {
          const tl = rotPoint(b.cx, b.cy, -b.w / 2, -b.h / 2, a);
          dragRef.current = {
            mode: "resize",
            id: selected,
            startX: p.x,
            startY: p.y,
            baseX: 0,
            baseY: 0,
            baseScale: b.scale,
            anchorX: tl.x,
            anchorY: tl.y,
            dist: Math.max(40, Math.hypot(p.x - tl.x, p.y - tl.y)),
            centerX: 0,
            centerY: 0,
            startAngle: 0,
            baseRotation: 0,
          };
          canvas.setPointerCapture(e.pointerId);
          return;
        }
        if (Math.hypot(p.x - tc.x, p.y - tc.y) < 56) {
          dragRef.current = {
            mode: "rotate",
            id: selected,
            startX: p.x,
            startY: p.y,
            baseX: 0,
            baseY: 0,
            baseScale: 0,
            anchorX: 0,
            anchorY: 0,
            dist: 0,
            centerX: b.cx,
            centerY: b.cy,
            startAngle: Math.atan2(p.y - b.cy, p.x - b.cx),
            baseRotation: a,
          };
          canvas.setPointerCapture(e.pointerId);
          return;
        }
      }
    }

    for (let i = boxes.length - 1; i >= 0; i--) {
      const b = boxes[i];
      if (!b.visible) continue;
      if (p.x >= b.x && p.x <= b.x + b.w && p.y >= b.y && p.y <= b.y + b.h) {
        const L = configRef.current.layout[b.id];
        if (!L.manual) {
          const patch = {
            [b.id]: { ...L, x: b.cx, y: b.cy, manual: true },
          };
          setConfig((c) => ({ ...c, layout: { ...c.layout, ...patch } }));
        }
        if (selected !== b.id) setSelected(b.id);
        dragRef.current = {
          mode: "move",
          id: b.id,
          startX: p.x,
          startY: p.y,
          baseX: b.cx,
          baseY: b.cy,
          baseScale: 0,
          anchorX: 0,
          anchorY: 0,
          dist: 0,
          centerX: 0,
          centerY: 0,
          startAngle: 0,
          baseRotation: 0,
        };
        canvas.setPointerCapture(e.pointerId);
        return;
      }
    }
    setSelected(null);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const d = dragRef.current;
    if (!d) return;
    const p = toCanvas(e);
    setConfig((c) => {
      const L = c.layout[d.id];
      if (d.mode === "move") {
        return {
          ...c,
          layout: {
            ...c.layout,
            [d.id]: {
              ...L,
              x: d.baseX + (p.x - d.startX),
              y: d.baseY + (p.y - d.startY),
              manual: true,
            },
          },
        };
      }
      if (d.mode === "rotate") {
        const ang = Math.atan2(p.y - d.centerY, p.x - d.centerX);
        const rot = d.baseRotation + (ang - d.startAngle);
        const deg = ((rot * (180 / Math.PI) + 180) % 360 + 360) % 360 - 180;
        return { ...c, layout: { ...c.layout, [d.id]: { ...L, rotation: deg } } };
      }
      const nd = Math.hypot(p.x - d.anchorX, p.y - d.anchorY);
      const scale = Math.min(3, Math.max(0.35, d.baseScale * (nd / d.dist)));
      return { ...c, layout: { ...c.layout, [d.id]: { ...L, scale, manual: true } } };
    });
  };

  const onPointerUp = () => {
    dragRef.current = null;
  };

  const onPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        photoRef.current = img;
        set({
          photo: String(reader.result),
          photoAspect: img.naturalWidth / img.naturalHeight,
        });
        setConfig((c) => ({
          ...c,
          layout: { ...c.layout, photo: { ...c.layout.photo, visible: true } },
        }));
        redraw();
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const removePhoto = () => {
    photoRef.current = null;
    set({ photo: null, photoAspect: 1 });
    setConfig((c) => ({
      ...c,
      layout: { ...c.layout, photo: { ...c.layout.photo, visible: false } },
    }));
    if (config.bgMode === "photo") set({ bgMode: "gradient" });
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
        <span className={anton.className}>.</span>
        <span className={archivo.className}>.</span>
        <span className={abril.className}>.</span>
        <span className={lobster.className}>.</span>
        <span className={pacifico.className}>.</span>
        <span className={dancing.className}>.</span>
        <span className={zilla.className}>.</span>
        <span className={grotesk.className}>.</span>
        <span className={inter.className}>.</span>
        <span className={rowdies.className}>.</span>
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
                  <>
                    <div className="flex gap-2 flex-wrap mt-3">
                      {SOLIDS.map((s, i) => (
                        <button
                          key={s.name}
                          type="button"
                          onClick={() => applySolid(i)}
                          className={`w-8 h-8 rounded-full border-2 transition ${
                            solidIndex === i
                              ? "border-black dark:border-white scale-110"
                              : "border-gray-200 dark:border-gray-700"
                          }`}
                          style={{ background: s.hex }}
                          aria-label={s.name}
                        />
                      ))}
                    </div>
                    <div className="flex items-center gap-4 mt-3">
                      <label className="flex flex-col gap-1 text-[11px] text-gray-400">
                        Color de fondo
                        <input
                          type="color"
                          value={config.c1}
                          onChange={(e) =>
                            set({
                              c1: e.target.value,
                              c2: e.target.value,
                            })
                          }
                          onInput={() => setSolidIndex(-1)}
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
                  </>
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
                    {config.photo && (
                      <div>
                        <label className="block text-[11px] text-gray-400 mb-1.5">
                          Filtros de la foto
                        </label>
                        <div className="flex gap-1.5 flex-wrap">
                          {PHOTO_FILTERS.map((f) => (
                            <button
                              key={f.v}
                              onClick={() => set({ photoFilter: f.v })}
                              className={config.photoFilter === f.v ? chipOn : chipOff}
                            >
                              {f.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    {config.photo && (
                      <p className="text-[11px] text-gray-400">
                        La foto se agrega como elemento: tocala en la vista previa para
                        moverla, agrandarla, rotarla o borrarla.
                      </p>
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
                    <option value="squares">Cuadrícula</option>
                    <option value="hearts">Corazones</option>
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
                  className="absolute inset-0 w-full h-full touch-none cursor-grab active:cursor-grabbing"
                  style={{ touchAction: "none" }}
                  onPointerDown={onPointerDown}
                  onPointerMove={onPointerMove}
                  onPointerUp={onPointerUp}
                  onPointerCancel={onPointerUp}
                />
              </div>

              <p className="text-center text-xs text-gray-400 mt-3">
                Tocá un elemento para seleccionarlo, arrastralo para moverlo, el círculo
                de abajo a la derecha para redimensionar y el de arriba para rotar.
              </p>
              <p className="text-center text-xs text-gray-400 mt-1">
                Se descarga en 1080×1920 px (historia 9:16)
              </p>

              {selected && (
                <div className="mt-3 border-t border-gray-100 dark:border-gray-800 pt-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-300">
                      {ELEMENT_NAMES[selected]}
                    </p>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => resetElement(selected)}
                        className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                      >
                        Restablecer
                      </button>
                      <button
                        onClick={() => deleteElement(selected)}
                        className="flex items-center gap-1 text-xs text-red-400"
                      >
                        <Trash2 size={13} />
                        Borrar
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-gray-400 mb-1">Fuente</label>
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
                    <div>
                      <label className="block text-[11px] text-gray-400 mb-1">Tamaño</label>
                  <div className="flex items-center gap-3">
                    <label className="text-[11px] text-gray-400 shrink-0 w-14">Rotación</label>
                    <input
                      type="range"
                      min={-180}
                      max={180}
                      step={1}
                      value={Math.round(config.layout[selected].rotation)}
                      onChange={(e) =>
                        setConfig((c) => ({
                          ...c,
                          layout: {
                            ...c.layout,
                            [selected]: {
                              ...c.layout[selected],
                              rotation: Number(e.target.value),
                            },
                          },
                        }))
                      }
                      className="flex-1"
                    />
                    <span className="text-[11px] text-gray-400 w-10 text-right">
                      {Math.round(config.layout[selected].rotation)}°
                    </span>
                  </div>

                  <div className="flex gap-1.5">
                    <button
                      onClick={() => moveLayer(selected, 1)}
                      className={chipOff}
                    >
                      Subir capa
                    </button>
                    <button
                      onClick={() => moveLayer(selected, -1)}
                      className={chipOff}
                    >
                      Bajar capa
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                        <input
                          type="range"
                          min={0.4}
                          max={2.5}
                          step={0.05}
                          value={config.layout[selected].scale}
                          onChange={(e) =>
                            setConfig((c) => ({
                              ...c,
                              layout: {
                                ...c.layout,
                                [selected]: {
                                  ...c.layout[selected],
                                  scale: Number(e.target.value),
                                  manual: true,
                                },
                              },
                            }))
                          }
                          className="flex-1"
                        />
                        <span className="text-[11px] text-gray-400 w-10 text-right">
                          {Math.round(config.layout[selected].scale * 100)}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="text-[11px] text-gray-400 shrink-0">Color texto</label>
                    <div className="flex gap-1 flex-wrap">
                      {(
                        [
                          { v: "auto", label: "Auto" },
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

                  <div className="flex items-center gap-3">
                    <label className="text-[11px] text-gray-400 shrink-0">Acento</label>
                    <input
                      type="color"
                      value={config.accent}
                      onChange={(e) => set({ accent: e.target.value })}
                      className="w-9 h-7 rounded cursor-pointer border-0"
                    />
                    {selected === "emoji" && (
                      <input
                        value={config.emoji}
                        onChange={(e) => set({ emoji: e.target.value })}
                        maxLength={4}
                        className={inputCls + " !py-1"}
                        placeholder="Emoji"
                      />
                    )}
                  </div>

                  {selected === "photo" && (
                    <div className="flex items-center gap-2 flex-wrap">
                      <label className="text-[11px] text-gray-400 shrink-0">Filtro</label>
                      <div className="flex gap-1 flex-wrap">
                        {PHOTO_FILTERS.map((f) => (
                          <button
                            key={f.v}
                            onClick={() => set({ photoFilter: f.v })}
                            className={config.photoFilter === f.v ? chipOn : chipOff}
                          >
                            {f.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {hiddenIds.length > 0 && (
                <div className="mt-3 border-t border-gray-100 dark:border-gray-800 pt-3">
                  <p className="text-[11px] text-gray-400 mb-1.5">Elementos ocultos</p>
                  <div className="flex gap-1.5 flex-wrap">
                    {hiddenIds.map((id) => (
                      <button
                        key={id}
                        onClick={() => showElement(id)}
                        className="flex items-center gap-1 text-xs border border-gray-200 dark:border-gray-700 rounded-full px-2.5 py-1 text-gray-500 dark:text-gray-300"
                      >
                        <Plus size={12} />
                        {ELEMENT_NAMES[id]}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={resetAll}
                className="w-full mt-3 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition"
              >
                Reiniciar posiciones
              </button>

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
