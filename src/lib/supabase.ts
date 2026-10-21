import { createClient } from "@supabase/supabase-js";

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
  brand?: string | null;
  notes?: string | null;
  image_url?: string | null;
};

export const CATEGORIES = ["Верх", "Низ", "Платья", "Обувь", "Аксессуары"];

export const DEMO_ITEMS: ClothingItem[] = [
  { id: "d1", name: "Пиджак оверсайз", category: "Верх", brand: "ZARA", color: "#D8C8B0" },
  { id: "d2", name: "Топ", category: "Верх", brand: "H&M", color: "#FFFFFF" },
  { id: "d3", name: "Джинсы", category: "Низ", brand: "Stradivarius", color: "#5B7DA8" },
  { id: "d4", name: "Кроссовки", category: "Обувь", brand: "Nike", color: "#F2F2F2" },
  { id: "d5", name: "Платье миди", category: "Платья", brand: "Mango", color: "#E2B2B8" },
  { id: "d6", name: "Сумка", category: "Аксессуары", brand: "COS", color: "#2B2B2B" },
];

export async function fetchItems(): Promise<ClothingItem[]> {
  const { data, error } = await supabase
    .from("clothing_items")
    .select("*")
    .order("created_at", { ascending: false });
  if (error || !data || data.length === 0) return DEMO_ITEMS;
  return data as ClothingItem[];
}
