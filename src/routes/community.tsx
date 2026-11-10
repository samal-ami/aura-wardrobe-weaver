import { createFileRoute } from "@tanstack/react-router";
import { Heart, MessageCircle } from "lucide-react";
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
  comments: number;
};

const POSTS: Post[] = [
  { id: "1", user: "Mina", avatar: "#E2B2B8", image: look, caption: "Минимализм на каждый день", style: "Минимализм", likes: 142, comments: 8 },
  { id: "2", user: "Jisoo", avatar: "#2B2B2B", image: blazer, caption: "Оверсайз блейзер — база гардероба", style: "Business", likes: 89, comments: 3 },
  { id: "3", user: "Yuna", avatar: "#5B7DA8", image: welcome, caption: "Чистые линии и нейтральные тона", style: "Минимализм", likes: 203, comments: 15 },
  { id: "4", user: "Sora", avatar: "#8B5E3C", image: street, caption: "Street style осень 2026", style: "Street style", likes: 178, comments: 12 },
  { id: "5", user: "Hana", avatar: "#E2F0D9", image: tee, caption: "Белый топ + прямые джинсы", style: "Casual", likes: 95, comments: 4 },
  { id: "6", user: "Lee", avatar: "#D8C8B0", image: business, caption: "Деловой образ без усилий", style: "Business", likes: 156, comments: 7 },
  { id: "7", user: "Ara", avatar: "#E2B2B8", image: romantic, caption: "Романтичный образ на выходные", style: "Romantic", likes: 211, comments: 18 },
  { id: "8", user: "Kim", avatar: "#5B7DA8", image: jeans, caption: "Идеальные джинсы найдены", style: "Casual", likes: 67, comments: 2 },
];

function Community() {
  return (
    <AppShell title="Сообщество">
      <p className="-mt-2 mb-4 text-muted-foreground">Вдохновение и образы от сообщества</p>
      <div className="space-y-5">
        {POSTS.map((post) => (
          <div key={post.id} className="overflow-hidden rounded-[20px] bg-card shadow-card">
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
            <div className="flex items-center gap-4 p-4">
              <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Heart size={18} /> {post.likes}
              </span>
              <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <MessageCircle size={18} /> {post.comments}
              </span>
            </div>
            <p className="px-4 pb-4 text-sm text-foreground">{post.caption}</p>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
