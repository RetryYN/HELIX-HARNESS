#!/usr/bin/env python3
"""Exercise fail-closed coverage, boundary, linkage, and digest negatives."""
from __future__ import annotations

import copy
import importlib.util
import json
import tempfile
from pathlib import Path

HERE = Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location("vision_coverage_validator", HERE / "validate.py")
assert spec and spec.loader
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
module.validate()


def rejected(label: str, target: str, mutate) -> None:
    original_paths = {
        "inventory": module.INVENTORY_ARTIFACT,
        "parents": module.PARENT_ARTIFACT,
        "candidates": module.CANDIDATE_ARTIFACT,
        "matrix": module.MATRIX_ARTIFACT,
    }
    try:
        with tempfile.TemporaryDirectory(prefix="vision-coverage-0091-selfcheck-") as tmp:
            root = Path(tmp)
            data = {
                "inventory": json.loads((module.ROOT / original_paths["inventory"]).read_text()),
                "parents": module.load_jsonl(original_paths["parents"]),
                "candidates": module.load_jsonl(original_paths["candidates"]),
                "matrix": module.load_jsonl(original_paths["matrix"]),
            }
            mutate(data)
            paths = {
                "inventory": root / "inventory.json",
                "parents": root / "parent-coverage.jsonl",
                "candidates": root / "candidate-records.jsonl",
                "matrix": root / "connection-matrix.jsonl",
            }
            paths["parents"].write_text("".join(json.dumps(row, ensure_ascii=False, sort_keys=True, separators=(",", ":")) + "\n" for row in data["parents"]))
            paths["candidates"].write_text("".join(json.dumps(row, ensure_ascii=False, sort_keys=True, separators=(",", ":")) + "\n" for row in data["candidates"]))
            paths["matrix"].write_text("".join(json.dumps(row, ensure_ascii=False, sort_keys=True, separators=(",", ":")) + "\n" for row in data["matrix"]))
            data["inventory"]["source"]["parent_coverage_sha256"] = module.sha(paths["parents"].read_bytes())
            data["inventory"]["source"]["candidate_records_sha256"] = module.sha(paths["candidates"].read_bytes())
            data["inventory"]["source"]["connection_matrix_sha256"] = module.sha(paths["matrix"].read_bytes())
            paths["inventory"].write_text(json.dumps(data["inventory"], ensure_ascii=False, sort_keys=True, indent=2) + "\n")
            module.INVENTORY_ARTIFACT = paths["inventory"]
            module.PARENT_ARTIFACT = paths["parents"]
            module.CANDIDATE_ARTIFACT = paths["candidates"]
            module.MATRIX_ARTIFACT = paths["matrix"]
            module.validate()
    except AssertionError:
        print(f"PASS negative: {label}")
    else:
        raise AssertionError(f"negative accepted: {label}")
    finally:
        module.INVENTORY_ARTIFACT = original_paths["inventory"]
        module.PARENT_ARTIFACT = original_paths["parents"]
        module.CANDIDATE_ARTIFACT = original_paths["candidates"]
        module.MATRIX_ARTIFACT = original_paths["matrix"]


def inventory_mutation(fn):
    def apply(data):
        fn(data["inventory"])
    return apply


def candidate_mutation(fn):
    def apply(data):
        fn(data["candidates"])
    return apply


def parent_mutation(fn):
    def apply(data):
        fn(data["parents"])
    return apply


def matrix_mutation(fn):
    def apply(data):
        fn(data["matrix"])
    return apply


def remove_parent_candidate(rows):
    rows[0]["candidate_atom_ids"] = rows[0]["candidate_atom_ids"][1:]


def drift_candidate_source_line(rows):
    next(row for row in rows if row["atom_id"] == "WEB-FINAL-ATOM-001")["source_line_start"] += 1


def duplicate_candidate_id(rows):
    rows[1]["atom_id"] = rows[0]["atom_id"]


def promote_candidate_owner(rows):
    rows[0]["formal_owner_status"] = "HELIX-Web"


def promote_candidate_phase(rows):
    rows[0]["phase_candidate_ids"] = ["PHCAP-15"]
    rows[0]["phase_status"] = "candidate_static_evidence_only"


def promote_candidate_asset(rows):
    rows[0]["implementation_crosswalk_unit_ids"] = ["IRUNIT-HIL-WEB-001"]
    rows[0]["asset_status"] = "candidate_static_evidence_only"


def promote_candidate_implementation(rows):
    rows[0]["current_implementation_status"] = "complete"


def promote_candidate_product(rows):
    rows[0]["candidate_product_candidates"] = ["HELIX-Web", "invented-product"]


def empty_candidate_products(rows):
    rows[0]["candidate_product_candidates"] = []


def tamper_candidate_source_text(rows):
    rows[0]["exact_source_text"] = "invented source"


def duplicate_candidate_line(rows):
    rows[1]["source_line_start"] = rows[0]["source_line_start"]
    rows[1]["source_line_end"] = rows[0]["source_line_end"]


def break_parent_matrix(rows):
    next(row for row in rows if row["edge_kind"] == "parent_span_coverage")["to_id"] = "injected-candidate"


def promote_matrix_phase(rows):
    next(row for row in rows if row["edge_kind"] == "candidate_phase_unlinked")["to_id"] = "PHCAP-15"


def break_matrix_product(rows):
    next(row for row in rows if row["edge_kind"] == "candidate_product_boundary")["to_id"] = "invented-product"


def break_matrix_edge_order(rows):
    rows[0]["edge_id"] = "WVC-EDGE-999"


def bad_count(inv):
    inv["counts"]["candidate_records"] = 36


def bad_base(inv):
    inv["base_origin_main"] = "0" * 40


def bad_input_digest(inv):
    inv["inputs"][module.CROSSWALK_PATH] = "0" * 64


def formal_unit_generation(inv):
    inv["formal_requirement_unit_count"] = 35


def old_execution_promotion(inv):
    inv["old_runtime_test_ci_execution"] = True


def product_owner_promotion(inv):
    inv["products"][0]["formal_owner_status"] = "HELIX-Web"


def current_implementation_promotion(inv):
    inv["boundary"]["current_implementation"] = "complete"


def direct_phase_count_promotion(inv):
    inv["counts"]["phase_direct_links"] = 1


rejected("parent coverage omission", "parents", parent_mutation(remove_parent_candidate))
rejected("candidate source line drift", "candidates", candidate_mutation(drift_candidate_source_line))
rejected("candidate ID duplication", "candidates", candidate_mutation(duplicate_candidate_id))
rejected("formal owner promotion", "candidates", candidate_mutation(promote_candidate_owner))
rejected("phase candidate promotion", "candidates", candidate_mutation(promote_candidate_phase))
rejected("asset linkage promotion", "candidates", candidate_mutation(promote_candidate_asset))
rejected("current implementation promotion", "candidates", candidate_mutation(promote_candidate_implementation))
rejected("candidate product boundary promotion", "candidates", candidate_mutation(promote_candidate_product))
rejected("candidate product omission", "candidates", candidate_mutation(empty_candidate_products))
rejected("candidate source text tamper", "candidates", candidate_mutation(tamper_candidate_source_text))
rejected("duplicate source line", "candidates", candidate_mutation(duplicate_candidate_line))
rejected("parent matrix target injection", "matrix", matrix_mutation(break_parent_matrix))
rejected("matrix phase link promotion", "matrix", matrix_mutation(promote_matrix_phase))
rejected("matrix product target injection", "matrix", matrix_mutation(break_matrix_product))
rejected("matrix edge ordering tamper", "matrix", matrix_mutation(break_matrix_edge_order))
rejected("inventory count drift", "inventory", inventory_mutation(bad_count))
rejected("base revision tamper", "inventory", inventory_mutation(bad_base))
rejected("input digest tamper", "inventory", inventory_mutation(bad_input_digest))
rejected("formal requirement generation", "inventory", inventory_mutation(formal_unit_generation))
rejected("old execution promotion", "inventory", inventory_mutation(old_execution_promotion))
rejected("product owner promotion", "inventory", inventory_mutation(product_owner_promotion))
rejected("current implementation boundary promotion", "inventory", inventory_mutation(current_implementation_promotion))
rejected("direct phase count promotion", "inventory", inventory_mutation(direct_phase_count_promotion))

print("Wave coverage 0091 selfcheck: PASS (validator plus twenty-three negative mutations)")
