"use client";

import useSWR from "swr";
import { Navbar } from "@/components/Navbar";
import { ConversationView } from "@/components/ConversationView";
import { ProspectSidebar } from "@/components/ProspectSidebar";
import { conversationApi } from "@/lib/api";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

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

      <main className="ml-60 flex-1 flex min-w-0">
        {isLoading && (
          <div className="flex-1 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {error && (
          <div className="flex-1 flex flex-col items-center justify-center gap-3">
            <p className="text-red-600 text-sm">Conversation introuvable</p>
            <Link href="/dashboard" className="text-blue-600 text-sm hover:underline">
              Retour au dashboard
            </Link>
          </div>
        )}

        {conversation && (
          <>
            {/* Zone principale conversation */}
            <div className="flex-1 flex flex-col min-w-0">
              {/* Breadcrumb */}
              <div className="px-4 py-2 border-b border-gray-100 bg-gray-50">
                <Link
                  href="/dashboard"
                  className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 w-fit"
                >
                  <ArrowLeft className="w-3 h-3" />
                  Toutes les conversations
                </Link>
              </div>

              <ConversationView conversation={conversation} onUpdate={() => mutate()} />
            </div>

            {/* Sidebar prospect */}
            <ProspectSidebar conversation={conversation} />
          </>
        )}
      </main>
    </div>
  );
}
