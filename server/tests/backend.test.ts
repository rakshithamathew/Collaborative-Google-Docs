import assert from 'node:assert/strict'
import { after, before, describe, it } from 'node:test'
import request from 'supertest'

process.env.PORT = '5001'
process.env.MONGODB_URI = 'mongodb://127.0.0.1:27017/collaborative-document-editor-test'
process.env.CLIENT_URL = 'http://localhost:5173'

const { default: app } = await import('../src/app.js')
const { connectDatabase, disconnectDatabase } = await import('../src/config/database.js')
const { DocumentModel } = await import('../src/models/Document.js')
const { UserModel } = await import('../src/models/User.js')

const users = {
  alice: { name: 'Alice', email: 'alice@demo.example' },
  bob: { name: 'Bob', email: 'bob@test.example' },
  charlie: { name: 'Charlie', email: 'charlie@test.example' },
}

before(async () => {
  await connectDatabase()
  await Promise.all([DocumentModel.deleteMany({}), UserModel.deleteMany({})])
  await UserModel.insertMany(Object.values(users))
})

after(async () => {
  await Promise.all([DocumentModel.deleteMany({}), UserModel.deleteMany({})])
  await disconnectDatabase()
})

describe('documents', () => {
  it('creates, retrieves, updates, and deletes a document', async () => {
    const created = await request(app).post('/api/documents').expect(201)

    const documentId = created.body.document.id as string
    assert.equal(created.body.document.title, 'Untitled document')
    assert.deepEqual(created.body.document.content, { type: 'doc', content: [] })

    const list = await request(app).get('/api/documents').expect(200)
    assert.equal(list.body.documents.some((document: { id: string }) => document.id === documentId), true)

    const updated = await request(app)
      .patch(`/api/documents/${documentId}`)
      .send({ title: 'Updated title', content: { type: 'doc', content: [{ type: 'paragraph' }] } })
      .expect(200)
    assert.equal(updated.body.document.title, 'Updated title')

    await request(app).delete(`/api/documents/${documentId}`).expect(204)
    await request(app).get(`/api/documents/${documentId}`).expect(404)
  })
})

describe('sharing', () => {
  it('lets the implicit owner add and remove shared access', async () => {
    const created = await request(app).post('/api/documents').expect(201)
    const documentId = created.body.document.id as string

    const shared = await request(app)
      .post(`/api/documents/${documentId}/share`)
      .send({ email: users.bob.email })
      .expect(200)
    assert.equal(shared.body.sharing.sharedWith[0].email, users.bob.email)

    const listed = await request(app).get('/api/documents').expect(200)
    const listedDocument = listed.body.documents.find((document: { id: string }) => document.id === documentId)
    assert.equal(listedDocument.sharing.owner.email, users.alice.email)
    assert.deepEqual(listedDocument.sharing.sharedWith.map((user: { email: string }) => user.email), [users.bob.email])

    const bob = await UserModel.findOne({ email: users.bob.email }).orFail()
    const removed = await request(app).delete(`/api/documents/${documentId}/share/${bob.id}`).expect(200)
    assert.equal(removed.body.sharing.sharedWith.length, 0)
    await request(app).delete(`/api/documents/${documentId}`).expect(204)
  })
})

describe('file upload', () => {
  it('imports a TXT file into a new document', async () => {
    const response = await request(app)
      .post('/api/documents/import')
      .attach('file', Buffer.from('First paragraph.\n\nSecond paragraph.'), {
        filename: 'notes.txt',
        contentType: 'text/plain',
      })
      .expect(201)

    assert.equal(response.body.document.title, 'notes')
    assert.equal(response.body.document.content.type, 'doc')
    assert.equal(response.body.document.content.content.length, 2)
    const reopened = await request(app).get(`/api/documents/${response.body.document.id}`).expect(200)
    assert.deepEqual(reopened.body.document.content, response.body.document.content)
    await request(app).delete(`/api/documents/${response.body.document.id}`).expect(204)
  })

  it('rejects an unsupported file', async () => {
    const response = await request(app)
      .post('/api/documents/import')
      .attach('file', Buffer.from('not a PDF'), { filename: 'notes.pdf', contentType: 'application/pdf' })
      .expect(400)

    assert.match(response.body.error, /Supported files: TXT, MD, DOCX/)
  })
})
