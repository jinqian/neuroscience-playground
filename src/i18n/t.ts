import type { Lang } from './lang'
import { uiEn } from './ui.en'

export type UiKey = keyof typeof uiEn

const dictionaries: Partial<Record<Lang, Partial<Record<UiKey, string>>>> = { en: uiEn }

export function t(key: UiKey, lang: Lang, vars?: Record<string, string | number>): string {
  const template = dictionaries[lang]?.[key] ?? uiEn[key]
  if (!vars) return template
  return template.replace(/\{(\w+)\}/g, (whole, name: string) =>
    name in vars ? String(vars[name]) : whole,
  )
}
