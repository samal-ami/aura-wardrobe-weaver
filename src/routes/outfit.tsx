import { createFileRoute } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import look from "@/assets/look.jpg";

export const Route = createFileRoute("/outfit")({
  head: () => ({ meta: [{ title: "AURA — Городской шик" }, { name: "description", content: "Детали образа «Городской шик»" }, { property: "og:title", content: "AURA — Городской шик" }, { property: "og:description", content: "Детали образа «Городской шик»" }] }),
  component: Outfit,
});

const parts = [
  ["Пиджак оверсайз", "ZARA"], ["Топ", "H&M"], ["Джинсы", "Stradivarius"], ["Кроссовки", "Nike"],
];

function Outfit() {
  return (
    <AppShell title="Детали образа">
      <div className="overflow-hidden rounded-[20px] bg-card">
        <img src={look} alt="Городской шик" className="aspect-square w-full object-cover" />
        <div className="p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-3xl">Городской шик</h2>
            <Heart className="text-primary" />
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {["Деловой", "Повседневный", "Осень"].map((t) => <span key={t} className="rounded-full bg-accent px-3 py-1 text-xs text-accent-foreground">{t}</span>)}
          </div>
        </div>
      </div>
      <h3 className="mt-7 mb-3 font-serif text-2xl">Состав образа</h3>
      <ul className="space-y-3">
        {parts.map(([n, b]) => (
          <li key={n} className="flex items-center justify-between rounded-[20px] bg-card px-5 py-4">
            <span>{n}</span><span className="text-xs tracking-widest text-muted-foreground">{b?.toUpperCase()}</span>
          </li>
        ))}
      </ul>
    </AppShell>
  );
}
