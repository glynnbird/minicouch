# minicouch

A tiny (~1kB minified) CouchDB JavaScript client, inspired by a [post by Caolan](https://caolan.uk/notes/2025-09-18_api_builder_style.cm).

- Implements the whole CouchDB API using a JavaScript [Proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy).
- Zero dependencies.
- Future proof(!).

## Installation

```sh
npm install --save minicouch
```

## Configuration

The library expects a single environment variable

- `COUCH_URL` - the URL of the CouchDB service in the form `https://MYUSERNAME:MYPASSWORD@myhostname.com:5984`

## Usage

Set the `COUCH_URL` environment variable e.g.

```sh
export COUCH_URL="http://myusername:mypassword@localhost:5984"
```

The write your code:

```js
import minicouch from 'minicouch'

const couch = minicouch()

// get the CouchDB meta data
await couch()
// {"couchdb":"Welcome","version":"3.5.0+cloudant"...

// get a list of databases
await couch._all_dbs()
// ["_replicator","aaa","aardvark",...

// get single database's details
await couch.cities()
// {"update_seq":"23644-g1AAAA","instance_start_time":"1681831801","db_name":"cities","purge_seq":0...

// get all the documents
await couch.cities._all_docs()
// {"total_rows":23519,"offset":0,"rows":[{"id":"1000501","key":"1000501","value":{"...

// get a range of documents (startkey/endkey)
await couch.cities._all_docs({ qs: { startkey: '1000543', endkey: '1000550' }})
// {"total_rows":23519,"offset":1,"rows":[{"id":"1000543",...

// write a single document
await couch.mydb({ method: 'post', body: { '_id': 'mydoc', 'a': 'one', 'b': 2, c: true }})
// {"ok":true,"id":"mydoc","rev":"1-0e3a30d6821dd5c8b7c1f4993b403548"}

// get a single document from all_docs
await couch.mydb._all_docs({ qs: { key: 'mydoc', include_docs: true }})
// {"total_rows":8262,"offset":8261,"rows":[{"id":"mydoc","key":"mydoc","value":{"rev":"1-0e3a30d6821dd5c8b7c1f4993b403548"},"doc":{"_id":"mydoc","_rev":"1-0e3a30d6821dd5c8b7c1f4993b403548","a":"one","b":2,"c":true}}]}

// get a single document using the path
await couch.mydb.mydoc()
// {"_id":"mydoc","_rev":"1-0e3a30d6821dd5c8b7c1f4993b403548","a":"one","b":2,"c":true}

// We can use quoted properties
await couch.cities['1000543']()
// {"_id":"1000543","_rev":"1-3256046064953e2f0fdb376211fe78ab","name":"Graaff-Reinet","latitude":-32.25215,"longitude":24.53075,"country":"ZA","population":62896,"timezone":"Africa/Johannesburg"}

// or variables
const docId = '1000543'
await couch.cities[docId]()

// or we can head the document to get the headers back
await couch.cities[docId]({ method: 'head' })
// {"cache-control":"must-revalidate","connection":"close","content-length":"194",..

// do a Mango query
await couch.cities._find({ method: 'post', body: { selector: { country: 'US', limit: 3 }}})
// {"docs":[{"_id":"10104153","_rev":"1-32aab6258c65c5fc5af044a153f4b994","name":"Silver Lake","latitude":34.08668,"longitude":-118.27023,"country":"US","population":32890,"timezone":"America/Los_Angeles"}...

// do aggregation with MapReduce
await couch.cities._design.count._view.byCountry({ qs: { group: true }})
// {"rows":[{"key":null,"value":1},{"key":"AD","value":2},{"key":"AE","value":13},{"key":"AF","value":48}

// if the view name starts with a number we have to use quoted properties again
await couch.cities._design['2good']._view['2bad']({ qs: { starkey: 'abc123', include_docs: true }})

// bulk insert
await couch.mydb._bulk_docs({ method: 'post', body: { docs: [
    { _id: 'a1', name: 'fred' },
    { _id: 'a2', name: 'velma'}
  ]}})
// [{"ok":true,"id":"a1","rev":"1-6e70d28d576c6b66c115d9524e86505a"},{"ok":true,"id":"a2","rev":"1-219307f319dacef3e6096c3dc27f1ffb"}]

// changes 
await couch.mydb._changes({ qs: { since: '0' }})
// {"results":[{"seq":"1-g1AAAAR_2","id":"a1","changes":[{"rev":"1-33ab92fdcf1ccbbdee4e03a63ca12dbb"}]},..

// partitioned databases work too
await couch.ordersp._partition['1000']._all_docs({ qs: { limit: 1 }})
// {"total_rows":10608,"offset":0,"rows":[{"id":"1000:0041XVQ6LY62POIN","key":"1000:0041XVQ6LY62POIN","value":{"rev":"1-6770cf45031b4bb24fe500e81d0dd49c"}}]}

// the award for longest function call goes to...
await couch.ordersp._partition['1000']._design.mydesigndoc._view.myview({ qs: { group_level: 2 } })

// attachments are also supported
await couch.profiles.bob['pic.gif']({
  method: 'put', 
  qs: { rev: '1-150' },
  headers: { 'content-type': 'image/gif' },
  body: Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64')
})
await couch.profiles.bob['pic.gif']()
await couch.profiles.bob['pic.gif']({ method: 'delete', qs: { rev: '2-456' }})

// the output can also be streamed by adding stream:true
const s = await couch.mydb._design.report._view.monthly({ qs: { group_level: 2}, stream: true })
s.pipe(process.stdout)
```

To use session authentication, don't put credentials in `COUCH_URL`:

e.g.

```sh
export COUCH_URL="http://localhost:5984"
```

Call the `POST /session` endpoint before other API calls, supplying the username & password once:

```js
await couch._session({ method: 'post', body: { name: 'myusername', password: 'mypassword'} })
await couch._all_dbs()
``` 

Multipart attachment uploads work too:

```js
const image = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64')
const images = [
  { name: 'transparent.gif', data: image, content_type: 'image/gif' },
  { name: 'transparent2.gif', data: image, content_type: 'image/gif' }
]
await couch.db.docid({ method: 'put', multipart: images })
```

## Function call attributes

- `method` - (optional) HTTP method (defaults to 'get').
- `qs` - (optional)  An object representing the key/values to be encoded into the request query string.
- `body` - (optional) An object representing the data to be JSON.stringified into a POST/PUT request body. If a string or a Buffer is supplied, it will go unmolested to the request body.
- `headers` - An object whose key values override the default `content-type: application/json` HTTP request headers.
- `stream` - (optional) A boolean indicating whether the result should be a stream (default `false`).
- `multipart` - (optional) An array of attachments to be combined into a multi-part upload.

## Compared to other clients

[minicouch](https://www.npmjs.com/package/minicouch) has some advantages as a module over its rivals, like its small size and lower maintenance footprint and that the function invocations exactly mirror the CouchDB API, so no learning two names for things.

But it has some disadvantages:

- Strictly-typed languages like TypeScript won't like minicouch's lack of declared structure.
- Some function calls become quite verbose, I'm looking at you MapReduce.
- No high-level abstractions, like changes followers, pagination etc.

Other libraries include:

- [nano](https://www.npmjs.com/package/nano) - Official Apache CouchDB Node.js library. Adds Typescript definitions, changes follower and custom agent support.
- [@ibm-cloud/cloudant](https://github.com/IBM/cloudant-node-sdk) Official IBM Cloudant SDK. Adds IAM auth, changes follower, pagination API, TypeScript support, retry logic and custom agent support.

## How does it work?

[minicouch](https://www.npmjs.com/package/minicouch) makes use of the JavaScript [Proxy object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy) which allows the library to infer from the form of the function call, what the API path needs to be 

e.g.

```
couch.mydb._design.myddoc._view.myview  --> $COUCH_URL/mydb/_design/myddoc/_view/myview
```

This way minicouch doesn't need to model the CouchDB API structure at all, so if a new API call is added later, minicouch already supports it.

When `()` is added, minicouch's [apply](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy/Proxy/apply) trap is called and an API call is attempted. The parameters to the function call define the HTTP method, query string parameters, custom headers and an optional request body.

minicouch adds a sprinkle of assistance, ensuring that the request `body` is formatted correctly, that certain parameters are automatically stringifed and that the response is parsed according to its mime type, but otherwise gets out of the way.

It follow's Nano's convention of resolving the Promise for successful API calls and throwing an Error for anything with a response code 300 and over.
