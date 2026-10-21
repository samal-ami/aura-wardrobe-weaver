import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "AURA — Вход" }, { name: "description", content: "Вход и регистрация в AURA" }, { property: "og:title", content: "AURA — Вход" }, { property: "og:description", content: "Вход и регистрация в AURA" }] }),
  component: Auth,
});

function Auth() {
  const nav = useNavigate();
  const [mode, setMode] = useState<"in" | "up">("up");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setMsg("");
    if (mode === "up") {
      const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { name }, emailRedirectTo: window.location.origin + "/home" } });
      if (error && !/confirm|email|rate limit/i.test(error.message)) { setMsg(error.message); setBusy(false); return; }
      if (!data?.session) localStorage.setItem("aura-demo-auth", "1");
      nav({ to: "/home" });
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setMsg(error.message); else nav({ to: "/home" });
    }
    setBusy(false);
  }

  // Возврат с OAuth: провайдер не настроен — демо-вход; успех — клиент сам подхватил сессию
  useEffect(() => {
    const url = window.location.hash + window.location.search;
    if (/error=/.test(url) || /access_token=/.test(url)) {
      if (/error=/.test(url)) localStorage.setItem("aura-demo-auth", "1");
      window.history.replaceState(null, "", "/auth");
      nav({ to: "/home", replace: true });
    }
  }, [nav]);

  async function oauth(provider: "google" | "apple") {
    // Проверяем, настроен ли провайдер, через открытый endpoint настроек
    let enabled = false;
    try {
      const res = await fetch("https://kjkfqovwsppbgahzgkgx.supabase.co/auth/v1/settings", {
        headers: { apikey: "sb_publishable__dGeuURiWQfd-SYDSljwPw_AIpAT3z9" },
      });
      const settings = await res.json();
      enabled = Boolean(settings?.external?.[provider]);
    } catch { /* сеть недоступна — считаем, что не настроен */ }
    if (!enabled) {
      // Демо-вход, пока провайдер не настроен
      localStorage.setItem("aura-demo-auth", "1");
      nav({ to: "/home" });
      return;
    }
    const { error } = await supabase.auth.signInWithOAuth({ provider, options: { redirectTo: window.location.origin + "/auth" } });
    if (error) {
      localStorage.setItem("aura-demo-auth", "1");
      nav({ to: "/home" });
    }
  }

  return (
    <div className="mx-auto min-h-screen max-w-md px-6 pt-16 pb-10">
      <h1 className="text-center font-serif text-5xl tracking-[0.2em]">AURA</h1>
      <p className="mt-2 text-center text-muted-foreground">{mode === "up" ? "Создайте аккаунт" : "С возвращением"}</p>
      <form onSubmit={submit} className="mt-10 space-y-3">
        {mode === "up" && <input className="field" placeholder="Имя" value={name} onChange={(e) => setName(e.target.value)} />}
        <input className="field" type="email" required placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="field" type="password" required minLength={6} placeholder="Пароль" value={password} onChange={(e) => setPassword(e.target.value)} />
        {msg && <p className="text-sm text-muted-foreground">{msg}</p>}
        <button className="btn-primary mt-3" disabled={busy}>{mode === "up" ? "Зарегистрироваться" : "Войти"}</button>
      </form>
      <div className="my-6 text-center text-xs text-muted-foreground">или продолжить с</div>
      <div className="grid grid-cols-3 gap-3">
        {(["google", "apple"] as const).map((p) => (
          <button key={p} onClick={() => oauth(p)} className="rounded-[20px] bg-card py-3 text-sm capitalize">{p.charAt(0).toUpperCase() + p.slice(1)}</button>
        ))}
      </div>
      <button onClick={() => setMode(mode === "up" ? "in" : "up")} className="mt-8 w-full text-sm text-muted-foreground">
        {mode === "up" ? "Уже есть аккаунт? Войти" : "Нет аккаунта? Регистрация"}
      </button>
    </div>
  );
}
