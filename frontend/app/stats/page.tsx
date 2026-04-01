"use client";

import useSWR from "swr";
import { Navbar } from "@/components/Navbar";
import { conversationApi } from "@/lib/api";
import { TrendingUp, Users, CheckCircle, Flame, Mail, MessageSquare, MessageCircle } from "lucide-react";
import type { Conversation } from "@/types";

const ARTISAN_ID = process.env.NEXT_PUBLIC_ARTISAN_ID || "";

export default function StatsPage() {
  const { data: conversations = [], isLoading } = useSWR(
    ["conversations-all", ARTISAN_ID],
    () => conversationApi.list(ARTISAN_ID),
    { revalidateOnFocus: false }
  );

  const total = conversations.length;
  const qualified = conversations.filter((c) => c.status === "qualified").length;
  const hot = conversations.filter((c) => c.prospect?.score === "hot").length;
  const active = conversations.filter((c) => c.status === "active").length;
  const qualRate = total > 0 ? Math.round((qualified / total) * 100) : 0;

  const byChannel = conversations.reduce<Record<string, number>>((acc, c) => {
    acc[c.channel] = (acc[c.channel] || 0) + 1;
    return acc;
  }, {});

  const STAT_CARDS = [
    {
      label: "Total prospects",
      value: total,
      icon: Users,
      color: "text-blue-600 bg-blue-50",
    },
    {
      label: "Qualifiés",
      value: qualified,
      icon: CheckCircle,
      color: "text-green-600 bg-green-50",
    },
    {
      label: "Taux de qualification",
      value: `${qualRate}%`,
      icon: TrendingUp,
      color: "text-purple-600 bg-purple-50",
    },
    {
      label: "Prospects chauds",
      value: hot,
      icon: Flame,
      color: "text-red-600 bg-red-50",
    },
  ];

  const CHANNEL_ICONS = {
    email: Mail,
    sms: MessageSquare,
    whatsapp: MessageCircle,
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Navbar />
      <main className="ml-60 flex-1 overflow-y-auto p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Statistiques</h1>
            <p className="text-gray-500 text-sm">Performance de votre assistant ArtiBot</p>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-10">
              <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {/* KPI Cards */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                {STAT_CARDS.map(({ label, value, icon: Icon, color }) => (
                  <div key={label} className="bg-white border border-gray-200 rounded-xl p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <p className="text-sm text-gray-600 font-medium">{label}</p>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{value}</p>
                  </div>
                ))}
              </div>

              {/* Breakdown par canal */}
              <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
                <h2 className="font-semibold text-gray-900 mb-4">Répartition par canal</h2>
                {Object.keys(byChannel).length === 0 ? (
                  <p className="text-sm text-gray-400">Aucune donnée disponible</p>
                ) : (
                  <div className="space-y-3">
                    {Object.entries(byChannel).map(([channel, count]) => {
                      const Icon = CHANNEL_ICONS[channel as keyof typeof CHANNEL_ICONS] ?? MessageSquare;
                      const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                      return (
                        <div key={channel}>
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <Icon className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-700 capitalize">{channel}</span>
                            </div>
                            <span className="text-sm font-medium text-gray-900">{count} ({pct}%)</span>
                          </div>
                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-500 rounded-full transition-all"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Score distribution */}
              <div className="bg-white border border-gray-200 rounded-xl p-5">
                <h2 className="font-semibold text-gray-900 mb-4">Distribution des scores</h2>
                <div className="flex gap-4">
                  {[
                    { score: "hot", label: "Chaud", color: "bg-red-500", textColor: "text-red-600" },
                    { score: "warm", label: "Tiède", color: "bg-amber-400", textColor: "text-amber-600" },
                    { score: "cold", label: "Froid", color: "bg-slate-300", textColor: "text-slate-500" },
                  ].map(({ score, label, color, textColor }) => {
                    const count = conversations.filter((c) => c.prospect?.score === score).length;
                    const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                    return (
                      <div key={score} className="flex-1 text-center">
                        <div className={`w-4 h-4 rounded-full ${color} mx-auto mb-2`} />
                        <p className={`text-2xl font-bold ${textColor}`}>{count}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{label}</p>
                        <p className="text-xs text-gray-400">{pct}%</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
