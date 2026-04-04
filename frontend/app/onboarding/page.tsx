"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { artisanApi, geoApi } from "@/lib/api";
import { CitySuggestion } from "@/types";

const STEPS = ["Identité", "Tarifs & Zone", "Ton du bot", "Connexion Gmail"];

const TRADE_OPTIONS = [
  { value: "plombier", label: "Plombier", icon: "plumbing" },
  { value: "electricien", label: "Électricien", icon: "bolt" },
  { value: "peintre", label: "Peintre", icon: "format_paint" },
  { value: "macon", label: "Maçon", icon: "construction" },
  { value: "menuisier", label: "Menuisier", icon: "carpenter" },
  { value: "autre", label: "Autre", icon: "handyman" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { user } = useUser();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    metier: "",
    ville: "",
    zone: "",
    delais: "",
    tarifs_note: "",
    ton: "professionnel et chaleureux",
    message_accueil: "",
    message_threshold: 6,
  });

  const update = (key: string, value: string | number) => setForm((p) => ({ ...p, [key]: value }));

  const [citySuggestions, setCitySuggestions] = useState<CitySuggestion[]>([]);
  const [cityDropdownOpen, setCityDropdownOpen] = useState(false);
  const cityDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cityBoxRef = useRef<HTMLDivElement>(null);

  const handleCityInput = (value: string) => {
    update("ville", value);
    if (cityDebounce.current) clearTimeout(cityDebounce.current);
    if (value.length < 2) { setCitySuggestions([]); setCityDropdownOpen(false); return; }
    cityDebounce.current = setTimeout(async () => {
      try {
        const results = await geoApi.searchCities(value);
        setCitySuggestions(results);
        setCityDropdownOpen(results.length > 0);
      } catch { /* ignore */ }
    }, 280);
  };

  const pickCity = (city: CitySuggestion) => {
    update("ville", city.name);
    setCityDropdownOpen(false);
    setCitySuggestions([]);
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (cityBoxRef.current && !cityBoxRef.current.contains(e.target as Node)) {
        setCityDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleFinish = async () => {
    setLoading(true);
    try {
      const artisan = await artisanApi.create({
        name: form.name,
        email: form.email,
        clerk_user_id: user?.id,
        config_json: {
          metier: form.metier,
          ville: form.ville,
          zone: form.zone,
          delais: form.delais,
          ton: form.ton,
          message_accueil: form.message_accueil || `Bonjour ! Je suis l'assistant de ${form.name.split(" ")[0]}. Comment puis-je vous aider ?`,
          message_threshold: form.message_threshold,
        },
      });
      localStorage.setItem("artisan_id", artisan.id);
      setSuccess(true);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
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

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "#f3f4f5" }}>
        <div className="w-full max-w-lg text-center">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl"
            style={{ background: "linear-gradient(135deg, #904d00 0%, #ff8c00 100%)" }}>
            <span className="material-symbols-outlined text-white text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
          </div>
          <h1 className="text-4xl font-extrabold font-headline tracking-tight mb-3" style={{ color: "#191c1d" }}>
            Votre assistant est prêt !
          </h1>
          <p className="text-base mb-10" style={{ color: "#564334" }}>
            ArtiBot est configuré et prêt à répondre à vos prospects 24h/24.
          </p>

          <div className="rounded-3xl p-8 mb-8 text-left space-y-5" style={{ background: "#ffffff", boxShadow: "0 4px 24px rgba(25,28,29,0.06)" }}>
            {[
              { icon: "person", label: "Profil artisan", desc: "Vos informations métier ont été enregistrées." },
              { icon: "robot", label: "ArtiBot actif", desc: "Votre assistant IA est prêt à qualifier vos prospects." },
              { icon: "lock", label: "Données sécurisées", desc: "Vos données sont chiffrées et hébergées en France." },
            ].map(({ icon, label, desc }) => (
              <div key={label} className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(144,77,0,0.1)" }}>
                  <span className="material-symbols-outlined text-base" style={{ color: "#904d00", fontVariationSettings: "'FILL' 1" }}>{icon}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="font-bold text-sm" style={{ color: "#191c1d" }}>{label}</p>
                    <span className="material-symbols-outlined text-sm" style={{ color: "#904d00", fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  </div>
                  <p className="text-xs" style={{ color: "#564334" }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => router.push("/dashboard")}
              className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-white"
              style={{ background: "linear-gradient(135deg, #904d00 0%, #ff8c00 100%)", boxShadow: "0 4px 12px rgba(144,77,0,0.25)" }}>
              <span className="material-symbols-outlined text-base">dashboard</span>
              Accéder au tableau de bord
            </button>
            <button
              onClick={() => router.push("/integrations")}
              className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-bold"
              style={{ background: "#ffffff", color: "#191c1d", border: "1.5px solid #e7e8e9" }}>
              <span className="material-symbols-outlined text-base" style={{ color: "#904d00" }}>mail</span>
              Connecter Gmail
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "#f3f4f5" }}>
      <div className="w-full max-w-xl">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
            style={{ background: "linear-gradient(135deg, #904d00 0%, #ff8c00 100%)" }}>
            <span className="material-symbols-outlined text-white text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>robot</span>
          </div>
          <h1 className="text-3xl font-extrabold font-headline tracking-tight" style={{ color: "#191c1d" }}>Configurer ArtiBot</h1>
          <p className="text-sm mt-2" style={{ color: "#564334" }}>Moins de 2 minutes pour avoir un assistant prêt à l'emploi</p>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-between mb-10">
          {STEPS.map((label, i) => (
            <div key={i} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-shrink-0">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all"
                  style={
                    i < step
                      ? { background: "#904d00", color: "#fff" }
                      : i === step
                      ? { background: "#904d00", color: "#fff", boxShadow: "0 0 0 4px rgba(144,77,0,0.15)" }
                      : { background: "#e7e8e9", color: "#564334" }
                  }>
                  {i < step ? (
                    <span className="material-symbols-outlined text-base">check</span>
                  ) : i + 1}
                </div>
                <span className="text-xs mt-1.5 text-center font-medium" style={{ color: i <= step ? "#904d00" : "#897362", width: "64px" }}>{label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className="flex-1 h-0.5 mx-1 mb-5 rounded-full" style={{ background: i < step ? "#904d00" : "#e7e8e9" }} />
              )}
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="rounded-3xl p-8 shadow-sm" style={{ background: "#ffffff" }}>
          {step === 0 && (
            <div className="space-y-5">
              <h2 className="font-extrabold font-headline text-xl" style={{ color: "#191c1d" }}>Vos informations</h2>
              {[
                { label: "Prénom et Nom *", key: "name", placeholder: "Jean-Pierre Moreau", type: "text" },
                { label: "Email professionnel *", key: "email", placeholder: "contact@mon-entreprise.fr", type: "email" },
              ].map(({ label, key, placeholder, type }) => (
                <div key={key}>
                  <label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: "#564334" }}>{label}</label>
                  <input type={type} value={(form as any)[key]} onChange={(e) => update(key, e.target.value)} placeholder={placeholder} style={inputStyle} />
                </div>
              ))}
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "#564334" }}>Métier *</label>
                <div className="grid grid-cols-3 gap-2">
                  {TRADE_OPTIONS.map(({ value, label, icon }) => (
                    <button key={value} type="button" onClick={() => update("metier", value)}
                      className="flex flex-col items-center gap-2 p-3 rounded-xl text-sm font-medium transition-all"
                      style={form.metier === value
                        ? { background: "#ffdcc3", border: "2px solid #904d00", color: "#623200" }
                        : { background: "#f3f4f5", border: "1.5px solid #e7e8e9", color: "#564334" }
                      }>
                      <span className="material-symbols-outlined text-xl" style={{ color: form.metier === value ? "#904d00" : "#564334", fontVariationSettings: "'FILL' 1" }}>{icon}</span>
                      {label}
                    </button>
                  ))}
                </div>
                <input type="text" value={form.metier && !TRADE_OPTIONS.find((o) => o.value === form.metier) ? form.metier : ""}
                  onChange={(e) => update("metier", e.target.value)}
                  placeholder="Ou saisissez votre métier..."
                  className="mt-2" style={{ ...inputStyle, marginTop: "8px" }} />
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-5">
              <h2 className="font-extrabold font-headline text-xl" style={{ color: "#191c1d" }}>Tarifs & Zone d'intervention</h2>
              <div ref={cityBoxRef} className="relative">
                <label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: "#564334" }}>Ville principale</label>
                <input type="text" value={form.ville} onChange={(e) => handleCityInput(e.target.value)}
                  onFocus={() => citySuggestions.length > 0 && setCityDropdownOpen(true)}
                  placeholder="Rennes" autoComplete="off" style={inputStyle} />
                {cityDropdownOpen && citySuggestions.length > 0 && (
                  <div className="absolute z-50 left-0 right-0 top-full mt-1 rounded-xl shadow-lg overflow-hidden" style={{ background: "#ffffff", border: "1px solid #e7e8e9", maxHeight: 220, overflowY: "auto" }}>
                    {citySuggestions.map((city, i) => (
                      <button key={i} type="button"
                        className="w-full text-left px-4 py-2.5 text-sm flex items-baseline gap-2 transition-colors"
                        style={{ color: "#191c1d" }}
                        onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "#f3f4f5")}
                        onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}
                        onMouseDown={(e) => { e.preventDefault(); pickCity(city); }}>
                        <span className="font-semibold">{city.name}</span>
                        {city.postal_code && <span className="text-xs" style={{ color: "#564334" }}>{city.postal_code}</span>}
                        {city.department_name && <span className="text-xs ml-auto" style={{ color: "#897362" }}>{city.department_name}</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {[
                { label: "Zone d'intervention", key: "zone", placeholder: "Rennes et 30km alentour" },
                { label: "Délais habituels", key: "delais", placeholder: "3 à 5 semaines selon disponibilité" },
              ].map(({ label, key, placeholder }) => (
                <div key={key}>
                  <label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: "#564334" }}>{label}</label>
                  <input type="text" value={(form as any)[key]} onChange={(e) => update(key, e.target.value)} placeholder={placeholder} style={inputStyle} />
                </div>
              ))}
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: "#564334" }}>Tarifs indicatifs</label>
                <textarea value={form.tarifs_note} onChange={(e) => update("tarifs_note", e.target.value)}
                  placeholder="Ex: Peinture intérieure 22€/m², Ravalement façade 45€/m²..."
                  style={{ ...inputStyle, minHeight: "80px", resize: "none" }} />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <h2 className="font-extrabold font-headline text-xl" style={{ color: "#191c1d" }}>Personnalisation du bot</h2>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: "#564334" }}>Ton du bot</label>
                <select value={form.ton} onChange={(e) => update("ton", e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>
                  <option value="professionnel et chaleureux">Professionnel et chaleureux</option>
                  <option value="professionnel">Professionnel</option>
                  <option value="chaleureux et décontracté">Chaleureux et décontracté</option>
                  <option value="neutre">Neutre</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: "#564334" }}>Message d'accueil (optionnel)</label>
                <textarea value={form.message_accueil} onChange={(e) => update("message_accueil", e.target.value)}
                  placeholder={`Bonjour ! Je suis l'assistant de ${form.name || "Jean-Pierre"}. Comment puis-je vous aider ?`}
                  style={{ ...inputStyle, minHeight: "80px", resize: "none" }} />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#564334" }}>
                  Envoyer le rapport après <span style={{ color: "#904d00" }}>{form.message_threshold}</span> messages
                </label>
                <input type="range" min={3} max={12} value={form.message_threshold}
                  onChange={(e) => update("message_threshold", parseInt(e.target.value))}
                  className="w-full" style={{ accentColor: "#904d00" }} />
                <div className="flex justify-between text-xs mt-1" style={{ color: "#897362" }}>
                  <span>3 (rapide)</span>
                  <span className="font-bold" style={{ color: "#904d00" }}>{form.message_threshold} messages</span>
                  <span>12 (approfondi)</span>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <h2 className="font-extrabold font-headline text-xl" style={{ color: "#191c1d" }}>Connexion Gmail</h2>
              <div className="p-5 rounded-2xl" style={{ background: "#c7e7ff", border: "1px solid #00b5fc" }}>
                <p className="text-sm font-bold mb-1" style={{ color: "#004360" }}>Pourquoi connecter Gmail ?</p>
                <p className="text-xs" style={{ color: "#00658f" }}>
                  ArtiBot répondra automatiquement aux emails de vos prospects depuis votre adresse Gmail, 24h/24.
                  La connexion est sécurisée via OAuth Google (nous ne voyons jamais votre mot de passe).
                </p>
              </div>
              <div className="p-4 rounded-2xl flex items-center gap-3" style={{ background: "#ffdcc3" }}>
                <span className="material-symbols-outlined" style={{ color: "#904d00", fontVariationSettings: "'FILL' 1" }}>lock</span>
                <p className="text-sm" style={{ color: "#623200" }}>Vos données sont sécurisées et ne seront jamais partagées.</p>
              </div>
              <p className="text-sm" style={{ color: "#564334" }}>
                Cliquez sur "Terminer" pour créer votre compte, puis connectez Gmail depuis les paramètres.
              </p>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6" style={{ borderTop: "1px solid #f3f4f5" }}>
            <button onClick={() => setStep((s) => s - 1)} disabled={step === 0}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors disabled:opacity-30"
              style={{ color: "#564334" }}>
              <span className="material-symbols-outlined text-base">chevron_left</span>
              Précédent
            </button>

            {step < STEPS.length - 1 ? (
              <button onClick={() => setStep((s) => s + 1)}
                disabled={step === 0 && (!form.name || !form.email || !form.metier)}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-50 transition-all"
                style={{ background: "#904d00", boxShadow: "0 2px 8px rgba(144,77,0,0.2)" }}>
                Suivant
                <span className="material-symbols-outlined text-base">chevron_right</span>
              </button>
            ) : (
              <button onClick={handleFinish} disabled={loading}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-50 transition-all"
                style={{ background: "#904d00", boxShadow: "0 2px 8px rgba(144,77,0,0.2)" }}>
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full" style={{ animation: "spin 0.7s linear infinite" }} />
                ) : (
                  <span className="material-symbols-outlined text-base">check</span>
                )}
                Terminer
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
