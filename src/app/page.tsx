"use client";

import { useState, useRef, ChangeEvent, DragEvent } from "react";
import {
  FileText,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
  FileCheck2,
  ArrowRight,
  ShieldCheck,
  Zap,
} from "lucide-react";

interface ExtractedData {
  fileName: string;
  fileSize: number;
  numPages: number;
  wordCount: number;
  text: string;
  extractedAt: string;
}

export default function Home() {
  const [isDragActive, setIsDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isScannedErr, setIsScannedErr] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper to format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const handleFile = (file: File) => {
    setError(null);
    setIsScannedErr(false);
    setExtractedData(null);

    // Validate file type
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setError("Only PDF documents are supported. Please upload a residential lease PDF.");
      setSelectedFile(null);
      return;
    }

    // Validate file size (15MB max)
    if (file.size > 15 * 1024 * 1024) {
      setError("File size exceeds 15MB. Please upload a smaller lease PDF.");
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const resetAll = () => {
    setSelectedFile(null);
    setIsProcessing(false);
    setError(null);
    setIsScannedErr(false);
    setExtractedData(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const extractText = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setError(null);
    setIsScannedErr(false);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const res = await fetch("/api/extract-pdf", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to extract text from the uploaded PDF.");
        if (data.isScanned) {
          setIsScannedErr(true);
        }
        setIsProcessing(false);
        return;
      }

      setExtractedData({
        fileName: data.fileName,
        fileSize: data.fileSize,
        numPages: data.numPages,
        wordCount: data.wordCount,
        text: data.text,
        extractedAt: data.extractedAt,
      });
    } catch (err: unknown) {
      console.error("Extraction request error:", err);
      setError("Network or server error occurred while extracting PDF text.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-between p-4 sm:p-8 relative overflow-x-hidden font-sans">
      {/* Dynamic glow overlays */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-b from-blue-600/20 via-indigo-600/10 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Navigation / Header */}
      <header className="w-full max-w-5xl flex items-center justify-between py-4 border-b border-slate-800/60 z-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <FileCheck2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">LeaseLens</h1>
            <p className="text-xs text-slate-400 font-medium">Know what you&apos;re signing.</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            M1: Upload & Extraction
          </span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="w-full max-w-3xl my-auto py-10 z-10 space-y-8">
        {/* Title & Introduction */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider">
            <Zap className="w-3.5 h-3.5" /> Fast &amp; Private Document Parser
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
            Upload Your Residential Lease
          </h2>
          <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            Select or drag your lease PDF below. LeaseLens will parse and validate the document text in seconds.
          </p>
        </div>

        {/* State 1: Upload Dropzone & Selection */}
        {!extractedData && (
          <div className="space-y-6">
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,application/pdf"
              onChange={handleFileInputChange}
              className="hidden"
            />

            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={!selectedFile && !isProcessing ? triggerFileSelect : undefined}
              className={`relative border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition-all duration-200 cursor-pointer backdrop-blur-sm ${
                isDragActive
                  ? "border-blue-500 bg-blue-500/10 scale-[1.01]"
                  : selectedFile
                  ? "border-slate-700 bg-slate-900/60 cursor-default"
                  : "border-slate-800 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-900/60"
              }`}
            >
              {!selectedFile ? (
                <div className="space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-blue-600/10 border border-blue-500/20 text-blue-400 mx-auto flex items-center justify-center shadow-inner">
                    <UploadCloud className="w-8 h-8 animate-bounce" />
                  </div>
                  <div>
                    <p className="text-base font-semibold text-slate-200">
                      Drag &amp; drop your lease PDF here
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      or <span className="text-blue-400 font-medium hover:underline">browse files</span> from your computer
                    </p>
                  </div>
                  <div className="pt-2 flex items-center justify-center gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-slate-400" /> PDF Files Only
                    </span>
                    <span>•</span>
                    <span>Max size: 15MB</span>
                  </div>
                </div>
              ) : (
                /* Selected File Box */
                <div className="space-y-6">
                  <div className="flex items-center justify-between bg-slate-950/80 p-4 rounded-xl border border-slate-800 text-left">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5 text-blue-400" />
                      </div>
                      <div className="truncate">
                        <p className="text-sm font-semibold text-slate-200 truncate">
                          {selectedFile.name}
                        </p>
                        <p className="text-xs text-slate-400">
                          {formatFileSize(selectedFile.size)}
                        </p>
                      </div>
                    </div>
                    {!isProcessing && (
                      <button
                        type="button"
                        onClick={resetAll}
                        className="px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-300 text-xs font-medium transition-colors"
                      >
                        Change
                      </button>
                    )}
                  </div>

                  {/* Actions / Processing */}
                  {isProcessing ? (
                    <div className="flex flex-col items-center justify-center space-y-3 py-4">
                      <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                      <p className="text-sm font-medium text-slate-300">
                        Extracting text from lease agreement...
                      </p>
                      <p className="text-xs text-slate-500">
                        Reading pages, validating content, and structuring text.
                      </p>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={extractText}
                      className="w-full py-3.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow-lg shadow-blue-600/25 transition-all flex items-center justify-center gap-2"
                    >
                      Extract Lease Text <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Error Banner */}
            {error && (
              <div className="p-4 rounded-xl bg-red-950/40 border border-red-900/60 text-red-200 text-sm space-y-2 animate-in fade-in duration-200">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-semibold text-red-300">Extraction Notice</p>
                    <p className="text-xs text-red-300/90 leading-relaxed">{error}</p>
                    {isScannedErr && (
                      <p className="text-xs text-red-400/80 pt-1">
                        Tip: LeaseLens requires text-based PDFs. If your lease is a scanned image or photo PDF, convert it using OCR before uploading.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* State 2: Extracted Text Success View */}
        {extractedData && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Summary Metrics Header */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-2xl backdrop-blur-sm space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-100">
                      Extraction Successful
                    </h3>
                    <p className="text-xs text-slate-400 truncate max-w-xs sm:max-w-md">
                      {extractedData.fileName} ({formatFileSize(extractedData.fileSize)})
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={resetAll}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Upload Another PDF
                </button>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/60">
                  <span className="block text-slate-400 text-xs font-medium mb-1">Document Pages</span>
                  <span className="text-xl font-extrabold text-white">{extractedData.numPages}</span>
                </div>
                <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/60">
                  <span className="block text-slate-400 text-xs font-medium mb-1">Extracted Words</span>
                  <span className="text-xl font-extrabold text-white">{extractedData.wordCount.toLocaleString()}</span>
                </div>
                <div className="col-span-2 sm:col-span-1 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/60">
                  <span className="block text-slate-400 text-xs font-medium mb-1">Extraction Status</span>
                  <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1 mt-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Ready for AI
                  </span>
                </div>
              </div>

              {/* Text Preview Window */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                  <span className="font-semibold text-slate-300">Extracted Text Preview</span>
                  <span>First 1,000 characters</span>
                </div>
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 max-h-56 overflow-y-auto leading-relaxed whitespace-pre-wrap select-text">
                  {extractedData.text.slice(0, 1000)}
                  {extractedData.text.length > 1000 && "...\n\n[Remaining text stored in session]"}
                </div>
              </div>
            </div>

            {/* Handoff Banner for M2 */}
            <div className="bg-gradient-to-r from-blue-950/40 via-indigo-950/30 to-slate-900 border border-blue-900/40 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center sm:text-left">
                <p className="text-sm font-bold text-blue-200">
                  Milestone 1 Completed: Text Stored in Client Session
                </p>
                <p className="text-xs text-slate-400">
                  Extracted text is cached and ready to be processed by Gemini AI in Milestone 2.
                </p>
              </div>
              <button
                disabled
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-blue-600/40 text-blue-300 font-medium text-xs border border-blue-500/30 cursor-not-allowed flex items-center justify-center gap-1.5 shrink-0"
              >
                M2: AI Lease Analysis (Next)
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer Disclaimer */}
      <footer className="w-full max-w-5xl py-4 border-t border-slate-800/60 text-center text-xs text-slate-500 z-10 space-y-1">
        <p>
          <strong className="text-slate-400">Legal Disclaimer:</strong> LeaseLens is an informational document-analysis tool. It does not provide legal advice or definitive legal conclusions.
        </p>
        <p className="text-[11px] text-slate-600">
          LeaseLens — Hackathon Project Foundation
        </p>
      </footer>
    </div>
  );
}
