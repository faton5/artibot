"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Conversation, ProspectScore } from "@/types";

interface Props {
  conversations: Conversation[];
}

const CHANNEL_ICON: Record<string, string> = {
  email:    "mail",
  sms:      "sms",
  whatsapp: "chat",
};

const SCORE_BAR: Record<ProspectScore, string> = {
  hot:  "#93000a",
  warm: "#623200",
  cold: "#ddc1ae",
};

const SCORE_BADGE: Record<ProspectScore, { label: string; bg: string; color: string }> = {
  hot:  { label: "Chaud",  bg: "#ffdad6", color: "#93000a" },
  warm: { label: "Tiède",  bg: "#ffdcc3", color: "#623200" },
  cold: { label: "Froid",  bg: "#e7e8e9", color: "#564334" },
};

const STATUS_BADGE: Record<string, { label: string; bg: string; color: string }> = {
  active:    { label: "Actif",    bg: "#c7e7ff", color: "#004360" },
  qualified: { label: "Qualifié", bg: "#fdb881", color: "#2f1500" },
  escalated: { label: "Urgent",   bg: "#ffdad6", color: "#93000a" },
  closed:    { label: "Fermé",    bg: "#e7e8e9", color: "#564334" },
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
        <span className="material-symbols-outlined text-5xl" style={{ color: "#ddc1ae" }}>forum</span>
        <p className="text-sm font-semibold" style={{ color: "#191c1d" }}>Aucune conversation</p>
        <p className="text-sm" style={{ color: "#564334" }}>Les conversations de vos prospects apparaîtront ici.</p>
      </div>
    );
  }

  return (
    <ul>
      {conversations.map((conv, i) => {
        const channelIcon = CHANNEL_ICON[conv.channel] ?? "chat_bubble";
        const score = conv.prospect?.score ?? "cold";
        const scoreBar = SCORE_BAR[score];
        const scoreBadge = SCORE_BADGE[score];
        const statusBadge = STATUS_BADGE[conv.status] ?? STATUS_BADGE.closed;
        const isActive = pathname === `/dashboard/${conv.id}`;
        const name = conv.prospect?.name ?? conv.prospect?.email ?? conv.prospect?.phone ?? "Prospect inconnu";
        const initials = name.split(" ").map((w: string) => w[0]).join("").substring(0, 2).toUpperCase();

        return (
          <li key={conv.id}>
            <Link
              href={`/dashboard/${conv.id}`}
              className="flex items-stretch gap-0 transition-colors duration-100 animate-fade-up"
              style={{
                borderBottom: "1px solid rgba(148,163,184,0.15)",
                background: isActive ? "#ffdcc3" : "#ffffff",
                animationDelay: `${i * 30}ms`,
                animationFillMode: "both",
              }}
              onMouseEnter={(e) => { if (!isActive) (e.currentTarget as HTMLElement).style.background = "#f8f9fa"; }}
              onMouseLeave={(e) => { if (!isActive) (e.currentTarget as HTMLElement).style.background = "#ffffff"; }}
            >
              {/* Score accent bar */}
              <div className="w-[3px] flex-shrink-0 self-stretch rounded-r-full my-3" style={{ background: scoreBar }} />

              {/* Avatar */}
              <div className="flex items-start pt-3.5 pl-4 pr-2 flex-shrink-0">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
                    style={{ background: "#ffdcc3", color: "#623200" }}>
                    {initials}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white flex items-center justify-center shadow-sm">
                    <span className="material-symbols-outlined text-xs" style={{ color: isActive ? "#904d00" : "#00658f" }}>{channelIcon}</span>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 py-3 pr-4">
                <div className="flex items-start justify-between gap-2 mb-0.5">
                  <span className="text-sm font-headline font-bold truncate" style={{ color: "#191c1d" }}>{name}</span>
                  <span className="text-xs flex-shrink-0" style={{ color: "#897362" }}>
                    {conv.created_at && timeAgo(conv.created_at)}
                  </span>
                </div>

                <p className="text-xs truncate mb-1.5" style={{ color: "#564334" }}>
                  {conv.last_message?.content || "Pas encore de message"}
                </p>

                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-sm text-[10px] font-semibold"
                    style={{ background: scoreBadge.bg, color: scoreBadge.color }}>
                    {scoreBadge.label}
                  </span>
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-sm text-[10px] font-semibold"
                    style={{ background: statusBadge.bg, color: statusBadge.color }}>
                    {statusBadge.label}
                  </span>
                  <span className="text-[10px] ml-auto" style={{ color: "#ddc1ae" }}>
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
