# Neuro Playground

A personal, Duolingo-style app for learning neuroscience, following the 10 modules of an introductory online neurobiology course. Each unit mixes short **Bites** (illustrated cards + quick questions), hands-on **Labs** (simulations) and a **Case** (a patient mystery), plus a real-anatomy **3D brain** and a trilingual-ready **Glossary**.

**Live app:** https://jinqian.github.io/neuroscience-playground/ (deployed from `main` by `.github/workflows/pages.yml`)

Design: `docs/superpowers/specs/2026-11-19-neuro-playground-design.md` · Mockups: `docs/design/directions-mockup.html`

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # unit tests + checks every content file
npm run typecheck
npm run build      # static site in dist/, works offline (serve dist/ with any static server, e.g. npx vite preview)
```

Progress (XP, streak, completed lessons, review queue, discovered brain parts, met terms, and your place inside unfinished lessons) is saved in your browser's localStorage under `neuro-playground:v1`. Each browser and each address (local vs. the live site) keeps its own progress.

## Languages

English only for now. French and Simplified Chinese are wired in (switcher, glossary columns, popovers) but stay "coming soon" until the English version is signed off. To enable a language later: add its text to every `content/` file, add `src/i18n/ui.<lang>.ts`, and add it to `ENABLED_LANGUAGES` in `src/config.ts`. The content check then fails until nothing is missing.

## Editing content

Everything you read lives in `content/` as YAML:

```
content/
  units/u01.yaml        unit title, nickname, colour, ordered lesson ids
  lessons/u01/*.yaml    one file per Bite, Lab or Case
  glossary.yaml         key terms (with Wikipedia links)
  structures.yaml       3D brain parts (name, note, mesh nodes)
```

- **Text** is a map per language: `{ en: "…" }` (later `fr`, `zh`).
- **Markup** in lesson text: `**bold**`, `[[term-id]]` (shows the glossary term) or `[[term-id|shown text]]`. Terms become tappable and open a popover with all three languages, roots and a Wikipedia link.
- **Every glossary term needs `wiki: { en: "https://en.wikipedia.org/wiki/…" }`.**
- **IDs:** lessons `u01-b01`, `u01-lab-myelin`, `u01-case-tingling`; cards `c1…`, questions `q1…`, clues `k1…` (unique within a lesson).
- **Question kinds:** `mc`, `gap` (prompt has one `___`), `order` (steps listed in the right order), `match`, `tfwhy`, `tap2d` (a figure + region), `tap3d` (a structure), `termmatch` (needs two enabled languages).
- `sources:` lists the matching course video titles; `verify: true` shows a "Check against the course" badge.
- Bites have 1–3 cards (≤ 80 words each) and 4–8 questions; a Case must be the last lesson of its unit.

Run `npm test` after editing: the content check lists every problem as `file — field.path: message`. The dev server shows the same list instead of a blank page.

Illustrations and tappable figures are React SVG components registered in `src/illustrations/registry.tsx`; simulations are in `src/sims/` and registered in `src/lab/registry.ts`.

## The 3D brain

`public/models/brain.glb` is built from BodyParts3D (CC BY-SA 2.1 JP). To rebuild it, see `scripts/models/README.md`; sources, attribution and known gaps (no spinal cord mesh yet) are in `docs/models/MODELS.md`.

**Attribution:** BodyParts3D, Copyright© The Database Center for Life Science licensed by CC Attribution-Share Alike 2.1 Japan.
