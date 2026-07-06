# Client API Credentials & Setup Guide

This guide describes step-by-step how to collect the configuration keys needed to run Antigravity CRM in a live production environment.

---

## 1. Google Sheets Database Setup

The CRM stores all leads in a Google Sheet spreadsheet row-by-row. Follow these steps to connect your sheet:

1. **Create your Google Sheet**:
   - Go to Google Sheets, create a blank spreadsheet, and name it (e.g. `Company Leads`).
   - Copy the `Sheet ID` from the URL. It is the long string of characters between `/d/` and `/edit` (e.g. `1aB2c3D4e5F6g7H8i9J0kLMN` in `https://docs.google.com/spreadsheets/d/1aB2c3D4e5F6g7H8i9J0kLMN/edit#gid=0`).
2. **Enable Google Sheets API & Get Credentials**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/).
   - Create a new project (e.g. `Company CRM`).
   - Go to **APIs & Services** -> **Library**, search for **Google Sheets API**, and click **Enable**.
   - Go to **APIs & Services** -> **Credentials**, click **Create Credentials**, and select **Service Account**.
   - Complete the service account fields and click **Create**.
   - Note down the generated service account email address (e.g. `crm-service-account@project-id.iam.gserviceaccount.com`).
3. **Generate Service Account Private Key**:
   - Click on your newly created service account in the Google Cloud list.
   - Go to the **Keys** tab, click **Add Key**, and choose **Create New Key** (Select **JSON**).
   - A `.json` credentials file will download to your computer. Open it in a text editor.
   - Find the `"client_email"` and `"private_key"` values. Copy them exactly.
4. **Share Your Spreadsheet**:
   - Open your Google Sheet, click the blue **Share** button in the top right.
   - Invite your service account email address as an **Editor** and click **Send**.
5. **Paste into Environment Variables**:
   - Set `GOOGLE_SERVICE_ACCOUNT_EMAIL` = service account email address.
   - Set `GOOGLE_PRIVATE_KEY` = service account private key (include the quotes and replace newlines with `\n` characters if pasting into Render settings).
   - Set `GOOGLE_SHEET_ID` = Google Sheet ID.

---

## 2. Meta Ads (Facebook App & Tokens) Setup

Required to retrieve incoming ad-form leads and dispatch WhatsApp Cloud messages.

1. **Register as a Meta Developer**:
   - Go to [Meta for Developers Portal](https://developers.facebook.com/) and register.
2. **Create a Meta App**:
   - Click **Create App** in the top right.
   - Select **Other** -> **Business** (or choose **Lead Generation** / **WhatsApp** use cases).
3. **Get WhatsApp Business Credentials**:
   - In your app dashboard, find and add **WhatsApp**.
   - Go to **WhatsApp** -> **API Setup**.
   - Copy the **Phone Number ID** (e.g. `102834571234567`) and **WhatsApp Business Account ID** (e.g. `100984812345678`).
4. **Generate Facebook System User Token (Permanent Key)**:
   - Go to your Facebook Business Manager Account settings: `https://business.facebook.com/settings`.
   - Go to **Users** -> **System Users**.
   - Click **Add** to create a system user, select role **Admin**.
   - Click **Generate Token**, select your CRM App, check scopes: `ads_management`, `pages_show_list`, `pages_read_engagement`, `pages_manage_ads`, `whatsapp_business_messaging`, `whatsapp_business_management`.
   - Copy the generated permanent token immediately.
5. **Paste into Environment Variables**:
   - Set `META_ACCESS_TOKEN` = Generated permanent token.
   - Set `WHATSAPP_PHONE_NUMBER_ID` = Phone Number ID from Meta API Setup.

---

## 3. Webhook Verification Handshake Settings

Define verification keys to validate incoming platforms:
- **`META_VERIFY_TOKEN`**: Set any secret string (e.g. `crm_meta_secret`). Paste the same secret in Meta Webhooks dashboard verification input.
- **`WHATSAPP_VERIFY_TOKEN`**: Set any secret string (e.g. `crm_whatsapp_secret`). Paste the same secret in WhatsApp Webhooks setup.
- **`GOOGLE_ADS_KEY`**: Set any secret key (e.g. `crm_google_secret`). Paste the same key in Google Ads conversion webhook configuration.
