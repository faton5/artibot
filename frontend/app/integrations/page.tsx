"use client";

import useSWR from "swr";
import { Navbar } from "@/components/Navbar";
import { useCurrentArtisan } from "@/hooks/useCurrentArtisan";
import { artisanApi } from "@/lib/api";
import { Mail, MessageSquare, MessageCircle, CheckCircle, ExternalLink, Clock } from "lucide-react";

export default function IntegrationsPage() {
  const { artisanId } = useCurrentArtisan();
  const { data: artisan, isLoading, mutate } = useSWR(
    artisanId ? ["artisan", artisanId] : null,
    () => artisanApi.get(artisanId as string),
    { revalidateOnFocus: false }
  );

  const handleConnectGmail = async () => {
    if (!artisanId) return;
    try {
      const { auth_url } = await artisanApi.connectGmail(artisanId);
      window.location.href = auth_url;
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleDisconnectGmail = async () => {
    if (!artisanId) return;
    if (!confirm("Déconnecter Gmail ? Le bot ne pourra plus répondre aux emails.")) return;
    try {
      await artisanApi.disconnectGmail(artisanId);
      await mutate();
    } catch (e: any) {
      alert(e.message);
    }
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
            Intégrations
          </h1>
          <p className="text-[13px] mt-0.5" style={{ color: "#8e8e98" }}>
            Canaux de communication connectés à votre assistant
          </p>
        </div>

        <div className="px-8 py-7 max-w-2xl mx-auto space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-24 rounded-2xl animate-pulse"
                  style={{ background: "#ebebf0" }}
                />
              ))}
            </div>
          ) : (
            <>
              {/* ── Gmail ── */}
              <IntegrationCard
                icon={<Mail className="w-5 h-5" />}
                iconBg={artisan?.gmail_connected ? "#dcfce7" : "#f5f5f8"}
                iconColor={artisan?.gmail_connected ? "#16a34a" : "#8e8e98"}
                name="Gmail"
                description={
                  artisan?.gmail_connected
                    ? `Connecté via ${artisan.email}`
                    : "Connectez votre boîte Gmail pour que le bot réponde automatiquement aux emails de vos prospects."
                }
                status={artisan?.gmail_connected ? "connected" : "disconnected"}
                statusLabel={artisan?.gmail_connected ? "Connecté" : "Non connecté"}
                action={
                  artisan?.gmail_connected ? (
                    <button
                      className="px-3 py-1.5 text-[12px] font-medium rounded-lg transition-all"
                      style={{
                        background: "transparent",
                        color: "#dc2626",
                        border: "1px solid #fecaca",
                      }}
                      onClick={handleDisconnectGmail}
                      onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "#fef2f2")}
                      onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}
                    >
                      Déconnecter
                    </button>
                  ) : (
                    <button
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium rounded-lg transition-all"
                      style={{
                        background: "#ea580c",
                        color: "#ffffff",
                        border: "1px solid #ea580c",
                      }}
                      onClick={handleConnectGmail}
                      onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "#c2410c")}
                      onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "#ea580c")}
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Connecter Gmail
                    </button>
                  )
                }
              />

              {/* ── SMS ── */}
              <IntegrationCard
                icon={<MessageSquare className="w-5 h-5" />}
                iconBg={artisan?.twilio_number ? "#dcfce7" : "#f5f5f8"}
                iconColor={artisan?.twilio_number ? "#16a34a" : "#8e8e98"}
                name="SMS"
                description={
                  artisan?.twilio_number
                    ? `Numéro attribué : ${artisan.twilio_number}`
                    : "Un numéro SMS dédié vous sera attribué après le déploiement en production."
                }
                status={artisan?.twilio_number ? "connected" : "pending"}
                statusLabel={artisan?.twilio_number ? "Actif" : "En attente"}
                action={
                  artisan?.twilio_number ? (
                    <span
                      className="text-[12px] font-mono px-3 py-1.5 rounded-lg"
                      style={{ background: "#f5f5f8", color: "#5a5a62" }}
                    >
                      {artisan.twilio_number}
                    </span>
                  ) : (
                    <span
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium rounded-lg"
                      style={{ background: "#fef3c7", color: "#92400e" }}
                    >
                      <Clock className="w-3.5 h-3.5" />
                      Disponible après déploiement
                    </span>
                  )
                }
              />

              {/* ── WhatsApp ── */}
              <IntegrationCard
                icon={<MessageCircle className="w-5 h-5" />}
                iconBg="#f5f5f8"
                iconColor="#8e8e98"
                name="WhatsApp"
                description="L'intégration WhatsApp Business sera disponible dans une prochaine version d'ArtiBot."
                status="soon"
                statusLabel="Bientôt disponible"
                action={
                  <span
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium rounded-lg"
                    style={{ background: "#f5f5f8", color: "#8e8e98", border: "1px solid #ebebf0" }}
                  >
                    À venir
                  </span>
                }
              />
            </>
          )}
        </div>
      </main>
    </div>
  );
}

function IntegrationCard({
  icon,
  iconBg,
  iconColor,
  name,
  description,
  status,
  statusLabel,
  action,
}: {
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  name: string;
  description: string;
  status: "connected" | "disconnected" | "pending" | "soon";
  statusLabel: string;
  action: React.ReactNode;
}) {
  const statusColors: Record<string, { color: string; bg: string }> = {
    connected:    { color: "#15803d", bg: "#dcfce7" },
    disconnected: { color: "#dc2626", bg: "#fee2e2" },
    pending:      { color: "#92400e", bg: "#fef3c7" },
    soon:         { color: "#6b7280", bg: "#f3f4f6" },
  };
  const sc = statusColors[status];

  return (
    <div
      className="rounded-2xl p-5"
      style={{ background: "#ffffff", border: "1px solid #ebebf0" }}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: iconBg }}
          >
            <span style={{ color: iconColor }}>{icon}</span>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <p
                className="text-[14px]"
                style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700, color: "#111113" }}
              >
                {name}
              </p>
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium"
                style={{ background: sc.bg, color: sc.color }}
              >
                {status === "connected" && <CheckCircle className="w-3 h-3" />}
                {statusLabel}
              </span>
            </div>
            <p className="text-[12px]" style={{ color: "#8e8e98" }}>
              {description}
            </p>
          </div>
        </div>
        <div className="flex-shrink-0">{action}</div>
      </div>
    </div>
  );
}
