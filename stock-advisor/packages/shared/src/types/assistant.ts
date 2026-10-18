export type ChatRole = "user" | "bot";

export interface ChatMessage {
  id: string;
  role: ChatRole;
  text: string;
  /** Optional deep links the bot offers alongside the answer. */
  links?: { label: string; to: string }[];
  timestamp: string;
}

/** A single piece of app knowledge the bot can match against. */
export interface KnowledgeEntry {
  id: string;
  /** Keywords/phrases that trigger this entry. */
  patterns: string[];
  /** The bot's answer. */
  answer: string;
  /** Suggested navigation links shown with the answer. */
  links?: { label: string; to: string }[];
}

/** A quick-reply chip the user can tap to ask a common question. */
export interface Suggestion {
  label: string;
  query: string;
}
