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
  const { data } = await supabase.auth.getUser();
  if (!data.user) throw new Error("Войдите в аккаунт");
  return data.user.id;
}

function check<T>(r: { data: T; error: { message?: string; code?: string } | null }): T {
  if (r.error) throw new Error(dbError(r.error));
  return r.data;
}

// ---------- session ----------
export function useSession() {
  const [state, set] = useState<{ session: Session | null; loading: boolean }>({ session: null, loading: true });
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => set({ session: data.session, loading: false }));
    const { data } = supabase.auth.onAuthStateChange((_e, session) => set({ session, loading: false }));
    return () => data.subscription.unsubscribe();
  }, []);
  return state;
}

// ---------- photos ----------
export async function uploadPhoto(file: File, folder: "items" | "avatars"): Promise<string> {
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

// ---------- clothing items ----------
export async function fetchItems(): Promise<ClothingItem[]> {
  await requireUserId();
  const data = check(await supabase.from("clothing_items").select("*").order("created_at", { ascending: false }));
  return withPhotos((data ?? []) as ClothingItem[]);
}

export async function fetchItem(id: string): Promise<ClothingItem | null> {
  const data = check(await supabase.from("clothing_items").select("*").eq("id", id).maybeSingle());
  return data ? (await withPhotos([data as ClothingItem]))[0] : null;
}

export type ItemInput = { name: string; category: string; brand: string; color_hex: string; season: string; notes: string; image_path?: string | null };

export async function saveItem(input: ItemInput, id?: string) {
  const user_id = await requireUserId();
  const row = { ...input, brand: input.brand || null, notes: input.notes || null, season: input.season || null, updated_at: new Date().toISOString() };
  if (id) check(await supabase.from("clothing_items").update(row).eq("id", id));
  else check(await supabase.from("clothing_items").insert({ ...row, user_id }));
}

export async function deleteItem(item: ClothingItem) {
  check(await supabase.from("clothing_items").delete().eq("id", item.id));
  if (item.image_path) await supabase.storage.from(BUCKET).remove([item.image_path]);
}

// ---------- outfits ----------
export async function fetchOutfits(): Promise<OutfitWithItems[]> {
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
  const user_id = await requireUserId();
  if (!itemIds.length) throw new Error("Выберите хотя бы одну вещь");
  const row = check(await supabase.from("outfits").insert({ ...input, title: input.title.trim() || "Новый образ", user_id }).select("id").single()) as { id: string };
  const res = await supabase.from("outfit_items").insert(itemIds.map((cid, position) => ({ outfit_id: row.id, clothing_item_id: cid, position })));
  if (res.error) { await supabase.from("outfits").delete().eq("id", row.id); throw new Error(dbError(res.error)); }
  return row.id;
}

export async function deleteOutfit(id: string) {
  check(await supabase.from("outfits").delete().eq("id", id));
}

// ---------- favorites ----------
export async function fetchFavoriteIds(type: "outfit" | "item"): Promise<string[]> {
  await requireUserId();
  const data = check(await supabase.from("favorites").select("target_id").eq("target_type", type)) as { target_id: string }[];
  return data.map((d) => d.target_id);
}

export async function setFavorite(type: "outfit" | "item", id: string, on: boolean) {
  const user_id = await requireUserId();
  if (on) check(await supabase.from("favorites").upsert({ user_id, target_type: type, target_id: id }, { onConflict: "user_id,target_type,target_id", ignoreDuplicates: true }));
  else check(await supabase.from("favorites").delete().eq("target_type", type).eq("target_id", id));
}

// ---------- profile / prefs / settings ----------
export async function fetchProfile(): Promise<Profile> {
  const uid = await requireUserId();
  let p = check(await supabase.from("profiles").select("id,display_name,status,avatar_url").eq("id", uid).maybeSingle()) as Profile | null;
  if (!p) {
    const { data: u } = await supabase.auth.getUser();
    const name = (u.user?.user_metadata?.name as string | undefined) || "Asemay";
    p = check(await supabase.from("profiles").insert({ id: uid, display_name: name, status: "Разработчик будущего ✨" }).select("id,display_name,status,avatar_url").single()) as Profile;
  }
  const urls = p.avatar_url && !p.avatar_url.startsWith("http") ? await signPaths([p.avatar_url]) : {};
  return { ...p, avatar: p.avatar_url ? urls[p.avatar_url] ?? p.avatar_url : null };
}

export async function updateProfile(patch: Partial<Pick<Profile, "display_name" | "status" | "avatar_url">>) {
  const id = await requireUserId();
  check(await supabase.from("profiles").update({ ...patch, updated_at: new Date().toISOString() }).eq("id", id));
}

export async function fetchStats() {
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
  await requireUserId();
  const d = check(await supabase.from("user_preferences").select("favorite_styles,favorite_colors,priorities").maybeSingle()) as Preferences | null;
  return { ...DEFAULT_PREFS, ...(d ?? {}) };
}
export async function savePreferences(p: Preferences) {
  const user_id = await requireUserId();
  check(await supabase.from("user_preferences").upsert({ user_id, ...p, updated_at: new Date().toISOString() }));
}

const DEFAULT_SETTINGS: Settings = { notifications_enabled: true, daily_outfits_enabled: false, private_profile: false };
export async function fetchSettings(): Promise<Settings> {
  await requireUserId();
  const d = check(await supabase.from("user_settings").select("notifications_enabled,daily_outfits_enabled,private_profile").maybeSingle()) as Settings | null;
  return { ...DEFAULT_SETTINGS, ...(d ?? {}) };
}
export async function saveSettings(s: Settings) {
  const user_id = await requireUserId();
  check(await supabase.from("user_settings").upsert({ user_id, ...s, updated_at: new Date().toISOString() }));
}
