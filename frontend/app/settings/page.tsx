"use client";

import { useState, useEffect, type ReactNode } from "react";
import useSWR from "swr";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { useCurrentArtisan } from "@/hooks/useCurrentArtisan";
import { artisanApi } from "@/lib/api";
import { CheckCircle, Save, User, Settings2, Plug } from "lucide-react";
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

  const update = (key: keyof ArtisanConfig, value: string | number) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Navbar />
      <main
        className="flex-1 overflow-y-auto"
        style={{ marginLeft: "var(--sidebar-w)", background: "var(--canvas)" }}
      >
        <div
          className="px-8 py-6"
          style={{ background: "var(--surface)", borderBottom: "1px solid var(--forge-100)" }}
        >
          <h1 className="text-[20px] font-display" style={{ fontWeight: 800, color: "var(--forge-900)" }}>
            Paramètres
          </h1>
          <p className="text-[13px] mt-0.5" style={{ color: "var(--forge-400)" }}>
            Profil et configuration de votre assistant
          </p>
        </div>

        <div className="px-8 py-7 max-w-3xl mx-auto space-y-5">
          {artisanLoading || isLoading ? (
            <div className="space-y-4">
              {[1,2,3].map((i) => (
                <div key={i} className="h-32 rounded-2xl animate-pulse" style={{ background: "var(--forge-100)" }} />
              ))}
            </div>
          ) : (
            <>
              <Link
                href="/integrations"
                className="flex items-center justify-between p-4 rounded-xl transition-colors"
                style={{ background: "#fff7ed", border: "1px solid #fed7aa" }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "#ffedd5")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "#fff7ed")}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#ffedd5" }}>
                    <Plug className="w-4 h-4" style={{ color: "#ea580c" }} />
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold" style={{ color: "#9a3412" }}>Canaux de communication</p>
                    <p className="text-[11px]" style={{ color: "#c2410c" }}>Gmail, SMS, WhatsApp — gérer dans Intégrations</p>
                  </div>
                </div>
                <span className="text-[12px] font-medium" style={{ color: "#ea580c" }}>Ouvrir →</span>
              </Link>

              <Section icon={<User className="w-4 h-4" />} title="Compte" description="Informations du profil">
                <Field label="Nom" htmlFor="name">
                  <input id="name" value={artisan?.name ?? ""} disabled className="forge-input opacity-60" />
                </Field>
                <Field label="Email" htmlFor="email" className="mt-4">
                  <input id="email" value={artisan?.email ?? ""} disabled className="forge-input opacity-60" />
                  <p className="text-[11px] mt-1" style={{ color: "var(--forge-400)" }}>Modifiable via votre profil Clerk.</p>
                </Field>
              </Section>

              <Section icon={<Settings2 className="w-4 h-4" />} title="Configuration du bot" description="Contexte métier et règles de qualification">
                <Field label="Métier" htmlFor="metier">
                  <input id="metier" value={config.metier ?? ""} onChange={(e) => update("metier", e.target.value)} placeholder="peintre en bâtiment" className="forge-input" />
                </Field>
                <div className="grid gap-4 md:grid-cols-2 mt-4">
                  <Field label="Ville" htmlFor="ville">
                    <input id="ville" value={config.ville ?? ""} onChange={(e) => update("ville", e.target.value)} placeholder="Rennes" className="forge-input" />
                  </Field>
                  <Field label="Zone" htmlFor="zone">
                    <input id="zone" value={config.zone ?? ""} onChange={(e) => update("zone", e.target.value)} placeholder="Rennes et 30km" className="forge-input" />
                  </Field>
                </div>
                <Field label="Délais" htmlFor="delais" className="mt-4">
                  <input id="delais" value={config.delais ?? ""} onChange={(e) => update("delais", e.target.value)} placeholder="3 à 5 semaines" className="forge-input" />
                </Field>
                <Field label="Ton du bot" htmlFor="ton" className="mt-4">
                  <select id="ton" value={config.ton ?? "professionnel et chaleureux"} onChange={(e) => update("ton", e.target.value)} className="forge-input cursor-pointer">
                    <option value="professionnel et chaleureux">Professionnel et chaleureux</option>
                    <option value="professionnel">Professionnel</option>
                    <option value="chaleureux et décontracté">Chaleureux et décontracté</option>
                    <option value="neutre">Neutre</option>
                  </select>
                </Field>
                <Field label="Message d'accueil" htmlFor="accueil" className="mt-4">
                  <textarea id="accueil" value={config.message_accueil ?? ""} onChange={(e) => update("message_accueil", e.target.value)} placeholder="Bonjour ! Je suis l'assistant de…" className="forge-input resize-none" style={{ height: "88px", paddingTop: "10px" }} />
                </Field>
                <Field label="Seuil de qualification (messages)" htmlFor="threshold" className="mt-4">
                  <div className="flex items-center gap-3">
                    <input id="threshold" type="number" min={3} max={15} value={config.message_threshold ?? 6} onChange={(e) => update("message_threshold", parseInt(e.target.value, 10))} className="forge-input w-24" />
                    <p className="text-[12px]" style={{ color: "var(--forge-400)" }}>messages avant envoi du rapport</p>
                  </div>
                </Field>
                <div className="mt-6 pt-5" style={{ borderTop: "1px solid var(--forge-100)" }}>
                  <button onClick={handleSave} disabled={saving} className="btn-primary" style={saved ? { background: "#16a34a", borderColor: "#16a34a" } : {}}>
                    {saving ? <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent" style={{ animation: "spin 0.7s linear infinite" }} /> : saved ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                    {saved ? "Enregistré !" : saving ? "Enregistrement…" : "Enregistrer"}
                  </button>
                </div>
              </Section>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

function Section({ icon, title, description, children }: { icon: ReactNode; title: string; description: string; children: ReactNode }) {
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: "var(--surface)", border: "1px solid var(--forge-100)" }}>
      <div className="flex items-center gap-3 px-6 py-4" style={{ borderBottom: "1px solid var(--forge-100)" }}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "var(--forge-50)" }}>
          <span style={{ color: "var(--forge-700)" }}>{icon}</span>
        </div>
        <div>
          <h2 className="text-[14px] font-display" style={{ fontWeight: 700, color: "var(--forge-900)" }}>{title}</h2>
          <p className="text-[12px]" style={{ color: "var(--forge-400)" }}>{description}</p>
        </div>
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  );
}

function Field({ label, htmlFor, children, className = "" }: { label: string; htmlFor: string; children: ReactNode; className?: string }) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <label htmlFor={htmlFor} className="block text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--forge-500)" }}>{label}</label>
      {children}
    </div>
  );
}
