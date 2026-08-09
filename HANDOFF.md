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
5. PDF Clause Navigation / Page Jump References
6. Grounded "Ask My Lease" Q&A
7. Optional Landlord Clarification Email Generator

*Legal Disclaimer Notice*: LeaseLens is an informational document-analysis tool. It must NOT claim to offer legal advice.

---

## 2. Current Implementation State (Milestone 4 Complete & Bugfixed)

- **Completed**:
  - **M0**: Next.js 16 project foundation, TypeScript, Tailwind CSS v4, Git repository, GitHub connection.
  - **M1**: Drag-and-drop PDF upload UI, server PDF text extraction route (`/api/extract-pdf/route.ts`) powered by Base64 worker `pdfjs-dist` engine.
  - **M2**: Installed `@google/genai` (Google Gen AI SDK v2.16.0), AI Lease Analysis route `/api/analyze-lease/route.ts` powered by **Gemini 2.5 Flash**, smart rule-based fallback analyzer.
  - **M3**: Built split-screen layout (`src/app/page.tsx` & `src/app/components/PDFViewer.tsx`), exact-page target jump navigation (`"View on Page X"`), responsive Mobile/Tablet view switcher tabs.
  - **M4**:
    - Built grounded AI Q&A API route `/api/ask-lease/route.ts` using Gemini 2.5 Flash with strict document grounding.
    - Added strict 3-case classification logic:
      1. Unrelated questions -> `"I can only answer questions about this lease agreement."`
      2. Unaddressed lease topics -> `"This topic is not addressed in your lease agreement."`
      3. Document-grounded answers -> Plain English answers with section citations.
    - Integrated suggested question chips bar for quick 1-click queries.
    - Built interactive chat assistant component `src/app/components/AskMyLease.tsx`.
    - Verified production build (`npm run build`) compiles 100% cleanly with zero errors.

- **Incomplete / Pending Future Milestones**:
  - M5: Optional Landlord Clarification Email Generator.
  - M6: Responsive Mobile & Desktop visual polish audit.
  - M7: Testing, final submission prep.

---

## 3. Technology Stack & Key Files

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **PDF Viewer**: Embedded PDF Viewer Component with URL fragment page targeting (`#page=X`)
- **AI Model**: Gemini 2.5 Flash via `@google/genai`
- **PDF Extraction**: `pdfjs-dist` legacy Base64 worker engine
- **Icons**: `lucide-react`

### Key Files
- `src/app/page.tsx` — Main application UI with Upload, Text Extraction, Split-Screen Studio, Dashboard & Ask My Lease views.
- `src/app/components/AskMyLease.tsx` — Grounded AI Q&A chat assistant component with suggested question chips.
- `src/app/components/PDFViewer.tsx` — PDF Document Viewer component with page controls and target fragment jumping.
- `src/app/api/ask-lease/route.ts` — Server route for grounded Gemini 2.5 Flash Q&A and 3-case classification fallback search.
- `src/app/api/analyze-lease/route.ts` — Server route for Gemini 2.5 Flash AI analysis & fallback analyzer.
- `src/app/api/extract-pdf/route.ts` — Server route for binary PDF text parsing using `pdfjs-dist` legacy engine.
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

---

## 6. Exact Next Recommended Task

**Proceed to Milestone 5 (M5)** when instructed by user:
- Implement optional Landlord Clarification Email Generator component allowing tenants to generate formal, polite clarification emails for flagged lease clauses.

---

## 7. Critical Technical Constraints & Warnings for Future Agents

- **DO NOT** add authentication, databases, complex RAG vector DBs, or admin panels unless explicitly requested by the user.
- **DO NOT** remove or alter the disclaimer stating that LeaseLens is an informational tool (not legal advice).
- **DO** treat mobile and desktop responsiveness as first-class requirements at every step.
- **DO** verify build (`npm run build`) before completing milestones.
