import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building2, 
  Sparkles, 
  Database, 
  MessageSquare, 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft, 
  Copy,
  Check
} from 'lucide-react';

interface OnboardingState {
  step: number;
  businessName: string;
  category: string;
  persona: 'Friendly' | 'Professional' | 'Energetic';
  knowledgeSource: 'FAQ' | 'URL';
  knowledgeValue: string;
  whatsappId: string;
  businessId: string;
}

export const OnboardingWizard: React.FC = () => {
  const [state, setState] = useState<OnboardingState>({
    step: 1,
    businessName: '',
    category: '',
    persona: 'Friendly',
    knowledgeSource: 'FAQ',
    knowledgeValue: '',
    whatsappId: '1194675237059356',
    businessId: `biz-${Math.floor(Math.random() * 10000)}`
  });

  const [copied, setCopied] = useState(false);

  const nextStep = () => {
    const next = state.step + 1;
    setState(prev => ({ ...prev, step: next }));
    // Track onboarding progression
    fetch('/api/logs/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'onboarding_step_completed',
        step: state.step,
        businessName: state.businessName,
        businessId: state.businessId
      })
    }).catch(console.error);
  };
  const prevStep = () => setState(prev => ({ ...prev, step: prev.step - 1 }));

  const copySnippet = () => {
    const snippet = `<script src="/api/snippet/${state.businessId}"></script>`;
    navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const steps = [
    { id: 1, title: 'Identity', icon: Building2 },
    { id: 2, title: 'Persona', icon: Sparkles },
    { id: 3, title: 'Knowledge', icon: Database },
    { id: 4, title: 'WhatsApp', icon: MessageSquare },
    { id: 5, title: 'Review', icon: CheckCircle2 }
  ];

  const renderStep = () => {
    switch (state.step) {
      case 1:
        return (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Business Identity</h2>
            <p className="text-gray-500">Tell us about your business to get started.</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Business Name</label>
                <input 
                  type="text" 
                  value={state.businessName}
                  onChange={e => setState(prev => ({ ...prev, businessName: e.target.value }))}
                  className="w-full p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  placeholder="e.g. Mayfield Cellphone Repairs"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Industry Category</label>
                <select 
                  value={state.category}
                  onChange={e => setState(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                >
                  <option value="">Select Category</option>
                  <option value="Repair">Device Repairs</option>
                  <option value="Retail">Retail & E-commerce</option>
                  <option value="SaaS">SaaS & Software</option>
                  <option value="Other">Other Services</option>
                </select>
              </div>
            </div>
          </motion.div>
        );
      case 2:
        return (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Gemini Persona</h2>
            <p className="text-gray-500">Choose how your AI assistant should sound.</p>
            <div className="grid grid-cols-1 gap-3">
              {(['Friendly', 'Professional', 'Energetic'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setState(prev => ({ ...prev, persona: p }))}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    state.persona === p 
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' 
                    : 'border-gray-100 dark:border-gray-800 hover:border-indigo-200'
                  }`}
                >
                  <div className="font-semibold text-gray-800 dark:text-white">{p}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {p === 'Friendly' && 'Approachable, warm, and helpful.'}
                    {p === 'Professional' && 'Concise, efficient, and authoritative.'}
                    {p === 'Energetic' && 'Enthusiastic, proactive, and positive.'}
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        );
      case 3:
        return (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Knowledge Ingestion</h2>
            <p className="text-gray-500">Feed your bot with data it can learn from.</p>
            <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
              {(['FAQ', 'URL'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setState(prev => ({ ...prev, knowledgeSource: s }))}
                  className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
                    state.knowledgeSource === s ? 'bg-white dark:bg-gray-700 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-gray-500'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
            <textarea 
              value={state.knowledgeValue}
              onChange={e => setState(prev => ({ ...prev, knowledgeValue: e.target.value }))}
              rows={4}
              className="w-full p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              placeholder={state.knowledgeSource === 'FAQ' ? "Paste your FAQ text here..." : "Enter documentation URL..."}
            />
          </motion.div>
        );
      case 4:
        return (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">WhatsApp Integration</h2>
            <p className="text-gray-500">Connect your business WhatsApp account.</p>
            <div className="bg-green-50 dark:bg-green-900/10 p-4 rounded-xl border border-green-100 dark:border-green-900/30 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white">
                <MessageSquare size={20} />
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold text-green-800 dark:text-green-400">WhatsApp Meta ID</div>
                <div className="text-xs text-green-600/80">Pre-configured for your account</div>
              </div>
            </div>
            <input 
              type="text" 
              readOnly
              value={state.whatsappId}
              className="w-full p-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-400 cursor-not-allowed"
            />
            <p className="text-[10px] text-gray-400 italic">This ID is linked to your developer sandbox for instant testing.</p>
          </motion.div>
        );
      case 5:
        return (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Review & Snippet</h2>
            <div className="bg-indigo-600 rounded-2xl p-6 text-white shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-white/20 rounded-lg">
                  <CheckCircle2 size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-lg">{state.businessName || 'Your AI Bot'}</h3>
                  <p className="text-white/70 text-sm">Ready for deployment</p>
                </div>
              </div>
              <div className="space-y-2 text-sm text-white/90">
                <div className="flex justify-between">
                  <span>Persona:</span>
                  <span className="font-medium">{state.persona}</span>
                </div>
                <div className="flex justify-between">
                  <span>Knowledge:</span>
                  <span className="font-medium">{state.knowledgeSource} ({state.knowledgeValue ? 'Loaded' : 'None'})</span>
                </div>
                <div className="flex justify-between">
                  <span>WhatsApp:</span>
                  <span className="font-medium">Connected</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Embed Snippet</label>
              <div className="relative group">
                <pre className="bg-gray-900 text-indigo-300 p-4 rounded-xl text-xs overflow-x-auto border border-gray-800">
                  {`<script src="/api/snippet/${state.businessId}"></script>`}
                </pre>
                <button 
                  onClick={copySnippet}
                  className="absolute top-2 right-2 p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-all backdrop-blur-sm"
                >
                  {copied ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
                </button>
              </div>
            </div>
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800">
      <div className="h-2 bg-gray-100 dark:bg-gray-800">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${(state.step / 5) * 100}%` }}
          className="h-full bg-indigo-500"
        />
      </div>
      
      <div className="p-8">
        <div className="flex justify-between mb-8">
          {steps.map((s) => (
            <div 
              key={s.id} 
              className={`flex flex-col items-center gap-1 transition-all ${
                state.step >= s.id ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-300 dark:text-gray-700'
              }`}
            >
              <div className={`p-2 rounded-full ${
                state.step >= s.id ? 'bg-indigo-50 dark:bg-indigo-900/30 ring-2 ring-indigo-500/20' : 'bg-gray-50 dark:bg-gray-800'
              }`}>
                <s.icon size={18} />
              </div>
              <span className="text-[10px] font-bold uppercase">{s.title}</span>
            </div>
          ))}
        </div>

        <div className="min-h-[300px]">
          <AnimatePresence mode="wait">
            {renderStep()}
          </AnimatePresence>
        </div>

        <div className="flex justify-between mt-8 pt-6 border-t border-gray-100 dark:border-gray-800">
          <button
            disabled={state.step === 1}
            onClick={prevStep}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
              state.step === 1 ? 'opacity-0' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
          >
            <ChevronLeft size={20} />
            Back
          </button>
          
          <button
            onClick={state.step === 5 ? () => alert('Dashboard Initialized!') : nextStep}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-xl font-semibold shadow-lg shadow-indigo-500/30 transition-all active:scale-95"
          >
            {state.step === 5 ? 'Launch' : 'Continue'}
            {state.step < 5 && <ChevronRight size={20} />}
          </button>
        </div>
      </div>
    </div>
  );
};
