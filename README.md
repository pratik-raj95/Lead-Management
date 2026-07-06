# Antigravity CRM | Webhook-Driven Lead Management System

Antigravity CRM is a lightweight, high-performance, and responsive single-page application built specifically for businesses running online marketing campaigns. It aggregates inbound lead events from Meta Ads, Google Ads, and WhatsApp into a central Kanban pipeline.

---

## Table of Contents
1. [Project Overview](#1-project-overview)
2. [Features](#2-features)
3. [Folder Structure](#3-folder-structure)
4. [Technologies Used](#4-technologies-used)
5. [Installation Steps](#5-installation-steps)
6. [Environment Variables](#6-environment-variables)
7. [How to Run Frontend](#7-how-to-run-frontend)
8. [How to Run Backend](#8-how-to-run-backend)
9. [How to Connect Google Sheets](#9-how-to-connect-google-sheets)
10. [How to Connect n8n](#10-how-to-connect-n8n)
11. [How to Connect Meta Ads](#11-how-to-connect-meta-ads)
12. [How to Connect WhatsApp Business API](#12-how-to-connect-whatsapp-business-api)
13. [How to Connect Google Ads](#13-how-to-connect-google-ads)
14. [API Documentation](#14-api-documentation)
15. [Webhook Payload Examples](#15-webhook-payload-examples)
16. [Project Architecture](#16-project-architecture)
17. [Database Structure](#17-database-structure)
18. [Deployment Guide](#18-deployment-guide)
19. [Troubleshooting Guide](#19-troubleshooting-guide)
20. [Future Improvements](#20-future-improvements)

---

## 1. Project Overview
Antigravity CRM serves as a central clearinghouse for automated lead generation. Instead of manually inputting contacts, leads are automatically created when marketing platforms trigger outbound webhook calls (processed locally or via n8n). This ensures instant notification, visual tracking in a Kanban pipeline, and timely follow-ups.

## 2. Features
- **Live CRM Dashboard**: Interactive layout detailing pipeline metrics (Total, Interested, Not Interested, Active Follow-Ups).
- **Kanban Stage Pipeline**: Drag-and-drop leads between *New Leads*, *Interested*, *Not Interested*, and *Follow Up*.
- **Live Notifications Area**: Displays daily follow-ups directly on the dashboard.
- **Webhook Simulator**: Test integration directly from the UI with clickable Meta, Google, and WhatsApp simulation flows.
- **Zero-Config Database**: Local JSON storage that auto-creates and seeds files.
- **Mobile Responsive Design**: Optimizes layout with a side navigation bar on desktop and a tab navigation bar on mobile.

## 3. Folder Structure
```
CRM/
├── backend/
│   ├── data/
│   │   └── db.json          # File database (seeding fallback)
│   ├── db.js                # Core memory-cached JSON DB controller
│   ├── package.json         # Backend manifest
│   └── server.js            # Express application entry
├── src/
│   ├── api/
│   │   └── crmApi.js        # Frontend client using fetch
│   ├── components/
│   │   ├── KanbanBoard.jsx  # Drag-and-drop stage controller
│   │   ├── LeadCard.jsx     # Card rendering (drag start, source icons)
│   │   └── LeadModal.jsx    # Follow-up scheduling form modal
│   ├── hooks/
│   │   └── useLeads.js      # Polling hook with optimistic UI updating
│   ├── pages/
│   │   ├── Dashboard.jsx    # Metrics, charts, simulations, & alarms
│   │   └── Pipeline.jsx     # Kanban Board screen view wrapper
│   ├── utils/
│   │   └── dateFormatter.js # Date formatting & comparisons
│   ├── App.jsx              # App layout shell
│   ├── index.css            # Tailwind directive imports
│   └── main.jsx             # React mount node
├── index.html               # Vite document template
├── package.json             # Root workspace package manifest
├── postcss.config.js        # PostCSS configuration
├── tailwind.config.js       # Tailwind CSS v3 layout variables
└── vite.config.js           # Vite server settings
```

## 4. Technologies Used
- **Frontend**: React.js (Vite), Tailwind CSS v3, Lucide React (Icons)
- **Backend**: Node.js, Express.js, CORS
- **Database**: Local JSON File I/O (Database Engine)
- **Deployment & Automation**: n8n, Meta Graph API, Google Ads developer API, WhatsApp Business API

## 5. Installation Steps
Clone or open the workspace folder, then follow these steps:
```bash
# 1. Install frontend and build packages
npm install

# 2. Install backend Express package dependencies
cd backend
npm install
cd ..
```

## 6. Environment Variables
The application relies on standard local configs. If deploying to cloud hosting, configure:
- `PORT`: (Backend) Port to bind Express (default: `5000`).
- `VITE_API_URL`: (Frontend) Base URL for API requests (default: `http://localhost:5000/api`).

## 7. How to Run Frontend
To launch the Vite React dev server at `http://localhost:5173`:
```bash
npm run dev
```

## 8. How to Run Backend
To start the Express server at `http://localhost:5000`:
```bash
npm run server
```

## 9. How to Connect Google Sheets
To sync CRM leads directly to Google Sheets:
1. In Google Cloud Console, enable the **Google Sheets API**.
2. Create a Service Account, generate a JSON Key file, and note its email address.
3. Share your target Google Sheet with that email address.
4. Modify `backend/db.js` to initialize the `google-spreadsheet` npm package with service account credentials, writing edits to both `db.json` and the Google Sheet sheet rows.

## 10. How to Connect n8n
To stream leads from n8n into Antigravity CRM:
1. Create a new workflow in n8n.
2. Add a webhook trigger (e.g., from Meta Lead Ads).
3. Insert an **HTTP Request** node at the end.
4. Set URL to `http://<your-backend-ip>:5000/api/webhook`, Method to `POST`, and Content-Type to `application/json`.
5. Map parameters to JSON:
   ```json
   {
     "phone": "={{ $json.phone }}",
     "source": "meta_ads"
   }
   ```

## 11. How to Connect Meta Ads
1. Register on [Meta for Developers](https://developers.facebook.com/).
2. Create a App, choose **Use Case: Lead Generation**, and configure Webhooks.
3. Point Meta's webhook to your public Express API (e.g., proxied via ngrok) or an n8n webhook URL.
4. Validate verification tokens, subscribe to `leadgen` events, and map fields to extract phone number data.

## 12. How to Connect WhatsApp Business API
1. Set up WhatsApp Cloud API inside your Meta App.
2. Set your webhook to listen to `messages` events.
3. Parse the incoming payload from WhatsApp's API:
   ```json
   {
     "entry": [{
       "changes": [{
         "value": { "messages": [{ "from": "9876543210" }] }
       }]
     }]
   }
   ```
4. extract the `from` phone number and POST it to `http://localhost:5000/api/webhook` with `source: "whatsapp"`.

## 13. How to Connect Google Ads
1. Request a **Developer Token** from your Google Ads Manager Account API Center.
2. Inside Google Ads, navigate to **Conversions** -> **Upload Conversions** -> **Webhooks**.
3. Create a lead-form conversion asset, inserting your webhook URL and a secret key.
4. Parse Google's webhook parameters, extract the phone number, and POST it to `http://localhost:5000/api/webhook` with `source: "google_ads"`.

## 14. API Documentation
See `API_DOCUMENTATION.md` for full details. Briefly:
- `GET /api/leads`: Fetch leads list.
- `PUT /api/leads/:id`: Edit details.
- `POST /api/webhook`: Create a lead.
- `GET /api/notifications`: Get today's follow-ups.

## 15. Webhook Payload Examples
```json
// POST /api/webhook
{
  "phone": "9999999999",
  "source": "google_ads"
}
```

## 16. Project Architecture
The system follows a lightweight client-server architecture. The backend manages state in memory with immediate JSON writes. The frontend leverages React Hooks for client-side state and performs optimistic updates before syncing with backend APIs over HTTP.

## 17. Database Structure
Stored in `backend/data/db.json` as an array of objects:
```json
{
  "id": "lead_12345",
  "phone": "9876543210",
  "source": "meta_ads",
  "status": "New Leads",
  "createdDate": "2026-07-02T18:22:24.121Z",
  "followUpDate": "2026-07-04"
}
```

## 18. Deployment Guide
See `DEPLOYMENT_GUIDE.md` for detailed instructions on PM2, Vercel, and reverse proxy settings.

## 19. Troubleshooting Guide
- **CORS Errors**: Ensure backend `server.js` imports and applies `cors()` middleware correctly.
- **Port Conflicts**: If port `5000` or `5173` is occupied, start using `PORT=5001 npm run server` or change ports in `vite.config.js`.
- **Drag-and-Drop Problems**: Verify HTML5 drag-and-drop permissions. Some browsers block drag events on text selections.

## 20. Future Improvements
- Add OAuth2 Google Calendar sync.
- Incorporate historical logs showing lead stage transitions.
- Integrate WebSockets for instantaneous, low-overhead UI pushes.
