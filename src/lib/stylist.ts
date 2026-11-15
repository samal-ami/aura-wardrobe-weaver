import { isNeutral, colorsCompatible } from "@/lib/color";
import type { ClothingItem } from "@/lib/supabase";

export const WEATHER_OPTIONS = ["Солнечно", "Прохладно", "Дождь", "Холодно"] as const;
export type Weather = (typeof WEATHER_OPTIONS)[number];

export type StylistReply = { text: string; outfits?: ClothingItem[][] };

const OUTER_RE = /тренч|блейзер|пальто|кардиган|куртк|пиджак/i;
const colorOf = (i: ClothingItem) => i.color_hex ?? "#808080";
const isOuter = (i: ClothingItem) => i.category === "Верх" && OUTER_RE.test(i.name);
const byCategory = (items: ClothingItem[], category: string) => items.filter((i) => i.category === category);

const WEATHER_TIPS: Record<Weather, string> = {
  Солнечно: "Тепло и солнечно: берите лёгкие ткани, шёлк и хлопок, свободный крой и светлую палитру.",
  Прохладно: "Прохладно: лучше всего работают слои. Тонкий верхний слой, например тренч или кардиган, поверх базового топа.",
  Дождь: "Дождь: выбирайте тренч и обувь, которую не жалко намочить. Лоферы и кроссовки из гладкой кожи практичнее замши.",
  Холодно: "Холодно: добавьте объём и плотные материалы, шерсть и кашемир. Тонкие ткани оставьте для слоёв под верхом.",
};

const COLOR_TIP =
  "Палитра: держитесь двух-трёх цветов. Нейтральные тона (белый, бежевый, графит, деним) сочетаются почти со всем, а один акцентный цвет делает образ живым.";
const SILHOUETTE_TIP =
  "Силуэт: оверсайз сверху уравновешивайте прямыми джинсами или брюками. Объёмный верх с объёмным низом выглядит случайно.";
const SHOES_TIP =
  "Обувь: лоферы и белые кроссовки подходят почти к любому образу. Туфли-лодочки на низком каблуке помогут сделать вечерний look.";
const KOREAN_TIP =
  "Корейский минимализм: монохром, мягкие оттенки и чистые линии. Один крупный предмет, например оверсайз блейзер, и всё остальное спокойное.";
const FRENCH_TIP =
  "Французский шик: тренч, шёлковый топ и лоферы. Немного небрежности в деталях, например слегка расстёгнутый верх, важнее идеальной формы.";
const AMERICAN_TIP =
  "Американский casual: прямые джинсы, кардиган и кроссовки. Комфорт и опрятность важнее логотипов.";

export function buildOutfits(items: ClothingItem[], weather: Weather, limit = 3): ClothingItem[][] {
  const tops = byCategory(items, "Верх").filter((i) => !isOuter(i));
  const outers = items.filter(isOuter).sort((a, b) => Number(/тренч/i.test(b.name)) - Number(/тренч/i.test(a.name)));
  const bottoms = byCategory(items, "Низ");
  const shoes = byCategory(items, "Обувь");
  const accessories = byCategory(items, "Аксессуары");
  const cold = weather !== "Солнечно";
  const result: ClothingItem[][] = [];
  const seen = new Set<string>();

  for (const top of tops) {
    for (const bottom of bottoms) {
      for (const shoe of shoes) {
        if (result.length >= limit) return result;
        const palette = [top, bottom, shoe];
        const fits = palette.every((a, idx) => palette.every((b, j) => idx >= j || colorsCompatible(colorOf(a), colorOf(b))));
        if (!fits) continue;
        const outfit = [...palette];
        if (cold) {
          const outer = outers.find((o) => o.id !== top.id && colorsCompatible(colorOf(o), colorOf(top)) && colorsCompatible(colorOf(o), colorOf(bottom)));
          if (outer) outfit.push(outer);
        }
        const accessory = accessories.find((a) => colorsCompatible(colorOf(a), colorOf(top)) && colorsCompatible(colorOf(a), colorOf(shoe)));
        if (accessory) outfit.push(accessory);
        const key = outfit.map((i) => i.id).sort().join("|");
        if (seen.has(key)) continue;
        seen.add(key);
        result.push(outfit);
      }
    }
  }
  return result;
}

export function describeOutfit(outfit: ClothingItem[]): string {
  return outfit.map((i) => i.name).join(" + ");
}

function adviceOnItem(item: ClothingItem, items: ClothingItem[]): string {
  const partners = items.filter((i) => i.id !== item.id && i.category !== item.category && colorsCompatible(colorOf(item), colorOf(i)));
  const tone = isNeutral(colorOf(item))
    ? "Это нейтральная вещь, поэтому её легко сочетать."
    : "Это яркий акцент, поэтому рядом лучше оставить спокойные нейтральные вещи.";
  if (partners.length === 0) {
    return `«${item.name}». ${tone} В гардеробе пока нет вещей, которые бы с ней хорошо сочетались. Добавьте нейтральный низ или верх, и образ сложится.`;
  }
  const names = partners.slice(0, 4).map((i) => `«${i.name}»`).join(", ");
  return `«${item.name}». ${tone} Хорошо сочетается с: ${names}. ${SILHOUETTE_TIP}`;
}

export function replyTo(message: string, items: ClothingItem[], weather: Weather): StylistReply {
  if (items.length === 0) {
    return { text: "В гардеробе пока нет вещей. Добавьте хотя бы верх, низ и обувь, и я смогу собирать образы." };
  }
  const q = message.toLowerCase();

  if (/надеть|сегодня|одеться/.test(q)) {
    const outfits = buildOutfits(items, weather, 2);
    const tail = outfits.length > 0
      ? " Вот два образа из вашего гардероба."
      : " Из текущих вещей не нашлось сочетающихся комплектов. Добавьте низ или обувь.";
    return { text: `Сегодня: ${weather.toLowerCase()}. ${WEATHER_TIPS[weather]}${tail}`, outfits };
  }

  if (/собер|образ|комплект|скомбин/.test(q)) {
    const outfits = buildOutfits(items, weather, 3);
    if (outfits.length === 0) {
      return { text: "Не нашла сочетающихся комплектов. Попробуйте добавить нижнюю часть или обувь в нейтральном цвете." };
    }
    return { text: `Собрала образы с учётом погоды (${weather.toLowerCase()}). Цвета подобраны так, чтобы сочетались между собой.`, outfits };
  }

  const mentioned = items.find((i) => q.includes(i.name.toLowerCase()) || (i.brand ? q.includes(i.brand.toLowerCase()) : false));
  if (mentioned) return { text: adviceOnItem(mentioned, items) };

  if (/корей|миними/.test(q)) return { text: KOREAN_TIP };
  if (/француз|парижск|шик/.test(q)) return { text: FRENCH_TIP };
  if (/америк|casual|кэжуал|кежуал/.test(q)) return { text: AMERICAN_TIP };
  if (/обув|туфл|кроссов|лофер/.test(q)) return { text: SHOES_TIP };
  if (/цвет|палитр|сочета/.test(q)) return { text: COLOR_TIP };
  if (/погод|дожд|холод|жар|тепл/.test(q)) return { text: WEATHER_TIPS[weather] };
  if (/стил|совет/.test(q)) return { text: `${COLOR_TIP} ${SILHOUETTE_TIP}` };

  return {
    text: "Расскажите, что вас интересует: вещь из гардероба, цвета, погода или повод. Можно также нажать одну из быстрых подсказок ниже.",
  };
}

export function photoReply(): StylistReply {
  return {
    text: "Фото получено. Я не распознаю вещь по картинке, поэтому назовите её в сообщении и укажите цвет. Тогда я сравню её с вашим гардеробом.",
  };
}
