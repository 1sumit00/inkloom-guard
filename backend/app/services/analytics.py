"""
Inkloom Guard - Governance & Rule Ambiguity Analytics Service
Implements Ambiguous Brand Rule Detection Formula from algorithms.txt.
"""

from typing import List, Dict, Any

class GovernanceAnalyticsService:
    def __init__(self, override_threshold_pct: float = 40.0, min_triggers: int = 10):
        self.override_threshold_pct = override_threshold_pct
        self.min_triggers = min_triggers

    def compute_rule_ambiguity_score(self, human_override_count: int, total_triggers: int) -> float:
        """
        Calculates Rule Ambiguity Score per algorithms.txt:
        Rule Ambiguity Score = (human_override_count / total_triggers) * 100
        """
        if total_triggers <= 0:
            return 0.0
        score = (human_override_count / total_triggers) * 100.0
        return round(score, 1)

    def is_rule_ambiguous(self, human_override_count: int, total_triggers: int) -> bool:
        """Surfaces alert if total_triggers >= 10 and ambiguity score > 40%."""
        if total_triggers < self.min_triggers:
            return False
        score = self.compute_rule_ambiguity_score(human_override_count, total_triggers)
        return score > self.override_threshold_pct

    def generate_clarity_alerts(self, rules: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Scans rules for high human override rates and generates actionable recommendations."""
        alerts = []
        for r in rules:
            override_count = r.get("human_override_count", 0)
            triggers = r.get("total_triggers", 0)
            rule_id = r.get("id", "UNKNOWN")

            if self.is_rule_ambiguous(override_count, triggers):
                score = self.compute_rule_ambiguity_score(override_count, triggers)
                alerts.append({
                    "ruleId": rule_id,
                    "overrideRate": f"{score}% Human Override Rate ({override_count}/{triggers} triggers)",
                    "problem": f"Frequent human overrides detected on {rule_id}. Creators often bypass this rule with justification.",
                    "recommendation": f"Update the wording or provide domain-specific exceptions in the Knowledge Vault for {rule_id}.",
                    "clarified": False
                })
        return alerts
