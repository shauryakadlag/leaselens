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

## 2. Current Implementation State (Milestone 2 Complete)

- **Completed**:
  - **M0**: Next.js 16 project foundation, TypeScript, Tailwind CSS v4, Git repository, GitHub connection.
  - **M1**: Drag-and-drop PDF upload UI, server PDF text extraction route (`/api/extract-pdf/route.ts`), file size & MIME type validation, scanned PDF detection.
  - **M2**: 
    - Installed `@google/genai` (Google Gen AI SDK v2.16.0).
    - Built AI Lease Analysis route `/api/analyze-lease/route.ts` powered by **Gemini 2.5 Flash**.
    - Defined structured JSON analysis schema (Tenant Risk Index, Financial Obligations, Key Dates, Flagged Clauses with plain-English & "why it matters" explanations).
    - Included a fallback rule-based analyzer for offline / demo testing when `GEMINI_API_KEY` is not present.
    - Integrated responsive LeaseLens Dashboard UI in `src/app/page.tsx` with expandable clause cards.
    - Verified production build (`npm run build`) compiles cleanly with zero errors.

- **Incomplete / Pending Future Milestones**:
  - M3: Risk Dashboard & Clause Page Navigation refinements.
  - M4: Grounded "Ask My Lease" Q&A component.
  - M5: Optional Landlord Email Generator.
  - M6: Mobile & Desktop responsiveness audit & polish.
  - M7: Testing, final submission prep.

---

## 3. Technology Stack & Key Files

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **AI Model**: Gemini 2.5 Flash via `@google/genai`
- **PDF Extraction**: `pdf-parse` (v2.4.5)
- **Icons**: `lucide-react`

### Key Files
- `src/app/page.tsx` — Main application UI with PDF Upload, Text Extraction, and AI Dashboard views.
- `src/app/api/analyze-lease/route.ts` — Server route for Gemini 2.5 Flash AI analysis & fallback analyzer.
- `src/app/api/extract-pdf/route.ts` — Server route for binary PDF text parsing.
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

To run live Gemini 2.5 Flash analysis, create `.env.local`:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```
*(Note: If `GEMINI_API_KEY` is omitted, LeaseLens gracefully uses the built-in smart fallback analyzer).*

---

## 6. Exact Next Recommended Task

**Proceed to Milestone 3 (M3)**:
- Implement clause section navigation / page jump indicators and refine Risk Dashboard interactivity.

---

## 7. Critical Technical Constraints & Warnings for Future Agents

- **DO NOT** add authentication, databases, complex RAG vector DBs, or admin panels unless explicitly requested by the user.
- **DO NOT** remove or alter the disclaimer stating that LeaseLens is an informational tool (not legal advice).
- **DO** treat mobile and desktop responsiveness as first-class requirements at every step.
- **DO** verify build (`npm run build`) before completing milestones.
