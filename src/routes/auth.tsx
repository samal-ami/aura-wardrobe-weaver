import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";

type Mode = "in" | "up" | "forgot";

export const Route = createFileRoute("/auth")({
  validateSearch: (s: Record<string, unknown>): { mode?: Mode } => (s["mode"] === "in" || s["mode"] === "forgot" ? { mode: s["mode"] } : {}),
  head: () => ({ meta: [{ title: "AURA — Вход" }, { name: "description", content: "Вход и регистрация в AURA" }, { property: "og:title", content: "AURA — Вход" }, { property: "og:description", content: "Вход и регистрация в AURA" }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] }),
  component: Auth,
});

const RU: Record<string, string> = {
  "Invalid login credentials": "Неверный email или пароль",
  "User already registered": "Такой email уже зарегистрирован — войдите",
  "Email not confirmed": "Подтвердите email по ссылке из письма",
};
const ru = (m: string) => RU[m] ?? m;

export function Auth() {
  const nav = useNavigate();
  const search = Route.useSearch();
  const [mode, setMode] = useState<Mode>(search.mode ?? "up");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [msg, setMsg] = useState("");
  const [info, setInfo] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { if (data.session) void nav({ to: "/home", replace: true }); });
  }, [nav]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(""); setInfo("");
    if (mode === "up" && password !== confirm) return setMsg("Пароли не совпадают");
    setBusy(true);
    try {
      if (mode === "up") {
        const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { name: name.trim() || "Asemay" }, emailRedirectTo: window.location.origin + "/home" } });
        if (error) return setMsg(ru(error.message));
        if (data.session) { toast.success("Добро пожаловать в AURA!"); void nav({ to: "/home" }); }
        else { setInfo("Мы отправили письмо на " + email + ". Подтвердите email и войдите."); setMode("in"); }
      } else if (mode === "in") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) return setMsg(ru(error.message));
        void nav({ to: "/home" });
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin + "/reset-password" });
        if (error) return setMsg(ru(error.message));
        setInfo("Ссылка для смены пароля отправлена на " + email);
      }
    } finally { setBusy(false); }
  }

  async function oauth(provider: "google" | "apple") {
    setMsg("");
    const { error } = await supabase.auth.signInWithOAuth({ provider, options: { redirectTo: window.location.origin + "/home" } });
    if (error) setMsg(`Вход через ${provider === "google" ? "Google" : "Apple"} пока не включён в настройках проекта`);
  }

  return (
    <div className="mx-auto min-h-screen max-w-md px-6 pt-16 pb-10">
      <h1 className="text-center font-serif text-5xl tracking-[0.25em]">AURA</h1>
      <p className="mt-2 text-center text-muted-foreground">{mode === "up" ? "Создайте аккаунт" : mode === "in" ? "С возвращением" : "Восстановление пароля"}</p>
      <form onSubmit={submit} className="mt-10 space-y-3">
        {mode === "up" && <input className="field" placeholder="Имя" aria-label="Имя" value={name} onChange={(e) => setName(e.target.value)} />}
        <input className="field" type="email" required placeholder="Email" aria-label="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        {mode !== "forgot" && (
          <div className="relative">
            <input className="field pr-12" type={show ? "text" : "password"} required minLength={6} placeholder="Пароль" aria-label="Пароль" value={password} onChange={(e) => setPassword(e.target.value)} />
            <button type="button" aria-label={show ? "Скрыть пароль" : "Показать пароль"} onClick={() => setShow(!show)} className="absolute top-1/2 right-4 -translate-y-1/2 text-muted-foreground">{show ? <EyeOff size={18} /> : <Eye size={18} />}</button>
          </div>
        )}
        {mode === "up" && <input className="field" type={show ? "text" : "password"} required minLength={6} placeholder="Повторите пароль" aria-label="Повторите пароль" value={confirm} onChange={(e) => setConfirm(e.target.value)} />}
        {mode === "in" && <button type="button" onClick={() => { setMode("forgot"); setMsg(""); }} className="text-sm text-muted-foreground underline">Забыли пароль?</button>}
        {msg && <p role="alert" className="text-sm text-destructive">{msg}</p>}
        {info && <p className="rounded-[20px] bg-accent p-3 text-sm text-accent-foreground">{info}</p>}
        <Button type="submit" className="btn-primary mt-3 h-auto" disabled={busy}>
          {busy ? "Подождите…" : mode === "up" ? "Зарегистрироваться" : mode === "in" ? "Войти" : "Отправить ссылку"}
        </Button>
      </form>
      {mode !== "forgot" && (
        <>
          <div className="my-6 text-center text-xs text-muted-foreground">или продолжить с</div>
          <div className="grid grid-cols-2 gap-3">
            <Button type="button" variant="ghost" onClick={() => oauth("google")} className="h-auto rounded-[20px] bg-card py-3 text-sm shadow-card">Google</Button>
            <Button type="button" variant="ghost" onClick={() => oauth("apple")} className="h-auto rounded-[20px] bg-card py-3 text-sm shadow-card">Apple</Button>
          </div>
        </>
      )}
      <Button type="button" variant="ghost" onClick={() => { setMode(mode === "up" ? "in" : "up"); setMsg(""); }} className="mt-8 w-full text-sm text-muted-foreground">
        {mode === "up" ? "Уже есть аккаунт? Войти" : "Нет аккаунта? Регистрация"}
      </Button>
    </div>
  );
}
