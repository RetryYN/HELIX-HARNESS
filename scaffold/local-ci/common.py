"""Shared encoding and non-K1 CLI diagnostics for the provisional CI driver."""
from __future__ import annotations
import hashlib
import json

CHECK_IDS = ("LC-SCF-001", "LC-SCF-002", "LC-GOV-001", "LC-DIFF-001", "LC-DESIGN-001", "LC-STAGE1-L7-001")

class Diagnostic(Exception):
    """Internal control flow; never a persisted K1 record or execution state."""
    def __init__(self, classification: str, reason: str, detail: str = ""):
        super().__init__(classification + ":" + reason)
        self.classification, self.reason, self.detail = classification, reason, detail
    def as_dict(self):
        return {"classification": self.classification, "reason": self.reason, "detail": self.detail}

def canonical_bytes(value) -> bytes:
    try:
        return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":"), allow_nan=False).encode("utf-8", "strict")
    except (TypeError, ValueError, UnicodeError, RecursionError) as exc:
        raise Diagnostic("Rejected", "invalid_input", "non-canonical JSON input") from exc

def sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()

def strict_json(data: bytes | str):
    def pairs(items):
        result = {}
        for key, value in items:
            if key in result:
                raise Diagnostic("Rejected", "invalid_input", "duplicate JSON key")
            result[key] = value
        return result
    def constant(_):
        raise Diagnostic("Rejected", "invalid_input", "non-finite JSON number")
    try:
        return json.loads(data, object_pairs_hook=pairs, parse_constant=constant)
    except (ValueError, UnicodeError, TypeError, RecursionError) as exc:
        raise Diagnostic("Rejected", "invalid_input", "invalid JSON") from exc
