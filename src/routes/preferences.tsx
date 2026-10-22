import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Check } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import look from "@/assets/look.jpg";
import welcome from "@/assets/welcome.jpg";
import jeans from "@/assets/item-jeans.jpg";
import romantic from "@/assets/style-romantic.jpg";
import street from "@/assets/style-street.jpg";
import business from "@/assets/style-business.jpg";

export const Route = createFileRoute("/preferences")({
  head: () => ({ meta: [{ title: "AURA — Мои предпочтения" }, { name: "description", content: "Любимые стили, цвета и критерии" }, { property: "og:title", content: "AURA — Мои предпочтения" }, { property: "og:description", content: "Любимые стили, цвета и критерии" }] }),
  component: Prefs,
});

const STYLES = [
  { n: "Классика", img: look }, { n: "Минимализм", img: welcome }, { n: "Casual", img: jeans },
  { n: "Romantic", img: romantic }, { n: "Street style", img: street }, { n: "Business", img: business },
];
const PALETTE = ["#F8F5F0", "#D8C8B0", "#E2B2B8", "#E2F0D9", "#2B2B2B", "#5B7DA8", "#8B5E3C", "#FFFFFF"];
const CRIT = ["Комфорт", "Качество", "Универсальность", "Тренды", "Эстетика"];

function useMulti(init: string[] = []) {
  const [s, set] = useState<string[]>(init);
  return [s, (v: string) => set((p) => (p.includes(v) ? p.filter((x) => x !== v) : [...p, v]))] as const;
}

function Prefs() {
  const [styles, tS] = useMulti(["Минимализм"]);
  const [colors, tC] = useMulti(["#E2B2B8"]);
  const [crit, tK] = useMulti(["Комфорт"]);
  return (
    <AppShell title="Мои предпочтения" back>
      <h3 className="mb-3 font-serif text-2xl">Любимые стили</h3>
      <div className="grid grid-cols-3 gap-3">
        {STYLES.map((s) => {
          const on = styles.includes(s.n);
          return (
            <button key={s.n} type="button" aria-pressed={on} onClick={() => tS(s.n)} className={`relative overflow-hidden rounded-[20px] bg-card text-left shadow-card transition ${on ? "ring-2 ring-primary" : ""}`}>
              <img src={s.img} alt={s.n} loading="lazy" className="aspect-[3/4] w-full object-cover" />
              {on && <span className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground"><Check size={14} /></span>}
              <p className="p-2 text-center text-xs font-medium">{s.n}</p>
            </button>
          );
        })}
      </div>
      <h3 className="mt-8 mb-3 font-serif text-2xl">Цветовая палитра</h3>
      <div className="flex flex-wrap gap-3">
        {PALETTE.map((c) => <button key={c} aria-label={c} onClick={() => tC(c)} className={`h-11 w-11 rounded-full border border-border ${colors.includes(c) ? "ring-2 ring-primary ring-offset-2" : ""}`} style={{ background: c }} />)}
      </div>
      <h3 className="mt-8 mb-3 font-serif text-2xl">Что для тебя важно</h3>
      <div className="space-y-2">
        {CRIT.map((c) => {
          const on = crit.includes(c);
          return (
            <button key={c} type="button" role="switch" aria-checked={on} onClick={() => tK(c)} className="flex w-full items-center justify-between rounded-[20px] bg-card px-5 py-4 shadow-card">
              {c}
              <span className={`relative h-7 w-12 rounded-full transition ${on ? "bg-primary" : "bg-secondary"}`}>
                <span className={`absolute top-1 h-5 w-5 rounded-full bg-card shadow-card transition-all ${on ? "left-6" : "left-1"}`} />
              </span>
            </button>
          );
        })}
      </div>
      <button className="btn-primary mt-8" onClick={() => toast.success("Успешно сохранено!")}>Сохранить</button>
    </AppShell>
  );
}
