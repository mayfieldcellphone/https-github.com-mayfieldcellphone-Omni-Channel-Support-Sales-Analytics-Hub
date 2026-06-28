export interface FAQ {
  question: string;
  answer: string;
}

export interface KBArticle {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  category?: string;
  tags?: string[];
}

export interface ChatSettings {
  welcomeMessage: string;
  tone: string;
  avatarColor: string;
  botName?: string;
  avatarIcon?: string;
  themeStyle?: string;
  handoffRules?: string;
  fewShotExamples?: FAQ[];
}

export interface IntegrationConfig {
  connected: boolean;
  apiKey?: string;
  webhookUrl?: string;
  syncInterval?: string;
}

export interface Business {
  id: string;
  name: string;
  description: string;
  category: string;
  revenue: number;
  revenueGrowth: number;
  leadsCount: number;
  faqKnowledge: FAQ[];
  kbArticles?: KBArticle[];
  chatSettings: ChatSettings;
  crmIntegrations: {
    salesforce: IntegrationConfig;
    hubspot: IntegrationConfig;
    zoho: IntegrationConfig;
  };
  channels: {
    whatsapp: { connected: boolean; phoneNumber?: string; apiKey?: string };
    messenger: { connected: boolean; pageId?: string; accessToken?: string };
  };
  subscription_status?: "active" | "suspended";
  subscription_tier?: "BASIC" | "PRO" | "ENTERPRISE";
  is_payment_confirmed?: boolean;
  stripe_connected?: boolean;
  service_fee_percentage?: number;
  weekend_fee_applied?: boolean;
  websiteUrl?: string;
  knowledgeBaseText?: string;
  ownerEmail?: string;
}

export interface Lead {
  id: string;
  businessId: string;
  name: string;
  email: string;
  phone: string;
  source: "Webform" | "Chat" | "Email" | "WhatsApp" | "Messenger";
  status: "New" | "Contacted" | "Qualified" | "Proposal" | "Closed Won" | "Closed Lost";
  value: number;
  message: string;
  encryptedDetails: string;
  aiSummary: string;
  aiSuggestedAction: string;
  date: string;
  notes?: string;
}

export interface SecurityLog {
  id: string;
  timestamp: string;
  role: "Admin" | "Manager" | "Agent";
  user: string;
  action: string;
  ip: string;
  severity: "INFO" | "WARNING" | "CRITICAL";
}

export interface AnalyticsData {
  businessSummary: Array<{
    id: string;
    name: string;
    category: string;
    baseRevenue: number;
    wonLeadsRevenue: number;
    totalRevenue: number;
    leadsCount: number;
    wonLeadsCount: number;
    conversionRate: number;
  }>;
  sourceBreakdown: Array<{
    name: string;
    count: number;
    value: number;
  }>;
  chatbotStats: {
    totalChats: number;
    aiResolved: number;
    escalated: number;
    resolutionRate: number;
  };
}

export type UserRole = "Admin" | "Manager" | "Agent";
