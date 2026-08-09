# Project Status — LeaseLens

## General Info
- **Project Name**: LeaseLens
- **Tagline**: Know what you're signing.
- **Project Purpose**: AI-powered residential lease analyzer helping ordinary tenants understand complex financial terms, deadlines, and risky clauses.

---

## Milestone Progress

- **Current Milestone**: M3 — Split-Screen PDF Viewer & Clause Page Navigation (Completed)
- **Completed Milestones**:
  - [x] M0: Foundation + GitHub Setup
  - [x] M1: PDF Upload + Text Extraction
  - [x] M2: AI Lease Analysis Pipeline (Gemini 2.5 Flash)
  - [x] M3: Split-Screen PDF Viewer & Exact-Page Clause Navigation
- **Next Milestone**:
  - [ ] M4: Grounded "Ask My Lease" Q&A (or next planned milestone)

---

## M3 Implementation Summary
- **Split-Screen Studio Layout**:
  - Desktop / Laptop (`lg:` viewports): Integrated sticky split-screen view featuring interactive PDF Document Viewer on the left (5/12 columns) and AI Analysis Dashboard on the right (7/12 columns).
- **Exact-Page Clause Navigation**:
  - Added `"View on Page X"` target jump buttons on every flagged clause card.
  - Automatically parses section/page reference and updates `PDFViewer` active page state instantly upon click.
- **Mobile & Tablet Responsive Tab Switcher**:
  - Implemented responsive tab controls (**Dashboard** vs **PDF Document**) for mobile/tablet screens.
  - Tapping `"View on Page X"` on a mobile device automatically switches to the PDF tab and scrolls to target page X.
- **PDFViewer Component**: Created [`src/app/components/PDFViewer.tsx`](file:///c:/Users/Lenovo/Documents/leaselens/src/app/components/PDFViewer.tsx) supporting URL object lifecycle, page controls (Prev/Next/Current), target fragment jumping, and external opening.

---

## Technical Stack & Architecture
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **PDF Viewer**: Native embedded PDF viewer component with URL fragment page targeting (`#page=X`)
- **AI SDK**: `@google/genai` (Gemini 2.5 Flash)
- **PDF Text Extraction**: `pdf-parse` (v2.4.5)
- **Icons**: `lucide-react`

---

## Known Issues
- None (Build passes cleanly with 0 compilation or type errors).

---

## Required Environment Variables
- `GEMINI_API_KEY`: Google Gemini API Key (Add to `.env.local` for live Gemini 2.5 Flash calls).

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

---

## Core Project Constraints
1. **Informational Tool Only**: LeaseLens must NEVER claim to provide legal advice or definitive legal conclusions.
2. **First-Class Responsiveness**: Desktop and Mobile experiences are both primary requirements.
3. **Simple & Reliable Architecture**: Avoid unnecessary databases, authentication systems, or over-engineered RAG frameworks for the hackathon MVP.
