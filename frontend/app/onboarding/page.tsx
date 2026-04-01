"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { artisanApi } from "@/lib/api";
import { Bot, ChevronRight, ChevronLeft, Check } from "lucide-react";

const STEPS = ["Identité", "Tarifs & Zone", "Ton du bot", "Connexion Gmail"];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
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

  const handleFinish = async () => {
    setLoading(true);
    try {
      const artisan = await artisanApi.create({
        name: form.name,
        email: form.email,
        config_json: {
          metier: form.metier,
          ville: form.ville,
          zone: form.zone,
          delais: form.delais,
          ton: form.ton,
          message_accueil: form.message_accueil || `Bonjour ! Je suis l'assistant de ${form.name.split(" ")[0]}. Comment puis-je vous aider ?`,
          message_threshold: form.message_threshold,
          tarifs: form.tarifs_note ? { note: form.tarifs_note } : {},
        },
      });
      // Stocker l'ID artisan (en prod, géré via Clerk)
      localStorage.setItem("artisan_id", artisan.id);
      router.push("/settings?onboarding=done");
    } catch (e: any) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Bot className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Configurer ArtiBot</h1>
          <p className="text-gray-500 text-sm mt-1">Moins de 15 minutes pour démarrer</p>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-between mb-8">
          {STEPS.map((label, i) => (
            <div key={i} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
                    i < step
                      ? "bg-green-500 text-white"
                      : i === step
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-400"
                  }`}
                >
                  {i < step ? <Check className="w-4 h-4" /> : i + 1}
                </div>
                <span className="text-xs text-gray-400 mt-1 w-16 text-center">{label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`h-0.5 w-16 mx-1 mb-4 ${i < step ? "bg-green-500" : "bg-gray-200"}`} />
              )}
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          {step === 0 && (
            <div className="space-y-4">
              <h2 className="font-semibold text-gray-900">Vos informations</h2>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Prénom et Nom *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  placeholder="Jean-Pierre Moreau"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Email professionnel *</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  placeholder="contact@mon-entreprise.fr"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Métier *</label>
                <input
                  type="text"
                  value={form.metier}
                  onChange={(e) => update("metier", e.target.value)}
                  placeholder="peintre en bâtiment, plombier, électricien..."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <h2 className="font-semibold text-gray-900">Tarifs & Zone d'intervention</h2>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Ville principale</label>
                <input
                  type="text"
                  value={form.ville}
                  onChange={(e) => update("ville", e.target.value)}
                  placeholder="Rennes"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Zone d'intervention</label>
                <input
                  type="text"
                  value={form.zone}
                  onChange={(e) => update("zone", e.target.value)}
                  placeholder="Rennes et 30km alentour"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Délais habituels</label>
                <input
                  type="text"
                  value={form.delais}
                  onChange={(e) => update("delais", e.target.value)}
                  placeholder="3 à 5 semaines selon disponibilité"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Tarifs indicatifs (vous pourrez importer un PDF plus tard)
                </label>
                <textarea
                  value={form.tarifs_note}
                  onChange={(e) => update("tarifs_note", e.target.value)}
                  placeholder="Ex: Peinture intérieure 22€/m², Ravalement façade 45€/m²..."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px] resize-none"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h2 className="font-semibold text-gray-900">Personnalisation du bot</h2>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Ton du bot</label>
                <select
                  value={form.ton}
                  onChange={(e) => update("ton", e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="professionnel et chaleureux">Professionnel et chaleureux</option>
                  <option value="professionnel">Professionnel</option>
                  <option value="chaleureux et décontracté">Chaleureux et décontracté</option>
                  <option value="neutre">Neutre</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Message d'accueil (optionnel)</label>
                <textarea
                  value={form.message_accueil}
                  onChange={(e) => update("message_accueil", e.target.value)}
                  placeholder={`Bonjour ! Je suis l'assistant de ${form.name || "Jean-Pierre"}. Comment puis-je vous aider ?`}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px] resize-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">
                  Envoyer le rapport après {form.message_threshold} messages
                </label>
                <input
                  type="range"
                  min={3}
                  max={12}
                  value={form.message_threshold}
                  onChange={(e) => update("message_threshold", parseInt(e.target.value))}
                  className="w-full accent-blue-600"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>3 (rapide)</span>
                  <span className="font-medium text-blue-600">{form.message_threshold} messages</span>
                  <span>12 (approfondi)</span>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h2 className="font-semibold text-gray-900">Connexion Gmail</h2>
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                <p className="text-sm text-blue-800 font-medium mb-1">Pourquoi connecter Gmail ?</p>
                <p className="text-xs text-blue-600">
                  ArtiBot répondra automatiquement aux emails de vos prospects depuis votre adresse Gmail, 24h/24.
                  La connexion est sécurisée via OAuth Google (nous ne voyons jamais votre mot de passe).
                </p>
              </div>
              <p className="text-sm text-gray-600">
                Cliquez sur "Terminer" pour créer votre compte, puis connectez Gmail depuis les paramètres.
              </p>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
            <button
              onClick={() => setStep((s) => s - 1)}
              disabled={step === 0}
              className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-500 hover:text-gray-700 disabled:opacity-30 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Précédent
            </button>

            {step < STEPS.length - 1 ? (
              <button
                onClick={() => setStep((s) => s + 1)}
                disabled={step === 0 && (!form.name || !form.email || !form.metier)}
                className="flex items-center gap-1.5 px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                Suivant
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleFinish}
                disabled={loading}
                className="flex items-center gap-1.5 px-5 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Check className="w-4 h-4" />
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
