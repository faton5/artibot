"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { Bot, LayoutDashboard, BookOpen, Settings, BarChart3 } from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Conversations", icon: LayoutDashboard },
  { href: "/knowledge", label: "Base de connaissances", icon: BookOpen },
  { href: "/stats", label: "Statistiques", icon: BarChart3 },
  { href: "/settings", label: "Paramètres", icon: Settings },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="fixed left-0 top-0 h-full w-60 bg-white border-r border-gray-200 flex flex-col z-10">
      {/* Logo */}
      <div className="flex items-center gap-2 px-6 py-5 border-b border-gray-100">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
          <Bot className="w-5 h-5 text-white" />
        </div>
        <span className="font-bold text-lg text-gray-900">ArtiBot</span>
      </div>

      {/* Navigation */}
      <div className="flex-1 py-4 px-3 space-y-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </Link>
          );
        })}
      </div>

      {/* User */}
      <div className="px-4 py-4 border-t border-gray-100 flex items-center gap-3">
        <UserButton afterSignOutUrl="/sign-in" />
        <span className="text-sm text-gray-600 truncate">Mon compte</span>
      </div>
    </nav>
  );
}
