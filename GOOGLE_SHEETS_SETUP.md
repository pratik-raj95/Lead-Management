# Google Sheets API Integration Setup

This document explains how to set up the Google Sheets integration for your CRM database, configure your service account, and explains how duplicate detection works.

---

## 1. Sheet Setup Walkthrough

1. **Spreadsheet creation**:
   - Create a Google Sheet.
   - Note the **Spreadsheet ID** from the browser address bar.
2. **Enable APIs**:
   - Go to Google Cloud Console, enable **Google Sheets API**.
3. **Create Service Account credentials**:
   - Create a service account under **Credentials**.
   - Create a JSON Key file, download it, and extract the email address and private key.
4. **Share Spreadsheet permissions**:
   - Open your Google Sheet, click **Share**, add the service account email, and select **Editor**.

---

## 2. Syncing Google Sheets with the CRM Dashboard

When the Express backend loads, it authorizes with Google and queries the spreadsheet rows.
- **Header Row**: If the sheet is empty, the CRM automatically initializes the following columns in row 1:
  `id | name | phone | source | status | createdDate | followUpDate | lastUpdated | notes`
- **Lead Mapping**: When the client loads the CRM dashboard, the backend fetches all rows from row 2 onwards and parses them into JSON objects. The frontend useLeads hook polls this list every 4 seconds, reflecting changes instantly in the UI.

---

## 3. Duplicate Detection & Ingestion Logic

The CRM employs a strict unique constraint check on the `phone` field:

```
Inbound Lead (Phone)
       ↓
Search Google Sheet for matching Phone column
       ↓
  [Phone Found?]
   ├── Yes ──> Update the existing Sheet row (updates name/source/followUpDate)
   │           Append a new event string to the "notes" column (Activity History log)
   │
   └── No  ──> Append a new row to the Sheet
               Status = "New Leads"
               createdDate = Current Timestamp
```

### Advantages:
- Prevents database bloating from repeating Meta/Google ad-clicks.
- Preserves historical records. Notes column acts as an append-only timeline log.

---

## 4. Google Sheets n8n Flow Configuration

If using n8n to sync leads to Google Sheets:
1. In your n8n workspace, add a **Google Sheets** node.
2. Configure **Action** = `Append or Update Row`.
3. Set **Resource** = `Row`.
4. Enter your spreadsheet ID.
5. Set **Key Column** = `phone` (Google Sheets node will automatically locate matching rows on the phone column and perform an UPDATE if found, or APPEND a new row if missing).
6. Map inputs:
   - `phone` = `{{ $json.phone }}`
   - `source` = `meta_ads` (or ads source)
   - `notes` = `[Timestamp] Ingested via n8n integration`
