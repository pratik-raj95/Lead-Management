# Google Ads (Lead Form Extensions) Integration Guide

This guide explains how to connect Google Ads Lead Form extensions to your Antigravity CRM webhook.

---

## 1. Webhook Setup in Google Ads

Google Ads allows you to attach a lead form extension to your Search, Video, or Discovery campaigns. When a user submits this form, Google Ads pushes lead data to your webhook in real-time.

### Ingestion Flow:
```
User Form Submit ──> Google Ads Webhook Event ──> Parse Column Arrays ──> Create CRM Lead
```

### Steps to Register Webhook:
1. In your Google Ads account, click on **Campaigns** -> **Assets** -> **Associations**.
2. Click the plus button and choose **Lead form**.
3. Under the **Webhook integration** section, configure:
   - **Webhook URL**: `https://api.yourdomain.com/api/webhook` (or your public n8n endpoint).
   - **Key**: A secret string of your choice (Google sends this key in the payload to prove authenticity).
4. Click **Send test data** to test your endpoint. Google will send a mock payload containing dummy lead data.

---

## 2. Inbound Google Ads Webhook Payload

Google Ads pushes lead details inside a `user_column_data` array:
```json
{
  "lead_id": "TeStLeAdId12345",
  "user_column_data": [
    {
      "column_name": "Full Name",
      "string_value": "John Doe",
      "column_id": "FULL_NAME"
    },
    {
      "column_name": "Phone Number",
      "string_value": "+19999999999",
      "column_id": "PHONE_NUMBER"
    },
    {
      "column_name": "User Email",
      "string_value": "johndoe@example.com",
      "column_id": "EMAIL"
    }
  ],
  "google_key": "YOUR_SECRET_KEY",
  "adgroup_id": 12345678,
  "creative_id": 87654321
}
```

---

## 3. Parsing Code (Node.js/n8n Example)

To integrate this payload with the CRM, you must check the `google_key` for security, search the `user_column_data` array for the `PHONE_NUMBER` ID, and call `/api/webhook`:

```javascript
app.post('/api/google-ads-inbound', (req, res) => {
  const { google_key, user_column_data } = req.body;

  // 1. Authenticate secret key
  if (google_key !== 'YOUR_SECRET_KEY') {
    return res.status(401).send('Unauthorized');
  }

  // 2. Find phone number field
  const phoneField = user_column_data.find(field => field.column_id === 'PHONE_NUMBER');
  
  if (!phoneField || !phoneField.string_value) {
    return res.status(400).send('Phone number missing');
  }

  // 3. POST to CRM
  fetch('http://localhost:5000/api/webhook', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      phone: phoneField.string_value,
      source: 'google_ads'
    })
  });

  res.status(200).send('Lead Sent to CRM');
});
```
