#!/usr/bin/env python3
"""Negative self-checks for the PHCAP-15 static research candidate."""

from __future__ import annotations

import copy
import importlib.util
import json
import sys
from pathlib import Path


HERE = Path(__file__).resolve().parent
VALIDATOR_PATH = HERE / "validate.py"
spec = importlib.util.spec_from_file_location("phcap15_gap_validate", VALIDATOR_PATH)
if spec is None or spec.loader is None:
    raise RuntimeError("cannot load validator")
validator = importlib.util.module_from_spec(spec)
spec.loader.exec_module(validator)


def load() -> dict:
    return json.loads((HERE / "inventory.json").read_text(encoding="utf-8"))


def expect_error(name: str, mutate) -> None:
    data = load()
    mutate(data)
    errors = validator.validate_inventory(data)
    if not errors:
        raise AssertionError(f"{name}: mutation was accepted")
    print(f"PASS {name}: {errors[0]}")


def main() -> int:
    baseline = load()
    if validator.validate_inventory(baseline):
        print("FAIL baseline inventory is not valid", file=sys.stderr)
        return 1
    if validator.validate_inventory(copy.deepcopy(baseline)):
        print("FAIL no-op copy changed validation", file=sys.stderr)
        return 1
    print("PASS baseline/no-op")

    expect_error("authority promotion", lambda d: d["capture"].update(authority_effect="implementation"))
    expect_error("phase degradation promotion", lambda d: d["phase"].update(transition_assessment="implemented"))
    expect_error("pool denominator shrink", lambda d: d["denominator"].update(phcap15_classification_pool_rows=7))
    expect_error("product removal", lambda d: d["products"].pop())
    expect_error("archive digest drift", lambda d: d["assets"][0].update(source_file_sha256="0" * 64))
    expect_error("archive anchor drift", lambda d: d["assets"][1]["anchors"][0].update(span_sha256="f" * 64))
    expect_error("legacy implementation promotion", lambda d: d["assets"][2].update(legacy_implementation_status="implemented"))
    expect_error("current implementation promotion", lambda d: d["assets"][3]["current_interpretation"].update(implementation="implemented"))
    expect_error("failure receipt promotion", lambda d: d["evidence_gaps"]["failure"].update(selected_failure_receipts=1))
    expect_error("consumer closure promotion", lambda d: d["assets"][4].update(consumer_closure_status="closed"))
    expect_error("decision match promotion", lambda d: d["assets"][5].update(decision_matches=1))
    expect_error("requirement-link inference", lambda d: d["prohibited_inference"].pop())
    expect_error("unknown top-level key", lambda d: d.update(inferred_requirement_ids=[]))
    print("PHCAP-15 deploy gap selfcheck: PASS (baseline plus 12 negative cases)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
