# API Documentation

This document outlines the API endpoints exposed by the Express.js backend.

## Base URL
By default, the backend runs locally on port `5000`:
```
http://localhost:5000/api
```

---

## 1. CRM Core Endpoints

### Get All Leads
Fetch the list of leads from Google Sheets (or fallback local JSON).
- **URL**: `/leads`
- **Method**: `GET`
- **Success Response (200 OK)**:
  ```json
  [
    {
      "id": "lead_1",
      "name": "John Doe",
      "phone": "9876543210",
      "source": "meta_ads",
      "status": "New Leads",
      "createdDate": "2026-06-30T18:22:05.890Z",
      "lastUpdated": "2026-07-06T12:00:00.000Z",
      "notes": "[2026-07-04] Ingested via Meta Ads Webhook"
    }
  ]
  ```

### Update Lead
Update lead details (status stage, phone, name, follow-up date, notes).
- **URL**: `/leads/:id`
- **Method**: `PUT`
- **Request Body**:
  ```json
  {
    "name": "John Doe",
    "phone": "9876543210",
    "source": "meta_ads",
    "status": "Interested",
    "followUpDate": "2026-07-10"
  }
  ```

### Ingest Webhook (Unified)
Webhook endpoint to create/update leads. Matches phone numbers to prevent duplicates.
- **URL**: `/webhook`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "phone": "9876543210",
    "source": "meta_ads",
    "name": "John Doe"
  }
  ```

---

## 2. Platform Webhook integrations

### Meta Webhook Handshake
- **URL**: `/webhook/meta`
- **Method**: `GET`
- **Query Params**: `hub.mode=subscribe`, `hub.verify_token=crm_meta_token`, `hub.challenge=CHALLENGE_CODE`

### Meta Webhook Ingest
- **URL**: `/webhook/meta`
- **Method**: `POST`

### WhatsApp Webhook Handshake
- **URL**: `/webhook/whatsapp`
- **Method**: `GET`

### WhatsApp Webhook Ingest
- **URL**: `/webhook/whatsapp`
- **Method**: `POST`

### Google Ads Webhook Ingest
- **URL**: `/webhook/google`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "lead_id": "TeStLeAdId12345",
    "google_key": "crm_google_key",
    "user_column_data": [
      {
        "column_id": "PHONE_NUMBER",
        "string_value": "+19876543210"
      }
    ]
  }
  ```

### Send Outgoing WhatsApp Message
- **URL**: `/leads/:id/message`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "message": "Hello from CRM!"
  }
  ```
