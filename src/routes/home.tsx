import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AppShell, Empty, ErrorNote, Spinner } from "@/components/AppShell";
import { OutfitCard } from "@/components/OutfitCard";
import { fetchOutfits, fetchProfile } from "@/lib/supabase";
import look from "@/assets/look.jpg";

export const Route = createFileRoute("/home")({
  head: () => ({ meta: [{ title: "AURA — Лента" }, { name: "description", content: "Вдохновение и ваши образы" }, { property: "og:title", content: "AURA — Лента" }, { property: "og:description", content: "Вдохновение и ваши образы" }] }),
  component: Home,
});

function Home() {
  const profile = useQuery({ queryKey: ["profile"], queryFn: fetchProfile });
  const outfits = useQuery({ queryKey: ["outfits"], queryFn: fetchOutfits });
  return (
    <AppShell title="AURA">
      <p className="-mt-2 mb-5 text-muted-foreground">Привет, {profile.data?.display_name ?? "…"}</p>
      <section className="relative overflow-hidden rounded-[20px] shadow-card">
        <img src={look} alt="Вдохновение недели" className="aspect-[4/3] w-full object-cover" />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-foreground/60 to-transparent p-6">
          <p className="text-xs uppercase tracking-widest text-background">Вдохновение недели</p>
          <h2 className="mt-1 font-serif text-3xl leading-tight text-background">Твой стиль. Твоя история</h2>
          <Link to="/create" className="mt-4 inline-block rounded-[20px] bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground">Собрать образ</Link>
        </div>
      </section>
      <div className="mt-8 mb-4 flex items-baseline justify-between">
        <h3 className="font-serif text-2xl">Мои последние образы</h3>
        <Link to="/outfits" className="text-sm text-muted-foreground">Все</Link>
      </div>
      {outfits.isLoading ? <Spinner /> : outfits.error ? <ErrorNote text={(outfits.error as Error).message} onRetry={() => outfits.refetch()} /> :
        outfits.data!.length === 0 ? <Empty title="Пока нет образов" text="Добавьте вещи в гардероб и соберите первый образ" action={<Link to="/add" className="btn-primary inline-block">Добавить вещь</Link>} /> : (
          <div className="grid grid-cols-2 gap-4">{outfits.data!.slice(0, 4).map((o) => <OutfitCard key={o.id} outfit={o} />)}</div>
        )}
    </AppShell>
  );
}
