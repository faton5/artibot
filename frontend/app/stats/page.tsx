"use client";

import useSWR from "swr";
import { Navbar } from "@/components/Navbar";
import { useCurrentArtisan } from "@/hooks/useCurrentArtisan";
import { conversationApi } from "@/lib/api";
import { Mail, MessageSquare, MessageCircle, TrendingUp } from "lucide-react";

// ── SVG ring gauge ────────────────────────────────────────────────────────────

function RingGauge({ pct, size = 140 }: { pct: number; size?: number }) {
  const R = size * 0.4;
  const cx = size / 2;
  const circumference = 2 * Math.PI * R;
  const filled = Math.min(pct / 100, 1) * circumference;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: "rotate(-90deg)" }}>
      {/* Track */}
      <circle
        cx={cx} cy={cx} r={R}
        fill="none"
        stroke="var(--forge-100)"
        strokeWidth={size * 0.075}
      />
      {/* Progress */}
      <circle
        cx={cx} cy={cx} r={R}
        fill="none"
        stroke="#ea580c"
        strokeWidth={size * 0.075}
        strokeLinecap="round"
        strokeDasharray={`${filled} ${circumference}`}
        style={{ transition: "stroke-dasharray 1.2s cubic-bezier(.4,0,.2,1)" }}
      />
    </svg>
  );
}

// ── Funnel step ───────────────────────────────────────────────────────────────

function FunnelStep({
  label, count, total, color, bg, emoji, delay = 0,
}: {
  label: string; count: number; total: number;
  color: string; bg: string; emoji: string; delay?: number;
}) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div
      className="flex flex-col items-center gap-2 animate-fade-up"
      style={{ animationDelay: `${delay}ms`, animationFillMode: "both" }}
    >
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl"
        style={{ background: bg }}
      >
        {emoji}
      </div>
      <p
        className="font-display leading-none"
        style={{ fontWeight: 800, fontSize: "32px", color }}
      >
        {count}
      </p>
      <p className="text-[12px] font-semibold text-center" style={{ color: "var(--forge-700)" }}>
        {label}
      </p>
      {total > 0 && (
        <span
          className="text-[11px] font-medium px-2 py-0.5 rounded-full"
          style={{ background: bg, color }}
        >
          {pct}%
        </span>
      )}
    </div>
  );
}

function FunnelArrow() {
  return (
    <div className="flex items-center justify-center pt-4">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M5 12h14M13 6l6 6-6 6" stroke="var(--forge-200)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function StatsPage() {
  const { artisanId, isLoading: artisanLoading } = useCurrentArtisan();
  const { data: conversations = [], isLoading } = useSWR(
    artisanId ? ["conversations-all", artisanId] : null,
    () => conversationApi.list(artisanId as string),
    { revalidateOnFocus: false }
  );

  const loading = artisanLoading || isLoading;

  const total      = conversations.length;
  const active     = conversations.filter((c) => c.status === "active").length;
  const escalated  = conversations.filter((c) => c.status === "escalated").length;
  const qualified  = conversations.filter((c) => c.status === "qualified").length;
  const closed     = conversations.filter((c) => c.status === "closed").length;
  const hot        = conversations.filter((c) => c.prospect?.score === "hot").length;
  const warm       = conversations.filter((c) => c.prospect?.score === "warm").length;
  const cold       = conversations.filter((c) => c.prospect?.score === "cold").length;
  const qualRate   = total > 0 ? Math.round((qualified / total) * 100) : 0;
  const hotRate    = qualified > 0 ? Math.round((hot / qualified) * 100) : 0;

  const byChannel = conversations.reduce<Record<string, number>>((acc, c) => {
    acc[c.channel] = (acc[c.channel] || 0) + 1;
    return acc;
  }, {});

  const CHANNEL_META: Record<string, { icon: React.ElementType; color: string; label: string }> = {
    email:    { icon: Mail,          color: "#3b82f6", label: "Email" },
    sms:      { icon: MessageSquare, color: "#16a34a", label: "SMS" },
    whatsapp: { icon: MessageCircle, color: "#059669", label: "WhatsApp" },
  };

  // Best channel
  const bestChannel = Object.entries(byChannel).sort((a, b) => b[1] - a[1])[0]?.[0];

  return (
    <div className="flex h-screen overflow-hidden">
      <Navbar />

      <main
        className="flex-1 overflow-y-auto"
        style={{ marginLeft: "var(--sidebar-w)", background: "var(--canvas)" }}
      >
        {/* ── Header ── */}
        <div
          className="px-8 py-6"
          style={{ background: "var(--surface)", borderBottom: "1px solid var(--forge-100)" }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h1
                className="text-[20px] font-display"
                style={{ fontWeight: 800, color: "var(--forge-900)" }}
              >
                Statistiques
              </h1>
              <p className="text-[13px] mt-0.5" style={{ color: "var(--forge-400)" }}>
                Performance de votre assistant ArtiBot
              </p>
            </div>
            {!loading && total > 0 && (
              <div
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-[12px] font-medium animate-fade-in"
                style={{ background: "#f0fdf4", color: "#15803d", border: "1px solid #bbf7d0" }}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                {total} contact{total > 1 ? "s" : ""} au total
              </div>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-24">
            <div
              className="w-5 h-5 rounded-full border-2"
              style={{ borderColor: "var(--forge-100)", borderTopColor: "#ea580c", animation: "spin 0.7s linear infinite" }}
            />
          </div>
        ) : total === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl"
              style={{ background: "var(--forge-50)" }}
            >
              📊
            </div>
            <p className="text-[15px] font-semibold font-display" style={{ color: "var(--forge-900)" }}>
              Pas encore de données
            </p>
            <p className="text-[13px]" style={{ color: "var(--forge-400)" }}>
              Les statistiques apparaîtront dès qu'un prospect contactera votre bot.
            </p>
          </div>
        ) : (
          <div className="px-8 py-7 max-w-5xl mx-auto space-y-5">

            {/* ── Hero : Taux de qualification + métriques secondaires ── */}
            <div
              className="rounded-2xl overflow-hidden animate-fade-up"
              style={{ background: "var(--surface)", border: "1px solid var(--forge-100)" }}
            >
              <div className="grid md:grid-cols-[auto_1fr]">

                {/* Left — Ring gauge */}
                <div
                  className="flex flex-col items-center justify-center px-10 py-8 gap-2"
                  style={{ borderRight: "1px solid var(--forge-100)" }}
                >
                  <p
                    className="text-[11px] font-semibold uppercase tracking-widest mb-3"
                    style={{ color: "var(--forge-400)" }}
                  >
                    Taux de qualification
                  </p>
                  <div className="relative flex items-center justify-center">
                    <RingGauge pct={qualRate} size={148} />
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span
                        className="font-display leading-none"
                        style={{ fontWeight: 800, fontSize: "36px", color: "#ea580c" }}
                      >
                        {qualRate}%
                      </span>
                      <span className="text-[11px]" style={{ color: "var(--forge-400)" }}>
                        qualifiés
                      </span>
                    </div>
                  </div>
                  <p className="text-[12px] text-center mt-2" style={{ color: "var(--forge-500)" }}>
                    {qualified} sur {total} prospect{total > 1 ? "s" : ""}
                  </p>
                </div>

                {/* Right — 4 secondary KPIs */}
                <div className="grid grid-cols-2 divide-x divide-y" style={{ borderColor: "var(--forge-100)" }}>
                  {[
                    { label: "Actifs en cours",    value: active,    color: "#0ea5e9", bg: "#e0f2fe", emoji: "⚡" },
                    { label: "Qualifiés",           value: qualified, color: "#16a34a", bg: "#dcfce7", emoji: "✅" },
                    { label: "Leads chauds",        value: hot,       color: "#dc2626", bg: "#fee2e2", emoji: "🔥" },
                    { label: "Taux leads chauds",   value: `${hotRate}%`, color: "#b45309", bg: "#fef3c7", emoji: "🎯" },
                  ].map(({ label, value, color, bg, emoji }, i) => (
                    <div
                      key={label}
                      className="flex items-center gap-4 px-6 py-5"
                      style={{ borderColor: "var(--forge-100)" }}
                    >
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                        style={{ background: bg }}
                      >
                        {emoji}
                      </div>
                      <div>
                        <p
                          className="font-display leading-none mb-1"
                          style={{ fontWeight: 800, fontSize: "28px", color }}
                        >
                          {value}
                        </p>
                        <p className="text-[12px]" style={{ color: "var(--forge-500)" }}>
                          {label}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Entonnoir de conversion ── */}
            <div
              className="rounded-2xl p-6 animate-fade-up"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--forge-100)",
                animationDelay: "80ms",
                animationFillMode: "both",
              }}
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2
                    className="text-[14px] font-display"
                    style={{ fontWeight: 700, color: "var(--forge-900)" }}
                  >
                    Entonnoir de conversion
                  </h2>
                  <p className="text-[12px]" style={{ color: "var(--forge-400)" }}>
                    Du premier contact au lead chaud
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 overflow-x-auto pb-2">
                <FunnelStep label="Contacts"   count={total}     total={total}    color="var(--forge-700)" bg="var(--forge-50)"  emoji="💬" delay={0}   />
                <FunnelArrow />
                <FunnelStep label="En cours"   count={active}    total={total}    color="#0369a1"         bg="#e0f2fe"          emoji="⚡" delay={80}  />
                <FunnelArrow />
                <FunnelStep label="Escaladés"  count={escalated} total={total}    color="#b45309"         bg="#fef3c7"          emoji="⚠️" delay={160} />
                <FunnelArrow />
                <FunnelStep label="Qualifiés"  count={qualified} total={total}    color="#15803d"         bg="#dcfce7"          emoji="✅" delay={240} />
                <FunnelArrow />
                <FunnelStep label="Chauds"     count={hot}       total={total}    color="#dc2626"         bg="#fee2e2"          emoji="🔥" delay={320} />
              </div>

              {/* Visual progress bar across stages */}
              <div className="mt-6 h-2 rounded-full overflow-hidden" style={{ background: "var(--forge-100)" }}>
                <div
                  className="h-full rounded-full transition-all duration-1000"
                  style={{
                    width: `${qualRate}%`,
                    background: "linear-gradient(90deg, #ea580c, #dc2626)",
                  }}
                />
              </div>
              <div className="flex justify-between mt-1.5">
                <span className="text-[10px]" style={{ color: "var(--forge-400)" }}>Contacts</span>
                <span className="text-[10px]" style={{ color: "var(--forge-400)" }}>Qualifiés ({qualRate}%)</span>
              </div>
            </div>

            {/* ── Canal + Score ── */}
            <div
              className="grid md:grid-cols-2 gap-5 animate-fade-up"
              style={{ animationDelay: "160ms", animationFillMode: "both" }}
            >
              {/* Canal breakdown */}
              <div
                className="rounded-2xl p-6"
                style={{ background: "var(--surface)", border: "1px solid var(--forge-100)" }}
              >
                <div className="flex items-center justify-between mb-5">
                  <h2
                    className="text-[14px] font-display"
                    style={{ fontWeight: 700, color: "var(--forge-900)" }}
                  >
                    Répartition par canal
                  </h2>
                  {bestChannel && (
                    <span
                      className="text-[11px] font-medium px-2 py-1 rounded-lg capitalize"
                      style={{
                        background: "var(--forge-50)",
                        color: "var(--forge-600)",
                      }}
                    >
                      {CHANNEL_META[bestChannel]?.label ?? bestChannel} dominant
                    </span>
                  )}
                </div>

                {Object.keys(byChannel).length === 0 ? (
                  <p className="text-[13px] text-center py-8" style={{ color: "var(--forge-400)" }}>
                    Aucune donnée
                  </p>
                ) : (
                  <div className="space-y-4">
                    {Object.entries(byChannel)
                      .sort((a, b) => b[1] - a[1])
                      .map(([channel, count]) => {
                        const meta = CHANNEL_META[channel];
                        const Icon = meta?.icon ?? MessageSquare;
                        const color = meta?.color ?? "#6366f1";
                        const label = meta?.label ?? channel;
                        const pct = total > 0 ? Math.round((count / total) * 100) : 0;

                        return (
                          <div key={channel}>
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2.5">
                                <div
                                  className="w-7 h-7 rounded-lg flex items-center justify-center"
                                  style={{ background: `${color}18` }}
                                >
                                  <Icon className="w-3.5 h-3.5" style={{ color }} />
                                </div>
                                <span
                                  className="text-[13px] font-medium"
                                  style={{ color: "var(--forge-900)" }}
                                >
                                  {label}
                                </span>
                              </div>
                              <div className="flex items-baseline gap-1.5">
                                <span
                                  className="font-display"
                                  style={{ fontWeight: 800, fontSize: "20px", color }}
                                >
                                  {count}
                                </span>
                                <span className="text-[11px]" style={{ color: "var(--forge-400)" }}>
                                  {pct}%
                                </span>
                              </div>
                            </div>
                            <div
                              className="h-2 rounded-full overflow-hidden"
                              style={{ background: "var(--forge-100)" }}
                            >
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
                style={{ background: "var(--surface)", border: "1px solid var(--forge-100)" }}
              >
                <div className="flex items-center justify-between mb-5">
                  <h2
                    className="text-[14px] font-display"
                    style={{ fontWeight: 700, color: "var(--forge-900)" }}
                  >
                    Maturité des prospects
                  </h2>
                  {hot > 0 && (
                    <span
                      className="text-[11px] font-medium px-2 py-1 rounded-lg"
                      style={{ background: "#fee2e2", color: "#dc2626" }}
                    >
                      {hot} à rappeler
                    </span>
                  )}
                </div>

                <div className="space-y-4">
                  {[
                    { score: "hot",  label: "Chauds — à rappeler maintenant", count: hot,  color: "#dc2626", bg: "#fee2e2", emoji: "🔥" },
                    { score: "warm", label: "Tièdes — à relancer",            count: warm, color: "#ea580c", bg: "#fff7ed", emoji: "🌡" },
                    { score: "cold", label: "Froids — pas encore qualifiés",  count: cold, color: "#6b7280", bg: "var(--forge-50)", emoji: "❄️" },
                  ].map(({ label, count: cnt, color, bg, emoji }) => {
                    const pct = total > 0 ? Math.round((cnt / total) * 100) : 0;
                    return (
                      <div key={label}>
                        <div className="flex items-center gap-3 mb-2">
                          <div
                            className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-base"
                            style={{ background: bg }}
                          >
                            {emoji}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span
                                className="text-[12px] font-medium truncate"
                                style={{ color: "var(--forge-700)" }}
                              >
                                {label}
                              </span>
                              <span
                                className="font-display ml-3 flex-shrink-0"
                                style={{ fontWeight: 800, fontSize: "20px", color }}
                              >
                                {cnt}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div
                          className="h-2 rounded-full overflow-hidden"
                          style={{ background: "var(--forge-100)" }}
                        >
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{ width: `${pct}%`, background: color }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Actionable summary */}
                {(hot > 0 || warm > 0) && (
                  <div
                    className="mt-5 p-3 rounded-xl"
                    style={{ background: "var(--canvas)" }}
                  >
                    <p className="text-[12px]" style={{ color: "var(--forge-600)" }}>
                      💡 <strong style={{ color: "var(--forge-900)" }}>{hot + warm} prospect{hot + warm > 1 ? "s" : ""}</strong> mérite{hot + warm > 1 ? "nt" : ""} votre attention — {hot} chaud{hot > 1 ? "s" : ""} et {warm} tiède{warm > 1 ? "s" : ""}.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* ── Résumé texte ── */}
            {qualified > 0 && (
              <div
                className="rounded-2xl p-5 flex items-start gap-4 animate-fade-up"
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--forge-100)",
                  animationDelay: "240ms",
                  animationFillMode: "both",
                }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                  style={{ background: "#fff7ed" }}
                >
                  🤖
                </div>
                <div>
                  <p
                    className="text-[14px] font-display mb-1"
                    style={{ fontWeight: 700, color: "var(--forge-900)" }}
                  >
                    Résumé de la performance
                  </p>
                  <p className="text-[13px] leading-relaxed" style={{ color: "var(--forge-600)" }}>
                    ArtiBot a traité <strong style={{ color: "var(--forge-900)" }}>{total} conversation{total > 1 ? "s" : ""}</strong> et qualifié{" "}
                    <strong style={{ color: "#16a34a" }}>{qualified}</strong> prospect{qualified > 1 ? "s" : ""} ({qualRate}% de taux de qualification).
                    {hot > 0 && (
                      <> <strong style={{ color: "#dc2626" }}>{hot}</strong> lead{hot > 1 ? "s" : ""} chaud{hot > 1 ? "s" : ""} sont prêts à être convertis.</>
                    )}
                    {bestChannel && (
                      <> Canal le plus actif : <strong style={{ color: "var(--forge-900)" }}>{CHANNEL_META[bestChannel]?.label ?? bestChannel}</strong>.</>
                    )}
                  </p>
                </div>
              </div>
            )}

          </div>
        )}
      </main>
    </div>
  );
}
