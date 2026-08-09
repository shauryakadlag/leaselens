# HANDOFF DOCUMENT — LeaseLens

This document allows any developer or AI coding agent to take over the LeaseLens project instantly.

---

## 1. Project Purpose & Product Vision

### Product Name
**LeaseLens** — *Know what you're signing.*

### Problem Statement
Residential lease agreements are long and complex. Tenants frequently miss key financial responsibilities, deadlines, restrictions, and unusual/risky clauses.

### Product Solution
An AI-powered residential lease document analyzer. Users upload a lease PDF, and LeaseLens delivers:
1. Tenant Risk Index
2. Financial Summary
3. Important Dates & Deadlines
4. Flagged Risky/Unusual Clauses with Plain-English Explanations
5. PDF Clause Navigation / References
6. Grounded "Ask My Lease" Q&A
7. Optional Landlord Clarification Email Generator

*Legal Disclaimer Notice*: LeaseLens is an informational document-analysis tool. It must NOT claim to offer legal advice.

---

## 2. Current Implementation State (Milestone 1 Complete)

- **Completed**:
  - **M0**: Initialized Next.js project, TypeScript, Tailwind CSS, git repo, and GitHub connection.
  - **M1**: 
    - Created responsive drag-and-drop PDF upload UI (`src/app/page.tsx`).
    - Implemented server route `/api/extract-pdf/route.ts` using `pdf-parse` (v2.4.5 `PDFParse` class).
    - Integrated client-side file size and format validation (max 15MB, PDF only).
    - Added scanned / image-only PDF detection with clear error guidance.
    - Stored extracted text, page count, and word count in client session state (`extractedData`) ready for M2.
    - Verified production build compiles cleanly (`npm run build`).

- **Incomplete / Pending Future Milestones**:
  - M2: AI Analysis Pipeline (Gemini integration & structured prompt output).
  - M3: Risk Index & Summary Dashboard.
  - M4: Flagged clauses panel & clause explanations.
  - M5: Ask My Lease Q&A component.
  - M6: Responsive Polish (Mobile & Desktop).
  - M7: Landlord Email Generator.
  - M8/M9: Testing, polish, final deployment.

---

## 3. Technology Stack & Key Files

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **PDF Extraction**: `pdf-parse` (v2.4.5)
- **Icons**: `lucide-react`

### Key Files
- `src/app/page.tsx` — Main upload UI & extracted document state wrapper.
- `src/app/api/extract-pdf/route.ts` — Server route for PDF binary parsing & validation.
- `src/app/layout.tsx` — Root layout with global styling and metadata.
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

When AI analysis is integrated (M2+), create `.env.local`:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

---

## 6. Exact Next Recommended Task

**Proceed to Milestone 2 (M2)**:
- Create Gemini LLM analysis pipeline to take `extractedData.text` and produce structured analysis JSON (Tenant Risk Index, Financial Obligations, Important Deadlines, Flagged Clauses with plain-English explanations).

---

## 7. Critical Technical Constraints & Warnings for Future Agents

- **DO NOT** add authentication, databases, complex RAG vector DBs, or admin panels unless explicitly requested by the user.
- **DO NOT** remove or alter the disclaimer stating that LeaseLens is an informational tool (not legal advice).
- **DO** treat mobile and desktop responsiveness as first-class requirements at every step.
- **DO** verify build (`npm run build`) before completing milestones.
