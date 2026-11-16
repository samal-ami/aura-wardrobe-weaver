import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { ru, type MessageKey } from "./ru";
import { en } from "./en";
import { kk } from "./kk";

export const LOCALES = ["ru", "en", "kk"] as const;
export type Locale = (typeof LOCALES)[number];

const DICTIONARIES: Record<Locale, Record<MessageKey, string>> = { ru, en, kk };
const LOCALE_STORAGE_KEY = "aura:locale";

export type Translate = (key: MessageKey, vars?: Record<string, string | number>) => string;

type I18nValue = { locale: Locale; setLocale: (locale: Locale) => void; t: Translate };

const I18nContext = createContext<I18nValue | null>(null);

function isLocale(value: string | null): value is Locale {
  return value !== null && (LOCALES as readonly string[]).includes(value);
}

function interpolate(template: string, vars?: Record<string, string | number>): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (match, name: string) => (name in vars ? String(vars[name]) : match));
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("ru");

  useEffect(() => {
    const saved = localStorage.getItem(LOCALE_STORAGE_KEY);
    if (isLocale(saved)) setLocaleState(saved);
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback((next: Locale) => {
    localStorage.setItem(LOCALE_STORAGE_KEY, next);
    setLocaleState(next);
  }, []);

  const t = useCallback<Translate>(
    (key, vars) => interpolate(DICTIONARIES[locale][key], vars),
    [locale],
  );

  const value = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside I18nProvider");
  return ctx;
}

const CATEGORY_KEYS: Record<string, MessageKey> = {
  "Верх": "cat.top",
  "Низ": "cat.bottom",
  "Платья": "cat.dress",
  "Обувь": "cat.shoes",
  "Аксессуары": "cat.accessories",
};

export function categoryLabel(category: string, t: Translate): string {
  const key = CATEGORY_KEYS[category];
  return key ? t(key) : category;
}
