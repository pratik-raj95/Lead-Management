import { db } from '../db.js';
import { fetchMetaLead } from '../services/metaService.js';
import { sendWhatsAppMessage } from '../services/whatsappService.js';

/**
 * Helper to validate and scrub phone numbers
 * Returns scrubbed phone number if valid, null otherwise
 */
const validateAndScrubPhone = (phone) => {
  if (!phone) return null;
  // Remove spaces, dashes, parentheses
  const scrubbed = phone.replace(/[\s\-\(\)\+]/g, '');
  // Must be between 7 and 15 digits
  if (/^\d{7,15}$/.test(scrubbed)) {
    return scrubbed;
  }
  return null;
};

/**
 * Retrieve all leads from Google Sheets (or fallback database)
 */
export const getLeads = async (req, res) => {
  try {
    const leads = await db.getLeads();
    res.json(leads);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve leads from database' });
  }
};

/**
 * Update a lead (status, follow-up date, notes)
 */
export const updateLead = async (req, res) => {
  const { id } = req.params;
  const { name, phone, source, status, followUpDate, notes } = req.body;
  try {
    const updated = await db.updateLead(id, { name, phone, source, status, followUpDate, notes });
    if (updated) {
      res.json(updated);
    } else {
      res.status(404).json({ error: 'Lead not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to update lead details' });
  }
};

/**
 * Unified webhook ingest endpoint (used by simulator and simple API integrations)
 */
export const ingestWebhook = async (req, res) => {
  const { phone, source, name, followUpDate, notes } = req.body;
  
  if (!phone) {
    return res.status(400).json({ error: 'Phone number is required' });
  }

  const scrubbed = validateAndScrubPhone(phone);
  if (!scrubbed) {
    return res.status(400).json({ error: 'Invalid phone number format. Must contain 7 to 15 digits.' });
  }

  const validSources = ['meta_ads', 'google_ads', 'whatsapp'];
  const leadSource = source || 'meta_ads';
  if (!validSources.includes(leadSource)) {
    return res.status(400).json({ error: `Invalid source. Must be one of: ${validSources.join(', ')}` });
  }

  try {
    const lead = await db.addOrUpdateLead(scrubbed, leadSource, name, followUpDate, notes);
    res.status(201).json({
      success: true,
      message: 'Lead processed successfully',
      lead
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to process lead' });
  }
};

/**
 * Fetch leads with active follow-ups for today
 */
export const getNotifications = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const leads = await db.getLeads();
    const notifications = leads.filter(lead => {
      return lead.followUpDate === today && lead.status !== 'Not Interested';
    });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve today\'s alerts' });
  }
};

/**
 * Verification handshake for Meta webhooks (Facebook App Subscriptions)
 */
export const verifyMetaWebhook = (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  const verifyToken = process.env.META_VERIFY_TOKEN || 'crm_meta_token';

  if (mode && token) {
    if (mode === 'subscribe' && token === verifyToken) {
      console.log('[Meta Webhook] Verification successful.');
      return res.status(200).send(challenge);
    }
    return res.sendStatus(403);
  }
  res.sendStatus(400);
};

/**
 * Ingest Meta lead generation webhook events
 */
export const handleMetaWebhook = async (req, res) => {
  const { body } = req;

  // Always respond immediately to Meta to avoid retry delays
  res.sendStatus(200);

  if (body.object === 'page') {
    try {
      const changes = body.entry?.[0]?.changes?.[0]?.value;
      if (changes && changes.leadgen_id) {
        const leadgenId = changes.leadgen_id;
        console.log(`[Meta Webhook] Received leadgen_id: ${leadgenId}`);

        // Fetch lead answers using Meta Developers Graph API
        const leadDetails = await fetchMetaLead(leadgenId);
        if (leadDetails && leadDetails.phone) {
          const scrubbed = validateAndScrubPhone(leadDetails.phone);
          if (scrubbed) {
            const timestamp = new Date().toISOString();
            const notes = `[${timestamp}] Ingested from Facebook Leadgen ID: ${leadgenId}`;
            await db.addOrUpdateLead(scrubbed, 'meta_ads', leadDetails.name, null, notes);
          }
        }
      }
    } catch (err) {
      console.error('[Meta Webhook Error] Failed to process webhook body:', err.message);
    }
  }
};

/**
 * Verification handshake for WhatsApp Business Cloud API webhooks
 */
export const verifyWhatsAppWebhook = (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN || 'crm_whatsapp_token';

  if (mode && token) {
    if (mode === 'subscribe' && token === verifyToken) {
      console.log('[WhatsApp Webhook] Verification successful.');
      return res.status(200).send(challenge);
    }
    return res.sendStatus(403);
  }
  res.sendStatus(400);
};

/**
 * Ingest WhatsApp message event notifications
 */
export const handleWhatsAppWebhook = async (req, res) => {
  const { body } = req;

  // Always return 200 within 3 seconds to WhatsApp API
  res.sendStatus(200);

  if (body.object === 'whatsapp_business_account') {
    try {
      const value = body.entry?.[0]?.changes?.[0]?.value;
      const message = value?.messages?.[0];
      const contact = value?.contacts?.[0];

      if (message) {
        const phone = message.from; // Sender's phone number
        const name = contact?.profile?.name || '';
        const bodyText = message.text?.body || '';

        const scrubbed = validateAndScrubPhone(phone);
        if (scrubbed) {
          const timestamp = new Date().toISOString();
          const notes = `[${timestamp}] Incoming WhatsApp message: "${bodyText}"`;
          
          await db.addOrUpdateLead(scrubbed, 'whatsapp', name, null, notes);
        }
      }
    } catch (err) {
      console.error('[WhatsApp Webhook Error] Failed to ingest message payload:', err.message);
    }
  }
};

/**
 * Send an outgoing WhatsApp message to a lead & log details in communication history
 */
export const sendLeadWhatsApp = async (req, res) => {
  const { id } = req.params;
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message body is required.' });
  }

  try {
    const leads = await db.getLeads();
    const lead = leads.find(l => l.id === id);

    if (!lead) {
      return res.status(404).json({ error: 'Lead not found.' });
    }

    const result = await sendWhatsAppMessage(lead.phone, message);
    if (result.success) {
      // Append event record to activity history notes
      const timestamp = new Date().toISOString();
      const updatedNotes = lead.notes 
        ? `${lead.notes}\n[${timestamp}] Outgoing WhatsApp sent: "${message}"` 
        : `[${timestamp}] Outgoing WhatsApp sent: "${message}"`;
      
      const updatedLead = await db.updateLead(id, { notes: updatedNotes });
      res.json({ success: true, lead: updatedLead });
    } else {
      res.status(500).json({ error: result.error || 'Failed to dispatch WhatsApp message.' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Server encountered error dispatching message.' });
  }
};

/**
 * Ingest Google Ads Lead Form extension payloads
 */
export const handleGoogleAdsWebhook = async (req, res) => {
  const { body } = req;
  const { google_key, user_column_data } = body;

  const serverKey = process.env.GOOGLE_ADS_KEY || 'crm_google_key';

  // 1. Authenticate secret key sent by Google Ads configuration
  if (google_key !== serverKey) {
    return res.status(401).json({ error: 'Unauthorized google_key' });
  }

  try {
    // 2. Parse column data array to extract the lead fields
    let phone = '';
    let name = '';

    if (Array.isArray(user_column_data)) {
      user_column_data.forEach(field => {
        if (field.column_id === 'PHONE_NUMBER') {
          phone = field.string_value;
        } else if (field.column_id === 'FULL_NAME' || field.column_id === 'FIRST_NAME') {
          name = field.string_value;
        }
      });
    }

    const scrubbed = validateAndScrubPhone(phone);
    if (!scrubbed) {
      return res.status(400).json({ error: 'Invalid or missing phone number field.' });
    }

    const timestamp = new Date().toISOString();
    const notes = `[${timestamp}] Ingested from Google Ads Lead Form ID: ${body.lead_id || 'unknown'}`;
    
    const lead = await db.addOrUpdateLead(scrubbed, 'google_ads', name, null, notes);
    res.status(201).json({ success: true, lead });
  } catch (err) {
    res.status(500).json({ error: 'Failed to process Google Ads webhook event.' });
  }
};

/**
 * Delete a lead
 */
export const deleteLead = async (req, res) => {
  const { id } = req.params;
  try {
    const deleted = await db.deleteLead(id);
    if (deleted) {
      res.json({ success: true, message: 'Lead deleted successfully' });
    } else {
      res.status(404).json({ error: 'Lead not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete lead from database' });
  }
};

