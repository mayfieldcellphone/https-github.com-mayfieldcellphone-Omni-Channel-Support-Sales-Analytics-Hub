import React, { useState, useEffect } from "react";
import { 
  TrendingUp, 
  Bot, 
  Users, 
  Sliders, 
  Shield, 
  FileSpreadsheet, 
  Cpu, 
  Lock, 
  User, 
  CheckCircle2, 
  Smartphone,
  Globe,
  Database,
  LogOut
} from "lucide-react";
import { Business, Lead, AnalyticsData, UserRole } from "./types";
import DashboardAnalytics from "./components/DashboardAnalytics";
import ChatbotConfigurator from "./components/ChatbotConfigurator";
import LeadsManager from "./components/LeadsManager";
import OmniChannelSimulator from "./components/OmniChannelSimulator";
import SecurityConsole from "./components/SecurityConsole";
import LoginScreen from "./components/LoginScreen";
import OnboardingWizard from "./components/OnboardingWizard";

export default function App() {
  // Session Authentication State
  const [sessionUser, setSessionUser] = useState<{
    email: string;
    name: string;
    avatar: string;
    provider: "google" | "github";
    role: "Admin" | "Manager" | "Agent";
  } | null>(() => {
    const cached = localStorage.getItem("repairhub_user_session");
    return cached ? JSON.parse(cached) : null;
  });

  // Session Roles and Navigation tabs
  const [activeTab, setActiveTab] = useState<"analytics" | "chatbots" | "leads" | "simulator" | "security">("analytics");
  const [activeRole, setActiveRole] = useState<UserRole>(() => {
    const cached = localStorage.getItem("repairhub_user_session");
    if (cached) {
      return JSON.parse(cached).role;
    }
    return "Admin";
  });

  // Reactive email variable compatible with legacy parameters
  const userEmail = sessionUser ? sessionUser.email : "admin@mayfieldrepairs.com.au";
  
  // Data State
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  // Quick helper selector callback to redirect to configure bot
  const [selectedBizId, setSelectedBizId] = useState<string>("");

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch businesses
      const bizRes = await fetch("/api/businesses");
      const bizData = await bizRes.json();
      setBusinesses(bizData);
      if (bizData.length > 0 && !selectedBizId) {
        setSelectedBizId(bizData[0].id);
      }

      // Fetch leads
      const leadsRes = await fetch("/api/leads");
      const leadsData = await leadsRes.json();
      setLeads(leadsData);

      // Fetch aggregated analytics
      const analyticsRes = await fetch("/api/analytics");
      const analyticsData = await analyticsRes.json();
      setAnalytics(analyticsData);

    } catch (e) {
      console.error("Failed to load initial full-stack data pool:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Update business configuration locally
  const handleUpdateBusiness = (updatedBiz: Business) => {
    setBusinesses((prev) => prev.map((b) => (b.id === updatedBiz.id ? updatedBiz : b)));
    // Trigger fresh analytics fetch to reflect parameters
    fetch("/api/analytics")
      .then((res) => res.json())
      .then((data) => setAnalytics(data));
  };

  // Append new lead submitted via simulator
  const handleNewLeadCreated = (newLead: Lead) => {
    setLeads((prev) => [newLead, ...prev]);
    // Refresh analytics aggregates
    fetch("/api/analytics")
      .then((res) => res.json())
      .then((data) => setAnalytics(data));
  };

  // Sync update for individual leads status/notes
  const handleUpdateLead = (updatedLead: Lead) => {
    setLeads((prev) => prev.map((l) => (l.id === updatedLead.id ? updatedLead : l)));
    // Refresh analytics
    fetch("/api/analytics")
      .then((res) => res.json())
      .then((data) => setAnalytics(data));
  };

  // Effortless Reports Export (CSV Builder)
  const handleExportCSVReport = () => {
    if (!analytics) return;

    // Generate CSV Header
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "REPORT: Central Sales & Omni-Channel Analytics Portfolio\n";
    csvContent += `Generated On: ${new Date().toLocaleString()}\n`;
    csvContent += `Operator: ${userEmail}\n`;
    csvContent += `Authorization level: SECURE-AUDITED-${activeRole.toUpperCase()}\n\n`;
    
    // Section 1: Business performance
    csvContent += "BUSINESS PERFORMANCE SUMMARY\n";
    csvContent += "Business Name,Category,Leads Count,Won Leads,Conversion Rate (%),Combined Revenue (USD)\n";
    analytics.businessSummary.forEach((b) => {
      csvContent += `"${b.name}","${b.category}",${b.leadsCount},${b.wonLeadsCount},${b.conversionRate}%,$${b.totalRevenue}\n`;
    });
    csvContent += "\n";

    // Section 2: Channel performance
    csvContent += "OMNI-CHANNEL TRAFFIC GENERATION\n";
    csvContent += "Network Channel Name,Total Lead Inquiries,Generated pipeline Value (USD)\n";
    analytics.sourceBreakdown.forEach((s) => {
      csvContent += `"${s.name}",${s.count},$${s.value}\n`;
    });
    csvContent += "\n";

    // Section 3: AI Chatbot stats
    csvContent += "AI CUSTOMER SUPPORT CHATBOT PERFORMANCE\n";
    csvContent += `Total Chat Interactions,AI Automated Resolutions,Escalations,Resolution Rate\n`;
    csvContent += `${analytics.chatbotStats.totalChats},${analytics.chatbotStats.aiResolved},${analytics.chatbotStats.escalated},${analytics.chatbotStats.resolutionRate}%\n\n`;

    // Section 4: Leads
    csvContent += "INBOUND CUSTOMER LEADS LIST\n";
    csvContent += "Lead Name,Customer Email,Customer Phone,Channel,Deal Value (USD),Funnel Status,Capture Date\n";
    leads.forEach((l) => {
      csvContent += `"${l.name}","${l.email}","${l.phone}","${l.source}",$${l.value},"${l.status}","${new Date(l.date).toLocaleDateString()}"\n`;
    });

    // Create a download link and click it programmatically
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `OmniChannel_Sales_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Record audit event for export
    fetch("/api/logs", {
      method: "GET", // trigger log trigger if authorized
      headers: {
        "x-user-role": activeRole,
        "x-user-email": userEmail
      }
    }).then(() => {
      // Background push log
      const logMsg = `Exported central CSV portfolio report of all business pipelines.`;
      // Call mock logger on server
      fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessId: "biz-1",
          name: "Security Daemon",
          email: "security@audit-system.com",
          phone: "+1 (555) 999-9999",
          source: "Webform",
          message: `User ${userEmail} logged as role ${activeRole} triggered custom analytics CSV spreadsheet export.`
        })
      });
    });
  };

  const selectBusinessTab = (bizId: string) => {
    setSelectedBizId(bizId);
    setActiveTab("chatbots");
  };

  if (sessionUser === null) {
    return (
      <LoginScreen 
        onLogin={(user) => {
          setSessionUser(user);
          setActiveRole(user.role);
          localStorage.setItem("repairhub_user_session", JSON.stringify(user));
        }} 
      />
    );
  }

  if (businesses.length === 0 && !loading) {
    return (
      <OnboardingWizard 
        userEmail={userEmail} 
        onComplete={() => fetchData()} 
      />
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 text-slate-900 font-sans" id="applet-core-layout">
      
      {/* Left Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 shrink-0">
        <div className="p-6 flex items-center gap-3 border-b border-slate-800">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-white shadow-md">O</div>
          <span className="text-xl font-bold text-white tracking-tight">OmniHub AI</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-1 text-sm overflow-y-auto">
          <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">Main Dashboard</div>
          
          <button
            onClick={() => setActiveTab("analytics")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition text-left ${
              activeTab === "analytics" ? "bg-slate-800 text-white" : "text-slate-400 hover:bg-slate-850 hover:text-white"
            }`}
          >
            <TrendingUp size={16} /> Sales Analytics
          </button>

          <button
            onClick={() => setActiveTab("leads")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition text-left ${
              activeTab === "leads" ? "bg-slate-800 text-white" : "text-slate-400 hover:bg-slate-850 hover:text-white"
            }`}
          >
            <Users size={16} /> Inbound CRM Leads
          </button>

          <div className="pt-6 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">Customer Service</div>

          <button
            onClick={() => setActiveTab("chatbots")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition text-left ${
              activeTab === "chatbots" ? "bg-slate-800 text-white" : "text-slate-400 hover:bg-slate-850 hover:text-white"
            }`}
          >
            <Bot size={16} /> AI Chatbot Config
          </button>

          <button
            onClick={() => setActiveTab("simulator")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition text-left ${
              activeTab === "simulator" ? "bg-slate-800 text-white" : "text-slate-400 hover:bg-slate-850 hover:text-white"
            }`}
          >
            <Sliders size={16} /> Omni-Channel Simulator
          </button>

          <div className="pt-6 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">Security & Admin</div>

          <button
            onClick={() => setActiveTab("security")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition text-left ${
              activeTab === "security" ? "bg-slate-800 text-white" : "text-slate-400 hover:bg-slate-850 hover:text-white"
            }`}
          >
            <Shield size={16} /> Audit Logs & RBAC
          </button>
        </nav>
        
        <div className="p-4 border-t border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span> Secure Session
            </span>
            <button
              onClick={() => {
                localStorage.removeItem("repairhub_user_session");
                setSessionUser(null);
              }}
              className="text-red-400 hover:text-red-300 font-bold transition flex items-center gap-1 cursor-pointer"
              title="Sign Out"
            >
              <LogOut size={11} /> Exit
            </button>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono">
            LAST AUDIT: 14:22 UTC
          </div>
        </div>
      </aside>

      {/* Main Workspace */}
      <main className="flex-1 flex flex-col overflow-hidden bg-slate-50 text-slate-900">
        
        {/* Clean White Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-4">
            <h2 className="text-sm font-semibold text-slate-800">
              {activeTab === "analytics" && "Business Portfolio Analytics"}
              {activeTab === "chatbots" && "AI Customer Service Chatbots"}
              {activeTab === "leads" && "Inbound CRM Leads Ledger"}
              {activeTab === "simulator" && "Omni-Channel Live Simulation"}
              {activeTab === "security" && "RBAC Authorization & Trace logs"}
            </h2>
            <span className="h-4 w-px bg-slate-200"></span>
            
            {/* Tenant Switcher */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">Business:</span>
              <select 
                value={selectedBizId} 
                onChange={(e) => setSelectedBizId(e.target.value)}
                className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 outline-none focus:border-indigo-500 transition cursor-pointer"
              >
                {businesses.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>

            <span className="h-4 w-px bg-slate-200"></span>
            <div className="text-xs text-slate-400">
              Global System Health: <span className="text-emerald-600 font-semibold">Optimal</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Active Operator info */}
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500 text-right">
                Welcome back,<br />
                <span className="font-semibold text-slate-950 font-mono">{userEmail.split("@")[0]} ({activeRole})</span>
              </span>
              <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 font-bold text-sm shadow-sm font-mono uppercase">
                {sessionUser?.avatar || activeRole[0]}
              </div>
            </div>

            <span className="h-4 w-px bg-slate-200"></span>

            {/* Effortless Export button */}
            <button
              onClick={handleExportCSVReport}
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-sans text-xs font-semibold rounded-lg transition duration-150 flex items-center gap-2 shadow-sm shrink-0 cursor-pointer"
              id="export-csv-report-btn"
            >
              <FileSpreadsheet size={14} /> Export CSV Report
            </button>
          </div>
        </header>

        {/* Scrollable Container */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full space-y-3">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
              <p className="text-xs text-slate-500 font-mono uppercase tracking-wider animate-pulse">
                Synchronizing database nodes...
              </p>
            </div>
          ) : (
            <>
              {activeTab === "analytics" && (
                <DashboardAnalytics 
                  businesses={businesses} 
                  leads={leads} 
                  analytics={analytics}
                  onSelectBusinessTab={selectBusinessTab}
                  onUpdateBusiness={handleUpdateBusiness}
                />
              )}

              {activeTab === "chatbots" && (
                <ChatbotConfigurator 
                  businesses={businesses} 
                  selectedBusinessId={selectedBizId}
                  onUpdateBusiness={handleUpdateBusiness}
                  userRole={activeRole}
                  userEmail={userEmail}
                  onRefreshBusinesses={fetchData}
                />
              )}

              {activeTab === "leads" && (
                <LeadsManager 
                  businesses={businesses} 
                  leads={leads} 
                  onUpdateLead={handleUpdateLead}
                  activeRole={activeRole}
                  userEmail={userEmail}
                  onNewLeadCreated={handleNewLeadCreated}
                />
              )}

              {activeTab === "simulator" && (
                <OmniChannelSimulator 
                  businesses={businesses} 
                  onNewLeadCreated={handleNewLeadCreated}
                />
              )}

              {activeTab === "security" && (
                <SecurityConsole 
                  activeRole={activeRole}
                  onChangeRole={setActiveRole}
                  userEmail={userEmail}
                />
              )}
            </>
          )}
        </div>

        {/* White Footer */}
        <footer className="bg-white border-t border-slate-200 py-3 px-8 flex justify-between items-center text-[10px] text-slate-400 font-mono shrink-0">
          <span>© 2026 CENTRAL MULTI-BUSINESS SUITE</span>
          <span className="flex items-center gap-1.5 text-slate-400">
            <Lock size={10} className="text-indigo-500" /> SECURED SECURE-AUDITED PROTOCOL ACTIVE
          </span>
        </footer>

      </main>
    </div>
  );
}
