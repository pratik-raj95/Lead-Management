# Deployment Guide

This document details the production deployment steps for the Antigravity CRM system.

---

## 1. Frontend Deployment (Vite React)

The frontend compiles to static assets (HTML, JS, CSS) inside the `dist/` directory.

### Option A: Vercel (Recommended)
1. Install Vercel CLI: `npm install -g vercel`
2. Run `vercel` in the project root.
3. Configure build commands:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Set Environment Variables if applicable:
   - `VITE_API_URL` = (URL of your deployed Express API, e.g., `https://api.mycrm.com/api`)

### Option B: Servicing via Nginx
1. Compile the build: `npm run build`
2. Upload the `dist/` contents to your server's HTML directory (e.g., `/var/www/crm`).
3. Configure Nginx (`/etc/nginx/sites-available/default`):
   ```nginx
   server {
       listen 80;
       server_name crm.example.com;

       root /var/www/crm;
       index index.html;

       location / {
           try_files $uri $uri/ /index.html;
       }
   }
   ```
4. Reload Nginx: `sudo systemctl reload nginx`.

---

## 2. Backend Deployment (Express.js)

The backend is a Node.js runtime process that must run persistently and listen on a public port.

### Option A: VPS Hosting (with PM2 & Nginx)
1. Transfer the `backend/` folder to the VPS.
2. Install PM2 globally: `npm install -g pm2`
3. Run the server using PM2 from the `backend/` folder:
   ```bash
   cd backend
   npm install --production
   pm2 start server.js --name "crm-backend"
   ```
4. Set up Nginx as a Reverse Proxy to route public requests to port `5000`:
   ```nginx
   server {
       listen 80;
       server_name api.example.com;

       location / {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

### Option B: PaaS Deployments (Render / Railway)
1. Push your repository to GitHub.
2. Create a new Web Service pointing to your repository.
3. Set the Root Directory to `backend` or configure commands:
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
4. Specify environment port configs. Render automatically maps ports via its system.

---

## 3. Database Persistence
Since this app uses `backend/data/db.json` as its storage file:
- On Render/Railway/Heroku: Ensure you attach a **Persistent Volume** mounted at `/backend/data/` or `/app/backend/data/`.
- Without a persistent volume, the local file system on PaaS services is ephemeral and will wipe your leads whenever the server sleeps or redeploys.
- For true enterprise persistence without volumes, swap `db.js` file reads with a hosted MongoDB connection string or Google Sheets integration.
