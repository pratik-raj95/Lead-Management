# Deployment Checklist

Use this checklist to verify production readiness before deploying the frontend to Vercel and the backend to Render.

---

## 1. Environment Configurations
- [ ] **`VITE_API_URL` (Frontend)**: Configured in the hosting platform (Vercel) to point to the live backend URL (e.g., `https://crm-api-service.onrender.com`).
- [ ] **`CORS_ORIGIN` (Backend)**: Set in the backend env settings (Render) to restrict cross-origin requests to your frontend Vercel URL (e.g., `https://crm-frontend.vercel.app`).
- [ ] **`PORT` (Backend)**: Render manages port routing automatically, but ensure no hardcoded port overrides prevent standard binding.

---

## 2. Frontend Verification (Vercel)
- [ ] **Decoupled Folder Root**: Verify that Vercel is configured to build from the `frontend/` subdirectory instead of the root directory.
- [ ] **Build Command**: Set the build command to `npm run build`.
- [ ] **Output Folder**: Set the output path to `dist/`.
- [ ] **SPA Rewrite Configuration**: Confirm `frontend/vercel.json` exists with rewrites to `index.html` to avoid `404` errors on client-side tab navigations.
- [ ] **No Localhost URLs**: Run an audit to confirm `http://localhost` is completely removed from compile-target JavaScript code (resolved dynamically via `import.meta.env.VITE_API_URL`).

---

## 3. Backend Verification (Render)
- [ ] **Decoupled Folder Root**: Verify that Render is configured to build from the `backend/` subdirectory.
- [ ] **Build Command**: Set to `npm install`.
- [ ] **Start Command**: Set to `node server.js`.
- [ ] **render.yaml**: Validate configuration parameters for automated blueprints deployment.
- [ ] **Persistent Disk Volume**: Attach a persistent disk volume mounted at `/opt/render/project/src/backend/data` to ensure the `db.json` database is not wiped when the Render container redeploys or restarts.

---

## 4. Integration & Webhooks Checks
- [ ] **Meta Ads Webhook**: Subscribers configured on the Meta Developer Page point to the live webhook endpoint `/api/webhook` (e.g. `https://api.mycrm.com/api/webhook`).
- [ ] **Google Ads Webhook**: Google Ads form conversion webhook URL set, validation key configured, and matching backend variables declared.
- [ ] **WhatsApp Business webhook**: WhatsApp changes message subscription point is active.
- [ ] **n8n Automation Flow**: Node inputs match CRM contracts:
  ```json
  {
    "phone": "SENDER_PHONE",
    "source": "meta_ads" | "google_ads" | "whatsapp"
  }
  ```
