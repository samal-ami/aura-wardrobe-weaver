import { createClient, type Session } from "@supabase/supabase-js";
import { useEffect, useState } from "react";

const URL = "https://kjkfqovwsppbgahzgkgx.supabase.co";
const KEY = "sb_publishable__dGeuURiWQfd-SYDSljwPw_AIpAT3z9";
const BUCKET = "wardrobe";

export const supabase = createClient(URL, KEY, {
  auth: {
    persistSession: typeof window !== "undefined",
    storage: typeof window !== "undefined" ? window.localStorage : undefined,
  },
});

// ---------- demo mode (fallback when Supabase is unreachable) ----------
const DEMO_KEY = "aura:demo-session";
const DEMO_USER_ID = "demo-user-0000-0000-0000-000000000000";

type DemoUser = { id: string; email: string; name: string };

function isDemo(): boolean {
  return typeof window !== "undefined" && localStorage.getItem(DEMO_KEY) !== null;
}

function demoUser(): DemoUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(DEMO_KEY);
  return raw ? (JSON.parse(raw) as DemoUser) : null;
}

/** Sign in a demo user and persist to localStorage; returns true on success. */
export function demoSignIn(email: string, name: string): boolean {
  if (typeof window === "undefined") return false;
  localStorage.setItem(DEMO_KEY, JSON.stringify({ id: DEMO_USER_ID, email, name } satisfies DemoUser));
  return true;
}

/** Clear demo session. */
export function demoSignOut(): void {
  if (typeof window !== "undefined") localStorage.removeItem(DEMO_KEY);
}

/** Check Supabase connectivity with a lightweight probe; returns true if reachable. */
export async function checkSupabaseReachable(): Promise<boolean> {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 5000);
    const res = await fetch(`${URL}/auth/v1/health`, { signal: ctrl.signal, headers: { apikey: KEY } });
    clearTimeout(t);
    return res.ok || res.status < 500;
  } catch {
    return false;
  }
}

export type ClothingItem = {
  id: string;
  user_id?: string;
  name: string;
  category: string;
  brand?: string | null;
  color_hex?: string | null;
  season?: string | null;
  notes?: string | null;
  image_url?: string | null;
  image_path?: string | null;
  /** Resolved, displayable photo URL (signed). */
  photo?: string | null;
};
export type Outfit = { id: string; title: string | null; description?: string | null; style?: string | null; season?: string | null; occasion?: string | null; created_at?: string };
export type OutfitWithItems = Outfit & { items: ClothingItem[] };
export type Profile = { id: string; display_name: string | null; status: string | null; avatar_url: string | null; avatar?: string | null };
export type Preferences = { favorite_styles: string[]; favorite_colors: string[]; priorities: string[] };
export type Settings = { notifications_enabled: boolean; daily_outfits_enabled: boolean; private_profile: boolean };

export const CATEGORIES = ["Верх", "Низ", "Платья", "Обувь", "Аксессуары"];
export const SEASONS = ["Весна", "Лето", "Осень", "Зима", "Всесезон"];

/** Turns a Supabase error into a readable Russian message; never swallows it. */
export function dbError(e: { message?: string; code?: string } | null | undefined): string {
  if (!e) return "Неизвестная ошибка";
  if (e.code === "42501") return "Нет доступа к данным. Запустите скрипт настройки базы (aura-setup.sql).";
  if (e.code === "PGRST205" || e.code === "PGRST204" || e.code === "42703") return "В базе не хватает таблицы или колонки. Запустите скрипт aura-setup.sql.";
  return e.message ?? "Ошибка базы данных";
}

export async function requireUserId(): Promise<string> {
  const demo = demoUser();
  if (demo) return demo.id;
  const { data } = await supabase.auth.getUser();
  if (!data.user) throw new Error("Войдите в аккаунт");
  return data.user.id;
}

function check<T>(r: { data: T; error: { message?: string; code?: string } | null }): T {
  if (r.error) throw new Error(dbError(r.error));
  return r.data;
}

// ---------- session ----------
function fakeDemoSession(): Session | null {
  const u = demoUser();
  if (!u) return null;
  // Minimal shape that AppShell's AuthGate accepts: truthy session object.
  return {
    access_token: "demo-token",
    refresh_token: "demo-refresh",
    expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    token_type: "bearer",
    user: {
      id: u.id,
      app_metadata: {},
      user_metadata: { name: u.name },
      aud: "authenticated",
      created_at: new Date().toISOString(),
    } as unknown as Session["user"],
  } as unknown as Session;
}

export function useSession() {
  const [state, set] = useState<{ session: Session | null; loading: boolean }>({ session: null, loading: true });
  useEffect(() => {
    const demo = fakeDemoSession();
    if (demo) { set({ session: demo, loading: false }); return; }
    supabase.auth.getSession().then(({ data }) => set({ session: data.session, loading: false }));
    const { data } = supabase.auth.onAuthStateChange((_e, session) => set({ session, loading: false }));
    return () => data.subscription.unsubscribe();
  }, []);
  return state;
}

// ---------- photos ----------
export async function uploadPhoto(file: File, folder: "items" | "avatars"): Promise<string> {
  if (isDemo()) {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error("Не удалось прочитать файл"));
      reader.readAsDataURL(file);
    });
  }
  const uid = await requireUserId();
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  const path = `${uid}/${folder}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, { contentType: file.type, upsert: false });
  if (error) throw new Error("Не удалось загрузить фото: " + error.message);
  return path;
}

async function signPaths(paths: string[]): Promise<Record<string, string>> {
  const uniq = [...new Set(paths.filter(Boolean))];
  if (!uniq.length) return {};
  const { data } = await supabase.storage.from(BUCKET).createSignedUrls(uniq, 60 * 60);
  const map: Record<string, string> = {};
  data?.forEach((d) => { if (d.path && d.signedUrl) map[d.path] = d.signedUrl; });
  return map;
}

async function withPhotos(items: ClothingItem[]): Promise<ClothingItem[]> {
  const urls = await signPaths(items.map((i) => i.image_path ?? ""));
  return items.map((i) => ({ ...i, photo: (i.image_path && urls[i.image_path]) || i.image_url || null }));
}

// ---------- local items (demo mode) ----------
const LOCAL_ITEMS_KEY = "aura:local-items";

function getLocalItems(): ClothingItem[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(LOCAL_ITEMS_KEY);
  return raw ? (JSON.parse(raw) as ClothingItem[]) : null ?? [];
}

function setLocalItems(items: ClothingItem[]) {
  if (typeof window !== "undefined") localStorage.setItem(LOCAL_ITEMS_KEY, JSON.stringify(items));
}

const DEMO_ITEMS: ClothingItem[] = [
  { id: "demo-1", name: "Блейзер оверсайз", category: "Верх", brand: "Cos", color_hex: "#2B2B2B", season: "Всесезон", image_url: null, image_path: null, photo: "https://images.unsplash.com/photo-1591040650555-53d3f0b5e33b?w=600&q=80" },
  { id: "demo-2", name: "Белая рубашка", category: "Верх", brand: "Uniqlo", color_hex: "#FFFFFF", season: "Всесезон", image_url: null, image_path: null, photo: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&q=80" },
  { id: "demo-3", name: "Бежевый тренч", category: "Верх", brand: "Zara", color_hex: "#D8C8B0", season: "Весна", image_url: null, image_path: null, photo: "https://images.unsplash.com/photo-1591040650594-73e96c0b5e3c?w=600&q=80" },
  { id: "demo-4", name: "Прямые джинсы", category: "Низ", brand: "Levi's", color_hex: "#5B7DA8", season: "Всесезон", image_url: null, image_path: null, photo: "https://images.unsplash.com/photo/1542272604-787c3835535d?w=600&q=80" },
  { id: "demo-5", name: "Базовые кроссовки", category: "Обувь", brand: "New Balance", color_hex: "#FFFFFF", season: "Всесезон", image_url: null, image_path: null, photo: "https://images.unsplash.com/photo-1549298916-b41d501d37fc?w=600&q=80" },
  { id: "demo-6", name: "Структурированная сумка", category: "Аксессуары", brand: "A.P.C.", color_hex: "#8B5E3C", season: "Всесезон", image_url: null, image_path: null, photo: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&q=80" },
  { id: "demo-7", name: "Белый топ", category: "Верх", brand: "COS", color_hex: "#FFFFFF", season: "Лето", image_url: null, image_path: null, photo: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600&q=80" },
  { id: "demo-8", name: "Мини-сумка", category: "Аксессуары", brand: "Polène", color_hex: "#2B2B2B", season: "Всесезон", image_url: null, image_path: null, photo: "https://images.unsplash.com/photo-1566150905458-1bf1fc083371?w=600&q=80" },
];

function ensureDemoItems(): ClothingItem[] {
  let items = getLocalItems();
  if (items.length === 0) {
    items = DEMO_ITEMS;
    setLocalItems(items);
  }
  return items;
}

// ---------- clothing items ----------
export async function fetchItems(): Promise<ClothingItem[]> {
  if (isDemo()) return ensureDemoItems();
  await requireUserId();
  const data = check(await supabase.from("clothing_items").select("*").order("created_at", { ascending: false }));
  return withPhotos((data ?? []) as ClothingItem[]);
}

export async function fetchItem(id: string): Promise<ClothingItem | null> {
  if (isDemo()) { const items = ensureDemoItems(); return items.find((i) => i.id === id) ?? null; }
  const data = check(await supabase.from("clothing_items").select("*").eq("id", id).maybeSingle());
  return data ? (await withPhotos([data as ClothingItem]))[0] ?? null : null;
}

export type ItemInput = { name: string; category: string; brand: string; color_hex: string; season: string; notes: string; image_path?: string | null; photo?: string | null };

export async function saveItem(input: ItemInput, id?: string) {
  if (isDemo()) {
    const items = ensureDemoItems();
    if (id) {
      setLocalItems(items.map((i) => (i.id === id ? { ...i, ...input } : i)));
    } else {
      const newItem: ClothingItem = { id: crypto.randomUUID(), user_id: DEMO_USER_ID, ...input, image_path: input.image_path ?? null, photo: input.photo ?? null };
      setLocalItems([newItem, ...items]);
    }
    return;
  }
  const user_id = await requireUserId();
  const row = { ...input, brand: input.brand || null, notes: input.notes || null, season: input.season || null, updated_at: new Date().toISOString() };
  if (id) check(await supabase.from("clothing_items").update(row).eq("id", id));
  else check(await supabase.from("clothing_items").insert({ ...row, user_id }));
}

export async function deleteItem(item: ClothingItem) {
  if (isDemo()) { setLocalItems(getLocalItems().filter((i) => i.id !== item.id)); return; }
  check(await supabase.from("clothing_items").delete().eq("id", item.id));
  if (item.image_path) await supabase.storage.from(BUCKET).remove([item.image_path]);
}

// ---------- outfits ----------
const LOCAL_OUTFITS_KEY = "aura:local-outfits";

function getLocalOutfits(): OutfitWithItems[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(LOCAL_OUTFITS_KEY);
  return raw ? (JSON.parse(raw) as OutfitWithItems[]) : [];
}

function setLocalOutfits(outfits: OutfitWithItems[]) {
  if (typeof window !== "undefined") localStorage.setItem(LOCAL_OUTFITS_KEY, JSON.stringify(outfits));
}

export async function fetchOutfits(): Promise<OutfitWithItems[]> {
  if (isDemo()) return getLocalOutfits();
  await requireUserId();
  const outfits = check(await supabase.from("outfits").select("id,title,description,style,season,occasion,created_at").order("created_at", { ascending: false })) as Outfit[];
  if (!outfits.length) return [];
  const links = check(await supabase.from("outfit_items").select("outfit_id,position,clothing_items(*)").in("outfit_id", outfits.map((o) => o.id)).order("position")) as unknown as { outfit_id: string; clothing_items: ClothingItem | null }[];
  const items = await withPhotos(links.map((l) => l.clothing_items).filter((x): x is ClothingItem => !!x));
  const byId = new Map(items.map((i) => [i.id, i]));
  return outfits.map((o) => ({ ...o, items: links.filter((l) => l.outfit_id === o.id && l.clothing_items).map((l) => byId.get(l.clothing_items!.id)!) }));
}

export async function fetchOutfit(id: string): Promise<OutfitWithItems | null> {
  const all = await fetchOutfits();
  return all.find((o) => o.id === id) ?? null;
}

export type OutfitInput = { title: string; style: string; season: string; occasion: string; description: string };

export async function createOutfit(input: OutfitInput, itemIds: string[]): Promise<string> {
  if (!itemIds.length) throw new Error("Выберите хотя бы одну вещь");
  if (isDemo()) {
    const allItems = ensureDemoItems();
    const selectedItems = itemIds.map((id) => allItems.find((i) => i.id === id)).filter((x): x is ClothingItem => !!x);
    const id = crypto.randomUUID();
    const outfit: OutfitWithItems = {
      id,
      title: input.title.trim() || "Новый образ",
      description: input.description || null,
      style: input.style || null,
      season: input.season || null,
      occasion: input.occasion || null,
      created_at: new Date().toISOString(),
      items: selectedItems,
    };
    const outfits = getLocalOutfits();
    setLocalOutfits([outfit, ...outfits]);
    return id;
  }
  const user_id = await requireUserId();
  const row = check(await supabase.from("outfits").insert({ ...input, title: input.title.trim() || "Новый образ", user_id }).select("id").single()) as { id: string };
  const res = await supabase.from("outfit_items").insert(itemIds.map((cid, position) => ({ outfit_id: row.id, clothing_item_id: cid, position })));
  if (res.error) { await supabase.from("outfits").delete().eq("id", row.id); throw new Error(dbError(res.error)); }
  return row.id;
}

export async function deleteOutfit(id: string) {
  if (isDemo()) { setLocalOutfits(getLocalOutfits().filter((o) => o.id !== id)); return; }
  check(await supabase.from("outfits").delete().eq("id", id));
}

// ---------- favorites ----------
export async function fetchFavoriteIds(type: "outfit" | "item"): Promise<string[]> {
  if (isDemo()) return [];
  await requireUserId();
  const data = check(await supabase.from("favorites").select("target_id").eq("target_type", type)) as { target_id: string }[];
  return data.map((d) => d.target_id);
}

export async function setFavorite(type: "outfit" | "item", id: string, on: boolean) {
  if (isDemo()) return;
  const user_id = await requireUserId();
  if (on) check(await supabase.from("favorites").upsert({ user_id, target_type: type, target_id: id }, { onConflict: "user_id,target_type,target_id", ignoreDuplicates: true }));
  else check(await supabase.from("favorites").delete().eq("target_type", type).eq("target_id", id));
}

// ---------- profile / prefs / settings ----------
const DEMO_PROFILE_KEY = "aura:demo-profile";

function getDemoProfile(): Profile {
  if (typeof window === "undefined") return { id: DEMO_USER_ID, display_name: "Asemay", status: "Демо-режим ✨", avatar_url: null, avatar: null };
  const raw = localStorage.getItem(DEMO_PROFILE_KEY);
  if (raw) return JSON.parse(raw) as Profile;
  return { id: DEMO_USER_ID, display_name: "Asemay", status: "Демо-режим ✨", avatar_url: null, avatar: null };
}

function setDemoProfile(p: Profile) {
  if (typeof window !== "undefined") localStorage.setItem(DEMO_PROFILE_KEY, JSON.stringify(p));
}

export async function fetchProfile(): Promise<Profile> {
  const demo = demoUser();
  if (demo) {
    const p = getDemoProfile();
    return { ...p, display_name: p.display_name || demo.name, avatar: p.avatar_url };
  }
  const uid = await requireUserId();
  let p = check(await supabase.from("profiles").select("id,display_name,status,avatar_url").eq("id", uid).maybeSingle()) as Profile | null;
  if (!p) {
    const { data: u } = await supabase.auth.getUser();
    const name = (u.user?.user_metadata?.["name"] as string | undefined) || "Asemay";
    p = check(await supabase.from("profiles").insert({ id: uid, display_name: name, status: "Разработчик будущего ✨" }).select("id,display_name,status,avatar_url").single()) as Profile;
  }
  const urls = p.avatar_url && !p.avatar_url.startsWith("http") ? await signPaths([p.avatar_url]) : {};
  return { ...p, avatar: p.avatar_url ? urls[p.avatar_url] ?? p.avatar_url : null };
}

export async function updateProfile(patch: Partial<Pick<Profile, "display_name" | "status" | "avatar_url">>) {
  if (isDemo()) {
    const cur = getDemoProfile();
    setDemoProfile({ ...cur, ...patch, avatar: patch.avatar_url ?? cur.avatar });
    return;
  }
  const id = await requireUserId();
  check(await supabase.from("profiles").update({ ...patch, updated_at: new Date().toISOString() }).eq("id", id));
}

export async function fetchStats() {
  if (isDemo()) {
    const items = ensureDemoItems();
    const outfits = getLocalOutfits();
    return { items: items.length, outfits: outfits.length, favorites: 0 };
  }
  await requireUserId();
  const count = async (t: string, f?: [string, string]) => {
    let q = supabase.from(t).select("*", { count: "exact", head: true });
    if (f) q = q.eq(f[0], f[1]);
    const r = await q;
    if (r.error) throw new Error(dbError(r.error));
    return r.count ?? 0;
  };
  const [items, outfits, favorites] = await Promise.all([count("clothing_items"), count("outfits"), count("favorites")]);
  return { items, outfits, favorites };
}

const DEFAULT_PREFS: Preferences = { favorite_styles: [], favorite_colors: [], priorities: [] };
export async function fetchPreferences(): Promise<Preferences> {
  if (isDemo()) return DEFAULT_PREFS;
  await requireUserId();
  const d = check(await supabase.from("user_preferences").select("favorite_styles,favorite_colors,priorities").maybeSingle()) as Preferences | null;
  return { ...DEFAULT_PREFS, ...(d ?? {}) };
}
export async function savePreferences(p: Preferences) {
  if (isDemo()) return;
  const user_id = await requireUserId();
  check(await supabase.from("user_preferences").upsert({ user_id, ...p, updated_at: new Date().toISOString() }));
}

const DEFAULT_SETTINGS: Settings = { notifications_enabled: true, daily_outfits_enabled: false, private_profile: false };
export async function fetchSettings(): Promise<Settings> {
  if (isDemo()) return DEFAULT_SETTINGS;
  await requireUserId();
  const d = check(await supabase.from("user_settings").select("notifications_enabled,daily_outfits_enabled,private_profile").maybeSingle()) as Settings | null;
  return { ...DEFAULT_SETTINGS, ...(d ?? {}) };
}
export async function saveSettings(s: Settings) {
  if (isDemo()) return;
  const user_id = await requireUserId();
  check(await supabase.from("user_settings").upsert({ user_id, ...s, updated_at: new Date().toISOString() }));
}
