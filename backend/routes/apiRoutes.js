import express from 'express';
import {
  getLeads,
  updateLead,
  ingestWebhook,
  getNotifications,
  verifyMetaWebhook,
  handleMetaWebhook,
  verifyWhatsAppWebhook,
  handleWhatsAppWebhook,
  sendLeadWhatsApp,
  handleGoogleAdsWebhook
} from '../controllers/leadController.js';

const router = express.Router();

// General CRM core routes
router.get('/leads', getLeads);
router.put('/leads/:id', updateLead);
router.post('/webhook', ingestWebhook);
router.get('/notifications', getNotifications);

// Outgoing message channel dispatch
router.post('/leads/:id/message', sendLeadWhatsApp);

// Meta Ads (Facebook Lead Ads) webhook integration
router.get('/webhook/meta', verifyMetaWebhook);
router.post('/webhook/meta', handleMetaWebhook);

// WhatsApp Cloud API webhook integration
router.get('/webhook/whatsapp', verifyWhatsAppWebhook);
router.post('/webhook/whatsapp', handleWhatsAppWebhook);

// Google Ads Lead Form webhook integration
router.post('/webhook/google', handleGoogleAdsWebhook);

export default router;
