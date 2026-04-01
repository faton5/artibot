"use client";

import { useState } from "react";
import useSWR from "swr";
import { Navbar } from "@/components/Navbar";
import { ConversationList } from "@/components/ConversationList";
import { conversationApi } from "@/lib/api";
import { Search, Filter } from "lucide-react";
import type { ConversationStatus } from "@/types";

const ARTISAN_ID = process.env.NEXT_PUBLIC_ARTISAN_ID || "";

const STATUS_FILTERS: { label: string; value: ConversationStatus | "" }[] = [
  { label: "Toutes", value: "" },
  { label: "Actives", value: "active" },
  { label: "Qualifiées", value: "qualified" },
  { label: "Escaladées", value: "escalated" },
  { label: "Fermées", value: "closed" },
];

export default function DashboardPage() {
  const [statusFilter, setStatusFilter] = useState<ConversationStatus | "">("");
  const [search, setSearch] = useState("");

  const { data: conversations = [], isLoading, error } = useSWR(
    ["conversations", ARTISAN_ID, statusFilter],
    () => conversationApi.list(ARTISAN_ID, statusFilter || undefined),
    { refreshInterval: 5000 }
  );

  const filtered = search.trim()
    ? conversations.filter((c) => {
        const q = search.toLowerCase();
        return (
          c.prospect?.name?.toLowerCase().includes(q) ||
          c.prospect?.email?.toLowerCase().includes(q) ||
          c.prospect?.phone?.includes(q) ||
          c.last_message?.content?.toLowerCase().includes(q)
        );
      })
    : conversations;

  return (
    <div className="flex h-screen overflow-hidden">
      <Navbar />

      <main className="ml-60 flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <h1 className="text-xl font-bold text-gray-900 mb-3">Conversations</h1>

          {/* Barre de recherche */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un prospect..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Filtres statut */}
          <div className="flex gap-1.5">
            {STATUS_FILTERS.map(({ label, value }) => (
              <button
                key={value}
                onClick={() => setStatusFilter(value)}
                className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                  statusFilter === value
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Liste conversations */}
        <div className="flex-1 overflow-y-auto bg-white">
          {isLoading && (
            <div className="flex items-center justify-center py-20">
              <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
          {error && (
            <div className="p-6 text-center text-red-600 text-sm">
              Erreur de chargement des conversations
            </div>
          )}
          {!isLoading && !error && (
            <ConversationList conversations={filtered} />
          )}
        </div>

        {/* Stats rapides */}
        {!isLoading && conversations.length > 0 && (
          <div className="bg-white border-t border-gray-100 px-6 py-3 flex gap-6">
            <span className="text-xs text-gray-500">
              <strong className="text-gray-900">{conversations.length}</strong> conversation(s)
            </span>
            <span className="text-xs text-gray-500">
              <strong className="text-green-600">
                {conversations.filter((c) => c.status === "qualified").length}
              </strong>{" "}
              qualifiée(s)
            </span>
            <span className="text-xs text-gray-500">
              <strong className="text-red-500">
                {conversations.filter((c) => c.prospect?.score === "hot").length}
              </strong>{" "}
              hot
            </span>
          </div>
        )}
      </main>
    </div>
  );
}
