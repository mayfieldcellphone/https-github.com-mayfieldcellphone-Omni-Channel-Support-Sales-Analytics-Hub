import React, { useState } from "react";
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  PieChart, 
  Pie, 
  Cell,
  LineChart,
  Line
} from "recharts";
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  MessageSquare, 
  ShieldAlert, 
  CheckCircle2, 
  ChevronRight, 
  Briefcase,
  Zap,
  Sparkles,
  RefreshCw,
  Lock,
  Unlock,
  ShieldCheck,
  AlertTriangle
} from "lucide-react";
import { Business, Lead, AnalyticsData } from "../types";

interface DashboardAnalyticsProps {
  businesses: Business[];
  leads: Lead[];
  analytics: AnalyticsData | null;
  onSelectBusinessTab: (bizId: string) => void;
  onUpdateBusiness: (updatedBiz: Business) => void;
}

const COLORS = ["#6366f1", "#10b981", "#ef4444", "#f59e0b", "#3b82f6"];

export default function DashboardAnalytics({ 
  businesses, 
  leads, 
  analytics,
  onSelectBusinessTab,
  onUpdateBusiness
}: DashboardAnalyticsProps) {
  
  if (!analytics) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Owner Mode State Hooks
  const [ownerModeTab, setOwnerModeTab] = useState<"revshare" | "gatekeeper" | "leaks">("revshare");
  const [selectedWebhookBiz, setSelectedWebhookBiz] = useState<string>("biz-1");
  const [webhookStatus, setWebhookStatus] = useState<{ loading: boolean; text: string | null; type: "success" | "error" | null }>({
    loading: false,
    text: null,
    type: null
  });
  const [recalculatingLeaks, setRecalculatingLeaks] = useState(false);
  const [blockerList, setBlockerList] = useState([
    {
      id: "leak-1",
      bizName: "Mayfield Cellphone Repairs",
      impact: "High Margin Drag (-$480 MTD)",
      title: "Wholesale Screen Assemblies Inflation",
      description: "Mayfield has lost 4 qualified leads for iPhone 13 / 14 screen replacement because wholesale replacement glass rose by 14%, stretching standard service margins thin.",
      recalculating: false
    },
    {
      id: "leak-2",
      bizName: "SelfRepairKit",
      impact: "Medium Dropout (-$310 MTD)",
      title: "Heat Gun Assembly Step Abandonment",
      description: "DIY users frequently abandon order baskets when querying screen removal tools due to a lack of reassuring instruction videos showing heatgun safety thresholds.",
      recalculating: false
    },
    {
      id: "leak-3",
      bizName: "RepairBill Portal",
      impact: "High Support Burden (14 escalations/wk)",
      title: "Basic Tier Token Verification Friction",
      description: "Basic plan subscribers attempt to verify client token records but receive billing gate locks, leading to unneeded manual help desk support tickets.",
      recalculating: false
    }
  ]);

  const toggleBusinessStatus = async (bizId: string) => {
    const biz = businesses.find(b => b.id === bizId);
    if (!biz) return;
    
    const nextStatus = biz.subscription_status === "suspended" ? "active" : "suspended";
    
    try {
      const res = await fetch(`/api/businesses/${bizId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscription_status: nextStatus })
      });
      if (res.ok) {
        const saved = await res.json();
        onUpdateBusiness(saved);
      }
    } catch (err) {
      console.error("Failed to toggle business status:", err);
    }
  };

  const triggerStripeWebhook = async (bizId: string) => {
    setWebhookStatus({ loading: true, text: null, type: null });
    try {
      const res = await fetch("/api/webhooks/stripe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "payment_failed", businessId: bizId })
      });
      const data = await res.json();
      if (data.success) {
        setWebhookStatus({
          loading: false,
          text: `[Gatekeeper Failsafe Active] Stripe webhook 'payment_failed' processed for ${businesses.find(b => b.id === bizId)?.name || 'Tenant'}. AI access instantly locked in Firebase!`,
          type: "success"
        });
        
        // Update state to match suspended status
        const biz = businesses.find(b => b.id === bizId);
        if (biz) {
          onUpdateBusiness({
            ...biz,
            subscription_status: "suspended"
          });
        }
      } else {
        setWebhookStatus({
          loading: false,
          text: "Webhook parsing failed on backend gateway server.",
          type: "error"
        });
      }
    } catch (err) {
      setWebhookStatus({
        loading: false,
        text: "Error connecting to centralized webhook broker.",
        type: "error"
      });
    }
  };

  const handleRecalculateLeaks = () => {
    setRecalculatingLeaks(true);
    setTimeout(() => {
      setBlockerList(prev => prev.map(item => ({
        ...item,
        impact: item.id === "leak-1" 
          ? `High Margin Drag (-$${Math.floor(450 + Math.random() * 80)} MTD)`
          : item.id === "leak-2"
          ? `Medium Dropout (-$${Math.floor(290 + Math.random() * 50)} MTD)`
          : `High Support Burden (${Math.floor(12 + Math.random() * 5)} escalations/wk)`
      })));
      setRecalculatingLeaks(false);
    }, 1200);
  };

  // Calculate high-level aggregates
  const totalRevenue = analytics.businessSummary.reduce((sum, b) => sum + b.totalRevenue, 0);
  const totalLeads = leads.length;
  const closedWonLeads = leads.filter(l => l.status === "Closed Won").length;
  const overallConversionRate = totalLeads > 0 
    ? ((closedWonLeads / totalLeads) * 100).toFixed(1) 
    : "0";

  return (
    <div className="space-y-8 animate-fade-in" id="dashboard-analytics-view">
      
      {businesses.some(b => b.subscription_status !== "active") && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-fade-in shadow-sm">
          <div className="flex gap-3">
            <div className="p-2 bg-red-100 rounded-lg text-red-700 shrink-0">
              <ShieldAlert size={20} className="animate-pulse" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-red-950 font-sans uppercase tracking-wide">
                🔒 PAYMENT REQUIRED: SaaS Gatekeeper Failsafe Active
              </h4>
              <p className="text-[11px] text-red-800 leading-relaxed font-sans mt-0.5">
                Stripe reported a payment failure. The AI agent reply system is currently locked for <strong>{businesses.filter(b => b.subscription_status !== "active").map(b => b.name).join(", ")}</strong>. Please restore active billing to instantly resume chatbot automation.
              </p>
            </div>
          </div>
          <span className="px-3 py-1.5 bg-red-600 text-white font-mono text-[10px] font-bold rounded-lg shrink-0">
            PAYMENT REQUIRED
          </span>
        </div>
      )}
      
      {/* KPI Top Row Banner */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        
        {/* KPI 1 */}
        <div className="bg-white border border-slate-100 p-6 rounded-xl flex items-center justify-between card-shadow relative overflow-hidden group hover:border-slate-200 transition" id="kpi-revenue">
          <div className="absolute right-0 bottom-0 translate-x-3 translate-y-3 opacity-[0.02] group-hover:scale-110 transition duration-300 pointer-events-none">
            <DollarSign size={140} className="text-slate-900" />
          </div>
          <div className="space-y-1 z-10">
            <span className="text-xs font-mono text-slate-400 tracking-wider uppercase block">Combined Revenue</span>
            <span className="text-2xl font-bold font-sans text-slate-900 block data-font">
              ${totalRevenue.toLocaleString()}
            </span>
            <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
              <TrendingUp size={14} /> +18.4% growth index
            </span>
          </div>
          <div className="p-3.5 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-lg z-10">
            <DollarSign size={22} />
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white border border-slate-100 p-6 rounded-xl flex items-center justify-between card-shadow relative overflow-hidden group hover:border-slate-200 transition" id="kpi-leads">
          <div className="absolute right-0 bottom-0 translate-x-3 translate-y-3 opacity-[0.02] group-hover:scale-110 transition duration-300 pointer-events-none">
            <Users size={140} className="text-slate-900" />
          </div>
          <div className="space-y-1 z-10">
            <span className="text-xs font-mono text-slate-400 tracking-wider uppercase block">Total Leads Logged</span>
            <span className="text-2xl font-bold font-sans text-slate-900 block data-font">
              {totalLeads}
            </span>
            <span className="text-xs text-slate-500">
              Active across all channels
            </span>
          </div>
          <div className="p-3.5 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-lg z-10">
            <Users size={22} />
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white border border-slate-100 p-6 rounded-xl flex items-center justify-between card-shadow relative overflow-hidden group hover:border-slate-200 transition" id="kpi-conversion">
          <div className="absolute right-0 bottom-0 translate-x-3 translate-y-3 opacity-[0.02] group-hover:scale-110 transition duration-300 pointer-events-none">
            <CheckCircle2 size={140} className="text-slate-900" />
          </div>
          <div className="space-y-1 z-10">
            <span className="text-xs font-mono text-slate-400 tracking-wider uppercase block">Avg Conversion Rate</span>
            <span className="text-2xl font-bold font-sans text-slate-900 block data-font">
              {overallConversionRate}%
            </span>
            <span className="text-xs text-indigo-600 font-medium">
              {closedWonLeads} closed won deals
            </span>
          </div>
          <div className="p-3.5 bg-violet-50 border border-violet-100 text-violet-600 rounded-lg z-10">
            <CheckCircle2 size={22} />
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white border border-slate-100 p-6 rounded-xl flex items-center justify-between card-shadow relative overflow-hidden group hover:border-slate-200 transition" id="kpi-chatbot">
          <div className="absolute right-0 bottom-0 translate-x-3 translate-y-3 opacity-[0.02] group-hover:scale-110 transition duration-300 pointer-events-none">
            <MessageSquare size={140} className="text-slate-900" />
          </div>
          <div className="space-y-1 z-10">
            <span className="text-xs font-mono text-slate-400 tracking-wider uppercase block">AI Chat Resolution</span>
            <span className="text-2xl font-bold font-sans text-slate-900 block data-font">
              {analytics.chatbotStats.resolutionRate}%
            </span>
            <span className="text-xs text-emerald-600 font-medium">
              {analytics.chatbotStats.aiResolved} queries auto-resolved
            </span>
          </div>
          <div className="p-3.5 bg-amber-50 border border-amber-100 text-amber-600 rounded-lg z-10">
            <MessageSquare size={22} />
          </div>
        </div>

      </div>

      {/* Main Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Chart 1: Revenue by Business */}
        <div className="bg-white border border-slate-100 p-6 rounded-xl lg:col-span-2 space-y-4 card-shadow animate-fade-in" id="chart-revenue-comparison">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-md font-bold text-slate-900 font-sans">Business Sales Breakdown</h3>
              <p className="text-xs text-slate-500">Total base store revenue combined with new closed-won lead value.</p>
            </div>
            <div className="flex gap-4 text-xs">
              <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                <span className="w-2.5 h-2.5 rounded bg-indigo-500 block"></span> Base Revenue
              </span>
              <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                <span className="w-2.5 h-2.5 rounded bg-emerald-500 block"></span> Won Lead Value
              </span>
            </div>
          </div>

          <div className="h-72 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={analytics.businessSummary}
                margin={{ top: 10, right: 10, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#64748b" tickFormatter={(v) => v.split(" ")[0]} />
                <YAxis stroke="#64748b" tickFormatter={(v) => `$${v}`} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#ffffff", borderColor: "#e2e8f0", borderRadius: "12px", color: "#0f172a", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                  formatter={(value) => [`$${value}`, ""]}
                />
                <Bar dataKey="baseRevenue" fill="#6366f1" radius={[4, 4, 0, 0]} name="Store Base" />
                <Bar dataKey="wonLeadsRevenue" fill="#10b981" radius={[4, 4, 0, 0]} name="Won Leads" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Omni-Channel Source Breakdown */}
        <div className="bg-white border border-slate-100 p-6 rounded-xl flex flex-col justify-between card-shadow animate-fade-in" id="chart-omnichannel-pie">
          <div className="space-y-1">
            <h3 className="text-md font-bold text-slate-900 font-sans">Omni-Channel Lead Flow</h3>
            <p className="text-xs text-slate-500">Distribution of client inquiries by network channel.</p>
          </div>

          <div className="h-56 w-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analytics.sourceBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="count"
                >
                  {analytics.sourceBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: "#ffffff", borderColor: "#e2e8f0", borderRadius: "12px", color: "#0f172a", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-slate-900 data-font">{totalLeads}</span>
              <span className="text-[10px] uppercase font-mono text-slate-400 tracking-wider">Inquiries</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs pt-4 border-t border-slate-100">
            {analytics.sourceBreakdown.map((item, idx) => (
              <div key={item.name} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full block" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                <span className="text-slate-600 font-medium font-sans">{item.name} ({item.count})</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* BIZHUB SYSTEM OPERATOR CONTROL DECK (OWNER MODE) */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl space-y-6 card-shadow text-white animate-fade-in" id="owner-operator-control-deck">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-lg">
              <Lock size={20} />
            </div>
            <div>
              <h3 className="text-md font-bold tracking-tight font-sans">
                🛡️ BizHub SaaS System Operator Control Deck
              </h3>
              <p className="text-xs text-slate-400">
                Centralized financial hub, RAG database monitoring, and Firebase Gatekeeper Kill-Switches.
              </p>
            </div>
          </div>
          <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs self-start md:self-auto">
            <button
              onClick={() => { setOwnerModeTab("revshare"); setWebhookStatus({ loading: false, text: null, type: null }); }}
              className={`px-3 py-1.5 rounded-md font-medium transition cursor-pointer ${ownerModeTab === "revshare" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"}`}
            >
              Rev-Share Ledger
            </button>
            <button
              onClick={() => { setOwnerModeTab("gatekeeper"); setWebhookStatus({ loading: false, text: null, type: null }); }}
              className={`px-3 py-1.5 rounded-md font-medium transition cursor-pointer ${ownerModeTab === "gatekeeper" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"}`}
            >
              Gatekeeper Simulator
            </button>
            <button
              onClick={() => { setOwnerModeTab("leaks"); setWebhookStatus({ loading: false, text: null, type: null }); }}
              className={`px-3 py-1.5 rounded-md font-medium transition cursor-pointer ${ownerModeTab === "leaks" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"}`}
            >
              Leaks Diagnostic
            </button>
          </div>
        </div>

        {/* Tab 1: Rev-Share Ledger */}
        {ownerModeTab === "revshare" && (
          <div className="space-y-4 animate-fade-in" id="tab-revshare">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-950 border border-slate-800 p-4 rounded-lg flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Total SaaS ARR Index</span>
                  <span className="text-xl font-bold font-sans text-emerald-400 block">
                    ${businesses.reduce((sum, b) => {
                      const flat = b.subscription_tier === "BASIC" ? 0 : b.subscription_tier === "PRO" ? 49 : 99;
                      return sum + (flat * 12);
                    }, 0).toLocaleString()} /yr
                  </span>
                </div>
                <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
                  <TrendingUp size={18} />
                </div>
              </div>
              <div className="bg-slate-950 border border-slate-800 p-4 rounded-lg flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Central commission index</span>
                  <span className="text-xl font-bold font-sans text-indigo-400 block">1% Sales + Flat Fees</span>
                </div>
                <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg">
                  <Zap size={18} />
                </div>
              </div>
              <div className="bg-slate-950 border border-slate-800 p-4 rounded-lg flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Owed to SaaS Owner (You)</span>
                  <span className="text-xl font-bold font-sans text-amber-400 block">
                    ${businesses.reduce((sum, b) => {
                      const flat = b.subscription_tier === "BASIC" ? 0 : b.subscription_tier === "PRO" ? 49 : 99;
                      const sales = b.revenue || 0;
                      return sum + flat + (sales * 0.01);
                    }, 0).toFixed(2)}
                  </span>
                </div>
                <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg">
                  <DollarSign size={18} />
                </div>
              </div>
            </div>

            {/* SaaS Subscription Tier Pricing Matrix */}
            <div className="border border-slate-800/80 bg-slate-950/70 p-4.5 rounded-xl space-y-3.5 shadow-xl">
              <div className="flex items-center gap-2">
                <Sparkles size={14} className="text-indigo-400" />
                <h4 className="text-[10px] font-bold uppercase tracking-wider font-mono text-slate-300">
                  BizHub Multi-Tenant Package Matrix & AI Enforcement Rules
                </h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border border-slate-800/70 bg-slate-900/20 p-4 rounded-xl flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold text-slate-200">BASIC (FREE TIER)</span>
                      <span className="text-[9px] font-mono font-bold text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded uppercase">Free</span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-sans leading-relaxed">
                      <strong>Goal:</strong> Simple onboarding assistant. Connects a single site, answers basic FAQs from the Knowledge Base, capped at 100 replies/mo.
                    </p>
                    <ul className="text-[10px] text-slate-500 font-sans mt-3 space-y-1.5 list-disc list-inside">
                      <li>Answers questions using KB</li>
                      <li>Max 1 Business Website</li>
                      <li className="text-red-400/80 font-medium">✖ Leads Locked (Triggers Upgrade message)</li>
                      <li className="text-red-400/80 font-medium">✖ Financial tools locked</li>
                    </ul>
                  </div>
                  <div className="text-[9px] font-mono text-slate-500 pt-2.5 border-t border-slate-900 mt-4">
                    Gate Check: FAQ context only
                  </div>
                </div>

                <div className="border border-indigo-900/50 bg-indigo-950/10 p-4 rounded-xl flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold text-indigo-300">PRO PLAN</span>
                      <span className="text-[9px] font-mono font-bold text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded font-mono">$49/MO</span>
                    </div>
                    <p className="text-[10px] text-indigo-300/80 font-sans leading-relaxed">
                      <strong>Goal:</strong> Active Sales & Leads. Captures client Name, Email, and Phone for repairs. Connects WhatsApp/Webforms. Supports up to 3 domains.
                    </p>
                    <ul className="text-[10px] text-slate-400 font-sans mt-3 space-y-1.5 list-disc list-inside">
                      <li className="text-indigo-300">Unlimited Lead Capture</li>
                      <li>Up to 3 multi-site domains</li>
                      <li>WhatsApp integration channel</li>
                      <li className="text-red-400/80 font-medium">✖ Invoicing & Voice locked</li>
                    </ul>
                  </div>
                  <div className="text-[9px] font-mono text-indigo-400/70 pt-2.5 border-t border-indigo-950 mt-4">
                    Gate Check: Leads active, Financials locked
                  </div>
                </div>

                <div className="border border-purple-900/50 bg-purple-950/10 p-4 rounded-xl flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold text-purple-300">ENTERPRISE OS</span>
                      <span className="text-[9px] font-mono font-bold text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded font-mono">$99/MO</span>
                    </div>
                    <p className="text-[10px] text-purple-300/80 font-sans leading-relaxed">
                      <strong>Goal:</strong> Complete Billing & Operations. Secure invoice generation (Voice/Text), voice recalculations, unlimited multi-site bots.
                    </p>
                    <ul className="text-[10px] text-slate-400 font-sans mt-3 space-y-1.5 list-disc list-inside">
                      <li className="text-purple-300">PCI-Compliant Invoice Suite</li>
                      <li className="text-purple-300">Natural Voice-To-Finance</li>
                      <li>Unlimited domains & message volume</li>
                      <li>Source site attribution analytics</li>
                    </ul>
                  </div>
                  <div className="text-[9px] font-mono text-purple-400/70 pt-2.5 border-t border-purple-950 mt-4">
                    Gate Check: Full Business OS enabled
                  </div>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-mono text-[10px] uppercase">
                    <th className="py-2.5 px-3">Business Tenant</th>
                    <th className="py-2.5 px-3">SaaS Plan</th>
                    <th className="py-2.5 px-3">Firebase Status</th>
                    <th className="py-2.5 px-3">Invoice Auth</th>
                    <th className="py-2.5 px-3">MTD sales</th>
                    <th className="py-2.5 px-3">Commission Owed</th>
                    <th className="py-2.5 px-3 text-right">Failsafe Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {businesses.map((biz) => {
                    const flatFee = biz.subscription_tier === "BASIC" ? 0 : biz.subscription_tier === "PRO" ? 49 : 99;
                    const commission = (biz.revenue || 0) * 0.01;
                    const totalOwed = flatFee + commission;
                    const isSuspended = biz.subscription_status === "suspended";

                    return (
                      <tr key={biz.id} className="hover:bg-slate-850/40 transition">
                        <td className="py-3 px-3 font-medium text-slate-200">
                          <span className="block font-semibold">{biz.name}</span>
                          <span className="text-[10px] text-slate-400 block font-sans">{biz.category}</span>
                        </td>
                        <td className="py-3 px-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                            biz.subscription_tier === "ENTERPRISE" ? "bg-purple-500/15 text-purple-400 border border-purple-500/30" :
                            biz.subscription_tier === "PRO" ? "bg-blue-500/15 text-blue-400 border border-blue-500/30" :
                            "bg-slate-500/15 text-slate-400 border border-slate-500/30"
                          }`}>
                            {biz.subscription_tier || "BASIC"}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                            isSuspended ? "bg-red-500/15 text-red-400" : "bg-emerald-500/15 text-emerald-400"
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${isSuspended ? "bg-red-400" : "bg-emerald-400"}`}></span>
                            {isSuspended ? "Suspended" : "Active"}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span className={`inline-flex items-center gap-1 text-[10px] font-medium ${
                            biz.is_payment_confirmed ? "text-emerald-400" : "text-amber-400"
                          }`}>
                            {biz.is_payment_confirmed ? "Verified" : "Unverified"}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-300">
                          ${biz.revenue?.toLocaleString() || "0"}
                        </td>
                        <td className="py-3 px-3 font-mono text-amber-400 font-bold">
                          ${totalOwed.toFixed(2)}
                          <span className="text-[9px] text-slate-500 block font-normal">
                            ${flatFee} + 1%
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => toggleBusinessStatus(biz.id)}
                            className={`px-2.5 py-1 text-[10px] rounded font-semibold border transition cursor-pointer ${
                              isSuspended 
                                ? "bg-emerald-600 border-emerald-500 hover:bg-emerald-500 text-white" 
                                : "bg-red-600/15 border-red-500/30 hover:bg-red-600 hover:text-white text-red-400"
                            }`}
                          >
                            {isSuspended ? "Grant Access" : "Kill Switch"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Firebase Gatekeeper (Stripe webhook simulation) */}
        {ownerModeTab === "gatekeeper" && (
          <div className="space-y-4 animate-fade-in" id="tab-gatekeeper">
            <div className="bg-slate-950 border border-slate-800 p-5 rounded-lg space-y-4">
              <h4 className="text-sm font-bold text-slate-200 flex items-center gap-1.5 font-sans">
                <ShieldAlert size={16} className="text-red-400" /> Stripe Webhook Ingestion Broker
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Our <strong>Firebase Gatekeeper Protection protocol</strong> intercepts every inbound chatbot connection.
                If Stripe reports a subscription payment failure, the webhook is received, an audit trace is dispatched, 
                and the tenant's access status is flipped to <code>suspended</code> inside Firebase, preventing unauthorized RAG actions instantly.
              </p>

              <div className="pt-2 flex flex-col md:flex-row md:items-end gap-4 border-t border-slate-900">
                <div className="space-y-1.5 flex-1">
                  <label className="text-[10px] font-mono uppercase text-slate-500 block">Target Business Tenant</label>
                  <select
                    value={selectedWebhookBiz}
                    onChange={(e) => setSelectedWebhookBiz(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 text-xs rounded-lg px-3 py-2 text-slate-300 outline-none focus:border-indigo-500"
                  >
                    {businesses.map(b => (
                      <option key={b.id} value={b.id}>
                        {b.name} (Plan: {b.subscription_tier || "BASIC"})
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={() => triggerStripeWebhook(selectedWebhookBiz)}
                  disabled={webhookStatus.loading}
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-semibold rounded-lg shadow transition flex items-center gap-1.5 cursor-pointer shrink-0 disabled:opacity-50"
                >
                  <RefreshCw size={14} className={webhookStatus.loading ? "animate-spin" : ""} />
                  Simulate 'payment_failed' Stripe Webhook
                </button>
              </div>

              {webhookStatus.text && (
                <div className={`p-4 rounded-lg text-xs font-mono border ${
                  webhookStatus.type === "success" 
                    ? "bg-red-500/15 border-red-500/30 text-red-400" 
                    : "bg-amber-500/15 border-amber-500/30 text-amber-400"
                }`}>
                  <div className="flex items-start gap-2">
                    <span className="p-1 bg-red-500/20 text-red-400 rounded">⚠️</span>
                    <div>
                      <strong className="block mb-1">Central Webhook Agent Notification:</strong>
                      <span>{webhookStatus.text}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Leaks & Revenue Blockers */}
        {ownerModeTab === "leaks" && (
          <div className="space-y-4 animate-fade-in" id="tab-leaks">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider uppercase block">
                Top 3 Revenue Blockers & Margin Leaks (Leads Ingest)
              </span>
              <button
                onClick={handleRecalculateLeaks}
                disabled={recalculatingLeaks}
                className="px-3 py-1.5 bg-indigo-600/20 border border-indigo-500/30 hover:bg-indigo-600 hover:text-white hover:border-transparent rounded-lg transition text-indigo-400 flex items-center gap-1 text-xs cursor-pointer"
              >
                <Sparkles size={12} className={recalculatingLeaks ? "animate-spin" : ""} />
                {recalculatingLeaks ? "Recalculating..." : "Run Diagnostic Ingest"}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {blockerList.map((item) => (
                <div key={item.id} className="bg-slate-950 border border-slate-800 p-4 rounded-xl relative overflow-hidden flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-start gap-2">
                      <span className="text-[10px] text-slate-400 font-medium font-sans">
                        {item.bizName}
                      </span>
                      <span className="text-[10px] font-mono font-bold text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded border border-red-500/20 shrink-0">
                        {item.impact}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-100 font-sans">{item.title}</h4>
                      <p className="text-[11px] text-slate-400 leading-relaxed mt-1 font-sans">
                        {item.description}
                      </p>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-slate-900 flex justify-between items-center text-[10px] font-mono text-blue-400 uppercase">
                    <span>Audit Diagnostic Check</span>
                    <span className="text-slate-500">Verified</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Row 3: Business Portfolios */}
      <div className="space-y-4" id="portfolio-list">
        <h3 className="text-lg font-bold text-slate-900 font-sans flex items-center gap-2">
          <Briefcase size={20} className="text-blue-600" /> Multi-Business Operations Portfolios
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {analytics.businessSummary.map((biz) => {
            const originalBiz = businesses.find(b => b.id === biz.id);
            return (
              <div 
                key={biz.id} 
                className="bg-white border border-slate-100 p-6 rounded-xl flex flex-col justify-between hover:border-blue-500/40 hover:shadow-md transition duration-300 group card-shadow"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="px-2.5 py-1 text-[10px] uppercase font-mono tracking-wider bg-slate-50 text-slate-600 rounded-lg border border-slate-200">
                      {biz.category}
                    </span>
                    <span className="text-xs font-semibold text-green-600 flex items-center gap-0.5 bg-green-50 px-2 py-0.5 rounded-lg border border-green-100">
                      Conv: {biz.conversionRate}%
                    </span>
                  </div>

                  <div>
                    <h4 className="text-md font-bold text-slate-900 group-hover:text-blue-600 transition">
                      {biz.name}
                    </h4>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                      {originalBiz?.description}
                    </p>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-mono block">Quarterly Sales</span>
                    <span className="text-md font-bold text-slate-800 data-font">${biz.totalRevenue.toLocaleString()}</span>
                  </div>
                  
                  <button 
                    onClick={() => onSelectBusinessTab(biz.id)}
                    className="px-3 py-1.5 bg-slate-50 hover:bg-blue-600 hover:text-white text-slate-700 hover:border-transparent border border-slate-200 rounded-lg transition duration-200 flex items-center gap-1 text-xs font-medium cursor-pointer"
                  >
                    AI Config <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
 );
}

}

