import { Link, useNavigate, useRouter } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Home, Shirt, Plus, Sparkles, ChevronLeft, Loader2, Users, UserRound } from "lucide-react";
import { useEffect, type ReactNode } from "react";
import { useSession, fetchProfile } from "@/lib/supabase";

/** Client-side guard: inner screens need a real session, otherwise go to /auth. */
function AuthGate({ children }: { children: ReactNode }) {
  const { session, loading } = useSession();
  const nav = useNavigate();
  useEffect(() => { if (!loading && !session) void nav({ to: "/auth", replace: true }); }, [loading, session, nav]);
  if (loading || !session) return <Spinner />;
  return <>{children}</>;
}

export function Spinner({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-20 text-muted-foreground">
      <Loader2 className="animate-spin" size={24} />
      {label && <p className="text-sm">{label}</p>}
    </div>
  );
}

export function ErrorNote({ text, onRetry }: { text: string; onRetry?: () => void }) {
  return (
    <div className="rounded-[20px] bg-card p-5 text-center shadow-card">
      <p className="text-sm text-destructive">{text}</p>
      {onRetry && <button type="button" onClick={onRetry} className="mt-3 text-sm font-semibold underline">Повторить</button>}
    </div>
  );
}

export function Empty({ title, text, action }: { title: string; text: string; action?: ReactNode }) {
  return (
    <div className="mt-6 rounded-[20px] bg-card p-8 text-center shadow-card">
      <p className="font-serif text-2xl">{title}</p>
      <p className="mt-2 text-sm text-muted-foreground">{text}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function AppShell({ title, children, right, back }: { title?: string; children: ReactNode; right?: ReactNode; back?: boolean }) {
  const router = useRouter();
  const avatar = <HeaderAvatar />;
  return (
    <div className="mx-auto min-h-screen max-w-md bg-background pb-28">
      {back ? (
        <header className="sticky top-0 z-40 grid grid-cols-[40px_1fr_auto] items-center bg-background px-4 pt-6 pb-4">
          <button type="button" aria-label="Назад" onClick={() => (window.history.length > 1 ? router.history.back() : router.navigate({ to: "/home" }))} className="flex h-10 w-10 items-center justify-center rounded-full bg-card shadow-card text-foreground">
            <ChevronLeft size={22} />
          </button>
          <h1 className="text-center font-serif text-2xl text-foreground">{title}</h1>
          <div className="flex items-center gap-2">{right}{avatar}</div>
        </header>
      ) : title && (
        <header className="flex items-center justify-between px-6 pt-8 pb-4">
          <h1 className={`font-serif text-3xl text-foreground ${title === "AURA" ? "tracking-[0.25em]" : ""}`}>{title}</h1>
          <div className="flex items-center gap-2">{right}{avatar}</div>
        </header>
      )}
      <main className="px-6"><AuthGate>{children}</AuthGate></main>
      <BottomNav />
    </div>
  );
}

function HeaderAvatar() {
  const { data: profile } = useQuery({ queryKey: ["profile"], queryFn: fetchProfile });
  return (
    <Link to="/profile" aria-label="Профиль" className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-card shadow-card">
      {profile?.avatar ? <img src={profile.avatar} alt={profile.display_name ?? "Профиль"} className="h-full w-full object-cover" /> : <UserRound size={20} className="text-muted-foreground" />}
    </Link>
  );
}

function BottomNav() {
  const baseItem = "flex flex-col items-center gap-1 text-[11px] text-muted-foreground transition-colors";
  const activeItem = "text-foreground font-medium";
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 mx-auto max-w-md border-t border-border bg-card px-4 pt-2 pb-5">
      <div className="flex items-end justify-between">
        <Link to="/home" className={baseItem} activeProps={{ className: activeItem }}><Home size={22} />Главная</Link>
        <Link to="/wardrobe" className={baseItem} activeProps={{ className: activeItem }}><Shirt size={22} />Гардероб</Link>
        <Link to="/add" aria-label="Добавить" className="-mt-6 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-soft transition active:scale-95">
          <Plus size={26} />
        </Link>
        <Link to="/outfits" className={baseItem} activeProps={{ className: activeItem }}><Sparkles size={22} />Образы</Link>
        <Link to="/community" className={baseItem} activeProps={{ className: activeItem }}><Users size={22} />Сообщество</Link>
      </div>
    </nav>
  );
}

export function Chip({ active, children, onClick }: { active?: boolean | undefined; children: ReactNode; onClick?: (() => void) | undefined }) {
  return (
    <button type="button" aria-pressed={!!active} onClick={onClick} className={`whitespace-nowrap rounded-full px-4 py-2 text-sm transition active:scale-95 ${active ? "bg-primary text-primary-foreground" : "bg-card text-foreground"}`}>
      {children}
    </button>
  );
}

export function ItemTile({ name, brand, color, image, selected, onClick }: { name: string; brand?: string | null | undefined; color?: string | null | undefined; image?: string | null | undefined; selected?: boolean; onClick?: () => void }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={selected} className={`overflow-hidden rounded-[20px] bg-card shadow-card text-left transition active:scale-[0.98] ${selected ? "ring-2 ring-primary" : ""}`}>
      <div className="flex aspect-square items-center justify-center bg-secondary">
        {image ? <img src={image} alt={name} className="h-full w-full object-cover" loading="lazy" /> : <div className="h-16 w-16 rounded-full border border-border" style={color ? { background: color } : {}} />}
      </div>
      <div className="p-3">
        <p className="truncate text-sm font-medium text-foreground">{name}</p>
        {brand && <p className="truncate text-xs uppercase tracking-wide text-muted-foreground">{brand}</p>}
      </div>
    </button>
  );
}

export function Toggle({ label, on, onChange }: { label: string; on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" role="switch" aria-checked={on} onClick={() => onChange(!on)} className="flex w-full items-center justify-between rounded-[20px] bg-card px-5 py-4 shadow-card">
      {label}
      <span className={`relative h-7 w-12 rounded-full transition ${on ? "bg-primary" : "bg-secondary"}`}>
        <span className={`absolute top-1 h-5 w-5 rounded-full bg-card shadow-card transition-all ${on ? "left-6" : "left-1"}`} />
      </span>
    </button>
  );
}
