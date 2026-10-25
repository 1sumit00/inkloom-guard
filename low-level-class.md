classDiagram
    class ScanOrchestrator {
        +TextComplianceAuditor text_auditor
        +VisualComplianceAuditor visual_auditor
        +ScoreCalculator score_calc
        +run_full_scan(submission_id: UUID, payload: ScanPayload) ScanResult
    }

    class TextComplianceAuditor {
        +QdrantClient vector_db
        +LLMClient llm_client
        +check_banned_terms(text: str, lexicon: list) list~Issue~
        +retrieve_relevant_rules(text: str, org_id: UUID) list~GuidelineRule~
        +evaluate_claims_and_tone(text: str, rules: list~GuidelineRule~) list~Issue~
    }

    class VisualComplianceAuditor {
        +extract_dominant_colors(image_bytes: bytes, k: int) list~HexColor~
        +compute_delta_e(color1: RGB, color2: RGB) float
        +calculate_wcag_contrast(fg_rgb: RGB, bg_rgb: RGB) float
        +audit_image(image_bytes: bytes, palette: list~str~) list~Issue~
    }

    class WorkflowStateMachine {
        +transition_state(submission_id: UUID, actor: User, target_state: str, comment: str) ApprovalLog
        +resolve_issue(issue_id: UUID, actor: User, action: str, override_reason: str) FlaggedIssue
        +compute_sha256_audit_hash(version_data: dict) str
    }

    class GovernanceAnalyticsService {
        +get_recurring_mistakes(org_id: UUID, timeframe: str) list~CategoryMetric~
        +detect_ambiguous_rules(org_id: UUID, threshold_pct: float) list~AmbiguousRuleAlert~
    }

    ScanOrchestrator --> TextComplianceAuditor : invokes
    ScanOrchestrator --> VisualComplianceAuditor : invokes
    WorkflowStateMachine --> GovernanceAnalyticsService : updates metrics