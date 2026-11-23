# Unit 3, Part 1: Early Brain Development — design

*Approved by the learner on 2026-11-23. Extends the main spec, `2026-11-19-neuro-playground-design.md`.*

## Intent

Unit 3 (Neuroanatomy, "Brain Map") is the course's biggest module (~3h26m of video, twice Unit 2). The learner chose to build it **in three parts that follow the course's sections**, each finished before the next starts:

1. **Early Brain Development** (this document)
2. Brain regions and language (nerves, CNS regional functions, hemispheres, aphasia, language circuits)
3. Blood supply and stroke, ending with the unit's Case

The learner also chose to do Unit 3 before the spec's "Phase 2: Review + polish" (Review lessons, Casebook, progress export).

Part 1 should let the learner follow how a flat sheet of cells becomes a brain, and connect each embryonic region to the adult parts they will meet in the rest of the course.

## Goals

- **5 Bites + 1 Lab**, about one Bite per course video group, all with `sources:` set to the matching video titles:

  | Lesson | Topic | Sources |
  |--------|-------|---------|
  | `u03-b01` | neural plate → neural groove → neural tube; neural crest | Intro; Neural Tube Formation |
  | `u03-b02` | neural tube defects (spina bifida, anencephaly); folic acid | Neural Tube Defects |
  | `u03-b03` | 3 primary vesicles → 5 secondary vesicles; the tube's cavity becomes the ventricles | Brain Vesicles |
  | `u03-lab-unfolding` | the Lab (below) | Brain Vesicles |
  | `u03-b04` | cortex expansion and folding (gyri, sulci); the cortex wraps back around | Expansion of the Cerebral Cortex |
  | `u03-b05` | the two forebrain tracts (corpus callosum, internal capsule); cerebral palsy | Two Forebrain Tracts; Cerebral Palsy |

  The path order in `content/units/u03.yaml` is the order above. With no Case yet, the unit simply has no Case node until Part 3.
- **All text in English, French and Chinese** from the start (the learner signed off English as the pattern; new text needs all three).
- Every new term goes in `content/glossary.yaml` with `unit: u03` and Wikipedia links (en always; fr/zh where the article exists). Expected new terms include: neural plate, neural tube, neural crest, neurulation, spina bifida, anencephaly, folic acid, prosencephalon, mesencephalon, rhombencephalon, telencephalon, diencephalon, metencephalon, myelencephalon, ventricular system, gyrus, sulcus, corpus callosum, internal capsule, cerebral palsy. Reuse existing terms where they already exist.
- Bites follow the existing rules: 1–3 cards of ≤ 80 words, 4–8 questions, a mix of question kinds (at least one `order` for the folding steps and one `match` for vesicle → adult part).
- `verify: true` on any claim the author is unsure of.

## The Lab: "Unfold the brain" (`sim: unfolding`)

A 2D growth timeline in the Lab's dark "bench" panel.

```
week 3 ─●──────────── week 7 ───── adult
[neural plate] → [tube] → [3 vesicles] → [5 vesicles]

Goal: drag each of the 5 vesicles onto the adult part it becomes.
```

- **Timeline slider** with a few fixed stages (neural plate, groove, closed tube, 3 vesicles, 5 vesicles). Dragging moves between flat SVG drawings of each stage. Each stage has a one-line caption in all three languages. Simple cross-fades between stages are enough; no morphing.
- **Matching step** (reached at the 5-vesicle stage): the five vesicles, each in its own colour, and the adult targets: cerebral hemispheres (telencephalon), thalamus & hypothalamus (diencephalon), midbrain (mesencephalon), pons & cerebellum (metencephalon), medulla (myelencephalon). Dragging is the main input, with tap-to-select-then-tap-target as an alternative for trackpads. A wrong drop returns the vesicle with a short hint.
- **Goal / success:** all five matched. This gives the usual +20 XP for a Lab goal.
- **Simplified model note:** the drawings are schematic side views, not to scale; the real tube bends (flexures) and the stages overlap in time; weeks are approximate.
- **2–3 reflection questions**, e.g. which vesicle's cavity becomes which ventricle, or why a tube that fails to close at the head end affects the brain.
- The sim's logic (stages, the vesicle → target map, matching state) is a pure TypeScript module with unit tests, separate from the SVG, as with the existing sims. It is registered in `src/lab/registry.ts`.

## 3D brain additions

From the BodyParts3D dataset already in use (checked: these meshes exist):

| New structure id | Meshes |
|------------------|--------|
| `thalamus` | right/left thalamus (FMA258714, FMA258716) |
| `corpus-callosum` | FMA86464 |
| `ventricles` | right/left lateral ventricle (FMA78449, FMA78450), third ventricle (FMA78454), fourth ventricle (FMA78469) |

- Add them to `scripts/models/sources.yaml`, rebuild `public/models/brain.glb`, and update `docs/models/MODELS.md`.
- Add entries in `content/structures.yaml`, with names and notes in all three languages and `unit: u03`.
- They are deep structures, so the Explorer's "translucent cortex" toggle is how they are seen. `u03-b03`/`b05` cards get "Explore in 3D" buttons, and at least one `tap3d` question goes in `u03-b05` (corpus callosum).
- **Lab → 3D link:** finishing the Lab marks thalamus and ventricles as discovered, if the existing discovery mechanism allows this cheaply. If not, they are discovered through the Bites' Explore buttons as usual. *(builder's call)*

## Illustrations (new, flat style, registered in `src/illustrations/registry.tsx`)

- neural plate folding into a tube, with neural crest (b01)
- open vs closed tube: where spina bifida and anencephaly occur (b02)
- 3 → 5 vesicles with their colours, reused by the Lab (b03)
- a smooth vs folded cortex, and the C-shaped growth of the hemisphere (b04)
- a coronal slice showing the corpus callosum and internal capsule (b05, also used for a `tap2d` question)

All drawn text goes through `src/illustrations/artText.ts` in three languages.

## Non-goals

- Parts 2 and 3 of Unit 3, and the unit's Case
- Review lessons, Casebook, progress export (spec Phase 2)
- A 3D embryo or any hand-modelled anatomy
- Brain arteries in 3D (no mesh in the dataset; Part 3 will use 2D)

## Anti-goals

- Confident but wrong developmental timing: use approximate weeks and say they are approximate.
- Developer or code metaphors anywhere in content.
- Bites that grow past ~5 minutes.

## Approaches considered (for the Lab)

1. **2D growth timeline with vesicle matching** (chosen by the learner): honest about being schematic, fits the existing 2D sim pattern.
2. **Animated 3D embryo**: dropped. There's no real embryo mesh, so it would mean hand-modelling anatomy, which the spec forbids.

## Done when

- `npm test`, `npm run typecheck` and `npm run build` pass, with the content check covering all three languages.
- Unit 3 shows six playable lessons on the path, and the three new structures appear in the Brain Explorer.
- The learner has read the English content and spot-checked FR/ZH.

## Left to the builder

- Exact card wording, question mix, and which claims get `verify`.
- The SVG artwork and the stage-caption wording.
- Colours for the five vesicles (distinct from the existing zone colours where possible).
- Whether the Lab → discovery link is worth it (see above).
