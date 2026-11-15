import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { ImagePlus, Send, X } from "lucide-react";
import { AppShell, Chip, Spinner, ErrorNote } from "@/components/AppShell";
import { fetchItems } from "@/lib/supabase";
import { WEATHER_OPTIONS, buildOutfits, describeOutfit, photoReply, replyTo, type StylistReply, type Weather } from "@/lib/stylist";

export const Route = createFileRoute("/stylist")({
  head: () => ({
    meta: [
      { title: "AURA — AI Стилист" },
      { name: "description", content: "Советы по стилю и образы из вашего гардероба" },
    ],
  }),
  component: StylistPage,
});

type Message = {
  id: number;
  role: "user" | "assistant";
  text: string;
  photo?: string;
  outfits?: { name: string; photos: (string | null)[] }[];
};

const CHAT_KEY = "aura:stylist-chat";

function loadChat(): Message[] {
  try {
    const raw = localStorage.getItem(CHAT_KEY);
    const parsed = raw ? (JSON.parse(raw) as Message[]) : null;
    return parsed && parsed.length > 0 ? parsed : [GREETING];
  } catch {
    return [GREETING];
  }
}

const QUICK_PROMPTS = ["Что надеть сегодня?", "Собрать образ из гардероба", "Совет по стилю"];
const GREETING: Message = {
  id: 0,
  role: "assistant",
  text: "Привет! Я AI-стилист AURA. Подберу образы из вашего гардероба с учётом погоды, цветов и стиля. Выберите погоду и напишите вопрос или нажмите подсказку.",
};

function StylistPage() {
  const { data: items = [], isLoading, isError, refetch } = useQuery({ queryKey: ["items"], queryFn: fetchItems });
  const [messages, setMessages] = useState<Message[]>(loadChat);
  const [input, setInput] = useState("");
  const [weather, setWeather] = useState<Weather>("Прохладно");
  const [thinking, setThinking] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const nextId = useRef(Date.now());

  useEffect(() => {
    const forStorage = messages.map(({ photo: _photo, ...rest }) => rest);
    localStorage.setItem(CHAT_KEY, JSON.stringify(forStorage));
  }, [messages]);

  const toMessage = (reply: StylistReply): Message => {
    const outfits = reply.outfits?.map((o) => ({ name: describeOutfit(o), photos: o.map((i) => i.photo ?? null) }));
    return { id: nextId.current++, role: "assistant", text: reply.text, ...(outfits ? { outfits } : {}) };
  };

  const send = (text: string) => {
    const clean = text.trim();
    if ((!clean && !photo) || thinking) return;
    const userMsg: Message = { id: nextId.current++, role: "user", text: clean || "Фото вещи", ...(photo ? { photo } : {}) };
    const replies = clean ? [replyTo(clean, items, weather)] : [];
    if (photo) replies.push(photoReply());
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setPhoto(null);
    if (fileRef.current) fileRef.current.value = "";
    setThinking(true);
    window.setTimeout(() => {
      setMessages((m) => [...m, ...replies.map(toMessage)]);
      setThinking(false);
    }, 600);
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    send(input);
  };

  const onFile = (file: File | undefined) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPhoto(typeof reader.result === "string" ? reader.result : null);
    reader.readAsDataURL(file);
  };

  return (
    <AppShell title="AI Стилист">
      <div className="flex flex-col gap-4 pb-40">
        <div className="flex flex-wrap gap-2">
          {WEATHER_OPTIONS.map((w) => (
            <Chip key={w} active={weather === w} onClick={() => setWeather(w)}>{w}</Chip>
          ))}
        </div>

        {isLoading && <Spinner />}
        {isError && <ErrorNote text="Не удалось загрузить гардероб" onRetry={() => refetch()} />}

        <div className="flex flex-col gap-3">
          {messages.map((m) => (
            <div key={m.id} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
              <div
                className={
                  m.role === "user"
                    ? "max-w-[80%] rounded-3xl rounded-br-md bg-[#1A1A1A] px-4 py-3 text-sm text-white"
                    : "max-w-[85%] rounded-3xl rounded-bl-md bg-[#F8E8EE] px-4 py-3 text-sm leading-relaxed text-[#1A1A1A]"
                }
              >
                {m.photo && <img src={m.photo} alt="" className="mb-2 h-32 w-24 rounded-2xl object-cover" />}
                <p>{m.text}</p>
                {m.outfits?.map((o, idx) => (
                  <div key={idx} className="mt-3 rounded-2xl bg-white p-3">
                    <p className="mb-2 text-xs font-medium text-[#1A1A1A]">Образ {idx + 1}</p>
                    <div className="grid grid-cols-4 gap-2">
                      {o.photos.map((src, i) => (
                        <div key={i} className="aspect-[3/4] overflow-hidden rounded-xl bg-[#F8E8EE]">
                          {src && <img src={src} alt="" className="h-full w-full object-cover" />}
                        </div>
                      ))}
                    </div>
                    <p className="mt-2 text-xs text-[#555]">{o.name}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {thinking && (
            <div className="flex justify-start">
              <div className="rounded-3xl rounded-bl-md bg-[#F8E8EE] px-4 py-3 text-sm text-[#1A1A1A]">Стилист думает…</div>
            </div>
          )}
        </div>

        {!isLoading && items.length === 0 && (
          <p className="text-center text-sm text-[#555]">В гардеробе пока нет вещей. Добавьте их, и стилист начнёт собирать образы.</p>
        )}
      </div>

      <div className="fixed inset-x-0 bottom-20 z-30 mx-auto w-full max-w-md border-t border-[#F2D7E0] bg-white px-4 pb-3 pt-3">
        <div className="mb-2 flex gap-2 overflow-x-auto">
          {QUICK_PROMPTS.map((p) => (
            <Chip key={p} onClick={() => send(p)}>{p}</Chip>
          ))}
        </div>
        {photo && (
          <div className="mb-2 flex items-center gap-2">
            <img src={photo} alt="" className="h-12 w-10 rounded-lg object-cover" />
            <button type="button" onClick={() => setPhoto(null)} className="rounded-full p-1 text-[#555] transition-colors hover:bg-[#F8E8EE]" aria-label="Убрать фото">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
        <form onSubmit={onSubmit} className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#E8B4BC] text-[#1A1A1A] transition-colors duration-200 hover:bg-[#F8E8EE] active:scale-95"
            aria-label="Загрузить фото вещи"
          >
            <ImagePlus className="h-5 w-5" />
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Спросите стилиста"
            className="h-11 min-w-0 flex-1 rounded-full border border-[#E8B4BC] bg-white px-4 text-sm outline-none focus:border-[#1A1A1A]"
          />
          <button
            type="submit"
            disabled={thinking || (!input.trim() && !photo)}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#1A1A1A] text-white transition-colors duration-200 hover:bg-[#333] active:scale-95 disabled:opacity-40"
            aria-label="Отправить"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </AppShell>
  );
}
