import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Search } from "lucide-react";
import { AppShell, Chip, Empty, ErrorNote, ItemTile, Spinner } from "@/components/AppShell";
import { CATEGORIES, fetchItems } from "@/lib/supabase";

export const Route = createFileRoute("/wardrobe")({
  head: () => ({ meta: [{ title: "AURA — Гардероб" }, { name: "description", content: "Все ваши вещи в одном месте" }, { property: "og:title", content: "AURA — Гардероб" }, { property: "og:description", content: "Все ваши вещи в одном месте" }] }),
  component: Wardrobe,
});

const TAGS = ["Все", ...CATEGORIES];

function Wardrobe() {
  const nav = useNavigate();
  const { data, isLoading, error, refetch } = useQuery({ queryKey: ["items"], queryFn: fetchItems });
  const [tag, setTag] = useState("Все");
  const [q, setQ] = useState("");
  const query = q.trim().toLowerCase();
  const list = (data ?? []).filter((i) => (tag === "Все" || i.category === tag) && (`${i.name} ${i.brand ?? ""}`.toLowerCase().includes(query)));
  return (
    <AppShell title="Гардероб">
      <div className="relative">
        <Search className="absolute top-1/2 left-4 -translate-y-1/2 text-muted-foreground" size={18} />
        <input className="field pl-11" placeholder="Поиск по названию или бренду" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      <div className="-mx-6 mt-4 flex gap-2 overflow-x-auto px-6 pb-1">
        {TAGS.map((t) => <Chip key={t} active={t === tag} onClick={() => setTag(t)}>{t}</Chip>)}
      </div>
      {isLoading ? <Spinner /> : error ? <div className="mt-6"><ErrorNote text={(error as Error).message} onRetry={() => refetch()} /></div> :
        data!.length === 0 ? <Empty title="Гардероб пуст" text="Сфотографируйте первую вещь — и начнём собирать образы" action={<Link to="/add" className="btn-primary inline-block">Добавить вещь</Link>} /> :
        list.length === 0 ? <p className="mt-10 text-center text-muted-foreground">Ничего не найдено</p> : (
          <>
            <p className="mt-4 text-xs text-muted-foreground">{list.length} вещ.</p>
            <div className="mt-2 grid grid-cols-2 gap-4">
              {list.map((i) => <ItemTile key={i.id} name={i.name} brand={i.brand} color={i.color_hex} image={i.photo} onClick={() => nav({ to: "/add", search: { id: i.id } })} />)}
            </div>
          </>
        )}
    </AppShell>
  );
}
