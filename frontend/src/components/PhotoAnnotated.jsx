export default function PhotoAnnotated({ src, annotations, insights, alt = '餐食照片', className = '' }) {
  if (!src) return null
  const boxes = annotations?.filter((a) => a?.label && a.w > 0 && a.h > 0) || []
  const tags = insights?.filter(Boolean) || []

  return (
    <div className={`relative overflow-hidden rounded-lg ${className}`}>
      <img src={src} alt={alt} className="block w-full object-cover" />
      {boxes.length > 0 && (
        <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          {boxes.map((a, i) => (
            <g key={i}>
              <rect
                x={a.x}
                y={a.y}
                width={a.w}
                height={a.h}
                fill="rgba(52, 211, 153, 0.12)"
                stroke="#34d399"
                strokeWidth="0.6"
                rx="1"
              />
              <text x={a.x + 1} y={Math.max(a.y - 1.5, 3)} fontSize="3.2" fill="#6ee7b7" fontWeight="600">
                {a.label}
              </text>
            </g>
          ))}
        </svg>
      )}
      {!boxes.length && tags.length > 0 && (
        <div className="absolute inset-x-0 bottom-0 flex flex-wrap gap-1 bg-gradient-to-t from-black/70 to-transparent p-2 pt-6">
          {tags.slice(0, 3).map((t, i) => (
            <span key={i} className="rounded bg-emerald-900/80 px-1.5 py-0.5 text-[10px] text-emerald-200">
              {t}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
