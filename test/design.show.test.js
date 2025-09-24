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

test('should be able to use a show function - GET /db/_design/ddoc/_show/showname/docid - db.show', async () => {
  const showFunction = function (doc, req) {
    return 'Hello, world!'
  }
  // mocks
  mockPool
    .intercept({ path: '/db/_design/ddoc/_show/showname/docid' })
    .reply(200, showFunction(), { headers: { 'content-type': 'text/plain' } })

  // test GET /db/_design/ddoc/_show/showname/docid
  const p = await couch.db._design.ddoc._show.showname.docid()
  assert.equal(p, showFunction())
  mockAgent.assertNoPendingInterceptors()
})

test('should be able to handle 404 - db.show', async () => {
  // mocks
  const response = {
    error: 'not_found',
    reason: 'missing'
  }
  mockPool
    .intercept({ path: '/db/_design/ddoc/_show/showname/docid' })
    .reply(404, response, JSON_HEADERS)

  // test GET /db/_design/ddoc/_show/showname/docid
  await assert.rejects(couch.db._design.ddoc._show.showname.docid(), { message: 'missing' })
  mockAgent.assertNoPendingInterceptors()
})


