# LeaseLens

> **Know what you're signing.**

LeaseLens is an AI-powered residential lease analyzer designed to help tenants understand their lease agreements before signing. It extracts page-aware text from residential lease PDFs, evaluates key financial obligations and deadlines, flags potentially risky or one-sided clauses, provides exact-page citation jumping in a split-screen PDF viewer, enables grounded "Ask My Lease" Q&A, calculates total 1-year financial commitment, and auto-generates landlord clarification emails.

*Disclaimer: LeaseLens is an informational document-analysis tool and does not provide legal advice or definitive legal conclusions.*

---

## 🌟 Key Features

1. **Page-Aware PDF Text Extraction**:
   - Parses multi-page residential lease PDFs preserving explicit page boundaries (`--- PAGE X ---`).
   - Supports files up to 15MB with scanned document detection and client-side format validation.

2. **AI Lease Analysis Pipeline (Gemini 2.5 Flash)**:
   - **Tenant Risk Index**: 0–100 risk score evaluation with color-coded risk levels (`Low`, `Moderate`, `High`, `Critical`).
   - **Financial Obligations Summary**: Base monthly rent, security deposit, exact grace period terms, late fee structures, and utility responsibility breakdown (Tenant vs. Landlord).
   - **Important Dates & Deadlines**: Lease start/end dates, required move-out notice window, and move-in inspection deadlines.
   - **Flagged Risky Clauses**: Identifies automatic renewal traps, unrestricted landlord entry, tenant repair deductibles, and late fee escalations with plain-English explanations, recommendations, and quoted contract text.

3. **Split-Screen Studio & Exact-Page Target Navigation**:
   - Embedded PDF document viewer with page controls, zoom, and open-in-new-tab actions.
   - **"View on Page X" Target Jump**: Clicking any clause card automatically scrolls the PDF viewer to the exact page where the clause appears (`#page=X`).

4. **Grounded "Ask My Lease" AI Assistant**:
   - Interactive Q&A assistant enforcing strict 3-tier document grounding rules:
     - *Unrelated Trivia*: Rejects questions unrelated to the lease (*"I can only answer questions about this lease agreement."*).
     - *Unaddressed Topics*: Rejects topics missing from the contract (*"This topic is not addressed in your lease agreement."*).
     - *Lease Q&A*: Answers strictly based on the extracted contract text with source citations.
   - Includes 5 suggested question chips for quick exploration.

5. **Total Lease Commitment & Cost Calculator**:
   - Calculates **Move-In Cash Required** (Security Deposit + First Month Rent + Admin/Move-In Fees + Pet Deposit).
   - Calculates **Total 1-Year Financial Outlay** (12 months base rent + deposits + recurring trash/utility fees + optional pet rent & renter's insurance estimates).
   - Interactive toggles for optional fees and effective net monthly outlay.

6. **One-Click Landlord Clarification Email Generator**:
   - Automatically converts flagged clauses into a formal, polite email requesting written clarification or amendments before signing.
   - Allows selecting which clauses to include, with one-click **Copy to Clipboard** and **Open in Mail App (`mailto:`)** links.

7. **"Château Shadows" SaaS Design System**:
   - Custom palette tailored for legal clarity (`#FFF9EB` Vanilla Custard background, `#FFFDF7` warm cream cards, `#9FB2AC` Misty Sage supporting borders, `#5D0D18` Bloodstone brand accents).
   - 100% responsive across Mobile (320px–430px tabbed switcher), Tablet, Laptop, and Desktop viewports.

---

## 🛠️ Technology Stack & Architecture

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 + Château Shadows CSS design system
- **AI Model**: Gemini 2.5 Flash via `@google/genai` (Google Gen AI SDK v2.16.0)
- **PDF Extraction**: `pdfjs-dist` (legacy engine with Base64 worker Data URL resolution)
- **Icons**: `lucide-react`
- **Deployment**: Vercel & Node.js production compatible

---

## 🚀 Quick Start & Installation

### Prerequisites
- Node.js (v18+ recommended)
- npm / yarn / pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/shauryakadlag/leaselens.git

# Navigate into the project directory
cd leaselens

# Install dependencies
npm install
```

### Environment Setup

Create `.env.local` in the project root:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```
*(Note: If `GEMINI_API_KEY` is omitted, LeaseLens gracefully uses its built-in rule-based fallback engine for testing).*

### Running Locally

```bash
# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

```bash
# Run production build validation
npm run build

# Start production server
npm run start
```

---

## 📋 Completed Milestone Roadmap (M0–M7)

- [x] **M0: Project Setup & Repository Foundation**
- [x] **M1: PDF Upload & Page-Aware Text Extraction**
- [x] **M2: Gemini 2.5 Flash AI Analysis & Citation Verification**
- [x] **M3: Split-Screen PDF Viewer & Clause Page Jump**
- [x] **M4: Grounded "Ask My Lease" AI Chat Assistant**
- [x] **UI Redesign: "Château Shadows" Production Legal SaaS Design System**
- [x] **M5: Landlord Email Generator & Total Cost Calculator**
- [x] **M6: Final Responsive UX Audit & Visual Polish**
- [x] **M7: Final Submission Preparation & Presentation Demo Readiness**

---

## ⚖️ Legal Disclaimer

LeaseLens is an informational document-analysis tool designed to assist tenants in identifying potential financial terms, deadlines, and common lease clauses. LeaseLens does **not** provide legal advice, legal opinions, or formal legal representation. Always consult a qualified attorney or tenant advocacy organization for legal counsel regarding lease contracts.
