sequenceDiagram
    autonumber
    actor Creator
    participant UI as Next.js Review Studio
    participant API as FastAPI (/scans)
    participant Vault as Qdrant Vector DB
    participant Vision as OpenCV + WCAG Engine
    participant LLM as Gemini 2.5 Pro (JSON Mode)
    participant DB as PostgreSQL

    Creator->>UI: Upload Draft (Markdown + Banner PNG)
    UI->>API: POST /api/v1/scans (multipart/form-data)
    API->>DB: Create ContentSubmission (status = SCANNING)
    
    par Parallel Multi-Modal Analysis
        API->>Vault: Query Hybrid Search (Draft Claims & Tone Rules)
        Vault-->>API: Top-K Approved Facts & Guideline Chunks (rule_id, page)
        API->>LLM: Prompt with Draft + Retrieved Rules (Zero-Training Header)
        LLM-->>API: Structured JSON Flags + Citations + Intent-Preserving Rewrites
    and Visual & Accessibility Check
        API->>Vision: Analyze Banner PNG (Extract Hex + Bounding Boxes)
        Vision-->>API: Delta-E Palette Distance + WCAG Contrast Ratios (e.g., 2.8:1)
    end

    API->>DB: Bulk Insert FlaggedIssues + Compute Governance Score (64%)
    API-->>UI: Return ScanReport JSON + AI Disclosure Metadata
    UI-->>Creator: Render Split-Screen Highlights & Issue Cards

    alt Creator Clicks "Apply Rewrite / Fix"
        Creator->>UI: Click "Apply Rewrite" on Issue #1
        UI->>API: PATCH /api/v1/issues/{id}/resolve (action = ACCEPTED)
        API->>DB: Update Draft Revision + Append SHA-256 AuditLog + Recalculate Score (82%)
        API-->>UI: Updated Score & Diff State
    else Creator Clicks "Override with Reason"
        Creator->>UI: Submit Justification ("Approved regional slang for Q3")
        UI->>API: PATCH /api/v1/issues/{id}/resolve (action = OVERRIDDEN, reason)
        API->>DB: Mark Issue Overridden + Increment Rule Override Counter
        API-->>UI: Flag Cleared (Human Control Preserved)
    end