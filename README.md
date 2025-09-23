# minicouch

A tiny CouchDB JavaScript p.o.c client, inspired by a [post by Caolan](https://caolan.uk/notes/2025-09-18_api_builder_style.cm).

> less than 50 lines of code!

Caveats:

- the whole CouchDB API, or at least the JSON bits.
- numeric ids, design doc names or view names (or those starting with number) will not work.
- basic auth only. 

## Configuration

The library expects a single environment variable

- `COUCH_URL` - the URL of the CouchDB service in the form `https://MYUSERNAME:MYPASSWORD@myhostname.com:5984`

## Usage

```js
import minicouch from './index.js'

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

> Note: the above method will not work for numeric document ids or indeed document ids that start with numbers! e.g. `2mydoc`. Instead we would have to pass in document id as a `path` parameter:

// get a single document using the path, second attempt
await couch.mydb({ path: '100077' })
// {"_id":"100077","_rev":"3-53be74742d0cabef944db504fa040aa9","name":"Abū Ghurayb","latitude":33.30563,"longitude":44.18477,"country":"IQ","population":900000,"timezone":"Asia/Baghdad"}

// or we can use quoted properties
await couch.mydb['1000543']()
// {"_id":"1000543","_rev":"1-3256046064953e2f0fdb376211fe78ab","name":"Graaff-Reinet","latitude":-32.25215,"longitude":24.53075,"country":"ZA","population":62896,"timezone":"Africa/Johannesburg"}
// or variables
const docId = '1000543'
await couch.cities[docId]()

// do a Mango query
await couch.cities._find({ method: 'post', body: { selector: { country: 'US', limit: 3 }}})
// {"docs":[{"_id":"10104153","_rev":"1-32aab6258c65c5fc5af044a153f4b994","name":"Silver Lake","latitude":34.08668,"longitude":-118.27023,"country":"US","population":32890,"timezone":"America/Los_Angeles"}...

// do aggregation with MapReduce
await couch.cities._design.count._view.byCountry({ qs: { group: true }})
// {"rows":[{"key":null,"value":1},{"key":"AD","value":2},{"key":"AE","value":13},{"key":"AF","value":48}

> Note: the above method will not work for numeric design document ids or view names! e.g. `2mydesigndoc`.
```

## Function call parameters

- `method` - HTTP method (defaults to 'get').
- `qs` - an object representing the key/values to be encoded into the request query string.
- `body` - an object representing the data to be JSON.stringified into a POST/PUT request body.
- `path` - additional path to be appended to the URL programmatically - useful for document ids
