# Deployment Guide (Frontend and Backend Applications)

This guide documents how to deploy the separated CRM frontend to **Vercel** and the backend API to **Render**.

---

## 1. Backend API Deployment (Render)

Render hosts backend API web services.

### Steps to Deploy:
1. Push your CRM repository to GitHub.
2. Sign in to your [Render Dashboard](https://render.com/).
3. Click **New +** and select **Web Service**.
4. Connect your GitHub repository.
5. In the Web Service configurations, specify:
   - **Name**: `crm-backend-service`
   - **Environment**: `Node`
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Instance Type**: `Free`
6. Add Environment Variables under **Advanced**:
   - `GOOGLE_SERVICE_ACCOUNT_EMAIL`: Service account email address
   - `GOOGLE_PRIVATE_KEY`: Service account private key (ensure newlines are replaced with `\n` characters)
   - `GOOGLE_SHEET_ID`: Spreadsheet sheet ID
   - `META_ACCESS_TOKEN`: Facebook permanent app access token
   - `META_VERIFY_TOKEN`: Webhook verification string
   - `WHATSAPP_PHONE_NUMBER_ID`: WhatsApp Phone ID
   - `WHATSAPP_VERIFY_TOKEN`: WhatsApp Webhook verification string
   - `GOOGLE_ADS_KEY`: Google Ads secret key
   - `CORS_ORIGIN`: Set to your deployed Vercel frontend URL to restrict access
7. Click **Create Web Service**.

---

## 2. Frontend Client Deployment (Vercel)

Vercel is the recommended platform for hosting compiled React frontends.

### Steps to Deploy:
1. Log in to your [Vercel Dashboard](https://vercel.com/).
2. Click **Add New** -> **Project**.
3. Import your GitHub repository.
4. In the Project configurations, specify:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Open the **Environment Variables** section and add:
   - **Key**: `VITE_API_URL`
   - **Value**: `https://crm-backend-service.onrender.com` (Your live backend URL from Render)
6. Click **Deploy**.
