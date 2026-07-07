# Google Sheets Database Setup Guide

This guide explains how to link the LeadFlow CRM to Google Sheets as its primary database.

---

## 1. Create your Google Spreadsheet

1. Open [Google Sheets](https://sheets.google.com) and create a **blank spreadsheet**.
2. Name your spreadsheet (e.g., `LeadFlow CRM Database`).
3. Take note of the **Spreadsheet ID** from the URL. The ID is the long string of characters between `/d/` and `/edit` in your browser URL:
   `https://docs.google.com/spreadsheets/d/SPREADSHEET_ID_HERE/edit`

---

## 2. Share the Spreadsheet with your Service Account

For the backend to write to the spreadsheet, you must grant access:
1. Click the **Share** button in the top right of your Google Sheet.
2. Add your Service Account email (e.g., `crm-service-account@your-project-id.iam.gserviceaccount.com`).
3. Set the permission role to **Editor**.
4. Uncheck "Notify people" and click **Share**.

---

## 3. Spreadsheet Column Layouts

The application expects two sheets (tabs) inside your spreadsheet: `Sheet1` and `Sheet2`. 

If they do not exist or are empty, the backend will **automatically initialize them** on startup. Below are their column mappings:

### Sheet 1: `Sheet1` (Lead Database)
The leads table tracks active contact records and pipeline states:

* **Column A**: `Lead ID` (Primary key, auto-generated)
* **Column B**: `Name`
* **Column C**: `Phone Number` (Scrubbed digits)
* **Column D**: `Source` (Meta Ads, Google Ads, WhatsApp, etc.)
* **Column E**: `Status` (Pipeline state: New Leads, Interested, Follow Up, Not Interested)
* **Column F**: `Follow Up Date` (ISO Date string `YYYY-MM-DD`)
* **Column G**: `Created At` (ISO Date string)
* **Column H**: `Updated At` (ISO Date string)
* **Column I**: `Notes` (Communication summary updates)

### Sheet 2: `Sheet2` (Lead Activity History)
This table acts as a structured transaction ledger capturing chronological logs of actions associated with lead IDs:

* **Column A**: `Activity ID` (Primary key)
* **Column B**: `Lead ID` (Foreign key linking to Sheet 1)
* **Column C**: `Phone Number`
* **Column D**: `Activity Type` (e.g. Lead Created, Status Changed, WhatsApp Sent)
* **Column E**: `Old Value`
* **Column F**: `New Value`
* **Column G**: `Description` (Action breakdown details)
* **Column H**: `Performed By` (Author: System, User, Admin)
* **Column I**: `Timestamp` (ISO Date string)

---

## 4. Declare Environment Variables

Declare the variables in your backend `.env` file (local development) or platform dashboard settings (Render production web service):

```env
# Google service credentials
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC..."
GOOGLE_SHEET_ID=your_spreadsheet_url_id
```

*Note: If these variables are not found or authentication fails, the application automatically falls back to local storage (`backend/data/db.json` and `backend/data/activity_db.json`) keeping the CRM operational.*
