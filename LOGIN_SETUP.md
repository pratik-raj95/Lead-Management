# Admin Authentication System Guide

This document explains how the CRM's Admin Authentication System is configured, how to change credentials, and how to verify operations.

---

## 1. Credentials Configuration

The CRM comes pre-configured with a default administrator account.

* **Default Admin Username**: `admin`
* **Default Admin Password**: `Admin@123`

### How to Change Credentials:
Do **NOT** hardcode credentials. Instead, declare them as environment variables inside your hosting platform (Render for the backend API server):
- `ADMIN_USERNAME`: Set to your custom administrator username.
- `ADMIN_PASSWORD`: Set to your custom admin password.
- `JWT_SECRET`: A secret hashing string used to sign JWT session keys.

*Note:* When the backend starts, it automatically reads `ADMIN_PASSWORD` from the environment, hashes it securely using **bcryptjs** in memory (`bcrypt.hashSync`), and discards the plain text.

---

## 2. JWT Session Architecture

1. **Token Generation**: On a successful `POST /api/login` request, the backend signs a JSON Web Token (JWT) containing the administrator username.
2. **Session Persistence**: The frontend stores the token in `sessionStorage` (which persists across browser refreshes but is immediately wiped when the tab is closed, ensuring zero local storage footprint).
3. **API Authorization**: For all subsequent dashboard actions (fetching, editing, or deleting leads), the frontend sends the token in the `Authorization` header:
   ```http
   Authorization: Bearer <token>
   ```
4. **Verification**: The backend's authentication middleware (`backend/middleware/auth.js`) intercepts request packets, validates the token signature, and blocks any unauthorized requests with `401 Unauthorized` or `403 Forbidden` responses.

---

## 3. Enterprise Auto Logout

For maximum security, the CRM locks automatically if left unattended:
* **Timeout Period**: `30 minutes` of continuous inactivity.
* **Activity Tracking**: The application listens to user interaction events:
  - `mousemove` / `mousedown` / `click` (Mouse inputs)
  - `keypress` (Keyboard typing)
  - `scroll` (Page scrolling)
  - `touchstart` (Mobile touchscreen gestures)
* **Behavior**: Any event resets the inactivity countdown. If the timer reaches 30 minutes without user input, the CRM wipes the session token, redirects to the Login card, and displays the notice: *"Session expired due to inactivity. Please login again."*

---

## 4. Deployment Checklists

When deploying:
1. **Render (Backend)**: Add `ADMIN_USERNAME`, `ADMIN_PASSWORD`, and `JWT_SECRET` under Render Dashboard environment variables.
2. **Netlify (Frontend)**: Re-compile the React client. Ensure `VITE_API_URL` points to your Render backend service.
