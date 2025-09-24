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
const response = { ok: true, id: 'rep1', rev: '2-123' }
const errResponse = {
  error: 'not_found',
  reason: 'missing'
}

test('should be able to delete a replication - DELETE /_replicator/id - couch.db.replication.disable', async () => {
  // mocks
  mockPool.intercept({
    method: 'delete',
    path: '/_replicator/rep1?rev=1-456'
  }).reply(200, response, JSON_HEADERS)

  // test DELETE /_replicator/id
  const p = await couch._replicator.rep1({ method: 'delete', qs: { rev: '1-456'}})
  assert.deepEqual(p, response)
  mockAgent.assertNoPendingInterceptors()
})

test('should be able to handle a 404 - DELETE /_replicator/id - couch.db.replication.disable', async () => {
  // mocks
  mockPool.intercept({
    method: 'delete',
    path: '/_replicator/rep1?rev=1-456'
  }).reply(404, errResponse, JSON_HEADERS)

  // test DELETE /_replicator/id
  await assert.rejects(couch._replicator.rep1({ method: 'delete', qs: { rev: '1-456'}}), { message: 'missing' })
  mockAgent.assertNoPendingInterceptors()
})

