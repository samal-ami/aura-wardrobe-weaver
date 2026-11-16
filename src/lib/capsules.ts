import { PHOTOS } from "@/lib/photos";

export const CAPSULE_STYLES = ["minimal", "casual", "oldMoney", "office", "parisian", "quiet", "coquette", "street"] as const;
export const CAPSULE_SEASONS = ["spring", "summer", "autumn", "winter"] as const;
export const CAPSULE_WEATHER = ["sunny", "rain", "cold"] as const;

export type CapsuleStyle = (typeof CAPSULE_STYLES)[number];
export type CapsuleSeason = (typeof CAPSULE_SEASONS)[number];
export type CapsuleWeather = (typeof CAPSULE_WEATHER)[number];

export type CapsuleItemKey = "blazer" | "shirt" | "trench" | "tee" | "jeans" | "loafers" | "sneakers" | "slingbacks" | "cardigan" | "silkTop" | "bag";

export type CapsuleItem = { nameKey: CapsuleItemKey; category: string; photo: string };

export type Capsule = {
  id: string;
  style: CapsuleStyle;
  season: CapsuleSeason;
  weather: CapsuleWeather;
  items: CapsuleItem[];
};

const ITEM: Record<CapsuleItemKey, CapsuleItem> = {
  blazer: { nameKey: "blazer", category: "Верх", photo: PHOTOS.blazer },
  shirt: { nameKey: "shirt", category: "Верх", photo: PHOTOS.shirt },
  trench: { nameKey: "trench", category: "Верх", photo: PHOTOS.trench },
  tee: { nameKey: "tee", category: "Верх", photo: PHOTOS.tee },
  silkTop: { nameKey: "silkTop", category: "Верх", photo: PHOTOS.silkTop },
  cardigan: { nameKey: "cardigan", category: "Верх", photo: PHOTOS.cardigan },
  jeans: { nameKey: "jeans", category: "Низ", photo: PHOTOS.jeans },
  loafers: { nameKey: "loafers", category: "Обувь", photo: PHOTOS.loafers },
  sneakers: { nameKey: "sneakers", category: "Обувь", photo: PHOTOS.sneakers },
  slingbacks: { nameKey: "slingbacks", category: "Обувь", photo: PHOTOS.slingbacks },
  bag: { nameKey: "bag", category: "Аксессуары", photo: PHOTOS.bag },
};

export const CAPSULES: Capsule[] = [
  { id: "atyrau-winter", style: "minimal", season: "winter", weather: "cold", items: [ITEM.trench, ITEM.blazer, ITEM.jeans, ITEM.loafers, ITEM.bag] },
  { id: "office-clean", style: "office", season: "autumn", weather: "sunny", items: [ITEM.blazer, ITEM.shirt, ITEM.jeans, ITEM.loafers] },
  { id: "casual-summer", style: "casual", season: "summer", weather: "sunny", items: [ITEM.tee, ITEM.jeans, ITEM.sneakers] },
  { id: "old-money", style: "oldMoney", season: "autumn", weather: "cold", items: [ITEM.shirt, ITEM.trench, ITEM.cardigan, ITEM.loafers, ITEM.bag] },
  { id: "parisian", style: "parisian", season: "spring", weather: "rain", items: [ITEM.trench, ITEM.silkTop, ITEM.loafers] },
  { id: "coquette", style: "coquette", season: "spring", weather: "sunny", items: [ITEM.silkTop, ITEM.slingbacks, ITEM.bag] },
  { id: "quiet-luxury", style: "quiet", season: "winter", weather: "cold", items: [ITEM.cardigan, ITEM.shirt, ITEM.jeans, ITEM.bag] },
  { id: "street", style: "street", season: "summer", weather: "sunny", items: [ITEM.blazer, ITEM.tee, ITEM.jeans, ITEM.sneakers] },
];

export type CapsuleFilters = { style: CapsuleStyle | null; season: CapsuleSeason | null; weather: CapsuleWeather | null };

export function filterCapsules(list: Capsule[], f: CapsuleFilters): Capsule[] {
  return list.filter((c) => (!f.style || c.style === f.style) && (!f.season || c.season === f.season) && (!f.weather || c.weather === f.weather));
}
