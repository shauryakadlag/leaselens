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
  ShieldAlert,
  Clock,
  ExternalLink,
} from "lucide-react";
import { LeaseAnalysisResult, FlaggedClause } from "./api/analyze-lease/route";
import PDFViewer from "./components/PDFViewer";
import AskMyLease from "./components/AskMyLease";
import TotalCostCalculator from "./components/TotalCostCalculator";
import LandlordEmailGenerator from "./components/LandlordEmailGenerator";

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

  // Split Screen, Exact Page Navigation & Mobile/Tablet Active Tab Switcher
  const [pdfPage, setPdfPage] = useState<number>(1);
  const [mobileTab, setMobileTab] = useState<"dashboard" | "pdf" | "chat">("dashboard");

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
      setError("Only PDF documents are supported. Please select a valid residential lease PDF.");
      setSelectedFile(null);
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setError("File size exceeds 15MB. Please upload a smaller lease PDF document.");
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
        return;
      }

      setExtractedData(data);
      runAiAnalysis(data.text, data.fileName);
    } catch (err: unknown) {
      console.error("PDF Extraction error:", err);
      setError("An unexpected network error occurred while uploading your PDF document.");
    } finally {
      setIsExtracting(false);
    }
  };

  const runAiAnalysis = async (leaseText: string, fileName: string) => {
    setIsAnalyzing(true);
    setError(null);

    try {
      const res = await fetch("/api/analyze-lease", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: leaseText,
          fileName,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "AI lease analysis failed.");
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
    if (typeof clause.pageNumber === "number" && clause.pageNumber >= 1 && clause.pageNumber <= totalPages) {
      return clause.pageNumber;
    }
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

  const getSeverityBadgeStyle = (severity: "High" | "Medium" | "Low") => {
    switch (severity) {
      case "High":
        return "bg-[#5D0D18] text-[#FFF9EB] border-[#5D0D18]";
      case "Medium":
        return "bg-[#FDF4EC] text-[#944600] border-[#F2D0B3]";
      case "Low":
        return "bg-[#EFF4F2] text-[#2F4C43] border-[#C3D2CD]";
      default:
        return "bg-[#EFF4F2] text-[#2F4C43] border-[#C3D2CD]";
    }
  };

  const getRiskLevelStyle = (level: string) => {
    switch (level) {
      case "Critical":
      case "High":
        return {
          bg: "bg-[#5D0D18]",
          text: "text-[#FFF9EB]",
          border: "border-[#5D0D18]",
          badgeBg: "bg-[#F9ECEE]",
          badgeText: "text-[#5D0D18]",
        };
      case "Moderate":
      case "Medium":
        return {
          bg: "bg-[#944600]",
          text: "text-[#FFF9EB]",
          border: "border-[#944600]",
          badgeBg: "bg-[#FDF4EC]",
          badgeText: "text-[#944600]",
        };
      default:
        return {
          bg: "bg-[#2F4C43]",
          text: "text-[#FFF9EB]",
          border: "border-[#2F4C43]",
          badgeBg: "bg-[#EFF4F2]",
          badgeText: "text-[#2F4C43]",
        };
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF9EB] text-[#1E1517] flex flex-col font-sans">
      {/* 1. Header Navigation Bar */}
      <header className="bg-[#FFFDF7] border-b border-[#EADFCF] sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#5D0D18] flex items-center justify-center text-[#FFF9EB] shadow-xs">
              <BookOpen className="w-5 h-5 stroke-[2]" />
            </div>
            <div>
              <span className="font-serif font-bold text-lg text-[#1E1517] tracking-tight block leading-none">
                LeaseLens
              </span>
              <span className="text-[11px] text-[#7A6F70] font-medium tracking-wide uppercase">
                Know what you&apos;re signing.
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {extractedData && (
              <span className="hidden md:inline-flex items-center gap-1.5 text-xs text-[#2F4C43] bg-[#EFF4F2] border border-[#C3D2CD] px-3 py-1 rounded-full font-medium">
                <FileCheck2 className="w-3.5 h-3.5 text-[#2F4C43]" />
                {extractedData.fileName} ({extractedData.numPages} pages)
              </span>
            )}

            {(selectedFile || extractedData) && (
              <button
                type="button"
                onClick={resetAll}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5D0D18] hover:text-[#470912] bg-[#F9ECEE] hover:bg-[#F2D7DB] border border-[#D8B4B8] px-3 py-1.5 rounded-lg transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Upload New Lease
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main App Workspace Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Error Alert Box */}
        {error && (
          <div className="mb-6 bg-[#F9ECEE] border border-[#D8B4B8] rounded-xl p-4 flex items-start gap-3 text-xs text-[#5D0D18] shadow-xs">
            <AlertCircle className="w-5 h-5 shrink-0 text-[#5D0D18] mt-0.5" />
            <div className="flex-1">
              <strong className="font-semibold block text-sm mb-0.5">Processing Alert</strong>
              <p>{error}</p>
            </div>
          </div>
        )}

        {/* 2. Upload / Landing Screen (Shown when no file is processed yet) */}
        {!extractedData && !isExtracting && !isAnalyzing && (
          <div className="max-w-3xl mx-auto my-4 sm:my-8 space-y-8">
            {/* Hero Banner */}
            <div className="text-center space-y-3">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5D0D18] bg-[#F9ECEE] border border-[#D8B4B8] px-3.5 py-1 rounded-full uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5 text-[#5D0D18]" /> Legal Document Analyzer
              </span>
              <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#1E1517] tracking-tight">
                Understand your lease before you sign.
              </h1>
              <p className="text-sm sm:text-base text-[#544B4C] max-w-xl mx-auto leading-relaxed">
                LeaseLens analyzes residential agreements in seconds to flag hidden financial penalties, automatic renewal traps, and restrictive tenant clauses with verified page citations.
              </p>
            </div>

            {/* Dropzone Container */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={triggerFileSelect}
              className={`bg-[#FFFDF7] border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all shadow-xs ${
                isDragActive
                  ? "border-[#5D0D18] bg-[#F9ECEE]/50"
                  : "border-[#C3D2CD] hover:border-[#5D0D18] hover:bg-[#FAF4E6]"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileInputChange}
                className="hidden"
              />

              <div className="w-16 h-16 rounded-2xl bg-[#5D0D18]/10 border border-[#5D0D18]/20 flex items-center justify-center mx-auto mb-4 text-[#5D0D18]">
                <UploadCloud className="w-8 h-8 stroke-[1.5]" />
              </div>

              {selectedFile ? (
                <div className="space-y-3">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2F4C43] bg-[#EFF4F2] border border-[#C3D2CD] px-3 py-1 rounded-full">
                    <FileCheck2 className="w-4 h-4 text-[#2F4C43]" /> Selected: {selectedFile.name}
                  </span>
                  <p className="text-xs text-[#7A6F70]">{formatFileSize(selectedFile.size)}</p>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      extractText();
                    }}
                    className="inline-flex items-center gap-2 bg-[#5D0D18] hover:bg-[#470912] text-[#FFF9EB] px-6 py-2.5 rounded-xl font-semibold text-xs transition-colors shadow-sm"
                  >
                    <span>Analyze Lease Agreement</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <h3 className="text-base font-bold text-[#1E1517]">
                    Drag &amp; Drop your Lease PDF here
                  </h3>
                  <p className="text-xs text-[#544B4C]">
                    or <span className="text-[#5D0D18] font-semibold underline underline-offset-2">browse files</span> from your computer
                  </p>
                  <p className="text-[11px] text-[#807576] pt-2">
                    Supports standard PDF lease documents up to 15MB
                  </p>
                </div>
              )}
            </div>

            {/* Value Proposition Guarantees */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-xs">
              <div className="bg-[#FFFDF7] p-4 rounded-xl border border-[#EADFCF] space-y-1.5 shadow-2xs">
                <ShieldCheck className="w-5 h-5 text-[#5D0D18]" />
                <h4 className="font-bold text-[#1E1517]">Strictly Grounded Analysis</h4>
                <p className="text-[#544B4C] leading-normal text-[11px]">
                  All findings are extracted directly from your contract without hallucinations or unmentioned facts.
                </p>
              </div>

              <div className="bg-[#FFFDF7] p-4 rounded-xl border border-[#EADFCF] space-y-1.5 shadow-2xs">
                <Target className="w-5 h-5 text-[#5D0D18]" />
                <h4 className="font-bold text-[#1E1517]">Exact-Page Jump Citations</h4>
                <p className="text-[#544B4C] leading-normal text-[11px]">
                  Every flagged clause maps directly to the specific page number in your PDF document.
                </p>
              </div>

              <div className="bg-[#FFFDF7] p-4 rounded-xl border border-[#EADFCF] space-y-1.5 shadow-2xs">
                <Zap className="w-5 h-5 text-[#5D0D18]" />
                <h4 className="font-bold text-[#1E1517]">Interactive &quot;Ask My Lease&quot;</h4>
                <p className="text-[#544B4C] leading-normal text-[11px]">
                  Ask questions about rent, pets, utilities, or notice periods and receive instant grounded answers.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Loading Indicator View */}
        {(isExtracting || isAnalyzing) && (
          <div className="max-w-xl mx-auto my-12 bg-[#FFFDF7] border border-[#EADFCF] rounded-2xl p-8 text-center space-y-4 shadow-sm">
            <div className="w-12 h-12 rounded-full bg-[#5D0D18]/10 text-[#5D0D18] flex items-center justify-center mx-auto">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#1E1517]">
                {isExtracting ? "Parsing PDF Text Pages..." : "Analyzing Lease Clauses & Terms..."}
              </h3>
              <p className="text-xs text-[#544B4C] mt-1">
                {isExtracting
                  ? "Extracting page-aware text structure from document"
                  : "Evaluating Tenant Risk Index, Financial Obligations, and Page References"}
              </p>
            </div>
            <div className="w-full bg-[#EADFCF] h-1.5 rounded-full overflow-hidden">
              <div className="bg-[#5D0D18] h-full w-2/3 animate-pulse rounded-full" />
            </div>
          </div>
        )}

        {/* 3. Main Split-Screen / Tabbed Workspace View (When analysis is ready) */}
        {extractedData && analysisResult && !isExtracting && !isAnalyzing && (
          <div className="space-y-6">
            {/* Mobile / Tablet Tab Switcher Controls */}
            <div className="lg:hidden bg-[#FFFDF7] border border-[#EADFCF] p-1.5 rounded-xl flex items-center justify-between text-xs font-semibold shadow-xs">
              <button
                type="button"
                onClick={() => setMobileTab("dashboard")}
                className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                  mobileTab === "dashboard"
                    ? "bg-[#5D0D18] text-[#FFF9EB] shadow-xs"
                    : "text-[#544B4C] hover:text-[#1E1517]"
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </button>

              <button
                type="button"
                onClick={() => setMobileTab("pdf")}
                className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                  mobileTab === "pdf"
                    ? "bg-[#5D0D18] text-[#FFF9EB] shadow-xs"
                    : "text-[#544B4C] hover:text-[#1E1517]"
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>PDF Document ({extractedData.numPages})</span>
              </button>

              <button
                type="button"
                onClick={() => setMobileTab("chat")}
                className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                  mobileTab === "chat"
                    ? "bg-[#5D0D18] text-[#FFF9EB] shadow-xs"
                    : "text-[#544B4C] hover:text-[#1E1517]"
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                <span>Ask My Lease</span>
              </button>
            </div>

            {/* Desktop Split-Screen Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: PDF Viewer Studio (Sticky on Desktop) */}
              <div
                className={`lg:col-span-5 lg:sticky lg:top-20 ${
                  mobileTab === "pdf" ? "block" : "hidden lg:block"
                }`}
              >
                <PDFViewer
                  file={selectedFile}
                  currentPage={pdfPage}
                  totalPages={extractedData.numPages}
                  onPageChange={(page) => setPdfPage(page)}
                />
              </div>

              {/* Right Column: Analysis Dashboard & Ask My Lease Assistant */}
              <div
                className={`lg:col-span-7 space-y-6 ${
                  mobileTab === "dashboard" || mobileTab === "chat" ? "block" : "hidden lg:block"
                }`}
              >
                {/* 1. Tenant Risk Index Card */}
                <div
                  className={`bg-[#FFFDF7] border border-[#EADFCF] rounded-2xl p-6 shadow-sm ${
                    mobileTab === "chat" ? "hidden lg:block" : "block"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#EADFCF] pb-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <ShieldAlert className="w-5 h-5 text-[#5D0D18]" />
                        <h2 className="text-lg font-serif font-bold text-[#1E1517]">
                          Tenant Risk Index
                        </h2>
                      </div>
                      <p className="text-xs text-[#544B4C]">
                        Comprehensive risk evaluation based on flagged terms and one-sided clauses
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-2xl sm:text-3xl font-serif font-bold text-[#1E1517]">
                          {analysisResult.riskIndex.score}
                        </span>
                        <span className="text-xs text-[#7A6F70]"> / 100</span>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                          getRiskLevelStyle(analysisResult.riskIndex.level).badgeBg
                        } ${getRiskLevelStyle(analysisResult.riskIndex.level).badgeText} border-current`}
                      >
                        {analysisResult.riskIndex.level} Risk
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-[#2C1A1D] mt-4 leading-relaxed bg-[#FAF4E6] p-3.5 rounded-xl border border-[#EADFCF]">
                    {analysisResult.riskIndex.summary}
                  </p>
                </div>

                {/* 2. Financial Summary Panel */}
                <div
                  className={`bg-[#FFFDF7] border border-[#EADFCF] rounded-2xl p-6 shadow-sm space-y-4 ${
                    mobileTab === "chat" ? "hidden lg:block" : "block"
                  }`}
                >
                  <div className="flex items-center gap-2 border-b border-[#EADFCF] pb-3">
                    <DollarSign className="w-5 h-5 text-[#5D0D18]" />
                    <h3 className="text-base font-bold text-[#1E1517]">Financial Summary</h3>
                  </div>

                  {/* 4 Financial Metric Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-[#FAF4E6] p-3.5 rounded-xl border border-[#EADFCF]">
                      <span className="text-[11px] font-semibold text-[#544B4C] uppercase tracking-wider block">
                        Base Monthly Rent
                      </span>
                      <span className="text-base font-bold text-[#1E1517] mt-0.5 block">
                        {analysisResult.financialSummary.monthlyRent}
                      </span>
                    </div>

                    <div className="bg-[#FAF4E6] p-3.5 rounded-xl border border-[#EADFCF]">
                      <span className="text-[11px] font-semibold text-[#544B4C] uppercase tracking-wider block">
                        Security Deposit
                      </span>
                      <span className="text-base font-bold text-[#1E1517] mt-0.5 block">
                        {analysisResult.financialSummary.securityDeposit}
                      </span>
                    </div>

                    <div className="bg-[#FAF4E6] p-3.5 rounded-xl border border-[#EADFCF]">
                      <span className="text-[11px] font-semibold text-[#544B4C] uppercase tracking-wider block">
                        Due Date &amp; Grace Period
                      </span>
                      <span className="text-xs font-semibold text-[#1E1517] mt-0.5 block">
                        {analysisResult.financialSummary.dueDateAndGracePeriod}
                      </span>
                    </div>

                    <div className="bg-[#FAF4E6] p-3.5 rounded-xl border border-[#EADFCF]">
                      <span className="text-[11px] font-semibold text-[#544B4C] uppercase tracking-wider block">
                        Late Fee Policy
                      </span>
                      <span className="text-xs font-semibold text-[#1E1517] mt-0.5 block">
                        {analysisResult.financialSummary.lateFeePolicy}
                      </span>
                    </div>
                  </div>

                  {/* Utilities Breakdown */}
                  <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="bg-[#EFF4F2] p-3 rounded-xl border border-[#C3D2CD] space-y-1">
                      <span className="font-bold text-[#2F4C43] block">Tenant Pays:</span>
                      <p className="text-[#1E1517]">
                        {analysisResult.financialSummary.utilityResponsibilities.tenantPays.join(", ") || "None specified"}
                      </p>
                    </div>

                    <div className="bg-[#EFF4F2] p-3 rounded-xl border border-[#C3D2CD] space-y-1">
                      <span className="font-bold text-[#2F4C43] block">Landlord Pays:</span>
                      <p className="text-[#1E1517]">
                        {analysisResult.financialSummary.utilityResponsibilities.landlordPays.join(", ") || "None specified"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 3. Total Cost Calculator (M5) */}
                <div className={mobileTab === "chat" ? "hidden lg:block" : "block"}>
                  <TotalCostCalculator financialSummary={analysisResult.financialSummary} />
                </div>

                {/* 4. Important Dates Grid */}
                <div
                  className={`bg-[#FFFDF7] border border-[#EADFCF] rounded-2xl p-6 shadow-sm space-y-4 ${
                    mobileTab === "chat" ? "hidden lg:block" : "block"
                  }`}
                >
                  <div className="flex items-center gap-2 border-b border-[#EADFCF] pb-3">
                    <Calendar className="w-5 h-5 text-[#5D0D18]" />
                    <h3 className="text-base font-bold text-[#1E1517]">Important Dates &amp; Deadlines</h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="bg-[#FAF4E6] p-3 rounded-xl border border-[#EADFCF]">
                      <span className="font-semibold text-[#544B4C] block text-[11px]">Lease Start Date</span>
                      <span className="font-bold text-[#1E1517] text-xs">{analysisResult.importantDates.leaseStart}</span>
                    </div>

                    <div className="bg-[#FAF4E6] p-3 rounded-xl border border-[#EADFCF]">
                      <span className="font-semibold text-[#544B4C] block text-[11px]">Lease Expiration Date</span>
                      <span className="font-bold text-[#1E1517] text-xs">{analysisResult.importantDates.leaseEnd}</span>
                    </div>

                    <div className="bg-[#FAF4E6] p-3 rounded-xl border border-[#EADFCF]">
                      <span className="font-semibold text-[#544B4C] block text-[11px]">Required Notice Period</span>
                      <span className="font-bold text-[#1E1517] text-xs">{analysisResult.importantDates.noticePeriod}</span>
                    </div>

                    <div className="bg-[#FAF4E6] p-3 rounded-xl border border-[#EADFCF]">
                      <span className="font-semibold text-[#544B4C] block text-[11px]">Move-In Inspection</span>
                      <span className="font-bold text-[#1E1517] text-xs">{analysisResult.importantDates.inspectionDeadlines}</span>
                    </div>
                  </div>
                </div>

                {/* 5. Flagged Risky Clauses List */}
                <div
                  className={`bg-[#FFFDF7] border border-[#EADFCF] rounded-2xl p-6 shadow-sm space-y-4 ${
                    mobileTab === "chat" ? "hidden lg:block" : "block"
                  }`}
                >
                  <div className="flex items-center justify-between border-b border-[#EADFCF] pb-3">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-[#5D0D18]" />
                      <h3 className="text-base font-bold text-[#1E1517]">
                        Flagged Clauses ({analysisResult.flaggedClauses.length})
                      </h3>
                    </div>
                    <span className="text-xs text-[#7A6F70]">Click &apos;View on Page X&apos; to navigate PDF</span>
                  </div>

                  <div className="space-y-3">
                    {analysisResult.flaggedClauses.map((clause: FlaggedClause) => {
                      const isExpanded = expandedClauseId === clause.id;
                      const targetPage = parseTargetPage(clause, extractedData?.numPages || 1);
                      const isPageActive = pdfPage === targetPage;

                      return (
                        <div
                          key={clause.id}
                          className={`border rounded-xl bg-[#FFFDF7] overflow-hidden transition-all ${
                            isPageActive ? "border-[#5D0D18] ring-1 ring-[#5D0D18]/30" : "border-[#EADFCF]"
                          }`}
                        >
                          <div className="p-4 space-y-3">
                            <div className="flex items-start justify-between gap-3">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold border ${getSeverityBadgeStyle(clause.severity)}`}>
                                    {clause.severity}
                                  </span>
                                  <span className="text-xs font-bold text-[#1E1517]">
                                    {clause.title}
                                  </span>
                                </div>
                                <p className="text-[11px] text-[#7A6F70]">
                                  Category: {clause.category}
                                </p>
                              </div>

                              {/* Target Page Jump Button */}
                              <button
                                type="button"
                                onClick={() => jumpToClausePage(clause)}
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 ${
                                  isPageActive
                                    ? "bg-[#5D0D18] text-[#FFF9EB] shadow-xs"
                                    : "bg-[#F9ECEE] hover:bg-[#F2D7DB] text-[#5D0D18] border border-[#D8B4B8]"
                                }`}
                              >
                                <Target className="w-3.5 h-3.5" />
                                {isPageActive ? `Viewing Page ${targetPage}` : `View on Page ${targetPage}`}
                              </button>
                            </div>

                            <button
                              type="button"
                              onClick={() => setExpandedClauseId(isExpanded ? null : clause.id)}
                              className="w-full pt-1 flex items-center justify-between text-xs text-[#544B4C] hover:text-[#1E1517] transition-colors"
                            >
                              <span>{isExpanded ? "Hide details" : "Show explanation & quoted text"}</span>
                              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>

                            {isExpanded && (
                              <div className="pt-2 border-t border-[#EADFCF] space-y-3 text-xs">
                                <div className="bg-[#F5ECCF] p-3 rounded-lg border border-[#E2D5B7] space-y-1">
                                  <span className="text-[10px] font-semibold text-[#544B4C] uppercase tracking-wider block">
                                    Quoted Clause Text (Page {targetPage})
                                  </span>
                                  <blockquote className="italic text-[#1E1517] font-mono text-[11px]">
                                    &ldquo;{clause.originalText}&rdquo;
                                  </blockquote>
                                </div>

                                <div className="space-y-1">
                                  <span className="font-bold text-[#1E1517] text-[11px] block">Plain-English Explanation:</span>
                                  <p className="text-[#544B4C] leading-relaxed text-xs">{clause.explanation}</p>
                                </div>

                                <div className="space-y-1 bg-[#F9ECEE] p-2.5 rounded-lg border border-[#D8B4B8]">
                                  <span className="font-bold text-[#5D0D18] text-[11px] block">Why This Matters:</span>
                                  <p className="text-[#2C1A1D] leading-relaxed text-xs">{clause.whyItMatters}</p>
                                </div>

                                {clause.recommendation && (
                                  <div className="space-y-1 bg-[#EFF4F2] p-2.5 rounded-lg border border-[#C3D2CD]">
                                    <span className="font-bold text-[#2F4C43] text-[11px] block">Recommended Action:</span>
                                    <p className="text-[#1E1517] leading-relaxed text-xs">{clause.recommendation}</p>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 6. One-Click Landlord Clarification Email Generator (M5) */}
                <div className={mobileTab === "chat" ? "hidden lg:block" : "block"}>
                  <LandlordEmailGenerator
                    flaggedClauses={analysisResult.flaggedClauses}
                    fileName={extractedData.fileName}
                  />
                </div>

                {/* 5. Interactive "Ask My Lease" Q&A Assistant */}
                <div
                  className={`${
                    mobileTab === "chat" || mobileTab === "dashboard" ? "block" : "hidden lg:block"
                  }`}
                >
                  <AskMyLease key={extractedData.fileName} leaseText={extractedData.text} fileName={extractedData.fileName} />
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer Legal Disclaimer */}
      <footer className="bg-[#FFFDF7] border-t border-[#EADFCF] py-4 mt-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-[11px] text-[#7A6F70] space-y-1">
          <p className="font-semibold text-[#544B4C]">
            LeaseLens — Know what you&apos;re signing.
          </p>
          <p>
            Informational document-analysis tool only. Does not constitute legal advice or formal legal representation.
          </p>
        </div>
      </footer>
    </div>
  );
}
