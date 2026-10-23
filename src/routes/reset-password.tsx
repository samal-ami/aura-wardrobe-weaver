import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/reset-password")({
  head: () => ({ meta: [{ title: "AURA — Новый пароль" }, { name: "description", content: "Задайте новый пароль AURA" }, { property: "og:title", content: "AURA — Новый пароль" }, { property: "og:description", content: "Задайте новый пароль AURA" }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: Reset,
});

function Reset() {
  const nav = useNavigate();
  const [pw, setPw] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setMsg("");
    const { error } = await supabase.auth.updateUser({ password: pw });
    setBusy(false);
    if (error) setMsg(error.message);
    else { toast.success("Пароль обновлён"); void nav({ to: "/home" }); }
  }
  return (
    <div className="mx-auto min-h-screen max-w-md px-6 pt-16">
      <h1 className="text-center font-serif text-5xl tracking-[0.25em]">AURA</h1>
      <p className="mt-2 text-center text-muted-foreground">Придумайте новый пароль</p>
      <form onSubmit={submit} className="mt-10 space-y-3">
        <input className="field" type="password" required minLength={6} placeholder="Новый пароль" value={pw} onChange={(e) => setPw(e.target.value)} />
        {msg && <p className="text-sm text-destructive">{msg}</p>}
        <button className="btn-primary" disabled={busy}>{busy ? "Сохранение…" : "Сохранить пароль"}</button>
      </form>
    </div>
  );
}
