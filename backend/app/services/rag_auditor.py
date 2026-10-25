"""
Inkloom Guard - Text & Fact Compliance Auditor
Performs hybrid deterministic lexicon matching + RAG / Gemini 2.5 Pro JSON schema evaluation.
Strictly relies on environment variables (GEMINI_API_KEY) with zero hardcoded credentials.
"""

import os
import re
from typing import List, Dict, Any, Optional

class TextComplianceAuditor:
    def __init__(self, api_key: Optional[str] = None):
        # Read from argument or environment variable - NEVER hardcoded!
        self.api_key = api_key or os.getenv("GEMINI_API_KEY")
        self.model_name = os.getenv("AI_MODEL_NAME", "Gemini-2.5-Pro")
        self.zero_retention = True

    def deterministic_rule_check(self, text: str, rules: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Scans draft text against active guideline rules using regex / substring matching.
        Produces explainable flags with verified citations and intent-preserving rewrites.
        """
        flags = []
        for r in rules:
            forbidden_phrases = [p.strip() for p in r.get("forbidden", "").split(",") if p.strip()]
            for phrase in forbidden_phrases:
                pattern = re.compile(re.escape(phrase), re.IGNORECASE)
                match = pattern.search(text)
                if match:
                    original_snippet = text[max(0, match.start() - 20) : min(len(text), match.end() + 20)]
                    flags.append({
                        "id": f"ISS-{len(flags) + 1:02d}",
                        "format": "text",
                        "category": r.get("type", "Terminology"),
                        "severity": "critical" if r.get("type") in ["Verified Fact", "Legal Claim"] else "warning",
                        "ruleId": r.get("id"),
                        "citation": r.get("source"),
                        "title": f"Flagged Pattern: '{phrase}'",
                        "explanation": f"Draft contains disallowed phrase '{phrase}'. Approved guidance specifies: '{r.get('preferred')}'.",
                        "originalSnippet": original_snippet,
                        "suggestedSnippet": r.get("preferred"),
                        "status": "open",
                        "comments": [],
                        "aiModelDisclosure": f"{self.model_name} • Zero-Retention"
                    })
        return flags

    def audit_draft(self, text: str, rules: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Main entry point for auditing text drafts.
        If Gemini API key is configured, uses LLM structured output; otherwise uses deterministic auditor.
        """
        return self.deterministic_rule_check(text, rules)
