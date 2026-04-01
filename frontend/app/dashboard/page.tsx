"use client";

import { useState } from "react";
import useSWR from "swr";
import { Navbar } from "@/components/Navbar";
import { ConversationList } from "@/components/ConversationList";
import { useCurrentArtisan } from "@/hooks/useCurrentArtisan";
import { conversationApi } from "@/lib/api";
import { Search } from "lucide-react";
import type { ConversationStatus } from "@/types";

const STATUS_FILTERS: { label: string; value: ConversationStatus | "" }[] = [
  { label: "Toutes", value: "" },
  { label: "Actives", value: "active" },
  { label: "Qualifiées", value: "qualified" },
  { label: "Escaladées", value: "escalated" },
  { label: "Fermées", value: "closed" },
];

const KPI_CONFIG = [
  {
    key: "total",
    label: "Conversations",
    accent: "#6366f1",
    lightBg: "#eef2ff",
    emoji: "💬",
  },
  {
    key: "active",
    label: "En cours",
    accent: "#0ea5e9",
    lightBg: "#e0f2fe",
    emoji: "⚡",
  },
  {
    key: "qualified",
    label: "Qualifiées",
    accent: "#16a34a",
    lightBg: "#dcfce7",
    emoji: "✅",
  },
  {
    key: "hot",
    label: "Chauds 🔥",
    accent: "#dc2626",
    lightBg: "#fee2e2",
    emoji: "",
  },
];

export default function DashboardPage() {
  const { artisanId, isLoading: artisanLoading } = useCurrentArtisan();
  const [statusFilter, setStatusFilter] = useState<ConversationStatus | "">("");
  const [search, setSearch] = useState("");

  const { data: conversations = [], isLoading, error } = useSWR(
    artisanId ? ["conversations", artisanId, statusFilter] : null,
    () => conversationApi.list(artisanId as string, statusFilter || undefined),
    { refreshInterval: 5000 }
  );

  const filtered = search.trim()
    ? conversations.filter((c) => {
        const q = search.toLowerCase();
        return (
          c.prospect?.name?.toLowerCase().includes(q) ||
          c.prospect?.email?.toLowerCase().includes(q) ||
          c.prospect?.phone?.includes(q) ||
          c.last_message?.content?.toLowerCase().includes(q)
        );
      })
    : conversations;

  const kpiValues: Record<string, number> = {
    total: conversations.length,
    active: conversations.filter((c) => c.status === "active").length,
    qualified: conversations.filter((c) => c.status === "qualified").length,
    hot: conversations.filter((c) => c.prospect?.score === "hot").length,
  };

  const showKPIs = !artisanLoading && !isLoading;

  return (
    <div className="flex h-screen overflow-hidden">
      <Navbar />

      <main
        className="flex-1 flex flex-col min-w-0"
        style={{ marginLeft: "var(--sidebar-w)", background: "#f8f8fb" }}
      >
        {/* ── KPI strip ── */}
        <div
          className="px-6 pt-5 pb-0"
          style={{ background: "#ffffff", borderBottom: "1px solid #ebebf0" }}
        >
          <div className="flex items-end justify-between mb-4">
            <div>
              <h1
                className="text-[20px] leading-tight"
                style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, color: "#111113" }}
              >
                Tableau de bord
              </h1>
              <p className="text-[13px] mt-0.5" style={{ color: "#8e8e98" }}>
                Vue d'ensemble de vos prospects
              </p>
            </div>
          </div>

          {/* KPI cards row */}
          <div className="grid grid-cols-4 gap-3 pb-5">
            {KPI_CONFIG.map(({ key, label, accent, lightBg, emoji }) => {
              const value = kpiValues[key] ?? 0;
              return (
                <div
                  key={key}
                  className="rounded-xl p-4 relative overflow-hidden"
                  style={{
                    background: "#ffffff",
                    border: "1px solid #ebebf0",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                  }}
                >
                  {/* Top accent bar */}
                  <div
                    className="absolute top-0 left-0 right-0 h-[3px] rounded-t-xl"
                    style={{ background: accent }}
                  />
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-sm mb-3"
                    style={{ background: lightBg }}
                  >
                    {emoji || <span style={{ color: accent }}>●</span>}
                  </div>
                  <p
                    className="text-[28px] leading-none mb-1"
                    style={{
                      fontFamily: "'Bricolage Grotesque', sans-serif",
                      fontWeight: 800,
                      color: showKPIs ? accent : "#d4d4dc",
                    }}
                  >
                    {showKPIs ? value : "—"}
                  </p>
                  <p className="text-[12px] font-medium" style={{ color: "#8e8e98" }}>
                    {label}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Filters + Search ── */}
        <div
          className="px-6 py-3 flex items-center gap-3"
          style={{ background: "#ffffff", borderBottom: "1px solid #ebebf0" }}
        >
          {/* Search */}
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: "#8e8e98" }} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher…"
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

          {/* Status filters */}
          <div className="flex gap-1.5">
            {STATUS_FILTERS.map(({ label, value }) => {
              const active = statusFilter === value;
              return (
                <button
                  key={value}
                  onClick={() => setStatusFilter(value)}
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

        {/* ── List ── */}
        <div className="flex-1 overflow-y-auto" style={{ background: "#ffffff" }}>
          {(artisanLoading || isLoading) && (
            <div className="flex items-center justify-center py-24">
              <div className="w-5 h-5 border-2 border-gray-200 border-t-indigo-500 rounded-full animate-spin" />
            </div>
          )}
          {error && (
            <div className="p-8 text-center text-[13px] text-red-500">
              Erreur de chargement des conversations
            </div>
          )}
          {!artisanLoading && !isLoading && !error && artisanId && (
            <ConversationList conversations={filtered} />
          )}
        </div>
      </main>
    </div>
  );
}
