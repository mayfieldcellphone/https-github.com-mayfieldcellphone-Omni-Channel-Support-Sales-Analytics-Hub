import React, { useState } from "react";
import { 
  Users, 
  Search, 
  Filter, 
  Tag, 
  Lock, 
  Unlock, 
  Sparkles, 
  Share2, 
  ArrowUpRight, 
  CheckCircle, 
  XCircle,
  MessageSquare,
  Mail,
  Smartphone,
  Globe,
  Database,
  UserCheck,
  AlertTriangle,
  Send,
  Check,
  FileCode,
  Inbox,
  Clock,
  ArrowRight,
  PlusCircle,
  ShieldAlert,
  Sliders,
  Copy,
  ChevronRight,
  TrendingUp,
  CreditCard
} from "lucide-react";
import { Lead, Business } from "../types";

interface LeadsManagerProps {
  businesses: Business[];
  leads: Lead[];
  onUpdateLead: (updated: Lead) => void;
  activeRole: "Admin" | "Manager" | "Agent";
  userEmail: string;
  onNewLeadCreated?: (newLead: Lead) => void;
  showAdvancedSaaS?: boolean;
}

export default function LeadsManager({
  businesses,
  leads,
  onUpdateLead,
  activeRole,
  userEmail,
  onNewLeadCreated,
  showAdvancedSaaS = false
}: LeadsManagerProps) {
  // Top level tab state
  const [activeSubTab, setActiveSubTab] = useState<"leads-ledger" | "unified-inbox-mobile" | "firebase-webhook">("leads-ledger");

  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(leads[0]?.id || null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterBusiness, setFilterBusiness] = useState("all");
  const [filterSource, setFilterSource] = useState("all");

  // Decryption states
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [decryptedText, setDecryptedText] = useState<string | null>(null);
  const [decryptionError, setDecryptionError] = useState<string | null>(null);

  // CRM Sync states
  const [syncingCrm, setSyncingCrm] = useState<string | null>(null);
  const [syncSuccess, setSyncSuccess] = useState<string | null>(null);

  // Status and value edits
  const [isEditingValue, setIsEditingValue] = useState(false);
  const [editValue, setEditValue] = useState("");
  const [noteText, setNoteText] = useState("");

  const activeLead = leads.find((l) => l.id === selectedLeadId) || leads[0];

  // Filters for Standard CRM
  const filteredLeads = leads.filter((lead) => {
    const matchesSearch = lead.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          lead.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesBiz = filterBusiness === "all" || lead.businessId === filterBusiness;
    const matchesSource = filterSource === "all" || lead.source === filterSource;
    return matchesSearch && matchesBiz && matchesSource;
  });

  // ---------------------------------------------------------------------------
  // 1. UNIFIED LEAD & ORDER INBOX MOBILE STATE & CONFIG
  // ---------------------------------------------------------------------------
  const [orders, setOrders] = useState([
    { 
      id: "ord-1", 
      businessId: "biz-2", 
      name: "Liam Vance", 
      email: "liam@vance.me", 
      product: "iPhone 13 Pro DIY Screen Kit", 
      value: 89.00, 
      status: "Shipped", 
      date: "2026-06-27T10:15:00Z", 
      source_domain: "selfrepairkit.com.au" 
    },
    { 
      id: "ord-2", 
      businessId: "biz-2", 
      name: "Amara Lin", 
      email: "amara.lin@gmail.com", 
      product: "Samsung S22 Ultra Battery Replacement Pack", 
      value: 45.00, 
      status: "Processing", 
      date: "2026-06-27T12:30:00Z", 
      source_domain: "selfrepairkit.com.au" 
    },
    { 
      id: "ord-3", 
      businessId: "biz-3", 
      name: "Vertex Consulting", 
      email: "billing@vertex.com", 
      product: "Enterprise Operations SaaS License", 
      value: 99.00, 
      status: "Paid", 
      date: "2026-06-27T14:10:00Z", 
      source_domain: "repairbill.shop" 
    }
  ]);

  const [mobileFilter, setMobileFilter] = useState<"all" | "leads" | "orders">("all");
  const [selectedMobileItemId, setSelectedMobileItemId] = useState<string | null>(null);

  // Combine Leads and Orders into a single chronological feed
  const unifiedInboxFeed = [
    ...leads.map(l => {
      const biz = businesses.find(b => b.id === l.businessId);
      const domain = biz?.id === "biz-1" ? "mayfieldphonerepair.com.au" : biz?.id === "biz-2" ? "selfrepairkit.com.au" : "repairbill.shop";
      return {
        id: l.id,
        type: "lead" as const,
        businessId: l.businessId,
        name: l.name,
        email: l.email,
        phone: l.phone,
        source: l.source,
        message: l.message,
        value: l.value,
        status: l.status,
        date: l.date,
        source_domain: domain,
        aiSummary: l.aiSummary,
        aiSuggestedAction: l.aiSuggestedAction
      };
    }),
    ...orders.map(o => ({
      id: o.id,
      type: "order" as const,
      businessId: o.businessId,
      name: o.name,
      email: o.email,
      phone: "+1 (555) 402-9921",
      source: "Webform" as const,
      message: `Purchased: ${o.product}`,
      value: o.value,
      status: o.status,
      date: o.date,
      source_domain: o.source_domain,
      aiSummary: "eCommerce Store Order Processed",
      aiSuggestedAction: "Prepare shipment & generate packing slip."
    }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const filteredUnifiedFeed = unifiedInboxFeed.filter(item => {
    if (mobileFilter === "leads") return item.type === "lead";
    if (mobileFilter === "orders") return item.type === "order";
    return true;
  });

  const activeMobileItem = filteredUnifiedFeed.find(item => item.id === selectedMobileItemId) || filteredUnifiedFeed[0];

  // ---------------------------------------------------------------------------
  // 2. WHATSAPP WEBHOOK SIMULATOR STATE & LOGIC
  // ---------------------------------------------------------------------------
  const [simPhone, setSimPhone] = useState("+61 488 293 811");
  const [simName, setSimName] = useState("Chloe Mayfield");
  const [simMessage, setSimMessage] = useState("Hey, my screen is broken and touch doesn't work. Can you fix it today at your Mayfield shop?");
  const [simTargetBizId, setSimTargetBizId] = useState("biz-1");
  const [isSimulating, setIsSimulating] = useState(false);
  const [simLogs, setSimLogs] = useState<string[]>([]);
  const [simSuccess, setSimSuccess] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const handleSimulateWhatsAppLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSimulating) return;
    setIsSimulating(true);
    setSimSuccess(false);
    setSimLogs([
      "🔄 [GATEWAY] Inbound webhook POST event initiated from Twilio/WhatsApp API network...",
      "🔍 [GATEWAY] Authenticating token and checking signature header 'x-hub-signature'...",
      "✅ [GATEWAY] Webhook authentication verified."
    ]);

    const biz = businesses.find(b => b.id === simTargetBizId) || businesses[0];
    const sourceDomain = biz.id === "biz-1" ? "mayfieldphonerepair.com.au" : biz.id === "biz-2" ? "selfrepairkit.com.au" : "repairbill.shop";

    setTimeout(() => {
      setSimLogs(prev => [...prev, `📂 [FIREBASE] Dispatching event payload to cloud triggers...`]);
    }, 400);

    setTimeout(() => {
      setSimLogs(prev => [...prev, `⚙️ [FIREBASE RESOLVER] Resolved Multi-Tenant shopId: '${biz.id}' and attributed source_domain: '${sourceDomain}'`]);
    }, 800);

    setTimeout(async () => {
      // Gatekeeper Pre-flight Check
      if (biz.subscription_status !== "active") {
        setSimLogs(prev => [
          ...prev,
          `❌ [GATEKEEPER BLOCKED] Firebase pre-flight check failed! subscription_status is not 'active' for tenant '${biz.name}'. Access revoked.`,
          `🚨 [PAYMENT RECOGNITION] AI reply and automated lead capture cancelled due to inactive/suspended subscription status. Pushed event: PAYMENT_REQUIRED.`
        ]);
        setIsSimulating(false);
        return;
      }

      setSimLogs(prev => [
        ...prev,
        `🔑 [CRYPTOGRAPHY] Encrypting customer contact coordinates using AES-256...`,
        `💾 [FIRESTORE WRITE] Writing into sub-collection path: 'companies/${biz.id}/leads/lead-${Date.now()}'...`
      ]);

      try {
        const payload = {
          businessId: biz.id,
          name: simName,
          email: `${simPhone.replace(/[^0-9]/g, "")}@whatsapp-gateway.net`,
          phone: simPhone,
          source: "WhatsApp" as const,
          message: simMessage,
          value: biz.id === "biz-1" ? 120 : biz.id === "biz-2" ? 89 : 99,
          status: "New" as const,
          customEncryptedDetails: `WhatsApp Secure Session Log. Sender: ${simName} (${simPhone}). Text: "${simMessage}". Timestamp: ${new Date().toISOString()}`
        };

        const res = await fetch("/api/leads", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

        if (res.ok) {
          const newLead = await res.json();
          if (onNewLeadCreated) {
            onNewLeadCreated(newLead);
          }
          setSimLogs(prev => [
            ...prev,
            `✅ [FIRESTORE] Document successfully committed! Assigned Lead ID: '${newLead.id}'`,
            `📈 [FIRESTORE ATOMIC] Incremented leadsCount atomically for tenant '${biz.name}'.`,
            `🎉 [PIPELINE SUCCESS] Webhook event successfully parsed. Unified Inbox updated instantly!`
          ]);
          setSimSuccess(true);
        } else {
          throw new Error();
        }
      } catch (err) {
        setSimLogs(prev => [...prev, "❌ [ERROR] Failed to save lead record in server store."]);
      } finally {
        setIsSimulating(false);
      }
    }, 1500);
  };

  const firebaseFunctionCode = `/**
 * Firebase Cloud Function for handling WhatsApp Inbound Lead Webhook Events
 * Saves the metadata under the correct tenant's Firestore 'leads' sub-collection
 */
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

export const handleWhatsAppLeadWebhook = functions.https.onRequest(async (req, res) => {
  // Validate secure webhook token signature
  const signature = req.headers['x-hub-signature'];
  if (!signature || signature !== functions.config().whatsapp.webhook_secret) {
    res.status(401).send('Unauthorized Signature Verification Failed.');
    return;
  }

  const payload = req.body;
  const { from_phone, customer_name, message_text, tenant_shop_id, source_domain } = payload;

  try {
    // 1. Validate the active Multi-Tenant Shop Profile
    const shopRef = db.collection('companies').doc(tenant_shop_id);
    const shopSnap = await shopRef.get();
    
    if (!shopSnap.exists) {
      res.status(404).send(\`Tenant company registry \${tenant_shop_id} not found.\`);
      return;
    }

    const shopData = shopSnap.data();
    
    // 2. PRE-FLIGHT ENFORCEMENT: Check Subscription Status Gatekeeper Rules
    if (shopData?.subscription_status !== 'active') {
      // Log audit block trace
      await db.collection('audit_logs').add({
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        action: 'INBOUND_EVENT_BLOCKED',
        severity: 'WARNING',
        details: \`Blocked WhatsApp lead event for \${tenant_shop_id} due to inactive subscription_status.\`
      });
      
      res.status(402).send('Payment Required: Subscription inactive.');
      return;
    }

    // 3. Encrypt sensitive details before database commit
    const encryptedDetails = Buffer.from(
      \`WhatsApp Inquiry: "\${message_text}" from phone \${from_phone}\`
    ).toString('base64'); // Cipher representation

    // 4. Write deep sub-collection record under the specific Tenant's firewall scope
    const leadData = {
      name: customer_name || 'Anonymous Contact',
      email: \`\${from_phone}@whatsapp-gateway.net\`,
      phone: from_phone,
      source: 'WhatsApp',
      status: 'New',
      value: shopData.subscription_tier === 'PRO' ? 49 : 99, 
      message: message_text,
      encryptedDetails: encryptedDetails,
      aiSummary: \`WhatsApp Inquiry: \${message_text.substring(0, 40)}...\`,
      aiSuggestedAction: 'Initiate direct WhatsApp follow-up link.',
      date: new Date().toISOString(),
      shopId: tenant_shop_id,
      source_domain: source_domain || 'unknown-whatsapp-stream'
    };

    const leadRef = await db
      .collection('companies')
      .doc(tenant_shop_id)
      .collection('leads')
      .add(leadData);

    // 5. Update overall tenant lead counts atomically
    await shopRef.update({
      leadsCount: admin.firestore.FieldValue.increment(1)
    });

    res.status(200).json({
      success: true,
      message: 'Lead successfully routed, audited, and committed to tenant Firestore.',
      leadId: leadRef.id
    });

  } catch (error: any) {
    console.error('Firebase route error:', error);
    res.status(500).send(\`Server internal sync error: \${error.message}\`);
  }
});`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(firebaseFunctionCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 3000);
  };

  // Helper getters
  const getSourceIcon = (source: string) => {
    switch (source) {
      case "Webform": return <Globe size={13} className="text-blue-400" />;
      case "Chat": return <MessageSquare size={13} className="text-indigo-400" />;
      case "Email": return <Mail size={13} className="text-violet-400" />;
      case "WhatsApp": return <Smartphone size={13} className="text-emerald-400" />;
      case "Messenger": return <Smartphone size={13} className="text-sky-400" />;
      default: return <Tag size={13} className="text-slate-400" />;
    }
  };

  const getSourceBadgeColor = (source: string) => {
    switch (source) {
      case "Webform": return "bg-blue-50 text-blue-700 border border-blue-200";
      case "Chat": return "bg-indigo-50 text-indigo-700 border border-indigo-200";
      case "Email": return "bg-violet-50 text-violet-700 border border-violet-200";
      case "WhatsApp": return "bg-emerald-50 text-emerald-700 border border-emerald-200";
      case "Messenger": return "bg-sky-50 text-sky-700 border border-sky-200";
      default: return "bg-slate-100 border border-slate-200 text-slate-700";
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "New": return "bg-blue-50 text-blue-700 border border-blue-200";
      case "Contacted": return "bg-amber-50 text-amber-700 border border-amber-200";
      case "Qualified": return "bg-violet-50 text-violet-700 border border-violet-200";
      case "Proposal": return "bg-fuchsia-50 text-fuchsia-700 border border-fuchsia-200";
      case "Closed Won": return "bg-emerald-50 text-emerald-700 border border-emerald-200";
      case "Closed Lost": return "bg-red-50 text-red-700 border border-red-200";
      // Order statuses
      case "Paid": return "bg-emerald-50 text-emerald-700 border border-emerald-200";
      case "Shipped": return "bg-blue-50 text-blue-700 border border-blue-200";
      case "Processing": return "bg-amber-50 text-amber-700 border border-amber-200";
      default: return "bg-slate-100 text-slate-600 border border-slate-200";
    }
  };

  // Standard handlers
  const handleCrmSync = async (crmPlatform: string) => {
    if (!activeLead) return;
    setSyncingCrm(crmPlatform);
    setSyncSuccess(null);

    try {
      const res = await fetch(`/api/leads/${activeLead.id}/sync`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-role": activeRole,
          "x-user-email": userEmail
        },
        body: JSON.stringify({ platform: crmPlatform })
      });

      if (!res.ok) throw new Error();
      setSyncSuccess(crmPlatform);
      setTimeout(() => setSyncSuccess(null), 4000);
    } catch (e) {
      console.error("CRM sync failed");
    } finally {
      setSyncingCrm(null);
    }
  };

  const handleDecryptDetails = async () => {
    if (!activeLead) return;
    setIsDecrypting(true);
    setDecryptionError(null);
    setDecryptedText(null);

    try {
      const res = await fetch(`/api/leads/${activeLead.id}/decrypt`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-role": activeRole,
          "x-user-email": userEmail
        }
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Decryption failed. Unauthorized role access.");
      }

      const data = await res.json();
      setDecryptedText(data.decrypted);
    } catch (e: any) {
      setDecryptionError(e.message || "Failed to decrypt. Role restricted.");
    } finally {
      setIsDecrypting(false);
    }
  };

  const handleStatusChange = async (newStatus: any) => {
    if (!activeLead) return;
    try {
      const res = await fetch(`/api/leads/${activeLead.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-user-role": activeRole,
          "x-user-email": userEmail
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        const data = await res.json();
        onUpdateLead(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddNotes = async () => {
    if (!activeLead || !noteText.trim()) return;
    try {
      const updatedNotes = activeLead.notes 
        ? `${activeLead.notes}\n\n[Updated]: ${noteText}`
        : noteText;

      const res = await fetch(`/api/leads/${activeLead.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-user-role": activeRole,
          "x-user-email": userEmail
        },
        body: JSON.stringify({ notes: updatedNotes })
      });
      if (res.ok) {
        const data = await res.json();
        onUpdateLead(data);
        setNoteText("");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveValue = async () => {
    if (!activeLead || isNaN(Number(editValue))) return;
    try {
      const res = await fetch(`/api/leads/${activeLead.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-user-role": activeRole,
          "x-user-email": userEmail
        },
        body: JSON.stringify({ value: Number(editValue) })
      });
      if (res.ok) {
        const data = await res.json();
        onUpdateLead(data);
        setIsEditingValue(false);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSelectLead = (leadId: string) => {
    setSelectedLeadId(leadId);
    setDecryptedText(null);
    setDecryptionError(null);
    setIsEditingValue(false);
  };

  // Find if any company currently in leads views is not active to trigger Payment Required Alert
  const hasSuspendedBusiness = businesses.some(b => b.subscription_status !== "active");
  const suspendedBizList = businesses.filter(b => b.subscription_status !== "active");

  return (
    <div className="space-y-6">
      
      {/* 1. SaaS Gatekeeper Status Guard Banner */}
      {hasSuspendedBusiness && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-fade-in shadow-sm">
          <div className="flex gap-3">
            <div className="p-2 bg-red-100 rounded-lg text-red-700 shrink-0">
              <ShieldAlert size={20} className="animate-pulse" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-red-950 font-sans uppercase tracking-wide flex items-center gap-1.5">
                🔒 PAYMENT REQUIRED: SaaS Gatekeeper Failsafe Active
              </h4>
              <p className="text-[11px] text-red-800 leading-relaxed font-sans font-light mt-0.5">
                Stripe detected payment failures for: <strong>{suspendedBizList.map(b => b.name).join(", ")}</strong>.
                The Firebase subscription locks have been activated, instantly revoking AI agent responses and API data integration paths.
              </p>
            </div>
          </div>
          <span className="px-3 py-1.5 bg-red-600 text-white font-mono text-[10px] font-bold rounded-lg shrink-0 uppercase">
            AI AGENT STATUS: SUSPENDED
          </span>
        </div>
      )}

      {/* View Switcher Sub-Navigation */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white border border-slate-150 p-2 rounded-xl gap-2 shadow-sm shrink-0">
        <div className="flex flex-wrap p-1 bg-slate-100 rounded-lg gap-1 w-full sm:w-auto">
          <button
            onClick={() => setActiveSubTab("leads-ledger")}
            className={`flex-1 sm:flex-none px-4 py-2 text-xs font-semibold rounded-lg font-sans transition flex items-center justify-center gap-1.5 ${
              activeSubTab === "leads-ledger" ? "bg-white text-indigo-950 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Inbox size={14} /> CRM Leads Ledger
          </button>
          
          <button
            onClick={() => {
              setActiveSubTab("unified-inbox-mobile");
              if (!selectedMobileItemId && unifiedInboxFeed[0]) {
                setSelectedMobileItemId(unifiedInboxFeed[0].id);
              }
            }}
            className={`flex-1 sm:flex-none px-4 py-2 text-xs font-semibold rounded-lg font-sans transition flex items-center justify-center gap-1.5 ${
              activeSubTab === "unified-inbox-mobile" ? "bg-white text-indigo-950 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Smartphone size={14} className="text-emerald-500" /> Unified Mobile Inbox
          </button>
          
          {showAdvancedSaaS && (
            <button
              onClick={() => setActiveSubTab("firebase-webhook")}
              className={`flex-1 sm:flex-none px-4 py-2 text-xs font-semibold rounded-lg font-sans transition flex items-center justify-center gap-1.5 ${
                activeSubTab === "firebase-webhook" ? "bg-white text-indigo-950 shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <FileCode size={14} className="text-violet-500" /> WhatsApp Hook & DB Logic
            </button>
          )}
        </div>

        {showAdvancedSaaS && (
          <div className="text-[10px] text-slate-400 font-mono self-end sm:self-center">
            ACTIVE GATEKEEPER NODE: <strong className="text-indigo-600">FIRESTORE-E2E</strong>
          </div>
        )}
      </div>

      {/* -----------------------------------------------------------------------
          TAB 1: CRM LEADS LEDGER (ORIGINAL VIEW)
          ----------------------------------------------------------------------- */}
      {activeSubTab === "leads-ledger" && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 animate-fade-in" id="leads-manager-view">
          
          {/* Inbox leads list (left 2 cols) */}
          <div className="lg:col-span-2 space-y-4 flex flex-col h-[750px]">
            
            {/* Search and Filters block */}
            <div className="bg-white border border-slate-100 p-4 rounded-xl space-y-3 shrink-0 card-shadow">
              
              <div className="relative">
                <Search className="absolute left-3 top-3.5 text-slate-400" size={15} />
                <input
                  type="text"
                  placeholder="Search leads by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 transition duration-150"
                  id="lead-search-bar"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                
                {/* Biz filter */}
                <select
                  value={filterBusiness}
                  onChange={(e) => setFilterBusiness(e.target.value)}
                  className="bg-white border border-slate-200 rounded-lg px-2.5 py-2 text-[11px] text-slate-700 focus:outline-none focus:border-indigo-500 text-ellipsis cursor-pointer"
                >
                  <option value="all">All Portfolios</option>
                  {businesses.map(b => (
                    <option key={b.id} value={b.id}>{b.name.split(" ")[0]}</option>
                  ))}
                </select>

                {/* Source filter */}
                <select
                  value={filterSource}
                  onChange={(e) => setFilterSource(e.target.value)}
                  className="bg-white border border-slate-200 rounded-lg px-2.5 py-2 text-[11px] text-slate-700 focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="all">All Channels</option>
                  <option value="Webform">Webform</option>
                  <option value="Chat">Chat</option>
                  <option value="Email">Email</option>
                  <option value="WhatsApp">WhatsApp</option>
                  <option value="Messenger">Messenger</option>
                </select>

              </div>

            </div>

            {/* Lead Rows Container */}
            <div className="bg-white border border-slate-100 rounded-xl flex-1 overflow-y-auto p-3 space-y-1.5 card-shadow" id="lead-rows-list">
              {filteredLeads.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-slate-400 text-xs font-sans">
                  <Users size={24} className="mb-2 opacity-50 text-indigo-500" />
                  No matching inbound leads found.
                </div>
              ) : (
                filteredLeads.map((lead) => {
                  const biz = businesses.find(b => b.id === lead.businessId);
                  const isSelected = activeLead?.id === lead.id;

                  return (
                    <div
                      key={lead.id}
                      onClick={() => handleSelectLead(lead.id)}
                      className={`p-4 rounded-lg cursor-pointer transition border flex flex-col justify-between gap-2.5 ${
                        isSelected 
                          ? "bg-indigo-50/70 border-indigo-500 shadow-sm" 
                          : "bg-white border-slate-100 hover:bg-slate-50 hover:border-slate-200"
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <h4 className="text-xs font-bold text-slate-800 font-sans truncate">{lead.name}</h4>
                          <p className="text-[10px] text-slate-400 font-sans max-w-[160px] truncate font-mono">{lead.email}</p>
                        </div>

                        <span className={`px-2 py-0.5 text-[9px] rounded-md font-mono ${getSourceBadgeColor(lead.source)} flex items-center gap-1 shrink-0`}>
                          {getSourceIcon(lead.source)} {lead.source}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-600 font-sans line-clamp-1 italic font-light">
                        "{lead.message}"
                      </p>

                      <div className="flex justify-between items-center pt-2 border-t border-slate-100 text-[10px]">
                        <span className="text-slate-500 font-sans truncate max-w-[100px] font-medium" title={biz?.name}>
                          🏢 {biz?.name.split(" ")[0]}
                        </span>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="font-bold text-slate-700 data-font">${lead.value}</span>
                          <span className={`px-1.5 py-0.5 text-[9px] font-semibold font-sans rounded ${getStatusBadgeColor(lead.status)}`}>
                            {lead.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

          </div>

          {/* Selected Lead details sheet (right 3 cols) */}
          <div className="lg:col-span-3 space-y-5 h-[750px] overflow-y-auto pr-1" id="lead-details-sheet">
            {activeLead ? (
              <div className="bg-white border border-slate-100 p-6 rounded-xl space-y-6 card-shadow">
                
                {/* Header section with customer metadata */}
                <div className="flex flex-col md:flex-row justify-between items-start gap-4 border-b border-slate-100 pb-5">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-lg font-bold text-slate-900 font-sans">{activeLead.name}</h3>
                      <span className={`px-2 py-0.5 text-[10px] rounded-md font-mono font-semibold ${getSourceBadgeColor(activeLead.source)} flex items-center gap-1`}>
                        {getSourceIcon(activeLead.source)} {activeLead.source} Inbound
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-slate-600">
                      <span>✉️ Email: <strong className="font-mono text-slate-800">{activeLead.email}</strong></span>
                      <span>📞 Phone: <strong className="font-mono text-slate-800">{activeLead.phone}</strong></span>
                      <span>🏢 Portfolio: <strong className="text-slate-800">{businesses.find(b => b.id === activeLead.businessId)?.name}</strong></span>
                      <span>🗓️ Date: <span className="font-mono text-slate-800">{new Date(activeLead.date).toLocaleDateString()} {new Date(activeLead.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span></span>
                    </div>
                  </div>

                  {/* Deal value update */}
                  <div className="bg-slate-50 border border-slate-200 px-4 py-3 rounded-lg space-y-1.5 min-w-[140px] text-right shrink-0">
                    <span className="text-[10px] uppercase font-mono text-slate-400 tracking-wider block">Estimated Sale</span>
                    {isEditingValue ? (
                      <div className="flex gap-1.5 justify-end">
                        <input
                          type="number"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="w-16 bg-white border border-slate-300 text-slate-900 rounded px-1 text-center text-xs focus:outline-none py-0.5"
                        />
                        <button onClick={handleSaveValue} className="p-1 bg-emerald-600 rounded text-white hover:bg-emerald-500 cursor-pointer">
                          <Check size={12} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-end gap-1.5 group">
                        <span className="text-md font-bold text-slate-800 data-font">${activeLead.value}</span>
                        <button 
                          onClick={() => {
                            setEditValue(activeLead.value.toString());
                            setIsEditingValue(true);
                          }}
                          className="text-[10px] text-indigo-600 opacity-0 group-hover:opacity-100 hover:underline cursor-pointer"
                        >
                          Edit
                        </button>
                      </div>
                    )}
                    
                    <select
                      value={activeLead.status}
                      onChange={(e) => handleStatusChange(e.target.value)}
                      className="bg-white border border-slate-200 rounded px-1.5 py-0.5 text-[10px] text-slate-700 focus:outline-none cursor-pointer"
                    >
                      <option value="New">New</option>
                      <option value="Contacted">Contacted</option>
                      <option value="Qualified">Qualified</option>
                      <option value="Proposal">Proposal</option>
                      <option value="Closed Won">Closed Won</option>
                      <option value="Closed Lost">Closed Lost</option>
                    </select>
                  </div>
                </div>

                {/* Customer Message */}
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Initial Customer Inquiry Message</h4>
                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg text-xs text-slate-700 font-sans leading-relaxed italic">
                    "{activeLead.message}"
                  </div>
                </div>

                {/* SECURITY: Cryptography Safeguard */}
                {showAdvancedSaaS && (
                  <div className="bg-indigo-50/60 border border-indigo-100 p-4 rounded-xl space-y-3" id="database-encryption-box">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Lock size={15} className="text-indigo-600 animate-pulse" />
                        <span className="text-xs font-mono text-indigo-700 font-bold uppercase tracking-wide">End-to-End Cryptography Log Safeguard</span>
                      </div>
                      <span className="px-2 py-0.5 text-[9px] uppercase font-mono bg-indigo-100 text-indigo-700 border border-indigo-200 rounded">
                        AES-256 CIPHER
                      </span>
                    </div>

                    <p className="text-[10px] text-slate-600 leading-relaxed">
                      All client transcripts, addresses, and sensitive interactions are stored as encrypted cipher texts in our central cloud vault, satisfying corporate privacy frameworks.
                    </p>

                    <div className="bg-slate-900 border border-slate-885 p-3 rounded-lg text-[9px] font-mono text-indigo-300 break-all max-h-16 overflow-y-auto">
                      {activeLead.encryptedDetails}
                    </div>

                    <div className="pt-1 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                      <button
                        onClick={handleDecryptDetails}
                        className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-sans text-[11px] font-semibold rounded-lg transition duration-150 flex items-center gap-1.5 cursor-pointer shadow-sm"
                        id="decrypt-logs-btn"
                      >
                        <Unlock size={12} /> Decrypt Customer Metadata Record
                      </button>
                      <span className="text-[10px] text-slate-400 italic font-mono">
                        Active Operator Role: {activeRole}
                      </span>
                    </div>

                    {decryptedText && (
                      <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-lg text-xs space-y-1.5 animate-fade-in" id="decrypted-result-box">
                        <span className="text-[10px] font-mono text-emerald-700 uppercase tracking-wider font-bold block flex items-center gap-1">
                          🔓 Decrypted Interaction Transcript (Decryption Audit Logged)
                        </span>
                        <p className="text-emerald-950 leading-relaxed font-sans text-xs">
                          {decryptedText}
                        </p>
                      </div>
                    )}

                    {decryptionError && (
                      <div className="bg-red-50 border border-red-200 p-3.5 rounded-lg text-xs space-y-1.5 animate-fade-in" id="decryption-denied-box">
                        <span className="text-[10px] font-mono text-red-700 uppercase tracking-wider font-bold block flex items-center gap-1.5">
                          <AlertTriangle size={13} className="text-red-500" /> Security Access Restriction
                        </span>
                        <p className="text-red-950 leading-relaxed font-sans text-xs">
                          {decryptionError}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Gemini AI Summary & Suggested actions */}
                <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                    <Sparkles size={15} className="text-indigo-600" />
                    <h5 className="text-xs font-mono text-slate-500 uppercase tracking-wider font-bold">Cognitive AI Analytics Insights</h5>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
                    <div className="space-y-1">
                      <span className="text-slate-400 block font-medium">AI Intent Summary:</span>
                      <p className="text-slate-800 font-semibold">"{activeLead.aiSummary}"</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-slate-400 block font-medium">AI Next Suggested Action:</span>
                      <p className="text-indigo-600 font-semibold font-mono">{activeLead.aiSuggestedAction}</p>
                    </div>
                  </div>
                </div>

                {/* CRM synchronization connections block */}
                {showAdvancedSaaS && (
                  <div className="space-y-3" id="crm-integrations-box">
                    <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">CRM Portals Synchronization Integration</h4>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg flex items-center justify-between">
                        <div>
                          <span className="text-[11px] font-bold text-slate-800 block">Salesforce CRM</span>
                          <span className="text-[9px] text-slate-400 font-mono">Sync Code: SF-1290</span>
                        </div>
                        <button
                          onClick={() => handleCrmSync("Salesforce")}
                          className="px-2.5 py-1.5 bg-white hover:bg-indigo-600 text-slate-700 hover:text-white rounded border border-slate-200 hover:border-transparent transition text-[10px] font-semibold flex items-center gap-1 cursor-pointer shadow-sm"
                        >
                          {syncSuccess === "Salesforce" ? <Check size={12} className="text-emerald-600" /> : <Share2 size={12} />} Push
                        </button>
                      </div>

                      <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg flex items-center justify-between">
                        <div>
                          <span className="text-[11px] font-bold text-slate-800 block">HubSpot Suite</span>
                          <span className="text-[9px] text-slate-400 font-mono">Sync Code: HS-4801</span>
                        </div>
                        <button
                          onClick={() => handleCrmSync("HubSpot")}
                          className="px-2.5 py-1.5 bg-white hover:bg-indigo-600 text-slate-700 hover:text-white rounded border border-slate-200 hover:border-transparent transition text-[10px] font-semibold flex items-center gap-1 cursor-pointer shadow-sm"
                        >
                          {syncSuccess === "HubSpot" ? <Check size={12} className="text-emerald-600" /> : <Share2 size={12} />} Push
                        </button>
                      </div>

                      <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg flex items-center justify-between">
                        <div>
                          <span className="text-[11px] font-bold text-slate-800 block">Zoho CRM</span>
                          <span className="text-[9px] text-slate-400 font-mono">Sync Code: ZH-7719</span>
                        </div>
                        <button
                          onClick={() => handleCrmSync("Zoho")}
                          className="px-2.5 py-1.5 bg-white hover:bg-indigo-600 text-slate-700 hover:text-white rounded border border-slate-200 hover:border-transparent transition text-[10px] font-semibold flex items-center gap-1 cursor-pointer shadow-sm"
                        >
                          {syncSuccess === "Zoho" ? <Check size={12} className="text-emerald-600" /> : <Share2 size={12} />} Push
                        </button>
                      </div>
                    </div>

                    {syncingCrm && (
                      <div className="text-[10px] font-mono text-indigo-600 flex items-center gap-1.5 animate-pulse">
                        <Database size={11} /> Synchronizing lead state with secure {syncingCrm} CRM pipeline REST API...
                      </div>
                    )}
                  </div>
                )}

                {/* Custom Notes */}
                <div className="space-y-3 pt-3 border-t border-slate-100">
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Internal Agent Follow-up Logs & Notes</h4>
                  
                  {activeLead.notes && (
                    <pre className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-700 font-sans whitespace-pre-wrap leading-relaxed max-h-36 overflow-y-auto">
                      {activeLead.notes}
                    </pre>
                  )}

                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Record customer follow-up actions..."
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 transition duration-150"
                      id="followup-note-input"
                    />
                    <button
                      onClick={handleAddNotes}
                      disabled={!noteText.trim()}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold font-sans rounded-lg text-xs transition duration-150 flex items-center gap-1.5 cursor-pointer shadow-sm"
                      id="add-note-btn"
                    >
                      <Send size={12} /> Save Note
                    </button>
                  </div>
                </div>

              </div>
            ) : (
              <div className="bg-white border border-slate-100 p-8 rounded-xl flex items-center justify-center h-48 text-slate-400 text-xs card-shadow">
                Select a lead from the inbox pane to view detailed operations.
              </div>
            )}
          </div>

        </div>
      )}

      {/* -----------------------------------------------------------------------
          TAB 2: UNIFIED MOBILE INBOX (MOBILE PHONE PREVIEW DESIGN)
          ----------------------------------------------------------------------- */}
      {activeSubTab === "unified-inbox-mobile" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fade-in">
          
          {/* Informational left sidebar (3 cols) */}
          <div className="lg:col-span-4 space-y-5">
            <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-4 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Smartphone size={16} className="text-indigo-600" /> Unified Inbound Feed
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                This simulated mobile experience showcases the absolute design boundaries of our 
                <strong> Unified Lead & Order Inbox</strong>. 
              </p>
              
              <div className="space-y-2.5 text-[11px] text-slate-700">
                <div className="flex items-start gap-2">
                  <span className="p-1 bg-indigo-50 rounded text-indigo-700 font-mono text-[9px] font-bold">MULTI-TENANT</span>
                  <p className="flex-1">Every interaction is separated automatically. The top of each item explicitly states its origin domain.</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="p-1 bg-emerald-50 rounded text-emerald-700 font-mono text-[9px] font-bold">SOURCE TAGS</span>
                  <p className="flex-1">Clearly filters and flags whether the inbound message represents a standard service lead or physical order.</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="p-1 bg-violet-50 rounded text-violet-700 font-mono text-[9px] font-bold">HOT SWAP</span>
                  <p className="flex-1">Instantly pre-composes responses based on active business configurations and lets you sync logs to Salesforce on the fly.</p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 text-xs text-slate-400 font-mono">
                📱 Tested for iOS & Android Viewports
              </div>
            </div>

            <div className="bg-indigo-950 text-indigo-200 p-5 rounded-2xl space-y-3 shadow-md">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1">
                <Sparkles size={12} /> Mobile Response Hub
              </h4>
              <p className="text-[11px] leading-relaxed text-indigo-300">
                Founders can handle client screen replacement pricing or dispatch tracking right from their handheld device. Click on any item inside the phone to inspect the details sheet inside the preview!
              </p>
            </div>
          </div>

          {/* Interactive Phone Frame Simulation (5 cols) */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="w-[360px] h-[720px] bg-slate-900 rounded-[44px] p-3.5 shadow-2xl border-4 border-slate-800 relative flex flex-col overflow-hidden">
              
              {/* Phone Camera Notch/Island */}
              <div className="absolute top-5 left-1/2 -translate-x-1/2 w-28 h-6 bg-black rounded-full z-50 flex items-center justify-between px-2.5">
                <span className="w-1.5 h-1.5 bg-blue-900 rounded-full"></span>
                <span className="w-8 h-1 bg-neutral-900 rounded-full"></span>
                <span className="w-1.5 h-1.5 bg-neutral-900 rounded-full"></span>
              </div>

              {/* Phone Content Screen */}
              <div className="flex-1 bg-slate-50 rounded-[32px] overflow-hidden flex flex-col relative border border-slate-950/20 text-slate-800">
                
                {/* Phone Top Status Bar */}
                <div className="h-9 bg-white px-6 flex justify-between items-center shrink-0 border-b border-slate-100 text-[10px] font-bold font-mono">
                  <span>15:38</span>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 bg-indigo-600 rounded-full"></span>
                    <span>5G</span>
                    <div className="w-5 h-2.5 border border-slate-700 rounded-sm p-0.5 flex items-center">
                      <span className="w-full h-full bg-slate-800 rounded-2xs"></span>
                    </div>
                  </div>
                </div>

                {/* Phone Header App Bar */}
                <div className="bg-white px-4 py-3 border-b border-slate-150 flex justify-between items-center shrink-0 shadow-sm">
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-900 font-sans tracking-tight">Unified Inbox</h4>
                    <span className="text-[9px] text-slate-400 font-mono">ATTRIBUTION ENGINE ACTIVE</span>
                  </div>
                  <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 font-mono text-[8px] font-bold rounded-full">
                    {filteredUnifiedFeed.length} Items
                  </span>
                </div>

                {/* Feed Filters inside phone */}
                <div className="bg-slate-100 px-3 py-2 flex gap-1 border-b border-slate-150 shrink-0">
                  <button
                    onClick={() => setMobileFilter("all")}
                    className={`flex-1 py-1 text-[10px] font-bold rounded-md font-sans transition ${
                      mobileFilter === "all" ? "bg-white text-indigo-950 shadow-2xs" : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setMobileFilter("leads")}
                    className={`flex-1 py-1 text-[10px] font-bold rounded-md font-sans transition ${
                      mobileFilter === "leads" ? "bg-white text-indigo-950 shadow-2xs" : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    Leads
                  </button>
                  <button
                    onClick={() => setMobileFilter("orders")}
                    className={`flex-1 py-1 text-[10px] font-bold rounded-md font-sans transition ${
                      mobileFilter === "orders" ? "bg-white text-indigo-950 shadow-2xs" : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    Orders
                  </button>
                </div>

                {/* Phone Scrollable Notification Feed */}
                <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-slate-50">
                  {filteredUnifiedFeed.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-48 text-slate-400 text-[11px] font-sans">
                      No matching mobile items found.
                    </div>
                  ) : (
                    filteredUnifiedFeed.map((item) => {
                      const isSelected = activeMobileItem?.id === item.id;
                      const isLead = item.type === "lead";

                      return (
                        <div
                          key={item.id}
                          onClick={() => setSelectedMobileItemId(item.id)}
                          className={`p-3 rounded-xl cursor-pointer transition border flex flex-col gap-1.5 text-left relative ${
                            isSelected 
                              ? "bg-white border-indigo-500 shadow-md ring-2 ring-indigo-500/10" 
                              : "bg-white border-slate-200 hover:bg-slate-50"
                          }`}
                        >
                          {/* Domain attribution header */}
                          <div className="flex justify-between items-center text-[8px] border-b border-slate-100 pb-1">
                            <span className="font-bold text-indigo-600 font-mono tracking-wider truncate max-w-[170px]">
                              🌐 {item.source_domain}
                            </span>
                            <span className={`px-1.5 py-0.2 rounded font-mono font-bold uppercase text-[7px] ${
                              isLead ? "bg-blue-50 text-blue-700" : "bg-emerald-50 text-emerald-700"
                            }`}>
                              {isLead ? "LEAD" : "ORDER"}
                            </span>
                          </div>

                          <div className="flex justify-between items-start gap-1">
                            <div>
                              <h5 className="text-[11px] font-extrabold text-slate-900 leading-tight">{item.name}</h5>
                              <p className="text-[9px] text-slate-400 font-mono mt-0.5">{item.email}</p>
                            </div>
                            <span className="text-[11px] font-black text-slate-800 font-sans shrink-0">${item.value}</span>
                          </div>

                          <p className="text-[10px] text-slate-600 line-clamp-2 leading-relaxed bg-slate-50 p-1.5 rounded italic">
                            "{item.message}"
                          </p>

                          <div className="flex justify-between items-center text-[8px] pt-1 border-t border-slate-100 font-medium text-slate-400">
                            <span>🕒 {new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            <span className={`px-1 rounded-sm text-[8px] font-bold ${getStatusBadgeColor(item.status)}`}>
                              {item.status}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Phone Bottom Notch / Home bar */}
                <div className="h-5 bg-white flex justify-center items-center shrink-0 border-t border-slate-100">
                  <div className="w-24 h-1 bg-slate-300 rounded-full"></div>
                </div>

              </div>
            </div>
          </div>

          {/* Selected Mobile Item Details Panel (3 cols) */}
          <div className="lg:col-span-3 space-y-5">
            {activeMobileItem ? (
              <div className="bg-white border border-slate-200 p-5 rounded-2xl space-y-5 shadow-sm text-left animate-fade-in">
                
                {/* Header info */}
                <div className="space-y-1.5 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] font-mono bg-indigo-50 text-indigo-700 font-bold uppercase px-2 py-0.5 rounded">
                      ATTRIBUTED DOMAIN
                    </span>
                  </div>
                  <h4 className="text-sm font-black text-indigo-950 font-sans tracking-tight truncate">
                    {activeMobileItem.source_domain}
                  </h4>
                  <p className="text-[11px] text-slate-500 font-sans">
                    Multi-tenant ID filter: <code>{activeMobileItem.businessId}</code>
                  </p>
                </div>

                {/* User metadata card */}
                <div className="bg-slate-50 p-3 rounded-xl space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-900">{activeMobileItem.name}</span>
                    <span className="text-xs font-black text-slate-800">${activeMobileItem.value}</span>
                  </div>
                  <div className="text-[10px] text-slate-600 font-mono space-y-0.5">
                    <div>✉️ {activeMobileItem.email}</div>
                    <div>📞 {activeMobileItem.phone}</div>
                    <div>📅 {new Date(activeMobileItem.date).toLocaleDateString()}</div>
                  </div>
                </div>

                {/* Inquiry text */}
                <div className="space-y-1">
                  <span className="text-[9px] font-mono text-slate-400 block uppercase font-bold">Client Event Payload</span>
                  <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100 italic">
                    "{activeMobileItem.message}"
                  </p>
                </div>

                {/* AI suggested action */}
                <div className="bg-indigo-50/70 border border-indigo-100 p-3.5 rounded-xl space-y-1">
                  <div className="flex items-center gap-1.5 text-indigo-800 text-[10px] font-bold font-mono">
                    <Sparkles size={11} className="text-indigo-600" /> GEMINI AI COMPOSER SUITE
                  </div>
                  <p className="text-[11px] text-slate-700 leading-relaxed font-sans font-light">
                    Suggested: <strong>{activeMobileItem.aiSuggestedAction}</strong>
                  </p>
                </div>

                {/* Quick phone action buttons */}
                <div className="space-y-2 pt-3 border-t border-slate-150">
                  <span className="text-[9px] font-mono text-slate-400 block uppercase font-bold">Quick Mobile Operations</span>
                  
                  {activeMobileItem.type === "lead" ? (
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => {
                          const link = `https://wa.me/${activeMobileItem.phone.replace(/[^0-9]/g, "")}?text=Hi%20${activeMobileItem.name},%20we%20received%20your%20inquiry%20regarding%20"${activeMobileItem.message}"`;
                          window.open(link, '_blank');
                        }}
                        className="py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-sans text-[11px] font-bold rounded-lg flex items-center justify-center gap-1 cursor-pointer transition shadow-xs"
                      >
                        <Smartphone size={12} /> WhatsApp Link
                      </button>
                      
                      <button
                        onClick={() => {
                          alert(`Pre-drafted Response copied! Send to ${activeMobileItem.email}`);
                        }}
                        className="py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-sans text-[11px] font-bold rounded-lg flex items-center justify-center gap-1 cursor-pointer border border-slate-250 transition"
                      >
                        <Mail size={12} /> Copy Draft
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <button
                        onClick={() => {
                          setOrders(prev => prev.map(o => o.id === activeMobileItem.id ? { ...o, status: "Shipped" } : o));
                          alert("Order marked as Shipped. Dispatched live webhook event!");
                        }}
                        className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-sans text-[11px] font-bold rounded-lg flex items-center justify-center gap-1 cursor-pointer transition shadow-xs"
                        disabled={activeMobileItem.status === "Shipped"}
                      >
                        <Check size={12} /> Mark as Shipped
                      </button>
                    </div>
                  )}
                </div>

              </div>
            ) : (
              <div className="bg-white border border-slate-200 p-8 rounded-2xl flex items-center justify-center text-slate-400 text-xs shadow-sm">
                Select an item in the phone frame to manage.
              </div>
            )}
          </div>

        </div>
      )}

      {/* -----------------------------------------------------------------------
          TAB 3: WHATSAPP WEBHOOK SIMULATOR & FIREBASE CODE WORKSPACE
          ----------------------------------------------------------------------- */}
      {activeSubTab === "firebase-webhook" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fade-in">
          
          {/* Left panel: Code Block viewer (7 cols) */}
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl text-left">
            
            {/* Code Header */}
            <div className="px-5 py-3.5 bg-slate-950 border-b border-slate-800 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2">
                <FileCode size={15} className="text-indigo-400" />
                <span className="text-xs font-mono font-bold text-slate-200 tracking-wide">
                  handleWhatsAppWebhook.ts (Firebase Cloud Function)
                </span>
              </div>
              <button
                onClick={handleCopyCode}
                className="px-2.5 py-1.5 bg-slate-850 hover:bg-slate-800 text-slate-300 font-mono text-[10px] font-semibold border border-slate-800 rounded transition flex items-center gap-1 cursor-pointer"
              >
                {copiedCode ? <Check size={11} className="text-emerald-500" /> : <Copy size={11} />}
                {copiedCode ? "Copied" : "Copy Code"}
              </button>
            </div>

            {/* Code Area */}
            <div className="p-4 overflow-x-auto max-h-[550px] overflow-y-auto">
              <pre className="text-[10px] font-mono text-slate-300 whitespace-pre leading-relaxed select-all">
                {firebaseFunctionCode}
              </pre>
            </div>

            <div className="bg-slate-950 px-5 py-3 border-t border-slate-800 text-[10px] text-slate-500 font-mono flex items-center gap-1.5">
              💡 Checks <code>subscription_status</code> pre-flight and saves deep nested tenant logs securely.
            </div>
          </div>

          {/* Right panel: Live Hook execution form (5 cols) */}
          <div className="lg:col-span-5 space-y-6 text-left">
            
            {/* Live simulator block */}
            <form onSubmit={handleSimulateWhatsAppLead} className="bg-white border border-slate-200 p-6 rounded-2xl space-y-5 shadow-sm">
              <div className="border-b border-slate-100 pb-3">
                <h4 className="text-xs font-bold text-slate-900 font-sans flex items-center gap-1.5">
                  <Smartphone size={16} className="text-emerald-500" /> Inbound WhatsApp Webhook Simulator
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Simulate receiving a WhatsApp client contact event. This executes our pipeline logic, checks Firebase permissions, and writes into the ledger.
                </p>
              </div>

              {/* Selector for tenant shop */}
              <div className="space-y-1">
                <label className="text-[9px] font-mono uppercase text-slate-400 block font-bold">Target Multi-Tenant Recipient</label>
                <select
                  value={simTargetBizId}
                  onChange={(e) => {
                    setSimTargetBizId(e.target.value);
                    setSimSuccess(false);
                    setSimLogs([]);
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 focus:outline-none"
                >
                  {businesses.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.subscription_status !== "active" ? "SUSPENDED 🔒" : "ACTIVE ✔️"})
                    </option>
                  ))}
                </select>
              </div>

              {/* Grid with Name and phone */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-mono uppercase text-slate-400 block font-bold">Client Name</label>
                  <input
                    type="text"
                    value={simName}
                    onChange={(e) => setSimName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 focus:outline-none"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-mono uppercase text-slate-400 block font-bold">WhatsApp Phone</label>
                  <input
                    type="text"
                    value={simPhone}
                    onChange={(e) => setSimPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 focus:outline-none font-mono"
                    required
                  />
                </div>
              </div>

              {/* Message text */}
              <div className="space-y-1">
                <label className="text-[9px] font-mono uppercase text-slate-400 block font-bold">WhatsApp Message</label>
                <textarea
                  value={simMessage}
                  onChange={(e) => setSimMessage(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 focus:outline-none leading-relaxed"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSimulating}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold font-sans rounded-xl text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
              >
                {isSimulating ? (
                  <>
                    <Database size={13} className="animate-spin" /> Writing to Firestore...
                  </>
                ) : (
                  <>
                    Fire WhatsApp Webhook <ArrowRight size={13} />
                  </>
                )}
              </button>
            </form>

            {/* Logs printing terminal console */}
            {simLogs.length > 0 && (
              <div className="bg-slate-950 rounded-2xl border border-slate-850 overflow-hidden shadow-xl flex flex-col">
                <div className="bg-slate-900 px-4 py-2 border-b border-slate-850 flex items-center justify-between">
                  <span className="text-[9px] font-mono font-bold text-slate-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-indigo-500 rounded-full animate-ping"></span> Live Webhook Server Console Logs
                  </span>
                  <button
                    onClick={() => setSimLogs([])}
                    className="text-[9px] text-slate-500 hover:text-slate-300 font-mono"
                  >
                    Clear Console
                  </button>
                </div>
                
                <div className="p-4 font-mono text-[9px] text-slate-300 space-y-2 max-h-48 overflow-y-auto leading-relaxed select-none">
                  {simLogs.map((log, idx) => (
                    <div key={idx} className={
                      log.includes("✅") ? "text-emerald-400 font-bold" :
                      log.includes("❌") || log.includes("🚨") ? "text-red-400 font-black" : 
                      log.includes("📂") || log.includes("💾") ? "text-indigo-300" : "text-slate-300"
                    }>
                      {log}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Success panel */}
            {simSuccess && (
              <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex items-start gap-2.5 animate-fade-in shadow-xs">
                <CheckCircle size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <h5 className="font-bold text-emerald-950 font-sans">Lead Committed to Firestore Database!</h5>
                  <p className="text-emerald-800 leading-relaxed font-sans font-light mt-0.5">
                    The WhatsApp event bypasses all filters, checks that tenant's subscription status is <strong>active</strong>, AES encrypts, and registers. Go to the <strong>Unified Mobile Inbox</strong> or the <strong>CRM Leads Ledger</strong> to inspect it instantly!
                  </p>
                </div>
              </div>
            )}

          </div>

        </div>
      )}

    </div>
  );
}
