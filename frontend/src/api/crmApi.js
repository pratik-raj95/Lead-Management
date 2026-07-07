const url = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const API_BASE = url.endsWith('/api') ? url : `${url}/api`;

/**
 * Get authorization header from session storage
 */
const getAuthHeaders = () => {
  const token = sessionStorage.getItem('crm_token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

export const crmApi = {
  /**
   * Admin Authentication
   */
  async login(username, password) {
    const res = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || 'Login failed. Please check credentials.');
    }
    return data; // returns { success, username, token }
  },

  /**
   * Fetch all leads from the active database
   */
  async getLeads() {
    const res = await fetch(`${API_BASE}/leads`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        // Trigger global token invalidation
        sessionStorage.removeItem('crm_token');
      }
      throw new Error('Failed to fetch leads');
    }
    return res.json();
  },

  /**
   * Update lead properties
   */
  async updateLead(id, data) {
    const res = await fetch(`${API_BASE}/leads/${id}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        sessionStorage.removeItem('crm_token');
      }
      throw new Error('Failed to update lead');
    }
    return res.json();
  },

  /**
   * Delete a lead from the database
   */
  async deleteLead(id) {
    const res = await fetch(`${API_BASE}/leads/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      }
    });
    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        sessionStorage.removeItem('crm_token');
      }
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || 'Failed to delete lead');
    }
    return res.json();
  },

  /**
   * Trigger a webhook ingestion simulation
   */
  async simulateWebhook(phone, source) {
    // Note: Ingestion simulates from the dashboard but posts to the public webhook endpoint
    const res = await fetch(`${API_BASE}/webhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, source })
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
    const res = await fetch(`${API_BASE}/notifications`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        sessionStorage.removeItem('crm_token');
      }
      throw new Error('Failed to fetch notifications');
    }
    return res.json();
  },

  /**
   * Dispatch an outgoing WhatsApp message to a lead
   */
  async sendWhatsApp(id, message) {
    const res = await fetch(`${API_BASE}/leads/${id}/message`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify({ message })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        sessionStorage.removeItem('crm_token');
      }
      throw new Error(data.error || 'Failed to dispatch WhatsApp message');
    }
    return data;
  },

  /**
   * Fetch lead activity history timeline
   */
  async getLeadTimeline(id) {
    const res = await fetch(`${API_BASE}/leads/${id}/timeline`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        sessionStorage.removeItem('crm_token');
      }
      throw new Error('Failed to fetch lead timeline logs');
    }
    return res.json();
  }
};
