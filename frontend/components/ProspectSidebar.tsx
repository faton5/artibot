"use client";

import type { Conversation } from "@/types";
import {
  User, Phone, Mail, Briefcase, MapPin, Wallet,
  Calendar, Thermometer, Bot, UserCheck
} from "lucide-react";

interface Props {
  conversation: Conversation;
}

const SCORE_CONFIG = {
  hot: { label: "Chaud", color: "bg-red-100 text-red-700 border-red-200" },
  warm: { label: "Tiède", color: "bg-amber-100 text-amber-700 border-amber-200" },
  cold: { label: "Froid", color: "bg-slate-100 text-slate-600 border-slate-200" },
};

export function ProspectSidebar({ conversation }: Props) {
  const prospect = conversation.prospect;
  const score = prospect?.score ?? "cold";
  const scoreConfig = SCORE_CONFIG[score] ?? SCORE_CONFIG.cold;

  const fields: { icon: React.ElementType; label: string; value: string | null | undefined }[] = [
    { icon: User, label: "Nom", value: prospect?.name },
    { icon: Phone, label: "Téléphone", value: prospect?.phone },
    { icon: Mail, label: "Email", value: prospect?.email },
    { icon: Briefcase, label: "Travaux", value: prospect?.project_type },
    { icon: MapPin, label: "Surface", value: prospect?.surface },
    { icon: MapPin, label: "Localisation", value: prospect?.location },
    { icon: Wallet, label: "Budget", value: prospect?.budget },
    { icon: Calendar, label: "Délai", value: prospect?.delay },
  ];

  return (
    <aside className="w-72 border-l border-gray-200 bg-white flex flex-col">
      {/* Header */}
      <div className="px-4 py-4 border-b border-gray-100">
        <h3 className="font-semibold text-gray-900 text-sm">Fiche prospect</h3>
      </div>

      {/* Score de maturité */}
      <div className="px-4 py-3 border-b border-gray-100">
        <p className="text-xs text-gray-500 mb-1.5">Maturité</p>
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${scoreConfig.color}`}>
          <Thermometer className="w-3 h-3" />
          {scoreConfig.label}
        </span>
      </div>

      {/* Données prospect */}
      <div className="px-4 py-3 flex-1 space-y-3 overflow-y-auto">
        {fields.map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex gap-2.5">
            <Icon className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
            <div className="min-w-0">
              <p className="text-xs text-gray-400">{label}</p>
              <p className={`text-sm ${value ? "text-gray-900" : "text-gray-300 italic"}`}>
                {value || "Non renseigné"}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Statut bot */}
      <div className="px-4 py-3 border-t border-gray-100">
        <div className="flex items-center gap-2">
          {conversation.bot_active ? (
            <Bot className="w-4 h-4 text-blue-500" />
          ) : (
            <UserCheck className="w-4 h-4 text-green-600" />
          )}
          <span className="text-xs text-gray-600">
            {conversation.bot_active ? "Bot actif" : "Artisan en ligne"}
          </span>
          <div
            className={`ml-auto w-2 h-2 rounded-full ${
              conversation.bot_active ? "bg-blue-500 animate-pulse" : "bg-green-500"
            }`}
          />
        </div>
      </div>
    </aside>
  );
}
