"use client";

import { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  FileText,
  ExternalLink,
  BookOpen,
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
      <div className="h-full min-h-[450px] flex flex-col items-center justify-center bg-[#FFFDF7] border border-[#EADFCF] rounded-xl p-6 text-center text-[#544B4C] shadow-sm">
        <FileText className="w-12 h-12 text-[#9FB2AC] mb-3 stroke-[1.5]" />
        <p className="text-sm font-semibold text-[#1E1517]">No Lease Document Loaded</p>
        <p className="text-xs text-[#807576] mt-1 max-w-xs">Upload a residential lease PDF to view document pages side-by-side with analysis.</p>
      </div>
    );
  }

  const iframeSrc = `${objectUrl}#page=${currentPage}&view=FitH`;

  return (
    <div className="h-full min-h-[600px] flex flex-col bg-[#FFFDF7] border border-[#EADFCF] rounded-xl overflow-hidden shadow-sm">
      {/* Viewer Header Toolbar */}
      <div className="bg-[#F5ECCF] px-4 py-3 border-b border-[#E2D5B7] flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 truncate">
          <div className="w-7 h-7 rounded-md bg-[#5D0D18]/10 border border-[#5D0D18]/20 flex items-center justify-center shrink-0">
            <BookOpen className="w-4 h-4 text-[#5D0D18]" />
          </div>
          <span className="font-semibold text-[#1E1517] truncate max-w-[140px] sm:max-w-[220px]">
            {file.name}
          </span>
        </div>

        {/* Page Navigation Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            className="p-1.5 rounded-md bg-[#FFFDF7] hover:bg-[#EADFCF] text-[#1E1517] border border-[#E2D5B7] disabled:opacity-40 disabled:hover:bg-[#FFFDF7] transition-colors"
            title="Previous Page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-sans text-[#1E1517] text-xs px-1">
            Page <strong className="text-[#5D0D18] font-bold">{currentPage}</strong> of {totalPages || 1}
          </span>
          <button
            type="button"
            disabled={currentPage >= (totalPages || 1)}
            onClick={() => onPageChange(Math.min(totalPages || 1, currentPage + 1))}
            className="p-1.5 rounded-md bg-[#FFFDF7] hover:bg-[#EADFCF] text-[#1E1517] border border-[#E2D5B7] disabled:opacity-40 disabled:hover:bg-[#FFFDF7] transition-colors"
            title="Next Page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <a
            href={objectUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex p-1.5 rounded-md bg-[#FFFDF7] hover:bg-[#EADFCF] text-[#1E1517] border border-[#E2D5B7] transition-colors ml-1"
            title="Open PDF in new tab"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Target Page Jump Active Bar */}
      <div className="bg-[#FAF4E6] px-4 py-1.5 border-b border-[#EADFCF] flex items-center justify-between text-[11px] text-[#2F4C43] font-medium">
        <span>Active View: Page {currentPage}</span>
        <span className="text-[#7A6F70] text-[10px]">Click &apos;View on Page X&apos; on any clause card to jump pages</span>
      </div>

      {/* Embedded Document Container */}
      <div className="flex-1 w-full relative bg-[#FAF7F0] overflow-hidden">
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
