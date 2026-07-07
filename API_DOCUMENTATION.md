# API Endpoints Documentation

All requests should be sent to the API root base URL. Locally, this defaults to:
`http://localhost:5000/api`

---

## 1. Authentication Endpoints

### Login
* **Method**: `POST`
* **Path**: `/login`
* **Access**: Public
* **Request Body**:
  ```json
  {
    "username": "admin",
    "password": "Admin@123"
  }
  ```
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "username": "admin",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```

---

## 2. Lead Management Endpoints (Protected - JWT Required)

For all protected routes, you must send the retrieved token in the authorization header:
`Authorization: Bearer <JWT_TOKEN>`

### Get All Leads
* **Method**: `GET`
* **Path**: `/leads`
* **Response (200 OK)**:
  ```json
  [
    {
      "id": "lead_1688647100000_482",
      "name": "John Doe",
      "phone": "9876543210",
      "source": "meta_ads",
      "status": "New Leads",
      "followUpDate": "2026-07-10",
      "createdDate": "2026-07-07T12:00:00.000Z",
      "lastUpdated": "2026-07-07T12:00:00.000Z",
      "notes": "Follow up scheduled."
    }
  ]
  ```

### Update Lead Details
* **Method**: `PUT`
* **Path**: `/leads/:id`
* **Request Body**:
  ```json
  {
    "name": "John Doe",
    "phone": "9876543210",
    "source": "meta_ads",
    "status": "Interested",
    "followUpDate": "2026-07-15",
    "notes": "Discussed details."
  }
  ```
* **Response (200 OK)**: Returns the updated lead object.

### Delete Lead
* **Method**: `DELETE`
* **Path**: `/leads/:id`
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Lead deleted successfully"
  }
  ```

### Get Today's Follow-up Alerts
* **Method**: `GET`
* **Path**: `/notifications`
* **Response (200 OK)**: Returns an array of lead objects whose follow-up dates match today's date.

### Get Lead Activity Timeline
* **Method**: `GET`
* **Path**: `/leads/:id/timeline`
* **Response (200 OK)**:
  ```json
  [
    {
      "activityId": "act_1688647200000_152",
      "leadId": "lead_1688647100000_482",
      "phone": "9876543210",
      "activityType": "Status Changed",
      "oldValue": "New Leads",
      "newValue": "Interested",
      "description": "Pipeline stage moved from New Leads to Interested",
      "performedBy": "System",
      "timestamp": "2026-07-07T12:05:00.000Z"
    }
  ]
  ```

### Dispatch Outbound WhatsApp Message
* **Method**: `POST`
* **Path**: `/leads/:id/message`
* **Request Body**:
  ```json
  {
    "message": "Hello from LeadFlow CRM! We received your inquiry."
  }
  ```
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "lead": { ... }
  }
  ```

---

## 3. Webhook Callback Endpoints (Public)

These routes are kept public to allow third-party marketing services to deliver leads automatically.

### Unified Ingestion Webhook
* **Method**: `POST`
* **Path**: `/webhook`
* **Request Body**:
  ```json
  {
    "phone": "+1 (555) 019-2834",
    "source": "meta_ads",
    "name": "Jane Miller",
    "followUpDate": "2026-07-20",
    "notes": "Interested in pricing plan."
  }
  ```
* **Response (201 Created)**: Returns the newly created lead object.
* **Response (200 OK - Duplicate Match)**: Returns the existing lead object with updated note details.

### Meta Lead Ads Webhook
* **Method**: `GET` (verification check) / `POST` (event notification payload)
* **Path**: `/webhook/meta`

### WhatsApp Cloud API Webhook
* **Method**: `GET` (verification check) / `POST` (event notification payload)
* **Path**: `/webhook/whatsapp`

### Google Ads Lead Forms Webhook
* **Method**: `POST`
* **Path**: `/webhook/google`
