stateDiagram-v2
    [*] --> DRAFT : Creator uploads content

    state DRAFT {
        [*] --> AI_Scanning : Trigger Pre-Publication Scan
        AI_Scanning --> Issues_Flagged : Returns Explainable Flags + Rewrites
        Issues_Flagged --> Creator_Resolving : 1-Click Rewrite OR Override with Reason
    }

    DRAFT --> IN_REVIEW : Creator clicks "Submit for Review"<br/>(Requires 0 unresolved CRITICAL flags OR explicit override reason)

    state IN_REVIEW {
        [*] --> Pending_Manager_Audit
        Pending_Manager_Audit --> Inspecting_Diff_And_Overrides : Reviewer checks AI flags & human justifications
    }

    IN_REVIEW --> CHANGES_REQUESTED : Reviewer rejects override or requests edit
    CHANGES_REQUESTED --> DRAFT : Creator edits draft (New Version v2 created)

    IN_REVIEW --> APPROVED : Reviewer signs off<br/>(Generates SHA-256 Approval Certificate)
    APPROVED --> PUBLISHED : Ready for external channels
    PUBLISHED --> [*]