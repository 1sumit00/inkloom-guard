from pydantic import BaseModel, Field
from typing import Optional, List

class GuidelineRuleCreate(BaseModel):
    id: Optional[str] = None
    type: str = Field(description="Terminology | Verified Fact | Legal Claim | Visual Token")
    forbidden: str
    preferred: str
    source: str

class GuidelineRuleResponse(BaseModel):
    id: str
    type: str
    forbidden: str
    preferred: str
    source: str
    total_triggers: int = 0
    human_override_count: int = 0

class BrandGuidelineResponse(BaseModel):
    id: str
    title: str
    version_hash: str
    is_active: bool
    rules: List[GuidelineRuleResponse] = []
