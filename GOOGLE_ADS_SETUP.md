# Google Ads Lead Form Webhook Setup

This guide details how to integrate Google Ads Conversion Form extensions with your CRM.

---

## 1. Webhook Settings in Google Ads

1. Log in to your Google Ads Account.
2. Navigate to **Campaigns** -> **Assets** -> **Associations**.
3. Create or select a **Lead Form** extension.
4. Locate the **Webhook integration** section and configure:
   - **Webhook URL**: `https://your-crm-backend.com/api/webhook/google`
   - **Key**: Set a secret key (matches your backend `GOOGLE_ADS_KEY` environment variable).
5. Click **Send test data** to verify connection. The CRM should ingest the test lead instantly.

---

## 2. Payload Structure & Parsing Logic

Google Ads pushes leads inside a `user_column_data` array. The backend endpoint `/api/webhook/google`:
- Authenticates the request by checking if the incoming `google_key` matches your backend `GOOGLE_ADS_KEY`.
- Searches the key-value array for the `PHONE_NUMBER` column ID.
- Sanitizes the number and automatically updates or inserts the contact record in Google Sheets, preserving user details.
