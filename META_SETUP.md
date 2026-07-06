# Meta Ads (Facebook Lead Ads) Integration Guide

This guide explains how to connect Facebook Lead Ads to your Antigravity CRM webhook.

---

## 1. Webhook Setup on Meta for Developers

For security and privacy, Meta does **not** send lead form answers (like phone numbers) directly inside the webhook payload. Instead, Meta sends a `leadgen_id`. Your backend or n8n workflow must use this ID to query the Meta Graph API.

### Ingestion Flow:
```
Meta Lead Event ──> Webhook Endpoint ──> Graph API Query (with Token) ──> Extract Phone ──> Create CRM Lead
```

### Steps to Register Webhook:
1. Log in to [Meta for Developers Portal](https://developers.facebook.com/).
2. Create or select a Business App.
3. Under **Products**, add **Webhooks**.
4. Select **Page** from the dropdown menu and click **Subscribe to this topic**.
5. Configure subscription details:
   - **Callback URL**: `https://api.yourdomain.com/api/webhook` (or your public n8n endpoint).
   - **Verify Token**: A secret string of your choice (must match what your server expects).
6. Subscribe to the `leadgen` field.

---

## 2. Server Webhook Verification (Handshake)

Meta will send a `GET` request to your callback URL with query parameters to verify your endpoint:
```
GET /api/webhook?hub.mode=subscribe&hub.challenge=1158201444&hub.verify_token=my_secret_token
```
*Note:* If you are using a custom endpoint, you must return the `hub.challenge` value back to Facebook. Our Express backend uses `POST /api/webhook` for ingestion; if you want to receive direct Meta handshakes, you can add a simple `GET /api/webhook` endpoint:
```javascript
app.get('/api/webhook', (req, res) => {
  const verifyToken = 'YOUR_SECRET_TOKEN';
  if (req.query['hub.mode'] === 'subscribe' && req.query['hub.verify_token'] === verifyToken) {
    res.send(req.query['hub.challenge']);
  } else {
    res.sendStatus(400);
  }
});
```

---

## 3. Retrieving the Lead via Graph API

Once verified, Meta will send a `POST` request to your webhook whenever a lead is generated:
```json
{
  "object": "page",
  "entry": [
    {
      "id": "PAGE_ID",
      "time": 1719912000,
      "changes": [
        {
          "field": "leadgen",
          "value": {
            "ad_id": "AD_ID",
            "form_id": "FORM_ID",
            "leadgen_id": "LEADGEN_ID",
            "created_time": 1719912000
          }
        }
      ]
    }
  ]
}
```

### Fetching Details (HTTP GET):
To retrieve the phone number, invoke the Graph API:
- **URL**: `https://graph.facebook.com/v19.0/{LEADGEN_ID}`
- **Headers**: `Authorization: Bearer <PAGE_ACCESS_TOKEN>`
- **Query Params**: `fields=field_data`

### Response Payload:
```json
{
  "id": "LEADGEN_ID",
  "created_time": "2026-07-02T18:22:24+0000",
  "field_data": [
    {
      "name": "phone_number",
      "values": [
        "+19876543210"
      ]
    }
  ]
}
```
Extract `+19876543210` and send a `POST` request to `/api/webhook` with `phone` and `source: "meta_ads"`.
