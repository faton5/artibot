import type {
  Artisan, ArtisanConfig, CitySuggestion, Conversation,
  KnowledgeChunk, Rapport, ProspectWithConversation,
  RapportWithMeta, ReadinessStatus,
} from "@/types";

// In the browser use relative URLs so Next.js rewrites proxy to the backend.
// On the server (SSR) use the full internal URL.
const API_BASE =
  typeof window === "undefined"
    ? (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000")
    : "";

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(error.detail || `HTTP ${res.status}`);
  }
  return res.json();
}

// ── Artisans ──────────────────────────────────────────────────────────────────

export const artisanApi = {
  get: (id: string) => apiFetch<Artisan>(`/api/artisans/${id}`),

  getByClerkId: (clerkUserId: string) =>
    apiFetch<Artisan>(`/api/artisans/by-clerk/${clerkUserId}`),

  create: (data: { name: string; email: string; config_json?: ArtisanConfig; clerk_user_id?: string }) =>
    apiFetch<Artisan>("/api/artisans", { method: "POST", body: JSON.stringify(data) }),

  update: (id: string, data: { name?: string; config_json?: ArtisanConfig }) =>
    apiFetch<Artisan>(`/api/artisans/${id}`, { method: "PUT", body: JSON.stringify(data) }),

  connectGmail: (id: string) =>
    apiFetch<{ auth_url: string; state: string }>(`/api/artisans/${id}/gmail/connect`, {
      method: "POST",
    }),

  disconnectGmail: (id: string) =>
    apiFetch<{ status: string }>(`/api/artisans/${id}/gmail/disconnect`, { method: "DELETE" }),
};

// ── Conversations ─────────────────────────────────────────────────────────────

export const conversationApi = {
  list: (artisanId: string, status?: string) => {
    const params = new URLSearchParams({ artisan_id: artisanId });
    if (status) params.append("status", status);
    return apiFetch<Conversation[]>(`/api/conversations?${params}`);
  },

  get: (id: string) => apiFetch<Conversation>(`/api/conversations/${id}`),

  takeover: (id: string) =>
    apiFetch<{ status: string }>(`/api/conversations/${id}/takeover`, { method: "POST" }),

  resumeBot: (id: string) =>
    apiFetch<{ status: string }>(`/api/conversations/${id}/resume_bot`, { method: "POST" }),

  reply: (id: string, content: string) =>
    apiFetch<{ status: string }>(`/api/conversations/${id}/reply`, {
      method: "POST",
      body: JSON.stringify({ content }),
    }),

  close: (id: string) =>
    apiFetch<{ status: string }>(`/api/conversations/${id}/close`, { method: "POST" }),

  getReport: (id: string) => apiFetch<Rapport>(`/api/conversations/${id}/report`),
};

// ── Knowledge ─────────────────────────────────────────────────────────────────

export const knowledgeApi = {
  list: (artisanId: string) =>
    apiFetch<KnowledgeChunk[]>(`/api/artisans/${artisanId}/knowledge`),

  uploadPDF: async (artisanId: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const base = typeof window === "undefined" ? (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000") : "";
    const res = await fetch(`${base}/api/artisans/${artisanId}/knowledge/upload`, {
      method: "POST",
      body: formData,
    });
    if (!res.ok) throw new Error((await res.json()).detail);
    return res.json() as Promise<{ chunks_created: number; filename: string }>;
  },

  addQA: (artisanId: string, question: string, answer: string) =>
    apiFetch<{ status: string }>(`/api/artisans/${artisanId}/knowledge/qa`, {
      method: "POST",
      body: JSON.stringify({ question, answer }),
    }),

  deleteChunk: (artisanId: string, chunkId: string) =>
    apiFetch<{ status: string }>(`/api/artisans/${artisanId}/knowledge/${chunkId}`, {
      method: "DELETE",
    }),
};

// ── Prospects ─────────────────────────────────────────────────────────────────

export const prospectApi = {
  list: (artisanId: string) =>
    apiFetch<ProspectWithConversation[]>(`/api/artisans/${artisanId}/prospects`),
};

// ── Reports ───────────────────────────────────────────────────────────────────

export const reportApi = {
  list: (artisanId: string) =>
    apiFetch<RapportWithMeta[]>(`/api/artisans/${artisanId}/reports`),
};

// ── Readiness ─────────────────────────────────────────────────────────────────

export const readinessApi = {
  get: (artisanId: string) =>
    apiFetch<ReadinessStatus>(`/api/artisans/${artisanId}/readiness`),
};

// ── Geo ───────────────────────────────────────────────────────────────────────

export const geoApi = {
  searchCities: (query: string, limit = 8) =>
    apiFetch<CitySuggestion[]>(`/api/geo/cities?q=${encodeURIComponent(query)}&limit=${limit}`),
};
