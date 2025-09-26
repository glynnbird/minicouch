// Licensed under the Apache License, Version 2.0 (the 'License'); you may not
// use this file except in compliance with the License. You may obtain a copy of
// the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an 'AS IS' BASIS, WITHOUT
// WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
// License for the specific language governing permissions and limitations under
// the License.

import test from 'node:test'
import assert from 'node:assert/strict'
import { mockAgent, mockPool, JSON_HEADERS } from './mock.js'
import minicouch from '../index.js'
const couch = minicouch()

test('check request can do GET requests - nano.request', async () => {
  // mocks
  const response = { ok: true }
  mockPool
    .intercept({ path: '/db?a=1&b=2' })
    .reply(200, response, JSON_HEADERS)

  // test GET /db?a=1&b=2
  const p = await couch.db({ qs: { a: 1, b: 2 }})
  assert.deepEqual(p, response)
  mockAgent.assertNoPendingInterceptors()
})

test('check request can do POST requests - nano.request', async () => {
  // mocks
  const response = { ok: true }
  const doc = { _id: '_design/myddoc', a: true }
  mockPool
    .intercept({
      method: 'post',
      path: '/db',
      body: JSON.stringify(doc)
    })
    .reply(200, response, JSON_HEADERS)

  // test POST /db
  const p = await couch.db({ method: 'post', body: doc })
  assert.deepEqual(p, response)
  mockAgent.assertNoPendingInterceptors()
})

test('check request can do PUT requests - nano.request', async () => {
  // mocks
  const response = { ok: true }
  const doc = { _id: '1', a: true }
  mockPool
    .intercept({
      method: 'put',
      path: '/db/1',
      body: JSON.stringify(doc)
    })
    .reply(200, response, JSON_HEADERS)

  // test PUT /db
  const req = {
    method: 'put',
    db: 'db',
    path: '1',
    body: { _id: '1', a: true }
  }
  const p = await couch.db['1']({ method: 'put', body: doc })
  assert.deepEqual(p, response)
  mockAgent.assertNoPendingInterceptors()
})

test('check request can do DELETE requests - nano.request', async () => {
  // mocks
  const response = { ok: true }
  mockPool
    .intercept({
      method: 'delete',
      path: '/db/mydoc?rev=1-123'
    })
    .reply(200, response, JSON_HEADERS)

  // test DELETE /db
  const p = await couch.db.mydoc({ method: 'delete', qs: { rev: '1-123' }})
  assert.deepEqual(p, response)
  mockAgent.assertNoPendingInterceptors()
})

test('check request can do HEAD requests - nano.request', async () => {
  // mocks
  const response = ''
  const headers = {
    'content-type': 'text/plain',
    myheader: '2442'
  }
  mockPool
    .intercept({
      method: 'head',
      path: '/db/mydoc'
    })
    .reply(200, response, { headers })

  // test HEAD /db/mydoc
  const p = await couch.db.mydoc({ method: 'head' })
  assert.deepEqual(p, headers)
  mockAgent.assertNoPendingInterceptors()
})

test('check request formats keys properly - nano.request', async () => {
  // mocks
  const response = { ok: true }
  const arr = ['a', 'b', 'c']
  mockPool
    .intercept({ path: '/db/_all_docs?keys=["a","b","c"]' })
    .reply(200, response, JSON_HEADERS)

  // test GET /db/_all_docs?keys=[]
  const p = await couch.db._all_docs({ qs: { keys: arr } })
  assert.deepEqual(p, response)
  mockAgent.assertNoPendingInterceptors()
})

test('check request formats startkey properly - nano.request', async () => {
  // mocks
  const response = { ok: true }
  const val = 'x'
  mockPool
    .intercept({ path: '/db/_all_docs?startkey="x"' })
    .reply(200, response, JSON_HEADERS)

  // test GET /db/_all_docs?startkey=
  const p = await couch.db._all_docs({ qs: { startkey: val }})
  assert.deepEqual(p, response)
  mockAgent.assertNoPendingInterceptors()
})

test('check request formats start_key properly - nano.request', async () => {
  // mocks
  const response = { ok: true }
  const val = 'x'
  mockPool
    .intercept({ path: '/db/_all_docs?start_key="x"' })
    .reply(200, response, JSON_HEADERS)

  // test GET /db/_all_docs?start_key=
  const p = await couch.db._all_docs({ qs: { start_key: val }})
  assert.deepEqual(p, response)
  mockAgent.assertNoPendingInterceptors()
})

test('check request formats endkey properly - nano.request', async () => {
  // mocks
  const response = { ok: true }
  const val = 'x'
  mockPool
    .intercept({ path: '/db/_all_docs?endkey="x"' })
    .reply(200, response, JSON_HEADERS)

  // test GET /db/_all_docs?endkey=
  const p = await couch.db._all_docs({ qs: { endkey: val }})
  assert.deepEqual(p, response)
  mockAgent.assertNoPendingInterceptors()
})

test('check request formats end_key properly - nano.request', async () => {
  // mocks
  const response = { ok: true }
  const val = 'x'
  mockPool
    .intercept({ path: '/db/_all_docs?end_key="x"' })
    .reply(200, response, JSON_HEADERS)

  // test GET /db/_all_docs?end_key=
  const p = await couch.db._all_docs({ qs: { end_key: val }})
  assert.deepEqual(p, response)
  mockAgent.assertNoPendingInterceptors()
})

test('check request formats key properly - nano.request', async () => {
  // mocks
  const response = { ok: true }
  const val = 'x'
  mockPool
    .intercept({ path: '/db/_all_docs?key="x"' })
    .reply(200, response, JSON_HEADERS)

  // test GET /db/_all_docs?key=
  const p = await couch.db._all_docs({ qs: { key: val }})
  assert.deepEqual(p, response)
  mockAgent.assertNoPendingInterceptors()
})

test('check request can do 500s - nano.request', async () => {
  // mocks
  const errorMessage = 'Internal server error'
  mockPool
    .intercept({ path: '/db?a=1&b=2' })
    .reply(500, errorMessage)

  // test GET /db?a=1&b=2
  const req = {
    method: 'get',
    db: 'db',
    qs: { a: 1, b: 2 }
  }
  await assert.rejects(couch.db({ qs: { a: 1, b: 2} }), { message: 'couch returned 500' })
  mockAgent.assertNoPendingInterceptors()
})

test('check request handle empty parameter list - nano.request', async () => {
  // mocks
  const response = {
    couchdb: 'Welcome',
    version: '2.3.1',
    git_sha: 'c298091a4',
    uuid: '865f5b0c258c5749012ce7807b4b0622',
    features: [
      'pluggable-storage-engines',
      'scheduler'
    ],
    vendor: {
      name: 'The Apache Software Foundation'
    }
  }
  mockPool
    .intercept({ path: '/' })
    .reply(200, response, JSON_HEADERS)

  // test GET /
  const p = await couch()
  assert.deepEqual(p, response)
  mockAgent.assertNoPendingInterceptors()
})

test('check request handles single string parameter - nano.request', async () => {
  // mocks
  const response = {
    db_name: 'db',
    purge_seq: '0-8KhNZEiqhyjKAgBm5Rxs',
    update_seq: '23523-gUFPHo-6PQIAJ_EdrA',
    sizes: {
      file: 18215344,
      external: 5099714,
      active: 6727596
    }
  }
  mockPool
    .intercept({ path: '/db' })
    .reply(200, response, JSON_HEADERS)

  // test GET /
  const p = await couch.db()
  assert.deepEqual(p, response)
  mockAgent.assertNoPendingInterceptors()
})

test('check request handles cookies - nano.request', async () => {
  // mocks
  const username = 'u'
  const password = 'p'
  const response = { ok: true, name: 'admin', roles: ['_admin', 'admin'] }
  mockPool
    .intercept({
      method: 'post',
      path: '/_session',
      body: 'name=u&password=p',
      headers: {
        'content-type': 'application/x-www-form-urlencoded; charset=utf-8'
      }
    })
    .reply(200, response, {
      headers: {
        'content-type': 'application/json',
        'Set-Cookie': 'AuthSession=YWRtaW46NUU0MTFBMDE6stHsxYnlDy4mYxwZEcnXHn4fm5w; Version=1; Expires=Mon, 10-Feb-2050 09:03:21 GMT; Max-Age=600; Path=/; HttpOnly'
      }
    })

  // test GET /_session
  const p = await couch._session({ method: 'post',  body: 'name=u&password=p', headers: { 'content-type': 'application/x-www-form-urlencoded; charset=utf-8' }})
  assert.deepEqual(p, response)
  mockAgent.assertNoPendingInterceptors()
})

test('check request can do GET a doc - nano.request', async () => {
  // mocks
  const response = { _id: 'docname/design', _rev: '1-123', ok: true }
  mockPool
    .intercept({ path: '/db/_design/docname?a=1&b=2' })
    .reply(200, response, JSON_HEADERS)

  // test GET /db?a=1&b=2
  const p = await couch.db._design.docname({ qs: { a: 1, b: 2 }})
  assert.deepEqual(p, response)
  mockAgent.assertNoPendingInterceptors()
})

test('check request doesn\'t mangle bodies containing functions - nano.request', async () => {
  // mocks
  const emit = () => { }
  const doc = {
    a: 1,
    views: {
      bytime: {
        map: function () { emit(doc.ts, true) }.toString()
      }
    }
  }
  const response = { id: 'jfjfjf', rev: '1-123', ok: true }
  mockPool
    .intercept({
      method: 'post',
      path: '/db',
      body: JSON.stringify(doc)
    })
    .reply(200, response, JSON_HEADERS)

  // test POST /db
  const p = await couch.db({ method: 'post', body: doc })
  assert.deepEqual(p, response)
  mockAgent.assertNoPendingInterceptors()
})

test('check request sends user-agent header - nano.request', async () => {
  // mocks
  const response = { ok: true }
  mockPool
    .intercept({
      path: '/db?a=1&b=2',
      headers: {
        'user-agent': /^minicouch/
      }
    })
    .reply(200, response, JSON_HEADERS)

  // test GET /db?a=1&b=2
  const p = await couch.db({ qs: { a: 1, b: 2 }})
  assert.deepEqual(p, response)
  mockAgent.assertNoPendingInterceptors()
})

test('check request sends headers for gzipped responses - nano.request', async () => {
  // mocks
  const response = { ok: true }
  mockPool
    .intercept({
      path: '/db?a=1&b=2',
      headers: {
        'accept-encoding': /gzip/
      }
    })
    .reply(200, response, JSON_HEADERS)

  // test GET /db?a=1&b=2
  const p = await couch.db({ qs: { a: 1, b: 2 }})
  assert.deepEqual(p, response)
  mockAgent.assertNoPendingInterceptors()
})
