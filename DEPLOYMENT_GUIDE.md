# Deployment Guide (Two-Tier Application)

This guide documents how to deploy the decoupled CRM frontend to **Vercel** and the backend API to **Render**.

---

## 1. Backend API Deployment (Deploying to Render)

Render is ideal for hosting Node.js/Express web services.

### Steps to Deploy:
1. Push your repository containing the refactored directory to GitHub.
2. Sign in to your [Render Dashboard](https://render.com/).
3. Click **New +** and select **Web Service**.
4. Connect your GitHub repository.
5. In the Web Service configuration settings, specify:
   - **Name**: `crm-api-service`
   - **Environment**: `Node`
   - **Root Directory**: `backend` (Crucial: specifies that Render should install and run scripts within `backend/`)
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Instance Type**: `Free` (or appropriate tier)
6. Add Environment Variables under **Advanced**:
   - `PORT` = `10000` (or leave default, Render maps ports automatically)
7. Click **Create Web Service**.
8. Once built, copy your live service URL (e.g., `https://crm-api-service.onrender.com`).

> [!IMPORTANT]
> **Data Persistence Warning:** The local JSON database (`backend/data/db.json`) is file-based. Because Render's container filesystem is ephemeral, files are wiped during new deployments or server restarts. To prevent this, attach a **Persistent Volume** in Render mounted at `/opt/render/project/src/backend/data` (which maps to your `data` folder). Alternatively, swap the backend JSON controller with a cloud MongoDB or Google Sheets hook.

---

## 2. Frontend Client Deployment (Deploying to Vercel)

Vercel is the recommended hosting platform for Vite/React applications.

### Steps to Deploy:
1. Log in to your [Vercel Dashboard](https://vercel.com/).
2. Click **Add New** -> **Project**.
3. Import your GitHub repository.
4. In the Project configuration settings, specify:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend` (Crucial: Vercel compiles from the `frontend/` directory)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Open the **Environment Variables** section and add:
   - **Key**: `VITE_API_URL`
   - **Value**: `https://crm-api-service.onrender.com` (Your live backend service URL from Render)
6. Click **Deploy**.
7. Vercel will build the React bundle and host it at a custom domain (e.g., `https://crm-frontend.vercel.app`).
