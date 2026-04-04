"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import useSWR from "swr";
import { Navbar } from "@/components/Navbar";
import { useCurrentArtisan } from "@/hooks/useCurrentArtisan";
import { artisanApi } from "@/lib/api";

type IntegrationStatus = "connected" | "disconnected" | "pending" | "soon";

const STATUS_CONFIG: Record<IntegrationStatus, { label: string; bg: string; color: string }> = {
  connected:    { label: "Connecté",          bg: "#c7e7ff", color: "#004360" },
  disconnected: { label: "Non connecté",       bg: "#ffdad6", color: "#93000a" },
  pending:      { label: "En attente",         bg: "#ffdcc3", color: "#623200" },
  soon:         { label: "Bientôt disponible", bg: "#e7e8e9", color: "#564334" },
};

const GMAIL_ERROR_MSG: Record<string, string> = {
  config:  "Configuration Google OAuth incomplète sur le serveur. Contactez le support.",
  oauth:   "Échec de l'autorisation Google. Vérifiez les credentials dans la Google Console.",
  encrypt: "Erreur de chiffrement du token. Vérifiez la variable FERNET_KEY.",
};

export default function IntegrationsPage() {
  const { artisanId } = useCurrentArtisan();
  const searchParams = useSearchParams();
  const [gmailError, setGmailError] = useState<string | null>(null);

  useEffect(() => {
    const error = searchParams.get("gmail");
    const reason = searchParams.get("reason");
    if (error === "error" && reason) {
      setGmailError(GMAIL_ERROR_MSG[reason] ?? "Erreur inconnue lors de la connexion Gmail.");
    }
  }, [searchParams]);
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

  const gmailStatus: IntegrationStatus = artisan?.gmail_connected ? "connected" : "disconnected";
  const smsStatus: IntegrationStatus = artisan?.twilio_number ? "connected" : "pending";

  return (
    <div className="flex min-h-screen" style={{ background: "#f8f9fa" }}>
      <Navbar />

      <main className="flex-1" style={{ marginLeft: "var(--sidebar-w)" }}>
        {/* Top bar */}
        <header className="flex justify-between items-center h-16 px-8 sticky top-0 z-40"
          style={{ background: "rgba(248,249,250,0.85)", backdropFilter: "blur(12px)", borderBottom: "1px solid #e7e8e9" }}>
          <div className="flex-1" />
          <div className="flex items-center gap-4">
            <button className="relative text-slate-500 hover:text-orange-600 transition-colors">
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-0 right-0 w-2 h-2 rounded-full" style={{ background: "#904d00" }} />
            </button>
          </div>
        </header>

        <div className="p-8 max-w-3xl mx-auto">
          {/* Page header */}
          <div className="mb-8">
            <h1 className="text-2xl font-extrabold font-headline tracking-tight" style={{ color: "#191c1d" }}>Intégrations</h1>
            <p className="text-sm mt-1" style={{ color: "#564334" }}>Canaux de communication connectés à votre assistant</p>
          </div>

          {/* Erreur Gmail OAuth */}
          {gmailError && (
            <div className="p-4 rounded-2xl mb-4 flex items-start gap-3" style={{ background: "#ffdad6" }}>
              <span className="material-symbols-outlined flex-shrink-0 mt-0.5" style={{ color: "#93000a" }}>error</span>
              <div>
                <p className="text-sm font-bold mb-0.5" style={{ color: "#93000a" }}>Connexion Gmail échouée</p>
                <p className="text-xs" style={{ color: "#93000a" }}>{gmailError}</p>
              </div>
              <button className="ml-auto" onClick={() => setGmailError(null)}>
                <span className="material-symbols-outlined text-sm" style={{ color: "#93000a" }}>close</span>
              </button>
            </div>
          )}

          {/* Info banner */}
          <div className="p-4 rounded-2xl mb-6 flex items-center gap-3" style={{ background: "#c7e7ff" }}>
            <span className="material-symbols-outlined flex-shrink-0" style={{ color: "#004360" }}>info</span>
            <p className="text-sm" style={{ color: "#004360" }}>
              Gérez tout depuis une interface unique. Réponses IA instantanées, notifications centralisées, historique complet des clients.
            </p>
          </div>

          {/* Integrations */}
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 rounded-2xl animate-pulse" style={{ background: "#e7e8e9" }} />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Gmail */}
              <IntegrationCard
                icon="mail"
                iconBg={artisan?.gmail_connected ? "#c7e7ff" : "#e7e8e9"}
                iconColor={artisan?.gmail_connected ? "#004360" : "#564334"}
                name="Gmail"
                description={
                  artisan?.gmail_connected
                    ? `Connecté via ${artisan.email}`
                    : "Connectez votre boîte Gmail pour que le bot réponde automatiquement aux emails de vos prospects."
                }
                status={gmailStatus}
                action={
                  artisan?.gmail_connected ? (
                    <button onClick={handleDisconnectGmail}
                      className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
                      style={{ background: "#ffdad6", color: "#93000a", border: "1px solid #ff8c00" }}
                      onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.opacity = "0.8")}
                      onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.opacity = "1")}>
                      Déconnecter
                    </button>
                  ) : (
                    <button onClick={handleConnectGmail}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all"
                      style={{ background: "#904d00", boxShadow: "0 2px 8px rgba(144,77,0,0.2)" }}>
                      <span className="material-symbols-outlined text-base">open_in_new</span>
                      Connecter Gmail
                    </button>
                  )
                }
              />

              {/* SMS */}
              <IntegrationCard
                icon="sms"
                iconBg={artisan?.twilio_number ? "#c7e7ff" : "#e7e8e9"}
                iconColor={artisan?.twilio_number ? "#004360" : "#564334"}
                name="SMS via Twilio"
                description={
                  artisan?.twilio_number
                    ? `Numéro attribué : ${artisan.twilio_number}`
                    : "Un numéro SMS dédié vous sera attribué après le déploiement en production."
                }
                status={smsStatus}
                action={
                  artisan?.twilio_number ? (
                    <span className="text-sm font-mono px-3 py-2 rounded-xl" style={{ background: "#f3f4f5", color: "#191c1d" }}>
                      {artisan.twilio_number}
                    </span>
                  ) : (
                    <span className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium"
                      style={{ background: "#ffdcc3", color: "#623200" }}>
                      <span className="material-symbols-outlined text-base">schedule</span>
                      Disponible après déploiement
                    </span>
                  )
                }
              />

              {/* WhatsApp */}
              <IntegrationCard
                icon="chat"
                iconBg="#e7e8e9"
                iconColor="#564334"
                name="WhatsApp Business"
                description="L'intégration WhatsApp Business sera disponible dans une prochaine version d'ArtiBot."
                status="soon"
                action={
                  <span className="px-4 py-2 rounded-xl text-sm font-medium" style={{ background: "#e7e8e9", color: "#564334" }}>
                    À venir
                  </span>
                }
              />
            </div>
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
  action,
}: {
  icon: string;
  iconBg: string;
  iconColor: string;
  name: string;
  description: string;
  status: IntegrationStatus;
  action: React.ReactNode;
}) {
  const sc = STATUS_CONFIG[status];

  return (
    <div className="rounded-2xl p-5 shadow-sm" style={{ background: "#ffffff" }}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: iconBg }}>
            <span className="material-symbols-outlined" style={{ color: iconColor, fontVariationSettings: "'FILL' 1" }}>{icon}</span>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <p className="text-base font-bold font-headline" style={{ color: "#191c1d" }}>{name}</p>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-sm text-xs font-semibold"
                style={{ background: sc.bg, color: sc.color }}>
                {status === "connected" && (
                  <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                )}
                {sc.label}
              </span>
            </div>
            <p className="text-sm" style={{ color: "#564334" }}>{description}</p>
          </div>
        </div>
        <div className="flex-shrink-0">{action}</div>
      </div>
    </div>
  );
}
