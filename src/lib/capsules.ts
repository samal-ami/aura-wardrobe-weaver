import itemBlazer from "@/assets/item-blazer.jpg";
import itemJeans from "@/assets/item-jeans.jpg";
import itemLoafers from "@/assets/item-loafers.jpg";
import itemBag from "@/assets/item-bag.jpg";
import itemTee from "@/assets/item-tee.jpg";

const shirtPhoto = "https://images.pexels.com/photos/6276012/pexels-photo-6276012.jpeg?auto=compress&cs=tinysrgb&h=650&w=940";
const trenchPhoto = "https://images.pexels.com/photos/4456724/pexels-photo-4456724.jpeg?auto=compress&cs=tinysrgb&h=650&w=940";

export const CAPSULE_STYLES = ["Минимализм", "Casual", "Old Money", "Офис"] as const;
export const CAPSULE_SEASONS = ["Весна", "Лето", "Осень", "Зима"] as const;
export const CAPSULE_WEATHER = ["Солнечно", "Дождь", "Холодно"] as const;

export type CapsuleStyle = (typeof CAPSULE_STYLES)[number];
export type CapsuleSeason = (typeof CAPSULE_SEASONS)[number];
export type CapsuleWeather = (typeof CAPSULE_WEATHER)[number];

export type CapsuleItem = { name: string; category: string; photo: string };

export type Capsule = {
  id: string;
  title: string;
  description: string;
  style: CapsuleStyle;
  season: CapsuleSeason;
  weather: CapsuleWeather;
  items: CapsuleItem[];
};

const blazer: CapsuleItem = { name: "Блейзер оверсайз", category: "Верх", photo: itemBlazer };
const shirt: CapsuleItem = { name: "Белая рубашка", category: "Верх", photo: shirtPhoto };
const trench: CapsuleItem = { name: "Бежевый тренч", category: "Верх", photo: trenchPhoto };
const tee: CapsuleItem = { name: "Белый топ", category: "Верх", photo: itemTee };
const jeans: CapsuleItem = { name: "Прямые джинсы", category: "Низ", photo: itemJeans };
const loafers: CapsuleItem = { name: "Лоферы", category: "Обувь", photo: itemLoafers };
const bag: CapsuleItem = { name: "Структурированная сумка", category: "Аксессуары", photo: itemBag };

export const CAPSULES: Capsule[] = [
  { id: "atyrau-winter", title: "Atyrau Winter Edit", description: "Тёплый слой поверх базовых вещей: пальто, блейзер и сумка для холодных дней.", style: "Минимализм", season: "Зима", weather: "Холодно", items: [trench, blazer, jeans, loafers, bag] },
  { id: "office-clean", title: "Офис без лишнего", description: "Чистые линии и нейтральные тона для рабочего дня без строгого дресс-кода.", style: "Офис", season: "Осень", weather: "Солнечно", items: [blazer, shirt, jeans, loafers] },
  { id: "casual-summer", title: "Летний casual", description: "Лёгкий белый топ, джинсы и лоферы для прогулок и кофе с друзьями.", style: "Casual", season: "Лето", weather: "Солнечно", items: [tee, jeans, loafers] },
  { id: "old-money-evening", title: "Old Money вечер", description: "Рубашка, тренч и сумка: сдержанная роскошь для ужина и театра.", style: "Old Money", season: "Осень", weather: "Холодно", items: [shirt, trench, bag] },
  { id: "spring-trench", title: "Весенний тренч", description: "Тренч и джинсы спасают в переменчивую погоду, а сумка добавляет характер.", style: "Минимализм", season: "Весна", weather: "Дождь", items: [trench, jeans, bag] },
  { id: "rainy-casual", title: "Дождливый casual", description: "Практичный набор на дождливый день: тренч, джинсы и удобная обувь.", style: "Casual", season: "Весна", weather: "Дождь", items: [trench, jeans, loafers] },
];

export type CapsuleFilters = { style: CapsuleStyle | null; season: CapsuleSeason | null; weather: CapsuleWeather | null };

export function filterCapsules(list: Capsule[], f: CapsuleFilters): Capsule[] {
  return list.filter((c) => (!f.style || c.style === f.style) && (!f.season || c.season === f.season) && (!f.weather || c.weather === f.weather));
}
