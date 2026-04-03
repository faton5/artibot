"use client";

import { useState, useEffect, type ReactNode } from "react";
import useSWR from "swr";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { useCurrentArtisan } from "@/hooks/useCurrentArtisan";
import { artisanApi } from "@/lib/api";
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

  const inputStyle = {
    width: "100%",
    padding: "10px 14px",
    borderRadius: "12px",
    border: "1.5px solid #e7e8e9",
    background: "#f3f4f5",
    color: "#191c1d",
    fontSize: "14px",
    fontFamily: "'Inter', sans-serif",
    outline: "none",
  };

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
            <h1 className="text-2xl font-extrabold font-headline tracking-tight" style={{ color: "#191c1d" }}>Paramètres</h1>
            <p className="text-sm mt-1" style={{ color: "#564334" }}>Profil et configuration de votre assistant</p>
          </div>

          {artisanLoading || isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 rounded-2xl animate-pulse" style={{ background: "#e7e8e9" }} />
              ))}
            </div>
          ) : (
            <div className="space-y-5">
              {/* Integration shortcut */}
              <Link href="/integrations"
                className="flex items-center justify-between p-4 rounded-2xl transition-all"
                style={{ background: "#ffdcc3", border: "1px solid #ff8c00" }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.opacity = "0.85")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.opacity = "1")}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "#ffdcc3" }}>
                    <span className="material-symbols-outlined" style={{ color: "#904d00", fontVariationSettings: "'FILL' 1" }}>extension</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold" style={{ color: "#623200" }}>Canaux de communication</p>
                    <p className="text-xs" style={{ color: "#865224" }}>Gmail, SMS, WhatsApp — gérer dans Intégrations</p>
                  </div>
                </div>
                <span className="text-sm font-bold" style={{ color: "#904d00" }}>Ouvrir →</span>
              </Link>

              {/* Account section */}
              <Section icon="person" title="Compte" description="Informations du profil">
                <Field label="Nom" htmlFor="name">
                  <input id="name" value={artisan?.name ?? ""} disabled style={{ ...inputStyle, opacity: 0.6 }} />
                </Field>
                <Field label="Email" htmlFor="email" className="mt-4">
                  <input id="email" value={artisan?.email ?? ""} disabled style={{ ...inputStyle, opacity: 0.6 }} />
                  <p className="text-xs mt-1" style={{ color: "#564334" }}>Modifiable via votre profil Clerk.</p>
                </Field>
              </Section>

              {/* Bot config section */}
              <Section icon="smart_toy" title="Configuration du bot" description="Contexte métier et règles de qualification">
                <Field label="Métier" htmlFor="metier">
                  <input id="metier" value={config.metier ?? ""} onChange={(e) => update("metier", e.target.value)}
                    placeholder="peintre en bâtiment" style={inputStyle} />
                </Field>
                <div className="grid gap-4 md:grid-cols-2 mt-4">
                  <Field label="Ville" htmlFor="ville">
                    <input id="ville" value={config.ville ?? ""} onChange={(e) => update("ville", e.target.value)}
                      placeholder="Rennes" style={inputStyle} />
                  </Field>
                  <Field label="Zone" htmlFor="zone">
                    <input id="zone" value={config.zone ?? ""} onChange={(e) => update("zone", e.target.value)}
                      placeholder="Rennes et 30km" style={inputStyle} />
                  </Field>
                </div>
                <Field label="Délais" htmlFor="delais" className="mt-4">
                  <input id="delais" value={config.delais ?? ""} onChange={(e) => update("delais", e.target.value)}
                    placeholder="3 à 5 semaines" style={inputStyle} />
                </Field>
                <Field label="Ton du bot" htmlFor="ton" className="mt-4">
                  <select id="ton" value={config.ton ?? "professionnel et chaleureux"} onChange={(e) => update("ton", e.target.value)}
                    style={{ ...inputStyle, cursor: "pointer" }}>
                    <option value="professionnel et chaleureux">Professionnel et chaleureux</option>
                    <option value="professionnel">Professionnel</option>
                    <option value="chaleureux et décontracté">Chaleureux et décontracté</option>
                    <option value="neutre">Neutre</option>
                  </select>
                </Field>
                <Field label="Message d'accueil" htmlFor="accueil" className="mt-4">
                  <textarea id="accueil" value={config.message_accueil ?? ""} onChange={(e) => update("message_accueil", e.target.value)}
                    placeholder="Bonjour ! Je suis l'assistant de…"
                    style={{ ...inputStyle, minHeight: "88px", resize: "none" }} />
                </Field>
                <Field label="Seuil de qualification (messages)" htmlFor="threshold" className="mt-4">
                  <div className="flex items-center gap-3">
                    <input id="threshold" type="number" min={3} max={15} value={config.message_threshold ?? 6}
                      onChange={(e) => update("message_threshold", parseInt(e.target.value, 10))}
                      style={{ ...inputStyle, width: "96px" }} />
                    <p className="text-xs" style={{ color: "#564334" }}>messages avant envoi du rapport</p>
                  </div>
                </Field>
                <div className="mt-6 pt-5" style={{ borderTop: "1px solid #f3f4f5" }}>
                  <button onClick={handleSave} disabled={saving}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
                    style={saved
                      ? { background: "#00658f" }
                      : { background: "#904d00", boxShadow: "0 2px 8px rgba(144,77,0,0.2)" }
                    }>
                    {saving ? (
                      <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent" style={{ animation: "spin 0.7s linear infinite" }} />
                    ) : (
                      <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>
                        {saved ? "check_circle" : "save"}
                      </span>
                    )}
                    {saved ? "Enregistré !" : saving ? "Enregistrement…" : "Enregistrer"}
                  </button>
                </div>
              </Section>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function Section({ icon, title, description, children }: { icon: string; title: string; description: string; children: ReactNode }) {
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: "#ffffff" }}>
      <div className="flex items-center gap-3 px-6 py-4" style={{ borderBottom: "1px solid #f3f4f5" }}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "#f3f4f5" }}>
          <span className="material-symbols-outlined text-base" style={{ color: "#904d00", fontVariationSettings: "'FILL' 1" }}>{icon}</span>
        </div>
        <div>
          <h2 className="text-base font-bold font-headline" style={{ color: "#191c1d" }}>{title}</h2>
          <p className="text-xs" style={{ color: "#564334" }}>{description}</p>
        </div>
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  );
}

function Field({ label, htmlFor, children, className = "" }: { label: string; htmlFor: string; children: ReactNode; className?: string }) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <label htmlFor={htmlFor} className="block text-xs font-bold uppercase tracking-widest" style={{ color: "#564334" }}>{label}</label>
      {children}
    </div>
  );
}
