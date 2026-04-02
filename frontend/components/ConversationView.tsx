"use client";

import { useState } from "react";
import type { Conversation, Message } from "@/types";
import { Bot, UserCheck, Send } from "lucide-react";
import { conversationApi } from "@/lib/api";

interface Props {
  conversation: Conversation;
  onUpdate: () => void;
}

const CHANNEL_LABEL: Record<string, string> = {
  email: "Email", sms: "SMS", whatsapp: "WhatsApp",
};

export function ConversationView({ conversation, onUpdate }: Props) {
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messages: Message[] = conversation.messages ?? [];

  const handleTakeover = async () => {
    try { await conversationApi.takeover(conversation.id); onUpdate(); }
    catch (e: any) { setError(e.message); }
  };

  const handleResumeBot = async () => {
    try { await conversationApi.resumeBot(conversation.id); onUpdate(); }
    catch (e: any) { setError(e.message); }
  };

  const handleSendReply = async () => {
    if (!replyText.trim()) return;
    setSending(true);
    setError(null);
    try {
      await conversationApi.reply(conversation.id, replyText.trim());
      setReplyText("");
      onUpdate();
    } catch (e: any) { setError(e.message); }
    finally { setSending(false); }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-3.5 flex-shrink-0"
        style={{ background: "var(--surface)", borderBottom: "1px solid var(--forge-100)" }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-[14px] font-bold font-display flex-shrink-0"
            style={{ background: "#fff7ed", color: "#c2410c" }}
          >
            {(conversation.prospect?.name ?? "?").charAt(0).toUpperCase()}
          </div>
          <div>
            <p
              className="text-[13px]"
              style={{ fontWeight: 600, color: "var(--forge-900)" }}
            >
              {conversation.prospect?.name ?? "Prospect inconnu"}
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              <span
                className="text-[11px] font-medium px-2 py-0.5 rounded"
                style={{ background: "var(--forge-50)", color: "var(--forge-600)" }}
              >
                {CHANNEL_LABEL[conversation.channel] ?? conversation.channel}
              </span>
              <span className="text-[11px]" style={{ color: "var(--forge-400)" }}>
                {conversation.message_count} messages
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {error && (
            <span className="text-[11px]" style={{ color: "#dc2626" }}>{error}</span>
          )}
          {conversation.bot_active ? (
            <button
              onClick={handleTakeover}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium rounded-lg transition-all"
              style={{ background: "#fff7ed", color: "#c2410c", border: "1px solid #fed7aa" }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "#ffedd5")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "#fff7ed")}
            >
              <UserCheck className="w-3.5 h-3.5" />
              Reprendre la main
            </button>
          ) : (
            <button
              onClick={handleResumeBot}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium rounded-lg transition-all"
              style={{ background: "#eff6ff", color: "#2563eb", border: "1px solid #bfdbfe" }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "#dbeafe")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "#eff6ff")}
            >
              <Bot className="w-3.5 h-3.5" />
              Réactiver le bot
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto px-5 py-5 space-y-4"
        style={{ background: "var(--canvas)" }}
      >
        {messages.length === 0 && (
          <p
            className="text-center text-[13px] py-12"
            style={{ color: "var(--forge-400)" }}
          >
            Aucun message pour le moment
          </p>
        )}
        {messages.map((msg, idx) => {
          const isProspect = msg.from === "prospect";
          const isArtisan  = msg.from === "artisan";

          return (
            <div key={idx} className={`flex ${isProspect ? "justify-start" : "justify-end"}`}>
              <div style={{ maxWidth: "72%" }}>
                <p
                  className="text-[11px] mb-1"
                  style={{
                    color: "var(--forge-400)",
                    textAlign: isProspect ? "left" : "right",
                  }}
                >
                  {isProspect
                    ? (conversation.prospect?.name ?? "Prospect")
                    : isArtisan
                    ? "Vous"
                    : "ArtiBot"}
                  {msg.sent_at && (
                    <span className="ml-2">
                      {new Date(msg.sent_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  )}
                </p>
                <div
                  className="px-4 py-2.5 text-[13px] leading-relaxed"
                  style={{
                    borderRadius: isProspect
                      ? "4px 18px 18px 18px"
                      : "18px 4px 18px 18px",
                    background: isProspect
                      ? "var(--surface)"
                      : isArtisan
                      ? "#16a34a"
                      : "var(--forge-900)",
                    color: isProspect ? "var(--forge-900)" : "#fff",
                    border: isProspect ? "1px solid var(--forge-100)" : "none",
                    boxShadow: isProspect ? "0 1px 2px rgba(0,0,0,0.04)" : "none",
                  }}
                >
                  {msg.content}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Reply box */}
      {!conversation.bot_active && (
        <div
          className="flex-shrink-0 px-4 py-3"
          style={{ background: "var(--surface)", borderTop: "1px solid var(--forge-100)" }}
        >
          <div className="flex items-end gap-2">
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendReply();
                }
              }}
              placeholder="Répondre au prospect…"
              className="flex-1 resize-none text-[13px] outline-none transition-all"
              style={{
                border: "1px solid var(--forge-100)",
                borderRadius: "12px",
                padding: "10px 14px",
                background: "var(--canvas)",
                color: "var(--forge-900)",
                minHeight: "44px",
                maxHeight: "120px",
                fontFamily: "'DM Sans', sans-serif",
              }}
              rows={1}
              onFocus={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "var(--forge-400)";
                (e.currentTarget as HTMLElement).style.background = "var(--surface)";
              }}
              onBlur={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "var(--forge-100)";
                (e.currentTarget as HTMLElement).style.background = "var(--canvas)";
              }}
            />
            <button
              onClick={handleSendReply}
              disabled={!replyText.trim() || sending}
              className="w-10 h-10 flex items-center justify-center rounded-xl transition-colors flex-shrink-0 disabled:opacity-40"
              style={{ background: "var(--forge-900)", color: "#fff" }}
              onMouseEnter={(e) => {
                if (!sending) (e.currentTarget as HTMLElement).style.background = "var(--forge-700)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = "var(--forge-900)";
              }}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <p className="text-[11px] mt-1.5" style={{ color: "var(--forge-300)" }}>
            Entrée pour envoyer · Maj+Entrée pour aller à la ligne
          </p>
        </div>
      )}

      {/* Bot active footer */}
      {conversation.bot_active && (
        <div
          className="flex-shrink-0 px-4 py-2.5 flex items-center gap-2"
          style={{ background: "#eff6ff", borderTop: "1px solid #bfdbfe" }}
        >
          <Bot className="w-3.5 h-3.5 animate-pulse-dot" style={{ color: "#2563eb" }} />
          <p className="text-[12px]" style={{ color: "#1d4ed8" }}>
            Le bot gère cette conversation automatiquement
          </p>
        </div>
      )}
    </div>
  );
}
