"use client";

import useSWR from "swr";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { ConversationView } from "@/components/ConversationView";
import { ProspectSidebar } from "@/components/ProspectSidebar";
import { conversationApi } from "@/lib/api";

interface Props {
  params: { id: string };
}

export default function ConversationPage({ params }: Props) {
  const { data: conversation, isLoading, error, mutate } = useSWR(
    ["conversation", params.id],
    () => conversationApi.get(params.id),
    { refreshInterval: 3000 }
  );

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "#f8f9fa" }}>
      <Navbar />

      <main className="flex-1 flex min-w-0" style={{ marginLeft: "var(--sidebar-w)" }}>
        {isLoading && (
          <div className="flex-1 flex items-center justify-center">
            <div className="w-6 h-6 rounded-full border-2" style={{ borderColor: "#e7e8e9", borderTopColor: "#904d00", animation: "spin 0.7s linear infinite" }} />
          </div>
        )}

        {error && (
          <div className="flex-1 flex flex-col items-center justify-center gap-3">
            <span className="material-symbols-outlined text-4xl" style={{ color: "#ddc1ae" }}>error</span>
            <p className="text-sm" style={{ color: "#ba1a1a" }}>Conversation introuvable</p>
            <Link href="/dashboard" className="text-sm font-semibold" style={{ color: "#904d00" }}>
              ← Retour au dashboard
            </Link>
          </div>
        )}

        {conversation && (
          <>
            <div className="flex-1 flex flex-col min-w-0">
              {/* Breadcrumb */}
              <div className="px-5 py-3 flex-shrink-0" style={{ background: "rgba(248,249,250,0.85)", backdropFilter: "blur(12px)", borderBottom: "1px solid #e7e8e9" }}>
                <Link href="/dashboard"
                  className="inline-flex items-center gap-1.5 text-sm font-medium transition-colors"
                  style={{ color: "#564334" }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#904d00")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "#564334")}>
                  <span className="material-symbols-outlined text-base">arrow_back</span>
                  Toutes les conversations
                </Link>
              </div>

              <ConversationView conversation={conversation} onUpdate={() => mutate()} />
            </div>

            <ProspectSidebar conversation={conversation} />
          </>
        )}
      </main>
    </div>
  );
}
