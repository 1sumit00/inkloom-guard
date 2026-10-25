inkloom-guard/
├── frontend/                     # Next.js 15 (App Router, TypeScript, Tailwind, Shadcn UI)
│   ├── src/
│   │   ├── app/
│   │   │   ├── studio/           # View 1: Multi-Modal Review Studio (Split-screen)
│   │   │   ├── workflow/         # View 2: Collaborative RBAC Approval Pipeline
│   │   │   ├── vault/            # View 3: Brand Knowledge Vault (RAG Ingestion)
│   │   │   └── insights/         # View 4: Governance & Ambiguous Rule Analytics
│   │   ├── components/
│   │   │   ├── IssueCard.tsx     # Citation badge + 1-Click Rewrite + Override modal
│   │   │   ├── VisualCanvas.tsx  # Bounding box overlay for hex & WCAG contrast flags
│   │   │   └── DisclosureTag.tsx # Mandatory AI transparency badge
│   │   └── lib/api.ts            # Typed Axios/Fetch client
│
├── backend/                      # FastAPI (Python 3.11+)
│   ├── app/
│   │   ├── api/v1/
│   │   │   ├── scans.py          # POST /scans, PATCH /issues/{id}/resolve
│   │   │   ├── vault.py          # POST /vault/rules, POST /vault/guidelines
│   │   │   ├── workflows.py      # POST /workflows/{id}/transition
│   │   │   └── analytics.py      # GET /analytics/clarity-alerts
│   │   ├── services/
│   │   │   ├── rag_auditor.py    # LlamaIndex/Qdrant + Gemini Structured Output
│   │   │   ├── vision_auditor.py # OpenCV Delta-E color check + WCAG 2.1 luminance
│   │   │   └── audit_hash.py     # SHA-256 revision logger
│   │   ├── models/               # SQLAlchemy / SQLModel database tables
│   │   └── schemas/              # Pydantic strict JSON output schemas
│   └── requirements.txt
│
├── docker-compose.yml            # PostgreSQL (pgvector) + Qdrant + Redis + MinIO
└── DISCLOSURES.md                # Mandatory hackathon AI & library disclosure file