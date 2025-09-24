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

test('should be able to access a search index - POST /db/_design/ddoc/_search/searchname - db.search', async () => {
  // mocks
  const response = {
    total_rows: 100000,
    bookmark: 'g123',
    rows: [
      { a: 1, b: 2 }
    ]
  }
  const params = { q: '*:*' }
  mockPool
    .intercept({
      method: 'post',
      path: '/db/_design/ddoc/_search/searchname',
      body: JSON.stringify(params)
    })
    .reply(200, response, JSON_HEADERS)

  // test POST /db/_design/ddoc/_search/searchnameGET /db
  const p = await couch.db._design.ddoc._search.searchname({ method: 'post', body: params })
  assert.deepEqual(p, response)
  mockAgent.assertNoPendingInterceptors()
})

test('should be able to handle 404 - db.search', async () => {
  // mocks
  const response = {
    error: 'not_found',
    reason: 'missing'
  }
  const params = { q: '*:*' }
  mockPool
    .intercept({
      method: 'post',
      path: '/db/_design/ddoc/_search/searchname',
      body: JSON.stringify(params)
    })
    .reply(404, response, JSON_HEADERS)

  // test POST /db/_design/ddoc/_search/searchname
  await assert.rejects(couch.db._design.ddoc._search.searchname({ method: 'post', body: params }), { message: 'missing' })
  mockAgent.assertNoPendingInterceptors()
})


