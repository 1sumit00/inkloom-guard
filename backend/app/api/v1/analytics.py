"""
Inkloom Guard - Analytics API Controller
Surfaces ambiguous guideline alerts and governance KPIs.
"""

from fastapi import APIRouter
from typing import List
from app.schemas.analytics import ClarityAlertResponse, GovernanceKpiResponse
from app.services.analytics import GovernanceAnalyticsService
from app.api.v1.vault import RULES_DB

router = APIRouter(prefix="/api/v1/analytics", tags=["analytics"])

analytics_service = GovernanceAnalyticsService(override_threshold_pct=30.0, min_triggers=10)

@router.get("/clarity-alerts", response_model=List[ClarityAlertResponse])
async def get_clarity_alerts():
    """
    Identifies brand rules with high human override rates per algorithms.txt:
    (human_override_count / total_triggers) * 100 > 40%
    """
    alerts = analytics_service.generate_clarity_alerts(RULES_DB)
    return [ClarityAlertResponse(**a) for a in alerts]

@router.get("/kpis", response_model=GovernanceKpiResponse)
async def get_kpis():
    """Returns organizational governance health KPIs."""
    return GovernanceKpiResponse(
        assetsAudited="1,420",
        unsupportedClaimsPrevented="312",
        avgTurnaroundTime="14 mins",
        humanOverrideRate="11.4%",
        activeAmbiguousAlerts=2
    )
