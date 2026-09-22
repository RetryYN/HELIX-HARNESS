#!/usr/bin/env python3
"""Fail-closed validator for the SCF-B-0105 research taxonomy."""
from __future__ import annotations

import hashlib
import json
import subprocess
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
DEFAULT_ROOT = HERE.parents[1]
BASE_COMMIT = "5562f04da0f3205f9aa58205ec0d478419fc4f2e"
PARENT = "scaffold/legacy-phase-gap-review-0101"
WAVE_REL = [
    *(f"docs/governance/legacy-requirement-direct-semantic-review-wave{i}.jsonl" for i in range(1, 37)),
    *(f"scaffold/legacy-semantic-review-wave{i}/legacy-requirement-direct-semantic-review-wave{i}.jsonl" for i in range(37, 51)),
]
EXPECTED_STATUSES = {"CROSS_CUTTING_PHASE_NA_CANDIDATE", "UNRESOLVED_SOURCE_OR_HUMAN_REVIEW"}
EXPECTED_MATRIX = {"M-CROSS-CONSTRAINT", "M-WAIT-SOURCE-AUTHORITY", "M-WAIT-PHCAP-BOUNDARY"}
EXPECTED_PRODUCTS = {"HELIX-OS": 24, "HELIX-HARNESS": 6}
EXPECTED_CODES = [
    "E_TARGET_SET", "E_BASE_COMMIT", "E_BASE_NOT_ANCESTOR", "E_SOURCE_INPUT_DIGEST",
    "E_SOURCE_ANCHOR", "E_WAVE_EDGE_COVERAGE", "E_ASSET_EVIDENCE", "E_TAXONOMY_COVERAGE",
    "E_TAXONOMY_STATUS", "E_PHCAP_BOUNDARY_CLASSIFICATION", "E_MATRIX_RULE", "E_PHASE_AUTHORITY_SEPARATION", "E_PRODUCT_AUTHORITY_SEPARATION",
    "E_AUTHORITY_BOUNDARY",
]

PHCAP_BOUNDARY_UNITS = {
    "IRUNIT-HIL-FR-18-HELIX-OS",
    "IRUNIT-HIL-FR-19-HELIX-HARNESS",
    "IRUNIT-HIL-FR-20-HELIX-OS",
}


def error(errors: list[str], code: str, detail: str = "") -> None:
    errors.append(code + (":" + detail if detail else ""))


def digest(raw: bytes) -> str:
    return "sha256:" + hashlib.sha256(raw).hexdigest()


def base_bytes(path: Path, root: Path) -> bytes | None:
    try:
        relative = path.relative_to(root).as_posix()
    except ValueError:
        return None
    result = subprocess.run(
        ["git", "show", f"{BASE_COMMIT}:{relative}"],
        cwd=root,
        stdout=subprocess.PIPE,
        stderr=subprocess.DEVNULL,
        check=False,
    )
    return result.stdout if result.returncode == 0 else None


def base_json(path: Path, root: Path):
    raw = base_bytes(path, root)
    if raw is None:
        raise ValueError(f"missing BASE source: {path}")
    return json.loads(raw.decode("utf-8"))


def base_jsonl(path: Path, root: Path) -> list[dict]:
    raw = base_bytes(path, root)
    if raw is None:
        return []
    return [json.loads(line) for line in raw.decode("utf-8").splitlines() if line.strip()]


def jsonl(path: Path) -> list[dict]:
    return [json.loads(line) for line in path.read_text(encoding="utf-8").splitlines() if line.strip()]


def expected_input_kinds() -> dict[str, str]:
    primary = {
        "docs/governance/legacy-requirement-implementation-crosswalk-bootstrap.jsonl": "crosswalk",
        "archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json": "legacy_ir",
        "docs/governance/legacy-ir-product-unit-decomposition-bootstrap.jsonl": "decomposition",
        "docs/governance/legacy-asset-disposition.jsonl": "asset_disposition",
        "docs/governance/legacy-asset-decisions.jsonl": "asset_decisions",
        "docs/governance/legacy-asset-copy-read-after.jsonl": "asset_copy_read_after",
        "docs/governance/legacy-asset-phase-product-classification-bootstrap.jsonl": "phase_product_classification",
        "docs/governance/legacy-asset-phase-product-classification-bootstrap.meta.json": "phase_product_classification_meta",
        f"{PARENT}/inventory.json": "parent_phase_gap_inventory",
        f"{PARENT}/units.jsonl": "parent_phase_gap_units",
        f"{PARENT}/edges.jsonl": "parent_phase_gap_edges",
    }
    context = {
        "docs/governance/new-generation-start-here.md": "generation_entry",
        "docs/governance/legacy-asset-reuse-control.md": "legacy_read_only_control",
        "docs/governance/audits/source-rebaseline/legacy-phase-product-classification-method-2026-09-20.md": "phase_classification_contract",
        "docs/governance/phase-capability-inventory.json": "phase_capability_inventory",
        "docs/governance/phase-capability-inventory.md": "phase_capability_contract",
        "scaffold/phcap20-memory-research/README.md": "phcap20_definition",
        "scaffold/phcap20-memory-research/inventory.json": "phcap20_inventory",
        "docs/concept/product-boundary.md": "product_boundary",
        "docs/helix-harness/L1-planning/product-intent.md": "harness_l1",
        "docs/helix-os/L1-planning/system-intent.md": "os_l1",
        "docs/helix-web/L1-planning/product-intent.md": "web_l1",
        "docs/helix-web-os/L1-planning/system-intent.md": "web_os_l1",
    }
    return {**primary, **context, **{path: "semantic_review_wave" for path in WAVE_REL}}


def validate(bundle: Path = HERE, root: Path = DEFAULT_ROOT, head_ref: str = "HEAD") -> list[str]:
    errors: list[str] = []
    try:
        inventory = json.loads((bundle / "inventory.json").read_text(encoding="utf-8"))
        matrix = json.loads((bundle / "decision-matrix.json").read_text(encoding="utf-8"))
        units = jsonl(bundle / "units.jsonl")
    except Exception as exc:
        return ["E_BUNDLE_READ:" + str(exc)]

    if inventory.get("schema") != "phase-status-taxonomy-0105/v1": error(errors, "E_SCHEMA")
    if inventory.get("binding_id") != "SCF-B-0105": error(errors, "E_BINDING_ID")
    if inventory.get("authority_effect") != "none": error(errors, "E_AUTHORITY_BOUNDARY", "authority_effect")
    if inventory.get("new_build_allowed") is not False: error(errors, "E_AUTHORITY_BOUNDARY", "new_build_allowed")

    base = inventory.get("base", {})
    if base.get("repository") != "HELIX-HARNESS" or base.get("commit") != BASE_COMMIT or base.get("branch") != "main" or base.get("ancestor_required") is not True:
        error(errors, "E_BASE_COMMIT")
    else:
        ancestor = subprocess.run(
            ["git", "merge-base", "--is-ancestor", BASE_COMMIT, head_ref],
            cwd=root,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            check=False,
        )
        if ancestor.returncode != 0:
            error(errors, "E_BASE_NOT_ANCESTOR")

    if inventory.get("input_snapshot") != {"mode": "git_object", "commit": BASE_COMMIT, "live_input_gate": False}:
        error(errors, "E_SOURCE_INPUT_DIGEST", "snapshot")
    expected_inputs = expected_input_kinds()
    recorded_inputs = inventory.get("input_digests", [])
    recorded_map = {item.get("path"): item for item in recorded_inputs}
    if len(recorded_inputs) != len(expected_inputs) or set(recorded_map) != set(expected_inputs):
        error(errors, "E_SOURCE_INPUT_DIGEST", "path_set")
    for relative, kind in expected_inputs.items():
        item = recorded_map.get(relative)
        raw = base_bytes(root / relative, root)
        if item is None or item.get("kind") != kind or raw is None or item.get("sha256") != digest(raw):
            error(errors, "E_SOURCE_INPUT_DIGEST", relative)

    parent_units = {row["unit_candidate_id"]: row for row in base_jsonl(root / f"{PARENT}/units.jsonl", root)}
    parent_edges = base_jsonl(root / f"{PARENT}/edges.jsonl", root)
    edge_by_review = {edge["review_id"]: edge for edge in parent_edges}
    edges_by_unit = {
        unit_id: [edge_by_review[review_id] for review_id in parent["wave_review"]["edge_refs"]]
        for unit_id, parent in parent_units.items()
    }
    disposition = {row["asset_id"]: row for row in base_jsonl(root / "docs/governance/legacy-asset-disposition.jsonl", root)}
    classification = {row["asset_id"]: row for row in base_jsonl(root / "docs/governance/legacy-asset-phase-product-classification-bootstrap.jsonl", root)}
    crosswalk = base_jsonl(root / "docs/governance/legacy-requirement-implementation-crosswalk-bootstrap.jsonl", root)
    targets = [row for row in crosswalk if row.get("phase_classification_status") == "unresolved"]
    expected_ids = [row.get("unit_candidate_id") for row in targets]
    unit_ids = [row.get("unit_candidate_id") for row in units]
    if len(targets) != 30 or len(set(expected_ids)) != 30:
        error(errors, "E_TARGET_SET", "base_target_input")
    if len(units) != 30 or len(set(unit_ids)) != 30 or set(unit_ids) != set(expected_ids):
        error(errors, "E_TARGET_SET")
    if inventory.get("scope", {}).get("unit_count") != 30 or inventory.get("scope", {}).get("target_unit_ids") != expected_ids:
        error(errors, "E_TARGET_SET", "inventory")
    expected_product_counts = {product: sum(row.get("product_scope", []) == [product] for row in targets) for product in EXPECTED_PRODUCTS}
    if expected_product_counts != EXPECTED_PRODUCTS or inventory.get("scope", {}).get("target_product_counts") != EXPECTED_PRODUCTS:
        error(errors, "E_TARGET_SET", "product_counts")

    if set(matrix) != EXPECTED_MATRIX or inventory.get("decision_matrix") != matrix:
        error(errors, "E_MATRIX_RULE", "matrix_set")
    for rule_id, rule in matrix.items():
        if rule.get("exclusive_group") != "phase-status-primary" or rule.get("status") not in EXPECTED_STATUSES:
            error(errors, "E_MATRIX_RULE", rule_id)
        if not isinstance(rule.get("required_evidence"), list) or not rule.get("required_evidence"):
            error(errors, "E_MATRIX_RULE", rule_id)

    taxonomy_counts = {status: 0 for status in EXPECTED_STATUSES}
    matrix_members: dict[str, list[str]] = {rule: [] for rule in EXPECTED_MATRIX}
    for unit in units:
        unit_id = unit.get("unit_candidate_id")
        parent = parent_units.get(unit_id)
        if parent is None:
            continue
        taxonomy = unit.get("taxonomy", {})
        status = taxonomy.get("status")
        rule_id = taxonomy.get("matrix_rule_id")
        if status not in EXPECTED_STATUSES:
            error(errors, "E_TAXONOMY_STATUS", unit_id)
        else:
            taxonomy_counts[status] += 1
        if rule_id not in EXPECTED_MATRIX or (rule_id in matrix and matrix[rule_id].get("status") != status):
            error(errors, "E_MATRIX_RULE", unit_id)
        else:
            matrix_members[rule_id].append(unit_id)
        if unit_id in PHCAP_BOUNDARY_UNITS and rule_id != "M-WAIT-PHCAP-BOUNDARY":
            error(errors, "E_PHCAP_BOUNDARY_CLASSIFICATION", unit_id)
        if not taxonomy.get("candidate_is_research_only") or taxonomy.get("formal_phase_candidate") is not None or taxonomy.get("direct_phase_candidate_count") != 0 or taxonomy.get("authority_phase_status") != "unchanged_unresolved":
            error(errors, "E_PHASE_AUTHORITY_SEPARATION", unit_id)
        waiting = taxonomy.get("judgment_waiting", {})
        if waiting.get("status") != "pending_human_or_additional_source" or waiting.get("authority_effect") != "none" or waiting.get("new_build_allowed") is not False or not waiting.get("items"):
            error(errors, "E_TAXONOMY_STATUS", unit_id)
        source = parent["source"]
        anchor = unit.get("source_anchor", {})
        expected_anchor = {
            "archive_path": source["archive_path"], "json_pointer": source["json_pointer"],
            "line_start": source["archive_line_start"], "line_end": source["archive_line_end"],
            "statement_semantic_digest": source["statement_semantic_digest"],
            "statement_text": source["statement_text"], "source_text_spans": source["source_text_spans"],
        }
        if anchor != expected_anchor:
            error(errors, "E_SOURCE_ANCHOR", unit_id)
        expected_edges = sorted(edges_by_unit.get(unit_id, []), key=lambda item: item["review_id"])
        wave = unit.get("wave_review", {})
        if wave.get("edge_refs") != [edge["review_id"] for edge in expected_edges] or wave.get("edges") != expected_edges:
            error(errors, "E_WAVE_EDGE_COVERAGE", unit_id)
        expected_counts = {status_name: sum(edge.get("semantic_link_status") == status_name for edge in expected_edges) for status_name in ("confirmed", "unresolved", "rejected")}
        if wave.get("status_counts") != expected_counts or wave.get("edge_count") != len(expected_edges):
            error(errors, "E_WAVE_EDGE_COVERAGE", unit_id)
        if wave.get("asset_candidate_phase_targets") != parent["wave_review"]["asset_candidate_phase_targets"] or wave.get("direct_phase_candidates_from_edges") != parent["wave_review"]["direct_phase_candidates_from_edges"] or wave.get("candidate_semantics") != "asset_search_candidate_only; no phase authority":
            error(errors, "E_WAVE_EDGE_COVERAGE", unit_id)
        assets = unit.get("legacy_asset_evidence", [])
        if assets != parent.get("legacy_assets"):
            error(errors, "E_ASSET_EVIDENCE", unit_id)
        expected_asset_ids = sorted({edge["asset_id"] for edge in expected_edges})
        if sorted(asset.get("asset_id") for asset in assets) != expected_asset_ids:
            error(errors, "E_ASSET_EVIDENCE", unit_id)
        for asset in assets:
            asset_id = asset.get("asset_id")
            old = disposition.get(asset_id)
            phase = classification.get(asset_id)
            if old is None or phase is None:
                error(errors, "E_ASSET_EVIDENCE", asset_id or unit_id)
                continue
            source_evidence = asset.get("source", {})
            history = asset.get("history", {})
            consumer = asset.get("consumer", {})
            failure = asset.get("failure", {})
            if (
                source_evidence.get("source_path") != old.get("source_path")
                or source_evidence.get("source_sha256") != old.get("source_sha256")
                or source_evidence.get("source_revision") != old.get("source_revision")
                or history.get("disposition") != old.get("disposition")
                or history.get("implementation_status") != old.get("implementation_status")
                or history.get("classification_id") != phase.get("classification_id")
                or consumer.get("closure_status") != phase.get("consumer_closure_status")
                or consumer.get("ledger_consumer_refs") != phase.get("consumer_refs")
            ):
                error(errors, "E_ASSET_EVIDENCE", asset_id)
            if not all(isinstance(failure.get(key), list) for key in ("counterevidence", "coverage_failures", "unresolved")):
                error(errors, "E_ASSET_EVIDENCE", asset_id)
            expected_asset_edges = [edge["review_id"] for edge in expected_edges if edge["asset_id"] == asset_id]
            if sorted(asset.get("edge_refs", [])) != sorted(expected_asset_edges):
                error(errors, "E_ASSET_EVIDENCE", asset_id)
        phase_context = unit.get("phase_context", {})
        if phase_context.get("parent_direct_phase_candidates") != parent["phase_classification"]["eligible_phase_candidates"] or phase_context.get("phase_authority_status") != "unchanged_unresolved":
            error(errors, "E_PHASE_AUTHORITY_SEPARATION", unit_id)
        product_context = unit.get("product_context", {})
        if product_context.get("authority_product") is not None or product_context.get("l1_context_only") is not True:
            error(errors, "E_PRODUCT_AUTHORITY_SEPARATION", unit_id)
        boundary = unit.get("authority_boundary", {})
        if boundary != {
            "formal_crosswalk_modified": False,
            "formal_phase_authority_modified": False,
            "formal_product_authority_modified": False,
            "new_build_allowed": False,
            "successor_assigned": False,
            "consumer_closure_generated": False,
        }:
            error(errors, "E_AUTHORITY_BOUNDARY", unit_id)

    if any(len(members) == 0 for members in matrix_members.values()) or sum(len(members) for members in matrix_members.values()) != 30 or len({item for members in matrix_members.values() for item in members}) != 30:
        error(errors, "E_TAXONOMY_COVERAGE", "matrix_membership")
    if inventory.get("taxonomy", {}).get("status_counts") != taxonomy_counts or inventory.get("taxonomy", {}).get("status_counts", {}).get("CROSS_CUTTING_PHASE_NA_CANDIDATE") != len(matrix_members["M-CROSS-CONSTRAINT"]):
        error(errors, "E_TAXONOMY_COVERAGE", "status_counts")
    if inventory.get("taxonomy", {}).get("all_statuses_remain_unresolved") is not True:
        error(errors, "E_PHASE_AUTHORITY_SEPARATION", "unresolved_marker")

    phase_refs = inventory.get("phcap20_definition_refs", [])
    expected_phase_paths = {
        "docs/governance/phase-capability-inventory.json",
        "scaffold/phcap20-memory-research/README.md",
        "scaffold/phcap20-memory-research/inventory.json",
    }
    if {item.get("path") for item in phase_refs} != expected_phase_paths:
        error(errors, "E_SOURCE_INPUT_DIGEST", "phcap20_refs")
    for item in phase_refs:
        raw = base_bytes(root / item.get("path", ""), root)
        if raw is None or item.get("sha256") != digest(raw):
            error(errors, "E_SOURCE_INPUT_DIGEST", str(item.get("path")))

    authority_boundary = inventory.get("authority_boundary", {})
    for key in ("formal_crosswalk_modified", "formal_phase_inventory_modified", "formal_product_authority_modified", "phase_promoted", "product_promoted", "successor_assigned", "consumer_closure_generated", "old_archive_executed"):
        if authority_boundary.get(key) is not False:
            error(errors, "E_AUTHORITY_BOUNDARY", key)
    return errors


if __name__ == "__main__":
    failures = validate()
    if failures:
        print("FAIL SCF-B-0105 validator")
        print("\n".join(failures))
        sys.exit(1)
    print("PASS SCF-B-0105 validator: 30 units, taxonomy matrix, anchors, Wave edges, assets, authority boundary")
