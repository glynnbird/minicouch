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
import {  mockAgent, mockPool, JSON_HEADERS } from './mock.js'
import minicouch from '../index.js'
const couch = minicouch()
const response = { ok: true }

test('should be able to send compaction request - POST /db/_compact - couch.db.compact', async () => {
  // mocks
  mockPool
    .intercept({ method: 'post', path: '/db/_compact' })
    .reply(200, response, JSON_HEADERS)

  // test POST /db/_compact
  const p = await couch.db._compact({ method: 'post' })
  assert.deepEqual(p, response)
  mockAgent.assertNoPendingInterceptors()
})

test('should be able to send compaction request with design doc - POST /db/_compact/ddoc - couch.db.compact', async () => {
  // mocks
  mockPool
    .intercept({ method: 'post', path: '/db/_compact/ddoc' })
    .reply(200, response, JSON_HEADERS)

  // test POST /db/_compact/ddoc
  const p = await couch.db._compact.ddoc({ method: 'post' })
  assert.deepEqual(p, response)
  mockAgent.assertNoPendingInterceptors()
})

