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
    { id: 2, title: 'Knowledge', icon: Database },
    { id: 3, title: 'Launch', icon: CheckCircle2 }
  ];

  const renderStep = () => {
    switch (state.step) {
      case 1:
        return (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <h2 className="text-2xl font-bold text-gray-800">1. Your Business</h2>
            <p className="text-gray-500">What business are we setting up today?</p>
            <div className="space-y-4">
              <input 
                type="text" 
                value={state.businessName}
                onChange={e => setState(prev => ({ ...prev, businessName: e.target.value }))}
                className="w-full p-4 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="Business Name (e.g. SelfRepairKit)"
              />
              <select 
                value={state.category}
                onChange={e => setState(prev => ({ ...prev, category: e.target.value }))}
                className="w-full p-4 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="">Select Industry</option>
                <option value="Retail">E-commerce / Retail</option>
                <option value="Repair">Local Service / Repair</option>
                <option value="SaaS">Software / SaaS</option>
              </select>
            </div>
          </motion.div>
        );
      case 2:
        return (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <h2 className="text-2xl font-bold text-gray-800">2. Train AI</h2>
            <p className="text-gray-500">Paste a URL or drop content. AI will learn your business instantly.</p>
            <div className="flex gap-2 p-1 bg-gray-100 rounded-xl">
              {['FAQ', 'URL'].map((s) => (
                <button
                  key={s}
                  onClick={() => setState(prev => ({ ...prev, knowledgeSource: s as any }))}
                  className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
                    state.knowledgeSource === s ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500'
                  }`}
                >
                  {s === 'FAQ' ? 'Manual Text' : 'Website URL'}
                </button>
              ))}
            </div>
            <textarea 
              value={state.knowledgeValue}
              onChange={e => setState(prev => ({ ...prev, knowledgeValue: e.target.value }))}
              rows={5}
              className="w-full p-4 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder={state.knowledgeSource === 'FAQ' ? "Paste details, policies, or FAQs..." : "https://selfrepairkit.com.au"}
            />
          </motion.div>
        );
      case 3:
        return (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="text-center">
              <div className="inline-flex p-3 bg-green-100 text-green-600 rounded-full mb-2">
                <CheckCircle2 size={32} />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">AI is Ready!</h2>
              <p className="text-gray-500">Copy these codes to your site to start talking to customers.</p>
            </div>

            <div className="space-y-4 text-left">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">1. Chatbot Widget</label>
                <div className="relative mt-1">
                  <pre className="bg-slate-900 text-indigo-300 p-3 rounded-xl text-[10px] overflow-x-auto border border-slate-800">
                    {`<script src="/api/snippet/${state.businessId}"></script>`}
                  </pre>
                  <button onClick={() => copyToClipboard(`<script src="/api/snippet/${state.businessId}"></script>`)} className="absolute top-2 right-2 text-white/50 hover:text-white"><Copy size={14}/></button>
                </div>
              </div>
              
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">2. Lead Capture Webform</label>
                <div className="relative mt-1">
                  <pre className="bg-slate-900 text-emerald-300 p-3 rounded-xl text-[10px] overflow-x-auto border border-slate-800">
                    {`<iframe src="/api/webform/${state.businessId}" width="100%" height="500"></iframe>`}
                  </pre>
                  <button onClick={() => copyToClipboard(`<iframe src="/api/webform/${state.businessId}" width="100%" height="500"></iframe>`)} className="absolute top-2 right-2 text-white/50 hover:text-white"><Copy size={14}/></button>
                </div>
              </div>
            </div>
          </motion.div>
        );
      default:
        return null;
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLaunch = async () => {
    try {
      // 1. Create the business profile in Firestore
      const res = await fetch('/api/businesses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: state.businessId,
          name: state.businessName,
          category: state.category,
          welcomeMessage: `Hi! Welcome to ${state.businessName}. How can I help you today?`,
          whatsappPhoneNumber: state.whatsappId
        })
      });

      if (!res.ok) throw new Error('Failed to save business');

      // 2. Trigger AI training with the ingested knowledge
      await fetch('/api/chatbot/builder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId: state.businessId,
          userInput: state.knowledgeValue
        })
      });

      // 3. Complete onboarding
      window.location.reload(); // Refresh to show the new business in the dashboard
    } catch (e) {
      console.error(e);
      alert('Onboarding failed. Please check your Firestore connection.');
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800">
      <div className="h-2 bg-gray-100 dark:bg-gray-800">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${(state.step / 3) * 100}%` }}
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
            onClick={state.step === 3 ? handleLaunch : nextStep}
            className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white px-6 py-2 rounded-xl font-semibold shadow-lg shadow-blue-500/30 transition-all active:scale-95"
          >
            {state.step === 3 ? 'Launch' : 'Continue'}
            {state.step < 3 && <ChevronRight size={20} />}
          </button>
        </div>
      </div>
    </div>
  );
};


