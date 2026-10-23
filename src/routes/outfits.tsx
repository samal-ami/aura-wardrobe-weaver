import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { AppShell, Empty, ErrorNote, Spinner } from "@/components/AppShell";
import { OutfitCard } from "@/components/OutfitCard";
import { fetchOutfits } from "@/lib/supabase";

export const Route = createFileRoute("/outfits")({
  head: () => ({ meta: [{ title: "AURA — Мои образы" }, { name: "description", content: "Все сохранённые образы" }, { property: "og:title", content: "AURA — Мои образы" }, { property: "og:description", content: "Все сохранённые образы" }] }),
  component: Outfits,
});

function Outfits() {
  const { data, isLoading, error, refetch } = useQuery({ queryKey: ["outfits"], queryFn: fetchOutfits });
  return (
    <AppShell title="Образы" right={<Link to="/create" aria-label="Создать образ" className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground"><Plus size={20} /></Link>}>
      {isLoading ? <Spinner /> : error ? <ErrorNote text={(error as Error).message} onRetry={() => refetch()} /> :
        data!.length === 0 ? <Empty title="Нет образов" text="Соберите первый образ из вещей гардероба" action={<Link to="/create" className="btn-primary inline-block">Создать образ</Link>} /> :
        <div className="grid grid-cols-2 gap-4">{data!.map((o) => <OutfitCard key={o.id} outfit={o} />)}</div>}
    </AppShell>
  );
}
