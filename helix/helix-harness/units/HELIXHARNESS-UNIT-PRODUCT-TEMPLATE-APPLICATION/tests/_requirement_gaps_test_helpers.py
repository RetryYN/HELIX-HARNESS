"""Test helpers extracted from test_compare_requirement_gaps.py without changing test cases."""

import hashlib


def _replace_kind_tokens(obj, src_kind, dst_kind):
    if isinstance(obj, dict):
        return {k: _replace_kind_tokens(v, src_kind, dst_kind) for k, v in obj.items()}
    if isinstance(obj, list):
        return [_replace_kind_tokens(x, src_kind, dst_kind) for x in obj]
    if isinstance(obj, str):
        if obj == src_kind:
            return dst_kind
        suffix = f"-{src_kind}"
        if obj.endswith(suffix):
            return f"{obj[: -len(suffix)]}-{dst_kind}"
    return obj


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
    for key in ("identity", "revision", "scope", "owner", "source_locator"):
        if left.get(key) != right.get(key):
            return False
    return True
