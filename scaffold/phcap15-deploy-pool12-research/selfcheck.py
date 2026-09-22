#!/usr/bin/env python3
"""Negative checks for the PHCAP-15 Deploy pool-12 research premise."""

from __future__ import annotations

import copy
import json
import subprocess
import sys
import tempfile
from pathlib import Path


HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
VALIDATOR = HERE / "validate.py"


def run(candidate: Path) -> tuple[int, str]:
    result = subprocess.run(
        [sys.executable, "-B", str(VALIDATOR), "--root", str(ROOT), "--inventory", str(candidate)],
        capture_output=True,
        text=True,
        check=False,
    )
    return result.returncode, result.stdout + result.stderr


def main() -> int:
    baseline = json.loads((HERE / "inventory.json").read_text(encoding="utf-8"))
    with tempfile.TemporaryDirectory(prefix="phcap15-deploy-pool12-selfcheck-") as tmp:
        base_path = Path(tmp) / "baseline.json"
        base_path.write_text(json.dumps(baseline, ensure_ascii=False), encoding="utf-8")
        code, output = run(base_path)
        if code != 0:
            print("FAIL selfcheck baseline")
            print(output)
            return 1
        print("PASS baseline/no-op")

        cases: list[tuple[str, str, callable]] = [
            ("authority-promotion", "AUTHORITY_EFFECT", lambda d: d.update({"authority_effect": "current"})),
            ("pool-denominator-loss", "POOL_SCOPE", lambda d: d["scope"]["pool_asset_ids"].pop()),
            ("selected-overlap", "NON_OVERLAP", lambda d: d["scope"]["selected_asset_ids"].__setitem__(0, next(iter(d["scope"]["excluded_scopes"]["pr_2001"]["asset_ids"])))),
            ("selected-overlap-pr2004", "NON_OVERLAP", lambda d: d["scope"]["selected_asset_ids"].__setitem__(0, next(iter(d["scope"]["excluded_scopes"]["pr_2004"]["asset_ids"])))),
            ("source-text-drift", "SOURCE_TEXT", lambda d: d["assets"][0]["source_anchors"][0].update({"exact_text": "tampered"})),
            ("source-span-digest-drift", "SOURCE_SPAN_DIGEST", lambda d: d["assets"][0]["source_anchors"][0].update({"source_span_sha256": "0" * 64})),
            ("anchor-meaning-drift", "ANCHOR_MEANING", lambda d: d["assets"][0]["source_anchors"][0].update({"meaning": "invented meaning"})),
            ("anchor-set-loss", "ANCHOR_SET", lambda d: d["assets"][0]["source_anchors"].pop()),
            ("anchor-coordinate-drift", "ANCHOR_COORDINATES", lambda d: d["assets"][0]["source_anchors"][0].update({"line_start": 10})),
            ("root-keyset-injection", "KEYSET", lambda d: d.update({"unexpected": True})),
            ("asset-keyset-injection", "KEYSET", lambda d: d["assets"][0].update({"unexpected": True})),
            ("anchor-keyset-injection", "KEYSET", lambda d: d["assets"][0]["source_anchors"][0].update({"unexpected": True})),
            ("product-keyset-injection", "KEYSET", lambda d: d["product_boundary_candidates"]["products"][0].update({"unexpected": True})),
            ("product-ref-keyset-injection", "KEYSET", lambda d: d["product_boundary_candidates"]["products"][0]["refs"][0].update({"unexpected": True})),
            ("product-target-promotion", "PRODUCT_TARGETS", lambda d: d["assets"][0].update({"candidate_product_targets": ["HELIX-OS"]})),
            ("phase-admission-promotion", "PHASE_PROMOTION", lambda d: d["assets"][0].update({"phase_admission": "admitted"})),
            ("implementation-promotion", "IMPLEMENTATION_PROMOTION", lambda d: d["assets"][0].update({"current_implementation_status": "implemented"})),
            ("degradation-promotion", "IMPLEMENTATION_PROMOTION", lambda d: d["assets"][0].update({"current_degradation_status": "degraded"})),
            ("failure-receipt-invention", "FAILURE_PROMOTION", lambda d: d["assets"][0]["failure_evidence"].update({"execution_receipts": 1})),
            ("consumer-closure-invention", "CONSUMER_PROMOTION", lambda d: d["assets"][0].update({"consumer_closure_status": "closed", "consumer_refs": ["consumer-x"]})),
            ("decision-invention", "DECISION_PROMOTION", lambda d: d["assets"][0].update({"decision_matches": 1, "decision_record_refs": ["DECISION-X"]})),
        ]
        for name, expected, mutate in cases:
            candidate = copy.deepcopy(baseline)
            mutate(candidate)
            path = Path(tmp) / f"{name}.json"
            path.write_text(json.dumps(candidate, ensure_ascii=False), encoding="utf-8")
            code, output = run(path)
            if code == 0 or expected not in output:
                print(f"FAIL {name}: expected {expected}")
                print(output)
                return 1
            print(f"PASS negative/{name}: {expected}")
    print("PASS selfcheck: scope/source-anchor/meaning/keyset/status/authority/product/failure/consumer/decision negatives")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
