# Responsible AI & Technology Disclosures — Inkloom Guard v2.4 Enterprise

## 1. Explicit AI & External Foundation Model Disclosure
Inkloom Guard employs a hybrid architecture combining deterministic verification engines with generative foundation models:
* **LLM Engine**: **Google Gemini 2.5 Pro** (invoked with JSON Schema enforcement).
* **RAG Vector Search**: **Qdrant** / **pgvector** using dense embeddings (1536-dimensional) + BM25 keyword matching.
* **Deterministic Vision Engine**: **OpenCV** + CIE $\Delta E$ Euclidean color distance matcher.
* **Accessibility Engine**: Deterministic **WCAG 2.1 (1.4.3)** relative luminance contrast calculator ($L = 0.2126 R_{\text{lin}} + 0.7152 G_{\text{lin}} + 0.0722 B_{\text{lin}}$).

---

## 2. Zero-Data Retention & Enterprise Privacy Policy
* **Tenant Isolation**: Brand guidelines, unpublished promotional assets, and internal roadmaps are strictly partitioned per enterprise tenant ID.
* **Zero Training Guarantee**: Payloads submitted to the AI analysis pipeline are flagged with zero-data retention headers. Content is processed transiently in volatile memory and is **never** used to train external foundation models.
* **Local Fallback Mode**: When operated in air-gapped or offline environments, the system automatically falls back to deterministic regex and mathematical checks without contacting external APIs.

---

## 3. Human-in-the-Loop (HITL) Sovereignty & Auditability
* **No Autonomous Publishing**: AI suggestions are recommendations only. Inkloom Guard never unilaterally alters published copy or public campaign materials.
* **1-Click Intent-Preserving Fixes**: Creators retain full control to accept rewrites or provide domain-specific human override justifications.
* **Cryptographic Audit Trail**: Every accepted fix, human override, and managerial approval generates an immutable SHA-256 hash log chained to previous revisions (`APPROVAL_LOGS`).

---

## 4. Algorithmic Governance & Clarity Detector
* **Formula**: $\text{Rule Ambiguity Score} = \left(\frac{\text{human\_override\_count}}{\text{total\_triggers}}\right) \times 100$
* **Threshold**: When a brand rule triggers $\ge 10$ times and has $> 40\%$ human override rate, an alert is surfaced on the Brand Admin dashboard recommending documentation refinement.

---

## 5. Security & Zero-Secrets Compliance
* All secrets, database credentials, and service tokens are strictly loaded via external environment variables (`.env.local` / system env).
* No private keys, passwords, or connection strings are hardcoded into the source code or git history.
