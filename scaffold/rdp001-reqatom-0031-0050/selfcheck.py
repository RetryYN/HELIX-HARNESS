#!/usr/bin/env python3
"""REQATOM A1 0031--0050 validator の意味ある負例 self-check。"""

from __future__ import annotations

import copy
import json
import sys
import tempfile
from pathlib import Path


HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
import validate  # noqa: E402  (同じ scaffold 候補の validator を検査する)
import generate  # noqa: E402  (generator出力もvalidatorへ通す)


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


def generator_negative(label: str, mutate_plan, needle: str) -> None:
    """Generate a mutated plan into a temp tree, then require validator rejection."""
    plan = copy.deepcopy(json.loads(validate.PLAN.read_text(encoding="utf-8")))
    mutate_plan(plan)
    with tempfile.TemporaryDirectory(prefix="reqatom-generator-selfcheck-", dir=generate.ROOT / "scaffold") as directory:
        directory_path = Path(directory)
        candidate_plan = directory_path / "atomization_plan.json"
        candidate_proposals = directory_path / "proposals.jsonl"
        candidate_inventory = directory_path / "inventory.json"
        candidate_plan.write_text(json.dumps(plan, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        original_generate = (generate.ATOMIZATION_PLAN, generate.PROP, generate.INVENTORY)
        original_validate = (validate.PLAN, validate.PROP, validate.INVENTORY)
        try:
            generate.ATOMIZATION_PLAN = candidate_plan
            generate.PROP = candidate_proposals
            generate.INVENTORY = candidate_inventory
            generate.main()
            validate.PLAN = candidate_plan
            validate.PROP = candidate_proposals
            validate.INVENTORY = candidate_inventory
            errors = validate.check()
        finally:
            generate.ATOMIZATION_PLAN, generate.PROP, generate.INVENTORY = original_generate
            validate.PLAN, validate.PROP, validate.INVENTORY = original_validate
    if not any(needle in error for error in errors):
        raise AssertionError(f"{label}: expected validator error containing {needle!r}, got {errors[:6]!r}")
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
        "reference-row-fragmentation",
        lambda rows: rows[9]["candidate_atoms"][0].update(
            verbatim_anchor="L0",
            exact_source_text="L0",
            retained_meaning=["L0"],
        ),
        "minimum source span／verbatim anchor",
    )
    proposal_negative(
        "table-cell-fragmentation",
        lambda rows: rows[0]["candidate_atoms"][0].update(
            verbatim_anchor="PO",
            exact_source_text="PO",
            retained_meaning=["PO"],
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
        "unknown-atom-key",
        lambda rows: rows[0]["candidate_atoms"][0].update(unknown_key="bogus"),
        "unknown candidate atom field",
    )
    proposal_negative(
        "ambiguous-web-singleton-routing",
        lambda rows: rows[2]["candidate_atoms"][4].update(candidate_target="HELIX-Web"),
        "semantic normalized/product/unresolved",
    )
    proposal_negative(
        "ordered-sequence-drift",
        lambda rows: rows[17]["candidate_atoms"][1]["typed_relation"].update(sequence_index=99),
        "typed_relation",
    )
    proposal_negative(
        "composite-loss",
        lambda rows: rows[1]["composite_unresolved"].pop(),
        "composite_unresolved count",
    )
    inventory_negative("authority-effect", lambda data: data.update(authority_effect="generated"), "authority_effect")
    inventory_negative(
        "source-input-digest",
        lambda data: data["inputs"].update(queue_sha256="0" * 64),
        "queue digest",
    )
    inventory_negative(
        "unknown-inventory-key",
        lambda data: data.update(unknown_key="bogus"),
        "inventory fields",
    )
    generator_negative(
        "generator-unfixed-line-atom-loss",
        lambda plan: plan["line_specs"]["REQSRC-LINE-00086"]["atomized"].pop(),
        "exact atomized line count",
    )
    generator_negative(
        "generator-composite-loss",
        lambda plan: plan["line_specs"]["REQSRC-LINE-00091"]["composite_unresolved"].pop(),
        "exact composite line count",
    )

    def replace_target(plan: dict) -> None:
        spec = plan["line_specs"]["REQSRC-LINE-00086"]["atomized"][0]
        spec["candidate_target"] = "HELIX-Web"
        spec["product_boundary"]["candidate_product"] = "HELIX-Web"
        spec["product_boundary"]["candidate_products"] = ["HELIX-Web"]

    generator_negative(
        "generator-target-replacement",
        replace_target,
        "independent four-product target counts",
    )
    print("PASS selfcheck: coverage/table-cell/authority/implementation/degradation/phase/source/predicate/typed-relation/product-boundary/web-routing/sequence/composite/digest/schema/generator-plan negative cases")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
