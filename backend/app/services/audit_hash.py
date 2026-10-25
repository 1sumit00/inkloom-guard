"""
Inkloom Guard - Cryptographic Audit Logger
Generates SHA-256 integrity hashes for immutable document versioning and audit trails.
"""

import hashlib
import json
from typing import Dict, Any, Optional

def compute_sha256_hash(data: Any) -> str:
    """Computes SHA-256 hash of string or JSON-serializable dictionary."""
    if isinstance(data, dict) or isinstance(data, list):
        serialized = json.dumps(data, sort_keys=True, default=str)
    else:
        serialized = str(data)
    return hashlib.sha256(serialized.encode("utf-8")).hexdigest()

def generate_audit_entry_hash(
    actor_id: str,
    action: str,
    timestamp: str,
    previous_hash: Optional[str] = None,
    extra_payload: Optional[Dict[str, Any]] = None
) -> str:
    """Creates a cryptographic chain block hash connecting to the previous audit log."""
    block = {
        "actor_id": actor_id,
        "action": action,
        "timestamp": timestamp,
        "previous_hash": previous_hash or "GENESIS",
        "payload": extra_payload or {}
    }
    return compute_sha256_hash(block)
