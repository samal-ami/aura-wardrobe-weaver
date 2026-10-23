import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Camera, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AppShell, Chip, Spinner } from "@/components/AppShell";
import { CATEGORIES, SEASONS, deleteItem, fetchItem, saveItem, uploadPhoto } from "@/lib/supabase";

export const Route = createFileRoute("/add")({
  validateSearch: (s: Record<string, unknown>): { id?: string } => (typeof s["id"] === "string" ? { id: s["id"] } : {}),
  head: () => ({ meta: [{ title: "AURA — Вещь" }, { name: "description", content: "Добавьте или измените вещь в гардеробе" }, { property: "og:title", content: "AURA — Вещь" }, { property: "og:description", content: "Добавьте или измените вещь в гардеробе" }] }),
  component: Add,
});

const COLORS = ["#FFFFFF", "#2B2B2B", "#D8C8B0", "#E2B2B8", "#E2F0D9", "#5B7DA8", "#8B5E3C"];

function Add() {
  const { id } = Route.useSearch();
  const existing = useQuery({ queryKey: ["item", id], queryFn: () => fetchItem(id!), enabled: !!id });
  return (
    <AppShell title={id ? "Редактировать" : "Добавить вещь"} back>
      {id && existing.isLoading ? <Spinner /> : <ItemForm key={id ?? "new"} id={id} item={existing.data ?? null} />}
    </AppShell>
  );
}

function ItemForm({ id, item }: { id?: string | undefined; item: Awaited<ReturnType<typeof fetchItem>> }) {
  const nav = useNavigate();
  const qc = useQueryClient();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(item?.photo ?? null);
  const [name, setName] = useState(item?.name ?? "");
  const [category, setCategory] = useState(item?.category ?? "Верх");
  const [color, setColor] = useState<string>(item?.color_hex ?? COLORS[0] ?? "#FFFFFF");
  const [season, setSeason] = useState(item?.season ?? "");
  const [brand, setBrand] = useState(item?.brand ?? "");
  const [notes, setNotes] = useState(item?.notes ?? "");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => () => { if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview); }, [preview]);

  function onFile(f?: File) {
    if (!f) return;
    if (!f.type.startsWith("image/")) return setMsg("Выберите изображение");
    if (f.size > 8 * 1024 * 1024) return setMsg("Фото больше 8 МБ");
    setMsg(""); setFile(f); setPreview(URL.createObjectURL(f));
  }

  async function save() {
    if (!name.trim()) return setMsg("Введите название");
    setBusy(true); setMsg("");
    try {
      const image_path = file ? await uploadPhoto(file, "items") : item?.image_path ?? null;
      await saveItem({ name: name.trim(), category, color_hex: color, season, brand: brand.trim(), notes: notes.trim(), image_path }, id);
      await qc.invalidateQueries();
      toast.success("Успешно сохранено!");
      void nav({ to: "/wardrobe" });
    } catch (e) { setMsg((e as Error).message); toast.error("Не удалось сохранить"); }
    finally { setBusy(false); }
  }

  async function remove() {
    if (!item || !confirm("Удалить вещь из гардероба?")) return;
    setBusy(true);
    try { await deleteItem(item); await qc.invalidateQueries(); toast.success("Вещь удалена"); void nav({ to: "/wardrobe" }); }
    catch (e) { setMsg((e as Error).message); }
    finally { setBusy(false); }
  }

  if (id && !item) return <p className="mt-10 text-center text-muted-foreground">Вещь не найдена</p>;

  return (
    <>
      <label className="flex aspect-[4/3] cursor-pointer items-center justify-center overflow-hidden rounded-[20px] bg-card shadow-card">
        {preview ? <img src={preview} alt="Фото вещи" className="h-full w-full object-cover" /> : (
          <div className="flex flex-col items-center gap-2 text-muted-foreground"><Camera size={28} />Загрузить фото</div>
        )}
        <input type="file" accept="image/*" hidden onChange={(e) => onFile(e.target.files?.[0])} />
      </label>
      <div className="mt-5 space-y-3">
        <input className="field" placeholder="Название (например, Пиджак)" aria-label="Название" value={name} onChange={(e) => setName(e.target.value)} />
        <p className="pt-2 text-sm text-muted-foreground">Категория</p>
        <div className="flex flex-wrap gap-2">{CATEGORIES.map((c) => <Chip key={c} active={c === category} onClick={() => setCategory(c)}>{c}</Chip>)}</div>
        <p className="pt-2 text-sm text-muted-foreground">Цвет</p>
        <div className="flex gap-3">
          {COLORS.map((c) => <button key={c} type="button" aria-label={c} aria-pressed={color === c} onClick={() => setColor(c)} className={`h-9 w-9 rounded-full border border-border ${color === c ? "ring-2 ring-primary ring-offset-2" : ""}`} style={{ background: c }} />)}
        </div>
        <p className="pt-2 text-sm text-muted-foreground">Сезон</p>
        <div className="flex flex-wrap gap-2">{SEASONS.map((s) => <Chip key={s} active={s === season} onClick={() => setSeason(s === season ? "" : s)}>{s}</Chip>)}</div>
        <input className="field" placeholder="Бренд (Zara)" aria-label="Бренд" value={brand} onChange={(e) => setBrand(e.target.value)} />
        <textarea className="field min-h-24" placeholder="Заметки" aria-label="Заметки" value={notes} onChange={(e) => setNotes(e.target.value)} />
        {msg && <p role="alert" className="text-sm text-destructive">{msg}</p>}
        <button className="btn-primary" disabled={busy} onClick={save}>{busy ? "Сохранение…" : "Сохранить в гардероб"}</button>
        {item && <button type="button" disabled={busy} onClick={remove} className="flex w-full items-center justify-center gap-2 py-3 text-sm text-destructive"><Trash2 size={16} />Удалить вещь</button>}
      </div>
    </>
  );
}
