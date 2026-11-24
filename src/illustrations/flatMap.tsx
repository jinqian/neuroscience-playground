import type { Slot } from '../sims/flatmap/model'
import { ArtSvg, INK, Label } from './Region'
import { VESICLE_COLORS } from './vesicles'

/** Where each part sits on the flat map: x, y, width, height (spinal cord at the bottom, lobes in a fan at the top). */
export const SLOT_BOX: Record<Slot, [number, number, number, number]> = {
  'spinal-cord': [160, 318, 120, 36],
  medulla: [160, 270, 120, 40],
  pons: [160, 222, 120, 40],
  cerebellum: [296, 222, 116, 40],
  midbrain: [160, 174, 120, 40],
  thalamus: [160, 126, 120, 40],
  hypothalamus: [28, 126, 116, 40],
  frontal: [14, 30, 96, 52],
  parietal: [120, 22, 96, 52],
  temporal: [226, 22, 96, 52],
  occipital: [332, 30, 96, 52],
}

/** Each slot is coloured by the vesicle it grew from (Part 1). */
export const SLOT_COLOR: Record<Slot, string> = {
  'spinal-cord': '#c9cdd4',
  medulla: VESICLE_COLORS.myelencephalon,
  pons: VESICLE_COLORS.metencephalon,
  cerebellum: VESICLE_COLORS.metencephalon,
  midbrain: VESICLE_COLORS.mesencephalon,
  thalamus: VESICLE_COLORS.diencephalon,
  hypothalamus: VESICLE_COLORS.diencephalon,
  frontal: VESICLE_COLORS.telencephalon,
  parietal: VESICLE_COLORS.telencephalon,
  occipital: VESICLE_COLORS.telencephalon,
  temporal: VESICLE_COLORS.telencephalon,
}

/** The connecting axis drawn behind the slots. */
export function FlatMapAxis() {
  return (
    <g stroke="#c9cdd4" strokeWidth="6" strokeLinecap="round" fill="none">
      <path d="M220 336V146" />
      <path d="M280 242H296M160 146H144" />
      <path d="M220 126C220 100 62 104 62 82M220 126C220 96 168 90 168 74M220 126C220 96 274 90 274 74M220 126C220 100 380 104 380 82" />
    </g>
  )
}

/** The finished flat map, labelled: used on cards. */
export function FlatMapArt() {
  return (
    <ArtSvg viewBox="0 0 442 364" label="The brain laid out flat">
      <FlatMapAxis />
      {(Object.keys(SLOT_BOX) as Slot[]).map((s) => {
        const [x, y, w, h] = SLOT_BOX[s]
        return <rect key={s} x={x} y={y} width={w} height={h} rx="10" fill={SLOT_COLOR[s]} stroke={INK} strokeWidth="2" />
      })}
      <g>
        <Label x={220} y={341}>spinal cord</Label>
        <Label x={220} y={295}>medulla</Label>
        <Label x={220} y={247}>pons</Label>
        <Label x={354} y={247}>cerebellum</Label>
        <Label x={220} y={199}>midbrain</Label>
        <Label x={220} y={151}>thalamus</Label>
        <Label x={86} y={151}>hypothalamus</Label>
        <Label x={62} y={61}>frontal</Label>
        <Label x={168} y={53}>parietal</Label>
        <Label x={274} y={53}>temporal</Label>
        <Label x={380} y={61}>occipital</Label>
        <Label x={14} y={100} anchor="start">front</Label>
        <Label x={428} y={100} anchor="end">back</Label>
      </g>
    </ArtSvg>
  )
}
