import { Readable } from 'node:stream'
import CookieJar from './cookie.js'
import pkg from './package.json' with { type: 'json' }

// a list of query string parameters that need JSON.stringifying before use
const PARAMS_TO_ENCODE = ['startkey', 'endkey', 'key', 'keys', 'start_key', 'end_key']
const MIME_JSON = 'application/json'
const CONTENT_TYPE = 'content-type'
const SET_COOKIE = 'set-cookie'

export default function () {
  // parse the URL from the environment to create a new baseURL without credentials
  const { origin, username, password } = new URL(process.env.COUCH_URL)

  // make default HTTP opts. 'get' is the default method. Assume JSON mime type and our own user-agent + auth
  const defaultOpts = {
    headers: {
      'content-type': MIME_JSON,
      'user-agent': `${pkg.name}/${pkg.version}`,
      authorization: username && password ? 'Basic ' + Buffer.from(`${username}:${password}`).toString('base64') : undefined
    }
  }

  // cookie jar
  const cookieJar = new CookieJar()

  // returns a Proxy object https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy/Proxy
  // which allows access to its properties and methods to be "trapped" with get and apply, respectively
  function minicouch(path = '/') {
    return new Proxy(() => path, {
      // trap for accessing properties
      get(_, prop) {
        // some recursion to allow couch.db._design.myddoc._view.myview
        // to become /db/_design/mydoc/_view/myview
        return minicouch(path + encodeURIComponent(prop) + '/')
      },
      // trap for the function call ()
      async apply(target, _, args) {
        // create new set of opts based on our defaults, overridden by those passed in
        const opts = { ...defaultOpts, ...(args[0] || {}) }

        // form a new URL from path from our proxy, appended to the origin
        const url = new URL(target().replace(/\/$/, ''), origin)

        // if there's a query string object
        if (typeof opts.qs === 'object') {
          for (const [key, value] of Object.entries(opts.qs)) {
            // add each k/v to the URL's seachParams, taking care to JSON.stringify certain items
            url.searchParams.set(key, PARAMS_TO_ENCODE.includes(key) ? JSON.stringify(value) : value)
          }
        }

        // if we've been given a JavaScript object, it needs stringifying
        opts.body = typeof opts.body === 'object' && opts.headers[CONTENT_TYPE].startsWith(MIME_JSON) ? JSON.stringify(opts.body) : opts.body

        // add any cookies for this domain
        const urlStr = url.toString()
        const cookie = cookieJar.getCookieString(urlStr)
        if (cookie) {
          opts.headers.cookie = cookie
        }

        // make the HTTP request
        const response = await fetch(urlStr, opts)

        // parse cookies
        const cookieHeader = response.headers.get(SET_COOKIE) || ''
        if (cookieHeader) cookieJar.parse(cookieHeader, urlStr)

        // extract the mime type from the response
        const contentType = response.headers.get(CONTENT_TYPE) || ''
        let output = ''
        if (opts.method === 'head') {
          // for HEAD method, we actually output the headers
          output = Object.fromEntries(response.headers)
        } else if (opts.stream) {
          // for streamed output
          return Readable.fromWeb(response.body)
        } else if (contentType === MIME_JSON) {
          // json is json
          output = await response.json()
        } else if (contentType.startsWith('text/')) {
          // any text mime type is text
          output = await response.text()
        } else {
          // everything else is a Buffer
          output = Buffer.from(await response.arrayBuffer())
        }

        // either return the output
        if (response.ok) return output

        // or throw an Error
        throw new Error(output?.reason || output?.error || `couch returned ${response.status}`)
      }
    })
  }

  // the top of the API tree is /
  return minicouch('/')
}





