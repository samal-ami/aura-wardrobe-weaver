import { useState } from "react";
import { Chip } from "@/components/AppShell";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { OutfitCover } from "@/components/OutfitCard";
import {
  CAPSULES,
  CAPSULE_SEASONS,
  CAPSULE_STYLES,
  CAPSULE_WEATHER,
  filterCapsules,
  type Capsule,
  type CapsuleFilters,
} from "@/lib/capsules";

const ALL = "Все";

function FilterRow<T extends string>({ label, options, value, onChange }: { label: string; options: readonly T[]; value: T | null; onChange: (v: T | null) => void }) {
  return (
    <div>
      <p className="mb-2 text-xs uppercase tracking-widest text-muted-foreground">{label}</p>
      <div className="-mx-6 flex gap-2 overflow-x-auto px-6 pb-1">
        <Chip active={value === null} onClick={() => onChange(null)}>{ALL}</Chip>
        {options.map((o) => (
          <Chip key={o} active={value === o} onClick={() => onChange(value === o ? null : o)}>{o}</Chip>
        ))}
      </div>
    </div>
  );
}

export function CapsuleSection() {
  const [filters, setFilters] = useState<CapsuleFilters>({ style: null, season: null, weather: null });
  const [selected, setSelected] = useState<Capsule | null>(null);
  const list = filterCapsules(CAPSULES, filters);

  return (
    <section>
      <div className="mb-1 flex items-baseline justify-between">
        <h3 className="font-serif text-2xl">Your Personal Capsule</h3>
      </div>
      <p className="mb-4 text-sm text-muted-foreground">Готовые подборки под стиль, сезон и погоду</p>
      <div className="space-y-4">
        <FilterRow label="Стиль" options={CAPSULE_STYLES} value={filters.style} onChange={(style) => setFilters((f) => ({ ...f, style }))} />
        <FilterRow label="Сезон" options={CAPSULE_SEASONS} value={filters.season} onChange={(season) => setFilters((f) => ({ ...f, season }))} />
        <FilterRow label="Погода" options={CAPSULE_WEATHER} value={filters.weather} onChange={(weather) => setFilters((f) => ({ ...f, weather }))} />
      </div>
      {list.length === 0 ? (
        <p className="mt-6 rounded-3xl bg-card p-6 text-center text-sm text-muted-foreground shadow-card">Нет подборок с такими параметрами</p>
      ) : (
        <div className="mt-5 grid grid-cols-2 gap-4">
          {list.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setSelected(c)}
              className="overflow-hidden rounded-3xl bg-card text-left shadow-card transition-transform duration-200 active:scale-95 hover:-translate-y-0.5"
            >
              <OutfitCover outfit={{ id: c.id, title: c.title, items: c.items.map((i) => ({ id: i.name, name: i.name, category: i.category, photo: i.photo, color_hex: null })) }} />
              <div className="p-3">
                <p className="text-sm font-medium leading-snug">{c.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">{c.style} · {c.season}</p>
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
                <DialogTitle className="font-serif text-2xl">{selected.title}</DialogTitle>
                <DialogDescription>{selected.description}</DialogDescription>
              </DialogHeader>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">{selected.style} · {selected.season} · {selected.weather}</p>
              <div className="mt-2 grid grid-cols-2 gap-3">
                {selected.items.map((i) => (
                  <div key={i.name} className="overflow-hidden rounded-3xl bg-card shadow-card">
                    <div className="aspect-square bg-secondary">
                      <img src={i.photo} alt={i.name} className="h-full w-full object-cover" loading="lazy" />
                    </div>
                    <div className="p-3">
                      <p className="text-sm font-medium">{i.name}</p>
                      <p className="text-xs text-muted-foreground">{i.category}</p>
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
