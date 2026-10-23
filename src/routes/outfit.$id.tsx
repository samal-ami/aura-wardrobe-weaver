import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Heart, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AppShell, ErrorNote, Spinner } from "@/components/AppShell";
import { OutfitCover } from "@/components/OutfitCard";
import { deleteOutfit, fetchFavoriteIds, fetchOutfit, setFavorite } from "@/lib/supabase";

export const Route = createFileRoute("/outfit/$id")({
  head: () => ({ meta: [{ title: "AURA — Детали образа" }, { name: "description", content: "Вещи, из которых собран образ" }, { property: "og:title", content: "AURA — Детали образа" }, { property: "og:description", content: "Вещи, из которых собран образ" }] }),
  component: OutfitPage,
});

function OutfitPage() {
  const { id } = Route.useParams();
  const nav = useNavigate();
  const qc = useQueryClient();
  const outfit = useQuery({ queryKey: ["outfit", id], queryFn: () => fetchOutfit(id) });
  const favs = useQuery({ queryKey: ["fav", "outfit"], queryFn: () => fetchFavoriteIds("outfit") });
  const [busy, setBusy] = useState(false);
  const liked = favs.data?.includes(id) ?? false;

  async function like() {
    setBusy(true);
    try { await setFavorite("outfit", id, !liked); await qc.invalidateQueries({ queryKey: ["fav"] }); toast.success(liked ? "Убрано из избранного" : "Добавлено в избранное"); }
    catch (e) { toast.error((e as Error).message); }
    finally { setBusy(false); }
  }
  async function remove() {
    if (!confirm("Удалить образ?")) return;
    try { await deleteOutfit(id); await qc.invalidateQueries(); toast.success("Образ удалён"); void nav({ to: "/outfits" }); }
    catch (e) { toast.error((e as Error).message); }
  }

  const o = outfit.data;
  return (
    <AppShell title="Детали образа" back right={o ? <button type="button" aria-label="Удалить образ" onClick={remove} className="text-muted-foreground"><Trash2 size={20} /></button> : undefined}>
      {outfit.isLoading ? <Spinner /> : outfit.error ? <ErrorNote text={(outfit.error as Error).message} /> : !o ? <p className="mt-10 text-center text-muted-foreground">Образ не найден</p> : (
        <>
          <div className="relative overflow-hidden rounded-[20px] bg-card shadow-card">
            <OutfitCover outfit={o} />
            <button type="button" aria-label="В избранное" aria-pressed={liked} disabled={busy} onClick={like} className="absolute top-4 right-4 flex h-11 w-11 items-center justify-center rounded-full bg-card shadow-card transition active:scale-90">
              <Heart size={20} className={liked ? "fill-primary text-primary" : "text-foreground"} />
            </button>
          </div>
          <h2 className="mt-5 font-serif text-3xl">{o.title || "Без названия"}</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {[o.style, o.season, o.occasion].filter(Boolean).map((t) => <span key={t} className="rounded-full bg-accent px-4 py-1.5 text-sm text-accent-foreground">{t}</span>)}
          </div>
          <h3 className="mt-6 mb-3 font-serif text-2xl">Состав образа</h3>
          <ul className="space-y-2">
            {o.items.map((i) => (
              <li key={i.id} className="flex items-center gap-4 rounded-[20px] bg-card p-3 shadow-card">
                {i.photo ? <img src={i.photo} alt={i.name} className="h-14 w-14 rounded-[14px] object-cover" /> : <div className="h-14 w-14 rounded-[14px] border border-border" style={{ background: i.color_hex ?? undefined }} />}
                <div><p className="font-medium">{i.name}</p>{i.brand && <p className="text-xs uppercase tracking-wide text-muted-foreground">{i.brand}</p>}</div>
              </li>
            ))}
          </ul>
        </>
      )}
    </AppShell>
  );
}
