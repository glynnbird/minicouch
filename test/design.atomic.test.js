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

test('should be able to use an update function - PUT /db/_design/ddoc/_update/updatename/docid - db.atomic', async () => {
  const updateFunction = function (doc, req) {
    if (doc) {
      doc.ts = new Date().getTime()
    }
    return [doc, { json: { status: 'ok' } }]
  }
  const response = updateFunction({})[1].json

  // mocks
  mockPool
    .intercept({
      method: 'put',
      path: '/db/_design/ddoc/_update/updatename/docid'
    })
    .reply(200, response, JSON_HEADERS)

  // test PUT /db/_design/ddoc/_update/updatename/docid
  const p = await couch.db._design.ddoc._update.updatename.docid({ method: 'put' })
  assert.deepEqual(p, response)
  mockAgent.assertNoPendingInterceptors()
})

test('should be able to use an update function with body - PUT /db/_design/ddoc/_update/updatename/docid - db.atomic', async () => {
  const updateFunction = function (doc, req) {
    if (doc) {
      doc.ts = new Date().getTime()
    }
    return [doc, { json: { status: 'ok' } }]
  }
  const body = { a: 1, b: 2 }
  const response = updateFunction({})[1].json

  // mocks
  mockPool
    .intercept({
      method: 'put',
      path: '/db/_design/ddoc/_update/updatename/docid',
      body: JSON.stringify(body)
    })
    .reply(200, response, JSON_HEADERS)

  // test PUT /db/_design/ddoc/_update/updatename/docid
  const p = await couch.db._design.ddoc._update.updatename.docid({ method: 'put', body })
  assert.deepEqual(p, response)
  mockAgent.assertNoPendingInterceptors()
})

test('should be able to handle 404 - db.atomic', async () => {
  // mocks
  const response = {
    error: 'not_found',
    reason: 'missing'
  }
  const body = { a: 1, b: 2 }
  mockPool
    .intercept({
      method: 'put',
      path: '/db/_design/ddoc/_update/updatename/docid',
      body: JSON.stringify(body)
    })
    .reply(404, response, JSON_HEADERS)

  // test PUT /db/_design/ddoc/_update/updatename/docid
  await assert.rejects(couch.db._design.ddoc._update.updatename.docid({ method: 'put', body }), { message: 'missing' })
  mockAgent.assertNoPendingInterceptors()
})
