"use client";

import { useState } from "react";
import type { Conversation, Message } from "@/types";
import { Bot, UserCheck, Send, Phone, Mail, MessageSquare } from "lucide-react";
import { conversationApi } from "@/lib/api";

interface Props {
  conversation: Conversation;
  onUpdate: () => void;
}

const CHANNEL_COLORS = {
  email: "bg-blue-100 text-blue-700",
  sms: "bg-green-100 text-green-700",
  whatsapp: "bg-emerald-100 text-emerald-700",
};

export function ConversationView({ conversation, onUpdate }: Props) {
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messages: Message[] = conversation.messages ?? [];

  const handleTakeover = async () => {
    try {
      await conversationApi.takeover(conversation.id);
      onUpdate();
    } catch (e: any) {
      setError(e.message);
    }
  };

  const handleResumeBot = async () => {
    try {
      await conversationApi.resumeBot(conversation.id);
      onUpdate();
    } catch (e: any) {
      setError(e.message);
    }
  };

  const handleSendReply = async () => {
    if (!replyText.trim()) return;
    setSending(true);
    setError(null);
    try {
      await conversationApi.reply(conversation.id, replyText.trim());
      setReplyText("");
      onUpdate();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header conversation */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-sm font-semibold text-gray-600">
            {(conversation.prospect?.name ?? "?").charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-medium text-gray-900 text-sm">
              {conversation.prospect?.name ?? "Prospect inconnu"}
            </p>
            <div className="flex items-center gap-2">
              <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${CHANNEL_COLORS[conversation.channel] ?? ""}`}>
                {conversation.channel.toUpperCase()}
              </span>
              <span className="text-xs text-gray-400">
                {conversation.message_count} messages
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {conversation.bot_active ? (
            <button
              onClick={handleTakeover}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-orange-600 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors"
            >
              <UserCheck className="w-3.5 h-3.5" />
              Reprendre la main
            </button>
          ) : (
            <button
              onClick={handleResumeBot}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <Bot className="w-3.5 h-3.5" />
              Réactiver le bot
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
        {messages.length === 0 && (
          <p className="text-center text-sm text-gray-400 py-10">
            Aucun message pour le moment
          </p>
        )}
        {messages.map((msg, idx) => {
          const isProspect = msg.from === "prospect";
          const isArtisan = msg.from === "artisan";

          return (
            <div
              key={idx}
              className={`flex ${isProspect ? "justify-start" : "justify-end"}`}
            >
              <div className="max-w-[70%]">
                {/* Badge expéditeur */}
                <p className={`text-xs mb-1 ${isProspect ? "text-gray-400" : "text-right text-gray-400"}`}>
                  {isProspect
                    ? (conversation.prospect?.name ?? "Prospect")
                    : isArtisan
                    ? "Vous"
                    : "ArtiBot"}
                </p>

                {/* Bulle */}
                <div
                  className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    isProspect
                      ? "bg-gray-100 text-gray-900 rounded-tl-sm"
                      : isArtisan
                      ? "bg-green-600 text-white rounded-tr-sm"
                      : "bg-blue-600 text-white rounded-tr-sm"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Zone de réponse (visible seulement si artisan a repris la main) */}
      {!conversation.bot_active && (
        <div className="border-t border-gray-200 bg-white px-4 py-3">
          {error && (
            <p className="text-xs text-red-600 mb-2">{error}</p>
          )}
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
              placeholder="Répondre au prospect..."
              className="flex-1 resize-none border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px] max-h-32"
              rows={1}
            />
            <button
              onClick={handleSendReply}
              disabled={!replyText.trim() || sending}
              className="w-10 h-10 flex items-center justify-center bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-1.5">
            Entrée pour envoyer · Maj+Entrée pour aller à la ligne
          </p>
        </div>
      )}

      {conversation.bot_active && (
        <div className="border-t border-gray-100 bg-gray-50 px-4 py-2.5 flex items-center gap-2">
          <Bot className="w-3.5 h-3.5 text-blue-500 animate-pulse" />
          <p className="text-xs text-gray-500">
            Le bot gère cette conversation automatiquement
          </p>
        </div>
      )}
    </div>
  );
}
