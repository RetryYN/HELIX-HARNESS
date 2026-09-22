#!/usr/bin/env python3
"""Negative mutation checks for SCF-B-0101; all mutations stay in tmpdir."""
from __future__ import annotations

import json
import shutil
import tempfile
from pathlib import Path

import validate


HERE = Path(__file__).resolve().parent


def run_case(name: str, mutate, expected: str) -> None:
    with tempfile.TemporaryDirectory(prefix="scf-b-0101-") as temp:
        bundle = Path(temp)
        for filename in ("inventory.json", "units.jsonl", "edges.jsonl"):
            shutil.copy2(HERE / filename, bundle / filename)
        mutate(bundle)
        errors = validate.validate(bundle=bundle, root=HERE.parents[1])
        if not any(item.startswith(expected) for item in errors):
            raise SystemExit(f"FAIL {name}: expected {expected}, got {errors}")
        print(f"PASS {name}: {expected}")


def mutate_source_digest(bundle: Path) -> None:
    rows = [json.loads(line) for line in (bundle / "units.jsonl").read_text(encoding="utf-8").splitlines()]
    rows[0]["source"]["statement_semantic_digest"] = "sha256:" + "0" * 64
    (bundle / "units.jsonl").write_text("\n".join(json.dumps(row, ensure_ascii=False, sort_keys=True) for row in rows) + "\n", encoding="utf-8")


def mutate_target_set(bundle: Path) -> None:
    rows = [json.loads(line) for line in (bundle / "units.jsonl").read_text(encoding="utf-8").splitlines()]
    rows[-1]["unit_candidate_id"] = "IRUNIT-FAKE"
    (bundle / "units.jsonl").write_text("\n".join(json.dumps(row, ensure_ascii=False, sort_keys=True) for row in rows) + "\n", encoding="utf-8")


def mutate_source_anchor(bundle: Path) -> None:
    rows = [json.loads(line) for line in (bundle / "units.jsonl").read_text(encoding="utf-8").splitlines()]
    rows[0]["source"]["source_text_spans"][0] = "改変anchor"
    (bundle / "units.jsonl").write_text("\n".join(json.dumps(row, ensure_ascii=False, sort_keys=True) for row in rows) + "\n", encoding="utf-8")


def mutate_edge_coverage(bundle: Path) -> None:
    rows = (bundle / "edges.jsonl").read_text(encoding="utf-8").splitlines()
    (bundle / "edges.jsonl").write_text("\n".join(rows[1:]) + "\n", encoding="utf-8")


def mutate_phase_authority(bundle: Path) -> None:
    rows = [json.loads(line) for line in (bundle / "units.jsonl").read_text(encoding="utf-8").splitlines()]
    rows[0]["phase_classification"]["eligible_phase_candidates"] = ["PHCAP-20"]
    (bundle / "units.jsonl").write_text("\n".join(json.dumps(row, ensure_ascii=False, sort_keys=True) for row in rows) + "\n", encoding="utf-8")


def mutate_product_authority(bundle: Path) -> None:
    rows = [json.loads(line) for line in (bundle / "units.jsonl").read_text(encoding="utf-8").splitlines()]
    rows[0]["product_classification"]["authority_product"] = "HELIX-OS"
    (bundle / "units.jsonl").write_text("\n".join(json.dumps(row, ensure_ascii=False, sort_keys=True) for row in rows) + "\n", encoding="utf-8")


if __name__ == "__main__":
    run_case("source digest tamper", mutate_source_digest, "E_SOURCE_DIGEST")
    run_case("target set tamper", mutate_target_set, "E_TARGET_SET")
    run_case("source anchor tamper", mutate_source_anchor, "E_SOURCE_ANCHOR")
    run_case("wave edge omission", mutate_edge_coverage, "E_WAVE_EDGE_COVERAGE")
    run_case("phase authority promotion", mutate_phase_authority, "E_PHASE_AUTHORITY_SEPARATION")
    run_case("product authority promotion", mutate_product_authority, "E_PRODUCT_AUTHORITY_SEPARATION")
