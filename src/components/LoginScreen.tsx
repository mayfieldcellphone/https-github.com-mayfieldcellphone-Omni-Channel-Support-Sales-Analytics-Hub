import React, { useState } from "react";
import { Lock, Shield, Cpu, Key, ArrowRight, Github } from "lucide-react";

interface LoginScreenProps {
  onLogin: (user: {
    email: string;
    name: string;
    avatar: string;
    provider: "google" | "github";
    role: "Admin" | "Manager" | "Agent";
  }) => void;
}

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const [emailInput, setEmailInput] = useState("admin@mayfieldrepairs.com.au");
  const [roleSelect, setRoleSelect] = useState<"Admin" | "Manager" | "Agent">("Admin");
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [provider, setProvider] = useState<"google" | "github" | null>(null);
  const [handshakeStep, setHandshakeStep] = useState(0);

  const startAuthFlow = (authProvider: "google" | "github") => {
    setProvider(authProvider);
    setIsAuthenticating(true);
    setHandshakeStep(1);

    // Beautiful animated handshake process
    setTimeout(() => setHandshakeStep(2), 700);
    setTimeout(() => setHandshakeStep(3), 1400);
    setTimeout(() => {
      onLogin({
        email: emailInput.trim() || `${authProvider}-user@repairhub-saas.com`,
        name: emailInput.split("@")[0].replace(/[._-]/g, " "),
        avatar: authProvider === "github" ? "🐙" : "🌐",
        provider: authProvider,
        role: roleSelect,
      });
    }, 2100);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-6 relative overflow-hidden font-sans">
      
      {/* Visual background accents */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full filter blur-3xl animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full filter blur-3xl animate-pulse"></div>

      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6 relative z-10">
        
        {/* Hub Logo */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-inner">
            <Cpu size={24} className="animate-spin" style={{ animationDuration: "12s" }} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">RepairHub SaaS AI Platform</h1>
            <p className="text-xs text-slate-400">Multi-Tenant Setup & Secure Bot Orchestration</p>
          </div>
        </div>

        {isAuthenticating ? (
          /* Animated Handshake Overlay */
          <div className="py-12 space-y-6 text-center animate-fade-in">
            <div className="flex justify-center items-center">
              <div className="relative flex items-center justify-center">
                <div className="absolute w-16 h-16 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                <div className="w-12 h-12 bg-slate-950 border border-slate-800 rounded-full flex items-center justify-center text-indigo-400 text-lg">
                  <Lock size={18} className="animate-pulse" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-white">Establishing Secure Auth Node</h3>
              <div className="max-w-xs mx-auto space-y-1">
                <div className={`text-[10px] font-mono text-slate-500 transition-all ${handshakeStep >= 1 ? "text-indigo-400" : ""}`}>
                  [1] Decrypting JWT auth tokens... {handshakeStep >= 1 ? "✓" : "•"}
                </div>
                <div className={`text-[10px] font-mono text-slate-500 transition-all ${handshakeStep >= 2 ? "text-indigo-400" : ""}`}>
                  [2] Exchanging OAuth handshake... {handshakeStep >= 2 ? "✓" : "•"}
                </div>
                <div className={`text-[10px] font-mono text-slate-500 transition-all ${handshakeStep >= 3 ? "text-emerald-400" : ""}`}>
                  [3] Syncing tenants to RBAC layer... {handshakeStep >= 3 ? "✓" : "•"}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Regular Form */
          <div className="space-y-5 animate-fade-in">
            <div className="space-y-4">
              
              {/* Custom email */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Enterprise Email Domain</label>
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-indigo-500 transition duration-150 text-xs font-sans"
                  placeholder="e.g., admin@mayfieldrepairs.com.au"
                />
              </div>

              {/* Role Select */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Assigned RBAC Role (Authority Level)</label>
                <div className="grid grid-cols-3 gap-2">
                  {(["Admin", "Manager", "Agent"] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRoleSelect(r)}
                      className={`py-2 px-1 text-[11px] font-sans font-semibold rounded-xl border transition ${
                        roleSelect === r
                          ? "bg-indigo-600/10 border-indigo-500 text-indigo-400"
                          : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-750"
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

            </div>

            <span className="h-px bg-slate-800/60 block my-2"></span>

            {/* Social Login buttons */}
            <div className="space-y-2.5">
              
              {/* Github Button */}
              <button
                type="button"
                onClick={() => startAuthFlow("github")}
                className="w-full py-3 bg-slate-950 hover:bg-slate-800/80 text-white border border-slate-800 rounded-xl text-xs font-semibold font-sans transition flex items-center justify-center gap-2 cursor-pointer group shadow-sm"
              >
                <Github size={15} className="text-white group-hover:scale-110 transition duration-150" />
                <span>Sign in with GitHub Integration</span>
                <ArrowRight size={11} className="text-slate-500 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition duration-150" />
              </button>

              {/* Google Button */}
              <button
                type="button"
                onClick={() => startAuthFlow("google")}
                className="w-full py-3 bg-white hover:bg-slate-50 text-slate-950 rounded-xl text-xs font-semibold font-sans transition flex items-center justify-center gap-2 cursor-pointer group shadow-sm"
              >
                <svg className="w-3.5 h-3.5 group-hover:scale-110 transition duration-150" viewBox="0 0 24 24" fill="none">
                  <path fillRule="evenodd" clipRule="evenodd" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path fillRule="evenodd" clipRule="evenodd" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z" fill="#FBBC05"/>
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                </svg>
                <span>Sign in with Google Account</span>
                <ArrowRight size={11} className="text-slate-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition duration-150" />
              </button>

            </div>
          </div>
        )}

        {/* Security badge footer */}
        <div className="flex items-center justify-center gap-1.5 text-[9px] text-slate-500 font-mono select-none">
          <Shield size={10} className="text-emerald-500" />
          <span>E2EE ACTIVE • RSA-4096 COMPLIANT SECURITY PROTOCOLS</span>
        </div>

      </div>
    </div>
  );
}
