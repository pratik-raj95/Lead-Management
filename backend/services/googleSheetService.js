import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { sheetsClient, useSheets, sheetId } from '../config/googleSheets.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const LEADS_DB_PATH = path.join(__dirname, '..', 'data', 'db.json');
const ACTIVITY_DB_PATH = path.join(__dirname, '..', 'data', 'activity_db.json');

const LEADS_TAB_NAME = 'LeadFlow CRM Database';
const ACTIVITY_TAB_NAME = 'Lead Activity';

// Ensure data folder exists
const dataDir = path.dirname(LEADS_DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Memory caches for fallback databases
let localLeads = [];
let localActivities = [];

const loadLocalData = () => {
  try {
    if (fs.existsSync(LEADS_DB_PATH)) {
      localLeads = JSON.parse(fs.readFileSync(LEADS_DB_PATH, 'utf8'));
    } else {
      localLeads = [];
      fs.writeFileSync(LEADS_DB_PATH, JSON.stringify(localLeads, null, 2));
    }

    if (fs.existsSync(ACTIVITY_DB_PATH)) {
      localActivities = JSON.parse(fs.readFileSync(ACTIVITY_DB_PATH, 'utf8'));
    } else {
      localActivities = [];
      fs.writeFileSync(ACTIVITY_DB_PATH, JSON.stringify(localActivities, null, 2));
    }
  } catch (err) {
    console.error('[Fallback DB] Failed to load JSON files:', err.message);
  }
};

const saveLocalLeads = () => {
  try {
    fs.writeFileSync(LEADS_DB_PATH, JSON.stringify(localLeads, null, 2));
  } catch (err) {
    console.error('[Fallback DB] Failed to save leads JSON:', err.message);
  }
};

const saveLocalActivities = () => {
  try {
    fs.writeFileSync(ACTIVITY_DB_PATH, JSON.stringify(localActivities, null, 2));
  } catch (err) {
    console.error('[Fallback DB] Failed to save activities JSON:', err.message);
  }
};

// Initial load for fallback caches
loadLocalData();

/**
 * Retrieve the worksheet GID (sheetId) dynamically by its title.
 */
async function getWorksheetGid(title) {
  if (!sheetsClient) return 0;
  const res = await sheetsClient.spreadsheets.get({ spreadsheetId: sheetId });
  const found = res.data.sheets.find(s => s.properties.title === title);
  return found ? found.properties.sheetId : 0;
}

export const googleSheetService = {
  /**
   * Save a history log in Sheet2 (Activity Logs) or fallback JSON
   */
  async saveActivity(leadId, phone, activityType, oldValue = '', newValue = '', description = '', performedBy = 'System') {
    const timestamp = new Date().toISOString();
    const activityId = `act_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    if (!useSheets || !sheetsClient) {
      throw new Error('[Google Sheets Service Error] Fallback is disabled. Cannot write activity log.');
    }

    try {
      // Programmatically get next empty row to avoid Sheets append race/formatting bugs
      const checkRes = await sheetsClient.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: `'${ACTIVITY_TAB_NAME}'!A2:A2000`
      });
      const rowsCount = checkRes.data.values ? checkRes.data.values.length : 0;
      const nextRow = rowsCount + 2;

      const row = [
        activityId,
        leadId || '',
        phone || '',
        activityType || '',
        oldValue || '',
        newValue || '',
        description || '',
        performedBy || 'System',
        timestamp
      ];

      await sheetsClient.spreadsheets.values.update({
        spreadsheetId: sheetId,
        range: `'${ACTIVITY_TAB_NAME}'!A${nextRow}:I${nextRow}`,
        valueInputOption: 'RAW',
        requestBody: { values: [row] }
      });
    } catch (err) {
      console.error('[Google Sheets Service Error] Failed to write activity log:', err.message);
      throw err;
    }
  },

  /**
   * Fetch all leads from Sheet1 (LeadFlow CRM Database) or fallback JSON
   */
  async getAllLeads() {
    if (!useSheets || !sheetsClient) {
      throw new Error('[Google Sheets Service Error] Fallback is disabled. Cannot fetch leads.');
    }

    try {
      const res = await sheetsClient.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: `'${LEADS_TAB_NAME}'!A2:I1000`,
      });
      const rows = res.data.values || [];
      return rows.map((row, index) => ({
        rowIndex: index + 2, // 1-indexed, headers are row 1
        id: row[0] || '',
        name: row[1] || 'Contact',
        phone: row[2] || '',
        source: row[3] || '',
        status: row[4] || 'New Leads',
        followUpDate: row[5] || null,
        createdDate: row[6] || '',
        lastUpdated: row[7] || '',
        notes: row[8] || ''
      }));
    } catch (err) {
      console.error('[Google Sheets Service Error] Failed to fetch leads:', err.message);
      throw err;
    }
  },

  /**
   * Fetch a single lead by ID
   */
  async getLead(id) {
    const leads = await this.getAllLeads();
    return leads.find(l => l.id === id) || null;
  },

  /**
   * Search for a lead by phone number (used for duplicate prevention check)
   */
  async findLeadByPhone(phone) {
    const scrubbed = phone.replace(/[\s\-\(\)\+]/g, '');
    const leads = await this.getAllLeads();
    return leads.find(l => l.phone.replace(/[\s\-\(\)\+]/g, '') === scrubbed) || null;
  },

  /**
   * Create a new lead in Sheet1 or fallback JSON
   */
  async createLead(leadData) {
    const timestamp = new Date().toISOString();
    const leadId = `lead_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const phone = leadData.phone.replace(/[\s\-\(\)\+]/g, '');
    const name = leadData.name || 'Contact';
    const source = leadData.source || 'meta_ads';
    const status = leadData.status || 'New Leads';
    const followUpDate = leadData.followUpDate || null;
    const notes = leadData.notes || '';

    if (!useSheets || !sheetsClient) {
      throw new Error('[Google Sheets Service Error] Fallback is disabled. Cannot create lead.');
    }

    try {
      const row = [
        leadId,
        name,
        phone,
        source,
        status,
        followUpDate || '',
        timestamp,
        timestamp,
        notes || ''
      ];

      // Programmatically get next empty row to avoid Sheets append overwrite/formatting bugs
      const currentLeads = await this.getAllLeads();
      const nextRow = currentLeads.length + 2;

      const appendRes = await sheetsClient.spreadsheets.values.update({
        spreadsheetId: sheetId,
        range: `'${LEADS_TAB_NAME}'!A${nextRow}:I${nextRow}`,
        valueInputOption: 'RAW',
        requestBody: { values: [row] }
      });

      await this.saveActivity(leadId, phone, 'Lead Created', '', status, `Lead generated via ${source}`, 'System');

      return {
        id: leadId,
        name,
        phone,
        source,
        status,
        followUpDate,
        createdDate: timestamp,
        lastUpdated: timestamp,
        notes,
        appendRes: appendRes.data // return metadata details for debugging reports
      };
    } catch (err) {
      console.error('[Google Sheets Service Error] Failed to write new lead:', err.message);
      throw err;
    }
  },

  /**
   * Update details of an existing lead (Sheet1) and log changes in Activity (Sheet2)
   */
  async updateLead(id, updates) {
    const timestamp = new Date().toISOString();
    const existing = await this.getLead(id);
    if (!existing) return null;

    const name = updates.name !== undefined ? updates.name : existing.name;
    const phone = updates.phone !== undefined ? updates.phone.replace(/[\s\-\(\)\+]/g, '') : existing.phone;
    const source = updates.source !== undefined ? updates.source : existing.source;
    const status = updates.status !== undefined ? updates.status : existing.status;
    const followUpDate = updates.followUpDate !== undefined ? updates.followUpDate : existing.followUpDate;
    const notes = updates.notes !== undefined ? updates.notes : existing.notes;

    // Detect changes to write activity logs
    if (existing.status !== status) {
      await this.saveActivity(id, phone, 'Status Changed', existing.status, status, `Pipeline stage moved from ${existing.status} to ${status}`, 'System');
    }
    if (existing.followUpDate !== followUpDate) {
      await this.saveActivity(id, phone, 'Follow-up Updated', existing.followUpDate || 'None', followUpDate || 'Cleared', `Follow up date set to ${followUpDate || 'none'}`, 'System');
    }
    if (existing.notes !== notes) {
      await this.saveActivity(id, phone, 'Notes Updated', '', '', `Timeline notes updated`, 'System');
    }

    if (!useSheets || !sheetsClient) {
      throw new Error('[Google Sheets Service Error] Fallback is disabled. Cannot update lead.');
    }

    try {
      const updatedRow = [
        id,
        name,
        phone,
        source,
        status,
        followUpDate || '',
        existing.createdDate,
        timestamp,
        notes || ''
      ];

      await sheetsClient.spreadsheets.values.update({
        spreadsheetId: sheetId,
        range: `'${LEADS_TAB_NAME}'!A${existing.rowIndex}:I${existing.rowIndex}`,
        valueInputOption: 'RAW',
        requestBody: { values: [updatedRow] }
      });

      return {
        id,
        name,
        phone,
        source,
        status,
        followUpDate,
        createdDate: existing.createdDate,
        lastUpdated: timestamp,
        notes
      };
    } catch (err) {
      console.error('[Google Sheets Service Error] Failed to update lead row:', err.message);
      throw err;
    }
  },

  /**
   * Delete a lead from Sheet1 and log "Lead Deleted" activity
   */
  async deleteLead(id) {
    const existing = await this.getLead(id);
    if (!existing) return false;

    await this.saveActivity(id, existing.phone, 'Lead Deleted', existing.status, '', `Lead records removed from database`, 'System');

    if (!useSheets || !sheetsClient) {
      throw new Error('[Google Sheets Service Error] Fallback is disabled. Cannot delete lead.');
    }

    try {
      // Fetch dynamic sheetId GID to avoid hardcoded '0' deletions failures
      const gid = await getWorksheetGid(LEADS_TAB_NAME);

      const request = {
        spreadsheetId: sheetId,
        resource: {
          requests: [
            {
              deleteDimension: {
                range: {
                  sheetId: gid,
                  dimension: 'ROWS',
                  startIndex: existing.rowIndex - 1,
                  endIndex: existing.rowIndex
                }
              }
            }
          ]
        }
      };
      await sheetsClient.spreadsheets.batchUpdate(request);
      return true;
    } catch (err) {
      console.error('[Google Sheets Service Error] Failed to delete lead row:', err.message);
      throw err;
    }
  },

  /**
   * Shortcut Helper: Update lead stage status
   */
  async updateStatus(id, newStatus) {
    return this.updateLead(id, { status: newStatus });
  },

  /**
   * Shortcut Helper: Update follow-up date
   */
  async updateFollowup(id, newDate) {
    return this.updateLead(id, { followUpDate: newDate });
  },

  /**
   * Shortcut Helper: Append notes
   */
  async updateNotes(id, newNotes) {
    return this.updateLead(id, { notes: newNotes });
  },

  /**
   * Retrieve timeline log files for a specific lead (Sheet2)
   */
  async getLeadTimeline(leadId) {
    if (!useSheets || !sheetsClient) {
      throw new Error('[Google Sheets Service Error] Fallback is disabled. Cannot fetch timeline.');
    }

    try {
      const res = await sheetsClient.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: `'${ACTIVITY_TAB_NAME}'!A2:I2000`,
      });
      const rows = res.data.values || [];
      const activities = rows.map(row => ({
        activityId: row[0] || '',
        leadId: row[1] || '',
        phone: row[2] || '',
        activityType: row[3] || '',
        oldValue: row[4] || '',
        newValue: row[5] || '',
        description: row[6] || '',
        performedBy: row[7] || '',
        timestamp: row[8] || ''
      }));

      return activities
        .filter(act => act.leadId === leadId)
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    } catch (err) {
      console.error('[Google Sheets Service Error] Failed to fetch timeline activity list:', err.message);
      throw err;
    }
  }
};
