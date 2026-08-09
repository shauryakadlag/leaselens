"use client";

import { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  FileText,
  ExternalLink,
  ZoomIn,
  ZoomOut,
  Maximize2,
} from "lucide-react";

interface PDFViewerProps {
  file: File | null;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function PDFViewer({
  file,
  currentPage,
  totalPages,
  onPageChange,
}: PDFViewerProps) {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setObjectUrl(url);
      return () => {
        URL.revokeObjectURL(url);
      };
    } else {
      setObjectUrl(null);
    }
  }, [file]);

  if (!file || !objectUrl) {
    return (
      <div className="h-full min-h-[450px] flex flex-col items-center justify-center bg-slate-950 border border-slate-800 rounded-2xl p-6 text-center text-slate-400">
        <FileText className="w-12 h-12 text-slate-600 mb-2" />
        <p className="text-sm font-medium">No PDF loaded for viewing</p>
      </div>
    );
  }

  const iframeSrc = `${objectUrl}#page=${currentPage}&view=FitH`;

  return (
    <div className="h-full min-h-[600px] flex flex-col bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-sm">
      {/* Viewer Header Toolbar */}
      <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 truncate">
          <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
            <FileText className="w-4 h-4 text-blue-400" />
          </div>
          <span className="font-semibold text-slate-200 truncate max-w-[140px] sm:max-w-[200px]">
            {file.name}
          </span>
        </div>

        {/* Page Navigation Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 disabled:hover:bg-slate-800 transition-colors"
            title="Previous Page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-mono text-slate-300 text-xs px-1">
            Page <strong className="text-white font-bold">{currentPage}</strong> of {totalPages || 1}
          </span>
          <button
            type="button"
            disabled={currentPage >= (totalPages || 1)}
            onClick={() => onPageChange(Math.min(totalPages || 1, currentPage + 1))}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 disabled:hover:bg-slate-800 transition-colors"
            title="Next Page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <a
            href={objectUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors ml-1"
            title="Open PDF in new tab"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Target Page Jump Active Pill */}
      <div className="bg-blue-950/60 px-4 py-1.5 border-b border-blue-900/30 flex items-center justify-between text-[11px] text-blue-300 font-medium">
        <span>Active View: Page {currentPage}</span>
        <span className="text-slate-400 text-[10px]">Use flagged clause buttons to jump directly to target pages</span>
      </div>

      {/* Embedded Document Container */}
      <div className="flex-1 w-full relative bg-slate-950 overflow-hidden">
        <iframe
          key={`${objectUrl}-page-${currentPage}`}
          src={iframeSrc}
          className="w-full h-full border-0 min-h-[520px]"
          title={`Lease Document Viewer - Page ${currentPage}`}
        />
      </div>
    </div>
  );
}
