# LeaseLens

> **Know what you're signing.**

LeaseLens is an AI-powered residential lease analyzer designed to help tenants understand their lease agreements before signing. It extracts text from residential lease PDFs, identifies key financial obligations and deadlines, flags potentially risky or unusual clauses, provides plain-English explanations, and enables interactive "Ask My Lease" Q&A.

*Disclaimer: LeaseLens is an informational document-analysis tool and does not provide legal advice or definitive legal conclusions.*

---

## 🚀 Technology Stack

- **Framework**: Next.js (App Router, React 19)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Deployment**: Vercel-compatible

---

## 🛠️ Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm / yarn / pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/<username>/leaselens.git

# Navigate into the project directory
cd leaselens

# Install dependencies
npm install
```

### Running Locally

```bash
# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the app.

### Building for Production

```bash
# Run production build
npm run build

# Start production server
npm run start
```

---

## 📋 Development Roadmap

- [x] **M0: Foundation + GitHub Setup**
- [ ] **M1**: Landing Page & PDF Upload
- [ ] **M2**: PDF Text Extraction
- [ ] **M3**: AI Analysis Pipeline
- [ ] **M4**: Risk Index & Summary Dashboard
- [ ] **M5**: Flagged Clauses & Document Navigation
- [ ] **M6**: Ask My Lease (Interactive Q&A)
- [ ] **M7**: Responsive Refinement (Desktop & Mobile)
- [ ] **M8**: Optional Landlord Clarification Email Generator
- [ ] **M9**: Comprehensive Testing & UI Polish
- [ ] **M10**: Deployment & Submission Prep

---

## 🔒 Environment Variables

Future milestones will require an LLM API key. Create a `.env.local` file in the root directory when prompted:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

*Note: Never commit `.env` or `.env.local` to Git.*
