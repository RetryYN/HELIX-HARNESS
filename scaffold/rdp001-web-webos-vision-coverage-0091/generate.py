#!/usr/bin/env python3
"""Generate the bounded 29-span Web/Web-OS Vision coverage research scaffold."""
from __future__ import annotations

import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
HERE = Path(__file__).resolve().parent
BASE = "dbe43847bfc7f4677c7e5d186b0afb82d38bab3b"
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
BUNDLES = {
    "0080": {
        "binding": "scaffold/bindings/SCF-B-0080.json",
        "inventory": "scaffold/rdp001-web-webos-vision-source-0080/inventory.json",
        "spans": SPAN_PATH,
        "relations": "scaffold/rdp001-web-webos-vision-source-0080/source-relations.jsonl",
        "legacy": "scaffold/rdp001-web-webos-vision-source-0080/legacy-evidence.jsonl",
    },
    "0081": {
        "binding": "scaffold/bindings/SCF-B-0081.json",
        "inventory": "scaffold/rdp001-web-webos-vision-semantic-atoms-0081/inventory.json",
        "atoms": "scaffold/rdp001-web-webos-vision-semantic-atoms-0081/semantic-atoms.jsonl",
        "links": "scaffold/rdp001-web-webos-vision-semantic-atoms-0081/legacy-links.jsonl",
    },
    "0084": {
        "binding": "scaffold/bindings/SCF-B-0084.json",
        "inventory": "scaffold/rdp001-web-webos-vision-semantic-atoms-0084/inventory.json",
        "atoms": "scaffold/rdp001-web-webos-vision-semantic-atoms-0084/semantic-atoms.jsonl",
        "links": "scaffold/rdp001-web-webos-vision-semantic-atoms-0084/legacy-links.jsonl",
    },
    "0088": {
        "binding": "scaffold/bindings/SCF-B-0088.json",
        "inventory": "scaffold/rdp001-web-webos-vision-semantic-atoms-0088/inventory.json",
        "atoms": "scaffold/rdp001-web-webos-vision-semantic-atoms-0088/semantic-atoms.jsonl",
        "links": "scaffold/rdp001-web-webos-vision-semantic-atoms-0088/legacy-links.jsonl",
    },
}
PRODUCTS = ["HELIX-HARNESS", "HELIX-OS", "HELIX-Web", "HELIX-Web-OS"]
DIRECT_LINK_FIELDS = {
    "vision_span_id", "vision_span_ids", "parent_span_id", "parent_span_ids",
    "candidate_atom_id", "candidate_atom_ids", "atom_id", "atom_ids",
    "source_parent_span_id", "source_parent_span_ids", "source_atom_id", "source_atom_ids",
}


def sha(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def file_sha(path: Path) -> str:
    return sha(path.read_bytes())


def load_json(rel: str) -> dict:
    return json.loads((ROOT / rel).read_text(encoding="utf-8"))


def load_jsonl(rel: str) -> list[dict]:
    return [json.loads(line) for line in (ROOT / rel).read_text(encoding="utf-8").splitlines() if line.strip()]


def write_json(path: Path, value: object) -> None:
    path.write_text(json.dumps(value, ensure_ascii=False, sort_keys=True, indent=2) + "\n", encoding="utf-8")


def write_jsonl(path: Path, rows: list[dict]) -> None:
    path.write_text("".join(json.dumps(row, ensure_ascii=False, sort_keys=True, separators=(",", ":")) + "\n" for row in rows), encoding="utf-8")


def direct_link_field_contains(value: object, tokens: list[str]) -> bool:
    if isinstance(value, dict):
        return any(
            key in DIRECT_LINK_FIELDS and direct_link_value_contains(item, tokens)
            for key, item in value.items()
        )
    return False


def direct_link_value_contains(value: object, tokens: list[str]) -> bool:
    if isinstance(value, list):
        return any(direct_link_value_contains(item, tokens) for item in value)
    return isinstance(value, str) and value in tokens


def main() -> None:
    spans = load_jsonl(SPAN_PATH)
    span_by_id = {row["span_id"]: row for row in spans}
    atoms: list[dict] = []
    atom_bundle: dict[str, str] = {}
    for bundle_id in ("0081", "0084", "0088"):
        for atom in load_jsonl(BUNDLES[bundle_id]["atoms"]):
            atoms.append(atom)
            atom_bundle[atom["atom_id"]] = bundle_id
    if len(spans) != 29 or len(atoms) != 35 or len({row["span_id"] for row in spans}) != 29 or len({row["atom_id"] for row in atoms}) != 35:
        raise AssertionError("bundle denominator or identity mismatch")

    phase_inventory = load_json(PHASE_PATH)
    crosswalk = load_jsonl(CROSSWALK_PATH)
    phase_direct_matches: dict[str, list[str]] = {}
    crosswalk_direct_matches: dict[str, list[str]] = {}
    for atom in atoms:
        tokens = [atom["atom_id"], atom["parent_span_id"]]
        phase_direct_matches[atom["atom_id"]] = sorted({
            row["phase"] for row in phase_inventory["records"]
            if direct_link_field_contains(row, tokens)
        })
        crosswalk_direct_matches[atom["atom_id"]] = sorted({
            row["unit_candidate_id"] for row in crosswalk
            if direct_link_field_contains(row, tokens)
        })

    source_bytes = (ROOT / VISION).read_bytes()
    source_lines = source_bytes.decode(encoding="utf-8").splitlines(keepends=True)
    parent_coverage = []
    for span in spans:
        candidate_ids = sorted(atom["atom_id"] for atom in atoms if atom["parent_span_id"] == span["span_id"])
        parent_coverage.append({
            "parent_span_id": span["span_id"],
            "group": span["group"],
            "label": span["label"],
            "source_path": span["source_path"],
            "source_line_start": span["line_start"],
            "source_line_end": span["line_end"],
            "exact_source_text": span["exact_source_text"],
            "source_span_sha256": span["sha256"],
            "candidate_atom_ids": candidate_ids,
            "candidate_atom_count": len(candidate_ids),
            "coverage_status": "covered_by_bundle_candidates" if candidate_ids else "uncovered",
        })

    candidate_records = []
    for atom in atoms:
        parent = span_by_id[atom["parent_span_id"]]
        products = atom.get("candidate_product_candidates") or [atom.get("candidate_product")]
        products = [product for product in products if product]
        phase_matches = phase_direct_matches[atom["atom_id"]]
        crosswalk_matches = crosswalk_direct_matches[atom["atom_id"]]
        source_exact = "".join(source_lines[atom["source_line_start"] - 1 : atom["source_line_end"]])
        if source_exact != atom["exact_source_text"] or sha(source_exact.encode()) != atom["source_span_sha256"]:
            raise AssertionError(f"source line mismatch: {atom['atom_id']}")
        candidate_records.append({
            "atom_id": atom["atom_id"],
            "bundle_id": atom_bundle[atom["atom_id"]],
            "parent_span_id": atom["parent_span_id"],
            "source_path": atom["source_path"],
            "source_line_start": atom["source_line_start"],
            "source_line_end": atom["source_line_end"],
            "exact_source_text": atom["exact_source_text"],
            "source_span_sha256": atom["source_span_sha256"],
            "candidate_text": atom["candidate_text"],
            "candidate_kind": atom["candidate_kind"],
            "atomization_status": atom["atomization_status"],
            "candidate_role": atom["candidate_role"],
            "candidate_product": atom.get("candidate_product"),
            "candidate_product_candidates": products,
            "formal_product_boundary_status": "candidate_boundary_only",
            "formal_owner_status": "unknown",
            "authority_status": "none",
            "phase_status": "unknown" if not phase_matches else "candidate_static_evidence_only",
            "phase_candidate_ids": phase_matches,
            "asset_status": "unknown" if not crosswalk_matches else "candidate_static_evidence_only",
            "implementation_crosswalk_unit_ids": crosswalk_matches,
            "legacy_implementation_status": "unknown",
            "current_implementation_status": "unknown",
            "legacy_degradation_status": "unknown",
            "current_degradation_status": "unknown",
            "failure_status": "unknown",
            "consumer_status": "unknown",
            "formal_requirement_unit_status": "not_generated",
            "semantic_equivalence": atom["semantic_equivalence"],
            "related_open_decision_ids": atom.get("related_open_decision_ids", []),
            "meaning_change_applied": atom["meaning_change_applied"],
        })

    matrix = []
    edge_number = 1
    for record in candidate_records:
        matrix.append({
            "edge_id": f"WVC-EDGE-{edge_number:03d}", "edge_kind": "parent_span_coverage",
            "from_type": "parent_span", "from_id": record["parent_span_id"], "to_type": "candidate_atom", "to_id": record["atom_id"],
            "source_line_start": record["source_line_start"], "source_line_end": record["source_line_end"], "status": "exact_source_line_covered",
        }); edge_number += 1
    for record in candidate_records:
        for product in record["candidate_product_candidates"]:
            matrix.append({
                "edge_id": f"WVC-EDGE-{edge_number:03d}", "edge_kind": "candidate_product_boundary",
                "from_type": "candidate_atom", "from_id": record["atom_id"], "to_type": "product_candidate", "to_id": product,
                "source_line_start": record["source_line_start"], "source_line_end": record["source_line_end"],
                "status": "candidate_boundary_only", "formal_owner_status": "unknown", "authority_status": "none",
            }); edge_number += 1
    for record in candidate_records:
        matrix.append({
            "edge_id": f"WVC-EDGE-{edge_number:03d}", "edge_kind": "candidate_phase_unlinked",
            "from_type": "candidate_atom", "from_id": record["atom_id"], "to_type": "phase_candidate", "to_id": None,
            "source_line_start": record["source_line_start"], "source_line_end": record["source_line_end"],
            "status": "unlinked_unknown", "basis": "no_exact_parent_span_or_atom_id_in_phase_capability_inventory",
        }); edge_number += 1
        matrix.append({
            "edge_id": f"WVC-EDGE-{edge_number:03d}", "edge_kind": "candidate_asset_unlinked",
            "from_type": "candidate_atom", "from_id": record["atom_id"], "to_type": "implementation_crosswalk_asset", "to_id": None,
            "source_line_start": record["source_line_start"], "source_line_end": record["source_line_end"],
            "status": "unlinked_unknown", "basis": "no_exact_parent_span_or_atom_id_in_implementation_crosswalk",
        }); edge_number += 1

    parent_path = HERE / "parent-coverage.jsonl"
    candidate_path = HERE / "candidate-records.jsonl"
    matrix_path = HERE / "connection-matrix.jsonl"
    write_jsonl(parent_path, parent_coverage)
    write_jsonl(candidate_path, candidate_records)
    write_jsonl(matrix_path, matrix)

    input_paths = [
        SPAN_PATH, PHASE_PATH, CROSSWALK_PATH, PRODUCT_BOUNDARY_PATH, *PRODUCT_DOCS, *LEGACY_LEDGER_PATHS,
        *[path for bundle in BUNDLES.values() for path in bundle.values()],
        "scaffold/rdp001-web-webos-vision-coverage-0091/validate.py",
        "scaffold/rdp001-web-webos-vision-coverage-0091/selfcheck.py",
    ]
    inputs = {path: file_sha(ROOT / path) for path in sorted(set(input_paths))}
    inventory = {
        "schema": "rdp001-web-webos-vision-coverage/v1",
        "candidate_id": "RDP-001-WEB-WEBOS-VISION-COVERAGE-0091",
        "status": "findings_only",
        "authority_effect": "none",
        "meaning_change_applied": False,
        "formal_requirement_unit_count": "not_generated",
        "formal_owner_status": "unknown",
        "successor_requirement_ids": [],
        "human_decision_ref": None,
        "formal_register_append": False,
        "old_runtime_test_ci_execution": False,
        "base_origin_main": BASE,
        "inputs": inputs,
        "source": {
            "vision_path": VISION, "vision_sha256": sha(source_bytes), "vision_line_count": len(source_lines),
            "parent_span_path": SPAN_PATH, "parent_span_sha256": file_sha(ROOT / SPAN_PATH), "parent_span_count": len(spans),
            "parent_coverage_path": str(parent_path.relative_to(ROOT)), "parent_coverage_sha256": file_sha(parent_path),
            "candidate_records_path": str(candidate_path.relative_to(ROOT)), "candidate_records_sha256": file_sha(candidate_path),
            "connection_matrix_path": str(matrix_path.relative_to(ROOT)), "connection_matrix_sha256": file_sha(matrix_path),
        },
        "counts": {
            "parent_spans": len(spans), "candidate_records": len(candidate_records),
            "atomized_candidates": sum(row["atomization_status"] == "atomized_candidate" for row in candidate_records),
            "composite_unresolved": sum(row["atomization_status"] == "composite_unresolved" for row in candidate_records),
            "parent_coverage_edges": len(candidate_records),
            "candidate_product_edges": sum(len(row["candidate_product_candidates"]) for row in candidate_records),
            "matrix_edges": len(matrix), "phase_direct_links": sum(bool(row["phase_candidate_ids"]) for row in candidate_records),
            "asset_direct_links": sum(bool(row["implementation_crosswalk_unit_ids"]) for row in candidate_records),
            "phase_unlinked_candidates": sum(not row["phase_candidate_ids"] for row in candidate_records),
            "asset_unlinked_candidates": sum(not row["implementation_crosswalk_unit_ids"] for row in candidate_records),
        },
        "products": [{
            "product": product, "candidate_atom_ids": [row["atom_id"] for row in candidate_records if product in row["candidate_product_candidates"]],
            "candidate_parent_span_ids": sorted({row["parent_span_id"] for row in candidate_records if product in row["candidate_product_candidates"]}),
            "formal_owner_status": "unknown", "authority_status": "none", "phase_status": "unknown",
            "implementation_status": "unknown", "degradation_status": "unknown",
        } for product in PRODUCTS],
        "boundary": {
            "web_candidate": "candidate_product_boundary_only", "webos_candidate": "candidate_product_boundary_only",
            "formal_owner": "unknown", "phase": "unknown", "legacy_implementation": "unknown",
            "current_implementation": "unknown", "degradation": "unknown", "failure": "unknown", "consumer": "unknown",
        },
        "unresolved_questions": [
            "formal Web/Web-OS requirement denominator and owner remain unknown",
            "candidate atom semantic equivalence and split/connection/composite decisions remain pending",
            "phase and implementation asset links remain unlinked unless an exact static identifier is supplied",
        ],
        "verification_contract": {
            "required_commands": [
                "python3 -B scaffold/rdp001-web-webos-vision-coverage-0091/generate.py",
                "python3 -B scaffold/rdp001-web-webos-vision-coverage-0091/validate.py",
                "python3 -B scaffold/rdp001-web-webos-vision-coverage-0091/selfcheck.py",
                "python3 scaffold/tools/scfctl.py validate", "python3 scaffold/tools/scfctl.py stale",
                "python3 scaffold/tools/scfctl.py residuals", "git diff --check",
            ],
            "archive_rule": "archive/legacy-generation-2026-09-14 is static reference only; no old runtime/test/CI/workflow/source execution",
        },
        "residuals": {
            "formal_requirement_unit": "pending", "owner_authority": "pending", "phase": "pending",
            "legacy_implementation": "pending", "current_implementation": "pending", "degradation": "pending",
            "failure": "pending", "consumer_closure": "pending",
        },
    }
    write_json(HERE / "inventory.json", inventory)
    print(f"generated parent_spans={len(spans)} candidates={len(candidate_records)} matrix_edges={len(matrix)}")


if __name__ == "__main__":
    main()
