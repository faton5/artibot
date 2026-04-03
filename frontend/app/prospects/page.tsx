"use client";

import { useState } from "react";
import useSWR from "swr";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { useCurrentArtisan } from "@/hooks/useCurrentArtisan";
import { prospectApi } from "@/lib/api";
import type { ProspectScore, ConversationStatus, Channel } from "@/types";

const SCORE_CONFIG: Record<ProspectScore, { label: string; bg: string; color: string; icon: string }> = {
  hot:  { label: "Chaud",  bg: "#ffdad6", color: "#93000a", icon: "local_fire_department" },
  warm: { label: "Tiède",  bg: "#ffdcc3", color: "#623200", icon: "thermometer" },
  cold: { label: "Froid",  bg: "#e7e8e9", color: "#564334", icon: "ac_unit" },
};

const STATUS_CONFIG: Record<ConversationStatus, { label: string; bg: string; color: string }> = {
  active:    { label: "Active",    bg: "#c7e7ff", color: "#004360" },
  qualified: { label: "Qualifiée", bg: "#fdb881", color: "#2f1500" },
  escalated: { label: "Escaladée", bg: "#ffdad6", color: "#93000a" },
  closed:    { label: "Fermée",    bg: "#e7e8e9", color: "#564334" },
};

const CHANNEL_ICON: Record<Channel, string> = {
  email:    "mail",
  sms:      "sms",
  whatsapp: "chat",
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

  const kpiCounts = {
    hot:  prospects.filter((p) => p.score === "hot").length,
    warm: prospects.filter((p) => p.score === "warm").length,
    cold: prospects.filter((p) => p.score === "cold").length,
  };

  return (
    <div className="flex min-h-screen" style={{ background: "#f8f9fa" }}>
      <Navbar />

      <main className="flex-1" style={{ marginLeft: "var(--sidebar-w)" }}>
        {/* Top App Bar */}
        <header className="flex justify-between items-center h-16 px-8 sticky top-0 z-40"
          style={{ background: "rgba(248,249,250,0.85)", backdropFilter: "blur(12px)", borderBottom: "1px solid #e7e8e9" }}>
          <div className="relative w-full max-w-md">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
            <input
              className="w-full py-2 pl-10 pr-4 text-sm rounded-full outline-none"
              style={{ background: "#f3f4f5", border: "none" }}
              placeholder="Rechercher un prospect..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-4 ml-6">
            <button className="relative text-slate-500 hover:text-orange-600 transition-colors">
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-0 right-0 w-2 h-2 rounded-full" style={{ background: "#904d00" }} />
            </button>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto">
          {/* Page header */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <h1 className="text-2xl font-extrabold font-headline tracking-tight" style={{ color: "#191c1d" }}>Prospects</h1>
              <p className="text-sm mt-1" style={{ color: "#564334" }}>
                {prospects.length > 0 ? `${prospects.length} prospect${prospects.length > 1 ? "s" : ""} au total` : "Aucun prospect pour l'instant"}
              </p>
            </div>
            {!loading && prospects.length > 0 && (
              <div className="flex items-center gap-3">
                {(["hot", "warm", "cold"] as ProspectScore[]).map((score) => {
                  const count = kpiCounts[score];
                  if (!count) return null;
                  const cfg = SCORE_CONFIG[score];
                  return (
                    <div key={score} className="p-4 rounded-xl shadow-sm flex items-center gap-3" style={{ background: "#ffffff" }}>
                      <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: cfg.bg }}>
                        <span className="material-symbols-outlined text-sm" style={{ color: cfg.color, fontVariationSettings: "'FILL' 1" }}>{cfg.icon}</span>
                      </div>
                      <div>
                        <div className="text-lg font-extrabold font-headline" style={{ color: "#191c1d" }}>{count}</div>
                        <div className="text-xs" style={{ color: "#564334" }}>{cfg.label}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3 mb-6 flex-wrap">
            {/* Score filters */}
            <div className="flex items-center p-1 rounded-full gap-1" style={{ background: "#f3f4f5" }}>
              {[{ value: "", label: "Tous" }, { value: "hot", label: "Chauds" }, { value: "warm", label: "Tièdes" }, { value: "cold", label: "Froids" }].map(({ value, label }) => {
                const active = scoreFilter === value;
                return (
                  <button key={value} onClick={() => setScoreFilter(value as ProspectScore | "")}
                    className="px-4 py-1.5 rounded-full text-sm font-medium transition-all"
                    style={active ? { background: "#904d00", color: "#fff" } : { color: "#64748b" }}>
                    {label}
                  </button>
                );
              })}
            </div>
            {/* Channel filters */}
            <div className="flex items-center p-1 rounded-full gap-1 ml-auto" style={{ background: "#f3f4f5" }}>
              {[{ value: "", label: "Tous canaux" }, { value: "email", label: "Email" }, { value: "sms", label: "SMS" }, { value: "whatsapp", label: "WhatsApp" }].map(({ value, label }) => {
                const active = channelFilter === value;
                return (
                  <button key={value} onClick={() => setChannelFilter(value as Channel | "")}
                    className="px-4 py-1.5 rounded-full text-sm font-medium transition-all"
                    style={active ? { background: "#904d00", color: "#fff" } : { color: "#64748b" }}>
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-6 h-6 rounded-full border-2" style={{ borderColor: "#e7e8e9", borderTopColor: "#904d00", animation: "spin 0.7s linear infinite" }} />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4 rounded-2xl" style={{ background: "#ffffff" }}>
              <span className="material-symbols-outlined text-5xl" style={{ color: "#ddc1ae" }}>group</span>
              <p className="text-base font-semibold" style={{ color: "#191c1d" }}>
                {prospects.length === 0 ? "Aucun prospect encore" : "Aucun résultat"}
              </p>
              <p className="text-sm" style={{ color: "#564334" }}>
                {prospects.length === 0
                  ? "Vos prospects apparaîtront ici dès qu'un lead contactera votre bot."
                  : "Modifiez vos filtres pour voir plus de résultats."}
              </p>
            </div>
          ) : (
            <div className="rounded-2xl overflow-hidden" style={{ background: "#ffffff" }}>
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: "1px solid #f3f4f5" }}>
                    {["Prospect", "Score", "Projet", "Localisation", "Budget", "Canal", "Date", "Statut", ""].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-widest" style={{ color: "#564334", background: "#f8f9fa" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p, i) => {
                    const score = SCORE_CONFIG[p.score as ProspectScore] ?? SCORE_CONFIG.cold;
                    const conv = p.conversation;
                    const status = conv ? STATUS_CONFIG[conv.status as ConversationStatus] : null;
                    const channelIcon = conv ? CHANNEL_ICON[conv.channel as Channel] ?? "chat_bubble" : null;
                    const initials = (p.name || "?").split(" ").map((w: string) => w[0]).join("").substring(0, 2).toUpperCase();

                    return (
                      <tr key={p.id} style={{ borderBottom: i < filtered.length - 1 ? "1px solid #f3f4f5" : "none" }}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0" style={{ background: "#ffdcc3", color: "#623200" }}>
                              {initials}
                            </div>
                            <div>
                              <p className="text-sm font-semibold" style={{ color: "#191c1d" }}>{p.name || "Inconnu"}</p>
                              <p className="text-xs" style={{ color: "#564334" }}>{p.email || p.phone || "—"}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-xs font-semibold" style={{ background: score.bg, color: score.color }}>
                            <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>{score.icon}</span>
                            {score.label}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm" style={{ color: "#564334" }}>{p.project_type || "—"}</p>
                          {p.surface && <p className="text-xs" style={{ color: "#897362" }}>{p.surface}</p>}
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm" style={{ color: "#564334" }}>{p.location || "—"}</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm" style={{ color: "#564334" }}>{p.budget || "—"}</p>
                          {p.delay && <p className="text-xs" style={{ color: "#897362" }}>{p.delay}</p>}
                        </td>
                        <td className="px-4 py-3">
                          {channelIcon && conv ? (
                            <div className="flex items-center gap-1.5">
                              <span className="material-symbols-outlined text-base" style={{ color: "#564334" }}>{channelIcon}</span>
                              <span className="text-sm capitalize" style={{ color: "#564334" }}>{conv.channel}</span>
                            </div>
                          ) : <span className="text-sm" style={{ color: "#897362" }}>—</span>}
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm" style={{ color: "#564334" }}>{formatDate(conv?.created_at ?? p.created_at)}</p>
                        </td>
                        <td className="px-4 py-3">
                          {status ? (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-sm text-xs font-semibold" style={{ background: status.bg, color: status.color }}>
                              {status.label}
                            </span>
                          ) : <span className="text-sm" style={{ color: "#897362" }}>—</span>}
                        </td>
                        <td className="px-4 py-3">
                          {conv && (
                            <Link href={`/dashboard/${conv.id}`}
                              className="inline-flex items-center gap-1 text-sm font-semibold transition-colors"
                              style={{ color: "#904d00" }}>
                              Voir
                              <span className="material-symbols-outlined text-sm">chevron_right</span>
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
