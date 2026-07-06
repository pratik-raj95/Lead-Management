const url = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const API_BASE = url.endsWith('/api') ? url : `${url}/api`;

export const crmApi = {
  /**
   * Fetch all leads from the active database (Google Sheets or JSON)
   */
  async getLeads() {
    const res = await fetch(`${API_BASE}/leads`);
    if (!res.ok) throw new Error('Failed to fetch leads');
    return res.json();
  },

  /**
   * Update lead properties (status, phone, source, followUpDate, notes)
   */
  async updateLead(id, data) {
    const res = await fetch(`${API_BASE}/leads/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update lead');
    return res.json();
  },

  /**
   * Trigger a webhook ingestion simulation
   */
  async simulateWebhook(phone, source) {
    const res = await fetch(`${API_BASE}/webhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, source }),
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || 'Failed to simulate webhook');
    }
    return res.json();
  },

  /**
   * Fetch active follow-ups for today
   */
  async getNotifications() {
    const res = await fetch(`${API_BASE}/notifications`);
    if (!res.ok) throw new Error('Failed to fetch notifications');
    return res.json();
  },

  /**
   * Dispatch an outgoing WhatsApp message to a lead
   */
  async sendWhatsApp(id, message) {
    const res = await fetch(`${API_BASE}/leads/${id}/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || 'Failed to dispatch WhatsApp message');
    }
    return data;
  }
};
