import React, { useState, useEffect } from "react";
import { 
  Globe, 
  Mail, 
  Smartphone, 
  Send, 
  Bot, 
  User, 
  CheckCircle, 
  Sparkles, 
  Copy,
  Sliders,
  Settings,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  Clock,
  ShieldCheck,
  Award,
  Leaf,
  Truck,
  Calendar,
  Dumbbell,
  Users,
  Zap,
  X,
  MessageSquare,
  Lock,
  UserCheck,
  Check,
  ThumbsUp,
  Wrench,
  CreditCard
} from "lucide-react";
import { Business, Lead } from "../types";

interface OmniChannelSimulatorProps {
  businesses: Business[];
  onNewLeadCreated: (lead: Lead) => void;
}

export default function OmniChannelSimulator({
  businesses,
  onNewLeadCreated
}: OmniChannelSimulatorProps) {
  const [activeSubTab, setActiveSubTab] = useState<"webform" | "email" | "messenger" | "websites">("webform");
  const [targetBizId, setTargetBizId] = useState(businesses[0]?.id || "");

  const activeBiz = businesses.find(b => b.id === targetBizId) || businesses[0];

  // Webform States
  const [wfName, setWfName] = useState("Jonathan Vance");
  const [wfEmail, setWfEmail] = useState("jvance@techcorp.com");
  const [wfPhone, setWfPhone] = useState("+1 (555) 302-8819");
  const [wfMessage, setWfMessage] = useState("I need to get a screen replaced on an iPad Pro 11-inch. The display is flashing green lines. Can you do this in under an hour?");
  const [wfSuccess, setWfSuccess] = useState<any | null>(null);
  const [wfLoading, setWfLoading] = useState(false);

  // Email States
  const [emSender, setEmSender] = useState("Clara Oswald");
  const [emSenderEmail, setEmSenderEmail] = useState("clara@tardismail.net");
  const [emSubject, setEmSubject] = useState("Dry Clean Express Question");
  const [emBody, setEmBody] = useState("Hi, I have three delicate silk outfits that need eco-friendly organic solvents. Can I drop them off tomorrow morning for same-day delivery? What are your rates?");
  const [emSuccess, setEmSuccess] = useState<any | null>(null);
  const [emLoading, setEmLoading] = useState(false);

  // Messenger/WhatsApp States
  const [msgPlatform, setMsgPlatform] = useState<"WhatsApp" | "Messenger">("WhatsApp");
  const [msgInput, setMsgInput] = useState("How much is your monthly VIP membership? Does it include yoga classes?");
  const [msgHistory, setMsgHistory] = useState<any[]>([
    { sender: "customer", text: "Hey! Just wanted to ask a quick question." },
    { sender: "bot", text: "Hello! Thanks for reaching out. How can I help you today?" }
  ]);
  const [msgLoading, setMsgLoading] = useState(false);

  // Web Widget States
  const [webWidgetOpen, setWebWidgetOpen] = useState(false);
  const [webWidgetInput, setWebWidgetInput] = useState("");
  const [webWidgetHistory, setWebWidgetHistory] = useState<any[]>([]);
  const [webWidgetLoading, setWebWidgetLoading] = useState(false);
  const [webWidgetLeadAlert, setWebWidgetLeadAlert] = useState(false);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [widgetLeadName, setWidgetLeadName] = useState("");
  const [widgetLeadEmail, setWidgetLeadEmail] = useState("");
  const [widgetLeadPhone, setWidgetLeadPhone] = useState("");
  const [widgetLeadSubmitted, setWidgetLeadSubmitted] = useState(false);

  // Sync widget chat on target change
  useEffect(() => {
    if (activeBiz) {
      setWebWidgetHistory([
        {
          sender: "bot",
          text: activeBiz.chatSettings.welcomeMessage || "Hello! How can I assist you today?",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      setWebWidgetOpen(false);
      setWebWidgetLeadAlert(false);
      setShowLeadForm(false);
      setWidgetLeadSubmitted(false);
      setWidgetLeadName("");
      setWidgetLeadEmail("");
      setWidgetLeadPhone("");
    }
  }, [targetBizId, activeBiz]);

  // Preset prompts to make testing ultra-simple
  const loadPreset = (type: "webform" | "email" | "messenger", bizCategory: string) => {
    if (type === "webform") {
      if (bizCategory === "Device Repairs") {
        setWfMessage("Dropped my Samsung Galaxy S23 in the pool. It turns on but touch doesn't work. Can you run a liquid damage diagnostic today?");
      } else if (bizCategory === "DIY Repair Kits") {
        setWfMessage("Looking for an iPhone 13 Pro screen replacement kit. Does the kit include the waterproof adhesive bezel seal?");
      } else {
        setWfMessage("I see an unknown charge of $49.99 from RepairBill on my card. Can you check my invoice status securely?");
      }
    } else if (type === "email") {
      if (bizCategory === "Device Repairs") {
        setEmSubject("MacBook Pro Battery Diagnostic");
        setEmBody("Dear Mayfield Repairs, my MacBook Pro battery only lasts 40 minutes before dying. How much to install a certified battery replacement? Do I need an appointment?");
      } else if (bizCategory === "DIY Repair Kits") {
        setEmSubject("DIY Battery Kit Inquiry");
        setEmBody("Hello, do you have a DIY battery replacement kit for an iPad Air 4? And can a first-timer do this safely?");
      } else {
        setEmSubject("Invoice Payment Status Query");
        setEmBody("Hello, I am trying to verify if my invoice #RB-9921 for the repair shop has been marked as fully paid in your portal. Thank you.");
      }
    } else if (type === "messenger") {
      if (bizCategory === "Device Repairs") {
        setMsgInput("Is the iPhone screen repair covered under lifetime warranty?");
      } else if (bizCategory === "DIY Repair Kits") {
        setMsgInput("Do you have video tutorials showing how to use the heating pad for screen removal?");
      } else {
        setMsgInput("How secure is my credit card details when paying invoices via RepairBill?");
      }
    }
  };

  // Submit Webform API
  const handleWebformSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wfMessage.trim() || wfLoading) return;
    setWfLoading(true);
    setWfSuccess(null);

    try {
      const res = await fetch("/api/inquiries/webform", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessId: targetBizId,
          name: wfName,
          email: wfEmail,
          phone: wfPhone,
          message: wfMessage
        })
      });

      if (!res.ok) throw new Error();
      const lead = await res.json();
      onNewLeadCreated(lead);
      setWfSuccess(lead);
    } catch (e) {
      console.error(e);
    } finally {
      setWfLoading(false);
    }
  };

  // Submit Email Daemon API
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emBody.trim() || emLoading) return;
    setEmLoading(true);
    setEmSuccess(null);

    try {
      const res = await fetch("/api/inquiries/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessId: targetBizId,
          senderName: emSender,
          senderEmail: emSenderEmail,
          subject: emSubject,
          body: emBody
        })
      });

      if (!res.ok) throw new Error();
      const data = await res.json();
      onNewLeadCreated(data.lead);
      setEmSuccess(data);
    } catch (e) {
      console.error(e);
    } finally {
      setEmLoading(false);
    }
  };

  // Submit Omni-Channel Chat message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!msgInput.trim() || msgLoading) return;

    const userText = msgInput.trim();
    setMsgInput("");
    setMsgHistory((prev) => [...prev, { sender: "customer", text: userText }]);
    setMsgLoading(true);

    try {
      const res = await fetch("/api/chatbot/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessId: targetBizId,
          message: userText,
          conversationHistory: [] // fresh message
        })
      });

      if (!res.ok) throw new Error();
      const data = await res.json();

      setMsgHistory((prev) => [...prev, { sender: "bot", text: data.reply }]);

      // If the Gemini model auto-detects it is a valuable customer inquiry, register a lead
      if (data.leadGenerated) {
        // Automatically create chat lead background log
        const leadRes = await fetch("/api/leads", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            businessId: targetBizId,
            name: "Omni-Channel Customer",
            email: "chat@messenger-network.com",
            phone: activeBiz.channels.whatsapp.phoneNumber || "+1 (555) 000-0000",
            source: msgPlatform,
            message: userText,
            value: 90,
            status: "New",
            customEncryptedDetails: `Inquiry received over ${msgPlatform}. Auto response trigger generated. Client queries FAQs.`
          })
        });
        if (leadRes.ok) {
          const newLead = await leadRes.json();
          onNewLeadCreated(newLead);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setMsgLoading(false);
    }
  };

  // Submit message in the live floating chat widget
  const handleWebWidgetSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!webWidgetInput.trim() || webWidgetLoading) return;

    const userText = webWidgetInput.trim();
    setWebWidgetInput("");
    setWebWidgetHistory((prev) => [
      ...prev, 
      { sender: "customer", text: userText, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
    ]);
    setWebWidgetLoading(true);

    try {
      const res = await fetch("/api/chatbot/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessId: targetBizId,
          message: userText,
          conversationHistory: [] // fresh context
        })
      });

      if (!res.ok) throw new Error();
      const data = await res.json();

      setWebWidgetHistory((prev) => [
        ...prev, 
        { sender: "bot", text: data.reply, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
      ]);

      // Open lead collection sheet if Gemini flags a lead action
      if (data.leadGenerated && !widgetLeadSubmitted) {
        setWebWidgetLeadAlert(true);
        setShowLeadForm(true);
      }
    } catch (e) {
      console.error("Widget API Chat Error:", e);
    } finally {
      setWebWidgetLoading(false);
    }
  };

  // Submit Lead from the live floating chat widget lead capture form
  const handleWidgetLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!widgetLeadName.trim() || !widgetLeadEmail.trim()) return;

    try {
      const leadRes = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessId: targetBizId,
          name: widgetLeadName,
          email: widgetLeadEmail,
          phone: widgetLeadPhone || "+1 (555) 000-0000",
          source: "Chat Widget",
          message: webWidgetHistory.filter(m => m.sender === "customer").map(m => m.text).slice(-1)[0] || "Chat interactive inquiry",
          value: activeBiz.id === "biz-1" ? 120 : activeBiz.id === "biz-2" ? 85 : 50,
          status: "New",
          customEncryptedDetails: `Interactive Live Website Chat Widget query lead. Customer selected custom styling: ${activeBiz.chatSettings.themeStyle || 'modern'}. Answered by chatbot using configured FAQs.`
        })
      });

      if (leadRes.ok) {
        const newLead = await leadRes.json();
        onNewLeadCreated(newLead);
        setWidgetLeadSubmitted(true);
        setShowLeadForm(false);
        setWebWidgetHistory((prev) => [
          ...prev,
          { 
            sender: "bot", 
            text: `Perfect, thank you ${widgetLeadName}! I've locked in your request and routed your contact details securely to our CRM inbox. A representative will reach out very shortly!`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
        setTimeout(() => setWebWidgetLeadAlert(false), 7000);
      }
    } catch (err) {
      console.error("Failed to submit widget lead", err);
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-5 gap-6 animate-fade-in" id="omnichannel-simulator-view">
      
      {/* Simulation Selector & Biz target (left 3 cols) */}
      <div className="xl:col-span-3 space-y-6">
        
        {/* Header Portfolio target card */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-md font-bold text-white font-sans flex items-center gap-1.5">
              <Sliders size={18} className="text-indigo-400" /> Omni-Channel Simulation Sandbox
            </h3>
            <p className="text-xs text-slate-400">Select business portfolio target to fire webhook simulation events.</p>
          </div>

          <select
            value={targetBizId}
            onChange={(e) => {
              setTargetBizId(e.target.value);
              setWfSuccess(null);
              setEmSuccess(null);
            }}
            className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 font-medium shrink-0"
            id="simulation-business-target"
          >
            {businesses.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>

        {/* Sub Navigation */}
        <div className="flex flex-wrap bg-slate-950 border border-slate-800 p-1 rounded-xl gap-1">
          <button
            onClick={() => setActiveSubTab("webform")}
            className={`flex-1 min-w-[120px] py-2 text-xs font-semibold rounded-lg font-sans transition flex items-center justify-center gap-1.5 ${
              activeSubTab === "webform" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Globe size={14} /> Webform Inquiry
          </button>
          <button
            onClick={() => setActiveSubTab("email")}
            className={`flex-1 min-w-[120px] py-2 text-xs font-semibold rounded-lg font-sans transition flex items-center justify-center gap-1.5 ${
              activeSubTab === "email" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Mail size={14} /> Email Listener
          </button>
          <button
            onClick={() => setActiveSubTab("messenger")}
            className={`flex-1 min-w-[150px] py-2 text-xs font-semibold rounded-lg font-sans transition flex items-center justify-center gap-1.5 ${
              activeSubTab === "messenger" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Smartphone size={14} /> WhatsApp / Messenger
          </button>
          <button
            onClick={() => setActiveSubTab("websites")}
            className={`flex-1 min-w-[150px] py-2 text-xs font-semibold rounded-lg font-sans transition flex items-center justify-center gap-1.5 ${
              activeSubTab === "websites" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Globe size={14} className="text-emerald-400" /> Public Website & Widgets
          </button>
        </div>

        {/* Webform Simulator Panel */}
        {activeSubTab === "webform" && (
          <form onSubmit={handleWebformSubmit} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-5 animate-fade-in" id="webform-simulator">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div>
                <h4 className="text-sm font-bold text-slate-200 font-sans flex items-center gap-1.5">
                  <Globe size={16} className="text-blue-400" /> Simulated Web Contact Form Hook
                </h4>
                <p className="text-xs text-slate-400">Triggers an API web-hook representing a client contact request.</p>
              </div>

              <button
                type="button"
                onClick={() => loadPreset("webform", activeBiz.category)}
                className="px-2.5 py-1 bg-slate-850 hover:bg-slate-800 text-[10px] font-mono text-slate-400 border border-slate-800 rounded"
              >
                Load Preset Text
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase text-slate-400 block">Customer Name</label>
                <input
                  type="text"
                  value={wfName}
                  onChange={(e) => setWfName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 font-sans focus:outline-none"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase text-slate-400 block">Customer Email</label>
                <input
                  type="email"
                  value={wfEmail}
                  onChange={(e) => setWfEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 font-sans focus:outline-none"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase text-slate-400 block">Customer Phone</label>
                <input
                  type="text"
                  value={wfPhone}
                  onChange={(e) => setWfPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 font-sans focus:outline-none"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-mono uppercase text-slate-400 block">Form Message (Detailed request)</label>
              <textarea
                value={wfMessage}
                onChange={(e) => setWfMessage(e.target.value)}
                rows={4}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 font-sans focus:outline-none leading-relaxed"
                required
              />
            </div>

            <button
              type="submit"
              disabled={wfLoading}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-55 text-white font-semibold font-sans rounded-xl text-xs transition flex items-center justify-center gap-1.5"
              id="simulate-webform-btn"
            >
              {wfLoading ? (
                <>
                  <RefreshCw size={13} className="animate-spin" /> Analyzing with Gemini AI & encrypting payload...
                </>
              ) : (
                <>
                  Submit Inquiry Webform <ArrowRight size={13} />
                </>
              )}
            </button>

            {/* Success Alert */}
            {wfSuccess && (
              <div className="bg-emerald-950/20 border border-emerald-500/25 p-4 rounded-xl space-y-2 animate-fade-in" id="webform-success-banner">
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                  <CheckCircle size={15} /> Lead Registered & Encrypted Successfully!
                </div>
                <div className="text-xs text-slate-300 leading-relaxed font-sans font-light">
                  <strong>Gemini extractor</strong> completed processing! Lead is flagged with an estimated value of <strong>${wfSuccess.value}</strong> inside category <strong>{wfSuccess.aiSummary}</strong>. Data has been encrypted with AES-256 and stored in the central leads ledger.
                </div>
              </div>
            )}
          </form>
        )}

        {/* Email Simulator Panel */}
        {activeSubTab === "email" && (
          <form onSubmit={handleEmailSubmit} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-5 animate-fade-in" id="email-simulator">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div>
                <h4 className="text-sm font-bold text-slate-200 font-sans flex items-center gap-1.5">
                  <Mail size={16} className="text-violet-400" /> Simulated Mail Server Listener
                </h4>
                <p className="text-xs text-slate-400">Pipes an inbound customer email directly into the centralized AI daemon.</p>
              </div>

              <button
                type="button"
                onClick={() => loadPreset("email", activeBiz.category)}
                className="px-2.5 py-1 bg-slate-850 hover:bg-slate-800 text-[10px] font-mono text-slate-400 border border-slate-800 rounded"
              >
                Load Preset Text
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase text-slate-400 block">Sender Name</label>
                <input
                  type="text"
                  value={emSender}
                  onChange={(e) => setEmSender(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 font-sans focus:outline-none"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase text-slate-400 block">Sender Email Address</label>
                <input
                  type="email"
                  value={emSenderEmail}
                  onChange={(e) => setEmSenderEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 font-sans focus:outline-none"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-mono uppercase text-slate-400 block">Email Subject</label>
              <input
                type="text"
                value={emSubject}
                onChange={(e) => setEmSubject(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 font-sans focus:outline-none"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-mono uppercase text-slate-400 block">Email Plain Text Body</label>
              <textarea
                value={emBody}
                onChange={(e) => setEmBody(e.target.value)}
                rows={4}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 font-sans focus:outline-none leading-relaxed"
                required
              />
            </div>

            <button
              type="submit"
              disabled={emLoading}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-55 text-white font-semibold font-sans rounded-xl text-xs transition flex items-center justify-center gap-1.5"
              id="simulate-email-btn"
            >
              {emLoading ? (
                <>
                  <RefreshCw size={13} className="animate-spin" /> Pre-composing automated reply with Gemini...
                </>
              ) : (
                <>
                  Receive Incoming Email <ArrowRight size={13} />
                </>
              )}
            </button>

            {/* Email Success with Draft reply preview */}
            {emSuccess && (
              <div className="bg-slate-950 border border-violet-500/20 p-5 rounded-xl space-y-3.5 animate-fade-in" id="email-success-banner">
                <div className="flex items-center gap-2 text-violet-400 text-xs font-bold">
                  <Sparkles size={14} /> AI Reply Generated & Saved in Outbox Drafts!
                </div>
                
                <div className="text-xs text-slate-300 leading-relaxed font-sans font-light">
                  A new hot lead was captured with an estimated value of <strong>${emSuccess.lead.value}</strong>.
                  The daemon analyzed the email against your business FAQ rules and drafted the following reply:
                </div>

                <div className="bg-slate-900 border border-slate-850 p-4 rounded-xl space-y-2 relative">
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(emSuccess.replyDraft);
                      alert("Email draft copied to clipboard!");
                    }}
                    className="absolute right-3 top-3 p-1.5 bg-slate-950 hover:bg-slate-800 text-slate-400 rounded hover:text-white transition"
                    title="Copy response"
                  >
                    <Copy size={12} />
                  </button>
                  <pre className="text-[10px] text-slate-300 font-sans leading-relaxed whitespace-pre-wrap">
                    {emSuccess.replyDraft}
                  </pre>
                </div>
              </div>
            )}
          </form>
        )}

        {/* WhatsApp and Messenger Configurations and Chat */}
        {activeSubTab === "messenger" && (
          <div className="space-y-6 animate-fade-in">
            {/* Omni-Channel configurations */}
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
              <div>
                <h4 className="text-xs font-mono text-slate-300 uppercase tracking-wider block">Integrate WhatsApp & FB Messenger Channels</h4>
                <p className="text-xs text-slate-400 mt-1">Manage webhooks and metadata configuration credentials.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* WhatsApp */}
                <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200">WhatsApp Business API</span>
                    <span className={`w-2.5 h-2.5 rounded-full block animate-pulse ${activeBiz.channels.whatsapp.connected ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                  </div>
                  
                  <div className="space-y-2 text-[10px] font-mono text-slate-400">
                    <div>
                      <span className="block text-slate-500">SIMULATED PHONE:</span>
                      <span className="text-slate-200">{activeBiz.channels.whatsapp.phoneNumber || "Not Configured"}</span>
                    </div>
                    <div>
                      <span className="block text-slate-500">LIVE WEBHOOK ENDPOINT:</span>
                      <span className="text-indigo-400 truncate block">https://central-api.cloud/wh/wa/{activeBiz.id}</span>
                    </div>
                  </div>
                </div>

                {/* FB Messenger */}
                <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200">FB Messenger Portal</span>
                    <span className={`w-2.5 h-2.5 rounded-full block animate-pulse ${activeBiz.channels.messenger.connected ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                  </div>

                  <div className="space-y-2 text-[10px] font-mono text-slate-400">
                    <div>
                      <span className="block text-slate-500">SIMULATED PAGE ID:</span>
                      <span className="text-slate-200">{activeBiz.channels.messenger.pageId || "Not Configured"}</span>
                    </div>
                    <div>
                      <span className="block text-slate-500">LIVE WEBHOOK ENDPOINT:</span>
                      <span className="text-indigo-400 truncate block">https://central-api.cloud/wh/fb/{activeBiz.id}</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* Public Simulated Websites & Live Custom Chat Widgets */}
        {activeSubTab === "websites" && (
          <div className="space-y-6 animate-fade-in" id="websites-simulator">
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-4">
                <div>
                  <h4 className="text-sm font-bold text-slate-200 font-sans flex items-center gap-1.5">
                    <Globe size={16} className="text-emerald-400" /> Simulated Live Website Sandbox
                  </h4>
                  <p className="text-xs text-slate-400">Launch public website to test how custom visual themes and FAQ knowledge perform in real-time.</p>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="font-mono text-[10px] bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-full border border-emerald-500/20 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping"></span> Chat widget connected
                  </span>
                </div>
              </div>

              {/* Simulated Browser Frame */}
              <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl flex flex-col h-[650px] relative">
                
                {/* Browser Address Bar / Header */}
                <div className="bg-slate-900 px-4 py-2 flex items-center gap-3 border-b border-slate-850 shrink-0">
                  <div className="flex gap-1.5 shrink-0">
                    <span className="w-3 h-3 rounded-full bg-red-500/60 block"></span>
                    <span className="w-3 h-3 rounded-full bg-yellow-500/60 block"></span>
                    <span className="w-3 h-3 rounded-full bg-green-500/60 block"></span>
                  </div>
                  <div className="flex-1 bg-slate-950 rounded-lg px-3 py-1 flex items-center justify-between text-[11px] font-mono text-slate-400 border border-slate-850">
                    <div className="flex items-center gap-1.5 truncate">
                      <Lock size={10} className="text-emerald-500" />
                      <span className="text-slate-300">https://</span>
                      <span className="text-slate-100 font-medium">
                        {activeBiz.id === "biz-1" && "mayfieldphonerepair.com.au"}
                        {activeBiz.id === "biz-2" && "selfrepairkit.com.au"}
                        {activeBiz.id === "biz-3" && "repairbill.shop"}
                        {!["biz-1", "biz-2", "biz-3"].includes(activeBiz.id) && `www.${activeBiz.name.toLowerCase().replace(/[^a-z0-9]/g, "")}.com`}
                      </span>
                    </div>
                    <RefreshCw size={10} className="text-slate-500 hover:text-slate-300 cursor-pointer" />
                  </div>
                </div>

                {/* Simulated Webpage Contents */}
                <div className="flex-1 overflow-y-auto bg-slate-55 text-slate-800 relative font-sans">
                  
                  {/* Business 1: Mayfield Repairs */}
                  {activeBiz.id === "biz-1" && (
                    <div className="min-h-full flex flex-col bg-slate-50">
                      {/* Nav */}
                      <header className="bg-white border-b border-slate-100 px-6 py-4 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xs">M</div>
                          <span className="font-extrabold text-slate-900 tracking-tight text-sm">Mayfield Repairs</span>
                        </div>
                        <nav className="flex gap-4 text-xs font-semibold text-slate-500">
                          <span className="text-indigo-600 hover:underline cursor-pointer">Home</span>
                          <span className="hover:underline cursor-pointer">Services</span>
                          <span className="hover:underline cursor-pointer">Pricing</span>
                        </nav>
                      </header>

                      {/* Hero */}
                      <section className="px-8 py-10 text-center space-y-4 max-w-2xl mx-auto flex-1 flex flex-col justify-center">
                        <div className="inline-flex items-center gap-1 bg-indigo-50 border border-indigo-100 text-indigo-700 px-2.5 py-1 rounded-full text-[10px] font-semibold w-max mx-auto">
                          <ShieldCheck size={12} className="text-indigo-600" /> Lifetime Parts & Labor Warranty
                        </div>
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight leading-none">
                          Express Device Repairs <br />
                          <span className="text-indigo-600">While You Wait</span>
                        </h1>
                        <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed font-sans font-light">
                          Shattered iPhone screens, dead Samsung batteries, flashing iPad lines? Walk-in repairs completed by certified technicians in under 45 minutes.
                        </p>
                        <div className="flex justify-center gap-2.5 pt-2">
                          <button 
                            type="button"
                            onClick={() => setWebWidgetOpen(true)}
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-lg shadow-sm cursor-pointer"
                          >
                            Get Live Quote
                          </button>
                          <span className="px-4 py-2 bg-slate-100 border border-slate-205 text-slate-600 font-semibold text-xs rounded-lg">
                            Diagnostic: $19.99
                          </span>
                        </div>
                      </section>

                      {/* Features */}
                      <section className="bg-white px-6 py-6 border-t border-slate-100 grid grid-cols-3 gap-4 text-center">
                        <div className="space-y-1">
                          <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center mx-auto text-indigo-600"><Clock size={15} /></div>
                          <h4 className="text-[11px] font-bold text-slate-900 font-sans">30-Min Screen Swap</h4>
                          <p className="text-[10px] text-slate-400 font-sans font-light">Repairs completed fast</p>
                        </div>
                        <div className="space-y-1">
                          <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center mx-auto text-indigo-600"><ShieldCheck size={15} /></div>
                          <h4 className="text-[11px] font-bold text-slate-900 font-sans">Lifetime Warranty</h4>
                          <p className="text-[10px] text-slate-400 font-sans font-light font-sans font-light">On all parts & labor</p>
                        </div>
                        <div className="space-y-1">
                          <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center mx-auto text-indigo-600"><Award size={15} /></div>
                          <h4 className="text-[11px] font-bold text-slate-900 font-sans">Certified Parts</h4>
                          <p className="text-[10px] text-slate-400 font-sans font-light">OEM quality standards</p>
                        </div>
                      </section>
                    </div>
                  )}

                  {/* Business 2: SelfRepairKit */}
                  {activeBiz.id === "biz-2" && (
                    <div className="min-h-full flex flex-col bg-emerald-50/20">
                      {/* Nav */}
                      <header className="bg-white border-b border-emerald-100/40 px-6 py-4 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold text-xs">S</div>
                          <span className="font-extrabold text-slate-900 tracking-tight text-sm">SelfRepairKit</span>
                        </div>
                        <nav className="flex gap-4 text-xs font-semibold text-slate-500">
                          <span className="text-emerald-600 hover:underline cursor-pointer">DIY Kits</span>
                          <span className="hover:underline cursor-pointer">Guides</span>
                        </nav>
                      </header>

                      {/* Hero */}
                      <section className="px-8 py-10 text-center space-y-4 max-w-2xl mx-auto flex-1 flex flex-col justify-center">
                        <div className="inline-flex items-center gap-1 bg-emerald-50 border border-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full text-[10px] font-semibold w-max mx-auto font-sans">
                          🛠️ Complete Tool Kits Included
                        </div>
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight leading-none font-sans">
                          Fix Your Device. <br />
                          <span className="text-emerald-600">You Can Do This!</span>
                        </h1>
                        <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed font-sans font-light">
                          Premium DIY cellphone repair tools, adhesive seals, and step-by-step video calibration guides. No expert skills required.
                        </p>
                        <div className="flex justify-center gap-2.5 pt-2">
                          <button 
                            type="button"
                            onClick={() => setWebWidgetOpen(true)}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-lg shadow-sm cursor-pointer"
                          >
                            Find Your Kit
                          </button>
                          <span className="px-4 py-2 bg-white border border-slate-200 text-emerald-700 font-semibold text-xs rounded-lg flex items-center gap-1 font-sans">
                            30-Day Guarantee
                          </span>
                        </div>
                      </section>

                      {/* Features */}
                      <section className="bg-white/95 px-6 py-6 border-t border-emerald-100/40 grid grid-cols-3 gap-4 text-center">
                        <div className="space-y-1">
                          <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center mx-auto text-emerald-600"><Wrench size={15} /></div>
                          <h4 className="text-[11px] font-bold text-slate-900 font-sans">Magnetic Tools</h4>
                          <p className="text-[10px] text-slate-400 font-sans font-light">Everything you need</p>
                        </div>
                        <div className="space-y-1">
                          <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center mx-auto text-emerald-600"><ShieldCheck size={15} /></div>
                          <h4 className="text-[11px] font-bold text-slate-900 font-sans">Tested Parts</h4>
                          <p className="text-[10px] text-slate-400 font-sans font-light">100% QC checked</p>
                        </div>
                        <div className="space-y-1">
                          <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center mx-auto text-emerald-600"><Sparkles size={15} /></div>
                          <h4 className="text-[11px] font-bold text-slate-900 font-sans">Easy Guides</h4>
                          <p className="text-[10px] text-slate-400 font-sans font-light">Step-by-step videos</p>
                        </div>
                      </section>
                    </div>
                  )}

                  {/* Business 3: RepairBill */}
                  {activeBiz.id === "biz-3" && (
                    <div className="min-h-full flex flex-col bg-slate-950 text-slate-100 font-sans">
                      {/* Nav */}
                      <header className="bg-slate-900 border-b border-slate-850 px-6 py-4 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-red-600 rounded-lg flex items-center justify-center text-white font-bold text-xs">R</div>
                          <span className="font-extrabold text-white tracking-tight text-sm">RepairBill</span>
                        </div>
                        <nav className="flex gap-4 text-xs font-semibold text-slate-400">
                          <span className="text-red-500 hover:underline cursor-pointer">Secure Portal</span>
                          <span className="hover:underline cursor-pointer">Contact SSL</span>
                        </nav>
                      </header>

                      {/* Hero */}
                      <section className="px-8 py-10 text-center space-y-4 max-w-2xl mx-auto flex-1 flex flex-col justify-center">
                        <div className="inline-flex items-center gap-1 bg-red-500/10 border border-red-500/20 text-red-400 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase w-max mx-auto font-mono">
                          💳 PCI-DSS LEVEL 1 COMPLIANT
                        </div>
                        <h1 className="text-3xl font-extrabold text-white tracking-tight leading-none">
                          Secure Billing & <br />
                          <span className="text-red-500">Invoice Verification</span>
                        </h1>
                        <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed font-light">
                          Enterprise invoicing gateway for repair shops and telecom operators. Secured with end-to-end AES-256 tokens and SSL protocols.
                        </p>
                        <div className="flex justify-center gap-2.5 pt-2">
                          <button 
                            type="button"
                            onClick={() => setWebWidgetOpen(true)}
                            className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-semibold text-xs rounded shadow-md cursor-pointer"
                          >
                            Verify Invoice
                          </button>
                          <span className="px-4 py-2 bg-slate-900 border border-slate-800 text-slate-300 font-bold text-xs rounded">
                            SSL Secured
                          </span>
                        </div>
                      </section>

                      {/* Features */}
                      <section className="bg-slate-900 px-6 py-6 border-t border-slate-800 grid grid-cols-3 gap-4 text-center">
                        <div className="space-y-1">
                          <div className="w-8 h-8 rounded bg-slate-850 flex items-center justify-center mx-auto text-red-500"><Lock size={15} /></div>
                          <h4 className="text-[11px] font-bold text-white tracking-wider">AES-256 Tokens</h4>
                          <p className="text-[10px] text-slate-500 font-light font-sans">No cards stored</p>
                        </div>
                        <div className="space-y-1">
                          <div className="w-8 h-8 rounded bg-slate-850 flex items-center justify-center mx-auto text-red-500"><CreditCard size={15} /></div>
                          <h4 className="text-[11px] font-bold text-white tracking-wider">Verified Gateway</h4>
                          <p className="text-[10px] text-slate-500 font-light font-sans">PCI certified</p>
                        </div>
                        <div className="space-y-1">
                          <div className="w-8 h-8 rounded bg-slate-850 flex items-center justify-center mx-auto text-red-500"><ShieldCheck size={15} /></div>
                          <h4 className="text-[11px] font-bold text-white tracking-wider">Refund Safety</h4>
                          <p className="text-[10px] text-slate-500 font-light font-sans">Bank integrated</p>
                        </div>
                      </section>
                    </div>
                  )}

                  {/* Default / User Custom Business */}
                  {!["biz-1", "biz-2", "biz-3"].includes(activeBiz.id) && (
                    <div className="min-h-full flex flex-col bg-slate-50 font-sans">
                      {/* Nav */}
                      <header className="bg-white border-b border-slate-100 px-6 py-4 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-lg flex items-center justify-center text-white font-bold text-xs" style={{ backgroundColor: activeBiz.chatSettings.avatarColor || '#4f46e5' }}>C</div>
                          <span className="font-extrabold text-slate-900 tracking-tight text-sm">{activeBiz.name}</span>
                        </div>
                      </header>

                      {/* Hero */}
                      <section className="px-8 py-10 text-center space-y-4 max-w-2xl mx-auto flex-1 flex flex-col justify-center">
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight leading-none">
                          Welcome to <br />
                          <span style={{ color: activeBiz.chatSettings.avatarColor || '#4f46e5' }}>{activeBiz.name}</span>
                        </h1>
                        <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed font-light">
                          {activeBiz.description || "We provide premium services and support solutions. Chat with our dynamic customer assistant helper to find rates and schedule appointments instantly."}
                        </p>
                        <div className="flex justify-center pt-2">
                          <button 
                            type="button"
                            onClick={() => setWebWidgetOpen(true)}
                            className="px-4 py-2 text-white font-semibold text-xs rounded-lg shadow-sm cursor-pointer"
                            style={{ backgroundColor: activeBiz.chatSettings.avatarColor || '#4f46e5' }}
                          >
                            Chat With Us
                          </button>
                        </div>
                      </section>
                    </div>
                  )}

                  {/* ----------------------------------------------------------- */}
                  {/* FLOATING LIVE CHAT WIDGET */}
                  {/* ----------------------------------------------------------- */}
                  <div className="absolute bottom-5 right-5 z-40 flex flex-col items-end">
                    
                    {/* Chat widget window */}
                    {webWidgetOpen ? (
                      <div 
                        className={`w-80 h-[460px] rounded-2xl flex flex-col shadow-2xl overflow-hidden transition-all duration-300 border mb-3 text-slate-800 text-left ${
                          activeBiz.chatSettings.themeStyle === "glass" ? "backdrop-blur-lg bg-white/75 border-white/30 shadow-white/5 font-sans" :
                          activeBiz.chatSettings.themeStyle === "playful" ? "rounded-3xl border-2 border-slate-100 bg-white font-sans" :
                          activeBiz.chatSettings.themeStyle === "retro" ? "font-mono border-2 border-emerald-500 bg-black text-emerald-400" :
                          "bg-white border-slate-200 font-sans" // modern
                        }`}
                        id="live-website-chat-widget"
                      >
                        {/* Chat Header */}
                        <div 
                          className={`px-4 py-3 flex items-center justify-between text-white shrink-0 ${
                            activeBiz.chatSettings.themeStyle === "retro" ? "bg-zinc-950 border-b border-emerald-500" : ""
                          }`}
                          style={activeBiz.chatSettings.themeStyle === "retro" ? {} : { backgroundColor: activeBiz.chatSettings.avatarColor || '#4f46e5' }}
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-white/15 relative">
                              <span className="text-sm">{activeBiz.chatSettings.avatarIcon || "🤖"}</span>
                              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-450 rounded-full border border-white animate-pulse"></span>
                            </div>
                            <div>
                              <h4 className={`text-xs font-bold leading-tight ${activeBiz.chatSettings.themeStyle === "retro" ? "text-emerald-400 font-mono" : "text-white font-sans"}`}>
                                {activeBiz.chatSettings.botName || `${activeBiz.name} Assistant`}
                              </h4>
                              <span className={`text-[9px] block ${activeBiz.chatSettings.themeStyle === "retro" ? "text-emerald-600 font-mono" : "text-white/80 font-sans"}`}>
                                {activeBiz.chatSettings.themeStyle === "retro" ? "SYS_STATUS: ONLINE" : "Automated Help"}
                              </span>
                            </div>
                          </div>
                          
                          <button 
                            type="button" 
                            onClick={() => setWebWidgetOpen(false)}
                            className="p-1 hover:bg-white/10 rounded transition text-white/80 hover:text-white"
                          >
                            <X size={15} />
                          </button>
                        </div>

                        {/* Security Banner if lead alert */}
                        {webWidgetLeadAlert && (
                          <div className={`px-3 py-1.5 border-b flex items-center gap-2 shrink-0 ${
                            activeBiz.chatSettings.themeStyle === "retro" ? "bg-black border-emerald-500/30 text-emerald-500 font-mono text-[9px]" : "bg-indigo-55/70 border-indigo-100 text-indigo-700 text-[10px]"
                          }`}>
                            <Lock size={11} className={activeBiz.chatSettings.themeStyle === "retro" ? "text-emerald-500" : "text-indigo-500"} />
                            <span>
                              <strong>Secure CRM Portal Open</strong>
                            </span>
                          </div>
                        )}

                        {/* Chat History Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3 flex flex-col">
                          {webWidgetHistory.map((msg, idx) => (
                            <div 
                              key={idx} 
                              className={`flex gap-2 max-w-[85%] ${msg.sender === "customer" ? "ml-auto flex-row-reverse" : "mr-auto"}`}
                            >
                              {msg.sender === "bot" && (
                                <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center shrink-0 text-xs">
                                  {activeBiz.chatSettings.avatarIcon || "🤖"}
                                </div>
                              )}
                              <div>
                                <div 
                                  className={`p-2.5 text-xs leading-relaxed ${
                                    msg.sender === "customer" 
                                      ? (activeBiz.chatSettings.themeStyle === "retro" 
                                          ? "bg-emerald-950/40 text-emerald-300 border border-emerald-800 rounded-lg animate-fade-in" 
                                          : `text-white rounded-2xl rounded-tr-none animate-fade-in`)
                                      : (activeBiz.chatSettings.themeStyle === "retro" 
                                          ? "bg-black text-emerald-400 border border-emerald-700 rounded-lg animate-fade-in" 
                                          : "bg-slate-100 text-slate-800 rounded-2xl rounded-tl-none animate-fade-in")
                                  }`}
                                  style={msg.sender === "customer" && activeBiz.chatSettings.themeStyle !== "retro" ? { backgroundColor: activeBiz.chatSettings.avatarColor || '#4f46e5' } : {}}
                                >
                                  {msg.text}
                                </div>
                                <span className="text-[8px] text-slate-400 block mt-0.5 font-mono">
                                  {msg.timestamp || "Now"}
                                </span>
                              </div>
                            </div>
                          ))}

                          {/* Dynamic Lead Collection Form inside chat */}
                          {showLeadForm && (
                            <div className={`p-4 rounded-xl border space-y-3 my-2 text-left animate-fade-in ${
                              activeBiz.chatSettings.themeStyle === "retro" ? "border-emerald-500 bg-zinc-950 text-emerald-400 font-mono" : "bg-indigo-50/50 border-indigo-100 text-indigo-950 font-sans"
                            }`}>
                              <div className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                                <UserCheck size={12} className={activeBiz.chatSettings.themeStyle === "retro" ? "text-emerald-400" : "text-indigo-600"} />
                                Complete Request Details
                              </div>
                              <p className="text-[10px] text-slate-500 leading-normal font-sans font-light">
                                Share your contact details to safely save this query, get quotes, or book directly in the central operator ledger:
                              </p>
                              
                              <form onSubmit={handleWidgetLeadSubmit} className="space-y-2 text-left">
                                <input
                                  type="text"
                                  placeholder="Your Name (Required)"
                                  required
                                  value={widgetLeadName}
                                  onChange={(e) => setWidgetLeadName(e.target.value)}
                                  className={`w-full px-2.5 py-1.5 text-xs rounded border focus:outline-none ${
                                    activeBiz.chatSettings.themeStyle === "retro" 
                                      ? "bg-black border-emerald-800 text-emerald-400 focus:border-emerald-500 font-mono" 
                                      : "bg-white border-slate-200 text-slate-800 focus:border-indigo-500 font-sans"
                                  }`}
                                />
                                <input
                                  type="email"
                                  placeholder="Your Email (Required)"
                                  required
                                  value={widgetLeadEmail}
                                  onChange={(e) => setWidgetLeadEmail(e.target.value)}
                                  className={`w-full px-2.5 py-1.5 text-xs rounded border focus:outline-none ${
                                    activeBiz.chatSettings.themeStyle === "retro" 
                                      ? "bg-black border-emerald-800 text-emerald-400 focus:border-emerald-500 font-mono" 
                                      : "bg-white border-slate-200 text-slate-800 focus:border-indigo-500 font-sans"
                                  }`}
                                />
                                <input
                                  type="text"
                                  placeholder="Phone Number (Optional)"
                                  value={widgetLeadPhone}
                                  onChange={(e) => setWidgetLeadPhone(e.target.value)}
                                  className={`w-full px-2.5 py-1.5 text-xs rounded border focus:outline-none ${
                                    activeBiz.chatSettings.themeStyle === "retro" 
                                      ? "bg-black border-emerald-800 text-emerald-400 focus:border-emerald-500 font-mono" 
                                      : "bg-white border-slate-200 text-slate-800 focus:border-indigo-500 font-sans"
                                  }`}
                                />
                                <button
                                  type="submit"
                                  className="w-full py-1.5 font-bold uppercase text-[10px] tracking-wider rounded transition cursor-pointer"
                                  style={activeBiz.chatSettings.themeStyle === "retro" ? { border: "1px solid #10b981", color: "#10b981" } : { backgroundColor: activeBiz.chatSettings.avatarColor || '#4f46e5', color: 'white' }}
                                >
                                  Lock in Request & Sync
                                </button>
                              </form>
                            </div>
                          )}

                          {webWidgetLoading && (
                            <div className="flex gap-2 max-w-[80%] mr-auto">
                              <div className="w-5 h-5 rounded-full bg-slate-150 flex items-center justify-center shrink-0 text-xs">
                                {activeBiz.chatSettings.avatarIcon || "🤖"}
                              </div>
                              <div className={`px-3 py-1.5 rounded-2xl rounded-tl-none flex items-center gap-1 ${
                                activeBiz.chatSettings.themeStyle === "retro" ? "bg-black border border-emerald-800" : "bg-slate-100"
                              }`}>
                                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Input Footer */}
                        <form onSubmit={handleWebWidgetSend} className={`p-3 border-t shrink-0 flex gap-1.5 ${
                          activeBiz.chatSettings.themeStyle === "retro" ? "bg-black border-emerald-500" : "bg-slate-50"
                        }`}>
                          <input
                            type="text"
                            placeholder="Type a message..."
                            value={webWidgetInput}
                            onChange={(e) => setWebWidgetInput(e.target.value)}
                            disabled={showLeadForm}
                            className={`flex-1 px-3 py-2 text-xs rounded-xl focus:outline-none focus:border-indigo-500 transition border ${
                              activeBiz.chatSettings.themeStyle === "retro" 
                                ? "bg-black border-emerald-800 text-emerald-400 placeholder:text-emerald-800 font-mono" 
                                : "bg-white border-slate-200 text-slate-800 font-sans"
                            }`}
                          />
                          <button
                            type="submit"
                            disabled={!webWidgetInput.trim() || webWidgetLoading || showLeadForm}
                            className="p-2 rounded-xl transition text-white shrink-0 disabled:opacity-40 cursor-pointer"
                            style={activeBiz.chatSettings.themeStyle === "retro" ? { border: "1px solid #10b981", color: "#10b981" } : { backgroundColor: activeBiz.chatSettings.avatarColor || '#4f46e5' }}
                          >
                            <Send size={12} />
                          </button>
                        </form>
                      </div>
                    ) : (
                      <button 
                        type="button"
                        onClick={() => setWebWidgetOpen(true)}
                        className="p-3.5 rounded-full shadow-2xl flex items-center justify-center text-white scale-100 hover:scale-105 active:scale-95 transition-all duration-200 relative group cursor-pointer"
                        style={{ backgroundColor: activeBiz.chatSettings.avatarColor || '#4f46e5' }}
                      >
                        <span className="text-xl">{activeBiz.chatSettings.avatarIcon || "🤖"}</span>
                        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border border-white rounded-full flex items-center justify-center">
                          <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></span>
                        </span>
                        
                        {/* Tooltip */}
                        <div className="absolute right-14 bg-slate-900 border border-slate-850 text-white font-medium text-[10px] px-2.5 py-1.5 rounded-lg whitespace-nowrap shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none flex items-center gap-1.5">
                          <span>Chat with <strong>{activeBiz.chatSettings.botName || activeBiz.name}</strong></span>
                        </div>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Right 2 cols: Chat messenger UI simulator */}
      <div className="xl:col-span-2">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl h-[580px] flex flex-col justify-between overflow-hidden shadow-lg" id="omnichannel-phone-mock">
          {/* Mock Mobile Header */}
          <div className="px-4 py-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 rounded-lg shrink-0">
                <Smartphone size={15} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white font-sans flex items-center gap-1.5">
                  Omni-Channel Device Preview
                </h4>
                <div className="flex items-center gap-1 text-[9px] font-mono text-slate-500">
                  <span>NETWORK: ONLINE</span>
                  <span>•</span>
                  <span className="text-emerald-400 uppercase">{msgPlatform} Channel</span>
                </div>
              </div>
            </div>

            <div className="flex bg-slate-900 border border-slate-800 p-0.5 rounded-md text-[10px] font-mono">
              <button 
                onClick={() => {
                  setMsgPlatform("WhatsApp");
                  setMsgHistory([
                    { sender: "customer", text: "Hey! Just wanted to ask a quick question." },
                    { sender: "bot", text: "Hello! Thanks for reaching out. How can I help you today?" }
                  ]);
                }}
                className={`px-1.5 py-0.5 rounded ${msgPlatform === "WhatsApp" ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
              >
                WA
              </button>
              <button 
                onClick={() => {
                  setMsgPlatform("Messenger");
                  setMsgHistory([
                    { sender: "customer", text: "Hello, looking for details." },
                    { sender: "bot", text: "Welcome to Facebook Chat support. What's on your mind?" }
                  ]);
                }}
                className={`px-1.5 py-0.5 rounded ${msgPlatform === "Messenger" ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
              >
                FB
              </button>
            </div>
          </div>

          {/* Chat transcript */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-950/40">
            {msgHistory.map((msg, idx) => (
              <div 
                key={idx} 
                className={`flex gap-2 max-w-[85%] ${msg.sender === "customer" ? "ml-auto flex-row-reverse" : "mr-auto"}`}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[10px] ${
                  msg.sender === "customer" ? "bg-slate-800 text-slate-300" : "bg-indigo-600 text-white"
                }`}>
                  {msg.sender === "customer" ? <User size={10} /> : <Bot size={10} />}
                </div>
                <div>
                  <div className={`p-3 rounded-2xl text-xs leading-relaxed font-sans ${
                    msg.sender === "customer" 
                      ? "bg-slate-850 text-slate-200 rounded-tr-none" 
                      : "bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none"
                  }`}>
                    {msg.text}
                  </div>
                </div>
              </div>
            ))}

            {msgLoading && (
              <div className="flex gap-2 max-w-[80%] mr-auto">
                <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                  <Bot size={10} />
                </div>
                <div className="bg-slate-900 border border-slate-800 px-3.5 py-2.5 rounded-2xl rounded-tl-none flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                  <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                  <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                </div>
              </div>
            )}
          </div>

          {/* Quick preset trigger area */}
          {activeSubTab === "messenger" && (
            <div className="px-3 py-2 bg-slate-950 border-t border-slate-800/80 flex items-center justify-between">
              <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block">Simulator Presets:</span>
              <button
                onClick={() => loadPreset("messenger", activeBiz.category)}
                className="text-[10px] font-sans text-indigo-400 hover:underline"
              >
                Autoload relevant FAQ inquiry text
              </button>
            </div>
          )}

          {/* Chat input box */}
          <form onSubmit={handleSendMessage} className="p-3 bg-slate-950 border-t border-slate-800 flex gap-2">
            <input
              type="text"
              placeholder={`Send message as customer over ${msgPlatform}...`}
              value={msgInput}
              onChange={(e) => setMsgInput(e.target.value)}
              className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-100 focus:outline-none"
              id="messenger-simulator-input"
            />
            <button
              type="submit"
              disabled={!msgInput.trim() || msgLoading}
              className="p-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition duration-150"
              id="send-messenger-simulator-btn"
            >
              <Send size={14} />
            </button>
          </form>
        </div>

        {/* Tip Box */}
        <div className="mt-3 bg-slate-950 border border-slate-800 p-3.5 rounded-xl text-xs text-slate-400 flex gap-2.5 items-start">
          <AlertCircle size={15} className="text-indigo-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed font-sans font-light">
            <strong>System Auto-Reply Flow:</strong> When customer messages are piped over WhatsApp/Messenger, the Gemini AI service validates and auto-replies instantly using FAQs. It automatically creates an encrypted CRM profile if they ask to book or requests custom quotes.
          </p>
        </div>
      </div>

    </div>
  );
}
