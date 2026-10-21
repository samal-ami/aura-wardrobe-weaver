import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell, Chip } from "@/components/AppShell";

export const Route = createFileRoute("/preferences")({
  head: () => ({ meta: [{ title: "AURA — Мои предпочтения" }, { name: "description", content: "Любимые стили, цвета и критерии" }, { property: "og:title", content: "AURA — Мои предпочтения" }, { property: "og:description", content: "Любимые стили, цвета и критерии" }] }),
  component: Prefs,
});

const STYLES = ["Классика", "Минимализм", "Casual", "Romantic", "Street style", "Business"];
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
    <AppShell title="Мои предпочтения">
      <h3 className="mb-3 font-serif text-2xl">Любимые стили</h3>
      <div className="flex flex-wrap gap-2">{STYLES.map((s) => <Chip key={s} active={styles.includes(s)} onClick={() => tS(s)}>{s}</Chip>)}</div>
      <h3 className="mt-8 mb-3 font-serif text-2xl">Цветовая палитра</h3>
      <div className="flex flex-wrap gap-3">
        {PALETTE.map((c) => <button key={c} aria-label={c} onClick={() => tC(c)} className={`h-11 w-11 rounded-full border border-border ${colors.includes(c) ? "ring-2 ring-primary ring-offset-2" : ""}`} style={{ background: c }} />)}
      </div>
      <h3 className="mt-8 mb-3 font-serif text-2xl">Что для вас важно</h3>
      <div className="space-y-2">
        {CRIT.map((c) => (
          <button key={c} onClick={() => tK(c)} className={`flex w-full items-center justify-between rounded-[20px] px-5 py-4 ${crit.includes(c) ? "bg-accent text-accent-foreground" : "bg-card"}`}>
            {c}<span className={`h-5 w-5 rounded-full border border-border ${crit.includes(c) ? "bg-primary" : ""}`} />
          </button>
        ))}
      </div>
      <button className="btn-primary mt-8">Сохранить</button>
    </AppShell>
  );
}
