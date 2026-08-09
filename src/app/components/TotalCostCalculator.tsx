"use client";

import { useState } from "react";
import { Calculator } from "lucide-react";
import { LeaseAnalysisResult } from "../api/analyze-lease/route";

interface TotalCostCalculatorProps {
  financialSummary: LeaseAnalysisResult["financialSummary"];
}

export default function TotalCostCalculator({
  financialSummary,
}: TotalCostCalculatorProps) {
  const [includePetFees, setIncludePetFees] = useState(false);
  const [includeInsurance, setIncludeInsurance] = useState(true);

  // Detect active currency symbol from financial summary text
  const detectCurrency = (str1: string, str2: string): string => {
    const combined = `${str1 || ""} ${str2 || ""}`;
    if (combined.includes("₹") || combined.toLowerCase().includes("inr") || combined.toLowerCase().includes("rs")) {
      return "₹";
    }
    if (combined.includes("€") || combined.toLowerCase().includes("eur")) {
      return "€";
    }
    if (combined.includes("£") || combined.toLowerCase().includes("gbp")) {
      return "£";
    }
    return "$";
  };

  const currencySymbol = detectCurrency(
    financialSummary.monthlyRent,
    financialSummary.securityDeposit
  );

  // Parse numerical amounts cleanly from multi-currency strings (e.g. ₹35,000, ₹2,10,000, $1,500.00, Rs 35000)
  const parseAmount = (str: string, fallback: number): number => {
    if (!str) return fallback;
    const match = str.match(/(?:₹|INR|Rs\.?|\$|€|£)?\s*([0-9,]+(?:\.[0-9]{2})?)/i);
    if (match && match[1]) {
      const numStr = match[1].replace(/,/g, "");
      const val = parseFloat(numStr);
      if (!isNaN(val) && val > 0) return val;
    }
    return fallback;
  };

  const defaultRentFallback = currencySymbol === "₹" ? 35000 : 1500;
  const defaultDepositFallback = currencySymbol === "₹" ? 210000 : 2000;

  const monthlyRentNum = parseAmount(financialSummary.monthlyRent, defaultRentFallback);
  const securityDepositNum = parseAmount(financialSummary.securityDeposit, defaultDepositFallback);

  // Parse admin / move-in fee / utility / pet fees
  let moveInAdminFeeNum = currencySymbol === "₹" ? 3500 : 150;
  let trashFeeMonthlyNum = currencySymbol === "₹" ? 500 : 25;
  let petDepositNum = currencySymbol === "₹" ? 5000 : 300;
  let petRentMonthlyNum = currencySymbol === "₹" ? 1000 : 35;
  const insuranceMonthlyNum = currencySymbol === "₹" ? 300 : 15;

  if (financialSummary.additionalFees && Array.isArray(financialSummary.additionalFees)) {
    financialSummary.additionalFees.forEach((fee) => {
      const lower = fee.toLowerCase();
      if (lower.includes("move-in") || lower.includes("admin") || lower.includes("painting")) {
        moveInAdminFeeNum = parseAmount(fee, moveInAdminFeeNum);
      }
      if (lower.includes("trash") || lower.includes("maintenance")) {
        trashFeeMonthlyNum = parseAmount(fee, trashFeeMonthlyNum);
      }
      if (lower.includes("pet deposit")) {
        petDepositNum = parseAmount(fee, petDepositNum);
      }
      if (lower.includes("pet fee") || lower.includes("pet rent")) {
        petRentMonthlyNum = parseAmount(fee, petRentMonthlyNum);
      }
    });
  }

  // Calculate Totals
  const moveInCashTotal =
    monthlyRentNum +
    securityDepositNum +
    moveInAdminFeeNum +
    (includePetFees ? petDepositNum : 0);

  const annualBaseRent = monthlyRentNum * 12;
  const annualTrashFees = trashFeeMonthlyNum * 12;
  const annualPetFees = includePetFees ? petRentMonthlyNum * 12 + petDepositNum : 0;
  const annualInsurance = includeInsurance ? insuranceMonthlyNum * 12 : 0;

  const totalFirstYearCommitment =
    annualBaseRent +
    securityDepositNum +
    moveInAdminFeeNum +
    annualTrashFees +
    annualPetFees +
    annualInsurance;

  const averageMonthlyEffectiveCost = Math.round(
    (totalFirstYearCommitment - securityDepositNum) / 12
  );

  const formatCurrency = (val: number): string => {
    const formatted =
      currencySymbol === "₹"
        ? val.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        : val.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return `${currencySymbol}${formatted}`;
  };

  const formatCompact = (val: number): string => {
    const formatted =
      currencySymbol === "₹"
        ? val.toLocaleString("en-IN")
        : val.toLocaleString("en-US");
    return `${currencySymbol}${formatted}`;
  };

  return (
    <div className="bg-[#FFFDF7] border border-[#EADFCF] rounded-2xl p-6 shadow-sm space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#EADFCF] pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-[#5D0D18]/10 border border-[#5D0D18]/20 flex items-center justify-center text-[#5D0D18]">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-serif font-bold text-[#1E1517]">
              Total Lease Commitment &amp; Cost Calculator
            </h3>
            <p className="text-xs text-[#544B4C]">
              Calculate exact move-in cash required and 1-year total financial commitment
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Options Toggles */}
      <div className="flex flex-wrap items-center gap-4 text-xs pt-1">
        <label className="flex items-center gap-2 cursor-pointer select-none bg-[#FAF4E6] px-3 py-1.5 rounded-lg border border-[#EADFCF] text-[#1E1517]">
          <input
            type="checkbox"
            checked={includePetFees}
            onChange={(e) => setIncludePetFees(e.target.checked)}
            className="accent-[#5D0D18] rounded"
          />
          <span>Include Pet Fees ({formatCompact(petDepositNum)} deposit + {formatCompact(petRentMonthlyNum)}/mo)</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer select-none bg-[#FAF4E6] px-3 py-1.5 rounded-lg border border-[#EADFCF] text-[#1E1517]">
          <input
            type="checkbox"
            checked={includeInsurance}
            onChange={(e) => setIncludeInsurance(e.target.checked)}
            className="accent-[#5D0D18] rounded"
          />
          <span>Include Insurance Estimate ({formatCompact(insuranceMonthlyNum)}/mo)</span>
        </label>
      </div>

      {/* 2 Key Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Card 1: Move-In Cash Required */}
        <div className="bg-[#FAF4E6] p-5 rounded-xl border border-[#EADFCF] space-y-2">
          <span className="text-xs font-semibold text-[#544B4C] uppercase tracking-wider block">
            Move-In Cash Required
          </span>
          <span className="text-2xl sm:text-3xl font-serif font-bold text-[#5D0D18] block">
            {formatCurrency(moveInCashTotal)}
          </span>
          <div className="text-[11px] text-[#544B4C] pt-2 border-t border-[#EADFCF]/80 space-y-1">
            <div className="flex justify-between">
              <span>First Month Rent:</span>
              <span className="font-semibold text-[#1E1517]">{formatCompact(monthlyRentNum)}</span>
            </div>
            <div className="flex justify-between">
              <span>Security Deposit:</span>
              <span className="font-semibold text-[#1E1517]">{formatCompact(securityDepositNum)}</span>
            </div>
            <div className="flex justify-between">
              <span>Move-In / Admin / Prep:</span>
              <span className="font-semibold text-[#1E1517]">{formatCompact(moveInAdminFeeNum)}</span>
            </div>
            {includePetFees && (
              <div className="flex justify-between text-[#5D0D18]">
                <span>Pet Deposit:</span>
                <span className="font-semibold">{formatCompact(petDepositNum)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Card 2: Total 1-Year Financial Commitment */}
        <div className="bg-[#EFF4F2] p-5 rounded-xl border border-[#C3D2CD] space-y-2">
          <span className="text-xs font-semibold text-[#2F4C43] uppercase tracking-wider block">
            Total 1-Year Financial Outlay
          </span>
          <span className="text-2xl sm:text-3xl font-serif font-bold text-[#1E1517] block">
            {formatCurrency(totalFirstYearCommitment)}
          </span>
          <div className="text-[11px] text-[#544B4C] pt-2 border-t border-[#C3D2CD]/80 space-y-1">
            <div className="flex justify-between">
              <span>12 Months Base Rent:</span>
              <span className="font-semibold text-[#1E1517]">{formatCompact(annualBaseRent)}</span>
            </div>
            <div className="flex justify-between">
              <span>Security Deposit (Refundable):</span>
              <span className="font-semibold text-[#1E1517]">{formatCompact(securityDepositNum)}</span>
            </div>
            <div className="flex justify-between">
              <span>Maintenance / Fees (12 mo):</span>
              <span className="font-semibold text-[#1E1517]">{formatCompact(annualTrashFees)}</span>
            </div>
            {includeInsurance && (
              <div className="flex justify-between">
                <span>Renter&apos;s Insurance (12 mo):</span>
                <span className="font-semibold text-[#1E1517]">{formatCompact(annualInsurance)}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Effective Net Monthly Outlay Banner */}
      <div className="bg-[#FAF4E6] p-3.5 rounded-xl border border-[#EADFCF] flex items-center justify-between text-xs">
        <span className="text-[#544B4C] font-medium">
          Effective Net Monthly Outlay (Rent + Fees - Deposit):
        </span>
        <span className="font-serif font-bold text-[#1E1517] text-sm">
          ~{formatCompact(averageMonthlyEffectiveCost)}/month
        </span>
      </div>
    </div>
  );
}
