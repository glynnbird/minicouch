import pkg from './package.json' with { type: 'json' }
const MIME_JSON = 'application/json'
export default function () {
  function minicouch(path = '/') {
    return new Proxy(() => path, {
      get(_, prop) {
        return minicouch(path + encodeURIComponent(prop) + '/')
      },
      async apply(target, _, args) {
        const opts = { ...defaultOpts, ...(args[0] || {}) }
        let url = new URL(target().replace(/\/$/, ''), plainURL).toString()
        if (typeof opts.qs === 'object') {
          ['startkey', 'endkey', 'key', 'keys', 'start_key', 'end_key'].forEach(function (key) {
            if (key in opts.qs) opts.qs[key] = JSON.stringify(opts.qs[key])
          })
          url += '?' + new URLSearchParams(opts.qs).toString()
          delete opts.qs
        }
        opts.body = typeof opts.body === 'object' && opts.headers['content-type'] === MIME_JSON ? JSON.stringify(opts.body) : opts.body
        const response = await fetch(url, opts)
        const contentType = response.headers.get('content-type')
        if (opts.method === 'head') {
          response.output = Object.fromEntries(response.headers)
        } else if (contentType === MIME_JSON) {
          response.output = await response.json()
        } else if (contentType.startsWith('text/')) {
          response.output = await response.text()
        } else {
          response.output = Buffer.from(await response.arrayBuffer())
        }
        if (response.ok) return response.output
        throw new Error(response.output?.reason || response.output?.error || `couch returned ${response.status}`)
      }
    })
  }
  const { origin, pathname, username, password } = new URL(process.env.COUCH_URL)
  const plainURL = `${origin}${pathname}`
  let auth = username && password ? 'Basic ' + Buffer.from(`${username}:${password}`).toString('base64') : ''
  const defaultOpts = { headers: { 'content-type': MIME_JSON, 'user-agent': `${pkg.name}/${pkg.version}`, authorization: auth || undefined } }
  return minicouch('/')
}





