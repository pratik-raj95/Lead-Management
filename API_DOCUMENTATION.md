# API Documentation

This document outlines the API endpoints exposed by the Antigravity CRM Express.js backend.

## Base URL
By default, the backend runs locally on port `5000`:
```
http://localhost:5000/api
```

---

## Endpoints

### 1. Get All Leads
Fetch the entire list of leads stored in the database.

- **URL**: `/leads`
- **Method**: `GET`
- **Auth Required**: None
- **Success Response (200 OK)**:
  ```json
  [
    {
      "id": "lead_1",
      "phone": "9876543210",
      "source": "meta_ads",
      "status": "New Leads",
      "createdDate": "2026-06-30T18:22:05.890Z",
      "followUpDate": null
    },
    {
      "id": "lead_2",
      "phone": "9988776655",
      "source": "whatsapp",
      "status": "Interested",
      "createdDate": "2026-06-28T18:22:05.893Z",
      "followUpDate": "2026-07-02"
    }
  ]
  ```
- **Error Response (500 Internal Server Error)**:
  ```json
  { "error": "Failed to retrieve leads" }
  ```
- **Example cURL**:
  ```bash
  curl -X GET http://localhost:5000/api/leads
  ```

---

### 2. Update Lead
Update specific fields of an existing lead (such as changing its status column or assigning/updating follow-up dates).

- **URL**: `/leads/:id`
- **Method**: `PUT`
- **URL Parameters**: `id` (The unique lead identifier)
- **Request Body**:
  ```json
  {
    "phone": "9988776655",
    "source": "whatsapp",
    "status": "Follow Up",
    "followUpDate": "2026-07-04"
  }
  ```
- **Success Response (200 OK)**:
  ```json
  {
    "id": "lead_2",
    "phone": "9988776655",
    "source": "whatsapp",
    "status": "Follow Up",
    "createdDate": "2026-06-28T18:22:05.893Z",
    "followUpDate": "2026-07-04"
  }
  ```
- **Error Responses**:
  - **404 Not Found**:
    ```json
    { "error": "Lead not found" }
    ```
  - **500 Internal Server Error**:
    ```json
    { "error": "Failed to update lead" }
    ```
- **Example cURL**:
  ```bash
  curl -X PUT -H "Content-Type: application/json" -d "{\"phone\":\"9988776655\",\"source\":\"whatsapp\",\"status\":\"Follow Up\",\"followUpDate\":\"2026-07-04\"}" http://localhost:5000/api/leads/lead_2
  ```

---

### 3. Ingest Webhook (Meta, Google, WhatsApp)
Webhook ingest endpoint used by third-party integrations (like n8n, Meta Graph API, Google Ads Webhook, etc.) to automatically create new leads.

- **URL**: `/webhook`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "phone": "9112233445",
    "source": "google_ads"
  }
  ```
  *Note:* `source` must be one of: `meta_ads`, `google_ads`, or `whatsapp`.
- **Success Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "Lead created successfully",
    "lead": {
      "id": "lead_1783016554031_288",
      "phone": "9112233445",
      "source": "google_ads",
      "status": "New Leads",
      "createdDate": "2026-07-02T18:22:34.031Z",
      "followUpDate": null
    }
  }
  ```
- **Error Responses**:
  - **400 Bad Request**:
    ```json
    { "error": "Phone number is required" }
    ```
    or
    ```json
    { "error": "Invalid source. Must be one of: meta_ads, google_ads, whatsapp" }
    ```
  - **500 Internal Server Error**:
    ```json
    { "error": "Failed to ingest lead via webhook" }
    ```
- **Example cURL**:
  ```bash
  curl -X POST -H "Content-Type: application/json" -d "{\"phone\":\"9112233445\",\"source\":\"google_ads\"}" http://localhost:5000/api/webhook
  ```

---

### 4. Get Today's Notifications
Retrieve leads that have follow-up schedules matching today's date. Used by the dashboard warning system and daily cron workers.

- **URL**: `/notifications`
- **Method**: `GET`
- **Success Response (200 OK)**:
  ```json
  [
    {
      "id": "lead_3",
      "phone": "9123456789",
      "source": "google_ads",
      "status": "Follow Up",
      "createdDate": "2026-06-27T18:22:05.893Z",
      "followUpDate": "2026-07-04"
    }
  ]
  ```
- **Error Response (500 Internal Server Error)**:
  ```json
  { "error": "Failed to retrieve notifications" }
  ```
- **Example cURL**:
  ```bash
  curl -X GET http://localhost:5000/api/notifications
  ```
