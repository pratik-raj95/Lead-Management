const API_BASE = 'http://localhost:5000/api';

export const crmApi = {
  /**
   * Fetch all leads from the backend
   */
  async getLeads() {
    const res = await fetch(`${API_BASE}/leads`);
    if (!res.ok) throw new Error('Failed to fetch leads');
    return res.json();
  },

  /**
   * Update lead properties (status, phone, source, followUpDate)
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
  }
};
