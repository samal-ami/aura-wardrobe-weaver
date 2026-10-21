import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "AURA — Вход" }, { name: "description", content: "Вход и регистрация в AURA" }, { property: "og:title", content: "AURA — Вход" }, { property: "og:description", content: "Вход и регистрация в AURA" }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] }),
  component: Auth,
});

export function Auth() {
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
      // Account creation is best-effort; entering the demo never waits for email confirmation or the network.
      void supabase.auth.signUp({ email, password, options: { data: { name }, emailRedirectTo: window.location.origin + "/home" } }).catch(() => undefined);
      demoSignIn();
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setMsg(error.message); else nav({ to: "/home" });
    }
    setBusy(false);
  }

  function demoSignIn() {
    localStorage.setItem("aura-demo-auth", "1");
    void nav({ to: "/home" });
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
        <Button type="submit" className="btn-primary mt-3 h-auto" disabled={busy}>{mode === "up" ? "Зарегистрироваться" : "Войти"}</Button>
      </form>
      <div className="my-6 text-center text-xs text-muted-foreground">или продолжить с</div>
      <div className="grid grid-cols-2 gap-3">
        {(["google", "apple"] as const).map((p) => (
          <Button type="button" variant="ghost" key={p} onClick={demoSignIn} className="h-auto rounded-[20px] bg-card py-3 text-sm capitalize">{p.charAt(0).toUpperCase() + p.slice(1)}</Button>
        ))}
      </div>
      <Button type="button" variant="ghost" onClick={() => setMode(mode === "up" ? "in" : "up")} className="mt-8 w-full text-sm text-muted-foreground">
        {mode === "up" ? "Уже есть аккаунт? Войти" : "Нет аккаунта? Регистрация"}
      </Button>
    </div>
  );
}
