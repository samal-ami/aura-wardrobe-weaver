import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { Camera, Check, Minus, X } from "lucide-react";
import { AppShell, Chip, Spinner, ErrorNote } from "@/components/AppShell";
import { averageImageColor } from "@/lib/color";
import { fetchItems } from "@/lib/supabase";
import { SHOP_CATEGORIES, VERDICT_LABEL, analyzePurchase, type ShoppingResult, type ShoppingVerdict } from "@/lib/shopping";

export const Route = createFileRoute("/shopping")({
  head: () => ({
    meta: [
      { title: "AURA — Проверка покупки" },
      { name: "description", content: "Проверьте вещь из магазина перед покупкой" },
    ],
  }),
  component: ShoppingPage,
});

const VERDICT_STYLE: Record<ShoppingVerdict, string> = {
  buy: "bg-[#1A1A1A] text-white",
  consider: "bg-[#F2D7E0] text-[#1A1A1A]",
  skip: "bg-[#F5F5F5] text-[#1A1A1A]",
};

const VERDICT_ICON: Record<ShoppingVerdict, typeof Check> = { buy: Check, consider: Minus, skip: X };

function ShoppingPage() {
  const { data: items = [], isLoading, isError, refetch } = useQuery({ queryKey: ["items"], queryFn: fetchItems });
  const [name, setName] = useState("");
  const [category, setCategory] = useState<string>("Верх");
  const [color, setColor] = useState("#F5F5F0");
  const [price, setPrice] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);
  const [photoNote, setPhotoNote] = useState<string | null>(null);
  const [result, setResult] = useState<ShoppingResult | null>(null);
  const [checkedName, setCheckedName] = useState("");

  const onFile = (file: File | undefined) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const src = typeof reader.result === "string" ? reader.result : null;
      if (!src) return;
      setPhoto(src);
      const img = new Image();
      img.onload = () => {
        setColor(averageImageColor(img));
        setPhotoNote("Цвет определён по фото.");
      };
      img.onerror = () => setPhotoNote("Не удалось прочитать фото. Укажите цвет вручную.");
      img.src = src;
    };
    reader.readAsDataURL(file);
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    const parsedPrice = price.trim() === "" ? null : Number(price.replace(/\s/g, ""));
    const safePrice = parsedPrice !== null && Number.isFinite(parsedPrice) && parsedPrice >= 0 ? parsedPrice : null;
    setCheckedName(trimmed);
    setResult(analyzePurchase({ name: trimmed, category, color_hex: color, price: safePrice }, items));
  };

  return (
    <AppShell title="Проверка покупки" back>
      <div className="flex flex-col gap-6 pb-12">
        <p className="text-sm leading-relaxed text-[#555]">
          Перед покупкой проверьте вещь: сравним её с вашим гардеробом, оценим универсальность и подскажем, стоит ли брать.
        </p>

        {isLoading && <Spinner />}
        {isError && <ErrorNote text="Не удалось загрузить гардероб" onRetry={() => refetch()} />}

        <form onSubmit={onSubmit} className="flex flex-col gap-5 rounded-3xl bg-white p-5 shadow-sm">
          <label className="flex cursor-pointer flex-col items-center gap-2 rounded-2xl border border-dashed border-[#E8B4BC] p-4 text-center text-sm text-[#555] transition-colors duration-200 hover:bg-[#F8E8EE]">
            {photo ? (
              <img src={photo} alt="" className="h-40 w-32 rounded-2xl object-cover" />
            ) : (
              <span className="flex h-40 w-32 flex-col items-center justify-center gap-2 rounded-2xl bg-[#F8E8EE]">
                <Camera className="h-6 w-6 text-[#1A1A1A]" />
                <span className="text-xs">Фото из магазина</span>
              </span>
            )}
            {photoNote && <span className="text-xs">{photoNote}</span>}
            <input type="file" accept="image/*" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
          </label>

          <div className="flex flex-col gap-2">
            <label htmlFor="shop-name" className="text-sm font-medium text-[#1A1A1A]">Название и бренд</label>
            <input
              id="shop-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Например: Кашемировый кардиган, Uniqlo"
              className="h-11 rounded-full border border-[#E8B4BC] bg-white px-4 text-sm outline-none focus:border-[#1A1A1A]"
            />
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-[#1A1A1A]">Категория</span>
            <div className="flex flex-wrap gap-2">
              {SHOP_CATEGORIES.map((c) => (
                <Chip key={c} active={category === c} onClick={() => setCategory(c)}>{c}</Chip>
              ))}
            </div>
          </div>

          <div className="flex items-end gap-4">
            <div className="flex flex-col gap-2">
              <label htmlFor="shop-color" className="text-sm font-medium text-[#1A1A1A]">Цвет</label>
              <input
                id="shop-color"
                type="color"
                value={color}
                onChange={(e) => {
                  setColor(e.target.value);
                  setPhotoNote(null);
                }}
                className="h-11 w-16 cursor-pointer rounded-full border border-[#E8B4BC] bg-white p-1"
              />
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <label htmlFor="shop-price" className="text-sm font-medium text-[#1A1A1A]">Цена, ₽ (необязательно)</label>
              <input
                id="shop-price"
                inputMode="numeric"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="12 900"
                className="h-11 rounded-full border border-[#E8B4BC] bg-white px-4 text-sm outline-none focus:border-[#1A1A1A]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={!name.trim() || items.length === 0}
            className="h-12 rounded-full bg-[#1A1A1A] text-sm font-medium text-white transition-colors duration-200 hover:bg-[#333] active:scale-95 disabled:opacity-40"
          >
            Проверить покупку
          </button>
        </form>

        {result && <ShoppingReport name={checkedName} result={result} />}
      </div>
    </AppShell>
  );
}

function ShoppingReport({ name, result }: { name: string; result: ShoppingResult }) {
  const Icon = VERDICT_ICON[result.verdict];
  return (
    <section className="flex flex-col gap-4 rounded-3xl bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="truncate text-xs text-[#555]">{name}</p>
          <p className="text-3xl font-medium text-[#1A1A1A]">{result.score}<span className="text-base text-[#555]"> / 100</span></p>
        </div>
        <span className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors duration-200 ${VERDICT_STYLE[result.verdict]}`}>
          <Icon className="h-4 w-4" />
          {VERDICT_LABEL[result.verdict]}
        </span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-[#F8E8EE]">
        <div className="h-full rounded-full bg-[#E8B4BC] transition-all duration-500" style={{ width: `${result.score}%` }} />
      </div>

      <ul className="flex flex-col gap-2 text-sm leading-relaxed text-[#1A1A1A]">
        {result.reasons.map((r) => (
          <li key={r} className="flex gap-2">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#E8B4BC]" />
            <span>{r}</span>
          </li>
        ))}
      </ul>

      {result.matches.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium text-[#1A1A1A]">Сочетается с вашими вещами</p>
          <div className="grid grid-cols-4 gap-2">
            {result.matches.slice(0, 8).map((m) => (
              <div key={m.id} className="flex flex-col gap-1">
                <div className="aspect-[3/4] overflow-hidden rounded-2xl bg-[#F8E8EE]">
                  {m.photo && <img src={m.photo} alt={m.name} className="h-full w-full object-cover" />}
                </div>
                <p className="truncate text-[11px] text-[#555]">{m.name}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
