import { Router } from 'express'
import { createDocumentController, deleteDocumentController, getDocumentController, importDocumentController, listDocumentsController, removeSharedAccessController, shareDocumentController, updateDocumentController } from '../controllers/documentController.js'
import { useDemoUser } from '../middleware/useDemoUser.js'
import { uploadDocument } from '../middleware/uploadDocument.js'
import { validateDocumentUpdate } from '../middleware/validateDocumentUpdate.js'
import { requireBodyFields } from '../middleware/validateRequest.js'

const router = Router()

router.use(useDemoUser)
router.post('/', createDocumentController)
router.post('/import', uploadDocument, importDocumentController)
router.get('/', listDocumentsController)
router.post('/:id/share', requireBodyFields('email'), shareDocumentController)
router.delete('/:id/share/:userId', removeSharedAccessController)
router.get('/:id', getDocumentController)
router.patch('/:id', validateDocumentUpdate, updateDocumentController)
router.delete('/:id', deleteDocumentController)

export default router
