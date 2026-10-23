import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell, Chip, Empty, ErrorNote, ItemTile, Spinner } from "@/components/AppShell";
import { SEASONS, createOutfit, fetchItems } from "@/lib/supabase";

export const Route = createFileRoute("/create")({
  head: () => ({ meta: [{ title: "AURA — Создать образ" }, { name: "description", content: "Соберите новый образ из гардероба" }, { property: "og:title", content: "AURA — Создать образ" }, { property: "og:description", content: "Соберите новый образ из гардероба" }] }),
  component: CreateOutfit,
});

const STYLES = ["Классика", "Минимализм", "Casual", "Romantic", "Street style", "Business"];
const OCCASIONS = ["Работа", "Прогулка", "Свидание", "Вечеринка", "Путешествие"];

function CreateOutfit() {
  const nav = useNavigate();
  const qc = useQueryClient();
  const { data: items, isLoading, error, refetch } = useQuery({ queryKey: ["items"], queryFn: fetchItems });
  const [sel, setSel] = useState<string[]>([]);
  const [title, setTitle] = useState("");
  const [style, setStyle] = useState("");
  const [season, setSeason] = useState("");
  const [occasion, setOccasion] = useState("");
  const [busy, setBusy] = useState(false);
  const toggle = (id: string) => setSel((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  const one = (v: string, set: (x: string) => void, cur: string) => () => set(cur === v ? "" : v);

  async function save() {
    setBusy(true);
    try {
      const id = await createOutfit({ title, style, season, occasion, description: "" }, sel);
      await qc.invalidateQueries();
      toast.success("Успешно сохранено!");
      void nav({ to: "/outfit/$id", params: { id } });
    } catch (e) { toast.error((e as Error).message); }
    finally { setBusy(false); }
  }

  const clothes = (items ?? []).filter((i) => i.category !== "Аксессуары");
  const acc = (items ?? []).filter((i) => i.category === "Аксессуары");

  return (
    <AppShell title="Создать образ" back>
      {isLoading ? <Spinner /> : error ? <ErrorNote text={(error as Error).message} onRetry={() => refetch()} /> :
        items!.length === 0 ? <Empty title="Нет вещей" text="Сначала добавьте вещи в гардероб" action={<Link to="/add" className="btn-primary inline-block">Добавить вещь</Link>} /> : (
          <>
            <input className="field" placeholder="Название образа" value={title} onChange={(e) => setTitle(e.target.value)} />
            <div className="-mx-6 mt-3 flex gap-2 overflow-x-auto px-6">{STYLES.map((s) => <Chip key={s} active={style === s} onClick={one(s, setStyle, style)}>{s}</Chip>)}</div>
            <div className="-mx-6 mt-2 flex gap-2 overflow-x-auto px-6">{SEASONS.map((s) => <Chip key={s} active={season === s} onClick={one(s, setSeason, season)}>{s}</Chip>)}</div>
            <div className="-mx-6 mt-2 flex gap-2 overflow-x-auto px-6">{OCCASIONS.map((s) => <Chip key={s} active={occasion === s} onClick={one(s, setOccasion, occasion)}>{s}</Chip>)}</div>
            <h3 className="mt-6 mb-3 font-serif text-2xl">Одежда и обувь</h3>
            <div className="grid grid-cols-3 gap-3">
              {clothes.map((i) => <ItemTile key={i.id} name={i.name} brand={i.brand} color={i.color_hex} image={i.photo} selected={sel.includes(i.id)} onClick={() => toggle(i.id)} />)}
            </div>
            <h3 className="mt-7 mb-3 font-serif text-2xl">Аксессуары</h3>
            <div className="rounded-[20px] bg-accent p-4">
              <div className="grid grid-cols-3 gap-3">
                {acc.map((i) => <ItemTile key={i.id} name={i.name} brand={i.brand} color={i.color_hex} image={i.photo} selected={sel.includes(i.id)} onClick={() => toggle(i.id)} />)}
                {acc.length === 0 && <p className="col-span-3 text-sm text-accent-foreground">Добавьте аксессуары в гардероб</p>}
              </div>
            </div>
            <button className="btn-primary mt-6" disabled={sel.length === 0 || busy} onClick={save}>{busy ? "Сохранение…" : `Сохранить образ (${sel.length})`}</button>
          </>
        )}
    </AppShell>
  );
}
