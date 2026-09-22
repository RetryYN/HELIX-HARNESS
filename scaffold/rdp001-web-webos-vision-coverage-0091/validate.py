#!/usr/bin/env python3
"""Fail-closed validator for the 29-span Web/Web-OS coverage scaffold."""
from __future__ import annotations

import hashlib
import json
import subprocess
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
BASE = "f15c3ca2ed1dc865b242b0a21e1516fdeec6f9f6"
VISION = "archive/legacy-generation-2026-09-14/root/docs/archive/intake/2026-09-06-concept-vision/vision/HELIX_VISION_v0.1.md"
SPAN_PATH = "scaffold/rdp001-web-webos-vision-source-0080/vision-spans.jsonl"
PHASE_PATH = "docs/governance/phase-capability-inventory.json"
CROSSWALK_PATH = "docs/governance/legacy-requirement-implementation-crosswalk-bootstrap.jsonl"
PRODUCT_BOUNDARY_PATH = "docs/concept/product-boundary.md"
PRODUCT_DOCS = [
    "docs/helix-harness/L1-planning/product-intent.md",
    "docs/helix-os/L1-planning/system-intent.md",
    "docs/helix-web/L1-planning/product-intent.md",
    "docs/helix-web-os/L1-planning/system-intent.md",
]
LEGACY_LEDGER_PATHS = [
    "docs/governance/legacy-asset-disposition.jsonl",
    "docs/governance/legacy-asset-decisions.jsonl",
    "docs/governance/legacy-asset-copy-read-after.jsonl",
]
PRODUCTS = ["HELIX-HARNESS", "HELIX-OS", "HELIX-Web", "HELIX-Web-OS"]
DIRECT_LINK_FIELDS = {
    "vision_span_id", "vision_span_ids", "parent_span_id", "parent_span_ids",
    "candidate_atom_id", "candidate_atom_ids", "atom_id", "atom_ids",
    "source_parent_span_id", "source_parent_span_ids", "source_atom_id", "source_atom_ids",
}
INVENTORY_ARTIFACT = "scaffold/rdp001-web-webos-vision-coverage-0091/inventory.json"
PARENT_ARTIFACT = "scaffold/rdp001-web-webos-vision-coverage-0091/parent-coverage.jsonl"
CANDIDATE_ARTIFACT = "scaffold/rdp001-web-webos-vision-coverage-0091/candidate-records.jsonl"
MATRIX_ARTIFACT = "scaffold/rdp001-web-webos-vision-coverage-0091/connection-matrix.jsonl"
BUNDLES = {
    "0080": {"binding": "scaffold/bindings/SCF-B-0080.json", "inventory": "scaffold/rdp001-web-webos-vision-source-0080/inventory.json", "spans": SPAN_PATH, "relations": "scaffold/rdp001-web-webos-vision-source-0080/source-relations.jsonl", "legacy": "scaffold/rdp001-web-webos-vision-source-0080/legacy-evidence.jsonl"},
    "0081": {"binding": "scaffold/bindings/SCF-B-0081.json", "inventory": "scaffold/rdp001-web-webos-vision-semantic-atoms-0081/inventory.json", "atoms": "scaffold/rdp001-web-webos-vision-semantic-atoms-0081/semantic-atoms.jsonl", "links": "scaffold/rdp001-web-webos-vision-semantic-atoms-0081/legacy-links.jsonl"},
    "0084": {"binding": "scaffold/bindings/SCF-B-0084.json", "inventory": "scaffold/rdp001-web-webos-vision-semantic-atoms-0084/inventory.json", "atoms": "scaffold/rdp001-web-webos-vision-semantic-atoms-0084/semantic-atoms.jsonl", "links": "scaffold/rdp001-web-webos-vision-semantic-atoms-0084/legacy-links.jsonl"},
    "0088": {"binding": "scaffold/bindings/SCF-B-0088.json", "inventory": "scaffold/rdp001-web-webos-vision-semantic-atoms-0088/inventory.json", "atoms": "scaffold/rdp001-web-webos-vision-semantic-atoms-0088/semantic-atoms.jsonl", "links": "scaffold/rdp001-web-webos-vision-semantic-atoms-0088/legacy-links.jsonl"},
}


def fail(code: str, detail: str = "") -> None:
    raise AssertionError(code + ((":" + detail) if detail else ""))


def sha(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def file_sha(rel: str) -> str:
    path = ROOT / rel
    if not path.is_file():
        fail("E_INPUT_MISSING", rel)
    return sha(path.read_bytes())


def load_json(rel: str) -> dict:
    return json.loads((ROOT / rel).read_text(encoding="utf-8"))


def load_jsonl(rel: str) -> list[dict]:
    return [json.loads(line) for line in (ROOT / rel).read_text(encoding="utf-8").splitlines() if line.strip()]


def exact_keys(value: object, expected: set[str], code: str) -> None:
    if not isinstance(value, dict) or set(value) != expected:
        got = sorted(set(value) ^ expected) if isinstance(value, dict) else "not-object"
        fail(code, ",".join(got) if isinstance(got, list) else got)


def direct_link_value_contains(value: object, tokens: list[str]) -> bool:
    if isinstance(value, list):
        return any(direct_link_value_contains(item, tokens) for item in value)
    return isinstance(value, str) and value in tokens


def direct_link_field_contains(value: object, tokens: list[str]) -> bool:
    if not isinstance(value, dict):
        return False
    return any(
        key in DIRECT_LINK_FIELDS and direct_link_value_contains(item, tokens)
        for key, item in value.items()
    )


def direct_matches(atom: dict, phase: dict, crosswalk: list[dict]) -> tuple[list[str], list[str]]:
    tokens = [atom["atom_id"], atom["parent_span_id"]]
    phase_ids = sorted({row["phase"] for row in phase["records"] if direct_link_field_contains(row, tokens)})
    crosswalk_ids = sorted({row["unit_candidate_id"] for row in crosswalk if direct_link_field_contains(row, tokens)})
    return phase_ids, crosswalk_ids


def expected_atoms() -> tuple[list[dict], dict[str, str]]:
    atoms, origins = [], {}
    for bundle_id in ("0081", "0084", "0088"):
        for atom in load_jsonl(BUNDLES[bundle_id]["atoms"]):
            atoms.append(atom)
            origins[atom["atom_id"]] = bundle_id
    return atoms, origins


def validate() -> None:
    inventory = load_json(INVENTORY_ARTIFACT)
    parents = load_jsonl(PARENT_ARTIFACT)
    candidates = load_jsonl(CANDIDATE_ARTIFACT)
    matrix = load_jsonl(MATRIX_ARTIFACT)
    exact_keys(inventory, {"schema", "candidate_id", "status", "authority_effect", "meaning_change_applied", "formal_requirement_unit_count", "formal_owner_status", "successor_requirement_ids", "human_decision_ref", "formal_register_append", "old_runtime_test_ci_execution", "base_origin_main", "inputs", "source", "counts", "products", "boundary", "unresolved_questions", "verification_contract", "residuals"}, "E_INV_KEYS")
    if inventory["schema"] != "rdp001-web-webos-vision-coverage/v1" or inventory["candidate_id"] != "RDP-001-WEB-WEBOS-VISION-COVERAGE-0091":
        fail("E_IDENTITY")
    if inventory["status"] != "findings_only" or inventory["authority_effect"] != "none" or inventory["meaning_change_applied"] or inventory["formal_requirement_unit_count"] != "not_generated" or inventory["formal_owner_status"] != "unknown":
        fail("E_BOUNDARY")
    if inventory["successor_requirement_ids"] or inventory["human_decision_ref"] is not None or inventory["formal_register_append"] or inventory["old_runtime_test_ci_execution"]:
        fail("E_PROMOTION")
    head = subprocess.run(["git", "rev-parse", "HEAD"], cwd=ROOT, capture_output=True, text=True, check=False).stdout.strip()
    if inventory["base_origin_main"] != BASE or subprocess.run(["git", "merge-base", "--is-ancestor", BASE, head], cwd=ROOT, check=False).returncode:
        fail("E_BASE")
    required_inputs = [SPAN_PATH, PHASE_PATH, CROSSWALK_PATH, PRODUCT_BOUNDARY_PATH, *PRODUCT_DOCS, *LEGACY_LEDGER_PATHS, *[path for bundle in BUNDLES.values() for path in bundle.values()]]
    if set(inventory["inputs"]) != set(required_inputs):
        fail("E_INPUT_KEYSET")
    for path, expected in inventory["inputs"].items():
        if file_sha(path) != expected:
            fail("E_INPUT_DIGEST", path)

    source_bytes = (ROOT / VISION).read_bytes()
    source_lines = source_bytes.decode(encoding="utf-8").splitlines(keepends=True)
    spans = load_jsonl(SPAN_PATH)
    if len(spans) != 29 or len({row["span_id"] for row in spans}) != 29:
        fail("E_PARENT_DENOM")
    span_by = {row["span_id"]: row for row in spans}
    if inventory["source"]["vision_sha256"] != sha(source_bytes) or inventory["source"]["vision_line_count"] != len(source_lines):
        fail("E_VISION_SOURCE")
    if inventory["source"]["parent_span_sha256"] != file_sha(SPAN_PATH):
        fail("E_PARENT_SOURCE_DIGEST")
    if inventory["source"]["parent_coverage_sha256"] != file_sha(PARENT_ARTIFACT) or inventory["source"]["candidate_records_sha256"] != file_sha(CANDIDATE_ARTIFACT) or inventory["source"]["connection_matrix_sha256"] != file_sha(MATRIX_ARTIFACT):
        fail("E_OUTPUT_DIGEST")

    atoms, origins = expected_atoms()
    if len(atoms) != 35 or len({row["atom_id"] for row in atoms}) != 35:
        fail("E_CANDIDATE_DENOM")
    atom_by = {row["atom_id"]: row for row in atoms}
    if len(parents) != 29 or [row["parent_span_id"] for row in parents] != [row["span_id"] for row in spans]:
        fail("E_PARENT_ORDER")
    if len(candidates) != 35 or set(row["atom_id"] for row in candidates) != set(atom_by):
        fail("E_CANDIDATE_ORDER")
    candidate_by = {row["atom_id"]: row for row in candidates}
    candidate_lines = []
    for parent in parents:
        span = span_by[parent["parent_span_id"]]
        if parent["source_span_sha256"] != span["sha256"] or parent["exact_source_text"] != span["exact_source_text"] or parent["source_line_start"] != span["line_start"] or parent["source_line_end"] != span["line_end"]:
            fail("E_PARENT_TEXT", parent["parent_span_id"])
        expected_ids = sorted(atom["atom_id"] for atom in atoms if atom["parent_span_id"] == parent["parent_span_id"])
        if parent["candidate_atom_ids"] != expected_ids or parent["candidate_atom_count"] != len(expected_ids) or parent["coverage_status"] != "covered_by_bundle_candidates":
            fail("E_PARENT_COVERAGE", parent["parent_span_id"])
    for atom_id, record in candidate_by.items():
        atom = atom_by[atom_id]
        if record["bundle_id"] != origins[atom_id] or record["parent_span_id"] != atom["parent_span_id"] or record["source_path"] != VISION:
            fail("E_CANDIDATE_IDENTITY", atom_id)
        for key in ("source_line_start", "source_line_end", "exact_source_text", "source_span_sha256", "candidate_text", "candidate_kind", "atomization_status", "candidate_role", "candidate_product", "related_open_decision_ids", "meaning_change_applied"):
            if record[key] != atom[key]:
                fail("E_CANDIDATE_SOURCE", atom_id + ":" + key)
        expected_products = atom.get("candidate_product_candidates") or [atom.get("candidate_product")]
        expected_products = [x for x in expected_products if x]
        if record["candidate_product_candidates"] != expected_products or not expected_products or not set(expected_products) <= set(PRODUCTS):
            fail("E_PRODUCT_CANDIDATES", atom_id)
        if record["formal_product_boundary_status"] != "candidate_boundary_only" or record["formal_owner_status"] != "unknown" or record["authority_status"] != "none" or record["formal_requirement_unit_status"] != "not_generated":
            fail("E_FORMAL_BOUNDARY", atom_id)
        if any(record[key] != "unknown" for key in ("legacy_implementation_status", "current_implementation_status", "legacy_degradation_status", "current_degradation_status", "failure_status", "consumer_status")):
            fail("E_UNKNOWN_BOUNDARY", atom_id)
        if record["semantic_equivalence"] != "unknown" or record["phase_status"] not in ("unknown", "candidate_static_evidence_only") or record["asset_status"] not in ("unknown", "candidate_static_evidence_only"):
            fail("E_STATUS_BOUNDARY", atom_id)
        if not (span_by[atom["parent_span_id"]]["line_start"] <= atom["source_line_start"] <= atom["source_line_end"] <= span_by[atom["parent_span_id"]]["line_end"]):
            fail("E_LINE_CONTAINMENT", atom_id)
        exact = "".join(source_lines[atom["source_line_start"] - 1:atom["source_line_end"]])
        if exact != atom["exact_source_text"] or sha(exact.encode()) != atom["source_span_sha256"]:
            fail("E_SOURCE_LINE", atom_id)
        candidate_lines.append((atom["source_line_start"], atom["source_line_end"]))

    if len(set(candidate_lines)) != len(candidate_lines) or len({row["atom_id"] for row in candidates}) != len(candidates):
        fail("E_DEDUPE")
    phase = load_json(PHASE_PATH)
    crosswalk = load_jsonl(CROSSWALK_PATH)
    for atom_id, record in candidate_by.items():
        phase_ids, crosswalk_ids = direct_matches(atom_by[atom_id], phase, crosswalk)
        if record["phase_candidate_ids"] != phase_ids or record["implementation_crosswalk_unit_ids"] != crosswalk_ids:
            fail("E_DIRECT_MATCH_REDERIVATION", atom_id)
        if not phase_ids and (record["phase_status"] != "unknown" or record["asset_status"] != "unknown"):
            fail("E_UNLINKED_UNKNOWN", atom_id)

    expected_matrix = 35 + sum(len(row["candidate_product_candidates"]) for row in candidates) + 35 + 35
    if len(matrix) != expected_matrix or [row["edge_id"] for row in matrix] != [f"WVC-EDGE-{n:03d}" for n in range(1, expected_matrix + 1)]:
        fail("E_MATRIX_DENOM")
    parent_edges = [row for row in matrix if row["edge_kind"] == "parent_span_coverage"]
    product_edges = [row for row in matrix if row["edge_kind"] == "candidate_product_boundary"]
    phase_edges = [row for row in matrix if row["edge_kind"] == "candidate_phase_unlinked"]
    asset_edges = [row for row in matrix if row["edge_kind"] == "candidate_asset_unlinked"]
    if len(parent_edges) != 35 or len(product_edges) != 49 or len(phase_edges) != 35 or len(asset_edges) != 35:
        fail("E_MATRIX_EDGE_COUNTS")
    if {(row["from_id"], row["to_id"]) for row in parent_edges} != {(atom["parent_span_id"], atom["atom_id"]) for atom in atoms}:
        fail("E_MATRIX_PARENT_COVERAGE")
    if {(row["from_id"], row["to_id"]) for row in product_edges} != {(atom["atom_id"], product) for atom in atoms for product in (atom.get("candidate_product_candidates") or [atom.get("candidate_product")]) if product}:
        fail("E_MATRIX_PRODUCT_BOUNDARY")
    for edge in phase_edges + asset_edges:
        if edge["to_id"] is not None or edge["status"] != "unlinked_unknown":
            fail("E_MATRIX_UNLINKED_PROMOTION", edge["edge_id"])

    expected_counts = {
        "parent_spans": 29, "candidate_records": 35, "atomized_candidates": 19, "composite_unresolved": 16,
        "parent_coverage_edges": 35, "candidate_product_edges": 49, "matrix_edges": expected_matrix,
        "phase_direct_links": 0, "asset_direct_links": 0, "phase_unlinked_candidates": 35, "asset_unlinked_candidates": 35,
    }
    if inventory["counts"] != expected_counts:
        fail("E_COUNTS")
    if [p["product"] for p in inventory["products"]] != PRODUCTS:
        fail("E_PRODUCT_ORDER")
    for product in inventory["products"]:
        if product["formal_owner_status"] != "unknown" or product["authority_status"] != "none" or product["phase_status"] != "unknown" or product["implementation_status"] != "unknown" or product["degradation_status"] != "unknown":
            fail("E_PRODUCT_STATUS", product["product"])
    expected_boundary = {
        "web_candidate": "candidate_product_boundary_only", "webos_candidate": "candidate_product_boundary_only",
        "formal_owner": "unknown", "phase": "unknown", "legacy_implementation": "unknown",
        "current_implementation": "unknown", "degradation": "unknown", "failure": "unknown", "consumer": "unknown",
    }
    if inventory["boundary"] != expected_boundary:
        fail("E_BOUNDARY_STATUS")
    if any(value != "pending" for value in inventory["residuals"].values()) or inventory["boundary"]["formal_owner"] != "unknown":
        fail("E_RESIDUAL_PROMOTION")
    print("PASS validate: 29 parent spans / 35 candidates, source-line and ID dedupe, 49 product edges, phase/asset unlinked=35/35")


if __name__ == "__main__":
    validate()
