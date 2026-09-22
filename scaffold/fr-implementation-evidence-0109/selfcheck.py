#!/usr/bin/env python3
"""SCF-B-0109 validatorの決定的な負例selfcheck。"""
from __future__ import annotations

import copy
import contextlib
import importlib.util
import io
import json
import shutil
import sys
import tempfile
from pathlib import Path


HERE = Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location("scf_b_0109_validate", HERE / "validate.py")
assert spec and spec.loader
validate = importlib.util.module_from_spec(spec)
sys.modules[spec.name] = validate
spec.loader.exec_module(validate)


def load_bundle() -> tuple[dict, list[dict]]:
    inventory = json.loads((HERE / "inventory.json").read_text(encoding="utf-8"))
    evidence = [json.loads(line) for line in (HERE / "evidence.jsonl").read_text(encoding="utf-8").splitlines() if line.strip()]
    return inventory, evidence


def run_case(name: str, expected_code: str, mutate) -> None:
    inventory, evidence = load_bundle()
    mutate(inventory, evidence)
    with tempfile.TemporaryDirectory(prefix="scf-b-0109-selfcheck-") as temp:
        bundle = Path(temp)
        (bundle / "inventory.json").write_text(json.dumps(inventory, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        with (bundle / "evidence.jsonl").open("w", encoding="utf-8") as handle:
            for row in evidence:
                handle.write(json.dumps(row, ensure_ascii=False, sort_keys=True, separators=(",", ":")) + "\n")
        checker = validate.Validator(validate.ROOT, bundle)
        with contextlib.redirect_stdout(io.StringIO()), contextlib.redirect_stderr(io.StringIO()):
            result = checker.validate()
        if result == 0 or not any(error.startswith(expected_code + ":") for error in checker.errors):
            raise AssertionError(f"{name}: expected {expected_code}, result={result}, errors={checker.errors}")
    print(f"PASS {name} -> {expected_code}")


def main() -> int:
    # 各負例で同じ固定BASEを再走査せず、期待bundleだけを一度計算する。
    expected_bundle = validate.build.build_bundle()
    validate.build.build_bundle = lambda: expected_bundle
    cases = [
        ("unit-set", "E_UNIT_SET", lambda inv, ev: inv["unit_ids"].__setitem__(0, "IRUNIT-HIL-BR-01-HELIX-OS")),
        ("edge-set", "E_REVIEW_EDGE_SET", lambda inv, ev: ev[0]["semantic_review_edges"].pop()),
        ("edge-duplicate", "E_REVIEW_EDGE_DUP", lambda inv, ev: ev[0]["semantic_review_edges"].append(copy.deepcopy(ev[0]["semantic_review_edges"][0]))),
        ("asset-set", "E_ASSET_SET", lambda inv, ev: ev[0]["asset_set"]["asset_ids"].pop()),
        ("inventory-declaration", "E_INVENTORY_DECLARATION", lambda inv, ev: inv["counts"].__setitem__("unique_old_assets", 0)),
        ("representative-asset", "E_REPRESENTATIVE_ASSET", lambda inv, ev: ev[0]["representative_assets"]["records"][0]["source"].__setitem__("source_sha256", "sha256:" + "0" * 64)),
        ("implementation-evidence", "E_IMPLEMENTATION_EVIDENCE", lambda inv, ev: ev[0]["implementation_evidence"].__setitem__("unit_implementation_status", "implemented")),
        ("degradation-evidence", "E_DEGRADATION_EVIDENCE", lambda inv, ev: ev[0]["degradation_evidence"].__setitem__("unit_degradation_status", "degraded")),
        ("failure-evidence", "E_FAILURE_EVIDENCE", lambda inv, ev: ev[0]["failure_evidence"].__setitem__("observed_failure_status", "observed")),
        ("consumer-evidence", "E_CONSUMER_EVIDENCE", lambda inv, ev: ev[0]["consumer_evidence"].__setitem__("closure_status", "closed")),
        ("source-anchor", "E_SOURCE_ANCHOR", lambda inv, ev: ev[0]["source_anchor"].__setitem__("span_sha256", "sha256:" + "0" * 64)),
        ("old-asset-source", "E_OLD_ASSET_SOURCE", lambda inv, ev: ev[0]["old_asset_evidence"]["assets"][0]["source"].__setitem__("source_sha256", "0" * 64)),
        ("old-asset-history", "E_OLD_ASSET_HISTORY", lambda inv, ev: ev[0]["old_asset_evidence"]["assets"][0]["history"].__setitem__("asset_class", "Tampered")),
        ("input-digest", "E_INPUT_DIGEST", lambda inv, ev: inv["input_snapshot"][0].__setitem__("sha256", "0" * 64)),
        ("base-commit", "E_BASE_COMMIT", lambda inv, ev: inv["base"].__setitem__("commit", "0" * 40)),
        ("base-not-ancestor", "E_BASE_NOT_ANCESTOR", lambda inv, ev: inv["base"].__setitem__("required_ancestor", "not-a-commit")),
        ("authority-boundary", "E_AUTHORITY_BOUNDARY", lambda inv, ev: ev[0]["authority_boundary"].__setitem__("formal_phase_authority", True)),
        ("current-status", "E_CURRENT_STATUS", lambda inv, ev: ev[0]["current_implementation_evidence"].__setitem__("status", "implemented")),
        ("unimplemented-claim", "E_UNIMPLEMENTED_CLAIM", lambda inv, ev: ev[0]["unimplemented_assessment"].__setitem__("explicit_non_implementation_claim", True)),
    ]
    for name, code, mutate in cases:
        run_case(name, code, mutate)
    print(f"SCF-B-0109 selfcheck PASS ({len(cases)} negative cases)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
