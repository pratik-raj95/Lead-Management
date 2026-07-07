import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, 'data', 'db.json');

// Ensure data directory exists for the JSON fallback
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Sample leads for seeding local testing
const defaultData = [
  {
    id: "lead_1",
    name: "John Doe",
    phone: "9876543210",
    source: "meta_ads",
    status: "New Leads",
    createdDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    followUpDate: null,
    lastUpdated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    notes: "[2026-07-04 12:00] Ingested via Meta Ads Webhook"
  },
  {
    id: "lead_2",
    name: "Jane Smith",
    phone: "9988776655",
    source: "whatsapp",
    status: "Interested",
    createdDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    followUpDate: new Date().toISOString().split('T')[0], // Today's follow up
    lastUpdated: new Date().toISOString(),
    notes: "[2026-07-02 10:00] Customer contacted via WhatsApp message"
  }
];

class DatabaseManager {
  constructor() {
    this.useSheets = false;
    this.sheetsClient = null;
    this.sheetId = null;
    this.localLeads = [];
    this.init();
  }

  /**
   * Initializes the Google Sheets client.
   * If credentials are not set in environment variables, defaults to local JSON storage.
   */
  async init() {
    const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const privateKeyRaw = process.env.GOOGLE_PRIVATE_KEY;
    this.sheetId = process.env.GOOGLE_SHEET_ID;

    if (email && privateKeyRaw && this.sheetId) {
      try {
        const privateKey = privateKeyRaw.replace(/\\n/g, '\n');
        const auth = new google.auth.JWT(
          email,
          null,
          privateKey,
          ['https://www.googleapis.com/auth/spreadsheets']
        );

        await auth.authorize();
        this.sheetsClient = google.sheets({ version: 'v4', auth });
        this.useSheets = true;
        console.log(`[Database] Google Sheets integration activated. Sheet ID: ${this.sheetId}`);

        // Seed headers if sheet is empty
        await this.ensureHeaders();
      } catch (err) {
        console.error('[Database Error] Google Sheets auth failed, falling back to JSON database:', err.message);
        this.loadLocal();
      }
    } else {
      console.log('[Database Info] Google Sheets credentials missing. Using local JSON database (backend/data/db.json).');
      this.loadLocal();
    }
  }

  /**
   * Load local backup JSON database
   */
  loadLocal() {
    try {
      if (fs.existsSync(DB_PATH)) {
        const data = fs.readFileSync(DB_PATH, 'utf8');
        this.localLeads = JSON.parse(data);
      } else {
        this.localLeads = defaultData;
        this.saveLocal();
      }
    } catch (error) {
      console.error('Error loading local DB:', error);
      this.localLeads = defaultData;
    }
  }

  /**
   * Write local backup JSON database
   */
  saveLocal() {
    try {
      fs.writeFileSync(DB_PATH, JSON.stringify(this.localLeads, null, 2), 'utf8');
    } catch (error) {
      console.error('Error saving local DB:', error);
    }
  }

  /**
   * Creates standard column headers in Sheet1 if it is empty.
   */
  async ensureHeaders() {
    if (!this.useSheets) return;
    try {
      const response = await this.sheetsClient.spreadsheets.values.get({
        spreadsheetId: this.sheetId,
        range: 'Sheet1!A1:I1',
      });
      const rows = response.data.values;
      if (!rows || rows.length === 0) {
        const headers = ['id', 'name', 'phone', 'source', 'status', 'createdDate', 'followUpDate', 'lastUpdated', 'notes'];
        await this.sheetsClient.spreadsheets.values.update({
          spreadsheetId: this.sheetId,
          range: 'Sheet1!A1:I1',
          valueInputOption: 'RAW',
          requestBody: { values: [headers] }
        });
        console.log('[Database] Initialized default headers in Google Sheet.');
      }
    } catch (err) {
      console.error('[Database Error] Failed to verify sheet headers:', err.message);
    }
  }

  /**
   * Retrieve all leads from the active database
   */
  async getLeads() {
    if (!this.useSheets) {
      this.loadLocal();
      return this.localLeads;
    }

    try {
      const response = await this.sheetsClient.spreadsheets.values.get({
        spreadsheetId: this.sheetId,
        range: 'Sheet1!A2:I1000',
      });
      const rows = response.data.values || [];
      return rows.map((row, idx) => ({
        rowIndex: idx + 2, // 1-indexed headers start at row 2
        id: row[0] || '',
        name: row[1] || 'Contact',
        phone: row[2] || '',
        source: row[3] || '',
        status: row[4] || '',
        createdDate: row[5] || '',
        followUpDate: row[6] || null,
        lastUpdated: row[7] || '',
        notes: row[8] || ''
      }));
    } catch (err) {
      console.error('[Database Error] Failed to read leads from Sheet:', err.message);
      this.loadLocal();
      return this.localLeads;
    }
  }

  /**
   * Ingest lead data. Checks phone unique constraints to prevent duplicates.
   * If lead exists, updates the row and appends activity history events.
   */
  async addOrUpdateLead(phone, source, name = '', followUpDate = null, notesText = '') {
    const scrubbedPhone = phone.replace(/\s+/g, '');
    const timestamp = new Date().toISOString();
    const newNote = notesText || `[${timestamp}] Ingested from ${source}`;

    if (!this.useSheets) {
      this.loadLocal();
      const existingIdx = this.localLeads.findIndex(l => l.phone.replace(/\s+/g, '') === scrubbedPhone);
      if (existingIdx !== -1) {
        const existing = this.localLeads[existingIdx];
        this.localLeads[existingIdx] = {
          ...existing,
          name: name || existing.name || 'Contact',
          source: source || existing.source,
          lastUpdated: timestamp,
          notes: existing.notes ? `${existing.notes}\n${newNote}` : newNote,
          followUpDate: followUpDate || existing.followUpDate
        };
        this.saveLocal();
        return this.localLeads[existingIdx];
      } else {
        const newLead = {
          id: `lead_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
          name: name || 'Contact',
          phone: scrubbedPhone,
          source: source,
          status: 'New Leads',
          createdDate: timestamp,
          followUpDate: followUpDate,
          lastUpdated: timestamp,
          notes: newNote
        };
        this.localLeads.push(newLead);
        this.saveLocal();
        return newLead;
      }
    }

    try {
      const leads = await this.getLeads();
      const existing = leads.find(l => l.phone.replace(/\s+/g, '') === scrubbedPhone);

      if (existing) {
        const updatedNotes = existing.notes ? `${existing.notes}\n${newNote}` : newNote;
        const updatedRow = [
          existing.id,
          name || existing.name || 'Contact',
          scrubbedPhone,
          source || existing.source,
          existing.status,
          existing.createdDate,
          followUpDate || existing.followUpDate,
          timestamp,
          updatedNotes
        ];

        await this.sheetsClient.spreadsheets.values.update({
          spreadsheetId: this.sheetId,
          range: `Sheet1!A${existing.rowIndex}:I${existing.rowIndex}`,
          valueInputOption: 'RAW',
          requestBody: { values: [updatedRow] }
        });
        
        return {
          id: existing.id,
          name: name || existing.name,
          phone: scrubbedPhone,
          source: source || existing.source,
          status: existing.status,
          createdDate: existing.createdDate,
          followUpDate: followUpDate || existing.followUpDate,
          lastUpdated: timestamp,
          notes: updatedNotes
        };
      } else {
        const leadId = `lead_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
        const newRow = [
          leadId,
          name || 'Contact',
          scrubbedPhone,
          source,
          'New Leads',
          timestamp,
          followUpDate,
          timestamp,
          newNote
        ];

        await this.sheetsClient.spreadsheets.values.append({
          spreadsheetId: this.sheetId,
          range: 'Sheet1!A2',
          valueInputOption: 'RAW',
          requestBody: { values: [newRow] }
        });

        return {
          id: leadId,
          name: name || 'Contact',
          phone: scrubbedPhone,
          source: source,
          status: 'New Leads',
          createdDate: timestamp,
          followUpDate: followUpDate,
          lastUpdated: timestamp,
          notes: newNote
        };
      }
    } catch (err) {
      console.error('[Database Error] Failed to write lead to Sheet:', err.message);
      return this.addOrUpdateLeadLocalFallback(phone, source, name, followUpDate, newNote);
    }
  }

  addOrUpdateLeadLocalFallback(phone, source, name, followUpDate, newNote) {
    this.loadLocal();
    const scrubbedPhone = phone.replace(/\s+/g, '');
    const timestamp = new Date().toISOString();
    const existingIdx = this.localLeads.findIndex(l => l.phone.replace(/\s+/g, '') === scrubbedPhone);
    if (existingIdx !== -1) {
      const existing = this.localLeads[existingIdx];
      this.localLeads[existingIdx] = {
        ...existing,
        name: name || existing.name || 'Contact',
        source: source || existing.source,
        lastUpdated: timestamp,
        notes: existing.notes ? `${existing.notes}\n${newNote}` : newNote,
        followUpDate: followUpDate || existing.followUpDate
      };
      this.saveLocal();
      return this.localLeads[existingIdx];
    } else {
      const newLead = {
        id: `lead_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        name: name || 'Contact',
        phone: scrubbedPhone,
        source: source,
        status: 'New Leads',
        createdDate: timestamp,
        followUpDate: followUpDate,
        lastUpdated: timestamp,
        notes: newNote
      };
      this.localLeads.push(newLead);
      this.saveLocal();
      return newLead;
    }
  }

  /**
   * Update details of a lead.
   */
  async updateLead(id, updates) {
    const timestamp = new Date().toISOString();

    if (!this.useSheets) {
      this.loadLocal();
      const idx = this.localLeads.findIndex(l => l.id === id);
      if (idx !== -1) {
        this.localLeads[idx] = {
          ...this.localLeads[idx],
          ...updates,
          lastUpdated: timestamp
        };
        this.saveLocal();
        return this.localLeads[idx];
      }
      return null;
    }

    try {
      const leads = await this.getLeads();
      const existing = leads.find(l => l.id === id);

      if (existing) {
        const updatedRow = [
          id,
          updates.name !== undefined ? updates.name : existing.name,
          updates.phone !== undefined ? updates.phone.replace(/\s+/g, '') : existing.phone,
          updates.source !== undefined ? updates.source : existing.source,
          updates.status !== undefined ? updates.status : existing.status,
          existing.createdDate,
          updates.followUpDate !== undefined ? updates.followUpDate : existing.followUpDate,
          timestamp,
          updates.notes !== undefined ? updates.notes : existing.notes
        ];

        await this.sheetsClient.spreadsheets.values.update({
          spreadsheetId: this.sheetId,
          range: `Sheet1!A${existing.rowIndex}:I${existing.rowIndex}`,
          valueInputOption: 'RAW',
          requestBody: { values: [updatedRow] }
        });

        return {
          id,
          name: updates.name !== undefined ? updates.name : existing.name,
          phone: updates.phone !== undefined ? updates.phone : existing.phone,
          source: updates.source !== undefined ? updates.source : existing.source,
          status: updates.status !== undefined ? updates.status : existing.status,
          createdDate: existing.createdDate,
          followUpDate: updates.followUpDate !== undefined ? updates.followUpDate : existing.followUpDate,
          lastUpdated: timestamp,
          notes: updates.notes !== undefined ? updates.notes : existing.notes
        };
      }
      return null;
    } catch (err) {
      console.error('[Database Error] Failed to update lead in Sheet:', err.message);
      return this.updateLeadLocalFallback(id, updates, timestamp);
    }
  }

  updateLeadLocalFallback(id, updates, timestamp) {
    this.loadLocal();
    const idx = this.localLeads.findIndex(l => l.id === id);
    if (idx !== -1) {
      this.localLeads[idx] = {
        ...this.localLeads[idx],
        ...updates,
        lastUpdated: timestamp
      };
      this.saveLocal();
      return this.localLeads[idx];
    }
    return null;
  }

  /**
   * Delete a lead from the active database
   */
  async deleteLead(id) {
    if (!this.useSheets) {
      return this.deleteLeadLocalFallback(id);
    }

    try {
      const leads = await this.getLeads();
      const existing = leads.find(l => l.id === id);

      if (existing) {
        // Delete row in Google Sheets via batchUpdate
        const request = {
          spreadsheetId: this.sheetId,
          resource: {
            requests: [
              {
                deleteDimension: {
                  range: {
                    sheetId: 0, // Default Sheet1 index ID
                    dimension: 'ROWS',
                    startIndex: existing.rowIndex - 1, // 0-indexed start
                    endIndex: existing.rowIndex // 0-indexed end
                  }
                }
              }
            ]
          }
        };
        await this.sheetsClient.spreadsheets.batchUpdate(request);
        return true;
      }
      return false;
    } catch (err) {
      console.error('[Database Error] Failed to delete lead from Sheet:', err.message);
      return this.deleteLeadLocalFallback(id);
    }
  }

  deleteLeadLocalFallback(id) {
    this.loadLocal();
    const idx = this.localLeads.findIndex(l => l.id === id);
    if (idx !== -1) {
      this.localLeads.splice(idx, 1);
      this.saveLocal();
      return true;
    }
    return false;
  }
}

export const db = new DatabaseManager();
