import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight, Shirt, Sparkles, Heart, Settings, SlidersHorizontal } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import welcome from "@/assets/welcome.jpg";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "AURA — Профиль" }, { name: "description", content: "Ваш профиль в AURA" }, { property: "og:title", content: "AURA — Профиль" }, { property: "og:description", content: "Ваш профиль в AURA" }] }),
  component: Profile,
});

const menu = [
  { label: "Мой гардероб", to: "/wardrobe", icon: Shirt },
  { label: "Мои образы", to: "/outfits", icon: Sparkles },
  { label: "Избранное", to: "/outfit", icon: Heart },
  { label: "Мои предпочтения", to: "/preferences", icon: SlidersHorizontal },
  { label: "Настройки", to: "/settings", icon: Settings },
] as const;

function Profile() {
  return (
    <AppShell title="Профиль">
      <div className="flex flex-col items-center">
        <img src={welcome} alt="Asemay" className="h-24 w-24 rounded-full object-cover object-top ring-4 ring-primary" />
        <h2 className="mt-3 font-serif text-3xl">Asemay</h2>
      </div>
      <div className="mt-6 grid grid-cols-3 rounded-[20px] bg-card shadow-card py-4 text-center">
        {[["24", "Образы"], ["8", "Подборки"], ["132", "Подписки"]].map(([n, l]) => (
          <div key={l}><p className="font-serif text-2xl">{n}</p><p className="text-xs text-muted-foreground">{l}</p></div>
        ))}
      </div>
      <ul className="mt-6 space-y-2">
        {menu.map(({ label, to, icon: Icon }) => (
          <li key={label}>
            <Link to={to} className="flex items-center gap-4 rounded-[20px] bg-card shadow-card px-5 py-4">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-accent-foreground"><Icon size={18} /></span>
              <span className="flex-1">{label}</span><ChevronRight size={18} className="text-muted-foreground" />
            </Link>
          </li>
        ))}
      </ul>
    </AppShell>
  );
}
