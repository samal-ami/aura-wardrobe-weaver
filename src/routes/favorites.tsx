import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AppShell, Empty, ErrorNote, Spinner } from "@/components/AppShell";
import { OutfitCard } from "@/components/OutfitCard";
import { fetchFavoriteIds, fetchOutfits } from "@/lib/supabase";

export const Route = createFileRoute("/favorites")({
  head: () => ({ meta: [{ title: "AURA — Избранное" }, { name: "description", content: "Ваши любимые образы" }, { property: "og:title", content: "AURA — Избранное" }, { property: "og:description", content: "Ваши любимые образы" }] }),
  component: Favorites,
});

function Favorites() {
  const outfits = useQuery({ queryKey: ["outfits"], queryFn: fetchOutfits });
  const favs = useQuery({ queryKey: ["fav", "outfit"], queryFn: () => fetchFavoriteIds("outfit") });
  const err = outfits.error ?? favs.error;
  const list = (outfits.data ?? []).filter((o) => favs.data?.includes(o.id));
  return (
    <AppShell title="Избранное" back>
      {outfits.isLoading || favs.isLoading ? <Spinner /> : err ? <ErrorNote text={(err as Error).message} /> :
        list.length === 0 ? <Empty title="Пока пусто" text="Нажмите на сердечко в образе, чтобы сохранить его сюда" action={<Link to="/outfits" className="btn-primary inline-block">К образам</Link>} /> :
        <div className="grid grid-cols-2 gap-4">{list.map((o) => <OutfitCard key={o.id} outfit={o} />)}</div>}
    </AppShell>
  );
}
