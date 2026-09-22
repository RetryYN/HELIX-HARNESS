#!/usr/bin/env python3
"""SCF-B-0116 deterministic negative checks."""
from __future__ import annotations

import contextlib
import copy
import importlib.util
import io
import json
import subprocess
import sys
import tempfile
from pathlib import Path

HERE = Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location("scf_b_0116_validate", HERE / "validate.py")
assert spec and spec.loader
validate = importlib.util.module_from_spec(spec)
sys.modules[spec.name] = validate
spec.loader.exec_module(validate)


def load_bundle() -> tuple[dict, list[dict]]:
    inv = json.loads((HERE / "inventory.json").read_text(encoding="utf-8"))
    rows = [json.loads(line) for line in (HERE / "evidence.jsonl").read_text(encoding="utf-8").splitlines() if line.strip()]
    return inv, rows


def write_bundle(path: Path, inv: dict, rows: list[dict]) -> None:
    (path / "inventory.json").write_text(json.dumps(inv, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    (path / "evidence.jsonl").write_text("\n".join(json.dumps(row, ensure_ascii=False, sort_keys=True) for row in rows) + "\n", encoding="utf-8")


def run_case(name: str, expected: str, mutate) -> None:
    inv, rows = load_bundle()
    mutate(inv, rows)
    with tempfile.TemporaryDirectory(prefix="scf-b-0116-selfcheck-") as temp:
        bundle = Path(temp)
        write_bundle(bundle, inv, rows)
        checker = validate.Validator(validate.ROOT, bundle)
        with contextlib.redirect_stdout(io.StringIO()), contextlib.redirect_stderr(io.StringIO()):
            result = checker.validate()
        if result == 0 or not any(error.startswith(expected + ":") for error in checker.errors):
            raise AssertionError(f"{name}: expected {expected}, result={result}, errors={checker.errors}")
    print(f"PASS {name} -> {expected}")


def run_raw_bundle_case() -> None:
    with tempfile.TemporaryDirectory(prefix="scf-b-0116-raw-") as temp:
        bundle = Path(temp)
        (bundle / "inventory.json").write_text("{\n", encoding="utf-8")
        (bundle / "evidence.jsonl").write_text("", encoding="utf-8")
        checker = validate.Validator(validate.ROOT, bundle)
        with contextlib.redirect_stdout(io.StringIO()), contextlib.redirect_stderr(io.StringIO()):
            result = checker.validate()
        if result == 0 or not any(error.startswith("E_BUNDLE:") for error in checker.errors):
            raise AssertionError(f"malformed bundle: result={result}, errors={checker.errors}")
    print("PASS malformed bundle -> E_BUNDLE")


def run_generator_tamper_case() -> None:
    path = HERE / "generate.py"
    original = path.read_bytes()
    needle = b'"formal_phase_candidate": None'
    replacement = b'"formal_phase_candidate": "PHCAP-20"'
    if needle not in original:
        raise AssertionError("generator tamper needle missing")
    try:
        path.write_bytes(original.replace(needle, replacement, 1))
        result = subprocess.run([sys.executable, str(path)], cwd=validate.ROOT, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, check=False)
        if result.returncode != 0:
            raise AssertionError(f"tampered generator failed: {result.stderr}")
        checker = validate.Validator(validate.ROOT, HERE)
        with contextlib.redirect_stdout(io.StringIO()), contextlib.redirect_stderr(io.StringIO()):
            code = checker.validate()
        if code == 0 or not any(error.startswith("E_PHASE_REVIEW:") for error in checker.errors):
            raise AssertionError(f"generator tamper passed: code={code}, errors={checker.errors}")
    finally:
        path.write_bytes(original)
        restored = subprocess.run([sys.executable, str(path)], cwd=validate.ROOT, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, check=False)
        if restored.returncode != 0:
            raise AssertionError(f"generator restore failed: {restored.stderr}")
    print("PASS generator regeneration phase tamper -> E_PHASE_REVIEW")


if __name__ == "__main__":
    expected_inventory, expected_rows = validate.build_bundle()
    validate.build_bundle = lambda: (expected_inventory, expected_rows)
    cases = [
        ("schema", "E_SCHEMA", lambda inv, rows: inv.__setitem__("schema", "phase-cross-20-review-0116/v0")),
        ("binding", "E_BINDING", lambda inv, rows: inv.__setitem__("binding_id", "SCF-B-9999")),
        ("base commit", "E_BASE_COMMIT", lambda inv, rows: inv["base"].__setitem__("commit", "0" * 40)),
        ("base ancestor", "E_BASE_NOT_ANCESTOR", lambda inv, rows: inv["base"].__setitem__("required_ancestor", "not-a-commit")),
        ("input digest", "E_INPUT_DIGEST", lambda inv, rows: inv["input_snapshot"][0].__setitem__("sha256", "0" * 64)),
        ("unit set", "E_UNIT_SET", lambda inv, rows: rows.__setitem__(0, copy.deepcopy(rows[1]))),
        ("source anchor", "E_SOURCE_ANCHOR", lambda inv, rows: rows[0]["source_anchor"].__setitem__("statement_text_sha256", "sha256:" + "0" * 64)),
        ("edge omission", "E_WAVE_EDGE_SET", lambda inv, rows: rows[0]["semantic_review_edges"].pop()),
        ("edge duplicate", "E_WAVE_EDGE_DUP", lambda inv, rows: rows[0]["semantic_review_edges"].append(copy.deepcopy(rows[0]["semantic_review_edges"][0]))),
        ("asset set", "E_ASSET_SET", lambda inv, rows: rows[0]["asset_set"]["asset_ids"].pop()),
        ("asset source", "E_ASSET_SOURCE", lambda inv, rows: rows[0]["old_asset_evidence"]["assets"][0]["source"].__setitem__("archive_sha256_at_base", "0" * 64)),
        ("asset history", "E_ASSET_HISTORY", lambda inv, rows: rows[0]["old_asset_evidence"]["assets"][0]["history"]["disposition_record"].__setitem__("disposition", "tampered")),
        ("decision evidence", "E_DECISION_EVIDENCE", lambda inv, rows: rows[0]["old_asset_evidence"]["assets"][0]["decision_evidence"].__setitem__("status", "present_at_base")),
        ("failure evidence", "E_FAILURE_EVIDENCE", lambda inv, rows: rows[0]["failure_evidence"].__setitem__("observed_failure_status", "observed")),
        ("consumer evidence", "E_CONSUMER_EVIDENCE", lambda inv, rows: rows[0]["consumer_evidence"].__setitem__("closure_status", "closed")),
        ("phase review", "E_PHASE_REVIEW", lambda inv, rows: rows[0]["phase_review"].__setitem__("formal_phase_candidate", "PHCAP-20")),
        ("product authority", "E_PRODUCT_AUTHORITY", lambda inv, rows: rows[0]["product_review"].__setitem__("authority_product", "HELIX-OS")),
        ("current context", "E_CURRENT_CONTEXT", lambda inv, rows: rows[0]["current_context"][0].__setitem__("implementation_claim", True)),
        ("current implementation", "E_CURRENT_CONTEXT", lambda inv, rows: rows[0]["current_implementation"].__setitem__("status", "implemented")),
        ("unimplemented claim", "E_AUTHORITY_BOUNDARY", lambda inv, rows: rows[0]["unimplemented_assessment"].__setitem__("explicit_non_implementation_claim", True)),
        ("authority boundary", "E_AUTHORITY_BOUNDARY", lambda inv, rows: rows[0]["authority_boundary"].__setitem__("formal_phase_authority", True)),
    ]
    for name, expected, mutate in cases:
        run_case(name, expected, mutate)
    run_raw_bundle_case()
    run_generator_tamper_case()
    print(f"SCF-B-0116 selfcheck PASS ({len(cases) + 2} negative cases)")
