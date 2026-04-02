"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { ConversationList } from "@/components/ConversationList";
import { useCurrentArtisan } from "@/hooks/useCurrentArtisan";
import { conversationApi, readinessApi } from "@/lib/api";
import { Search, Circle, ChevronRight } from "lucide-react";
import type { ConversationStatus } from "@/types";

const STATUS_FILTERS: { label: string; value: ConversationStatus | "" }[] = [
  { label: "Toutes", value: "" },
  { label: "Actives", value: "active" },
  { label: "Qualifiées", value: "qualified" },
  { label: "Escaladées", value: "escalated" },
  { label: "Fermées", value: "closed" },
];

const KPI_CONFIG = [
  { key: "total",     label: "Conversations", accent: "#6366f1", bg: "#eef2ff", emoji: "💬" },
  { key: "active",    label: "En cours",      accent: "#0ea5e9", bg: "#e0f2fe", emoji: "⚡" },
  { key: "qualified", label: "Qualifiées",    accent: "#16a34a", bg: "#dcfce7", emoji: "✅" },
  { key: "hot",       label: "Chauds",        accent: "#dc2626", bg: "#fee2e2", emoji: "🔥" },
];

const READINESS_STEPS = [
  { key: "gmail_connected",      label: "Gmail",             href: "/integrations" },
  { key: "knowledge_ready",      label: "Base connaissance", href: "/knowledge" },
  { key: "bot_config_ready",     label: "Config bot",        href: "/settings" },
  { key: "welcome_message_ready",label: "Message d'accueil", href: "/settings" },
  { key: "has_test_conversation",label: "Test conversation", href: null },
] as const;

export default function DashboardPage() {
  const router = useRouter();
  const { artisanId, isLoading: artisanLoading, needsOnboarding } = useCurrentArtisan();
  const [statusFilter, setStatusFilter] = useState<ConversationStatus | "">("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!artisanLoading && needsOnboarding) {
      router.replace("/onboarding");
    }
  }, [artisanLoading, needsOnboarding, router]);

  const { data: conversations = [], isLoading, error } = useSWR(
    artisanId ? ["conversations", artisanId, statusFilter] : null,
    () => conversationApi.list(artisanId as string, statusFilter || undefined),
    { refreshInterval: 5000 }
  );

  const { data: readiness } = useSWR(
    artisanId ? ["readiness", artisanId] : null,
    () => readinessApi.get(artisanId as string),
    { revalidateOnFocus: false }
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
    total:     conversations.length,
    active:    conversations.filter((c) => c.status === "active").length,
    qualified: conversations.filter((c) => c.status === "qualified").length,
    hot:       conversations.filter((c) => c.prospect?.score === "hot").length,
  };

  const showKPIs = !artisanLoading && !isLoading;
  const showChecklist = readiness && readiness.completed_steps < readiness.total_steps;

  return (
    <div className="flex h-screen overflow-hidden">
      <Navbar />

      <main
        className="flex-1 flex flex-col min-w-0"
        style={{ marginLeft: "var(--sidebar-w)", background: "var(--canvas)" }}
      >
        {/* Header + KPIs */}
        <div
          className="flex-shrink-0"
          style={{ background: "var(--surface)", borderBottom: "1px solid var(--forge-100)" }}
        >
          <div className="px-6 pt-5">
            <h1
              className="text-[20px] font-display leading-tight"
              style={{ fontWeight: 800, color: "var(--forge-900)" }}
            >
              Tableau de bord
            </h1>
            <p className="text-[13px] mt-0.5 mb-4" style={{ color: "var(--forge-400)" }}>
              Vue d'ensemble de vos prospects
            </p>
          </div>

          {/* Readiness checklist */}
          {showChecklist && (
            <div
              className="mx-6 mb-4 rounded-xl overflow-hidden"
              style={{ border: "1px solid #fed7aa", background: "#fff7ed" }}
            >
              <div className="px-4 py-3 flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2.5 flex-shrink-0">
                  <span className="text-lg">🚀</span>
                  <div>
                    <p
                      className="text-[12px] font-display"
                      style={{ fontWeight: 700, color: "#9a3412" }}
                    >
                      Mise en route — {readiness.completed_steps}/{readiness.total_steps}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <div
                        className="h-1.5 rounded-full overflow-hidden"
                        style={{ width: "100px", background: "#fed7aa" }}
                      >
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${(readiness.completed_steps / readiness.total_steps) * 100}%`,
                            background: "#ea580c",
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {READINESS_STEPS.map(({ key, label, href }) => {
                    const done = readiness[key as keyof typeof readiness] as boolean;
                    if (done) return null;
                    return href ? (
                      <Link
                        key={key}
                        href={href}
                        className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-lg transition-colors"
                        style={{ background: "#ffedd5", color: "#c2410c", border: "1px solid #fed7aa" }}
                      >
                        <Circle className="w-2.5 h-2.5" />
                        {label}
                        <ChevronRight className="w-2.5 h-2.5" />
                      </Link>
                    ) : (
                      <span
                        key={key}
                        className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-lg"
                        style={{ background: "#ffedd5", color: "#c2410c", border: "1px solid #fed7aa" }}
                      >
                        <Circle className="w-2.5 h-2.5" />
                        {label}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* KPI cards */}
          <div className="grid grid-cols-4 gap-3 px-6 pb-5">
            {KPI_CONFIG.map(({ key, label, accent, bg, emoji }) => {
              const value = kpiValues[key] ?? 0;
              return (
                <div
                  key={key}
                  className="rounded-xl p-4 relative overflow-hidden"
                  style={{ background: "var(--surface)", border: "1px solid var(--forge-100)" }}
                >
                  <div
                    className="absolute top-0 left-0 right-0 h-[3px] rounded-t-xl"
                    style={{ background: accent }}
                  />
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-sm mb-3"
                    style={{ background: bg }}
                  >
                    {emoji}
                  </div>
                  <p
                    className="text-[28px] leading-none mb-1 font-display"
                    style={{ fontWeight: 800, color: showKPIs ? accent : "var(--forge-200)" }}
                  >
                    {showKPIs ? value : "—"}
                  </p>
                  <p className="text-[12px] font-medium" style={{ color: "var(--forge-500)" }}>
                    {label}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Filters + Search */}
        <div
          className="flex-shrink-0 px-6 py-3 flex items-center gap-3"
          style={{ background: "var(--surface)", borderBottom: "1px solid var(--forge-100)" }}
        >
          <div className="relative flex-1 max-w-xs">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5"
              style={{ color: "var(--forge-400)" }}
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher…"
              className="forge-input pl-9"
              style={{ background: "var(--canvas)" }}
              onFocus={(e) => {
                (e.currentTarget as HTMLElement).style.background = "var(--surface)";
                (e.currentTarget as HTMLElement).style.borderColor = "var(--forge-400)";
              }}
              onBlur={(e) => {
                (e.currentTarget as HTMLElement).style.background = "var(--canvas)";
                (e.currentTarget as HTMLElement).style.borderColor = "var(--forge-100)";
              }}
            />
          </div>

          <div className="flex gap-1.5">
            {STATUS_FILTERS.map(({ label, value }) => {
              const active = statusFilter === value;
              return (
                <button
                  key={value}
                  onClick={() => setStatusFilter(value)}
                  className="px-3 py-1.5 text-[12px] rounded-lg transition-all"
                  style={{
                    background: active ? "var(--forge-900)" : "transparent",
                    color: active ? "#ffffff" : "var(--forge-600)",
                    fontWeight: active ? 600 : 500,
                    border: active ? "1px solid var(--forge-900)" : "1px solid var(--forge-100)",
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* List */}
        <div
          className="flex-1 overflow-y-auto"
          style={{ background: "var(--surface)" }}
        >
          {(artisanLoading || isLoading) && (
            <div className="flex items-center justify-center py-24">
              <div
                className="w-5 h-5 rounded-full border-2"
                style={{ borderColor: "var(--forge-100)", borderTopColor: "#ea580c", animation: "spin 0.7s linear infinite" }}
              />
            </div>
          )}
          {error && (
            <div className="p-8 text-center text-[13px]" style={{ color: "#dc2626" }}>
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
