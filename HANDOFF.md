# HANDOFF DOCUMENT — LeaseLens

This document allows any developer or AI coding agent to take over or evaluate the LeaseLens project instantly.

---

## 1. Project Purpose & Product Vision

### Product Name
**LeaseLens** — *Know what you're signing.*

### Problem Statement
Residential lease agreements are long and complex. Tenants frequently miss key financial responsibilities, deadlines, restrictions, and unusual/risky clauses.

### Product Solution
An AI-powered residential lease document analyzer. Users upload a lease PDF, and LeaseLens delivers:
1. Tenant Risk Index
2. Financial Summary (exact dollar values and grace period terms)
3. Total Lease Commitment & Cost Calculator (Move-In Cash + 1-Year Financial Outlay)
4. Important Dates & Deadlines (exact commencement and expiration dates)
5. Flagged Risky/Unusual Clauses with Plain-English Explanations, Recommendations, and Verified Page References
6. PDF Clause Navigation / Exact-Page Target Jump
7. Grounded "Ask My Lease" Q&A (with strict 3-tier grounding rules)
8. One-Click Landlord Clarification Email Generator

*Legal Disclaimer Notice*: LeaseLens is an informational document-analysis tool. It must NOT claim to offer legal advice.

---

## 2. Final Implementation State (All Milestones M0–M7 Complete)

- **Completed**:
  - **M0**: Next.js 16 project foundation, TypeScript, Tailwind CSS v4, Git repository, GitHub connection.
  - **M1**: Drag-and-drop PDF upload UI, server PDF text extraction route (`/api/extract-pdf/route.ts`), page-aware text delimiters (`--- PAGE X ---`), file size & MIME type validation, scanned PDF detection.
  - **M2**: Installed `@google/genai` (Google Gen AI SDK v2.16.0), AI Lease Analysis route `/api/analyze-lease/route.ts` powered by **Gemini 2.5 Flash**, server-side citation verification & auto-correction (`verifyAndFixClauseCitations`), explicit factual extraction rules, general risk classification reasoning.
  - **M3**: Built split-screen layout (`src/app/page.tsx` & `src/app/components/PDFViewer.tsx`), exact-page target jump navigation (`"View on Page X"`), responsive Mobile/Tablet view switcher tabs.
  - **M4**: Built grounded AI Q&A API route `/api/ask-lease/route.ts` using Gemini 2.5 Flash with strict 3-tier document grounding (unrelated rejection, unaddressed rejection, grounded Q&A).
  - **UI Redesign**: Transformed frontend into a production legal SaaS interface under the **"Château Shadows"** design system (`#FFF9EB` Vanilla Custard, `#9FB2AC` Misty Sage, `#5D0D18` Bloodstone).
  - **M5**: Built `LandlordEmailGenerator.tsx` and `TotalCostCalculator.tsx`, fully integrated into `src/app/page.tsx`.
  - **M6**: Completed final responsive UX audit and visual polish across 320px–1440px+ viewports.
  - **M7**: Final submission preparation, README documentation polish, production build verification, presentation demo packaging.
  - Verified production build (`npm run build`) compiles 100% cleanly with zero errors.

---

## 3. Technology Stack & Key Files

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 + Château Shadows palette
- **PDF Viewer**: Embedded PDF Viewer Component with URL fragment page targeting (`#page=X`)
- **AI Model**: Gemini 2.5 Flash via `@google/genai`
- **PDF Extraction**: `pdfjs-dist` (legacy engine with Base64 worker Data URL)
- **Icons**: `lucide-react`

### Key Files
- `src/app/page.tsx` — Main application UI featuring Upload, Page-Aware Extraction, Split-Screen Studio, Dashboard, Cost Calculator, Email Generator & Ask My Lease views.
- `src/app/components/LandlordEmailGenerator.tsx` — One-Click Landlord Email Generator component with clause selection, copy to clipboard, and mailto links.
- `src/app/components/TotalCostCalculator.tsx` — Total Lease Cost & Financial Commitment Calculator with interactive toggles.
- `src/app/components/PDFViewer.tsx` — PDF Document Viewer component with page controls and target fragment jumping.
- `src/app/components/AskMyLease.tsx` — Grounded AI Q&A chat assistant component with suggested question chips.
- `src/app/api/extract-pdf/route.ts` — Server route for page-aware PDF text parsing (`--- PAGE X ---`).
- `src/app/api/analyze-lease/route.ts` — Server route for Gemini 2.5 Flash AI analysis, factual extraction priority, risk classification, and server-side page verification.
- `src/app/api/ask-lease/route.ts` — Server route for grounded Gemini 2.5 Flash Q&A with 3-tier grounding classification.
- `README.md` — Complete project showcase and setup guide.
- `PROJECT_STATUS.md` — Active status and milestone tracking.
- `HANDOFF.md` — Developer/Agent context handoff file.

---

## 4. Setup & Run Instructions

```bash
# Start development server
npm run dev

# Validate production build
npm run build
```

---

## 5. Required Environment Variables

To run live Gemini 2.5 Flash analysis & Q&A, create `.env.local`:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```
*(Note: If `GEMINI_API_KEY` is omitted, LeaseLens gracefully uses the built-in smart fallback engine).*
