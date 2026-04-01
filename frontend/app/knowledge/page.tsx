"use client";

import { useState, useRef } from "react";
import useSWR from "swr";
import { Navbar } from "@/components/Navbar";
import { knowledgeApi } from "@/lib/api";
import { Upload, Plus, Trash2, FileText, HelpCircle, X } from "lucide-react";
import type { KnowledgeChunk } from "@/types";

const ARTISAN_ID = process.env.NEXT_PUBLIC_ARTISAN_ID || "";

export default function KnowledgePage() {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showQAForm, setShowQAForm] = useState(false);
  const [qa, setQA] = useState({ question: "", answer: "" });
  const [savingQA, setSavingQA] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: chunks = [], isLoading, mutate } = useSWR(
    ["knowledge", ARTISAN_ID],
    () => knowledgeApi.list(ARTISAN_ID),
    { revalidateOnFocus: false }
  );

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    try {
      const result = await knowledgeApi.uploadPDF(ARTISAN_ID, file);
      await mutate();
      alert(`${result.chunks_created} chunks indexés depuis ${result.filename}`);
    } catch (err: any) {
      setUploadError(err.message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleAddQA = async () => {
    if (!qa.question.trim() || !qa.answer.trim()) return;
    setSavingQA(true);
    try {
      await knowledgeApi.addQA(ARTISAN_ID, qa.question, qa.answer);
      setQA({ question: "", answer: "" });
      setShowQAForm(false);
      await mutate();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSavingQA(false);
    }
  };

  const handleDelete = async (chunkId: string) => {
    if (!confirm("Supprimer ce chunk ?")) return;
    try {
      await knowledgeApi.deleteChunk(ARTISAN_ID, chunkId);
      await mutate();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Grouper par source
  const bySource: Record<string, KnowledgeChunk[]> = {};
  chunks.forEach((c) => {
    const src = c.source_file || "Manuel";
    if (!bySource[src]) bySource[src] = [];
    bySource[src].push(c);
  });

  return (
    <div className="flex h-screen overflow-hidden">
      <Navbar />
      <main className="ml-60 flex-1 overflow-y-auto p-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Base de connaissances</h1>
            <p className="text-gray-500 text-sm">
              Uploadez vos documents (tarifs, catalogue, FAQ) pour que le bot réponde avec précision.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mb-6">
            <label className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 cursor-pointer transition-colors">
              {uploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Indexation...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Importer un PDF
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

            <button
              onClick={() => setShowQAForm(!showQAForm)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Ajouter une Q&A
            </button>
          </div>

          {uploadError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {uploadError}
            </div>
          )}

          {/* Formulaire Q&A */}
          {showQAForm && (
            <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-900 text-sm">Nouvelle Q&A</h2>
                <button onClick={() => setShowQAForm(false)}>
                  <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                </button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Question</label>
                  <input
                    type="text"
                    value={qa.question}
                    onChange={(e) => setQA({ ...qa, question: e.target.value })}
                    placeholder="Ex: Quel est votre délai moyen ?"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Réponse</label>
                  <textarea
                    value={qa.answer}
                    onChange={(e) => setQA({ ...qa, answer: e.target.value })}
                    placeholder="Ex: Notre délai moyen est de 3 à 4 semaines..."
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px] resize-none"
                  />
                </div>
                <button
                  onClick={handleAddQA}
                  disabled={savingQA || !qa.question.trim() || !qa.answer.trim()}
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {savingQA ? "Enregistrement..." : "Ajouter"}
                </button>
              </div>
            </div>
          )}

          {/* Liste chunks */}
          {isLoading ? (
            <div className="flex justify-center py-10">
              <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : chunks.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <FileText className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p className="text-sm">Aucun document indexé</p>
              <p className="text-xs mt-1">Importez un PDF ou ajoutez des Q&A manuellement</p>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(bySource).map(([source, items]) => (
                <div key={source} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                  <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 bg-gray-50">
                    {source === "qa_manuel" ? (
                      <HelpCircle className="w-4 h-4 text-purple-500" />
                    ) : (
                      <FileText className="w-4 h-4 text-blue-500" />
                    )}
                    <span className="text-sm font-medium text-gray-700">{source}</span>
                    <span className="ml-auto text-xs text-gray-400">{items.length} chunk(s)</span>
                  </div>
                  <ul className="divide-y divide-gray-50">
                    {items.map((chunk) => (
                      <li key={chunk.id} className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 group">
                        <p className="flex-1 text-sm text-gray-700 leading-relaxed">{chunk.content}</p>
                        <button
                          onClick={() => handleDelete(chunk.id)}
                          className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-red-400 hover:text-red-600" />
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
