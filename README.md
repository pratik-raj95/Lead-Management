# Antigravity CRM | Webhook-Driven Lead Management System

Antigravity CRM is a lightweight, high-performance, and responsive lead pipeline manager designed specifically for businesses running online marketing campaigns. It aggregates inbound lead events from Meta Ads, Google Ads, and WhatsApp into a central Kanban pipeline.

---

## 1. Project Overview
Antigravity CRM is refactored into a decoupled, two-tier architecture:
- **Frontend**: A client-side React single-page app built with Vite, styled with Tailwind CSS, and optimized for both desktop and mobile layouts.
- **Backend**: A standalone Node.js and Express.js REST API that ingests third-party webhooks, manages persistent local JSON lead files, and calculates alerts.

---

## 2. Folder Structure
```
CRM/
├── frontend/                 # Client React SPA App (Vite + Tailwind)
│   ├── src/                  # React source components, page views, and hooks
│   ├── public/               # HTML template assets
│   ├── .env.example          # Client environment template
│   ├── package.json          # React-only dependencies
│   ├── tailwind.config.js    # Tailwind configuration
│   ├── vercel.json           # Vercel SPA rewrite fallback configuration
│   └── ...
│
├── backend/                  # REST API server app (Express.js)
│   ├── controllers/          # Business logic endpoint controllers
│   ├── routes/               # Express routing tables
│   ├── middleware/           # HTTP Request logging filter
│   ├── data/                 # JSON database storage
│   ├── .env.example          # Server environment template
│   ├── package.json          # Express-only dependencies
│   ├── render.yaml           # Render deployment configuration parameters
│   └── ...
│
├── README.md                 # User instructions (this file)
└── .gitignore                # Root git exclusion rules
```

---

## 3. Technologies Used
- **Frontend**: React.js (Vite), Tailwind CSS v3, Lucide React (Icons).
- **Backend**: Node.js, Express.js, CORS middleware.
- **Database**: Memory-cached JSON Database manager.

---

## 4. Installation Steps

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

---

## 5. Local Development

To run the application locally, you must launch both servers.

### Start the Backend Server (Port 5000)
```bash
cd backend
npm start
```
*Note: If port 5000 is occupied by another application, the backend will log a warning and automatically bind to the next available port (e.g., 5001, 5002, etc.).*

### Start the Frontend Dev Server (Port 5173)
```bash
cd frontend
npm run dev
```
Open `http://localhost:5173/` in your browser.

---

## 6. Environment Variables

### Frontend (`frontend/.env`)
Create a `.env` file in the `frontend/` directory:
```
VITE_API_URL=http://localhost:5000
```

### Backend (`backend/.env` - optional)
Create a `.env` file in the `backend/` directory:
```
PORT=5000
```

---

## 7. Frontend Commands (run inside `frontend/`)
- `npm run dev`: Launch Vite local dev server.
- `npm run build`: Compile bundle for production (outputs static files to `dist/`).
- `npm run preview`: Preview the compiled production build locally.
- `npm run lint`: Run code syntax checking.

## 8. Backend Commands (run inside `backend/`)
- `npm start`: Launch API server via node.
- `npm run dev`: Launch API server locally.

---

## 9. API Endpoints

- **`GET /api/leads`**: Retrieve all leads.
- **`PUT /api/leads/:id`**: Update a lead's stage or follow-up details.
- **`POST /api/webhook`**: Webhook endpoint to create leads. Payload:
  ```json
  {
    "phone": "9876543210",
    "source": "meta_ads"
  }
  ```
- **`GET /api/notifications`**: Retrieve leads requiring follow-up today.

---

## 10. Deployment Guide

### Frontend (Vercel)
- Create a new project in Vercel.
- Select the `frontend` folder as the root directory.
- Build command: `npm run build`
- Output directory: `dist`
- Set `VITE_API_URL` environment variable pointing to your deployed API server.

### Backend (Render)
- Create a new Web Service in Render.
- Select the `backend` folder as the root directory.
- Build command: `npm install`
- Start command: `node server.js`
- (Optional) Mount a Persistent Volume at `/opt/render/project/src/backend/data` to persist lead records.
