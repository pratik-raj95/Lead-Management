# n8n Setup and Integration Guide

This guide explains how to design n8n workflows to work with your Antigravity CRM database.

---

## 1. Workflow A: Inbound Leads Ingestion

This workflow captures webhook data from Facebook Leads, Google Ads, or WhatsApp, formats the payload, and sends it directly to the CRM webhook.

### Workflow Diagram
```
[Third-Party Trigger] ──> [Format Payload (Set Source)] ──> [HTTP Request Node]
```

### Steps to Build in n8n:
1. **Trigger Node**: Choose your marketing platform trigger:
   - **Facebook Lead Ads** (Official n8n Node)
   - **Google Sheets** (Row Created)
   - **Webhook** (Custom Webhook Endpoint)
2. **Set/Edit Fields Node (Optional)**: If needed, format the phone number (remove spaces, country codes, or add them) and set the source name:
   - `phone` = `{{ $json.phone_number }}`
   - `source` = `meta_ads` (or `google_ads` / `whatsapp`)
3. **HTTP Request Node**: Add an HTTP Request node configured as:
   - **Method**: `POST`
   - **URL**: `http://<your-crm-ip>:5000/api/webhook`
   - **Send Body**: `true`
   - **Body Content Type**: `JSON`
   - **Specify Body**: `Using Fields Below`
     - Name: `phone`, Value: `{{ $json.phone }}`
     - Name: `source`, Value: `{{ $json.source }}`
4. **Deploy**: Activate the workflow. When the trigger fires, the lead will instantly appear in the **New Leads** stage of the CRM Kanban board.

---

## 2. Workflow B: Daily Follow-Up Notifications

This workflow runs once a day to check which leads are scheduled for follow-up today, and issues external notifications (e.g. via WhatsApp, Email, or Slack).

### Workflow Diagram
```
[Cron Trigger (9 AM)] ──> [HTTP Request (GET /api/notifications)] ──> [Check Count] ──> [Notify Team]
```

### Steps to Build in n8n:
1. **Schedule Trigger**: Add a Schedule Trigger node:
   - **Interval**: `Daily`
   - **Time**: `09:00` (Every morning at 9 AM)
2. **HTTP Request Node**: Query the CRM's notification endpoint:
   - **Method**: `GET`
   - **URL**: `http://<your-crm-ip>:5000/api/notifications`
3. **IF / Router Node**: Check if the response contains items:
   - **Expression**: `{{ $json.length }} > 0`
4. **Loop / Item Node**: Iterate over each returned lead in the JSON array.
5. **Notification Action Node**: Choose an outgoing communication channel:
   - **WhatsApp Node (Twilio or Cloud API)**: Send a message like:
     > 🔔 *CRM Alert:* Follow up is required today for phone number: `{{ $json.phone }}` (Source: `{{ $json.source }}`).
   - **Gmail / Email Node**: Email a daily digest to the sales team.
   - **Slack Node**: Post a message into `#sales-leads`.

---

## 3. Webhook Payload Formats

Keep payload contracts standard:
```json
{
  "phone": "9876543210",
  "source": "meta_ads"
}
```
Valid sources to pass are: `meta_ads`, `google_ads`, and `whatsapp`.
