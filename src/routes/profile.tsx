import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ChevronRight, Shirt, Sparkles, Heart, Settings, SlidersHorizontal, Camera, Pencil, UserRound, Users, Wand2, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { AppShell, ErrorNote, Spinner } from "@/components/AppShell";
import { useI18n } from "@/lib/i18n";
import type { MessageKey } from "@/lib/i18n/ru";
import { fetchProfile, fetchStats, updateProfile } from "@/lib/supabase";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "AURA — Profile" }, { name: "description", content: "Your AURA profile" }, { property: "og:title", content: "AURA — Profile" }, { property: "og:description", content: "Your AURA profile" }] }),
  component: Profile,
});

const MENU: { key: MessageKey; to: string; icon: typeof Shirt }[] = [
  { key: "profile.menu.stylist", to: "/stylist", icon: Wand2 },
  { key: "profile.menu.shopping", to: "/shopping", icon: ShoppingBag },
  { key: "profile.menu.wardrobe", to: "/wardrobe", icon: Shirt },
  { key: "profile.menu.outfits", to: "/outfits", icon: Sparkles },
  { key: "profile.menu.favorites", to: "/favorites", icon: Heart },
  { key: "profile.menu.community", to: "/community", icon: Users },
  { key: "profile.menu.preferences", to: "/preferences", icon: SlidersHorizontal },
  { key: "profile.menu.settings", to: "/settings", icon: Settings },
];

const STATS: [keyof Awaited<ReturnType<typeof fetchStats>>, MessageKey][] = [
  ["items", "profile.stats.items"],
  ["outfits", "profile.stats.outfits"],
  ["favorites", "profile.stats.favorites"],
];

function Profile() {
  const { t } = useI18n();
  const qc = useQueryClient();
  const profile = useQuery({ queryKey: ["profile"], queryFn: fetchProfile });
  const stats = useQuery({ queryKey: ["stats"], queryFn: fetchStats });
  const [edit, setEdit] = useState(false);
  const [name, setName] = useState("");
  const [status, setStatus] = useState("");

  async function onAvatar(f?: File) {
    if (!f) return;
    if (!f.type.startsWith("image/")) { toast.error(t("profile.selectImage")); return; }
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error(t("profile.fileError")));
        reader.readAsDataURL(f);
      });
      await updateProfile({ avatar_url: base64 });
      await qc.invalidateQueries({ queryKey: ["profile"] });
      toast.success(t("profile.photoUpdated"));
    }
    catch (e) { toast.error((e as Error).message); }
  }
  async function saveInfo() {
    try { await updateProfile({ display_name: name.trim() || "Asemay", status: status.trim() }); await qc.invalidateQueries({ queryKey: ["profile"] }); setEdit(false); toast.success(t("profile.saved")); }
    catch (e) { toast.error((e as Error).message); }
  }

  if (profile.isLoading) return <AppShell title={t("profile.title")}><Spinner /></AppShell>;
  if (profile.error) return <AppShell title={t("profile.title")}><ErrorNote text={(profile.error as Error).message} onRetry={() => profile.refetch()} /></AppShell>;
  const p = profile.data!;
  return (
    <AppShell title={t("profile.title")}>
      <div className="flex flex-col items-center">
        <label className="relative cursor-pointer">
          {p.avatar ? <img src={p.avatar} alt={p.display_name ?? ""} className="h-24 w-24 rounded-full object-cover ring-4 ring-primary" /> :
            <span className="flex h-24 w-24 items-center justify-center rounded-full bg-secondary text-muted-foreground ring-4 ring-primary"><UserRound size={40} /></span>}
          <span className="absolute right-0 bottom-0 flex h-8 w-8 items-center justify-center rounded-full bg-card shadow-card"><Camera size={15} /></span>
          <input type="file" accept="image/*" hidden aria-label={t("profile.changePhoto")} onChange={(e) => onAvatar(e.target.files?.[0])} />
        </label>
        {edit ? (
          <div className="mt-4 w-full space-y-2">
            <input className="field" aria-label={t("profile.name")} value={name} onChange={(e) => setName(e.target.value)} />
            <input className="field" aria-label={t("profile.status")} value={status} onChange={(e) => setStatus(e.target.value)} />
            <button className="btn-primary" onClick={saveInfo}>{t("profile.save")}</button>
          </div>
        ) : (
          <>
            <h2 className="mt-3 flex items-center gap-2 font-serif text-3xl">{p.display_name || "Asemay"}
              <button type="button" aria-label={t("profile.edit")} onClick={() => { setName(p.display_name ?? ""); setStatus(p.status ?? ""); setEdit(true); }} className="text-muted-foreground"><Pencil size={16} /></button>
            </h2>
            {p.status && <p className="text-sm text-muted-foreground">{p.status}</p>}
          </>
        )}
      </div>
      <div className="mt-6 grid grid-cols-3 rounded-[20px] bg-card py-4 text-center shadow-card">
        {STATS.map(([k, l]) => (
          <div key={k}><p className="font-serif text-2xl">{stats.data ? stats.data[k] : "–"}</p><p className="text-xs text-muted-foreground">{t(l)}</p></div>
        ))}
      </div>
      <ul className="mt-6 space-y-2">
        {MENU.map(({ key, to, icon: Icon }) => (
          <li key={key}>
            <Link to={to} className="flex items-center gap-4 rounded-[20px] bg-card px-5 py-4 shadow-card">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-accent-foreground"><Icon size={18} /></span>
              <span className="flex-1">{t(key)}</span><ChevronRight size={18} className="text-muted-foreground" />
            </Link>
          </li>
        ))}
      </ul>
    </AppShell>
  );
}
