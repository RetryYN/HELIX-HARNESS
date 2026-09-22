#!/usr/bin/env python3
"""Negative mutation checks for SCF-B-0105; mutations stay in temporary bundles."""
from __future__ import annotations

import json
import shutil
import tempfile
from pathlib import Path

import validate

HERE = Path(__file__).resolve().parent


def copy_bundle() -> tuple[tempfile.TemporaryDirectory, Path]:
    temp = tempfile.TemporaryDirectory(prefix="scf-b-0105-")
    bundle = Path(temp.name)
    for filename in ("inventory.json", "decision-matrix.json", "units.jsonl"):
        shutil.copy2(HERE / filename, bundle / filename)
    return temp, bundle


def load_units(bundle: Path) -> list[dict]:
    return [json.loads(line) for line in (bundle / "units.jsonl").read_text(encoding="utf-8").splitlines()]


def save_units(bundle: Path, rows: list[dict]) -> None:
    (bundle / "units.jsonl").write_text(
        "\n".join(json.dumps(row, ensure_ascii=False, sort_keys=True) for row in rows) + "\n",
        encoding="utf-8",
    )


def save_inventory(bundle: Path, inventory: dict) -> None:
    (bundle / "inventory.json").write_text(json.dumps(inventory, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def run_case(name: str, mutate, expected: str, head_ref: str = "HEAD") -> None:
    temp, bundle = copy_bundle()
    try:
        mutate(bundle)
        errors = validate.validate(bundle=bundle, root=HERE.parents[1], head_ref=head_ref)
        if not any(item.startswith(expected) for item in errors):
            raise SystemExit(f"FAIL {name}: expected {expected}, got {errors}")
        print(f"PASS {name}: {expected}")
    finally:
        temp.cleanup()


def mutate_target_set(bundle: Path) -> None:
    rows = load_units(bundle)
    rows[-1]["unit_candidate_id"] = "IRUNIT-FAKE"
    save_units(bundle, rows)


def mutate_source_anchor(bundle: Path) -> None:
    rows = load_units(bundle)
    rows[0]["source_anchor"]["source_text_spans"][0] = "改変anchor"
    save_units(bundle, rows)


def mutate_wave_edge(bundle: Path) -> None:
    rows = load_units(bundle)
    rows[0]["wave_review"]["edge_refs"] = rows[0]["wave_review"]["edge_refs"][1:]
    save_units(bundle, rows)


def mutate_asset_evidence(bundle: Path) -> None:
    rows = load_units(bundle)
    rows[0]["legacy_asset_evidence"][0]["source"]["source_sha256"] = "sha256:" + "0" * 64
    save_units(bundle, rows)


def mutate_taxonomy_status(bundle: Path) -> None:
    rows = load_units(bundle)
    rows[0]["taxonomy"]["status"] = "FORMAL_PHASE_CONFIRMED"
    save_units(bundle, rows)


def mutate_matrix_rule(bundle: Path) -> None:
    matrix = json.loads((bundle / "decision-matrix.json").read_text(encoding="utf-8"))
    matrix["M-CROSS-CONSTRAINT-REVIEW"]["status"] = "UNRESOLVED_SOURCE_OR_HUMAN_REVIEW"
    (bundle / "decision-matrix.json").write_text(json.dumps(matrix, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def mutate_taxonomy_count(bundle: Path) -> None:
    inventory = json.loads((bundle / "inventory.json").read_text(encoding="utf-8"))
    inventory["taxonomy"]["status_counts"]["CROSS_CUTTING_PHASE_REVIEW_PENDING"] = 22
    save_inventory(bundle, inventory)


def mutate_taxonomy_expected_map_15(bundle: Path) -> None:
    """Reassign 15 valid units and reconcile counts; the fixed map must reject it."""
    rows = load_units(bundle)
    for row in rows[:15]:
        if row["taxonomy"]["matrix_rule_id"] == "M-CROSS-CONSTRAINT-REVIEW":
            row["taxonomy"]["matrix_rule_id"] = "M-WAIT-SOURCE-AUTHORITY"
            row["taxonomy"]["status"] = "UNRESOLVED_SOURCE_OR_HUMAN_REVIEW"
        else:
            row["taxonomy"]["matrix_rule_id"] = "M-CROSS-CONSTRAINT-REVIEW"
            row["taxonomy"]["status"] = "CROSS_CUTTING_PHASE_REVIEW_PENDING"
    save_units(bundle, rows)
    inventory = json.loads((bundle / "inventory.json").read_text(encoding="utf-8"))
    inventory["taxonomy"]["status_counts"] = {
        status: sum(row["taxonomy"]["status"] == status for row in rows)
        for status in validate.EXPECTED_STATUSES
    }
    save_inventory(bundle, inventory)


def mutate_taxonomy_candidate_statement(bundle: Path) -> None:
    rows = load_units(bundle)
    rows[0]["taxonomy"]["candidate_statement"] = "phase非適用と確定した"
    save_units(bundle, rows)


def mutate_taxonomy_nonapplicability_implementation_claim(bundle: Path) -> None:
    rows = load_units(bundle)
    rows[0]["taxonomy"]["candidate_statement"] = "phase非適用・phase確定・実装成立"
    save_units(bundle, rows)


def mutate_taxonomy_waiting_items(bundle: Path) -> None:
    rows = load_units(bundle)
    rows[0]["taxonomy"]["judgment_waiting"]["items"] = ["なし"]
    save_units(bundle, rows)


def mutate_taxonomy_evidence_join(bundle: Path) -> None:
    rows = load_units(bundle)
    rows[0]["taxonomy"]["required_evidence_join"]["exact source anchor"] = ["fabricated"]
    save_units(bundle, rows)


def mutate_inventory_declarations(bundle: Path) -> None:
    inventory = json.loads((bundle / "inventory.json").read_text(encoding="utf-8"))
    inventory["status"] = "formal_phase_authority"
    inventory["scope"].update({
        "parent_binding_id": "SCF-B-9999",
        "target_crosswalk_status": "resolved",
        "wave_edge_count": 999,
        "legacy_asset_count": 999,
    })
    inventory["taxonomy"].update({
        "version": "MUT",
        "primary_statuses": ["MUT"],
        "matrix_rule_ids": ["MUT"],
    })
    inventory["phcap20_definition_refs"][0]["role"] = "MUT"
    inventory["negative_case_codes"] = ["MUT"]
    save_inventory(bundle, inventory)


def mutate_unit_declarations(bundle: Path) -> None:
    rows = load_units(bundle)
    row = rows[0]
    row["requirement_id"] = "HIL-FAKE-99"
    row["crosswalk_id"] = "IRIMPLX-9999"
    row["product_scope_candidate"] = ["HELIX-Web"]
    row["product_context"]["candidate_products"] = ["HELIX-Web-OS"]
    row["phase_context"]["observed_asset_candidate_phases"] = ["PHCAP-01"]
    row["phase_context"]["phcap20_direct_rule"] = "PHCAP-20の不在はphase非適用を意味する"
    save_units(bundle, rows)


def mutate_phcap_boundary_classification(bundle: Path) -> None:
    rows = load_units(bundle)
    for row in rows:
        if row["unit_candidate_id"] == "IRUNIT-HIL-FR-18-HELIX-OS":
            row["taxonomy"]["matrix_rule_id"] = "M-CROSS-CONSTRAINT-REVIEW"
            row["taxonomy"]["status"] = "CROSS_CUTTING_PHASE_REVIEW_PENDING"
            break
    save_units(bundle, rows)


def mutate_phcap_boundary_coverage(bundle: Path) -> None:
    rows = load_units(bundle)
    for row in rows:
        if row["unit_candidate_id"] == "IRUNIT-HIL-FR-21-HELIX-OS":
            row["phase_context"]["phcap_boundary_review"]["phase_ids"] = row["phase_context"]["phcap_boundary_review"]["phase_ids"][:-1]
            break
    save_units(bundle, rows)


def mutate_phase_authority(bundle: Path) -> None:
    rows = load_units(bundle)
    rows[0]["taxonomy"]["formal_phase_candidate"] = "PHCAP-20"
    save_units(bundle, rows)


def mutate_product_authority(bundle: Path) -> None:
    rows = load_units(bundle)
    rows[0]["product_context"]["authority_product"] = "HELIX-OS"
    save_units(bundle, rows)


def mutate_input_digest(bundle: Path) -> None:
    inventory = json.loads((bundle / "inventory.json").read_text(encoding="utf-8"))
    inventory["input_digests"][0]["sha256"] = "sha256:" + "0" * 64
    save_inventory(bundle, inventory)


def mutate_base_commit(bundle: Path) -> None:
    inventory = json.loads((bundle / "inventory.json").read_text(encoding="utf-8"))
    inventory["base"]["commit"] = "0" * 40
    save_inventory(bundle, inventory)


def mutate_authority_boundary(bundle: Path) -> None:
    inventory = json.loads((bundle / "inventory.json").read_text(encoding="utf-8"))
    inventory["new_build_allowed"] = True
    save_inventory(bundle, inventory)


if __name__ == "__main__":
    run_case("target set tamper", mutate_target_set, "E_TARGET_SET")
    run_case("source anchor tamper", mutate_source_anchor, "E_SOURCE_ANCHOR")
    run_case("wave edge omission", mutate_wave_edge, "E_WAVE_EDGE_COVERAGE")
    run_case("asset evidence tamper", mutate_asset_evidence, "E_ASSET_EVIDENCE")
    run_case("taxonomy status tamper", mutate_taxonomy_status, "E_TAXONOMY_STATUS")
    run_case("matrix rule tamper", mutate_matrix_rule, "E_MATRIX_RULE")
    run_case("taxonomy count tamper", mutate_taxonomy_count, "E_TAXONOMY_COVERAGE")
    run_case("15-unit taxonomy map reassignment", mutate_taxonomy_expected_map_15, "E_TAXONOMY_EXPECTATION")
    run_case("taxonomy candidate statement tamper", mutate_taxonomy_candidate_statement, "E_TAXONOMY_EXPECTATION")
    run_case("phase nonapplicability/confirmation/implementation claim", mutate_taxonomy_nonapplicability_implementation_claim, "E_TAXONOMY_EXPECTATION")
    run_case("taxonomy judgment waiting tamper", mutate_taxonomy_waiting_items, "E_TAXONOMY_EXPECTATION")
    run_case("taxonomy evidence join tamper", mutate_taxonomy_evidence_join, "E_TAXONOMY_EVIDENCE_JOIN")
    run_case("inventory declaration leaves tamper", mutate_inventory_declarations, "E_INVENTORY_DECLARATION")
    run_case("unit declaration leaves tamper", mutate_unit_declarations, "E_UNIT_DECLARATION")
    run_case("PHCAP boundary classification tamper", mutate_phcap_boundary_classification, "E_PHCAP_BOUNDARY_CLASSIFICATION")
    run_case("PHCAP boundary coverage tamper", mutate_phcap_boundary_coverage, "E_PHCAP_BOUNDARY_COVERAGE")
    run_case("phase authority promotion", mutate_phase_authority, "E_PHASE_AUTHORITY_SEPARATION")
    run_case("product authority promotion", mutate_product_authority, "E_PRODUCT_AUTHORITY_SEPARATION")
    run_case("input digest tamper", mutate_input_digest, "E_SOURCE_INPUT_DIGEST")
    run_case("base commit tamper", mutate_base_commit, "E_BASE_COMMIT")
    temp, bundle = copy_bundle()
    try:
        errors = validate.validate(bundle=bundle, root=HERE.parents[1], head_ref=f"{validate.BASE_COMMIT}^")
        if not any(item.startswith("E_BASE_NOT_ANCESTOR") for item in errors):
            raise SystemExit(f"FAIL base not ancestor: expected E_BASE_NOT_ANCESTOR, got {errors}")
        print("PASS base not ancestor: E_BASE_NOT_ANCESTOR")
    finally:
        temp.cleanup()
    run_case("authority boundary tamper", mutate_authority_boundary, "E_AUTHORITY_BOUNDARY")
