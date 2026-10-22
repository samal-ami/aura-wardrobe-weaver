import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Heart } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { ITEM_IMAGES } from "@/lib/supabase";
import look from "@/assets/look.jpg";

export const Route = createFileRoute("/outfit")({
  head: () => ({ meta: [{ title: "AURA — Городской шик" }, { name: "description", content: "Детали образа «Городской шик»" }, { property: "og:title", content: "AURA — Городской шик" }, { property: "og:description", content: "Детали образа «Городской шик»" }] }),
  component: Outfit,
});

const parts = [
  { n: "Пиджак оверсайз", b: "ZARA", img: ITEM_IMAGES.blazer },
  { n: "Футболка", b: "H&M", img: ITEM_IMAGES.tee },
  { n: "Широкие джинсы", b: "Stradivarius", img: ITEM_IMAGES.jeans },
  { n: "Лоферы", b: "Massimo Dutti", img: ITEM_IMAGES.loafers },
  { n: "Сумка", b: "COS", img: ITEM_IMAGES.bag },
];

function Outfit() {
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(128);
  const toggle = () => { setLiked((l) => !l); setCount((c) => (liked ? c - 1 : c + 1)); };
  return (
    <AppShell title="Детали образа" back>
      <div className="overflow-hidden rounded-[20px] bg-card shadow-card">
        <img src={look} alt="Городской шик" className="aspect-square w-full object-cover" />
        <div className="p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-3xl">Городской шик</h2>
            <button type="button" aria-label="Нравится" aria-pressed={liked} onClick={toggle} className="flex items-center gap-1.5 rounded-full bg-secondary px-3 py-2 text-sm transition active:scale-95">
              <Heart size={20} className={liked ? "fill-primary text-primary" : "text-muted-foreground"} />
              <span>{count}</span>
            </button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {["Деловой", "Повседневный", "Осень"].map((t) => <span key={t} className="rounded-full bg-accent px-3 py-1 text-xs text-accent-foreground">{t}</span>)}
          </div>
        </div>
      </div>
      <h3 className="mt-7 mb-3 font-serif text-2xl">Состав образа</h3>
      <ul className="space-y-3">
        {parts.map((p) => (
          <li key={p.n} className="flex items-center gap-4 rounded-[20px] bg-card p-3 shadow-card">
            <img src={p.img} alt={p.n} loading="lazy" className="h-14 w-14 rounded-[14px] object-cover" />
            <span className="flex-1">{p.n}</span><span className="pr-2 text-xs tracking-widest text-muted-foreground">{p.b.toUpperCase()}</span>
          </li>
        ))}
      </ul>
    </AppShell>
  );
}
