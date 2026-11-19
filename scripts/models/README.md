# Brain model pipeline

`public/models/brain.glb` is built from **BodyParts3D 3.0** (99% polygon-reduced OBJ set).

## Rebuild

1. Download (about 128 MB) into `scripts/models/raw/` (git-ignored):
   - `https://dbarchive.biosciencedbc.jp/data/bodyparts3d/20110915/BodyParts3D_3.0_obj_99.zip`
   - `parts_list_e.txt` and `composite_parts.txt` from the same folder (for looking up part IDs)
2. Unzip into `scripts/models/raw/obj/` (the zip uses backslash paths; `unzip` still extracts the files).
3. Run `npm run build:brain`, then `npx vitest run tests/brainModel.test.ts`.

## How it works

- `sources.yaml` lists, for each mesh node, the BodyParts3D files (FMA/BP ids) that make it up.
  Lobes are built from their gyri, because BodyParts3D only ships atomic parts as meshes.
- `build-brain.mjs` reads the OBJs, splits midline meshes by side when asked, converts the axes
  (BodyParts3D: +Z up, −Y anterior) to the app's frame (+Y up, +Z anterior, anatomical left = −X),
  centres and scales to a longest side of 2, simplifies with meshoptimizer and writes a
  meshopt-compressed GLB.
- Node names must match `meshNodes` in `content/structures.yaml`; the test checks this.
