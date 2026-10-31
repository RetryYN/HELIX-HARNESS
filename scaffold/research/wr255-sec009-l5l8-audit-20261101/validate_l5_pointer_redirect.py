#!/usr/bin/env python3
"""Read-only proof that the 30 L5 nested L4 pointers now use canonical aliases."""
from __future__ import annotations

import argparse
import copy
import hashlib
import json
import subprocess
import sys
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[3]
BASE = "ad2dfaf6f434fbb81cd34988d4bd76212380f3a5"
L4 = "docs/helix-security/L4-basic-design/revoke-quarantine-propagation.json"
L5 = "docs/helix-security/L5-detail-design/revoke-quarantine-propagation.json"
L8 = "docs/helix-security/L8-unit-verification/revoke-quarantine-propagation.json"
FIELD_MAP = {
    "code": "class_id",
    "change": "condition",
    "axis": "expected_axis",
    "state": "expected_state",
    "backflow_owner": "backflow_owner",
    "expected": "expected",
    "expected_preserved": "expected_preserved",
    "expected_side_effect_count": "side_effect_count",
    "source_pointers": "source_pointers",
}
L5_FIELD_MAP = {
    "class_id": "class_id",
    "code": "code",
    "change": "condition",
    "condition": "condition",
    "axis": "expected_axis",
    "state": "expected_state",
    "backflow_owner": "backflow_owner",
    "expected": "expected",
    "expected_preserved": "expected_preserved",
    "expected_side_effect_count": "side_effect_count",
    "side_effect_count": "side_effect_count",
}


def fail(message: str) -> None:
    raise ValueError(message)


def read_json_bytes(raw: bytes, label: str) -> Any:
    try:
        return json.loads(raw)
    except Exception as exc:
        fail(f"{label}: JSON parse error: {exc}")


def git_bytes(revision: str, path: str) -> bytes:
    return subprocess.run(
        ["git", "show", f"{revision}:{path}"], cwd=ROOT, check=True, capture_output=True
    ).stdout


def resolve(root: Any, pointer: str) -> Any:
    if not pointer.startswith("/"):
        fail(f"invalid JSON Pointer: {pointer}")
    value = root
    for raw in pointer.split("/")[1:]:
        part = raw.replace("~1", "/").replace("~0", "~")
        value = value[int(part)] if isinstance(value, list) else value[part]
    return value


def sha(raw: bytes) -> str:
    return hashlib.sha256(raw).hexdigest()


def nested_l4_refs(value: Any, found: list[str] | None = None) -> list[str]:
    if found is None:
        found = []
    if isinstance(value, dict):
        if value.get("path") == L4 and isinstance(value.get("pointer"), str) and "/negative_classifications/" in value["pointer"]:
            found.append(value["pointer"])
        for child in value.values():
            nested_l4_refs(child, found)
    elif isinstance(value, list):
        for child in value:
            nested_l4_refs(child, found)
    return found


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--record", type=Path, help="write report with exclusive-create semantics")
    args = parser.parse_args()
    try:
        base_l4_raw, base_l5_raw, base_l8_raw = (git_bytes(BASE, p) for p in (L4, L5, L8))
        current_l4_raw, current_l5_raw, current_l8_raw = (Path(p).read_bytes() for p in (L4, L5, L8))
        base_l4, base_l5, base_l8 = (read_json_bytes(raw, label) for raw, label in zip(
            (base_l4_raw, base_l5_raw, base_l8_raw), ("base L4", "base L5", "base L8")
        ))
        current_l4, current_l5, current_l8 = (read_json_bytes(raw, label) for raw, label in zip(
            (current_l4_raw, current_l5_raw, current_l8_raw), ("current L4", "current L5", "current L8")
        ))
        if current_l4_raw != base_l4_raw or current_l8_raw != base_l8_raw:
            fail("L4 or L8 changed from fixed base; this redirect validator is scoped to L5 only")

        canonical: dict[str, tuple[str, dict[str, Any]]] = {}
        for index, row in enumerate(base_l4.get("failure_classifications", [])):
            cid = row.get("class_id")
            if not isinstance(cid, str) or cid in canonical:
                fail(f"canonical class ID missing or duplicate: {cid}")
            canonical[cid] = (f"/failure_classifications/{index}", row)

        nested: dict[str, tuple[str, dict[str, Any]]] = {}
        for ci, contract in enumerate(base_l4.get("contracts", [])):
            for ni, row in enumerate(contract.get("negative_classifications", [])):
                cid = row.get("code")
                if not isinstance(cid, str) or cid in nested:
                    fail(f"nested class ID missing or duplicate: {cid}")
                nested[cid] = (f"/contracts/{ci}/negative_classifications/{ni}", row)
        if len(nested) != 30 or set(nested) - set(canonical):
            fail(f"expected 30 nested classes with canonical mappings; found {len(nested)}")
        base_raw_refs = nested_l4_refs(base_l5)
        current_raw_refs = nested_l4_refs(current_l5)
        if len(base_raw_refs) != 30 or len(current_raw_refs) != 0:
            fail(f"recursive L5 nested pointer inventory differs: base={len(base_raw_refs)} current={len(current_raw_refs)}")

        base_rules = {r.get("id"): r for r in base_l5.get("failure_rules", [])}
        current_rules = {r.get("id"): r for r in current_l5.get("failure_rules", [])}
        if len(base_rules) != len(base_l5.get("failure_rules", [])) or set(base_rules) != set(current_rules):
            fail("L5 failure-rule identities changed")
        changed_rules = 0
        canonical_pointer_count = 0
        for cid, (nested_pointer, old_class) in nested.items():
            if cid not in base_rules:
                fail(f"no L5 failure rule for nested class {cid}")
            old_rule = base_rules[cid]
            rule = current_rules[cid]
            canon_pointer, canon_class = canonical[cid]
            l4path = L4
            nested_ref = {"path": l4path, "pointer": nested_pointer}
            canonical_ref = {"path": l4path, "pointer": canon_pointer}
            old_refs = old_rule.get("source_pointers", [])
            new_refs = rule.get("source_pointers", [])
            if old_refs.count(nested_ref) != 1 or old_refs.count(canonical_ref) != 1:
                fail(f"fixed L5 row lacks one nested and one canonical ref: {cid}")
            expected_refs = [ref for ref in old_refs if ref != nested_ref]
            if new_refs != expected_refs:
                fail(f"L5 source refs changed beyond duplicate redirect: {cid}")
            canonical_pointer_count += new_refs.count(canonical_ref)
            # Verify the old nested payload's typed values against its canonical row.
            for old_key, canonical_key in FIELD_MAP.items():
                left, right = old_class.get(old_key), canon_class.get(canonical_key)
                if type(left) is not type(right) or left != right:
                    fail(f"nested/canonical projection differs: {cid}.{old_key} -> {canonical_key}")
            reconstructed = canon_class.get("condition", "") + " " + canon_class.get("expected_preserved", {}).get("contract_detail", "")
            if type(old_class.get("expected_text")) is not str or old_class["expected_text"] != reconstructed:
                fail(f"nested expected_text is not represented by canonical fields: {cid}")
            # All L5 rule fields and non-source refs remain byte-semantically equal.
            for key, canonical_key in L5_FIELD_MAP.items():
                for version, row in (("base", old_rule), ("current", rule)):
                    val, expected = row.get(key), canon_class.get(canonical_key)
                    if type(val) is not type(expected) or val != expected:
                        fail(f"{version} L5/canonical semantic value differs: {cid}.{key} -> {canonical_key}")
            old_without_refs = {k: v for k, v in old_rule.items() if k != "source_pointers"}
            new_without_refs = {k: v for k, v in rule.items() if k != "source_pointers"}
            if old_without_refs != new_without_refs:
                fail(f"L5 non-pointer rule content changed: {cid}")
            if old_rule != rule:
                changed_rules += 1
        if canonical_pointer_count != 30 or changed_rules != 30:
            fail(f"redirect counts differ: changed rules={changed_rules}, canonical refs={canonical_pointer_count}")
        if len(current_rules) != len(base_rules):
            fail("L5 rule count changed")
        expected_l5 = copy.deepcopy(base_l5)
        for rule in expected_l5.get("failure_rules", []):
            cid = rule.get("class_id")
            if cid in nested:
                pointer, _ = nested[cid]
                target = {"path": L4, "pointer": pointer}
                refs = rule.get("source_pointers", [])
                if refs.count(target) != 1:
                    fail(f"fixed L5 nested pointer is not unique: {cid}")
                rule["source_pointers"] = [ref for ref in refs if ref != target]
        if expected_l5 != current_l5:
            fail("full L5 document differs beyond removing the 30 nested duplicate refs")

        l8_aliases = {row.get("class_id"): row for row in current_l8.get("negative_equivalence_classes", [])}
        if len(l8_aliases) != 32 or not set(nested).issubset(l8_aliases):
            fail(f"L8 canonical alias set does not include all redirected classes: {len(l8_aliases)}")
        l5_indices = {rule.get("class_id"): index for index, rule in enumerate(current_l5.get("failure_rules", []))}
        for cid, (pointer, _) in canonical.items():
            if cid not in nested:
                continue
            refs = l8_aliases[cid].get("source_pointers", [])
            if {"path": L4, "pointer": pointer} not in refs:
                fail(f"L8 class alias does not retain canonical L4 pointer: {cid}")
            expected_l5_pointer = f"/failure_rules/{l5_indices[cid]}"
            if {"path": L5, "pointer": expected_l5_pointer} not in refs:
                fail(f"L8 class alias does not retain L5 rule pointer: {cid}")

        report = {
            "schema_revision": 1,
            "evidence_kind": "source_pointer_redirect_static_audit",
            "authority_effect": "none",
            "base_revision": BASE,
            "base_sha256": {"L4": sha(base_l4_raw), "L5": sha(base_l5_raw), "L8": sha(base_l8_raw)},
            "current_sha256": {"L4": sha(current_l4_raw), "L5": sha(current_l5_raw), "L8": sha(current_l8_raw)},
            "counts": {
                "nested_classes_checked": len(nested),
                "L5_rules_checked": len(current_rules),
                "L5_nested_refs_removed": 30,
                "L5_canonical_refs_retained": canonical_pointer_count,
                "L5_rules_with_only_pointer_redirect": changed_rules,
                "L5_nested_pointer_strings_before": len(base_raw_refs),
                "L5_nested_pointer_strings_after": len(current_raw_refs),
                "L4_bytes_unchanged": True,
                "L8_bytes_unchanged": True,
            },
            "field_projection": FIELD_MAP,
            "limitations": [
                "固定L4 nested classと同class canonical aliasの型・値、および各L5参照配列の差分を照合した静的証拠。実行動作の証明ではない。",
                "L9側の583 nested参照はこの変更の対象外で未移行。SCF-B-0209はregisteredのまま。",
                "source classとの対応は固定baseで既に存在するL5の同class canonical pointerに基づく。",
            ],
        }
        encoded = json.dumps(report, ensure_ascii=False, indent=2) + "\n"
        if args.record:
            target = args.record if args.record.is_absolute() else ROOT / args.record
            target.parent.mkdir(parents=True, exist_ok=True)
            with target.open("x", encoding="utf-8") as stream:
                stream.write(encoded)
        print(encoded, end="")
        return 0
    except (OSError, subprocess.CalledProcessError, ValueError, KeyError, IndexError, TypeError) as exc:
        print(f"FAIL: {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
