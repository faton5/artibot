"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { useCurrentArtisan } from "@/hooks/useCurrentArtisan";
import { conversationApi, readinessApi } from "@/lib/api";
import type { ConversationStatus } from "@/types";

const STATUS_FILTERS: { label: string; value: ConversationStatus | "" }[] = [
  { label: "Tous", value: "" },
  { label: "Actifs", value: "active" },
  { label: "Qualifiés", value: "qualified" },
  { label: "Escaladés", value: "escalated" },
  { label: "Clos", value: "closed" },
];

const KPI_CONFIG = [
  { key: "total",     label: "Conversations ce mois",  icon: "chat_bubble",         iconBg: "rgba(144,77,0,0.1)",   iconColor: "#904d00" },
  { key: "active",    label: "Réponses attendues",      icon: "pending_actions",     iconBg: "rgba(0,101,143,0.1)",  iconColor: "#00658f" },
  { key: "qualified", label: "Prêts pour devis",        icon: "verified",            iconBg: "rgba(134,82,36,0.1)",  iconColor: "#865224" },
  { key: "hot",       label: "Haute priorité",          icon: "local_fire_department", isHighlight: true },
];

const STATUS_BADGE: Record<string, { label: string; bg: string; color: string }> = {
  active:    { label: "Actif",     bg: "#c7e7ff", color: "#004360" },
  qualified: { label: "Qualifié",  bg: "#fdb881", color: "#2f1500" },
  escalated: { label: "Urgent",    bg: "#ffdad6", color: "#93000a" },
  closed:    { label: "Clos",      bg: "#e7e8e9", color: "#564334" },
};

const CHANNEL_ICON: Record<string, string> = {
  email:    "mail",
  sms:      "sms",
  whatsapp: "chat",
};

const READINESS_STEPS = [
  { key: "gmail_connected",       label: "Gmail",             href: "/integrations" },
  { key: "knowledge_ready",       label: "Base connaissance", href: "/knowledge" },
  { key: "bot_config_ready",      label: "Config bot",        href: "/settings" },
  { key: "welcome_message_ready", label: "Message d'accueil", href: "/settings" },
  { key: "has_test_conversation", label: "Test conversation", href: null },
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
    <div className="flex min-h-screen" style={{ background: "#f8f9fa" }}>
      <Navbar />

      <main className="flex-1 flex flex-col min-w-0" style={{ marginLeft: "var(--sidebar-w)" }}>
        {/* Top App Bar */}
        <header className="flex justify-between items-center h-16 px-8 sticky top-0 z-40"
          style={{ background: "rgba(248,249,250,0.85)", backdropFilter: "blur(12px)", borderBottom: "1px solid #e7e8e9" }}>
          <div className="relative w-full max-w-md">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
            <input
              className="w-full py-2 pl-10 pr-4 text-sm rounded-full outline-none transition-all"
              style={{ background: "#f3f4f5", border: "none" }}
              placeholder="Rechercher une conversation..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-4 ml-6">
            <button className="relative text-slate-500 hover:text-orange-600 transition-colors">
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-0 right-0 w-2 h-2 rounded-full" style={{ background: "#904d00" }} />
            </button>
            <button className="text-slate-500 hover:text-orange-600 transition-colors">
              <span className="material-symbols-outlined">apps</span>
            </button>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto w-full">
          {/* Readiness checklist */}
          {showChecklist && (
            <div className="mb-8 rounded-xl p-4 flex items-center gap-4 flex-wrap" style={{ background: "#ffdcc3", border: "1px solid #ff8c00" }}>
              <span className="text-lg">🚀</span>
              <div>
                <p className="text-sm font-bold" style={{ color: "#623200" }}>
                  Mise en route — {readiness.completed_steps}/{readiness.total_steps}
                </p>
                <div className="h-1.5 rounded-full mt-1" style={{ width: "100px", background: "rgba(98,50,0,0.2)" }}>
                  <div className="h-full rounded-full" style={{ width: `${(readiness.completed_steps / readiness.total_steps) * 100}%`, background: "#904d00" }} />
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {READINESS_STEPS.map(({ key, label, href }) => {
                  const done = readiness[key as keyof typeof readiness] as boolean;
                  if (done) return null;
                  return href ? (
                    <Link key={key} href={href}
                      className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-lg"
                      style={{ background: "#ffffff", color: "#904d00", border: "1px solid #ff8c00" }}>
                      {label} →
                    </Link>
                  ) : (
                    <span key={key}
                      className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-lg"
                      style={{ background: "#ffffff", color: "#904d00", border: "1px solid #ff8c00" }}>
                      {label}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {KPI_CONFIG.map(({ key, label, icon, iconBg, iconColor, isHighlight }) => {
              const value = kpiValues[key] ?? 0;
              return (
                <div key={key} className={`p-6 rounded-xl transition-all hover:opacity-90 shadow-sm group`}
                  style={isHighlight
                    ? { background: "#904d00", boxShadow: "0 4px 16px rgba(144,77,0,0.2)" }
                    : { background: "#ffffff" }
                  }>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform"
                      style={{ background: isHighlight ? "rgba(255,255,255,0.2)" : iconBg }}>
                      <span className="material-symbols-outlined" style={{ color: isHighlight ? "#fff" : iconColor, fontVariationSettings: isHighlight ? "'FILL' 1" : "'FILL' 0" }}>
                        {icon}
                      </span>
                    </div>
                    <span className="text-[11px] font-bold tracking-widest uppercase"
                      style={{ color: isHighlight ? "rgba(255,255,255,0.8)" : "#564334" }}>
                      {isHighlight ? "Hot Leads" : "Total"}
                    </span>
                  </div>
                  <div className="font-headline text-3xl font-extrabold" style={{ color: isHighlight ? "#fff" : "#191c1d" }}>
                    {showKPIs ? value : "—"}
                  </div>
                  <div className="text-sm mt-1" style={{ color: isHighlight ? "rgba(255,255,255,0.7)" : "#564334" }}>{label}</div>
                </div>
              );
            })}
          </div>

          {/* Filter Tabs + List */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center p-1 rounded-full gap-1" style={{ background: "#f3f4f5" }}>
                {STATUS_FILTERS.map(({ label, value }) => {
                  const active = statusFilter === value;
                  return (
                    <button key={value} onClick={() => setStatusFilter(value)}
                      className="px-5 py-1.5 rounded-full text-sm font-medium transition-all"
                      style={active
                        ? { background: "#904d00", color: "#fff", boxShadow: "0 1px 4px rgba(144,77,0,0.2)" }
                        : { color: "#64748b" }
                      }>
                      {label}
                    </button>
                  );
                })}
              </div>
              <button className="flex items-center gap-2 text-sm font-medium transition-colors" style={{ color: "#564334" }}>
                <span className="material-symbols-outlined text-lg">tune</span>
                Filtres avancés
              </button>
            </div>

            {/* Conversation List */}
            <div className="rounded-2xl overflow-hidden" style={{ background: "#f3f4f5" }}>
              {(artisanLoading || isLoading) && (
                <div className="flex items-center justify-center py-16">
                  <div className="w-6 h-6 rounded-full border-2 border-primary" style={{ borderColor: "#e7e8e9", borderTopColor: "#904d00", animation: "spin 0.7s linear infinite" }} />
                </div>
              )}
              {error && (
                <div className="p-8 text-center text-sm" style={{ color: "#ba1a1a" }}>
                  Erreur de chargement des conversations
                </div>
              )}
              {!artisanLoading && !isLoading && !error && artisanId && (
                <>
                  {filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 gap-3">
                      <span className="material-symbols-outlined text-5xl" style={{ color: "#ddc1ae" }}>forum</span>
                      <p className="font-semibold" style={{ color: "#191c1d" }}>Aucune conversation</p>
                      <p className="text-sm" style={{ color: "#564334" }}>
                        {conversations.length === 0 ? "Vos conversations apparaîtront ici." : "Modifiez vos filtres."}
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 divide-y" style={{ borderColor: "rgba(148,163,184,0.2)" }}>
                      {filtered.map((c) => {
                        const badge = STATUS_BADGE[c.status] ?? STATUS_BADGE.active;
                        const channelIcon = CHANNEL_ICON[c.channel] ?? "chat_bubble";
                        const name = c.prospect?.name || "Inconnu";
                        const initials = name.split(" ").map((w: string) => w[0]).join("").substring(0, 2).toUpperCase();
                        const isUrgent = c.status === "escalated" || c.prospect?.score === "hot";
                        return (
                          <Link key={c.id} href={`/dashboard/${c.id}`}
                            className="flex items-center gap-4 p-5 transition-all cursor-pointer"
                            style={{ background: "#ffffff" }}
                            onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.background = "#f8f9fa"}
                            onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.background = "#ffffff"}
                          >
                            <div className="relative">
                              <div className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold" style={{ background: "#ffdcc3", color: "#623200" }}>
                                {initials}
                              </div>
                              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white flex items-center justify-center shadow-sm">
                                <span className="material-symbols-outlined text-xs" style={{ color: isUrgent ? "#904d00" : "#00658f" }}>{channelIcon}</span>
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <h3 className="font-headline font-bold text-slate-900 truncate">{name}</h3>
                                <span className="text-xs font-medium text-slate-400 flex-shrink-0 ml-2">
                                  {c.last_message?.sent_at
                                    ? new Date(c.last_message.sent_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
                                    : "—"}
                                </span>
                              </div>
                              <p className="text-sm text-slate-500 truncate leading-relaxed">
                                {c.last_message?.content || "Aucun message"}
                              </p>
                            </div>
                            <div className="flex flex-col items-end gap-2 flex-shrink-0">
                              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-sm uppercase tracking-wider" style={{ background: badge.bg, color: badge.color }}>
                                {badge.label}
                              </span>
                              <span className="material-symbols-outlined text-slate-300 text-lg">chevron_right</span>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                  {filtered.length > 0 && (
                    <div className="p-4 flex items-center justify-center" style={{ background: "#ffffff", borderTop: "1px solid rgba(148,163,184,0.2)" }}>
                      <button className="text-xs font-bold tracking-widest uppercase hover:underline" style={{ color: "#904d00" }}>
                        Charger plus de conversations
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
