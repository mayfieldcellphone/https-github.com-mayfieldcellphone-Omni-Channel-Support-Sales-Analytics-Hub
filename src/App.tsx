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
  LogOut,
  Plus,
  Sparkles,
  Send,
  X
} from "lucide-react";
import { Business, Lead, AnalyticsData, UserRole } from "./types";
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

  // Track the current window location hash for robust UI routing
  const [currentHash, setCurrentHash] = useState(window.location.hash || "#/login");

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

  // Global AI Support Assistant & Onboarding States
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

  // Synchronize location hash with application state and load core data
  useEffect(() => {
    fetchData();

    const handleHashChange = () => {
      const hash = window.location.hash;
      setCurrentHash(hash || "#/login");

      if (!sessionUser) {
        if (hash === "#/signup") {
          // Allow staying on signup
        } else if (hash !== "#/login") {
          window.location.hash = "#/login";
          setCurrentHash("#/login");
        }
      } else {
        if (hash.startsWith("#/dashboard/")) {
          const tab = hash.replace("#/dashboard/", "") as any;
          if (["analytics", "chatbots", "leads", "simulator", "security"].includes(tab)) {
            setActiveTab(tab);
          }
        } else if (hash !== "#/login" && hash !== "#/signup") {
          window.location.hash = `#/dashboard/analytics`;
          setCurrentHash(`#/dashboard/analytics`);
        }
      }
    };

    handleHashChange();
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, [sessionUser]);

  // Synchronize active tab to hash
  useEffect(() => {
    if (sessionUser && !window.location.hash.startsWith("#/login") && !window.location.hash.startsWith("#/signup")) {
      const hashTab = window.location.hash.replace("#/dashboard/", "");
      if (hashTab !== activeTab) {
        window.location.hash = `#/dashboard/${activeTab}`;
        setCurrentHash(`#/dashboard/${activeTab}`);
      }
    }
  }, [activeTab, sessionUser]);

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

  const isLoginPage = currentHash === "#/login" || currentHash === "#/signup" || !sessionUser;

  if (isLoginPage) {
    return (
      <LoginScreen 
        sessionUser={sessionUser}
        onLogin={(user) => {
          setSessionUser(user);
          setActiveRole(user.role);
          localStorage.setItem("repairhub_user_session", JSON.stringify(user));
          setCurrentHash(`#/dashboard/${activeTab}`);
          window.location.hash = `#/dashboard/${activeTab}`;
          fetchData();
        }} 
        onLogout={() => {
          localStorage.removeItem("repairhub_user_session");
          setSessionUser(null);
          setCurrentHash("#/login");
          window.location.hash = "#/login";
        }}
      />
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-white text-slate-900 font-sans" id="applet-core-layout">
      
      {/* Left Sidebar */}
      <aside className="w-64 bg-slate-950 text-slate-300 flex flex-col border-r border-slate-800 shrink-0">
        <div className="p-6 flex items-center gap-3 border-b border-slate-800">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white shadow-md">O</div>
          <span className="text-xl font-bold text-white tracking-tight">OmniHub AI</span>
        </div>

        {/* Active Portfolio Switcher & Onboarding Trigger */}
        <div className="p-4 mx-3 my-3 bg-slate-900/50 border border-slate-800 rounded-2xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[9px] uppercase font-mono text-slate-400 font-bold tracking-wider">
              Active Portfolio
            </span>
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" title="Scope active"></span>
          </div>
          
          <select
            value={selectedBizId}
            onChange={(e) => setSelectedBizId(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1.5 text-slate-200 text-xs font-semibold focus:outline-none focus:border-blue-500 transition cursor-pointer font-sans"
            id="global-sidebar-portfolio-selector"
          >
            {businesses.map((b) => (
              <option key={b.id} value={b.id} className="text-slate-200 bg-slate-900">
                {b.name}
              </option>
            ))}
          </select>

          <button
            onClick={() => {
              setActiveTab("chatbots");
              setOnboardTriggerActive(true);
            }}
            className="w-full py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold rounded-lg transition flex items-center justify-center gap-1 shadow-sm shadow-blue-900/20 cursor-pointer font-sans"
            id="sidebar-onboard-new-btn"
          >
            <Plus size={10} /> Onboard New Portfolio
          </button>
        </div>
        
        <nav className="flex-1 p-4 pt-1 space-y-1 text-sm overflow-y-auto">
          <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">Main Dashboard</div>
          
          <button
            onClick={() => setActiveTab("analytics")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition text-left cursor-pointer ${
              activeTab === "analytics" ? "bg-blue-600 text-white shadow-sm" : "text-slate-400 hover:bg-slate-900 hover:text-white"
            }`}
          >
            <TrendingUp size={16} /> Sales Analytics
          </button>

          <button
            onClick={() => setActiveTab("leads")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition text-left cursor-pointer ${
              activeTab === "leads" ? "bg-blue-600 text-white shadow-sm" : "text-slate-400 hover:bg-slate-900 hover:text-white"
            }`}
          >
            <Users size={16} /> Inbound CRM Leads
          </button>

          <div className="pt-6 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">Customer Service</div>

          <button
            onClick={() => setActiveTab("chatbots")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition text-left cursor-pointer ${
              activeTab === "chatbots" ? "bg-blue-600 text-white shadow-sm" : "text-slate-400 hover:bg-slate-900 hover:text-white"
            }`}
          >
            <Bot size={16} /> AI Chatbot Config
          </button>

          <button
            onClick={() => setActiveTab("simulator")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition text-left cursor-pointer ${
              activeTab === "simulator" ? "bg-blue-600 text-white shadow-sm" : "text-slate-400 hover:bg-slate-900 hover:text-white"
            }`}
          >
            <Sliders size={16} /> Omni-Channel Simulator
          </button>

          <div className="pt-6 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">Security & Admin</div>

          <button
            onClick={() => setActiveTab("security")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition text-left cursor-pointer ${
              activeTab === "security" ? "bg-blue-600 text-white shadow-sm" : "text-slate-400 hover:bg-slate-900 hover:text-white"
            }`}
          >
            <Shield size={16} /> Audit Logs & RBAC
          </button>
        </nav>
        
        <div className="p-4 border-t border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
            <span className="flex items-center gap-1.5 font-semibold text-slate-400">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> Secure Session
            </span>
            <button
              onClick={() => {
                localStorage.removeItem("repairhub_user_session");
                setSessionUser(null);
                setCurrentHash("#/login");
                window.location.hash = "#/login";
              }}
              className="text-red-600 hover:text-red-500 font-bold transition flex items-center gap-1 cursor-pointer"
              title="Sign Out"
            >
              <LogOut size={11} /> Exit
            </button>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-slate-600/70 font-mono">
            LAST AUDIT: 14:22 UTC
          </div>
        </div>
      </aside>

      {/* Main Workspace */}
      <main className="flex-1 flex flex-col overflow-hidden bg-white text-slate-900">
        
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
            <div className="text-xs text-slate-400">
              Global System Health: <span className="text-green-600 font-semibold">Optimal</span>
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
              className="px-3.5 py-1.5 bg-blue-700 hover:bg-blue-600 text-white font-sans text-xs font-semibold rounded-lg transition duration-150 flex items-center gap-2 shadow-sm shrink-0 cursor-pointer"
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
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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
                  onSelectBusiness={(id) => setSelectedBizId(id)}
                  onboardTriggerActive={onboardTriggerActive}
                  resetOnboardTrigger={() => setOnboardTriggerActive(false)}
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
            <Lock size={10} className="text-blue-500" /> SECURED SECURE-AUDITED PROTOCOL ACTIVE
          </span>
        </footer>

      </main>

      {/* Floating Global Onboarding & Support AI Assistant */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
        {isGlobalAiOpen && (
          <div className="w-80 sm:w-96 h-[480px] bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden mb-4 animate-fade-in text-white font-sans">
            {/* Header */}
            <div className="bg-black p-4 border-b border-slate-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-sm shadow-inner relative">
                  🧠
                  <span className="absolute bottom-0 right-0 w-2 h-2 bg-green-400 rounded-full border border-slate-950 animate-pulse"></span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white font-sans">OmniHub AI Onboarding</h4>
                  <p className="text-[9px] text-green-400 font-mono">Live Support & Co-Pilot</p>
                </div>
              </div>
              <button
                onClick={() => setIsGlobalAiOpen(false)}
                className="text-slate-400 hover:text-white transition duration-150 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Quick Suggestions Banner */}
            <div className="px-3 py-2 bg-blue-950/40 border-b border-blue-900/20 text-[10px] text-blue-300 flex items-center gap-1.5 shrink-0">
              <Sparkles size={11} className="text-blue-400 shrink-0" />
              <span>Select a guided flow or type a custom question below.</span>
            </div>

            {/* Chats Container */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-950/40 scrollbar-thin">
              {globalAiHistory.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex gap-2 max-w-[85%] ${msg.sender === "customer" ? "ml-auto flex-row-reverse" : "mr-auto"}`}
                >
                  <div className={`w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-xs ${
                    msg.sender === "customer" ? "bg-slate-800 text-slate-300" : "bg-blue-600 text-white"
                  }`}>
                    {msg.sender === "customer" ? <User size={10} /> : <span>🧠</span>}
                  </div>
                  <div className="space-y-1">
                    <div className={`px-3 py-2 rounded-xl text-xs leading-relaxed whitespace-pre-wrap ${
                      msg.sender === "customer"
                        ? "bg-blue-600 text-white rounded-tr-none font-medium"
                        : "bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none font-light"
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                </div>
              ))}

              {isGlobalAiTyping && (
                <div className="flex gap-2 max-w-[80%] mr-auto">
                  <div className="w-6 h-6 rounded-full shrink-0 flex items-center justify-center bg-blue-600 text-white text-xs">
                    🧠
                  </div>
                  <div className="bg-slate-900 border border-slate-800 px-3 py-2 rounded-xl rounded-tl-none flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                  </div>
                </div>
              )}
            </div>

            {/* Guided Quick Actions */}
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
                className="px-2 py-1 bg-green-500/15 hover:bg-green-500/25 text-[10px] text-green-400 border border-green-500/20 rounded-md transition duration-150 flex items-center gap-1 cursor-pointer font-sans"
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
                placeholder="Ask me how to configure or integrate..."
                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-sans"
              />
              <button
                onClick={() => handleSendGlobalAiMessage()}
                className="p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition duration-150 flex items-center justify-center cursor-pointer"
              >
                <Send size={14} />
              </button>
            </div>
          </div>
        )}

        {/* Pulsing Assistant Toggle Button */}
        <button
          onClick={() => setIsGlobalAiOpen(!isGlobalAiOpen)}
          className="w-14 h-14 bg-blue-600 hover:bg-blue-500 text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition duration-150 relative cursor-pointer group"
          id="global-onboarding-ai-assistant-btn"
          title="Open AI Onboarding Assistant"
        >
          {isGlobalAiOpen ? (
            <X size={24} />
          ) : (
            <>
              <Sparkles size={24} className="animate-pulse" />
              <span className="absolute -top-1 -right-1 bg-blue-700 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full border-2 border-slate-50 animate-bounce">
                AI Help
              </span>
            </>
          )}
        </button>
      </div>

    </div>
  );
}
