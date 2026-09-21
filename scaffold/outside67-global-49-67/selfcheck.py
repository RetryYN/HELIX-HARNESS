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


def expect_failure(label: str, mutate) -> None:
    inventory = copy.deepcopy(base_inventory)
    items = copy.deepcopy(base_items)
    mutate(inventory, items)
    if validator.validate(inventory, items):
        print(f"PASS {label}")
    else:
        raise SystemExit(f"FAIL selfcheck did not reject: {label}")


baseline = validator.validate(base_inventory, base_items)
if baseline:
    raise SystemExit("FAIL selfcheck baseline: " + "; ".join(baseline))
print("PASS baseline validator")

cases = [
    ("authority promotion", lambda i, s: i.update(authority_effect="adopted")),
    ("formal append promotion", lambda i, s: i.update(formal_register_append=True)),
    ("ordinal scope tamper", lambda i, s: i["scope"].update(selected_ordinal_start=48)),
    ("product candidate promotion", lambda i, s: s[0]["path_classification"].update(product_status="approved")),
    ("phase candidate promotion", lambda i, s: s[0]["path_classification"].update(phase_status="classified")),
    ("implementation promotion", lambda i, s: s[0]["implementation_assessment"].update(status="implemented")),
    ("degradation promotion", lambda i, s: s[0]["degradation_assessment"].update(status="degraded")),
    ("semantic inclusion promotion", lambda i, s: s[0].update(semantic_inclusion_status="included")),
    ("pre-isolation blob tamper", lambda i, s: s[0]["pre_isolation"].update(blob_oid="0" * 40)),
    ("archive relation tamper", lambda i, s: s[0]["archive"].update(relation_to_pre_isolation="equivalent")),
    ("holding relation tamper", lambda i, s: s[0]["live_holding_relations"][0].update(path_match_count=1)),
    ("new holding resolution", lambda i, s: s[0].update(new_holding_needed="resolved")),
    ("current capture invention", lambda i, s: s[0]["current_capture"].update(state="present")),
    ("old runtime execution", lambda i, s: i.update(old_runtime_test_ci_execution=True)),
    ("prohibited boundary deletion", lambda i, s: i["prohibited_inference"].pop()),
]

for label, mutate in cases:
    expect_failure(label, mutate)

print(f"PASS outside67 global 49-67 selfcheck: {len(cases)} negative cases")
