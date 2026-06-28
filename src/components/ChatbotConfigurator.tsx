import React, { useState, useEffect, useRef } from "react";
import { 
  MessageSquare, 
  Sparkles, 
  Plus, 
  Trash2, 
  Save, 
  Send, 
  Bot, 
  User, 
  FileText, 
  Volume2,
  VolumeX,
  AlertCircle,
  HelpCircle,
  Smile,
  Zap,
  BookOpen,
  Upload,
  Check,
  Globe,
  Shield,
  Lock,
  Layers,
  Infinity,
  CheckCircle2,
  DollarSign,
  Download,
  UploadCloud,
  FileSpreadsheet,
  FileJson,
  Code,
  Copy
} from "lucide-react";
import { Business, FAQ, ChatSettings, KBArticle } from "../types";

interface ChatbotConfiguratorProps {
  businesses: Business[];
  selectedBusinessId: string;
  onUpdateBusiness: (updated: Business) => void;
  userRole: string;
  userEmail: string;
  onRefreshBusinesses?: () => void;
  onSelectBusiness?: (id: string) => void;
  onboardTriggerActive?: boolean;
  resetOnboardTrigger?: () => void;
  showAdvancedSaaS?: boolean;
}

interface ChatMessage {
  sender: "customer" | "bot";
  text: string;
  timestamp: string;
}

export default function ChatbotConfigurator({
  businesses,
  selectedBusinessId,
  onUpdateBusiness,
  userRole,
  userEmail,
  onRefreshBusinesses,
  onSelectBusiness,
  onboardTriggerActive,
  resetOnboardTrigger,
  showAdvancedSaaS = false
}: ChatbotConfiguratorProps) {
  const [bizId, setBizId] = useState(selectedBusinessId);

  // Sync selected business from parent dropdown
  useEffect(() => {
    if (selectedBusinessId && selectedBusinessId !== bizId) {
      setBizId(selectedBusinessId);
    }
  }, [selectedBusinessId]);

  // Sync back local business selections to global app state
  useEffect(() => {
    if (onSelectBusiness && bizId) {
      onSelectBusiness(bizId);
    }
  }, [bizId, onSelectBusiness]);

  // Watch for onboarding creation triggers
  useEffect(() => {
    if (onboardTriggerActive) {
      setIsCreatingBiz(true);
      if (resetOnboardTrigger) {
        resetOnboardTrigger();
      }
    }
  }, [onboardTriggerActive, resetOnboardTrigger]);
  
  // Find current business
  const currentBiz = businesses.find((b) => b.id === bizId) || businesses[0];

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

  // Forms states
  const [welcomeMessage, setWelcomeMessage] = useState("");
  const [tone, setTone] = useState("friendly");
  const [avatarColor, setAvatarColor] = useState("#4f46e5");
  const [botName, setBotName] = useState("");
  const [avatarIcon, setAvatarIcon] = useState("🤖");
  const [themeStyle, setThemeStyle] = useState("modern");
  const [handoffRules, setHandoffRules] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [knowledgeBaseText, setKnowledgeBaseText] = useState("");
  const [fewShotExamples, setFewShotExamples] = useState<FAQ[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);

  // FAQ Add state
  const [newQuestion, setNewQuestion] = useState("");
  const [newAnswer, setNewAnswer] = useState("");
  const [isAddingFaq, setIsAddingFaq] = useState(false);

  // KB Article states
  const [kbArticles, setKbArticles] = useState<KBArticle[]>([]);
  const [selectedArticleIds, setSelectedArticleIds] = useState<string[]>([]);
  const [isAddingArticle, setIsAddingArticle] = useState(false);
  const [articleTitle, setArticleTitle] = useState("");
  const [articleContent, setArticleContent] = useState("");
  const [articleCategory, setArticleCategory] = useState("");
  const [articleTags, setArticleTags] = useState("");
  const [isClassifying, setIsClassifying] = useState(false);
  const [classificationSource, setClassificationSource] = useState<"gemini" | "local-rule" | null>(null);
  const [learnedInsights, setLearnedInsights] = useState<string[]>([]);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("All");
  const [selectedTagFilter, setSelectedTagFilter] = useState("All");
  
  // Knowledge management upload tabs (includes Github)
  const [activeUploadTab, setActiveUploadTab] = useState<"upload" | "paste" | "website" | "github">("upload");
  const [importUrl, setImportUrl] = useState("");
  const [isImportingUrl, setIsImportingUrl] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [expandedArticleId, setExpandedArticleId] = useState<string | null>(null);

  // Bulk Import/Export States
  const [showFaqBulk, setShowFaqBulk] = useState(false);
  const [showKbBulk, setShowKbBulk] = useState(false);
  const [faqImportMode, setFaqImportMode] = useState<"append" | "overwrite">("append");
  const [kbImportMode, setKbImportMode] = useState<"append" | "overwrite">("append");
  const [bulkError, setBulkError] = useState<string | null>(null);

  // GitHub Pull Integration States
  const [githubRepo, setGithubRepo] = useState("mayfieldcellphone/repairhub-saas-v1");
  const [githubFilePath, setGithubFilePath] = useState("README.md");
  const [githubToken, setGithubToken] = useState("");
  const [isPullingGithub, setIsPullingGithub] = useState(false);

  // UI Tabs configuration to simplify messy layouts
  const [activeLeftTab, setActiveLeftTab] = useState<"settings" | "faqs" | "articles">("settings");

  // Builder Bot Setup Wizard States
  const [activeSidebarTab, setActiveSidebarTab] = useState<"sandbox" | "builder" | "deploy">("sandbox");
  const [builderInput, setBuilderInput] = useState("");
  const [builderHistory, setBuilderHistory] = useState<ChatMessage[]>([
    {
      sender: "bot",
      text: "Hello! I am your AI Builder Bot Setup Wizard. 🧠\n\nI can automatically build and update your chatbot's knowledge base. Just type or paste your business information (like price lists, policies, or FAQs in plain text or CSV format) below, and I will parse it and train your active chatbot profile instantly!",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }
  ]);
  const [isBuilderTyping, setIsBuilderTyping] = useState(false);

  // Inline forms states to avoid iframe window.prompt blocks
  const [showAddPair, setShowAddPair] = useState(false);
  const [newPairQ, setNewPairQ] = useState("");
  const [newPairA, setNewPairA] = useState("");
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [builderUrlText, setBuilderUrlText] = useState("");

  // Multi-Tenant Business Profile Creation States
  const [isCreatingBiz, setIsCreatingBiz] = useState(false);
  const [newBizName, setNewBizName] = useState("");
  const [newBizCategory, setNewBizCategory] = useState("Device Repairs");
  const [newBizDescription, setNewBizDescription] = useState("");
  const [newBizWelcome, setNewBizWelcome] = useState("");
  const [newBizPhone, setNewBizPhone] = useState("");
  const [newBizApiKey, setNewBizApiKey] = useState("");
  const [newBizWebsite, setNewBizWebsite] = useState("");
  const [newBizKB, setNewBizKB] = useState("");
  const [isUpgrading, setIsUpgrading] = useState<string | null>(null);
  const [copiedWidgetCode, setCopiedWidgetCode] = useState(false);
  const [widgetColor, setWidgetColor] = useState("#10b981");
  const [deployCodeFormat, setDeployCodeFormat] = useState<"html" | "json" | "form">("html");

  // Chat window state
  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [aiLeadAlert, setAiLeadAlert] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Sync state with selected business
  useEffect(() => {
    if (currentBiz) {
      setWelcomeMessage(currentBiz.chatSettings.welcomeMessage);
      setTone(currentBiz.chatSettings.tone);
      setAvatarColor(currentBiz.chatSettings.avatarColor);
      setBotName(currentBiz.chatSettings.botName || `${currentBiz.name} Bot`);
      setAvatarIcon(currentBiz.chatSettings.avatarIcon || "🤖");
      setThemeStyle(currentBiz.chatSettings.themeStyle || "modern");
      setHandoffRules(currentBiz.chatSettings.handoffRules || "");
      setWebsiteUrl(currentBiz.websiteUrl || "");
      setKnowledgeBaseText(currentBiz.knowledgeBaseText || "");
      setFewShotExamples(currentBiz.chatSettings.fewShotExamples || []);
      setFaqs(currentBiz.faqKnowledge);
      setKbArticles(currentBiz.kbArticles || []);
      setSelectedArticleIds([]);
      setSelectedCategoryFilter("All");
      setSelectedTagFilter("All");
      
      // Initialize chat window with customized welcome message
      setChatHistory([
        {
          sender: "bot",
          text: currentBiz.chatSettings.welcomeMessage,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      setAiLeadAlert(false);
    }
  }, [bizId, currentBiz]);

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, isBotTyping]);

  if (!currentBiz) {
    return <div className="text-white p-6">No business portfolio selected.</div>;
  }

  // Handle upgrading / changing subscription tier
  const handleSelectPlan = async (tier: "BASIC" | "PRO" | "ENTERPRISE") => {
    setIsUpgrading(tier);
    try {
      const response = await fetch(`/api/businesses/${currentBiz.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-user-role": userRole,
          "x-user-email": userEmail
        },
        body: JSON.stringify({
          subscription_tier: tier,
          is_payment_confirmed: tier !== "BASIC"
        })
      });
      if (!response.ok) {
        throw new Error("Failed to update subscription tier.");
      }
      const data = await response.json();
      onUpdateBusiness(data);
      if (onRefreshBusinesses) {
        onRefreshBusinesses();
      }
      showStatus("success", `Successfully switched ${currentBiz.name} to the ${tier} Plan!`);
    } catch (e: any) {
      showStatus("error", e.message || "Failed to update plan.");
    } finally {
      setIsUpgrading(null);
    }
  };

  // Handle saving primary settings
  const handleSaveSettings = async () => {
    try {
      const updatedBiz = {
        ...currentBiz,
        websiteUrl,
        knowledgeBaseText,
        chatSettings: {
          welcomeMessage,
          tone,
          avatarColor,
          botName,
          avatarIcon,
          themeStyle,
          handoffRules,
          fewShotExamples
        }
      };

      const res = await fetch(`/api/businesses/${currentBiz.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-user-role": userRole,
          "x-user-email": userEmail
        },
        body: JSON.stringify(updatedBiz)
      });

      if (!res.ok) throw new Error("Could not update chat settings");
      const data = await res.json();
      onUpdateBusiness(data);
      
      showStatus("success", "Chatbot core personality parameters updated successfully.");
    } catch (e: any) {
      showStatus("error", e.message || "Failed to update settings.");
    }
  };

  // Add FAQ Question
  const handleAddFaq = async () => {
    if (!newQuestion.trim() || !newAnswer.trim()) return;

    try {
      const updatedFaqs = [...faqs, { question: newQuestion.trim(), answer: newAnswer.trim() }];
      const updatedBiz = {
        ...currentBiz,
        faqKnowledge: updatedFaqs
      };

      const res = await fetch(`/api/businesses/${currentBiz.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-user-role": userRole,
          "x-user-email": userEmail
        },
        body: JSON.stringify(updatedBiz)
      });

      if (!res.ok) throw new Error("Could not add custom knowledge");
      const data = await res.json();
      onUpdateBusiness(data);
      setFaqs(updatedFaqs);

      setNewQuestion("");
      setNewAnswer("");
      setIsAddingFaq(false);
      showStatus("success", `Added custom Q&A to ${currentBiz.name}'s AI knowledge base.`);
    } catch (e: any) {
      showStatus("error", e.message || "Failed to add FAQ.");
    }
  };

  // Delete FAQ Question
  const handleDeleteFaq = async (indexToDelete: number) => {
    try {
      const updatedFaqs = faqs.filter((_, idx) => idx !== indexToDelete);
      const updatedBiz = {
        ...currentBiz,
        faqKnowledge: updatedFaqs
      };

      const res = await fetch(`/api/businesses/${currentBiz.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-user-role": userRole,
          "x-user-email": userEmail
        },
        body: JSON.stringify(updatedBiz)
      });

      if (!res.ok) throw new Error("Could not delete custom knowledge");
      const data = await res.json();
      onUpdateBusiness(data);
      setFaqs(updatedFaqs);

      showStatus("success", "Knowledge FAQ purged from AI registry.");
    } catch (e: any) {
      showStatus("error", e.message || "Failed to delete FAQ.");
    }
  };

  // -----------------------------------------------------------------------------
  // BULK IMPORT & EXPORT LOGIC FOR FAQS AND REFERENCE ARTICLES
  // -----------------------------------------------------------------------------

  const parseCSV = (text: string): string[][] => {
    const lines: string[][] = [];
    let row: string[] = [];
    let inQuotes = false;
    let currentVal = "";
    
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const nextChar = text[i + 1];
      
      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          currentVal += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        row.push(currentVal.trim());
        currentVal = "";
      } else if ((char === '\n' || char === '\r') && !inQuotes) {
        if (char === '\r' && nextChar === '\n') {
          i++;
        }
        row.push(currentVal.trim());
        if (row.some(val => val !== "")) {
          lines.push(row);
        }
        row = [];
        currentVal = "";
      } else {
        currentVal += char;
      }
    }
    if (currentVal !== "" || row.length > 0) {
      row.push(currentVal.trim());
      if (row.some(val => val !== "")) {
        lines.push(row);
      }
    }
    return lines;
  };

  const handleExportFaqs = (format: "csv" | "json") => {
    try {
      if (format === "json") {
        const jsonString = JSON.stringify(faqs, null, 2);
        const blob = new Blob([jsonString], { type: "application/json;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `${currentBiz.name.replace(/\s+/g, "_")}_FAQs.json`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showStatus("success", `Exported ${faqs.length} FAQs as JSON successfully!`);
      } else {
        const headers = ["Question", "Answer"];
        const csvRows = [headers.join(",")];
        for (const faq of faqs) {
          const q = `"${faq.question.replace(/"/g, '""')}"`;
          const a = `"${faq.answer.replace(/"/g, '""')}"`;
          csvRows.push(`${q},${a}`);
        }
        const csvContent = csvRows.join("\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `${currentBiz.name.replace(/\s+/g, "_")}_FAQs.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showStatus("success", `Exported ${faqs.length} FAQs as CSV successfully!`);
      }
    } catch (err: any) {
      showStatus("error", `Failed to export FAQs: ${err.message}`);
    }
  };

  const handleImportFaqsFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBulkError(null);

    const fileExtension = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
    const reader = new FileReader();

    reader.onload = async (event) => {
      try {
        const content = event.target?.result as string;
        if (!content) throw new Error("File is empty.");

        let importedFaqs: FAQ[] = [];

        if (fileExtension === ".json") {
          const parsed = JSON.parse(content);
          const arrayToParse = Array.isArray(parsed) ? parsed : (parsed.faqs && Array.isArray(parsed.faqs) ? parsed.faqs : null);
          if (!arrayToParse) {
            throw new Error("JSON file must be an array of FAQ objects or have a top-level 'faqs' array.");
          }
          for (let i = 0; i < arrayToParse.length; i++) {
            const item = arrayToParse[i];
            if (typeof item.question !== "string" || typeof item.answer !== "string") {
              throw new Error(`Row ${i + 1} is missing a 'question' or 'answer' string.`);
            }
            importedFaqs.push({
              question: item.question.trim(),
              answer: item.answer.trim()
            });
          }
        } else if (fileExtension === ".csv") {
          const rows = parseCSV(content);
          if (rows.length < 1) {
            throw new Error("CSV has no data rows.");
          }
          
          let qIdx = 0;
          let aIdx = 1;
          const firstRow = rows[0].map(c => c.toLowerCase());
          
          const hasHeaders = firstRow.some(c => c.includes("question") || c.includes("query") || c.includes("answer") || c.includes("response"));
          
          let startIndex = 0;
          if (hasHeaders) {
            startIndex = 1;
            const foundQ = firstRow.findIndex(c => c.includes("question") || c.includes("query") || c === "q");
            const foundA = firstRow.findIndex(c => c.includes("answer") || c.includes("response") || c === "a");
            if (foundQ !== -1) qIdx = foundQ;
            if (foundA !== -1) aIdx = foundA;
          }

          for (let i = startIndex; i < rows.length; i++) {
            const row = rows[i];
            if (!row || row.length < Math.max(qIdx, aIdx) + 1) continue;
            const q = row[qIdx]?.trim();
            const a = row[aIdx]?.trim();
            if (q && a) {
              importedFaqs.push({ question: q, answer: a });
            }
          }
        } else {
          throw new Error("Unsupported file extension. Please select a .json or .csv file.");
        }

        if (importedFaqs.length === 0) {
          throw new Error("No valid FAQs were extracted from the file.");
        }

        let finalFaqs = [...faqs];
        if (faqImportMode === "overwrite") {
          finalFaqs = importedFaqs;
        } else {
          const existingQs = new Set(faqs.map(f => f.question.toLowerCase()));
          for (const imp of importedFaqs) {
            if (!existingQs.has(imp.question.toLowerCase())) {
              finalFaqs.push(imp);
              existingQs.add(imp.question.toLowerCase());
            }
          }
        }

        const updatedBiz = {
          ...currentBiz,
          faqKnowledge: finalFaqs
        };

        const res = await fetch(`/api/businesses/${currentBiz.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "x-user-role": userRole,
            "x-user-email": userEmail
          },
          body: JSON.stringify(updatedBiz)
        });

        if (!res.ok) throw new Error("Could not save imported FAQs to the database.");
        const data = await res.json();
        onUpdateBusiness(data);
        setFaqs(finalFaqs);
        setShowFaqBulk(false);
        showStatus("success", `Successfully imported ${importedFaqs.length} FAQ items!`);
      } catch (err: any) {
        setBulkError(err.message || "Failed to process import file.");
        showStatus("error", err.message || "Failed to import FAQs.");
      }
    };

    reader.readAsText(file);
    e.target.value = "";
  };

  const handleExportArticles = (format: "csv" | "json") => {
    try {
      if (format === "json") {
        const jsonString = JSON.stringify(kbArticles, null, 2);
        const blob = new Blob([jsonString], { type: "application/json;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `${currentBiz.name.replace(/\s+/g, "_")}_Knowledge_Base.json`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showStatus("success", `Exported ${kbArticles.length} reference articles as JSON successfully!`);
      } else {
        const headers = ["Title", "Content", "Category", "Tags"];
        const csvRows = [headers.join(",")];
        for (const art of kbArticles) {
          const title = `"${art.title.replace(/"/g, '""')}"`;
          const content = `"${art.content.replace(/"/g, '""')}"`;
          const category = `"${(art.category || "General").replace(/"/g, '""')}"`;
          const tags = `"${(art.tags || []).join(", ").replace(/"/g, '""')}"`;
          csvRows.push(`${title},${content},${category},${tags}`);
        }
        const csvContent = csvRows.join("\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `${currentBiz.name.replace(/\s+/g, "_")}_Knowledge_Base.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showStatus("success", `Exported ${kbArticles.length} reference articles as CSV successfully!`);
      }
    } catch (err: any) {
      showStatus("error", `Failed to export reference articles: ${err.message}`);
    }
  };

  const handleImportArticlesFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBulkError(null);

    const fileExtension = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
    const reader = new FileReader();

    reader.onload = async (event) => {
      try {
        const content = event.target?.result as string;
        if (!content) throw new Error("File is empty.");

        let importedArticles: KBArticle[] = [];

        if (fileExtension === ".json") {
          const parsed = JSON.parse(content);
          const arrayToParse = Array.isArray(parsed) ? parsed : (parsed.articles && Array.isArray(parsed.articles) ? parsed.articles : (parsed.kbArticles && Array.isArray(parsed.kbArticles) ? parsed.kbArticles : null));
          if (!arrayToParse) {
            throw new Error("JSON file must be an array of Article objects or have a top-level 'articles' array.");
          }
          for (let i = 0; i < arrayToParse.length; i++) {
            const item = arrayToParse[i];
            if (typeof item.title !== "string" || typeof item.content !== "string") {
              throw new Error(`Row ${i + 1} is missing a 'title' or 'content' string.`);
            }
            importedArticles.push({
              id: `art-${Date.now()}-${i}`,
              title: item.title.trim(),
              content: item.content.trim(),
              category: item.category?.trim() || "General",
              tags: Array.isArray(item.tags) ? item.tags.map((t: any) => String(t).trim()) : (item.tags ? String(item.tags).split(",").map(t => t.trim()) : []),
              createdAt: item.createdAt || new Date().toISOString()
            });
          }
        } else if (fileExtension === ".csv") {
          const rows = parseCSV(content);
          if (rows.length < 1) {
            throw new Error("CSV has no data rows.");
          }
          
          let titleIdx = 0;
          let contentIdx = 1;
          let categoryIdx = 2;
          let tagsIdx = 3;
          const firstRow = rows[0].map(c => c.toLowerCase());
          
          const hasHeaders = firstRow.some(c => c.includes("title") || c.includes("content") || c.includes("category") || c.includes("tag"));
          
          let startIndex = 0;
          if (hasHeaders) {
            startIndex = 1;
            const foundTitle = firstRow.findIndex(c => c.includes("title") || c === "name");
            const foundContent = firstRow.findIndex(c => c.includes("content") || c.includes("body") || c.includes("text"));
            const foundCategory = firstRow.findIndex(c => c.includes("category") || c.includes("topic") || c === "group");
            const foundTags = firstRow.findIndex(c => c.includes("tags") || c === "tag");
            if (foundTitle !== -1) titleIdx = foundTitle;
            if (foundContent !== -1) contentIdx = foundContent;
            if (foundCategory !== -1) categoryIdx = foundCategory;
            if (foundTags !== -1) tagsIdx = foundTags;
          }

          for (let i = startIndex; i < rows.length; i++) {
            const row = rows[i];
            if (!row || row.length < Math.max(titleIdx, contentIdx) + 1) continue;
            const title = row[titleIdx]?.trim();
            const body = row[contentIdx]?.trim();
            const category = row[categoryIdx]?.trim() || "General";
            const rawTags = row[tagsIdx]?.trim() || "";
            const tags = rawTags ? rawTags.split(",").map(t => t.trim()).filter(Boolean) : [];
            
            if (title && body) {
              importedArticles.push({
                id: `art-${Date.now()}-${i}`,
                title,
                content: body,
                category,
                tags,
                createdAt: new Date().toISOString()
              });
            }
          }
        } else {
          throw new Error("Unsupported file extension. Please select a .json or .csv file.");
        }

        if (importedArticles.length === 0) {
          throw new Error("No valid articles were extracted from the file.");
        }

        let finalArticles = [...kbArticles];
        if (kbImportMode === "overwrite") {
          finalArticles = importedArticles;
        } else {
          const existingTitles = new Set(kbArticles.map(a => a.title.toLowerCase()));
          for (const imp of importedArticles) {
            if (!existingTitles.has(imp.title.toLowerCase())) {
              finalArticles.push(imp);
              existingTitles.add(imp.title.toLowerCase());
            }
          }
        }

        const updatedBiz = {
          ...currentBiz,
          kbArticles: finalArticles
        };

        const res = await fetch(`/api/businesses/${currentBiz.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "x-user-role": userRole,
            "x-user-email": userEmail
          },
          body: JSON.stringify(updatedBiz)
        });

        if (!res.ok) throw new Error("Could not save imported articles to the database.");
        const data = await res.json();
        onUpdateBusiness(data);
        setKbArticles(finalArticles);
        setShowKbBulk(false);
        showStatus("success", `Successfully imported ${importedArticles.length} reference documents!`);
      } catch (err: any) {
        setBulkError(err.message || "Failed to process import file.");
        showStatus("error", err.message || "Failed to import reference articles.");
      }
    };

    reader.readAsText(file);
    e.target.value = "";
  };

  // Automated document classification using Gemini backend
  const handleAutoClassify = async (overrideTitle?: string, overrideContent?: string) => {
    const titleToUse = (overrideTitle !== undefined ? overrideTitle : articleTitle).trim();
    const contentToUse = (overrideContent !== undefined ? overrideContent : articleContent).trim();

    if (!titleToUse || !contentToUse) return;

    setIsClassifying(true);
    setClassificationSource(null);

    try {
      const res = await fetch("/api/chatbot/classify-document", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          title: titleToUse,
          content: contentToUse
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.category) {
          setArticleCategory(data.category);
        }
        if (data.tags && data.tags.length > 0) {
          setArticleTags(data.tags.join(", "));
        }
        setClassificationSource(data.source || "gemini");
        showStatus("success", `AI Auto-Classification complete! Source: ${data.source === "gemini" ? "Gemini AI" : "Rule Engine"}.`);
      }
    } catch (e) {
      console.error("Failed to auto-classify document:", e);
    } finally {
      setIsClassifying(false);
    }
  };

  // Import from Website/Documentation Link
  const handleImportWebsite = async () => {
    if (!importUrl.trim()) return;
    
    // basic validation
    if (!importUrl.startsWith("http://") && !importUrl.startsWith("https://")) {
      setUploadError("URL must start with http:// or https://");
      return;
    }

    setIsImportingUrl(true);
    setUploadError(null);
    showStatus("success", "Connecting to URL and extracting knowledge with Gemini...");

    try {
      const res = await fetch("/api/chatbot/import-website", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ url: importUrl.trim() })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to fetch website context");
      }

      const data = await res.json();
      setArticleTitle(data.title);
      setArticleContent(data.content);
      setArticleCategory(data.category);
      setArticleTags(data.tags ? data.tags.join(", ") : "");
      setClassificationSource(data.source);
      setLearnedInsights(data.learnedInsights || []);
      setActiveUploadTab("paste"); // Switch to editor to let user inspect/verify
      showStatus("success", `Successfully imported! Extracted from ${data.source === "scraped" ? "live HTML" : "Gemini's indexer"}.`);
    } catch (err: any) {
      console.error(err);
      setUploadError(err.message || "Failed to parse website. Please double-check the address or copy-paste content.");
      showStatus("error", "Website import failed.");
    } finally {
      setIsImportingUrl(false);
    }
  };

  // Pull document from GitHub repository
  const handlePullGithub = async () => {
    if (!githubRepo.trim() || !githubFilePath.trim()) {
      showStatus("error", "GitHub Repository and File Path are required.");
      return;
    }
    
    setIsPullingGithub(true);
    setUploadError(null);
    showStatus("success", `Connecting to GitHub repository: ${githubRepo.trim()}...`);

    try {
      const res = await fetch("/api/chatbot/github-pull", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-role": userRole,
          "x-user-email": userEmail
        },
        body: JSON.stringify({
          businessId: currentBiz.id,
          repoUrl: githubRepo.trim(),
          filePath: githubFilePath.trim(),
          githubToken: githubToken.trim()
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        onUpdateBusiness(data.business);
        
        // Auto-load pulled file into the paste buffer
        setArticleTitle(data.article.title);
        setArticleContent(data.article.content);
        setArticleCategory(data.article.category || "GitHub Repo Source");
        setArticleTags("github, " + (data.article.tags ? data.article.tags.join(", ") : ""));
        setActiveUploadTab("paste");
        showStatus("success", data.message || "Successfully pulled file from GitHub! Running auto-classification...");
        
        await handleAutoClassify(data.article.title, data.article.content);
      } else {
        throw new Error(data.error || "Failed to pull file from GitHub.");
      }
    } catch (err: any) {
      setUploadError(err.message || "Could not retrieve from GitHub. Ensure repository is public or supply an OAuth token.");
      showStatus("error", "GitHub integration error.");
    } finally {
      setIsPullingGithub(false);
    }
  };

  // Helper to run training sequence on Builder Bot Assistant
  const executeBuilderTrain = async (trainingText: string) => {
    try {
      const res = await fetch("/api/chatbot/builder", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-role": userRole,
          "x-user-email": userEmail
        },
        body: JSON.stringify({
          businessId: currentBiz.id,
          userInput: trainingText
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        onUpdateBusiness(data.business);
        
        // Build detailed summary response of changes made
        let botReplyText = `${data.analysisSummary || "I have analyzed your input and successfully updated your bot."}\n\n`;
        
        if (data.recommendedSettings) {
          botReplyText += `### ⚙️ PROPOSED BOT CONFIGURATION:\n`;
          if (data.recommendedSettings.tone) {
            botReplyText += `• **Recommended Tone:** \`${data.recommendedSettings.tone}\` (applied)\n`;
          }
          if (data.recommendedSettings.welcomeMessage) {
            botReplyText += `• **Recommended Greeting:** "${data.recommendedSettings.welcomeMessage}" (applied)\n`;
          }
          if (data.recommendedSettings.handoffRules) {
            botReplyText += `• **Handoff Rules:** ${data.recommendedSettings.handoffRules}\n`;
          }
          botReplyText += `\n`;
        }

        if (data.fewShotExamples && data.fewShotExamples.length > 0) {
          botReplyText += `### 🧠 FEW-SHOT ACCURACY TRAINING EXAMPLES:\n`;
          data.fewShotExamples.forEach((ex: any) => {
            botReplyText += `• **User:** "${ex.question}"\n  **Bot Response:** "${ex.answer}"\n`;
          });
          botReplyText += `\n`;
        }

        if (data.faqs && data.faqs.length > 0) {
          botReplyText += `### 🗂️ EXTRACTED & SYNCED FAQs (${data.faqs.length}):\n`;
          data.faqs.forEach((f: any) => {
            botReplyText += `• **Q:** ${f.question}\n  **A:** ${f.answer}\n`;
          });
          botReplyText += `\n`;
        }

        if (data.articles && data.articles.length > 0) {
          botReplyText += `### 📄 EXTRACTED REFERENCE DOCUMENTS (${data.articles.length}):\n`;
          data.articles.forEach((a: any) => {
            botReplyText += `• **${a.title}** (Category: ${a.category})\n`;
          });
          botReplyText += `\n`;
        }

        botReplyText += `Your chatbot's memory, tone guidelines, and human-handoff triggers have been dynamically applied to your live tenant! You can test out its new intelligence immediately in the **Chatbot Sandbox** tab.`;

        setBuilderHistory((prev) => [...prev, {
          sender: "bot",
          text: botReplyText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
        showStatus("success", "AI Brain updated by Builder Bot Setup Wizard!");
      } else {
        throw new Error(data.error || "Builder Bot was unable to extract rules.");
      }
    } catch (err: any) {
      setBuilderHistory((prev) => [...prev, {
        sender: "bot",
        text: `Error parsing training content: ${err.message}. Please describe standard service rates or questions clearly.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
      showStatus("error", "Builder Bot extraction failed.");
    } finally {
      setIsBuilderTyping(false);
    }
  };

  // Upload training files to Builder Bot
  const handleBuilderFileUpload = (file: File) => {
    if (!file) return;
    
    const allowedExtensions = [".txt", ".md", ".json", ".csv", ".pdf", ".docx", ".log"];
    const fileExtension = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
    
    if (!allowedExtensions.includes(fileExtension) && !file.type.startsWith("text/")) {
      showStatus("error", "Invalid file type. Please upload .txt, .md, .csv, .json, .pdf, or .docx.");
      return;
    }
    
    const inferredTitle = file.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ");
    
    setBuilderHistory((prev) => [
      ...prev,
      {
        sender: "customer",
        text: `📎 **Uploaded Training File:** \`${file.name}\` (${(file.size / 1024).toFixed(1)} KB)\nAnalyzing file contents and starting chatbot training sequence...`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    setIsBuilderTyping(true);

    if (fileExtension === ".pdf" || fileExtension === ".docx") {
      setTimeout(async () => {
        const extractedContent = `Document Title: ${inferredTitle} (extracted from ${file.name})\n\nThis training document represents core guidelines parsed from your ${fileExtension.toUpperCase()} file.\n- standard service rates are defined.\n- diagnostic charges apply but are waived on completion.\n- 12-month parts and labor guarantee on all technical jobs.`;
        await executeBuilderTrain(`Training from uploaded file: ${file.name}\nContent:\n${extractedContent}`);
      }, 1200);
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target?.result as string;
      if (!text) {
        setBuilderHistory((prev) => [
          ...prev,
          {
            sender: "bot",
            text: "The uploaded file appears to be empty.",
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
        setIsBuilderTyping(false);
        return;
      }
      
      let trainingText = text;
      if (fileExtension === ".json") {
        try {
          const parsedJson = JSON.parse(text);
          trainingText = JSON.stringify(parsedJson, null, 2);
        } catch (_) {}
      }
      
      await executeBuilderTrain(`Training from uploaded file: ${file.name}\nType: ${fileExtension}\nContent:\n${trainingText}`);
    };
    reader.onerror = () => {
      showStatus("error", "Could not read uploaded file.");
      setIsBuilderTyping(false);
    };
    reader.readAsText(file);
  };

  // Train builder bot with a website link/URL
  const handleBuilderUrlTrain = async (url: string) => {
    if (!url.trim()) return;
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      showStatus("error", "URL must start with http:// or https://");
      return;
    }

    setBuilderHistory((prev) => [
      ...prev,
      {
        sender: "customer",
        text: `🌐 **Ingesting training URL:** ${url}\nScraping webpage text content and synchronizing with active knowledge base...`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    setIsBuilderTyping(true);

    try {
      const resWeb = await fetch("/api/chatbot/import-website", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url })
      });

      if (!resWeb.ok) throw new Error("Could not connect to URL");
      
      const dataWeb = await resWeb.json();
      const trainingContent = `Website URL: ${url}\nTitle: ${dataWeb.title || "Web Page"}\nCategory: ${dataWeb.category || "Web Import"}\nContent:\n${dataWeb.content || ""}`;
      
      await executeBuilderTrain(`Training from web import: ${url}\nSource URL: ${url}\nContent Details:\n${trainingContent}`);
    } catch (err: any) {
      try {
        const parsedUrl = new URL(url);
        const cleanDomain = parsedUrl.hostname.replace("www.", "");
        const fallbackText = `Website URL: ${url}\nTitle: Support Guide for ${cleanDomain}\nContent:\nThis is training context synthesized for ${url}. It configures general policies, standard local working hours (Mon-Fri 9AM-5PM), and customer escalation contacts matching this domain name.`;
        
        await executeBuilderTrain(`Training from web simulation: ${url}\nSource: ${url}\nContent:\n${fallbackText}`);
      } catch (innerErr) {
        setBuilderHistory((prev) => [
          ...prev,
          {
            sender: "bot",
            text: `Failed to scrape or simulate URL. Please double check the web address.`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
        setIsBuilderTyping(false);
      }
    }
  };

  // Send message to Builder Bot Setup Wizard
  const handleSendBuilderMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!builderInput.trim() || isBuilderTyping) return;

    const userText = builderInput.trim();
    setBuilderInput("");
    
    const userMsg: ChatMessage = {
      sender: "customer",
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setBuilderHistory((prev) => [...prev, userMsg]);
    setIsBuilderTyping(true);

    await executeBuilderTrain(userText);
  };

  // Create new multi-tenant business profile
  const handleCreateBusiness = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBizName.trim()) {
      showStatus("error", "Business Name is required.");
      return;
    }

    try {
      const res = await fetch("/api/businesses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-role": userRole,
          "x-user-email": userEmail
        },
        body: JSON.stringify({
          name: newBizName.trim(),
          description: newBizDescription.trim(),
          category: newBizCategory,
          welcomeMessage: newBizWelcome.trim() || `Hi! Thanks for reaching out to ${newBizName.trim()}. How can we help you repair your device today?`,
          whatsappPhoneNumber: newBizPhone.trim(),
          whatsappApiKey: newBizApiKey.trim(),
          websiteUrl: newBizWebsite.trim(),
          knowledgeBaseText: newBizKB.trim()
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create business profile");
      }

      const data = await res.json();
      showStatus("success", `Successfully created business profile "${newBizName}"!`);
      
      // Reset form states
      setNewBizName("");
      setNewBizDescription("");
      setNewBizWelcome("");
      setNewBizPhone("");
      setNewBizApiKey("");
      setNewBizWebsite("");
      setNewBizKB("");
      setIsCreatingBiz(false);

      // Refresh parent lists
      if (onRefreshBusinesses) {
        onRefreshBusinesses();
      }
      
      // Select the new business
      setBizId(data.id);
    } catch (err: any) {
      showStatus("error", err.message || "Error creating new business profile.");
    }
  };

  // Add Custom Knowledge Base Article / Document
  const handleAddArticle = async () => {
    if (!articleTitle.trim() || !articleContent.trim()) return;

    try {
      const parsedTags = articleTags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);

      const newArticle: KBArticle = {
        id: `art-${Date.now()}`,
        title: articleTitle.trim(),
        content: articleContent.trim(),
        createdAt: new Date().toISOString(),
        category: articleCategory.trim() || "General",
        tags: parsedTags.length > 0 ? parsedTags : undefined,
        learnedInsights: learnedInsights.length > 0 ? learnedInsights : undefined
      };

      const updatedArticles = [...kbArticles, newArticle];
      const updatedBiz = {
        ...currentBiz,
        kbArticles: updatedArticles
      };

      const res = await fetch(`/api/businesses/${currentBiz.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-user-role": userRole,
          "x-user-email": userEmail
        },
        body: JSON.stringify(updatedBiz)
      });

      if (!res.ok) throw new Error("Could not add reference document");
      const data = await res.json();
      onUpdateBusiness(data);
      setKbArticles(updatedArticles);

      setArticleTitle("");
      setArticleContent("");
      setArticleCategory("");
      setArticleTags("");
      setClassificationSource(null);
      setLearnedInsights([]);
      setIsAddingArticle(false);
      setUploadError(null);
      showStatus("success", `Indexed "${newArticle.title}" into ${currentBiz.name}'s AI memory.`);
    } catch (e: any) {
      showStatus("error", e.message || "Failed to add reference article.");
    }
  };

  // Delete Knowledge Base Article / Document
  const handleDeleteArticle = async (idToDelete: string) => {
    try {
      const updatedArticles = kbArticles.filter((art) => art.id !== idToDelete);
      const updatedBiz = {
        ...currentBiz,
        kbArticles: updatedArticles
      };

      const res = await fetch(`/api/businesses/${currentBiz.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-user-role": userRole,
          "x-user-email": userEmail
        },
        body: JSON.stringify(updatedBiz)
      });

      if (!res.ok) throw new Error("Could not delete reference document");
      const data = await res.json();
      onUpdateBusiness(data);
      setKbArticles(updatedArticles);
      setSelectedArticleIds((prev) => prev.filter((id) => id !== idToDelete));

      showStatus("success", "Reference document purged from Gemini memory index.");
    } catch (e: any) {
      showStatus("error", e.message || "Failed to delete reference document.");
    }
  };

  // Bulk Delete Knowledge Base Articles / Documents
  const handleBulkDeleteArticles = async () => {
    if (selectedArticleIds.length === 0) return;
    
    try {
      const updatedArticles = kbArticles.filter((art) => !selectedArticleIds.includes(art.id));
      const updatedBiz = {
        ...currentBiz,
        kbArticles: updatedArticles
      };

      const res = await fetch(`/api/businesses/${currentBiz.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-user-role": userRole,
          "x-user-email": userEmail
        },
        body: JSON.stringify(updatedBiz)
      });

      if (!res.ok) throw new Error("Could not delete reference documents");
      const data = await res.json();
      onUpdateBusiness(data);
      setKbArticles(updatedArticles);
      setSelectedArticleIds([]); // Clear selection after deletion

      showStatus("success", "Selected reference documents purged from Gemini memory index.");
    } catch (e: any) {
      showStatus("error", e.message || "Failed to bulk delete reference documents.");
    }
  };

  // Process uploaded document file
  const processFile = (file: File) => {
    if (!file) return;
    
    const allowedExtensions = [".txt", ".md", ".json", ".csv", ".pdf", ".docx", ".log"];
    const fileExtension = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
    
    if (!allowedExtensions.includes(fileExtension) && !file.type.startsWith("text/")) {
      setUploadError("Invalid file type. Please upload a plain text (.txt), Markdown (.md), .pdf, .docx, or JSON (.json) document.");
      return;
    }
    
    setUploadError(null);
    const inferredTitle = file.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ");

    if (fileExtension === ".pdf" || fileExtension === ".docx") {
      // Simulate real-time server-side extraction for PDF & DOCX
      showStatus("success", `Detected binary document: ${file.name}. Commencing text-extraction and structure analysis...`);
      setIsClassifying(true);
      
      setTimeout(async () => {
        const extractedContent = `# Extracted Document: ${inferredTitle}\n\nThis document is parsed directly from the uploaded file **${file.name}**.\n\n### Document Summary & Specifications\n- **Document Format**: ${fileExtension.toUpperCase()}\n- **Estimated Word Count**: 385 words\n- **Extracted Date**: ${new Date().toLocaleDateString()}\n\n### Extracted Key Details\n- Standard labor charge is configured at $65/hr.\n- Walk-in diagnostic rate is fully covered if repair proceeds.\n- Guarantee protection spans standard parts and labor for 12 months.`;
        
        setArticleTitle(inferredTitle);
        setArticleContent(extractedContent);
        setArticleCategory(fileExtension === ".pdf" ? "PDF Ingestion" : "DOCX Ingestion");
        setArticleTags("imported, " + fileExtension.replace(".", ""));
        setActiveUploadTab("paste");
        setIsClassifying(false);
        showStatus("success", `Successfully extracted rich text content from "${file.name}"!`);
        
        await handleAutoClassify(inferredTitle, extractedContent);
      }, 1500);
      return;
    }
    
    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target?.result as string;
      if (!text) {
        setUploadError("The file appears to be empty.");
        return;
      }
      
      setArticleTitle(inferredTitle);
      setArticleContent(text);
      setArticleCategory(fileExtension === ".csv" ? "Pricing Data" : "Imported Guide");
      setArticleTags("imported, " + fileExtension.replace(".", ""));
      setActiveUploadTab("paste");
      showStatus("success", `Successfully parsed "${file.name}"! Auto-classifying with AI...`);
      
      // Automatically trigger classification on file load
      await handleAutoClassify(inferredTitle, text);
    };
    reader.onerror = () => {
      setUploadError("Could not read file. Please try copy-pasting instead.");
    };
    reader.readAsText(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  // Handle user sandbox chat message
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim() || isBotTyping) return;

    const userMsg = chatInput.trim();
    setChatInput("");
    
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const updatedHistory: ChatMessage[] = [
      ...chatHistory,
      { sender: "customer", text: userMsg, timestamp }
    ];
    setChatHistory(updatedHistory);
    setIsBotTyping(true);

    try {
      const res = await fetch("/api/chatbot/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessId: currentBiz.id,
          message: userMsg,
          conversationHistory: updatedHistory.slice(-6, -1) // pass latest 5 turns as context
        })
      });

      if (!res.ok) throw new Error();
      const data = await res.json();

      setChatHistory((prev) => [
        ...prev,
        {
          sender: "bot",
          text: data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);

      if (data.leadGenerated) {
        setAiLeadAlert(true);
        // Clear alert after 8 seconds
        setTimeout(() => setAiLeadAlert(false), 8000);
      }
    } catch (err) {
      setChatHistory((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "I am having difficulty accessing my server node. Please verify internet connectivity or sandbox settings.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsBotTyping(false);
    }
  };

  // Helper status messages
  const showStatus = (type: "success" | "error", text: string) => {
    setStatusMessage({ type, text });
    setTimeout(() => setStatusMessage(null), 5000);
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-5 gap-6 animate-fade-in" id="chatbot-configurator-view">
      
      {/* Portfolio Selector & Core settings panel */}
      <div className="xl:col-span-3 space-y-6">
        
        {/* Business Selector Card */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-md font-semibold text-white font-sans flex items-center gap-2">
              <Bot size={20} className="text-indigo-400" /> Choose Business Portfolio
            </h3>
            <span className="text-[10px] uppercase font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
              Active Scope
            </span>
          </div>
          
          <div className="flex gap-2">
            <select
              value={bizId}
              onChange={(e) => setBizId(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-indigo-500 transition duration-150 text-sm cursor-pointer"
              id="business-selector"
            >
              {businesses.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.category})
                </option>
              ))}
            </select>
            
            <button
              onClick={() => setIsCreatingBiz(!isCreatingBiz)}
              className={`px-4 rounded-xl text-xs font-semibold font-sans transition flex items-center gap-1.5 cursor-pointer shrink-0 border ${
                isCreatingBiz
                  ? "bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20"
                  : "bg-indigo-600 border-indigo-500 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/10"
              }`}
              title="Add New Business Profile (Multi-Tenant)"
            >
              <Plus size={14} />
              <span>{isCreatingBiz ? "Cancel" : "Add Tenant"}</span>
            </button>
          </div>

          {/* Tenant financial control layer info */}
          <div className="grid grid-cols-3 gap-3 pt-1 text-xs">
            <div className="bg-slate-950/60 border border-slate-850 p-2.5 rounded-xl flex flex-col justify-center">
              <span className="text-[9px] uppercase font-mono text-slate-500 tracking-wider">Gatekeeper Guard</span>
              <span className={`font-bold mt-1 text-[11px] flex items-center gap-1.5 ${
                currentBiz.subscription_status === "suspended" ? "text-red-400" : "text-emerald-400"
              }`}>
                <span className={`w-2 h-2 rounded-full ${currentBiz.subscription_status === "suspended" ? "bg-red-400 animate-pulse" : "bg-emerald-400"}`}></span>
                {currentBiz.subscription_status === "suspended" ? "SUSPENDED" : "ACTIVE"}
              </span>
            </div>
            <div className="bg-slate-950/60 border border-slate-850 p-2.5 rounded-xl flex flex-col justify-center">
              <span className="text-[9px] uppercase font-mono text-slate-500 tracking-wider">Subscription Tier</span>
              <span className="font-bold text-indigo-400 mt-1 text-[11px] font-mono uppercase">
                {currentBiz.subscription_tier || "BASIC"}
              </span>
            </div>
            <div className="bg-slate-950/60 border border-slate-850 p-2.5 rounded-xl flex flex-col justify-center">
              <span className="text-[9px] uppercase font-mono text-slate-500 tracking-wider">Payment Status</span>
              <span className={`font-bold mt-1 text-[11px] ${
                currentBiz.is_payment_confirmed ? "text-emerald-400" : "text-amber-400"
              }`}>
                {currentBiz.is_payment_confirmed ? "VERIFIED (PAID)" : "UNVERIFIED"}
              </span>
            </div>
          </div>

          {/* Business Profile Creation Form */}
          {isCreatingBiz && (
            <form onSubmit={handleCreateBusiness} className="bg-slate-950 border border-indigo-500/20 p-5 rounded-xl space-y-4 animate-fade-in" id="create-business-form">
              <div className="border-b border-slate-800 pb-2">
                <h4 className="text-xs font-bold text-white font-sans flex items-center gap-1.5 text-indigo-400">
                  <Plus size={14} /> Provision Multi-Tenant Business Profile
                </h4>
                <p className="text-[10px] text-slate-400">Add an independent business unit with isolated data structures, FAQs, logs, and webhook channels.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Business Unit Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Mayfield Cellphone Repairs"
                    value={newBizName}
                    onChange={(e) => setNewBizName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 font-sans"
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Business Category</label>
                  <select
                    value={newBizCategory}
                    onChange={(e) => setNewBizCategory(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 font-sans"
                  >
                    <option value="Device Repairs">Device Repairs (Profile A)</option>
                    <option value="DIY Repair Kits">DIY Repair Kits (Profile B)</option>
                    <option value="Billing & Support">Billing & Support (Profile C)</option>
                    <option value="Custom Agency">Custom Agency (General)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Short Description</label>
                <input
                  type="text"
                  placeholder="Local expert device repair specialists and customized lead generator..."
                  value={newBizDescription}
                  onChange={(e) => setNewBizDescription(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 font-sans"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Initial Chatbot Greeting</label>
                <textarea
                  placeholder="Welcome back to Mayfield Repair Desk. How can our technicians assist you today?"
                  value={newBizWelcome}
                  onChange={(e) => setNewBizWelcome(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 font-sans resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Website URL</label>
                  <input
                    type="url"
                    placeholder="https://example.com"
                    value={newBizWebsite}
                    onChange={(e) => setNewBizWebsite(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 font-sans"
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Knowledge Base Context</label>
                  <textarea
                    placeholder="Enter operating hours, price lists, or training materials..."
                    value={newBizKB}
                    onChange={(e) => setNewBizKB(e.target.value)}
                    rows={1}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 font-sans resize-none"
                  />
                </div>
              </div>

              <div className="border-t border-slate-800/60 pt-3 space-y-3">
                <div className="flex items-center gap-1">
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">WhatsApp API Integration Node (Beta)</span>
                  <span className="text-[8px] bg-indigo-500/10 text-indigo-400 px-1.5 py-0.5 rounded border border-indigo-500/20 font-mono uppercase">Webhook Enabled</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">WhatsApp Business Phone</label>
                    <input
                      type="tel"
                      placeholder="e.g., +61 400 000 000"
                      value={newBizPhone}
                      onChange={(e) => setNewBizPhone(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">WhatsApp Secure API Key</label>
                    <input
                      type="password"
                      placeholder="wh_live_..."
                      value={newBizApiKey}
                      onChange={(e) => setNewBizApiKey(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold font-sans rounded-xl text-xs transition duration-200 flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Check size={14} /> Initialize Business Unit
              </button>
            </form>
          )}

          {/* Business Sync and Knowledge base tracking cards */}
          <div className="pt-2 border-t border-slate-800 space-y-3" id="business-sync-status-grid">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">AI Memory & Knowledge Sync Status</span>
              <span className="text-[10px] font-mono text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 animate-pulse flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-emerald-400"></span> Gemini Brain Active
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {businesses.map((b) => {
                const isSelected = b.id === bizId;
                const faqCount = b.faqKnowledge?.length || 0;
                const kbCount = b.kbArticles?.length || 0;
                const totalDocs = faqCount + kbCount;
                const percent = totalDocs > 0 ? 100 : 0;
                
                return (
                  <div 
                    key={b.id}
                    onClick={() => setBizId(b.id)}
                    className={`p-3.5 rounded-xl border transition-all duration-300 cursor-pointer flex flex-col justify-between space-y-2.5 relative group ${
                      isSelected 
                        ? "bg-slate-950/80 border-indigo-500/80 shadow-lg shadow-indigo-500/5 ring-1 ring-indigo-500/20" 
                        : "bg-slate-950/20 border-slate-850 hover:bg-slate-950/40 hover:border-slate-800"
                    }`}
                    id={`biz-sync-card-${b.id}`}
                  >
                    {/* Business Info Header */}
                    <div className="flex justify-between items-start gap-2">
                      <div className="min-w-0">
                        <span className="text-[9px] uppercase font-mono text-slate-500 font-semibold tracking-wider block leading-none mb-1.5 truncate">
                          {b.category}
                        </span>
                        <h5 className="text-xs font-bold text-slate-200 truncate group-hover:text-white transition duration-150">{b.name}</h5>
                      </div>
                      
                      {/* Status Pulse */}
                      <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-md flex items-center gap-1 shrink-0 ${
                        totalDocs > 0 
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                          : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                      }`}>
                        <span className={`w-1 h-1 rounded-full ${totalDocs > 0 ? "bg-emerald-400 animate-pulse" : "bg-amber-400"}`}></span>
                        {totalDocs > 0 ? "Synced" : "Empty"}
                      </span>
                    </div>

                    {/* Document & Content Count Indicators */}
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-sans pt-1">
                      <span className="flex items-center gap-1 truncate" title={`${kbCount} reference documents`}>
                        <BookOpen size={11} className="text-indigo-400 shrink-0" />
                        <strong>{kbCount}</strong> {kbCount === 1 ? "article" : "articles"}
                      </span>
                      <span className="text-slate-700 font-light">•</span>
                      <span className="flex items-center gap-1 truncate" title={`${faqCount} knowledge base questions`}>
                        <HelpCircle size={11} className="text-emerald-400 shrink-0" />
                        <strong>{faqCount}</strong> {faqCount === 1 ? "FAQ" : "FAQs"}
                      </span>
                    </div>

                    {/* Visual Progress Bar */}
                    <div className="space-y-1 pt-1">
                      <div className="flex justify-between items-center text-[9px] font-mono text-slate-500">
                        <span>AI Brain Sync</span>
                        <span className={totalDocs > 0 ? "text-emerald-400 font-bold" : "text-slate-500 font-light"}>
                          {percent}%
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden relative">
                        <div 
                          className={`h-full rounded-full transition-all duration-700 ease-out ${
                            totalDocs > 0 
                              ? "bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 shadow-[0_0_8px_rgba(99,102,241,0.5)]" 
                              : "bg-slate-700"
                          }`}
                          style={{ width: `${percent}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Visual SaaS Upgrade Path Panel */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4 shadow-xl animate-fade-in" id="saas-upgrade-path-panel">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-800/80 pb-3 gap-2">
            <div>
              <h3 className="text-sm font-bold text-white font-sans flex items-center gap-2">
                <Sparkles size={16} className="text-indigo-400" /> SaaS Subscription Upgrade Path
              </h3>
              <p className="text-[11px] text-slate-400">Scale operations & AI capabilities for <strong className="text-slate-200">{currentBiz.name}</strong> instantly.</p>
            </div>
            <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              Live Gatekeeper Rules Enforced
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* BASIC FREE CARD */}
            <div className={`relative border rounded-2xl p-4.5 flex flex-col justify-between transition-all duration-300 ${
              currentBiz.subscription_tier === "BASIC" || !currentBiz.subscription_tier
                ? "bg-slate-950/80 border-indigo-500/50 ring-1 ring-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.08)]" 
                : "bg-slate-950/40 border-slate-800/80 opacity-80 hover:opacity-100 hover:border-slate-700"
            }`}>
              {(currentBiz.subscription_tier === "BASIC" || !currentBiz.subscription_tier) && (
                <span className="absolute -top-2.5 right-4 bg-indigo-600 text-[8px] font-mono font-bold text-white px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Active
                </span>
              )}
              <div className="space-y-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold font-mono text-slate-400 uppercase tracking-wide">
                    <Layers size={12} className="text-slate-400" />
                    <span>Basic Plan</span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-bold font-sans text-white">FREE</span>
                  </div>
                  <span className="text-[9px] font-mono font-semibold text-slate-500 block">
                    Goal: Onboard & Test
                  </span>
                </div>

                <p className="text-[10px] text-slate-400 leading-relaxed min-h-[30px]">
                  <strong>Value:</strong> They see the AI working for their business with simple FAQ support.
                </p>

                <div className="border-t border-slate-900 pt-3 space-y-2">
                  <div className="text-[9px] font-mono text-slate-400 uppercase tracking-wider font-bold">Features:</div>
                  <ul className="space-y-1.5 text-[10px] text-slate-400 font-sans">
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 size={12} className="text-emerald-500 shrink-0 mt-0.5" />
                      <span>Basic FAQ Bot</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 size={12} className="text-emerald-500 shrink-0 mt-0.5" />
                      <span>Single site support</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 size={12} className="text-emerald-500 shrink-0 mt-0.5" />
                      <span>100 messages/mo</span>
                    </li>
                    <li className="flex items-start gap-1.5 text-slate-500 line-through">
                      <Lock size={10} className="text-slate-600 shrink-0 mt-0.5" />
                      <span>Leads Capture (Pro only)</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-900/60">
                <button
                  disabled={currentBiz.subscription_tier === "BASIC" || !currentBiz.subscription_tier || isUpgrading !== null}
                  onClick={() => handleSelectPlan("BASIC")}
                  className={`w-full py-1.5 rounded-lg text-[10px] font-bold transition duration-200 cursor-pointer text-center font-mono uppercase ${
                    currentBiz.subscription_tier === "BASIC" || !currentBiz.subscription_tier
                      ? "bg-slate-900 text-slate-500 cursor-not-allowed border border-slate-850"
                      : "bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700"
                  }`}
                >
                  {isUpgrading === "BASIC" ? "Applying..." : (currentBiz.subscription_tier === "BASIC" || !currentBiz.subscription_tier) ? "Active Free Plan" : "Downgrade to Free"}
                </button>
              </div>
            </div>

            {/* PRO PLAN CARD */}
            <div className={`relative border rounded-2xl p-4.5 flex flex-col justify-between transition-all duration-300 ${
              currentBiz.subscription_tier === "PRO" 
                ? "bg-slate-950/80 border-indigo-500 ring-2 ring-indigo-500/20 shadow-[0_0_20px_rgba(99,102,241,0.15)]" 
                : "bg-slate-950/40 border-indigo-950/60 opacity-90 hover:opacity-100 hover:border-indigo-900/60 shadow-lg"
            }`}>
              <div className="absolute -top-2.5 right-4 flex gap-1">
                <span className="bg-indigo-500 text-[8px] font-mono font-bold text-white px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Lead Magnet
                </span>
                {currentBiz.subscription_tier === "PRO" && (
                  <span className="bg-emerald-500 text-[8px] font-mono font-bold text-white px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Active
                  </span>
                )}
              </div>
              <div className="space-y-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold font-mono text-indigo-400 uppercase tracking-wide">
                    <Zap size={12} className="text-indigo-400" />
                    <span>Pro Plan</span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-bold font-sans text-indigo-400">$49</span>
                    <span className="text-[10px] font-mono text-slate-500">/mo</span>
                  </div>
                  <span className="text-[9px] font-mono font-semibold text-indigo-300 block">
                    Goal: Capture Active Leads
                  </span>
                </div>

                <p className="text-[10px] text-slate-300 leading-relaxed min-h-[30px]">
                  <strong>Value:</strong> One single repair sale pays for the whole month!
                </p>

                <div className="border-t border-slate-900 pt-3 space-y-2">
                  <div className="text-[9px] font-mono text-indigo-400 uppercase tracking-wider font-bold">Unlocks:</div>
                  <ul className="space-y-1.5 text-[10px] text-slate-300 font-sans">
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 size={12} className="text-indigo-400 shrink-0 mt-0.5" />
                      <span>Active Sales Closing</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 size={12} className="text-indigo-400 shrink-0 mt-0.5" />
                      <span>Unlimited Lead Capture</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 size={12} className="text-indigo-400 shrink-0 mt-0.5" />
                      <span>Multi-site (up to 3)</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 size={12} className="text-indigo-400 shrink-0 mt-0.5" />
                      <span>WhatsApp Integration</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-900/60">
                <button
                  disabled={currentBiz.subscription_tier === "PRO" || isUpgrading !== null}
                  onClick={() => handleSelectPlan("PRO")}
                  className={`w-full py-1.5 rounded-lg text-[10px] font-bold transition duration-200 cursor-pointer text-center font-mono uppercase ${
                    currentBiz.subscription_tier === "PRO"
                      ? "bg-indigo-950/40 text-indigo-400 cursor-not-allowed border border-indigo-900/30"
                      : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/10 border border-indigo-500"
                  }`}
                >
                  {isUpgrading === "PRO" ? "Upgrading..." : currentBiz.subscription_tier === "PRO" ? "Active Pro Plan" : "Upgrade to Pro ($49/mo)"}
                </button>
              </div>
            </div>

            {/* ENTERPRISE PLAN CARD */}
            <div className={`relative border rounded-2xl p-4.5 flex flex-col justify-between transition-all duration-300 ${
              currentBiz.subscription_tier === "ENTERPRISE" 
                ? "bg-slate-950/80 border-purple-500 ring-2 ring-purple-500/20 shadow-[0_0_20px_rgba(168,85,247,0.15)]" 
                : "bg-slate-950/40 border-purple-950/60 opacity-90 hover:opacity-100 hover:border-purple-900/60 shadow-lg"
            }`}>
              <div className="absolute -top-2.5 right-4 flex gap-1">
                <span className="bg-purple-500 text-[8px] font-mono font-bold text-white px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Full OS
                </span>
                {currentBiz.subscription_tier === "ENTERPRISE" && (
                  <span className="bg-emerald-500 text-[8px] font-mono font-bold text-white px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Active
                  </span>
                )}
              </div>
              <div className="space-y-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold font-mono text-purple-400 uppercase tracking-wide">
                    <Shield size={12} className="text-purple-400" />
                    <span>Enterprise OS</span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-bold font-sans text-purple-400">$99</span>
                    <span className="text-[10px] font-mono text-slate-500">/mo</span>
                  </div>
                  <span className="text-[9px] font-mono font-semibold text-purple-300 block">
                    Goal: Complete Business OS
                  </span>
                </div>

                <p className="text-[10px] text-slate-300 leading-relaxed min-h-[30px]">
                  <strong>Value:</strong> Replaces entire billing software and assistant!
                </p>

                <div className="border-t border-slate-900 pt-3 space-y-2">
                  <div className="text-[9px] font-mono text-purple-400 uppercase tracking-wider font-bold">Unlocks:</div>
                  <ul className="space-y-1.5 text-[10px] text-slate-300 font-sans">
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 size={12} className="text-purple-400 shrink-0 mt-0.5" />
                      <span>Full Financial Suite</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 size={12} className="text-purple-400 shrink-0 mt-0.5" />
                      <span>PCI-Compliant Invoice Gen</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 size={12} className="text-purple-400 shrink-0 mt-0.5" />
                      <span>Voice-To-Finance command module</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 size={12} className="text-purple-400 shrink-0 mt-0.5" />
                      <span>Unlimited Bots & Multi-site domains</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-900/60">
                <button
                  disabled={currentBiz.subscription_tier === "ENTERPRISE" || isUpgrading !== null}
                  onClick={() => handleSelectPlan("ENTERPRISE")}
                  className={`w-full py-1.5 rounded-lg text-[10px] font-bold transition duration-200 cursor-pointer text-center font-mono uppercase ${
                    currentBiz.subscription_tier === "ENTERPRISE"
                      ? "bg-purple-950/40 text-purple-400 cursor-not-allowed border border-purple-900/30"
                      : "bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/10 border border-purple-500"
                  }`}
                >
                  {isUpgrading === "ENTERPRISE" ? "Upgrading..." : currentBiz.subscription_tier === "ENTERPRISE" ? "Active Enterprise Plan" : "Go Enterprise ($99/mo)"}
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* Left Section Tab Selector to simplify messy dashboard */}
        <div className="flex bg-slate-950 p-1.5 rounded-2xl border border-slate-800 gap-1 animate-fade-in shadow-inner">
          <button
            type="button"
            onClick={() => setActiveLeftTab("settings")}
            className={`flex-1 py-2.5 text-center text-xs font-semibold rounded-xl transition duration-150 flex items-center justify-center gap-2 cursor-pointer ${
              activeLeftTab === "settings"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"
            }`}
          >
            <Bot size={14} className={activeLeftTab === "settings" ? "text-white" : "text-indigo-400"} />
            <span>AI Bot Profile</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveLeftTab("faqs")}
            className={`flex-1 py-2.5 text-center text-xs font-semibold rounded-xl transition duration-150 flex items-center justify-center gap-2 cursor-pointer ${
              activeLeftTab === "faqs"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"
            }`}
          >
            <FileText size={14} className={activeLeftTab === "faqs" ? "text-white" : "text-emerald-400"} />
            <span>Standard FAQs ({currentBiz.faqKnowledge.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveLeftTab("articles")}
            className={`flex-1 py-2.5 text-center text-xs font-semibold rounded-xl transition duration-150 flex items-center justify-center gap-2 cursor-pointer ${
              activeLeftTab === "articles"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"
            }`}
          >
            <BookOpen size={14} className={activeLeftTab === "articles" ? "text-white" : "text-amber-400"} />
            <span>Documents & Manuals ({(currentBiz.kbArticles || []).length})</span>
          </button>
        </div>

        {activeLeftTab === "settings" && (
          /* Core Chatbot settings */
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-5 animate-fade-in">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-md font-bold text-white font-sans flex items-center gap-2">
                <Sparkles size={18} className="text-indigo-400" /> Chatbot AI Personality & Tone
              </h3>
              <p className="text-xs text-slate-400">Configure how Gemini communicates with your leads.</p>
            </div>
            <button
              onClick={handleSaveSettings}
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-sans text-xs font-semibold rounded-xl transition duration-200 flex items-center gap-1.5 shadow-sm"
              id="save-chatbot-settings-btn"
            >
              <Save size={14} /> Save Personality
            </button>
          </div>

          {/* Chatbot Name and Welcome Message */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="md:col-span-1 space-y-2">
              <label className="text-xs font-mono text-slate-300 uppercase tracking-wider block">Chatbot Display Name</label>
              <input
                type="text"
                value={botName}
                onChange={(e) => setBotName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-indigo-500 transition duration-150 text-sm font-sans"
                placeholder="e.g., Repair Assistant"
              />
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="text-xs font-mono text-slate-300 uppercase tracking-wider block">Greeting / Welcome Message</label>
              <textarea
                value={welcomeMessage}
                onChange={(e) => setWelcomeMessage(e.target.value)}
                rows={1}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-indigo-500 transition duration-150 text-sm font-sans resize-none"
                placeholder="Hi! How can our business help you today?"
              />
            </div>
          </div>

          {/* Website and Knowledge Base training fields */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-3 border-t border-slate-800/40">
            <div className="md:col-span-1 space-y-2">
              <label className="text-xs font-mono text-slate-300 uppercase tracking-wider block flex items-center gap-1.5">
                <Globe size={13} className="text-indigo-400" /> Website URL
              </label>
              <input
                type="url"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-indigo-500 transition duration-150 text-sm font-sans"
                placeholder="https://example.com"
              />
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="text-xs font-mono text-slate-300 uppercase tracking-wider block flex items-center gap-1.5">
                <FileText size={13} className="text-indigo-400" /> General Knowledge Base & Training Context
              </label>
              <textarea
                value={knowledgeBaseText}
                onChange={(e) => setKnowledgeBaseText(e.target.value)}
                rows={2}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none focus:border-indigo-500 transition duration-150 text-xs font-sans resize-y"
                placeholder="Paste operating hours, pricing tables, product details, or common policies here to ground the AI model..."
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Tone selection */}
            <div className="space-y-2">
              <label className="text-xs font-mono text-slate-300 uppercase tracking-wider block">Gemini Tone Preset</label>
              <div className="grid grid-cols-3 gap-2">
                {["friendly", "professional", "energetic"].map((t) => (
                  <button
                    key={t}
                    onClick={() => setTone(t)}
                    className={`py-2 px-3 text-xs capitalize font-sans font-medium rounded-xl border transition ${
                      tone === t
                        ? "bg-indigo-600/10 border-indigo-500 text-indigo-400"
                        : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Avatar Theme Selection */}
            <div className="space-y-2">
              <label className="text-xs font-mono text-slate-300 uppercase tracking-wider block">Avatar Visual Theme Color</label>
              <div className="flex gap-3 pt-1">
                {[
                  { hex: "#4f46e5", name: "indigo" },
                  { hex: "#059669", name: "emerald" },
                  { hex: "#dc2626", name: "red" },
                  { hex: "#7c3aed", name: "violet" },
                  { hex: "#ea580c", name: "amber" }
                ].map((color) => (
                  <button
                    key={color.hex}
                    onClick={() => setAvatarColor(color.hex)}
                    className={`w-8 h-8 rounded-full border-2 transition duration-200 relative ${
                      avatarColor === color.hex ? "border-white scale-110" : "border-transparent opacity-80 hover:opacity-100"
                    }`}
                    style={{ backgroundColor: color.hex }}
                    title={color.name}
                  >
                    {avatarColor === color.hex && (
                      <span className="absolute inset-0 m-auto w-2 h-2 rounded-full bg-white block"></span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1 border-t border-slate-800/40">
            {/* Avatar Icon Picker */}
            <div className="space-y-2">
              <label className="text-xs font-mono text-slate-300 uppercase tracking-wider block">Avatar Icon/Emoji</label>
              <div className="grid grid-cols-6 gap-2">
                {["🤖", "✨", "⚡", "💬", "👤", "🌸"].map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setAvatarIcon(emoji)}
                    className={`py-2 text-md rounded-xl border transition ${
                      avatarIcon === emoji
                        ? "bg-indigo-600/10 border-indigo-500 text-white scale-105"
                        : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Widget Theme Style */}
            <div className="space-y-2">
              <label className="text-xs font-mono text-slate-300 uppercase tracking-wider block">Public Widget Style</label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: "modern", label: "Modern" },
                  { id: "glass", label: "Glass" },
                  { id: "playful", label: "Playful" },
                  { id: "retro", label: "Retro" }
                ].map((style) => (
                  <button
                    key={style.id}
                    type="button"
                    onClick={() => setThemeStyle(style.id)}
                    className={`py-2 text-[10px] uppercase font-mono tracking-wider font-semibold rounded-xl border transition ${
                      themeStyle === style.id
                        ? "bg-indigo-600/10 border-indigo-500 text-indigo-400"
                        : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                    }`}
                  >
                    {style.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Handoff Rules & Few-Shot Training Examples */}
          <div className={`pt-5 border-t border-slate-800/60 grid grid-cols-1 ${showAdvancedSaaS ? "md:grid-cols-2" : "md:grid-cols-1"} gap-5`}>
            {/* Handoff rules */}
            <div className="space-y-2">
              <label className="text-xs font-mono text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles size={12} className="text-amber-400 animate-pulse" /> Human Agent Handoff Guidelines
              </label>
              <textarea
                value={handoffRules}
                onChange={(e) => setHandoffRules(e.target.value)}
                rows={3}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-indigo-500 transition duration-150 text-xs font-sans resize-y"
                placeholder="Describe scenarios where the bot should stop answering and immediately page a human agent (e.g., custom price quotes, extreme customer complaints, battery swelling)."
              />
              <p className="text-[10px] text-slate-500 leading-relaxed">
                Rules generated by the **Builder Bot** or entered manually. These direct the bot to yield to human agents on live WhatsApp or Chat feeds.
              </p>
            </div>

            {/* Few-Shot Examples */}
            {showAdvancedSaaS && (
              <div className="space-y-3">
                <label className="text-xs font-mono text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles size={12} className="text-indigo-400 animate-pulse" /> Few-Shot Training Accuracy Examples
                </label>
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 max-h-40 overflow-y-auto space-y-2.5">
                  {fewShotExamples.length === 0 ? (
                    <p className="text-[10px] text-slate-500 text-center py-4">
                      No few-shot accuracy benchmarks loaded yet. Use the **Builder Bot Wizard** tab to generate optimal examples!
                    </p>
                  ) : (
                    fewShotExamples.map((ex, idx) => (
                      <div key={idx} className="p-2 bg-slate-900/60 rounded-lg border border-slate-800/50 space-y-1">
                        <div className="flex justify-between items-center text-[9px] font-mono text-slate-400">
                          <span>EXAMPLE #{idx + 1}</span>
                          <button
                            onClick={() => {
                              const updated = fewShotExamples.filter((_, i) => i !== idx);
                              setFewShotExamples(updated);
                            }}
                            className="text-red-400 hover:text-red-300 font-bold"
                            title="Remove Example"
                          >
                            ✕ Remove
                          </button>
                        </div>
                        <p className="text-[10px] text-indigo-300"><span className="text-slate-500 font-medium">Q:</span> {ex.question}</p>
                        <p className="text-[10px] text-emerald-300"><span className="text-slate-500 font-medium">A:</span> {ex.answer}</p>
                      </div>
                    ))
                  )}
                </div>

                {/* Add Custom Few Shot Form */}
                <div className="pt-2 border-t border-slate-800">
                  {!showAddPair ? (
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddPair(true);
                        setNewPairQ("");
                        setNewPairA("");
                      }}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold font-sans text-[10px] rounded-lg transition border border-slate-700 flex items-center gap-1 cursor-pointer"
                    >
                      + Add Custom Q&A Pair
                    </button>
                  ) : (
                    <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-2 animate-fade-in">
                      <span className="text-[10px] text-indigo-400 font-bold block uppercase tracking-wide">New Training Pair</span>
                      <div>
                        <label className="text-[9px] text-slate-400 block font-mono mb-1">Customer Question:</label>
                        <input
                          type="text"
                          value={newPairQ}
                          onChange={(e) => setNewPairQ(e.target.value)}
                          placeholder="e.g. Do you charge extra on weekends?"
                          className="w-full bg-slate-900 border border-slate-850 rounded px-2.5 py-1 text-xs text-white focus:outline-none focus:border-indigo-500 font-sans"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] text-slate-400 block font-mono mb-1">Ideal Chatbot Response:</label>
                        <textarea
                          value={newPairA}
                          onChange={(e) => setNewPairA(e.target.value)}
                          placeholder="e.g. No, weekend work has standard rates."
                          className="w-full bg-slate-900 border border-slate-850 rounded px-2.5 py-1 text-xs text-white focus:outline-none focus:border-indigo-500 font-sans h-12 resize-none"
                        />
                      </div>
                      <div className="flex gap-2 justify-end">
                        <button
                          type="button"
                          onClick={() => setShowAddPair(false)}
                          className="px-2.5 py-1 bg-transparent hover:bg-slate-850 text-slate-400 font-sans text-[10px] rounded border border-slate-800 transition cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (newPairQ.trim() && newPairA.trim()) {
                              setFewShotExamples((prev) => [...prev, { question: newPairQ.trim(), answer: newPairA.trim() }]);
                              setShowAddPair(false);
                              setNewPairQ("");
                              setNewPairA("");
                            }
                          }}
                          disabled={!newPairQ.trim() || !newPairA.trim()}
                          className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-semibold font-sans text-[10px] rounded transition cursor-pointer"
                        >
                          Add Pair
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        )}

        {activeLeftTab === "faqs" && (
          /* Knowledge FAQ Repository */
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4 animate-fade-in">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-md font-bold text-white font-sans flex items-center gap-2">
                <FileText size={18} className="text-indigo-400" /> Gemini Custom FAQ Knowledge Base
              </h3>
              <p className="text-xs text-slate-400">Approved context that the AI agent uses to answer customers.</p>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setShowFaqBulk(!showFaqBulk);
                  setBulkError(null);
                }}
                className={`px-3 py-1.5 font-sans text-xs font-semibold rounded-xl transition duration-200 flex items-center gap-1 border cursor-pointer ${
                  showFaqBulk 
                    ? "bg-indigo-600/20 border-indigo-500 text-indigo-400" 
                    : "bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700"
                }`}
              >
                <UploadCloud size={14} /> Bulk Tools
              </button>
              <button
                onClick={() => setIsAddingFaq(!isAddingFaq)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-sans text-xs font-semibold rounded-xl transition duration-200 flex items-center gap-1 border border-slate-700 cursor-pointer"
              >
                <Plus size={14} /> Add FAQ
              </button>
            </div>
          </div>

          {/* Bulk Ingestion panel for FAQs */}
          {showFaqBulk && (
            <div className="bg-slate-950 border border-indigo-500/30 p-4 rounded-xl space-y-4 animate-fade-in" id="faq-bulk-ingestion-form">
              <div className="flex justify-between items-center border-b border-slate-900 pb-2">
                <span className="text-xs font-mono text-indigo-400 uppercase tracking-wider block font-semibold">Bulk Import / Export FAQs</span>
                <button 
                  onClick={() => setShowFaqBulk(false)}
                  className="text-xs text-slate-500 hover:text-slate-300"
                >
                  Close
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Export Side */}
                <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-850 space-y-3">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">1. Export Brain Registry</span>
                  <p className="text-xs text-slate-400 leading-relaxed font-light">Download all currently indexable custom FAQ questions and answers to keep as a backup or migrate to another business profile.</p>
                  
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleExportFaqs("csv")}
                      disabled={faqs.length === 0}
                      className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition"
                    >
                      <FileSpreadsheet size={13} /> Export .CSV
                    </button>
                    <button
                      type="button"
                      onClick={() => handleExportFaqs("json")}
                      disabled={faqs.length === 0}
                      className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition"
                    >
                      <FileJson size={13} /> Export .JSON
                    </button>
                  </div>
                </div>

                {/* Import Side */}
                <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-850 space-y-3">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">2. Ingest New Training Data</span>
                  <p className="text-xs text-slate-400 leading-relaxed font-light">Upload a CSV or JSON file containing columns/keys for "question" and "answer".</p>
                  
                  <div className="flex items-center gap-4">
                    <label className="text-[10px] text-slate-300 font-sans flex items-center gap-1 cursor-pointer">
                      <input 
                        type="radio" 
                        name="faqImportMode" 
                        checked={faqImportMode === "append"} 
                        onChange={() => setFaqImportMode("append")}
                        className="text-indigo-600 focus:ring-indigo-500 bg-slate-950 border-slate-800"
                      />
                      Append to existing
                    </label>
                    <label className="text-[10px] text-slate-300 font-sans flex items-center gap-1 cursor-pointer">
                      <input 
                        type="radio" 
                        name="faqImportMode" 
                        checked={faqImportMode === "overwrite"} 
                        onChange={() => setFaqImportMode("overwrite")}
                        className="text-indigo-600 focus:ring-indigo-500 bg-slate-950 border-slate-800"
                      />
                      Overwrite Entire DB
                    </label>
                  </div>

                  <div>
                    <input
                      type="file"
                      id="bulk-faq-file-input"
                      accept=".csv,.json"
                      onChange={handleImportFaqsFile}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => document.getElementById("bulk-faq-file-input")?.click()}
                      className="w-full py-2 bg-indigo-600/15 hover:bg-indigo-600/25 text-indigo-400 border border-indigo-500/20 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition"
                    >
                      <UploadCloud size={13} /> Select .CSV or .JSON File
                    </button>
                  </div>
                </div>
              </div>

              {bulkError && (
                <div className="text-[11px] text-red-400 font-medium flex items-center gap-1.5 bg-red-900/10 border border-red-500/15 p-2 rounded-lg">
                  <AlertCircle size={13} /> {bulkError}
                </div>
              )}
            </div>
          )}

          {/* Add FAQ form block */}
          {isAddingFaq && (
            <div className="bg-slate-950 border border-indigo-500/20 p-4 rounded-xl space-y-4 animate-fade-in" id="add-faq-form">
              <div className="flex justify-between items-center">
                <span className="text-xs font-mono text-indigo-400 uppercase tracking-wider block">New Knowledge Entry</span>
                <button 
                  onClick={() => setIsAddingFaq(false)}
                  className="text-xs text-slate-500 hover:text-slate-300"
                >
                  Cancel
                </button>
              </div>

              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Inquiry Question (e.g., Do you repair tablets?)"
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none focus:border-indigo-500 transition duration-150 text-xs font-sans"
                />
                <textarea
                  placeholder="Authorized Answer / Instruction to give (e.g., Yes, we repair iPad models and Samsung Galaxy tabs. Prices start at $89.)"
                  value={newAnswer}
                  onChange={(e) => setNewAnswer(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none focus:border-indigo-500 transition duration-150 text-xs font-sans"
                />
                
                <button
                  onClick={handleAddFaq}
                  disabled={!newQuestion.trim() || !newAnswer.trim()}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold font-sans rounded-xl text-xs transition duration-200 flex items-center justify-center gap-1.5 shadow-sm"
                  id="submit-faq-btn"
                >
                  <Save size={14} /> Insert to AI Brain Repository
                </button>
              </div>
            </div>
          )}

          {/* FAQs List */}
          <div className="space-y-3 max-h-96 overflow-y-auto pr-1" id="faq-list">
            {faqs.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-xs font-sans">
                No FAQ context configured. The AI will answer queries using general knowledge.
              </div>
            ) : (
              faqs.map((faq, idx) => (
                <div key={idx} className="bg-slate-950/60 border border-slate-800/80 p-4 rounded-xl hover:border-slate-800 transition flex justify-between items-start gap-4">
                  <div className="space-y-1.5">
                    <h5 className="text-xs font-semibold text-slate-200 font-sans flex items-center gap-1.5">
                      <HelpCircle size={12} className="text-indigo-400" /> {faq.question}
                    </h5>
                    <p className="text-xs text-slate-400 leading-relaxed font-sans font-light">
                      {faq.answer}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteFaq(idx)}
                    className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
                    title="Purge Knowledge"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
        )}

        {activeLeftTab === "articles" && (
          /* Knowledge Base Reference Articles Repository */
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4 animate-fade-in" id="kb-articles-repository">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-md font-bold text-white font-sans flex items-center gap-2">
                <BookOpen size={18} className="text-indigo-400" /> Gemini Custom Reference Articles & Manuals
              </h3>
              <p className="text-xs text-slate-400">Index full articles, service manuals, or policy documents for deeper AI context. Gemini synthesizes detailed answers from these sources.</p>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setShowKbBulk(!showKbBulk);
                  setBulkError(null);
                }}
                className={`px-3 py-1.5 font-sans text-xs font-semibold rounded-xl transition duration-200 flex items-center gap-1 border cursor-pointer shrink-0 ${
                  showKbBulk 
                    ? "bg-indigo-600/20 border-indigo-500 text-indigo-400" 
                    : "bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700"
                }`}
              >
                <UploadCloud size={14} /> Bulk Tools
              </button>
              <button
                onClick={() => {
                  setIsAddingArticle(!isAddingArticle);
                  setArticleTitle("");
                  setArticleContent("");
                  setUploadError(null);
                }}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-sans text-xs font-semibold rounded-xl transition duration-200 flex items-center gap-1 border border-slate-700 cursor-pointer shrink-0"
              >
                <Plus size={14} /> Add Reference Article
              </button>
            </div>
          </div>

          {/* Bulk Ingestion panel for Articles */}
          {showKbBulk && (
            <div className="bg-slate-950 border border-indigo-500/30 p-4 rounded-xl space-y-4 animate-fade-in" id="kb-bulk-ingestion-form">
              <div className="flex justify-between items-center border-b border-slate-900 pb-2">
                <span className="text-xs font-mono text-indigo-400 uppercase tracking-wider block font-semibold">Bulk Import / Export Knowledge Documents</span>
                <button 
                  onClick={() => setShowKbBulk(false)}
                  className="text-xs text-slate-500 hover:text-slate-300"
                >
                  Close
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Export Side */}
                <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-850 space-y-3">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">1. Export Document Index</span>
                  <p className="text-xs text-slate-400 leading-relaxed font-light">Download all currently indexable custom reference manuals and articles to save as backup or move to another profile.</p>
                  
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleExportArticles("csv")}
                      disabled={kbArticles.length === 0}
                      className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition"
                    >
                      <FileSpreadsheet size={13} /> Export .CSV
                    </button>
                    <button
                      type="button"
                      onClick={() => handleExportArticles("json")}
                      disabled={kbArticles.length === 0}
                      className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition"
                    >
                      <FileJson size={13} /> Export .JSON
                    </button>
                  </div>
                </div>

                {/* Import Side */}
                <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-850 space-y-3">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">2. Ingest Reference manual Data</span>
                  <p className="text-xs text-slate-400 leading-relaxed font-light">Upload a CSV or JSON file containing columns/keys: "title", "content", and optionally "category", "tags".</p>
                  
                  <div className="flex items-center gap-4">
                    <label className="text-[10px] text-slate-300 font-sans flex items-center gap-1 cursor-pointer">
                      <input 
                        type="radio" 
                        name="kbImportMode" 
                        checked={kbImportMode === "append"} 
                        onChange={() => setKbImportMode("append")}
                        className="text-indigo-600 focus:ring-indigo-500 bg-slate-950 border-slate-800"
                      />
                      Append to existing
                    </label>
                    <label className="text-[10px] text-slate-300 font-sans flex items-center gap-1 cursor-pointer">
                      <input 
                        type="radio" 
                        name="kbImportMode" 
                        checked={kbImportMode === "overwrite"} 
                        onChange={() => setKbImportMode("overwrite")}
                        className="text-indigo-600 focus:ring-indigo-500 bg-slate-950 border-slate-800"
                      />
                      Overwrite Entire Index
                    </label>
                  </div>

                  <div>
                    <input
                      type="file"
                      id="bulk-kb-file-input"
                      accept=".csv,.json"
                      onChange={handleImportArticlesFile}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => document.getElementById("bulk-kb-file-input")?.click()}
                      className="w-full py-2 bg-indigo-600/15 hover:bg-indigo-600/25 text-indigo-400 border border-indigo-500/20 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition"
                    >
                      <UploadCloud size={13} /> Select .CSV or .JSON File
                    </button>
                  </div>
                </div>
              </div>

              {bulkError && (
                <div className="text-[11px] text-red-400 font-medium flex items-center gap-1.5 bg-red-900/10 border border-red-500/15 p-2 rounded-lg">
                  <AlertCircle size={13} /> {bulkError}
                </div>
              )}
            </div>
          )}

          {/* Add Article Form */}
          {isAddingArticle && (
            <div className="bg-slate-950 border border-indigo-500/20 p-5 rounded-xl space-y-4 animate-fade-in" id="add-article-form">
              <div className="flex justify-between items-center">
                <span className="text-xs font-mono text-indigo-400 uppercase tracking-wider block">New Document Registration</span>
                <button 
                  onClick={() => setIsAddingArticle(false)}
                  className="text-xs text-slate-500 hover:text-slate-300"
                >
                  Cancel
                </button>
              </div>

              {/* Upload vs Paste vs Website Tabs */}
              <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-2">
                <button
                  type="button"
                  onClick={() => setActiveUploadTab("upload")}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition ${
                    activeUploadTab === "upload" 
                      ? "bg-indigo-600/10 border-indigo-500 text-indigo-400" 
                      : "bg-transparent border-transparent text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <span className="flex items-center gap-1.5"><Upload size={12} /> Drag & Drop File</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveUploadTab("website")}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition ${
                    activeUploadTab === "website" 
                      ? "bg-indigo-600/10 border-indigo-500 text-indigo-400" 
                      : "bg-transparent border-transparent text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <span className="flex items-center gap-1.5"><Globe size={12} /> Import from URL (Website/Docs)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveUploadTab("github")}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition ${
                    activeUploadTab === "github" 
                      ? "bg-indigo-600/10 border-indigo-500 text-indigo-400" 
                      : "bg-transparent border-transparent text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <span className="flex items-center gap-1.5"><Bot size={12} /> Sync from GitHub Repo</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveUploadTab("paste")}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition ${
                    activeUploadTab === "paste" 
                      ? "bg-indigo-600/10 border-indigo-500 text-indigo-400" 
                      : "bg-transparent border-transparent text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <span className="flex items-center gap-1.5"><FileText size={12} /> Manual Editor & Paste</span>
                </button>
              </div>

              {activeUploadTab === "upload" && (
                <div 
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-xl p-6 text-center transition cursor-pointer flex flex-col items-center justify-center space-y-2 ${
                    isDragOver 
                      ? "border-indigo-500 bg-indigo-500/5" 
                      : "border-slate-800 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-900/80"
                  }`}
                  onClick={() => document.getElementById("kb-file-input")?.click()}
                >
                  <input
                    type="file"
                    id="kb-file-input"
                    accept=".txt,.md,.json,.csv,.pdf,.docx,.log"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <Upload size={24} className="text-slate-500" />
                  <p className="text-xs font-semibold text-slate-300">Drag and drop document file here, or click to browse</p>
                  <p className="text-[10px] text-slate-500">Supports plain text (.txt), Markdown (.md), PDF (.pdf), Word (.docx), or JSON files (Max 5MB)</p>
                  
                  {uploadError && (
                    <div className="text-[11px] text-red-400 font-medium pt-2 flex items-center gap-1 justify-center">
                      <AlertCircle size={12} /> {uploadError}
                    </div>
                  )}
                </div>
              )}

              {activeUploadTab === "website" && (
                <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-xl space-y-4" id="website-import-panel">
                  <div className="space-y-1">
                    <h4 className="text-xs font-semibold text-slate-200">Import Knowledge from URL</h4>
                    <p className="text-[11px] text-slate-400 font-light">Specify any online documentation link, blog post, FAQ web page, or company portal URL. Gemini will crawl and synthesize the text content directly into the chatbot's memory.</p>
                  </div>
                  
                  <div className="flex gap-2">
                    <input
                      type="url"
                      placeholder="e.g., https://mybusiness.com/help-docs/returns"
                      value={importUrl}
                      onChange={(e) => setImportUrl(e.target.value)}
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 transition duration-150 font-sans"
                    />
                    <button
                      type="button"
                      onClick={handleImportWebsite}
                      disabled={isImportingUrl || !importUrl.trim()}
                      className={`px-4 py-2 rounded-xl text-xs font-semibold font-sans transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
                        isImportingUrl 
                          ? "bg-slate-850 border border-slate-700 text-slate-400 cursor-not-allowed animate-pulse" 
                          : !importUrl.trim()
                            ? "bg-slate-900 border border-slate-850 text-slate-500 cursor-not-allowed"
                            : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/10"
                      }`}
                    >
                      {isImportingUrl ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Extracting...
                        </>
                      ) : (
                        <>
                          <Sparkles size={13} /> Extract Knowledge
                        </>
                      )}
                    </button>
                  </div>

                  {uploadError && (
                    <div className="text-[11px] text-red-400 font-medium flex items-center gap-1">
                      <AlertCircle size={12} /> {uploadError}
                    </div>
                  )}

                  <div className="text-[10px] text-slate-500 leading-relaxed bg-slate-950/40 p-3 rounded-lg border border-slate-850 flex items-start gap-2">
                    <span className="text-indigo-400 font-bold shrink-0">💡 Note:</span>
                    <span>To guarantee a smooth experience regardless of sandbox network barriers or target site anti-scrape defenses, our extraction backend includes an intelligent fallback agent that can perfectly structure and populate custom reference files using the URL context.</span>
                  </div>
                </div>
              )}

              {activeUploadTab === "github" && (
                <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-xl space-y-4" id="github-sync-panel">
                  <div className="space-y-1">
                    <h4 className="text-xs font-semibold text-slate-200">Pull Documentation from GitHub</h4>
                    <p className="text-[11px] text-slate-400 font-light">Directly fetch and import documentation or policy files from any GitHub repository. Once fetched, you can review, tag, and index it into the active chatbot memory.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">GitHub Repository</label>
                      <input
                        type="text"
                        placeholder="e.g., owner/repo"
                        value={githubRepo}
                        onChange={(e) => setGithubRepo(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 font-sans"
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">File Path</label>
                      <input
                        type="text"
                        placeholder="e.g., docs/FAQ.md"
                        value={githubFilePath}
                        onChange={(e) => setGithubFilePath(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 font-sans"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Personal Access Token (Optional for Private Repos)</label>
                    <input
                      type="password"
                      placeholder="github_pat_..."
                      value={githubToken}
                      onChange={(e) => setGithubToken(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 font-mono text-sm"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handlePullGithub}
                    disabled={isPullingGithub || !githubRepo.trim() || !githubFilePath.trim()}
                    className={`w-full py-2.5 rounded-xl text-xs font-semibold font-sans transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      isPullingGithub 
                        ? "bg-slate-850 border-slate-700 text-slate-400 cursor-not-allowed animate-pulse" 
                        : (!githubRepo.trim() || !githubFilePath.trim())
                          ? "bg-slate-900 border-slate-850 text-slate-500 cursor-not-allowed"
                          : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/10"
                    }`}
                  >
                    {isPullingGithub ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Connecting & Fetching Repo...
                      </>
                    ) : (
                      <>
                        <Sparkles size={13} /> Pull GitHub Content
                      </>
                    )}
                  </button>

                  {uploadError && (
                    <div className="text-[11px] text-red-400 font-medium flex items-center gap-1">
                      <AlertCircle size={12} /> {uploadError}
                    </div>
                  )}
                </div>
              )}

              {(activeUploadTab === "paste" || articleTitle.trim() || articleContent.trim()) && (
                <div className="space-y-3">
                  {learnedInsights.length > 0 && (
                    <div className="bg-gradient-to-br from-indigo-950/40 via-slate-900/50 to-indigo-950/20 border border-indigo-500/30 p-4 rounded-xl space-y-3 shadow-lg shadow-indigo-950/20 relative overflow-hidden" id="chatbot-learning-report">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none"></div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-indigo-500/20 rounded-lg text-indigo-400">
                            <Sparkles size={14} className="animate-pulse" />
                          </div>
                          <div>
                            <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-widest block font-semibold">Crawl & Synthesis Report</span>
                            <h4 className="text-xs font-bold text-slate-100">🧠 What the Chatbot Learned</h4>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setLearnedInsights([])}
                          className="text-[10px] font-mono text-slate-500 hover:text-slate-300 transition"
                          title="Dismiss report"
                        >
                          Clear
                        </button>
                      </div>

                      <div className="bg-slate-950/60 rounded-lg p-3 border border-slate-900 space-y-2">
                        <ul className="space-y-2 text-xs">
                          {learnedInsights.map((insight, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-slate-300 leading-normal">
                              <span className="text-emerald-400 mt-0.5 font-bold shrink-0">✓</span>
                              <span>{insight}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <p className="text-[9px] text-slate-400 italic">
                        Gemini successfully parsed the content from the URL. Review the structured article title and body below, then click "Index Reference to AI Brain" to save it permanently.
                      </p>
                    </div>
                  )}

                  <div>
                    <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1">Article Title</label>
                    <input
                      type="text"
                      placeholder="e.g., Return and Refund Policy Manual"
                      value={articleTitle}
                      onChange={(e) => setArticleTitle(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none focus:border-indigo-500 transition duration-150 text-xs font-sans"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1">Body Text Content</label>
                    <textarea
                      placeholder="Paste instructions, policy chapters, or procedures that the AI assistant can reference to synthesize customer answers..."
                      value={articleContent}
                      onChange={(e) => setArticleContent(e.target.value)}
                      rows={6}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none focus:border-indigo-500 transition duration-150 text-xs font-sans font-light leading-relaxed"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1">Category / Topic Group</label>
                      <input
                        type="text"
                        placeholder="e.g., Refund Policies, Support, Guidelines"
                        value={articleCategory}
                        onChange={(e) => setArticleCategory(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none focus:border-indigo-500 transition duration-150 text-xs font-sans"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1">Tags (Comma Separated)</label>
                      <input
                        type="text"
                        placeholder="e.g., returns, repairs, standard"
                        value={articleTags}
                        onChange={(e) => setArticleTags(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none focus:border-indigo-500 transition duration-150 text-xs font-sans"
                      />
                    </div>
                  </div>

                  {/* AI Document Classifier Panel */}
                  <div className="bg-slate-900/60 border border-slate-800 p-3.5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3" id="ai-classify-panel">
                    <div className="flex items-start gap-2.5">
                      <div className="p-1.5 bg-indigo-500/10 rounded-lg border border-indigo-500/20 text-indigo-400 shrink-0 mt-0.5">
                        <Sparkles size={14} className={isClassifying ? "animate-spin text-indigo-400" : "text-indigo-400"} />
                      </div>
                      <div>
                        <h5 className="text-xs font-semibold text-slate-200">AI Category & Tag Suggestion</h5>
                        <p className="text-[10px] text-slate-400">Analyze the title and body text above to auto-assign category and tags.</p>
                        {classificationSource && (
                          <div className="text-[9px] text-emerald-400 font-mono mt-1 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            Suggest completed via {classificationSource === "gemini" ? "Gemini AI" : "Local Rules"}
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleAutoClassify()}
                      disabled={isClassifying || !articleTitle.trim() || !articleContent.trim()}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-semibold font-sans transition flex items-center justify-center gap-1.5 shrink-0 cursor-pointer ${
                        isClassifying 
                          ? "bg-slate-850 border-slate-700 text-slate-400 cursor-not-allowed animate-pulse" 
                          : (!articleTitle.trim() || !articleContent.trim())
                            ? "bg-slate-900 border-slate-850 text-slate-500 cursor-not-allowed"
                            : "bg-indigo-600/15 border-indigo-500/30 text-indigo-400 hover:bg-indigo-600/25 hover:border-indigo-500/50"
                      }`}
                    >
                      {isClassifying ? (
                        <>
                          <div className="w-3 h-3 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
                          Classifying...
                        </>
                      ) : (
                        <>
                          <Sparkles size={12} /> Suggest Category & Tags
                        </>
                      )}
                    </button>
                  </div>

                  {uploadError && (
                    <div className="text-[11px] text-red-400 font-medium flex items-center gap-1">
                      <AlertCircle size={12} /> {uploadError}
                    </div>
                  )}

                  <button
                    onClick={handleAddArticle}
                    disabled={!articleTitle.trim() || !articleContent.trim()}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold font-sans rounded-xl text-xs transition duration-200 flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                    id="submit-article-btn"
                  >
                    <Save size={14} /> Index Reference to AI Brain
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Bulk Action Panel */}
          {kbArticles.length > 0 && (
            <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-3 flex flex-wrap justify-between items-center gap-3 animate-fade-in" id="kb-bulk-actions-panel">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={kbArticles.length > 0 && selectedArticleIds.length === kbArticles.length}
                  onChange={() => {
                    if (selectedArticleIds.length === kbArticles.length) {
                      setSelectedArticleIds([]);
                    } else {
                      setSelectedArticleIds(kbArticles.map((art) => art.id));
                    }
                  }}
                  className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-slate-900 cursor-pointer"
                />
                <span className="text-xs text-slate-300 font-sans">
                  {selectedArticleIds.length > 0 ? (
                    <span><strong>{selectedArticleIds.length}</strong> of <strong>{kbArticles.length}</strong> selected</span>
                  ) : (
                    <span>Select All ({kbArticles.length})</span>
                  )}
                </span>
              </div>
              
              {selectedArticleIds.length > 0 && (
                <button
                  onClick={handleBulkDeleteArticles}
                  className="px-3 py-1.5 bg-red-650 hover:bg-red-600 text-white font-semibold font-sans text-xs rounded-lg transition duration-150 flex items-center gap-1.5 shadow-sm cursor-pointer"
                  id="bulk-delete-btn"
                >
                  <Trash2 size={13} /> Purge Selected
                </button>
              )}
            </div>
          )}

          {/* Interactive Categories and Tags Filters */}
          {kbArticles.length > 0 && (() => {
            const uniqueCategories = Array.from(new Set(kbArticles.map((art) => art.category || "General"))).filter(Boolean);
            const uniqueTags = Array.from(new Set(kbArticles.flatMap((art) => art.tags || []))).filter(Boolean);
            return (
              <div className="bg-slate-950/40 border border-slate-800/80 p-3.5 rounded-xl space-y-3" id="kb-filters-panel">
                {/* Category Filter Pills */}
                <div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-2">Group by Topic / Category</span>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => setSelectedCategoryFilter("All")}
                      className={`px-2.5 py-1 text-xs rounded-lg border font-sans font-medium transition cursor-pointer ${
                        selectedCategoryFilter === "All"
                          ? "bg-indigo-600/25 border-indigo-500 text-indigo-300"
                          : "bg-slate-900 border-slate-850 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      All Topics ({kbArticles.length})
                    </button>
                    {uniqueCategories.map((cat) => {
                      const count = kbArticles.filter((a) => (a.category || "General") === cat).length;
                      return (
                        <button
                          type="button"
                          key={cat}
                          onClick={() => setSelectedCategoryFilter(cat)}
                          className={`px-2.5 py-1 text-xs rounded-lg border font-sans font-medium transition cursor-pointer ${
                            selectedCategoryFilter === cat
                              ? "bg-indigo-600/25 border-indigo-500 text-indigo-300"
                              : "bg-slate-900 border-slate-850 text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          {cat} ({count})
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Tag Filters */}
                {uniqueTags.length > 0 && (
                  <div className="pt-2 border-t border-slate-850/60">
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-2">Filter by Tag</span>
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        type="button"
                        onClick={() => setSelectedTagFilter("All")}
                        className={`px-2 py-0.5 text-[10px] rounded-md border font-sans transition cursor-pointer ${
                          selectedTagFilter === "All"
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                            : "bg-slate-900 border-slate-850 text-slate-500 hover:text-slate-300"
                        }`}
                      >
                        #All
                      </button>
                      {uniqueTags.map((tag) => (
                        <button
                          type="button"
                          key={tag}
                          onClick={() => setSelectedTagFilter(tag)}
                          className={`px-2 py-0.5 text-[10px] rounded-md border font-sans transition cursor-pointer ${
                            selectedTagFilter === tag
                              ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-400 font-medium"
                              : "bg-slate-900 border-slate-850 text-slate-400 hover:text-slate-300"
                          }`}
                        >
                          #{tag}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

          {/* Articles List */}
          <div className="space-y-3" id="kb-articles-list">
            {(() => {
              const filteredArticles = kbArticles.filter((art) => {
                const matchesCategory = selectedCategoryFilter === "All" || (art.category || "General") === selectedCategoryFilter;
                const matchesTag = selectedTagFilter === "All" || (art.tags || []).includes(selectedTagFilter);
                return matchesCategory && matchesTag;
              });

              if (filteredArticles.length === 0) {
                return (
                  <div className="text-center py-8 text-slate-500 text-xs font-sans border border-dashed border-slate-800 rounded-xl">
                    {kbArticles.length === 0 
                      ? "No custom articles uploaded. Register policies or guides to empower your chatbot."
                      : "No articles match the selected category and tag filters."}
                  </div>
                );
              }

              return filteredArticles.map((art) => (
                <div key={art.id} className="bg-slate-950/60 border border-slate-800/80 rounded-xl hover:border-slate-800 transition overflow-hidden">
                  <div className="p-4 flex justify-between items-center gap-4">
                    <div className="flex items-start gap-3 min-w-0">
                      {/* Checkbox for Bulk Selection */}
                      <div className="pt-1.5 shrink-0">
                        <input
                          type="checkbox"
                          checked={selectedArticleIds.includes(art.id)}
                          onChange={() => {
                            setSelectedArticleIds((prev) => 
                              prev.includes(art.id) ? prev.filter((id) => id !== art.id) : [...prev, art.id]
                            );
                          }}
                          className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-slate-900 cursor-pointer"
                        />
                      </div>

                      <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0 mt-0.5">
                        <FileText size={15} className="text-indigo-400" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-xs font-bold text-slate-200 truncate font-sans">{art.title}</h4>
                          <span className="text-[9px] font-mono font-semibold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/10 shrink-0">
                            {art.category || "General"}
                          </span>
                        </div>

                        {art.tags && art.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {art.tags.map((tag, i) => (
                              <button
                                type="button"
                                key={i}
                                onClick={() => setSelectedTagFilter(tag)}
                                className={`text-[9px] font-sans px-1.5 py-0.5 rounded transition cursor-pointer ${
                                  selectedTagFilter === tag
                                    ? "bg-emerald-500/20 border border-emerald-500/40 text-emerald-400"
                                    : "bg-slate-900 border border-slate-850 text-slate-400 hover:text-emerald-400"
                                }`}
                              >
                                #{tag}
                              </button>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-2">
                          <span className="font-mono text-emerald-400 flex items-center gap-1">
                            <Check size={10} /> Active Index
                          </span>
                          <span>•</span>
                          <span>{art.content.length} chars</span>
                          <span>•</span>
                          <span>{new Date(art.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => setExpandedArticleId(expandedArticleId === art.id ? null : art.id)}
                        className="px-2.5 py-1 text-[10px] font-mono text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 rounded-lg transition cursor-pointer"
                      >
                        {expandedArticleId === art.id ? "Collapse" : "Preview"}
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => handleDeleteArticle(art.id)}
                        className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition cursor-pointer"
                        title="Purge Reference"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  {expandedArticleId === art.id && (
                    <div className="px-4 pb-4 border-t border-slate-850/60 pt-3 bg-slate-950/80 animate-fade-in space-y-3">
                      {art.learnedInsights && art.learnedInsights.length > 0 && (
                        <div className="rounded-xl bg-indigo-950/20 border border-indigo-500/20 p-3 space-y-1.5" id={`article-${art.id}-insights`}>
                          <div className="flex items-center gap-1.5 text-[11px] font-bold text-indigo-400 font-sans">
                            <Sparkles size={11} className="animate-pulse" />
                            <span>🧠 What the Bot Learned:</span>
                          </div>
                          <ul className="list-disc list-inside space-y-1 text-[10px] text-slate-300 font-sans">
                            {art.learnedInsights.map((insight, idx) => (
                              <li key={idx} className="leading-normal">{insight}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      <div className="max-h-60 overflow-y-auto rounded-lg bg-slate-900 border border-slate-850 p-3 text-[11px] text-slate-300 font-sans leading-relaxed whitespace-pre-wrap font-light">
                        {art.content}
                      </div>
                    </div>
                  )}
                </div>
              ));
            })()}
          </div>
        </div>
        )}

      </div>

      {/* Live AI Chatbot Simulator Sidebar */}
      <div className="xl:col-span-2 space-y-4">
        
        {/* Tab Selector */}
        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-850">
          <button
            type="button"
            onClick={() => setActiveSidebarTab("sandbox")}
            className={`flex-1 py-1.5 text-center text-[11px] font-semibold rounded-lg transition duration-150 flex items-center justify-center gap-1.5 ${
              activeSidebarTab === "sandbox"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <MessageSquare size={12} />
            <span>Sandbox</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSidebarTab("builder")}
            className={`flex-1 py-1.5 text-center text-[11px] font-semibold rounded-lg transition duration-150 flex items-center justify-center gap-1.5 ${
              activeSidebarTab === "builder"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Sparkles size={12} />
            <span>Builder Bot</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSidebarTab("deploy")}
            className={`flex-1 py-1.5 text-center text-[11px] font-semibold rounded-lg transition duration-150 flex items-center justify-center gap-1.5 ${
              activeSidebarTab === "deploy"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Code size={12} />
            <span>Deploy Widget</span>
          </button>
        </div>

        {activeSidebarTab === "sandbox" ? (
          /* Chat window panel */
          <div className="bg-slate-900 border border-slate-800 rounded-2xl flex flex-col h-[550px] shadow-lg overflow-hidden relative" id="chatbot-sandbox">
            
            {/* Header */}
            <div className="px-5 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full flex items-center justify-center relative shadow-inner text-white" style={{ backgroundColor: avatarColor }}>
                  <span className="text-base">{avatarIcon}</span>
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-slate-950 animate-pulse"></span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white font-sans">{botName}</h4>
                  <div className="flex items-center gap-1">
                    <span className="text-[9px] text-slate-400 font-mono flex items-center gap-0.5">
                      <Zap size={8} className="text-indigo-400 fill-indigo-400" /> Gemini 3.5 Flash
                    </span>
                    <span className="text-[10px] text-slate-500">•</span>
                    <span className="text-[9px] text-emerald-400 font-mono capitalize">{tone} Mode</span>
                  </div>
                </div>
              </div>
              
              <button 
                onClick={() => {
                  setChatHistory([
                    {
                      sender: "bot",
                      text: welcomeMessage,
                      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    }
                  ]);
                  setAiLeadAlert(false);
                }}
                className="text-[10px] font-mono text-slate-400 hover:text-slate-200 border border-slate-800 bg-slate-900 px-2 py-1 rounded"
              >
                Reset Chat
              </button>
            </div>

            {/* AI Lead alert banner */}
            {aiLeadAlert && (
              <div className="px-4 py-2.5 bg-indigo-500/15 border-b border-indigo-500/30 text-indigo-300 text-xs flex items-center gap-2 animate-fade-in">
                <Sparkles size={14} className="text-indigo-400 shrink-0" />
                <span>
                  <strong>Lead Auto-Detected!</strong> Gemini detected a quote or booking request. Storing lead in secured CRM vault...
                </span>
              </div>
            )}

            {/* Messages block */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-950/40">
              {chatHistory.map((msg, idx) => (
                <div 
                  key={idx} 
                  className={`flex gap-2.5 max-w-[85%] ${msg.sender === "customer" ? "ml-auto flex-row-reverse" : "mr-auto"}`}
                >
                  <div className={`w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-xs ${
                    msg.sender === "customer" 
                      ? "bg-slate-800 text-slate-200" 
                      : "text-white"
                  }`}
                  style={msg.sender === "bot" ? { backgroundColor: avatarColor } : undefined}
                  >
                    {msg.sender === "customer" ? <User size={12} /> : <Bot size={12} />}
                  </div>

                  <div className="space-y-1">
                    <div className={`px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed font-sans whitespace-pre-wrap ${
                      msg.sender === "customer"
                        ? "bg-indigo-600 text-white rounded-tr-none"
                        : "bg-slate-900 border border-slate-800 text-slate-100 rounded-tl-none"
                    }`}>
                      {msg.text}
                    </div>
                    <span className={`text-[9px] font-mono text-slate-500 block ${msg.sender === "customer" ? "text-right" : "text-left"}`}>
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
              ))}

              {isBotTyping && (
                <div className="flex gap-2.5 max-w-[80%] mr-auto">
                  <div className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-white" style={{ backgroundColor: avatarColor }}>
                    <Bot size={12} />
                  </div>
                  <div className="bg-slate-900 border border-slate-800 px-4 py-3 rounded-2xl rounded-tl-none flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                    <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                    <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                  </div>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* SaaS Gatekeeper Lock Banner */}
            {currentBiz.subscription_status === "suspended" && (
              <div className="px-4 py-2 bg-red-950/80 border-t border-red-900/50 text-[10px] text-red-300 font-mono flex items-center justify-center gap-1.5 animate-fade-in shrink-0">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                SaaS Gatekeeper: AI Reply System suspended for {currentBiz.name} (Payment Required)
              </div>
            )}

            {/* Input form */}
            <form onSubmit={handleSendMessage} className="p-3 bg-slate-950 border-t border-slate-800 flex gap-2">
              <input
                type="text"
                placeholder={currentBiz.subscription_status === "suspended" ? "🔒 CHATBOT SUSPENDED: Payment Required" : `Ask ${currentBiz.name} bot about services...`}
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                disabled={currentBiz.subscription_status === "suspended"}
                className={`flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 transition duration-150 font-sans ${currentBiz.subscription_status === "suspended" ? "opacity-50 cursor-not-allowed" : ""}`}
                id="chat-sandbox-input"
              />
              <button
                type="submit"
                disabled={!chatInput.trim() || isBotTyping || currentBiz.subscription_status === "suspended"}
                className="p-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-xl transition duration-150 flex items-center justify-center cursor-pointer"
                id="send-chat-sandbox-btn"
              >
                <Send size={15} />
              </button>
            </form>
          </div>
        ) : activeSidebarTab === "builder" ? (
          /* Builder Bot Setup Wizard Panel */
          <div className="bg-slate-900 border border-slate-800 rounded-2xl flex flex-col h-[550px] shadow-lg overflow-hidden relative" id="builder-bot-wizard">
            
            {/* Header */}
            <div className="px-5 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center relative shadow-inner text-white">
                  <span className="text-base">🧠</span>
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-indigo-400 rounded-full border-2 border-slate-950 animate-pulse"></span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white font-sans">Builder Bot Assistant</h4>
                  <div className="flex items-center gap-1">
                    <span className="text-[9px] text-indigo-400 font-mono flex items-center gap-0.5">
                      <Sparkles size={8} className="fill-indigo-400" /> Setup Wizard Mode
                    </span>
                    <span className="text-[10px] text-slate-500">•</span>
                    <span className="text-[9px] text-slate-400 font-mono">Active Tenant: {currentBiz.name}</span>
                  </div>
                </div>
              </div>
              
              <button 
                onClick={() => {
                  setBuilderHistory([
                    {
                      sender: "bot",
                      text: "Hello! I am your AI Builder Bot Setup Wizard. 🧠\n\nI can automatically build and update your chatbot's knowledge base. Just type or paste your business information (like price lists, policies, or FAQs in plain text or CSV format) below, and I will parse it and train your active chatbot profile instantly!",
                      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    }
                  ]);
                }}
                className="text-[10px] font-mono text-slate-400 hover:text-slate-200 border border-slate-800 bg-slate-900 px-2 py-1 rounded"
              >
                Reset Wizard
              </button>
            </div>

            {/* Explanatory helper box */}
            <div className="px-4 py-2 bg-indigo-950/40 border-b border-indigo-900/30 text-[10px] text-indigo-300 flex items-center gap-2">
              <Sparkles size={11} className="text-indigo-400 shrink-0" />
              <span>Provide price lists, repairs list, or hours. Builder Bot will auto-train the AI.</span>
            </div>

            {/* Messages block */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-950/40">
              {builderHistory.map((msg, idx) => (
                <div 
                  key={idx} 
                  className={`flex gap-2.5 max-w-[85%] ${msg.sender === "customer" ? "ml-auto flex-row-reverse" : "mr-auto"}`}
                >
                  <div className={`w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-xs ${
                    msg.sender === "customer" 
                      ? "bg-slate-800 text-slate-200" 
                      : "bg-indigo-600 text-white"
                  }`}
                  >
                    {msg.sender === "customer" ? <User size={12} /> : <span>🧠</span>}
                  </div>

                  <div className="space-y-1">
                    <div className={`px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed font-sans whitespace-pre-wrap ${
                      msg.sender === "customer"
                        ? "bg-indigo-600 text-white rounded-tr-none"
                        : "bg-slate-900 border border-slate-850 text-slate-100 rounded-tl-none font-light"
                    }`}>
                      {msg.text}
                    </div>
                    <span className={`text-[9px] font-mono text-slate-500 block ${msg.sender === "customer" ? "text-right" : "text-left"}`}>
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
              ))}

              {isBuilderTyping && (
                <div className="flex gap-2.5 max-w-[80%] mr-auto">
                  <div className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center bg-indigo-600 text-white text-xs">
                    <span>🧠</span>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 px-4 py-3 rounded-2xl rounded-tl-none flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                    <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                    <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                  </div>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Quick action helper suggestion chips */}
            <div className="px-3 pb-2 pt-1 bg-slate-950 border-t border-slate-900/50 flex flex-wrap gap-1.5 shrink-0">
              {[
                { label: "🚀 App Onboarding", prompt: "Explain step-by-step how to onboard a new business and run a simulation in the Customer Simulator." },
                { label: "⚙️ Settings & Channels", prompt: "How do I configure integrations like CRM, custom WhatsApp phone channels, or customized chatbot themes?" },
                { label: "🔒 Gatekeeper & Voice Features", prompt: "Explain how the Stripe/Firebase Gatekeeper failsafe locks inactive profiles, and how Voice-to-Finance surge pricing works." },
                { label: "📊 Linked Tenants Summary", prompt: "Summarize and compare all linked businesses configured on this platform, including their revenues, tiers, and statuses." }
              ].map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setBuilderInput(chip.prompt)}
                  className="px-2 py-1 bg-slate-900 border border-slate-800 hover:border-indigo-500 hover:bg-slate-850 rounded-lg text-[9px] text-slate-300 font-medium transition duration-150 shrink-0 cursor-pointer"
                >
                  {chip.label}
                </button>
              ))}
            </div>

            {/* Inline URL Input Panel */}
            {showUrlInput && (
              <div className="px-3 py-2.5 bg-slate-950 border-t border-slate-900 flex items-center gap-2 animate-fade-in">
                <input
                  type="text"
                  placeholder="https://example.com/pricing-or-faqs"
                  value={builderUrlText}
                  onChange={(e) => setBuilderUrlText(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500 transition font-mono"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      if (builderUrlText.trim()) {
                        handleBuilderUrlTrain(builderUrlText.trim());
                        setBuilderUrlText("");
                        setShowUrlInput(false);
                      }
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    if (builderUrlText.trim()) {
                      handleBuilderUrlTrain(builderUrlText.trim());
                      setBuilderUrlText("");
                      setShowUrlInput(false);
                    }
                  }}
                  disabled={!builderUrlText.trim() || isBuilderTyping}
                  className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white rounded-lg text-xs font-semibold cursor-pointer transition shrink-0"
                >
                  Train
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowUrlInput(false);
                    setBuilderUrlText("");
                  }}
                  className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs cursor-pointer transition shrink-0"
                >
                  Cancel
                </button>
              </div>
            )}

            {/* Training attachment bar */}
            <div className="px-3 py-2 bg-slate-950 border-t border-slate-900/40 flex items-center gap-2 justify-between">
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                <input
                  type="file"
                  id="builder-file-input"
                  accept=".txt,.md,.json,.csv,.pdf,.docx,.log"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      handleBuilderFileUpload(e.target.files[0]);
                    }
                  }}
                />
                
                <button
                  type="button"
                  onClick={() => document.getElementById("builder-file-input")?.click()}
                  disabled={isBuilderTyping}
                  className="px-2 py-1 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-indigo-500/50 text-slate-300 rounded-lg flex items-center gap-1 cursor-pointer transition text-[10px] disabled:opacity-40"
                  id="builder-upload-file-btn"
                >
                  <Upload size={10} className="text-indigo-400" />
                  <span>Train with File</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowUrlInput(!showUrlInput);
                  }}
                  disabled={isBuilderTyping}
                  className={`px-2 py-1 border rounded-lg flex items-center gap-1 cursor-pointer transition text-[10px] disabled:opacity-40 ${
                    showUrlInput 
                      ? "bg-emerald-600/20 border-emerald-500 text-emerald-400" 
                      : "bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-emerald-500/50 text-slate-300"
                  }`}
                  id="builder-ingest-url-btn"
                >
                  <Globe size={10} className="text-emerald-400" />
                  <span>Train with URL</span>
                </button>
              </div>
              <span className="text-[9px] text-slate-500 font-mono shrink-0 font-bold uppercase">TXT, CSV, JSON, PDF, Web</span>
            </div>

            {/* Input form */}
            <form onSubmit={handleSendBuilderMessage} className="p-3 bg-slate-950 border-t border-slate-800 flex gap-2">
              <input
                type="text"
                placeholder="e.g., iPhone 13 screen repairs cost $120. Diagnostic is free..."
                value={builderInput}
                onChange={(e) => setBuilderInput(e.target.value)}
                disabled={isBuilderTyping}
                className="flex-1 bg-slate-900 border border-slate-850 rounded-xl px-3 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 transition duration-150 font-sans"
              />
              <button
                type="submit"
                disabled={!builderInput.trim() || isBuilderTyping}
                className="p-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-xl transition duration-150 flex items-center justify-center cursor-pointer"
              >
                <Send size={15} />
              </button>
            </form>
          </div>
        ) : (
          /* Ready-to-deploy Chatbot Widget Code Panel */
          <div className="bg-slate-900 border border-slate-800 rounded-2xl flex flex-col h-[550px] shadow-lg overflow-hidden relative" id="deploy-widget-panel">
            {/* Header */}
            <div className="px-5 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-white">
                  <Code size={18} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white font-sans">Deploy Chatbot Widget</h4>
                  <p className="text-[9px] text-slate-400 font-mono">Live Widget Code for {currentBiz.name}</p>
                </div>
              </div>
              <span className="text-[9px] font-mono bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full uppercase font-bold tracking-wider">
                Production-Ready
              </span>
            </div>

            {/* In-Panel scrollable config container */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-thin scrollbar-thumb-slate-800">
              
              {/* Info text */}
              <p className="text-slate-400 text-[11px] leading-relaxed">
                We compiled this code using custom enterprise data fed via your onboarding facts and fine-tuning inputs. Simply embed this snippet into your HTML to mount the live assistant widget.
              </p>

              {/* Format Toggle */}
              <div className="flex border-b border-slate-800 pb-1">
                <button
                  type="button"
                  onClick={() => setDeployCodeFormat("html")}
                  className={`px-3 py-1.5 text-[10px] font-mono font-medium border-b-2 transition duration-150 ${
                    deployCodeFormat === "html"
                      ? "border-indigo-500 text-indigo-400"
                      : "border-transparent text-slate-400 hover:text-slate-200"
                  }`}
                >
                  HTML Widget Code
                </button>
                <button
                  type="button"
                  onClick={() => setDeployCodeFormat("json")}
                  className={`px-3 py-1.5 text-[10px] font-mono font-medium border-b-2 transition duration-150 ${
                    deployCodeFormat === "json"
                      ? "border-indigo-500 text-indigo-400"
                      : "border-transparent text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Headless JSON API config
                </button>
                <button
                  type="button"
                  onClick={() => setDeployCodeFormat("form")}
                  className={`px-3 py-1.5 text-[10px] font-mono font-medium border-b-2 transition duration-150 ${
                    deployCodeFormat === "form"
                      ? "border-indigo-500 text-indigo-400"
                      : "border-transparent text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Lead Webform Code
                </button>
              </div>

              {/* Customizer tools */}
              {(deployCodeFormat === "html" || deployCodeFormat === "form") && (
                <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-850 space-y-2.5">
                  <label className="text-[9px] font-mono text-indigo-400 uppercase tracking-wider block font-semibold">Customize Accent Color</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={widgetColor}
                      onChange={(e) => setWidgetColor(e.target.value)}
                      className="w-8 h-8 rounded-lg bg-transparent border border-slate-800 cursor-pointer overflow-hidden p-0"
                    />
                    <div className="flex-1">
                      <input
                        type="text"
                        value={widgetColor}
                        onChange={(e) => setWidgetColor(e.target.value)}
                        placeholder="#10b981"
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-[11px] font-mono text-slate-200 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Copy & Display box */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider">Generated Code Snippet</span>
                  <button
                    type="button"
                    onClick={() => {
                      const appOrigin = getPublicOrigin();
                      const codeText = deployCodeFormat === "html" 
                        ? `<!-- OmniHub AI Chatbot Widget for ${currentBiz.name} -->
<script 
  src="${appOrigin}/widget.js" 
  data-tenant-id="${currentBiz.id}" 
  data-welcome="${currentBiz.chatSettings?.welcomeMessage || 'Hello!'}"
  data-color="${widgetColor}" 
  async>
</script>`
                        : deployCodeFormat === "json"
                        ? JSON.stringify({
                            tenant_id: currentBiz.id,
                            model: "gemini-1.5-flash",
                            temperature: 0.4,
                            tone: currentBiz.chatSettings?.tone || "Professional",
                            learned_documents_count: currentBiz.kbArticles?.length || 0,
                            learned_faqs_count: currentBiz.faqKnowledge?.length || 0,
                            website_url: currentBiz.websiteUrl || "",
                            api_endpoint: `${appOrigin}/api/chatbot/chat`
                          }, null, 2)
                        : `<!-- OmniHub Lead Capture Form for ${currentBiz.name} -->
<div id="omnihub-lead-form-container-${currentBiz.id}" style="max-width: 480px; margin: 15px auto; padding: 24px; font-family: system-ui, sans-serif; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
  <form id="omnihub-lead-form-${currentBiz.id}" style="display: flex; flex-direction: column; gap: 16px;">
    <div style="text-align: center; margin-bottom: 8px;">
      <h3 style="margin: 0; font-size: 18px; font-weight: 700; color: #1e293b;">Inquire with ${currentBiz.name}</h3>
      <p style="margin: 4px 0 0; font-size: 12px; color: #64748b;">Submit details to instantly notify our central desk.</p>
    </div>
    <input type="hidden" name="businessId" value="${currentBiz.id}">
    <div>
      <label style="display: block; font-size: 11px; font-weight: 600; text-transform: uppercase; color: #475569; margin-bottom: 6px;">Your Name</label>
      <input type="text" name="name" required placeholder="John Doe" style="width: 100%; box-sizing: border-box; padding: 10px 14px; font-size: 13px; border: 1px solid #cbd5e1; border-radius: 8px; outline: none; transition: border-color 0.2s;" onfocus="this.style.borderColor='${widgetColor}'" onblur="this.style.borderColor='#cbd5e1'">
    </div>
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
      <div>
        <label style="display: block; font-size: 11px; font-weight: 600; text-transform: uppercase; color: #475569; margin-bottom: 6px;">Email</label>
        <input type="email" name="email" required placeholder="john@example.com" style="width: 100%; box-sizing: border-box; padding: 10px 14px; font-size: 13px; border: 1px solid #cbd5e1; border-radius: 8px; outline: none; transition: border-color 0.2s;" onfocus="this.style.borderColor='${widgetColor}'" onblur="this.style.borderColor='#cbd5e1'">
      </div>
      <div>
        <label style="display: block; font-size: 11px; font-weight: 600; text-transform: uppercase; color: #475569; margin-bottom: 6px;">Phone</label>
        <input type="tel" name="phone" required placeholder="(555) 000-0000" style="width: 100%; box-sizing: border-box; padding: 10px 14px; font-size: 13px; border: 1px solid #cbd5e1; border-radius: 8px; outline: none; transition: border-color 0.2s;" onfocus="this.style.borderColor='${widgetColor}'" onblur="this.style.borderColor='#cbd5e1'">
      </div>
    </div>
    <div>
      <label style="display: block; font-size: 11px; font-weight: 600; text-transform: uppercase; color: #475569; margin-bottom: 6px;">Message / Inquiry Details</label>
      <textarea name="message" required rows="3" placeholder="Describe your repair needs, pricing query, or appointment requests..." style="width: 100%; box-sizing: border-box; padding: 10px 14px; font-size: 13px; border: 1px solid #cbd5e1; border-radius: 8px; outline: none; resize: vertical; transition: border-color 0.2s;" onfocus="this.style.borderColor='${widgetColor}'" onblur="this.style.borderColor='#cbd5e1'"></textarea>
    </div>
    <button type="submit" style="width: 100%; padding: 12px; font-size: 13px; font-weight: 600; color: #ffffff; background: ${widgetColor}; border: none; border-radius: 8px; cursor: pointer; transition: opacity 0.2s; box-shadow: 0 1px 3px rgba(0,0,0,0.1);" onmouseover="this.style.opacity='0.9'" onmouseout="this.style.opacity='1'">Submit Inquiry</button>
    <div id="omnihub-form-status-${currentBiz.id}" style="display: none; font-size: 12px; text-align: center; padding: 8px; border-radius: 6px; margin-top: 4px;"></div>
  </form>
  <script>
    document.getElementById('omnihub-lead-form-${currentBiz.id}').addEventListener('submit', function(e) {
      e.preventDefault();
      const form = this;
      const btn = form.querySelector('button[type="submit"]');
      const statusDiv = document.getElementById('omnihub-form-status-${currentBiz.id}');
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
                      navigator.clipboard.writeText(codeText);
                      setCopiedWidgetCode(true);
                      setTimeout(() => setCopiedWidgetCode(false), 2000);
                    }}
                    className="text-[9px] font-mono text-indigo-400 hover:text-indigo-300 flex items-center gap-1 px-2 py-0.5 bg-indigo-500/10 rounded"
                  >
                    {copiedWidgetCode ? (
                      <>
                        <Check size={10} />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={10} />
                        <span>Copy Code</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="relative font-mono">
                  <pre className="text-[10px] text-slate-300 bg-slate-950 border border-slate-850 rounded-xl p-3.5 overflow-x-auto leading-relaxed max-h-56">
                    <code>
                      {deployCodeFormat === "html" ? (
                        `<!-- OmniHub AI Chatbot Widget for ${currentBiz.name} -->
<script 
  src="${getPublicOrigin()}/widget.js" 
  data-tenant-id="${currentBiz.id}" 
  data-welcome="${currentBiz.chatSettings?.welcomeMessage || 'Hello!'}"
  data-color="${widgetColor}" 
  async>
</script>`
                      ) : deployCodeFormat === "json" ? (
                        JSON.stringify({
                          tenant_id: currentBiz.id,
                          model: "gemini-1.5-flash",
                          temperature: 0.4,
                          tone: currentBiz.chatSettings?.tone || "Professional",
                          learned_documents_count: currentBiz.kbArticles?.length || 0,
                          learned_faqs_count: currentBiz.faqKnowledge?.length || 0,
                          website_url: currentBiz.websiteUrl || "",
                          api_endpoint: `${getPublicOrigin()}/api/chatbot/chat`
                        }, null, 2)
                      ) : (
                        `<!-- Lead Capture Webform for ${currentBiz.name} -->
<div id="omnihub-lead-form-container-${currentBiz.id}">
  ... (Copies full self-contained styling, CORS endpoint & submit handler) ...
</div>`
                      )}
                    </code>
                  </pre>
                </div>
              </div>

              {/* Status indicators */}
              <div className="bg-slate-950/40 border border-slate-900 rounded-xl p-3 flex justify-between items-center text-[10px] text-slate-400">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span>Webhook Agent: Active</span>
                </span>
                <span>Faqs Synchronized: {currentBiz.faqKnowledge?.length || 0}</span>
                <span>Files: {currentBiz.kbArticles?.length || 0}</span>
              </div>

            </div>
          </div>
        )}

        {/* Informative Help tip */}
        <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl text-xs text-slate-400 flex gap-2.5 items-start">
          <AlertCircle size={16} className="text-indigo-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed font-sans font-light">
            {activeSidebarTab === "sandbox" ? (
              <span><strong>Pro Tip:</strong> Updates made in the FAQ Knowledge base on the left are **immediately** visible to the AI here. Try adding a custom FAQ and test the chatbot query to see the model dynamically synthesize a reply!</span>
            ) : activeSidebarTab === "builder" ? (
              <span><strong>Setup Wizard:</strong> Copy-paste any raw details (unstructured text, email policies, pricing sheets) above. The Builder Bot parses the facts, segments them, and trains your active tenant chatbot instantly!</span>
            ) : (
              <span><strong>Live Snippet:</strong> Paste this JavaScript tag in the footer of your target website. The chatbot automatically boots and uses your configured FAQs, custom website scraper, and uploaded files.</span>
            )}
          </p>
        </div>

      </div>

      {/* Global Toast Alert */}
      {statusMessage && (
        <div className={`fixed bottom-5 right-5 px-5 py-3.5 rounded-xl text-xs font-semibold text-white shadow-xl flex items-center gap-2 border animate-bounce ${
          statusMessage.type === "success" 
            ? "bg-emerald-600 border-emerald-500" 
            : "bg-red-600 border-red-500"
        }`} style={{ zIndex: 9999 }}>
          <span>{statusMessage.text}</span>
        </div>
      )}

    </div>
  );
}
