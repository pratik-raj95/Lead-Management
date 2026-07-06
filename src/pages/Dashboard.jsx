import React, { useState } from 'react';
import { Users, UserCheck, UserMinus, Calendar, Bell, ArrowRight, Play, CheckCircle2, AlertTriangle, PhoneCall } from 'lucide-react';
import { isDateToday, formatDate } from '../utils/dateFormatter';
import { crmApi } from '../api/crmApi';

export default function Dashboard({ leads, refreshLeads, onEditLead }) {
  const [simulating, setSimulating] = useState(false);
  const [simRes, setSimRes] = useState(null);

  // Calculate metrics
  const totalLeads = leads.length;
  const interestedLeads = leads.filter(l => l.status === 'Interested').length;
  const notInterestedLeads = leads.filter(l => l.status === 'Not Interested').length;
  
  // Pending follow ups = leads with follow-up dates that are today or in the future
  const pendingFollowUps = leads.filter(l => {
    if (!l.followUpDate || l.status === 'Not Interested') return false;
    return new Date(l.followUpDate) >= new Date(new Date().setHours(0,0,0,0));
  }).length;

  // Filter leads requiring follow-up today (Notifications)
  const todayFollowUps = leads.filter(lead => {
    return isDateToday(lead.followUpDate) && lead.status !== 'Not Interested';
  });

  // Calculate source stats for the distribution bar
  const sourceCounts = leads.reduce((acc, lead) => {
    acc[lead.source] = (acc[lead.source] || 0) + 1;
    return acc;
  }, { meta_ads: 0, google_ads: 0, whatsapp: 0 });

  const getSourcePercent = (source) => {
    if (totalLeads === 0) return 0;
    return Math.round((sourceCounts[source] / totalLeads) * 100);
  };

  // Helper to generate a realistic phone number
  const generateRandomPhone = () => {
    const prefix = ['9876', '9988', '9123', '9812', '9999'];
    const selectedPrefix = prefix[Math.floor(Math.random() * prefix.length)];
    const suffix = Math.floor(100000 + Math.random() * 900000);
    return `${selectedPrefix}${suffix}`;
  };

  const handleSimulateWebhook = async (source) => {
    setSimulating(true);
    setSimRes(null);
    const phone = generateRandomPhone();
    
    try {
      const res = await crmApi.simulateWebhook(phone, source);
      setSimRes({
        success: true,
        source,
        payload: { phone, source },
        message: `Webhook simulated! Ingested lead: ${phone}`
      });
      // Fetch latest leads instantly
      refreshLeads();
    } catch (err) {
      console.error(err);
      setSimRes({
        success: false,
        message: err.message || 'Webhook simulation failed.'
      });
    } finally {
      setSimulating(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Dashboard</h1>
        <p className="text-xs text-slate-500 mt-1">Overview of your lead pipeline and automation sync.</p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Metric 1: Total Leads */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-100/60 shadow-sm flex items-center justify-between group hover:border-indigo-200 transition-all duration-300">
          <div className="space-y-1">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Leads</p>
            <p className="text-3xl font-extrabold text-slate-800">{totalLeads}</p>
          </div>
          <div className="p-3.5 rounded-xl bg-indigo-50 text-indigo-600 group-hover:scale-110 transition-transform duration-300">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 2: Interested */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-100/60 shadow-sm flex items-center justify-between group hover:border-emerald-200 transition-all duration-300">
          <div className="space-y-1">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Interested</p>
            <p className="text-3xl font-extrabold text-slate-800">{interestedLeads}</p>
          </div>
          <div className="p-3.5 rounded-xl bg-emerald-50 text-emerald-600 group-hover:scale-110 transition-transform duration-300">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 3: Not Interested */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-100/60 shadow-sm flex items-center justify-between group hover:border-slate-300 transition-all duration-300">
          <div className="space-y-1">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Not Interested</p>
            <p className="text-3xl font-extrabold text-slate-800">{notInterestedLeads}</p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-100 text-slate-500 group-hover:scale-110 transition-transform duration-300">
            <UserMinus className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 4: Pending Follow-ups */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-100/60 shadow-sm flex items-center justify-between group hover:border-amber-200 transition-all duration-300">
          <div className="space-y-1">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Follow-Ups</p>
            <p className="text-3xl font-extrabold text-slate-800">{pendingFollowUps}</p>
          </div>
          <div className="p-3.5 rounded-xl bg-amber-50 text-amber-600 group-hover:scale-110 transition-transform duration-300">
            <Calendar className="w-5 h-5" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column: Notifications & Charts */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Notifications Area */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-100/60 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-rose-500 animate-bounce" />
                <h2 className="font-bold text-slate-800 text-base">Alerts & Actions Required</h2>
              </div>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-100 font-bold">
                {todayFollowUps.length} Pending Today
              </span>
            </div>

            {todayFollowUps.length > 0 ? (
              <div className="space-y-3.5">
                {todayFollowUps.map(lead => (
                  <div 
                    key={lead.id} 
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-rose-50/20 border border-rose-100/50 rounded-xl hover:bg-rose-50/40 transition-all duration-200"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-slate-800 tracking-wide">{lead.phone}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-md font-semibold ${
                          lead.source === 'meta_ads' 
                            ? 'bg-blue-100 text-blue-800' 
                            : lead.source === 'google_ads' 
                              ? 'bg-amber-100 text-amber-800' 
                              : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {lead.source === 'meta_ads' ? 'Meta Ads' : lead.source === 'google_ads' ? 'Google Ads' : 'WhatsApp'}
                        </span>
                      </div>
                      <p className="text-xs text-rose-600 font-medium flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Follow up required today ({formatDate(lead.followUpDate)})
                      </p>
                    </div>

                    <button
                      onClick={() => onEditLead(lead)}
                      className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-sm transition-all"
                    >
                      <PhoneCall className="w-3.5 h-3.5" />
                      Take Action
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center border border-dashed border-slate-200 rounded-xl p-4 bg-slate-50/20">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mb-2" />
                <p className="text-xs font-medium text-slate-700">All caught up!</p>
                <p className="text-[10px] text-slate-400 mt-1">No leads scheduled for follow-up today.</p>
              </div>
            )}
          </div>

          {/* Lead Source Breakdown Chart */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-100/60 shadow-sm space-y-4">
            <h2 className="font-bold text-slate-800 text-base">Lead Inflow by Source</h2>
            
            {totalLeads > 0 ? (
              <div className="space-y-5">
                {/* Distribution Bar */}
                <div className="w-full h-4 rounded-full overflow-hidden flex bg-slate-100">
                  <div 
                    style={{ width: `${getSourcePercent('meta_ads')}%` }} 
                    className="bg-blue-500 h-full transition-all duration-500" 
                    title={`Meta Ads: ${sourceCounts.meta_ads}`}
                  />
                  <div 
                    style={{ width: `${getSourcePercent('google_ads')}%` }} 
                    className="bg-amber-500 h-full transition-all duration-500" 
                    title={`Google Ads: ${sourceCounts.google_ads}`}
                  />
                  <div 
                    style={{ width: `${getSourcePercent('whatsapp')}%` }} 
                    className="bg-emerald-500 h-full transition-all duration-500" 
                    title={`WhatsApp: ${sourceCounts.whatsapp}`}
                  />
                </div>

                {/* Source Stats */}
                <div className="grid grid-cols-3 gap-4 pt-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                      <span className="text-xs font-semibold text-slate-600">Meta Ads</span>
                    </div>
                    <p className="text-base font-bold text-slate-800 pl-4">{sourceCounts.meta_ads} <span className="text-[10px] text-slate-400 font-medium">({getSourcePercent('meta_ads')}%)</span></p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                      <span className="text-xs font-semibold text-slate-600">Google Ads</span>
                    </div>
                    <p className="text-base font-bold text-slate-800 pl-4">{sourceCounts.google_ads} <span className="text-[10px] text-slate-400 font-medium">({getSourcePercent('google_ads')}%)</span></p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                      <span className="text-xs font-semibold text-slate-600">WhatsApp</span>
                    </div>
                    <p className="text-base font-bold text-slate-800 pl-4">{sourceCounts.whatsapp} <span className="text-[10px] text-slate-400 font-medium">({getSourcePercent('whatsapp')}%)</span></p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic py-4">No data available yet.</p>
            )}
          </div>

        </div>

        {/* Right column: Webhook Automation Simulator */}
        <div>
          <div className="glass-panel p-6 rounded-2xl border border-slate-100/60 shadow-sm space-y-5 h-full">
            <div>
              <h2 className="font-bold text-slate-800 text-base">Automation & Webhook Test</h2>
              <p className="text-[11px] text-slate-400 mt-1">Simulate inbound leads generated by Meta Ads, WhatsApp, or Google Ads click events.</p>
            </div>

            {/* Simulating Actions */}
            <div className="space-y-3.5">
              <button
                onClick={() => handleSimulateWebhook('meta_ads')}
                disabled={simulating}
                className="w-full flex items-center justify-between p-3.5 rounded-xl border border-blue-100 bg-blue-50/20 hover:bg-blue-50/50 hover:border-blue-200 transition-all text-left group"
              >
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-blue-700">Meta Ads Flow</span>
                  <p className="text-[10px] text-slate-500">Simulate customer clicking ad & triggering WhatsApp message</p>
                </div>
                <Play className="w-3.5 h-3.5 text-blue-600 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button
                onClick={() => handleSimulateWebhook('google_ads')}
                disabled={simulating}
                className="w-full flex items-center justify-between p-3.5 rounded-xl border border-amber-100 bg-amber-50/20 hover:bg-amber-50/50 hover:border-amber-200 transition-all text-left group"
              >
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-amber-700">Google Ads Flow</span>
                  <p className="text-[10px] text-slate-500">Simulate click event webhook lead creation</p>
                </div>
                <Play className="w-3.5 h-3.5 text-amber-600 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button
                onClick={() => handleSimulateWebhook('whatsapp')}
                disabled={simulating}
                className="w-full flex items-center justify-between p-3.5 rounded-xl border border-emerald-100 bg-emerald-50/20 hover:bg-emerald-50/50 hover:border-emerald-200 transition-all text-left group"
              >
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-emerald-700">WhatsApp Flow</span>
                  <p className="text-[10px] text-slate-500">Simulate organic customer outreach incoming webhook</p>
                </div>
                <Play className="w-3.5 h-3.5 text-emerald-600 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>

            {/* Simulation Feedback / Payload display */}
            {simRes && (
              <div className={`p-4 rounded-xl border text-xs space-y-3 animate-fadeIn ${
                simRes.success ? 'bg-slate-50 border-slate-200' : 'bg-rose-50 border-rose-100 text-rose-700'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700">Simulated JSON Received:</span>
                  <span className="text-[10px] text-emerald-600 font-bold">HTTP 201</span>
                </div>
                {simRes.success ? (
                  <>
                    <pre className="p-3 bg-slate-900 text-slate-200 rounded-lg overflow-x-auto text-[10px] leading-relaxed font-mono">
                      {JSON.stringify(simRes.payload, null, 2)}
                    </pre>
                    <p className="text-[10px] text-emerald-600 font-medium">✓ {simRes.message}</p>
                  </>
                ) : (
                  <p className="text-xs text-rose-600">{simRes.message}</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
