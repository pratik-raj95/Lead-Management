import React, { useState } from 'react';
import LeadCard from './LeadCard';
import { Sparkles, MessageCircle, AlertCircle, CalendarRange } from 'lucide-react';

const COLUMNS = [
  { 
    id: 'New Leads', 
    title: 'New Leads', 
    headerColor: 'bg-blue-500/10 text-blue-800 border-blue-200',
    indicatorColor: 'bg-blue-500',
    icon: <Sparkles className="w-4 h-4 text-blue-500" />
  },
  { 
    id: 'Interested', 
    title: 'Interested', 
    headerColor: 'bg-emerald-500/10 text-emerald-800 border-emerald-200',
    indicatorColor: 'bg-emerald-500',
    icon: <MessageCircle className="w-4 h-4 text-emerald-500" />
  },
  { 
    id: 'Not Interested', 
    title: 'Not Interested', 
    headerColor: 'bg-slate-500/10 text-slate-800 border-slate-200',
    indicatorColor: 'bg-slate-500',
    icon: <AlertCircle className="w-4 h-4 text-slate-500" />
  },
  { 
    id: 'Follow Up', 
    title: 'Follow Up', 
    headerColor: 'bg-amber-500/10 text-amber-800 border-amber-200',
    indicatorColor: 'bg-amber-500',
    icon: <CalendarRange className="w-4 h-4 text-amber-500" />
  }
];

export default function KanbanBoard({ leads, onUpdateStatus, onEditLead }) {
  const [activeDragOverColumn, setActiveDragOverColumn] = useState(null);

  const handleDragOver = (e, columnId) => {
    e.preventDefault();
    if (activeDragOverColumn !== columnId) {
      setActiveDragOverColumn(columnId);
    }
  };

  const handleDragLeave = () => {
    setActiveDragOverColumn(null);
  };

  const handleDrop = (e, targetStatus) => {
    e.preventDefault();
    setActiveDragOverColumn(null);
    const leadId = e.dataTransfer.getData('text/plain');
    if (leadId) {
      onUpdateStatus(leadId, targetStatus);
    }
  };

  // Group leads by status
  const leadsByColumn = COLUMNS.reduce((acc, col) => {
    acc[col.id] = leads.filter(lead => lead.status === col.id);
    return acc;
  }, {});

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start h-full">
      {COLUMNS.map(col => {
        const columnLeads = leadsByColumn[col.id] || [];
        const isDraggingOver = activeDragOverColumn === col.id;

        return (
          <div
            key={col.id}
            onDragOver={(e) => handleDragOver(e, col.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, col.id)}
            className={`flex flex-col h-[75vh] min-h-[400px] rounded-2xl border transition-all duration-300 p-4 ${
              isDraggingOver 
                ? 'bg-slate-100/80 border-crm-400 scale-[1.01] shadow-inner shadow-slate-200/50' 
                : 'bg-slate-50/50 border-slate-200/60'
            }`}
          >
            {/* Column Header */}
            <div className={`flex items-center justify-between border px-3 py-2 rounded-xl mb-4 shadow-sm ${col.headerColor}`}>
              <div className="flex items-center gap-2 font-semibold text-sm">
                {col.icon}
                <span>{col.title}</span>
              </div>
              <span className="text-xs font-bold bg-white/80 px-2.5 py-0.5 rounded-full shadow-sm text-slate-700">
                {columnLeads.length}
              </span>
            </div>

            {/* Column Cards Container */}
            <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 pb-10">
              {columnLeads.length > 0 ? (
                columnLeads.map(lead => (
                  <LeadCard
                    key={lead.id}
                    lead={lead}
                    onEdit={onEditLead}
                  />
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-48 border border-dashed border-slate-200 rounded-xl p-4 text-center">
                  <span className="text-xs text-slate-400">No leads in this stage</span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
