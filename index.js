import pkg from './package.json' with { type: 'json' }
const MIME_JSON = 'application/json'
export default function () {
  function minicouch(path = '/') {
    return new Proxy(() => path, {
      get(target, prop, receiver) {
        return minicouch(path + encodeURIComponent(prop) + '/')
      },
      async apply(target, thisArg, argumentsList) {
        let builderPath = target().replace(/\/$/, '')
        const opts = {
          headers: { 'content-type': MIME_JSON, 'user-agent': `${pkg.name}/${pkg.version}`, authorization: auth || undefined },
          method: 'get'
        }
        Object.assign(opts, argumentsList[0] || {})
        let url = new URL(builderPath, plainURL).toString()
        if (typeof opts.qs === 'object') {
          ['startkey', 'endkey', 'key', 'keys', 'start_key', 'end_key'].forEach(function (key) {
            if (key in opts.qs) opts.qs[key] = JSON.stringify(opts.qs[key])
          })
          url += '?' + new URLSearchParams(opts.qs).toString()
          delete opts.qs
        }
        if (opts.body && typeof body !== 'string' && opts.headers['content-type'] === MIME_JSON) {
          opts.body = JSON.stringify(opts.body)
        }
        const response = await fetch(url, opts)
        response.output = ''
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
        if (response.ok)
          return response.output
        else
          throw new Error(response.output?.reason || response.output?.error || 'couch returned ' + response.status)
      }
    })
  }
  const parsedURL = new URL(process.env.COUCH_URL)
  const plainURL = `${parsedURL.origin}${parsedURL.pathname}`
  let auth = parsedURL.username && parsedURL.password ? 'Basic ' + Buffer.from(`${parsedURL.username}:${parsedURL.password}`).toString('base64') : ''
  return minicouch('/')
}





