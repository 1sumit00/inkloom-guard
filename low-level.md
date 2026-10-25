graph TB
    subgraph Client_Layer ["1. Client Layer (Next.js 15 + Tailwind + Shadcn UI)"]
        UI_Studio["Review Studio UI<br/>(Split-Screen Diff & Canvas)"]
        UI_Vault["Brand Knowledge Vault<br/>(Rule & Asset Uploader)"]
        UI_Flow["RBAC Approval Pipeline<br/>(Stepper & Audit Log)"]
        UI_Insights["Governance Analytics<br/>(Override & Clarity Charts)"]
    end

    subgraph API_Gateway ["2. API & Auth Layer (FastAPI)"]
        AuthMW["JWT & RBAC Middleware<br/>(Creator | Reviewer | Admin)"]
        TenantMW["Tenant Isolation Filter<br/>(Zero-Retention Headers)"]
        Router_Scan["/api/v1/scans<br/>ScanController"]
        Router_Vault["/api/v1/vault<br/>VaultController"]
        Router_Workflow["/api/v1/workflows<br/>WorkflowController"]
    end

    subgraph Core_Engine ["3. Multi-Modal Compliance Engine (Python Services)"]
        Orchestrator["ScanOrchestratorService<br/>(Async Task Dispatcher)"]
        
        subgraph Text_Pipeline ["Text & Fact Auditor"]
            RegexEngine["Deterministic Lexicon Matcher<br/>(Banned Terms / Regex)"]
            RAGRetriever["Hybrid RAG Retriever<br/>(Dense Vector + BM25)"]
            LLMAuditor["LLM Structured Auditor<br/>(Gemini 2.5 Pro JSON Schema)"]
        end

        subgraph Visual_Pipeline ["Visual & Accessibility Auditor"]
            OCRService["OCR & Layout Parser<br/>(PyMuPDF / Tesseract)"]
            ColorEngine["Delta-E Palette Matcher<br/>(OpenCV / Pillow K-Means)"]
            WCAGEngine["WCAG 2.1 Contrast Calculator<br/>(Relative Luminance Formula)"]
        end

        ClarityEngine["Rule Clarity Analyzer<br/>(Override Rate Aggregator)"]
    end

    subgraph Data_Layer ["4. Persistence & Vector Layer"]
        PG[("PostgreSQL 16<br/>(Users, Drafts, Issues, AuditLogs)")]
        Qdrant[("Qdrant / pgvector<br/>(Chunked Brand Rules & Facts)")]
        S3[("MinIO / S3 Object Store<br/>(Encrypted Assets & PDFs)")]
        Redis[("Redis Cache & Queue<br/>(Scan Jobs & Rate Limits)")]
    end

    UI_Studio --> AuthMW
    UI_Vault --> AuthMW
    UI_Flow --> AuthMW
    UI_Insights --> AuthMW

    AuthMW --> TenantMW
    TenantMW --> Router_Scan
    TenantMW --> Router_Vault
    TenantMW --> Router_Workflow

    Router_Scan --> Orchestrator
    Orchestrator --> Redis
    Orchestrator --> RegexEngine
    Orchestrator --> RAGRetriever
    Orchestrator --> ColorEngine
    Orchestrator --> WCAGEngine
    
    RAGRetriever --> Qdrant
    RAGRetriever --> LLMAuditor
    OCRService --> WCAGEngine
    
    Router_Vault --> Qdrant
    Router_Vault --> S3
    Router_Workflow --> PG
    Orchestrator --> PG
    ClarityEngine --> PG