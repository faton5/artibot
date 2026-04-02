"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import {
  LayoutDashboard, Users, FileText, BookOpen,
  Plug, BarChart3, Settings, Zap,
} from "lucide-react";

const NAV_GROUPS = [
  {
    items: [
      { href: "/dashboard",    label: "Conversations",        icon: LayoutDashboard },
      { href: "/prospects",    label: "Prospects",            icon: Users },
      { href: "/reports",      label: "Rapports",             icon: FileText },
    ],
  },
  {
    items: [
      { href: "/knowledge",    label: "Base de connaissance", icon: BookOpen },
      { href: "/integrations", label: "Intégrations",         icon: Plug },
    ],
  },
  {
    items: [
      { href: "/stats",        label: "Statistiques",         icon: BarChart3 },
      { href: "/settings",     label: "Paramètres",           icon: Settings },
    ],
  },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed left-0 top-0 h-full flex flex-col z-20"
      style={{
        width: "var(--sidebar-w)",
        background: "var(--surface)",
        borderRight: "1px solid var(--forge-100)",
      }}
    >
      {/* Logo */}
      <div
        className="flex items-center gap-2.5 px-5 h-[60px] flex-shrink-0"
        style={{ borderBottom: "1px solid var(--forge-100)" }}
      >
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: "#fff7ed", border: "1px solid #fed7aa" }}
        >
          <Zap className="w-4 h-4" style={{ color: "#ea580c" }} />
        </div>
        <span
          className="text-[17px] tracking-tight font-display"
          style={{ fontWeight: 800, color: "var(--forge-900)" }}
        >
          ArtiBot
        </span>
      </div>

      {/* Navigation */}
      <div className="flex-1 px-3 py-4 overflow-y-auto space-y-4">
        {NAV_GROUPS.map((group, gi) => (
          <div key={gi} className="space-y-0.5">
            {group.items.map(({ href, label, icon: Icon }) => {
              const active = pathname === href || pathname.startsWith(href + "/");
              return (
                <Link
                  key={href}
                  href={href}
                  className="nav-item"
                  style={
                    active
                      ? { background: "#fff7ed", color: "#c2410c", fontWeight: 600 }
                      : {}
                  }
                >
                  <Icon
                    className="w-4 h-4 flex-shrink-0"
                    style={{ color: active ? "#ea580c" : "currentColor" }}
                  />
                  <span>{label}</span>
                </Link>
              );
            })}
            {gi < NAV_GROUPS.length - 1 && (
              <div
                className="mt-3 mb-1 mx-1"
                style={{ height: "1px", background: "var(--forge-100)" }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Bot status */}
      <div className="px-3 pb-3">
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-xl"
          style={{ background: "#f0fdf4", border: "1px solid #bbf7d0" }}
        >
          <div className="w-1.5 h-1.5 rounded-full animate-pulse-dot" style={{ background: "#16a34a" }} />
          <span className="text-[11px] font-medium" style={{ color: "#15803d" }}>
            GPT-4o actif
          </span>
        </div>
      </div>

      {/* User */}
      <div
        className="px-4 py-4 flex items-center gap-3"
        style={{ borderTop: "1px solid var(--forge-100)" }}
      >
        <UserButton afterSignOutUrl="/sign-in" />
        <span className="text-[12px] truncate" style={{ color: "var(--forge-400)" }}>
          Mon compte
        </span>
      </div>
    </nav>
  );
}
