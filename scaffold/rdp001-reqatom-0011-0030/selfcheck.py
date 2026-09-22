#!/usr/bin/env python3
"""REQATOM A1 0011--0030 validator の意味ある負例 self-check。"""

from __future__ import annotations

import copy
import json
import sys
import tempfile
from pathlib import Path


HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
import validate  # noqa: E402  (同じ scaffold 候補の validator を検査する)


def read_jsonl(path: Path) -> list[dict]:
    return [json.loads(line) for line in path.read_text(encoding="utf-8").splitlines() if line.strip()]


def write_jsonl(path: Path, rows: list[dict]) -> None:
    path.write_text(
        "".join(json.dumps(row, ensure_ascii=False, separators=(",", ":")) + "\n" for row in rows),
        encoding="utf-8",
    )


def proposal_negative(label: str, mutate, needle: str) -> None:
    rows = copy.deepcopy(read_jsonl(validate.PROP))
    mutate(rows)
    with tempfile.TemporaryDirectory(prefix="reqatom-selfcheck-") as directory:
        candidate = Path(directory) / "proposals.jsonl"
        write_jsonl(candidate, rows)
        original = validate.PROP
        validate.PROP = candidate
        try:
            errors = validate.check()
        finally:
            validate.PROP = original
    if not any(needle in error for error in errors):
        raise AssertionError(f"{label}: expected validator error containing {needle!r}, got {errors[:4]!r}")
    print(f"PASS negative/{label}: {needle}")


def inventory_negative(label: str, mutate, needle: str) -> None:
    inventory = copy.deepcopy(json.loads(validate.INVENTORY.read_text(encoding="utf-8")))
    mutate(inventory)
    with tempfile.TemporaryDirectory(prefix="reqatom-selfcheck-") as directory:
        candidate = Path(directory) / "inventory.json"
        candidate.write_text(json.dumps(inventory, ensure_ascii=False), encoding="utf-8")
        original = validate.INVENTORY
        validate.INVENTORY = candidate
        try:
            errors = validate.check()
        finally:
            validate.INVENTORY = original
    if not any(needle in error for error in errors):
        raise AssertionError(f"{label}: expected validator error containing {needle!r}, got {errors[:4]!r}")
    print(f"PASS negative/{label}: {needle}")


def main() -> int:
    proposal_negative(
        "coverage-loss",
        lambda rows: rows[2]["candidate_atoms"].pop(1),
        "atomized obligation count",
    )
    proposal_negative(
        "same-line-duplicate",
        lambda rows: rows[2]["candidate_atoms"][1].update(
            verbatim_anchor=rows[2]["candidate_atoms"][0]["verbatim_anchor"],
            exact_source_text=rows[2]["candidate_atoms"][0]["exact_source_text"],
            retained_meaning=rows[2]["candidate_atoms"][0]["retained_meaning"],
        ),
        "minimum source span／verbatim anchor",
    )
    proposal_negative(
        "mode-row-fragmentation",
        lambda rows: rows[9]["candidate_atoms"][0].update(
            verbatim_anchor="Forward",
            exact_source_text="Forward",
            retained_meaning=["Forward"],
        ),
        "minimum source span／verbatim anchor",
    )
    proposal_negative(
        "authority-promotion",
        lambda rows: rows[0]["candidate_atoms"][0]["status_preservation"].update(target_authority="confirmed"),
        "status_preservation.target_authority",
    )
    proposal_negative(
        "implementation-promotion",
        lambda rows: rows[0]["candidate_atoms"][0]["status_preservation"].update(implementation_status="implemented"),
        "status_preservation.implementation_status",
    )
    proposal_negative(
        "degradation-promotion",
        lambda rows: rows[0]["candidate_atoms"][0]["status_preservation"].update(degradation_status="degraded"),
        "status_preservation.degradation_status",
    )
    proposal_negative(
        "phase-promotion",
        lambda rows: rows[0]["candidate_atoms"][0]["status_preservation"].update(phase_status="L3"),
        "status_preservation.phase_status",
    )
    proposal_negative(
        "source-meaning-drift",
        lambda rows: rows[0]["candidate_atoms"][0].update(exact_source_text="改変されたsource"),
        "minimum source span／verbatim anchor",
    )
    proposal_negative(
        "semantic-predicate-drift",
        lambda rows: rows[2]["candidate_atoms"][0].update(semantic_predicate="単なる切片"),
        "semantic_predicate",
    )
    proposal_negative(
        "typed-relation-drift",
        lambda rows: rows[2]["candidate_atoms"][0]["typed_relation"].update(relation_type="untyped"),
        "typed_relation",
    )
    proposal_negative(
        "product-boundary-drift",
        lambda rows: rows[2]["candidate_atoms"][0]["product_boundary"].update(candidate_product="HELIX-Web"),
        "product_boundary",
    )
    proposal_negative(
        "composite-loss",
        lambda rows: rows[2]["composite_unresolved"].pop(),
        "composite_unresolved count",
    )
    inventory_negative("authority-effect", lambda data: data.update(authority_effect="generated"), "authority_effect")
    inventory_negative(
        "source-input-digest",
        lambda data: data["inputs"].update(queue_sha256="0" * 64),
        "queue digest",
    )
    print("PASS selfcheck: coverage/duplicate/authority/implementation/degradation/phase/source/predicate/typed-relation/product-boundary/composite/digest negative cases")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
