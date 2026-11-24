# Unit 3, Part 2 (Brain Regions and Language) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Unit 3's lessons 7–13: 5 Bites (b06–b10), the Flat-map and Lesion-localizer Labs, and four new 3D zones, in EN/FR/ZH.

**Architecture:**
- Content is YAML in `content/`, validated by `src/content/validate.ts`.
- Each Lab is a pure model plus a React view in `src/sims/<id>/`, registered in `src/lab/registry.ts`.
- Part 1's drag logic moves into a shared hook used by all three matching sims.
- New 3D zones are split out of the existing lobe meshes; a `partOf` field keeps lobe questions answerable.

**Tech Stack:** Vite, React 19, TypeScript, Vitest + Testing Library, zod, three.js / react-three-fiber.

**Spec:** `docs/superpowers/specs/2026-11-24-unit-3-part-2-regions-language-design.md`

## Global Constraints

- Every learner-visible text is in `en`, `fr` and `zh` (Simplified, standard mainland terms).
- No developer or code metaphors anywhere in content.
- Every new glossary term has `unit: u03` and Wikipedia links:
  - en always; fr/zh where that article exists, looked up via the en.wikipedia API langlinks;
  - zh links use `?variant=zh-cn`;
  - batch the lookups: the API rate-limits.
- Lesson IDs: `u03-b06`…`u03-b10`, `u03-lab-flatmap`, `u03-lab-lesion`. Bites have 1–3 cards (≤ 80 words) and 4–8 questions.
- Final path order in `content/units/u03.yaml`: Part 1's six lessons, then `u03-b06, u03-b07, u03-b08, u03-lab-flatmap, u03-b09, u03-b10, u03-lab-lesion`.
- `sources:` use the spec's video titles. Never name the course platform, the course title or the university.
- Mark uncertain claims `verify: true`. Don't present "left brain = logic, right brain = creativity" as fact.
- Drawn text goes through `src/illustrations/artText.ts` (fr + zh).
- Commits end with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`; the repo-local git identity is already set.
- After each task, `npm test` and `npm run typecheck` pass.

## Science to state (author's reference)

- **Nerves:**
  - 12 cranial nerve pairs leave the brain (mostly the brainstem), 31 spinal nerve pairs leave the cord.
  - Feature: olfactory (I), optic (II), oculomotor (III), trigeminal (V, face sensation, chewing), facial (VII, facial expression), vagus (X, heart and gut), hypoglossal (XII, tongue).
- **Regions:**
  - Frontal: planning, movement; the precentral gyrus is the primary motor cortex.
  - Parietal: touch and body sense; the postcentral gyrus is the primary somatosensory cortex; spatial attention.
  - Temporal: hearing (primary auditory cortex on the superior temporal gyrus), memory, language comprehension (Wernicke's area, left).
  - Occipital: vision.
  - Insula: taste, body-state feelings.
  - Cerebellum: coordination, ipsilateral.
  - Brainstem: vital functions, cranial nerves.
- **Crossing:** the motor and sensory cortices serve the opposite side of the body. The cerebellum serves the same side.
- **Hemispheres:**
  - Language is left-dominant in about 95% of right-handers and most left-handers (`verify`).
  - The right hemisphere favours spatial attention and emotional prosody. Right parietal damage → neglect of the left side.
  - Split-brain (corpus callosum cut): an object seen only in the left visual field can't be named but can be picked out by the left hand.
- **Aphasia:**
  - Broca's: inferior frontal gyrus, left; non-fluent, effortful, telegraphic speech, comprehension mostly kept; often right arm and face weakness (nearby motor strip).
  - Wernicke's: posterior superior temporal gyrus, left; fluent but meaningless speech, poor comprehension, often unaware.
- **Circuit:** the arcuate fasciculus links Wernicke's to Broca's area. Damage → conduction aphasia: fluent, understands, but can't repeat. This classic model is simplified: mark `verify`, and say so in the card.

## Review Focus

1. **A tap on the new motor strip during an old "find the frontal lobe" question:** it must count as correct (Task 1 test).
2. **Hemisphere isolation with `wernicke-area_L`:** it hides when "right only" is chosen (brainModel test, Task 1).
3. **The flat map after a wrong placement:** the label is not stored, a direction hint shows, and the goal isn't met early (Task 3/4 tests).
4. **Lesion cases on the right hemisphere:** the figure shows the right side, and zone taps are judged per case (Task 5/6 tests).
5. **Resuming either Lab after its goal:** the finished state shows (Task 4/6 tests).

---

### Task 1: 3D zones split from the lobes, with `partOf`

**Files:**
- Modify:
  - `scripts/models/sources.yaml`
  - `content/structures.yaml`
  - `src/content/schema.ts` (StructureSchema: `partOf: id.optional()`)
  - `src/content/validate.ts`
  - `src/brain/visual.ts`
  - `src/brain/StructurePicker.tsx`
  - `src/brain/BrainModal.tsx:21`
  - `src/brain/ExplorerScreen.tsx` (`onPick`)
  - `src/brain/geometry.test.ts`
  - `docs/models/MODELS.md`
- Regenerate: `public/models/brain.glb`
- Test: `src/brain/picker.test.tsx`, `src/content/content.test.ts`

**Interfaces:**
- Produces:
  - structure ids `motor-strip`, `sensory-strip`, `insula`, `wernicke-area`, `broca-area` (twoDOnly), `cranial-nerves` (twoDOnly);
  - `export function resolvePick(structures: Structure[], tapped: string, target: string): string` in `visual.ts`. It returns `target` when `tapped === target` or when the tapped structure's `partOf === target`; otherwise it returns `tapped`.

- [ ] **Step 1: Write the failing tests**
  - picker.test: with structures frontal-lobe and motor-strip (`partOf: frontal-lobe`), answer `frontal-lobe`: calling the mocked BrainView's `onPick('motor-strip')` makes the picker's `onPick` receive `'frontal-lobe'`.
  - `resolvePick(..., 'motor-strip', 'motor-strip')` returns `'motor-strip'`.
  - `resolvePick(..., 'motor-strip', 'temporal-lobe')` returns `'motor-strip'`.
  - content.test: a structure whose `partOf` names an unknown id produces an error at `partOf`.
- [ ] **Step 2:** Run `npx vitest run src/brain/picker.test.tsx src/content`. Expected: FAIL.
- [ ] **Step 3:** Add `partOf` to the schema, the unknown-id check to the validator, and `resolvePick`. Use `resolvePick` in StructurePicker (before `props.onPick`), in BrainModal's `answer`, and in the Explorer quiz branch of `onPick`.
- [ ] **Step 4: Update the mesh sources.**
  - Remove FMA72662/FMA72661 from `frontal-lobe_L/_R`, FMA72666/FMA72665 from `parietal-lobe_L/_R`, and FMA72805 from `temporal-lobe_L`.
  - Add nodes:
    - `motor-strip_L: [FMA72662]`, `motor-strip_R: [FMA72661]`
    - `sensory-strip_L: [FMA72666]`, `sensory-strip_R: [FMA72665]`
    - `insula_L: [FMA72978]`, `insula_R: [FMA72977]`
    - `wernicke-area_L: [FMA72805]`
  - Add the structures, with EN/FR/ZH name and note, `units: [u03]`, `partOf`, and the 2D-only entries (`meshNodes: []`, `twoDOnly: true`).
  - Run `npm run build:brain`.
- [ ] **Step 5:**
  - Add colours to `STRUCTURE_COLORS` for the four meshed zones, and add their ids to `geometry.test.ts`.
  - Update the MODELS.md table, and remove the "no Broca mesh" gap line only if it became false (it doesn't).
  - Run `npm test`. Expected: PASS, including `tests/brainModel.test.ts`.
- [ ] **Step 6:** In headless Chrome, open the Explorer, choose "Unit 3 only", and screenshot it. Commit: `feat(brain): motor and sensory strips, insula, Wernicke's area`.

### Task 2: Shared drag hook

**Files:**
- Create: `src/sims/shared/useDragToTarget.ts`
- Modify: `src/sims/unfolding/UnfoldingSim.tsx`
- Test: the existing `src/sims/unfolding/sim.test.tsx` (unchanged; it must stay green)

**Interfaces:**
- Produces:
  ```ts
  export function useDragToTarget<I extends string, T extends string>(onDrop: (item: I, target: T) => void): {
    drag: { item: I; dx: number; dy: number } | null  // only once moved past 8 px
    over: T | null
    handlers(item: I): { onPointerDown; onPointerMove; onPointerUp; onPointerCancel }
    /** Call from the item's onClick: true when this click ends a drag and must be ignored. */
    swallowClick(item: I): boolean
  }
  ```
  - Targets are found via `elementsFromPoint` (falling back to `elementFromPoint`) and the nearest `[data-target]`.

- [ ] **Step 1:** Move the drag state and handlers from UnfoldingSim into the hook, with no behaviour change.
- [ ] **Step 2:** Run `npx vitest run src/sims/unfolding`. Expected: 10/10 PASS. Commit: `refactor(sims): shared drag-to-target hook`.

### Task 3: Flat-map model

**Files:**
- Create: `src/sims/flatmap/model.ts`, `src/sims/flatmap/model.test.ts`

**Interfaces:**
- Produces:
  ```ts
  export const SLOTS = ['spinal-cord','medulla','pons','cerebellum','midbrain','thalamus','hypothalamus','frontal','parietal','temporal','occipital'] as const
  export type Slot = (typeof SLOTS)[number]
  export const LEVEL: Record<Slot, number> // spinal-cord 0, medulla 1, pons 2, cerebellum 2, midbrain 3, thalamus 4, hypothalamus 4, lobes 5
  export type Placed = Partial<Record<Slot, Slot>> // slot → label placed there (label ids equal slot ids)
  export type Hint = 'higher' | 'lower' | 'same-level'
  export function place(p: Placed, label: Slot, slot: Slot): { placed: Placed; correct: boolean; hint: Hint | null }
  export function allPlaced(p: Placed): boolean
  ```
  - `hint` is `'higher'` when `LEVEL[label] > LEVEL[slot]` (the label belongs nearer the head), `'lower'` when it is smaller, `'same-level'` when they are equal but the slot is wrong, and `null` when the placement is correct.

- [ ] **Step 1: Write the failing tests.**
  - `place({}, 'pons', 'pons')` is correct.
  - `place({}, 'thalamus', 'medulla')` gives hint `'higher'`, and nothing is stored.
  - `place({}, 'medulla', 'thalamus')` gives `'lower'`.
  - `place({}, 'cerebellum', 'pons')` gives `'same-level'`.
  - `allPlaced` is true only with all 11 slots placed.
  - `place` doesn't mutate its input.
- [ ] **Step 2:** Run the tests. Expected: FAIL. Implement. Run again. Expected: PASS. Commit: `feat(sims): flat map model`.

### Task 4: Flat-map art, sim view and Lab lesson

**Files:**
- Create:
  - `src/illustrations/flatMap.tsx` (`FlatMapArt({ placed?, over?, labels? })`): an unrolled CNS from the spinal cord (bottom) to a fan of four lobes (top), with the cerebellum branching off the pons; each slot is a `<g data-target={slot}>` drop zone, coloured by vesicle of origin using Part 1's `VESICLE_COLORS`;
  - `src/sims/flatmap/FlatMapSim.tsx`, `src/sims/flatmap/sim.test.tsx`;
  - `content/lessons/u03/u03-lab-flatmap.yaml`.
- Modify: `src/lab/registry.ts` (`flatmap`), `src/illustrations/registry.tsx` (illustration `flat-map`), `artText.ts`, `ui.{en,fr,zh}.ts`, `theme.css`, `content/units/u03.yaml`.

**Interfaces:**
- Consumes: Task 2's hook and Task 3's model.
- New UI keys:
  - `flatmapPrompt`, `flatmapHintHigher`, `flatmapHintLower`, `flatmapHintSame`, `placedCount` (`{n}`, `{total}`);
  - one name per slot, as `fm<Slot>` in camelCase, e.g. `fmSpinalCord`.

- [ ] **Step 1: Write the failing tests** (same style as `src/sims/unfolding/sim.test.tsx`).
  - The bank shows 11 label buttons.
  - Tapping the Pons label and then the pons slot places it.
  - Tapping Thalamus and then the medulla slot shows `flatmapHintHigher` and stores nothing.
  - All 11 placed calls `onGoalMet` once.
  - With `goalMet` true, every slot shows its label.
  - Switching to French renames the labels and keeps the placements.
  - There is a `.sim__readout`.
- [ ] **Step 2:** Run the tests. Expected: FAIL. Implement the view, with the slot buttons inside the SVG drawn as `foreignObject`-free `<g role="button">`, keyboard-activatable like `Region`. Run again. Expected: PASS.
- [ ] **Step 3:** Write the Lab lesson:
  - title "Lay the brain out flat" / "Mettre le cerveau à plat" / "把大脑摊平";
  - sources: Making a Flat Schematic of the Brain;
  - the intro card has `explore3d: [brainstem, cerebellum, thalamus]` and `verify: true`, since the layout is the builder's own;
  - `simplified`: a flat diagram, not real proportions; the real brain bends and folds;
  - 3 reflection questions: which levels the cerebellum hangs off; which part sits above the midbrain; an order question from the spinal cord up.
- [ ] **Step 4:**
  - Add the Lab to `u03.yaml` after `u03-b08` (b06–b08 may not exist yet: insert it where it will end up, keeping the listed lessons valid).
  - Run `npm test` and the typecheck.
  - Screenshot the Lab and do a real mouse drag in headless Chrome.
  - Commit: `feat(lab): flat map builder`.

### Task 5: Lesion localizer model

**Files:**
- Create: `src/sims/lesion/model.ts`, `src/sims/lesion/model.test.ts`

**Interfaces:**
- Produces:
  ```ts
  export const ZONES = ['prefrontal','motor-strip','broca','sensory-strip','parietal-association','wernicke','auditory','visual','cerebellum','brainstem'] as const
  export type Zone = (typeof ZONES)[number]
  export type LesionCase = { id: 'c1'|'c2'|'c3'|'c4'|'c5'|'c6'; side: 'left' | 'right'; answer: Zone }
  export const CASES: LesionCase[] // c1 left broca, c2 left wernicke, c3 right motor-strip, c4 left sensory-strip, c5 right parietal-association, c6 right cerebellum
  export type LesionState = { index: number; solved: string[] }
  export function tapZone(s: LesionState, zone: Zone): { state: LesionState; correct: boolean }
  export function allSolved(s: LesionState): boolean
  ```
  - A correct tap adds the case to `solved` and advances `index`.
  - A wrong tap leaves the state unchanged.

- [ ] **Step 1: Write the failing tests.**
  - The cases and their answers are as listed.
  - A correct tap on case 1 advances to case 2.
  - A wrong tap doesn't advance.
  - Solving all 6 makes `allSolved` true, and `index` stays at 5 (it doesn't overflow).
- [ ] **Step 2:** FAIL → implement → PASS. Commit: `feat(sims): lesion localizer model`.

### Task 6: Side-view brain figure, localizer view and Lab lesson

**Files:**
- Create:
  - `src/illustrations/lateralBrain.tsx` (`LateralBrainArt(art: ArtProps & { side?: 'left' | 'right' })`): a side view of one hemisphere with the cerebellum and brainstem; regions use the `Region` component with the ids in `LATERAL_REGIONS` (= the lesion `ZONES`); `side: 'right'` mirrors it with `transform="scale(-1,1)"` around the centre, with the text kept unmirrored;
  - `src/sims/lesion/LesionSim.tsx`, `src/sims/lesion/sim.test.tsx`;
  - `content/lessons/u03/u03-lab-lesion.yaml`.
- Modify:
  - `src/illustrations/registry.tsx` (illustration `lateral-brain` with labels; `FIGURES['lateral-brain']`, left side, regions `LATERAL_REGIONS`);
  - `src/lab/registry.ts` (`lesion`), `artText.ts`, `ui.*.ts`, `theme.css`, `content/units/u03.yaml`.

**Interfaces:**
- Consumes: Task 5's model.
- New UI keys:
  - `lesionCase` (`{n}`, `{total}`), `lesionSideLeft`, `lesionSideRight`, `solvedCount`;
  - per case `lesionC1`…`lesionC6`: the patient description;
  - per zone `zone<Name>`: the zone's name;
  - per zone `why<Name>`: what damage there causes, shown after a wrong tap, e.g. "That's Wernicke's area: damage there leaves speech fluent but empty";
  - per case `solved<N>`: shown after the correct tap.

- [ ] **Step 1: Write the failing tests.**
  - Case 1's text shows.
  - Tapping the Wernicke region shows `whyWernicke` and stays on case 1.
  - Tapping Broca moves to case 2.
  - Case 3's figure is the right hemisphere (`data-side="right"` on the svg).
  - Solving all 6 calls `onGoalMet` once.
  - With `goalMet` true, a "all solved" summary shows.
  - Switching language re-renders the case text.
- [ ] **Step 2:** FAIL → implement → PASS.
- [ ] **Step 3:** Write the Lab lesson:
  - title "Find the damage" / "Trouver la lésion" / "找出损伤部位";
  - the intro card recaps "motor and sensory cortex serve the opposite side; the cerebellum the same side";
  - `simplified`: real damage is rarely so neat; areas vary between people; the language side varies;
  - 3 reflection questions: on crossing, on the cerebellum's same-side rule, and on neglect.
- [ ] **Step 4:** Add the Lab to `u03.yaml` last. Run `npm test`. Screenshot cases 1 and 3. Commit: `feat(lab): lesion localizer`.

### Task 7: Bite 6 (nerves) and its figure

**Files:**
- Create: `src/illustrations/cranialNerves.tsx` (the underside of the brainstem with 7 featured nerves, labelled with roman numeral and name), `content/lessons/u03/u03-b06.yaml`.
- Modify: glossary, registry, artText, `u03.yaml`.
- Glossary terms: `cranial-nerve`, `spinal-nerve`, `olfactory-nerve`, `optic-nerve`, `trigeminal-nerve`, `facial-nerve`, `hypoglossal-nerve`. Reuse `vagus-nerve`.
- Questions:
  - 2 cards;
  - a `match` (nerve ↔ job);
  - an `mc` (where most cranial nerves leave);
  - a `gap` (12 / 31);
  - a `tfwhy` (the vagus reaches the gut);
  - a `tap3d` on `brainstem`.
- Commit: `content(u03): nerves bite`.

### Task 8: Bite 7 (regional jobs)

**Files:** `content/lessons/u03/u03-b07.yaml`; glossary; `u03.yaml`.
- Uses illustration `lateral-brain` (labelled) and `FIGURES['lateral-brain']` for `tap2d`.
- Terms: `primary-motor-cortex`, `primary-somatosensory-cortex`, `auditory-cortex`, `visual-cortex`, `insular-cortex`, `prefrontal-cortex`, `contralateral`, `ipsilateral`.
- Questions:
  - cards: c1 the lobes' jobs, with `explore3d: [motor-strip, sensory-strip]`; c2 crossing, and the cerebellum's same-side rule;
  - a `tap2d` (sensory strip);
  - a `tap3d` (`motor-strip`);
  - a `match` (lobe ↔ job);
  - a `tfwhy` (the left motor strip moves the right hand);
  - an `mc` (cerebellum side).
- Commit: `content(u03): regional functions bite`.

### Task 9: Bite 8 (hemispheres)

**Files:** `src/illustrations/splitBrain.tsx` (eyes → visual fields → each hemisphere; corpus callosum cut), `content/lessons/u03/u03-b08.yaml`; glossary; registry; artText; `u03.yaml`.
- Terms: `cerebral-hemisphere`, `lateralization`, `split-brain`, `hemispatial-neglect`.
- Content:
  - c2 debunks the "logic vs creative" myth;
  - c3 covers split-brain;
  - language dominance figures carry `verify: true`;
  - one card has `explore3d: [corpus-callosum, insula]`.
- Questions: a `tfwhy` (the myth), an `mc` (split-brain naming), an `mc` (neglect side), a `tap3d` (`insula`).
- Commit: `content(u03): hemispheres bite`.

### Task 10: Bite 9 (aphasia)

**Files:** `content/lessons/u03/u03-b09.yaml`; glossary; `u03.yaml`.
- Terms: `aphasia`, `broca-area`, `wernicke-area`, `brocas-aphasia` (expressive), `wernickes-aphasia` (receptive).
- Content:
  - c1 Broca;
  - c2 Wernicke, with `explore3d: [wernicke-area]`.
- Questions:
  - a `tap2d` on `lateral-brain` (`broca`);
  - a `tap2d` (`wernicke`);
  - a `match` (speech sample ↔ aphasia type, with original sample sentences);
  - an `mc` (why the right arm is often weak with Broca's aphasia);
  - a `tap3d` (`wernicke-area`).
- Commit: `content(u03): aphasia bite`.

### Task 11: Bite 10 (language circuit) and its figure

**Files:** `src/illustrations/languageCircuit.tsx` (hearing → Wernicke → arcuate fasciculus → Broca → motor strip → speech, on a side view), `content/lessons/u03/u03-b10.yaml`; glossary; registry; artText; `u03.yaml`.
- Terms: `arcuate-fasciculus`, `conduction-aphasia`.
- Content: c2 says the classic model is simplified, with `verify: true`.
- Questions:
  - an `order` (the steps of repeating a heard word);
  - an `mc` (what conduction aphasia spares);
  - a `tfwhy`;
  - a `termmatch` (`aphasia`, `broca-area`, `wernicke-area`, `arcuate-fasciculus`; zh → fr).
- Commit: `content(u03): language circuit bite`.

### Task 12: Whole-part check

- [ ] `npm test && npm run typecheck && npm run build` all pass.
- [ ] In headless Chrome:
  - open every new lesson in EN, and spot-check FR and ZH;
  - check that all 13 Unit 3 nodes show on the path;
  - check that the Glossary's Unit 3 filter lists the new terms;
  - in an old Unit 1 lesson, a 3D "find" question that targets a lobe still works when the motor strip is tapped (covered by Task 1's test; do a quick look).
- [ ] Grep for the course platform's name: no hits.
- [ ] Commit any fixes: `fix(u03): part 2 review fixes`.
