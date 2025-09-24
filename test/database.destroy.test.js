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

test('should destroy a database - DELETE /db - couch.db.destroy', async () => {
  // mocks
  mockPool
    .intercept({ method: 'delete', path: '/db' })
    .reply(200, response, JSON_HEADERS)

  // test DELETE /db
  const p = await couch.db({ method: 'delete' })
  assert.equal(typeof p, 'object')
  assert.deepEqual(p, response)
  mockAgent.assertNoPendingInterceptors()
})

test('should handle non-existant database - DELETE /db - couch.db.destroy', async () => {
  // mocks
  mockPool.intercept({ method: 'delete', path: '/db' }).reply(404, {
    error: 'not_found',
    reason: 'Database does not exist.'
  }, JSON_HEADERS)

  // test DELETE /db
  await assert.rejects(couch.db({ method: 'delete' }), 'Database does not exist')
  mockAgent.assertNoPendingInterceptors()
})


