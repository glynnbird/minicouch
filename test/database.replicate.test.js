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
  history: [],
  ok: true,
  replication_id_version: 3,
  session_id: '142a35854a08e205c47174d91b1f9628',
  source_last_seq: 28
}

test('should be able to send replication request with URLs - POST /_replicate - couch.db.replicate', async () => {
  // mocks
  const source = 'http://mydomain1.com/source'
  const target = 'https://mydomain2.com/target'
  mockPool.intercept({
    method: 'post',
    path: '/_replicate',
    body: JSON.stringify({ source, target })
  }).reply(200, response, JSON_HEADERS)

  // test POST /_replicate
  const p = await couch._replicate({ method: 'post', body: { source, target }})
  assert.deepEqual(p, response)
  mockAgent.assertNoPendingInterceptors()
})

