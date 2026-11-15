import { colorDistance, colorsCompatible, isNeutral } from "@/lib/color";
import type { ClothingItem } from "@/lib/supabase";

export const SHOP_CATEGORIES = ["Верх", "Низ", "Платья", "Обувь", "Аксессуары"] as const;

export type ShoppingCandidate = {
  name: string;
  category: string;
  color_hex: string;
  price: number | null;
};

export type ShoppingVerdict = "buy" | "consider" | "skip";

export type ShoppingResult = {
  score: number;
  verdict: ShoppingVerdict;
  outfitCount: number;
  matches: ClothingItem[];
  duplicates: ClothingItem[];
  costPerOutfit: number | null;
  reasons: string[];
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
  const costPerOutfit = candidate.price !== null && outfitCount > 0 ? Math.round(candidate.price / outfitCount) : null;

  const reasons: string[] = [];
  if (isNeutral(candidateColor)) reasons.push("Нейтральный цвет: вещь сочетается с большинством других.");
  else reasons.push("Яркий цвет: сочетается не со всем, зато задаёт характер образа.");
  reasons.push(`Подходит к ${matches.length} из ${partners.length} вещей из категорий, с которыми её обычно носят.`);
  reasons.push(`Можно собрать примерно ${outfitCount} ${outfitCount === 1 ? "образ" : outfitCount < 5 ? "образа" : "образов"} из вашего гардероба.`);
  const firstDuplicate = duplicates[0];
  if (firstDuplicate) {
    reasons.push(`Похожая вещь уже есть: «${firstDuplicate.name}». Возможно, покупка дублирует гардероб.`);
  }
  if (costPerOutfit !== null) reasons.push(`Цена за один образ: около ${costPerOutfit.toLocaleString("ru-RU")} ₽.`);

  return { score, verdict, outfitCount, matches, duplicates, costPerOutfit, reasons };
}

export const VERDICT_LABEL: Record<ShoppingVerdict, string> = {
  buy: "Стоит купить",
  consider: "Подумайте",
  skip: "Лучше пропустить",
};
