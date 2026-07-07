import React, { useState, useEffect } from 'react';
import { Lock, User, Eye, EyeOff, RefreshCw, AlertCircle, Zap, CheckCircle2, Shield, KeyRound, Clock, ShieldCheck, BarChart3, Users, KanbanSquare } from 'lucide-react';
import { crmApi } from '../api/crmApi';

export default function Login({ onLoginSuccess, initialMessage }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Pre-fill username if "Remember Me" was previously selected
  useEffect(() => {
    const savedUser = localStorage.getItem('crm_remembered_username');
    if (savedUser) {
      setUsername(savedUser);
      setRememberMe(true);
    }
  }, []);

  // Sync logout messages
  useEffect(() => {
    if (initialMessage) {
      setError(initialMessage);
    }
  }, [initialMessage]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await crmApi.login(username.trim(), password);
      if (res.token) {
        setSuccess(true);
        // Save token in sessionStorage (wiped automatically when tab closes)
        sessionStorage.setItem('crm_token', res.token);
        
        // Handle "Remember Me"
        if (rememberMe) {
          localStorage.setItem('crm_remembered_username', username.trim());
        } else {
          localStorage.removeItem('crm_remembered_username');
        }

        // Delay success callback slightly to let the transition finish beautifully
        setTimeout(() => {
          onLoginSuccess();
        }, 850);
      }
    } catch (err) {
      console.error(err);
      if (err.message.includes('Failed to fetch')) {
        setError('CRM backend is currently offline. Please try again later.');
      } else {
        setError(err.message || 'Invalid username or password.');
      }
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-950 text-slate-100 relative overflow-hidden font-sans">
      
      {/* Background Ambient Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-crm-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none" />

      {/* LEFT PANEL: SaaS Info Branding & Illustration Preview (Desktop/Tablet Only) */}
      <div className="hidden md:flex md:w-[48%] lg:w-[45%] bg-slate-950 border-r border-slate-900/60 p-12 lg:p-16 flex-col justify-between relative overflow-hidden select-none h-screen">
        {/* Subtle grid background pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-35" />
        <div className="absolute top-[20%] right-[-20%] w-[60%] h-[40%] rounded-full bg-crm-500/10 blur-[130px] rotate-45 pointer-events-none" />
        
        {/* Top Header Logo */}
        <div className="flex items-center gap-3 relative z-10 animate-fadeIn">
          <div className="p-2 bg-crm-500 text-white rounded-xl shadow-lg shadow-crm-500/20">
            <Zap className="w-5 h-5" />
          </div>
          <span className="font-extrabold text-lg text-white tracking-tight leading-none">LeadFlow <span className="text-crm-500">CRM</span></span>
        </div>

        {/* Mid Panel: SaaS Value Copy */}
        <div className="space-y-8 my-auto relative z-10 max-w-md animate-fadeInUp">
          <div className="space-y-4">
            <h2 className="text-3xl font-extrabold text-white tracking-tight leading-tight">
              A smarter way to manage leads, automate follow-ups, and close more deals.
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed font-medium">
              Organize every lead, track conversations, schedule follow-ups, and monitor your complete sales pipeline from one secure dashboard.
            </p>
          </div>

          {/* Native HTML Mock Dashboard Illustration */}
          <div className="border border-slate-800/40 rounded-2xl bg-slate-900/10 p-4 shadow-2xl backdrop-blur-md overflow-hidden aspect-[4/3] flex flex-col justify-between max-w-sm mx-auto group hover:border-slate-800/90 transition-all duration-500">
            {/* Mock Header */}
            <div className="flex items-center justify-between border-b border-slate-900 pb-2">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500/80"></span>
                <span className="w-2 h-2 rounded-full bg-amber-500/80"></span>
                <span className="w-2 h-2 rounded-full bg-emerald-500/80"></span>
              </div>
              <div className="h-2 w-16 rounded-full bg-slate-900"></div>
            </div>
            
            {/* Mock Pipeline */}
            <div className="grid grid-cols-3 gap-3 flex-1 pt-4">
              <div className="space-y-2">
                <div className="flex items-center gap-1">
                  <Users className="w-3 h-3 text-crm-500" />
                  <div className="h-1.5 w-8 rounded bg-crm-500/30"></div>
                </div>
                <div className="p-2 rounded bg-slate-950/80 border border-slate-900 space-y-1">
                  <div className="h-1 w-full rounded bg-slate-800"></div>
                  <div className="h-0.5 w-2/3 rounded bg-slate-800/40"></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-1">
                  <KanbanSquare className="w-3 h-3 text-indigo-500" />
                  <div className="h-1.5 w-8 rounded bg-indigo-500/30"></div>
                </div>
                <div className="p-2 rounded bg-slate-950/80 border border-slate-900 space-y-1">
                  <div className="h-1 w-full rounded bg-slate-800"></div>
                  <div className="h-0.5 w-2/3 rounded bg-slate-800/40"></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-1">
                  <BarChart3 className="w-3 h-3 text-emerald-500" />
                  <div className="h-1.5 w-8 rounded bg-emerald-500/30"></div>
                </div>
                <div className="p-2 rounded bg-slate-950/80 border border-slate-900 space-y-1">
                  <div className="h-1 w-full rounded bg-slate-800"></div>
                  <div className="h-0.5 w-2/3 rounded bg-slate-800/40"></div>
                </div>
              </div>
            </div>
            
            {/* Mock Chart Footer */}
            <div className="border-t border-slate-900 pt-3 flex items-center justify-between text-[8px] text-slate-500 font-bold uppercase tracking-wide">
              <span>Monthly Inflow</span>
              <div className="flex gap-0.5 items-end h-4">
                <span className="w-0.5 h-2 bg-slate-850 rounded-full"></span>
                <span className="w-0.5 h-3.5 bg-indigo-500 rounded-full"></span>
                <span className="w-0.5 h-1.5 bg-slate-850 rounded-full"></span>
                <span className="w-0.5 h-4 bg-crm-500 rounded-full"></span>
              </div>
            </div>
          </div>

          {/* Feature Lists */}
          <div className="space-y-3 pt-2">
            <div className="flex gap-3.5 p-3 rounded-xl bg-slate-900/25 border border-slate-900/60 hover:border-slate-900 hover:scale-[1.01] transition-all duration-300 cursor-default">
              <CheckCircle2 className="w-4.5 h-4.5 text-crm-500 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold text-slate-200">Smart Lead Pipeline</h4>
                <p className="text-[10px] text-slate-400 leading-normal">Manage every lead from New to Closed with drag-and-drop stages.</p>
              </div>
            </div>

            <div className="flex gap-3.5 p-3 rounded-xl bg-slate-900/25 border border-slate-900/60 hover:border-slate-900 hover:scale-[1.01] transition-all duration-300 cursor-default">
              <CheckCircle2 className="w-4.5 h-4.5 text-crm-500 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold text-slate-200">Automated Follow-ups</h4>
                <p className="text-[10px] text-slate-400 leading-normal">Never miss a customer follow-up with reminders and notifications.</p>
              </div>
            </div>

            <div className="flex gap-3.5 p-3 rounded-xl bg-slate-900/25 border border-slate-900/60 hover:border-slate-900 hover:scale-[1.01] transition-all duration-300 cursor-default">
              <CheckCircle2 className="w-4.5 h-4.5 text-crm-500 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold text-slate-200">WhatsApp & Ads Integration</h4>
                <p className="text-[10px] text-slate-400 leading-normal">Capture leads automatically from Meta Ads, Google Ads, and WhatsApp Business.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Footer Credits */}
        <div className="flex items-center justify-between text-[10px] font-semibold text-slate-650 relative z-10">
          <span>&copy; 2026 LeadFlow CRM</span>
          <span className="flex items-center gap-1.5 select-none">
            <Shield className="w-3.5 h-3.5" />
            Secure &bull; Reliable &bull; Enterprise Ready
          </span>
        </div>
      </div>

      {/* RIGHT PANEL: Polished Login Card (All Devices) */}
      <div className="w-full md:w-[52%] lg:w-[55%] flex flex-col justify-between p-6 sm:p-12 md:p-16 lg:p-24 relative z-10 h-screen md:h-screen overflow-y-auto">
        
        {/* Mobile Logo Header */}
        <div className="md:hidden flex items-center gap-2 mb-8 animate-fadeIn">
          <div className="p-1.5 bg-crm-500 text-white rounded-lg">
            <Zap className="w-4 h-4" />
          </div>
          <span className="font-extrabold text-sm text-white tracking-tight">LeadFlow <span className="text-crm-500">CRM</span></span>
        </div>

        {/* Center Glassmorphic Card */}
        <div className="my-auto w-full max-w-md mx-auto space-y-8 bg-slate-900/40 border border-slate-900/80 rounded-[28px] p-8 sm:p-10 shadow-2xl backdrop-blur-md animate-fadeInUp">
          
          <div className="space-y-2">
            <h1 className="text-2xl font-black text-white tracking-tight">Welcome Back</h1>
            <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
              Sign in to access your CRM dashboard, manage leads, monitor your sales pipeline, and securely continue where you left off.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div role="alert" className="flex items-start gap-2.5 p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs leading-relaxed animate-fadeIn">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Username Input with Floating Label */}
            <div className="relative group">
              <User className="absolute left-3.5 top-[18px] w-4.5 h-4.5 text-slate-500 group-focus-within:text-crm-500 transition-colors z-20" />
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder=" "
                aria-label="Username"
                className="peer block w-full pl-11 pr-4 pt-6 pb-2.5 bg-slate-950/65 border border-slate-900 focus:border-crm-500 focus:ring-2 focus:ring-crm-500/25 text-white rounded-xl text-xs focus:outline-none transition-all placeholder-transparent"
                disabled={loading || success}
              />
              <label
                htmlFor="username"
                className="absolute text-slate-500 duration-150 transform -translate-y-3.5 scale-75 top-4 z-10 origin-[0] left-11 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3.5 text-[11px] pointer-events-none select-none font-semibold"
              >
                Username
              </label>
            </div>

            {/* Password Input with Floating Label */}
            <div className="relative group">
              <Lock className="absolute left-3.5 top-[18px] w-4.5 h-4.5 text-slate-500 group-focus-within:text-crm-500 transition-colors z-20" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder=" "
                aria-label="Password"
                className="peer block w-full pl-11 pr-11 pt-6 pb-2.5 bg-slate-950/65 border border-slate-900 focus:border-crm-500 focus:ring-2 focus:ring-crm-500/25 text-white rounded-xl text-xs focus:outline-none transition-all placeholder-transparent"
                disabled={loading || success}
              />
              <label
                htmlFor="password"
                className="absolute text-slate-500 duration-150 transform -translate-y-3.5 scale-75 top-4 z-10 origin-[0] left-11 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3.5 text-[11px] pointer-events-none select-none font-semibold"
              >
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-3.5 top-[18px] text-slate-500 hover:text-slate-300 transition-colors z-20"
                disabled={loading || success}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Remember Me & Forgot Password wrapper */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center">
                <input
                  id="remember_me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-3.5 w-3.5 rounded border-slate-900 bg-slate-950 text-crm-500 focus:ring-crm-500/20 bg-transparent text-xs cursor-pointer"
                  disabled={loading || success}
                />
                <label htmlFor="remember_me" className="ml-2 block text-xs text-slate-400 select-none font-medium cursor-pointer">
                  Remember me
                </label>
              </div>

              <button
                type="button"
                onClick={() => alert('Forgot password features are disabled for security. Please configure the ADMIN_PASSWORD environment variable inside your Render dashboard settings to change keys.')}
                className="text-[10px] text-slate-500 hover:text-crm-400 transition-colors font-semibold"
              >
                Forgot Password?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || success}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-crm-600 to-crm-500 hover:from-crm-500 hover:to-crm-600 disabled:from-crm-600/40 disabled:to-crm-500/40 text-white text-xs font-bold shadow-lg shadow-crm-500/10 hover:shadow-crm-500/25 active:scale-[0.98] transition-all duration-200 cursor-pointer"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Signing you in...</span>
                </div>
              ) : success ? (
                <span>Welcome back!</span>
              ) : (
                <span>Sign In</span>
              )}
            </button>
          </form>

          {/* Security Badge Info Box (Professional Icons Only) */}
          <div className="pt-4 border-t border-slate-900 flex items-center justify-center gap-6 text-[9px] text-slate-500 font-bold select-none leading-none">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-crm-500" />
              <span>Secure Authentication</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <KeyRound className="w-3 h-3 text-slate-650" />
                <span>JWT</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-650" />
                <span>Auto-Timeout</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer (Mobile Only) */}
        <div className="md:hidden flex flex-col items-center gap-1 text-[10px] text-slate-650 mt-10 text-center select-none font-semibold animate-fadeIn">
          <p>&copy; 2026 LeadFlow CRM</p>
          <p>Secure &bull; Reliable &bull; Enterprise Ready</p>
        </div>

      </div>
    </div>
  );
}
