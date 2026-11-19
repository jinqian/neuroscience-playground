# Neuro Playground Phase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a local, English-only (but trilingual-ready) Duolingo-style neuroscience app. It covers Units 1–2 with Bite, Lab and Case lessons, a Glossary, and a first-version 3D Brain Explorer built from real anatomical meshes.

**Architecture:**
- **App:** a Vite + React + TypeScript single-page app.
- **Content:** hand-editable YAML under `content/`. It's parsed with js-yaml and validated by a zod schema plus cross-reference checks. The same `parseContent()` runs in the browser (via `import.meta.glob`) and in Vitest (via `fs`).
- **Logic:** pure TypeScript modules for the lesson engine, progress (XP, streak, Leitner, unlocks, discovery) and simulation models. Each is unit-tested and wrapped by thin React components.
- **3D:** react-three-fiber renders one `brain.glb` whose node names match structure IDs. It's built by a repeatable script from openly licensed meshes.

**Tech Stack:**
- Node ≥ 20, Vite, React 18+, TypeScript (strict)
- Vitest + @testing-library/react + jsdom
- zod, js-yaml, zustand, react-router (HashRouter)
- three, @react-three/fiber, @react-three/drei
- @fontsource/nunito
- Model pipeline: obj2gltf, @gltf-transform/core + @gltf-transform/functions + meshoptimizer

**Spec:** `docs/superpowers/specs/2026-11-19-neuro-playground-design.md` (read it before starting any task). Visual reference: `docs/design/directions-mockup.html`, Direction A.

## Global Constraints

- **English only:** `ENABLED_LANGUAGES = ['en']`.
  - FR and 中文 appear in the switcher as disabled "coming soon".
  - No FR/ZH content or UI strings are written in this phase. They are added only after the learner explicitly signs off on the English version.
- **Every content text field is a `LText` map** `{ en, fr?, zh? }`. The validator requires every language in `ENABLED_LANGUAGES`.
- **Chinese means Simplified Chinese**, code `zh` (zh-Hans). This is used later, not now.
- **Bite size:** 1–3 explainer cards, each ≤ 80 words (EN), and 4–8 questions.
- **Lab:** 1–2 intro cards and 2–3 reflection questions, with a "Simplified model" note and a "Peek at the model" panel showing the model source via a Vite `?raw` import.
- **XP:**
  - +10 per correct answer, including retries and Case unlock questions
  - +20 for a Lab goal
  - +50 for a solved Case
- **No hearts, penalties or timers.** A wrong answer shows its explanation and the question re-queues at the end of the lesson.
- **Streak:** counts local calendar days (not UTC) with ≥ 1 completed lesson.
- **Leitner intervals in days:** `[1, 2, 4, 8, 16]`.
- **Unit access:** all units are open. Within a unit, a non-Case node unlocks when every Bite before it in the unit is completed; Labs never gate. The Case unlocks when all Bites in the unit are completed. A unit with no lessons shows "coming soon".
- **Progress keys** use language-independent IDs only.
- **Look:** Direction A.
  - Rounded and bright, with chunky buttons (bottom border/shadow "press" style), Nunito, one idea per screen.
  - Primary green `#3DBE5A` (pressed shade `#2A9A44`), streak orange `#FF8A3D`, done gold `#FFC93C`, mascot purple `#9B82FF` / `#7B5CF0`.
  - Nothing from Duolingo's brand: no owl, not their green `#58CC02`, not their font.
- **Mascot:** "Dendri", an original purple neuron (see the mockup SVG).
- **Content is original.** Never copy course transcripts, slides or quiz questions. Each lesson has `sources:` listing matching course video titles from the spec appendix. Uncertain claims get `verify: true`.
- **3D meshes:**
  - Real anatomy only; never hand-model anatomy.
  - Fallback ladder: (1) paint regions on a real cortex mesh; (2) mark a structure `twoDOnly` and log it.
  - Total `public/models/` ≤ 20 MB.
- **Downloads need permission:** ask the user in chat before downloading any external file, stating the filename, source URL and size.
- **Offline:** `npm run build` output works served statically (`base: './'`, HashRouter, fonts bundled via @fontsource, no CDN).
- **Commit messages** end with:
  ```
  Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
  ```

## Review Focus

1. **Browser storage is unavailable or holds corrupt JSON.** The app still loads with default progress. Corrupt data is copied to `neuro-playground:v1:corrupt` instead of being lost. (Test in Task 5.)
2. **Switching language mid-question.** The selected answer, the current step and the re-queue are kept. (Test in Task 7.) Phase 1 has only EN enabled, so the test enables `fr` via a provider prop.
3. **Late-evening and day-boundary streaks.** A lesson at 23:30 local time and another at 00:10 local the next day give streak 2, whatever the UTC offset. (Test in Task 5.)
4. **3D can't run (no WebGL, or the GLB fails to load).**
   - The Explorer and Explore modal show a readable fallback message.
   - `tap3d` questions and `tap3d` Case finals degrade to a multiple-choice list of structure names, so lessons stay completable.
   - (Test in Task 13.)
5. **A hand-edited YAML has a typo** (bad indentation, unknown term/structure ID, wrong answer ID). The dev server shows an error screen listing the file path and field path, never a blank page. (Tests in Tasks 3 and 6.)

---

## File Structure

```
content/
  units/u01.yaml … u10.yaml          # unit metadata + ordered lesson ids (u03–u10: lessons: [])
  lessons/u01/*.yaml, lessons/u02/*.yaml
  glossary.yaml                       # list of terms
  structures.yaml                     # list of 3D structures
src/
  config.ts                           # ENABLED_LANGUAGES, ALL_LANGUAGES
  i18n/{lang.ts, ui.en.ts, t.ts, LanguageProvider.tsx, LanguageSwitcher.tsx}
  content/{schema.ts, parse.ts, validate.ts, richText.ts, load.browser.ts, ContentProvider.tsx}
  engine/{check.ts, lessonRun.ts, xp.ts}
  progress/{dates.ts, streak.ts, leitner.ts, access.ts, discovery.ts, storage.ts, store.ts}
  ui/{theme.css, Button.tsx, Header.tsx, Dendri.tsx, PathScreen.tsx, ErrorScreen.tsx, App.tsx, routes.tsx}
  lesson/{LessonScreen.tsx, CardView.tsx, RichText.tsx, TermPopover.tsx, FeedbackBar.tsx, CompleteScreen.tsx}
  lesson/questions/{Mc.tsx, Gap.tsx, TfWhy.tsx, Order.tsx, Match.tsx, Tap2d.tsx, Tap3d.tsx, TermMatch.tsx, QuestionView.tsx}
  illustrations/{registry.ts, *.tsx}  # card illustrations + tappable figures
  glossary/{GlossaryScreen.tsx, glossaryIndex.ts}
  lab/{LabScreen.tsx, PeekModel.tsx, registry.ts}
  sims/threshold/{model.ts, ThresholdSim.tsx}, sims/myelin/{model.ts, MyelinSim.tsx}
  case/{CaseScreen.tsx, caseRun.ts}
  brain/{visual.ts, BrainCanvas.tsx, BrainModal.tsx, ExplorerScreen.tsx, webgl.ts}
public/models/brain.glb
scripts/models/{sources.yaml, build-brain.mjs, README.md}
docs/models/MODELS.md                 # sources, licenses, attributions, fallbacks log
tests/ (co-located *.test.ts(x) next to sources is fine; content + model checks in tests/)
```

**ID conventions (all tasks):**

| Thing | Format | Example |
|-------|--------|---------|
| Unit | `uNN` | `u01` |
| Lesson | `<unit>-b<NN>`, `<unit>-lab-<name>`, `<unit>-case-<name>` | `u02-lab-threshold` |
| Card, question, clue | local ID unique within its lesson | `c1`, `q3`, `k2` |
| Glossary term | kebab-case | `action-potential` |
| Structure | kebab-case | `cerebellum` |
| Mesh node | structure ID, plus `_L`/`_R` for paired parts | `frontal-lobe_L` |
| Review item | `q:<lessonId>:<qid>` or `s:<structureId>` | `q:u02-b02:q3` |

---

### Task 1: Project scaffold

**Files:**
- Create: the project via `npm create vite@latest . -- --template react-ts`
- Create: `.gitignore` (node_modules, dist, `scripts/models/raw/`), `vitest.config.ts`, `src/test/setup.ts`, `src/ui/App.tsx` (temporary), `src/ui/App.test.tsx`
- Modify: `package.json` scripts, `vite.config.ts` (`base: './'`)

**Interfaces:**
- Produces:
  - npm scripts: `dev`, `build`, `test` (`vitest run`), `typecheck` (`tsc -b --noEmit`)
  - Vitest uses the jsdom environment with `@testing-library/jest-dom` matchers.

- [ ] **Step 1:** Run `git init -b main`. Commit the existing `docs/` as "docs: design spec, mockup and phase 1 plan".
- [ ] **Step 2:** Scaffold Vite react-ts in place (keep `docs/`). Install the runtime deps:
  - `zod js-yaml zustand react-router-dom @fontsource/nunito three @react-three/fiber @react-three/drei`
  - dev: `vitest jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event @types/js-yaml @types/three`
- [ ] **Step 3: Write the failing test** `src/ui/App.test.tsx`: `render(<App />)` and expect `screen.getByText('Neuro Playground')`.
- [ ] **Step 4:** Run `npm test`. Expected: FAIL (the template App has no such text).
- [ ] **Step 5:** Replace the template App with one rendering `<h1>Neuro Playground</h1>`. Delete the template's assets and CSS.
- [ ] **Step 6:** Run `npm test && npm run typecheck && npm run build`. Expected: all pass, and `dist/index.html` references `./assets/…`.
- [ ] **Step 7:** Commit "chore: scaffold vite react-ts app with vitest".

---

### Task 2: Language core and switcher

**Files:**
- Create: `src/config.ts`, `src/i18n/lang.ts`, `src/i18n/ui.en.ts`, `src/i18n/t.ts`, `src/i18n/LanguageProvider.tsx`, `src/i18n/LanguageSwitcher.tsx`, `src/i18n/i18n.test.tsx`

**Interfaces:**
- Produces:
  - `type Lang = 'en' | 'fr' | 'zh'`
  - `ALL_LANGUAGES: Lang[] = ['en','fr','zh']`
  - `ENABLED_LANGUAGES: Lang[] = ['en']`
  - `LANG_LABEL: Record<Lang,string> = { en: 'EN', fr: 'FR', zh: '中文' }`
  - `type LText = { en: string; fr?: string; zh?: string }`
  - `pick(text: LText, lang: Lang): string` (falls back to `en`)
  - `type UiKey = keyof typeof uiEn`
  - `t(key: UiKey, lang: Lang, vars?: Record<string,string|number>): string` (`{name}` interpolation; falls back to EN)
  - `<LanguageProvider enabled?: Lang[]>`, which persists via the progress store (Task 5) or, until then, the `initialLang` prop
  - `useLang(): { lang: Lang; setLang(l: Lang): void; enabled: Lang[] }`
  - `<LanguageSwitcher />`
- `uiEn` starts with the keys these tasks need, and every later task adds its own keys to it. **No `ui.fr.ts` or `ui.zh.ts` is created in this phase.**

- [ ] **Step 1: Write failing tests**
  - `pick({en:'neuron'}, 'fr') === 'neuron'`
  - `pick({en:'a', fr:'b'}, 'fr') === 'b'`
  - `t('xpGained','en',{n:10}) === '+10 XP'`
  - Render `<LanguageProvider><LanguageSwitcher/></LanguageProvider>`:
    - the buttons "EN", "FR", "中文" exist
    - FR and 中文 are `disabled` and have the title "Coming soon"
    - EN has `aria-pressed="true"`
- [ ] **Step 2:** Run `npx vitest run src/i18n`. Expected: FAIL (modules missing).
- [ ] **Step 3:** Implement the files listed above.
- [ ] **Step 4:** Run `npx vitest run src/i18n`. Expected: PASS.
- [ ] **Step 5:** Commit "feat(i18n): language core, EN UI strings, switcher with FR/中文 coming soon".

---

### Task 3: Content schema, parser, validator, rich text

**Files:**
- Create: `src/content/schema.ts`, `src/content/richText.ts`, `src/content/parse.ts`, `src/content/validate.ts`
- Create: `src/content/__fixtures__/` (a tiny valid set plus broken variants as inline strings in tests)
- Create: `src/content/content.test.ts`, `tests/realContent.test.ts`
- Create: `content/units/u01.yaml` … `u10.yaml` (u01/u02 with `lessons: []` for now), `content/glossary.yaml` (`[]`), `content/structures.yaml` (Phase 1 list below)

**Interfaces:**
- Consumes: `Lang`, `LText`, `ENABLED_LANGUAGES` (Task 2).

- Produces (zod schemas plus inferred types; field names are fixed):

  **Building blocks**
  - `Option = { id; text: LText }`
  - `Card = { id; body: LText; illustration?: string; dev?: { analogy: LText; breaks: LText }; explore3d?: string[]; verify?: boolean }`

  **Question** is a discriminated union on `kind`. Every kind also has `id: string`, `explain: LText` (optional for `termmatch` only) and `verify?: boolean`.

  | `kind` | Fields |
  |--------|--------|
  | `'mc'` | `prompt`, `options: Option[]` (2–4), `answer: optionId` |
  | `'gap'` | same as `mc`; the prompt has exactly one `___` per language |
  | `'order'` | `prompt`, `steps: Option[]` (3–6, listed in correct order) |
  | `'match'` | `prompt`, `pairs: {id; left: LText; right: LText}[]` (3–5) |
  | `'tfwhy'` | `statement`, `isTrue: boolean`, `reasons: Option[]` (2–4), `answerReason` |
  | `'tap2d'` | `prompt`, `figure`, `answer: regionId` |
  | `'tap3d'` | `prompt`, `structure: structureId` |
  | `'termmatch'` | `terms: termId[]` (3–5), `from: Lang`, `to: Lang` |

  **Lessons** — `Lesson = Bite | Lab | Case`, discriminated on `type`:
  - `Bite = { id; type:'bite'; title: LText; sources: string[]; cards: Card[]; questions: Question[] }`
  - `Lab = { id; type:'lab'; title; sources; intro: Card[]; sim: string /* checked against the sims registry */; goal: LText; simplified: LText; reflection: Question[] }`
  - `Case = { id; type:'case'; title; sources; story: LText; clues: { id; text: LText; unlock?: Question; verify?: boolean }[]; final: CaseFinal; solved: LText }`
  - `CaseFinal = { prompt: LText; kind: 'choice'|'tap2d'|'tap3d'; options?: Option[]; figure?: string; candidates?: string[]; answer: string; explanations: Record<string, LText> }`

  **Units, glossary, structures**
  - `Unit = { id; number; title: LText; nickname: LText; color: string; module: string; lessons: string[] }`
  - `Term = { id; en: string; fr?: string; zh?: string; roots?: string; abbr?: string; unit: string }`
  - `Structure = { id; name: LText; note: LText; units: string[]; meshNodes: string[]; twoDOnly?: boolean }`

  **Functions and types**
  - `ContentBundle = { units: Unit[]; lessons: Record<string, Lesson>; glossary: Term[]; structures: Structure[] }`
  - `parseContent(files: Record<string /*repo-relative path*/, string /*yaml*/>): { bundle?: ContentBundle; errors: ContentError[] }`
  - `ContentError = { file: string; path: string /* e.g. "questions[2].answer" */; message: string }`
  - `validateContent(bundle, opts: { enabled: Lang[]; figures: Record<string, string[] /*regionIds*/>; illustrations: string[]; sims: string[] }): ContentError[]`
  - `parseRich(text: string): Segment[]`, where `Segment = {kind:'text';text} | {kind:'bold';text} | {kind:'term';termId;label?}`
    - Syntax: `**bold**`, `[[term-id]]` (shows the term in the current language), `[[term-id|label]]`.
  - `RICH_FIELDS`: the list of LText fields that may contain term markup (card body, dev.analogy, explain, story, clue text, solved).

- **Validator rules** (each gives one `ContentError`):
  1. An LText is missing an enabled language.
  2. Duplicate IDs (units, lessons, terms, structures, or local IDs within a lesson).
  3. A unit lists a lesson that doesn't exist, or a lesson isn't listed in any unit.
  4. An answer, answerReason or final answer doesn't refer to an existing option, region or candidate.
  5. A term referenced in rich text, or `termmatch.terms`, isn't in the glossary.
  6. A structure referenced in `explore3d`, `tap3d`, `final.candidates` or `structure.units` doesn't exist.
  7. An unknown illustration, figure or sim ID.
  8. Bite counts are out of range (cards 1–3, questions 4–8); lab intro 1–2; reflection 2–3.
  9. An EN card body is over 80 words. Words are counted after stripping markup.
  10. A `termmatch` `from`/`to` isn't enabled.
  11. A Case final is missing an explanation for any option, region or candidate.
  12. `gap` doesn't have exactly one `___` per enabled language.
  13. A lesson has `type: 'case'` but isn't the unit's last lesson.

- **Phase 1 `structures.yaml` IDs** (`meshNodes` filled in Task 12; start as `[]` with `twoDOnly: true`):
  `frontal-lobe`, `parietal-lobe`, `temporal-lobe`, `occipital-lobe`, `cerebellum`, `brainstem`, `spinal-cord`, `hypothalamus`.

- **Unit YAML for u01–u10** uses the module names and nicknames below. Colour is any distinct bright hue per unit.

  | Unit | Module | Nickname |
  |------|--------|----------|
  | u01 | The Nervous System | Meet the Cells |
  | u02 | Neural Communication + Embodied Emotion | Talking Neurons |
  | u03 | Neuroanatomy | Brain Map |
  | u04 | Perception and Vision | Seeing |
  | u05 | Hearing | Hearing |
  | u06 | Vestibular Sense & Gaze | Balance & Gaze |
  | u07 | Voluntary Movements | Moving |
  | u08 | Motor Modulation | Smooth Moves |
  | u09 | Homeostasis | Inner Balance |
  | u10 | Abstract Function | Thinking |

- [ ] **Step 1: Write failing tests** in `src/content/content.test.ts`:
  - `parseRich('A **big** [[action-potential]] and [[soma|cell body]].')` gives segments `[text 'A ', bold 'big', text ' ', term action-potential, text ' and ', term soma label 'cell body', text '.']`.
  - A valid fixture parses with `errors` empty.
  - Each validator rule 1–13 has one broken variant that yields exactly one error. Assert on its `file`, `path` and a message substring. Example: rule 4 gives `{ file: 'content/lessons/u01/u01-b01.yaml', path: 'questions[0].answer' }`.
  - Bad YAML indentation gives an error with that `file` and the js-yaml line number in `message`.
- [ ] **Step 2:** Run `npx vitest run src/content`. Expected: FAIL.
- [ ] **Step 3:** Implement `schema.ts`, `richText.ts`, `parse.ts` and `validate.ts`.
  - The file kind is decided by path prefix: `content/units/`, `content/lessons/`, `content/glossary.yaml`, `content/structures.yaml`.
  - zod issues are mapped to `ContentError.path` by joining the issue path, e.g. `questions[2].answer`.
- [ ] **Step 4:** Write `tests/realContent.test.ts`.
  - It reads every file under `content/` with `fs`, then runs `parseContent` and `validateContent`.
  - It gets `figures`, `illustrations` and `sims` from the registries. Until those exist, it imports stub registries exporting `{}`/`[]` from `src/illustrations/registry.ts` and `src/lab/registry.ts`, created here as empty.
  - It expects zero errors and prints them all on failure.
- [ ] **Step 5:** Run `npm test`. Expected: PASS.
- [ ] **Step 6:** Commit "feat(content): yaml schema, parser, validator, rich text; unit stubs".

---

### Task 4: Lesson engine

**Files:**
- Create: `src/engine/check.ts`, `src/engine/lessonRun.ts`, `src/engine/xp.ts`, `src/engine/engine.test.ts`

**Interfaces:**
- Consumes: `Question`, `Bite`, `Lab` types (Task 3).
- Produces:
  - `Response`, a union keyed by question kind:
    - `{optionId}` for mc/gap
    - `{order: string[]}`
    - `{pairs: Record<string,string>}` for match/termmatch (left ID → right ID)
    - `{value: boolean; reasonId: string}`
    - `{regionId}`
    - `{structureId}`
  - `isCorrect(q: Question, r: Response): boolean`
    - match: correct when every pair ID maps to itself.
    - termmatch: correct when every term ID maps to itself.
    - tfwhy: correct when `value === isTrue && reasonId === answerReason`.
  - `type Step = { kind: 'card'; id: string } | { kind: 'question'; id: string }`
  - `type RunState = { steps: Step[]; index: number; attempts: Record<string, number>; correct: Record<string, boolean>; missed: string[]; xp: number; done: boolean }`
  - `startRun(steps: Step[]): RunState`
  - `bitePlan(b: Bite): Step[]` (cards, then questions)
  - `labReflectionPlan(l: Lab): Step[]` (reflection questions only)
  - `answer(s: RunState, questionId: string, correct: boolean): RunState`
    - Adds `XP.correct` when correct.
    - When wrong, pushes the same question step to the end of `steps` and adds its ID to `missed` once.
  - `advance(s: RunState): RunState` (`index + 1`; `done` when the index passes the end)
  - `XP = { correct: 10, labGoal: 20, caseSolved: 50 } as const`

- [ ] **Step 1: Write failing tests:**
  - `isCorrect` true/false for each kind (8 kinds × 2 cases).
  - `startRun(bitePlan(bite with 1 card, 2 questions))` has 3 steps.
  - `answer` wrong on q1 → steps length 4, the last step is q1, `missed=['q1']`, xp 0.
  - Then answering q1 correctly on the retry → xp 10.
  - Answering wrong twice still lists q1 in `missed` only once.
  - `advance` past the last step → `done: true`.
- [ ] **Step 2:** Run `npx vitest run src/engine`. Expected: FAIL.
- [ ] **Step 3:** Implement.
- [ ] **Step 4:** Run `npx vitest run src/engine`. Expected: PASS.
- [ ] **Step 5:** Commit "feat(engine): answer checking, lesson run with re-queue, XP constants".

---

### Task 5: Progress (streak, Leitner, access, discovery, storage, store)

**Files:**
- Create: `src/progress/dates.ts`, `streak.ts`, `leitner.ts`, `access.ts`, `discovery.ts`, `storage.ts`, `store.ts`, `progress.test.ts`

**Interfaces:**
- Consumes: `ContentBundle`, `Lesson`, `Unit` (Task 3); `parseRich`, `RICH_FIELDS` (Task 3); `XP` (Task 4); `Lang` (Task 2).
- Produces:

  **Dates and streak**
  - `localDay(d: Date): string` (local `YYYY-MM-DD`)
  - `addDays(day: string, n: number): string`
  - `type Streak = { current: number; lastDay: string | null }`
  - `recordActivity(s: Streak, today: string): Streak`
    - same day: unchanged
    - `lastDay` is yesterday: +1
    - otherwise: 1
  - `displayStreak(s: Streak, today: string): number` (0 if `lastDay` is before yesterday)

  **Leitner**
  - `INTERVALS = [1,2,4,8,16]`
  - `type ReviewEntry = { box: number; due: string }`
  - `scheduleMiss(today): ReviewEntry` (box 0, due today+1)
  - `scheduleReview(e, correct, today): ReviewEntry`
    - correct: box `min(box+1, 4)`, due `today + INTERVALS[newBox]`
    - wrong: `scheduleMiss`
  - `dueItems(review: Record<string, ReviewEntry>, today): string[]`

  **Unlocks**
  - `nodeStates(unit: Unit, lessons: Record<string,Lesson>, completed: Set<string>): Record<lessonId, 'done'|'current'|'open'|'locked'>`
    - Follows the unit-access rule in Global Constraints.
    - `current` is the first unlocked, not-done node.

  **Discovery**
  - `lessonStructures(lesson): string[]`: from `explore3d`, `tap3d.structure` and the case final answer when its `kind` is `tap3d`.
  - `lessonTerms(lesson): string[]`: from the rich text fields and `termmatch`.

  **Progress data and storage**
  - `type Progress = { version: 1; lang: Lang; xp: number; streak: Streak; completed: Record<string, { at: string }>; review: Record<string, ReviewEntry>; discovered: string[]; metTerms: string[]; badges: string[] }`
  - `defaultProgress(): Progress`
  - `loadProgress(storage: Pick<Storage,'getItem'|'setItem'> | null): Progress`
    - key `'neuro-playground:v1'`
    - on bad JSON or a schema mismatch: copy the raw value to `'neuro-playground:v1:corrupt'` and return the default
    - a null storage or a throwing accessor returns the default
  - `saveProgress(storage, p): void` (swallows exceptions)

  **Store**
  - zustand `useProgress` with:
    - state: `Progress`
    - `setLang(l)`
    - `addXp(n)`
    - `completeLesson(lesson: Lesson, missedQuestionIds: string[], now: Date)`:
      - marks the lesson completed
      - records streak activity for `localDay(now)`
      - adds `lessonStructures` to `discovered` and `lessonTerms` to `metTerms`
      - schedules each miss as review item `q:<lessonId>:<qid>`
      - if it's a Case, adds the unit ID to `badges`
    - `recordStructureQuiz(structureId, correct, now)` (+10 XP if correct; on a miss, schedules review item `s:<structureId>`)
    - persists on every change through `saveProgress(safeLocalStorage())`

- [ ] **Step 1: Write failing tests:**
  - `recordActivity({current:3,lastDay:'2026-11-18'},'2026-11-19').current === 4`
  - the same day stays 3
  - a gap of 2 days → 1
  - `displayStreak` with lastDay 2 days ago → 0
  - **Review Focus 3:** with `vi.setSystemTime` and `process.env.TZ='Pacific/Auckland'` (set in the test file before importing `dates.ts`), `localDay(new Date('2026-11-19T10:30:00Z'))` gives `'2026-11-19'` (23:30 local), and `localDay(new Date('2026-11-19T11:10:00Z'))` gives `'2026-11-20'`. Feeding both into `recordActivity` → current 2.
  - Leitner: `scheduleMiss('2026-11-19')` → `{box:0,due:'2026-11-20'}`; correct from box 0 → box 1, due +2; correct at box 4 stays 4, due +16; wrong → box 0.
  - `nodeStates` with a fixture unit `[b1, lab1, b2, case]`:
    - nothing done → b1 current; lab1, b2 and case locked
    - b1 done → lab1 and b2 open (lab1 current); case locked
    - b1 and b2 done (lab1 not) → case open
  - **Review Focus 1:**
    - `loadProgress(null)` → default
    - storage `getItem` throws → default
    - storage contains `'{bad'` → default, and `setItem('neuro-playground:v1:corrupt','{bad')` was called
  - `completeLesson` on a Case lesson adds the badge, `discovered` and `metTerms`, plus review entries for misses.
- [ ] **Step 2:** Run `npx vitest run src/progress`. Expected: FAIL.
- [ ] **Step 3:** Implement. Wire `LanguageProvider` (Task 2) to read and write `useProgress().lang`.
- [ ] **Step 4:** Run `npx vitest run src/progress src/i18n`. Expected: PASS.
- [ ] **Step 5:** Commit "feat(progress): streak, leitner, unlock rules, discovery, safe persistence store".

---

### Task 6: App shell, theme, path screen, mascot

**Files:**
- Create: `src/ui/theme.css`, `Button.tsx`, `Header.tsx`, `Dendri.tsx`, `PathScreen.tsx`, `ErrorScreen.tsx`, `routes.tsx`, `src/content/load.browser.ts`, `src/content/ContentProvider.tsx`, `src/ui/shell.test.tsx`
- Modify: `src/ui/App.tsx`, `src/main.tsx` (import `@fontsource/nunito/700.css`, `800.css`, `900.css` and `theme.css`)

**Interfaces:**
- Consumes: `parseContent`, `validateContent` (Task 3); registries (stubs from Task 3); `useProgress`, `nodeStates`, `displayStreak` (Task 5); `useLang`, `t`, `LanguageSwitcher` (Task 2).
- Produces:
  - `loadBrowserContent(): { bundle?: ContentBundle; errors: ContentError[] }`, using `import.meta.glob('/content/**/*.yaml', { query: '?raw', import: 'default', eager: true })`
  - `<ContentProvider>` and `useContent(): ContentBundle`
  - `<ErrorScreen errors={ContentError[]}>`, listing `file — path: message`
  - `<Dendri mood: 'idle'|'happy'|'oops'|'cheer' size?: number />`
  - `<Button variant: 'primary'|'secondary'|'option' state?: 'idle'|'selected'|'correct'|'wrong'>`
  - Routes (HashRouter):

    | Route | Screen |
    |-------|--------|
    | `/` | `PathScreen` |
    | `/lesson/:lessonId` | Task 7 |
    | `/glossary` | Task 8 |
    | `/brain` | Task 13 |

    Unbuilt routes render a placeholder.
  - `Header` shows the streak (flame SVG + number), XP, `LanguageSwitcher`, a Glossary link and a "Brain" button.
- PathScreen:
  - One section per unit: a coloured banner with "Unit N · nickname" and the module title.
  - A winding column of round nodes: the offset alternates in the sequence 0, −26, −34, −10, 22, 30 px, like the mockup.
  - Node icon by type: Bite = number, Lab = flask SVG, Case = magnifier SVG.
  - Node state colours: done = gold, current = green with a halo, locked = grey.
  - Units with `lessons: []` show "Coming soon".
  - Clicking an unlocked node navigates to `/lesson/:id`.
- The theme defines CSS custom properties for the Direction A palette in Global Constraints plus neutrals. It's a single light theme, a deliberate choice, with an explicit body background.

- [ ] **Step 1: Write failing tests:**
  - With a fixture bundle in `ContentProvider`, PathScreen shows "Unit 1 · Meet the Cells", and node 1 has `data-state="current"` and the others `locked`.
  - Unit 3 shows "Coming soon".
  - **Review Focus 5:** `App` given `errors=[{file:'content/lessons/u01/x.yaml',path:'questions[0].answer',message:'unknown option "z"'}]` renders that text and no path.
- [ ] **Step 2:** Run `npx vitest run src/ui`. Expected: FAIL.
- [ ] **Step 3:** Implement.
  - `App` loads the content. If there are errors (parse or validate), it renders `ErrorScreen`; otherwise the router.
  - `Dendri` reuses the mockup's SVG geometry. Moods change the eyes and mouth: happy = smile, oops = "o" mouth plus raised brow, cheer = arms up plus a sparkle.
- [ ] **Step 4:** Run `npm test`. Then run `npm run dev`, open it in a browser and check the path renders in the Direction A look. Expected: tests PASS; visually matches the mockup's left column style.
- [ ] **Step 5:** Commit "feat(ui): theme, header, path screen, Dendri, content error screen".

---

### Task 7: Lesson player and question types

**Files:**
- Create: `src/lesson/LessonScreen.tsx`, `CardView.tsx`, `RichText.tsx`, `TermPopover.tsx`, `FeedbackBar.tsx`, `CompleteScreen.tsx`, `src/lesson/questions/*.tsx` (Mc, Gap, TfWhy, Order, Match, Tap2d, Tap3d, TermMatch, QuestionView), `src/lesson/lesson.test.tsx`
- Modify: `src/illustrations/registry.ts`, which now exports `ILLUSTRATIONS: Record<string, React.FC>` and `FIGURES: Record<string, { Component: React.FC<{ onTap(regionId): void; highlight?: string }>; regions: string[] }>`; `src/ui/routes.tsx`

**Interfaces:**
- Consumes: Task 4 engine; `useProgress().completeLesson`, `addXp` (Task 5); `parseRich` (Task 3); `useContent`, `Dendri`, `Button` (Task 6).
- Produces:
  - `<RichText text: LText />`, which renders segments. A term renders as `<button class="term">` that opens `TermPopover`.
  - `<TermPopover termId />`:
    - shows EN, FR and 中文 rows plus roots and abbreviation
    - a missing language shows "Coming soon"
    - closes on Escape or an outside click
  - `<QuestionView question response onChange disabled />`, which dispatches by kind:
    - **mc / gap:** the options are chunky buttons; gap renders the prompt with `___` as an inline blank that fills with the selected option.
    - **order:** steps shown shuffled (deterministic shuffle seeded by question ID so tests are stable). Reorder with up/down buttons per item; drag is optional.
    - **match:** two columns, the right column shuffled with the seeded shuffle; tap left then right to pair.
    - **tfwhy:** True/False then the reason options.
    - **tap2d:** renders `FIGURES[figure]`.
    - **tap3d:** renders a `Tap3d` placeholder list of structure-name buttons, replaced with the 3D version in Task 13.
    - **termmatch:** renders `from`-language terms paired against `to`-language terms.
  - `<FeedbackBar state:'idle'|'correct'|'wrong' explain?: LText onCheck onContinue />`:
    - correct = green "Nice! +10 XP"
    - wrong = soft red with "Not quite" plus the explanation
    - the button reads CHECK, then CONTINUE
  - CardView:
    - illustration on top, then the body
    - an optional `dev` box: "As a developer…" plus a "Where the analogy breaks" line
    - an optional "Explore in 3D" button, which is hidden until Task 13 sets `BRAIN_ENABLED = true` in `src/config.ts`
    - a `verify` marker: a small badge "Check against the course"
  - LessonScreen:
    - top progress bar = answered-correct / total questions
    - an X button to quit (goes back to the path; no state kept)
    - `bitePlan` for a Bite; labs and cases delegate to their screens (Tasks 9–11)
    - on `done`, calls `completeLesson(lesson, run.missed, new Date())`, then shows `CompleteScreen` (Dendri cheer, XP earned this lesson, "Continue" to the path)
  - The run state and the per-question draft `Response` live in LessonScreen state keyed by IDs. A language change re-renders text only.
  - Any card, question or Case clue with `verify: true` shows the same "Check against the course" badge.

- [ ] **Step 1: Write failing tests** with a fixture bite (2 cards, mc + gap + order + match + tfwhy + tap2d) and a fixture figure `{regions:['soma','axon']}`:
  - Play-through: Continue past the cards; answer mc wrong → the explanation shows and the progress bar is unchanged; then answer the rest correctly; the mc reappears last; answer it correctly → CompleteScreen shows "+60 XP" (6 correct × 10). `completeLesson` was called with `missed=['q1']`.
  - **Review Focus 2:** render with `<LanguageProvider enabled={['en','fr']}>`; select an mc option (not yet checked); click "FR" → the same question still shows with the selected option `aria-pressed="true"`, and the progress bar is unchanged.
  - The term popover: clicking a `[[soma]]` term shows "Coming soon" for FR and 中文.
  - Order uses a seeded shuffle: the same question ID gives the same initial order on two renders.
- [ ] **Step 2:** Run `npx vitest run src/lesson`. Expected: FAIL.
- [ ] **Step 3:** Implement.
- [ ] **Step 4:** Run `npm test`. Then use the dev server with a temporary local fixture lesson and click through every question kind. Expected: PASS; every kind is operable with mouse and keyboard (Tab/Enter).
- [ ] **Step 5:** Commit "feat(lesson): lesson player, all question types, term popover, completion".

---

### Task 8: Glossary screen

**Files:**
- Create: `src/glossary/glossaryIndex.ts`, `src/glossary/GlossaryScreen.tsx`, `src/glossary/glossary.test.tsx`
- Modify: `src/ui/routes.tsx`

**Interfaces:**
- Consumes: `useContent`, `useProgress().metTerms`, `lessonTerms` (Task 5).
- Produces:
  - `firstLessonForTerm(bundle): Record<termId, lessonId>`: the first lesson in unit/lesson order whose `lessonTerms` include the term.
  - `filterTerms(terms: Term[], query: string, unit: string | 'all'): Term[]`:
    - case-insensitive substring match on en, fr, zh and abbr
    - accent-insensitive via `normalize('NFD')` with combining marks stripped
- GlossaryScreen:
  - search input; unit filter chips
  - a table with columns EN | FR | 中文 (empty cells show "—"), showing only `metTerms`
  - each row links to `/lesson/<firstLessonForTerm>`
  - empty state: Dendri plus "Terms you meet in lessons show up here."

- [ ] **Step 1: Write failing tests:**
  - `filterTerms` with 'potentiel' matches fr 'potentiel d'action'
  - 'eloignement' matches 'éloignement'
  - 'VOR' matches abbr
  - the unit filter excludes other units
  - the screen shows only met terms, and the empty state appears when none are met
- [ ] **Step 2:** Run `npx vitest run src/glossary`. Expected: FAIL.
- [ ] **Step 3:** Implement.
- [ ] **Step 4:** Run `npx vitest run src/glossary`. Expected: PASS.
- [ ] **Step 5:** Commit "feat(glossary): searchable trilingual-ready glossary of met terms".

---

### Task 9: Lab framework and the threshold simulation

**Files:**
- Create: `src/lab/LabScreen.tsx`, `src/lab/PeekModel.tsx`, `src/sims/threshold/model.ts`, `src/sims/threshold/ThresholdSim.tsx`, `src/sims/threshold/model.test.ts`, `src/lab/lab.test.tsx`
- Modify: `src/lab/registry.ts`, which now exports `SIMS: Record<SimId, { Component: React.FC<SimProps>; modelSource: string }>`, where `modelSource` comes from `import src from '../sims/threshold/model.ts?raw'`; `src/lesson/LessonScreen.tsx` (delegates `type: 'lab'`)

**Interfaces:**
- Consumes: the engine (Task 4), `QuestionView`, `CardView`, `FeedbackBar` (Task 7), `XP.labGoal`.
- Produces:
  - `type SimId = 'threshold' | 'myelin'`
  - `type SimProps = { onGoalMet(): void; goalMet: boolean }`
  - Threshold model (constants exported):
    - `REST = -70`, `THRESHOLD = -55`, `PEAK = 40`, `AHP = -80` (mV)
    - `simulate(stimulusMv: number, opts?: { durationMs?: number /*30*/; stepMs?: number /*0.1*/; stimAtMs?: number /*5*/ }): { trace: Array<[number, number]>; fired: boolean }`
      - Subthreshold: an exponential decay back to rest (τ = 3 ms).
      - Suprathreshold: the piecewise waveform from the mockup (rise to `PEAK` at stimAt+1.5 ms, fall to `AHP` by +3 ms, recover with τ = 3 ms).
    - `minimumFiringStimulus(): number` (smallest integer stimulus that fires = 15)
  - LabScreen flow:
    1. intro cards
    2. sim panel on a dark "bench" surface: the goal text on top, the sim, the "Simplified model" note, and a collapsible `PeekModel`
    3. "Continue" is enabled once `goalMet`; on goal met: +20 XP (once) and Dendri cheer
    4. reflection questions via the Task 4 engine (`labReflectionPlan`)
    5. `completeLesson`
  - `<PeekModel source: string />`: a collapsible `<pre>` with the TypeScript source and a monospace font. No syntax-highlighting library.
  - ThresholdSim:
    - stimulus slider 1–30 mV
    - canvas trace with rest and threshold lines (as in the mockup)
    - console line text
    - "My answer: smallest stimulus that fires" number input plus a "Check" button; `onGoalMet` when it equals `minimumFiringStimulus()`
    - a wrong answer shows "Try values around it and watch the threshold line."

- [ ] **Step 1: Write failing tests:**
  - `simulate(14).fired === false`; `simulate(15).fired === true`
  - the max V of `simulate(20)` ≈ `PEAK` ±1
  - the subthreshold trace returns within 1 mV of `REST` by 25 ms
  - `minimumFiringStimulus() === 15`
  - LabScreen with a fixture lab using a fake sim that calls `onGoalMet` on a button: Continue is disabled before the goal and enabled after; the XP counter increases by 20 once (clicking twice doesn't double it); after the reflections, `completeLesson` is called
  - `PeekModel` shows the text `export function simulate`
- [ ] **Step 2:** Run `npx vitest run src/sims src/lab`. Expected: FAIL.
- [ ] **Step 3:** Implement.
  - Keep `model.ts` short, readable and commented; learners read it.
  - Canvas drawing is skipped in jsdom when `getContext` returns null.
- [ ] **Step 4:** Run `npx vitest run src/sims src/lab`. Expected: PASS.
- [ ] **Step 5:** Commit "feat(lab): lab player, peek-at-model, membrane threshold sim".

---

### Task 10: Myelin speed-race simulation

**Files:**
- Create: `src/sims/myelin/model.ts`, `src/sims/myelin/MyelinSim.tsx`, `src/sims/myelin/model.test.ts`
- Modify: `src/lab/registry.ts` (adds `myelin`)

**Interfaces:**
- Consumes: `SimProps` (Task 9).
- Produces:
  - `type AxonParams = { diameterUm: number /*0.5–20*/; myelinated: boolean; demyelinatedFraction: number /*0–1*/ }`
  - `velocity(p): number | null` (m/s; `null` means conduction block):
    - unmyelinated: `1.1 * sqrt(d)`
    - myelinated: `6 * d` (Hursh factor)
    - demyelination: when `demyelinatedFraction >= 0.6`, return `null`; otherwise `6*d * (1 - f) + 1.1*sqrt(d) * f`
    - the doc comment states these are teaching approximations
  - `travelTimeMs(p, distanceM = 1.0): number | null`
  - `GOAL_MS = 20`
  - `goalMet(p): boolean`: myelinated, `demyelinatedFraction === 0` and `travelTimeMs < GOAL_MS`
- MyelinSim:
  - diameter slider, myelin toggle, demyelination slider
  - a horizontal "spinal cord → big toe (1 m)" track with an animated dot (CSS transform, respecting `prefers-reduced-motion`) and the time readout
  - "Conduction block" message when `null`
  - calls `onGoalMet` when `goalMet` becomes true after the learner presses "Send impulse"

- [ ] **Step 1: Write failing tests:**
  - `velocity({d:1,unmyelinated})` ≈ 1.1
  - `velocity({d:10,myelinated,f:0}) === 60`
  - `travelTimeMs` at d=10 myelinated ≈ 16.7
  - `goalMet({d:10,myelinated,f:0})` true; `goalMet({d:3,myelinated,f:0})` false (55.6 ms)
  - `velocity(... f:0.6) === null`
  - f=0.3 gives a speed between the unmyelinated and myelinated values
- [ ] **Step 2:** Run `npx vitest run src/sims/myelin`. Expected: FAIL.
- [ ] **Step 3:** Implement.
- [ ] **Step 4:** Run `npx vitest run src/sims/myelin`. Expected: PASS.
- [ ] **Step 5:** Commit "feat(sims): myelin conduction speed race".

---

### Task 11: Case player

**Files:**
- Create: `src/case/caseRun.ts`, `src/case/CaseScreen.tsx`, `src/case/case.test.tsx`
- Modify: `src/lesson/LessonScreen.tsx` (delegates `type: 'case'`)

**Interfaces:**
- Consumes: `isCorrect`, `XP` (Task 4); `QuestionView`, `FeedbackBar`, `RichText` (Task 7); `FIGURES` (Task 7); `Tap3d` (Task 7, upgraded in 13); `completeLesson`, `addXp` (Task 5).
- Produces:
  - `type CaseState = { unlocked: Set<string>; missed: string[]; finalAttempts: number; solved: boolean; xp: number }`
  - `startCase(c: Case): CaseState` (clues without `unlock` start unlocked)
  - `unlockClue(s, clueId, correct): CaseState` (+10 XP if correct; a miss is recorded once)
  - `canMakeFinalCall(c, s): boolean` (all clues unlocked)
  - `finalCall(c, s, pickedId): { state: CaseState; explanation: LText; correct: boolean }` (correct → solved, +50 XP)
- CaseScreen (paper-card treatment via theme tokens: off-white card, typewriter-feel heading using Nunito 900 uppercase letter-spaced, folder tab):
  - the story, then the clue list
  - a locked clue shows "Unlock" → opens its question inline
  - the final call panel (choice buttons, a `FIGURES` tap, or a `Tap3d`)
  - each wrong pick shows its explanation; the learner can try again
  - when solved: the `solved` text, Dendri cheer, then `completeLesson`

- [ ] **Step 1: Write failing tests** with a fixture case (3 clues, the 3rd locked; final choice with 3 options):
  - `canMakeFinalCall` is false until the 3rd clue is unlocked
  - a wrong unlock keeps it locked and records the miss
  - a wrong final returns that option's explanation, `solved` false
  - the correct final → solved, xp includes +50
  - CaseScreen play-through calls `completeLesson` once
- [ ] **Step 2:** Run `npx vitest run src/case`. Expected: FAIL.
- [ ] **Step 3:** Implement.
- [ ] **Step 4:** Run `npx vitest run src/case`. Expected: PASS.
- [ ] **Step 5:** Commit "feat(case): clinical case player with clue unlocking and final call".

---

### Task 12: Real-anatomy brain model pipeline

**Files:**
- Create: `scripts/models/sources.yaml`, `scripts/models/build-brain.mjs`, `scripts/models/README.md`, `docs/models/MODELS.md`, `tests/brainModel.test.ts`, `public/models/brain.glb`
- Modify: `content/structures.yaml` (`meshNodes`, `twoDOnly`), `package.json` (adds `"build:brain": "node scripts/models/build-brain.mjs"`, dev deps `obj2gltf @gltf-transform/core @gltf-transform/functions @gltf-transform/extensions meshoptimizer`)

**Interfaces:**
- Consumes: `Structure` (Task 3).
- Produces:
  - `public/models/brain.glb`: one mesh node per entry in each structure's `meshNodes`, with the node name equal to that entry.
    - Centred at the origin. Scaled so the bounding box's longest side is 2 units.
    - +Y up, +Z anterior (front of the face). Left hemisphere at −X: anatomical left = −X, so `_L` nodes have negative-X centroids.
  - `docs/models/MODELS.md`, with one row per mesh node:
    - source dataset, original file or ID
    - license
    - required attribution text
    - triangle count after simplification
    - also a "Fallbacks" section listing any structure left `twoDOnly` and why
  - `scripts/models/sources.yaml`: maps each mesh node to source file(s) under `scripts/models/raw/` (git-ignored) and any per-source transform.

- **Source preference order:**
  1. **BodyParts3D** (CC BY-SA 2.1 JP). It comes from a single body, so all parts share one coordinate frame and alignment is free. Find the brain parts' FMA IDs in its parts list.
  2. If lobes aren't separate meshes there: a **Brainder** FreeSurfer pial surface with Desikan annotation, merging labels into the four lobes (fallback 1 from the spec: real cortex, painted/split by a real atlas parcellation).
  3. **NIH 3D** 3DPX-000761 / 3DPX-001944 for deep structures only if 1 doesn't cover them and alignment succeeds.
- **Time box:** if a structure isn't loaded and aligned after two full attempts with different sources, set `twoDOnly: true`, keep `meshNodes: []`, and log it in MODELS.md under Fallbacks. Never hand-model a substitute.

- [ ] **Step 1: Write the failing test** `tests/brainModel.test.ts`. Using `@gltf-transform/core` `NodeIO`, read `public/models/brain.glb` and assert:
  - the file size is ≤ 20 MB
  - the set of node names equals the union of `meshNodes` from `content/structures.yaml`
  - every `_L` node centroid has x < 0 and every `_R` node x > 0
  - the scene's bounding box longest side is within 2 ± 0.05
  - every structure with `twoDOnly: true` has `meshNodes: []`, and every structure with `twoDOnly` absent/false has ≥ 1 node
- [ ] **Step 2:** Run `npx vitest run tests/brainModel.test.ts`. Expected: FAIL (no GLB).
- [ ] **Step 3: Survey sources** without downloading large files yet: read the BodyParts3D parts list/README and the Brainder and NIH 3D pages. Write the planned mapping into `scripts/models/sources.yaml` and the license rows into MODELS.md.
- [ ] **Step 4: Ask the user** in chat for permission to download, listing each file's name, source URL and size. Wait for an explicit yes. Then download into `scripts/models/raw/`.
- [ ] **Step 5: Implement `build-brain.mjs`.** It:
  1. converts OBJ → glTF (`obj2gltf`)
  2. merges into one document
  3. names nodes from `sources.yaml`
  4. applies the transform: centre the union bbox, uniform scale to longest side 2, and rotate into the +Y up / +Z anterior frame (rotation per source in `sources.yaml`)
  5. simplifies each mesh with `meshoptimizer`'s simplify (target ratio per node in `sources.yaml`; aim for ≤ 300k triangles total)
  6. applies `weld` + `dedup` + `prune`
  7. writes `public/models/brain.glb` with meshopt compression (`EXTMeshoptCompression`)
- [ ] **Step 6:** Run `npm run build:brain && npx vitest run tests/brainModel.test.ts`. Expected: PASS. If a structure fails its time box, apply the fallback, update `structures.yaml` and MODELS.md, and re-run until PASS.
- [ ] **Step 7:** Update `content/structures.yaml` `meshNodes`, then run `npm test` (the real-content validation is still green).
- [ ] **Step 8:** Commit "feat(brain): real-anatomy brain.glb pipeline with sources and licenses". Don't commit `scripts/models/raw/`.

---

### Task 13: 3D brain viewer, Explorer, Explore modal, tap3d

**Files:**
- Create: `src/brain/visual.ts`, `src/brain/webgl.ts`, `src/brain/BrainCanvas.tsx`, `src/brain/BrainModal.tsx`, `src/brain/ExplorerScreen.tsx`, `src/brain/brain.test.tsx`
- Modify:
  - `src/lesson/questions/Tap3d.tsx`: lazy-loads BrainCanvas, falling back to the existing list
  - `src/lesson/CardView.tsx`: the "Explore in 3D" button opens `BrainModal`
  - `src/case/CaseScreen.tsx`: uses the new Tap3d
  - `src/config.ts`: `BRAIN_ENABLED = true`
  - `src/ui/routes.tsx`: `/brain`

**Interfaces:**
- Consumes: `Structure`s (Task 3); `brain.glb` node names (Task 12); `useProgress().discovered`, `recordStructureQuiz` (Task 5); `useLang`, `pick` (Task 2).
- Produces:
  - `type VisualState = 'highlight' | 'discovered' | 'undiscovered' | 'hidden'`
  - `visualState(structureId, ctx: { discovered: Set<string>; highlight: string[]; only?: string[]; hemisphere: 'both'|'left'|'right'; node: string }): VisualState`
    - `hidden` when it's not in `only` (if set), or when the node suffix doesn't match the hemisphere (`_L` hidden for 'right', `_R` hidden for 'left'; unsuffixed nodes are always shown)
    - `highlight` if in `highlight`
    - `discovered` if in `discovered`
    - otherwise `undiscovered`
  - `nodeToStructure(nodes: Structure[]): Record<nodeName, structureId>`
  - `hasWebGL(): boolean`
  - `<BrainCanvas highlight?: string[]; only?: string[]; focus?: string[]; labels: boolean; translucentCortex: boolean; hemisphere; onPick?(structureId): void; onError?(): void />`
    - loads `./models/brain.glb` with drei `useGLTF` (meshopt decoder)
    - `MeshToonMaterial` with a 3-step gradient map
    - colours:
      - highlight = mascot purple `#9B82FF`
      - discovered = the colour of the first unit that taught it (from the `units` field)
      - undiscovered = `#D5D9E0`
    - translucent cortex = lobes at opacity 0.25 with `depthWrite=false`
    - `OrbitControls`; reset-view button; the camera frames the bbox of `focus` nodes
    - labels via drei `Html` for discovered/highlighted structures when `labels`
    - pointer pick → structure ID
    - load errors are caught by an error boundary and call `onError`
  - `<BrainModal structures: string[] onClose />`: a full-screen overlay with BrainCanvas focused and highlighted on those structures, plus a "Find it" prompt cycling through them (correct → green flash).
  - ExplorerScreen (`/brain`):
    - BrainCanvas with all discovered structures coloured and labelled
    - toggles: translucent cortex, hemisphere (both/left/right), "Only unit…" select
    - side panel on pick:
      - discovered: the name in the current language, plus other-language names when present (otherwise "FR/中文: coming soon"), the note, "Taught in Unit N" and a "Quiz me" button
      - undiscovered: "Not discovered yet"
    - Quiz me: hides labels, prompts "Find: <name>", and the pick result calls `recordStructureQuiz`
    - `twoDOnly` structures are listed below the canvas as "2D only" chips
  - **Fallback (Review Focus 4):** if `!hasWebGL()` or `onError` fired:
    - Explorer/Modal show "3D isn't available on this device. Here's the list of structures instead." plus a list
    - `Tap3d` renders a multiple-choice list of 4 names: the answer plus 3 others from `structures`, chosen with a shuffle seeded by question ID

- [ ] **Step 1: Write failing tests:**
  - `visualState` table tests: hemisphere hiding, the `only` filter, highlight beating discovered, undiscovered
  - `nodeToStructure` maps `frontal-lobe_L` → `frontal-lobe`
  - **Review Focus 4:** with `hasWebGL` mocked false, a fixture lesson containing a `tap3d` question renders 4 name buttons; picking the right one → correct feedback; ExplorerScreen shows the fallback text and the structure list
  - Explorer side panel: for an undiscovered structure it shows "Not discovered yet"
- [ ] **Step 2:** Run `npx vitest run src/brain`. Expected: FAIL.
- [ ] **Step 3:** Implement. Load BrainCanvas with `React.lazy`, so three.js is a separate chunk.
- [ ] **Step 4:** Run `npm test`, then `npm run dev`. Check in the browser:
  - `/brain` rotates and zooms
  - a picked structure shows its panel
  - the translucent toggle reveals the hypothalamus/brainstem (if present)
  - hemisphere isolate works
  Expected: PASS and visually correct.
- [ ] **Step 5:** Commit "feat(brain): toon 3D viewer, explorer, explore modal, 3D tap questions with fallback".

---

### Task 14: Unit 1 content (Bites)

**Files:**
- Create: `content/lessons/u01/u01-b01.yaml` … `u01-b06.yaml`; illustration/figure components in `src/illustrations/` (`neuron.tsx`, `neuronTypes.tsx`, `glia.tsx`, `myelin.tsx`, `cnsPns.tsx`, `meninges.tsx`, `nerve.tsx`)
- Modify: `content/units/u01.yaml` (lessons), `content/glossary.yaml`, `content/structures.yaml` (EN names and notes, `units`), `src/illustrations/registry.ts`

**Interfaces:**
- Consumes: the schema (Task 3), registries (Task 7).
- Produces:
  - **Figures with regions** (for tap2d):
    - `neuron`: `dendrites`, `soma`, `axon-hillock`, `axon`, `myelin`, `node-of-ranvier`, `terminal`
    - `cnsPns`: `brain`, `spinal-cord`, `peripheral-nerve`
    - `meninges`: `dura`, `arachnoid`, `pia`, `skull`
  - Other illustrations are plain flat SVGs in the Direction A palette, with navy outlines and rounded strokes.

**Bite outline** (titles fixed; content original; `sources` from the spec appendix M1):

| Lesson | Title | Topics | Sources |
|--------|-------|--------|---------|
| b01 | Meet the neuron | dendrites in, soma, axon, terminals out; information flows one way | Meet the Stars: Neurons; Parts of the Neuron |
| b02 | No two neurons alike | shape follows job: multipolar, bipolar, unipolar; Purkinje vs motor neuron; size range | Neuronal Uniqueness: Stars of the Sky |
| b03 | Glia, the support crew | astrocytes, oligodendrocytes, Schwann cells, microglia; what each does | Glial Cells |
| b04 | Myelin and when it fails | saltatory conduction, nodes of Ranvier; CNS (oligodendrocyte) vs PNS (Schwann); MS and Guillain-Barré as CNS vs PNS demyelination | Myelin; Demyelinating Diseases |
| b05 | Two systems: CNS and PNS | brain + spinal cord vs nerves; meninges layers and what they protect; CSF; `explore3d: [spinal-cord, cerebellum, frontal-lobe]` | Meninges |
| b06 | When things go wrong outside and inside | peripheral neuropathy basics; brain tumors are mostly glial or meningeal, not neuronal (why: neurons rarely divide) | Peripheral Diseases; Brain Tumors |

- Across b01–b06:
  - Use every question kind except `termmatch` at least once (`tap3d` at least once, in b05).
  - Every card has ≥ 1 glossary term.
  - At least two cards have a `dev` analogy, e.g. "neuron as a function: many inputs, one output; breaks: it's analog and leaky, not a pure function".
- Glossary entries are EN only, with `roots` where useful (e.g. dendrite ← Greek *dendron*, tree).

- [ ] **Step 1:** Write the lesson YAML, glossary and structure notes, and the illustrations. Register the figures with their region IDs.
- [ ] **Step 2:** Run `npx vitest run tests/realContent.test.ts`. Expected: PASS (zero validator errors, word limits respected).
- [ ] **Step 3:** In `npm run dev`, play b01–b06 end to end. Expected: each takes 3–5 minutes, every illustration renders, and every tap2d region is clickable.
- [ ] **Step 4:** Commit "content(u01): six bites with illustrations and glossary".

---

### Task 15: Unit 1 content (Lab and Case)

**Files:**
- Create: `content/lessons/u01/u01-lab-myelin.yaml`, `content/lessons/u01/u01-case-tingling.yaml`
- Modify: `content/units/u01.yaml` (lesson order: b01, b02, b03, b04, lab-myelin, b05, b06, case-tingling), `content/glossary.yaml`

**Content decisions:**
- **Lab `u01-lab-myelin`:**
  - sim `myelin`
  - goal: "Get the signal from the spinal cord to the big toe (1 m) in under 20 ms."
  - simplified note: the velocity formulas are rules of thumb, real axons vary, and real demyelination is patchy
  - reflection (2–3): why thicker myelinated axons win; what demyelination does to timing; why a small unmyelinated pain fibre is slow (dull ache arrives late)
- **Case `u01-case-tingling`:**
  - Original patient: 34-year-old, a week after a stomach flu. Tingling feet, then weakness climbing up both legs over days; reflexes absent; brain MRI normal.
  - Clues: the k1 story; k2 "symmetric, starts in feet" (unlock: an mc on PNS vs CNS); k3 "MRI of brain normal" (unlock: a tfwhy on where MS lesions are seen).
  - Final call (`kind: choice`): "Whose myelin is under attack?"
    - Options: Schwann cells' (correct, PNS / Guillain-Barré-like); oligodendrocytes'; astrocytes'; the neurons' own axon membrane.
    - Each option gets an explanation.
  - `verify: true` on the clinical-timeline clue.

- [ ] **Step 1:** Write both YAML files and the glossary additions.
- [ ] **Step 2:** Run `npx vitest run tests/realContent.test.ts`. Expected: PASS.
- [ ] **Step 3:** In the dev server, play the Lab and Case. Expected: the Lab goal is reachable (d ≥ 9 µm, myelinated, no demyelination); the Case solves; badge u01 is earned; the structures from b05 show as discovered in `/brain`.
- [ ] **Step 4:** Commit "content(u01): myelin lab and tingling-feet case".

---

### Task 16: Unit 2 content, Bites 1–4 (neural communication)

**Files:**
- Create: `content/lessons/u02/u02-b01.yaml` … `u02-b04.yaml`; illustrations `membrane.tsx` (ions, pump), `actionPotential.tsx` (voltage plot), `synapse.tsx` (figure)
- Modify: `content/glossary.yaml`, `src/illustrations/registry.ts`

**Figure regions:** `synapse`: `presynaptic-terminal`, `vesicle`, `cleft`, `receptor`, `postsynaptic`, `reuptake-transporter`.

**Bite outline** (`sources` from the spec appendix M2):

| Lesson | Title | Topics | Sources |
|--------|-------|--------|---------|
| b01 | A battery made of salt | ions (Na⁺, K⁺, Cl⁻), membrane, Na⁺/K⁺ pump, resting −70 mV; voltage as "pressure" | Electrical Language; Electricity Review |
| b02 | The action potential | threshold −55, Na⁺ in, K⁺ out, overshoot to +40, undershoot, refractory period, all-or-none, propagation | Action Potential |
| b03 | Packing and sending messages | neurotransmitter synthesis (small molecules vs peptides), vesicles, Ca²⁺-triggered release | Neurotransmitter Synthesis; Neurotransmitter Release |
| b04 | Botox and the clostridial toxins | SNARE proteins, botulinum blocks ACh release at the neuromuscular junction, tetanus toxin blocks inhibitory release; medical/cosmetic Botox | Clostridial Toxins: Botox |

- b02 includes a `dev` analogy: "a debounced event: only fires past a threshold; breaks: refractory period and analog summation".
- b02 or b03 includes a tap2d on `synapse`.

- [ ] **Step 1:** Write the lessons, glossary entries and illustrations.
- [ ] **Step 2:** Run `npx vitest run tests/realContent.test.ts`. Expected: PASS.
- [ ] **Step 3:** In the dev server, play b01–b04. Expected: they play, at 3–5 minutes each.
- [ ] **Step 4:** Commit "content(u02): bites 1–4 on membrane, action potential, release, toxins".

---

### Task 17: Unit 2 content, Bites 5–8 (signal end, receptors, embodied emotion)

**Files:**
- Create: `content/lessons/u02/u02-b05.yaml` … `u02-b08.yaml`; illustrations `receptors.tsx`, `autonomic.tsx` (figure), `spinalLevels.tsx` (figure)
- Modify: `content/glossary.yaml`, `content/structures.yaml` (adds `units: [u02]` where used), `src/illustrations/registry.ts`

**Figure regions:**
- `autonomic`: `brainstem-vagus`, `thoracolumbar-chain`, `sacral-outflow`, `heart`, `gut`, `pupil`
- `spinalLevels`: `cervical`, `thoracic`, `lumbar`, `sacral`

**Bite outline:**

| Lesson | Title | Topics | Sources |
|--------|-------|--------|---------|
| b05 | Ending the signal; two kinds of receptor | diffusion, enzymatic breakdown (AChE), reuptake (SSRIs as example); ionotropic (fast, channel) vs metabotropic (slow, G-protein cascade) | Signal Termination; Receptors; Metabotropic Receptors; Wrap-Up |
| b06 | The gut's own brain and the two autonomic branches | enteric NS; sympathetic "fight or flight" vs parasympathetic "rest and digest", where each leaves the CNS | Introduction to Embodied Emotion; Enteric Nervous System; Parasympathetics & Sympathetics |
| b07 | Balance and the drugs that tip it | the PS/S balance in everyday states (fear, digestion, arousal); beta blockers, atropine as examples | Parasympathetic/Sympathetic Balance; Autonomic Pharmacology |
| b08 | Spinal cord injury | what level of injury affects what; autonomic consequences; `explore3d: [spinal-cord, brainstem, hypothalamus]`; a tap3d on `spinal-cord` | Spinal Cord Injury; Wrap-Up: Embodied Emotion |

- [ ] **Step 1:** Write the lessons, glossary entries, structure notes and illustrations.
- [ ] **Step 2:** Run `npx vitest run tests/realContent.test.ts`. Expected: PASS.
- [ ] **Step 3:** In the dev server, play b05–b08. Expected: they play; the Explore modal opens on the spinal cord.
- [ ] **Step 4:** Commit "content(u02): bites 5–8 on receptors, autonomic system, spinal injury".

---

### Task 18: Unit 2 content (Lab and Case)

**Files:**
- Create: `content/lessons/u02/u02-lab-threshold.yaml`, `content/lessons/u02/u02-case-canned-food.yaml`
- Modify: `content/units/u02.yaml` (order: b01, b02, lab-threshold, b03, b04, b05, b06, b07, b08, case-canned-food), `content/glossary.yaml`

**Content decisions:**
- **Lab `u02-lab-threshold`:**
  - sim `threshold`
  - goal: "Find the smallest stimulus that makes the neuron fire."
  - simplified note: not Hodgkin–Huxley; a fixed waveform; real thresholds vary and stimuli sum over time and space
  - reflection: what "all-or-none" means for a stronger stimulus (same height, more frequent spikes); what the refractory period prevents
- **Case `u02-case-canned-food`:**
  - Original patient: 45-year-old who ate home-canned beans. Next day: droopy eyelids, double vision, then weakness spreading downward; alert and sensation normal.
  - Clues: k1 story; k2 "pupils dilated, dry mouth" (unlock: an mc on the parasympathetic/ACh link); k3 "muscle responds to direct electrical stimulation" (unlock: a tfwhy on whether the muscle itself is damaged).
  - Final call (`kind: tap2d`, figure `synapse`): "Where does the toxin act?"
    - Answer: `presynaptic-terminal` (blocks ACh vesicle release).
    - Explanations for every other region: cleft, receptor (myasthenia-like), reuptake-transporter, vesicle (near: it's the fusion, not the vesicle's content), postsynaptic.
  - `verify: true` on the symptom-onset timing clue.

- [ ] **Step 1:** Write both YAML files and the glossary additions.
- [ ] **Step 2:** Run `npx vitest run tests/realContent.test.ts`. Expected: PASS.
- [ ] **Step 3:** In the dev server, play the Lab and Case. Expected: the Lab goal is met at 15 mV; the Case solves; badge u02 is earned.
- [ ] **Step 4:** Commit "content(u02): threshold lab and canned-food case".

---

### Task 19: Offline build, README, full walk-through

**Files:**
- Create: `README.md` covering:
  - how to run, test and build
  - how to edit content: the YAML format, rich-text markup, IDs, the validator
  - how to rebuild the brain model
  - the English-first rule
- Modify: anything the walk-through finds broken (each fix with a test if it's logic).

- [ ] **Step 1:** Run `npm run typecheck && npm test && npm run build`. Expected: all pass; the brain chunk is separate in `dist/assets/`.
- [ ] **Step 2:** Run `npx vite preview` and walk the whole app in a browser:
  - path → every Unit 1 and 2 lesson → Glossary (terms present, search works) → `/brain` (discovered structures coloured, Quiz me works)
  - reload the page: progress is kept
  - in DevTools, clear localStorage, then put `{bad` under the key: the app still loads
  Expected: no console errors.
- [ ] **Step 3:** Fix any defects found (each with a regression test where it's logic), then re-run Step 1.
- [ ] **Step 4:** Commit "docs: README; phase 1 walk-through fixes".
- [ ] **Step 5:** Tell the learner Phase 1 English is ready for their review. **Don't start FR/ZH** until they sign off.
