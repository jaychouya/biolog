export function parseRoute() {
  const p = new URLSearchParams(window.location.search)
  const modeParam = p.get('mode')
  return {
    view: p.get('view'),
    mode: modeParam === 'ai' ? 'ai' : modeParam === 'demo' ? 'demo' : null,
  }
}

export function syncRoute({ view, mode }) {
  const url = new URL(window.location.href)
  if (view) url.searchParams.set('view', view)
  else url.searchParams.delete('view')
  if (mode) url.searchParams.set('mode', mode)
  else url.searchParams.delete('mode')
  const next = `${url.pathname}${url.search}`
  const current = `${window.location.pathname}${window.location.search}`
  if (next !== current) window.history.replaceState({}, '', next)
}

export function shareUrl(params = {}) {
  const url = new URL(window.location.origin + window.location.pathname)
  Object.entries(params).forEach(([k, v]) => {
    if (v) url.searchParams.set(k, v)
  })
  return url.toString()
}
