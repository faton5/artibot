export type Channel = "email" | "sms" | "whatsapp";
export type ConversationStatus = "active" | "qualified" | "closed" | "escalated";
export type ProspectScore = "cold" | "warm" | "hot";

export interface Prospect {
  id: string;
  name: string | null;
  phone: string | null;
  email: string | null;
  project_type: string | null;
  surface: string | null;
  location: string | null;
  budget: string | null;
  delay: string | null;
  score: ProspectScore;
}

export interface Message {
  from: "prospect" | "bot" | "artisan";
  content: string;
  channel: Channel;
  sent_at?: string;
}

export interface Conversation {
  id: string;
  channel: Channel;
  status: ConversationStatus;
  bot_active: boolean;
  message_count: number;
  last_message: Message | null;
  created_at: string;
  prospect: Prospect | null;
  messages?: Message[];
}

export interface Artisan {
  id: string;
  name: string;
  email: string;
  config_json: ArtisanConfig;
  gmail_connected: boolean;
  twilio_number: string | null;
  created_at: string;
}

export interface ArtisanConfig {
  metier?: string;
  ville?: string;
  zone?: string;
  tarifs?: Record<string, string>;
  delais?: string;
  ton?: string;
  message_accueil?: string;
  message_threshold?: number;
}

export interface KnowledgeChunk {
  id: string;
  content: string;
  source_file: string;
  created_at: string;
}

export interface Rapport {
  id: string;
  html_content: string;
  sent_at: string | null;
  created_at: string;
}

export interface DashboardStats {
  total_prospects: number;
  qualified_prospects: number;
  qualification_rate: number;
  active_conversations: number;
  channels: Record<Channel, number>;
}
