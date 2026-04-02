"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Conversation, ProspectScore } from "@/types";
import { Mail, MessageSquare, MessageCircle } from "lucide-react";

interface Props {
  conversations: Conversation[];
}

const CHANNEL_ICONS = {
  email:    Mail,
  sms:      MessageSquare,
  whatsapp: MessageCircle,
};

const SCORE_BAR: Record<ProspectScore, string> = {
  hot:  "#ef4444",
  warm: "#f97316",
  cold: "#d1d5db",
};

const SCORE_LABEL: Record<ProspectScore, { text: string; bg: string; color: string }> = {
  hot:  { text: "🔥 Chaud",  bg: "#fef2f2", color: "#dc2626" },
  warm: { text: "🌡 Tiède",  bg: "#fff7ed", color: "#ea580c" },
  cold: { text: "❄️ Froid",  bg: "var(--forge-50)", color: "var(--forge-500)" },
};

const STATUS_BADGE: Record<string, { label: string; bg: string; color: string }> = {
  active:    { label: "Actif",    bg: "#eff6ff", color: "#2563eb" },
  qualified: { label: "Qualifié", bg: "#f0fdf4", color: "#15803d" },
  escalated: { label: "Escaladé", bg: "#fff7ed", color: "#c2410c" },
  closed:    { label: "Fermé",    bg: "var(--forge-50)", color: "var(--forge-500)" },
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m || 1}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

export function ConversationList({ conversations }: Props) {
  const pathname = usePathname();

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
          style={{ background: "var(--forge-50)" }}
        >
          💬
        </div>
        <p className="text-[14px] font-semibold" style={{ color: "var(--forge-900)" }}>
          Aucune conversation
        </p>
        <p className="text-[13px]" style={{ color: "var(--forge-400)" }}>
          Les conversations de vos prospects apparaîtront ici.
        </p>
      </div>
    );
  }

  return (
    <ul>
      {conversations.map((conv, i) => {
        const ChannelIcon = CHANNEL_ICONS[conv.channel] ?? MessageSquare;
        const score = conv.prospect?.score ?? "cold";
        const scoreBar = SCORE_BAR[score];
        const scoreLbl = SCORE_LABEL[score];
        const statusBdg = STATUS_BADGE[conv.status] ?? STATUS_BADGE.closed;
        const isActive = pathname === `/dashboard/${conv.id}`;
        const name = conv.prospect?.name ?? conv.prospect?.email ?? conv.prospect?.phone ?? "Prospect inconnu";

        return (
          <li key={conv.id}>
            <Link
              href={`/dashboard/${conv.id}`}
              className="flex items-stretch gap-0 transition-colors duration-100 relative animate-fade-up"
              style={{
                borderBottom: "1px solid var(--forge-50)",
                background: isActive ? "#fff7ed" : "var(--surface)",
                animationDelay: `${i * 30}ms`,
                animationFillMode: "both",
              }}
              onMouseEnter={(e) => {
                if (!isActive)
                  (e.currentTarget as HTMLElement).style.background = "var(--forge-50)";
              }}
              onMouseLeave={(e) => {
                if (!isActive)
                  (e.currentTarget as HTMLElement).style.background = "var(--surface)";
              }}
            >
              {/* Score accent bar */}
              <div
                className="w-[3px] flex-shrink-0 self-stretch rounded-r-full my-3"
                style={{ background: scoreBar }}
              />

              {/* Channel icon */}
              <div className="flex items-start pt-3.5 pl-3 pr-1 flex-shrink-0">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: isActive ? "#ffedd5" : "var(--forge-50)" }}
                >
                  <ChannelIcon
                    className="w-3.5 h-3.5"
                    style={{ color: isActive ? "#ea580c" : "var(--forge-400)" }}
                  />
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 py-3 pr-4">
                <div className="flex items-start justify-between gap-2 mb-0.5">
                  <span
                    className="text-[13px] truncate"
                    style={{ fontWeight: 600, color: "var(--forge-900)" }}
                  >
                    {name}
                  </span>
                  <span
                    className="text-[11px] flex-shrink-0"
                    style={{ color: "var(--forge-400)" }}
                  >
                    {conv.created_at && timeAgo(conv.created_at)}
                  </span>
                </div>

                <p
                  className="text-[12px] truncate mb-1.5"
                  style={{ color: "var(--forge-500)" }}
                >
                  {conv.last_message?.content || "Pas encore de message"}
                </p>

                <div className="flex items-center gap-1.5 flex-wrap">
                  <span
                    className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium"
                    style={{ background: scoreLbl.bg, color: scoreLbl.color }}
                  >
                    {scoreLbl.text}
                  </span>
                  <span
                    className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium"
                    style={{ background: statusBdg.bg, color: statusBdg.color }}
                  >
                    {statusBdg.label}
                  </span>
                  <span
                    className="text-[10px] ml-auto"
                    style={{ color: "var(--forge-300)" }}
                  >
                    {conv.message_count} msg
                  </span>
                </div>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
