import { useState, useEffect, useCallback } from 'react';
import { crmApi } from '../api/crmApi';

export function useLeads() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Refetches leads from the backend and updates local state.
   */
  const fetchLeads = useCallback(async () => {
    try {
      const data = await crmApi.getLeads();
      setLeads(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching leads:', err);
      setError('Could not sync with CRM backend. Make sure server is running.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Poll backend for leads every 4 seconds to catch webhook arrivals instantly
  useEffect(() => {
    fetchLeads();
    const interval = setInterval(fetchLeads, 4000);
    return () => clearInterval(interval);
  }, [fetchLeads]);

  /**
   * Updates lead status. Uses optimistic UI rendering.
   */
  const updateLeadStatus = async (leadId, newStatus) => {
    const previousLeads = [...leads];
    // Apply state change immediately
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: newStatus } : l));

    try {
      const lead = leads.find(l => l.id === leadId);
      if (lead) {
        await crmApi.updateLead(leadId, { ...lead, status: newStatus });
      }
    } catch (err) {
      console.error('Failed to update status on server:', err);
      // Revert change in case of network error
      setLeads(previousLeads);
    }
  };

  /**
   * Updates other fields of a lead (like follow-up dates).
   */
  const updateLeadDetails = async (leadId, updatedFields) => {
    const previousLeads = [...leads];
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, ...updatedFields } : l));

    try {
      const lead = leads.find(l => l.id === leadId);
      if (lead) {
        await crmApi.updateLead(leadId, { ...lead, ...updatedFields });
      }
    } catch (err) {
      console.error('Failed to update lead details:', err);
      setLeads(previousLeads);
      throw err;
    }
  };

  /**
   * Deletes a lead from the server and updates local state optimistically.
   */
  const deleteLead = async (leadId) => {
    const previousLeads = [...leads];
    setLeads(prev => prev.filter(l => l.id !== leadId));

    try {
      await crmApi.deleteLead(leadId);
    } catch (err) {
      console.error('Failed to delete lead on server:', err);
      setLeads(previousLeads);
      throw err;
    }
  };

  return {
    leads,
    loading,
    error,
    refreshLeads: fetchLeads,
    updateLeadStatus,
    updateLeadDetails,
    deleteLead
  };
}
