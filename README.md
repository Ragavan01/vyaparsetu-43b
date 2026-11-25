# VyaparSetu 43B — MSME Invoice Audit, §37(2)(g) / §43B(h) & TReDS Copilot

Built for **BUILD 2036 (11th TiE Global Summit 2026, Indore — Track 06: The Rise of New India)**.

**VyaparSetu 43B** helps Indore's Pithampur & Sanwer Road industrial MSMEs turn delayed corporate invoices into protected, T+1 working capital—and scales across Bharat's **6.3+ crore MSMEs** by 2036. Zero login walls: judges experience multimodal Gemini Vision invoice auditing, dual-regime 2026 statutory calculation, TReDS arbitrage, and live Google Search policy grounding in under 15 seconds.

---

## 2026 Statutory & Financial Precision

- **Dual Income-Tax Regime Switcher**:
  - **Tax Year 2026–27**: Section 37(2)(g) of the *Income-tax Act, 2025* (reported in **Form No. 26** under Section 63).
  - **FY 2025–26 Carry-Forwards**: Section 43B(h) of the *Income-tax Act, 1961* (**Form 3CD Clause 22**).
- **Strict MSE Scope Enforcement**: Protections apply strictly to Udyam-registered **Micro & Small** enterprises; **Medium** and Unverified suppliers are explicitly flagged as excluded.
- **Separate Legal Triggers**:
  1. **MSMED Act §16 Compound Interest**: Accrues immediately past Day 15 (oral/no written agreement) or Day 45 (written agreement ceiling) at **3× RBI Bank Rate** (`5.75%` baseline per 7 Oct 2026 RBI notification → `17.25% p.a.` compounded monthly), non-deductible under **MSMED Act §23**.
  2. **March 31 Cliff Tax Disallowance**: Corporate buyer deduction (e.g., `25.17%` corporate tax rate) is deferred to the actual payment year when an overdue MSE invoice remains unpaid on **31 March**, with **no Section 139(1) ITR-filing grace period**.
- **TReDS ₹250 Cr Mandate**: Highlights mandatory onboarding for corporate buyers with `₹250 Cr+` turnover across **M1xchange, RXIL, and Invoicemart**.

---

## System Architecture

```text
Browser Client (Next.js 15 App Router · Editorial Ivory/Indigo · WCAG 2.2 AA)
  ├── Audit Studio     (Upload JPG/PNG/WebP <=4MB or 3 SVG Pithampur Samples)
  ├── 43B(h) Ledger    (Search, Urgency/Cliff Filters, Bilingual EN/HI Notices)
  ├── TReDS Simulator  (Instant <16ms Arbitrage vs Informal Credit + Checklist)
  └── Indore Pulse     (Live NH-52 Weather, Export FX, RBI Rate & Policy Search)
           │
           ├── Pure Deterministic Domain Layer (/lib/gstin, statutory, treds, notices)
           │
           ▼
Next.js Route Handlers (Server-Only Secrets · Zod · 4MB Cap · IP Rate Limiter)
  ├── POST /api/ai        ──► @google/genai (gemini-4-hydrogen: Vision + Google Search)
  └── GET  /api/live-data ──► Open-Meteo (22.61°N, 75.69°E) + Frankfurter FX (Null-Safe)
```

---

## Problem-to-Feature Matrix & BUILD 2036 Pitch Mapping

| Pitch Slides | Problem / Narrative | Live App Proof |
| :--- | :--- | :--- |
| Slides 1–3 | ₹10L+ Cr MSME cash trap in Pithampur & Sanwer Road | Pre-seeded `Illustrative Pithampur Pilot` Ledger |
| Slides 4–6 | Section 37(2)(g) / 43B(h) + TReDS ₹250 Cr threshold | Dual Regime Switcher + Live Google Search Grounding |
| Slides 7–9 | 15-second Invoice Photo → Audit → TReDS → Hinglish Nudge | Audit Studio + TReDS Simulator + Bilingual Notice |
| Slides 10–11 | Zero-hallucination math, data provenance & security | Deterministic engine + Zod + CSP + `npm run verify` |
| Slides 12–15 | B2B SaaS + 15–25 bps TReDS take-rate → 2036 Bharat scale | TReDS margin math + Corridor-to-National roadmap |

---

## Local Setup & Verification

1. Copy `.env.example` to `.env.local` and set `GEMINI_API_KEY` (kept strictly server-side; never exposed to the browser).
2. Install dependencies and start the server:

```bash
npm install
npm run dev
```

3. Run the single-command judge verification gate (strict TypeScript, ESLint, Vitest unit & security suite, and static modularity/security/WCAG audit):

```bash
npm run verify
```

---

## 2036 Bharat Scale Roadmap

- **2026–2027 (Indore & MP Wedge)**: Onboard 1,500+ Pithampur, Sanwer Road, Palda & Dewas suppliers via local CA chapters and industrial associations.
- **2028–2030 (Industrial Corridors)**: Direct API integration with TReDS exchanges (M1xchange, RXIL, Invoicemart), GSTN e-Invoice IRP, and Account Aggregator (AA) rails across Rajkot, Surat, Coimbatore & Ludhiana.
- **2031–2036 (National Public Digital Layer)**: Autonomous OCEN-linked instant invoice underwriting and Form No. 26 statutory reconciliation for 6.3+ crore MSMEs across Bharat.
