import React, { useEffect, useState } from 'react';
import {
  FolderGit2,
  UploadCloud,
  FileText,
  Trash2,
  Search,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  RotateCw,
} from 'lucide-react';
import { StatusBadge } from '../components/StatusBadge';
import { documentsApi } from '../services/api';
import type { DocumentItem } from '../types';

export const DocumentLibraryPage: React.FC = () => {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // RAG Search State
  const [ragQuery, setRagQuery] = useState('');
  const [ragSearching, setRagSearching] = useState(false);
  const [ragResults, setRagResults] = useState<any[]>([]);

  const loadDocs = async () => {
    try {
      const docs = await documentsApi.list();
      setDocuments(docs);
    } catch (e) {
      console.error('Failed to load documents:', e);
    }
  };

  useEffect(() => {
    loadDocs();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setUploadError('Only PDF files are supported.');
      return;
    }

    setUploading(true);
    setUploadError(null);
    try {
      await documentsApi.upload(file);
      await loadDocs();
    } catch (err: any) {
      setUploadError(err?.response?.data?.detail || 'Failed to upload and index document.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDelete = async (docId: string) => {
    if (!confirm('Are you sure you want to remove this document and its vector embeddings?')) return;
    try {
      await documentsApi.delete(docId);
      await loadDocs();
    } catch (e) {
      console.error('Failed to delete document:', e);
    }
  };

  const handleRagSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ragQuery.trim()) return;

    setRagSearching(true);
    try {
      const res = await documentsApi.queryRag(ragQuery);
      setRagResults(res.results || []);
    } catch (e) {
      console.error('RAG query error:', e);
    } finally {
      setRagSearching(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-slate-800/80 pb-5">
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center space-x-2">
          <FolderGit2 className="w-6 h-6 text-indigo-400" />
          <span>Research Document Library & RAG</span>
        </h1>
        <p className="mt-1 text-xs text-slate-400">
          Upload PDF research papers. Automatically extracted with PyMuPDF, embedded via SentenceTransformers, and indexed in Qdrant.
        </p>
      </div>

      {/* Upload Zone */}
      <div className="rounded-2xl border-2 border-dashed border-slate-700 hover:border-blue-500 bg-slate-900/40 p-8 text-center transition-all">
        <UploadCloud className="mx-auto h-10 w-10 text-slate-400 mb-3" />
        <h3 className="text-sm font-semibold text-white">Upload Research Papers (PDF)</h3>
        <p className="text-xs text-slate-400 mt-1">PyMuPDF text extraction • 384-dim semantic embeddings • Qdrant indexing</p>

        {uploadError && (
          <div className="mt-4 mx-auto max-w-md flex items-center space-x-2 rounded-lg border border-rose-800 bg-rose-950/40 p-2.5 text-xs text-rose-300">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{uploadError}</span>
          </div>
        )}

        <div className="mt-4">
          <label className="inline-flex items-center space-x-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white shadow hover:bg-blue-500 cursor-pointer transition-colors">
            {uploading ? (
              <>
                <RotateCw className="w-4 h-4 animate-spin" />
                <span>Processing & Indexing...</span>
              </>
            ) : (
              <>
                <FileText className="w-4 h-4" />
                <span>Select PDF Document</span>
              </>
            )}
            <input
              type="file"
              accept=".pdf"
              disabled={uploading}
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Interactive RAG Paper Query Bar */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
        <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-slate-300">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span>Ask Questions Across Indexed Papers (Semantic Retrieval)</span>
        </div>

        <form onSubmit={handleRagSearch} className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
            <input
              type="text"
              value={ragQuery}
              onChange={(e) => setRagQuery(e.target.value)}
              placeholder="Query conceptual definitions, benchmark metrics, or architectures from uploaded PDFs..."
              className="w-full rounded-xl border border-slate-700 bg-slate-950/80 py-2.5 pl-10 pr-4 text-xs text-slate-100 placeholder-slate-500 focus:border-purple-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={ragSearching}
            className="rounded-xl bg-purple-600 px-5 py-2.5 text-xs font-semibold text-white shadow hover:bg-purple-500 transition-colors disabled:opacity-50"
          >
            {ragSearching ? 'Searching...' : 'Retrieve'}
          </button>
        </form>

        {ragResults.length > 0 && (
          <div className="space-y-2.5 pt-2 border-t border-slate-800">
            <div className="text-xs font-semibold text-slate-400">
              Semantic Search Hits ({ragResults.length} matches):
            </div>
            {ragResults.map((hit, idx) => (
              <div key={idx} className="p-3 rounded-lg border border-slate-800 bg-slate-950/60 text-xs space-y-1">
                <div className="flex items-center justify-between text-slate-400 font-mono text-[11px]">
                  <span>
                    {hit.document_name} • Page {hit.page_number}
                  </span>
                  <span className="text-emerald-400 font-bold">Similarity: {(hit.score * 100).toFixed(1)}%</span>
                </div>
                <p className="text-slate-200 leading-relaxed italic">"{hit.text}"</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Uploaded Documents Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 overflow-hidden">
        <div className="border-b border-slate-800 px-5 py-3.5 text-xs font-semibold text-white">
          Indexed Research Documents ({documents.length})
        </div>

        {documents.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            No research papers uploaded yet. Upload a PDF above to enable semantic vector querying.
          </div>
        ) : (
          <div className="divide-y divide-slate-800/70">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-4 px-5 hover:bg-slate-800/30 transition-colors gap-4"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-blue-400 shrink-0" />
                    <span className="text-xs font-semibold text-slate-200 truncate">
                      {doc.original_name}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3 text-[11px] text-slate-500 font-mono">
                    <span>{(doc.file_size_bytes / (1024 * 1024)).toFixed(2)} MB</span>
                    <span>•</span>
                    <span>{doc.page_count} Pages</span>
                    <span>•</span>
                    <span>{doc.chunk_count} Vector Chunks</span>
                  </div>
                </div>

                <div className="flex items-center space-x-4 shrink-0">
                  <StatusBadge status={doc.indexing_status} size="sm" />
                  <button
                    onClick={() => handleDelete(doc.id)}
                    title="Delete Document"
                    className="p-1.5 text-slate-500 hover:text-rose-400 rounded hover:bg-slate-800 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
