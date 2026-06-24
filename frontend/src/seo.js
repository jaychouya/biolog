export function injectSiteMeta() {
  const site = import.meta.env.VITE_SITE_URL?.replace(/\/$/, '')
  if (!site) return

  const image = `${site}/og-image.png`
  const setMeta = (sel, attr, val) => {
    let el = document.querySelector(sel)
    if (!el) {
      el = document.createElement('meta')
      const key = sel.includes('property') ? 'property' : 'name'
      el.setAttribute(key, sel.match(/"([^"]+)"/)[1])
      document.head.appendChild(el)
    }
    el.setAttribute(attr, val)
  }

  setMeta('meta[property="og:url"]', 'content', site)
  setMeta('meta[property="og:image"]', 'content', image)
  setMeta('meta[name="twitter:image"]', 'content', image)
}
