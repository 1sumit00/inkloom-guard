erDiagram
    ORGANIZATIONS ||--o{ USERS : employs
    ORGANIZATIONS ||--o{ BRAND_GUIDELINES : owns
    ORGANIZATIONS ||--o{ CONTENT_SUBMISSIONS : produces
    
    BRAND_GUIDELINES ||--o{ GUIDELINE_RULES : contains
    CONTENT_SUBMISSIONS ||--o{ SUBMISSION_VERSIONS : tracks
    SUBMISSION_VERSIONS ||--o{ FLAGGED_ISSUES : generates
    GUIDELINE_RULES ||--o{ FLAGGED_ISSUES : cited_in
    CONTENT_SUBMISSIONS ||--o{ APPROVAL_LOGS : audited_by

    ORGANIZATIONS {
        uuid id PK
        string name
        jsonb approved_hex_palette "e.g. ['#4F46E5', '#0F172A']"
        float min_wcag_ratio "Default 4.5"
        timestamp created_at
    }

    USERS {
        uuid id PK
        uuid org_id FK
        string email
        string role "CREATOR | REVIEWER | BRAND_ADMIN"
    }

    BRAND_GUIDELINES {
        uuid id PK
        uuid org_id FK
        string title "e.g. Brand Voice v4.2.pdf"
        string file_url
        string version_hash
        boolean is_active
    }

    GUIDELINE_RULES {
        uuid id PK
        uuid guideline_id FK
        string rule_code "e.g. FACT-102, TONE-04"
        string category "TONE | CLAIM | TERM | VISUAL | A11Y"
        text rule_text
        string source_citation "e.g. Section 4.2, Page 14"
        vector embedding "vector(1536) for RAG"
        int total_triggers "For governance analytics"
        int human_override_count "Flags unclear rules if high"
    }

    CONTENT_SUBMISSIONS {
        uuid id PK
        uuid org_id FK
        uuid creator_id FK
        string title
        string content_type "MARKDOWN | IMAGE | PDF"
        string workflow_status "DRAFT | IN_REVIEW | CHANGES_REQUESTED | APPROVED"
        int current_governance_score "0 to 100"
        timestamp updated_at
    }

    SUBMISSION_VERSIONS {
        uuid id PK
        uuid submission_id FK
        int version_number
        text text_payload
        string asset_s3_url
        string sha256_hash "Immutable integrity hash"
        timestamp created_at
    }

    FLAGGED_ISSUES {
        uuid id PK
        uuid version_id FK
        uuid rule_id FK
        string category "CLAIM | TONE | VISUAL | A11Y"
        string severity "CRITICAL | WARNING | MINOR"
        text original_snippet "Offending text or hex/bbox"
        text explanation "Why it was flagged"
        text suggested_rewrite "Intent-preserving fix"
        string status "OPEN | ACCEPTED | OVERRIDDEN"
        text override_reason "Nullable human justification"
        string ai_model_disclosure "e.g. Gemini-2.5-Pro"
    }

    APPROVAL_LOGS {
        uuid id PK
        uuid submission_id FK
        uuid actor_id FK
        string action "SUBMITTED | ACCEPTED_FIX | OVERRODE_FLAG | APPROVED | REJECTED"
        text comment
        string previous_hash
        timestamp created_at
    }