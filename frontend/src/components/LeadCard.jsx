import React from 'react';
import { Calendar, Phone, Share2, MessageSquare, ExternalLink, CalendarClock } from 'lucide-react';
import { formatDate, isDateToday } from '../utils/dateFormatter';

export default function LeadCard({ lead, onEdit }) {
  const getSourceBadge = (source) => {
    switch (source) {
      case 'meta_ads':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
            Meta Ads
          </span>
        );
      case 'google_ads':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-100">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            Google Ads
          </span>
        );
      case 'whatsapp':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            WhatsApp
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-50 text-slate-700 border border-slate-100">
            Unknown
          </span>
        );
    }
  };

  const handleDragStart = (e) => {
    e.dataTransfer.setData('text/plain', lead.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const isFollowUpToday = isDateToday(lead.followUpDate);

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className={`group relative glass-panel p-4 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 cursor-grab active:cursor-grabbing border hover:-translate-y-1 ${
        isFollowUpToday 
          ? 'border-rose-400 bg-rose-50/20 shadow-rose-100/40' 
          : 'border-slate-100 hover:border-slate-200'
      }`}
    >
      {/* Follow-up Alert Indicator */}
      {isFollowUpToday && (
        <span className="absolute top-3 right-3 flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
        </span>
      )}

      <div className="flex flex-col gap-3">
        {/* Source Badge & Created Time */}
        <div className="flex items-center justify-between">
          {getSourceBadge(lead.source)}
          <span className="text-[10px] text-slate-400">
            {new Date(lead.createdDate).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric'
            })}
          </span>
        </div>

        {/* Lead Phone Number */}
        <div className="flex items-center gap-2 text-slate-700">
          <Phone className="w-4 h-4 text-slate-400 group-hover:text-crm-500 transition-colors" />
          <span className="font-semibold text-sm tracking-wide">{lead.phone}</span>
        </div>

        {/* Follow Up Date Badge */}
        <div className="flex items-center justify-between border-t border-slate-100 pt-3 mt-1">
          <div className="flex items-center gap-1.5">
            <Calendar className={`w-3.5 h-3.5 ${isFollowUpToday ? 'text-rose-500' : 'text-slate-400'}`} />
            <span className={`text-xs ${
              isFollowUpToday 
                ? 'text-rose-600 font-bold' 
                : lead.followUpDate 
                  ? 'text-slate-600 font-medium' 
                  : 'text-slate-400 italic'
            }`}>
              {lead.followUpDate ? formatDate(lead.followUpDate) : 'No Follow Up'}
            </span>
          </div>

          <button
            onClick={() => onEdit(lead)}
            className="flex items-center justify-center p-1.5 rounded-lg bg-slate-50 group-hover:bg-crm-50 text-slate-400 group-hover:text-crm-600 transition-all duration-200 hover:scale-105"
            title="Edit Follow-up / Details"
          >
            <CalendarClock className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
