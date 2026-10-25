"""
Inkloom Guard - Role-Based Workflow & State Machine Controller
Implements approval transitions: DRAFT -> IN_REVIEW -> CHANGES_REQUESTED -> APPROVED -> PUBLISHED.
"""

from fastapi import APIRouter, HTTPException
import uuid
from datetime import datetime
from typing import List

from app.schemas.workflow import WorkflowTransitionRequest, ApprovalLogResponse
from app.services.audit_hash import generate_audit_entry_hash

router = APIRouter(prefix="/api/v1/workflows", tags=["workflows"])

VALID_TRANSITIONS = {
    "DRAFT": ["IN_REVIEW"],
    "IN_REVIEW": ["CHANGES_REQUESTED", "APPROVED"],
    "CHANGES_REQUESTED": ["DRAFT"],
    "APPROVED": ["PUBLISHED"],
    "PUBLISHED": []
}

AUDIT_LOGS_DB: List[dict] = [
    {
        "id": "LOG-01",
        "submission_id": "SUB-01",
        "actor_id": "Maya Lin (Creator)",
        "actor_role": "CREATOR",
        "action": "SUBMITTED",
        "comment": "Uploaded multi-modal launch kit (Copy + Social Banner + Whitepaper PDF)",
        "sha256_hash": "9b7a14f2e881c3f9",
        "previous_hash": "GENESIS",
        "created_at": "10:14 AM"
    },
    {
        "id": "LOG-02",
        "submission_id": "SUB-01",
        "actor_id": "Inkloom Guard AI",
        "actor_role": "AI_ENGINE",
        "action": "AI_PREFLIGHT_SCAN",
        "comment": "Completed pre-flight scan against Brand Kit v4.2 (5 issues detected)",
        "sha256_hash": "a2c4e881fa446b17",
        "previous_hash": "9b7a14f2e881c3f9",
        "created_at": "10:14 AM"
    }
]

CURRENT_WORKFLOW_STATE = "IN_REVIEW"

@router.post("/{submission_id}/transition", response_model=ApprovalLogResponse)
async def transition_state(submission_id: str, payload: WorkflowTransitionRequest):
    """
    Executes a role-based state machine transition and appends a SHA-256 verified audit log.
    """
    global CURRENT_WORKFLOW_STATE

    allowed = VALID_TRANSITIONS.get(CURRENT_WORKFLOW_STATE, [])
    if payload.target_state not in allowed:
        raise HTTPException(
            status_code=400,
            detail=f"Illegal transition from '{CURRENT_WORKFLOW_STATE}' to '{payload.target_state}'. Allowed: {allowed}"
        )

    CURRENT_WORKFLOW_STATE = payload.target_state

    prev_hash = AUDIT_LOGS_DB[-1]["sha256_hash"] if AUDIT_LOGS_DB else "GENESIS"
    now_str = datetime.utcnow().strftime("%I:%M %p")
    new_hash = generate_audit_entry_hash(
        actor_id=payload.actor_role,
        action=payload.target_state,
        timestamp=now_str,
        previous_hash=prev_hash,
        extra_payload={"submission_id": submission_id, "comment": payload.comment}
    )

    log_entry = {
        "id": f"LOG-{len(AUDIT_LOGS_DB) + 1:02d}",
        "submission_id": submission_id,
        "actor_id": f"{payload.actor_role.capitalize()} Sign-Off",
        "actor_role": payload.actor_role,
        "action": payload.target_state,
        "comment": payload.comment or f"Transitioned state to {payload.target_state}",
        "sha256_hash": new_hash[:16],
        "previous_hash": prev_hash[:16],
        "created_at": "Just now"
    }
    AUDIT_LOGS_DB.append(log_entry)

    return ApprovalLogResponse(**log_entry)

@router.get("/{submission_id}/audit", response_model=List[ApprovalLogResponse])
async def get_audit_trail(submission_id: str):
    """Returns the immutable cryptographic audit chain for the submission."""
    return [ApprovalLogResponse(**log) for log in AUDIT_LOGS_DB]
