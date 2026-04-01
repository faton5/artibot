"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import { Navbar } from "@/components/Navbar";
import { useCurrentArtisan } from "@/hooks/useCurrentArtisan";
import { artisanApi } from "@/lib/api";
import { CheckCircle, XCircle, ExternalLink, Save } from "lucide-react";
import type { ArtisanConfig } from "@/types";

export default function SettingsPage() {
  const { artisanId, isLoading: artisanLoading } = useCurrentArtisan();

  const { data: artisan, isLoading, mutate } = useSWR(
    artisanId ? ["artisan", artisanId] : null,
    () => artisanApi.get(artisanId as string),
    { revalidateOnFocus: false }
  );

  const [config, setConfig] = useState<ArtisanConfig>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Initialise le formulaire quand les données arrivent
  useEffect(() => {
    if (artisan?.config_json && Object.keys(config).length === 0) {
      setConfig(artisan.config_json);
    }
  }, [artisan]);

  const handleSave = async () => {
    if (!artisanId) return;
    setSaving(true);
    try {
      await artisanApi.update(artisanId, { config_json: config });
      await mutate();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  };

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

  const update = (key: keyof ArtisanConfig, value: string | number) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Navbar />
      <main className="ml-60 flex-1 overflow-y-auto p-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Paramètres</h1>
            <p className="text-gray-500 text-sm">Configuration de votre assistant ArtiBot</p>
          </div>

          {artisanLoading || isLoading ? (
            <div className="flex justify-center py-10">
              <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Section Gmail */}
              <section className="bg-white border border-gray-200 rounded-xl p-5">
                <h2 className="font-semibold text-gray-900 mb-4">Connexion Gmail</h2>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {artisan?.gmail_connected ? (
                      <>
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Gmail connecté</p>
                          <p className="text-xs text-gray-500">{artisan.email}</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-5 h-5 text-gray-300" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Gmail non connecté</p>
                          <p className="text-xs text-gray-500">Connectez Gmail pour recevoir et répondre aux emails automatiquement</p>
                        </div>
                      </>
                    )}
                  </div>
                  {artisan?.gmail_connected ? (
                    <button
                      onClick={handleDisconnectGmail}
                      className="px-3 py-1.5 text-xs text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      Déconnecter
                    </button>
                  ) : (
                    <button
                      onClick={handleConnectGmail}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Connecter Gmail
                    </button>
                  )}
                </div>
              </section>

              {/* Section Twilio */}
              <section className="bg-white border border-gray-200 rounded-xl p-5">
                <h2 className="font-semibold text-gray-900 mb-4">Numéro SMS (Twilio)</h2>
                <div className="flex items-center gap-3">
                  {artisan?.twilio_number ? (
                    <>
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Numéro attribué</p>
                        <p className="text-xs text-gray-500 font-mono">{artisan.twilio_number}</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-5 h-5 text-gray-300" />
                      <p className="text-sm text-gray-500">Aucun numéro SMS configuré</p>
                    </>
                  )}
                </div>
              </section>

              {/* Section Config bot */}
              <section className="bg-white border border-gray-200 rounded-xl p-5">
                <h2 className="font-semibold text-gray-900 mb-4">Configuration du bot</h2>
                <div className="space-y-4">
                  <Field label="Métier" placeholder="Ex: peintre en bâtiment">
                    <input
                      type="text"
                      value={config.metier ?? ""}
                      onChange={(e) => update("metier", e.target.value)}
                      placeholder="peintre en bâtiment"
                      className="field-input"
                    />
                  </Field>

                  <Field label="Ville" placeholder="Ex: Rennes">
                    <input
                      type="text"
                      value={config.ville ?? ""}
                      onChange={(e) => update("ville", e.target.value)}
                      placeholder="Rennes"
                      className="field-input"
                    />
                  </Field>

                  <Field label="Zone d'intervention">
                    <input
                      type="text"
                      value={config.zone ?? ""}
                      onChange={(e) => update("zone", e.target.value)}
                      placeholder="Rennes et 30km alentour"
                      className="field-input"
                    />
                  </Field>

                  <Field label="Délais habituels">
                    <input
                      type="text"
                      value={config.delais ?? ""}
                      onChange={(e) => update("delais", e.target.value)}
                      placeholder="3 à 5 semaines selon disponibilité"
                      className="field-input"
                    />
                  </Field>

                  <Field label="Ton du bot">
                    <select
                      value={config.ton ?? "professionnel et chaleureux"}
                      onChange={(e) => update("ton", e.target.value)}
                      className="field-input"
                    >
                      <option value="professionnel et chaleureux">Professionnel et chaleureux</option>
                      <option value="professionnel">Professionnel</option>
                      <option value="chaleureux et décontracté">Chaleureux et décontracté</option>
                      <option value="neutre">Neutre</option>
                    </select>
                  </Field>

                  <Field label="Message d'accueil">
                    <textarea
                      value={config.message_accueil ?? ""}
                      onChange={(e) => update("message_accueil", e.target.value)}
                      placeholder="Bonjour ! Je suis l'assistant de Jean-Pierre..."
                      className="field-input min-h-[80px] resize-none"
                    />
                  </Field>

                  <Field label="Seuil de qualification (nb messages)">
                    <input
                      type="number"
                      min={3}
                      max={15}
                      value={config.message_threshold ?? 6}
                      onChange={(e) => update("message_threshold", parseInt(e.target.value))}
                      className="field-input w-24"
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      Nombre de messages échangés avant envoi automatique du rapport (5 à 10 recommandé)
                    </p>
                  </Field>
                </div>

                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="mt-5 flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {saving ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : saved ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {saved ? "Enregistré !" : saving ? "Enregistrement..." : "Enregistrer"}
                </button>
              </section>
            </div>
          )}
        </div>
      </main>

      <style jsx global>{`
        .field-input {
          width: 100%;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 8px 12px;
          font-size: 14px;
          outline: none;
          transition: box-shadow 0.15s;
        }
        .field-input:focus {
          box-shadow: 0 0 0 2px #3b82f6;
        }
      `}</style>
    </div>
  );
}

function Field({ label, children, placeholder }: { label: string; children: React.ReactNode; placeholder?: string }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1.5">{label}</label>
      {children}
    </div>
  );
}
