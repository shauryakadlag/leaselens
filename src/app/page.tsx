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
  Sparkles,
  AlertTriangle,
  Calendar,
  DollarSign,
  Info,
  ChevronDown,
  ChevronUp,
  BookOpen,
  LayoutDashboard,
  Target,
  MessageSquare,
} from "lucide-react";
import { LeaseAnalysisResult, FlaggedClause } from "./api/analyze-lease/route";
import PDFViewer from "./components/PDFViewer";
import AskMyLease from "./components/AskMyLease";

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
  const [isExtracting, setIsExtracting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Client Session State
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [analysisResult, setAnalysisResult] = useState<LeaseAnalysisResult | null>(null);
  const [expandedClauseId, setExpandedClauseId] = useState<string | null>(null);

  // M3/M4: Split Screen, Exact Page Navigation & Active Section Tabs
  const [pdfPage, setPdfPage] = useState<number>(1);
  const [mobileTab, setMobileTab] = useState<"dashboard" | "pdf">("dashboard");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const handleFile = (file: File) => {
    setError(null);
    setExtractedData(null);
    setAnalysisResult(null);
    setPdfPage(1);

    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setError("Only PDF documents are supported. Please upload a residential lease PDF.");
      setSelectedFile(null);
      return;
    }

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

    if (e.target && (e as any).dataTransfer?.files?.length > 0) {
      handleFile((e as any).dataTransfer.files[0]);
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
    setIsExtracting(false);
    setIsAnalyzing(false);
    setError(null);
    setExtractedData(null);
    setAnalysisResult(null);
    setExpandedClauseId(null);
    setPdfPage(1);
    setMobileTab("dashboard");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const extractText = async () => {
    if (!selectedFile) return;

    setIsExtracting(true);
    setError(null);

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
        setIsExtracting(false);
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
      setIsExtracting(false);
    }
  };

  const runAiAnalysis = async () => {
    if (!extractedData) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      const res = await fetch("/api/analyze-lease", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: extractedData.text,
          fileName: extractedData.fileName,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "AI lease analysis failed.");
        setIsAnalyzing(false);
        return;
      }

      setAnalysisResult(data.analysis);
      if (data.analysis?.flaggedClauses?.length > 0) {
        setExpandedClauseId(data.analysis.flaggedClauses[0].id);
      }
    } catch (err: unknown) {
      console.error("AI analysis error:", err);
      setError("Failed to generate AI analysis. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const parseTargetPage = (clause: FlaggedClause, totalPages: number): number => {
    if (!clause.pageReference) return 1;
    const match = clause.pageReference.match(/(?:page|p\.)\s*([0-9]+)/i) || clause.pageReference.match(/([0-9]+)/);
    if (match) {
      const pageNum = parseInt(match[1], 10);
      if (pageNum >= 1 && pageNum <= totalPages) {
        return pageNum;
      }
    }
    return 1;
  };

  const jumpToClausePage = (clause: FlaggedClause) => {
    const targetPage = parseTargetPage(clause, extractedData?.numPages || 1);
    setPdfPage(targetPage);
    setExpandedClauseId(clause.id);
    setMobileTab("pdf");
  };

  const getSeverityBadge = (severity: "High" | "Medium" | "Low") => {
    switch (severity) {
      case "High":
        return "bg-red-500/10 text-red-400 border-red-500/20";
      case "Medium":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case "Low":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
    }
  };

  const getRiskScoreColor = (score: number) => {
    if (score >= 75) return { text: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/30", label: "Critical Risk" };
    if (score >= 50) return { text: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/30", label: "High Risk" };
    if (score >= 30) return { text: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/30", label: "Moderate Risk" };
    return { text: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/30", label: "Low Risk" };
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-between p-3 sm:p-6 relative overflow-x-hidden font-sans">
      {/* Background glow overlays */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-gradient-to-b from-blue-600/15 via-indigo-600/10 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Header Bar */}
      <header className="w-full max-w-7xl flex items-center justify-between py-3 border-b border-slate-800/60 z-10">
        <div className="flex items-center gap-3 cursor-pointer" onClick={resetAll}>
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <FileCheck2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">LeaseLens</h1>
            <p className="text-xs text-slate-400 font-medium">Know what you&apos;re signing.</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            {analysisResult ? "M4: Ask My Lease Ready" : extractedData ? "M1: Text Extracted" : "M1: PDF Upload"}
          </span>
        </div>
      </header>

      {/* Main Workspace Area */}
      <main className="w-full max-w-7xl my-auto py-6 z-10">
        
        {/* VIEW 1: UPLOAD DROPZONE */}
        {!extractedData && !analysisResult && (
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="text-center space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider">
                <Zap className="w-3.5 h-3.5" /> AI Residential Lease Analyzer
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                Upload Your Lease PDF
              </h2>
              <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
                LeaseLens extracts document text and analyzes tenant risks, deadlines, and financial obligations in seconds.
              </p>
            </div>

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
              onClick={!selectedFile && !isExtracting ? triggerFileSelect : undefined}
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
                      Drag &amp; drop your residential lease PDF here
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
                    {!isExtracting && (
                      <button
                        type="button"
                        onClick={resetAll}
                        className="px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-300 text-xs font-medium transition-colors"
                      >
                        Change
                      </button>
                    )}
                  </div>

                  {isExtracting ? (
                    <div className="flex flex-col items-center justify-center space-y-3 py-4">
                      <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                      <p className="text-sm font-medium text-slate-300">
                        Extracting text from lease agreement...
                      </p>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={extractText}
                      className="w-full py-3.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow-lg shadow-blue-600/25 transition-all flex items-center justify-center gap-2"
                    >
                      Extract &amp; Process PDF Text <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-red-950/40 border border-red-900/60 text-red-200 text-sm flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold text-red-300">Notice</p>
                  <p className="text-xs text-red-300/90">{error}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* VIEW 2: TEXT EXTRACTED (Ready for AI Trigger) */}
        {extractedData && !analysisResult && (
          <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-300">
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-2xl backdrop-blur-sm space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-100">
                      PDF Text Extracted Successfully
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
                  <RefreshCw className="w-3.5 h-3.5" /> Reset / New PDF
                </button>
              </div>

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
                  <span className="block text-slate-400 text-xs font-medium mb-1">Status</span>
                  <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1 mt-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Ready for Gemini
                  </span>
                </div>
              </div>

              {isAnalyzing ? (
                <div className="flex flex-col items-center justify-center space-y-3 py-8 bg-blue-950/20 rounded-xl border border-blue-900/30">
                  <Loader2 className="w-9 h-9 text-blue-400 animate-spin" />
                  <p className="text-base font-semibold text-blue-200">
                    Analyzing Lease with Gemini 2.5 Flash...
                  </p>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={runAiAnalysis}
                  className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-base shadow-xl shadow-blue-600/30 transition-all flex items-center justify-center gap-2 group"
                >
                  <Sparkles className="w-5 h-5 text-amber-300 group-hover:rotate-12 transition-transform" />
                  Run AI Lease Analysis (Gemini 2.5)
                  <ArrowRight className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* VIEW 3: FULL LEASELENS STUDIO (M1-M4) */}
        {analysisResult && selectedFile && (
          <div className="space-y-6 animate-in fade-in duration-500">
            
            {/* Header Action Bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/90 p-4 rounded-2xl border border-slate-800 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">LeaseLens Split-Screen Studio</h2>
                  <p className="text-xs text-slate-400">PDF Viewer • Risk Analysis • Grounded &ldquo;Ask My Lease&rdquo; Q&amp;A</p>
                </div>
              </div>

              {/* Mobile View Selector Tabs */}
              <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                <div className="flex lg:hidden rounded-xl bg-slate-950 p-1 border border-slate-800">
                  <button
                    type="button"
                    onClick={() => setMobileTab("dashboard")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                      mobileTab === "dashboard"
                        ? "bg-blue-600 text-white"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <LayoutDashboard className="w-3.5 h-3.5" /> Dashboard
                  </button>
                  <button
                    type="button"
                    onClick={() => setMobileTab("pdf")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                      mobileTab === "pdf"
                        ? "bg-blue-600 text-white"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5" /> PDF (P. {pdfPage})
                  </button>
                </div>

                <button
                  type="button"
                  onClick={resetAll}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> New PDF
                </button>
              </div>
            </div>

            {/* Split Screen Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* LEFT COLUMN: PDF Document Viewer */}
              <div
                className={`lg:col-span-5 lg:block ${
                  mobileTab === "pdf" ? "block" : "hidden"
                }`}
              >
                <div className="sticky top-4">
                  <PDFViewer
                    file={selectedFile}
                    currentPage={pdfPage}
                    totalPages={extractedData?.numPages || 1}
                    onPageChange={(page) => setPdfPage(page)}
                  />
                </div>
              </div>

              {/* RIGHT COLUMN: Dashboard & Ask My Lease Q&A */}
              <div
                className={`lg:col-span-7 space-y-6 lg:block ${
                  mobileTab === "dashboard" ? "block" : "hidden"
                }`}
              >
                
                {/* 1. Tenant Risk Index */}
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-blue-400" />
                      <h3 className="text-lg font-bold text-slate-100">Tenant Risk Index</h3>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getRiskScoreColor(analysisResult.riskIndex.score).bg} ${getRiskScoreColor(analysisResult.riskIndex.score).text} ${getRiskScoreColor(analysisResult.riskIndex.score).border}`}>
                      {analysisResult.riskIndex.level} Risk
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-6 py-1">
                    <div className="flex flex-col items-center justify-center w-28 h-28 rounded-2xl bg-slate-950 border border-slate-800 shrink-0">
                      <span className={`text-4xl font-extrabold ${getRiskScoreColor(analysisResult.riskIndex.score).text}`}>
                        {analysisResult.riskIndex.score}
                      </span>
                      <span className="text-[10px] text-slate-500 font-medium">out of 100</span>
                    </div>
                    <div className="space-y-2 text-center sm:text-left">
                      <p className="text-sm text-slate-300 leading-relaxed font-medium">
                        {analysisResult.riskIndex.summary}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 2. Financial & Dates Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* Financial Summary */}
                  <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
                    <div className="flex items-center gap-2 border-b border-slate-800 pb-2.5">
                      <DollarSign className="w-4 h-4 text-emerald-400" />
                      <h3 className="text-sm font-bold text-slate-100">Financial Summary</h3>
                    </div>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/60">
                        <span className="text-slate-400">Monthly Rent</span>
                        <span className="font-bold text-emerald-400">{analysisResult.financialSummary.monthlyRent}</span>
                      </div>
                      <div className="flex justify-between bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/60">
                        <span className="text-slate-400">Security Deposit</span>
                        <span className="font-semibold text-slate-200">{analysisResult.financialSummary.securityDeposit}</span>
                      </div>
                      <div className="flex justify-between bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/60">
                        <span className="text-slate-400">Due &amp; Grace Period</span>
                        <span className="font-medium text-slate-300">{analysisResult.financialSummary.dueDateAndGracePeriod}</span>
                      </div>
                    </div>
                  </div>

                  {/* Important Dates */}
                  <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
                    <div className="flex items-center gap-2 border-b border-slate-800 pb-2.5">
                      <Calendar className="w-4 h-4 text-indigo-400" />
                      <h3 className="text-sm font-bold text-slate-100">Important Dates</h3>
                    </div>
                    <div className="space-y-2 text-xs">
                      <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/60">
                        <span className="text-slate-400 block text-[11px]">Lease Period</span>
                        <span className="font-semibold text-slate-200">
                          {analysisResult.importantDates.leaseStart} — {analysisResult.importantDates.leaseEnd}
                        </span>
                      </div>
                      <div className="bg-slate-950/60 p-2.5 rounded-lg border border-indigo-950">
                        <span className="text-indigo-300 font-semibold block text-[11px]">Notice for Non-Renewal</span>
                        <p className="text-slate-300 text-[11px]">{analysisResult.importantDates.noticePeriod}</p>
                      </div>
                    </div>
                  </div>

                </div>

                {/* 3. Flagged Clauses with Exact-Page Jump Buttons */}
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-amber-400" />
                      <h3 className="text-base font-bold text-slate-100">
                        Flagged Clauses ({analysisResult.flaggedClauses.length})
                      </h3>
                    </div>
                    <span className="text-xs text-slate-400">Click &apos;View on Page X&apos; to navigate PDF</span>
                  </div>

                  <div className="space-y-3">
                    {analysisResult.flaggedClauses.map((clause: FlaggedClause) => {
                      const isExpanded = expandedClauseId === clause.id;
                      const targetPage = parseTargetPage(clause, extractedData?.numPages || 1);
                      const isPageActive = pdfPage === targetPage;

                      return (
                        <div
                          key={clause.id}
                          className={`border rounded-xl bg-slate-950/70 overflow-hidden transition-all ${
                            isPageActive ? "border-blue-500/60 ring-1 ring-blue-500/30" : "border-slate-800"
                          }`}
                        >
                          <div className="p-4 space-y-3">
                            <div className="flex items-start justify-between gap-3">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-semibold border ${getSeverityBadge(clause.severity)}`}>
                                    {clause.severity}
                                  </span>
                                  <span className="text-xs font-semibold text-slate-200">
                                    {clause.title}
                                  </span>
                                </div>
                                <p className="text-[11px] text-slate-400">
                                  Category: {clause.category}
                                </p>
                              </div>

                              <button
                                type="button"
                                onClick={() => jumpToClausePage(clause)}
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 ${
                                  isPageActive
                                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                                    : "bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/30"
                                }`}
                              >
                                <Target className="w-3.5 h-3.5" />
                                {isPageActive ? `Viewing Page ${targetPage}` : `View on Page ${targetPage}`}
                              </button>
                            </div>

                            <button
                              type="button"
                              onClick={() => setExpandedClauseId(isExpanded ? null : clause.id)}
                              className="w-full pt-1 flex items-center justify-between text-xs text-slate-400 hover:text-slate-200 transition-colors"
                            >
                              <span>{isExpanded ? "Hide details" : "Show explanation & quoted text"}</span>
                              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>

                            {isExpanded && (
                              <div className="pt-2 border-t border-slate-800/80 space-y-3 text-xs">
                                <div className="bg-slate-900 p-3 rounded-lg border border-slate-800/80 space-y-1">
                                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Quoted Clause</span>
                                  <blockquote className="italic text-slate-300 font-mono text-[11px]">
                                    &ldquo;{clause.originalText}&rdquo;
                                  </blockquote>
                                </div>

                                <div className="space-y-1">
                                  <span className="font-semibold text-blue-400">Plain-English Explanation:</span>
                                  <p className="text-slate-300 leading-relaxed">{clause.explanation}</p>
                                </div>

                                <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-lg text-amber-200 space-y-1">
                                  <span className="font-bold text-amber-400 flex items-center gap-1 text-xs">
                                    <Info className="w-3.5 h-3.5" /> Why This Matters
                                  </span>
                                  <p className="text-xs text-amber-200/90 leading-relaxed">{clause.whyItMatters}</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 4. MILESTONE 4: GROUNDED "ASK MY LEASE" AI CHAT ASSISTANT */}
                {extractedData && (
                  <AskMyLease
                    leaseText={extractedData.text}
                    fileName={extractedData.fileName}
                  />
                )}

              </div>

            </div>

          </div>
        )}

      </main>

      {/* Footer Disclaimer */}
      <footer className="w-full max-w-7xl py-4 border-t border-slate-800/60 text-center text-xs text-slate-500 z-10 space-y-1">
        <p>
          <strong className="text-slate-400">Legal Disclaimer:</strong> LeaseLens is an informational document-analysis tool. It does not provide legal advice or definitive legal conclusions.
        </p>
      </footer>
    </div>
  );
}
