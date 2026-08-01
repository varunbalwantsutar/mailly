import { Router } from 'express';
import { requireAuth } from '../middlewares/authMiddleware.js';
import {
  getContacts,
  getContactById,
  createContact,
  updateContact,
  deleteContact,
  bulkDeleteContacts,
  importContacts,
  exportContacts,
  lookupRecipients,
} from '../controllers/contactsController.js';

const router = Router();

router.use(requireAuth);

router.get('/', getContacts);
router.post('/', createContact);
router.post('/bulk-delete', bulkDeleteContacts);
router.post('/import', importContacts);
router.get('/export', exportContacts);
router.post('/lookup-recipients', lookupRecipients);

router.get('/:id', getContactById);
router.put('/:id', updateContact);
router.delete('/:id', deleteContact);

export default router;
