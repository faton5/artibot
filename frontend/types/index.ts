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
  gmail_email: string | null;
  twilio_number: string | null;
  created_at: string;
}

export interface ArtisanConfig {
  metier?: string;
  ville?: string;
  zone?: string;
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

export interface ProspectWithConversation extends Prospect {
  created_at: string;
  conversation: {
    id: string;
    channel: Channel;
    status: ConversationStatus;
    created_at: string;
  } | null;
}

export interface RapportWithMeta {
  id: string;
  conversation_id: string;
  channel: Channel;
  html_content: string;
  sent_at: string | null;
  created_at: string;
  prospect: {
    id: string;
    name: string | null;
    score: ProspectScore;
  } | null;
}

export interface ReadinessStatus {
  gmail_connected: boolean;
  knowledge_ready: boolean;
  bot_config_ready: boolean;
  welcome_message_ready: boolean;
  has_test_conversation: boolean;
  completed_steps: number;
  total_steps: number;
}

export interface CitySuggestion {
  name: string;
  postal_code: string | null;
  postal_codes: string[];
  department_code: string | null;
  department_name: string | null;
  region_name: string | null;
  insee_code: string | null;
  population: number | null;
  label: string;
}
