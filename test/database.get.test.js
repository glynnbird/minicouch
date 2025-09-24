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
const response = {
  db_name: 'db',
  purge_seq: '0-8KhNZEiqhyjKAgBm5Rxs',
  update_seq: '23523-gUFPHo-6PQIAJ_EdrA',
  sizes: {
    file: 18215344,
    external: 5099714,
    active: 6727596
  },
  other: {
    data_size: 5099714
  },
  doc_del_count: 23000,
  doc_count: 0,
  disk_size: 18215344,
  disk_format_version: 7,
  data_size: 6727596,
  compact_running: false,
  cluster: {
    q: 2,
    n: 1,
    w: 1,
    r: 1
  },
  instance_start_time: '0'
}

test('should be able to fetch the database info - GET /db - couch.db.get', async () => {
  // mocks
  mockPool
    .intercept({ path: '/db' })
    .reply(200, response, JSON_HEADERS)

  // test GET /db
  const p = await couch.db()
  assert.strictEqual(typeof p, 'object')
  assert.strictEqual(p.doc_count, 0)
  assert.strictEqual(p.db_name, 'db')
  mockAgent.assertNoPendingInterceptors()
})

test('should handle missing database - GET /db - couch.db.get', async () => {
  // mocks
  mockPool.intercept({ path: '/db' }).reply(404, {
    error: 'not_found',
    reason: 'Database does not exist.'
  }, JSON_HEADERS)

  // test GET /db
  await assert.rejects(couch.db(), { message: 'Database does not exist.' })
  mockAgent.assertNoPendingInterceptors()
})


