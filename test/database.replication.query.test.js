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
  _id: 'rep1',
  _rev: '2-05a9e090e2bb0977c06b870c870153c5',
  source: 'http://127.0.0.1:5984/cities',
  target: 'http://127.0.0.1:5984/cities2',
  create_target: true,
  continuous: false,
  owner: 'admin',
  _replication_state: 'completed',
  _replication_state_time: '2019-11-06T13:20:17Z',
  _replication_stats: {
    revisions_checked: 23519,
    missing_revisions_found: 23519,
    docs_read: 23519,
    docs_written: 23519,
    changes_pending: 5127,
    doc_write_failures: 0,
    checkpointed_source_seq: '23523-g1AAAACheJzLYWBgYMpgTmEQTM4vTc5ISXLIyU9OzMnILy7JAUklMiTV____PyuDOYmBQU8-FyjGnphilJRqbIpNDx6T8liAJEMDkPoPN1D3CNhAc2NzU1MzI2xaswBdZzGv',
    start_time: '2019-11-06T13:19:39Z'
  }
}
const errResponse = {
  error: 'not_found',
  reason: 'missing'
}

test('should be able to query a replication - GET /_replicator/id - couch.db.replication.query', async () => {
  // mocks
  mockPool
    .intercept({ path: '/_replicator/rep1' })
    .reply(200, response, JSON_HEADERS)

  // test GET /_replicator/id
  const p = await couch._replicator.rep1()
  assert.deepEqual(p, response)
  mockAgent.assertNoPendingInterceptors()
})

test('should be able to query a replication with opts - GET /_replicator/id?confilicts=true - couch.db.replication.query', async () => {
  // mocks
  const opts = { conflicts: true }
  mockPool.intercept({
    path: '/_replicator/rep1?conflicts=true'
  }).reply(200, response, JSON_HEADERS)

  // test GET /_replicator/id
  const p = await couch._replicator.rep1({ qs: opts })
  assert.deepEqual(p, response)
  mockAgent.assertNoPendingInterceptors()
})

test('should be able to query a replication and handle 404 - GET /_replicator/id - couch.db.replication.query', async () => {
  // mocks
  mockPool.intercept({
    path: '/_replicator/rep1'
  }).reply(404, errResponse, JSON_HEADERS)

  // test GET /_replicator/id
  await assert.rejects(couch._replicator.rep1(), { message: 'missing' })
  mockAgent.assertNoPendingInterceptors()
})
