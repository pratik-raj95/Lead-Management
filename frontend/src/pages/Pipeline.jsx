import React from 'react';
import KanbanBoard from '../components/KanbanBoard';
import { RefreshCw, LayoutGrid } from 'lucide-react';

export default function Pipeline({ leads, loading, error, onUpdateStatus, onEditLead, onRefresh }) {
  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <LayoutGrid className="w-5 h-5 text-crm-600" />
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Lead Pipeline</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Drag and drop cards between stages. New webhook leads land automatically in "New Leads".
          </p>
        </div>

        {/* Sync Trigger */}
        <button
          onClick={onRefresh}
          disabled={loading}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 disabled:bg-slate-100 rounded-xl shadow-sm hover:scale-105 active:scale-95 transition-all duration-200"
          title="Manually sync with server"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 ${loading ? 'animate-spin' : ''}`} />
          Sync
        </button>
      </div>

      {/* Errors */}
      {error && (
        <div className="p-4 text-xs bg-rose-50 border border-rose-100 text-rose-600 rounded-xl shadow-sm">
          {error}
        </div>
      )}

      {/* Pipeline Board */}
      <div className="overflow-x-auto min-w-full">
        <KanbanBoard
          leads={leads}
          onUpdateStatus={onUpdateStatus}
          onEditLead={onEditLead}
        />
      </div>
    </div>
  );
}
