"use client";

import type { Conversation } from "@/types";

interface Props {
  conversation: Conversation;
}

const SCORE_CONFIG = {
  hot:  { label: "Chaud",  icon: "local_fire_department", bg: "#ffdad6", color: "#93000a" },
  warm: { label: "Tiède",  icon: "thermometer",           bg: "#ffdcc3", color: "#623200" },
  cold: { label: "Froid",  icon: "ac_unit",               bg: "#e7e8e9", color: "#564334" },
} as const;

type ProspectStringKey = "name" | "phone" | "email" | "project_type" | "surface" | "location" | "budget" | "delay";
const FIELDS: { key: ProspectStringKey; label: string; icon: string }[] = [
  { key: "name",         label: "Nom",          icon: "person" },
  { key: "phone",        label: "Téléphone",    icon: "call" },
  { key: "email",        label: "Email",        icon: "mail" },
  { key: "project_type", label: "Travaux",      icon: "construction" },
  { key: "surface",      label: "Surface",      icon: "square_foot" },
  { key: "location",     label: "Localisation", icon: "location_on" },
  { key: "budget",       label: "Budget",       icon: "payments" },
  { key: "delay",        label: "Délai",        icon: "schedule" },
];

export function ProspectSidebar({ conversation }: Props) {
  const prospect = conversation.prospect;
  const score = prospect?.score ?? "cold";
  const sc = SCORE_CONFIG[score] ?? SCORE_CONFIG.cold;

  return (
    <aside className="flex flex-col flex-shrink-0" style={{ width: "272px", borderLeft: "1px solid #e7e8e9", background: "#f8f9fa" }}>
      {/* Header */}
      <div className="px-5 py-4 flex-shrink-0" style={{ background: "#ffffff", borderBottom: "1px solid #f3f4f5" }}>
        <p className="text-sm font-extrabold font-headline" style={{ color: "#191c1d" }}>Fiche prospect</p>
      </div>

      {/* Score */}
      <div className="px-5 py-3 flex-shrink-0" style={{ background: "#ffffff", borderBottom: "1px solid #f3f4f5" }}>
        <p className="text-[11px] font-bold uppercase tracking-widest mb-2" style={{ color: "#564334" }}>Maturité</p>
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-semibold"
          style={{ background: sc.bg, color: sc.color }}>
          <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>{sc.icon}</span>
          {sc.label}
        </span>
      </div>

      {/* Fields */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4" style={{ background: "#ffffff" }}>
        {FIELDS.map(({ key, label, icon }) => {
          const value = prospect?.[key as keyof typeof prospect] as string | null | undefined;
          return (
            <div key={label} className="flex gap-3">
              <div className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: "#f3f4f5" }}>
                <span className="material-symbols-outlined text-sm" style={{ color: "#564334" }}>{icon}</span>
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: "#897362" }}>{label}</p>
                <p className="text-sm mt-0.5" style={{ color: value ? "#191c1d" : "#ddc1ae", fontStyle: value ? "normal" : "italic" }}>
                  {value || "Non renseigné"}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bot status footer */}
      <div className="px-5 py-3 flex-shrink-0" style={{ background: "#ffffff", borderTop: "1px solid #f3f4f5" }}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: conversation.bot_active ? "#c7e7ff" : "#fdb881" }}>
            <span className="material-symbols-outlined text-base" style={{ color: conversation.bot_active ? "#004360" : "#2f1500", fontVariationSettings: "'FILL' 1" }}>
              {conversation.bot_active ? "smart_toy" : "person_check"}
            </span>
          </div>
          <div>
            <p className="text-xs font-bold" style={{ color: "#191c1d" }}>
              {conversation.bot_active ? "Bot actif" : "Artisan en ligne"}
            </p>
            <p className="text-[11px]" style={{ color: "#564334" }}>
              {conversation.bot_active ? "Répond automatiquement" : "Vous gérez la conversation"}
            </p>
          </div>
          <div className="ml-auto w-2 h-2 rounded-full animate-pulse-dot"
            style={{ background: conversation.bot_active ? "#00658f" : "#865224" }} />
        </div>
      </div>
    </aside>
  );
}
