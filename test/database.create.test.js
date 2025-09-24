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
const response = { ok: true }

test('should create a database - PUT /db - couch.db.create', async () => {
  // mocks
  mockPool
    .intercept({ method: 'put', path: '/db' })
    .reply(200, response, JSON_HEADERS)

  // test GET /db
  const p = await couch.db({ method: 'put' })
  assert.equal(typeof p, 'object')
  assert.equal(p.ok, true)
  mockAgent.assertNoPendingInterceptors()
})

test('should create a database with parameters - PUT /db?partitioned=true - couch.db.create', async () => {
  // mocks
  mockPool.intercept({
    method: 'put',
    path: '/db?partitioned=true&q=1'
  }).reply(200, response, JSON_HEADERS)

  // test GET /db
  const p = await couch.db({ method: 'put', qs: { partitioned: true, q: 1 }})
  assert.equal(typeof p, 'object')
  assert.equal(p.ok, true)
  mockAgent.assertNoPendingInterceptors()
})

test('should handle pre-existing database - PUT /db - couch.db.create', async () => {
  // mocks
  mockPool.intercept({
    method: 'put',
    path: '/db'
  }).reply(412, {
    error: 'file_exists',
    reason: 'The database could not be created, the file already exists.'
  }, JSON_HEADERS)

  // test PUT /db
  await assert.rejects(couch.db({ method: 'put' }), { message: 'The database could not be created, the file already exists.' })
  mockAgent.assertNoPendingInterceptors()
})

