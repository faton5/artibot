"use client";

import useSWR from "swr";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { ConversationView } from "@/components/ConversationView";
import { ProspectSidebar } from "@/components/ProspectSidebar";
import { conversationApi } from "@/lib/api";
import { ArrowLeft } from "lucide-react";

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
    <div className="flex h-screen overflow-hidden">
      <Navbar />

      <main
        className="flex-1 flex min-w-0"
        style={{ marginLeft: "var(--sidebar-w)" }}
      >
        {isLoading && (
          <div className="flex-1 flex items-center justify-center">
            <div
              className="w-5 h-5 rounded-full border-2"
              style={{ borderColor: "var(--forge-100)", borderTopColor: "#ea580c", animation: "spin 0.7s linear infinite" }}
            />
          </div>
        )}

        {error && (
          <div className="flex-1 flex flex-col items-center justify-center gap-3">
            <p className="text-[13px]" style={{ color: "#dc2626" }}>
              Conversation introuvable
            </p>
            <Link
              href="/dashboard"
              className="text-[13px] font-medium"
              style={{ color: "#ea580c" }}
            >
              ← Retour au dashboard
            </Link>
          </div>
        )}

        {conversation && (
          <>
            <div className="flex-1 flex flex-col min-w-0">
              {/* Breadcrumb */}
              <div
                className="px-5 py-2.5 flex-shrink-0"
                style={{ background: "var(--surface)", borderBottom: "1px solid var(--forge-100)" }}
              >
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-1.5 text-[12px] font-medium transition-colors"
                  style={{ color: "var(--forge-500)" }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--forge-900)")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--forge-500)")}
                >
                  <ArrowLeft className="w-3 h-3" />
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
