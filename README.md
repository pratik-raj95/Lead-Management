# LeadFlow CRM | Webhook-Driven Lead Management System

LeadFlow CRM is a decoupled, high-performance, and responsive lead pipeline manager designed specifically for businesses running online marketing campaigns. It aggregates inbound lead events from Meta Ads, Google Ads, and WhatsApp into a central Kanban pipeline, protected by a secure Admin Authentication system.

---

## 1. Project Overview
LeadFlow CRM uses a decoupled, two-tier architecture:
- **Frontend**: A client-side React single-page app built with Vite, styled with Tailwind CSS, and protected by a premium Login card.
- **Backend**: A standalone Node.js and Express.js REST API that connects to Google Sheets (or fallback local JSON), secures core endpoints with JWT validation, and ingests third-party webhooks.

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
│   ├── config/               # Google Sheets configuration properties
│   ├── controllers/          # Business logic controllers (Leads, Timeline, Auth)
│   ├── routes/               # Express routing tables
│   ├── middleware/           # Request logging & JWT validation filters
│   ├── services/             # Google Sheets DB client, Meta Ads & WhatsApp dispatchers
│   ├── data/                 # Local JSON database fallback
│   ├── .env.example          # Server environment template
│   ├── package.json          # Express-only dependencies
│   └── ...
│
├── README.md                 # CRM introduction (this file)
├── LOGIN_SETUP.md            # Authentication setup handbook
├── CLIENT_SETUP_GUIDE.md     # Client API keys configuration guide
├── GOOGLE_SHEETS_SETUP.md    # Google Sheets setup & column layout specifications
├── LEAD_HISTORY.md           # Lead History & Activity Timeline logging rules
└── API_DOCUMENTATION.md      # REST API endpoints mapping table
```

---

## 3. Database Architecture (Google Sheets & Local Fallback)

The CRM utilizes **Google Sheets** as its primary database.
* **Sheet 1 (`Sheet1`)**: Houses active contact records, sources, and pipeline stages.
* **Sheet 2 (`Sheet2`)**: Houses a chronological transaction ledger capturing lead activities (creations, drag-and-drop moves, updates, merged duplicates, and outgoing WhatsApp messages).

### Fallback Database:
If Google credentials are not set, the API automatically falls back to local storage:
- Leads are cached in `backend/data/db.json`
- Activities are cached in `backend/data/activity_db.json`

---

## 4. Duplicate Prevention

The database enforces unique phone numbers:
* **Duplicate Merged**: If a webhook receives a lead whose phone number already exists, the CRM **updates** the existing row (adding new notes and updates sources) instead of inserting a duplicate row, and logs a `Duplicate Merged` activity to the timeline.

---

## 5. Security & Authentication

The CRM includes a secure Admin Authentication System:
* **Default Credentials**: Username `admin`, Password `Admin@123`
* **Session Persistence**: Secured via JWT session tokens cached in `sessionStorage` (cleared on tab close).
* **Enterprise Auto Logout**: Clears tokens and redirects if inactive for **30 minutes**.
* **Protected Routes**: Secure endpoints (getting leads, updating card details, deleting leads, sending messages, and fetching activity timelines) require a valid token header. Webhooks remain public.

---

## 6. Installation & Run Steps

Install dependencies for both folders:

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
*Note: The server uses a fail-fast port collision check.*

### Start the Frontend Dev Server (Port 5173)
```bash
cd frontend
npm run dev
```
Open `http://localhost:5173/` in your browser.
