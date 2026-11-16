import { isNeutral, colorsCompatible } from "@/lib/color";
import type { ClothingItem } from "@/lib/supabase";
import type { MessageKey } from "@/lib/i18n/ru";
import type { Translate } from "@/lib/i18n";

export const WEATHER_OPTIONS = ["sunny", "cool", "rain", "cold"] as const;
export type Weather = (typeof WEATHER_OPTIONS)[number];

export type StylistReply = { text: string; outfits?: ClothingItem[][] };

const OUTER_RE = /тренч|блейзер|пальто|кардиган|куртк|пиджак/i;
const colorOf = (i: ClothingItem) => i.color_hex ?? "#808080";
const isOuter = (i: ClothingItem) => i.category === "Верх" && OUTER_RE.test(i.name);
const byCategory = (items: ClothingItem[], category: string) => items.filter((i) => i.category === category);

export function weatherLabel(weather: Weather, t: Translate): string {
  return t(`weather.${weather}` as MessageKey);
}

export function buildOutfits(items: ClothingItem[], weather: Weather, limit = 3): ClothingItem[][] {
  const tops = byCategory(items, "Верх").filter((i) => !isOuter(i));
  const outers = items.filter(isOuter).sort((a, b) => Number(/тренч/i.test(b.name)) - Number(/тренч/i.test(a.name)));
  const bottoms = byCategory(items, "Низ");
  const shoes = byCategory(items, "Обувь");
  const accessories = byCategory(items, "Аксессуары");
  const cold = weather !== "sunny";
  const result: ClothingItem[][] = [];
  const seen = new Set<string>();

  for (const top of tops) {
    for (const bottom of bottoms) {
      for (const shoe of shoes) {
        if (result.length >= limit) return result;
        const palette = [top, bottom, shoe];
        const fits = palette.every((a, idx) => palette.every((b, j) => idx >= j || colorsCompatible(colorOf(a), colorOf(b))));
        if (!fits) continue;
        const outfit = [...palette];
        if (cold) {
          const outer = outers.find((o) => o.id !== top.id && colorsCompatible(colorOf(o), colorOf(top)) && colorsCompatible(colorOf(o), colorOf(bottom)));
          if (outer) outfit.push(outer);
        }
        const accessory = accessories.find((a) => colorsCompatible(colorOf(a), colorOf(top)) && colorsCompatible(colorOf(a), colorOf(shoe)));
        if (accessory) outfit.push(accessory);
        const key = outfit.map((i) => i.id).sort().join("|");
        if (seen.has(key)) continue;
        seen.add(key);
        result.push(outfit);
      }
    }
  }
  return result;
}

export function describeOutfit(outfit: ClothingItem[]): string {
  return outfit.map((i) => i.name).join(" + ");
}

function adviceOnItem(item: ClothingItem, items: ClothingItem[], t: Translate): string {
  const partners = items.filter((i) => i.id !== item.id && i.category !== item.category && colorsCompatible(colorOf(item), colorOf(i)));
  const tone = t(isNeutral(colorOf(item)) ? "stylist.itemNeutral" : "stylist.itemAccent");
  if (partners.length === 0) return `«${item.name}». ${t("stylist.itemNoPartners", { tone })}`;
  const names = partners.slice(0, 4).map((i) => `«${i.name}»`).join(", ");
  return `«${item.name}». ${t("stylist.itemPartners", { tone, names, silhouette: t("tip.silhouette") })}`;
}

export function replyTo(message: string, items: ClothingItem[], weather: Weather, t: Translate): StylistReply {
  if (items.length === 0) return { text: t("stylist.noItems") };
  const q = message.toLowerCase();
  const weatherName = weatherLabel(weather, t);

  if (/надеть|сегодня|одеться|today|wear|бүгін|киейін/.test(q)) {
    const outfits = buildOutfits(items, weather, 2);
    const key = outfits.length > 0 ? "stylist.todayOk" : "stylist.todayNone";
    return { text: t(key, { weather: weatherName, tip: t(`tip.${weather}` as MessageKey) }), outfits };
  }

  if (/собер|образ|комплект|скомбин|outfit|build|look/.test(q)) {
    const outfits = buildOutfits(items, weather, 3);
    if (outfits.length === 0) return { text: t("stylist.buildNone") };
    return { text: t("stylist.buildOk", { weather: weatherName }), outfits };
  }

  const mentioned = items.find((i) => q.includes(i.name.toLowerCase()) || (i.brand ? q.includes(i.brand.toLowerCase()) : false));
  if (mentioned) return { text: adviceOnItem(mentioned, items, t) };

  if (/корей|миними|korean|minimal/.test(q)) return { text: t("tip.korean") };
  if (/француз|парижск|шик|french|paris/.test(q)) return { text: t("tip.french") };
  if (/америк|casual|кэжуал|кежуал|american/.test(q)) return { text: t("tip.american") };
  if (/обув|туфл|кроссов|лофер|shoe|sneaker|loafer/.test(q)) return { text: t("tip.shoes") };
  if (/цвет|палитр|сочета|colou?r|palette/.test(q)) return { text: t("tip.color") };
  if (/погод|дожд|холод|жар|тепл|weather|rain|cold|warm/.test(q)) return { text: t(`tip.${weather}` as MessageKey) };
  if (/стил|совет|style|advice/.test(q)) return { text: `${t("tip.color")} ${t("tip.silhouette")}` };

  return { text: t("stylist.fallback") };
}

export function photoReply(t: Translate): StylistReply {
  return { text: t("stylist.photoReply") };
}
