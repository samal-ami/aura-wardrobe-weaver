import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ChevronRight, Shirt, Sparkles, Heart, Settings, SlidersHorizontal, Camera, Pencil, UserRound } from "lucide-react";
import { toast } from "sonner";
import { AppShell, ErrorNote, Spinner } from "@/components/AppShell";
import { fetchProfile, fetchStats, updateProfile, uploadPhoto } from "@/lib/supabase";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "AURA — Профиль" }, { name: "description", content: "Ваш профиль в AURA" }, { property: "og:title", content: "AURA — Профиль" }, { property: "og:description", content: "Ваш профиль в AURA" }] }),
  component: Profile,
});

const menu = [
  { label: "Мой гардероб", to: "/wardrobe", icon: Shirt },
  { label: "Мои образы", to: "/outfits", icon: Sparkles },
  { label: "Избранное", to: "/favorites", icon: Heart },
  { label: "Мои предпочтения", to: "/preferences", icon: SlidersHorizontal },
  { label: "Настройки", to: "/settings", icon: Settings },
] as const;

function Profile() {
  const qc = useQueryClient();
  const profile = useQuery({ queryKey: ["profile"], queryFn: fetchProfile });
  const stats = useQuery({ queryKey: ["stats"], queryFn: fetchStats });
  const [edit, setEdit] = useState(false);
  const [name, setName] = useState("");
  const [status, setStatus] = useState("");

  async function onAvatar(f?: File) {
    if (!f) return;
    try { const path = await uploadPhoto(f, "avatars"); await updateProfile({ avatar_url: path }); await qc.invalidateQueries({ queryKey: ["profile"] }); toast.success("Фото обновлено"); }
    catch (e) { toast.error((e as Error).message); }
  }
  async function saveInfo() {
    try { await updateProfile({ display_name: name.trim() || "Asemay", status: status.trim() }); await qc.invalidateQueries({ queryKey: ["profile"] }); setEdit(false); toast.success("Успешно сохранено!"); }
    catch (e) { toast.error((e as Error).message); }
  }

  if (profile.isLoading) return <AppShell title="Профиль"><Spinner /></AppShell>;
  if (profile.error) return <AppShell title="Профиль"><ErrorNote text={(profile.error as Error).message} onRetry={() => profile.refetch()} /></AppShell>;
  const p = profile.data!;
  return (
    <AppShell title="Профиль">
      <div className="flex flex-col items-center">
        <label className="relative cursor-pointer">
          {p.avatar ? <img src={p.avatar} alt={p.display_name ?? ""} className="h-24 w-24 rounded-full object-cover ring-4 ring-primary" /> :
            <span className="flex h-24 w-24 items-center justify-center rounded-full bg-secondary text-muted-foreground ring-4 ring-primary"><UserRound size={40} /></span>}
          <span className="absolute right-0 bottom-0 flex h-8 w-8 items-center justify-center rounded-full bg-card shadow-card"><Camera size={15} /></span>
          <input type="file" accept="image/*" hidden aria-label="Сменить фото" onChange={(e) => onAvatar(e.target.files?.[0])} />
        </label>
        {edit ? (
          <div className="mt-4 w-full space-y-2">
            <input className="field" aria-label="Имя" value={name} onChange={(e) => setName(e.target.value)} />
            <input className="field" aria-label="Статус" value={status} onChange={(e) => setStatus(e.target.value)} />
            <button className="btn-primary" onClick={saveInfo}>Сохранить</button>
          </div>
        ) : (
          <>
            <h2 className="mt-3 flex items-center gap-2 font-serif text-3xl">{p.display_name || "Asemay"}
              <button type="button" aria-label="Редактировать" onClick={() => { setName(p.display_name ?? ""); setStatus(p.status ?? ""); setEdit(true); }} className="text-muted-foreground"><Pencil size={16} /></button>
            </h2>
            {p.status && <p className="text-sm text-muted-foreground">{p.status}</p>}
          </>
        )}
      </div>
      <div className="mt-6 grid grid-cols-3 rounded-[20px] bg-card py-4 text-center shadow-card">
        {([["items", "Вещи"], ["outfits", "Образы"], ["favorites", "Избранное"]] as const).map(([k, l]) => (
          <div key={k}><p className="font-serif text-2xl">{stats.data ? stats.data[k] : "–"}</p><p className="text-xs text-muted-foreground">{l}</p></div>
        ))}
      </div>
      <ul className="mt-6 space-y-2">
        {menu.map(({ label, to, icon: Icon }) => (
          <li key={label}>
            <Link to={to} className="flex items-center gap-4 rounded-[20px] bg-card px-5 py-4 shadow-card">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-accent-foreground"><Icon size={18} /></span>
              <span className="flex-1">{label}</span><ChevronRight size={18} className="text-muted-foreground" />
            </Link>
          </li>
        ))}
      </ul>
    </AppShell>
  );
}
