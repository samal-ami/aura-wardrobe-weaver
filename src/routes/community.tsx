import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { Bookmark, Heart, MessageCircle, Send } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import look from "@/assets/look.jpg";
import welcome from "@/assets/welcome.jpg";
import jeans from "@/assets/item-jeans.jpg";
import blazer from "@/assets/item-blazer.jpg";
import tee from "@/assets/item-tee.jpg";
import street from "@/assets/style-street.jpg";
import business from "@/assets/style-business.jpg";
import romantic from "@/assets/style-romantic.jpg";

export const Route = createFileRoute("/community")({
  head: () => ({
    meta: [
      { title: "AURA — Сообщество" },
      { name: "description", content: "Образы и вдохновение от сообщества AURA" },
      { property: "og:title", content: "AURA — Сообщество" },
      { property: "og:description", content: "Образы и вдохновение от сообщества AURA" },
    ],
  }),
  component: Community,
});

type Post = {
  id: string;
  user: string;
  avatar: string;
  image: string;
  caption: string;
  style: string;
  likes: number;
};

type Comment = { id: string; author: string; text: string };

type CommunityState = {
  liked: string[];
  saved: string[];
  comments: Record<string, Comment[]>;
};

const STORAGE_KEY = "aura:community";
const EMPTY_STATE: CommunityState = { liked: [], saved: [], comments: {} };
const MY_NAME = "Вы";

const POSTS: Post[] = [
  { id: "1", user: "Mina", avatar: "#E2B2B8", image: look, caption: "Минимализм на каждый день", style: "Минимализм", likes: 142 },
  { id: "2", user: "Jisoo", avatar: "#2B2B2B", image: blazer, caption: "Оверсайз блейзер — база гардероба", style: "Business", likes: 89 },
  { id: "3", user: "Yuna", avatar: "#5B7DA8", image: welcome, caption: "Чистые линии и нейтральные тона", style: "Минимализм", likes: 203 },
  { id: "4", user: "Sora", avatar: "#8B5E3C", image: street, caption: "Street style осень 2026", style: "Street style", likes: 178 },
  { id: "5", user: "Hana", avatar: "#E2F0D9", image: tee, caption: "Белый топ + прямые джинсы", style: "Casual", likes: 95 },
  { id: "6", user: "Lee", avatar: "#D8C8B0", image: business, caption: "Деловой образ без усилий", style: "Business", likes: 156 },
  { id: "7", user: "Ara", avatar: "#E2B2B8", image: romantic, caption: "Романтичный образ на выходные", style: "Romantic", likes: 211 },
  { id: "8", user: "Kim", avatar: "#5B7DA8", image: jeans, caption: "Идеальные джинсы найдены", style: "Casual", likes: 67 },
];

function readState(): CommunityState {
  if (typeof window === "undefined") return EMPTY_STATE;
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? { ...EMPTY_STATE, ...(JSON.parse(raw) as Partial<CommunityState>) } : EMPTY_STATE;
}

function useCommunityState() {
  const [state, setState] = useState<CommunityState>(EMPTY_STATE);
  const [ready, setReady] = useState(false);
  useEffect(() => { setState(readState()); setReady(true); }, []);
  useEffect(() => {
    if (ready) localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state, ready]);
  return [state, setState] as const;
}

function toggle(list: string[], id: string) {
  return list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
}

function Community() {
  const [state, setState] = useCommunityState();
  const [openComments, setOpenComments] = useState<string | null>(null);

  function toggleLike(id: string) {
    setState((s) => ({ ...s, liked: toggle(s.liked, id) }));
  }

  function toggleSave(id: string) {
    const nowSaved = !state.saved.includes(id);
    setState((s) => ({ ...s, saved: toggle(s.saved, id) }));
    toast.success(nowSaved ? "Сохранено в избранное" : "Удалено из избранного");
  }

  function addComment(postId: string, text: string) {
    const comment: Comment = { id: crypto.randomUUID(), author: MY_NAME, text };
    setState((s) => ({ ...s, comments: { ...s.comments, [postId]: [...(s.comments[postId] ?? []), comment] } }));
  }

  return (
    <AppShell title="Сообщество">
      <p className="-mt-2 mb-4 text-muted-foreground">Вдохновение и образы от сообщества</p>
      <div className="space-y-5">
        {POSTS.map((post) => {
          const liked = state.liked.includes(post.id);
          const saved = state.saved.includes(post.id);
          const comments = state.comments[post.id] ?? [];
          const isOpen = openComments === post.id;
          return (
            <article key={post.id} className="overflow-hidden rounded-3xl bg-card shadow-card">
              <div className="flex items-center gap-3 p-4">
                <span className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-medium text-white" style={{ background: post.avatar }}>
                  {post.user[0]}
                </span>
                <div>
                  <p className="text-sm font-medium text-foreground">{post.user}</p>
                  <p className="text-xs text-muted-foreground">{post.style}</p>
                </div>
              </div>
              <img src={post.image} alt={post.caption} className="aspect-[4/5] w-full object-cover" loading="lazy" />
              <div className="flex items-center gap-2 px-3 pt-3">
                <button
                  type="button"
                  aria-label={liked ? "Убрать лайк" : "Поставить лайк"}
                  aria-pressed={liked}
                  onClick={() => toggleLike(post.id)}
                  className={`flex items-center gap-1.5 rounded-full px-3 py-2 text-sm transition active:scale-90 ${liked ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground hover:bg-accent"}`}
                >
                  <Heart size={18} className={liked ? "fill-current" : ""} />
                  {post.likes + (liked ? 1 : 0)}
                </button>
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setOpenComments(isOpen ? null : post.id)}
                  className={`flex items-center gap-1.5 rounded-full px-3 py-2 text-sm transition active:scale-90 ${isOpen ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground hover:bg-accent"}`}
                >
                  <MessageCircle size={18} />
                  {comments.length}
                </button>
                <button
                  type="button"
                  aria-label={saved ? "Удалить из избранного" : "Сохранить в избранное"}
                  aria-pressed={saved}
                  onClick={() => toggleSave(post.id)}
                  className={`ml-auto flex h-10 w-10 items-center justify-center rounded-full transition active:scale-90 ${saved ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground hover:bg-accent"}`}
                >
                  <Bookmark size={18} className={saved ? "fill-current" : ""} />
                </button>
              </div>
              <p className="px-4 pt-3 pb-4 text-sm text-foreground">{post.caption}</p>
              {isOpen && (
                <CommentSection comments={comments} onSubmit={(text) => addComment(post.id, text)} />
              )}
            </article>
          );
        })}
      </div>
    </AppShell>
  );
}

function CommentSection({ comments, onSubmit }: { comments: Comment[]; onSubmit: (text: string) => void }) {
  const [text, setText] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
    setText("");
  }

  return (
    <div className="border-t border-border px-4 py-4">
      {comments.length === 0 ? (
        <p className="text-sm text-muted-foreground">Пока нет комментариев. Будьте первым.</p>
      ) : (
        <ul className="space-y-3">
          {comments.map((c) => (
            <li key={c.id} className="text-sm">
              <span className="font-medium text-foreground">{c.author}</span>{" "}
              <span className="text-foreground">{c.text}</span>
            </li>
          ))}
        </ul>
      )}
      <form onSubmit={handleSubmit} className="mt-4 flex items-center gap-2">
        <input
          className="field flex-1"
          placeholder="Написать комментарий"
          value={text}
          maxLength={300}
          onChange={(e) => setText(e.target.value)}
          aria-label="Комментарий"
        />
        <button
          type="submit"
          aria-label="Отправить комментарий"
          disabled={!text.trim()}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-primary-foreground transition active:scale-90 disabled:opacity-40"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}
