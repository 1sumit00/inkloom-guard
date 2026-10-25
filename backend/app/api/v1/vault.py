"""
Inkloom Guard - Brand Knowledge Vault Controller
Handles ingestion and querying of brand rules, verified facts, and design tokens.
"""

from fastapi import APIRouter
from typing import List
from app.schemas.vault import GuidelineRuleCreate, GuidelineRuleResponse

router = APIRouter(prefix="/api/v1/vault", tags=["vault"])

RULES_DB: List[dict] = [
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
        "id": "FACT-2026-09",
        "type": "Verified Fact",
        "forbidden": "100% uptime, 10x speed",
        "preferred": "99.99% uptime SLA, up to 4.2x faster query throughput",
        "source": "Q4 Engineering Benchmark Sheet",
        "total_triggers": 18,
        "human_override_count": 2
    },
    {
        "id": "SEC-COMP-02",
        "type": "Legal Claim",
        "forbidden": "FedRAMP High certified",
        "preferred": "SOC2 Type II certified; FedRAMP High in process",
        "source": "Security Compliance Bulletin 2026",
        "total_triggers": 24,
        "human_override_count": 7
    },
    {
        "id": "VIS-PALETTE-01",
        "type": "Visual Token",
        "forbidden": "Unapproved warm neon accents (#FF5733)",
        "preferred": "Electric Indigo (#4F46E5) & Deep Slate (#0F172A)",
        "source": "Design System Tokens v4.2",
        "total_triggers": 15,
        "human_override_count": 1
    }
]

@router.get("/rules", response_model=List[GuidelineRuleResponse])
async def list_rules():
    """Returns all active brand guidelines, verified claims, and design tokens."""
    return [GuidelineRuleResponse(**r) for r in RULES_DB]

@router.post("/rules", response_model=GuidelineRuleResponse)
async def create_rule(payload: GuidelineRuleCreate):
    """Adds a new authoritative brand rule or verified fact into the knowledge index."""
    rule_id = payload.id or f"RULE-CUSTOM-0{len(RULES_DB) + 1}"
    new_rule = {
        "id": rule_id,
        "type": payload.type,
        "forbidden": payload.forbidden,
        "preferred": payload.preferred,
        "source": payload.source,
        "total_triggers": 0,
        "human_override_count": 0
    }
    RULES_DB.insert(0, new_rule)
    return GuidelineRuleResponse(**new_rule)
