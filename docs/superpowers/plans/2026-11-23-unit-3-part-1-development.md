# Unit 3, Part 1 (Early Brain Development) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Unit 3's first six lessons (5 Bites + the "Unfold the brain" Lab), five new illustrations, and three new 3D structures (thalamus, corpus callosum, ventricles), all in EN/FR/ZH.

**Architecture:** Content is YAML in `content/` validated by `src/content/validate.ts` (run by `tests/realContent.test.ts`). The Lab is a new sim: a pure model in `src/sims/unfolding/model.ts` plus an SVG/React view, registered in `src/lab/registry.ts`. New 3D meshes come from the BodyParts3D OBJ files already in `scripts/models/raw/` via `npm run build:brain`.

**Tech Stack:** Vite, React 19, TypeScript, Vitest + Testing Library, zod, js-yaml, three.js / react-three-fiber.

**Spec:** `docs/superpowers/specs/2026-11-23-unit-3-part-1-development-design.md` (extends `docs/superpowers/specs/2026-11-19-neuro-playground-design.md`)

## Global Constraints

- Every text the learner reads exists in `en`, `fr` and `zh` (Simplified, mainland terms). The content check fails otherwise.
- No developer or code metaphors anywhere in content, captions or sim text.
- Every new glossary term has `unit: u03` and `wiki: { en: … }`, plus `fr`/`zh` links where that Wikipedia article exists (zh links use `?variant=zh-cn`, as in existing entries).
- Bites: 1–3 cards of ≤ 80 words each (English), 4–8 questions. Lesson IDs `u03-b01`…`u03-b05`, `u03-lab-unfolding`.
- `sources:` use the course video titles from the spec's table. Never name the course platform, course title or university anywhere in the repo.
- Developmental timings are given as approximate ("about week 4"). Mark any claim you're unsure of with `verify: true`.
- Drawn text in illustrations goes through `src/illustrations/artText.ts` with `fr` and `zh` entries.
- Commits use the repo-local git identity (already configured; don't override it) and end with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- After each task: `npm test` and `npm run typecheck` pass.

## Science to state (author's reference; keep wording simple)

- Neurulation: the neural plate (ectoderm) folds into a groove, the folds meet and fuse into the neural tube, about weeks 3–4; the head end closes around day 25, the tail end around day 28. Neural crest cells pinch off from the fold edges and become most of the PNS (e.g. dorsal root ganglia, autonomic ganglia, Schwann cells).
- Defects: failure to close at the head end → anencephaly; at the tail end → spina bifida. Folic acid taken before and in early pregnancy lowers the risk.
- Vesicles: about week 4, 3 primary vesicles: prosencephalon, mesencephalon, rhombencephalon. About week 5, 5 secondary vesicles: telencephalon → cerebral hemispheres; diencephalon → thalamus and hypothalamus; mesencephalon → midbrain; metencephalon → pons and cerebellum; myelencephalon → medulla. The tube's cavity becomes the ventricles: lateral ventricles (telencephalon), third ventricle (diencephalon), cerebral aqueduct (mesencephalon), fourth ventricle (rhombencephalon). The spinal cord comes from the rest of the tube.
- Cortex expansion: the telencephalon grows far more than the rest, folds into gyri and sulci to fit in the skull, and grows in a C-shape back and then forward, carrying the temporal lobe, lateral ventricle and hippocampus into a C.
- Forebrain tracts: the corpus callosum links the two hemispheres; the internal capsule carries axons between the cortex and the thalamus, brainstem and spinal cord, passing near the lateral ventricles.
- Cerebral palsy: non-progressive movement disorder from injury to the developing brain. In premature babies, damage next to the lateral ventricles (periventricular leukomalacia) hits internal-capsule fibres heading to the legs first, so the legs are stiffest (spastic diplegia). Mark this last link `verify: true`.

## Review Focus

1. **Lab on a trackpad without dragging** — tapping a vesicle then a target must complete a match; test in Task 3.
2. **Wrong drop** — the vesicle returns, a hint appears, and no match is stored; model test in Task 2, view test in Task 3.
3. **Language switch inside the Lab** — captions and vesicle/target names re-render in the new language and existing matches stay; test in Task 3.
4. **Leaving the slider before the 5-vesicle stage** — the matching board is hidden and the goal can't be met early; test in Task 3.
5. **Hemisphere isolation with new deep structures** — `_L` nodes stay left of the midline, midline nodes (`corpus-callosum`, `ventricles`) have no suffix and stay visible in both modes; covered by `tests/brainModel.test.ts` in Task 1.

---

### Task 1: New 3D structures (thalamus, corpus callosum, ventricles)

**Files:**
- Modify: `scripts/models/sources.yaml`, `content/structures.yaml`, `src/brain/visual.ts`, `src/brain/geometry.test.ts:45-47`, `docs/models/MODELS.md`
- Regenerate: `public/models/brain.glb`

**Interfaces:**
- Produces structure ids `thalamus`, `corpus-callosum`, `ventricles` (used by later tasks' `explore3d` and `tap3d`), and glb nodes `thalamus_L`, `thalamus_R`, `corpus-callosum`, `ventricles_L`, `ventricles_R`, `ventricles`.

- [ ] **Step 1:** Add to `scripts/models/sources.yaml` `nodes:`
  - `thalamus_L: { files: [FMA258716] }`, `thalamus_R: { files: [FMA258714] }` (confirm L/R by checking `parts_list_e.txt`: FMA258716 = left thalamus)
  - `corpus-callosum: { files: [FMA86464] }`
  - `ventricles_L: { files: [FMA78450] }`, `ventricles_R: { files: [FMA78449] }`, `ventricles: { files: [FMA78454, FMA78469] }`
- [ ] **Step 2:** Add the three entries to `content/structures.yaml` with `name`/`note` in en/fr/zh, `units: [u03]`, and the `meshNodes` above (`ventricles` lists all three ventricle nodes).
- [ ] **Step 3:** Run `npm test -- tests/brainModel.test.ts`. Expected: FAIL (glb node names don't match structures.yaml).
- [ ] **Step 4:** Run `npm run build:brain`. Then `npm test -- tests/brainModel.test.ts`. Expected: PASS (including the size limit and the `_L`/`_R` midline checks).
- [ ] **Step 5:** In `src/brain/visual.ts` add `STRUCTURE_COLORS` for `thalamus`, `corpus-callosum`, `ventricles`, each distinct from the existing seven. In `geometry.test.ts` add the three ids to `ids`, and change the fallback test to use an id with no colour (e.g. `'hippocampus'`). Run `npm test -- src/brain`. Expected: PASS.
- [ ] **Step 6:** Add the new nodes to the table in `docs/models/MODELS.md` and update the total triangle/size line from the build output.
- [ ] **Step 7:** Run `npm run dev`, open the Brain Explorer, turn on the translucent cortex, and check that the three structures sit inside the brain and highlight in their colours, and that left/right isolation behaves. Then commit: `feat(brain): thalamus, corpus callosum and ventricles`.

### Task 2: Unfolding sim model

**Files:**
- Create: `src/sims/unfolding/model.ts`, `src/sims/unfolding/model.test.ts`

**Interfaces:**
- Produces:
  ```ts
  export const STAGES = ['plate', 'groove', 'tube', 'three', 'five'] as const
  export type Stage = (typeof STAGES)[number]
  export const VESICLES = ['telencephalon', 'diencephalon', 'mesencephalon', 'metencephalon', 'myelencephalon'] as const
  export type Vesicle = (typeof VESICLES)[number]
  export const TARGETS = ['hemispheres', 'thalamus-hypothalamus', 'midbrain', 'pons-cerebellum', 'medulla'] as const
  export type Target = (typeof TARGETS)[number]
  export const ANSWER: Record<Vesicle, Target>
  export const PRIMARY = ['prosencephalon', 'mesencephalon', 'rhombencephalon'] as const
  export const PRIMARY_OF: Record<Vesicle, (typeof PRIMARY)[number]>
  export type Matches = Partial<Record<Vesicle, Target>>
  export function drop(m: Matches, v: Vesicle, t: Target): { matches: Matches; correct: boolean }
  export function allMatched(m: Matches): boolean
  export function canMatch(stage: Stage): boolean // true only for 'five'
  ```

- [ ] **Step 1: Write the failing tests**
  - `ANSWER` maps telencephalon→hemispheres, diencephalon→thalamus-hypothalamus, mesencephalon→midbrain, metencephalon→pons-cerebellum, myelencephalon→medulla.
  - `PRIMARY_OF`: tel and dien → prosencephalon; mes → mesencephalon; met and myel → rhombencephalon.
  - `drop({}, 'telencephalon', 'hemispheres')` → `{ matches: { telencephalon: 'hemispheres' }, correct: true }`.
  - `drop({}, 'telencephalon', 'medulla')` → `correct: false` and `matches` equal to the input (a new object is fine).
  - `drop` doesn't mutate its input.
  - `allMatched` is false for 4 of 5 and true for all 5 correct.
  - `canMatch` is true only for `'five'`.
- [ ] **Step 2:** Run `npm test -- src/sims/unfolding`. Expected: FAIL (module not found).
- [ ] **Step 3:** Implement `model.ts` with the signatures above. Put a header comment in the style of `src/sims/myelin/model.ts`, saying the stages are schematic and the weeks approximate.
- [ ] **Step 4:** Run `npm test -- src/sims/unfolding`. Expected: PASS. Commit: `feat(sims): brain unfolding model`.

### Task 3: Vesicles illustration and the Unfolding sim view

**Files:**
- Create: `src/illustrations/vesicles.tsx`, `src/sims/unfolding/UnfoldingSim.tsx`, `src/sims/unfolding/sim.test.tsx`
- Modify: `src/illustrations/registry.tsx`, `src/illustrations/artText.ts`, `src/lab/registry.ts`, `src/i18n/ui.en.ts`, `ui.fr.ts`, `ui.zh.ts`, `src/ui/theme.css`

**Interfaces:**
- Consumes: Task 2's model.
- Produces:
  - `export function VesiclesArt(props: { stage?: Stage; labels?: boolean }): JSX.Element` (default `stage: 'five'`). It draws a schematic side view of each stage, with the five vesicles in `VESICLE_COLORS: Record<Vesicle, string>` (exported, five distinct colours).
  - It is registered as illustration `vesicles` (`() => <VesiclesArt labels />`).
  - The sim is registered as `unfolding: { Component: UnfoldingSim }`.
  - New UI keys (all three languages): `stageLabel`, one caption key per stage (`stagePlate`, `stageGroove`, `stageTube`, `stageThree`, `stageFive`), one name key per vesicle and per target, `matchPrompt`, `wrongDropHint`, `matchedCount` (with `{n}`).

- [ ] **Step 1: Write the failing tests** in `sim.test.tsx`, rendering `UnfoldingSim` inside `LanguageProvider`:
  - It starts at stage 0 with no matching board (`queryByRole('group', { name: matchPrompt })` is null). Setting the range input to 3 still shows no board.
  - At 4 the board shows five vesicle buttons and five target buttons.
  - Tap-tap: click the telencephalon button, then the hemispheres target. That vesicle shows as matched (`aria-pressed` or a `data-matched` attribute), and `onGoalMet` is not called yet.
  - Wrong: click mesencephalon, then medulla. `wrongDropHint` text appears, mesencephalon is not matched, and `onGoalMet` is not called.
  - All five correct → `onGoalMet` is called once.
  - Switching language after one match (render with the store language set to `fr`, or use the provider's switch) shows the French vesicle name, and the match is kept.
  - The sim has a `.sim__readout` (as in `src/sims/threshold/sim.test.tsx`) showing `matchedCount`.
- [ ] **Step 2:** Run `npm test -- src/sims/unfolding`. Expected: FAIL.
- [ ] **Step 3:** Implement `VesiclesArt`: flat SVG side views per stage, in the style of `src/illustrations/cnsPns.tsx`. All drawn text goes through `artText`; add the `fr`/`zh` entries to `ART_TEXT`.
- [ ] **Step 4:** Implement `UnfoldingSim({ onGoalMet, goalMet }: SimProps)`:
  - A range input (0–4, labelled `stageLabel`) above `<VesiclesArt stage={STAGES[i]} />`, with the stage caption under it. Cross-fade the art on stage change with CSS opacity, honouring `prefers-reduced-motion`.
  - When `canMatch`, show a `role="group"` board with vesicle buttons (coloured by `VESICLE_COLORS`) and target buttons. Click a vesicle to select it, then click a target to `drop`.
  - Also support pointer-drag of a vesicle onto a target. Reuse the pattern from the order-question drag (commit `393e646`) if it fits; tap-tap must keep working.
  - Call `onGoalMet()` when `allMatched`.
  - Add the styles to `theme.css` under a `.unfold` block on the dark bench surface.
- [ ] **Step 5:** Register the illustration and the sim. Run `npm test` and `npm run typecheck`. Expected: PASS (including `artText.test.tsx` and the `ui.*` key-parity typecheck).
- [ ] **Step 6:** Commit: `feat(lab): brain unfolding sim with vesicle matching`.

### Task 4: Unit 3 shell, Bite 1 (neural tube) and its illustration

**Files:**
- Create: `src/illustrations/neuralTube.tsx`, `content/lessons/u03/u03-b01.yaml`
- Modify: `content/units/u03.yaml` (`lessons: [u03-b01]`), `content/glossary.yaml`, `src/illustrations/registry.tsx`, `src/illustrations/artText.ts`

**Interfaces:**
- Produces: illustration `neural-tube` (neural plate → groove → tube, with neural crest marked); glossary ids `neurulation`, `neural-plate`, `neural-tube`, `neural-crest`, `ectoderm`.

- [ ] **Step 1:** Add the glossary terms, with Wikipedia URLs checked to resolve (open each one; use the en link only when the fr or zh article doesn't exist).
- [ ] **Step 2:** Draw `NeuralTubeArt` and register it; add its artText entries.
- [ ] **Step 3:** Write `u03-b01.yaml`:
  - Sources: `["Intro", "Neural Tube Formation"]`.
  - 2 cards: plate → tube, then neural crest → PNS. Link `[[dorsal-root-ganglion]]` and `[[schwann-cell]]` if those ids exist, else plain text.
  - 5–6 questions, including one `order` (plate → groove → folds meet → tube closes) and one `mc` on neural crest fates.
  - Use the existing u01/u02 Bites as the format reference.
- [ ] **Step 4:** Run `npm test`. Expected: PASS (`realContent.test.ts` reports zero errors). Play the Bite in `npm run dev` in all three languages. Commit: `content(u03): neural tube bite`.

### Task 5: Bite 2 (neural tube defects) and its illustration

**Files:**
- Create: `src/illustrations/tubeDefects.tsx`, `content/lessons/u03/u03-b02.yaml`
- Modify: `content/units/u03.yaml`, `content/glossary.yaml`, `registry.tsx`, `artText.ts`

**Interfaces:** Produces illustration `tube-defects`, registered as both an illustration and a `FIGURES` entry with regions `['head-end', 'tail-end']`; glossary ids `neural-tube-defect`, `spina-bifida`, `anencephaly`, `folic-acid`.

- [ ] **Step 1:** Glossary terms (as in Task 4, Step 1).
- [ ] **Step 2:** Draw `TubeDefectsArt` (a tube with its head and tail openings) with `onTap`/`picked` props, following `src/illustrations/meninges.tsx`. Register it; add artText.
- [ ] **Step 3:** Write `u03-b02.yaml`:
  - Sources: `["Neural Tube Defects"]`.
  - 2 cards.
  - Questions:
    - a `tap2d` on `tube-defects` (answer `tail-end` for spina bifida)
    - a `tfwhy` on folic acid timing (before pregnancy is known)
    - a `match`: defect ↔ end
  - `verify: true` on the closure days if stated.
- [ ] **Step 4:** `npm test`, play it, commit: `content(u03): neural tube defects bite`.

### Task 6: Bite 3 (brain vesicles)

**Files:**
- Create: `content/lessons/u03/u03-b03.yaml`
- Modify: `content/units/u03.yaml`, `content/glossary.yaml`

**Interfaces:** Consumes illustration `vesicles` (Task 3) and structure `ventricles` (Task 1). Produces glossary ids `prosencephalon`, `mesencephalon`, `rhombencephalon`, `telencephalon`, `diencephalon`, `metencephalon`, `myelencephalon`, `ventricular-system` (reuse `csf` and `hypothalamus`).

- [ ] **Step 1:** Glossary terms.
- [ ] **Step 2:** Write `u03-b03.yaml`:
  - Sources: `["Brain Vesicles"]`.
  - Cards:
    - c1: 3 → 5 vesicles, with `illustration: vesicles`
    - c2: cavity → ventricles, with `explore3d: [ventricles]`
  - Questions:
    - a `match` (5 vesicles ↔ adult parts)
    - an `mc` (which primary vesicle splits into tel + dien)
    - a `tap3d` (`structure: ventricles`)
    - a `gap`
- [ ] **Step 3:** `npm test`, play it, commit: `content(u03): brain vesicles bite`.

### Task 7: Lab lesson "Unfold the brain"

**Files:**
- Create: `content/lessons/u03/u03-lab-unfolding.yaml`
- Modify: `content/units/u03.yaml` (insert after `u03-b03`)

**Interfaces:** Consumes sim `unfolding` (Task 3) and structures `thalamus`, `ventricles`.

- [ ] **Step 1:** Write the lesson in the format of `content/lessons/u02/u02-lab-threshold.yaml`:
  - Title: en "Unfold the brain", fr "Déplier le cerveau", zh "展开大脑".
  - Sources: `["Brain Vesicles"]`.
  - One intro card with `explore3d: [thalamus, ventricles]`. This is how finishing the intro marks them discovered (`lessonStructures` in `src/progress/discovery.ts` already reads Lab intro cards), so no code change is needed.
  - `sim: unfolding`.
  - Goal: "Match all five vesicles to the adult parts they become."
  - `simplified`: schematic side views, not to scale; the real tube bends (flexures); stages overlap; weeks approximate.
  - 3 reflection questions:
    - which vesicle's cavity becomes the fourth ventricle (`mc`)
    - head-end closure failure affects which vesicle's derivatives (`tfwhy`)
    - order the stages (`order`)
- [ ] **Step 2:** `npm test`. Play the Lab end to end in `npm run dev`: the goal gives +20 XP, and thalamus and ventricles are labelled in the Explorer afterwards. Commit: `content(u03): unfold the brain lab`.

### Task 8: Bite 4 (cortex expansion) and its illustration

**Files:**
- Create: `src/illustrations/cortexFolding.tsx`, `content/lessons/u03/u03-b04.yaml`
- Modify: `content/units/u03.yaml`, `content/glossary.yaml`, `registry.tsx`, `artText.ts`

**Interfaces:** Produces illustration `cortex-folding` (a smooth vs a folded cortex, plus a C-shaped arrow of growth); glossary ids `gyrus`, `sulcus`, `cerebral-cortex` (only if not already present; grep first), `lissencephaly` (optional, if mentioned).

- [ ] **Step 1:** Glossary terms.
- [ ] **Step 2:** Draw and register `CortexFoldingArt`; add artText.
- [ ] **Step 3:** Write `u03-b04.yaml`:
  - Sources: `["Expansion of the Cerebral Cortex"]`.
  - 2–3 cards; one card has `explore3d: [frontal-lobe, temporal-lobe]`.
  - Questions:
    - a `tfwhy` (folding fits more cortex in the skull)
    - an `mc` on the C-shape (why the temporal lobe sits forward and below)
    - a `gap` for gyrus/sulcus
    - a `termmatch` on gyrus/sulcus
- [ ] **Step 4:** `npm test`, play it, commit: `content(u03): cortex expansion bite`.

### Task 9: Bite 5 (forebrain tracts and cerebral palsy) and its figure

**Files:**
- Create: `src/illustrations/forebrainTracts.tsx`, `content/lessons/u03/u03-b05.yaml`
- Modify: `content/units/u03.yaml` (final order: `[u03-b01, u03-b02, u03-b03, u03-lab-unfolding, u03-b04, u03-b05]`), `content/glossary.yaml`, `registry.tsx`, `artText.ts`

**Interfaces:** Produces illustration and `FIGURES` entry `forebrain-tracts`: a coronal slice with regions `['corpus-callosum', 'internal-capsule', 'lateral-ventricle', 'thalamus', 'cortex']`. Glossary ids `corpus-callosum`, `internal-capsule`, `white-matter` (if absent), `cerebral-palsy`, `periventricular-leukomalacia`, `spastic-diplegia`.

- [ ] **Step 1:** Glossary terms.
- [ ] **Step 2:** Draw `ForebrainTractsArt` with `labels`/`onTap`/`picked` props and register both entries; add artText.
- [ ] **Step 3:** Write `u03-b05.yaml`:
  - Sources: `["Two Forebrain Tracts", "Cerebral Palsy"]`.
  - Cards:
    - c1: the two tracts, with `illustration: forebrain-tracts` and `explore3d: [corpus-callosum, thalamus]`
    - c2: cerebral palsy, `verify: true`
  - Questions:
    - a `tap2d` (internal capsule)
    - a `tap3d` (`structure: corpus-callosum`)
    - an `mc` (why the legs are most affected)
    - a `tfwhy` (CP doesn't get worse over time)
- [ ] **Step 4:** `npm test`, play it, commit: `content(u03): forebrain tracts and cerebral palsy bite`.

### Task 10: Whole-part check

**Files:** Modify `README.md` only if a statement there became false.

- [ ] **Step 1:** Run `npm test && npm run typecheck && npm run build`. Expected: all pass.
- [ ] **Step 2:** In `npm run dev`, play all six lessons in EN, and spot-check FR and ZH. Check that:
  - every term popover opens with a working Wikipedia link
  - the "Check against the course" badges show where `verify` is set
  - the path shows six Unit 3 nodes
  - the Glossary filtered to Unit 3 lists the new terms
- [ ] **Step 3:** `grep -ri` the repo for the course platform's name. Expected: no hits.
- [ ] **Step 4:** Commit any fixes: `fix(u03): part 1 review fixes`.
