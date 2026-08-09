"use client";

import { useState, useEffect } from "react";
import { Mail, Copy, Check, ExternalLink, Send, Sparkles, AlertCircle, CheckSquare, Square } from "lucide-react";
import { FlaggedClause } from "../api/analyze-lease/route";

interface LandlordEmailGeneratorProps {
  flaggedClauses: FlaggedClause[];
  fileName: string;
}

export default function LandlordEmailGenerator({
  flaggedClauses,
  fileName,
}: LandlordEmailGeneratorProps) {
  const [selectedClauseIds, setSelectedClauseIds] = useState<string[]>(
    flaggedClauses.map((c) => c.id)
  );
  const [copied, setCopied] = useState(false);
  const [landlordName, setLandlordName] = useState("Property Manager / Landlord");

  // Reset selected clause IDs whenever a new document or set of clauses is loaded
  useEffect(() => {
    setSelectedClauseIds(flaggedClauses.map((c) => c.id));
    setCopied(false);
  }, [flaggedClauses, fileName]);

  const toggleClause = (id: string) => {
    setSelectedClauseIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const selectedClauses = flaggedClauses.filter((c) =>
    selectedClauseIds.includes(c.id)
  );

  const subjectText = `Clarification & Review Request — Residential Lease Agreement (${fileName})`;

  const generateEmailBody = () => {
    let body = `Dear ${landlordName},\n\n`;
    body += `Thank you for sending over the residential lease agreement for review. I am excited about the opportunity to rent the property.\n\n`;
    body += `Before finalizing and signing the agreement, I would appreciate written clarification on a few specific clauses to ensure we are aligned on lease terms:\n\n`;

    if (selectedClauses.length === 0) {
      body += `[Please select one or more flagged clauses from your LeaseLens analysis above to auto-populate questions here.]\n\n`;
    } else {
      selectedClauses.forEach((clause, index) => {
        body += `${index + 1}. ${clause.title} (Page ${clause.pageNumber || 1})\n`;
        body += `   - Lease Reference: "${clause.originalText.slice(0, 140)}${clause.originalText.length > 140 ? "..." : ""}"\n`;
        body += `   - Request: Could you please clarify or confirm whether we can amend this section to state ${
          clause.recommendation || "standard 24-hour advance notice / standard tenant protections"
        }?\n\n`;
      });
    }

    body += `I appreciate your time and assistance in reviewing these items. Please let me know if we can make these minor adjustments before signing.\n\n`;
    body += `Best regards,\n[Your Full Name]\n[Your Contact Phone & Email]`;

    return body;
  };

  const fullEmailBody = generateEmailBody();

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(`Subject: ${subjectText}\n\n${fullEmailBody}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error("Failed to copy email to clipboard:", err);
    }
  };

  const mailtoUrl = `mailto:?subject=${encodeURIComponent(subjectText)}&body=${encodeURIComponent(fullEmailBody)}`;

  return (
    <div className="bg-[#FFFDF7] border border-[#EADFCF] rounded-2xl p-6 shadow-sm space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#EADFCF] pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-[#5D0D18]/10 border border-[#5D0D18]/20 flex items-center justify-center text-[#5D0D18]">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-serif font-bold text-[#1E1517] flex items-center gap-2">
              Landlord Clarification Email Generator <Sparkles className="w-4 h-4 text-[#5D0D18]" />
            </h3>
            <p className="text-xs text-[#544B4C]">
              Generate a formal, polite email requesting written clarification or amendments for flagged clauses
            </p>
          </div>
        </div>
      </div>

      {/* Recipient Customization */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div>
          <label className="block font-semibold text-[#544B4C] mb-1 text-[11px] uppercase tracking-wider">
            Landlord / Manager Greeting Name:
          </label>
          <input
            type="text"
            value={landlordName}
            onChange={(e) => setLandlordName(e.target.value)}
            placeholder="e.g. Apex Property Management / Mr. Smith"
            className="w-full bg-[#FAF4E6] border border-[#EADFCF] rounded-lg px-3 py-2 text-xs text-[#1E1517] focus:outline-none focus:border-[#5D0D18]"
          />
        </div>

        <div>
          <label className="block font-semibold text-[#544B4C] mb-1 text-[11px] uppercase tracking-wider">
            Clauses Included ({selectedClauseIds.length} of {flaggedClauses.length}):
          </label>
          <span className="text-xs text-[#2F4C43] font-medium bg-[#EFF4F2] border border-[#C3D2CD] px-3 py-2 rounded-lg block truncate">
            {selectedClauseIds.length > 0
              ? `${selectedClauseIds.length} clause(s) auto-selected for inquiry`
              : "No clauses selected"}
          </span>
        </div>
      </div>

      {/* Clause Selection Toggles */}
      {flaggedClauses.length > 0 && (
        <div className="space-y-2">
          <span className="text-[11px] font-semibold text-[#544B4C] uppercase tracking-wider block">
            Select Flagged Items to Include in Email:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {flaggedClauses.map((clause) => {
              const isSelected = selectedClauseIds.includes(clause.id);
              return (
                <button
                  key={clause.id}
                  type="button"
                  onClick={() => toggleClause(clause.id)}
                  className={`flex items-start gap-2 p-2.5 rounded-lg border text-left transition-all ${
                    isSelected
                      ? "bg-[#FAF4E6] border-[#5D0D18] text-[#1E1517]"
                      : "bg-[#FFFDF7] border-[#EADFCF] text-[#7A6F70] hover:bg-[#FAF4E6]"
                  }`}
                >
                  {isSelected ? (
                    <CheckSquare className="w-4 h-4 text-[#5D0D18] shrink-0 mt-0.5" />
                  ) : (
                    <Square className="w-4 h-4 text-[#C8BDAB] shrink-0 mt-0.5" />
                  )}
                  <div className="truncate">
                    <span className="font-semibold block truncate">{clause.title}</span>
                    <span className="text-[10px] text-[#7A6F70]">Page {clause.pageNumber || 1}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Email Preview Container */}
      <div className="bg-[#FAF4E6] border border-[#EADFCF] rounded-xl p-4 space-y-3">
        <div className="border-b border-[#EADFCF] pb-2 text-xs font-semibold text-[#1E1517]">
          <span className="text-[#544B4C]">Subject: </span> {subjectText}
        </div>
        <pre className="text-xs text-[#1E1517] font-sans whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
          {fullEmailBody}
        </pre>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-1">
        <button
          type="button"
          onClick={copyToClipboard}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#FAF4E6] hover:bg-[#EADFCF] text-[#5D0D18] border border-[#D8B4B8] px-4 py-2.5 rounded-xl font-semibold text-xs transition-colors shadow-2xs"
        >
          {copied ? <Check className="w-4 h-4 text-[#2F4C43]" /> : <Copy className="w-4 h-4" />}
          <span>{copied ? "Copied Email to Clipboard!" : "Copy Email Draft"}</span>
        </button>

        <a
          href={mailtoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#5D0D18] hover:bg-[#470912] text-[#FFF9EB] px-5 py-2.5 rounded-xl font-semibold text-xs transition-colors shadow-sm"
        >
          <Send className="w-4 h-4" />
          <span>Open in Mail App</span>
        </a>
      </div>
    </div>
  );
}
