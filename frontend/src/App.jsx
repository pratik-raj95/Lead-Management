import React, { useState } from 'react';
import { LayoutDashboard, Columns, Bell, Zap, Menu, X, ArrowUpRight } from 'lucide-react';
import { useLeads } from './hooks/useLeads';
import { isDateToday } from './utils/dateFormatter';
import Dashboard from './pages/Dashboard';
import Pipeline from './pages/Pipeline';
import LeadModal from './components/LeadModal';

export default function App() {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [selectedLead, setSelectedLead] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    leads,
    loading,
    error,
    refreshLeads,
    updateLeadStatus,
    updateLeadDetails
  } = useLeads();

  // Find followups for today to count alerts
  const todayAlertsCount = leads.filter(lead => {
    return isDateToday(lead.followUpDate) && lead.status !== 'Not Interested';
  }).length;

  const handleEditLead = (lead) => {
    setSelectedLead(lead);
    setIsModalOpen(true);
  };

  const handleSaveLead = async (leadId, updatedFields) => {
    await updateLeadDetails(leadId, updatedFields);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col md:flex-row">
      
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200/80 p-6 space-y-8 sticky top-0 h-screen shrink-0">
        {/* App Logo */}
        <div className="flex items-center gap-2.5 px-2">
          <div className="p-2 rounded-xl bg-crm-600 text-white shadow-md shadow-crm-600/20">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-extrabold text-slate-800 tracking-tight text-sm leading-tight">CRM</h2>
            <span className="text-[10px] text-crm-600 font-bold tracking-widest uppercase">CRM Suite</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-1.5 flex-1">
          <button
            onClick={() => setCurrentTab('dashboard')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all ${
              currentTab === 'dashboard'
                ? 'bg-crm-50 text-crm-700 shadow-sm'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
            }`}
          >
            <div className="flex items-center gap-3">
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </div>
            {todayAlertsCount > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white animate-pulse">
                {todayAlertsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setCurrentTab('pipeline')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all ${
              currentTab === 'pipeline'
                ? 'bg-crm-50 text-crm-700 shadow-sm'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
            }`}
          >
            <div className="flex items-center gap-3">
              <Columns className="w-4 h-4" />
              <span>Lead Pipeline</span>
            </div>
          </button>
        </nav>

        {/* Footer info */}
        <div className="border-t border-slate-100 pt-4 px-2">
          <div className="flex items-center justify-between text-[10px] font-medium text-slate-400">
            <span>Server Inbound</span>
            <span className="flex items-center gap-1 text-emerald-500 font-bold">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping"></span>
              Online
            </span>
          </div>
        </div>
      </aside>

      {/* Mobile Top Navbar */}
      <header className="md:hidden bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-crm-600 text-white">
            <Zap className="w-4 h-4" />
          </div>
          <span className="font-bold text-slate-800 text-sm tracking-tight">CRM</span>
        </div>

        {todayAlertsCount > 0 && (
          <button 
            onClick={() => setCurrentTab('dashboard')} 
            className="relative p-1.5 rounded-lg hover:bg-slate-50 text-rose-500"
          >
            <Bell className="w-4.5 h-4.5" />
            <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
            </span>
          </button>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto pb-24 md:pb-10">
        {currentTab === 'dashboard' ? (
          <Dashboard
            leads={leads}
            refreshLeads={refreshLeads}
            onEditLead={handleEditLead}
          />
        ) : (
          <Pipeline
            leads={leads}
            loading={loading}
            error={error}
            onUpdateStatus={updateLeadStatus}
            onEditLead={handleEditLead}
            onRefresh={refreshLeads}
          />
        )}
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-slate-200/80 px-8 py-3.5 flex justify-around items-center z-40 shadow-lg">
        <button
          onClick={() => setCurrentTab('dashboard')}
          className={`flex flex-col items-center gap-1 text-[10px] font-semibold transition-all ${
            currentTab === 'dashboard' ? 'text-crm-600 scale-105' : 'text-slate-400'
          }`}
        >
          <div className="relative">
            <LayoutDashboard className="w-5 h-5" />
            {todayAlertsCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-2 w-2 rounded-full bg-rose-500"></span>
            )}
          </div>
          <span>Dashboard</span>
        </button>

        <button
          onClick={() => setCurrentTab('pipeline')}
          className={`flex flex-col items-center gap-1 text-[10px] font-semibold transition-all ${
            currentTab === 'pipeline' ? 'text-crm-600 scale-105' : 'text-slate-400'
          }`}
        >
          <Columns className="w-5 h-5" />
          <span>Pipeline</span>
        </button>
      </nav>

      {/* Edit Lead Modal */}
      <LeadModal
        lead={selectedLead}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedLead(null);
        }}
        onSave={handleSaveLead}
      />
    </div>
  );
}
