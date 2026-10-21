import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Camera } from "lucide-react";
import { AppShell, Chip } from "@/components/AppShell";
import { supabase, CATEGORIES } from "@/lib/supabase";

export const Route = createFileRoute("/add")({
  head: () => ({ meta: [{ title: "AURA — Добавить вещь" }, { name: "description", content: "Добавьте новую вещь в гардероб" }, { property: "og:title", content: "AURA — Добавить вещь" }, { property: "og:description", content: "Добавьте новую вещь в гардероб" }] }),
  component: Add,
});

const COLORS = ["#FFFFFF", "#2B2B2B", "#D8C8B0", "#E2B2B8", "#E2F0D9", "#5B7DA8", "#8B5E3C"];

function Add() {
  const nav = useNavigate();
  const [image, setImage] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Верх");
  const [color, setColor] = useState(COLORS[0]);
  const [brand, setBrand] = useState("");
  const [notes, setNotes] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  function onFile(f?: File) {
    if (!f) return;
    const r = new FileReader();
    r.onload = () => setImage(r.result as string);
    r.readAsDataURL(f);
  }

  async function save() {
    setBusy(true); setMsg("");
    const { data: u } = await supabase.auth.getUser();
    const { error } = await supabase.from("clothing_items").insert({
      name, category, color, brand, notes, image_url: image, ...(u.user ? { user_id: u.user.id } : {}),
    });
    setBusy(false);
    if (error) setMsg("Не удалось сохранить: " + error.message);
    else nav({ to: "/wardrobe" });
  }

  return (
    <AppShell title="Новая вещь">
      <label className="flex aspect-[4/3] cursor-pointer items-center justify-center overflow-hidden rounded-[20px] bg-card">
        {image ? <img src={image} alt="" className="h-full w-full object-cover" /> : (
          <div className="flex flex-col items-center gap-2 text-muted-foreground"><Camera size={28} />Загрузить фото</div>
        )}
        <input type="file" accept="image/*" hidden onChange={(e) => onFile(e.target.files?.[0])} />
      </label>
      <div className="mt-5 space-y-3">
        <input className="field" placeholder="Название (например, Пиджак)" value={name} onChange={(e) => setName(e.target.value)} />
        <p className="pt-2 text-sm text-muted-foreground">Категория</p>
        <div className="flex flex-wrap gap-2">{CATEGORIES.map((c) => <Chip key={c} active={c === category} onClick={() => setCategory(c)}>{c}</Chip>)}</div>
        <p className="pt-2 text-sm text-muted-foreground">Цвет</p>
        <div className="flex gap-3">
          {COLORS.map((c) => (
            <button key={c} type="button" aria-label={c} onClick={() => setColor(c)} className={`h-9 w-9 rounded-full border border-border ${color === c ? "ring-2 ring-primary ring-offset-2" : ""}`} style={{ background: c }} />
          ))}
        </div>
        <input className="field" placeholder="Бренд (Zara)" value={brand} onChange={(e) => setBrand(e.target.value)} />
        <textarea className="field min-h-24" placeholder="Заметки" value={notes} onChange={(e) => setNotes(e.target.value)} />
        {msg && <p className="text-sm text-destructive">{msg}</p>}
        <button className="btn-primary" disabled={!name || busy} onClick={save}>{busy ? "Сохранение…" : "Сохранить"}</button>
      </div>
    </AppShell>
  );
}
