import React, { useState, useEffect } from "react";
import { 
  TrendingUp, 
  Bot, 
  Users, 
  Sliders, 
  Shield, 
  FileSpreadsheet, 
  Lock, 
  LogOut, 
  CheckCircle2,
  Plus,
  Sparkles,
  Send,
  X,
  User,
  SlidersHorizontal,
  ChevronDown
} from "lucide-react";
import { Business, Lead, AnalyticsData, UserRole } from "./types";
import { signOut } from "firebase/auth";
import { auth } from "./firebase";
import { OnboardingWizard } from "./components/OnboardingWizard";
import DashboardAnalytics from "./components/DashboardAnalytics";
import ChatbotConfigurator from "./components/ChatbotConfigurator";
import LeadsManager from "./components/LeadsManager";
import OmniChannelSimulator from "./components/OmniChannelSimulator";
import SecurityConsole from "./components/SecurityConsole";
import LoginScreen from "./components/LoginScreen";

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

  // Track current UI tab
  const [activeTab, setActiveTab] = useState<"analytics" | "chatbots" | "leads" | "simulator" | "security">("analytics");
  const [activeRole, setActiveRole] = useState<UserRole>(() => {
    const cached = localStorage.getItem("repairhub_user_session");
    if (cached) {
      return JSON.parse(cached).role;
    }
    return "Admin";
  });

  // Reactive email variable
  const userEmail = sessionUser ? sessionUser.email : "admin@mayfieldrepairs.com.au";

  // Data States
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  // Active Portfolio item
  const [selectedBizId, setSelectedBizId] = useState<string>("");

  // Advanced SaaS Mode toggle
  const [showAdvancedSaaS, setShowAdvancedSaaS] = useState<boolean>(() => {
    return localStorage.getItem("omnihub_show_advanced_saas") === "true";
  });

  // Global AI Onboarding & Support Assistant States
  const [isGlobalAiOpen, setIsGlobalAiOpen] = useState(false);
  const [globalAiHistory, setGlobalAiHistory] = useState<Array<{
    sender: "customer" | "bot";
    text: string;
    timestamp: string;
  }>>([
    {
      sender: "bot",
      text: "👋 Hello! I am your OmniHub AI Onboarding & Support Assistant. 🧠\n\nI am here to guide you through the system and help onboard your businesses!\n\nHere are some of the things you can do with me:\n• Ask how to manage and switch portfolios\n• Get embed codes for webforms/leadforms\n• Walk through adding raw files/knowledge base text to train your chatbot\n\nHow can I help you today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [globalAiInput, setGlobalAiInput] = useState("");
  const [isGlobalAiTyping, setIsGlobalAiTyping] = useState(false);
  const [onboardTriggerActive, setOnboardTriggerActive] = useState(false);

  // FETCH: Sync with Backend DB
  const fetchData = async () => {
    try {
      setLoading(true);
      const headers = {
        "x-user-email": userEmail,
        "x-user-role": activeRole
      };

      // Fetch businesses
      const bizRes = await fetch("/api/businesses", { headers });
      const bizData = await bizRes.json();
      setBusinesses(bizData);
      if (bizData.length > 0) {
        setSelectedBizId((prev) => {
          if (prev && bizData.some((b: Business) => b.id === prev)) return prev;
          return bizData[0].id;
        });
      }

      // Fetch leads
      const leadsRes = await fetch("/api/leads", { headers });
      const leadsData = await leadsRes.json();
      setLeads(leadsData);

      // Fetch aggregated analytics
      const analyticsRes = await fetch("/api/analytics", { headers });
      const analyticsData = await analyticsRes.json();
      setAnalytics(analyticsData);

    } catch (e) {
      console.error("Failed to load initial data:", e);
    } finally {
      setLoading(false);
    }
  };

  // Trigger load on session or role changes
  useEffect(() => {
    if (sessionUser) {
      fetchData();
    }
  }, [sessionUser, activeRole]);

  // Update business configuration locally or remotely
  const handleUpdateBusiness = (updatedBiz: Business) => {
    setBusinesses((prev) => prev.map((b) => (b.id === updatedBiz.id ? updatedBiz : b)));
    fetchData(); // Trigger full refresh to keep server/analytics sync
  };

  // Append new lead
  const handleNewLeadCreated = (newLead: Lead) => {
    setLeads((prev) => [newLead, ...prev]);
    fetchData();
  };

  // Sync update for individual leads
  const handleUpdateLead = (updatedLead: Lead) => {
    setLeads((prev) => prev.map((l) => (l.id === updatedLead.id ? updatedLead : l)));
    fetchData();
  };

  const handleSendGlobalAiMessage = async (textToSend?: string) => {
    const messageText = textToSend || globalAiInput;
    if (!messageText.trim()) return;

    const userMsg = {
      sender: "customer" as const,
      text: messageText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setGlobalAiHistory(prev => [...prev, userMsg]);
    if (!textToSend) setGlobalAiInput("");
    setIsGlobalAiTyping(true);

    try {
      const res = await fetch("/api/chatbot/builder", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-role": activeRole,
          "x-user-email": userEmail
        },
        body: JSON.stringify({
          businessId: selectedBizId || (businesses[0] ? businesses[0].id : "biz-1"),
          userInput: messageText
        })
      });

      if (!res.ok) {
        throw new Error("Failed to contact Support API");
      }

      const data = await res.json();
      
      setGlobalAiHistory(prev => [...prev, {
        sender: "bot" as const,
        text: data.analysisSummary || "I've processed your input, but had no summary response. Please let me know how else I can assist you!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } catch (err) {
      setGlobalAiHistory(prev => [...prev, {
        sender: "bot" as const,
        text: "My apologies! I am currently experiencing connection difficulties. Please verify your internet or sandbox settings.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setIsGlobalAiTyping(false);
    }
  };

  const handleExportCSVReport = () => {
    if (!analytics) return;

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "REPORT: Central Sales & Omni-Channel Analytics Portfolio\n";
    csvContent += `Generated On: ${new Date().toLocaleString()}\n`;
    csvContent += `Operator: ${userEmail}\n`;
    csvContent += `Authorization level: SECURE-AUDITED-${activeRole.toUpperCase()}\n\n`;
    
    csvContent += "BUSINESS PERFORMANCE SUMMARY\n";
    csvContent += "Business Name,Category,Leads Count,Won Leads,Conversion Rate (%),Combined Revenue (USD)\n";
    analytics.businessSummary.forEach((b) => {
      csvContent += `"${b.name}","${b.category}",${b.leadsCount},${b.wonLeadsCount},${b.conversionRate}%,$${b.totalRevenue}\n`;
    });
    csvContent += "\n";

    csvContent += "OMNI-CHANNEL TRAFFIC GENERATION\n";
    csvContent += "Network Channel Name,Total Lead Inquiries,Generated pipeline Value (USD)\n";
    analytics.sourceBreakdown.forEach((s) => {
      csvContent += `"${s.name}",${s.count},$${s.value}\n`;
    });
    csvContent += "\n";

    csvContent += "AI CUSTOMER SUPPORT CHATBOT PERFORMANCE\n";
    csvContent += `Total Chat Interactions,AI Automated Resolutions,Escalations,Resolution Rate\n`;
    csvContent += `${analytics.chatbotStats.totalChats},${analytics.chatbotStats.aiResolved},${analytics.chatbotStats.escalated},${analytics.chatbotStats.resolutionRate}%\n\n`;

    csvContent += "INBOUND CUSTOMER LEADS LIST\n";
    csvContent += "Lead Name,Customer Email,Customer Phone,Channel,Deal Value (USD),Funnel Status,Capture Date\n";
    leads.forEach((l) => {
      csvContent += `"${l.name}","${l.email}","${l.phone}","${l.source}",$${l.value},"${l.status}","${new Date(l.date).toLocaleDateString()}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `OmniChannel_Sales_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const selectBusinessTab = (bizId: string) => {
    setSelectedBizId(bizId);
    setActiveTab("chatbots");
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.error("Firebase signOut error:", e);
    }
    localStorage.removeItem("repairhub_user_session");
    setSessionUser(null);
  };

  if (!sessionUser) {
    return (
      <LoginScreen 
        sessionUser={sessionUser}
        onLogin={(user) => {
          setSessionUser(user);
          setActiveRole(user.role);
          localStorage.setItem("repairhub_user_session", JSON.stringify(user));
        }} 
        onLogout={handleLogout}
      />
    );
  }

  if (businesses.length === 0 && !loading) {
    return <OnboardingWizard onComplete={fetchData} />;
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 text-slate-900 font-sans" id="applet-core-layout">
      
      {/* SIDEBAR: Refactored to SLEEK BLACK */}
      <aside className="w-64 bg-slate-950 text-slate-300 flex flex-col border-r border-slate-800 shrink-0">
        <div className="p-6 flex items-center gap-3 border-b border-slate-800">
          <div className="w-8 h-8 bg-blue-700 rounded-lg flex items-center justify-center font-bold text-white shadow-md">O</div>
          <span className="text-xl font-bold text-white tracking-tight">OmniHub AI</span>
        </div>

        {/* Active Portfolio Switcher & Onboarding Trigger */}
        <div className="p-4 mx-3 my-4 bg-slate-900/50 border border-slate-800 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
              Active Portfolio
            </span>
            <span className="w-2 h-2 bg-emerald-500 rounded-full" title="Scope active"></span>
          </div>
          
          <select
            value={selectedBizId}
            onChange={(e) => setSelectedBizId(e.target.value)}
            className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-white text-xs font-medium focus:outline-none focus:border-blue-500 transition cursor-pointer font-sans"
            id="global-sidebar-portfolio-selector"
          >
            {businesses.map((b) => (
              <option key={b.id} value={b.id} className="text-slate-800 bg-white">
                {b.name}
              </option>
            ))}
          </select>

          <button
            onClick={() => {
              setActiveTab("chatbots");
              setOnboardTriggerActive(true);
            }}
            className="w-full py-2 bg-blue-700 hover:bg-blue-600 text-white text-xs font-semibold rounded-xl transition flex items-center justify-center gap-1 cursor-pointer font-sans"
            id="sidebar-onboard-new-btn"
          >
            <Plus size={14} /> Onboard New
          </button>
        </div>
        
        <nav className="flex-1 p-3 space-y-1 text-xs overflow-y-auto">
          <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">Main Dashboard</div>
          
          <button
            onClick={() => setActiveTab("analytics")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition text-left cursor-pointer ${
              activeTab === "analytics" ? "bg-blue-700/20 text-blue-400" : "text-slate-400 hover:bg-slate-900 hover:text-white"
            }`}
          >
            <TrendingUp size={16} /> Sales Analytics
          </button>

          <button
            onClick={() => setActiveTab("leads")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition text-left cursor-pointer ${
              activeTab === "leads" ? "bg-blue-700/20 text-blue-400" : "text-slate-400 hover:bg-slate-900 hover:text-white"
            }`}
          >
            <Users size={16} /> CRM Inbound Leads
          </button>

          <div className="pt-4 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">Customer Service</div>

          <button
            onClick={() => setActiveTab("chatbots")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition text-left cursor-pointer ${
              activeTab === "chatbots" ? "bg-blue-700/20 text-blue-400" : "text-slate-400 hover:bg-slate-900 hover:text-white"
            }`}
          >
            <Bot size={16} /> AI Chatbot Config
          </button>

          <button
            onClick={() => setActiveTab("simulator")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition text-left cursor-pointer ${
              activeTab === "simulator" ? "bg-blue-700/20 text-blue-400" : "text-slate-400 hover:bg-slate-900 hover:text-white"
            }`}
          >
            <Sliders size={16} /> Omni-Channel Simulator
          </button>

          {showAdvancedSaaS && (
            <>
              <div className="pt-4 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">Security & Admin</div>

              <button
                onClick={() => setActiveTab("security")}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition text-left cursor-pointer ${
                  activeTab === "security" ? "bg-blue-700/20 text-blue-400" : "text-slate-400 hover:bg-slate-900 hover:text-white"
                }`}
              >
                <Shield size={16} /> Audit Logs & RBAC
              </button>
            </>
          )}
        </nav>
        
        <div className="p-4 border-t border-slate-900 space-y-3 bg-slate-950/80">
          <label className="flex items-center justify-between text-[11px] text-slate-400 cursor-pointer hover:text-white transition">
            <span className="flex items-center gap-1.5 font-sans">
              <SlidersHorizontal size={12} className="text-blue-400" /> Advanced SaaS
            </span>
            <input
              type="checkbox"
              checked={showAdvancedSaaS}
              onChange={(e) => {
                const val = e.target.checked;
                setShowAdvancedSaaS(val);
                localStorage.setItem("omnihub_show_advanced_saas", val ? "true" : "false");
                if (!val && activeTab === "security") {
                  setActiveTab("analytics");
                }
              }}
              className="rounded bg-slate-900 border-slate-800 text-blue-600 focus:ring-0 cursor-pointer h-3.5 w-3.5"
            />
          </label>

          <div className="flex items-center justify-between text-[11px] border-t border-slate-900 pt-3">
            <span className="flex items-center gap-1.5 font-medium text-slate-400">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span> {activeRole} Session
            </span>
            <button
              onClick={handleLogout}
              className="text-red-400 hover:text-red-300 font-medium transition flex items-center gap-1 cursor-pointer"
              title="Sign Out"
            >
              <LogOut size={12} /> Exit
            </button>
          </div>
        </div>
      </aside>

      {/* Main Workspace */}
      <main className="flex-1 flex flex-col overflow-hidden bg-slate-50 text-slate-900">
        
        {/* Clean White Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-4">
            <h2 className="text-sm font-semibold text-slate-800 uppercase tracking-tight">
              {activeTab === "analytics" && "Business Portfolio Analytics"}
              {activeTab === "chatbots" && "AI Customer Service Chatbots"}
              {activeTab === "leads" && "Inbound CRM Leads Ledger"}
              {activeTab === "simulator" && "Omni-Channel Live Simulation"}
              {activeTab === "security" && "RBAC Authorization & Trace logs"}
            </h2>
            <span className="h-4 w-px bg-slate-200"></span>
            
            {/* SaaS Header Tenant Switcher Dropdown */}
            <div className="flex items-center gap-2" id="header-tenant-switcher-container">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-sans">Tenant Switcher:</span>
              <select
                value={selectedBizId}
                onChange={(e) => setSelectedBizId(e.target.value)}
                className="bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 rounded-xl px-3 py-1.5 text-slate-800 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 transition cursor-pointer font-sans shadow-sm"
                id="header-tenant-switcher"
              >
                {businesses.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            <span className="h-4 w-px bg-slate-200"></span>
            <div className="text-xs text-slate-400 font-sans">
              System: <span className="text-emerald-600 font-semibold">Active</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500 text-right">
                Operator:<br />
                <span className="font-semibold text-slate-950 font-mono text-[11px]">{userEmail.split("@")[0]} ({activeRole})</span>
              </span>
              <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 font-bold text-sm shadow-sm font-mono uppercase">
                {sessionUser?.avatar || activeRole[0]}
              </div>
            </div>

            <span className="h-4 w-px bg-slate-200"></span>

            <button
              onClick={handleExportCSVReport}
              disabled={!analytics}
              className="px-3.5 py-2 bg-blue-700 hover:bg-blue-600 disabled:opacity-50 text-white font-sans text-xs font-semibold rounded-xl transition flex items-center gap-2 shadow-sm shrink-0 cursor-pointer"
              id="export-csv-report-btn"
            >
              <FileSpreadsheet size={14} /> Export CSV Report
            </button>
          </div>
        </header>

        {/* Scrollable Container */}
        <div className="flex-1 overflow-y-auto p-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full space-y-3">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="text-xs text-slate-500 font-mono uppercase tracking-wider animate-pulse">
                Synchronizing database nodes...
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {activeTab === "analytics" && (
                <DashboardAnalytics 
                  businesses={businesses} 
                  leads={leads} 
                  analytics={analytics}
                  onSelectBusinessTab={selectBusinessTab}
                  onUpdateBusiness={handleUpdateBusiness}
                  showAdvancedSaaS={showAdvancedSaaS}
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
                  onSelectBusiness={(id) => setSelectedBizId(id)}
                  onboardTriggerActive={onboardTriggerActive}
                  resetOnboardTrigger={() => setOnboardTriggerActive(false)}
                  showAdvancedSaaS={showAdvancedSaaS}
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
                  showAdvancedSaaS={showAdvancedSaaS}
                />
              )}

              {activeTab === "simulator" && (
                <OmniChannelSimulator 
                  businesses={businesses} 
                  onNewLeadCreated={handleNewLeadCreated}
                  showAdvancedSaaS={showAdvancedSaaS}
                />
              )}

              {activeTab === "security" && (
                <SecurityConsole 
                  activeRole={activeRole}
                  onChangeRole={setActiveRole}
                  userEmail={userEmail}
                />
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="bg-white border-t border-slate-200 py-3.5 px-8 flex justify-between items-center text-[10px] text-slate-400 font-mono shrink-0">
          <span>© 2026 CENTRAL MULTI-BUSINESS SUITE</span>
          <span className="flex items-center gap-1.5 text-slate-400">
            <Lock size={10} className="text-blue-500" /> SECURED SECURE-AUDITED PROTOCOL ACTIVE
          </span>
        </footer>
      </main>

      {/* Floating Global Onboarding & Support AI Assistant */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
        {isGlobalAiOpen && (
          <div className="w-80 sm:w-96 h-[480px] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden mb-4 text-white font-sans">
            {/* Header */}
            <div className="bg-slate-950 p-4 border-b border-slate-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-sm shadow-inner relative">
                  🧠
                  <span className="absolute bottom-0 right-0 w-2 h-2 bg-emerald-400 rounded-full border border-slate-950 animate-pulse"></span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white font-sans">OmniHub AI Support</h4>
                  <p className="text-[9px] text-emerald-400 font-mono">Live Onboarding Copilot</p>
                </div>
              </div>
              <button
                onClick={() => setIsGlobalAiOpen(false)}
                className="text-slate-400 hover:text-white transition duration-150 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Suggestions Banner */}
            <div className="px-3 py-2 bg-blue-950/40 border-b border-blue-900/20 text-[10px] text-blue-300 flex items-center gap-1.5 shrink-0">
              <Sparkles size={11} className="text-blue-400 shrink-0" />
              <span>Select a guided flow or type a custom question.</span>
            </div>

            {/* Chats Container */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-950/40">
              {globalAiHistory.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex gap-2 max-w-[85%] ${msg.sender === "customer" ? "ml-auto flex-row-reverse" : "mr-auto"}`}
                >
                  <div className={`w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-xs ${
                    msg.sender === "customer" ? "bg-slate-800 text-slate-300" : "bg-emerald-600 text-white"
                  }`}>
                    {msg.sender === "customer" ? <User size={10} /> : <span>🧠</span>}
                  </div>
                  <div className="space-y-1">
                    <div className={`px-3 py-2 rounded-xl text-xs leading-relaxed whitespace-pre-wrap ${
                      msg.sender === "customer"
                        ? "bg-emerald-600 text-white rounded-tr-none font-medium"
                        : "bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none font-light"
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                </div>
              ))}

              {isGlobalAiTyping && (
                <div className="flex gap-2 max-w-[80%] mr-auto">
                  <div className="w-6 h-6 rounded-full shrink-0 flex items-center justify-center bg-emerald-600 text-white text-xs">
                    🧠
                  </div>
                  <div className="bg-slate-900 border border-slate-800 px-3 py-2 rounded-xl rounded-tl-none flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="p-2 border-t border-slate-800 bg-slate-950/60 flex flex-wrap gap-1.5 shrink-0">
              <button
                onClick={() => {
                  setActiveTab("chatbots");
                  setOnboardTriggerActive(true);
                  setIsGlobalAiOpen(false);
                }}
                className="px-2 py-1 bg-blue-500/15 hover:bg-blue-500/25 text-[10px] text-blue-400 border border-blue-500/20 rounded-md transition duration-150 flex items-center gap-1 cursor-pointer font-sans"
              >
                🚀 Onboard a New Business
              </button>
              <button
                onClick={() => {
                  handleSendGlobalAiMessage("How do I embed the chatbot widget or lead capture webform on my website?");
                }}
                className="px-2 py-1 bg-emerald-500/15 hover:bg-emerald-500/25 text-[10px] text-emerald-400 border border-emerald-500/20 rounded-md transition duration-150 flex items-center gap-1 cursor-pointer font-sans"
              >
                📋 Embed Codes Setup
              </button>
              <button
                onClick={() => {
                  handleSendGlobalAiMessage("How do I configure settings, update details or replace existing business data?");
                }}
                className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300 border border-slate-700 rounded-md transition duration-150 flex items-center gap-1 cursor-pointer font-sans"
              >
                ⚙️ Replace/Manage Settings
              </button>
            </div>

            {/* Input Footer */}
            <div className="p-3 border-t border-slate-800 bg-slate-950 flex gap-2 shrink-0">
              <input
                type="text"
                value={globalAiInput}
                onChange={(e) => setGlobalAiInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendGlobalAiMessage()}
                placeholder="Ask how to configure or integrate..."
                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-sans"
              />
              <button
                onClick={() => handleSendGlobalAiMessage()}
                className="p-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition duration-150 flex items-center justify-center cursor-pointer"
              >
                <Send size={14} />
              </button>
            </div>
          </div>
        )}

        {/* Floating Toggle Button */}
        <button
          onClick={() => setIsGlobalAiOpen(!isGlobalAiOpen)}
          className="w-14 h-14 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition duration-150 relative cursor-pointer group"
          id="global-onboarding-ai-assistant-btn"
          title="Open AI Support Assistant"
        >
          {isGlobalAiOpen ? (
            <X size={24} />
          ) : (
            <>
              <Sparkles size={24} className="animate-pulse" />
              <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full border-2 border-slate-50 animate-bounce">
                AI Help
              </span>
            </>
          )}
        </button>
      </div>

    </div>
  );
}
