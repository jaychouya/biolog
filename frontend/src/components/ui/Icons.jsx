export function IconClose({ className = 'w-5 h-5' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
    </svg>
  )
}

export function IconBack({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function IconChevron({ open, className = 'w-4 h-4' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 200ms' }}>
      <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function IconUpload({ className = 'w-8 h-8' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" stroke="none" />
      <path d="M21 15l-5-5L5 21" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function IconChart({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M3 3v18h18" strokeLinecap="round" />
      <path d="M7 14l4-4 3 3 5-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function IconSparkle({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M12 3l1.5 5.5L19 10l-5.5 1.5L12 17l-1.5-5.5L5 10l5.5-1.5L12 3z" strokeLinejoin="round" />
    </svg>
  )
}

export function IconHeadache({ className = 'w-6 h-6' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <circle cx="12" cy="10" r="6" />
      <path d="M9 16c0 2 1.5 4 3 4s3-2 3-4" strokeLinecap="round" />
      <path d="M8 8l2 2M16 8l-2 2" strokeLinecap="round" />
    </svg>
  )
}

export function IconStomach({ className = 'w-6 h-6' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <ellipse cx="12" cy="13" rx="7" ry="8" />
      <path d="M12 5v3M9 8h6" strokeLinecap="round" />
    </svg>
  )
}

export function IconFatigue({ className = 'w-6 h-6' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M4 14h16M6 10h12M8 6h8" strokeLinecap="round" />
      <path d="M3 18h18" strokeLinecap="round" opacity="0.5" />
    </svg>
  )
}

const SCENARIO_ICON_MAP = {
  'headache-malatang': IconHeadache,
  'bloating-tea': IconStomach,
  'fatigue-none': IconFatigue,
}

export function ScenarioIcon({ id, className }) {
  const Icon = SCENARIO_ICON_MAP[id] || IconSparkle
  return <Icon className={className} />
}
