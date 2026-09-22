#!/usr/bin/env python3
"""Deterministic negative checks for SCF-B-0134."""
from __future__ import annotations

import contextlib
import copy
import io
import json
import tempfile
from pathlib import Path

import validate

HERE = Path(__file__).resolve().parent


def load_bundle() -> tuple[dict, list[dict]]:
    inventory = json.loads((HERE / "inventory.json").read_text(encoding="utf-8"))
    rows = [json.loads(line) for line in (HERE / "analysis.jsonl").read_text(encoding="utf-8").splitlines() if line.strip()]
    return inventory, rows


def write_bundle(path: Path, inventory: dict, rows: list[dict]) -> None:
    (path / "inventory.json").write_text(json.dumps(inventory, ensure_ascii=False), encoding="utf-8")
    (path / "analysis.jsonl").write_text("\n".join(json.dumps(row, ensure_ascii=False) for row in rows) + "\n", encoding="utf-8")
    (path / "phase-status-taxonomy-0105.units.jsonl").write_bytes((HERE / "phase-status-taxonomy-0105.units.jsonl").read_bytes())


def run_case(name: str, expected: str, mutate) -> None:
    inventory, rows = load_bundle()
    mutate(inventory, rows)
    with tempfile.TemporaryDirectory(prefix="scf-b-0134-selfcheck-") as temp:
        bundle = Path(temp)
        write_bundle(bundle, inventory, rows)
        checker = validate.Validator(validate.ROOT, bundle)
        with contextlib.redirect_stdout(io.StringIO()), contextlib.redirect_stderr(io.StringIO()):
            result = checker.validate()
        if result == 0 or not any(error.startswith(expected + ":") for error in checker.errors):
            raise AssertionError(f"{name}: expected {expected}, result={result}, errors={checker.errors}")
    print(f"PASS {name} -> {expected}")


def run_raw_bundle_case() -> None:
    with tempfile.TemporaryDirectory(prefix="scf-b-0134-raw-") as temp:
        bundle = Path(temp)
        (bundle / "inventory.json").write_text("{\n", encoding="utf-8")
        (bundle / "analysis.jsonl").write_text("", encoding="utf-8")
        checker = validate.Validator(validate.ROOT, bundle)
        with contextlib.redirect_stdout(io.StringIO()), contextlib.redirect_stderr(io.StringIO()):
            result = checker.validate()
        if result == 0 or not any(error.startswith("E_BUNDLE:") for error in checker.errors):
            raise AssertionError(f"malformed bundle: result={result}, errors={checker.errors}")
    print("PASS malformed bundle -> E_BUNDLE")


def wave_edge_detail(rows):
    rows[0]["wave_edges"][0]["asset_id"] = "tampered"


def candidate_phase(rows):
    rows[0]["candidate_phase_targets"].append("PHCAP-20")


def crosswalk(rows):
    rows[0]["crosswalk_id"] = "tampered"


def static_only(rows):
    rows[0]["static_only"] = False


def unit_schema(rows):
    rows[0]["schema"] = "tampered"


def inventory_schema(inventory):
    inventory["schema"] = "tampered"


def input_missing_path(inventory):
    inventory["input_snapshot"][0]["path"] = "docs/missing-input.jsonl"


if __name__ == "__main__":
    cases = [
        ("schema", "E_SCHEMA", lambda inv, rows: inv.__setitem__("unknown", True)),
        ("binding", "E_BINDING", lambda inv, rows: inv.__setitem__("binding_id", "SCF-B-9999")),
        ("base commit", "E_BASE_COMMIT", lambda inv, rows: inv["base"].__setitem__("commit", "0" * 40)),
        ("base ancestor", "E_BASE_NOT_ANCESTOR", lambda inv, rows: inv["base"].__setitem__("required_ancestor", "not-a-commit")),
        ("taxonomy non-ancestor", "E_TAXONOMY_NOT_ANCESTOR", lambda inv, rows: inv["taxonomy_snapshot"].__setitem__("commit", "not-a-commit")),
        ("taxonomy blob", "E_TAXONOMY_BLOB", lambda inv, rows: inv["taxonomy_snapshot"].__setitem__("blob_oid", "0" * 40)),
        ("input digest", "E_SOURCE_INPUT_DIGEST", lambda inv, rows: inv["input_snapshot"][0].__setitem__("sha256", "0" * 64)),
        ("input missing path", "E_SOURCE_INPUT_DIGEST", lambda inv, rows: input_missing_path(inv)),
        ("taxonomy snapshot declaration", "E_TAXONOMY_COVERAGE", lambda inv, rows: inv["taxonomy_snapshot"].__setitem__("path", "tampered")),
        ("source anchor", "E_SOURCE_ANCHOR", lambda inv, rows: rows[0]["source_anchor"].__setitem__("statement_text_sha256", "sha256:" + "0" * 64)),
        ("target set", "E_TARGET_SET", lambda inv, rows: rows.pop()),
        ("wave edge coverage", "E_WAVE_EDGE_COVERAGE", lambda inv, rows: rows[0]["wave_edge_ids"].pop()),
        ("asset evidence", "E_ASSET_EVIDENCE", lambda inv, rows: rows[0]["legacy_asset_ids"].pop()),
        ("taxonomy coverage", "E_TAXONOMY_COVERAGE", lambda inv, rows: rows[0]["taxonomy"]["authority_boundary"].__setitem__("formal_phase_authority_modified", True)),
        ("taxonomy status", "E_TAXONOMY_STATUS", lambda inv, rows: rows[0]["taxonomy"].__setitem__("status", "CROSS_CUTTING_PHASE_REVIEW_PENDING")),
        ("matrix rule", "E_MATRIX_RULE", lambda inv, rows: rows[0]["taxonomy"].__setitem__("matrix_rule_id", "M-CROSS-CONSTRAINT-REVIEW")),
        ("taxonomy candidate statement", "E_TAXONOMY_COVERAGE", lambda inv, rows: rows[0]["taxonomy"].__setitem__("candidate_statement", "tampered")),
        ("taxonomy judgment waiting", "E_TAXONOMY_COVERAGE", lambda inv, rows: rows[0]["taxonomy"]["judgment_waiting"]["items"].append("tampered")),
        ("taxonomy authority phase status", "E_TAXONOMY_COVERAGE", lambda inv, rows: rows[0]["taxonomy"].__setitem__("authority_phase_status", "approved")),
        ("taxonomy formal phase candidate", "E_TAXONOMY_COVERAGE", lambda inv, rows: rows[0]["taxonomy"].__setitem__("formal_phase_candidate", "PHCAP-20")),
        ("taxonomy direct phase candidate count", "E_TAXONOMY_COVERAGE", lambda inv, rows: rows[0]["taxonomy"].__setitem__("direct_phase_candidate_count", 1)),
        ("wave edge detail", "E_WAVE_EDGE_COVERAGE", lambda inv, rows: wave_edge_detail(rows)),
        ("candidate phase target", "E_TAXONOMY_COVERAGE", lambda inv, rows: candidate_phase(rows)),
        ("crosswalk binding", "E_SOURCE_ANCHOR", lambda inv, rows: crosswalk(rows)),
        ("unit static-only flag", "E_AUTHORITY_BOUNDARY", lambda inv, rows: static_only(rows)),
        ("unit schema", "E_SCHEMA", lambda inv, rows: unit_schema(rows)),
        ("inventory schema", "E_SCHEMA", lambda inv, rows: inventory_schema(inv)),
        ("inventory declaration", "E_INVENTORY_DECLARATION", lambda inv, rows: inv["scope"].__setitem__("wave_scan_row_count", 0)),
        ("reason class", "E_REASON_CLASS", lambda inv, rows: rows[0].__setitem__("reason_class", "CROSS_PHASE_UNRESOLVED")),
        ("reason description", "E_ANALYSIS_EVIDENCE", lambda inv, rows: rows[0].__setitem__("reason_description", "tampered")),
        ("source evidence remainder", "E_ANALYSIS_EVIDENCE", lambda inv, rows: rows[0]["required_source_evidence"].__setitem__(1, "tampered")),
        ("human decision text", "E_ANALYSIS_EVIDENCE", lambda inv, rows: rows[0]["required_human_decision"].__setitem__(0, "tampered")),
        ("consumer evidence text", "E_ANALYSIS_EVIDENCE", lambda inv, rows: rows[0]["required_consumer_evidence"].__setitem__(0, "tampered")),
        ("next action text", "E_ANALYSIS_EVIDENCE", lambda inv, rows: rows[0].__setitem__("next_action", "tampered")),
        ("product candidate scope", "E_ANALYSIS_EVIDENCE", lambda inv, rows: rows[0]["product_review"]["candidate_products"].append("HELIX-Web")),
        ("source evidence", "E_ANALYSIS_EVIDENCE", lambda inv, rows: rows[0].__setitem__("required_source_evidence", ["tampered"])),
        ("consumer evidence", "E_CONSUMER_EVIDENCE", lambda inv, rows: rows[0].__setitem__("required_consumer_evidence", [])),
        ("phase authority", "E_PHASE_AUTHORITY_SEPARATION", lambda inv, rows: rows[0]["phase_result"].__setitem__("direct_phase_evidence_count", 1)),
        ("product authority", "E_PRODUCT_AUTHORITY_SEPARATION", lambda inv, rows: rows[0]["product_review"].__setitem__("authority_product", "HELIX-OS")),
        ("authority boundary", "E_AUTHORITY_BOUNDARY", lambda inv, rows: rows[0]["authority_boundary"].__setitem__("formal_phase_authority_modified", True)),
        ("minimum conditions", "E_MINIMUM_CONDITIONS", lambda inv, rows: inv["formal_judgment_minimum_conditions"].pop()),
    ]
    for name, expected, mutate in cases:
        run_case(name, expected, mutate)
    run_raw_bundle_case()
    print(f"SCF-B-0134 selfcheck PASS ({len(cases) + 1} negative cases)")
