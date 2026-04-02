"use client";

import { useState, useRef } from "react";
import useSWR from "swr";
import { Navbar } from "@/components/Navbar";
import { useCurrentArtisan } from "@/hooks/useCurrentArtisan";
import { knowledgeApi } from "@/lib/api";
import { Upload, Plus, Trash2, FileText, HelpCircle, X, CheckCircle } from "lucide-react";
import type { KnowledgeChunk } from "@/types";

export default function KnowledgePage() {
  const { artisanId } = useCurrentArtisan();
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [showQAForm, setShowQAForm] = useState(false);
  const [qa, setQA] = useState({ question: "", answer: "" });
  const [savingQA, setSavingQA] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: chunks = [], isLoading, mutate } = useSWR(
    artisanId ? ["knowledge", artisanId] : null,
    () => knowledgeApi.list(artisanId as string),
    { revalidateOnFocus: false }
  );

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !artisanId) return;
    setUploading(true);
    setUploadError(null);
    setUploadSuccess(null);
    try {
      const result = await knowledgeApi.uploadPDF(artisanId, file);
      await mutate();
      setUploadSuccess(`${result.chunks_created} chunks indexés depuis "${result.filename}"`);
      setTimeout(() => setUploadSuccess(null), 4000);
    } catch (err: any) {
      setUploadError(err.message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleAddQA = async () => {
    if (!qa.question.trim() || !qa.answer.trim() || !artisanId) return;
    setSavingQA(true);
    try {
      await knowledgeApi.addQA(artisanId, qa.question, qa.answer);
      setQA({ question: "", answer: "" });
      setShowQAForm(false);
      await mutate();
    } catch (err: any) {
      setUploadError(err.message);
    } finally {
      setSavingQA(false);
    }
  };

  const handleDelete = async (chunkId: string) => {
    if (!artisanId) return;
    try {
      await knowledgeApi.deleteChunk(artisanId, chunkId);
      await mutate();
    } catch (err: any) {
      setUploadError(err.message);
    }
  };

  const bySource: Record<string, KnowledgeChunk[]> = {};
  chunks.forEach((c) => {
    const src = c.source_file || "Manuel";
    if (!bySource[src]) bySource[src] = [];
    bySource[src].push(c);
  });

  return (
    <div className="flex h-screen overflow-hidden">
      <Navbar />

      <main
        className="flex-1 overflow-y-auto"
        style={{ marginLeft: "var(--sidebar-w)", background: "var(--canvas)" }}
      >
        {/* Header */}
        <div
          className="px-8 py-6"
          style={{ background: "var(--surface)", borderBottom: "1px solid var(--forge-100)" }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h1
                className="text-[20px] font-display"
                style={{ fontWeight: 800, color: "var(--forge-900)" }}
              >
                Base de connaissance
              </h1>
              <p className="text-[13px] mt-0.5" style={{ color: "var(--forge-400)" }}>
                {chunks.length > 0
                  ? `${chunks.length} chunk${chunks.length > 1 ? "s" : ""} indexés — le bot s'en sert pour répondre`
                  : "Uploadez vos documents pour que le bot réponde avec précision"}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowQAForm(!showQAForm)}
                className="btn-outline"
              >
                <Plus className="w-4 h-4" />
                Ajouter Q&A
              </button>
              <label className="btn-amber cursor-pointer">
                {uploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full" style={{ animation: "spin 0.8s linear infinite" }} />
                    Indexation…
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Importer PDF
                  </>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={uploading}
                />
              </label>
            </div>
          </div>
        </div>

        <div className="px-8 py-6 max-w-3xl mx-auto">
          {/* Notifications */}
          {uploadSuccess && (
            <div
              className="flex items-center gap-3 p-4 rounded-xl mb-5 animate-fade-up"
              style={{ background: "#f0fdf4", border: "1px solid #bbf7d0" }}
            >
              <CheckCircle className="w-4 h-4 flex-shrink-0" style={{ color: "#16a34a" }} />
              <p className="text-[13px]" style={{ color: "#15803d" }}>{uploadSuccess}</p>
            </div>
          )}
          {uploadError && (
            <div
              className="flex items-center justify-between gap-3 p-4 rounded-xl mb-5 animate-fade-up"
              style={{ background: "#fef2f2", border: "1px solid #fecaca" }}
            >
              <p className="text-[13px]" style={{ color: "#dc2626" }}>{uploadError}</p>
              <button onClick={() => setUploadError(null)}>
                <X className="w-4 h-4" style={{ color: "#dc2626" }} />
              </button>
            </div>
          )}

          {/* Q&A Form */}
          {showQAForm && (
            <div
              className="rounded-2xl p-5 mb-5 animate-fade-up"
              style={{ background: "var(--surface)", border: "1px solid var(--forge-100)" }}
            >
              <div className="flex items-center justify-between mb-4">
                <p
                  className="text-[14px] font-display"
                  style={{ fontWeight: 700, color: "var(--forge-900)" }}
                >
                  Nouvelle Q&A
                </p>
                <button
                  onClick={() => setShowQAForm(false)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg transition-colors"
                  style={{ color: "var(--forge-400)" }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "var(--forge-50)")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="space-y-3">
                <div>
                  <label
                    className="block text-[11px] font-semibold mb-1.5 uppercase tracking-wide"
                    style={{ color: "var(--forge-500)" }}
                  >
                    Question
                  </label>
                  <input
                    type="text"
                    value={qa.question}
                    onChange={(e) => setQA({ ...qa, question: e.target.value })}
                    placeholder="Ex : Quel est votre délai moyen ?"
                    className="forge-input"
                  />
                </div>
                <div>
                  <label
                    className="block text-[11px] font-semibold mb-1.5 uppercase tracking-wide"
                    style={{ color: "var(--forge-500)" }}
                  >
                    Réponse
                  </label>
                  <textarea
                    value={qa.answer}
                    onChange={(e) => setQA({ ...qa, answer: e.target.value })}
                    placeholder="Ex : Notre délai moyen est de 3 à 4 semaines…"
                    className="forge-input resize-none"
                    style={{ minHeight: "80px", paddingTop: "10px" }}
                  />
                </div>
                <button
                  onClick={handleAddQA}
                  disabled={savingQA || !qa.question.trim() || !qa.answer.trim()}
                  className="btn-primary disabled:opacity-50"
                >
                  {savingQA ? "Enregistrement…" : "Ajouter"}
                </button>
              </div>
            </div>
          )}

          {/* Chunks */}
          {isLoading ? (
            <div className="flex justify-center py-20">
              <div
                className="w-5 h-5 rounded-full border-2"
                style={{ borderColor: "var(--forge-100)", borderTopColor: "#ea580c", animation: "spin 0.7s linear infinite" }}
              />
            </div>
          ) : chunks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
                style={{ background: "var(--forge-50)" }}
              >
                📄
              </div>
              <p className="text-[14px] font-semibold" style={{ color: "var(--forge-900)" }}>
                Aucun document indexé
              </p>
              <p className="text-[13px]" style={{ color: "var(--forge-400)" }}>
                Importez un PDF ou ajoutez des Q&A manuellement pour commencer.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {Object.entries(bySource).map(([source, items], i) => (
                <div
                  key={source}
                  className="rounded-2xl overflow-hidden animate-fade-up"
                  style={{
                    background: "var(--surface)",
                    border: "1px solid var(--forge-100)",
                    animationDelay: `${i * 50}ms`,
                    animationFillMode: "both",
                  }}
                >
                  {/* Source header */}
                  <div
                    className="flex items-center gap-2.5 px-4 py-3"
                    style={{ borderBottom: "1px solid var(--forge-50)", background: "var(--forge-50)" }}
                  >
                    {source === "qa_manuel" ? (
                      <HelpCircle className="w-4 h-4 flex-shrink-0" style={{ color: "#7c3aed" }} />
                    ) : (
                      <FileText className="w-4 h-4 flex-shrink-0" style={{ color: "#ea580c" }} />
                    )}
                    <span
                      className="text-[12px] font-semibold"
                      style={{ color: "var(--forge-700)" }}
                    >
                      {source === "qa_manuel" ? "Q&A manuelles" : source}
                    </span>
                    <span
                      className="ml-auto text-[11px] font-medium px-2 py-0.5 rounded-full"
                      style={{ background: "var(--forge-100)", color: "var(--forge-500)" }}
                    >
                      {items.length} chunk{items.length > 1 ? "s" : ""}
                    </span>
                  </div>

                  {/* Items */}
                  <ul>
                    {items.map((chunk) => (
                      <li
                        key={chunk.id}
                        className="flex items-start gap-3 px-4 py-3 group transition-colors"
                        style={{ borderBottom: "1px solid var(--forge-50)" }}
                        onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "var(--canvas)")}
                        onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}
                      >
                        <p
                          className="flex-1 text-[12px] leading-relaxed"
                          style={{ color: "var(--forge-700)" }}
                        >
                          {chunk.content}
                        </p>
                        <button
                          onClick={() => handleDelete(chunk.id)}
                          className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 flex items-center justify-center rounded-lg"
                          style={{ color: "#dc2626" }}
                          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "#fef2f2")}
                          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
