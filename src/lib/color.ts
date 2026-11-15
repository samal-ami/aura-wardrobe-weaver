export type Rgb = [number, number, number];

export function hexToRgb(hex: string): Rgb {
  const n = parseInt(hex.replace("#", ""), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function rgbToHex([r, g, b]: Rgb): string {
  return "#" + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, "0")).join("");
}

function rgbToHsl([r, g, b]: Rgb): [number, number, number] {
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h: number;
  if (max === rn) h = (gn - bn) / d + (gn < bn ? 6 : 0);
  else if (max === gn) h = (bn - rn) / d + 2;
  else h = (rn - gn) / d + 4;
  return [h * 60, s, l];
}

export function isNeutral(hex: string): boolean {
  const [h, s, l] = rgbToHsl(hexToRgb(hex));
  if (s < 0.15 || l < 0.15 || l > 0.92) return true;
  return h >= 20 && h <= 60 && s < 0.45 && l > 0.55;
}

export function colorsCompatible(a: string, b: string): boolean {
  if (isNeutral(a) || isNeutral(b)) return true;
  const d = Math.abs(rgbToHsl(hexToRgb(a))[0] - rgbToHsl(hexToRgb(b))[0]);
  const hueGap = Math.min(d, 360 - d);
  return hueGap <= 35 || Math.abs(hueGap - 180) <= 30;
}

export function colorDistance(a: string, b: string): number {
  const [r1, g1, b1] = hexToRgb(a);
  const [r2, g2, b2] = hexToRgb(b);
  return Math.hypot(r1 - r2, g1 - g2, b1 - b2);
}

export function averageImageColor(img: HTMLImageElement): string {
  const canvas = document.createElement("canvas");
  canvas.width = 32;
  canvas.height = 32;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Не удалось прочитать фото");
  ctx.drawImage(img, 0, 0, 32, 32);
  const { data } = ctx.getImageData(0, 0, 32, 32);
  let r = 0, g = 0, b = 0, n = 0;
  for (let i = 0; i < data.length; i += 4) {
    r += data[i] ?? 0; g += data[i + 1] ?? 0; b += data[i + 2] ?? 0; n++;
  }
  return rgbToHex([r / n, g / n, b / n]);
}
