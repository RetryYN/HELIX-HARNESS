#!/usr/bin/env python3
"""outside67 global 49--67 の否定自己検査。"""

from __future__ import annotations

import copy
import importlib.util
import json
from pathlib import Path


HERE = Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location("outside67_validator", HERE / "validate.py")
validator = importlib.util.module_from_spec(spec)
assert spec.loader is not None
spec.loader.exec_module(validator)
base_inventory = json.loads((HERE / "inventory.json").read_text(encoding="utf-8"))
base_items = [json.loads(line) for line in (HERE / "source-items.jsonl").read_text(encoding="utf-8").splitlines() if line.strip()]


def expect_failure(label: str, mutate, expected_code: str) -> None:
    inventory = copy.deepcopy(base_inventory)
    items = copy.deepcopy(base_items)
    mutate(inventory, items)
    if inventory == base_inventory and items == base_items:
        raise SystemExit(f"FAIL selfcheck no-op mutation: {label}")
    errors = validator.validate(inventory, items)
    if not errors:
        raise SystemExit(f"FAIL selfcheck did not reject: {label}")
    if expected_code not in errors:
        raise SystemExit(f"FAIL selfcheck {label} missing {expected_code}: {', '.join(errors)}")
    print(f"PASS {label} {expected_code}")


baseline = validator.validate(base_inventory, base_items)
if baseline:
    raise SystemExit("FAIL selfcheck baseline: " + "; ".join(baseline))
print("PASS baseline validator")

cases = [
    ("authority promotion", lambda i, s: i.update(authority_effect="adopted"), "E_AUTHORITY"),
    ("formal append promotion", lambda i, s: i.update(formal_register_append=True), "E_FORMAL_APPEND"),
    ("ordinal scope tamper", lambda i, s: i["scope"].update(selected_ordinal_start=48), "E_ORDINAL_RANGE"),
    ("product candidate promotion", lambda i, s: s[0]["path_classification"].update(product_status="approved"), "E_PRODUCT_PHASE_UNKNOWN:49:docs/governance/audits/l2-requirements/product-requirement-placement-audit-2026-09-14.md"),
    ("phase candidate promotion", lambda i, s: s[0]["path_classification"].update(phase_status="classified"), "E_PRODUCT_PHASE_UNKNOWN:49:docs/governance/audits/l2-requirements/product-requirement-placement-audit-2026-09-14.md"),
    ("implementation promotion", lambda i, s: s[0]["implementation_assessment"].update(status="implemented"), "E_IMPLEMENTATION_UNKNOWN:49:docs/governance/audits/l2-requirements/product-requirement-placement-audit-2026-09-14.md"),
    ("degradation promotion", lambda i, s: s[0]["degradation_assessment"].update(status="degraded"), "E_DEGRADATION_UNKNOWN:49:docs/governance/audits/l2-requirements/product-requirement-placement-audit-2026-09-14.md"),
    ("semantic inclusion promotion", lambda i, s: s[0].update(semantic_inclusion_status="included"), "E_SEMANTIC_INCLUSION_UNKNOWN:49:docs/governance/audits/l2-requirements/product-requirement-placement-audit-2026-09-14.md"),
    ("pre-isolation blob tamper", lambda i, s: s[0]["pre_isolation"].update(blob_oid="0" * 40), "E_PRE_OBJECT:49:docs/governance/audits/l2-requirements/product-requirement-placement-audit-2026-09-14.md"),
    ("archive relation tamper", lambda i, s: s[0]["archive"].update(relation_to_pre_isolation="equivalent"), "E_ARCHIVE_RELATION:49:docs/governance/audits/l2-requirements/product-requirement-placement-audit-2026-09-14.md"),
    ("holding relation tamper", lambda i, s: s[0]["live_holding_relations"][0].update(path_match_count=1), "E_HOLDING_RELATIONS:49:docs/governance/audits/l2-requirements/product-requirement-placement-audit-2026-09-14.md"),
    ("new holding resolution", lambda i, s: s[0].update(new_holding_needed="resolved"), "E_NEW_HOLDING:49:docs/governance/audits/l2-requirements/product-requirement-placement-audit-2026-09-14.md"),
    ("current capture invention", lambda i, s: s[0]["current_capture"].update(state="present"), "E_CAPTURE_OBJECT:49:docs/governance/audits/l2-requirements/product-requirement-placement-audit-2026-09-14.md"),
    ("old runtime execution", lambda i, s: i.update(old_runtime_test_ci_execution=True), "E_OLD_EXECUTION"),
    ("prohibited boundary deletion", lambda i, s: i["prohibited_inference"].pop(), "E_PROHIBITED_BOUNDARY"),
    ("findings text replacement", lambda i, s: i["findings"].__setitem__(0, "changed"), "E_FINDINGS"),
    ("prohibited text reversal", lambda i, s: i["prohibited_inference"].reverse(), "E_PROHIBITED_INFERENCE"),
    ("extra top-level key", lambda i, s: i.update(merge_admission="granted"), "E_KEYSET:root"),
    ("extra nested relation key", lambda i, s: s[0]["live_holding_relations"][0].update(merge_admission="granted"), "E_KEYSET:item.live_holding_relations[]"),
]

for label, mutate, expected_code in cases:
    expect_failure(label, mutate, expected_code)

print(f"PASS outside67 global 49-67 selfcheck: {len(cases)} negative cases")
