from pydantic import BaseModel
from typing import List

class ClarityAlertResponse(BaseModel):
    ruleId: str
    overrideRate: str
    problem: str
    recommendation: str
    clarified: bool = False

class GovernanceKpiResponse(BaseModel):
    assetsAudited: str
    unsupportedClaimsPrevented: str
    avgTurnaroundTime: str
    humanOverrideRate: str
    activeAmbiguousAlerts: int
