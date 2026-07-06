import React, { useState, useEffect } from 'react';
import { X, Calendar, Phone, Check, RefreshCw } from 'lucide-react';
import { formatDateTime } from '../utils/dateFormatter';

export default function LeadModal({ lead, isOpen, onClose, onSave }) {
  const [phone, setPhone] = useState('');
  const [source, setSource] = useState('meta_ads');
  const [status, setStatus] = useState('New Leads');
  const [followUpDate, setFollowUpDate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Sync state with open/close and selected lead
  useEffect(() => {
    if (lead) {
      setPhone(lead.phone || '');
      setSource(lead.source || 'meta_ads');
      setStatus(lead.status || 'New Leads');
      setFollowUpDate(lead.followUpDate || '');
      setError('');
    }
  }, [lead, isOpen]);

  if (!isOpen || !lead) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!phone.trim()) {
      setError('Phone number is required.');
      return;
    }

    setSubmitting(true);
    try {
      await onSave(lead.id, {
        phone: phone.trim(),
        source,
        status,
        followUpDate: followUpDate || null
      });
      onClose();
    } catch (err) {
      console.error(err);
      setError('Failed to update lead details.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md border border-slate-100 overflow-hidden transform transition-all duration-300">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h3 className="font-semibold text-slate-800 text-base">Edit Lead</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Created: {formatDateTime(lead.createdDate)}</p>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 text-xs bg-rose-50 border border-rose-100 text-rose-600 rounded-lg">
              {error}
            </div>
          )}

          {/* Phone Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">Phone Number</label>
            <div className="relative">
              <Phone className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter phone number"
                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-crm-500 focus:ring-1 focus:ring-crm-500 bg-white"
              />
            </div>
          </div>

          {/* Source Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">Lead Source</label>
            <select
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-crm-500 focus:ring-1 focus:ring-crm-500 bg-white"
            >
              <option value="meta_ads">Meta Ads</option>
              <option value="google_ads">Google Ads</option>
              <option value="whatsapp">WhatsApp</option>
            </select>
          </div>

          {/* Pipeline Status Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">Pipeline Stage</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-crm-500 focus:ring-1 focus:ring-crm-500 bg-white"
            >
              <option value="New Leads">New Leads</option>
              <option value="Interested">Interested</option>
              <option value="Not Interested">Not Interested</option>
              <option value="Follow Up">Follow Up</option>
            </select>
          </div>

          {/* Follow Up Date Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">Follow Up Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="date"
                value={followUpDate}
                onChange={(e) => setFollowUpDate(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-crm-500 focus:ring-1 focus:ring-crm-500 bg-white"
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Clearing the date cancels the scheduled follow up.</p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-50 border border-slate-200 rounded-xl transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-crm-600 hover:bg-crm-700 disabled:bg-crm-400 rounded-xl shadow-md shadow-crm-600/10 transition-all"
            >
              {submitting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
