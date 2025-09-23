export default function () {
  function minicouch(path = '/') {
    return new Proxy(() => path, {
      get(target, prop, receiver) {
        const url = minicouch(path + encodeURIComponent(prop) + '/')
        return url
      },
      async apply(target, thisArg, argumentsList) {
        let builderPath = target().replace(/\/$/, '')
        const opts = {
          headers: {
            'content-type': 'application/json',
            'user-agent': 'minicouch',
            'Authorization': auth || undefined
          },
          method: 'get'
        }
        Object.assign(opts, argumentsList[0] || {})
        if (opts.path) {
          builderPath += '/' + opts.path
          delete opts.path
        }
        let url = new URL(builderPath, plainURL).toString()
        if (typeof opts.qs === 'object') {
          ['startkey', 'endkey', 'key', 'keys', 'start_key', 'end_key'].forEach(function (key) {
            if (key in opts.qs) {
              opts.qs[key] = JSON.stringify(opts.qs[key])
            }
          })
          url += '?' + new URLSearchParams(opts.qs).toString()
          delete opts.qs
        }
        if (opts.body && typeof body !== 'string') {
          opts.body = JSON.stringify(opts.body)
        }
        const response = await fetch(url, opts)
        return response.json()
      }
    })
  }

  // parse the URL to extract creds
  const parsedURL = new URL(process.env.COUCH_URL)
  const plainURL = `${parsedURL.origin}${parsedURL.pathname}`
  let auth = parsedURL.username && parsedURL.password ? 'Basic ' + Buffer.from(`${parsedURL.username}:${parsedURL.password}`).toString('base64') : ''

  return minicouch('/')
}





