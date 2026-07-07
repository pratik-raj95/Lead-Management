# Antigravity CRM | Webhook-Driven Lead Management System

Antigravity CRM is a lightweight, high-performance, and responsive lead pipeline manager designed specifically for businesses running online marketing campaigns. It aggregates inbound lead events from Meta Ads, Google Ads, and WhatsApp into a central Kanban pipeline, protected by a secure Admin Authentication system.

---

## 1. Project Overview
Antigravity CRM is refactored into a decoupled, two-tier architecture:
- **Frontend**: A client-side React single-page app built with Vite, styled with Tailwind CSS, and protected by a premium Login card.
- **Backend**: A standalone Node.js and Express.js REST API that connects to Google Sheets (or fallback local JSON), secures endpoints with JWT validation, and ingests third-party webhooks.

---

## 2. Folder Structure
```
CRM/
├── frontend/                 # Client React SPA App (Vite + Tailwind)
│   ├── src/                  # React source components, page views, and hooks
│   ├── public/               # HTML template assets & Netlify redirects
│   ├── .env.example          # Client environment template
│   ├── package.json          # React-only dependencies
│   ├── tailwind.config.js    # Tailwind configuration
│   └── ...
│
├── backend/                  # REST API server app (Express.js)
│   ├── controllers/          # Business logic endpoint controllers (Leads & Auth)
│   ├── routes/               # Express routing tables
│   ├── middleware/           # Request logging & JWT validation filters
│   ├── services/             # Integrations (Meta Graph, WhatsApp Cloud)
│   ├── .env.example          # Server environment template
│   ├── package.json          # Express-only dependencies (including bcryptjs)
│   └── ...
│
├── README.md                 # User instructions (this file)
├── LOGIN_SETUP.md            # Authentication setup handbook
├── CLIENT_SETUP_GUIDE.md     # Client API keys configuration guide
└── DEPLOYMENT_CHECKLIST.md   # Pre-flight deployment checklist
```

---

## 3. Technologies Used
- **Frontend**: React.js (Vite), Tailwind CSS v3, Lucide React (Icons).
- **Backend**: Node.js, Express.js, JSON Web Tokens (`jsonwebtoken`), password hashing (`bcryptjs`), Google APIs client (`googleapis`).
- **Database**: Google Sheets API integration (falls back to local JSON on credential absence).

---

## 4. Admin Authentication

The CRM includes a secure, production-ready Admin Authentication System:
* **Default Admin Username**: `admin`
* **Default Admin Password**: `Admin@123`
* **Session Persistence**: Secured via JWT session tokens cached in `sessionStorage` (which persists across browser refreshes but is immediately cleared on tab close, fulfilling "No localStorage dependency").
* **Enterprise Auto Logout**: The client tracks interactions (mouse moves, clicks, scrolls, keyboard inputs, and screen touches). If a user is inactive for **30 minutes**, the CRM automatically terminates the session, clears all tokens, and redirects the user to the Login page.

To learn how to customize admin credentials, secret keys, and JWT scopes, review [LOGIN_SETUP.md](file:///c:/Users/prati/OneDrive/Desktop/CRM/LOGIN_SETUP.md).

---

## 5. Installation & Run Steps

Clone or extract this project, then install dependencies for both applications:

```bash
# 1. Install frontend React dependencies
cd frontend
npm install
cd ..

# 2. Install backend Express dependencies
cd backend
npm install
cd ..
```

### Start the Backend Server (Port 5000)
```bash
cd backend
npm start
```
*Note: The server uses a fail-fast port collision check. If port 5000 is occupied, it logs a warning and exits, avoiding silently changing ports which would break webhook payloads.*

### Start the Frontend Dev Server (Port 5173)
```bash
cd frontend
npm run dev
```
Open `http://localhost:5173/` in your browser.

---

## 6. API Endpoints

### Public Endpoints (Integration Webhooks)
- **`POST /api/login`**: Authenticate administrator credentials and retrieve JWT.
- **`POST /api/webhook`**: Unified webhook endpoint to create leads.
- **`GET/POST /api/webhook/meta`**: Meta Ads webhook subscription & lead verification.
- **`GET/POST /api/webhook/whatsapp`**: WhatsApp Cloud API verification & inbound message capture.
- **`POST /api/webhook/google`**: Google Ads Conversion form ingestion.

### Protected Endpoints (Requires `Authorization: Bearer <JWT>`)
- **`GET /api/leads`**: Retrieve all leads.
- **`PUT /api/leads/:id`**: Update a lead's stage or follow-up details.
- **`DELETE /api/leads/:id`**: Delete a lead.
- **`GET /api/notifications`**: Retrieve leads requiring follow-up today.
- **`POST /api/leads/:id/message`**: Send outbound WhatsApp template message to a lead.
