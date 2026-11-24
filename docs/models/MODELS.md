# 3D model sources, licenses and attributions

## Attribution (required)

> BodyParts3D, Copyright© The Database Center for Life Science licensed by CC Attribution-Share Alike 2.1 Japan

License: [CC BY-SA 2.1 JP](https://creativecommons.org/licenses/by-sa/2.1/jp/deed.en). Derivative works (including `public/models/brain.glb`) must stay under the same license.
Citation: Mitsuhashi N, et al. *BodyParts3D: 3D structure database for anatomical concepts.* Nucleic Acids Res. 2009;37:D782-5.

## Nodes in brain.glb

All come from `BodyParts3D_3.0_obj_99`, one body, so no alignment was needed. Total after simplification: about 235k triangles, 0.85 MB.

| Node | BodyParts3D parts |
|------|-------------------|
| frontal-lobe_L / _R | superior and middle frontal gyri (FMA72654/72656, FMA72653/72655); orbital gyri straight gyrus (BP51, split at the midline) |
| parietal-lobe_L / _R | superior parietal lobule + precuneus (BP49/BP50); supramarginal and angular gyri |
| temporal-lobe_L / _R | superior (anterior part; posterior part on the right only), middle, inferior temporal, fusiform and parahippocampal gyri |
| occipital-lobe_L / _R | left / right occipital lobe (FMA72976 / FMA72975) |
| cerebellum | cerebellum (FMA67944) |
| brainstem | midbrain (FMA61993nsn), cerebral peduncle, superior and inferior colliculi, pons (FMA67943), medulla oblongata (FMA62004) |
| hypothalamus | hypothalamus (FMA62008nsn), tuber cinereum (FMA62327) |
| thalamus_L / _R | left / right thalamus (FMA258716 / FMA258714) |
| corpus-callosum | corpus callosum (FMA86464) |
| ventricles_L / _R | left / right lateral ventricle (FMA78450 / FMA78449) |
| ventricles | third ventricle (FMA78454), fourth ventricle (FMA78469) |
| motor-strip_L / _R | left / right precentral gyrus (FMA72662 / FMA72661) |
| sensory-strip_L / _R | left / right postcentral gyrus (FMA72666 / FMA72665) |
| insula_L / _R | left / right insula (FMA72978 / FMA72977) |
| wernicke-area_L | posterior part of the left superior temporal gyrus (FMA72805), standing in for Wernicke's area |

## Known gaps

- The cortex is incomplete in this dataset: there's no mesh for the **inferior frontal gyrus** (Broca's area), the insula's cover (opercula) or several medial gyri. The lobes are real anatomy, but patchy in places.

## Fallbacks (structures shown in 2D only)

| Structure | Why |
|-----------|-----|
| broca-area | No inferior frontal gyrus mesh in BodyParts3D 3.0. |
| cranial-nerves | Only the optic nerves have meshes; the rest are drawn in 2D. |
| spinal-cord | BodyParts3D 3.0 has no spinal cord mesh: the "spinal cord" composite contains only a short stub of the central canal (about 3 cm below the medulla). Candidate for later: a CC BY-SA source derived from BodyParts3D that includes the cord (e.g. Z-Anatomy), which would need your OK to download. |
