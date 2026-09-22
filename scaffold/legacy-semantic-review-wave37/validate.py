#!/usr/bin/env python3
"""Fail-closed static verifier for the Wave37 schema10 candidate."""
from __future__ import annotations

import copy
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
HERE = Path(__file__).resolve().parent
ARCHIVE = ROOT / "archive/legacy-generation-2026-09-14/root"
LEDGER = HERE / "legacy-requirement-direct-semantic-review-wave37.jsonl"
META = HERE / "legacy-requirement-direct-semantic-review-wave37.meta.json"
CATALOG_PATH = ROOT / "docs/governance/legacy-asset-phase-product-classification-bootstrap.jsonl"
CROSSWALK_PATH = ROOT / "docs/governance/legacy-requirement-implementation-crosswalk-bootstrap.jsonl"
DECOMPOSITION_PATH = ROOT / "docs/governance/legacy-ir-product-unit-decomposition-bootstrap.jsonl"
RELATION_PATH = ROOT / "docs/governance/legacy-ir-document-source-relation.jsonl"
REQ_IR = ARCHIVE / "requirements-ir/requirements.json"
BATCH = "LEGACY-SEMANTIC-WAVE37-2026-09-22"
BASE = "562e176c36844474b63424ec06beefe2f7722d18"
MAIN_MERGE_PARENTS = [
    "083133e17019fafb8be7182975cb913f8b43f21e",
    "929da891382b153049da23bcecaf84b6b198092c",
]
REQ_SHA = "80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688"
REQUIREMENT_ASSET = "LEGACY-ASSET-A60CF91DD2AF6693E6F9"
UNITS = [
    "IRUNIT-HIL-NFR-01-HELIX-OS",
    "IRUNIT-HIL-NFR-10-HELIX-OS",
    "IRUNIT-HIL-NFR-19-HELIX-OS",
]
SELECTED = {
    "IRUNIT-HIL-NFR-01-HELIX-OS": {REQUIREMENT_ASSET, "LEGACY-ASSET-899A61905AFBC415F595", "LEGACY-ASSET-79AD1AFBFB2A4B00CC95"},
    "IRUNIT-HIL-NFR-10-HELIX-OS": {REQUIREMENT_ASSET, "LEGACY-ASSET-25EB3B29EA909B050987", "LEGACY-ASSET-44F2DE5EBB3DF3A4744A"},
    "IRUNIT-HIL-NFR-19-HELIX-OS": {REQUIREMENT_ASSET, "LEGACY-ASSET-E212E913117C5C247DAE", "LEGACY-ASSET-573CC6D5360F04EEDEE3"},
}
QUERIES = {
    UNITS[0]: {"anchors": ["memory", "idempotent", "delivery"], "match_mode": "archive_file_contains_any_utf8_anchor"},
    UNITS[1]: {"anchors": ["agent", "runtime", "registry"], "match_mode": "archive_file_contains_any_utf8_anchor"},
    UNITS[2]: {"anchors": ["Linux", "macOS", "Windows", "adapter"], "match_mode": "archive_file_contains_any_utf8_anchor"},
}
ROW_FIELDS = {
    "artifact_evidence_kind", "asset_id", "atomization_hold", "authority_effect", "batch_id",
    "bounded_search_query", "candidate_membership_semantics", "candidate_phase_targets",
    "candidate_product_targets", "catalog_legacy_implementation_status", "classification_id",
    "connection_records", "consumer_closure_evidence", "consumer_closure_status", "counterevidence",
    "coverage", "covered_requirement_atom_ids", "covered_requirement_atoms",
    "current_requirement_implementation_status", "evidence_atom_bindings", "evidence_refs",
    "legacy_asset_evidence_state", "legacy_execution_status", "legacy_requirement_implementation_contribution",
    "new_build_allowed", "observed_consumer_refs", "phase_authority_status", "phase_candidates",
    "product_alignment_status", "product_scope", "reuse_exclusion_class", "review_id", "review_scope",
    "role_kind", "routing_candidate", "routing_state", "schema_revision", "selection_route",
    "semantic_link_status", "semantic_relation", "source_connective_fragments", "source_path",
    "source_requirement_id", "source_requirement_legacy_markdown_span", "source_requirement_pointer",
    "source_scope_fragments", "source_sha256", "source_statement_semantic_digest", "source_statement_text",
    "source_text_spans", "unit_candidate_id", "unresolved",
}
ROLE_POLICIES = {
    "requirement": ("requirement", "confirmed", "same_requirement_id_exact_source_contract_not_implementation", "contract_only_no_implementation_claim", 2),
    "design": ("design", "unresolved", "design_contract_evidence", "design_contract_only_no_implementation_claim", 1),
    "implementation_source": ("implementation_source", "unresolved", "implementation_candidate_only", "implementation_candidate_only", 1),
}
UNRESOLVED = [
    "exact_head_independent_review_pending", "human_product_authority_decision_pending",
    "successor_assignment_unassigned", "product_boundary_human_decision_pending",
    "candidate_product_routing_requires_human_review", "source_atomization_review_pending",
    "unit_split_requires_independent_review", "consumer_closure_pending", "legacy_execution_not_run",
]
COUNTER = [
    "Requirement／候補assetの静的snapshotであり実装・実行証拠ではない",
    "候補assetの存在は同一要求IDの実装成立・consumer closure・authorityを示さない",
    "source／phase／product candidateはresearch-premiseの静的候補であり、現行設計・実装へ昇格しない",
]
CONSUMERS = ["requirement-carry-forward-ledgers", "requirement-atomization-review"]


def require(condition: bool, message: str) -> None:
    if not condition:
        raise AssertionError(message)


def digest(data: bytes) -> str:
    return "sha256:" + hashlib.sha256(data).hexdigest()


def file_digest(path: Path) -> str:
    return digest(path.read_bytes())


def canonical(value: object) -> str:
    return digest(json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode())


def read_jsonl(path: Path) -> list[dict]:
    return [json.loads(line) for line in path.read_text().splitlines() if line.strip()]


def excerpt(path: Path, start: int, end: int) -> str:
    lines = path.read_text(errors="replace").splitlines()
    require(1 <= start <= end <= len(lines), f"excerpt bounds {path}:{start}-{end}")
    return "\n".join(lines[start - 1 : end])


def candidate_ids_for_query(catalog: dict, query: dict) -> list[str]:
    ids = []
    for asset_id, asset in catalog.items():
        body = (ARCHIVE / asset["source_path"]).read_text(errors="replace")
        if any(anchor in body for anchor in query["anchors"]):
            ids.append(asset_id)
    return sorted(ids)


def source_window(row: dict, atom: dict) -> str:
    source = row["source_statement_text"]
    spans = row["source_text_spans"]
    indexes = atom["source_span_indexes"]
    positions = []
    cursor = 0
    for span in spans:
        at = source.find(span, cursor)
        require(at >= cursor, f"span order {row['review_id']}")
        positions.append((at, at + len(span)))
        cursor = at + len(span)
    require(indexes == list(range(indexes[0], indexes[-1] + 1)), f"span continuity {row['review_id']}")
    end = positions[indexes[-1]][1]
    while end < len(source) and source[end] in "。．.!?！？、，,;；:：)]）】》」』”’\"'":
        end += 1
    return source[positions[indexes[0]][0] : end]


def verify_binding(row: dict, binding: dict, joined: str) -> None:
    atoms = {atom["atom_id"]: atom for atom in row["covered_requirement_atoms"]}
    atom = atoms.get(binding["atom_id"])
    require(atom is not None, f"binding atom {row['review_id']}")
    require(binding["match_mode"] == "controlled_term_set_partial", f"binding mode {row['review_id']}")
    require(binding["required_terms"] and binding["source_fragment_anchors"], f"binding fields {row['review_id']}")
    source = source_window(row, atom)
    for anchor in binding["source_fragment_anchors"]:
        require(anchor in atom["text"] and anchor in source, f"binding anchor {row['review_id']}")
    require(all(term in joined for term in binding["required_terms"]), f"binding terms {row['review_id']}")


def verify_role(row: dict) -> None:
    role = row["role_kind"]
    require(role in ROLE_POLICIES, f"unknown role {row['review_id']}")
    kind, link_status, relation, contribution, ref_count = ROLE_POLICIES[role]
    require(row["artifact_evidence_kind"] == kind, f"role kind {row['review_id']}")
    require(row["semantic_link_status"] == link_status, f"role link status {row['review_id']}")
    require(row["semantic_relation"] == relation, f"role relation {row['review_id']}")
    require(row["legacy_requirement_implementation_contribution"] == contribution, f"role contribution {row['review_id']}")
    require(row["evidence_refs"] and len(row["evidence_refs"]) == ref_count, f"role refs {row['review_id']}")
    require(row["review_scope"].startswith("Wave37 schema10"), f"review scope {row['review_id']}")
    require(row["unresolved"] == UNRESOLVED, f"unresolved vocabulary {row['review_id']}")
    require(row["counterevidence"] == COUNTER, f"counterevidence vocabulary {row['review_id']}")
    require(row["observed_consumer_refs"] == CONSUMERS, f"consumer vocabulary {row['review_id']}")
    require(row["consumer_closure_status"] == "pending" and row["consumer_closure_evidence"] == [], f"consumer boundary {row['review_id']}")
    for empty in ("source_scope_fragments", "source_connective_fragments", "connection_records"):
        require(row[empty] == [], f"empty field {row['review_id']}:{empty}")
    require(row["reuse_exclusion_class"] is None, f"reuse exclusion {row['review_id']}")
    if role == "requirement":
        require(row["evidence_atom_bindings"] == [], f"requirement bindings {row['review_id']}")
    else:
        require(row["evidence_atom_bindings"], f"nonrequirement bindings {row['review_id']}")


def prior_edges_and_assets() -> tuple[set[tuple[str, str]], set[str], set[str]]:
    edges, assets, units = set(), set(), set()
    for wave in range(1, 37):
        for row in read_jsonl(ROOT / f"docs/governance/legacy-requirement-direct-semantic-review-wave{wave}.jsonl"):
            role = row.get("role_kind", row.get("artifact_evidence_kind"))
            edge = (row["unit_candidate_id"], row["asset_id"])
            edges.add(edge)
            units.add(row["unit_candidate_id"])
            if role != "requirement":
                assets.add(row["asset_id"])
    return edges, assets, units


def verify() -> None:
    rows = read_jsonl(LEDGER)
    meta = json.loads(META.read_text())
    catalog = {row["asset_id"]: row for row in read_jsonl(CATALOG_PATH)}
    crosswalk = {row["unit_candidate_id"]: row for row in read_jsonl(CROSSWALK_PATH)}
    decomposition = {}
    for parent in read_jsonl(DECOMPOSITION_PATH):
        for candidate in parent.get("candidate_units", []):
            decomposition[candidate["unit_candidate_id"]] = (parent, candidate)
    relations = {row["requirement_id"]: row for row in read_jsonl(RELATION_PATH)}

    require(len(rows) == 9 and meta["record_count"] == 9, "record count")
    require([row["review_id"] for row in rows] == [f"LSRW37-EDGE-{i:03d}" for i in range(1, 10)], "review order")
    require(meta["schema_revision"] == 10 and meta["batch_id"] == BATCH, "schema/batch")
    require(meta["current_tree_revision"] == BASE and meta["parent_revision"] == BASE and meta["stacked_pr_parent_revision"] == BASE, "base lineage")
    require(meta["main_merge_revision"] == BASE and meta["main_merge_parents"] == MAIN_MERGE_PARENTS, "merge lineage")
    require(meta["source_main_base_revision"] == BASE and meta["wave37_exact_head"] == BASE, "source base")
    require(meta["reviewed_unit_ids"] == UNITS, "unit order")
    require(meta["semantic_link_counts"] == {"confirmed": 3, "rejected": 0, "unresolved": 6}, "semantic counts")
    require(meta["cumulative_reviewed_unit_count"] == 148 and meta["cumulative_reviewed_edge_count"] == 441 and meta["remaining_unit_count"] == 70, "cumulative counts")
    require(meta["output_sha256"] == file_digest(LEDGER), "ledger digest")
    require(meta["legacy_execution_performed"] is False and meta["new_build_allowed"] is False and meta["authority_effect"] == "none", "execution/authority")
    require(file_digest(REQ_IR).removeprefix("sha256:") == REQ_SHA, "requirement digest")
    for row in rows:
        require(set(row) == ROW_FIELDS, f"row schema {row['review_id']}")

    # Every declared input is digest-bound, including current four-product boundary docs.
    for path, value in meta["inputs"].items():
        target = ROOT / path
        require(target.is_file() and file_digest(target) == value, f"input digest {path}")
    prior_batches = []
    for wave in range(1, 37):
        ledger = ROOT / f"docs/governance/legacy-requirement-direct-semantic-review-wave{wave}.jsonl"
        meta_path = ROOT / f"docs/governance/legacy-requirement-direct-semantic-review-wave{wave}.meta.json"
        prior_batches.append({"batch_id": json.loads(meta_path.read_text())["batch_id"], "ledger_sha256": file_digest(ledger), "meta_sha256": file_digest(meta_path)})
    require(meta["prior_review_batches"] == prior_batches, "prior lineage")

    current_edges = {(row["unit_candidate_id"], row["asset_id"]) for row in rows}
    expected_edges = {(unit, asset) for unit, assets in SELECTED.items() for asset in assets}
    require(current_edges == expected_edges, "selected edges")
    require(meta["reviewed_edges"] == [{"asset_id": row["asset_id"], "unit_candidate_id": row["unit_candidate_id"]} for row in rows], "reviewed edge order")
    prior_edges, prior_assets, prior_units = prior_edges_and_assets()
    require(not current_edges & prior_edges, "prior unit/asset edge overlap")
    require(not ({row["asset_id"] for row in rows if row["role_kind"] != "requirement"} & prior_assets), "prior implementation/design asset overlap")
    require(len(prior_units | set(UNITS)) == 148 and len(prior_edges | current_edges) == 441, "cumulative union")

    by_unit = {unit: [row for row in rows if row["unit_candidate_id"] == unit] for unit in UNITS}
    for unit in UNITS:
        require(len(by_unit[unit]) == 3, f"unit chain length {unit}")
        parent, candidate = decomposition[unit]
        req = by_unit[unit][0]
        req_id = parent["source_requirement_id"]
        require(req["role_kind"] == "requirement" and req["source_requirement_id"] == req_id, f"requirement join {unit}")
        require(req["product_scope"] == [candidate["product_target"]], f"product join {unit}")
        require(req["phase_candidates"] == candidate["direct_phase_candidates"], f"phase join {unit}")
        require(req["source_text_spans"] == candidate["source_text_spans"], f"span join {unit}")
        require(req["source_statement_text"] == parent["statement_text"], f"statement join {unit}")
        require(req["source_statement_semantic_digest"] == parent["source_statement_semantic_digest"], f"semantic digest join {unit}")
        require(meta["phase_rows"][unit] == [
            {"phase_id": item["phase_id"], "current_status": item["current_status"], "legacy_capability_status": item["legacy_capability_status"], "transition_assessment": item["transition_assessment"], "gap": item["gap"], "catalog_asset_count": item["phase_candidate_asset_count"], "product_intersection_count": item["phase_and_product_candidate_asset_count"]}
            for item in crosswalk[unit].get("phase_capability_evidence", [])
        ], f"phase projection {unit}")
        hold = [item for item in meta["source_atomization_holds"] if item["unit_candidate_id"] == unit]
        require(len(hold) == 1 and hold[0]["status"] == "product_boundary_shared_atom_hold" and hold[0]["shared_atom_ids"] == [], f"atomization hold {unit}")
        atom_ids = req["covered_requirement_atom_ids"]
        require(atom_ids and atom_ids == [atom["atom_id"] for atom in req["covered_requirement_atoms"]], f"atom order {unit}")
        for atom in req["covered_requirement_atoms"]:
            indexes = atom["source_span_indexes"]
            require(indexes == sorted(set(indexes)) and all(isinstance(i, int) and 0 <= i < len(req["source_text_spans"]) for i in indexes), f"atom indexes {unit}")
            require(atom["source_fragments"] == [req["source_text_spans"][i] for i in indexes], f"atom fragments {unit}")
            require(atom["text"] in req["source_statement_text"], f"atom literal {unit}")
        for row in by_unit[unit]:
            verify_role(row)
            require(row["batch_id"] == BATCH and row["schema_revision"] == 10, f"row identity {row['review_id']}")
            require(row["product_scope"] == req["product_scope"] and row["phase_candidates"] == req["phase_candidates"], f"row scope {row['review_id']}")
            require(row["covered_requirement_atoms"] == req["covered_requirement_atoms"], f"atom preservation {row['review_id']}")
            require(row["covered_requirement_atom_ids"] == atom_ids, f"atom IDs {row['review_id']}")
            asset = catalog[row["asset_id"]]
            require(row["artifact_evidence_kind"] == row["role_kind"] == asset["artifact_evidence_kind"], f"catalog role {row['review_id']}")
            require(row["classification_id"] == asset["classification_id"] and row["candidate_phase_targets"] == asset["candidate_phase_targets"] and row["candidate_product_targets"] == asset["candidate_product_targets"], f"catalog identity {row['review_id']}")
            require(row["source_path"] == asset["source_path"], f"source path {row['review_id']}")
            require(row["source_sha256"] == (REQ_SHA if row["role_kind"] == "requirement" else asset["source_sha256"]), f"source sha {row['review_id']}")
            source_file = ARCHIVE / row["source_path"]
            require(source_file.is_file() and file_digest(source_file).removeprefix("sha256:") == row["source_sha256"], f"archive source {row['review_id']}")
            evidence_parts = []
            for ref in row["evidence_refs"]:
                path = ROOT / ref["archive_path"]
                require(path.is_file() and ref["artifact_role"] == row["role_kind"] and ref["excerpt_status"] == "static_read_only", f"evidence ref {row['review_id']}")
                body = excerpt(path, ref["line_start"], ref["line_end"])
                require(ref["excerpt_sha256"] == digest(body.encode()) and ref["source_requirement_relation"] == row["semantic_relation"], f"evidence digest {row['review_id']}")
                evidence_parts.append(body)
            evidence = "\n".join(evidence_parts)
            if row["role_kind"] == "requirement":
                require(row["source_statement_text"] in evidence and all(span in evidence for span in row["source_text_spans"]), f"exact requirement source {row['review_id']}")
                require(any(ref["archive_path"].endswith("requirements.json") for ref in row["evidence_refs"]) and any(ref["archive_path"].endswith("infinity-loop-platform-requirements.md") for ref in row["evidence_refs"]), f"requirement anchors {row['review_id']}")
            for binding in row["evidence_atom_bindings"]:
                verify_binding(row, binding, evidence)

    for unit, receipt in meta["bounded_search_receipts"].items():
        require(unit in UNITS and receipt["query"] == QUERIES[unit], f"receipt shape {unit}")
        ids = candidate_ids_for_query(catalog, receipt["query"])
        require(receipt["candidate_asset_count"] == len(ids) and receipt["candidate_asset_ids_sha256"] == canonical(ids), f"candidate receipt {unit}")
        require(receipt["selected_asset_ids"] == sorted(SELECTED[unit]) and set(receipt["selected_asset_ids"]) <= set(ids), f"selected receipt {unit}")
        remaining = sorted(set(ids) - set(receipt["selected_asset_ids"]))
        require(receipt["unreviewed_asset_count"] == len(remaining) and receipt["unreviewed_asset_ids_sha256"] == canonical(remaining), f"remaining receipt {unit}")
        pool = crosswalk[unit]["candidate_asset_pool"]
        require(receipt["phase_pool_asset_count"] == pool["phase_and_product_candidate_asset_count"] and receipt["phase_pool_asset_ids_sha256"] == canonical(sorted(pool["phase_and_product_candidate_asset_ids"])), f"phase pool receipt {unit}")

    for aggregate in meta["unit_aggregates"]:
        require(aggregate["unit_candidate_id"] in UNITS and aggregate["reviewed_edge_count"] == 3, "aggregate count")
        require(aggregate["semantic_link_counts"] == {"confirmed": 1, "rejected": 0, "unresolved": 2} and aggregate["direct_confirmed_implementation_asset_ids"] == [], "aggregate status")

    # Meaningful fail-closed checks: stale binding, extra authority, and an
    # asset re-use mutation must all be rejected by the same validation rules.
    controlled = next(row for row in rows if row["role_kind"] == "design")
    bad = copy.deepcopy(controlled)
    bad["evidence_atom_bindings"][0]["source_fragment_anchors"] = ["stale-anchor"]
    try:
        verify_binding(bad, bad["evidence_atom_bindings"][0], excerpt(ROOT / bad["evidence_refs"][0]["archive_path"], bad["evidence_refs"][0]["line_start"], bad["evidence_refs"][0]["line_end"]))
    except AssertionError:
        pass
    else:
        raise AssertionError("negative stale-anchor accepted")
    bad_role = copy.deepcopy(controlled)
    bad_role["semantic_relation"] = "same_requirement_id_exact_source_contract_not_implementation"
    try:
        verify_role(bad_role)
    except AssertionError:
        pass
    else:
        raise AssertionError("negative role inversion accepted")
    bad_edge = copy.deepcopy(rows[0])
    bad_edge["asset_id"] = next(iter(prior_assets))
    require((bad_edge["unit_candidate_id"], bad_edge["asset_id"]) not in current_edges, "negative edge setup")
    require(bad_edge["asset_id"] in prior_assets, "negative prior asset setup")
    print("Wave37 static schema10 verification: PASS (source chain, boundary, lineage and negative mutations)")


if __name__ == "__main__":
    verify()
