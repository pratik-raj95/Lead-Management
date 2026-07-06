# Meta Ads App Setup & Webhooks Configuration

This guide details how to configure your Facebook Developer App to subscribe to Lead Ads events and integrate with the CRM.

---

## 1. Registering App Subscriptions

1. Log in to [Meta for Developers Portal](https://developers.facebook.com/).
2. Create a Business App.
3. Add **Webhooks** under App Products.
4. Select **Page** from the dropdown menu and subscribe to `leadgen`.
5. Enter callback settings:
   - **Callback URL**: `https://your-crm-backend.com/api/webhook/meta`
   - **Verify Token**: (Matches your backend `META_VERIFY_TOKEN` env value)

---

## 2. Generating Page & System User Tokens

Since page tokens expire, you should generate a permanent Admin System User Token:
1. Go to your **Facebook Business Manager Settings** -> **Users** -> **System Users**.
2. Create a new System User with role **Admin**.
3. Select your App, click **Generate New Token**, and check the following scopes:
   - `ads_management`
   - `pages_show_list`
   - `pages_read_engagement`
   - `pages_manage_ads`
   - `leads_retrieval`
4. Copy the permanent token and paste it into the `META_ACCESS_TOKEN` environment variable on your backend.
5. In Facebook Business Settings, ensure this System User is assigned as an Admin to your marketing Facebook Pages and ad accounts.
