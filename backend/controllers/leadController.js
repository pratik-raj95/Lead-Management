import { googleSheetService } from '../services/googleSheetService.js';
import { fetchMetaLead } from '../services/metaService.js';
import { sendWhatsAppMessage } from '../services/whatsappService.js';

/**
 * Helper to validate and scrub phone numbers
 * Returns scrubbed phone number if valid, null otherwise
 */
const validateAndScrubPhone = (phone) => {
  if (!phone) return null;
  const scrubbed = phone.replace(/[\s\-\(\)\+]/g, '');
  if (/^\d{7,15}$/.test(scrubbed)) {
    return scrubbed;
  }
  return null;
};

/**
 * Retrieve all leads from database
 */
export const getLeads = async (req, res) => {
  try {
    const leads = await googleSheetService.getAllLeads();
    res.json(leads);
  } catch (error) {
    console.error('[Controller Error] getLeads:', error.message);
    res.status(500).json({ error: 'Failed to retrieve leads from database' });
  }
};

/**
 * Update a lead details
 */
export const updateLead = async (req, res) => {
  const { id } = req.params;
  const { name, phone, source, status, followUpDate, notes } = req.body;
  try {
    const updated = await googleSheetService.updateLead(id, { name, phone, source, status, followUpDate, notes });
    if (updated) {
      res.json(updated);
    } else {
      res.status(404).json({ error: 'Lead not found' });
    }
  } catch (error) {
    console.error('[Controller Error] updateLead:', error.message);
    res.status(500).json({ error: 'Failed to update lead details' });
  }
};

/**
 * Unified webhook ingest endpoint with duplicate detection & merge logging
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
    const existing = await googleSheetService.findLeadByPhone(scrubbed);
    
    if (existing) {
      // DUPLICATE DETECTED: Merge lead, update source and notes, log activity
      const updatedNotes = existing.notes 
        ? `${existing.notes}\n[Webhook Ingest] Duplicate merged. Source: ${leadSource}`
        : `[Webhook Ingest] Duplicate merged. Source: ${leadSource}`;
      
      const newSource = existing.source.includes(leadSource) 
        ? existing.source 
        : `${existing.source}, ${leadSource}`;

      const updated = await googleSheetService.updateLead(existing.id, {
        notes: updatedNotes,
        source: newSource,
        name: name || existing.name
      });

      await googleSheetService.saveActivity(
        existing.id,
        scrubbed,
        'Duplicate Merged',
        existing.source,
        newSource,
        `Duplicate lead merged via webhook. Inflow source: ${leadSource}`,
        'System'
      );

      return res.status(200).json({
        success: true,
        message: 'Duplicate lead matched and merged.',
        lead: updated
      });
    }

    // Otherwise, create a new lead
    const lead = await googleSheetService.createLead({
      phone: scrubbed,
      source: leadSource,
      name: name || 'Contact',
      followUpDate: followUpDate || null,
      notes: notes || ''
    });

    await googleSheetService.saveActivity(
      lead.id,
      scrubbed,
      'Webhook Received',
      '',
      leadSource,
      `Webhook registration captured from ${leadSource}`,
      'System'
    );

    res.status(201).json({
      success: true,
      message: 'Lead processed successfully',
      lead
    });
  } catch (error) {
    console.error('[Controller Error] ingestWebhook:', error.message);
    res.status(500).json({ error: 'Failed to process lead' });
  }
};

/**
 * Fetch leads with active follow-ups for today
 */
export const getNotifications = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const leads = await googleSheetService.getAllLeads();
    const notifications = leads.filter(lead => {
      return lead.followUpDate === today && lead.status !== 'Not Interested';
    });
    res.json(notifications);
  } catch (error) {
    console.error('[Controller Error] getNotifications:', error.message);
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

        const leadDetails = await fetchMetaLead(leadgenId);
        if (leadDetails && leadDetails.phone) {
          const scrubbed = validateAndScrubPhone(leadDetails.phone);
          if (scrubbed) {
            const timestamp = new Date().toISOString();
            const logNotes = `[Meta Webhook] Ingested Facebook Lead ID: ${leadgenId}`;

            const existing = await googleSheetService.findLeadByPhone(scrubbed);
            if (existing) {
              const updatedNotes = existing.notes ? `${existing.notes}\n[${timestamp}] ${logNotes}` : `[${timestamp}] ${logNotes}`;
              const newSource = existing.source.includes('meta_ads') ? existing.source : `${existing.source}, meta_ads`;
              
              const updated = await googleSheetService.updateLead(existing.id, {
                notes: updatedNotes,
                source: newSource
              });

              await googleSheetService.saveActivity(
                existing.id,
                scrubbed,
                'Duplicate Merged',
                existing.source,
                newSource,
                `Duplicate lead merged via Meta Ads. Lead ID: ${leadgenId}`,
                'System'
              );
            } else {
              const lead = await googleSheetService.createLead({
                phone: scrubbed,
                source: 'meta_ads',
                name: leadDetails.name || 'Contact',
                notes: logNotes
              });

              await googleSheetService.saveActivity(
                lead.id,
                scrubbed,
                'Meta Lead Imported',
                '',
                'meta_ads',
                `Meta Lead Ad record imported. Leadgen ID: ${leadgenId}`,
                'System'
              );
            }
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
        const phone = message.from;
        const name = contact?.profile?.name || '';
        const bodyText = message.text?.body || '';

        const scrubbed = validateAndScrubPhone(phone);
        if (scrubbed) {
          const timestamp = new Date().toISOString();
          const logNotes = `[WhatsApp Inflow] Incoming message: "${bodyText}"`;
          
          const existing = await googleSheetService.findLeadByPhone(scrubbed);
          if (existing) {
            const updatedNotes = existing.notes ? `${existing.notes}\n[${timestamp}] ${logNotes}` : `[${timestamp}] ${logNotes}`;
            const newSource = existing.source.includes('whatsapp') ? existing.source : `${existing.source}, whatsapp`;

            const updated = await googleSheetService.updateLead(existing.id, {
              notes: updatedNotes,
              source: newSource
            });

            await googleSheetService.saveActivity(
              existing.id,
              scrubbed,
              'Duplicate Merged',
              existing.source,
              newSource,
              `Duplicate lead merged via WhatsApp Message. Text: "${bodyText}"`,
              'System'
            );
          } else {
            const lead = await googleSheetService.createLead({
              phone: scrubbed,
              source: 'whatsapp',
              name,
              notes: logNotes
            });

            await googleSheetService.saveActivity(
              lead.id,
              scrubbed,
              'Webhook Received',
              '',
              'whatsapp',
              `WhatsApp lead registered via inbound message: "${bodyText}"`,
              'System'
            );
          }
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
    const lead = await googleSheetService.getLead(id);

    if (!lead) {
      return res.status(404).json({ error: 'Lead not found.' });
    }

    const result = await sendWhatsAppMessage(lead.phone, message);
    if (result.success) {
      const timestamp = new Date().toISOString();
      const updatedNotes = lead.notes 
        ? `${lead.notes}\n[${timestamp}] Outgoing WhatsApp sent: "${message}"` 
        : `[${timestamp}] Outgoing WhatsApp sent: "${message}"`;
      
      const updatedLead = await googleSheetService.updateLead(id, { notes: updatedNotes });

      // LOG ACTIVITY: Outgoing WhatsApp Sent
      await googleSheetService.saveActivity(
        id,
        lead.phone,
        'WhatsApp Message Sent',
        '',
        '',
        `Outgoing message sent: "${message}"`,
        'System'
      );

      res.json({ success: true, lead: updatedLead });
    } else {
      res.status(500).json({ error: result.error || 'Failed to dispatch WhatsApp message.' });
    }
  } catch (error) {
    console.error('[Controller Error] sendLeadWhatsApp:', error.message);
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

  if (google_key !== serverKey) {
    return res.status(401).json({ error: 'Unauthorized google_key' });
  }

  try {
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
    const logNotes = `[Google Ads] Ingested Google Ads Form ID: ${body.lead_id || 'unknown'}`;
    
    const existing = await googleSheetService.findLeadByPhone(scrubbed);
    if (existing) {
      const updatedNotes = existing.notes ? `${existing.notes}\n[${timestamp}] ${logNotes}` : `[${timestamp}] ${logNotes}`;
      const newSource = existing.source.includes('google_ads') ? existing.source : `${existing.source}, google_ads`;
      
      const updated = await googleSheetService.updateLead(existing.id, {
        notes: updatedNotes,
        source: newSource
      });

      await googleSheetService.saveActivity(
        existing.id,
        scrubbed,
        'Duplicate Merged',
        existing.source,
        newSource,
        `Duplicate lead merged via Google Ads Form ID: ${body.lead_id || 'unknown'}`,
        'System'
      );

      res.status(200).json({ success: true, lead: updated });
    } else {
      const lead = await googleSheetService.createLead({
        phone: scrubbed,
        source: 'google_ads',
        name,
        notes: logNotes
      });

      await googleSheetService.saveActivity(
        lead.id,
        scrubbed,
        'Google Ads Lead Imported',
        '',
        'google_ads',
        `Google Ads Form lead registered. Form ID: ${body.lead_id || 'unknown'}`,
        'System'
      );

      res.status(201).json({ success: true, lead });
    }
  } catch (err) {
    console.error('[Google Ads Webhook Error]:', err.message);
    res.status(500).json({ error: 'Failed to process Google Ads webhook event.' });
  }
};

/**
 * Delete a lead
 */
export const deleteLead = async (req, res) => {
  const { id } = req.params;
  try {
    const deleted = await googleSheetService.deleteLead(id);
    if (deleted) {
      res.json({ success: true, message: 'Lead deleted successfully' });
    } else {
      res.status(404).json({ error: 'Lead not found' });
    }
  } catch (error) {
    console.error('[Controller Error] deleteLead:', error.message);
    res.status(500).json({ error: 'Failed to delete lead from database' });
  }
};

/**
 * Get lead activity timeline
 */
export const getLeadTimeline = async (req, res) => {
  const { id } = req.params;
  try {
    const timeline = await googleSheetService.getLeadTimeline(id);
    res.json(timeline);
  } catch (error) {
    console.error('[Controller Error] getLeadTimeline:', error.message);
    res.status(500).json({ error: 'Failed to retrieve timeline logs' });
  }
};

/**
 * Manually create a new lead
 */
export const createLead = async (req, res) => {
  try {
    const { name, phone, source, status, followUpDate, notes } = req.body;
    const scrubbed = validateAndScrubPhone(phone);
    if (!scrubbed) {
      return res.status(400).json({ error: 'Invalid or missing phone number.' });
    }

    const existing = await googleSheetService.findLeadByPhone(scrubbed);
    if (existing) {
      return res.status(409).json({ error: 'A lead with this phone number already exists.' });
    }

    const lead = await googleSheetService.createLead({
      name,
      phone: scrubbed,
      source: source || 'manual',
      status: status || 'New Leads',
      followUpDate,
      notes
    });

    res.status(201).json(lead);
  } catch (error) {
    console.error('[Controller Error] createLead:', error.message);
    res.status(500).json({ error: 'Failed to create lead.' });
  }
};
