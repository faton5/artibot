"use client";

import useSWR from "swr";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { useCurrentArtisan } from "@/hooks/useCurrentArtisan";
import { prospectApi, conversationApi } from "@/lib/api";
import type { ProspectWithConversation } from "@/types";

interface Props {
  params: { id: string };
}

const SCORE_CONFIG = {
  hot:  { label: "Chaud",  icon: "local_fire_department", bg: "#ffdad6", color: "#93000a" },
  warm: { label: "Tiède",  icon: "thermostat",            bg: "#ffdcc3", color: "#623200" },
  cold: { label: "Froid",  icon: "ac_unit",               bg: "#e7e8e9", color: "#564334" },
} as const;

const CHANNEL_ICON: Record<string, string> = {
  email:    "mail",
  sms:      "sms",
  whatsapp: "chat",
};

const STATUS_LABEL: Record<string, string> = {
  active:    "Actif",
  qualified: "Qualifié",
  escalated: "Urgent",
  closed:    "Clos",
};

export default function ProspectDetailPage({ params }: Props) {
  const { artisanId } = useCurrentArtisan();

  const { data: prospects = [], isLoading: loadingProspects } = useSWR(
    artisanId ? ["prospects", artisanId] : null,
    () => prospectApi.list(artisanId as string),
    { revalidateOnFocus: false }
  );

  const { data: conversations = [] } = useSWR(
    artisanId ? ["conversations", artisanId] : null,
    () => conversationApi.list(artisanId as string),
    { revalidateOnFocus: false }
  );

  const prospect = prospects.find((p: ProspectWithConversation) => p.id === params.id);
  const prospectConversations = conversations.filter(
    (c) => c.prospect?.id === params.id
  );

  if (loadingProspects) {
    return (
      <div className="flex min-h-screen" style={{ background: "#f8f9fa" }}>
        <Navbar />
        <main className="flex-1 flex items-center justify-center" style={{ marginLeft: "var(--sidebar-w)" }}>
          <div className="w-6 h-6 rounded-full border-2" style={{ borderColor: "#e7e8e9", borderTopColor: "#904d00", animation: "spin 0.7s linear infinite" }} />
        </main>
      </div>
    );
  }

  if (!prospect) {
    return (
      <div className="flex min-h-screen" style={{ background: "#f8f9fa" }}>
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center gap-3" style={{ marginLeft: "var(--sidebar-w)" }}>
          <span className="material-symbols-outlined text-5xl" style={{ color: "#ddc1ae" }}>person_off</span>
          <p className="font-semibold" style={{ color: "#191c1d" }}>Prospect introuvable</p>
          <Link href="/prospects" className="text-sm font-semibold" style={{ color: "#904d00" }}>← Retour aux prospects</Link>
        </main>
      </div>
    );
  }

  const sc = SCORE_CONFIG[prospect.score] ?? SCORE_CONFIG.cold;
  const name = prospect.name || "Inconnu";
  const initials = name.split(" ").map((w) => w[0]).join("").substring(0, 2).toUpperCase();

  return (
    <div className="flex min-h-screen" style={{ background: "#f8f9fa" }}>
      <Navbar />

      <main className="flex-1 min-w-0" style={{ marginLeft: "var(--sidebar-w)" }}>
        {/* Header */}
        <header className="flex items-center h-16 px-8 sticky top-0 z-40"
          style={{ background: "rgba(248,249,250,0.85)", backdropFilter: "blur(12px)", borderBottom: "1px solid #e7e8e9" }}>
          <Link href="/prospects"
            className="inline-flex items-center gap-1.5 text-sm font-medium transition-colors"
            style={{ color: "#564334" }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#904d00")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "#564334")}>
            <span className="material-symbols-outlined text-base">arrow_back</span>
            Retour aux Prospects
          </Link>
        </header>

        <div className="p-8 grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-6 max-w-6xl mx-auto">

          {/* LEFT — Prospect card */}
          <div className="flex flex-col gap-4">
            {/* Identity card */}
            <div className="rounded-3xl p-6 shadow-sm text-center" style={{ background: "#ffffff" }}>
              <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold"
                style={{ background: "linear-gradient(135deg, #ffdcc3 0%, #fdb881 100%)", color: "#623200" }}>
                {initials}
              </div>
              <h1 className="text-xl font-extrabold font-headline mb-1" style={{ color: "#191c1d" }}>{name}</h1>
              <p className="text-sm mb-4" style={{ color: "#564334" }}>Prospect qualifié par ArtiBot</p>

              {/* Score */}
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold mb-5"
                style={{ background: sc.bg, color: sc.color }}>
                <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>{sc.icon}</span>
                Lead {sc.label}
              </span>

              {/* Action buttons */}
              <div className="flex justify-center gap-3">
                {prospect.phone && (
                  <a href={`tel:${prospect.phone}`}
                    className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:scale-105"
                    style={{ background: "#f3f4f5" }}>
                    <span className="material-symbols-outlined text-base" style={{ color: "#564334" }}>call</span>
                  </a>
                )}
                {prospect.email && (
                  <a href={`mailto:${prospect.email}`}
                    className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:scale-105"
                    style={{ background: "#f3f4f5" }}>
                    <span className="material-symbols-outlined text-base" style={{ color: "#564334" }}>mail</span>
                  </a>
                )}
                {prospect.conversation?.channel === "whatsapp" && prospect.phone && (
                  <a href={`https://wa.me/${prospect.phone?.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 h-10 rounded-xl text-xs font-semibold text-white transition-all hover:scale-105"
                    style={{ background: "#25D366" }}>
                    <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>chat</span>
                    WhatsApp
                  </a>
                )}
              </div>
            </div>

            {/* Contact details */}
            <div className="rounded-3xl p-6 shadow-sm" style={{ background: "#ffffff" }}>
              <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "#897362" }}>Détails de contact</p>
              <div className="space-y-3">
                {[
                  { icon: "mail",        value: prospect.email,    label: "Email" },
                  { icon: "call",        value: prospect.phone,    label: "Téléphone" },
                  { icon: "location_on", value: prospect.location, label: "Localisation" },
                ].map(({ icon, value, label }) => value ? (
                  <div key={label} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "#f3f4f5" }}>
                      <span className="material-symbols-outlined text-sm" style={{ color: "#564334" }}>{icon}</span>
                    </div>
                    <span className="text-sm" style={{ color: "#191c1d" }}>{value}</span>
                  </div>
                ) : null)}
              </div>
            </div>

            {/* Project details */}
            {(prospect.project_type || prospect.surface || prospect.budget || prospect.delay) && (
              <div className="rounded-3xl p-6 shadow-sm" style={{ background: "#ffffff" }}>
                <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "#897362" }}>Contenu du projet</p>
                <div className="space-y-3">
                  {[
                    { icon: "construction", value: prospect.project_type, label: "Travaux" },
                    { icon: "square_foot",  value: prospect.surface,      label: "Surface" },
                    { icon: "payments",     value: prospect.budget,       label: "Budget" },
                    { icon: "schedule",     value: prospect.delay,        label: "Délai" },
                  ].map(({ icon, value, label }) => value ? (
                    <div key={label} className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: "#f3f4f5" }}>
                        <span className="material-symbols-outlined text-sm" style={{ color: "#564334" }}>{icon}</span>
                      </div>
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: "#897362" }}>{label}</p>
                        <p className="text-sm mt-0.5" style={{ color: "#191c1d" }}>{value}</p>
                      </div>
                    </div>
                  ) : null)}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT — Interaction history */}
          <div className="flex flex-col gap-4">
            <div className="rounded-3xl shadow-sm overflow-hidden" style={{ background: "#ffffff" }}>
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid #f3f4f5" }}>
                <h2 className="font-extrabold font-headline" style={{ color: "#191c1d" }}>Historique des interactions</h2>
                <span className="text-xs font-bold px-3 py-1 rounded-full" style={{ background: "rgba(144,77,0,0.1)", color: "#904d00" }}>
                  {prospectConversations.length} conversation{prospectConversations.length !== 1 ? "s" : ""}
                </span>
              </div>

              {/* Timeline */}
              {prospectConversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <span className="material-symbols-outlined text-4xl" style={{ color: "#ddc1ae" }}>forum</span>
                  <p className="text-sm" style={{ color: "#564334" }}>Aucune conversation encore.</p>
                </div>
              ) : (
                <div className="px-6 py-4 space-y-4">
                  {prospectConversations.map((conv) => {
                    const chIcon = CHANNEL_ICON[conv.channel] ?? "chat_bubble";
                    const statusLabel = STATUS_LABEL[conv.status] ?? conv.status;
                    return (
                      <Link key={conv.id} href={`/dashboard/${conv.id}`}
                        className="flex items-start gap-4 p-4 rounded-2xl transition-all cursor-pointer group"
                        style={{ background: "#f8f9fa" }}
                        onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "#f3f4f5")}
                        onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "#f8f9fa")}>
                        {/* Icon */}
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ background: "rgba(144,77,0,0.1)" }}>
                          <span className="material-symbols-outlined text-base" style={{ color: "#904d00", fontVariationSettings: "'FILL' 1" }}>{chIcon}</span>
                        </div>
                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <p className="text-sm font-bold" style={{ color: "#191c1d" }}>
                              Conversation {conv.channel}
                            </p>
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-sm flex-shrink-0"
                              style={{
                                background: conv.status === "qualified" ? "#fdb881" : conv.status === "escalated" ? "#ffdad6" : "#e7e8e9",
                                color: conv.status === "qualified" ? "#2f1500" : conv.status === "escalated" ? "#93000a" : "#564334",
                              }}>
                              {statusLabel}
                            </span>
                          </div>
                          <p className="text-xs mb-1" style={{ color: "#897362" }}>
                            {conv.created_at
                              ? new Date(conv.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
                              : "—"}
                          </p>
                          {conv.last_message && (
                            <p className="text-xs truncate" style={{ color: "#564334" }}>
                              {conv.last_message.content}
                            </p>
                          )}
                          <p className="text-xs mt-1 font-semibold group-hover:underline" style={{ color: "#904d00" }}>
                            Voir la conversation →
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}

              {/* GPT-4o badge */}
              <div className="flex items-center justify-end px-6 py-3" style={{ borderTop: "1px solid #f3f4f5" }}>
                <span className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: "#564334" }}>
                  <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: "#22c55e" }} />
                  GPT-4O ACTIF
                </span>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
