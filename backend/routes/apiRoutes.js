import express from 'express';
import {
  getLeads,
  updateLead,
  ingestWebhook,
  getNotifications
} from '../controllers/leadController.js';

const router = express.Router();

// Define API mapping
router.get('/leads', getLeads);
router.put('/leads/:id', updateLead);
router.post('/webhook', ingestWebhook);
router.get('/notifications', getNotifications);

export default router;
