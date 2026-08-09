# Project Status — LeaseLens

## General Info
- **Project Name**: LeaseLens
- **Tagline**: Know what you're signing.
- **Project Purpose**: AI-powered residential lease analyzer helping ordinary tenants understand complex financial terms, deadlines, and risky clauses.

---

## Milestone Progress

- **Current Milestone**: M2 Accuracy Bugfix & Grounding Verification (Completed)
- **Completed Milestones**:
  - [x] M0: Foundation + GitHub Setup
  - [x] M1: PDF Upload + Text Extraction (Page-Aware)
  - [x] M2: AI Lease Analysis Pipeline (Gemini 2.5 Flash + Server Citation Verification)
  - [x] M3: Split-Screen PDF Viewer & Exact-Page Clause Navigation
  - [x] M4: Grounded "Ask My Lease" AI Chat Assistant (3 Grounding Rules)
- **Next Milestone**:
  - [ ] M5: Optional Landlord Clarification Email Generator (or next planned milestone)

---

## M2 Accuracy Bugfix Summary
- **Page-Aware PDF Extraction**: Updated [`src/app/api/extract-pdf/route.ts`](file:///c:/Users/Lenovo/Documents/leaselens/src/app/api/extract-pdf/route.ts) to structure extracted PDF text with explicit page headers (`--- PAGE X ---`), preserving page boundaries throughout the entire analysis pipeline.
- **Server-Side Citation Verification**: Implemented `verifyAndFixClauseCitations` in [`src/app/api/analyze-lease/route.ts`](file:///c:/Users/Lenovo/Documents/leaselens/src/app/api/analyze-lease/route.ts) to verify and auto-correct quoted clause page numbers against actual document page text.
- **Factual Extraction Accuracy**: Priority rules enforced for exact numerical values ($1,500.00 rent, $2,000.00 security deposit, $150.00 repair deductible), exact grace period (3rd day of the month), and explicit lease dates (January 1, 2027 – December 31, 2027).
- **Risk Classification Rules**: Enforced general risk classification reasoning:
  - `HIGH`: Unrestricted landlord entry without notice (Page 5).
  - `MEDIUM`: Automatic renewal traps (Page 3), Late fee structure (Page 2), Repair deductible (Page 4).
- **Grounding Verification (M4 Q&A)**: Preserved 3 strict grounding rules for Ask My Lease:
  1. Unrelated questions → *"I can only answer questions about this lease agreement."*
  2. Unaddressed lease topics → *"This topic is not addressed in your lease agreement."*
  3. Answered lease topics → Answer based strictly on lease text with source citations.

---

## Technical Stack & Architecture
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **AI Model**: Gemini 2.5 Flash via `@google/genai`
- **PDF Viewer**: Embedded PDF Viewer Component with URL fragment page targeting (`#page=X`)
- **PDF Extraction**: `pdfjs-dist` (legacy engine with Base64 worker Data URL)
- **Icons**: `lucide-react`

---

## Known Issues
- None (Build passes cleanly with 0 compilation or type errors).

---

## Local Run & Build Commands
```bash
# Start development server
npm run dev

# Run production build validation
npm run build

# Start production server
npm run start
```
