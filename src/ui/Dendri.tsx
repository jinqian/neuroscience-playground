export type Mood = 'idle' | 'happy' | 'oops' | 'cheer'

/** Dendri, the app's neuron mascot (original art). */
export function Dendri({ mood = 'idle', size = 76 }: { mood?: Mood; size?: number }) {
  const arms = mood === 'cheer'
    ? ['M20 30 8 10', 'M22 46 6 56', 'M38 20 36 4', 'M54 30 68 10', 'M50 52 64 68']
    : ['M20 30 6 18', 'M22 46 6 56', 'M38 20 36 4', 'M54 32 70 22', 'M50 52 64 68']
  return (
    <svg className="dendri" width={size} height={size} viewBox="0 0 76 76" role="img" aria-label={`Dendri the neuron (${mood})`}>
      <g stroke="#7b5cf0" strokeWidth="5" strokeLinecap="round" fill="none">
        {arms.map((d) => <path key={d} d={d} />)}
      </g>
      <circle cx="38" cy="40" r="20" fill="#9b82ff" />
      <circle cx="31" cy="37" r="4.5" fill="#fff" />
      <circle cx="45" cy="37" r="4.5" fill="#fff" />
      {mood === 'happy' || mood === 'cheer' ? (
        <g stroke="#2b2f38" strokeWidth="2.4" fill="none" strokeLinecap="round">
          <path d="M28.5 37.5q2.5-3 5 0" />
          <path d="M42.5 37.5q2.5-3 5 0" />
        </g>
      ) : (
        <g fill="#2b2f38">
          <circle cx="32" cy="38" r="2.2" />
          <circle cx="46" cy="38" r="2.2" />
        </g>
      )}
      {mood === 'oops' && (
        <g stroke="#2b2f38" strokeWidth="2" strokeLinecap="round">
          <path d="M27 31l7 1.5" />
          <path d="M49 31l-7 1.5" />
        </g>
      )}
      {mood === 'oops' ? (
        <circle cx="38" cy="48.5" r="3" fill="none" stroke="#2b2f38" strokeWidth="2.4" />
      ) : (
        <path d={mood === 'idle' ? 'M32 47q6 4 12 0' : 'M31 46q7 8 14 0'} stroke="#2b2f38" strokeWidth="2.5" fill={mood === 'idle' ? 'none' : '#fff'} strokeLinecap="round" />
      )}
      {mood === 'cheer' && (
        <g fill="#ffc93c">
          <path d="M66 4l2 5 5 2-5 2-2 5-2-5-5-2 5-2z" />
          <path d="M9 2l1.4 3.4 3.4 1.4-3.4 1.4L9 11.6 7.6 8.2 4.2 6.8l3.4-1.4z" />
        </g>
      )}
    </svg>
  )
}
