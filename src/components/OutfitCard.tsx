import { Link } from "@tanstack/react-router";
import type { OutfitWithItems } from "@/lib/supabase";

/** Collage cover built from the outfit's own item photos. */
export function OutfitCover({ outfit, className = "" }: { outfit: OutfitWithItems; className?: string }) {
  const pics = outfit.items.slice(0, 4);
  return (
    <div className={`grid aspect-[3/4] grid-cols-2 gap-0.5 bg-secondary ${className}`}>
      {pics.map((i) => i.photo
        ? <img key={i.id} src={i.photo} alt={i.name} loading="lazy" className={`h-full w-full object-cover ${pics.length === 1 ? "col-span-2 row-span-2" : ""}`} />
        : <div key={i.id} className="h-full w-full" style={{ background: i.color_hex ?? undefined }} />)}
    </div>
  );
}

export function OutfitCard({ outfit }: { outfit: OutfitWithItems }) {
  return (
    <Link to="/outfit/$id" params={{ id: outfit.id }} className="overflow-hidden rounded-[20px] bg-card shadow-card transition active:scale-[0.98]">
      <OutfitCover outfit={outfit} />
      <div className="p-3">
        <p className="truncate text-sm font-medium">{outfit.title || "Без названия"}</p>
        <p className="text-xs text-muted-foreground">{outfit.items.length} вещ.</p>
      </div>
    </Link>
  );
}
