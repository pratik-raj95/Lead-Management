# WhatsApp Business Cloud API Configuration Guide

This guide details how to configure WhatsApp Cloud API webhooks and get credentials to send/receive messages.

---

## 1. Subscribing to WhatsApp Webhooks

1. Log in to [Meta for Developers Portal](https://developers.facebook.com/).
2. Select your App, and add **WhatsApp** to products.
3. Under **WhatsApp** -> **Configuration**:
   - **Callback URL**: `https://your-crm-backend.com/api/webhook/whatsapp`
   - **Verify Token**: (Matches your backend `WHATSAPP_VERIFY_TOKEN` env value)
4. Save and click **Manage** under Webhooks Fields, then subscribe to **messages**.

---

## 2. Copying WhatsApp ID Credentials

Inside the **WhatsApp** -> **API Setup** panel, locate and copy:
- **Phone Number ID** (e.g. `102834571234567`) -> Set as `WHATSAPP_PHONE_NUMBER_ID` in your backend environment variables.
- **WhatsApp Business Account ID** (e.g. `100984812345678`).

---

## 3. Webhook Handling Logic

When WhatsApp fires a message payload:
- The backend `/api/webhook/whatsapp` endpoint receives the JSON, parses the values, extracts the sender's phone number and message body text.
- It validates the format and automatically updates or creates the lead record in Google Sheets, logging the message body in the Activity History.
- You can reply or message the contact directly from the edit lead details modal in your dashboard, calling the backend message dispatch service.
