"""Test helpers extracted from test_compare_selected_knowledge.py without changing test cases."""

import hashlib


def _rename_id(val):
    return "id-" + hashlib.sha256(val.encode("utf-8")).hexdigest()[:12]


def _rename_all_identifiers(obj):
    """Recursively obfuscate all synthetic/fixture identifiers so no literal substring survives."""
    if isinstance(obj, dict):
        out = {}
        for k, v in obj.items():
            if k in ("identity", "owner", "actor", "decider"):
                out[k] = _rename_id(v) if isinstance(v, str) else v
            elif k in (
                "field",
                "template",
                "application_contract",
                "subject",
            ) and isinstance(v, str):
                out[k] = _rename_id(v)
            else:
                out[k] = _rename_all_identifiers(v)
        return out
    if isinstance(obj, list):
        return [_rename_all_identifiers(x) for x in obj]
    return obj


def _same_ref_core(left, right):
    if not isinstance(left, dict) or not isinstance(right, dict):
        return False
    return (
        left.get("identity") == right.get("identity")
        and left.get("revision") == right.get("revision")
        and left.get("scope") == right.get("scope")
        and left.get("owner") == right.get("owner")
        and left.get("source_locator") == right.get("source_locator")
    )
