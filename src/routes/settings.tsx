import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { LogOut } from "lucide-react";
import { toast } from "sonner";
import { AppShell, ErrorNote, Spinner, Toggle } from "@/components/AppShell";
import { fetchSettings, saveSettings, supabase, type Settings as S } from "@/lib/supabase";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "AURA — Настройки" }, { name: "description", content: "Настройки приложения AURA" }, { property: "og:title", content: "AURA — Настройки" }, { property: "og:description", content: "Настройки приложения AURA" }] }),
  component: Settings,
});

const OPTS: [keyof S, string][] = [["notifications_enabled", "Уведомления"], ["daily_outfits_enabled", "Ежедневные подборки"], ["private_profile", "Приватный профиль"]];

function Settings() {
  const qc = useQueryClient();
  const nav = useNavigate();
  const { data, isLoading, error, refetch } = useQuery({ queryKey: ["settings"], queryFn: fetchSettings });

  async function change(k: keyof S, v: boolean) {
    const next = { ...data!, [k]: v };
    qc.setQueryData(["settings"], next);
    try { await saveSettings(next); toast.success("Сохранено"); }
    catch (e) { qc.setQueryData(["settings"], data); toast.error((e as Error).message); }
  }
  async function signOut() {
    await qc.cancelQueries(); qc.clear();
    await supabase.auth.signOut();
    void nav({ to: "/auth", search: { mode: "in" }, replace: true });
  }

  return (
    <AppShell title="Настройки" back>
      {isLoading ? <Spinner /> : error ? <ErrorNote text={(error as Error).message} onRetry={() => refetch()} /> : (
        <div className="space-y-2">{OPTS.map(([k, l]) => <Toggle key={k} label={l} on={data![k]} onChange={(v) => change(k, v)} />)}</div>
      )}
      <button type="button" onClick={signOut} className="mt-8 flex w-full items-center justify-center gap-2 rounded-[20px] bg-card py-4 text-destructive shadow-card"><LogOut size={18} />Выйти из аккаунта</button>
    </AppShell>
  );
}
