import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import look from "@/assets/look.jpg";
import welcome from "@/assets/welcome.jpg";

export const Route = createFileRoute("/home")({
  head: () => ({ meta: [{ title: "AURA — Лента" }, { name: "description", content: "Вдохновение и популярные образы" }, { property: "og:title", content: "AURA — Лента" }, { property: "og:description", content: "Вдохновение и популярные образы" }] }),
  component: Home,
});

const popular = [
  { title: "Городской шик", img: look },
  { title: "Мягкий минимализм", img: welcome },
];

function Home() {
  return (
    <AppShell title="AURA">
      <section className="overflow-hidden rounded-[20px] bg-accent p-6">
        <p className="text-xs uppercase tracking-widest text-accent-foreground">Вдохновение недели</p>
        <h2 className="mt-2 font-serif text-3xl leading-tight">Осенние слои и тёплые оттенки</h2>
        <Link to="/outfit" className="mt-5 inline-block rounded-[20px] bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground">Смотреть подборку</Link>
      </section>
      <h3 className="mt-8 mb-4 font-serif text-2xl">Популярные образы</h3>
      <div className="grid grid-cols-2 gap-4">
        {popular.map((p) => (
          <Link to="/outfit" key={p.title} className="overflow-hidden rounded-[20px] bg-card">
            <img src={p.img} alt={p.title} loading="lazy" className="aspect-[3/4] w-full object-cover" />
            <p className="p-3 text-sm font-medium">{p.title}</p>
          </Link>
        ))}
      </div>
    </AppShell>
  );
}
