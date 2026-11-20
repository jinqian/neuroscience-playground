import type { Lang } from './lang'
import { uiEn } from './ui.en'
import { uiFr } from './ui.fr'
import { uiZh } from './ui.zh'

export type UiKey = keyof typeof uiEn

const dictionaries: Record<Lang, Record<UiKey, string>> = { en: uiEn, fr: uiFr, zh: uiZh }

export function t(key: UiKey, lang: Lang, vars?: Record<string, string | number>): string {
  const template = dictionaries[lang][key] ?? uiEn[key]
  if (!vars) return template
  return template.replace(/\{(\w+)\}/g, (whole, name: string) =>
    name in vars ? String(vars[name]) : whole,
  )
}
