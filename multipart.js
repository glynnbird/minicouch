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

const CRLF = '\r\n'
const DASHES = '--'

// generate the payload, boundary and header for a multipart/related request
// to upload binary attachments to CouchDB.
// https://www.w3.org/Protocols/rfc1341/7_2_Multipart.html
export default class MultiPartFactory {
  // constructor
  constructor (parts) {
    // generate a unique id that forms the boundary between parts
    this.boundary = this.uuid()
    const bufferList = []

    // for each part to be processed
    for (const part of parts) {
      // start with the boundary e.g. --0559337432997171\r\n
      bufferList.push(Buffer.from(DASHES + this.boundary + CRLF))

      // state the type and length of the following part
      bufferList.push(Buffer.from(`content-type: ${part.content_type}${CRLF}`))
      bufferList.push(Buffer.from(`content-length: ${part.data.length}${CRLF}`))

      // two \r\n marks start of the part itself
      bufferList.push(Buffer.from(CRLF))

      // output the string/buffer
      bufferList.push(typeof part.data === 'string' ? Buffer.from(part.data) : part.data)

      // followed by /r/n
      bufferList.push(Buffer.from(CRLF))
    }

    // right at the end we have an end marker e.g. --0559337432997171--\r\n
    bufferList.push(Buffer.from(DASHES + this.boundary + DASHES + CRLF))

    // buid up a single Buffer from the array of bits
    this.data = Buffer.concat(bufferList)

    // calculate the Content-Type header required to send with this request
    this.header = `multipart/related; boundary=${this.boundary}`
  }

  uuid () {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('')
    let retval = ''
    for (let i = 0; i < 16; i++) {
      retval += chars[Math.floor(Math.random() * chars.length)]
    }
    return retval
  }
}
