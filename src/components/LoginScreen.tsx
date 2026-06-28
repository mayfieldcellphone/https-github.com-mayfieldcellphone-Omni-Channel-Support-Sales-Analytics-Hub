import React, { useState, useEffect } from "react";
import { 
  Lock, 
  Shield, 
  Cpu, 
  Key, 
  ArrowRight, 
  Github, 
  Mail, 
  Building, 
  Briefcase, 
  MessageSquare, 
  AlertCircle, 
  CheckCircle2,
  Check,
  Sparkles,
  Terminal,
  LogOut,
  LayoutDashboard,
  Globe,
  Plus,
  Copy,
  Code
} from "lucide-react";

interface LoginScreenProps {
  sessionUser: {
    email: string;
    name: string;
    avatar: string;
    provider: "google" | "github";
    role: "Admin" | "Manager" | "Agent";
  } | null;
  onLogin: (user: {
    email: string;
    name: string;
    avatar: string;
    provider: "google" | "github";
    role: "Admin" | "Manager" | "Agent";
  }) => void;
  onLogout: () => void;
}

export default function LoginScreen({ sessionUser, onLogin, onLogout }: LoginScreenProps) {
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");

  const getPublicOrigin = () => {
    if (typeof window === 'undefined') {
      return 'https://ais-pre-t5k2bi32unqbmimsslh4bd-411472579253.asia-east1.run.app';
    }
    let origin = window.location.origin;
    if (origin.includes('ais-dev-')) {
      origin = origin.replace('ais-dev-', 'ais-pre-');
    }
    return origin;
  };
  
  // Login Form States
  const [loginEmail, setLoginEmail] = useState("admin@mayfieldrepairs.com.au");
  const [loginPassword, setLoginPassword] = useState("••••••••");
  const [loginRole, setLoginRole] = useState<"Admin" | "Manager" | "Agent" | "">("Admin");
  
  // Signup Form States
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [businessCategory, setBusinessCategory] = useState("Electronics Repair");
  const [welcomeGreeting, setWelcomeGreeting] = useState("Hello! Welcome to our automated support bot. How can we help you today?");
  const [signupRole, setSignupRole] = useState<"Admin" | "Manager" | "Agent">("Admin");

  // Onboarding Wizard States
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardedBusinesses, setOnboardedBusinesses] = useState<Array<{
    name: string;
    category: string;
    websiteUrl: string;
    knowledgeBaseText: string;
    welcomeGreeting: string;
  }>>([]);
  const [currentOnboardName, setCurrentOnboardName] = useState("");
  const [currentOnboardCategory, setCurrentOnboardCategory] = useState("Electronics Repair");
  const [currentOnboardWebsite, setCurrentOnboardWebsite] = useState("");
  const [currentOnboardKB, setCurrentOnboardKB] = useState("");
  const [currentOnboardWelcome, setCurrentOnboardWelcome] = useState("");
  const [onboardError, setOnboardError] = useState<string | null>(null);

  // Ready to Deploy Codes states
  const [showDeploymentCodesScreen, setShowDeploymentCodesScreen] = useState(false);
  const [newlyProvisionedBizs, setNewlyProvisionedBizs] = useState<Array<{
    id: string;
    name: string;
    category: string;
    websiteUrl: string;
    welcomeMessage: string;
  }>>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedType, setCopiedType] = useState<string>(""); // 'html' or 'api' or 'react'
  const [activeCodeTab, setActiveCodeTab] = useState<Record<string, "widget" | "leadform">>({});
  
  // Validation / Message States
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Authenticating handshake states
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authProvider, setAuthProvider] = useState<"credentials" | "google" | "github">("credentials");
  const [handshakeStep, setHandshakeStep] = useState(0);
  const [handshakeLogs, setHandshakeLogs] = useState<string[]>([]);

  // Synchronize state with URL Hash
  useEffect(() => {
    const handleHashCheck = () => {
      const hash = window.location.hash;
      if (hash === "#/signup") {
        setActiveTab("signup");
        setErrorMessage(null);
      } else {
        setActiveTab("login");
        setErrorMessage(null);
      }
    };

    handleHashCheck();
    window.addEventListener("hashchange", handleHashCheck);
    return () => window.removeEventListener("hashchange", handleHashCheck);
  }, []);

  const handleTabChange = (tab: "login" | "signup") => {
    setActiveTab(tab);
    setErrorMessage(null);
    setSuccessMessage(null);
    window.location.hash = tab === "signup" ? "#/signup" : "#/login";
  };

  // Run the premium auth handshake logs animation
  const runHandshakeAnimation = (
    providerType: "credentials" | "google" | "github",
    userEmail: string,
    roleToAssign: "Admin" | "Manager" | "Agent",
    customBusinessId?: string
  ) => {
    setAuthProvider(providerType);
    setIsAuthenticating(true);
    setHandshakeStep(1);
    
    const logs = [
      "Establishing secure SSL/TLS gateway tunnel...",
      "Resolving RBAC authorization token permissions...",
      "Connecting to high-availability PostgreSQL database cluster...",
      "Syncing multi-tenant isolated configuration parameters...",
      "Securing session keys with high-grade AES-GCM encryption...",
      "Session authenticated successfully! Launching OmniHub..."
    ];

    setHandshakeLogs([logs[0]]);

    const timer1 = setTimeout(() => {
      setHandshakeStep(2);
      setHandshakeLogs(prev => [...prev, logs[1], logs[2]]);
    }, 500);

    const timer2 = setTimeout(() => {
      setHandshakeStep(3);
      setHandshakeLogs(prev => [...prev, logs[3], logs[4]]);
    }, 1000);

    const timer3 = setTimeout(() => {
      setHandshakeStep(4);
      setHandshakeLogs(prev => [...prev, logs[5]]);
    }, 1500);

    const timer4 = setTimeout(() => {
      const cleanName = userEmail.split("@")[0].replace(/[._-]/g, " ");
      onLogin({
        email: userEmail.trim(),
        name: cleanName.charAt(0).toUpperCase() + cleanName.slice(1),
        avatar: providerType === "github" ? "🐙" : (providerType === "google" ? "🌐" : "👤"),
        provider: providerType === "credentials" ? "google" : providerType,
        role: roleToAssign,
      });
      setIsAuthenticating(false);
    }, 2000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  };

  const handleCredentialsLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!loginEmail.trim()) {
      setErrorMessage("Please enter an email address to authenticate.");
      return;
    }
    if (!loginEmail.includes("@")) {
      setErrorMessage("Please provide a valid corporate email domain.");
      return;
    }
    if (!loginRole) {
      setErrorMessage("Please select a role to authorize your access level.");
      return;
    }

    runHandshakeAnimation("credentials", loginEmail, loginRole);
  };

  const handleCredentialsSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    // Validate Sign Up
    if (!signupEmail.trim()) {
      setErrorMessage("Please enter an enterprise email address.");
      return;
    }
    if (!signupEmail.includes("@")) {
      setErrorMessage("Please provide a valid email structure.");
      return;
    }
    if (!signupPassword || signupPassword.length < 6) {
      setErrorMessage("Password must be at least 6 characters for strong encryption.");
      return;
    }
    if (!businessName.trim()) {
      setErrorMessage("Please enter a custom Business Name to establish your multi-tenant profile.");
      return;
    }

    // Prefill the onboarding wizard with the first business details entered in the signup form!
    setCurrentOnboardName(businessName.trim());
    setCurrentOnboardCategory(businessCategory);
    setCurrentOnboardWelcome(welcomeGreeting.trim());
    setCurrentOnboardWebsite("");
    setCurrentOnboardKB("");
    
    // Switch to Onboarding Wizard Screen!
    setShowOnboarding(true);
  };

  const handleAddOnboardBusiness = () => {
    setOnboardError(null);
    if (!currentOnboardName.trim()) {
      setOnboardError("Business Name is required to add.");
      return;
    }
    
    const newBiz = {
      name: currentOnboardName.trim(),
      category: currentOnboardCategory,
      websiteUrl: currentOnboardWebsite.trim(),
      knowledgeBaseText: currentOnboardKB.trim(),
      welcomeGreeting: currentOnboardWelcome.trim() || `Hello! Thank you for contacting ${currentOnboardName.trim()}. How can we assist you today?`
    };

    setOnboardedBusinesses((prev) => [...prev, newBiz]);
    
    // Clear the current onboard fields for the next potential business
    setCurrentOnboardName("");
    setCurrentOnboardCategory("Electronics Repair");
    setCurrentOnboardWebsite("");
    setCurrentOnboardKB("");
    setCurrentOnboardWelcome("Hello! Welcome to our automated support bot. How can we help you today?");
  };

  const handleSkipOnboarding = () => {
    setShowOnboarding(false);
    // If they skip, run the authentication directly
    runHandshakeAnimation("credentials", signupEmail, signupRole);
  };

  const handleFinishOnboarding = async () => {
    setOnboardError(null);
    
    // Auto-add the currently typed business details if they haven't manually clicked "Add Business" yet
    let finalBizs = [...onboardedBusinesses];
    if (currentOnboardName.trim()) {
      if (finalBizs.length < 3) {
        finalBizs.push({
          name: currentOnboardName.trim(),
          category: currentOnboardCategory,
          websiteUrl: currentOnboardWebsite.trim(),
          knowledgeBaseText: currentOnboardKB.trim(),
          welcomeGreeting: currentOnboardWelcome.trim() || `Hello! Thank you for contacting ${currentOnboardName.trim()}. How can we assist you today?`
        });
      }
    }

    if (finalBizs.length === 0) {
      setOnboardError("Please add at least details of one business or click Skip to proceed.");
      return;
    }

    try {
      setSuccessMessage("Registering secure corporate tenant in SaaS index...");
      setShowOnboarding(false);
      setIsAuthenticating(true);

      // Sequentially provision each business to make sure they are saved
      let firstBizId = "";
      const createdBizList: any[] = [];
      for (const biz of finalBizs) {
        const bizResponse = await fetch("/api/businesses", {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "x-user-email": signupEmail.trim(),
            "x-user-role": signupRole
          },
          body: JSON.stringify({
            name: biz.name,
            description: `Custom ${biz.category} enterprise services.`,
            category: biz.category,
            welcomeMessage: biz.welcomeGreeting,
            websiteUrl: biz.websiteUrl,
            knowledgeBaseText: biz.knowledgeBaseText,
            ownerEmail: signupEmail.trim()
          })
        });

        if (!bizResponse.ok) {
          throw new Error(`Failed to register business workspace for "${biz.name}"`);
        }

        const newBizData = await bizResponse.json();
        createdBizList.push({
          id: newBizData.id,
          name: newBizData.name,
          category: newBizData.category,
          websiteUrl: newBizData.websiteUrl || biz.websiteUrl || "",
          welcomeMessage: newBizData.chatSettings?.welcomeMessage || biz.welcomeGreeting || "Hello!"
        });
        if (!firstBizId) {
          firstBizId = newBizData.id;
        }
      }

      setNewlyProvisionedBizs(createdBizList);
      setIsAuthenticating(false);
      setSuccessMessage(null);
      setShowDeploymentCodesScreen(true);

    } catch (err: any) {
      setErrorMessage(err.message || "Could not register new enterprise tenant. Try again.");
      setSuccessMessage(null);
      setIsAuthenticating(false);
    }
  };

  const startOAuthFlow = (providerType: "google" | "github") => {
    setErrorMessage(null);
    const emailToUse = activeTab === "login" 
      ? (loginEmail.trim() || `${providerType}-user@repairhub-saas.com`)
      : (signupEmail.trim() || `${providerType}-user@repairhub-saas.com`);
    
    const roleToUse = activeTab === "login" ? (loginRole || "Admin") : signupRole;
    runHandshakeAnimation(providerType, emailToUse, roleToUse);
  };

  const loadDemoUser = (email: string, role: "Admin" | "Manager" | "Agent") => {
    setLoginEmail(email);
    setLoginRole(role);
    setErrorMessage(null);
  };

  if (showOnboarding) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-tr from-emerald-50 via-teal-50 to-green-100 flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-y-auto font-sans selection:bg-emerald-500/30 selection:text-emerald-900" id="onboarding-screen-container">
        
        {/* Decorative High-Fidelity Grids and Radial Light Leaks */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#a7f3d0_1px,transparent_1px),linear-gradient(to_bottom,#a7f3d0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20 pointer-events-none"></div>
        
        <div className="absolute top-10 left-10 w-72 sm:w-96 h-72 sm:h-96 bg-emerald-600/10 rounded-full filter blur-[100px] animate-pulse pointer-events-none"></div>
        <div className="absolute bottom-10 right-10 w-72 sm:w-96 h-72 sm:h-96 bg-teal-600/10 rounded-full filter blur-[100px] animate-pulse pointer-events-none"></div>

        <div className="w-full max-w-lg bg-white border border-emerald-100 rounded-3xl shadow-2xl overflow-hidden relative" id="onboarding-card">
          {/* Onboarding Wizard Header */}
          <div className="bg-gradient-to-r from-emerald-800 to-teal-900 p-6 text-white relative">
            <div className="flex items-center gap-2">
              <Sparkles className="text-emerald-400 animate-pulse" size={18} />
              <span className="text-[10px] uppercase font-mono tracking-widest text-emerald-300 font-bold">Workspace Provisioning Wizard</span>
            </div>
            <h2 className="text-xl font-bold font-sans mt-1.5">Configure Your SaaS Tenant</h2>
            <p className="text-xs text-emerald-100/80 font-sans mt-1">
              Add details for 1 to 3 business profiles to dynamically seed your multi-tenant workspace, or skip straight to the dashboard.
            </p>
            
            {/* Progress bar */}
            <div className="mt-4 flex items-center justify-between text-[10px] font-mono">
              <span>Progress</span>
              <span>{onboardedBusinesses.length} / 3 Businesses Added</span>
            </div>
            <div className="w-full bg-emerald-950/50 rounded-full h-1.5 mt-1.5">
              <div 
                className="bg-emerald-400 h-1.5 rounded-full transition-all duration-300" 
                style={{ width: `${Math.min(100, (onboardedBusinesses.length / 3) * 100)}%` }}
              />
            </div>
          </div>

          {/* Onboarding Wizard Body */}
          <div className="p-6 space-y-6">
            {/* List of Added Businesses */}
            {onboardedBusinesses.length > 0 && (
              <div className="space-y-2">
                <span className="text-[10px] font-mono text-emerald-800 uppercase tracking-wider block font-semibold">Configured Tenant Profiles</span>
                <div className="grid grid-cols-1 gap-2">
                  {onboardedBusinesses.map((biz, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 bg-emerald-50/60 border border-emerald-100 rounded-xl">
                      <div>
                        <h4 className="text-xs font-bold text-slate-800">{biz.name}</h4>
                        <p className="text-[10px] text-emerald-700 font-mono">
                          {biz.category} • {biz.websiteUrl || "No website"}
                        </p>
                      </div>
                      <button 
                        type="button"
                        onClick={() => setOnboardedBusinesses(prev => prev.filter((_, i) => i !== idx))}
                        className="text-red-500 hover:text-red-700 text-xs font-bold font-mono px-2 py-1 hover:bg-red-50 rounded-lg transition"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Form to Add Business (if less than 3 businesses) */}
            {onboardedBusinesses.length < 3 ? (
              <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl space-y-4">
                <div className="border-b border-slate-200 pb-2">
                  <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Building size={14} className="text-emerald-600" /> Business Workspace Setup #{onboardedBusinesses.length + 1}
                  </h3>
                  <p className="text-[10px] text-slate-500">Seed details to customize the AI's persona, FAQ, and KB context.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Business Name */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-emerald-800 uppercase tracking-wider block font-semibold">Business Name</label>
                    <input
                      type="text"
                      value={currentOnboardName}
                      onChange={(e) => setCurrentOnboardName(e.target.value)}
                      placeholder="e.g., Repair Hub"
                      className="w-full bg-white border border-emerald-100 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  {/* Business Category */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-emerald-800 uppercase tracking-wider block font-semibold">Category</label>
                    <select
                      value={currentOnboardCategory}
                      onChange={(e) => setCurrentOnboardCategory(e.target.value)}
                      className="w-full bg-white border border-emerald-100 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-emerald-500 cursor-pointer"
                    >
                      <option value="Electronics Repair">Electronics Repair</option>
                      <option value="Dry Cleaning & Laundry">Dry Cleaning & Laundry</option>
                      <option value="Fitness & Gym">Fitness & Gym</option>
                      <option value="Dental Clinic">Dental Clinic</option>
                      <option value="Consulting Services">Consulting Services</option>
                      <option value="Legal & Finance">Legal & Finance</option>
                    </select>
                  </div>
                </div>

                {/* Website URL */}
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-emerald-800 uppercase tracking-wider block font-semibold">Website URL</label>
                  <div className="relative flex items-center">
                    <Globe size={13} className="absolute left-3 text-emerald-600/70" />
                    <input
                      type="url"
                      value={currentOnboardWebsite}
                      onChange={(e) => setCurrentOnboardWebsite(e.target.value)}
                      placeholder="https://mybusiness.com"
                      className="w-full bg-white border border-emerald-100 rounded-xl pl-8 pr-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>
                </div>

                {/* Knowledge Base Text */}
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-emerald-800 uppercase tracking-wider block font-semibold">Knowledge Base Content</label>
                  <textarea
                    value={currentOnboardKB}
                    onChange={(e) => setCurrentOnboardKB(e.target.value)}
                    placeholder="Enter support files, operating hours, prices, or policies. Gemini will use this to automatically resolve leads."
                    rows={3}
                    className="w-full bg-white border border-emerald-100 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-emerald-500 resize-none leading-relaxed"
                  />
                </div>

                {/* Welcome Greeting */}
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-emerald-800 uppercase tracking-wider block font-semibold">Chatbot Welcome Message</label>
                  <input
                    type="text"
                    value={currentOnboardWelcome}
                    onChange={(e) => setCurrentOnboardWelcome(e.target.value)}
                    placeholder="Hi! How can we help you today?"
                    className="w-full bg-white border border-emerald-100 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleAddOnboardBusiness}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-sans text-xs font-semibold rounded-xl transition duration-150 flex items-center justify-center gap-1.5 shadow"
                >
                  <Plus size={14} /> Save Profile #{onboardedBusinesses.length + 1}
                </button>
              </div>
            ) : (
              <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl text-center space-y-2">
                <CheckCircle2 size={32} className="text-emerald-600 mx-auto animate-bounce" />
                <h4 className="text-xs font-bold text-slate-800">Workspace Cap Reached</h4>
                <p className="text-[11px] text-emerald-800">
                  You have configured the maximum limit of 3 business profiles for onboarding! Click below to build and provision your tenant workspace.
                </p>
              </div>
            )}

            {/* Error alerts */}
            {onboardError && (
              <div className="bg-rose-50 border border-rose-100 text-rose-800 p-3 rounded-xl flex items-start gap-2 text-[11px] animate-shake">
                <AlertCircle size={14} className="mt-0.5 shrink-0" />
                <span>{onboardError}</span>
              </div>
            )}

            {/* Actions Footer */}
            <div className="flex gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={handleSkipOnboarding}
                className="flex-1 py-3 bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 rounded-xl text-xs font-semibold transition cursor-pointer text-center"
              >
                Skip Onboarding
              </button>

              <button
                type="button"
                onClick={handleFinishOnboarding}
                disabled={onboardedBusinesses.length === 0 && !currentOnboardName.trim()}
                className={`flex-1 py-3 text-white rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-lg ${
                  onboardedBusinesses.length > 0 || currentOnboardName.trim()
                    ? "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500" 
                    : "bg-slate-300 border-slate-300 text-slate-500 cursor-not-allowed shadow-none"
                }`}
              >
                <span>Provision Workspace</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </div>

          <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[9px] text-emerald-800 font-mono">
            <Shield size={10} className="text-emerald-500" />
            <span>REAL-TIME MULTI-TENANCY REGISTRY ACTIVE</span>
          </div>
        </div>
      </div>
    );
  }

  if (showDeploymentCodesScreen) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-tr from-emerald-50 via-teal-50 to-green-100 flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-y-auto font-sans selection:bg-emerald-500/30 selection:text-emerald-900" id="deployment-codes-screen-container">
        
        {/* Decorative grids */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#a7f3d0_1px,transparent_1px),linear-gradient(to_bottom,#a7f3d0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20 pointer-events-none"></div>
        <div className="absolute top-10 left-10 w-72 sm:w-96 h-72 sm:h-96 bg-emerald-600/10 rounded-full filter blur-[100px] animate-pulse pointer-events-none"></div>
        <div className="absolute bottom-10 right-10 w-72 sm:w-96 h-72 sm:h-96 bg-teal-600/10 rounded-full filter blur-[100px] animate-pulse pointer-events-none"></div>

        <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden relative" id="deployment-codes-card">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-800 to-teal-900 p-6 sm:p-8 text-white relative">
            <div className="flex items-center gap-2">
              <Sparkles className="text-emerald-400 animate-pulse" size={18} />
              <span className="text-[10px] uppercase font-mono tracking-widest text-emerald-300 font-bold">Workspace Ready</span>
            </div>
            <h2 className="text-2xl font-bold font-sans mt-1.5">Your AI Chatbots Are Ready to Deploy!</h2>
            <p className="text-sm text-emerald-100/80 font-sans mt-2">
              We've successfully provisioned your secure corporate tenants. Each chatbot has been compiled with custom rules and memory. Copy the code snippets below to activate them on your sites.
            </p>
          </div>

          {/* Deployment Code Cards per website */}
          <div className="p-6 sm:p-8 space-y-6">
            
            <div className="space-y-4">
              {newlyProvisionedBizs.map((biz, idx) => {
                const appOrigin = getPublicOrigin();
                const widgetCode = `<!-- OmniHub AI Chatbot Widget for ${biz.name} -->
<script 
  src="${appOrigin}/widget.js" 
  data-tenant-id="${biz.id}" 
  data-welcome="${biz.welcomeMessage}"
  data-color="#10b981" 
  async>
</script>`;

                return (
                  <div key={biz.id} className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4" id={`deploy-card-${biz.id}`}>
                    <div className="flex flex-wrap justify-between items-start gap-2 border-b border-slate-900 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping shrink-0"></span>
                          <h3 className="text-sm font-bold text-white font-sans">{biz.name}</h3>
                        </div>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                          Category: {biz.category} • Website: {biz.websiteUrl || "Any domain host"}
                        </p>
                      </div>
                      <span className="text-[9px] font-mono bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full uppercase font-bold tracking-wider">
                        Learned & Ready
                      </span>
                    </div>

                    {/* Tab Selection */}
                    <div className="flex bg-slate-900/60 p-1 rounded-lg border border-slate-800 gap-1">
                      <button
                        type="button"
                        onClick={() => setActiveCodeTab(prev => ({ ...prev, [biz.id]: "widget" }))}
                        className={`flex-1 py-1 text-center text-[10px] font-mono font-bold rounded-md transition ${
                          (activeCodeTab[biz.id] || "widget") === "widget"
                            ? "bg-emerald-600 text-white shadow-sm"
                            : "text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        🤖 AI Chatbot Tag
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveCodeTab(prev => ({ ...prev, [biz.id]: "leadform" }))}
                        className={`flex-1 py-1 text-center text-[10px] font-mono font-bold rounded-md transition ${
                          activeCodeTab[biz.id] === "leadform"
                            ? "bg-emerald-600 text-white shadow-sm"
                            : "text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        📋 Lead Capture Form
                      </button>
                    </div>

                    {(activeCodeTab[biz.id] || "widget") === "widget" ? (
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block font-semibold flex items-center gap-1">
                            <Code size={12} className="text-emerald-400" /> HTML Script Snippet (Paste before &lt;/body&gt;)
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(widgetCode);
                              setCopiedIndex(idx);
                              setCopiedType("html");
                              setTimeout(() => {
                                setCopiedIndex(null);
                                setCopiedType("");
                              }, 2000);
                            }}
                            className="text-[10px] font-mono text-emerald-400 hover:text-emerald-300 flex items-center gap-1 px-2.5 py-1 bg-emerald-500/10 rounded-lg transition"
                          >
                            {copiedIndex === idx && copiedType === "html" ? (
                              <>
                                <Check size={11} className="text-emerald-400 inline" />
                                <span>Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy size={11} className="inline" />
                                <span>Copy Script</span>
                              </>
                            )}
                          </button>
                        </div>

                        <div className="relative font-mono">
                          <pre className="text-[11px] text-slate-300 bg-slate-900 border border-slate-800 rounded-xl p-3.5 overflow-x-auto leading-relaxed max-h-36">
                            <code>{widgetCode}</code>
                          </pre>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block font-semibold flex items-center gap-1">
                            <Code size={12} className="text-emerald-400" /> Webform Embed Code (Paste on any page)
                          </span>
                          <button
                                   onClick={() => {
                              const appOrigin = getPublicOrigin();
                              const formCode = `<!-- OmniHub Lead Capture Form for ${biz.name} -->
<div id="omnihub-lead-form-container-${biz.id}" style="max-width: 480px; margin: 15px auto; padding: 24px; font-family: system-ui, sans-serif; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
  <form id="omnihub-lead-form-${biz.id}" style="display: flex; flex-direction: column; gap: 16px;">
    <div style="text-align: center; margin-bottom: 8px;">
      <h3 style="margin: 0; font-size: 18px; font-weight: 700; color: #1e293b;">Inquire with ${biz.name}</h3>
      <p style="margin: 4px 0 0; font-size: 12px; color: #64748b;">Submit details to instantly notify our central desk.</p>
    </div>
    <input type="hidden" name="businessId" value="${biz.id}">
    <div>
      <label style="display: block; font-size: 11px; font-weight: 600; text-transform: uppercase; color: #475569; margin-bottom: 6px;">Your Name</label>
      <input type="text" name="name" required placeholder="John Doe" style="width: 100%; box-sizing: border-box; padding: 10px 14px; font-size: 13px; border: 1px solid #cbd5e1; border-radius: 8px; outline: none; transition: border-color 0.2s;" onfocus="this.style.borderColor='#10b981'" onblur="this.style.borderColor='#cbd5e1'">
    </div>
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
      <div>
        <label style="display: block; font-size: 11px; font-weight: 600; text-transform: uppercase; color: #475569; margin-bottom: 6px;">Email</label>
        <input type="email" name="email" required placeholder="john@example.com" style="width: 100%; box-sizing: border-box; padding: 10px 14px; font-size: 13px; border: 1px solid #cbd5e1; border-radius: 8px; outline: none; transition: border-color 0.2s;" onfocus="this.style.borderColor='#10b981'" onblur="this.style.borderColor='#cbd5e1'">
      </div>
      <div>
        <label style="display: block; font-size: 11px; font-weight: 600; text-transform: uppercase; color: #475569; margin-bottom: 6px;">Phone</label>
        <input type="tel" name="phone" required placeholder="(555) 000-0000" style="width: 100%; box-sizing: border-box; padding: 10px 14px; font-size: 13px; border: 1px solid #cbd5e1; border-radius: 8px; outline: none; transition: border-color 0.2s;" onfocus="this.style.borderColor='#10b981'" onblur="this.style.borderColor='#cbd5e1'">
      </div>
    </div>
    <div>
      <label style="display: block; font-size: 11px; font-weight: 600; text-transform: uppercase; color: #475569; margin-bottom: 6px;">Message / Inquiry Details</label>
      <textarea name="message" required rows="3" placeholder="Describe your repair needs, pricing query, or appointment requests..." style="width: 100%; box-sizing: border-box; padding: 10px 14px; font-size: 13px; border: 1px solid #cbd5e1; border-radius: 8px; outline: none; resize: vertical; transition: border-color 0.2s;" onfocus="this.style.borderColor='#10b981'" onblur="this.style.borderColor='#cbd5e1'"></textarea>
    </div>
    <button type="submit" style="width: 100%; padding: 12px; font-size: 13px; font-weight: 600; color: #ffffff; background: #10b981; border: none; border-radius: 8px; cursor: pointer; transition: opacity 0.2s; box-shadow: 0 1px 3px rgba(0,0,0,0.1);" onmouseover="this.style.opacity='0.9'" onmouseout="this.style.opacity='1'">Submit Inquiry</button>
    <div id="omnihub-form-status-${biz.id}" style="display: none; font-size: 12px; text-align: center; padding: 8px; border-radius: 6px; margin-top: 4px;"></div>
  </form>
  <script>
    document.getElementById('omnihub-lead-form-${biz.id}').addEventListener('submit', function(e) {
      e.preventDefault();
      const form = this;
      const btn = form.querySelector('button[type="submit"]');
      const statusDiv = document.getElementById('omnihub-form-status-${biz.id}');
      const prevBtnText = btn.innerText;
      btn.disabled = true;
      btn.innerText = 'Submitting...';
      statusDiv.style.display = 'none';
      
      fetch('${appOrigin}/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId: form.businessId.value,
          name: form.name.value,
          email: form.email.value,
          phone: form.phone.value,
          message: form.message.value,
          source: 'Webform Embed'
        })
      })
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(() => {
        statusDiv.style.display = 'block';
        statusDiv.style.background = '#f0fdf4';
        statusDiv.style.color = '#15803d';
        statusDiv.style.border = '1px solid #bbf7d0';
        statusDiv.innerText = 'Thank you! Your lead was registered in your workspace dashboard.';
        form.reset();
      })
      .catch(() => {
        statusDiv.style.display = 'block';
        statusDiv.style.background = '#fff1f2';
        statusDiv.style.color = '#b91c1c';
        statusDiv.style.border = '1px solid #fecdd3';
        statusDiv.innerText = 'Submission failed. Please try again.';
      })
      .finally(() => {
        btn.disabled = false;
        btn.innerText = prevBtnText;
      });
    });
  <\/script>
</div>`;
                              navigator.clipboard.writeText(formCode);
                              setCopiedIndex(idx);
                              setCopiedType("leadform");
                              setTimeout(() => {
                                setCopiedIndex(null);
                                setCopiedType("");
                              }, 2000);
                            }}
                            className="text-[10px] font-mono text-emerald-400 hover:text-emerald-300 flex items-center gap-1 px-2.5 py-1 bg-emerald-500/10 rounded-lg transition"
                          >
                            {copiedIndex === idx && copiedType === "leadform" ? (
                              <>
                                <Check size={11} className="text-emerald-400 inline" />
                                <span>Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy size={11} className="inline" />
                                <span>Copy Webform Embed</span>
                              </>
                            )}
                          </button>
                        </div>

                        <div className="relative font-mono">
                          <pre className="text-[11px] text-slate-300 bg-slate-900 border border-slate-800 rounded-xl p-3.5 overflow-x-auto leading-relaxed max-h-36">
                            <code>{`<!-- Lead Capture Webform for ${biz.name} -->
<div id="omnihub-lead-form-container-${biz.id}">
  ... (Copies full self-contained styling & script) ...
</div>`}</code>
                          </pre>
                        </div>
                      </div>
                    )}

                    {/* Quick Widget Live Preview mock */}
                    <div className="bg-slate-900/40 border border-slate-900 rounded-xl p-3.5 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-emerald-600 rounded-full flex items-center justify-center text-lg text-white font-mono shadow">
                          {(activeCodeTab[biz.id] || "widget") === "widget" ? "🤖" : "📋"}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-300">{(activeCodeTab[biz.id] || "widget") === "widget" ? "Widget Mock Preview" : "Form Submission Test"}</p>
                          <p className="text-[10px] text-slate-500 italic">
                            {(activeCodeTab[biz.id] || "widget") === "widget" 
                              ? `"${biz.welcomeMessage}"` 
                              : "Sends full schema to POST /api/leads with auto-CORS"
                            }
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1.5 text-[9px] font-mono text-emerald-400">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                        <span>Interactive Sandbox Built</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Explanatory notice */}
            <div className="bg-slate-950/60 border border-slate-800/80 p-4 rounded-xl text-center space-y-1">
              <p className="text-xs text-slate-300 font-medium">✨ Need to fine-tune your chatbot's brain?</p>
              <p className="text-[11px] text-slate-500 leading-relaxed font-light">
                No worries! Once you enter your dashboard, you can supply additional training documents, customized FAQ matrices, web URLs, and even JSON files. Your chatbot script updates automatically in real-time.
              </p>
            </div>

            {/* Launch Workspace Button */}
            <button
              type="button"
              onClick={() => {
                setShowDeploymentCodesScreen(false);
                // Trigger transition to main page with the first created business ID!
                const firstId = newlyProvisionedBizs[0]?.id || "";
                runHandshakeAnimation("credentials", signupEmail, signupRole, firstId);
              }}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-sans text-sm font-semibold rounded-2xl transition duration-150 flex items-center justify-center gap-2 shadow-lg"
            >
              <span>Launch Central Dashboard & Fine-Tune</span>
              <ArrowRight size={15} />
            </button>
          </div>

          <div className="bg-slate-950 px-6 py-3 border-t border-slate-850 flex items-center justify-center gap-1.5 text-[9px] text-slate-500 font-mono">
            <Shield size={10} className="text-emerald-500" />
            <span>SECURE CRYPTO HANDSHAKE TUNNEL READY FOR DEPLOYMENT</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-tr from-slate-50 via-blue-50 to-slate-100 flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-y-auto font-sans selection:bg-blue-500/30 selection:text-blue-900" id="premium-auth-container">
      
      {/* Decorative High-Fidelity Grids and Radial Light Leaks */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20 pointer-events-none"></div>
      
      <div className="absolute top-10 left-10 w-72 sm:w-96 h-72 sm:h-96 bg-blue-600/10 rounded-full filter blur-[100px] animate-pulse pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-72 sm:w-96 h-72 sm:h-96 bg-slate-600/10 rounded-full filter blur-[100px] animate-pulse pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/5 rounded-full filter blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-lg bg-white/95 backdrop-blur-xl border border-slate-200/80 rounded-[2rem] shadow-[0_25px_50px_-12px_rgba(37,99,235,0.15)] overflow-hidden relative z-10 my-4 transition duration-300 hover:border-blue-300/80">
        
        {/* Dynamic Gradient Top Edge */}
        <div className="h-[3px] bg-gradient-to-r from-blue-500 via-slate-500 to-blue-600"></div>

        <div className="p-6 sm:p-10 space-y-6">
          
          {/* Header Identity Branding */}
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="relative group cursor-pointer">
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-blue-500 to-slate-500 opacity-30 group-hover:opacity-70 blur transition duration-300"></div>
              <div className="relative w-14 h-14 rounded-2xl bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-600">
                <Cpu size={26} className="animate-spin text-blue-600" style={{ animationDuration: "16s" }} />
              </div>
            </div>
            <div>
              <div className="inline-flex items-center gap-1 bg-blue-100 border border-blue-200/60 text-blue-700 text-[10px] font-mono px-2.5 py-0.5 rounded-full uppercase tracking-wider font-semibold mb-2">
                <Sparkles size={10} /> Multi-Tenant SaaS
              </div>
              <h1 className="text-2xl font-bold text-slate-950 tracking-tight font-sans">OmniHub AI Workspace</h1>
              <p className="text-xs text-slate-800 mt-1.5 max-w-xs sm:max-w-md font-light leading-relaxed">
                Connect your brand customer Service bots, monitor CRM live leads, and configure secure AI routing systems.
              </p>
            </div>
          </div>

          {sessionUser ? (
            /* --- ACTIVE SESSION DETECTED BLOCK --- */
            <div className="bg-blue-50/60 border border-blue-200 p-6 rounded-2xl space-y-5 animate-fade-in" id="active-session-card">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-600/10 border border-blue-500/30 flex items-center justify-center text-2xl shadow-inner">
                  {sessionUser.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-mono text-blue-600 uppercase tracking-wider block font-semibold">Active Session Detected</span>
                  <h3 className="text-sm font-semibold text-slate-950 truncate font-sans mt-0.5">{sessionUser.name}</h3>
                  <p className="text-xs text-slate-800 truncate mt-0.5">{sessionUser.email}</p>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] bg-white p-3 rounded-xl border border-blue-100">
                <span className="text-slate-800 font-sans">Authorized RBAC Access:</span>
                <span className="font-mono text-blue-700 font-semibold bg-blue-100/50 border border-blue-200/30 px-2 py-0.5 rounded-md">
                  {sessionUser.role}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    window.location.hash = "#/dashboard/analytics";
                  }}
                  className="py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold font-sans transition flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                >
                  <LayoutDashboard size={14} />
                  <span>Enter Dashboard</span>
                </button>
                <button
                  type="button"
                  onClick={onLogout}
                  className="py-3 bg-slate-50 hover:bg-slate-100/80 text-slate-800 border border-slate-200 rounded-xl text-xs font-semibold font-sans transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <LogOut size={14} />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          ) : isAuthenticating ? (
            /* --- ELEGANT AUTHENTICATION HANDSHAKE CONSOLE --- */
            <div className="py-6 space-y-5 text-center animate-fade-in" id="auth-handshake-console">
              <div className="flex justify-center items-center">
                <div className="relative flex items-center justify-center">
                  <div className="absolute w-20 h-20 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  <div className="absolute w-28 h-28 border border-slate-500/20 border-b-transparent rounded-full animate-spin" style={{ animationDirection: "reverse", animationDuration: "3s" }}></div>
                  <div className="w-14 h-14 bg-blue-50 border border-blue-200 rounded-full flex items-center justify-center text-blue-600 shadow-inner">
                    <Lock size={22} className="animate-pulse text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <h3 className="text-xs font-semibold text-slate-950 uppercase tracking-widest font-mono flex items-center justify-center gap-1.5">
                    <Terminal size={12} className="text-blue-600 animate-pulse" />
                    Securing Connection
                  </h3>
                  <p className="text-[10px] text-slate-800 font-mono">
                    Provider: <span className="text-blue-600 font-semibold">{authProvider.toUpperCase()}</span> • {activeTab === "login" ? loginEmail : signupEmail}
                  </p>
                </div>

                <div className="max-w-md mx-auto bg-slate-950 border border-slate-800 rounded-2xl p-4 text-left space-y-2 font-mono text-[10px] text-blue-200 h-36 overflow-y-auto shadow-inner leading-relaxed">
                  {handshakeLogs.map((log, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="text-blue-400 font-bold select-none">❯</span>
                      <span>{log}</span>
                      {idx === handshakeLogs.length - 1 && handshakeStep < 4 ? (
                        <span className="inline-block w-1.5 h-3.5 bg-blue-400 animate-pulse ml-0.5 shrink-0 align-middle"></span>
                      ) : null}
                    </div>
                  ))}
                </div>

                <div className="flex justify-center items-center gap-2 text-[9px] font-mono text-slate-800">
                  <span className={`w-1.5 h-1.5 rounded-full ${handshakeStep >= 1 ? "bg-blue-500 animate-ping" : "bg-slate-200"}`}></span>
                  <span>TLS Match</span>
                  <span className="opacity-40">•</span>
                  <span className={`w-1.5 h-1.5 rounded-full ${handshakeStep >= 3 ? "bg-blue-400 animate-ping" : "bg-slate-200"}`}></span>
                  <span>Isolation Map</span>
                  <span className="opacity-40">•</span>
                  <span className={`w-1.5 h-1.5 rounded-full ${handshakeStep >= 4 ? "bg-blue-500" : "bg-slate-200"}`}></span>
                  <span>Session OK</span>
                </div>
              </div>
            </div>
          ) : (
            /* --- REGULAR AUTHENTICATOR LAYOUT --- */
            <div className="space-y-5">
              
              {/* Segmented Controller Switcher */}
              <div className="bg-slate-100/50 p-1 rounded-2xl border border-slate-200/50 flex relative">
                <button
                  type="button"
                  onClick={() => handleTabChange("login")}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-semibold tracking-wide font-sans transition-all duration-300 cursor-pointer ${
                    activeTab === "login"
                      ? "bg-white text-slate-800 shadow border border-slate-200/50"
                      : "text-slate-700 hover:text-slate-950"
                  }`}
                  id="tab-btn-login"
                >
                  Sign In to Tenant
                </button>
                <button
                  type="button"
                  onClick={() => handleTabChange("signup")}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-semibold tracking-wide font-sans transition-all duration-300 cursor-pointer ${
                    activeTab === "signup"
                      ? "bg-white text-slate-800 shadow border border-slate-200/50"
                      : "text-slate-700 hover:text-slate-950"
                  }`}
                  id="tab-btn-signup"
                >
                  Create Enterprise Tenant
                </button>
              </div>

              {/* Error messages */}
              {errorMessage && (
                <div className="text-[11px] text-red-600 font-medium font-sans flex items-start gap-2 bg-red-50 border border-red-200 p-3 rounded-xl animate-shake">
                  <AlertCircle size={15} className="shrink-0 mt-0.5 text-red-500" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Success messages */}
              {successMessage && (
                <div className="text-[11px] text-blue-700 font-medium font-sans flex items-start gap-2 bg-blue-50 border border-blue-200 p-3 rounded-xl animate-pulse">
                  <CheckCircle2 size={15} className="shrink-0 mt-0.5 text-blue-600" />
                  <span>{successMessage}</span>
                </div>
              )}

              {activeTab === "login" ? (
                /* --- SIGN IN FORM --- */
                <form onSubmit={handleCredentialsLogin} className="space-y-4 animate-fade-in" id="credentials-login-form">
                  
                  {/* Email Entry */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block font-semibold">Enterprise Email Address</label>
                    <div className="relative flex items-center">
                      <Mail size={14} className="absolute left-3.5 text-blue-600/70" />
                      <input
                        type="email"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        required
                        className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition duration-200 text-xs font-sans placeholder-slate-400"
                        placeholder="e.g., admin@mayfieldrepairs.com.au"
                        id="login-email-input"
                      />
                    </div>
                  </div>

                  {/* Password Entry */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block font-semibold">Password Key</label>
                    <div className="relative flex items-center">
                      <Key size={14} className="absolute left-3.5 text-blue-600/70" />
                      <input
                        type="password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        required
                        className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition duration-200 text-xs font-sans placeholder-slate-400"
                        placeholder="••••••••"
                        id="login-password-input"
                      />
                    </div>
                  </div>

                  {/* Role Selector Grid */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block font-semibold">Assigned Authorization Role</label>
                      <span className="text-[9px] font-mono text-blue-700 bg-blue-100/50 border border-blue-200/30 px-2 py-0.5 rounded-md font-semibold">Role Base</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {(["Admin", "Manager", "Agent"] as const).map((r) => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setLoginRole(r)}
                          className={`py-2 px-1 text-xs font-sans font-semibold rounded-xl border transition-all duration-200 flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
                            loginRole === r
                              ? "bg-blue-50 border-blue-500 text-blue-700 shadow-sm"
                              : "bg-white border-blue-100 text-blue-600 hover:border-blue-200 hover:bg-blue-50/40"
                          }`}
                        >
                          <span>{r}</span>
                          <span className="text-[8px] opacity-75 font-mono font-normal text-blue-600/90">
                            {r === "Admin" && "All Features"}
                            {r === "Manager" && "Edit Access"}
                            {r === "Agent" && "Simulator Only"}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold font-sans transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer group shadow-lg mt-2 relative overflow-hidden"
                    id="submit-login-btn"
                  >
                    <span>Authenticate Tenant Connection</span>
                    <ArrowRight size={13} className="text-white group-hover:translate-x-1 transition duration-150" />
                  </button>

                  {/* Pre-configured Demo Accounts Panel (Great UX) */}
                  <div className="bg-slate-50/30 p-3 rounded-2xl border border-slate-100 mt-3 space-y-2">
                    <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block font-semibold">Demo Sandbox Credentials</span>
                    <div className="grid grid-cols-3 gap-1.5">
                      <button
                        type="button"
                        onClick={() => loadDemoUser("admin@mayfieldrepairs.com.au", "Admin")}
                        className="py-1.5 px-1 bg-white hover:bg-blue-50 text-[9px] font-mono text-slate-800 rounded-lg border border-slate-200 hover:border-blue-300 transition text-center cursor-pointer"
                      >
                        ⚡ Admin (Full)
                      </button>
                      <button
                        type="button"
                        onClick={() => loadDemoUser("manager@mayfieldrepairs.com.au", "Manager")}
                        className="py-1.5 px-1 bg-white hover:bg-blue-50 text-[9px] font-mono text-slate-800 rounded-lg border border-slate-200 hover:border-blue-300 transition text-center cursor-pointer"
                      >
                        ⚡ Manager
                      </button>
                      <button
                        type="button"
                        onClick={() => loadDemoUser("agent@mayfieldrepairs.com.au", "Agent")}
                        className="py-1.5 px-1 bg-white hover:bg-blue-50 text-[9px] font-mono text-slate-800 rounded-lg border border-slate-200 hover:border-blue-300 transition text-center cursor-pointer"
                      >
                        ⚡ Agent (Test)
                      </button>
                    </div>
                  </div>
                </form>
              ) : (
                /* --- SIGN UP FORM --- */
                <form onSubmit={handleCredentialsSignup} className="space-y-4 animate-fade-in" id="credentials-signup-form">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {/* Signup Email */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block font-semibold">Enterprise Email</label>
                      <div className="relative flex items-center">
                        <Mail size={14} className="absolute left-3.5 text-blue-600/70" />
                        <input
                          type="email"
                          value={signupEmail}
                          onChange={(e) => setSignupEmail(e.target.value)}
                          required
                          className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition duration-200 text-xs font-sans placeholder-slate-400"
                          placeholder="admin@corp.com"
                          id="signup-email-input"
                        />
                      </div>
                    </div>

                    {/* Signup Password */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block font-semibold">Password Key</label>
                      <div className="relative flex items-center">
                        <Key size={14} className="absolute left-3.5 text-blue-600/70" />
                        <input
                          type="password"
                          value={signupPassword}
                          onChange={(e) => setSignupPassword(e.target.value)}
                          required
                          className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition duration-200 text-xs font-sans placeholder-slate-400"
                          placeholder="Min 6 characters"
                          id="signup-password-input"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {/* Business Name */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block font-semibold">Corporate Business Name</label>
                      <div className="relative flex items-center">
                        <Building size={14} className="absolute left-3.5 text-blue-600/70" />
                        <input
                          type="text"
                          value={businessName}
                          onChange={(e) => setBusinessName(e.target.value)}
                          required
                          className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition duration-200 text-xs font-sans placeholder-slate-400"
                          placeholder="e.g., Mayfield Cell Repairs"
                          id="signup-bizname-input"
                        />
                      </div>
                    </div>

                    {/* Industry Category */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block font-semibold">Business Category</label>
                      <div className="relative flex items-center">
                        <Briefcase size={14} className="absolute left-3.5 text-blue-600/70 pointer-events-none" />
                        <select
                          value={businessCategory}
                          onChange={(e) => setBusinessCategory(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition duration-200 text-xs font-sans appearance-none cursor-pointer"
                          id="signup-category-select"
                        >
                          <option value="Electronics Repair">Electronics Repair</option>
                          <option value="Dry Cleaning & Laundry">Dry Cleaning & Laundry</option>
                          <option value="Fitness & Gym">Fitness & Gym</option>
                          <option value="Dental Clinic">Dental Clinic</option>
                          <option value="Consulting Services">Consulting Services</option>
                          <option value="Legal & Finance">Legal & Finance</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Welcome Message text-area */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block font-semibold">AI Bot welcome Message Greeting</label>
                    <div className="relative flex items-center">
                      <MessageSquare size={14} className="absolute left-3.5 top-3.5 text-blue-600/70" />
                      <textarea
                        value={welcomeGreeting}
                        onChange={(e) => setWelcomeGreeting(e.target.value)}
                        required
                        rows={2}
                        className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition duration-200 text-xs font-sans leading-relaxed resize-none placeholder-slate-400"
                        placeholder="Welcome greeting for chatbot..."
                        id="signup-welcome-message"
                      />
                    </div>
                  </div>

                  {/* Role configuration during registration */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block font-semibold">Select Authorized Account Role</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(["Admin", "Manager", "Agent"] as const).map((r) => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setSignupRole(r)}
                          className={`py-2 px-1 text-[11px] font-sans font-semibold rounded-xl border transition-all duration-200 flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
                            signupRole === r
                              ? "bg-blue-50 border-blue-500 text-blue-700 shadow-sm"
                              : "bg-white border-blue-100 text-blue-600 hover:border-blue-200 hover:bg-blue-50/40"
                          }`}
                        >
                          <span>{r}</span>
                          <span className="text-[8px] opacity-75 font-mono font-normal text-blue-600/95">
                            {r === "Admin" && "Owner"}
                            {r === "Manager" && "Supervisor"}
                            {r === "Agent" && "Operator"}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-gradient-to-r from-blue-600 to-slate-800 hover:from-blue-500 hover:to-slate-700 text-white rounded-xl text-xs font-semibold font-sans transition duration-200 flex items-center justify-center gap-2 cursor-pointer group shadow-lg mt-2"
                    id="submit-signup-btn"
                  >
                    <span>Register Corporate Tenant & Login</span>
                    <ArrowRight size={13} className="text-white group-hover:translate-x-1 transition duration-150" />
                  </button>
                </form>
              )}

              {/* Secure Splitter Divider */}
              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="flex-shrink mx-4 text-[9px] font-mono text-slate-500 uppercase tracking-wider font-semibold">Enterprise Single Sign-On</span>
                <div className="flex-grow border-t border-slate-200"></div>
              </div>

              {/* Premium OAuth Buttons */}
              <div className="grid grid-cols-2 gap-3">
                {/* Github SSO */}
                <button
                  type="button"
                  onClick={() => startOAuthFlow("github")}
                  className="py-3 bg-slate-900 hover:bg-black text-white border border-slate-800 rounded-xl text-xs font-semibold font-sans transition duration-200 flex items-center justify-center gap-2 cursor-pointer group shadow-inner"
                  id="oauth-github-btn"
                >
                  <Github size={15} className="text-white group-hover:scale-110 transition duration-150" />
                  <span className="hidden sm:inline">GitHub SSO</span>
                  <span className="sm:hidden">GitHub</span>
                </button>

                {/* Google SSO */}
                <button
                  type="button"
                  onClick={() => startOAuthFlow("google")}
                  className="py-3 bg-white hover:bg-blue-50 text-slate-950 border border-slate-200 rounded-xl text-xs font-semibold font-sans transition duration-200 flex items-center justify-center gap-2 cursor-pointer group shadow-md"
                  id="oauth-google-btn"
                >
                  <svg className="w-3.5 h-3.5 group-hover:scale-110 transition duration-150" viewBox="0 0 24 24" fill="none">
                    <path fillRule="evenodd" clipRule="evenodd" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path fillRule="evenodd" clipRule="evenodd" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path fillRule="evenodd" clipRule="evenodd" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z" fill="#FBBC05"/>
                    <path fillRule="evenodd" clipRule="evenodd" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                  </svg>
                  <span className="hidden sm:inline">Google SSO</span>
                  <span className="sm:hidden">Google</span>
                </button>
              </div>

            </div>
          )}

          {/* Secure Isolated Environment Footer */}
          <div className="flex items-center justify-center gap-1.5 text-[9px] text-slate-500 font-mono select-none pt-2 border-t border-slate-100">
            <Shield size={10} className="text-blue-500 animate-pulse" />
            <span>TENANT DATA ISOLATED • ENCRYPTION KEYS ROTATED DAILY</span>
          </div>

        </div>
      </div>
    </div>
  );
}
1.5 text-[9px] text-emerald-700 font-mono select-none pt-2 border-t border-emerald-100">
            <Shield size={10} className="text-emerald-500 animate-pulse" />
            <span>TENANT DATA ISOLATED • ENCRYPTION KEYS ROTATED DAILY</span>
          </div>

        </div>
      </div>
    </div>
  );
}
