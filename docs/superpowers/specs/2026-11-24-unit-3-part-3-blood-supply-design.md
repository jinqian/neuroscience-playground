# Unit 3, Part 3: Blood Supply, Stroke and the Case, plus going back inside a lesson — design

*Written on 2026-11-24, after the learner agreed the Part 3 topics and asked for back navigation. Extends `2026-11-19-neuro-playground-design.md`. It follows Part 2, `2026-11-24-unit-3-part-2-regions-language-design.md`.*

## Intent

This is the last of Unit 3's three parts. It covers the course section on oxygen and blood flow, the brain's arteries, strokes and tumours, and bleeds, and it ends the unit with its Case. The learner should be able to go from a stroke's symptoms to the artery that failed, by combining Part 2's map of brain regions with a map of which artery feeds which region.

The learner also asked to be able to **go back to a previous page, so everything can be replayed**. Today a finished lesson can be reopened from the path, but inside a lesson there is no way back to an earlier card or question.

## Goals

- **4 Bites, 1 Lab and the Case**, with `sources:` set to the course video titles. They are appended to `u03` in this order:

  | Lesson | Topic | Sources |
  |--------|-------|---------|
  | `u03-b11` | the brain's appetite for oxygen and glucose; no storage; consciousness is lost within seconds; flow is regulated | Oxygen and Cerebral Blood Flow |
  | `u03-b12` | carotid and vertebral arteries; basilar artery; circle of Willis; anterior, middle and posterior cerebral arteries (ACA, MCA, PCA) and their territories | Blood Supply |
  | `u03-lab-artery` | Lab | Blood Supply; Strokes and Tumors |
  | `u03-b13` | stroke: blocked (ischaemic) vs burst (haemorrhagic); time matters; brain tumours press on and invade nearby tissue | Strokes and Tumors |
  | `u03-b14` | bleeds by layer: epidural, subdural, subarachnoid, linked to Unit 1's meninges | Bleeds |
  | `u03-case-stroke` | the unit's Case, last on the path | all four |

- Every new text is in EN/FR/ZH. Every new glossary term has `unit: u03` and Wikipedia links per language where an article exists. Uncertain claims are marked `verify: true`. No developer metaphors.
- **Back navigation** in every lesson type (see below).

## Lab: Block an artery (`sim: artery`)

- **Views:** two 2D views of one hemisphere, which you switch between:
  - a side view, which shows mostly the MCA territory with the ACA and PCA at the edges;
  - a middle view (cut down the midline), which shows the ACA along the top and front and the PCA at the back and underneath.
  - The art reuses Part 2's side-view outline (`lateralBrain.tsx`) and adds a new middle-view drawing. Territories are drawn as coloured areas.
- **Explore mode:** tap one of three arteries (ACA, MCA, PCA). Its territory lights up on both views. A short list says what that territory does and what a block would cause:
  - **ACA:** leg and foot weakness and numbness on the opposite side.
  - **MCA:** face and arm weakness and numbness on the opposite side. On the left, language too (aphasia). On the right, neglect of the left side of space.
  - **PCA:** loss of the opposite half of the visual field.
- **Goal:** three patients, one at a time. For each, pick the blocked artery and its side. A wrong pick gets its own reason, e.g. "The ACA feeds the leg area; this patient's leg is fine." The goal is met when all three are solved.
- **Planned patients** (the builder may refine the wording and add `verify`):
  1. Left leg weak and numb, arm and face fine → right ACA.
  2. Can't see the right half of the visual field in either eye, no weakness → left PCA.
  3. Right face and arm weak, can't find words → left MCA. This is the easier preview of the Case, which tests it with more clues and a harder final call.
- **Model:** a pure TypeScript model for arteries, sides, territories, patients, answers and per-option explanations, with unit tests. Drag isn't needed: it's all taps.
- **Simplified:** real territories vary between people and overlap at their borders. The Lab says so in its "Simplified model" note.

## Case: `u03-case-stroke`

- **Story:** an original patient. A 64-year-old is having breakfast when their right hand drops the cup. Their speech comes out halting and wrong. A family member calls for help.
- **Clues**, each unlocked by a question on the concept behind it:
  1. The right face and arm are weak, but the leg is mostly spared. (Unlock question: the motor strip's layout, face and arm on the side vs leg at the top.)
  2. Speech is effortful and halting, but understanding is fairly good. (Unlock question: Broca's vs Wernicke's aphasia.)
  3. A scan shows no bleeding. (Unlock question: blocked vs burst stroke.)
  4. Symptoms started suddenly, less than an hour ago. (Unlock question: why time matters, since neurons have no stored energy.)
- **Final call:** `tap2d` on a side-view figure of arterial territories. The right answer is the left MCA territory. Wrong options and their explanations:
  - left ACA: "that would weaken the leg more than the arm, and speech would be spared";
  - left PCA: "that would cost half the visual field, not speech or the arm";
  - right MCA: "that would weaken the left side, and language would mostly be spared".
- The Case carries `verify: true` on any clinical detail that is a simplification.

## Back navigation (all lessons)

- **A Back button** in the lesson header, next to ✕, on every lesson screen. It is hidden on the very first page of a lesson.
- **Bites and Lab reflections (`RunPlayer`):**
  - Back steps through the pages already seen, in the order they were seen. This includes a question that came back after a wrong answer: each attempt is its own page.
  - A **card** looks as it did.
  - An **already-answered question** is **read-only** (the learner chose this). It shows the answer given, marked right or wrong, plus the right answer and the explanation. Nothing can be changed.
  - Continue on a past page moves one page forward. When the learner reaches the page they were on, everything is live again, including a half-built answer they had not yet checked.
  - Going back never changes XP, the review queue or the progress bar.
- **Labs:**
  - Back on the first sim screen returns to the last intro card.
  - Back on the first reflection question returns to the sim. The sim shows its finished state, as it already does on resume.
  - A Lab's sim screen has no history of its own: going back means the previous phase.
- **Cases:** a Case is one page whose clues stay open once unlocked, so it needs no history. Back isn't shown there; ✕ still leaves.
- **Saving:** the history is part of the saved place. Leaving a lesson and coming back keeps both the place and the pages behind it. A saved place from before this change, which has no history, still resumes and starts with an empty history.
- **Replaying a finished lesson:** this works already from the path. It starts the lesson fresh, and XP is not counted twice (the existing rule). No change is needed beyond checking that it still works with the new history.

## Non-goals

- A 3D blood supply. Arteries and territories are 2D only, since the brain model has no vessels.
- Changing an earlier answer when going back (the learner chose read-only).
- Back navigation inside a sim's own steps, e.g. undoing a placement in the flat map.
- The hippocampus and Alzheimer's material: it isn't in this unit's lesson list. It may come later as an extra.
- Review lessons and the Casebook (spec Phase 2).

## Anti-goals

- Going back being a way to farm XP or to wipe a mistake.
- Territory maps presented as exact. Every territory drawing is labelled simplified.
- Medical advice. The stroke content may mention calling for help fast as a fact about why time matters. It gives no treatment instructions.

## Approaches considered

- **Back on answered questions:** read-only vs answer again. **Read-only was chosen** by the learner: it keeps XP and the review queue simple and honest.
- **History model:** a list of pages seen, stored with the run, vs recomputing past pages from the run's answers. **The list was chosen** (my call): a question can appear twice after a wrong answer, and a list replays exactly what the learner saw.
- **Lab:** 2D side and middle views vs a 3D brain painted with territories. **2D was chosen:** the model has no vessels, and the middle view is needed to see the ACA's territory.
- **Case final call:** tap on a 2D territory figure vs choosing from a list of artery names. **The tap was chosen:** it asks the learner to locate the failure, not just name it, which matches the other Cases.

## Left to the builder

- Card wording, the question mix, glossary entries (e.g. ischaemia, the three bleed types, circle of Willis, ACA/MCA/PCA, haemorrhagic stroke).
- The art for the arteries, the circle of Willis, the territories and the bleeds. All drawn text is translated through `ART_TEXT`.
- The look of the Back button and of a read-only answered question.
