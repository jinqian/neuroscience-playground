# Unit 3, Part 2: Brain Regions and Language — design

*Approved by the learner on 2026-11-24. Extends `2026-11-19-neuro-playground-design.md`. It follows Part 1, `2026-11-23-unit-3-part-1-development-design.md`.*

## Intent

This is the second of Unit 3's three parts. It covers the course section on nerves, what each region of the CNS does, the two hemispheres, aphasia and the language circuit, and the "flat schematic" of the brain. The learner should be able to reason from a symptom to a place in the brain, and to picture the whole CNS laid out as one map.

## Goals

- **About 5 Bites and 2 Labs**, with `sources:` set to the course video titles. Path order:

  | Lesson | Topic | Sources |
  |--------|-------|---------|
  | `u03-b06` | cranial vs spinal nerves; a few key cranial nerves (2D) | Nerves |
  | `u03-b07` | regional jobs: lobes, motor and sensory strips, cerebellum, brainstem | CNS Regional Functions |
  | `u03-b08` | left vs right hemisphere; corpus callosum and split-brain | Hemisphere Functions |
  | `u03-lab-flatmap` | Lab A | Making a Flat Schematic of the Brain |
  | `u03-b09` | aphasia: Broca's (non-fluent) vs Wernicke's (fluent) | Aphasia |
  | `u03-b10` | the language circuit: arcuate fasciculus, conduction aphasia | Language Circuits |
  | `u03-lab-lesion` | Lab B | Aphasia; Language Circuits; CNS Regional Functions |

- Every new text is in EN/FR/ZH. Every new glossary term has `unit: u03` and Wikipedia links. Uncertain claims are marked `verify: true`. No developer metaphors.

## Lab A: Flat-map builder (`sim: flatmap`)

- The diagram is a flat, unrolled map of the CNS, drawn as a straight line from the spinal cord up to the cerebral hemispheres. It extends Part 1's five-vesicle drawing, and its slots are coloured by vesicle of origin.
- It has these slots, in order:
  - spinal cord
  - medulla
  - pons
  - cerebellum, off the pons
  - midbrain
  - thalamus
  - hypothalamus
  - basal forebrain and hemisphere
  - the four lobes, shown as a fan
- You place region labels by dragging a label onto a slot, or by tapping a label and then a slot. Both work.
- Feedback: a wrong placement returns the label and shows a hint about where along the axis it belongs. The goal is reached when every slot is filled.
- The drag logic is the same as Part 1's Lab, pulled into a shared hook: the chip follows the pointer, the target lights up, a drop is found under the dragged chip, a stale drag is cleared, and resuming after the goal shows the finished map.
- **The layout is the builder's own.** The course's exact drawing isn't available, so the Lab carries a `verify` badge and a "Simplified model" note.

## Lab B: Lesion localizer (`sim: lesion`)

- **Cases:** 6 short original patient descriptions, each 1–2 sentences.
- **What you do:** for each case, tap the damaged spot on a 2D side view of one hemisphere. The figure flips to show the right hemisphere where the case needs it.
- **Tappable zones:**
  - prefrontal
  - motor strip
  - Broca's area
  - sensory strip
  - parietal association cortex
  - Wernicke's area
  - primary auditory cortex
  - occipital (visual) cortex
  - cerebellum
  - brainstem
- **Feedback:** each wrong tap gets its own reason. For example: "That's Wernicke's area: damage there leaves speech fluent but empty."
- **Goal:** all 6 cases solved.
- **Planned cases** (the builder may refine wording and add `verify`):
  1. Halting, effortful speech, understands well, weak right arm → left Broca's area (with the motor strip next to it).
  2. Fluent but meaningless speech, poor understanding → left Wernicke's area.
  3. Weak left hand and face → right motor strip.
  4. Numb right hand → left sensory strip.
  5. Ignores the left side of space → right parietal association cortex.
  6. Clumsy, shaky reaching on the right side → right cerebellum, which is on the same side as the symptom. This one is a deliberate "twist".
- **Why 2D:** Broca's area has no 3D mesh, and a side-view diagram makes the symptom-to-place mapping clearest.
- **Model:** a pure TypeScript model for cases, zones, answers and the per-zone explanations, with unit tests.

## 3D brain additions

| Structure | Meshes | Taken out of |
|-----------|--------|--------------|
| `motor-strip` (precentral gyrus) | FMA72662 (L), FMA72661 (R) | frontal-lobe |
| `sensory-strip` (postcentral gyrus) | FMA72666 (L), FMA72665 (R) | parietal-lobe |
| `insula` | FMA72978 (L), FMA72977 (R) | new |
| `wernicke-area` (left posterior superior temporal gyrus) | FMA72805 | temporal-lobe_L |

- Each new structure records `partOf` (motor strip → frontal lobe, sensory strip → parietal lobe, Wernicke's area → temporal lobe). A 3D "find the frontal lobe" question then also accepts a tap on the motor strip, so the existing Unit 1 and Unit 2 questions keep working.
- `broca-area` and `cranial-nerves` are listed as 2D-only structures.
- `docs/models/MODELS.md` is updated, and the brain model is rebuilt.

## Non-goals

- Blood supply, stroke and the unit's Case (Part 3).
- 3D cranial nerves, or a 3D Broca's area painted onto the cortex.
- Review lessons and the Casebook (spec Phase 2).

## Anti-goals

- A localizer that rewards memorised positions without the reasoning (every answer comes with its why).
- Presenting "left = logic, right = creativity" pop-science as fact.

## Approaches considered

- **Lesion localizer:** on the 3D brain vs a 2D side view. **2D was chosen:** Broca's area has no mesh, and a side-view diagram makes the reasoning clearest.
- **Flat map:** free drawing vs placing labels into fixed slots. **Slots were chosen:** they can be checked, and they match the Part 1 Lab.
- **The learner chose to build both Labs** instead of picking one.

## Left to the builder

- Card wording, the question mix, and which cranial nerves to feature.
- The exact case wording and the per-zone explanations.
- The flat-map art and the slot shapes.
