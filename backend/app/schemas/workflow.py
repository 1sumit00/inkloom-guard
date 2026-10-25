from pydantic import BaseModel, Field
from typing import Optional

class WorkflowTransitionRequest(BaseModel):
    target_state: str = Field(description="DRAFT | IN_REVIEW | CHANGES_REQUESTED | APPROVED | PUBLISHED")
    comment: Optional[str] = None
    actor_role: str = Field(default="REVIEWER", description="CREATOR | REVIEWER | BRAND_ADMIN")

class ApprovalLogResponse(BaseModel):
    id: str
    submission_id: str
    actor_id: str
    actor_role: str
    action: str
    comment: Optional[str] = None
    sha256_hash: str
    previous_hash: Optional[str] = None
    created_at: str
