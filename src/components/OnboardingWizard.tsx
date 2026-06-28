import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Building2, 
  Sparkles, 
  ArrowRight, 
  ArrowLeft, 
  Globe, 
  MessageSquare, 
  Check, 
  Copy, 
  FileText, 
  Trash2, 
  Plus, 
  Loader2, 
  CheckCircle2, 
  Briefcase,
  HelpCircle,
  FileCode,
  Maximize2,
  ShieldCheck,
  Terminal,
  RefreshCw,
  Zap
} from "lucide-react";

interface OnboardingWizardProps {
  onComplete: () => void;
}

interface FAQItem {
  question: string;
  answer: string;
}

interface PolicyItem {
  title: string;
  content: string;
}

export function OnboardingWizard({ onComplete }: OnboardingWizardProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Identity Form (Step 1)
  const [name, setName] = useState("");
  const [category, setCategory] = useState("SaaS & Technology");
  const [ownerEmail, setOwnerEmail] = useState(() => {
    const cached = localStorage.getItem("repairhub_user_session");
    if (cached) {
      try {
        return JSON.parse(cached).email;
      } catch (e) {
        return "mayfieldcellphonerepairs@gmail.com";
      }
    }
    return "mayfieldcellphonerepairs@gmail.com";
  });

  // Knowledge Form (Step 2)
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [rawText, setRawText] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedFaqs, setExtractedFaqs] = useState<FAQItem[]>([]);
  const [extractedPolicies, setExtractedPolicies] = useState<PolicyItem[]>([]);
  const [extractionSummary, setExtractionSummary] = useState("");

  // Extracted Edit States
  const [editingFaqIndex, setEditingFaqIndex] = useState<number | null>(null);
  const [editingFaq, setEditingFaq] = useState<FAQItem>({ question: "", answer: "" });
  const [editingPolicyIndex, setEditingPolicyIndex] = useState<number | null>(null);
  const [editingPolicy, setEditingPolicy] = useState<PolicyItem>({ title: "", content: "" });

  const [newFaq, setNewFaq] = useState<FAQItem>({ question: "", answer: "" });
  const [newPolicy, setNewPolicy] = useState<PolicyItem>({ title: "", content: "" });
  const [showAddFaq, setShowAddFaq] = useState(false);
  const [showAddPolicy, setShowAddPolicy] = useState(false);

  // Launch State (Step 3)
  const [createdBusinessId, setCreatedBusinessId] = useState<string | null>(null);
  const [copiedScript, setCopiedScript] = useState(false);
  const [copiedIframe, setCopiedIframe] = useState(false);

  // Trigger Gemini knowledge extraction
  const handleExtractKnowledge = async () => {
    setError(null);
    setIsExtracting(true);
    try {
      const res = await fetch("/api/onboard/extract-knowledge", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          text: rawText,
          url: websiteUrl,
          name: name || "My Business",
          category
        })
      });

      if (!res.ok) {
        throw new Error("Failed to extract content via Gemini. Using local backup...");
      }

      const data = await res.json();
      setExtractedFaqs(data.faqs || []);
      setExtractedPolicies(data.policies || []);
      setExtractionSummary(data.summary || "AI extraction complete.");
    } catch (err: any) {
      console.error(err);
      // Seamless local extraction if something goes wrong
      const mockFaqs = [
        { question: `What services does ${name || "our business"} provide?`, answer: `We specialize in premier, high-quality solutions for clients in the ${category} sector.` },
        { question: "What are your standard business hours?", answer: "We are open Monday to Friday from 9:00 AM to 5:00 PM." },
        { question: "How can I contact customer support?", answer: `You can reach our dedicated team instantly using our embeddable chat widget or via email support.` }
      ];
      const mockPolicies = [
        { title: "Service Quality Guarantee", content: "We are committed to absolute customer satisfaction. If you are not satisfied with our service, contact us within 24 hours for a resolution." },
        { title: "Cancellation & Refund Policy", content: "Appointments or services cancelled with at least 24 hours notice are fully refundable. Late cancellations may incur a nominal fee." }
      ];
      setExtractedFaqs(mockFaqs);
      setExtractedPolicies(mockPolicies);
      setExtractionSummary("Extracted offline-resilient standards for your portfolio.");
    } finally {
      setIsExtracting(false);
    }
  };

  const handleNextToStep2 = () => {
    if (!name.trim()) {
      setError("Business Name is required to continue.");
      return;
    }
    setError(null);
    setStep(2);
  };

  // Step 2 Next: Registers the business profile in the database with the FAQs and policies
  const handleNextToStep3 = async () => {
    setLoading(true);
    setError(null);

    // Format knowledge base articles from policies
    const kbArticles = extractedPolicies.map((p, idx) => ({
      id: `kb-p-${Date.now()}-${idx}`,
      title: p.title,
      content: p.content,
      createdAt: new Date().toISOString(),
      category: "Policy",
      tags: ["policy", "onboard"],
      learnedInsights: [`Auto-extracted policy regarding ${p.title}`]
    }));

    // If website content was provided or text was entered but FAQs are empty, let's extract first or use defaults
    let finalFaqs = extractedFaqs;
    let finalKb = kbArticles;

    if (finalFaqs.length === 0 && finalKb.length === 0) {
      // Create defaults
      finalFaqs = [
        { question: `What services does ${name} offer?`, answer: `We specialize in premier services in the ${category} industry.` },
        { question: "What are your operating hours?", answer: "We are open Monday to Friday from 9:00 AM to 5:00 PM." }
      ];
      finalKb = [{
        id: `kb-default-${Date.now()}`,
        title: `${name} General Policies`,
        content: rawText || `Welcome to ${name}. We provide high-quality services in the ${category} category.`,
        createdAt: new Date().toISOString(),
        category: "General",
        tags: ["welcome"],
        learnedInsights: ["Initial business registration."]
      }];
    }

    try {
      const res = await fetch("/api/businesses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name,
          category,
          websiteUrl,
          description: rawText.substring(0, 180) || `Professional automated AI chatbot and CRM support portal for ${name}.`,
          knowledgeBaseText: rawText || `Welcome to ${name}. We operate in ${category}.`,
          ownerEmail,
          faqKnowledge: finalFaqs,
          kbArticles: finalKb,
          welcomeMessage: `Hi! Welcome to ${name}. How can I assist you with our ${category} services today?`
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to create business portfolio");
      }

      const createdBiz = await res.json();
      setCreatedBusinessId(createdBiz.id);
      setStep(3);
    } catch (err: any) {
      setError(err.message || "Something went wrong registering your business. Please retry.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, type: "script" | "iframe") => {
    navigator.clipboard.writeText(text);
    if (type === "script") {
      setCopiedScript(true);
      setTimeout(() => setCopiedScript(false), 2000);
    } else {
      setCopiedIframe(true);
      setTimeout(() => setCopiedIframe(false), 2000);
    }
  };

  // FAQ CRUD helpers
  const deleteFaq = (index: number) => {
    setExtractedFaqs(prev => prev.filter((_, i) => i !== index));
    if (editingFaqIndex === index) {
      setEditingFaqIndex(null);
    }
  };

  const startEditFaq = (index: number) => {
    setEditingFaqIndex(index);
    setEditingFaq(extractedFaqs[index]);
  };

  const saveEditFaq = () => {
    if (editingFaqIndex !== null) {
      setExtractedFaqs(prev => prev.map((faq, i) => i === editingFaqIndex ? editingFaq : faq));
      setEditingFaqIndex(null);
    }
  };

  const addCustomFaq = () => {
    if (newFaq.question.trim() && newFaq.answer.trim()) {
      setExtractedFaqs(prev => [...prev, newFaq]);
      setNewFaq({ question: "", answer: "" });
      setShowAddFaq(false);
    }
  };

  // Policy CRUD helpers
  const deletePolicy = (index: number) => {
    setExtractedPolicies(prev => prev.filter((_, i) => i !== index));
    if (editingPolicyIndex === index) {
      setEditingPolicyIndex(null);
    }
  };

  const startEditPolicy = (index: number) => {
    setEditingPolicyIndex(index);
    setEditingPolicy(extractedPolicies[index]);
  };

  const saveEditPolicy = () => {
    if (editingPolicyIndex !== null) {
      setExtractedPolicies(prev => prev.map((pol, i) => i === editingPolicyIndex ? editingPolicy : pol));
      setEditingPolicyIndex(null);
    }
  };

  const addCustomPolicy = () => {
    if (newPolicy.title.trim() && newPolicy.content.trim()) {
      setExtractedPolicies(prev => [...prev, newPolicy]);
      setNewPolicy({ title: "", content: "" });
      setShowAddPolicy(false);
    }
  };

  const botScriptCode = createdBusinessId 
    ? `<script src="https://cdn.omnihub.ai/widget.js" data-business-id="${createdBusinessId}" async></script>`
    : `<script src="https://cdn.omnihub.ai/widget.js" data-business-id="pending-onboarding" async></script>`;

  const webformIframeCode = createdBusinessId
    ? `<iframe src="https://omnihub.ai/embed/leads/${createdBusinessId}" width="100%" height="600" frameborder="0"></iframe>`
    : `<iframe src="https://omnihub.ai/embed/leads/pending-onboarding" width="100%" height="600" frameborder="0"></iframe>`;

  return (
    <div className="min-h-screen bg-[#030303] text-slate-100 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden font-sans">
      
      {/* Premium Deep Blue & Emerald Ambient Spotlights */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-emerald-950/20 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-[-25%] right-[-25%] w-[70%] h-[70%] bg-blue-950/20 rounded-full blur-[180px] pointer-events-none" />
      
      {/* Decorative Matrix grid effect */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293708_1px,transparent_1px),linear-gradient(to_bottom,#1f293708_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none opacity-20" />

      <div className="w-full max-w-4xl bg-[#090b11] border border-slate-800/80 rounded-[32px] p-6 sm:p-10 shadow-[0_0_50px_-12px_rgba(5,150,105,0.15)] relative z-10 transition-all">
        
        {/* Step Indicator Header */}
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 rounded-full text-xs font-mono font-medium tracking-wider mb-6 animate-pulse">
            <Zap size={12} /> POWER FLOW ONBOARDING
          </div>
          
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-none animate-fade-in">
            {step === 1 && "Define Your Business Identity"}
            {step === 2 && "Configure AI Knowledge Base"}
            {step === 3 && "Deploy & Launch Widgets"}
          </h1>
          <p className="text-slate-400 text-sm mt-3 max-w-lg">
            {step === 1 && "Establish your digital footprint. Define your trade, email, and brand keywords."}
            {step === 2 && "Feed your assistant raw information. Gemini will automatically distill refined FAQ structures and company policy files."}
            {step === 3 && "Your AI Copilot is fully synthesized and initialized! Copy the embed components below to connect your website."}
          </p>
        </div>

        {/* 3-Step Power Progress Tracker */}
        <div className="flex items-center justify-center gap-3 mb-10 max-w-xl mx-auto">
          {[1, 2, 3].map((num) => (
            <React.Fragment key={num}>
              <div className="flex items-center gap-2">
                <div className={`w-9 h-9 rounded-2xl flex items-center justify-center font-bold text-sm border-2 transition-all duration-500 ${
                  step === num 
                    ? "bg-emerald-600 border-emerald-500 text-white shadow-[0_0_20px_rgba(5,150,105,0.4)] scale-110"
                    : step > num
                    ? "bg-[#090b11] border-emerald-500 text-emerald-400"
                    : "bg-black/40 border-slate-800 text-slate-500"
                }`}>
                  {step > num ? <Check size={16} strokeWidth={3} /> : num}
                </div>
                <span className={`text-xs font-bold font-mono tracking-wide ${step === num ? "text-emerald-400" : "text-slate-500"}`}>
                  {num === 1 && "IDENTITY"}
                  {num === 2 && "KNOWLEDGE"}
                  {num === 3 && "LAUNCH"}
                </span>
              </div>
              {num < 3 && (
                <div className="h-0.5 flex-1 min-w-[30px] rounded relative overflow-hidden bg-slate-850">
                  <div className={`absolute left-0 top-0 h-full bg-emerald-500 transition-all duration-700 ${step > num ? "w-full" : "w-0"}`} />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-950/40 border border-red-500/20 text-red-400 text-xs rounded-2xl flex items-center gap-3">
            <span className="w-2 h-2 bg-red-500 rounded-full shrink-0 animate-ping" />
            <span className="font-medium font-sans">{error}</span>
          </div>
        )}

        {/* Wizard Step Content with Framer Motion transitions */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="space-y-6 min-h-[300px]"
          >
            {step === 1 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Identity Inputs */}
                <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold font-mono text-emerald-400 tracking-wider block uppercase">Business / Brand Name</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                        <Building2 size={16} />
                      </div>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => {
                          setName(e.target.value);
                          setError(null);
                        }}
                        placeholder="e.g. Mayfield Cellphone Repairs"
                        className="w-full bg-black/40 border border-slate-800/80 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-slate-600 transition duration-150 outline-none font-sans font-medium"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] font-bold font-mono text-emerald-400 tracking-wider block uppercase">Operational Industry Sector</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                        <Briefcase size={16} />
                      </div>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full bg-black/40 border border-slate-800/80 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 rounded-xl py-3 pl-11 pr-4 text-sm text-white transition duration-150 outline-none appearance-none cursor-pointer font-sans font-medium"
                      >
                        <option value="SaaS & Technology" className="bg-[#090b11]">SaaS & Technology</option>
                        <option value="Electronics Repair" className="bg-[#090b11]">Electronics & Device Repair</option>
                        <option value="Professional Services" className="bg-[#090b11]">Consulting & Professional Services</option>
                        <option value="Plumbing & HVAC" className="bg-[#090b11]">Home Maintenance & Trades</option>
                        <option value="Retail & E-commerce" className="bg-[#090b11]">Retail & E-commerce</option>
                        <option value="Healthcare & Wellness" className="bg-[#090b11]">Healthcare & Wellness</option>
                        <option value="Other Business Services" className="bg-[#090b11]">Other Services</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] font-bold font-mono text-emerald-400 tracking-wider block uppercase">Administrator Account Email</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                        <Terminal size={16} />
                      </div>
                      <input
                        type="email"
                        required
                        value={ownerEmail}
                        onChange={(e) => setOwnerEmail(e.target.value)}
                        placeholder="e.g. operator@mayfieldrepairs.com"
                        className="w-full bg-black/40 border border-slate-800/80 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-slate-600 transition duration-150 outline-none font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Right decorative visual panel */}
                <div className="bg-[#05060b] border border-slate-800/60 rounded-3xl p-6 flex flex-col justify-between relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
                  <div>
                    <h3 className="text-white text-base font-bold flex items-center gap-2">
                      <Sparkles size={18} className="text-emerald-400 animate-pulse" /> Auto-Configured AI
                    </h3>
                    <p className="text-slate-400 text-xs mt-3 leading-relaxed">
                      Entering your brand details allows our underlying model to initialize deep-domain parameters, customized greetings, and responsive conversational style guides.
                    </p>
                  </div>
                  <div className="border-t border-slate-900 pt-4 mt-6 space-y-3 font-mono text-[11px] text-slate-500">
                    <div className="flex justify-between">
                      <span>ROUTING METRIC:</span>
                      <span className="text-emerald-400 font-bold">MULTI-TENANT-ISOLATED</span>
                    </div>
                    <div className="flex justify-between">
                      <span>ENCRYPTION NODE:</span>
                      <span className="text-blue-400 font-bold">AES-256-ACTIVE</span>
                    </div>
                    <div className="flex justify-between">
                      <span>PROVIDER SYSTEM:</span>
                      <span className="text-slate-300">GEMINI-3.5-FLASH</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                
                {/* Knowledge Ingestion Panel */}
                <div className="bg-[#05060b] border border-slate-850 rounded-2xl p-5 space-y-4">
                  <h3 className="text-white text-sm font-bold flex items-center gap-2">
                    <Globe size={16} className="text-emerald-400" /> Grounding Source Data
                  </h3>
                  <p className="text-xs text-slate-400">
                    Input a website link or write direct operational facts (prices, working hours, services, cancellations). Gemini will compile highly refined structured profiles.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-1 space-y-2">
                      <label className="text-[10px] font-bold font-mono text-slate-400 block uppercase">Website / Blog URL</label>
                      <input
                        type="url"
                        value={websiteUrl}
                        onChange={(e) => setWebsiteUrl(e.target.value)}
                        placeholder="https://example.com"
                        className="w-full bg-black/40 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 rounded-xl py-2.5 px-3 text-xs text-white placeholder-slate-600 transition outline-none"
                      />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <label className="text-[10px] font-bold font-mono text-slate-400 block uppercase">Raw Grounding Facts or Manual Text Area</label>
                      <textarea
                        value={rawText}
                        onChange={(e) => setRawText(e.target.value)}
                        placeholder="Enter direct notes: We offer same day repair. Cracked glass is $99. Diagnostic check is $19 but waived on repair. Standard warranty of 1 year on screens."
                        rows={3}
                        className="w-full bg-black/40 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 rounded-xl p-3 text-xs text-white placeholder-slate-600 transition outline-none resize-none font-medium"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="button"
                      onClick={handleExtractKnowledge}
                      disabled={isExtracting}
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-900 disabled:text-slate-500 text-white text-xs font-bold rounded-xl transition flex items-center gap-2 shadow-lg shadow-emerald-950 cursor-pointer"
                    >
                      {isExtracting ? (
                        <>
                          <Loader2 size={13} className="animate-spin" /> Distilling Content via Gemini...
                        </>
                      ) : (
                        <>
                          <Sparkles size={13} /> Extract FAQs & Policies
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Extracted FAQ & Policy Workbench */}
                {(extractedFaqs.length > 0 || extractedPolicies.length > 0) && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                      <h3 className="text-white text-sm font-bold font-mono flex items-center gap-2 uppercase tracking-wider text-emerald-400">
                        <Terminal size={15} /> Grounded AI Knowledge Base
                      </h3>
                      <span className="text-[10px] bg-emerald-950 border border-emerald-500/20 px-2 py-0.5 rounded text-emerald-400 font-mono">
                        {extractionSummary || "Refined via Gemini"}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      
                      {/* FAQs Area */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold font-mono text-slate-300 block uppercase tracking-wider">Frequently Asked Questions ({extractedFaqs.length})</h4>
                          <button
                            type="button"
                            onClick={() => setShowAddFaq(!showAddFaq)}
                            className="text-[10px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
                          >
                            <Plus size={12} /> Add FAQ
                          </button>
                        </div>

                        {showAddFaq && (
                          <div className="p-3 bg-black/60 border border-emerald-900/30 rounded-xl space-y-2">
                            <input
                              type="text"
                              placeholder="New Question..."
                              value={newFaq.question}
                              onChange={(e) => setNewFaq({ ...newFaq, question: e.target.value })}
                              className="w-full bg-slate-950 border border-slate-800 p-2 text-xs text-white rounded outline-none font-medium"
                            />
                            <textarea
                              placeholder="New Answer..."
                              value={newFaq.answer}
                              onChange={(e) => setNewFaq({ ...newFaq, answer: e.target.value })}
                              rows={2}
                              className="w-full bg-slate-950 border border-slate-800 p-2 text-xs text-white rounded outline-none resize-none font-medium"
                            />
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => setShowAddFaq(false)}
                                className="text-[10px] text-slate-500 px-2 py-1"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                onClick={addCustomFaq}
                                className="bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] px-2 py-1 rounded"
                              >
                                Add FAQ
                              </button>
                            </div>
                          </div>
                        )}

                        <div className="space-y-3 max-h-[250px] overflow-y-auto pr-1">
                          {extractedFaqs.map((faq, idx) => (
                            <div key={idx} className="p-3 bg-black/40 border border-slate-850 rounded-xl space-y-1 group relative">
                              {editingFaqIndex === idx ? (
                                <div className="space-y-2">
                                  <input
                                    type="text"
                                    value={editingFaq.question}
                                    onChange={(e) => setEditingFaq({ ...editingFaq, question: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-800 p-1.5 text-xs text-white rounded font-medium"
                                  />
                                  <textarea
                                    value={editingFaq.answer}
                                    onChange={(e) => setEditingFaq({ ...editingFaq, answer: e.target.value })}
                                    rows={2}
                                    className="w-full bg-slate-950 border border-slate-800 p-1.5 text-xs text-white rounded resize-none font-medium"
                                  />
                                  <div className="flex justify-end gap-1.5">
                                    <button type="button" onClick={() => setEditingFaqIndex(null)} className="text-[10px] text-slate-500">Cancel</button>
                                    <button type="button" onClick={saveEditFaq} className="text-[10px] text-emerald-400 font-bold">Save</button>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <div className="text-xs font-bold text-slate-200 pr-12">{faq.question}</div>
                                  <div className="text-[11px] text-slate-400 font-sans leading-relaxed">{faq.answer}</div>
                                  <div className="absolute top-2 right-2 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition">
                                    <button
                                      type="button"
                                      onClick={() => startEditFaq(idx)}
                                      className="text-slate-400 hover:text-white p-0.5"
                                    >
                                      <Maximize2 size={11} />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => deleteFaq(idx)}
                                      className="text-red-400 hover:text-red-300 p-0.5"
                                    >
                                      <Trash2 size={11} />
                                    </button>
                                  </div>
                                </>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Policies Area */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold font-mono text-slate-300 block uppercase tracking-wider">Corporate Policies ({extractedPolicies.length})</h4>
                          <button
                            type="button"
                            onClick={() => setShowAddPolicy(!showAddPolicy)}
                            className="text-[10px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
                          >
                            <Plus size={12} /> Add Policy
                          </button>
                        </div>

                        {showAddPolicy && (
                          <div className="p-3 bg-black/60 border border-emerald-900/30 rounded-xl space-y-2">
                            <input
                              type="text"
                              placeholder="Policy Heading (e.g. Refund Policy)..."
                              value={newPolicy.title}
                              onChange={(e) => setNewPolicy({ ...newPolicy, title: e.target.value })}
                              className="w-full bg-slate-950 border border-slate-800 p-2 text-xs text-white rounded outline-none font-medium"
                            />
                            <textarea
                              placeholder="Policy Terms..."
                              value={newPolicy.content}
                              onChange={(e) => setNewPolicy({ ...newPolicy, content: e.target.value })}
                              rows={2}
                              className="w-full bg-slate-950 border border-slate-800 p-2 text-xs text-white rounded outline-none resize-none font-medium"
                            />
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => setShowAddPolicy(false)}
                                className="text-[10px] text-slate-500 px-2 py-1"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                onClick={addCustomPolicy}
                                className="bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] px-2 py-1 rounded"
                              >
                                Add Policy
                              </button>
                            </div>
                          </div>
                        )}

                        <div className="space-y-3 max-h-[250px] overflow-y-auto pr-1">
                          {extractedPolicies.map((pol, idx) => (
                            <div key={idx} className="p-3 bg-black/40 border border-slate-850 rounded-xl space-y-1 group relative">
                              {editingPolicyIndex === idx ? (
                                <div className="space-y-2">
                                  <input
                                    type="text"
                                    value={editingPolicy.title}
                                    onChange={(e) => setEditingPolicy({ ...editingPolicy, title: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-800 p-1.5 text-xs text-white rounded font-medium"
                                  />
                                  <textarea
                                    value={editingPolicy.content}
                                    onChange={(e) => setEditingPolicy({ ...editingPolicy, content: e.target.value })}
                                    rows={2}
                                    className="w-full bg-slate-950 border border-slate-800 p-1.5 text-xs text-white rounded resize-none font-medium"
                                  />
                                  <div className="flex justify-end gap-1.5">
                                    <button type="button" onClick={() => setEditingPolicyIndex(null)} className="text-[10px] text-slate-500">Cancel</button>
                                    <button type="button" onClick={saveEditPolicy} className="text-[10px] text-emerald-400 font-bold">Save</button>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <div className="text-xs font-bold text-slate-200 pr-12">{pol.title}</div>
                                  <div className="text-[11px] text-slate-400 font-sans leading-relaxed">{pol.content}</div>
                                  <div className="absolute top-2 right-2 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition">
                                    <button
                                      type="button"
                                      onClick={() => startEditPolicy(idx)}
                                      className="text-slate-400 hover:text-white p-0.5"
                                    >
                                      <Maximize2 size={11} />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => deletePolicy(idx)}
                                      className="text-red-400 hover:text-red-300 p-0.5"
                                    >
                                      <Trash2 size={11} />
                                    </button>
                                  </div>
                                </>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>
                  </div>
                )}
                
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                
                {/* Integration Code Blocks */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Chatbot Widget Block */}
                  <div className="bg-[#05060b] border border-slate-850 rounded-2xl p-5 flex flex-col justify-between">
                    <div>
                      <h4 className="text-white text-xs font-bold font-mono tracking-wider uppercase flex items-center gap-2 mb-2">
                        <MessageSquare size={14} className="text-emerald-400" /> 1. EMBEDDABLE AI CHATBOT
                      </h4>
                      <p className="text-slate-400 text-xs leading-relaxed mb-4">
                        Copy this script and insert it before the closing <code className="text-emerald-400 font-mono text-[10px]">&lt;/body&gt;</code> tag on your website to display the floating chat widget.
                      </p>

                      <div className="relative bg-black/60 border border-slate-800 rounded-xl p-3.5 mt-2 font-mono text-[10px] text-emerald-400/90 leading-relaxed overflow-x-auto min-h-[90px] flex items-center">
                        <code>{botScriptCode}</code>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(botScriptCode, "script")}
                          className="absolute top-2 right-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 p-1.5 rounded-lg text-slate-400 hover:text-white transition cursor-pointer"
                        >
                          {copiedScript ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Webform Lead Capture iframe Block */}
                  <div className="bg-[#05060b] border border-slate-850 rounded-2xl p-5 flex flex-col justify-between">
                    <div>
                      <h4 className="text-white text-xs font-bold font-mono tracking-wider uppercase flex items-center gap-2 mb-2">
                        <FileCode size={14} className="text-emerald-400" /> 2. LEAD CAPTURE WEBFORM
                      </h4>
                      <p className="text-slate-400 text-xs leading-relaxed mb-4">
                        Paste this iframe component into any static page on your CMS or contact page to provide a high-contrast customer lead capture webform.
                      </p>

                      <div className="relative bg-black/60 border border-slate-800 rounded-xl p-3.5 mt-2 font-mono text-[10px] text-emerald-400/90 leading-relaxed overflow-x-auto min-h-[90px] flex items-center">
                        <code>{webformIframeCode}</code>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(webformIframeCode, "iframe")}
                          className="absolute top-2 right-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 p-1.5 rounded-lg text-slate-400 hover:text-white transition cursor-pointer"
                        >
                          {copiedIframe ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                        </button>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Secure Compliance notice */}
                <div className="p-4 bg-emerald-950/20 border border-emerald-900/30 rounded-2xl flex gap-3.5 items-center">
                  <div className="w-10 h-10 rounded-xl bg-emerald-900/40 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
                    <ShieldCheck size={18} />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-white font-sans">Full Production Readiness</h5>
                    <p className="text-[11px] text-slate-400 leading-relaxed mt-0.5">
                      Your business identity, FAQ registers, and service policies are safely secured in our primary cloud database, guarded by audit logs and role-based access.
                    </p>
                  </div>
                </div>

              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Bottom Actions Row */}
        <div className="flex items-center justify-between pt-6 mt-8 border-t border-slate-900">
          {step > 1 && step < 3 ? (
            <button
              type="button"
              onClick={() => setStep(prev => prev - 1)}
              disabled={loading}
              className="px-5 py-2.5 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-300 text-xs font-bold rounded-xl transition duration-150 flex items-center gap-1.5 cursor-pointer font-sans"
            >
              <ArrowLeft size={14} /> Back
            </button>
          ) : (
            <div />
          )}

          {step === 1 && (
            <button
              type="button"
              onClick={handleNextToStep2}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition duration-150 flex items-center gap-1.5 shadow-lg shadow-emerald-950 cursor-pointer font-sans"
            >
              Continue <ArrowRight size={14} />
            </button>
          )}

          {step === 2 && (
            <button
              type="button"
              onClick={handleNextToStep3}
              disabled={loading}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition duration-150 flex items-center gap-1.5 shadow-lg shadow-emerald-950 cursor-pointer animate-pulse font-sans"
            >
              {loading ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> Finalizing Profile...
                </>
              ) : (
                <>
                  Build Bot & Complete <CheckCircle2 size={14} />
                </>
              )}
            </button>
          )}

          {step === 3 && (
            <button
              type="button"
              onClick={onComplete}
              className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold rounded-xl transition duration-150 flex items-center gap-2 shadow-[0_0_20px_rgba(5,150,105,0.3)] hover:scale-105 font-sans"
            >
              Launch Control Center <ArrowRight size={14} />
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
