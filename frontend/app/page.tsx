import Link from "next/link";

export default function Home() {
  return (
    <div className="overflow-x-hidden" style={{ fontFamily: "'Inter', sans-serif", background: "#f8f9fa", color: "#191c1d" }}>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 px-8 h-16 flex justify-between items-center"
        style={{ background: "rgba(248,249,250,0.85)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(221,193,174,0.2)" }}>
        <div className="flex items-center gap-2">
          <span className="text-xl font-black tracking-tight text-slate-900 font-headline">ArtiBot</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-slate-500 font-medium text-sm tracking-wide">
          <a className="hover:text-orange-600 transition-colors" href="#problem">PROBLÈMES</a>
          <a className="hover:text-orange-600 transition-colors" href="#how-it-works">FONCTIONNEMENT</a>
          <a className="hover:text-orange-600 transition-colors" href="#pricing">TARIFS</a>
          <Link
            href="/sign-up"
            className="text-white px-5 py-2 rounded-full font-bold text-sm shadow-lg"
            style={{ background: "linear-gradient(135deg, #904d00 0%, #ff8c00 100%)", boxShadow: "0 4px 12px rgba(144,77,0,0.25)" }}
          >
            Essayer gratuitement
          </Link>
        </div>
        <div className="flex md:hidden items-center">
          <span className="material-symbols-outlined text-slate-900">menu</span>
        </div>
      </nav>

      {/* Hero */}
      <header className="relative pt-20 pb-32 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <div className="lg:w-1/2 flex flex-col items-start gap-8">
            <div className="flex items-center gap-2 px-4 py-1.5 rounded-full border text-primary font-bold text-xs uppercase tracking-widest"
              style={{ background: "rgba(255,255,255,0.7)", backdropFilter: "blur(12px)", borderColor: "rgba(144,77,0,0.15)", color: "#904d00" }}>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" style={{ background: "#904d00" }} />
                <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: "#904d00" }} />
              </span>
              Nouveau : GPT-4o actif pour vos chantiers
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold font-headline leading-[1.1] tracking-tight"
              style={{ color: "#191c1d" }}>
              Ne manquez plus jamais{" "}
              <span style={{ color: "#904d00" }} className="italic">un prospect</span>.
            </h1>
            <p className="text-lg md:text-xl leading-relaxed max-w-xl" style={{ color: "#564334" }}>
              L'assistant IA qui répond pour vous 24/7. ArtiBot qualifie vos prospects et prend vos rendez-vous pendant que vous êtes sur le terrain.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Link
                href="/sign-up"
                className="text-white px-8 py-4 rounded-full font-bold text-lg flex items-center justify-center gap-2"
                style={{ background: "linear-gradient(135deg, #904d00 0%, #ff8c00 100%)", boxShadow: "0 8px 24px rgba(144,77,0,0.3)" }}
              >
                Essayer gratuitement
                <span className="material-symbols-outlined">arrow_forward</span>
              </Link>
              <a
                href="#how-it-works"
                className="px-8 py-4 rounded-full font-bold text-lg flex items-center justify-center gap-2 transition-all"
                style={{ background: "#ffffff", color: "#191c1d", border: "2px solid #e7e8e9" }}
              >
                Voir la démo
              </a>
            </div>
            <div className="flex items-center gap-4 pt-4">
              <div className="flex -space-x-3">
                {["👷", "👩‍🔧", "👨‍🏭"].map((emoji, i) => (
                  <div key={i} className="h-10 w-10 rounded-full border-2 border-white shadow-sm flex items-center justify-center text-lg" style={{ background: "#ffdcc3" }}>
                    {emoji}
                  </div>
                ))}
              </div>
              <p className="text-sm font-medium" style={{ color: "#564334" }}>+400 artisans utilisent ArtiBot chaque jour</p>
            </div>
          </div>

          <div className="lg:w-1/2 relative">
            <div className="relative z-10 rounded-3xl shadow-2xl overflow-hidden" style={{ background: "#ffffff", border: "1px solid #e7e8e9" }}>
              <div className="p-8">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {[
                    { label: "Conversations", value: "142", icon: "chat_bubble", color: "#904d00", bg: "rgba(144,77,0,0.1)" },
                    { label: "Hot Leads", value: "12", icon: "local_fire_department", color: "#904d00", bg: "#904d00", white: true },
                    { label: "Qualifiés", value: "56", icon: "verified", color: "#865224", bg: "rgba(134,82,36,0.1)" },
                    { label: "Taux conv.", value: "34%", icon: "trending_up", color: "#00658f", bg: "rgba(0,101,143,0.1)" },
                  ].map(({ label, value, icon, color, bg, white }) => (
                    <div key={label} className="p-4 rounded-xl shadow-sm" style={{ background: white ? color : "#ffffff", border: `1px solid ${white ? "transparent" : "#e7e8e9"}` }}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: white ? "rgba(255,255,255,0.2)" : bg }}>
                          <span className="material-symbols-outlined text-sm" style={{ color: white ? "#fff" : color, fontVariationSettings: "'FILL' 1" }}>{icon}</span>
                        </div>
                      </div>
                      <div className="text-2xl font-extrabold font-headline" style={{ color: white ? "#fff" : "#191c1d" }}>{value}</div>
                      <div className="text-xs mt-1" style={{ color: white ? "rgba(255,255,255,0.8)" : "#564334" }}>{label}</div>
                    </div>
                  ))}
                </div>
                <div className="space-y-3">
                  {[
                    { name: "Jean-Pierre D.", msg: "Fuite en cuisine, urgent !", badge: "URGENT", badgeColor: "#ffdad6", badgeText: "#93000a" },
                    { name: "Marie L.", msg: "Devis rénovation salle de bain", badge: "QUALIFIÉ", badgeColor: "#fdb881", badgeText: "#2f1500" },
                    { name: "Thomas B.", msg: "Photos du tableau électrique", badge: "EN ATTENTE", badgeColor: "#c7e7ff", badgeText: "#004360" },
                  ].map(({ name, msg, badge, badgeColor, badgeText }) => (
                    <div key={name} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: "#f3f4f5" }}>
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0" style={{ background: "#ffdcc3", color: "#623200" }}>
                        {name[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-900 truncate">{name}</p>
                        <p className="text-xs text-slate-500 truncate">{msg}</p>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-sm flex-shrink-0" style={{ background: badgeColor, color: badgeText }}>{badge}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {/* Floating card */}
            <div className="absolute -bottom-8 -left-8 z-20 p-5 rounded-2xl shadow-xl max-w-[260px]"
              style={{ background: "rgba(255,255,255,0.85)", backdropFilter: "blur(12px)", border: "1px solid rgba(144,77,0,0.1)" }}>
              <div className="flex items-start gap-3">
                <div className="h-9 w-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "#fdb881" }}>
                  <span className="material-symbols-outlined text-sm" style={{ color: "#78471a", fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                </div>
                <div>
                  <p className="font-bold text-sm text-slate-900">Nouveau Prospect</p>
                  <p className="text-xs text-slate-500">Plomberie d'urgence — Paris 15e</p>
                  <p className="text-[10px] mt-1.5 font-bold" style={{ color: "#904d00" }}>IA QUALIFIÉE · PRIORITÉ HAUTE</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Problem Section */}
      <section id="problem" className="py-32 px-6" style={{ background: "#f3f4f5" }}>
        <div className="max-w-7xl mx-auto text-center mb-20">
          <h2 className="text-3xl md:text-5xl font-extrabold font-headline mb-6 tracking-tight">
            Le terrain demande du temps.<br />
            Vos clients demandent de la <span style={{ color: "#904d00" }}>réactivité</span>.
          </h2>
          <p className="max-w-2xl mx-auto text-lg" style={{ color: "#564334" }}>
            En tant qu'artisan indépendant, chaque appel manqué est un chantier qui part à la concurrence.
          </p>
        </div>
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: "phone_disabled", iconBg: "#ffdad6", iconColor: "#93000a", title: "Appels Perdus", desc: "60% des clients appellent un autre artisan s'ils tombent sur un répondeur." },
            { icon: "timer_off", iconBg: "#fdb881", iconColor: "#2f1500", title: "Temps Administratif", desc: "Passer 2 heures chaque soir à rappeler des prospects est un fardeau mental." },
            { icon: "filter_list", iconBg: "#c7e7ff", iconColor: "#004360", title: "Prospection Inutile", desc: "ArtiBot filtre les curieux et ne vous envoie que les projets qualifiés." },
          ].map(({ icon, iconBg, iconColor, title, desc }) => (
            <div key={title} className="p-8 rounded-2xl flex flex-col gap-4" style={{ background: "#ffffff" }}>
              <div className="h-12 w-12 rounded-xl flex items-center justify-center" style={{ background: iconBg }}>
                <span className="material-symbols-outlined" style={{ color: iconColor }}>{icon}</span>
              </div>
              <h3 className="font-headline font-bold text-xl">{title}</h3>
              <p style={{ color: "#564334" }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-32 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-12">
          <div className="lg:w-1/3 flex flex-col justify-center">
            <h2 className="text-4xl md:text-5xl font-extrabold font-headline mb-6 tracking-tight">
              Comment ça <span style={{ color: "#904d00" }}>marche</span> ?
            </h2>
            <p className="text-lg mb-8" style={{ color: "#564334" }}>
              Trois étapes simples pour transformer votre activité et regagner votre liberté.
            </p>
            <div className="space-y-8">
              {[
                { n: "1", title: "Connectez vos canaux", desc: "Liez votre numéro pro, WhatsApp et Facebook Messenger en 2 minutes." },
                { n: "2", title: "L'IA prend le relais", desc: "Notre IA répond instantanément, pose les bonnes questions et qualifie le projet." },
                { n: "3", title: "Recevez les rendez-vous", desc: "Vous recevez une notification avec tous les détails. Il ne vous reste plus qu'à intervenir." },
              ].map(({ n, title, desc }) => (
                <div key={n} className="flex gap-4">
                  <div className="h-10 w-10 flex-shrink-0 rounded-full text-white flex items-center justify-center font-bold" style={{ background: "#904d00" }}>{n}</div>
                  <div>
                    <h4 className="font-bold font-headline">{title}</h4>
                    <p className="text-sm" style={{ color: "#564334" }}>{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="lg:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="rounded-3xl p-8 flex flex-col justify-between h-72 overflow-hidden" style={{ background: "#f3f4f5" }}>
              <div>
                <span className="material-symbols-outlined mb-4 text-4xl" style={{ color: "#904d00", display: "block" }}>forum</span>
                <h4 className="font-headline font-bold text-2xl">Conversation Intelligente</h4>
              </div>
              <div className="space-y-2">
                <div className="p-3 rounded-xl text-xs shadow-sm max-w-[80%]" style={{ background: "#ffffff" }}>Bonjour, je cherche un électricien pour un tableau...</div>
                <div className="p-3 rounded-xl text-xs ml-auto max-w-[80%]" style={{ background: "rgba(144,77,0,0.1)" }}>Bonjour ! ArtiBot ici. Bien sûr, pour quelle ville ?</div>
              </div>
            </div>
            <div className="rounded-3xl p-8 flex flex-col justify-between h-72" style={{ background: "#f3f4f5" }}>
              <div>
                <span className="material-symbols-outlined mb-4 text-4xl" style={{ color: "#904d00", display: "block" }}>calendar_month</span>
                <h4 className="font-headline font-bold text-2xl">Agenda Automatisé</h4>
              </div>
              <div className="rounded-2xl p-4 shadow-sm" style={{ background: "#ffffff" }}>
                <div className="flex justify-between items-center text-xs mb-2 pb-2" style={{ borderBottom: "1px solid #f3f4f5" }}>
                  <span className="font-bold">Mardi 24 Octobre</span>
                  <span style={{ color: "#904d00" }}>3 slots libres</span>
                </div>
                <div className="flex gap-2">
                  {["09:00", "14:00", "16:30"].map((t, i) => (
                    <div key={t} className="flex-1 text-[10px] p-2 rounded-lg text-center font-bold"
                      style={i === 0 ? { background: "#904d00", color: "#fff" } : { border: "1px solid #904d00", color: "#904d00" }}>
                      {t}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="sm:col-span-2 text-white rounded-3xl p-8 flex flex-col md:flex-row items-center gap-8 min-h-56" style={{ background: "#191c1d" }}>
              <div className="flex-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs mb-4" style={{ background: "rgba(255,255,255,0.1)" }}>
                  <span className="material-symbols-outlined text-xs">bolt</span>
                  Analyses en temps réel
                </div>
                <h4 className="font-headline font-bold text-3xl mb-4">Augmentez votre CA de +30%</h4>
                <p className="text-sm" style={{ color: "#94a3b8" }}>En captant tous vos appels, même le dimanche ou pendant vos chantiers, vous multipliez naturellement vos opportunités.</p>
              </div>
              <div className="flex-shrink-0 text-center">
                <div className="text-6xl font-black font-headline" style={{ color: "#ff8c00" }}>+45</div>
                <div className="text-xs uppercase tracking-widest" style={{ color: "#64748b" }}>Prospects / mois</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-32 px-6" style={{ background: "#f3f4f5" }}>
        <div className="max-w-7xl mx-auto text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-extrabold font-headline mb-6 tracking-tight">
            Un investissement pour votre <span style={{ color: "#904d00" }}>tranquillité</span>
          </h2>
          <p className="max-w-2xl mx-auto text-lg" style={{ color: "#564334" }}>Choisissez le forfait qui correspond à la taille de votre entreprise. Sans engagement.</p>
        </div>
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              name: "Starter", price: "59€",
              features: ["Jusqu'à 50 prospects / mois", "Réponses SMS instantanées", "IA Standard", "Intégration Google Calendar"],
              cta: "Choisir Starter", highlight: false,
            },
            {
              name: "Pro", price: "99€",
              features: ["Prospects illimités", "Qualité IA GPT-4o", "Intégration WhatsApp Business", "Relances automatiques", "Dashboard analytique complet"],
              cta: "Essayer gratuitement", highlight: true,
            },
            {
              name: "Expert", price: "179€",
              features: ["Multi-comptes collaborateurs", "IA personnalisée (tonalité)", "Appels vocaux via IA", "Support prioritaire 24/7"],
              cta: "Contacter l'équipe", highlight: false,
            },
          ].map(({ name, price, features, cta, highlight }) => (
            <div key={name} className={`p-10 rounded-3xl flex flex-col gap-8 relative ${highlight ? "scale-105 z-10" : ""}`}
              style={{
                background: "#ffffff",
                border: highlight ? "2px solid #904d00" : "1px solid transparent",
                boxShadow: highlight ? "0 20px 60px rgba(144,77,0,0.15)" : "none",
              }}>
              {highlight && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest" style={{ background: "#904d00" }}>
                  Le plus populaire
                </div>
              )}
              <div>
                <h3 className="font-bold text-xl mb-1" style={{ color: highlight ? "#904d00" : "#191c1d" }}>{name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold font-headline">{price}</span>
                  <span className="text-sm" style={{ color: "#564334" }}>/ mois</span>
                </div>
              </div>
              <ul className="space-y-4 text-sm flex-1">
                {features.map((f) => (
                  <li key={f} className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-lg flex-shrink-0" style={{ color: "#904d00" }}>check</span>
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/sign-up">
                <span className={`w-full py-4 rounded-xl font-bold text-center block transition-all ${
                  highlight
                    ? "text-white"
                    : "text-on-surface hover:bg-surface-container-low"
                }`}
                  style={highlight
                    ? { background: "linear-gradient(135deg, #904d00 0%, #ff8c00 100%)", boxShadow: "0 4px 12px rgba(144,77,0,0.25)" }
                    : { border: "2px solid #e7e8e9" }
                  }>
                  {cta}
                </span>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-32 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-5xl font-extrabold font-headline mb-6 tracking-tight">
            Adopté par les <span style={{ color: "#904d00" }}>pros</span>
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {[
            {
              quote: `"Avant ArtiBot, je perdais au moins 3 à 4 chantiers par semaine car je ne pouvais pas répondre au téléphone en plein dépannage. Depuis, l'IA gère tout et je n'ai plus qu'à consulter mon planning le soir. C'est magique."`,
              name: "Marc Lefebvre",
              role: "Plombier Chauffagiste — Lyon",
              avatar: "👷",
            },
            {
              quote: `"Je suis peintre décoratrice, j'ai besoin de me concentrer sur les finitions. ArtiBot qualifie les demandes de devis et écarte les personnes qui n'ont pas de budget sérieux. Un gain de temps incroyable."`,
              name: "Sophie Morel",
              role: "Peintre Décoratrice — Nantes",
              avatar: "👩‍🎨",
            },
          ].map(({ quote, name, role, avatar }) => (
            <div key={name} className="flex flex-col gap-6 p-8 rounded-3xl relative" style={{ background: "#f3f4f5" }}>
              <span className="material-symbols-outlined absolute top-4 right-8 text-6xl" style={{ color: "rgba(144,77,0,0.1)" }}>format_quote</span>
              <p className="text-xl italic font-medium leading-relaxed">{quote}</p>
              <div className="flex items-center gap-4 mt-4">
                <div className="h-12 w-12 rounded-full flex items-center justify-center text-2xl border-2 border-white shadow-sm" style={{ background: "#ffdcc3" }}>
                  {avatar}
                </div>
                <div>
                  <p className="font-bold">{name}</p>
                  <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#564334" }}>{role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="mb-32 px-6">
        <div className="max-w-7xl mx-auto rounded-[2.5rem] p-12 md:p-24 text-center text-white relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, #904d00 0%, #ff8c00 100%)", boxShadow: "0 20px 60px rgba(144,77,0,0.4)" }}>
          <div className="relative z-10">
            <h2 className="text-4xl md:text-6xl font-extrabold font-headline mb-8 tracking-tight">
              Prêt à reprendre le contrôle de votre temps ?
            </h2>
            <p className="text-white/80 text-lg md:text-xl max-w-2xl mx-auto mb-12">
              Rejoignez des centaines d'artisans qui automatisent leur prospection avec ArtiBot. 14 jours d'essai gratuit, aucune carte de crédit requise.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link href="/sign-up" className="bg-white px-10 py-5 rounded-full font-black text-xl hover:scale-105 transition-transform" style={{ color: "#904d00" }}>
                Démarrer l'essai gratuit
              </Link>
            </div>
          </div>
          <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -top-20 -left-20 w-80 h-80 bg-black/10 rounded-full blur-3xl" />
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-8" style={{ background: "#191c1d", color: "rgba(255,255,255,0.6)" }}>
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1">
            <span className="text-2xl font-black tracking-tight text-white font-headline mb-6 block">ArtiBot</span>
            <p className="text-sm leading-relaxed">La plateforme IA n°1 pour les artisans indépendants en France. Simplifiez votre gestion, augmentez vos revenus.</p>
          </div>
          {[
            { title: "Produit", links: ["Fonctionnalités", "Intégrations", "Tarifs", "Mises à jour"] },
            { title: "Ressources", links: ["Blog Artisan", "Guide de l'IA", "Centre d'aide", "Support"] },
            { title: "Légal", links: ["Confidentialité", "Conditions d'utilisation", "Mentions légales", "Cookies"] },
          ].map(({ title, links }) => (
            <div key={title}>
              <h5 className="text-white font-bold mb-6 uppercase text-xs tracking-widest">{title}</h5>
              <ul className="space-y-4 text-sm">
                {links.map((l) => (
                  <li key={l}><a className="hover:text-white transition-colors" href="#">{l}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="max-w-7xl mx-auto mt-20 pt-8 flex flex-col md:flex-row justify-between items-center gap-6" style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}>
          <p className="text-xs">© 2024 ArtiBot. Fait avec passion pour les artisans français.</p>
        </div>
      </footer>
    </div>
  );
}
