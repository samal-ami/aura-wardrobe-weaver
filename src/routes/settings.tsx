import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { LogOut } from "lucide-react";
import { toast } from "sonner";
import { AppShell, Chip, ErrorNote, Spinner, Toggle } from "@/components/AppShell";
import { LOCALES, useI18n } from "@/lib/i18n";
import type { MessageKey } from "@/lib/i18n/ru";
import { fetchSettings, saveSettings, supabase, demoSignOut, type Settings as S } from "@/lib/supabase";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "AURA — Settings" }, { name: "description", content: "AURA app settings" }, { property: "og:title", content: "AURA — Settings" }, { property: "og:description", content: "AURA app settings" }] }),
  component: Settings,
});

const OPTS: [keyof S, MessageKey][] = [
  ["notifications_enabled", "settings.notifications"],
  ["daily_outfits_enabled", "settings.dailyOutfits"],
  ["private_profile", "settings.privateProfile"],
];

function Settings() {
  const { t, locale, setLocale } = useI18n();
  const qc = useQueryClient();
  const nav = useNavigate();
  const { data, isLoading, error, refetch } = useQuery({ queryKey: ["settings"], queryFn: fetchSettings });

  async function change(k: keyof S, v: boolean) {
    const next = { ...data!, [k]: v };
    qc.setQueryData(["settings"], next);
    try { await saveSettings(next); toast.success(t("common.saved")); }
    catch (e) { qc.setQueryData(["settings"], data); toast.error((e as Error).message); }
  }
  async function signOut() {
    await qc.cancelQueries(); qc.clear();
    demoSignOut();
    await supabase.auth.signOut();
    void nav({ to: "/auth", search: { mode: "in" }, replace: true });
  }

  return (
    <AppShell title={t("settings.title")} back>
      <section className="mb-6 flex flex-col gap-3">
        <p className="text-sm font-medium text-[#1A1A1A]">{t("settings.language")}</p>
        <div className="flex flex-wrap gap-2" role="group" aria-label={t("settings.language")}>
          {LOCALES.map((l) => (
            <Chip key={l} active={locale === l} onClick={() => setLocale(l)}>{t(`lang.${l}`)}</Chip>
          ))}
        </div>
      </section>

      {isLoading ? <Spinner /> : error ? <ErrorNote text={(error as Error).message} onRetry={() => refetch()} /> : (
        <div className="space-y-2">{OPTS.map(([k, key]) => <Toggle key={k} label={t(key)} on={data![k]} onChange={(v) => change(k, v)} />)}</div>
      )}
      <button type="button" onClick={signOut} className="mt-8 flex w-full items-center justify-center gap-2 rounded-[20px] bg-card py-4 text-destructive shadow-card"><LogOut size={18} />{t("settings.signOut")}</button>
    </AppShell>
  );
}
