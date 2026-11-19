import type { Lang } from './i18n/lang'

export const ALL_LANGUAGES: Lang[] = ['en', 'fr', 'zh']

/** Languages with finished content. FR and ZH are added only after the learner signs off on English. */
export const ENABLED_LANGUAGES: Lang[] = ['en']

/** Turned on once the 3D brain viewer exists (Task 13). */
export const BRAIN_ENABLED = false
