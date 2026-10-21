import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { AppShell, Chip, ItemTile } from "@/components/AppShell";
import { fetchItems, type ClothingItem } from "@/lib/supabase";

export const Route = createFileRoute("/wardrobe")({
  head: () => ({ meta: [{ title: "AURA — Гардероб" }, { name: "description", content: "Все ваши вещи в одном месте" }, { property: "og:title", content: "AURA — Гардероб" }, { property: "og:description", content: "Все ваши вещи в одном месте" }] }),
  component: Wardrobe,
});

const TAGS = ["Все", "Верх", "Низ", "Платья", "Обувь"];

function Wardrobe() {
  const [items, setItems] = useState<ClothingItem[]>([]);
  const [tag, setTag] = useState("Все");
  const [q, setQ] = useState("");
  useEffect(() => { fetchItems().then(setItems); }, []);
  const list = items.filter((i) => (tag === "Все" || i.category === tag) && i.name.toLowerCase().includes(q.toLowerCase()));
  return (
    <AppShell title="Гардероб">
      <div className="relative">
        <Search className="absolute top-1/2 left-4 -translate-y-1/2 text-muted-foreground" size={18} />
        <input className="field pl-11" placeholder="Поиск вещей" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      <div className="-mx-6 mt-4 flex gap-2 overflow-x-auto px-6 pb-1">
        {TAGS.map((t) => <Chip key={t} active={t === tag} onClick={() => setTag(t)}>{t}</Chip>)}
      </div>
      <div className="mt-5 grid grid-cols-2 gap-4">
        {list.map((i) => <ItemTile key={i.id} name={i.name} brand={i.brand} color={i.color} image={i.image_url} />)}
      </div>
      {list.length === 0 && <p className="mt-10 text-center text-muted-foreground">Ничего не найдено</p>}
    </AppShell>
  );
}
