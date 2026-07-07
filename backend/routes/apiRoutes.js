import express from 'express';
import {
  getLeads,
  createLead,
  updateLead,
  deleteLead,
  ingestWebhook,
  getNotifications,
  verifyMetaWebhook,
  handleMetaWebhook,
  verifyWhatsAppWebhook,
  handleWhatsAppWebhook,
  sendLeadWhatsApp,
  handleGoogleAdsWebhook,
  getLeadTimeline
} from '../controllers/leadController.js';
import { login } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Authentication endpoint
router.post('/login', login);

// Protected CRM core routes
router.get('/leads', authenticateToken, getLeads);
router.post('/leads', authenticateToken, createLead);
router.put('/leads/:id', authenticateToken, updateLead);
router.delete('/leads/:id', authenticateToken, deleteLead);
router.get('/notifications', authenticateToken, getNotifications);

// Lead Activity History timeline logs
router.get('/leads/:id/timeline', authenticateToken, getLeadTimeline);

// Protected outgoing message channel dispatch
router.post('/leads/:id/message', authenticateToken, sendLeadWhatsApp);

// PUBLIC Webhook callback endpoints (used by Meta, Google, and n8n)
router.post('/webhook', ingestWebhook);

// Meta Ads (Facebook Lead Ads) webhook integration
router.get('/webhook/meta', verifyMetaWebhook);
router.post('/webhook/meta', handleMetaWebhook);

// WhatsApp Cloud API webhook integration
router.get('/webhook/whatsapp', verifyWhatsAppWebhook);
router.post('/webhook/whatsapp', handleWhatsAppWebhook);

// Google Ads Lead Form webhook integration
router.post('/webhook/google', handleGoogleAdsWebhook);

export default router;
