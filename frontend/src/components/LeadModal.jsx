import React, { useState, useEffect } from 'react';
import { X, Calendar, Phone, Check, RefreshCw, MessageSquare, Send, User, Clock, Info } from 'lucide-react';
import { formatDateTime } from '../utils/dateFormatter';
import { crmApi } from '../api/crmApi';

export default function LeadModal({ lead, isOpen, onClose, onSave, onDelete }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [source, setSource] = useState('meta_ads');
  const [status, setStatus] = useState('New Leads');
  const [followUpDate, setFollowUpDate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // WhatsApp quick-message state
  const [wsMessage, setWsMessage] = useState('');
  const [sendingWs, setSendingWs] = useState(false);
  const [wsStatus, setWsStatus] = useState('');

  // Sync state with open/close and selected lead
  useEffect(() => {
    if (lead) {
      setName(lead.name || '');
      setPhone(lead.phone || '');
      setSource(lead.source || 'meta_ads');
      setStatus(lead.status || 'New Leads');
      setFollowUpDate(lead.followUpDate || '');
      setError('');
      setWsMessage('');
      setWsStatus('');
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
        name: name.trim() || 'Contact',
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

  const handleSendWhatsApp = async () => {
    if (!wsMessage.trim()) return;
    setSendingWs(true);
    setWsStatus('');
    try {
      const res = await crmApi.sendWhatsApp(lead.id, wsMessage.trim());
      setWsStatus('Sent successfully!');
      setWsMessage('');
      
      // Update modal local lead notes so it appears in feed immediately
      if (res.lead && res.lead.notes) {
        lead.notes = res.lead.notes;
      }
    } catch (err) {
      console.error(err);
      setWsStatus(`Error: ${err.message}`);
    } finally {
      setSendingWs(false);
    }
  };

  // Split notes by newline to render activity logs
  const activityLogs = lead.notes 
    ? lead.notes.split('\n').filter(log => log.trim() !== '') 
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-4xl border border-slate-100 overflow-hidden transform transition-all duration-300 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h3 className="font-bold text-slate-800 text-base">Lead details & Timeline</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">ID: {lead.id} | Created: {formatDateTime(lead.createdDate)}</p>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Panels Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100 overflow-y-auto flex-1">
          {/* Left Column: Form Details */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              {error && (
                <div className="p-3 text-xs bg-rose-50 border border-rose-100 text-rose-600 rounded-lg">
                  {error}
                </div>
              )}

              {/* Name Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Contact Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter name"
                    className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-crm-500 focus:ring-1 focus:ring-crm-500 bg-white"
                  />
                </div>
              </div>

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
              </div>
            </div>

            {/* Save Buttons */}
            <div className="flex items-center justify-between pt-6 border-t border-slate-100 mt-6 gap-2 w-full">
              {onDelete ? (
                <button
                  type="button"
                  onClick={async () => {
                    if (window.confirm('Are you sure you want to delete this lead?')) {
                      setSubmitting(true);
                      try {
                        await onDelete(lead.id);
                        onClose();
                      } catch (err) {
                        setError('Failed to delete lead.');
                      } finally {
                        setSubmitting(false);
                      }
                    }
                  }}
                  disabled={submitting}
                  className="px-3.5 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl transition-all"
                >
                  Delete Lead
                </button>
              ) : <div />}

              <div className="flex items-center gap-3">
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
            </div>
          </form>

          {/* Right Column: Timeline & WhatsApp Outbox */}
          <div className="p-6 flex flex-col justify-between space-y-6 bg-slate-50/30">
            {/* Timeline Log */}
            <div className="flex-1 flex flex-col min-h-[250px]">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Activity Timeline
              </h4>
              
              <div className="flex-1 overflow-y-auto max-h-[300px] border border-slate-100 rounded-2xl bg-white p-4 space-y-3.5 shadow-inner">
                {activityLogs.length > 0 ? (
                  activityLogs.map((log, index) => (
                    <div key={index} className="text-xs text-slate-600 leading-relaxed border-l-2 border-crm-500 pl-3 py-0.5">
                      {log}
                    </div>
                  ))
                ) : (
                  <div className="flex items-center gap-1.5 text-slate-400 text-xs py-8 justify-center italic">
                    <Info className="w-4 h-4" />
                    No communication logs yet.
                  </div>
                )}
              </div>
            </div>

            {/* Outgoing WhatsApp Outbox */}
            <div className="border-t border-slate-100 pt-4">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                WhatsApp Cloud Outbox
              </h4>
              
              <div className="flex gap-2">
                <input
                  type="text"
                  value={wsMessage}
                  onChange={(e) => setWsMessage(e.target.value)}
                  placeholder="Type WhatsApp message..."
                  className="flex-1 px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-crm-500 focus:ring-1 focus:ring-crm-500 bg-white"
                  onKeyDown={(e) => e.key === 'Enter' && handleSendWhatsApp()}
                  disabled={sendingWs}
                />
                <button
                  type="button"
                  onClick={handleSendWhatsApp}
                  disabled={sendingWs || !wsMessage.trim()}
                  className="flex items-center justify-center p-2.5 rounded-xl bg-crm-600 hover:bg-crm-700 disabled:bg-crm-300 text-white shadow-sm transition-all"
                >
                  {sendingWs ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </div>
              {wsStatus && (
                <p className={`text-[10px] mt-1.5 font-medium ${
                  wsStatus.startsWith('Error') ? 'text-rose-600' : 'text-emerald-600'
                }`}>
                  {wsStatus}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
