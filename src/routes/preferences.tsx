import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { useI18n } from "@/lib/i18n";
import type { MessageKey } from "@/lib/i18n/ru";
import { PHOTOS } from "@/lib/photos";
import { fetchPreferences, savePreferences, type Preferences } from "@/lib/supabase";

export const Route = createFileRoute("/preferences")({
  head: () => ({ meta: [{ title: "AURA — Preferences" }, { name: "description", content: "Favourite styles, colours and criteria" }, { property: "og:title", content: "AURA — Preferences" }, { property: "og:description", content: "Favourite styles, colours and criteria" }] }),
  component: Prefs,
});

const STYLE_KEYS: { key: MessageKey; img: string }[] = [
  { key: "prefs.classic", img: PHOTOS.minimal },
  { key: "style.minimal", img: PHOTOS.quietLuxury },
  { key: "style.casual", img: PHOTOS.casual },
  { key: "style.coquette", img: PHOTOS.coquette },
  { key: "style.street", img: PHOTOS.streetwear },
  { key: "style.office", img: PHOTOS.oldMoney },
];

const PALETTE = ["#F8F5F0", "#D8C8B0", "#E2B2B8", "#E2F0D9", "#2B2B2B", "#5B7DA8", "#8B5E3C", "#FFFFFF"];
const CRIT_KEYS: MessageKey[] = ["prefs.comfort", "prefs.quality", "prefs.versatility", "prefs.trends", "prefs.aesthetics"];

const PREFS_KEY = "aura:preferences";

function useMulti(init: string[] = []) {
  const [s, set] = useState<string[]>(init);
  return [s, (v: string) => set((p) => (p.includes(v) ? p.filter((x) => x !== v) : [...p, v]))] as const;
}

function Prefs() {
  const { t } = useI18n();
  const [styles, tS] = useMulti(["style.minimal"]);
  const [colors, tC] = useMulti(["#E2B2B8"]);
  const [crit, tK] = useMulti(["prefs.comfort"]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem(PREFS_KEY);
    if (raw) {
      const p = JSON.parse(raw) as Preferences;
      if (p.favorite_styles?.length) setStyles(p.favorite_styles);
      if (p.favorite_colors?.length) setColors(p.favorite_colors);
      if (p.priorities?.length) setCrit(p.priorities);
    }
    setLoaded(true);
  }, []);

  function save() {
    const prefs: Preferences = { favorite_styles: styles, favorite_colors: colors, priorities: crit };
    savePreferences(prefs);
    toast.success(t("prefs.saved"));
  }

  return (
    <AppShell title={t("prefs.title")} back>
      <h3 className="mb-3 font-serif text-2xl">{t("prefs.styles")}</h3>
      <div className="grid grid-cols-3 gap-3">
        {STYLE_KEYS.map((s) => {
          const on = styles.includes(s.key);
          return (
            <button key={s.key} type="button" aria-pressed={on} onClick={() => tS(s.key)} className={`relative overflow-hidden rounded-[20px] bg-card text-left shadow-card transition ${on ? "ring-2 ring-primary" : ""}`}>
              <img src={s.img} alt={t(s.key)} loading="lazy" className="aspect-[3/4] w-full object-cover" />
              {on && <span className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground"><Check size={14} /></span>}
              <p className="p-2 text-center text-xs font-medium">{t(s.key)}</p>
            </button>
          );
        })}
      </div>
      <h3 className="mt-8 mb-3 font-serif text-2xl">{t("prefs.palette")}</h3>
      <div className="flex flex-wrap gap-3">
        {PALETTE.map((c) => <button key={c} aria-label={c} onClick={() => tC(c)} className={`h-11 w-11 rounded-full border border-border ${colors.includes(c) ? "ring-2 ring-primary ring-offset-2" : ""}`} style={{ background: c }} />)}
      </div>
      <h3 className="mt-8 mb-3 font-serif text-2xl">{t("prefs.criteria")}</h3>
      <div className="space-y-2">
        {CRIT_KEYS.map((key) => {
          const on = crit.includes(key);
          return (
            <button key={key} type="button" role="switch" aria-checked={on} onClick={() => tK(key)} className="flex w-full items-center justify-between rounded-[20px] bg-card px-5 py-4 shadow-card">
              {t(key)}
              <span className={`relative h-7 w-12 rounded-full transition ${on ? "bg-primary" : "bg-secondary"}`}>
                <span className={`absolute top-1 h-5 w-5 rounded-full bg-card shadow-card transition-all ${on ? "left-6" : "left-1"}`} />
              </span>
            </button>
          );
        })}
      </div>
      <button className="btn-primary mt-8" onClick={save}>{t("prefs.save")}</button>
    </AppShell>
  );
}
