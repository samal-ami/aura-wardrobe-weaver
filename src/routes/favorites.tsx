import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AppShell, Empty, ErrorNote, Spinner } from "@/components/AppShell";
import { OutfitCard } from "@/components/OutfitCard";
import { useI18n } from "@/lib/i18n";
import { fetchFavoriteIds, fetchOutfits } from "@/lib/supabase";

export const Route = createFileRoute("/favorites")({
  head: () => ({ meta: [{ title: "AURA — Favourites" }, { name: "description", content: "Your favourite outfits" }, { property: "og:title", content: "AURA — Favourites" }, { property: "og:description", content: "Your favourite outfits" }] }),
  component: Favorites,
});

function Favorites() {
  const { t } = useI18n();
  const outfits = useQuery({ queryKey: ["outfits"], queryFn: fetchOutfits });
  const favs = useQuery({ queryKey: ["fav", "outfit"], queryFn: () => fetchFavoriteIds("outfit") });
  const err = outfits.error ?? favs.error;
  const list = (outfits.data ?? []).filter((o) => favs.data?.includes(o.id));
  return (
    <AppShell title={t("favorites.title")} back>
      {outfits.isLoading || favs.isLoading ? <Spinner /> : err ? <ErrorNote text={(err as Error).message} /> :
        list.length === 0 ? <Empty title={t("favorites.empty")} text={t("favorites.emptyText")} action={<Link to="/outfits" className="btn-primary inline-block">{t("favorites.toOutfits")}</Link>} /> :
        <div className="grid grid-cols-2 gap-4">{list.map((o) => <OutfitCard key={o.id} outfit={o} />)}</div>}
    </AppShell>
  );
}
