# minicouch

A tiny CouchDB JavaScript client, inspired by a [post by Caolan](https://caolan.uk/notes/2025-09-18_api_builder_style.cm).

> Fewer than 50 lines of code! Less than 1kB minified!

- Implements the whole CouchDB API, or at least the JSON bits.
- Numeric design doc names or view names need to use quoted properties.
- Basic-auth only. 

## Installation

```sh
npm install --save minicouch
```

## Configuration

The library expects a single environment variable

- `COUCH_URL` - the URL of the CouchDB service in the form `https://MYUSERNAME:MYPASSWORD@myhostname.com:5984`

## Usage

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
await couch.profiles.bob['pic.gif']
await couch.profiles.bob['pic.gif']({ method: 'delete', qs: { rev: '2-456' }})
```

## Function call parameters

- `method` - (optional) HTTP method (defaults to 'get').
- `qs` - (optional)  An object representing the key/values to be encoded into the request query string.
- `body` - (optional) An object representing the data to be JSON.stringified into a POST/PUT request body. If a string or a Buffer is supplied, it will go unmolested to the request body.
- `headers` - An object whose key values override the default `content-type: application/json` HTTP request headers.
