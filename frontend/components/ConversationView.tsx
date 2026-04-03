"use client";

import { useState } from "react";
import type { Conversation, Message } from "@/types";
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

  const name = conversation.prospect?.name ?? "Prospect inconnu";
  const initials = name.split(" ").map((w: string) => w[0]).join("").substring(0, 2).toUpperCase();

  return (
    <div className="flex flex-col h-full" style={{ background: "#f8f9fa" }}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 flex-shrink-0"
        style={{ background: "#ffffff", borderBottom: "1px solid #f3f4f5" }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
            style={{ background: "#ffdcc3", color: "#623200" }}>
            {initials}
          </div>
          <div>
            <p className="text-sm font-bold font-headline" style={{ color: "#191c1d" }}>{name}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs font-medium px-2 py-0.5 rounded-sm" style={{ background: "#e7e8e9", color: "#564334" }}>
                {CHANNEL_LABEL[conversation.channel] ?? conversation.channel}
              </span>
              <span className="text-xs" style={{ color: "#897362" }}>{conversation.message_count} messages</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {error && <span className="text-xs" style={{ color: "#ba1a1a" }}>{error}</span>}
          {conversation.bot_active ? (
            <button onClick={handleTakeover}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl transition-all"
              style={{ background: "#ffdcc3", color: "#623200" }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.opacity = "0.8")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.opacity = "1")}>
              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>person_check</span>
              Reprendre la main
            </button>
          ) : (
            <button onClick={handleResumeBot}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl transition-all"
              style={{ background: "#c7e7ff", color: "#004360" }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.opacity = "0.8")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.opacity = "1")}>
              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
              Réactiver le bot
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4" style={{ background: "#f3f4f5" }}>
        {messages.length === 0 && (
          <p className="text-center text-sm py-12" style={{ color: "#897362" }}>
            Aucun message pour le moment
          </p>
        )}
        {messages.map((msg, idx) => {
          const isProspect = msg.from === "prospect";
          const isArtisan  = msg.from === "artisan";

          return (
            <div key={idx} className={`flex ${isProspect ? "justify-start" : "justify-end"}`}>
              <div style={{ maxWidth: "72%" }}>
                <p className="text-[11px] mb-1" style={{ color: "#897362", textAlign: isProspect ? "left" : "right" }}>
                  {isProspect ? (conversation.prospect?.name ?? "Prospect") : isArtisan ? "Vous" : "ArtiBot"}
                  {msg.sent_at && (
                    <span className="ml-2">
                      {new Date(msg.sent_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  )}
                </p>
                <div className="px-4 py-2.5 text-sm leading-relaxed"
                  style={{
                    borderRadius: isProspect ? "4px 18px 18px 18px" : "18px 4px 18px 18px",
                    background: isProspect ? "#ffffff" : isArtisan ? "#00658f" : "#904d00",
                    color: isProspect ? "#191c1d" : "#ffffff",
                    border: isProspect ? "1px solid #e7e8e9" : "none",
                    boxShadow: isProspect ? "0 1px 2px rgba(0,0,0,0.04)" : "none",
                  }}>
                  {msg.content}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Reply box */}
      {!conversation.bot_active && (
        <div className="flex-shrink-0 px-4 py-3" style={{ background: "#ffffff", borderTop: "1px solid #f3f4f5" }}>
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
              className="flex-1 resize-none text-sm outline-none transition-all"
              style={{
                border: "1.5px solid #e7e8e9",
                borderRadius: "12px",
                padding: "10px 14px",
                background: "#f3f4f5",
                color: "#191c1d",
                minHeight: "44px",
                maxHeight: "120px",
                fontFamily: "'Inter', sans-serif",
              }}
              rows={1}
              onFocus={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#904d00"; (e.currentTarget as HTMLElement).style.background = "#ffffff"; }}
              onBlur={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#e7e8e9"; (e.currentTarget as HTMLElement).style.background = "#f3f4f5"; }}
            />
            <button onClick={handleSendReply} disabled={!replyText.trim() || sending}
              className="w-10 h-10 flex items-center justify-center rounded-xl transition-all flex-shrink-0 disabled:opacity-40"
              style={{ background: "#904d00", color: "#fff", boxShadow: "0 2px 8px rgba(144,77,0,0.2)" }}
              onMouseEnter={(e) => { if (!sending) (e.currentTarget as HTMLElement).style.opacity = "0.85"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.opacity = "1"; }}>
              <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>send</span>
            </button>
          </div>
          <p className="text-[11px] mt-1.5" style={{ color: "#ddc1ae" }}>
            Entrée pour envoyer · Maj+Entrée pour aller à la ligne
          </p>
        </div>
      )}

      {/* Bot active footer */}
      {conversation.bot_active && (
        <div className="flex-shrink-0 px-4 py-2.5 flex items-center gap-2"
          style={{ background: "#c7e7ff", borderTop: "1px solid #00b5fc" }}>
          <span className="material-symbols-outlined text-base animate-pulse-dot" style={{ color: "#004360", fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
          <p className="text-xs font-medium" style={{ color: "#004360" }}>
            Le bot gère cette conversation automatiquement
          </p>
        </div>
      )}
    </div>
  );
}
