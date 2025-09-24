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
const image = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64')

test('should be able to insert document attachment - PUT /db/docname/attachment - db.attachment.insert', async () => {
  // mocks
  const response = { ok: true, id: 'docname', rev: '2-456' }
  mockPool.intercept({
    method: 'put',
    path: '/db/docname/transparent.gif?rev=1-150',
    body: (value) => {
      const buff = Buffer.from(value)
      return buff.equals(image)
    },
    headers: {
      'content-type': 'image/gif'
    }
  }).reply(200, response, JSON_HEADERS)

  // test PUT /db/docname/attachment
  const p = await couch.db.docname['transparent.gif']({ 
    method: 'put',
    qs: { rev: '1-150' },
    headers: {
      'content-type': 'image/gif'
    },
    body: Buffer.from(image)
  })
  assert.deepEqual(p, response)
  mockAgent.assertNoPendingInterceptors()
})

test('should be able to handle 404 - db.attachment.insert', async () => {
  // mocks
  const response = {
    error: 'not_found',
    reason: 'missing'
  }
  mockPool.intercept({
    method: 'put',
    path: '/db/docname/transparent.gif?rev=1-150',
    body: (value) => {
      const buff = Buffer.from(value)
      return buff.equals(image)
    },
    headers: {
      'content-type': 'image/gif'
    }
  }).reply(404, response, JSON_HEADERS)

  // test PUT /db/docname/attachment
  await assert.rejects(couch.db.docname['transparent.gif']({
    method: 'put', 
    qs: { rev: '1-150' },
    headers: {
      'content-type': 'image/gif'
    },
    body: Buffer.from(image)
  }), { message: 'missing' })
  mockAgent.assertNoPendingInterceptors()
})
