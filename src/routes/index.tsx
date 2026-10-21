import { createFileRoute, Link } from "@tanstack/react-router";
import welcome from "@/assets/welcome.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AURA — Добро пожаловать" },
      { name: "description", content: "Собирай образы из своего гардероба вместе с AURA." },
      { property: "og:title", content: "AURA — Добро пожаловать" },
      { property: "og:description", content: "Собирай образы из своего гардероба вместе с AURA." },
    ],
  }),
  component: Welcome,
});

function Welcome() {
  return (
    <div className="relative mx-auto flex min-h-screen max-w-md flex-col overflow-hidden bg-background">
      <img src={welcome} alt="AURA" width={768} height={1344} className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
      <div className="relative mt-auto px-8 pb-14 text-center">
        <h1 className="font-serif text-7xl tracking-[0.2em] text-foreground">AURA</h1>
        <p className="mt-3 text-muted-foreground">Твой стиль. Твой гардероб.</p>
        <Link to="/auth" className="btn-primary mt-10 block">Начать</Link>
      </div>
    </div>
  );
}
