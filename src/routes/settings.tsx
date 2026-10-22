import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "AURA — Настройки" }, { name: "description", content: "Настройки приложения AURA" }, { property: "og:title", content: "AURA — Настройки" }, { property: "og:description", content: "Настройки приложения AURA" }] }),
  component: Settings,
});

const OPTS = ["Уведомления", "Ежедневные подборки", "Приватный профиль"];

function Settings() {
  const [on, setOn] = useState<string[]>(["Уведомления"]);
  return (
    <AppShell title="Настройки" back>
      <div className="space-y-2">
        {OPTS.map((o) => {
          const a = on.includes(o);
          return (
            <button key={o} type="button" role="switch" aria-checked={a} onClick={() => setOn((p) => (a ? p.filter((x) => x !== o) : [...p, o]))} className="flex w-full items-center justify-between rounded-[20px] bg-card px-5 py-4 shadow-card">
              {o}
              <span className={`relative h-7 w-12 rounded-full transition ${a ? "bg-primary" : "bg-secondary"}`}>
                <span className={`absolute top-1 h-5 w-5 rounded-full bg-card shadow-card transition-all ${a ? "left-6" : "left-1"}`} />
              </span>
            </button>
          );
        })}
      </div>
    </AppShell>
  );
}
