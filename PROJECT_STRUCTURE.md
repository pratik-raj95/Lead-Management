# Project Structure Documentation

This document describes the structure and organization of the Antigravity CRM project. The workspace is divided into two separate applications: `frontend` (React + Vite) and `backend` (Express.js).

---

## Workspace Layout

```
CRM/
├── frontend/                   # Client-Side Application (React.js + Vite)
│   ├── public/                 # Static asset directories
│   ├── src/                    # React source root
│   │   ├── api/
│   │   │   └── crmApi.js       # Client API library (fetch-based with WhatsApp outbox)
│   │   ├── components/
│   │   │   ├── KanbanBoard.jsx # Kanban pipeline grid controller
│   │   │   ├── LeadCard.jsx    # Lead card component showing Name & Phone
│   │   │   └── LeadModal.jsx   # Two-column modal (Form, Timeline log, WhatsApp Outbox)
│   │   ├── hooks/
│   │   │   └── useLeads.js     # Global state engine, polling, & optimistic UI updates
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx   # Overview metrics, alarms, & webhook simulators
│   │   │   ├── Login.jsx       # SaaS-style login and session auto-logout component
│   │   │   └── Pipeline.jsx    # Kanban page wrapper
│   │   ├── utils/
│   │   │   └── dateFormatter.js# String date conversion utilities
│   │   ├── App.css             # Component-level styles
│   │   ├── App.jsx             # Main routing shell
│   │   ├── index.css           # Global layout styling (Tailwind imports)
│   │   └── main.jsx            # Entry point mounting React DOM
│   ├── .env                    # Local environment config (VITE_API_URL)
│   ├── .env.example            # Environment variables template
│   ├── .gitignore              # Client specific git exclude rules
│   ├── index.html              # Core Vite HTML document wrapper
│   ├── package.json            # Client package dependencies
│   ├── postcss.config.js       # Styles postprocessor config
│   ├── tailwind.config.js      # Utility-first styles configuration
│   ├── vercel.json             # Vercel single-page router fallback rules
│   └── vite.config.js          # Vite compiler settings
│
├── backend/                    # Server-Side Application (Express.js API Node)
│   ├── config/
│   │   └── googleSheets.js     # Google Sheets JWT connection configuration
│   ├── controllers/            # Route business logic handlers
│   │   ├── authController.js   # JWT sign, login authentication endpoints
│   │   └── leadController.js   # Lead, Meta verification, WhatsAppCloud hooks, & Google Ads webhook
│   ├── data/                   # Fallback database files
│   │   ├── activity_db.json    # Local activity history fallback json database
│   │   └── db.json             # Backup fallback local JSON database
│   ├── middleware/             # Express mid-route filters
│   │   ├── auth.js             # Token verification and JWT protection
│   │   └── logger.js           # Logger middleware
│   ├── routes/                 # Endpoint path routing configuration
│   │   └── apiRoutes.js        # Express paths mapping
│   ├── services/               # Integrations API services
│   │   ├── googleSheetService.js # Google sheets core operation functions
│   │   ├── metaService.js      # Meta Graph API fetch service
│   │   └── whatsappService.js  # WhatsApp Cloud API messaging service
│   ├── utils/
│   │   └── .gitkeep            # Utilities placeholder
│   ├── .env                    # Backend environment config (PORT, Google Keys)
│   ├── .env.example            # Backend env template
│   ├── .gitignore              # Server specific git exclude rules
│   ├── db.js                   # Alternative fallback JSON database layer
│   ├── package.json            # Server package dependencies
│   ├── render.yaml             # Render deployment configuration parameters
│   └── server.js               # Express application listener startup
│
├── .env.example                # Root environment variables template
├── .gitignore                  # Root Git ignore rules
├── .oxlintrc.json              # Oxlint lint rules config
├── DEPLOYMENT_CHECKLIST.md     # Pre-flight deployment checklist
├── DEPLOYMENT_GUIDE.md         # Multi-platform deployment handbook
├── README.md                   # CRM user manual & installation guide
└── vercel.json                 # Vercel deployment settings for monorepo redirects
```

---

## Architectural Separation & Communication

1. **Decoupled Repositories**: The `frontend/` and `backend/` folders contain their own distinct `package.json` manifests. Neither depends on the other's environment to build or run.
2. **Environment Variables**: The React app communicates with the server via the `VITE_API_URL` environment variable. In `frontend/src/api/crmApi.js`, the base URL resolves to:
   ```javascript
   const url = import.meta.env.VITE_API_URL || 'http://localhost:5000';
   const API_BASE = url.endsWith('/api') ? url : `${url}/api`;
   ```
3. **Data Flow**:
   - Webhook calls (Meta Ads, Google Ads, WhatsApp Business) hit the backend `/api/webhook/meta`, `/api/webhook/google`, `/api/webhook/whatsapp`.
   - The backend controllers process the payloads and store data inside **Google Sheets** (or local JSON backup if sheets are unconfigured).
   - If a duplicate lead phone number arrives, the CRM updates the row and appends to the Notes timeline, preventing duplicates.
   - The frontend's `useLeads` hook automatically queries `/api/leads` on a 4-second polling timer, causing any new webhook-created leads to appear in the dashboard and Kanban board.
