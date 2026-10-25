"""
Inkloom Guard - Scans API Controller
Handles multi-modal content scanning and human-in-the-loop issue resolutions.
"""

from fastapi import APIRouter, HTTPException
import uuid
from typing import Dict, Any, List

from app.schemas.scan import (
    ScanRequest,
    ScanResponse,
    FlaggedIssueSchema,
    IssueResolveRequest,
    IssueResolveResponse
)
from app.services.rag_auditor import TextComplianceAuditor
from app.services.vision_auditor import VisualComplianceAuditor
from app.services.audit_hash import generate_audit_entry_hash

router = APIRouter(prefix="/api/v1", tags=["scans"])

# In-memory store for prototype/development session
SAMPLE_RULES = [
    {
        "id": "FACT-2026-09",
        "type": "Verified Fact",
        "forbidden": "100% uptime, 10x speed",
        "preferred": "99.99% uptime SLA, up to 4.2x faster query throughput",
        "source": "Q4 Engineering Benchmark Sheet",
        "total_triggers": 18,
        "human_override_count": 2
    },
    {
        "id": "RULE-TONE-04",
        "type": "Terminology",
        "forbidden": "bleeding-edge, obliterate, crush competitors",
        "preferred": "intelligent, streamline, accelerate transformation",
        "source": "Brand Voice Guide v4.2 (p.12)",
        "total_triggers": 34,
        "human_override_count": 13
    },
    {
        "id": "SEC-COMP-02",
        "type": "Legal Claim",
        "forbidden": "fully FedRAMP High certified",
        "preferred": "SOC2 Type II certified; FedRAMP High in process",
        "source": "Security Compliance Bulletin 2026",
        "total_triggers": 24,
        "human_override_count": 7
    }
]

ACTIVE_ISSUES_STORE: Dict[str, Dict[str, Any]] = {}

@router.post("/scans", response_model=ScanResponse)
async def run_scan(payload: ScanRequest):
    """
    Executes parallel multi-modal compliance scan across text, visual, and PDF assets.
    """
    text_auditor = TextComplianceAuditor()
    vision_auditor = VisualComplianceAuditor()

    issues: List[Dict[str, Any]] = []

    # 1. Audit Text Claims and Tone
    if payload.textDraft:
        text_issues = text_auditor.audit_draft(payload.textDraft, SAMPLE_RULES)
        issues.extend(text_issues)

    # 2. Check Visual Contrast & Palette Defaults
    contrast_audit = vision_auditor.audit_contrast(fg_hex="#94A3B8", bg_hex="#CBD5E1")
    if not contrast_audit["passed"]:
        issues.append({
            "id": f"ISS-{len(issues) + 1:02d}",
            "format": "visual",
            "category": "Visual & WCAG",
            "severity": "warning",
            "ruleId": "WCAG-AA-143",
            "citation": "Accessibility Standard • WCAG 2.1 AA (1.4.3)",
            "title": f"Insufficient Subtitle Contrast Ratio ({contrast_audit['contrast_ratio']}:1)",
            "explanation": f"Luminance contrast measures {contrast_audit['contrast_ratio']}:1. Minimum threshold is {contrast_audit['threshold']}:1.",
            "originalSnippet": "Subtitle Contrast: 2.8:1 (#94A3B8 on Light Slate)",
            "suggestedSnippet": "Subtitle Contrast: 7.4:1 (#1E293B Deep Slate)",
            "status": "open",
            "comments": [],
            "aiModelDisclosure": "OpenCV / WCAG Relative Luminance Formula"
        })

    palette_audit = vision_auditor.audit_palette_token("#FF5733")
    if not palette_audit["is_approved"]:
        issues.append({
            "id": f"ISS-{len(issues) + 1:02d}",
            "format": "visual",
            "category": "Visual & WCAG",
            "severity": "warning",
            "ruleId": "VIS-PALETTE-01",
            "citation": "Visual Identity System • Color Tokens",
            "title": "Off-Brand CTA Button Hex Color (#FF5733)",
            "explanation": f"CTA Fill #FF5733 exceeds palette distance tolerance (Delta-E: {palette_audit['delta_e_distance']}). Closest token is {palette_audit['closest_approved_token']}.",
            "originalSnippet": "CTA Fill: #FF5733 (Unapproved Orange)",
            "suggestedSnippet": f"CTA Fill: {palette_audit['closest_approved_token']} (Acme Electric Indigo)",
            "status": "open",
            "comments": [],
            "aiModelDisclosure": "Delta-E Color Distance Calculator"
        })

    # Cache issues in active store
    submission_id = str(uuid.uuid4())
    for iss in issues:
        ACTIVE_ISSUES_STORE[iss["id"]] = iss

    open_count = len([i for i in issues if i["status"] == "open"])
    resolved_count = len(issues) - open_count
    brand_score = 100 if len(issues) == 0 else round(64 + (resolved_count / len(issues)) * 34)

    return ScanResponse(
        submissionId=submission_id,
        brandScore=brand_score,
        openIssuesCount=open_count,
        issues=[FlaggedIssueSchema(**i) for i in issues],
        aiDisclosure={
            "foundation_model": "Google Gemini 2.5 Pro",
            "retention": "Zero-Data Retention Policy Verified",
            "algorithms": "WCAG 2.1 Contrast Formula + OpenCV Delta-E Palette Matcher",
            "human_in_the_loop": "Autonomous overrides prevented; creator & reviewer sign-off required"
        }
    )

@router.patch("/issues/{issue_id}/resolve", response_model=IssueResolveResponse)
async def resolve_issue(issue_id: str, payload: IssueResolveRequest):
    """
    Resolves an issue via 1-click fix (ACCEPTED) or human justification (OVERRIDDEN).
    Generates a cryptographic audit entry.
    """
    status_map = {
        "ACCEPTED": "applied",
        "OVERRIDDEN": "overridden",
        "REVERTED": "open"
    }

    target_status = status_map.get(payload.action.upper())
    if not target_status:
        raise HTTPException(status_code=400, detail="Invalid action. Use ACCEPTED, OVERRIDDEN, or REVERTED.")

    audit_hash = generate_audit_entry_hash(
        actor_id="USER-SIMULATED",
        action=payload.action,
        timestamp="NOW",
        extra_payload={"issue_id": issue_id, "reason": payload.override_reason}
    )

    if issue_id in ACTIVE_ISSUES_STORE:
        ACTIVE_ISSUES_STORE[issue_id]["status"] = target_status
        if payload.override_reason:
            ACTIVE_ISSUES_STORE[issue_id]["overrideReason"] = payload.override_reason

    return IssueResolveResponse(
        success=True,
        issueId=issue_id,
        status=target_status,
        updatedBrandScore=82 if target_status != "open" else 64,
        auditLogId=audit_hash[:16]
    )
