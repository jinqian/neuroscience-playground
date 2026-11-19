# Neuro Playground: Design

Date: 2026-11-19
Status: approved by the learner 2026-11-19 (English first; FR/ZH after the learner's sign-off)

## Intent

A personal web app for learning neuroscience, built for one person who is both a curious learner and a software developer. Its job is to help them keep their attention on the material. Long video runs make focus drift (the course is ~19 hours of 2–12 minute videos).

The learner is trilingual (English, French, Chinese) and wants the whole app in all three languages, switchable at any time, so they can fully understand every term in each language.

The scientific reference and syllabus is an introductory online neurobiology course. The app follows its 10 modules in order and runs alongside the course. It is a companion to the course, not a replacement for it.

Visual reference: the direction mockups at https://claude.ai/artifact/FEpSjjbaHa7Ptmopf1WQuG (Direction A for the overall look; C and D for the Lab and Case lesson types).

## Goals

- Short, focused sessions (3–8 minutes) the learner wants to come back to daily.
- Explanations written for a curious person, focused purely on neuroscience. *(Changed 2026-11-19 at the learner's request: no developer or code metaphors anywhere — no analogy boxes, no code views, no code-style text in sims.)*
- Every new term links to its Wikipedia article (per language once FR/ZH exist).
- Understanding of mechanisms through hands-on simulations, not only memorized facts.
- Spatial understanding of anatomy through a rotatable, anatomically real 3D brain.
- Readiness for each graded course quiz once the matching unit is done.
- Every term and explanation available in English, French and Chinese, with each key term's three names one tap away.

## Non-goals

- No accounts, server, sync, or multiple users. It runs locally for one person.
- No reproduction of course videos, transcripts, slides, or quiz questions.
- No integration with the course platform (grades, deadlines, login).
- Not a native mobile app. Desktop browser first; it should still be usable on a laptop trackpad.

## Anti-goals (failure even if it "works")

- It turns into a flashcard grind with no mechanism understanding.
- Gamification punishes (lockouts, lost progress) and makes the learner avoid opening it.
- It states inaccurate science confidently. Simplified models must say they are simplified.
- Lessons creep past ~8 minutes and recreate the video problem.

## Success

The learner does a session most days, and for each module finished in the app, feels ready for the matching course quiz.

## Course structure (scope source)

| # | Module | Video time | Notes for this app |
|---|--------|-----------|--------------------|
| 1 | The Nervous System | 47m | neurons, glia, myelin, CNS/PNS, meninges, tumors |
| 2 | Neural Communication + Embodied Emotion | 1h39m | resting/action potential, neurotransmitters, receptors, Botox, ENS, sympathetic/parasympathetic, spinal cord injury |
| 3 | Neuroanatomy | 3h26m | neural tube, vesicles, cortex expansion, nerves, CNS regions, hemispheres, aphasia, blood supply, stroke, hippocampus |
| 4 | Perception and Vision | 2h38m | illusions, Weber's law, optics, rods/cones, color, visual fields, edges |
| 5 | Hearing | 1h19m | ear anatomy, cochlear amplifier, hearing loss, Rinne/Weber, prosody |
| 6 | Vestibular Sense & Gaze | 1h22m | canals, otoconia, VOR, nystagmus, saccades |
| 7 | Voluntary Movements | 1h28m | motor hierarchy, fiber types, recruitment, stretch reflex, posture, CPGs |
| 8 | Motor Modulation | 1h38m | cerebellum, Purkinje cells, efference copy, basal ganglia, Parkinson's |
| 9 | Homeostasis | 1h12m | hypothalamus, pituitary, thermoregulation, fever, breathing, urination, sleep |
| 10 | Abstract Function | 1h38m | attention, memory types, H.M., amnesia, language, aphasias |

Each course subsection ends in a "Practical Scenario", and several modules have clinical vignettes. These motivate (but are not copied into) the Case lessons.

## Approaches considered

1. **Synapse Quest (Duolingo-style path).** Best for habit and focus, but thin on mechanisms by itself.
2. **Field Guide (illustrated notebook).** Best for calm anatomy study, but has no momentum.
3. **brain.dev (developer lab).** Best for mechanism understanding, but code metaphors can mislead and it fits anatomy poorly.
4. **Case Files (clinical detective).** Most narrative pull, but cellular topics don't fit it.

**Chosen (by the learner):** Direction 1 as the frame. Inside each module there are three lesson types: **Bite** (from 1), **Lab** (from 3), and **Case** (from 4). The learner also asked for a **rotatable 3D brain** to discover the parts being learned, and chose **real anatomy** over a stylized model. The Field Guide (2) may come later as a reference atlas. It is not in scope now.

## The experience

### Path (home screen)
- One unit per course module, in course order, each with its own colour and a short friendly name (e.g. Unit 2 "Talking Neurons").
- Within a unit: a winding path of lesson nodes. Done nodes are gold, the current node is highlighted, and future nodes are locked. A unit ends with its Case node.
- Header: daily streak, total XP, and a button to the Brain Explorer.
- A **Review** node appears on the path when items are due for review (see Review).

### Unit access *(builder's call)*
- All units are open from the start, so the learner can jump to whichever module they're on in the course.
- Within a unit, the next node unlocks on completion.
- The Case node unlocks when all Bites in its unit are done. Labs are not required for it.
- A unit that has no content yet shows as "coming soon".

### Languages (EN / FR / CN)
The learner asked for this. The calls marked below are the builder's.

**Coverage.** Everything the learner reads exists in all three languages:
- UI text
- lesson cards
- questions, answer options and their explanations
- Lab intros, goals and "simplified model" notes
- Case text
- 3D structure names and notes
- the mascot's lines
- Credits

Chinese means **Simplified Chinese** (zh-Hans) *(builder's call)*.

**Switching.**
- A language switcher (EN · FR · 中文) sits in the header and in every lesson screen.
- Switching mid-lesson re-renders the current card or question in the new language and keeps the learner's place and any answer already chosen.
- The choice is remembered.

**Key terms (the core of this request)** *(builder's call)*:
- In lesson text, key terms (e.g. action potential / potentiel d'action / 动作电位) are marked.
- Tapping or hovering a marked term opens a small popover with the term in all three languages, plus Latin/Greek roots or the abbreviation where useful (e.g. "VOR").
- The 3D brain's labels and info panels follow the current language. The info panel always also shows the structure's name in the other two languages.

**Glossary screen.** A searchable list of every key term met so far, shown as a three-column EN / FR / CN table. It can be filtered by unit, and tapping a term jumps to where it was taught.

**Practice.** A "term match" question type pairs the same term across two languages (e.g. FR ↔ 中文). It is used sparingly, mostly in Review lessons, and only once the term has been taught.

**Progress.** XP, review items and discovered structures are keyed by language-independent IDs, so switching language never resets anything.

**Translation quality.**
- Content is written in English first, then translated by Claude into French and Chinese using standard medical/neuroscience terminology:
  - French: as used in French medical teaching.
  - Chinese: the standard mainland terms, e.g. 小脑, 基底神经节, 前庭眼反射.
- Uncertain terms are flagged `verify` in the source, in the same way as uncertain science.
- The learner, being trilingual, is the final reviewer.

**Validation.** The content checker fails if any language is missing for a card, question, option, explanation, term or structure, or if question/option IDs don't line up across languages.

**Fonts.** The rounded Latin face (Nunito or similar) is paired with a CJK fallback (e.g. Noto Sans SC). Font files are bundled locally so the app works offline.

### Mascot
"Dendri", an original purple neuron character (see the mockup). It reacts to answers and delivers short explanations in speech bubbles. It must be original art. Nothing from Duolingo's brand (the owl, its exact green, its font) is used.

### Lesson types

**Bite (most lessons, ~3–5 min).**
Covers 1–3 explainer cards plus 4–8 questions. An explainer card has a flat-style SVG illustration and ≤80 words. Optional extras per card:
- an "Explore in 3D" button (see 3D brain)

Question types:
- multiple choice
- fill the gap (choose from options)
- order the steps
- match pairs
- true/false + "why" (pick the reason)
- tap the part, on a 2D SVG or on the 3D brain
- term match across languages (see Languages)

A wrong answer shows a short explanation, and the question comes back at the end of the same lesson. There are no hearts or lockouts.

**Lab (1–2 per unit, ~5–8 min).**
A live simulation with a stated goal and a success condition, e.g. "Find the smallest stimulus that makes the neuron fire". It has a short intro card, the sim, and 2–3 reflection questions. Every sim shows a "Simplified model" note saying what it leaves out.
Labs and Cases take their interaction patterns from Directions C and D. Visually they stay in the Direction A frame: the Lab sim panel may use a dark "bench" surface, and Cases get a light paper-card treatment. Both are done with theme tokens, not separate apps.

**Case (unit finale, ~8 min).**
An original patient scenario. Clues start locked, and each one unlocks by answering a question on the concept behind it. Then the learner makes a final call (e.g. click the lesion region on the 2D or 3D brain, pick the nerve, pick the drug effect). Every wrong option gets its own explanation. Solved cases go into a Casebook.

### 3D brain

**Real anatomy.** It is built from openly licensed segmented meshes, converted to glTF/GLB and simplified for the browser. Rendering uses flat/toon shading in the app's palette so it matches the illustrated look.

Two entry points:
1. **Explore step inside lessons.** It opens the brain focused on the lesson's structures (highlighted, camera framed on them). There are optional "find it" prompts: the app names a structure and the learner rotates and taps it.
2. **Brain Explorer screen**, always reachable from the header. Structures the learner has already met are coloured and labelled. Unmet ones are neutral grey and unlabelled ("not discovered yet"). Tapping a met structure shows its name, a one-paragraph note, which unit taught it, and a "quiz me on this" action.

Controls:
- orbit, zoom, reset view
- toggle a translucent cortex to see deep structures
- isolate the left or right hemisphere
- show only the current unit's structures

Structure coverage needed across the course (minimum):
- **Brain surface:** cerebral cortex by lobe (frontal, parietal, temporal, occipital), precentral and postcentral gyri, Broca's and Wernicke's areas (as highlighted surface regions)
- **Big parts:** cerebellum; brainstem (midbrain, pons, medulla); spinal cord (at least the upper portion)
- **Deep structures:** thalamus, hypothalamus, pituitary, hippocampus, amygdala, basal ganglia (caudate, putamen, globus pallidus), ventricles
- **Other:** corpus callosum; optic nerve/chiasm/tract

Covering all of these is the target by Phase 3. Phase 1 needs only what Units 1–2 reference (see Phases).

**Mesh sources (candidates, to be confirmed by inspection):**
- NIH 3D entry 3DPX-001944 (hippocampus, amygdala, thalamus, accumbens, caudate, pallidum, putamen, brainstem; CC BY-NC-SA; GLB export available)
- NIH 3D 3DPX-000761 (subcortical, public domain)
- Brainder FreeSurfer-derived surfaces (Creative Commons; OBJ/PLY)
- BodyParts3D (CC BY-SA 2.1 JP; per-organ OBJ)

Non-commercial/share-alike terms are acceptable because this is a personal, unpublished tool. An in-app Credits screen gives the required attributions. If the app is ever published, the licenses must be re-checked.

Surface regions that aren't separate meshes (Broca's, Wernicke's, motor strip) may be shown as painted regions or decals on the cortex mesh.

**Fallback when no open mesh fits** *(builder's call)*:
1. Use one real cortex mesh with lobes and areas painted on it (vertex colours or a region-ID texture), rather than separate lobe meshes.
2. If a deep structure has no usable mesh, or meshes from different sources can't be aligned, leave it out of 3D, show it in a 2D illustration, and list it in the Explorer as "2D only".
3. Never hand-model fake anatomy.
4. Mesh wrangling is time-boxed per phase. A structure that doesn't fit the box falls back to option 2 and is logged for later.

### Review
- Every question and every 3D structure is a review item.
- Missed items enter a simple spaced-repetition queue (Leitner boxes: 1 → 2 → 4 → 8 → 16 days).
- A Review lesson pulls up to 10 due items, including "find it" prompts on the 3D brain.

### Progress and gamification
- **XP:** +10 per correct answer, +20 for a Lab goal, +50 for a solved Case.
- **Streak:** counts local calendar days with at least one completed lesson.
- **Unit badge:** earned when the unit's Case is solved.
- No hearts, no penalties, no timers.
- **Mid-lesson saving** *(added 2026-11-19 at the learner's request)*: leaving an unfinished Bite, Lab or Case and coming back resumes at the same card or question. Checked answers, the review queue, a Lab's goal and a Case's unlocked clues are kept, and XP is never counted twice. The saved place is cleared when the lesson is finished, and ignored if the lesson's content has changed since.

## Content

### Writing and accuracy
- All text, questions, illustrations, and cases are original, written to cover the topics in each course module.
- Each lesson file records which course videos it corresponds to (by title) so the learner can cross-check.
- Content written by Claude may contain errors. Any claim the author is unsure of is marked `verify: true` in the source, and the app shows a small "check against the course" marker on it.

### Format
Content lives as files in the repo, so the learner can read and edit it like code:

```
content/
  units.json                   # unit order, names, colours
  u02-neural-communication/
    unit.json                  # lessons in order, type, ids
    b01-electrical-language.md # Bite: frontmatter + cards + questions (YAML/JSON blocks)
    lab-threshold.json         # Lab config: sim id, goal, reflection questions
    case-xxx.json              # Case: clues, unlock questions, final call, explanations
  brain/
    structures.json            # id, name, aliases, mesh/region ref, note, unit(s)
public/models/                 # GLB files
```

The exact lesson file format is the builder's call. It must be easy to hand-edit and must be validated at build or dev time, so a typo fails loudly.

The format must hold three languages per item, either as per-language fields in one file or as parallel files per language (e.g. `b01.en.md`, `b01.fr.md`, `b01.zh.md`), with shared IDs either way.

Key terms live in `content/glossary.yaml` (`id`, `en`, `fr`, `zh`, optional roots and abbreviation, the unit that introduces it, and a required `wiki` link per language: `{ en, fr?, zh? }` pointing at that language's Wikipedia article). The term popover and the Glossary show a "Read on Wikipedia" link. Lesson text references terms by ID so they can be marked and linked.

## Technical approach

- **App:** Vite + React + TypeScript. Started with `npm run dev`; a static build should also work offline.
- **3D:** three.js via react-three-fiber + drei.
- **Simulations:** each is a React component (canvas or SVG). Its model is a pure TypeScript module, kept separate from rendering and unit-tested.
- **Persistence:** browser storage (localStorage or IndexedDB) for progress, XP, streak, the review queue, and discovered structures. There is an export/import of progress as a JSON file so it can be backed up.
- **Tests:** Vitest for the engine (lesson flow, scoring, streak, Leitner scheduling), content validation, and sim models.
- **Look:** follows mockup Direction A. Rounded, bright, chunky buttons; Nunito (or a similar rounded face); one idea per screen.

## Phases

1. **Phase 1: frame + Units 1 and 2 + Brain Explorer v1**
   - Path, lesson player with all question types, XP and streak, mascot.
   - **English only at first (learner's instruction).** The code is trilingual-ready from the start: the content schema has `en`/`fr`/`zh` slots, the glossary and term popovers are built, and the language switcher exists with FR and 中文 shown as disabled "coming soon". The validator only requires languages listed in an `enabledLanguages` setting, which is `["en"]` for now.
   - **FR and ZH content and UI are added only after the learner explicitly signs off on the English version.**
   - Unit 1 (The Nervous System) and Unit 2 (Neural Communication + Embodied Emotion), each complete with Bites, at least 1 Lab, and a Case.
   - Unit 1 is included because it's short and introduces CNS/PNS anatomy, which gives the 3D brain real use from day one.
   - 3D brain with the big parts plus the structures Units 1–2 use: cortex/lobes, cerebellum, brainstem, spinal cord, hypothalamus.
   - Built in full order (frame, then Units 1–2, then the 3D brain). The learner confirmed course deadlines don't drive the schedule.
2. **Phase 2: Review + polish**
   - Review lessons, the Casebook, progress export/import, Credits screen, mascot reactions, and optional sounds.
3. **Phase 3: Units 3–10**, in course order. Each unit adds its Bites, Labs, Case, and any new 3D structures.

## Lab ideas per unit (starting list; builder may adjust)

| Unit | Lab ideas |
|------|-----------|
| U1 | myelin speed race (conduction velocity with and without myelin; demyelination) |
| U2 | membrane threshold (all-or-none); synapse toy (release, receptor, reuptake; what Botox blocks); sympathetic/parasympathetic balance dial |
| U3 | brain unfolding (neural tube → vesicles); lesion localizer |
| U4 | Weber's law slider; visual-field cutter (lesion along the visual pathway → field loss) |
| U5 | cochlea frequency map with playable tones |
| U6 | VOR gain tuner |
| U7 | motor unit orderly recruitment; CPG oscillator |
| U8 | basal ganglia go/no-go switchboard (incl. dopamine loss) |
| U9 | thermostat feedback loop (set point, fever) |
| U10 | memory-system sorter |

## Appendix: course outline (subsections → video titles)

Recorded from the learner's course pages on 2026-11-19. Each subsection also ends with one or more "Practical Scenario" items, and each module ends with a graded quiz. Use these for lesson `source` fields and for sizing Bites (about one per subsection).

- **M1 The Nervous System:**
  - Neurons: Meet the Stars: Neurons; Parts of the Neuron; Neuronal Uniqueness; Glial Cells; Myelin; Demyelinating Diseases
  - CNS vs PNS: Meninges; Peripheral Diseases; Brain Tumors
  - Labs (dissection video, optional): The Brain and the Spinal Cord; Meninges; Brain Tumors
  - Reading: Clinical Vignette: Brain Tumor
- **M2 Neural Communication + Embodied Emotion:**
  - Intro: Electrical Language; Electricity Review; Action Potential
  - Neurotransmitters: Synthesis; Release; Clostridial Toxins: Botox; Signal Termination; Receptors; Metabotropic Receptors; Wrap-Up
  - Embodied Emotion: Intro; Enteric Nervous System; Parasympathetics & Sympathetics; PS/S Balance; Autonomic Pharmacology; Spinal Cord Injury; Wrap-Up
- **M3 Neuroanatomy:**
  - Early Brain Development: Intro; Neural Tube Formation; Neural Tube Defects; Brain Vesicles; Expansion of the Cerebral Cortex; Two Forebrain Tracts; Cerebral Palsy
  - Neuroanatomy: Nerves; CNS Regional Functions; Hemisphere Functions; Aphasia; Language Circuits; Making a Flat Schematic of the Brain
  - Lesions: Oxygen and Cerebral Blood Flow; Blood Supply; Strokes and Tumors; Bleeds
  - Labs (optional): Spinal Cord; Inside the Cranium; Telencephalon; Cortex; Cerebellum; Visual Pathway; Pituitary Tumors; Blood Supply; Hippocampus & Alzheimer's
- **M4 Perception and Vision:**
  - Perception: Intro; Optical Illusions; Auditory Illusions; Weber's Law; Stimulus Set; The Road to Perception; Name the Senses
  - Getting Light to the Retina: The Visual Pathway; Distance Vision; Near Vision + Near Triad; Emmetropization
  - Turning Light into Neural Information: Light Path; Rods and Cones; Central Vision; Color Vision
  - Interpreting the Optical World: Visual Fields; The Importance of Edges; Visual Perception
  - Learning to See
  - Sheep Brain Labs (optional)
  - Reading: Clinical Vignette: Albinism
- **M5 Hearing:**
  - Intro: Introduction; Experiences of Hearing Loss
  - How It Works: Hearing Pathways; External Ear; Rinne Test; Middle Ear; Inner Ear
  - Cochlear Amplifier: Cochlear Amplifier; Outer Hair Cell Motility; Otoacoustic Emissions; Hearing Loss; Weber and Rinne
  - Interpretation of Sound: Expectation; Prosody; Communication; Wrap-up
  - Reading: Clinical Vignette: One Man's Story of Hearing
- **M6 Vestibular Sense & Gaze:**
  - Peripheral Apparatus: Intro; The Vestibular Stimulus; Canals and Otoconial Masses
  - Physiology: Hair Cell Orientation; Yoked End Organs 1–2; Otoconial Disorders; Visual Integration
  - VOR: The VOR Is Fast; Horizontal VOR Circuitry; Nystagmus; Adapting the VOR
  - Gaze Control: Eye Movements; Saccades; Saccade Circuits; Controlling Saccades
- **M7 Voluntary Movements:**
  - Motor Hierarchy: Intro; Motor Hierarchy; Problems with Motor Hierarchy; Motor Modulation
  - Muscles and Motoneurons: Fast and Slow Fibers; Motoneuron Types; Orderly Recruitment; Exercise and Muscle Mass
  - Stretch Reflex: Monosynaptic Reflex; Co-activation; Gamma Reflex Loop
  - Automatic Movements: Posture; Postural Control; Central Pattern Generator
  - Self-Generated: Intro; Praxis; Emotional Movements
- **M8 Motor Modulation:**
  - Cerebellum: The Data-Driven Cerebellum; The Purkinje Cell; Cerebellar Functions; Topography; Laterality; Efference Copy and Sensory Reafference
  - Cerebellar Learning: Cerebellar Learning and the VOR; More Cerebellar Learning
  - Basal Ganglia: Action Selection; Anatomy; Pathways
  - BG Function: Operational Learning; Chunking; Parkinson's Disease; Non-Motor Functions; Cerebellum and BG Cooperation
- **M9 Homeostasis:**
  - Anatomy and Hormones: Intro; Hypothalamic Anatomy; Pituitary Gland & Gigantism; Post-Partum Mood Disorders
  - Thermoregulation: Thermoregulation; Hyperthermia; Fever and Hot Flashes
  - Breathing, Urination, and Sleep: Breathing; Urination; Problems with the Urination System; Sleep Phenomenology; Sleep Mechanisms
- **M10 Abstract Function:**
  - Emotion and Attention: Intro; Bauby and Emotion; Thalamic Attention; Mushroom Hunting
  - Memory: Memory Types; PTSD; Semantic Memories; Episodic Memories
  - Memory Loss: The Story of H.M.; Memory Formation Circuitry; Hollywood Amnesia; Clinical Amnesia
  - Language and Disability: Intro to Language; Aphasias; Prosody; Intellectual Disability
  - Final Thoughts: Your Brain, Your Illness; Future Challenges
  - Final project (peer-reviewed)

## Left to the builder

- Exact lesson file schema and the parser/validator.
- Which mesh sources to use for each structure after inspecting them, plus the mesh simplification budget. Keep the total model download reasonable for a local app (aim for well under ~20 MB).
- Illustration details within the Direction A style.
- State management and routing libraries.
- Exact count of Bites per unit (roughly one per course subsection).
