import express from 'express';
import cors from 'cors';
import { db } from './db.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Log all requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Get all leads
app.get('/api/leads', (req, res) => {
  try {
    res.json(db.getLeads());
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve leads' });
  }
});

// Update a lead (status, follow-up date, etc.)
app.put('/api/leads/:id', (req, res) => {
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
});

// Webhook for automation / lead integration (Meta, Google, WhatsApp)
app.post('/api/webhook', (req, res) => {
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
});

// Notifications helper (Get leads requiring follow-up today)
app.get('/api/notifications', (req, res) => {
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
});

app.listen(PORT, () => {
  console.log(`=============================================`);
  console.log(`CRM Backend running on http://localhost:${PORT}`);
  console.log(`Webhook Endpoint: http://localhost:${PORT}/api/webhook`);
  console.log(`=============================================`);
});
