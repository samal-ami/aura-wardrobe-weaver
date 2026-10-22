import { Link, useRouter } from "@tanstack/react-router";
import { Home, Shirt, Plus, Sparkles, User, ChevronLeft } from "lucide-react";
import type { ReactNode } from "react";

export function AppShell({ title, children, right, back }: { title?: string; children: ReactNode; right?: ReactNode; back?: boolean }) {
  const router = useRouter();
  return (
    <div className="mx-auto min-h-screen max-w-md bg-background pb-28">
      {back ? (
        <header className="sticky top-0 z-40 grid grid-cols-[40px_1fr_40px] items-center bg-background px-4 pt-6 pb-4">
          <button type="button" aria-label="Назад" onClick={() => (window.history.length > 1 ? router.history.back() : router.navigate({ to: "/home" }))} className="flex h-10 w-10 items-center justify-center rounded-full bg-card shadow-card text-foreground">
            <ChevronLeft size={22} />
          </button>
          <h1 className="text-center font-serif text-2xl text-foreground">{title}</h1>
          <div className="flex justify-end">{right}</div>
        </header>
      ) : title && (
        <header className="flex items-center justify-between px-6 pt-8 pb-4">
          <h1 className="font-serif text-3xl text-foreground">{title}</h1>
          {right}
        </header>
      )}
      <main className="px-6">{children}</main>
      <BottomNav />
    </div>
  );
}

function BottomNav() {
  const item = "flex flex-col items-center gap-1 text-[11px] text-muted-foreground";
  const active = { className: "text-foreground" };
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 mx-auto max-w-md border-t border-border bg-card px-4 pt-2 pb-5">
      <div className="flex items-end justify-between">
        <Link to="/home" className={item} activeProps={active}><Home size={22} />Главная</Link>
        <Link to="/wardrobe" className={item} activeProps={active}><Shirt size={22} />Гардероб</Link>
        <Link to="/add" aria-label="Добавить" className="-mt-6 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-soft">
          <Plus size={26} />
        </Link>
        <Link to="/outfits" className={item} activeProps={active}><Sparkles size={22} />Образы</Link>
        <Link to="/profile" className={item} activeProps={active}><User size={22} />Профиль</Link>
      </div>
    </nav>
  );
}

export function Chip({ active, children, onClick }: { active?: boolean | undefined; children: ReactNode; onClick?: (() => void) | undefined }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`whitespace-nowrap rounded-full px-4 py-2 text-sm transition ${active ? "bg-primary text-primary-foreground" : "bg-card text-foreground"}`}
    >
      {children}
    </button>
  );
}

export function ItemTile({ name, brand, color, image, selected, onClick }: { name: string; brand?: string | null | undefined; color?: string | null | undefined; image?: string | null | undefined; selected?: boolean; onClick?: () => void }) {
  return (
    <button type="button" onClick={onClick} className={`overflow-hidden rounded-[20px] bg-card shadow-card text-left transition ${selected ? "ring-2 ring-primary" : ""}`}>
      <div className="flex aspect-square items-center justify-center bg-secondary">
        {image ? (
          <img src={image} alt={name} className="h-full w-full object-cover" loading="lazy" />
        ) : (
          <div className="h-16 w-16 rounded-full border border-border" style={color ? { background: color } : {}} />
        )}
      </div>
      <div className="p-3">
        <p className="text-sm font-medium text-foreground">{name}</p>
        {brand && <p className="text-xs uppercase tracking-wide text-muted-foreground">{brand}</p>}
      </div>
    </button>
  );
}
