# n8n Production Workflows Guide

This guide details the five standard automation workflows designed to integrate your CRM with third-party platforms in n8n.

---

## 1. Workflow A: Meta Ads Ingestion
Triggered whenever a prospect submits a Facebook/Instagram Lead Ad form.

### Nodes Configuration:
1. **Facebook Lead Ads Trigger Node**:
   - Connection: Authenticated Meta Account
   - Form: Choose target lead form
2. **HTTP Request Node (Push to CRM)**:
   - Method: `POST`
   - URL: `https://your-crm-backend.com/api/webhook`
   - Content Type: `JSON`
   - Body Parameters:
     - `phone`: `{{ $json.field_data.find(f => f.name === 'phone_number').values[0] }}`
     - `source`: `meta_ads`
     - `name`: `{{ $json.field_data.find(f => f.name === 'full_name').values[0] }}`
     - `notes`: `[Meta Ads] Lead captured via Facebook campaign`

---

## 2. Workflow B: WhatsApp Message Capture
Fires when an incoming message is received on your WhatsApp Business number.

### Nodes Configuration:
1. **Webhook Trigger Node (WhatsApp Callback)**:
   - Path: `/whatsapp-inbox`
   - HTTP Method: `POST`
2. **HTTP Request Node (Push to CRM)**:
   - Method: `POST`
   - URL: `https://your-crm-backend.com/api/webhook/whatsapp`
   - Content Type: `JSON`
   - Body Parameters: pass raw payload received from Meta changes object (the CRM backend has a built-in handler to extract the phone and text).

---

## 3. Workflow C: Google Ads Lead Form Ingestion
Triggered by Google Ads conversion form webhook events.

### Nodes Configuration:
1. **Webhook Trigger Node (Google Ads Hook)**:
   - Path: `/google-leads`
   - HTTP Method: `POST`
2. **HTTP Request Node (Push to CRM)**:
   - Method: `POST`
   - URL: `https://your-crm-backend.com/api/webhook/google`
   - Content Type: `JSON`
   - Headers: Add `google_key` validation parameter
   - Body Parameters: pass raw JSON payload.

---

## 4. Workflow D: Daily Follow-up Reminders
Runs every morning at 9 AM, reads leads due today, and sends notifications (e.g. via Slack/Email/WhatsApp).

### Nodes Configuration:
1. **Schedule Trigger Node**:
   - Interval: `Daily`
   - Time: `09:00`
2. **HTTP Request Node (Get Notifications)**:
   - Method: `GET`
   - URL: `https://your-crm-backend.com/api/notifications`
3. **Loop Over Items**:
   - Loops over the returned lead list array.
4. **Slack/WhatsApp Dispatch Node**:
   - Send notifications to team:
     > 🔔 *Follow-up Alert:* Please contact `{{ $json.name }}` today at `{{ $json.phone }}`.

---

## 5. Workflow E: Duplicate Lead Detection & Merging
Runs on a trigger or hourly cron to scan database entries, locate matching phone numbers, and merge details.

### Nodes Configuration:
1. **HTTP Request Node (Get Leads)**:
   - Method: `GET`
   - URL: `https://your-crm-backend.com/api/leads`
2. **JavaScript Code Node (Deduplication Check)**:
   - Iterates through the list of leads.
   - Identifies any leads sharing the same phone number.
   - Merges their activity notes into a single list and identifies the earliest `createdDate`.
3. **HTTP Request Node (Update Lead)**:
   - If duplicates are found, makes `PUT /api/leads/:id` requests to update the primary lead entry with the merged history logs, and optionally flag duplicates for removal.
