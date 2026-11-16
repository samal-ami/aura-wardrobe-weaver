import { useState } from "react";
import { Chip } from "@/components/AppShell";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { OutfitCover } from "@/components/OutfitCard";
import { useI18n, categoryLabel, type Translate } from "@/lib/i18n";
import type { MessageKey } from "@/lib/i18n/ru";
import {
  CAPSULES,
  CAPSULE_SEASONS,
  CAPSULE_STYLES,
  CAPSULE_WEATHER,
  filterCapsules,
  type Capsule,
  type CapsuleFilters,
} from "@/lib/capsules";

function FilterRow<T extends string>({ label, options, optionLabel, value, onChange, allLabel }: { label: string; options: readonly T[]; optionLabel: (o: T) => string; value: T | null; onChange: (v: T | null) => void; allLabel: string }) {
  return (
    <div>
      <p className="mb-2 text-xs uppercase tracking-widest text-muted-foreground">{label}</p>
      <div className="-mx-6 flex gap-2 overflow-x-auto px-6 pb-1">
        <Chip active={value === null} onClick={() => onChange(null)}>{allLabel}</Chip>
        {options.map((o) => (
          <Chip key={o} active={value === o} onClick={() => onChange(value === o ? null : o)}>{optionLabel(o)}</Chip>
        ))}
      </div>
    </div>
  );
}

function capsuleTitle(c: Capsule, t: Translate): string {
  return t(`capsule.${c.id}.title` as MessageKey);
}

function capsuleDescription(c: Capsule, t: Translate): string {
  return t(`capsule.${c.id}.desc` as MessageKey);
}

export function CapsuleSection() {
  const { t } = useI18n();
  const [filters, setFilters] = useState<CapsuleFilters>({ style: null, season: null, weather: null });
  const [selected, setSelected] = useState<Capsule | null>(null);
  const list = filterCapsules(CAPSULES, filters);
  const label = (prefix: string) => (o: string) => t(`${prefix}.${o}` as MessageKey);

  return (
    <section>
      <div className="mb-1 flex items-baseline justify-between">
        <h3 className="font-serif text-2xl">{t("capsule.title")}</h3>
      </div>
      <p className="mb-4 text-sm text-muted-foreground">{t("capsule.subtitle")}</p>
      <div className="space-y-4">
        <FilterRow label={t("capsule.style")} options={CAPSULE_STYLES} optionLabel={label("style")} allLabel={t("capsule.all")} value={filters.style} onChange={(style) => setFilters((f) => ({ ...f, style }))} />
        <FilterRow label={t("capsule.season")} options={CAPSULE_SEASONS} optionLabel={label("season")} allLabel={t("capsule.all")} value={filters.season} onChange={(season) => setFilters((f) => ({ ...f, season }))} />
        <FilterRow label={t("capsule.weather")} options={CAPSULE_WEATHER} optionLabel={label("weather")} allLabel={t("capsule.all")} value={filters.weather} onChange={(weather) => setFilters((f) => ({ ...f, weather }))} />
      </div>
      {list.length === 0 ? (
        <p className="mt-6 rounded-3xl bg-card p-6 text-center text-sm text-muted-foreground shadow-card">{t("capsule.empty")}</p>
      ) : (
        <div className="mt-5 grid grid-cols-2 gap-4">
          {list.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setSelected(c)}
              className="overflow-hidden rounded-3xl bg-card text-left shadow-card transition-transform duration-200 active:scale-95 hover:-translate-y-0.5"
            >
              <OutfitCover outfit={{ id: c.id, title: capsuleTitle(c, t), items: c.items.map((i) => ({ id: i.nameKey, name: t(`item.${i.nameKey}`), category: i.category, photo: i.photo, color_hex: null })) }} />
              <div className="p-3">
                <p className="text-sm font-medium leading-snug">{capsuleTitle(c, t)}</p>
                <p className="mt-1 text-xs text-muted-foreground">{t(`style.${c.style}` as MessageKey)} · {t(`season.${c.season}` as MessageKey)}</p>
              </div>
            </button>
          ))}
        </div>
      )}
      <Dialog open={selected !== null} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto rounded-3xl border-0 bg-background sm:max-w-md">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="font-serif text-2xl">{capsuleTitle(selected, t)}</DialogTitle>
                <DialogDescription>{capsuleDescription(selected, t)}</DialogDescription>
              </DialogHeader>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">{t(`style.${selected.style}` as MessageKey)} · {t(`season.${selected.season}` as MessageKey)} · {t(`weather.${selected.weather}` as MessageKey)}</p>
              <div className="mt-2 grid grid-cols-2 gap-3">
                {selected.items.map((i) => (
                  <div key={i.nameKey} className="overflow-hidden rounded-3xl bg-card shadow-card">
                    <div className="aspect-square bg-secondary">
                      <img src={i.photo} alt={t(`item.${i.nameKey}`)} className="h-full w-full object-cover" loading="lazy" />
                    </div>
                    <div className="p-3">
                      <p className="text-sm font-medium">{t(`item.${i.nameKey}`)}</p>
                      <p className="text-xs text-muted-foreground">{categoryLabel(i.category, t)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
