export type Lang = 'en' | 'fr' | 'zh'

/** Localised text. English is always present; other languages are added later. */
export type LText = { en: string; fr?: string; zh?: string }

export const LANG_LABEL: Record<Lang, string> = { en: 'EN', fr: 'FR', zh: '中文' }

export function pick(text: LText, lang: Lang): string {
  return text[lang] ?? text.en
}
