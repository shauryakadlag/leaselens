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

## 2. Current Implementation State (Milestone 0 Complete)

- **Completed**:
  - Initialized Next.js (App Router, TypeScript, Tailwind CSS).
  - Configured git repository and `.gitignore` (safeguarding `.env` / secrets).
  - Set up core project structure in `src/app/`.
  - Added documentation (`README.md`, `PROJECT_STATUS.md`, `HANDOFF.md`).
  - Verified local build runs cleanly without errors.
- **Incomplete / Pending Future Milestones**:
  - M1: Landing page & PDF file dropzone UI.
  - M2: PDF text extraction API/service.
  - M3: AI prompt engineering & Gemini analysis pipeline.
  - M4: Tenant Risk Index & Financial Dashboard UI.
  - M5: Flagged clauses panel & clause-to-page navigation.
  - M6: Ask My Lease Q&A component.
  - M7: Responsive Polish (Mobile & Desktop).
  - M8: Landlord Email Generator.
  - M9/M10: Verification, testing, final deployment.

---

## 3. Technology Stack & Key Files

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4

### Key Files
- `src/app/page.tsx` — Main application landing/entry page.
- `src/app/layout.tsx` — Root layout with global styling and metadata.
- `PROJECT_STATUS.md` — Active status and milestone tracking.
- `HANDOFF.md` — Developer/Agent context handoff file.
- `.gitignore` — Security rules preventing secret/key leaks.

---

## 4. Setup & Run Instructions

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Validate production build
npm run build
```

---

## 5. Required Environment Variables

When AI analysis is integrated (M3+), create `.env.local`:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

---

## 6. Next Recommended Task

**Proceed to Milestone 1 (M1)**:
- Build the landing page UI and PDF drag-and-drop / file upload selector component.
- Implement client-side validation for PDF file selection.

---

## 7. Critical Technical Constraints & Warnings for Future Agents

- **DO NOT** add authentication, databases, complex RAG vector DBs, or admin panels unless explicitly requested by the user.
- **DO NOT** remove or alter the disclaimer stating that LeaseLens is an informational tool (not legal advice).
- **DO** treat mobile and desktop responsiveness as first-class requirements at every step.
- **DO** verify build (`npm run build`) before completing milestones.
