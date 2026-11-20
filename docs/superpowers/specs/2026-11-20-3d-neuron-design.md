# 3D Neuron — design (small change)

*Approved by the learner on 2026-11-20. Extends the main spec, `2026-11-19-neuro-playground-design.md`.*

## Intent

The learner wants to see a typical neuron as a real 3D shape: first to explore and name its parts, then to watch a signal travel along it. It is for learning, so clarity beats realism.

## Goals

- A new **Neuron** screen, next to **Brain** in the header (route `/neuron`).
- A clean, typical myelinated neuron that you can rotate and zoom, with these parts:
  - dendrites
  - soma
  - nucleus
  - axon hillock
  - axon
  - myelin
  - node of Ranvier
  - axon terminal
- Colour rules match the brain: everything is grey (`#d5d9e0`); the selected part shows in its own colour; hover shows a light tint of that colour.
- Tapping a part shows:
  - its name
  - a short plain-language note
  - a link to its glossary term (Wikipedia link included)
- **Send a signal** plays a glowing pulse along the cell:
  1. It starts at a dendrite tip and gathers at the soma.
  2. It fires at the axon hillock.
  3. It **jumps from node to node** along the axon.
  4. It reaches the terminals.
- **Remove myelin** hides the myelin. The same signal then **creeps continuously and slowly** along the bare axon.
- A **slow / fast** speed control.
- No 3D (no WebGL): a plain name list of the parts, which can still be selected.

## Non-goals (this version)

- Neuron questions inside lessons
- Other neuron types
- A close-up of the synapse
- Real traced neuron data

## Constraints

- Neuroscience only: no developer metaphors.
- Every new glossary term has a Wikipedia link. The nucleus is added as `cell-nucleus`.
- English only. Notes are written in YAML so FR and ZH can be added later.
- Credits stay accurate. The neuron is generated in code, so it adds no third-party asset.

## Approaches

1. **Shape it in code** from tubes along curves and spheres (three.js). *Chosen.* Every part is clean and tappable, there's no model file or licence, and the style matches the brain.
2. **A traced real neuron** (NeuroMorpho SWC). Rejected for v1: no myelin or nodes, messy for learning.
3. **An artist's model (GLB).** Rejected: licences that allow sharing are rare, and the parts are hard to separate.

## Decided

- The parts' text lives in `content/neuron.yaml` (`id`, `name`, `note`, `term`). The content check verifies that:
  - every part id exists in the 3D model
  - every model part has text
  - every `term` exists in the glossary
- The signal's timing is a pure function of time and whether the axon is myelinated, so it can be tested without 3D:
  - With myelin, the pulse is only ever at a node (it never sits inside a myelin segment).
  - Without myelin, it moves smoothly along the axon and takes several times longer to arrive.
- The 3D code is lazy-loaded like the brain's, so the home page stays light.

## Left to the builder

- The exact shapes, branch counts, sizes and part colours. Each part's colour must differ from the others and from the grey.
- The pulse's look (a glowing sphere is enough).
