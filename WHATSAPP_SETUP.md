# WhatsApp Business API Integration Guide

This guide explains how to connect the WhatsApp Cloud API (WhatsApp Business API) to your Antigravity CRM webhook.

---

## 1. Webhook Setup on Meta Developer Portal

WhatsApp Cloud API runs inside the Meta Developer platform. You can configure a webhook that triggers a POST request to your server whenever a customer sends you a text message.

### Ingestion Flow:
```
Customer WhatsApp Message ──> Meta Webhook ──> Parse Changes Object ──> Extract wa_id ──> Create CRM Lead
```

### Steps to Configure Webhook:
1. Log in to [Meta for Developers Portal](https://developers.facebook.com/).
2. Select your App that has the **WhatsApp** product set up.
3. Click on **WhatsApp** -> **Configuration** in the left sidebar.
4. Click **Edit** next to Webhook configuration:
   - **Callback URL**: `https://api.yourdomain.com/api/webhook` (or your public n8n endpoint).
   - **Verify Token**: A secret string of your choice.
5. Save changes, then click **Manage** under Webhook Fields.
6. Subscribe to the **messages** field.

---

## 2. Inbound WhatsApp Message Webhook Payload

Whenever a customer messages your WhatsApp Business number, Meta fires a payload:
```json
{
  "object": "whatsapp_business_account",
  "entry": [
    {
      "id": "100984812345678",
      "changes": [
        {
          "value": {
            "messaging_product": "whatsapp",
            "metadata": {
              "display_phone_number": "15550199999",
              "phone_number_id": "102834571234567"
            },
            "contacts": [
              {
                "profile": {
                  "name": "Jane Smith"
                },
                "wa_id": "919876543210"
              }
            ],
            "messages": [
              {
                "from": "919876543210",
                "id": "wamid.HBgLOTE5ODc2NTQzMjEwFQIAEhgUM0E5MkQ3NjJCRUEzQTE5QTEwRDMA",
                "timestamp": "1719912000",
                "text": {
                  "body": "Hi, I clicked your ad. Tell me more."
                },
                "type": "text"
              }
            ]
          },
          "field": "messages"
        }
      ]
    }
  ]
}
```

---

## 3. Extracting the Lead Phone Number

To ingest this into the CRM, write a parser to extract the sender's phone number (`wa_id` or `from`) and post it:

```javascript
app.post('/api/whatsapp-inbound', (req, res) => {
  const { body } = req;

  // 1. Verify object structure
  if (body.object === 'whatsapp_business_account') {
    try {
      const entry = body.entry?.[0];
      const change = entry?.changes?.[0];
      const value = change?.value;
      const message = value?.messages?.[0];

      if (message) {
        const phone = message.from; // e.g. "919876543210"
        
        // 2. POST to CRM Webhook
        fetch('http://localhost:5000/api/webhook', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phone: phone,
            source: 'whatsapp'
          })
        });
      }
    } catch (err) {
      console.error('Error parsing WhatsApp payload:', err);
    }
    
    // Always return HTTP 200 to WhatsApp within 3 seconds to avoid retries
    return res.sendStatus(200);
  }
  
  res.sendStatus(404);
});
```
*Note:* The phone number (`from`) contains the sender's country code, e.g., `91` for India, and has no leading `+` or spaces, making it perfect for clean text database searches.
