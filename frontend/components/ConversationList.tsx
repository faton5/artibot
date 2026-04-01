"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Conversation, ProspectScore } from "@/types";
import { Mail, MessageSquare, MessageCircle } from "lucide-react";

interface Props {
  conversations: Conversation[];
}

const CHANNEL_ICONS = {
  email: Mail,
  sms: MessageSquare,
  whatsapp: MessageCircle,
};

const SCORE_DOT: Record<ProspectScore, string> = {
  hot: "bg-red-500",
  warm: "bg-amber-400",
  cold: "bg-slate-300",
};

const STATUS_BADGE: Record<string, string> = {
  active: "text-blue-600 bg-blue-50",
  qualified: "text-green-700 bg-green-50",
  closed: "text-gray-500 bg-gray-100",
  escalated: "text-orange-600 bg-orange-50",
};

const STATUS_LABELS: Record<string, string> = {
  active: "Actif",
  qualified: "Qualifié",
  closed: "Fermé",
  escalated: "Escaladé",
};

export function ConversationList({ conversations }: Props) {
  const pathname = usePathname();

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400">
        <MessageSquare className="w-10 h-10 mb-3 opacity-50" />
        <p className="text-sm">Aucune conversation pour le moment</p>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-gray-100">
      {conversations.map((conv) => {
        const ChannelIcon = CHANNEL_ICONS[conv.channel] ?? MessageSquare;
        const score = conv.prospect?.score ?? "cold";
        const isActive = pathname === `/dashboard/${conv.id}`;

        return (
          <li key={conv.id}>
            <Link
              href={`/dashboard/${conv.id}`}
              className={`flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors ${
                isActive ? "bg-blue-50" : ""
              }`}
            >
              {/* Icone canal */}
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <ChannelIcon className="w-4 h-4 text-gray-500" />
              </div>

              {/* Contenu */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2 mb-0.5">
                  <span className="text-sm font-medium text-gray-900 truncate">
                    {conv.prospect?.name ?? conv.prospect?.email ?? conv.prospect?.phone ?? "Prospect inconnu"}
                  </span>
                  {conv.created_at && (
                    <span className="text-xs text-gray-400 flex-shrink-0">
                      {new Date(conv.created_at).toLocaleDateString("fr-FR", {
                        day: "numeric", month: "short"
                      })}
                    </span>
                  )}
                </div>

                <p className="text-xs text-gray-500 truncate mb-1.5">
                  {conv.last_message?.content ?? "Pas encore de message"}
                </p>

                <div className="flex items-center gap-2">
                  {/* Score dot */}
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${SCORE_DOT[score]}`} />
                  {/* Status badge */}
                  <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${STATUS_BADGE[conv.status] ?? ""}`}>
                    {STATUS_LABELS[conv.status] ?? conv.status}
                  </span>
                  {/* Nombre messages */}
                  <span className="text-xs text-gray-400 ml-auto">
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
