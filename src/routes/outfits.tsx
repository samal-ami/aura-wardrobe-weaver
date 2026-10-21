import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AppShell, ItemTile } from "@/components/AppShell";
import { fetchItems, supabase, type ClothingItem } from "@/lib/supabase";

export const Route = createFileRoute("/outfits")({
  head: () => ({ meta: [{ title: "AURA — Создать образ" }, { name: "description", content: "Соберите новый образ из гардероба" }, { property: "og:title", content: "AURA — Создать образ" }, { property: "og:description", content: "Соберите новый образ из гардероба" }] }),
  component: CreateOutfit,
});

function CreateOutfit() {
  const [items, setItems] = useState<ClothingItem[]>([]);
  const [sel, setSel] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [msg, setMsg] = useState("");
  useEffect(() => { fetchItems().then(setItems); }, []);
  const toggle = (id: string) => setSel((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  const clothes = items.filter((i) => i.category !== "Аксессуары");
  const acc = items.filter((i) => i.category === "Аксессуары");

  async function save() {
    const { data: u } = await supabase.auth.getUser();
    const { error } = await supabase.from("outfits").insert({ name: name || "Новый образ", item_ids: sel, ...(u.user ? { user_id: u.user.id } : {}) });
    setMsg(error ? "Ошибка: " + error.message : "Образ сохранён ✓");
    if (!error) { setSel([]); toast.success("Успешно сохранено!"); } else toast.error("Не удалось сохранить");
  }

  return (
    <AppShell title="Создать образ" back>
      <input className="field" placeholder="Название образа" value={name} onChange={(e) => setName(e.target.value)} />
      <div className="mt-5 grid grid-cols-3 gap-3">
        {clothes.map((i) => <ItemTile key={i.id} name={i.name} brand={i.brand} color={i.color_hex ?? i.color} image={i.image_url} selected={sel.includes(i.id)} onClick={() => toggle(i.id)} />)}
      </div>
      <h3 className="mt-7 mb-3 font-serif text-2xl">Аксессуары</h3>
      <div className="rounded-[20px] bg-accent p-4">
        <div className="grid grid-cols-3 gap-3">
          {acc.map((i) => <ItemTile key={i.id} name={i.name} brand={i.brand} color={i.color_hex ?? i.color} image={i.image_url} selected={sel.includes(i.id)} onClick={() => toggle(i.id)} />)}
          {acc.length === 0 && <p className="col-span-3 text-sm text-accent-foreground">Добавьте аксессуары в гардероб</p>}
        </div>
      </div>
      {msg && <p className="mt-4 text-center text-sm text-muted-foreground">{msg}</p>}
      <button className="btn-primary mt-6" disabled={sel.length === 0} onClick={save}>Сохранить образ ({sel.length})</button>
    </AppShell>
  );
}
