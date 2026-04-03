"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton, useClerk } from "@clerk/nextjs";

const NAV_ITEMS = [
  { href: "/dashboard",    label: "Tableau de bord",       icon: "dashboard" },
  { href: "/prospects",    label: "Prospects",              icon: "group" },
  { href: "/reports",      label: "Rapports",               icon: "analytics" },
  { href: "/knowledge",    label: "Base de connaissances",  icon: "menu_book" },
  { href: "/integrations", label: "Intégrations",           icon: "extension" },
  { href: "/settings",     label: "Paramètres",             icon: "settings" },
];

export function Navbar() {
  const pathname = usePathname();
  const { signOut } = useClerk();

  return (
    <aside
      className="flex flex-col h-screen py-6 bg-slate-100 fixed left-0 top-0 z-50"
      style={{ width: "var(--sidebar-w)" }}
    >
      {/* Logo */}
      <div className="px-6 mb-8 flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm flex-shrink-0"
          style={{ background: "linear-gradient(135deg, #904d00 0%, #ff8c00 100%)" }}
        >
          <span className="material-symbols-outlined text-white" style={{ fontVariationSettings: "'FILL' 1" }}>
            robot
          </span>
        </div>
        <div>
          <h1 className="text-xl font-headline font-bold text-slate-900 leading-tight">ArtiBot</h1>
          <p className="text-[10px] font-medium text-on-surface-variant uppercase tracking-wider">Atelier Numérique</p>
        </div>
      </div>

      {/* New Conversation button */}
      <div className="px-4 mb-6">
        <Link
          href="/dashboard"
          className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-sm text-white transition-all duration-200 active:scale-95 shadow-md"
          style={{ background: "#904d00", boxShadow: "0 2px 8px rgba(144,77,0,0.25)" }}
        >
          <span className="material-symbols-outlined text-base">add</span>
          Nouvelle Conversation
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(({ href, label, icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-4 py-3 text-[15px] transition-colors duration-100 ${
                active
                  ? "bg-white text-orange-700 font-semibold border-l-4 border-orange-700"
                  : "text-slate-600 hover:bg-slate-200 font-medium"
              }`}
              style={active ? { paddingLeft: "12px" } : {}}
            >
              <span
                className="material-symbols-outlined"
                style={active ? { fontVariationSettings: "'FILL' 1" } : {}}
              >
                {icon}
              </span>
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="mt-auto pt-4 border-t border-slate-200/50 space-y-0.5">
        <a
          href="#"
          className="flex items-center gap-3 px-4 py-3 text-[15px] font-medium text-slate-600 hover:bg-slate-200 transition-colors"
        >
          <span className="material-symbols-outlined">help</span>
          <span>Aide</span>
        </a>
        <button
          onClick={() => signOut({ redirectUrl: "/sign-in" })}
          className="w-full flex items-center gap-3 px-4 py-3 text-[15px] font-medium text-slate-600 hover:bg-slate-200 transition-colors text-left"
        >
          <span className="material-symbols-outlined">logout</span>
          <span>Déconnexion</span>
        </button>
      </div>

      {/* GPT-4o status */}
      <div className="px-4 pt-3 pb-1">
        <div className="flex items-center gap-2.5 px-3 py-2 rounded-full bg-white/70 backdrop-blur-md shadow-sm border border-primary/10">
          <div className="relative flex h-2.5 w-2.5 flex-shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
          </div>
          <span className="text-xs font-semibold text-slate-700 font-headline tracking-tight">GPT-4o actif</span>
          <span className="material-symbols-outlined text-base text-slate-500 ml-auto">auto_awesome</span>
        </div>
      </div>

      {/* User */}
      <div className="px-4 py-3 flex items-center gap-3 mt-1">
        <UserButton afterSignOutUrl="/sign-in" />
        <span className="text-xs text-on-surface-variant truncate">Mon compte</span>
      </div>
    </aside>
  );
}
