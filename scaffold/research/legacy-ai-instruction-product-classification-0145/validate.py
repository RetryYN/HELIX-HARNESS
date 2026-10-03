#!/usr/bin/env python3
"""Fail-closed validator for the SCF-B-0145 static research bundle."""
from __future__ import annotations

import argparse
import contextlib
import io
import json
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

import generate as g


def error(code: str, detail: str) -> None:
    raise ValueError(f"{code}: {detail}")


def same_typed_value(actual, expected) -> bool:
    """Compare JSON values without Python's bool/int/float equality aliases."""
    if type(actual) is not type(expected):
        return False
    if type(expected) is dict:
        return actual.keys() == expected.keys() and all(
            same_typed_value(actual[key], expected[key]) for key in expected
        )
    if type(expected) is list:
        return len(actual) == len(expected) and all(
            same_typed_value(left, right) for left, right in zip(actual, expected, strict=True)
        )
    return actual == expected


def load_json(path: Path, label: str):
    return g.strict_json(path.read_bytes(), label)


def load_jsonl(path: Path, label: str) -> list[dict]:
    return g.parse_jsonl(path.read_bytes(), label)


def classify_row_difference(got: dict, expected: dict) -> tuple[str, str]:
    if got.get("asset_id") != expected.get("asset_id") or got.get("source_path") != expected.get("source_path") or got.get("source_sha256") != expected.get("source_sha256"):
        return "E_SOURCE", "asset identity differs from fixed target set"
    for field in ("source_exact", "classification", "phase_evidence", "implementation_evidence", "legacy_history_failure_consumer"):
        if type(got.get(field)) is not dict:
            return "E_RECORD", f"{field} must be a JSON object"
    actual_source = got["source_exact"]
    expected_source = expected["source_exact"]
    if not same_typed_value(actual_source.get("archive_path"), expected_source.get("archive_path")) or not same_typed_value(actual_source.get("source_path"), expected_source.get("source_path")):
        return "E_ARCHIVE_PATH", "source path/archive path differs"
    if not same_typed_value(actual_source.get("archive_mode"), expected_source.get("archive_mode")):
        return "E_ARCHIVE_MODE", "archive mode differs from pinned Git tree"
    if not same_typed_value(actual_source.get("archive_type"), expected_source.get("archive_type")):
        return "E_ARCHIVE_TYPE", "archive object type differs from pinned Git tree"
    if not same_typed_value(actual_source.get("archive_manifest_sha256"), expected_source.get("archive_manifest_sha256")) or not same_typed_value(actual_source.get("archive_manifest_match"), expected_source.get("archive_manifest_match")):
        return "E_ARCHIVE_MANIFEST", "MANIFEST receipt differs"
    if not same_typed_value(actual_source.get("blob"), expected_source.get("blob")):
        return "E_ARCHIVE_BLOB", "Git blob identity differs"
    if not same_typed_value(actual_source.get("sha256"), expected_source.get("sha256")) or actual_source.get("ledger_digest_match") is not True:
        return "E_ARCHIVE_BLOB", "archive content digest differs"
    if not same_typed_value(actual_source.get("semantic_anchor"), expected_source.get("semantic_anchor")):
        return "E_SOURCE_ANCHOR", "manual source span or interpretation differs"
    if not same_typed_value(actual_source.get("anchor_line_coverage"), expected_source.get("anchor_line_coverage")):
        return "E_SOURCE_COVERAGE", "source span coverage differs"
    if not same_typed_value(actual_source, expected_source):
        return "E_SOURCE", "archive receipt contains changed or unknown fields"
    actual_class = got["classification"]
    expected_class = expected["classification"]
    for key, code in (("category", "E_MANUAL_CATEGORY"), ("candidate_products", "E_MANUAL_PRODUCT"),
                      ("product_basis", "E_MANUAL_PRODUCT_BASIS"), ("counterevidence", "E_MANUAL_COUNTEREVIDENCE")):
        if not same_typed_value(actual_class.get(key), expected_class.get(key)):
            return code, f"classification.{key} differs"
    if not same_typed_value(actual_class, expected_class):
        return "E_MANUAL_CATEGORY", "classification contains changed or unknown fields"
    if not same_typed_value(got.get("phase_evidence"), expected.get("phase_evidence")):
        return "E_PHASE", "phase candidate evidence differs or was promoted"
    if not same_typed_value(got.get("implementation_evidence"), expected.get("implementation_evidence")):
        return "E_IMPLEMENTATION", "implementation evidence differs"
    got_history = got["legacy_history_failure_consumer"]
    expected_history = expected["legacy_history_failure_consumer"]
    if not same_typed_value(got_history.get("failure_consumer_static"), expected_history["failure_consumer_static"]):
        return "E_CONSUMER_CLOSURE", "failure/consumer relation or closure differs"
    if (not same_typed_value(got_history.get("historical_context"), expected_history["historical_context"]) or
            not same_typed_value(got_history.get("asset_decision"), expected_history["asset_decision"]) or
            not same_typed_value(got_history.get("read_after"), expected_history["read_after"])):
        return "E_HISTORY_FAILURE", "historical decision/read-after evidence differs"
    if not same_typed_value(got.get("wave_semantic_links"), expected.get("wave_semantic_links")) or not same_typed_value(got.get("wave_edge_count"), expected.get("wave_edge_count")):
        return "E_WAVE44", "semantic review-wave edge differs"
    if got.get("authority_effect") != "none" or got.get("formal_asset_classification_updated") is not False:
        return "E_AUTHORITY", "research output claims authority/formal status"
    if got.get("new_build_allowed") is not False:
        return "E_NEW_BUILD", "new build permission is not false"
    if not same_typed_value(got, expected):
        return "E_RECORD", "record contains changed or unknown fields"
    return "", ""


def classify_inventory_difference(got: dict, expected: dict) -> tuple[str, str]:
    scope = got.get("research_scope", {})
    if type(scope) is not dict:
        return "E_INVENTORY", "research_scope must be a JSON object"
    exp_scope = expected["research_scope"]
    if (not same_typed_value(scope.get("target_ids"), exp_scope.get("target_ids")) or
            not same_typed_value(scope.get("target_count"), exp_scope.get("target_count")) or
            not same_typed_value(scope.get("target_source_path_sha256"), exp_scope.get("target_source_path_sha256"))):
        return "E_INVENTORY_TARGET", "inventory exact target set differs"
    if not same_typed_value(got.get("classification_counts"), expected.get("classification_counts")):
        return "E_INVENTORY_CATEGORY", "inventory category counts differ"
    if not same_typed_value(got.get("overlap_status"), expected.get("overlap_status")):
        return "E_OVERLAP", "inventory overlap evidence differs"
    if not same_typed_value(got.get("input_digests"), expected.get("input_digests")):
        return "E_INVENTORY_INPUT", "inventory upstream digest list differs"
    if not same_typed_value(got.get("profile_sha256"), expected.get("profile_sha256")):
        return "E_PROFILE_PIN", "inventory profile digest differs"
    if not same_typed_value(got.get("authority_boundary"), expected.get("authority_boundary")):
        return "E_AUTHORITY", "inventory authority boundary differs"
    if not same_typed_value(got.get("negative_cases_expected_order"), expected.get("negative_cases_expected_order")):
        return "E_NEGATIVE_CASES", "negative-case order differs"
    if not same_typed_value(got, expected):
        return "E_INVENTORY", "inventory contains changed or unknown fields"
    return "", ""


def _validate(bundle: Path, binding_path: Path) -> None:
    actual_ledger = load_jsonl(bundle / "classification-research.jsonl", "classification-research.jsonl")
    actual_inventory = load_json(bundle / "inventory.json", "inventory.json")
    actual_binding = load_json(binding_path, str(binding_path))
    if type(actual_inventory) is not dict or type(actual_binding) is not dict:
        error("E_JSON", "inventory and Binding must be JSON objects")
    actual_ledger_bytes = (bundle / "classification-research.jsonl").read_bytes()
    if g.tagged(actual_ledger_bytes) != actual_inventory.get("output_sha256"):
        error("E_OUTPUT_DIGEST", "classification ledger bytes differ from inventory.output_sha256")
    for index, row in enumerate(actual_ledger):
        for field in ("source_exact", "classification", "phase_evidence", "implementation_evidence", "legacy_history_failure_consumer"):
            if type(row.get(field)) is not dict:
                error("E_RECORD", f"classification record {index} field {field} must be a JSON object")

    actual_ids = [row.get("asset_id") for row in actual_ledger]
    if len(actual_ids) != len(set(actual_ids)):
        error("E_TARGET_DUPLICATE", "classification ledger has duplicate asset IDs")
    try:
        prior = g.prior_unions(bundle)
        prior_ids = {g.source_identity(row)[0] for rows in prior for row in rows}
        prior_path_sha = {(g.source_identity(row)[1], g.source_identity(row)[2]) for rows in prior for row in rows}
    except SystemExit as exc:
        error("E_RESEARCH_INPUT", str(exc))
    actual_identity = [g.source_identity(row) for row in actual_ledger]
    if any(aid in prior_ids or (path, sha) in prior_path_sha for aid, path, sha in actual_identity):
        error("E_OVERLAP", "classification row overlaps the single main537 union by asset ID or source path/SHA")

    # Rebuild into a disposable copy. This recomputes every target, archive blob/type/mode,
    # MANIFEST receipt, upstream input digest, semantic rule and Binding edge from pinned inputs.
    old_bundle, old_binding = g.BUNDLE, g.BINDING
    try:
        with tempfile.TemporaryDirectory(prefix="scf-b-0145-validate-") as temp_name:
            temp = Path(temp_name)
            expected_bundle = temp / "bundle"
            shutil.copytree(bundle, expected_bundle)
            expected_binding_path = temp / "scaffold" / "bindings" / "SCF-B-0145.json"
            expected_binding_path.parent.mkdir(parents=True, exist_ok=True)
            g.BUNDLE = expected_bundle
            g.BINDING = expected_binding_path
            with contextlib.redirect_stdout(io.StringIO()):
                try:
                    g.build()
                except SystemExit as exc:
                    message = str(exc)
                    code = message.split(":", 1)[0] if ":" in message else "E_REBUILD"
                    error(code, message)
            expected_ledger = load_jsonl(expected_bundle / "classification-research.jsonl", "expected classification-research.jsonl")
            expected_inventory = load_json(expected_bundle / "inventory.json", "expected inventory.json")
            expected_binding = load_json(expected_binding_path, "expected SCF-B-0145.json")
    finally:
        g.BUNDLE, g.BINDING = old_bundle, old_binding

    expected_ids = [row["asset_id"] for row in expected_ledger]
    got_ids = set(actual_ids)
    want_ids = set(expected_ids)
    if got_ids != want_ids:
        if want_ids - got_ids:
            error("E_TARGET_OMISSION", f"missing {len(want_ids - got_ids)} target IDs")
        error("E_TARGET_EXTRA", f"unexpected {len(got_ids - want_ids)} target IDs")
    expected_by_id = {row["asset_id"]: row for row in expected_ledger}
    actual_by_id = {row["asset_id"]: row for row in actual_ledger}
    for aid in expected_ids:
        code, detail = classify_row_difference(actual_by_id[aid], expected_by_id[aid])
        if code:
            error(code, f"{aid}: {detail}")

    code, detail = classify_inventory_difference(actual_inventory, expected_inventory)
    if code:
        error(code, detail)

    expected_upstream = {row["path"]: row["sha256"] for row in expected_binding.get("upstream", [])}
    actual_upstream_rows = actual_binding.get("upstream")
    if type(actual_upstream_rows) is not list:
        error("E_BINDING", "Binding upstream must be a list")
    actual_upstream = {row.get("path"): row.get("sha256") for row in actual_upstream_rows if type(row) is dict}
    if len(actual_upstream) != len(actual_upstream_rows):
        error("E_BINDING", "Binding upstream has malformed or duplicate entries")
    if set(expected_upstream) - set(actual_upstream):
        error("E_BINDING_OMISSION", "Binding is missing required upstream entries")
    if set(actual_upstream) - set(expected_upstream):
        error("E_BINDING_EXTRA", "Binding has unpinned upstream entries")
    if actual_upstream != expected_upstream:
        error("E_BINDING_STALE", "Binding upstream digests differ from recomputed inputs")
    if not same_typed_value(actual_binding, expected_binding):
        error("E_BINDING", "Binding metadata differs from fixed research-only contract")

    audit_script = bundle / "independent-source-audit.py"
    audit = subprocess.run([sys.executable, str(audit_script), "--bundle", str(bundle)], cwd=g.ROOT,
                           text=True, capture_output=True)
    if audit.returncode:
        error("E_AUDIT_REPORT", audit.stderr.strip() or audit.stdout.strip() or "independent source audit failed")


def validate(bundle: Path, binding_path: Path) -> tuple[bool, str]:
    try:
        _validate(bundle, binding_path)
        return True, ""
    except (ValueError, OSError, KeyError, TypeError, AttributeError, SystemExit) as exc:
        message = str(exc)
        return False, message.split(":", 1)[0] if ":" in message else "E_VALIDATE"


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--bundle", type=Path, default=g.BUNDLE)
    parser.add_argument("--binding", type=Path, default=g.BINDING)
    args = parser.parse_args()
    ok, detail = validate(args.bundle.resolve(), args.binding.resolve())
    if not ok:
        print(f"SCF-B-0145 validate FAIL {detail}", file=sys.stderr)
        return 1
    print("SCF-B-0145 validate PASS targets=72 archive_receipts=72 upstream_inputs=exact overlaps=0 authority_effect=none new_build_allowed=false")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
