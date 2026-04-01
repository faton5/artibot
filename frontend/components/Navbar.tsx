"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { LayoutDashboard, BookOpen, Settings, BarChart3, Zap } from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Conversations",       icon: LayoutDashboard },
  { href: "/knowledge", label: "Base de connaissance", icon: BookOpen },
  { href: "/stats",     label: "Statistiques",         icon: BarChart3 },
  { href: "/settings",  label: "Paramètres",           icon: Settings },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed left-0 top-0 h-full flex flex-col z-20"
      style={{
        width: "var(--sidebar-w)",
        background: "#ffffff",
        borderRight: "1px solid #ebebf0",
      }}
    >
      {/* ── Logo ── */}
      <div className="flex items-center gap-2.5 px-5 py-5" style={{ borderBottom: "1px solid #ebebf0" }}>
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: "#fff7ed", border: "1px solid #fed7aa" }}
        >
          <Zap className="w-4 h-4" style={{ color: "#ea580c" }} />
        </div>
        <span
          className="text-[17px] tracking-tight"
          style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, color: "#111113" }}
        >
          ArtiBot
        </span>
      </div>

      {/* ── Navigation ── */}
      <div className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-150"
              style={
                active
                  ? {
                      background: "#fff7ed",
                      color: "#c2410c",
                      fontWeight: 600,
                    }
                  : {
                      color: "#5a5a62",
                      fontWeight: 500,
                    }
              }
              onMouseEnter={(e) => {
                if (!active) {
                  (e.currentTarget as HTMLElement).style.background = "#f5f5f8";
                  (e.currentTarget as HTMLElement).style.color = "#111113";
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  (e.currentTarget as HTMLElement).style.background = "transparent";
                  (e.currentTarget as HTMLElement).style.color = "#5a5a62";
                }
              }}
            >
              <Icon
                className="w-4 h-4 flex-shrink-0"
                style={{ color: active ? "#ea580c" : "currentColor" }}
              />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>

      {/* ── Bot status ── */}
      <div className="px-4 pb-3">
        <div
          className="flex items-center gap-2 px-3 py-2.5 rounded-lg"
          style={{ background: "#f0fdf4", border: "1px solid #bbf7d0" }}
        >
          <div className="w-1.5 h-1.5 rounded-full animate-pulse-dot" style={{ background: "#16a34a" }} />
          <span className="text-[11px] font-medium" style={{ color: "#15803d" }}>
            GPT-4o actif
          </span>
        </div>
      </div>

      {/* ── User ── */}
      <div className="px-4 py-4 flex items-center gap-3" style={{ borderTop: "1px solid #ebebf0" }}>
        <UserButton afterSignOutUrl="/sign-in" />
        <span className="text-[12px] truncate" style={{ color: "#8e8e98" }}>
          Mon compte
        </span>
      </div>
    </nav>
  );
}
