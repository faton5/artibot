"use client";

import { useState } from "react";
import useSWR from "swr";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { useCurrentArtisan } from "@/hooks/useCurrentArtisan";
import { prospectApi } from "@/lib/api";
import { Search, Mail, MessageSquare, MessageCircle, ArrowRight } from "lucide-react";
import type { ProspectScore, ConversationStatus, Channel } from "@/types";

const SCORE_CONFIG: Record<ProspectScore, { label: string; emoji: string; color: string; bg: string }> = {
  hot:  { label: "Chaud",  emoji: "🔥", color: "#dc2626", bg: "#fee2e2" },
  warm: { label: "Tiède",  emoji: "🌡", color: "#ea580c", bg: "#ffedd5" },
  cold: { label: "Froid",  emoji: "❄️", color: "#6b7280", bg: "#f3f4f6" },
};

const STATUS_LABELS: Record<ConversationStatus, { label: string; color: string; bg: string }> = {
  active:    { label: "Active",    color: "#0369a1", bg: "#e0f2fe" },
  qualified: { label: "Qualifiée", color: "#15803d", bg: "#dcfce7" },
  escalated: { label: "Escaladée", color: "#b45309", bg: "#fef3c7" },
  closed:    { label: "Fermée",    color: "#6b7280", bg: "#f3f4f6" },
};

const CHANNEL_ICONS: Record<Channel, React.ElementType> = {
  email:    Mail,
  sms:      MessageSquare,
  whatsapp: MessageCircle,
};

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
}

export default function ProspectsPage() {
  const { artisanId, isLoading: artisanLoading } = useCurrentArtisan();
  const [scoreFilter, setScoreFilter] = useState<ProspectScore | "">("");
  const [channelFilter, setChannelFilter] = useState<Channel | "">("");
  const [search, setSearch] = useState("");

  const { data: prospects = [], isLoading } = useSWR(
    artisanId ? ["prospects", artisanId] : null,
    () => prospectApi.list(artisanId as string),
    { revalidateOnFocus: false }
  );

  const filtered = prospects.filter((p) => {
    if (scoreFilter && p.score !== scoreFilter) return false;
    if (channelFilter && p.conversation?.channel !== channelFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      if (
        !p.name?.toLowerCase().includes(q) &&
        !p.email?.toLowerCase().includes(q) &&
        !p.phone?.includes(q) &&
        !p.project_type?.toLowerCase().includes(q) &&
        !p.location?.toLowerCase().includes(q)
      )
        return false;
    }
    return true;
  });

  const loading = artisanLoading || isLoading;

  return (
    <div className="flex h-screen overflow-hidden">
      <Navbar />

      <main
        className="flex-1 overflow-y-auto"
        style={{ marginLeft: "var(--sidebar-w)", background: "#f8f8fb" }}
      >
        {/* Header */}
        <div
          className="px-8 py-6"
          style={{ background: "#ffffff", borderBottom: "1px solid #ebebf0" }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h1
                className="text-[20px]"
                style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, color: "#111113" }}
              >
                Prospects
              </h1>
              <p className="text-[13px] mt-0.5" style={{ color: "#8e8e98" }}>
                {prospects.length > 0
                  ? `${prospects.length} prospect${prospects.length > 1 ? "s" : ""} au total`
                  : "Aucun prospect pour l'instant"}
              </p>
            </div>

            {/* KPI pills */}
            {!loading && prospects.length > 0 && (
              <div className="flex items-center gap-2">
                {(["hot", "warm", "cold"] as ProspectScore[]).map((score) => {
                  const count = prospects.filter((p) => p.score === score).length;
                  if (!count) return null;
                  const cfg = SCORE_CONFIG[score];
                  return (
                    <span
                      key={score}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium"
                      style={{ background: cfg.bg, color: cfg.color }}
                    >
                      {cfg.emoji} {count} {cfg.label.toLowerCase()}{count > 1 ? "s" : ""}
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Filters */}
        <div
          className="px-8 py-3 flex items-center gap-3"
          style={{ background: "#ffffff", borderBottom: "1px solid #ebebf0" }}
        >
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: "#8e8e98" }} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un prospect…"
              className="w-full pl-9 pr-3 py-2 text-[13px] outline-none"
              style={{
                border: "1px solid #ebebf0",
                borderRadius: "8px",
                background: "#f8f8fb",
                color: "#111113",
                fontFamily: "'DM Sans', sans-serif",
              }}
              onFocus={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "#8e8e98";
                (e.currentTarget as HTMLElement).style.background = "#fff";
              }}
              onBlur={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "#ebebf0";
                (e.currentTarget as HTMLElement).style.background = "#f8f8fb";
              }}
            />
          </div>

          {/* Score filter */}
          <div className="flex gap-1.5">
            {[
              { value: "", label: "Tous" },
              { value: "hot",  label: "🔥 Chauds" },
              { value: "warm", label: "🌡 Tièdes" },
              { value: "cold", label: "❄️ Froids" },
            ].map(({ value, label }) => {
              const active = scoreFilter === value;
              return (
                <button
                  key={value}
                  onClick={() => setScoreFilter(value as ProspectScore | "")}
                  className="px-3 py-1.5 text-[12px] rounded-lg transition-all"
                  style={{
                    background: active ? "#111113" : "transparent",
                    color: active ? "#ffffff" : "#5a5a62",
                    fontWeight: active ? 600 : 500,
                    border: active ? "1px solid #111113" : "1px solid #ebebf0",
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* Channel filter */}
          <div className="flex gap-1.5 ml-auto">
            {[
              { value: "", label: "Tous canaux" },
              { value: "email",    label: "Email" },
              { value: "sms",      label: "SMS" },
              { value: "whatsapp", label: "WhatsApp" },
            ].map(({ value, label }) => {
              const active = channelFilter === value;
              return (
                <button
                  key={value}
                  onClick={() => setChannelFilter(value as Channel | "")}
                  className="px-3 py-1.5 text-[12px] rounded-lg transition-all"
                  style={{
                    background: active ? "#111113" : "transparent",
                    color: active ? "#ffffff" : "#5a5a62",
                    fontWeight: active ? 600 : 500,
                    border: active ? "1px solid #111113" : "1px solid #ebebf0",
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Table */}
        <div className="px-8 py-6">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-5 h-5 border-2 border-gray-200 border-t-indigo-500 rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
                style={{ background: "#f5f5f8" }}
              >
                👥
              </div>
              <p className="text-[14px] font-semibold" style={{ color: "#111113" }}>
                {prospects.length === 0 ? "Aucun prospect encore" : "Aucun résultat"}
              </p>
              <p className="text-[13px]" style={{ color: "#8e8e98" }}>
                {prospects.length === 0
                  ? "Vos prospects apparaîtront ici dès qu'un lead contactera votre bot."
                  : "Modifiez vos filtres pour voir plus de résultats."}
              </p>
            </div>
          ) : (
            <div
              className="rounded-2xl overflow-hidden"
              style={{ background: "#ffffff", border: "1px solid #ebebf0" }}
            >
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: "1px solid #ebebf0" }}>
                    {["Prospect", "Score", "Projet", "Localisation", "Budget", "Canal", "Date", "Statut", ""].map(
                      (h) => (
                        <th
                          key={h}
                          className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide"
                          style={{ color: "#8e8e98", background: "#fafafa" }}
                        >
                          {h}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p, i) => {
                    const score = SCORE_CONFIG[p.score as ProspectScore] ?? SCORE_CONFIG.cold;
                    const conv = p.conversation;
                    const status = conv ? STATUS_LABELS[conv.status as ConversationStatus] : null;
                    const ChannelIcon = conv ? CHANNEL_ICONS[conv.channel as Channel] ?? MessageSquare : null;

                    return (
                      <tr
                        key={p.id}
                        style={{
                          borderBottom: i < filtered.length - 1 ? "1px solid #f5f5f8" : "none",
                        }}
                      >
                        {/* Prospect identity */}
                        <td className="px-4 py-3">
                          <p className="text-[13px] font-semibold" style={{ color: "#111113" }}>
                            {p.name || "Inconnu"}
                          </p>
                          <p className="text-[11px]" style={{ color: "#8e8e98" }}>
                            {p.email || p.phone || "—"}
                          </p>
                        </td>

                        {/* Score */}
                        <td className="px-4 py-3">
                          <span
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-medium"
                            style={{ background: score.bg, color: score.color }}
                          >
                            {score.emoji} {score.label}
                          </span>
                        </td>

                        {/* Project type */}
                        <td className="px-4 py-3">
                          <p className="text-[12px]" style={{ color: "#5a5a62" }}>
                            {p.project_type || "—"}
                          </p>
                          {p.surface && (
                            <p className="text-[11px]" style={{ color: "#8e8e98" }}>
                              {p.surface}
                            </p>
                          )}
                        </td>

                        {/* Location */}
                        <td className="px-4 py-3">
                          <p className="text-[12px]" style={{ color: "#5a5a62" }}>
                            {p.location || "—"}
                          </p>
                        </td>

                        {/* Budget */}
                        <td className="px-4 py-3">
                          <p className="text-[12px]" style={{ color: "#5a5a62" }}>
                            {p.budget || "—"}
                          </p>
                          {p.delay && (
                            <p className="text-[11px]" style={{ color: "#8e8e98" }}>
                              {p.delay}
                            </p>
                          )}
                        </td>

                        {/* Channel */}
                        <td className="px-4 py-3">
                          {ChannelIcon && conv ? (
                            <div className="flex items-center gap-1.5">
                              <ChannelIcon className="w-3.5 h-3.5" style={{ color: "#8e8e98" }} />
                              <span className="text-[12px] capitalize" style={{ color: "#5a5a62" }}>
                                {conv.channel}
                              </span>
                            </div>
                          ) : (
                            <span className="text-[12px]" style={{ color: "#8e8e98" }}>—</span>
                          )}
                        </td>

                        {/* Date */}
                        <td className="px-4 py-3">
                          <p className="text-[12px]" style={{ color: "#5a5a62" }}>
                            {formatDate(conv?.created_at ?? p.created_at)}
                          </p>
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3">
                          {status ? (
                            <span
                              className="inline-flex items-center px-2 py-1 rounded-full text-[11px] font-medium"
                              style={{ background: status.bg, color: status.color }}
                            >
                              {status.label}
                            </span>
                          ) : (
                            <span className="text-[12px]" style={{ color: "#8e8e98" }}>—</span>
                          )}
                        </td>

                        {/* CTA */}
                        <td className="px-4 py-3">
                          {conv && (
                            <Link
                              href={`/dashboard/${conv.id}`}
                              className="inline-flex items-center gap-1 text-[12px] font-medium transition-colors"
                              style={{ color: "#ea580c" }}
                            >
                              Voir
                              <ArrowRight className="w-3 h-3" />
                            </Link>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
