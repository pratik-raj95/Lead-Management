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
│   │   │   └── crmApi.js       # Client client library (fetch-based)
│   │   ├── components/
│   │   │   ├── KanbanBoard.jsx # Kanban pipeline grid controller
│   │   │   ├── LeadCard.jsx    # Lead card component with HTML5 drag
│   │   │   └── LeadModal.jsx   # Details viewer and date editor modal
│   │   ├── hooks/
│   │   │   └── useLeads.js     # Global state engine, polling, & optimistic UI updates
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx   # Overview metrics, alarms, & webhook simulators
│   │   │   └── Pipeline.jsx    # Kanban page wrapper
│   │   ├── utils/
│   │   │   └── dateFormatter.js# String date conversion utilities
│   │   ├── App.jsx             # Main routing shell
│   │   ├── index.css           # Global layout styling (Tailwind imports)
│   │   └── main.jsx            # Entry point mounting React DOM
│   ├── .env                    # Local environment config (VITE_API_URL)
│   ├── .env.example            # Environment variables template
│   ├── .gitignore              # Client specific git exclude rules
│   ├── index.html              # Core Vite markup page template
│   ├── package.json            # Client package dependencies
│   ├── postcss.config.js       # Styles postprocessor config
│   ├── tailwind.config.js      # Utility-first styles configuration
│   ├── vercel.json             # Vercel single-page router fallback rules
│   └── vite.config.js          # Vite compiler settings
│
├── backend/                    # Server-Side Application (Express.js API Node)
│   ├── controllers/            # Route business logic handlers
│   │   └── leadController.js   # Controllers for GET, PUT, & webhook triggers
│   ├── data/                   # Database files
│   │   └── db.json             # Cached file database
│   ├── middleware/             # Express mid-route filters
│   │   └── logger.js           # Logger middleware
│   ├── routes/                 # Endpoint path routing configuration
│   │   └── apiRoutes.js        # Express paths mapping
│   ├── utils/                  # Backend utilities (placeholder)
│   ├── .env.example            # Backend env template (PORT)
│   ├── .gitignore              # Server specific git exclude rules
│   ├── db.js                   # Node JSON database file reader/writer
│   ├── package.json            # Server package dependencies
│   ├── render.yaml             # Render deployment configuration parameters
│   └── server.js               # Express application listener startup
│
├── backup/                     # Safety backup archive folder
│   ├── src/                    # Pre-refactoring React files
│   ├── public/                 # Pre-refactoring assets
│   ├── backend_src/            # Pre-refactoring backend server files
│   └── ...
│
├── .gitignore                  # Root Git ignore rules
├── DEPLOYMENT_GUIDE.md         # Multi-platform deployment handbook
├── PROJECT_STRUCTURE.md        # Folder structure documentation (this file)
└── README.md                   # CRM user manual & installation guide
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
   - Webhook calls (Meta Ads, Google Ads, WhatsApp Business) hit the backend `/api/webhook` route.
   - The backend controller (`backend/controllers/leadController.js`) stores the lead in `backend/data/db.json` and updates the in-memory database instance.
   - The frontend's `useLeads` hook automatically queries `/api/leads` on a 4-second polling timer, causing any new webhook-created leads to appear in the dashboard and Kanban board instantaneously.
