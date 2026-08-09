# Project Status — LeaseLens

## General Info
- **Project Name**: LeaseLens
- **Tagline**: Know what you're signing.
- **Project Purpose**: AI-powered residential lease analyzer helping ordinary tenants understand complex financial terms, deadlines, and risky clauses.

---

## Milestone Progress

- **Current Milestone**: M0 — Foundation + GitHub Setup
- **Completed Milestones**:
  - [x] M0: Foundation + GitHub Setup
- **Next Milestone**:
  - [ ] M1: Landing page + PDF upload UI

---

## Technical Stack & Architecture
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Runtime**: Node.js v24+ / npm

---

## Known Issues
- None at present (M0 foundation build passes clean).

---

## Required Environment Variables (Future Milestones)
- `GEMINI_API_KEY`: API key for Gemini LLM lease analysis and Q&A pipeline.

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
2. **First-Class Responsiveness**: Desktop and Mobile experiences are both primary requirements (split view on desktop, intentional responsive stacking on mobile).
3. **Simple & Reliable Architecture**: Avoid unnecessary databases, authentication systems, or over-engineered RAG frameworks for the hackathon MVP.
