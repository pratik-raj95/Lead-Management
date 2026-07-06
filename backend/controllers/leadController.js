import { db } from '../db.js';

/**
 * Retrieve all leads
 */
export const getLeads = (req, res) => {
  try {
    res.json(db.getLeads());
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve leads' });
  }
};

/**
 * Update lead fields (e.g. follow-up dates, statuses)
 */
export const updateLead = (req, res) => {
  const { id } = req.params;
  const { phone, source, status, followUpDate } = req.body;
  try {
    const updated = db.updateLead(id, { phone, source, status, followUpDate });
    if (updated) {
      res.json(updated);
    } else {
      res.status(404).json({ error: 'Lead not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to update lead' });
  }
};

/**
 * Handle incoming webhook integrations (Meta Ads, Google Ads, WhatsApp Business)
 */
export const ingestWebhook = (req, res) => {
  const { phone, source } = req.body;
  
  if (!phone) {
    return res.status(400).json({ error: 'Phone number is required' });
  }

  if (!source) {
    return res.status(400).json({ error: 'Source is required' });
  }

  const validSources = ['meta_ads', 'google_ads', 'whatsapp'];
  if (!validSources.includes(source)) {
    return res.status(400).json({ error: `Invalid source. Must be one of: ${validSources.join(', ')}` });
  }

  try {
    const newLead = db.addLead(phone, source);
    console.log(`Successfully ingested lead from webhook: ${phone} (Source: ${source})`);
    res.status(201).json({
      success: true,
      message: 'Lead created successfully',
      lead: newLead
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to ingest lead via webhook' });
  }
};

/**
 * Fetch today's follow-up notifications
 */
export const getNotifications = (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const leads = db.getLeads();
    const notifications = leads.filter(lead => {
      return lead.followUpDate === today && lead.status !== 'Not Interested';
    });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve notifications' });
  }
};
