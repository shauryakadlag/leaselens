# Project Status — LeaseLens

## General Info
- **Project Name**: LeaseLens
- **Tagline**: Know what you're signing.
- **Project Purpose**: AI-powered residential lease analyzer helping ordinary tenants understand complex financial terms, deadlines, and risky clauses.

---

## Milestone Progress

- **Current Milestone**: M1 — PDF Upload + Text Extraction (Completed)
- **Completed Milestones**:
  - [x] M0: Foundation + GitHub Setup
  - [x] M1: PDF Upload + Text Extraction
- **Next Milestone**:
  - [ ] M2: PDF Text Preprocessing & AI Lease Analysis Pipeline

---

## M1 Implementation Summary
- **Frontend Dropzone UI**: Built a responsive drag-and-drop file selector in `src/app/page.tsx` accepting `.pdf` documents with visual drag states, progress spinners, file size display, and success/error views.
- **Backend Extraction API**: Created Next.js server route `src/app/api/extract-pdf/route.ts` using `pdf-parse` (v2.4.5) to parse binary PDF data.
- **Validation & Quality Checks**: Validated MIME type, file size limit (15MB), and checked extracted text volume (handling scanned/image-only PDFs gracefully with an informative error message).
- **Client Session State**: Cached extracted text, word count, page count, and metadata in React client state for handoff to M2.

---

## Technical Stack & Architecture
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **PDF Extraction**: `pdf-parse` (v2.4.5)
- **Icons**: `lucide-react`

---

## Known Issues
- None (Build passes cleanly with 0 compilation or type errors).

---

## Required Environment Variables (Future Milestones)
- `GEMINI_API_KEY`: API key for Gemini LLM lease analysis (Required starting M2/M3).

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
