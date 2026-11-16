import { colorDistance, colorsCompatible, isNeutral } from "@/lib/color";
import type { ClothingItem } from "@/lib/supabase";
import type { MessageKey } from "@/lib/i18n/ru";

export const SHOP_CATEGORIES = ["Верх", "Низ", "Платья", "Обувь", "Аксессуары"] as const;

export type ShoppingCandidate = {
  color_hex: string;
  category: string;
  price: number | null;
};

export type ShoppingVerdict = "buy" | "consider" | "skip";

export type ShoppingReason = { key: MessageKey; vars?: Record<string, string | number> };

export type ShoppingResult = {
  score: number;
  verdict: ShoppingVerdict;
  outfitCount: number;
  matches: ClothingItem[];
  reasons: ShoppingReason[];
};

const PAIRING_CATEGORIES: Record<string, string[]> = {
  Верх: ["Низ", "Обувь"],
  Низ: ["Верх", "Обувь"],
  Платья: ["Обувь", "Аксессуары"],
  Обувь: ["Верх", "Низ"],
  Аксессуары: ["Верх", "Низ"],
};

const colorOf = (i: { color_hex?: string | null }) => i.color_hex ?? "#808080";

export function analyzePurchase(candidate: ShoppingCandidate, items: ClothingItem[]): ShoppingResult {
  const partnerCategories = PAIRING_CATEGORIES[candidate.category] ?? ["Верх", "Низ"];
  const candidateColor = candidate.color_hex;
  const partners = items.filter((i) => partnerCategories.includes(i.category));
  const matches = partners.filter((p) => colorsCompatible(candidateColor, colorOf(p)));

  const [listA = [], listB] = partnerCategories.map((cat) => matches.filter((m) => m.category === cat));
  const outfitCount =
    listB === undefined
      ? listA.length
      : listA.reduce((n, a) => n + listB.filter((b) => colorsCompatible(colorOf(a), colorOf(b))).length, 0);

  const duplicates = items.filter(
    (i) => i.category === candidate.category && colorDistance(colorOf(i), candidateColor) < 60,
  );

  const matchRatio = partners.length === 0 ? 0.5 : matches.length / partners.length;
  let score = Math.round(60 * matchRatio + Math.min(40, outfitCount * 4));
  if (duplicates.length > 0) score -= 15;
  score = Math.max(0, Math.min(100, score));

  const verdict: ShoppingVerdict = score >= 65 && outfitCount >= 3 ? "buy" : score >= 40 ? "consider" : "skip";

  const reasons: ShoppingReason[] = [
    { key: isNeutral(candidateColor) ? "shop.reason.neutral" : "shop.reason.accent" },
    { key: "shop.reason.matches", vars: { matches: matches.length, total: partners.length } },
    { key: "shop.reason.outfits", vars: { count: outfitCount } },
  ];
  const firstDuplicate = duplicates[0];
  if (firstDuplicate) reasons.push({ key: "shop.reason.duplicate", vars: { name: firstDuplicate.name } });
  if (candidate.price !== null && outfitCount > 0) {
    reasons.push({ key: "shop.reason.perOutfit", vars: { price: Math.round(candidate.price / outfitCount).toLocaleString("ru-RU") } });
  }

  return { score, verdict, outfitCount, matches, reasons };
}
