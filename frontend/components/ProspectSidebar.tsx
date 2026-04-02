"use client";

import type { Conversation } from "@/types";
import {
  User, Phone, Mail, Briefcase, MapPin,
  Wallet, Calendar, Bot, UserCheck,
} from "lucide-react";

interface Props {
  conversation: Conversation;
}

const SCORE_CONFIG = {
  hot:  { label: "Chaud",  emoji: "🔥", bg: "#fef2f2", color: "#dc2626" },
  warm: { label: "Tiède",  emoji: "🌡", bg: "#fff7ed", color: "#ea580c" },
  cold: { label: "Froid",  emoji: "❄️", bg: "var(--forge-50)", color: "var(--forge-500)" },
} as const;

export function ProspectSidebar({ conversation }: Props) {
  const prospect = conversation.prospect;
  const score = prospect?.score ?? "cold";
  const sc = SCORE_CONFIG[score] ?? SCORE_CONFIG.cold;

  const fields: { icon: React.ElementType; label: string; value: string | null | undefined }[] = [
    { icon: User,     label: "Nom",          value: prospect?.name },
    { icon: Phone,    label: "Téléphone",    value: prospect?.phone },
    { icon: Mail,     label: "Email",        value: prospect?.email },
    { icon: Briefcase,label: "Travaux",      value: prospect?.project_type },
    { icon: MapPin,   label: "Surface",      value: prospect?.surface },
    { icon: MapPin,   label: "Localisation", value: prospect?.location },
    { icon: Wallet,   label: "Budget",       value: prospect?.budget },
    { icon: Calendar, label: "Délai",        value: prospect?.delay },
  ];

  return (
    <aside
      className="flex flex-col flex-shrink-0"
      style={{
        width: "272px",
        borderLeft: "1px solid var(--forge-100)",
        background: "var(--surface)",
      }}
    >
      {/* Header */}
      <div
        className="px-5 py-4 flex-shrink-0"
        style={{ borderBottom: "1px solid var(--forge-100)" }}
      >
        <p
          className="text-[13px] font-display"
          style={{ fontWeight: 700, color: "var(--forge-900)" }}
        >
          Fiche prospect
        </p>
      </div>

      {/* Score */}
      <div
        className="px-5 py-3 flex-shrink-0"
        style={{ borderBottom: "1px solid var(--forge-100)" }}
      >
        <p
          className="text-[11px] font-medium mb-2"
          style={{ color: "var(--forge-400)", textTransform: "uppercase", letterSpacing: "0.05em" }}
        >
          Maturité
        </p>
        <span
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-semibold"
          style={{ background: sc.bg, color: sc.color }}
        >
          {sc.emoji} {sc.label}
        </span>
      </div>

      {/* Fields */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        {fields.map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex gap-3">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
              style={{ background: "var(--forge-50)" }}
            >
              <Icon className="w-3.5 h-3.5" style={{ color: "var(--forge-400)" }} />
            </div>
            <div className="min-w-0">
              <p
                className="text-[11px] font-medium"
                style={{ color: "var(--forge-400)", textTransform: "uppercase", letterSpacing: "0.05em" }}
              >
                {label}
              </p>
              <p
                className="text-[13px] mt-0.5"
                style={{ color: value ? "var(--forge-900)" : "var(--forge-300)", fontStyle: value ? "normal" : "italic" }}
              >
                {value || "Non renseigné"}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Bot status footer */}
      <div
        className="px-5 py-3 flex-shrink-0"
        style={{ borderTop: "1px solid var(--forge-100)" }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: conversation.bot_active ? "#eff6ff" : "#f0fdf4" }}
          >
            {conversation.bot_active ? (
              <Bot className="w-3.5 h-3.5" style={{ color: "#2563eb" }} />
            ) : (
              <UserCheck className="w-3.5 h-3.5" style={{ color: "#16a34a" }} />
            )}
          </div>
          <div>
            <p className="text-[12px] font-semibold" style={{ color: "var(--forge-900)" }}>
              {conversation.bot_active ? "Bot actif" : "Artisan en ligne"}
            </p>
            <p className="text-[11px]" style={{ color: "var(--forge-400)" }}>
              {conversation.bot_active ? "Répond automatiquement" : "Vous gérez la conversation"}
            </p>
          </div>
          <div
            className="ml-auto w-2 h-2 rounded-full animate-pulse-dot"
            style={{ background: conversation.bot_active ? "#2563eb" : "#16a34a" }}
          />
        </div>
      </div>
    </aside>
  );
}
