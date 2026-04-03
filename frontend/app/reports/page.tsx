"use client";

import { useState } from "react";
import useSWR from "swr";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { useCurrentArtisan } from "@/hooks/useCurrentArtisan";
import { reportApi } from "@/lib/api";
import type { RapportWithMeta } from "@/types";

const SCORE_CONFIG = {
  hot:  { label: "Chaud", icon: "local_fire_department", bg: "#ffdad6", color: "#93000a" },
  warm: { label: "Tiède", icon: "thermometer",           bg: "#ffdcc3", color: "#623200" },
  cold: { label: "Froid", icon: "ac_unit",               bg: "#e7e8e9", color: "#564334" },
} as const;

const CHANNEL_ICON: Record<string, string> = {
  email:    "mail",
  sms:      "sms",
  whatsapp: "chat",
};

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function formatDateShort(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
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
    <div className="flex min-h-screen" style={{ background: "#f8f9fa" }}>
      <Navbar />

      <main className="flex-1" style={{ marginLeft: "var(--sidebar-w)" }}>
        {/* Top bar */}
        <header className="flex justify-between items-center h-16 px-8 sticky top-0 z-40"
          style={{ background: "rgba(248,249,250,0.85)", backdropFilter: "blur(12px)", borderBottom: "1px solid #e7e8e9" }}>
          <div className="relative w-full max-w-md">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
            <input className="w-full py-2 pl-10 pr-4 text-sm rounded-full outline-none" style={{ background: "#f3f4f5", border: "none" }}
              placeholder="Rechercher un rapport..." />
          </div>
          <div className="flex items-center gap-4 ml-6">
            <button className="relative text-slate-500 hover:text-orange-600 transition-colors">
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-0 right-0 w-2 h-2 rounded-full" style={{ background: "#904d00" }} />
            </button>
          </div>
        </header>

        <div className="p-8 max-w-4xl mx-auto">
          {/* Page header */}
          <div className="mb-8">
            <h1 className="text-2xl font-extrabold font-headline tracking-tight" style={{ color: "#191c1d" }}>Rapports de Qualification</h1>
            <p className="text-sm mt-1" style={{ color: "#564334" }}>
              {reports.length > 0
                ? `${reports.length} rapport${reports.length > 1 ? "s" : ""} générés`
                : "Aucun rapport généré pour l'instant"}
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-6 h-6 rounded-full border-2" style={{ borderColor: "#e7e8e9", borderTopColor: "#904d00", animation: "spin 0.7s linear infinite" }} />
            </div>
          ) : reports.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4 rounded-2xl" style={{ background: "#ffffff" }}>
              <span className="material-symbols-outlined text-5xl" style={{ color: "#ddc1ae" }}>description</span>
              <p className="text-base font-semibold" style={{ color: "#191c1d" }}>Aucun rapport pour l'instant</p>
              <p className="text-sm" style={{ color: "#564334" }}>Les rapports de qualification apparaîtront ici une fois générés.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {reports.map((r, i) => {
                const score = r.prospect?.score
                  ? (SCORE_CONFIG[r.prospect.score as keyof typeof SCORE_CONFIG] ?? SCORE_CONFIG.cold)
                  : null;
                const channelIcon = CHANNEL_ICON[r.channel] ?? "chat_bubble";
                const textPreview = r.html_content.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 140);
                const name = r.prospect?.name || "Prospect inconnu";
                const initials = name.split(" ").map((w: string) => w[0]).join("").substring(0, 2).toUpperCase();

                return (
                  <div key={r.id}
                    className="rounded-2xl p-5 cursor-pointer transition-all animate-fade-up shadow-sm"
                    style={{ background: "#ffffff", animationDelay: `${i * 40}ms`, animationFillMode: "both" }}
                    onClick={() => setSelected(r)}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "#f8f9fa")}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "#ffffff")}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4 min-w-0">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0" style={{ background: "#ffdcc3", color: "#623200" }}>
                          {initials}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <p className="text-sm font-bold" style={{ color: "#191c1d" }}>{name}</p>
                            {score && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm text-xs font-semibold"
                                style={{ background: score.bg, color: score.color }}>
                                <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>{score.icon}</span>
                                {score.label}
                              </span>
                            )}
                            <div className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-sm" style={{ color: "#897362" }}>{channelIcon}</span>
                              <span className="text-xs capitalize" style={{ color: "#897362" }}>{r.channel}</span>
                            </div>
                          </div>
                          <p className="text-sm line-clamp-2" style={{ color: "#564334" }}>{textPreview}…</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2 flex-shrink-0">
                        <p className="text-xs" style={{ color: "#897362" }}>
                          {r.sent_at ? `Envoyé le ${formatDateShort(r.sent_at)}` : formatDateShort(r.created_at)}
                        </p>
                        <span className="text-sm font-semibold" style={{ color: "#904d00" }}>Voir →</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Report modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(6px)" }}
          onClick={() => setSelected(null)}>
          <div className="relative w-full max-w-2xl max-h-[85vh] flex flex-col rounded-3xl overflow-hidden"
            style={{ background: "#ffffff", boxShadow: "0 24px 80px rgba(0,0,0,0.25)" }}
            onClick={(e) => e.stopPropagation()}>
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 flex-shrink-0" style={{ borderBottom: "1px solid #f3f4f5" }}>
              <div>
                <p className="text-base font-extrabold font-headline" style={{ color: "#191c1d" }}>
                  Rapport — {selected.prospect?.name || "Prospect inconnu"}
                </p>
                <p className="text-xs mt-0.5" style={{ color: "#564334" }}>
                  {selected.sent_at ? `Envoyé le ${formatDate(selected.sent_at)}` : `Créé le ${formatDate(selected.created_at)}`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Link href={`/dashboard/${selected.conversation_id}`}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium transition-all"
                  style={{ background: "#ffdcc3", color: "#623200" }}>
                  <span className="material-symbols-outlined text-base">open_in_new</span>
                  Voir conversation
                </Link>
                <button onClick={() => setSelected(null)}
                  className="w-8 h-8 flex items-center justify-center rounded-xl transition-all"
                  style={{ background: "#f3f4f5" }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "#e7e8e9")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "#f3f4f5")}>
                  <span className="material-symbols-outlined text-base" style={{ color: "#564334" }}>close</span>
                </button>
              </div>
            </div>
            {/* Modal body */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="prose max-w-none text-sm" style={{ color: "#191c1d", lineHeight: 1.7 }}
                dangerouslySetInnerHTML={{ __html: selected.html_content }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
