# Unit 3 Part 3 (Blood Supply, Stroke, Case) + Back Navigation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Finish Unit 3 with 4 Bites on blood supply, stroke and bleeds, a "Block an artery" Lab and the unit's Case, and add a read-only Back button inside every Bite and Lab.

**Architecture:** Back navigation is a pure history model (`src/engine/history.ts`) that `RunPlayer` keeps beside its run, saves with its snapshot, and renders read-only; `LessonFrame` gets an optional `onBack`. LabScreen moves between its phases on Back. The Lab is a pure model plus a tap-only React view, like `src/sims/lesion/`. New 2D art lives in `src/illustrations/`; all lesson text is YAML.

**Tech Stack:** Vite, React 19, TypeScript, zustand, zod, Vitest + Testing Library.

**Spec:** `docs/superpowers/specs/2026-11-24-unit-3-part-3-blood-supply-design.md`

## Global Constraints

- Every new text is in en + fr + zh (Simplified). UI strings go in all three of `src/i18n/ui.{en,fr,zh}.ts`; drawn text goes through `ART_TEXT` in `src/illustrations/artText.ts`.
- Every new glossary term has `unit: u03` and Wikipedia links (en always; fr and zh where an article exists, found via `scratchpad/wiki.mjs`, batched).
- No developer or code metaphors in content. British spelling in English, as in the rest of the unit.
- Never name the course platform, the course title or the university. `sources:` use the video titles: "Oxygen and Cerebral Blood Flow", "Blood Supply", "Strokes and Tumors", "Bleeds".
- Uncertain or simplified clinical claims carry `verify: true`. No treatment instructions.
- Going back never changes XP, the review queue, `missed`, or the progress bar.
- Commits use the repo-local git config, and the message ends with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- Gate for every task: `npm test`, `npm run typecheck`, `npm run lint` all clean.

## Review Focus

1. **Resuming a lesson saved before this change** (snapshot with no `history`): it must still resume, with an empty history. Test in Task 2.
2. **A question answered wrong then right**: Back must show both attempts as separate pages, the wrong one first. Test in Task 1 and Task 2.
3. **Pressing Back while a live answer is half-built**: coming forward again must restore the unchecked draft. Test in Task 2.
4. **Lab: Back from the sim after the goal, then forward again**: the goal stays met, no extra XP. Test in Task 3.
5. **Language switch while reviewing a past page**: the page re-renders in the new language and stays read-only. Covered by rendering through `useLang`. The final reviewer checks it by reading the code.

---

### Task 1: History model

**Files:**
- Create: `src/engine/history.ts`
- Test: `src/engine/history.test.ts`

**Interfaces:**
- Produces:
  ```ts
  export type Page =
    | { kind: 'card'; id: string }
    | { kind: 'question'; id: string; response: Response; result: 'correct' | 'wrong' }
  export type History = { pages: Page[]; at: number | null } // at = index of the page being reviewed; null = live
  export const emptyHistory: History
  export function leave(h: History, page: Page): History // push when Continue leaves a live page
  export function back(h: History): History              // null → last page; i → max(0, i-1)
  export function forward(h: History): History           // i → i+1, or null after the last page
  export function canGoBack(h: History): boolean         // pages.length > 0 && at !== 0
  export function reviewing(h: History): Page | null
  ```

- [ ] **Step 1: Write the failing tests** in `src/engine/history.test.ts`:
  - `back from live goes to the last page`: `back(leave(leave(emptyHistory, c1), q1))` gives `at: 1`, and `reviewing` is q1.
  - `back stops at the first page`: from `at: 0`, `back` stays `at: 0`, and `canGoBack` is false.
  - `forward past the last page returns to live`: `at: 1` with 2 pages → `forward` → `at: null`.
  - `a question answered twice is two pages`: leave q1 wrong, then q1 correct → `pages.length === 2`, with results `['wrong','correct']`.
  - `no history means no back`: `canGoBack(emptyHistory) === false`.
- [ ] **Step 2:** Run `npx vitest run src/engine/history.test.ts`. Expected: FAIL, module not found.
- [ ] **Step 3:** Implement `src/engine/history.ts`, using pure immutable updates. Import `Response` from `./check`.
- [ ] **Step 4:** Run the same command. Expected: 5 passed.
- [ ] **Step 5: Commit** `feat(lesson): a history of pages seen, for going back`.

### Task 2: Back inside Bites (RunPlayer, LessonFrame, FeedbackBar)

**Files:**
- Modify: `src/lesson/RunPlayer.tsx`, `src/lesson/LessonFrame.tsx`, `src/lesson/FeedbackBar.tsx`, `src/i18n/ui.{en,fr,zh}.ts`, `src/styles/*.css` (whichever file styles `.lesson__quit`)
- Test: `src/lesson/back.test.tsx` (use the same harness as `resume.test.tsx`: `open()`, `click()`, `mcq()` fixtures)

**Interfaces:**
- Consumes: Task 1.
- Produces:
  - `LessonFrame` gets the prop `onBack?: () => void`. When it is set, it renders `<button className="lesson__back" aria-label={t('back')}>←</button>` before ✕.
  - `RunPlayer` gets two new props:
    - `onBackFromStart?: () => void`: Back on the first live page, with no history, calls it.
    - `startAtEnd?: boolean`: cards-only plans only. The run starts at the last step, and the history holds every earlier card. A saved place is ignored.
  - `FeedbackBar` gets the prop `review?: boolean`. In review it uses the titles `reviewCorrect` / `reviewWrong`, shows no hint and no XP, and shows `reviewLater` on a wrong page.
  - `Snapshot` gains `history: History`. `restore` defaults a missing `history` to `emptyHistory` and resets `at` to `null`.
- New UI strings (en / fr / zh):
  - `back`: "Go back" / "Revenir en arrière" / "返回上一页"
  - `reviewCorrect`: "You got this right" / "Vous aviez bon" / "这题你答对了"
  - `reviewWrong`: "Not quite, this time" / "Pas tout à fait, cette fois-là" / "这次没答对"
  - `reviewLater`: "You answered it again later in the lesson." / "Vous y avez répondu à nouveau plus loin dans la leçon." / "你在本课后面又答了一次。"

Behaviour:
- Continue on a live page calls `leave()` with that page. For a question, the page records the checked response and result.
- While `at !== null`, the player renders the reviewed page:
  - a card via `CardView`;
  - a question via `QuestionView` with `disabled`, the page's `response` and `result`, and a no-op `onChange`, plus `FeedbackBar review state={result} onContinue={forward}`.
- The progress bar always uses the live `correctCount`.

- [ ] **Step 1: Write the failing tests** in `src/lesson/back.test.tsx`:
  - `the first page has no Back button`: `screen.queryByRole('button', { name: 'Go back' })` is null.
  - `Back returns to the previous card, Continue comes forward again`: continue past c1, click Go back → 'Intro card.' is visible; Continue → 'Question q1?'.
  - `an answered question is read-only on Back, with its explanation`: answer q1 Alpha and continue, then Go back. The 'Alpha' option is disabled, 'You got this right' and 'Because q1.' show, and there's no Check button.
  - `going back changes no XP and no progress`: after the above, XP is still 10 and the progress bar value is '1'. Go forward and check the same.
  - `a wrong then right answer shows as two pages`: q1 Beta (wrong), then go on to the end where q1 comes back, answer Alpha. Back repeatedly to reach both: one page shows 'Not quite, this time' and 'You answered it again later in the lesson.', the other 'You got this right'.
  - `an unchecked draft survives a trip back`: on q2, pick Alpha without checking, Go back, Continue. The q2 Alpha option is selected and Check is enabled.
  - `the history survives leaving and reopening`: answer q1, continue, unmount, reopen, Go back. The q1 review page shows.
  - `a saved place from before history still resumes`: put `progressStore.getState().saveLessonState('u01-b20:run'…)` (use the key RunPlayer actually uses, from LessonScreen) with a snapshot without `history`. Open → it resumes on that question, and there's no Back crash.
- [ ] **Step 2:** Run `npx vitest run src/lesson/back.test.tsx`. Expected: FAIL (no 'Go back' button).
- [ ] **Step 3:** Implement the strings, then `LessonFrame.onBack`, then `FeedbackBar.review`, then RunPlayer's history state, review rendering, `startAtEnd`, `onBackFromStart` and snapshot. Style `.lesson__back` like `.lesson__quit`.
- [ ] **Step 4:** Run the new test file, then `npm test`. Expected: all pass; `resume.test.tsx` and `lesson.test.tsx` unchanged and green.
- [ ] **Step 5: Commit** `feat(lesson): go back to earlier cards and answered questions, read-only`.

### Task 3: Back between Lab phases

**Files:**
- Modify: `src/lab/LabScreen.tsx`
- Test: `src/lab/lab.test.tsx` (add to it)

**Interfaces:**
- Consumes: `RunPlayer.startAtEnd`, `RunPlayer.onBackFromStart`, `LessonFrame.onBack` (Task 2).
- Behaviour:
  - The sim phase gets `onBack={() => { setIntroAtEnd(true); setPhase('intro') }}`. The intro RunPlayer gets `startAtEnd={introAtEnd}`.
  - The reflect RunPlayer gets `onBackFromStart={() => setPhase('sim')}`.
  - `introAtEnd` is not saved: it's a one-off.

- [ ] **Step 1: Write the failing tests** in `lab.test.tsx`:
  - `Back on the sim returns to the last intro card`.
  - `Back on the first reflection question returns to the sim with the goal kept`: reach the goal, continue, Go back → the sim footer shows the goal-met title, and XP is unchanged after going forward again.
  - `the first intro card has no Back`.
- [ ] **Step 2:** Run `npx vitest run src/lab/lab.test.tsx`. Expected: the 2 new Back tests fail.
- [ ] **Step 3:** Implement it in `LabScreen.tsx`.
- [ ] **Step 4:** Run `npm test`. Expected: all pass.
- [ ] **Step 5: Commit** `feat(lab): go back from the sim to the intro, and from the questions to the sim`.

### Task 4: Blood-supply art

**Files:**
- Create:
  - `src/illustrations/arteries.tsx`: `ArteriesArt`, the brain from below, with these arteries labelled:
    - internal carotid (both)
    - vertebral (both)
    - basilar
    - the circle of Willis ring
    - ACA, MCA and PCA leaving it
    - the front marked.
  - `src/illustrations/territories.tsx`:
    - `ARTERIES = ['aca','mca','pca'] as const`, `type Artery`, `TERRITORY_COLOR: Record<Artery,string>`.
    - `TerritoryViewsArt({ lit?: Artery; side?: 'left'|'right' })`: side view and middle view next to each other, territories filled. The `lit` one is full colour and the others are faded. With no `lit`, all are full colour. The side view reuses the `lateralBrain.tsx` outline path. Labels: "side view", "middle view", "front".
    - `TERRITORY_REGIONS = ['aca-left','mca-left','pca-left','aca-right','mca-right','pca-right']` and `TerritoriesTopArt(art: ArtProps)`: the two hemispheres seen from above, front at the top, left hemisphere on the left. Each has an ACA strip along the midline, an MCA area on the outer side and a PCA area at the back. It has tappable `Region`s with names like "Left middle cerebral artery territory", and labels "left", "right", "front".
  - `src/illustrations/bleeds.tsx`: `BLEED_REGIONS = ['epidural','subdural','subarachnoid']` and `BleedsArt(art)`. It is a cut through skull → dura → arachnoid → pia → brain, with a blood pocket at each level:
    - epidural: lens-shaped, between the skull and the dura;
    - subdural: crescent, under the dura;
    - subarachnoid: thin, spread in the grooves.
- Modify:
  - `src/illustrations/registry.tsx`:
    - ILLUSTRATIONS: `arteries`, `territories`, `territories-top`, `bleeds`;
    - FIGURES: `territories-top`, `bleeds`.
  - `src/illustrations/artText.ts`: every new label in fr and zh.
- Test: the existing art-text test (it scans `<Label>` and `label=`), plus `src/illustrations/territories.test.tsx`:
  - `TerritoriesTopArt offers six named territories`: 6 buttons, including 'Left middle cerebral artery territory'.
  - `the lit territory is the only full-colour one`: `TerritoryViewsArt lit="mca"`; the elements with `data-artery="mca"` have `data-lit="true"` and the others `"false"`.

- [ ] **Step 1:** Write `territories.test.tsx`. Run it. Expected: FAIL, module not found.
- [ ] **Step 2:** Draw the three files, register them, and add the ART_TEXT entries.
- [ ] **Step 3:** Run `npm test`. Expected: all pass, including the art-text scan.
- [ ] **Step 4:** Take headless screenshots of each figure through a temporary Bite or the Lab once Task 6 is done. Check there's no clipping and no overlapping labels. Fix anything you see.
- [ ] **Step 5: Commit** `feat(art): arteries, territories (side, middle, from above) and bleeds`.

### Task 5: Artery Lab model

**Files:**
- Create: `src/sims/artery/model.ts`
- Test: `src/sims/artery/model.test.ts`

**Interfaces:**
- Consumes: `Artery` from `src/illustrations/territories.tsx`.
- Produces:
  ```ts
  export type Side = 'left' | 'right'
  export type Patient = { id: 'p1' | 'p2' | 'p3'; artery: Artery; side: Side }
  export const PATIENTS: Patient[] // p1 right ACA, p2 left PCA, p3 left MCA
  export type ArteryState = { index: number; solved: Patient['id'][] }
  export type Miss = 'side' | 'artery'  // right artery wrong side | wrong artery
  export function blockAt(s: ArteryState, artery: Artery, side: Side): { state: ArteryState; correct: boolean; miss: Miss | null }
  export function allSolved(s: ArteryState): boolean
  ```

- [ ] **Step 1: Write the failing tests:**
  - `the right artery and side solves the patient and moves on`;
  - `the right artery on the wrong side is a side miss`;
  - `a wrong artery is an artery miss whatever the side`;
  - `a miss changes nothing`;
  - `after all three, more picks change nothing`;
  - `PATIENTS match the spec` (p1 aca/right, p2 pca/left, p3 mca/left).
- [ ] **Step 2:** Run `npx vitest run src/sims/artery/model.test.ts`. Expected: FAIL.
- [ ] **Step 3:** Implement it, following `src/sims/lesion/model.ts`.
- [ ] **Step 4:** Run the same command. Expected: 6 passed.
- [ ] **Step 5: Commit** `feat(lab): block-an-artery model`.

### Task 6: Artery Lab view

**Files:**
- Create: `src/sims/artery/ArterySim.tsx`
- Modify: `src/lab/registry.ts` (add `artery`), `src/i18n/ui.{en,fr,zh}.ts`, the sim CSS
- Test: `src/sims/artery/sim.test.tsx`

**Behaviour:**
- At the top, the current patient's text (`arteryP1..3`) with the eyebrow `lesionCase` ("Patient n of 3", reused).
- Two chip groups, each a `role="radiogroup"`:
  - artery: ACA / MCA / PCA, using the names `arteryAca` / `arteryMca` / `arteryPca`;
  - side: left / right, using `sideLeft` / `sideRight`.
- `TerritoryViewsArt lit={artery} side={side}` shows the choice. Under it, the deficit line `blockAca` / `blockMca` / `blockPca` describes what a block on that side causes:
  - the MCA line ends with `blockMcaLeft` ("…and language") or `blockMcaRight` ("…and attention to the left side of space"), depending on the side;
  - the PCA line says the half of the visual field opposite the chosen side.
- A primary button, `blockedHere` ("This one is blocked"), submits.
- Feedback in a `role="status"` area:
  - `solvedP1..3` when right;
  - `missSide` ("Right artery, wrong side: each hemisphere serves the opposite side of the body and of the visual field.") on a side miss;
  - on an artery miss, `missAca` / `missMca` / `missPca`, chosen by the artery that was picked. For example, missAca: "The ACA feeds the leg area. This patient's problem isn't mainly the leg."
- When all are solved: `arteryAllSolved`, and `onGoalMet` fires once. With `goalMet` set on mount, the view starts solved, like `LesionSim`.
- Readout: `solvedCount`.
- Write the patient texts:
  - **p1:** "Sam's left leg and foot are suddenly weak and numb. His arm and face are fine, and he speaks normally."
  - **p2:** "Lin keeps bumping into things on her right. In both eyes she can't see the right half of the world. She has no weakness."
  - **p3:** "Ravi's right face and arm are weak, and he struggles to find his words."
  - Each solved line names the artery and why. Mark nothing as `verify` here: the Lab's `simplified` note carries it.

- [ ] **Step 1: Write the failing tests** in `sim.test.tsx`:
  - `it starts on the first patient`;
  - `choosing an artery shows what a block would cause`: pick MCA + left → the `blockMcaLeft` text shows;
  - `the wrong side explains itself`: ACA + left on p1 → the status contains the `missSide` text;
  - `a wrong artery explains itself`: MCA + right on p1 → the `missMca` text;
  - `solving all three reaches the goal once`;
  - `coming back after the goal shows all solved`;
  - `it works in French`: switch to fr → the patient text is the fr string.
- [ ] **Step 2:** Run `npx vitest run src/sims/artery`. Expected: the sim tests fail.
- [ ] **Step 3:** Implement the view, the strings in all three languages, the registry entry and the CSS. Use the existing `.lesion__*` / `.sim__*` classes where they fit.
- [ ] **Step 4:** Run `npm test && npm run typecheck`. Expected: clean.
- [ ] **Step 5: Commit** `feat(lab): block an artery — three patients, territories and why each miss is wrong`.

### Task 7: Glossary, the four Bites, the Lab lesson

**Files:**
- Modify: `content/glossary.yaml` (via `scratchpad/gloss.py`), `content/units/u03.yaml`
- Create: `content/lessons/u03/u03-b11.yaml`, `u03-b12.yaml`, `u03-b13.yaml`, `u03-b14.yaml`, `u03-lab-artery.yaml`
- Test: `tests/realContent.test.ts` (existing: zero validation errors)

**Glossary**, all `unit: u03`:
- `stroke`, `ischemic-stroke`, `hemorrhagic-stroke`
- `internal-carotid-artery`, `vertebral-artery`, `basilar-artery`, `circle-of-willis`
- `anterior-cerebral-artery`, `middle-cerebral-artery`, `posterior-cerebral-artery`
- `epidural-hematoma`, `subdural-hematoma`, `subarachnoid-hemorrhage`
- `aneurysm`, `meningioma`, `hemianopia`, `hemispatial-neglect`

Look up the fr and zh titles with `wiki.mjs` in one batch.

**Unit order:** append `u03-b11, u03-b12, u03-lab-artery, u03-b13, u03-b14`. The Case is added in Task 8.

**Bites** (1–3 cards of ≤80 words, 4–8 questions each):
- **u03-b11 "The hungry brain"**:
  - cards: about 2% of body weight but about 20% of the oxygen; no stored fuel; consciousness goes within about 10 s of no flow, damage within minutes (`verify: true`); flow is held steady and shifts toward busy areas;
  - questions: mc, tfwhy, gap, order (flow stops → no oxygen → no energy → neurons stop firing → cells start to die).
- **u03-b12 "Where the blood comes in"**, illustrations `arteries` and `territories`:
  - cards: the carotids in front and the vertebrals behind join into the basilar; the circle of Willis links them as a backup; ACA, MCA and PCA, each with its territory;
  - questions:
    - a match of artery → territory;
    - a tap2d on `territories-top`: "Tap the territory of the left middle cerebral artery";
    - mc: why the circle is a backup;
    - termmatch `[circle-of-willis, middle-cerebral-artery, anterior-cerebral-artery, posterior-cerebral-artery]` en→zh.
- **u03-b13 "Strokes and tumours"**:
  - cards: blocked vs burst; "time lost is brain lost"; tumours grow and press, with gliomas from glia and meningiomas from the coverings (link Unit 1);
  - questions: tfwhy, mc, match (stroke type → cause), mc on a symptom that came on suddenly vs slowly.
- **u03-b14 "Bleeds"**, illustration `bleeds`:
  - cards: the three layers recap ([[dura-mater]] etc. from Unit 1); epidural: an artery, often after a skull fracture, with a lucid interval (`verify: true`); subdural: veins, slower, often in older people; subarachnoid: often a burst [[aneurysm]], the "worst headache of my life";
  - questions:
    - a tap2d on `bleeds` ("Tap the bleed between the skull and the dura");
    - order of the layers from the outside in;
    - mc on the lucid interval;
    - termmatch en→fr.

**`u03-lab-artery`:**
- an intro card that says how to play;
- `sim: artery`;
- goal: "Find the blocked artery for all three patients.";
- `simplified`: territories vary between people and overlap at their borders, and a real stroke may hit only part of a territory;
- 2–3 reflection questions (e.g. why a left MCA stroke often affects language; the PCA and the visual field).

- [ ] **Step 1:** Add the glossary lines. Run `npx vitest run tests/realContent.test.ts`. Expected: pass (terms unused is fine).
- [ ] **Step 2:** Write the five lesson files in en and update `u03.yaml`. Run the content test. Expected: it passes, or the errors point only at missing fr/zh text.
- [ ] **Step 3:** Add the fr and zh text. Run `npm test`. Expected: all pass.
- [ ] **Step 4:** Click through each new Bite and the Lab in headless Chrome (`shot.mjs`). Check the art, the tap2d questions, and Back on an answered question.
- [ ] **Step 5: Commit** `content(u03): blood supply, stroke and bleeds — four Bites and the artery Lab`.

### Task 8: The Case

**Files:**
- Create: `content/lessons/u03/u03-case-stroke.yaml`
- Modify: `content/units/u03.yaml` (append `u03-case-stroke` last)

**Content:**
- **Story** (from the spec): a 64-year-old at breakfast; the right hand drops the cup; speech is halting and wrong; family calls for help.
- **Clues** k1–k4 as in the spec, each with an `unlock` question:
  - k1: tap3d `motor-strip` or mc on the strip's layout;
  - k2: mc Broca vs Wernicke;
  - k3: tfwhy, blocked vs burst;
  - k4: mc on why time matters.
- **Final:**
  - `kind: tap2d`, `figure: territories-top`, `answer: mca-left`;
  - explanations for all 6 regions:
    - the spec's three wrong ones;
    - `aca-right`: the left leg, wrong side;
    - `pca-right`: the left half of the visual field;
    - `mca-left`: why it's right.
- **Solved:**
  - a left MCA blocked stroke;
  - why sudden onset with no bleed points to a clot;
  - that speed matters;
  - `verify: true` where it simplifies.

- [ ] **Step 1:** Write the Case in en, fr and zh. Run `npm test`. Expected: all pass. The validator checks every region has an explanation and the Case is last.
- [ ] **Step 2:** Play it end to end in headless Chrome: unlock all clues, make one wrong tap, then the right tap.
- [ ] **Step 3: Commit** `content(u03): the unit's Case — a sudden stroke at breakfast`.

### Task 9: Final checks

- [ ] **Step 1:** Run `npm test && npm run typecheck && npm run lint && npm run build`. Expected: all clean.
- [ ] **Step 2:** Run `grep -rniE "coursera|edx|harvard|hms|futurelearn|udemy" content src docs`. Expected: no hits.
- [ ] **Step 3:** Replay a finished Bite from the path, using Back during the replay. XP must not change.
