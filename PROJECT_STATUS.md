# Project Status — LeaseLens

## General Info
- **Project Name**: LeaseLens
- **Tagline**: Know what you're signing.
- **Project Purpose**: AI-powered residential lease analyzer helping ordinary tenants understand complex financial terms, deadlines, and risky clauses.

---

## Milestone Progress

- **Current Milestone**: M4 — Grounded "Ask My Lease" AI Chat Assistant (Completed)
- **Completed Milestones**:
  - [x] M0: Foundation + GitHub Setup
  - [x] M1: PDF Upload + Text Extraction
  - [x] M2: AI Lease Analysis Pipeline (Gemini 2.5 Flash)
  - [x] M3: Split-Screen PDF Viewer & Exact-Page Clause Navigation
  - [x] M4: Grounded "Ask My Lease" AI Chat Assistant
- **Next Milestone**:
  - [ ] M5: Optional Landlord Clarification Email Generator (or next planned milestone)

---

## M4 Implementation Summary
- **Grounded AI Q&A Endpoint**: Built Next.js server route [`src/app/api/ask-lease/route.ts`](file:///c:/Users/Lenovo/Documents/leaselens/src/app/api/ask-lease/route.ts) invoking Gemini 2.5 Flash with strict system prompts enforcing the uploaded lease text as the sole source of truth.
- **Document Grounding & Citations**: Ensures AI responses directly quote or reference contract sections and page numbers. When a topic is omitted from the lease text, explicitly notifies the tenant.
- **Suggested Question Chips**: Provided 5 quick clickable query shortcuts for common tenant questions (rent due dates, pet rules/fees, move-out notice, utility breakdown, early termination penalties).
- **Interactive Chat Component**: Built [`src/app/components/AskMyLease.tsx`](file:///c:/Users/Lenovo/Documents/leaselens/src/app/components/AskMyLease.tsx) featuring message history, streaming loaders, markdown formatting, and grounded source badges.
- **Smart Fallback Q&A Engine**: Built-in grounded search algorithm when `GEMINI_API_KEY` is omitted, guaranteeing 100% offline and demo-mode testability.

---

## Technical Stack & Architecture
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **AI Model**: Gemini 2.5 Flash via `@google/genai`
- **PDF Viewer**: Embedded PDF Viewer Component with URL fragment page targeting (`#page=X`)
- **PDF Extraction**: `pdf-parse` (v2.4.5)
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
