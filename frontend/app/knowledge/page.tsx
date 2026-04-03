"use client";

import { useState, useRef } from "react";
import useSWR from "swr";
import { Navbar } from "@/components/Navbar";
import { useCurrentArtisan } from "@/hooks/useCurrentArtisan";
import { knowledgeApi } from "@/lib/api";
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
    <div className="flex min-h-screen" style={{ background: "#f8f9fa" }}>
      <Navbar />

      <main className="flex-1" style={{ marginLeft: "var(--sidebar-w)" }}>
        {/* Top bar */}
        <header className="flex justify-between items-center h-16 px-8 sticky top-0 z-40"
          style={{ background: "rgba(248,249,250,0.85)", backdropFilter: "blur(12px)", borderBottom: "1px solid #e7e8e9" }}>
          <div className="flex-1" />
          <div className="flex items-center gap-4">
            <button className="relative text-slate-500 hover:text-orange-600 transition-colors">
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-0 right-0 w-2 h-2 rounded-full" style={{ background: "#904d00" }} />
            </button>
          </div>
        </header>

        <div className="p-8 max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-extrabold font-headline tracking-tight" style={{ color: "#191c1d" }}>Base de connaissances</h1>
              <p className="text-sm mt-1" style={{ color: "#564334" }}>
                {chunks.length > 0
                  ? `${chunks.length} chunk${chunks.length > 1 ? "s" : ""} indexés — le bot s'en sert pour répondre`
                  : "Uploadez vos documents pour que le bot réponde avec précision"}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => setShowQAForm(!showQAForm)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
                style={{ background: "#ffffff", color: "#191c1d", border: "1.5px solid #e7e8e9" }}>
                <span className="material-symbols-outlined text-base">add</span>
                Ajouter Q&A
              </button>
              <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white cursor-pointer transition-all"
                style={{ background: "#904d00", boxShadow: "0 2px 8px rgba(144,77,0,0.2)" }}>
                {uploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full" style={{ animation: "spin 0.8s linear infinite" }} />
                    Indexation…
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-base">upload_file</span>
                    Importer PDF
                  </>
                )}
                <input ref={fileInputRef} type="file" accept=".pdf" onChange={handleFileUpload} className="hidden" disabled={uploading} />
              </label>
            </div>
          </div>

          {/* Notifications */}
          {uploadSuccess && (
            <div className="flex items-center gap-3 p-4 rounded-xl mb-5 animate-fade-up" style={{ background: "#c7e7ff", border: "1px solid #00b5fc" }}>
              <span className="material-symbols-outlined" style={{ color: "#004360", fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              <p className="text-sm" style={{ color: "#004360" }}>{uploadSuccess}</p>
            </div>
          )}
          {uploadError && (
            <div className="flex items-center justify-between gap-3 p-4 rounded-xl mb-5 animate-fade-up" style={{ background: "#ffdad6", border: "1px solid #ff8c00" }}>
              <p className="text-sm" style={{ color: "#93000a" }}>{uploadError}</p>
              <button onClick={() => setUploadError(null)}>
                <span className="material-symbols-outlined text-base" style={{ color: "#93000a" }}>close</span>
              </button>
            </div>
          )}

          {/* Q&A Form */}
          {showQAForm && (
            <div className="rounded-2xl p-6 mb-6 animate-fade-up" style={{ background: "#ffffff" }}>
              <div className="flex items-center justify-between mb-4">
                <p className="text-base font-bold font-headline" style={{ color: "#191c1d" }}>Nouvelle Q&A</p>
                <button onClick={() => setShowQAForm(false)} className="w-7 h-7 flex items-center justify-center rounded-lg transition-colors hover:bg-surface-container-low">
                  <span className="material-symbols-outlined text-base" style={{ color: "#564334" }}>close</span>
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold mb-1.5 uppercase tracking-widest" style={{ color: "#564334" }}>Question</label>
                  <input type="text" value={qa.question} onChange={(e) => setQA({ ...qa, question: e.target.value })}
                    placeholder="Ex : Quel est votre délai moyen ?"
                    className="w-full px-3 py-2.5 text-sm rounded-xl outline-none"
                    style={{ background: "#f3f4f5", border: "1.5px solid #e7e8e9", color: "#191c1d" }} />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1.5 uppercase tracking-widest" style={{ color: "#564334" }}>Réponse</label>
                  <textarea value={qa.answer} onChange={(e) => setQA({ ...qa, answer: e.target.value })}
                    placeholder="Ex : Notre délai moyen est de 3 à 4 semaines…"
                    className="w-full px-3 py-2.5 text-sm rounded-xl outline-none resize-none"
                    style={{ background: "#f3f4f5", border: "1.5px solid #e7e8e9", color: "#191c1d", minHeight: "80px" }} />
                </div>
                <button onClick={handleAddQA} disabled={savingQA || !qa.question.trim() || !qa.answer.trim()}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
                  style={{ background: "#904d00" }}>
                  {savingQA ? "Enregistrement…" : "Ajouter"}
                </button>
              </div>
            </div>
          )}

          {/* Chunks */}
          {isLoading ? (
            <div className="flex justify-center py-20">
              <div className="w-6 h-6 rounded-full border-2" style={{ borderColor: "#e7e8e9", borderTopColor: "#904d00", animation: "spin 0.7s linear infinite" }} />
            </div>
          ) : chunks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4 rounded-2xl" style={{ background: "#ffffff" }}>
              <span className="material-symbols-outlined text-5xl" style={{ color: "#ddc1ae" }}>description</span>
              <p className="text-base font-semibold" style={{ color: "#191c1d" }}>Aucun document indexé</p>
              <p className="text-sm" style={{ color: "#564334" }}>Importez un PDF ou ajoutez des Q&A manuellement pour commencer.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {Object.entries(bySource).map(([source, items], i) => (
                <div key={source} className="rounded-2xl overflow-hidden animate-fade-up"
                  style={{ background: "#ffffff", animationDelay: `${i * 50}ms`, animationFillMode: "both" }}>
                  {/* Source header */}
                  <div className="flex items-center gap-2.5 px-4 py-3" style={{ background: "#f3f4f5", borderBottom: "1px solid #e7e8e9" }}>
                    <span className="material-symbols-outlined text-base" style={{ color: source === "qa_manuel" ? "#00658f" : "#904d00", fontVariationSettings: "'FILL' 1" }}>
                      {source === "qa_manuel" ? "quiz" : "description"}
                    </span>
                    <span className="text-sm font-semibold" style={{ color: "#191c1d" }}>
                      {source === "qa_manuel" ? "Q&A manuelles" : source}
                    </span>
                    <span className="ml-auto text-xs font-medium px-2 py-0.5 rounded-full" style={{ background: "#e7e8e9", color: "#564334" }}>
                      {items.length} chunk{items.length > 1 ? "s" : ""}
                    </span>
                  </div>
                  <ul>
                    {items.map((chunk) => (
                      <li key={chunk.id} className="flex items-start gap-3 px-4 py-3 group transition-colors"
                        style={{ borderBottom: "1px solid #f3f4f5" }}
                        onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "#f8f9fa")}
                        onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}>
                        <p className="flex-1 text-sm leading-relaxed" style={{ color: "#564334" }}>{chunk.content}</p>
                        <button onClick={() => handleDelete(chunk.id)}
                          className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity w-7 h-7 flex items-center justify-center rounded-lg"
                          style={{ color: "#ba1a1a" }}
                          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "#ffdad6")}
                          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}>
                          <span className="material-symbols-outlined text-sm">delete</span>
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
