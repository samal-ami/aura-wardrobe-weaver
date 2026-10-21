import { createClient } from "@supabase/supabase-js";
import blazer from "@/assets/item-blazer.jpg";
import tee from "@/assets/item-tee.jpg";
import jeans from "@/assets/item-jeans.jpg";
import loafers from "@/assets/item-loafers.jpg";
import bag from "@/assets/item-bag.jpg";
import romantic from "@/assets/style-romantic.jpg";

const URL = "https://kjkfqovwsppbgahzgkgx.supabase.co";
const KEY = "sb_publishable__dGeuURiWQfd-SYDSljwPw_AIpAT3z9";

export const supabase = createClient(URL, KEY, {
  auth: {
    persistSession: typeof window !== "undefined",
    storage: typeof window !== "undefined" ? window.localStorage : undefined,
  },
});

export type ClothingItem = {
  id: string;
  name: string;
  category: string;
  color?: string | null;
  color_hex?: string | null;
  brand?: string | null;
  notes?: string | null;
  image_url?: string | null;
};

export const CATEGORIES = ["Верх", "Низ", "Платья", "Обувь", "Аксессуары"];

export const DEMO_ITEMS: ClothingItem[] = [
  { id: "d1", name: "Пиджак оверсайз", category: "Верх", brand: "ZARA", color_hex: "#D8C8B0", image_url: blazer },
  { id: "d2", name: "Футболка", category: "Верх", brand: "H&M", color_hex: "#FFFFFF", image_url: tee },
  { id: "d3", name: "Широкие джинсы", category: "Низ", brand: "Stradivarius", color_hex: "#5B7DA8", image_url: jeans },
  { id: "d4", name: "Лоферы", category: "Обувь", brand: "Massimo Dutti", color_hex: "#8B5E3C", image_url: loafers },
  { id: "d5", name: "Платье миди", category: "Платья", brand: "Mango", color_hex: "#E2B2B8", image_url: romantic },
  { id: "d6", name: "Сумка", category: "Аксессуары", brand: "COS", color_hex: "#2B2B2B", image_url: bag },
];

const FALLBACK: Record<string, string> = { "Верх": blazer, "Низ": jeans, "Платья": romantic, "Обувь": loafers, "Аксессуары": bag };
export const ITEM_IMAGES = { blazer, tee, jeans, loafers, bag };

export async function fetchItems(): Promise<ClothingItem[]> {
  const { data, error } = await supabase
    .from("clothing_items")
    .select("*")
    .order("created_at", { ascending: false });
  if (error || !data || data.length === 0) return DEMO_ITEMS;
  return (data as ClothingItem[]).map((i) => ({ ...i, image_url: i.image_url || FALLBACK[i.category] || tee }));
}
