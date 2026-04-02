"use client";

import { useState } from "react";
import useSWR from "swr";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { useCurrentArtisan } from "@/hooks/useCurrentArtisan";
import { reportApi } from "@/lib/api";
import { Mail, MessageSquare, MessageCircle, X, ExternalLink, FileText } from "lucide-react";
import type { RapportWithMeta } from "@/types";

const SCORE_CONFIG = {
  hot:  { emoji: "🔥", color: "#dc2626", bg: "#fee2e2" },
  warm: { emoji: "🌡", color: "#ea580c", bg: "#ffedd5" },
  cold: { emoji: "❄️", color: "#6b7280", bg: "#f3f4f6" },
} as const;

const CHANNEL_ICONS = {
  email:    Mail,
  sms:      MessageSquare,
  whatsapp: MessageCircle,
} as const;

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDateShort(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function ReportsPage() {
  const { artisanId, isLoading: artisanLoading } = useCurrentArtisan();
  const [selected, setSelected] = useState<RapportWithMeta | null>(null);

  const { data: reports = [], isLoading } = useSWR(
    artisanId ? ["reports", artisanId] : null,
    () => reportApi.list(artisanId as string),
    { revalidateOnFocus: false }
  );

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
          <h1
            className="text-[20px]"
            style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, color: "#111113" }}
          >
            Rapports
          </h1>
          <p className="text-[13px] mt-0.5" style={{ color: "#8e8e98" }}>
            {reports.length > 0
              ? `${reports.length} rapport${reports.length > 1 ? "s" : ""} de qualification générés`
              : "Aucun rapport généré pour l'instant"}
          </p>
        </div>

        {/* Content */}
        <div className="px-8 py-6">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-5 h-5 border-2 border-gray-200 border-t-indigo-500 rounded-full animate-spin" />
            </div>
          ) : reports.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
                style={{ background: "#f5f5f8" }}
              >
                📋
              </div>
              <p className="text-[14px] font-semibold" style={{ color: "#111113" }}>
                Aucun rapport pour l'instant
              </p>
              <p className="text-[13px]" style={{ color: "#8e8e98" }}>
                Les rapports de qualification apparaîtront ici une fois générés.
              </p>
            </div>
          ) : (
            <div className="grid gap-3">
              {reports.map((r, i) => {
                const score = r.prospect?.score
                  ? (SCORE_CONFIG[r.prospect.score as keyof typeof SCORE_CONFIG] ?? SCORE_CONFIG.cold)
                  : null;
                const ChannelIcon = CHANNEL_ICONS[r.channel as keyof typeof CHANNEL_ICONS] ?? MessageSquare;

                // Extract a text preview from HTML
                const textPreview = r.html_content
                  .replace(/<[^>]+>/g, " ")
                  .replace(/\s+/g, " ")
                  .trim()
                  .slice(0, 140);

                return (
                  <div
                    key={r.id}
                    className="rounded-2xl p-5 cursor-pointer transition-all duration-150 animate-fade-up"
                    style={{
                      background: "#ffffff",
                      border: "1px solid #ebebf0",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                      animationDelay: `${i * 40}ms`,
                      animationFillMode: "both",
                    }}
                    onClick={() => setSelected(r)}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor = "#d4d4dc";
                      (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 8px rgba(0,0,0,0.08)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor = "#ebebf0";
                      (e.currentTarget as HTMLElement).style.boxShadow = "0 1px 3px rgba(0,0,0,0.04)";
                    }}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 min-w-0">
                        {/* Icon */}
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                          style={{ background: "#f5f5f8" }}
                        >
                          <FileText className="w-4 h-4" style={{ color: "#8e8e98" }} />
                        </div>

                        <div className="min-w-0">
                          {/* Title row */}
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <p className="text-[13px] font-semibold" style={{ color: "#111113" }}>
                              {r.prospect?.name || "Prospect inconnu"}
                            </p>
                            {score && (
                              <span
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium"
                                style={{ background: score.bg, color: score.color }}
                              >
                                {score.emoji}
                              </span>
                            )}
                            <div className="flex items-center gap-1">
                              <ChannelIcon className="w-3 h-3" style={{ color: "#8e8e98" }} />
                              <span className="text-[11px] capitalize" style={{ color: "#8e8e98" }}>
                                {r.channel}
                              </span>
                            </div>
                          </div>

                          {/* Preview */}
                          <p className="text-[12px] line-clamp-2" style={{ color: "#8e8e98" }}>
                            {textPreview}…
                          </p>
                        </div>
                      </div>

                      {/* Date + CTA */}
                      <div className="flex flex-col items-end gap-2 flex-shrink-0">
                        <p className="text-[11px]" style={{ color: "#8e8e98" }}>
                          {r.sent_at ? `Envoyé le ${formatDateShort(r.sent_at)}` : formatDateShort(r.created_at)}
                        </p>
                        <span
                          className="text-[12px] font-medium"
                          style={{ color: "#ea580c" }}
                        >
                          Voir le rapport →
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* ── Report modal ── */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }}
          onClick={() => setSelected(null)}
        >
          <div
            className="relative w-full max-w-2xl max-h-[85vh] flex flex-col rounded-2xl overflow-hidden"
            style={{ background: "#ffffff", boxShadow: "0 24px 60px rgba(0,0,0,0.2)" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div
              className="flex items-center justify-between px-6 py-4 flex-shrink-0"
              style={{ borderBottom: "1px solid #ebebf0" }}
            >
              <div>
                <p
                  className="text-[15px]"
                  style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700, color: "#111113" }}
                >
                  Rapport — {selected.prospect?.name || "Prospect inconnu"}
                </p>
                <p className="text-[12px]" style={{ color: "#8e8e98" }}>
                  {selected.sent_at
                    ? `Envoyé le ${formatDate(selected.sent_at)}`
                    : `Créé le ${formatDate(selected.created_at)}`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href={`/dashboard/${selected.conversation_id}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors"
                  style={{ background: "#fff7ed", color: "#c2410c", border: "1px solid #fed7aa" }}
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Voir conversation
                </Link>
                <button
                  onClick={() => setSelected(null)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors"
                  style={{ background: "#f5f5f8" }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "#ebebf0")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "#f5f5f8")}
                >
                  <X className="w-4 h-4" style={{ color: "#5a5a62" }} />
                </button>
              </div>
            </div>

            {/* Modal body — HTML content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div
                className="prose max-w-none text-[13px]"
                style={{ color: "#111113", lineHeight: 1.7 }}
                dangerouslySetInnerHTML={{ __html: selected.html_content }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
