import { google } from 'googleapis';
import fs from 'fs';

// Load environmental variables statically on evaluation
try {
  if (fs.existsSync('.env')) {
    process.loadEnvFile('.env');
  }
} catch (err) {}

const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const privateKeyRaw = process.env.GOOGLE_PRIVATE_KEY;
const sheetId = process.env.GOOGLE_SHEET_ID;

let sheetsClient = null;
let useSheets = false;

/**
 * Validates credentials and initializes the Google Sheets API client.
 * Force authentication to fail fast (throws error) to prevent silent local JSON fallbacks.
 */
export async function initGoogleSheets() {
  if (!email || !privateKeyRaw || !sheetId) {
    throw new Error('[Google Sheets Config Error] CRITICAL: Google Service Account credentials or Sheet ID missing in environment variables. Fallback is disabled.');
  }

  try {
    const privateKey = privateKeyRaw.replace(/\\n/g, '\n');
    
    const auth = new google.auth.JWT({
      email,
      key: privateKey,
      scopes: [
        'https://www.googleapis.com/auth/spreadsheets',
        'https://www.googleapis.com/auth/drive.readonly'
      ]
    });

    await auth.authorize();
    sheetsClient = google.sheets({ version: 'v4', auth });
    useSheets = true;
    console.log(`[Google Sheets Config] Authenticated successfully. Spreadsheet ID: ${sheetId}`);
    
    // Auto-validate and structure sheets
    await ensureSheetStructures();
  } catch (err) {
    console.error('[Google Sheets Config Error] Authentication failed:', err.message);
    useSheets = false;
    throw new Error(`[Google Sheets Config Error] Authentication failed: ${err.message}`);
  }
}

/**
 * Assures worksheets for 'LeadFlow CRM Database' and 'Lead Activity' exist and contain headers.
 */
async function ensureSheetStructures() {
  if (!useSheets || !sheetsClient) return;

  try {
    // 1. Fetch worksheet titles list
    const res = await sheetsClient.spreadsheets.get({ spreadsheetId: sheetId });
    const sheetTitles = res.data.sheets.map(s => s.properties.title);
    console.log('[Google Sheets] Existing tabs detected:', sheetTitles);

    const leadsTabName = 'LeadFlow CRM Database';
    const activityTabName = 'Lead Activity';

    // 2. Validate/Create Leads tab
    if (!sheetTitles.includes(leadsTabName)) {
      console.log(`[Google Sheets] '${leadsTabName}' worksheet not found. Creating...`);
      await sheetsClient.spreadsheets.batchUpdate({
        spreadsheetId: sheetId,
        requestBody: {
          requests: [
            {
              addSheet: {
                properties: { title: leadsTabName }
              }
            }
          ]
        }
      });
      console.log(`[Google Sheets] Created '${leadsTabName}' worksheet.`);
      
      const headers = ['Lead ID', 'Name', 'Phone Number', 'Source', 'Status', 'Follow Up Date', 'Created At', 'Updated At', 'Notes'];
      await sheetsClient.spreadsheets.values.update({
        spreadsheetId: sheetId,
        range: `'${leadsTabName}'!A1:I1`,
        valueInputOption: 'RAW',
        requestBody: { values: [headers] }
      });
      console.log(`[Google Sheets] Seeded columns in '${leadsTabName}'.`);
    } else {
      // Verify headers exist
      const resVal = await sheetsClient.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: `'${leadsTabName}'!A1:I1`
      });
      if (!resVal.data.values || resVal.data.values.length === 0) {
        const headers = ['Lead ID', 'Name', 'Phone Number', 'Source', 'Status', 'Follow Up Date', 'Created At', 'Updated At', 'Notes'];
        await sheetsClient.spreadsheets.values.update({
          spreadsheetId: sheetId,
          range: `'${leadsTabName}'!A1:I1`,
          valueInputOption: 'RAW',
          requestBody: { values: [headers] }
        });
        console.log(`[Google Sheets] Seeded columns in existing '${leadsTabName}'.`);
      }
    }

    // 3. Validate/Create Activity Logs tab
    if (!sheetTitles.includes(activityTabName)) {
      console.log(`[Google Sheets] '${activityTabName}' worksheet not found. Creating...`);
      await sheetsClient.spreadsheets.batchUpdate({
        spreadsheetId: sheetId,
        requestBody: {
          requests: [
            {
              addSheet: {
                properties: { title: activityTabName }
              }
            }
          ]
        }
      });
      console.log(`[Google Sheets] Created '${activityTabName}' worksheet.`);

      const headers = ['Activity ID', 'Lead ID', 'Phone Number', 'Activity Type', 'Old Value', 'New Value', 'Description', 'Performed By', 'Timestamp'];
      await sheetsClient.spreadsheets.values.update({
        spreadsheetId: sheetId,
        range: `'${activityTabName}'!A1:I1`,
        valueInputOption: 'RAW',
        requestBody: { values: [headers] }
      });
      console.log(`[Google Sheets] Seeded columns in '${activityTabName}'.`);
    } else {
      // Verify headers exist
      const resVal = await sheetsClient.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: `'${activityTabName}'!A1:I1`
      });
      if (!resVal.data.values || resVal.data.values.length === 0) {
        const headers = ['Activity ID', 'Lead ID', 'Phone Number', 'Activity Type', 'Old Value', 'New Value', 'Description', 'Performed By', 'Timestamp'];
        await sheetsClient.spreadsheets.values.update({
          spreadsheetId: sheetId,
          range: `'${activityTabName}'!A1:I1`,
          valueInputOption: 'RAW',
          requestBody: { values: [headers] }
        });
        console.log(`[Google Sheets] Seeded columns in existing '${activityTabName}'.`);
      }
    }

  } catch (err) {
    console.error('[Google Sheets Error] Sheet structural verification failed:', err.message);
    throw err;
  }
}

export { sheetsClient, useSheets, sheetId };
