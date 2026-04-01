"use client";

import useSWR from "swr";
import { Navbar } from "@/components/Navbar";
import { useCurrentArtisan } from "@/hooks/useCurrentArtisan";
import { conversationApi } from "@/lib/api";
import { Mail, MessageSquare, MessageCircle } from "lucide-react";

export default function StatsPage() {
  const { artisanId, isLoading: artisanLoading } = useCurrentArtisan();
  const { data: conversations = [], isLoading } = useSWR(
    artisanId ? ["conversations-all", artisanId] : null,
    () => conversationApi.list(artisanId as string),
    { revalidateOnFocus: false }
  );

  const total      = conversations.length;
  const qualified  = conversations.filter((c) => c.status === "qualified").length;
  const hot        = conversations.filter((c) => c.prospect?.score === "hot").length;
  const active     = conversations.filter((c) => c.status === "active").length;
  const qualRate   = total > 0 ? Math.round((qualified / total) * 100) : 0;

  const byChannel = conversations.reduce<Record<string, number>>((acc, c) => {
    acc[c.channel] = (acc[c.channel] || 0) + 1;
    return acc;
  }, {});

  const loading = artisanLoading || isLoading;

  const STATS = [
    {
      value: total,
      label: "Total prospects",
      sub: "depuis le début",
      accent: "#6366f1",
      bg: "#eef2ff",
      emoji: "💬",
    },
    {
      value: qualified,
      label: "Qualifiés",
      sub: "rapport envoyé",
      accent: "#16a34a",
      bg: "#dcfce7",
      emoji: "✅",
    },
    {
      value: `${qualRate}%`,
      label: "Taux de qualification",
      sub: qualified > 0 ? `${qualified} sur ${total}` : "pas encore de données",
      accent: "#7c3aed",
      bg: "#ede9fe",
      emoji: "📈",
    },
    {
      value: hot,
      label: "Prospects chauds",
      sub: "prêts à convertir",
      accent: "#dc2626",
      bg: "#fee2e2",
      emoji: "🔥",
    },
  ];

  const CHANNEL_ICONS: Record<string, React.ElementType> = {
    email: Mail,
    sms: MessageSquare,
    whatsapp: MessageCircle,
  };
  const CHANNEL_COLORS: Record<string, string> = {
    email: "#3b82f6",
    sms: "#16a34a",
    whatsapp: "#059669",
  };

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
            Statistiques
          </h1>
          <p className="text-[13px] mt-0.5" style={{ color: "#8e8e98" }}>
            Performance de votre assistant ArtiBot
          </p>
        </div>

        <div className="p-8 max-w-4xl mx-auto">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-5 h-5 border-2 border-gray-200 border-t-indigo-500 rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {/* ── KPI grid ── */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {STATS.map(({ value, label, sub, accent, bg, emoji }, i) => (
                  <div
                    key={label}
                    className="rounded-2xl p-5 relative overflow-hidden animate-fade-up"
                    style={{
                      background: "#ffffff",
                      border: "1px solid #ebebf0",
                      boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
                      animationDelay: `${i * 60}ms`,
                      animationFillMode: "both",
                    }}
                  >
                    {/* Left accent bar */}
                    <div
                      className="absolute left-0 top-4 bottom-4 w-[3px] rounded-r-full"
                      style={{ background: accent }}
                    />

                    <div className="pl-3">
                      <div
                        className="inline-flex items-center justify-center w-9 h-9 rounded-xl text-lg mb-4"
                        style={{ background: bg }}
                      >
                        {emoji}
                      </div>

                      <p
                        className="leading-none mb-1"
                        style={{
                          fontFamily: "'Bricolage Grotesque', sans-serif",
                          fontWeight: 800,
                          fontSize: typeof value === "string" ? "32px" : "40px",
                          color: accent,
                        }}
                      >
                        {value}
                      </p>
                      <p className="text-[13px] font-semibold mb-0.5" style={{ color: "#111113" }}>
                        {label}
                      </p>
                      <p className="text-[11px]" style={{ color: "#8e8e98" }}>
                        {sub}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Canal breakdown */}
                <div
                  className="rounded-2xl p-6"
                  style={{ background: "#ffffff", border: "1px solid #ebebf0" }}
                >
                  <h2
                    className="text-[14px] mb-5"
                    style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700, color: "#111113" }}
                  >
                    Répartition par canal
                  </h2>
                  {Object.keys(byChannel).length === 0 ? (
                    <div className="py-8 text-center">
                      <p className="text-[13px]" style={{ color: "#8e8e98" }}>Aucune donnée</p>
                    </div>
                  ) : (
                    <div className="space-y-5">
                      {Object.entries(byChannel).map(([channel, count]) => {
                        const Icon = CHANNEL_ICONS[channel] ?? MessageSquare;
                        const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                        const color = CHANNEL_COLORS[channel] ?? "#6366f1";
                        return (
                          <div key={channel}>
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <Icon className="w-3.5 h-3.5" style={{ color }} />
                                <span className="text-[13px] font-medium capitalize" style={{ color: "#111113" }}>
                                  {channel}
                                </span>
                              </div>
                              <div className="flex items-baseline gap-1">
                                <span
                                  className="text-[18px]"
                                  style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, color }}
                                >
                                  {count}
                                </span>
                                <span className="text-[11px]" style={{ color: "#8e8e98" }}>
                                  ({pct}%)
                                </span>
                              </div>
                            </div>
                            <div className="h-2 rounded-full overflow-hidden" style={{ background: "#f0f0f5" }}>
                              <div
                                className="h-full rounded-full transition-all duration-700"
                                style={{ width: `${pct}%`, background: color }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Score distribution */}
                <div
                  className="rounded-2xl p-6"
                  style={{ background: "#ffffff", border: "1px solid #ebebf0" }}
                >
                  <h2
                    className="text-[14px] mb-5"
                    style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700, color: "#111113" }}
                  >
                    Maturité des prospects
                  </h2>
                  <div className="space-y-4">
                    {[
                      { score: "hot",  label: "Chauds",  emoji: "🔥", color: "#dc2626", bg: "#fee2e2" },
                      { score: "warm", label: "Tièdes",  emoji: "🌡", color: "#ea580c", bg: "#ffedd5" },
                      { score: "cold", label: "Froids",  emoji: "❄️", color: "#6b7280", bg: "#f3f4f6" },
                    ].map(({ score, label, emoji, color, bg }) => {
                      const count = conversations.filter((c) => c.prospect?.score === score).length;
                      const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                      return (
                        <div key={score} className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                            style={{ background: bg }}
                          >
                            {emoji}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-[13px] font-medium" style={{ color: "#111113" }}>
                                {label}
                              </span>
                              <span
                                className="text-[20px] leading-none"
                                style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, color }}
                              >
                                {count}
                              </span>
                            </div>
                            <div className="h-2 rounded-full overflow-hidden" style={{ background: "#f0f0f5" }}>
                              <div
                                className="h-full rounded-full transition-all duration-700"
                                style={{ width: `${pct}%`, background: color }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {total === 0 && (
                    <div className="py-8 text-center">
                      <p className="text-[13px]" style={{ color: "#8e8e98" }}>Aucune donnée</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
