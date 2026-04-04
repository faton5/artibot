import Link from "next/link";

const FAQS = [
  {
    q: "Puis-je changer de forfait à tout moment ?",
    a: "Oui. Vous pouvez upgrader ou downgrader à tout moment depuis votre espace client. Le changement prend effet immédiatement.",
  },
  {
    q: "Que se passe-t-il après l'essai de 14 jours ?",
    a: "À la fin de l'essai gratuit, vous pouvez choisir l'un de nos forfaits pour continuer. Aucune carte de crédit n'est requise pendant l'essai.",
  },
  {
    q: "L'IA répond-elle vraiment 24h/24 ?",
    a: "Oui, ArtiBot répond instantanément à vos prospects à toute heure, même le week-end. Vous configurez les plages horaires si besoin.",
  },
  {
    q: "Mes données sont-elles sécurisées ?",
    a: "Vos données sont hébergées en France, chiffrées et ne sont jamais partagées. Nous sommes conformes au RGPD.",
  },
  {
    q: "L'intégration WhatsApp est-elle disponible ?",
    a: "WhatsApp Business est disponible dans le forfait Pro et Expert. L'intégration prend moins de 5 minutes.",
  },
  {
    q: "Puis-je personnaliser les réponses de l'IA ?",
    a: "Oui. Vous configurez le ton, les informations métier, les tarifs et les messages types. L'IA s'adapte à votre identité professionnelle.",
  },
];

const PLANS = [
  {
    name: "Starter",
    price: "59",
    desc: "Pour les artisans qui débutent l'automatisation.",
    features: [
      "Jusqu'à 50 prospects / mois",
      "Réponses email automatiques",
      "IA Standard",
      "Intégration Google Calendar",
      "Dashboard de base",
    ],
    cta: "Commencer l'essai",
    highlight: false,
  },
  {
    name: "Pro",
    price: "99",
    desc: "Le meilleur rapport qualité-prix pour les pros actifs.",
    features: [
      "Prospects illimités",
      "Qualité IA GPT-4o",
      "Email + SMS + WhatsApp Business",
      "Relances automatiques",
      "Dashboard analytique complet",
      "Rapports de qualification",
    ],
    cta: "Essayer gratuitement",
    highlight: true,
  },
  {
    name: "Expert",
    price: "179",
    desc: "Pour les entreprises artisanales avec équipe.",
    features: [
      "Multi-comptes collaborateurs",
      "IA personnalisée (tonalité & brand)",
      "Appels vocaux via IA",
      "Intégrations sur-mesure",
      "Support prioritaire 24/7",
    ],
    cta: "Contacter l'équipe",
    highlight: false,
  },
];

export default function PricingPage() {
  return (
    <div className="overflow-x-hidden" style={{ fontFamily: "'Inter', sans-serif", background: "#f8f9fa", color: "#191c1d" }}>

      {/* Nav */}
      <nav className="sticky top-0 z-50 px-8 h-16 flex justify-between items-center"
        style={{ background: "rgba(248,249,250,0.85)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(221,193,174,0.2)" }}>
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-black tracking-tight font-headline" style={{ color: "#191c1d" }}>ArtiBot</span>
        </Link>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium" style={{ color: "#564334" }}>
          <Link href="/#problem" className="hover:text-orange-600 transition-colors">Problèmes</Link>
          <Link href="/#how-it-works" className="hover:text-orange-600 transition-colors">Fonctionnement</Link>
          <span className="font-bold" style={{ color: "#904d00" }}>Tarifs</span>
        </div>
        <Link href="/sign-up"
          className="text-white px-5 py-2 rounded-full font-bold text-sm shadow-lg"
          style={{ background: "linear-gradient(135deg, #904d00 0%, #ff8c00 100%)" }}>
          Essayer gratuitement
        </Link>
      </nav>

      {/* Hero */}
      <section className="pt-24 pb-16 px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-bold uppercase tracking-widest mb-8"
            style={{ background: "rgba(255,255,255,0.7)", backdropFilter: "blur(12px)", borderColor: "rgba(144,77,0,0.15)", color: "#904d00" }}>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: "#904d00" }} />
              <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: "#904d00" }} />
            </span>
            GPT-4o Actif sur tous les forfaits Pro et Expert
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold font-headline tracking-tight leading-[1.1] mb-6" style={{ color: "#191c1d" }}>
            Un investissement pour votre{" "}
            <span style={{ color: "#904d00" }} className="italic">tranquillité</span>
          </h1>
          <p className="text-lg md:text-xl leading-relaxed max-w-2xl mx-auto" style={{ color: "#564334" }}>
            Choisissez le forfait qui correspond à la taille de votre entreprise. Sans engagement, résiliable à tout moment.
          </p>
          <div className="flex items-center justify-center gap-6 mt-8">
            {[
              { icon: "lock", text: "Données hébergées en France" },
              { icon: "verified", text: "Conforme RGPD" },
              { icon: "support_agent", text: "Support inclus" },
            ].map(({ icon, text }) => (
              <div key={text} className="flex items-center gap-2 text-sm font-medium" style={{ color: "#564334" }}>
                <span className="material-symbols-outlined text-base" style={{ color: "#904d00", fontVariationSettings: "'FILL' 1" }}>{icon}</span>
                {text}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Plans */}
      <section className="px-6 pb-24">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {PLANS.map(({ name, price, desc, features, cta, highlight }) => (
            <div key={name}
              className={`p-10 rounded-3xl flex flex-col gap-8 relative ${highlight ? "scale-105 z-10" : ""}`}
              style={{
                background: "#ffffff",
                border: highlight ? "2px solid #904d00" : "1.5px solid #e7e8e9",
                boxShadow: highlight ? "0 20px 60px rgba(144,77,0,0.15)" : "0 4px 24px rgba(25,28,29,0.04)",
              }}>
              {highlight && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest"
                  style={{ background: "linear-gradient(135deg, #904d00 0%, #ff8c00 100%)" }}>
                  Le plus populaire
                </div>
              )}
              <div>
                <h3 className="font-bold text-xl mb-1 font-headline" style={{ color: highlight ? "#904d00" : "#191c1d" }}>{name}</h3>
                <div className="flex items-baseline gap-1 mb-3">
                  <span className="text-5xl font-extrabold font-headline">{price}€</span>
                  <span className="text-sm" style={{ color: "#564334" }}>/ mois</span>
                </div>
                <p className="text-sm" style={{ color: "#564334" }}>{desc}</p>
              </div>

              <ul className="space-y-3.5 text-sm flex-1">
                {features.map((f) => (
                  <li key={f} className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-base flex-shrink-0 mt-0.5" style={{ color: "#904d00", fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    <span style={{ color: "#191c1d" }}>{f}</span>
                  </li>
                ))}
              </ul>

              <Link href={name === "Expert" ? "mailto:contact@artibot.fr" : "/sign-up"}>
                <span className={`w-full py-4 rounded-xl font-bold text-center text-sm block transition-all`}
                  style={highlight
                    ? { background: "linear-gradient(135deg, #904d00 0%, #ff8c00 100%)", color: "#ffffff", boxShadow: "0 4px 12px rgba(144,77,0,0.25)" }
                    : { background: "#f3f4f5", color: "#191c1d" }
                  }>
                  {cta}
                </span>
              </Link>
            </div>
          ))}
        </div>

        <p className="text-center text-sm mt-8" style={{ color: "#897362" }}>
          Tous les forfaits incluent un essai gratuit de 14 jours. Aucune carte de crédit requise.
        </p>
      </section>

      {/* Comparison table */}
      <section className="px-6 pb-24" style={{ background: "#f3f4f5" }}>
        <div className="max-w-4xl mx-auto pt-16">
          <h2 className="text-3xl font-extrabold font-headline text-center mb-12 tracking-tight">
            Comparaison détaillée
          </h2>
          <div className="rounded-3xl overflow-hidden" style={{ background: "#ffffff", boxShadow: "0 4px 24px rgba(25,28,29,0.04)" }}>
            {[
              { feature: "Prospects / mois", starter: "50", pro: "Illimité", expert: "Illimité" },
              { feature: "Qualité IA", starter: "Standard", pro: "GPT-4o", expert: "GPT-4o Custom" },
              { feature: "Réponses email", starter: "✓", pro: "✓", expert: "✓" },
              { feature: "Réponses SMS", starter: "—", pro: "✓", expert: "✓" },
              { feature: "WhatsApp Business", starter: "—", pro: "✓", expert: "✓" },
              { feature: "Relances automatiques", starter: "—", pro: "✓", expert: "✓" },
              { feature: "Rapports PDF", starter: "—", pro: "✓", expert: "✓" },
              { feature: "Multi-utilisateurs", starter: "1", pro: "3", expert: "Illimité" },
              { feature: "Appels vocaux IA", starter: "—", pro: "—", expert: "✓" },
              { feature: "Support", starter: "Email", pro: "Email + Chat", expert: "Prioritaire 24/7" },
            ].map(({ feature, starter, pro, expert }, i) => (
              <div key={feature} className="grid grid-cols-4 text-sm"
                style={{ borderBottom: i < 9 ? "1px solid #f3f4f5" : "none" }}>
                <div className="px-6 py-4 font-medium" style={{ color: "#191c1d" }}>{feature}</div>
                {[starter, pro, expert].map((val, j) => (
                  <div key={j} className="px-6 py-4 text-center font-medium"
                    style={{ color: val === "—" ? "#c4c5c6" : j === 1 ? "#904d00" : "#564334", background: j === 1 ? "rgba(144,77,0,0.03)" : "transparent" }}>
                    {val}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="p-10 rounded-3xl relative" style={{ background: "#f3f4f5" }}>
            <span className="material-symbols-outlined absolute top-6 right-8 text-6xl" style={{ color: "rgba(144,77,0,0.1)" }}>format_quote</span>
            <p className="text-xl italic font-medium leading-relaxed mb-8" style={{ color: "#191c1d" }}>
              "J'ai souscrit au forfait Pro il y a 3 mois. Mon chiffre d'affaires a augmenté de 28% simplement parce que je ne rate plus aucun prospect le soir ou le week-end. Le retour sur investissement est immédiat."
            </p>
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full flex items-center justify-center text-2xl" style={{ background: "#ffdcc3" }}>👷</div>
              <div>
                <p className="font-bold" style={{ color: "#191c1d" }}>Karim Benali</p>
                <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#564334" }}>Électricien — Bordeaux · Forfait Pro</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 px-6" style={{ background: "#f3f4f5" }}>
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-extrabold font-headline text-center mb-12 tracking-tight">
            Questions fréquentes
          </h2>
          <div className="space-y-4">
            {FAQS.map(({ q, a }) => (
              <div key={q} className="p-6 rounded-2xl" style={{ background: "#ffffff" }}>
                <h4 className="font-bold mb-2" style={{ color: "#191c1d" }}>{q}</h4>
                <p className="text-sm leading-relaxed" style={{ color: "#564334" }}>{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto rounded-[2.5rem] p-12 md:p-20 text-center text-white relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, #904d00 0%, #ff8c00 100%)", boxShadow: "0 20px 60px rgba(144,77,0,0.4)" }}>
          <div className="relative z-10">
            <h2 className="text-3xl md:text-5xl font-extrabold font-headline mb-6 tracking-tight">
              Prêt à ne plus manquer un seul prospect ?
            </h2>
            <p className="text-white/80 text-lg max-w-xl mx-auto mb-10">
              14 jours d'essai gratuit, aucune carte de crédit, annulation en 1 clic.
            </p>
            <Link href="/sign-up"
              className="inline-block bg-white px-10 py-4 rounded-full font-black text-lg hover:scale-105 transition-transform"
              style={{ color: "#904d00" }}>
              Démarrer l'essai gratuit
            </Link>
          </div>
          <div className="absolute -bottom-16 -right-16 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -top-16 -left-16 w-64 h-64 bg-black/10 rounded-full blur-3xl" />
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-8" style={{ background: "#191c1d", color: "rgba(255,255,255,0.6)" }}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <span className="text-xl font-black tracking-tight text-white font-headline">ArtiBot</span>
          <div className="flex gap-8 text-sm">
            <Link href="/" className="hover:text-white transition-colors">Accueil</Link>
            <Link href="/#how-it-works" className="hover:text-white transition-colors">Fonctionnement</Link>
            <Link href="/sign-up" className="hover:text-white transition-colors">Créer un compte</Link>
          </div>
          <p className="text-xs">© 2024 ArtiBot. Fait pour les artisans français.</p>
        </div>
      </footer>
    </div>
  );
}
