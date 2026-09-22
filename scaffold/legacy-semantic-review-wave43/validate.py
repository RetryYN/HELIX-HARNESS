#!/usr/bin/env python3
"""Fail-closed static verifier for the Wave43 schema10 candidate."""
from __future__ import annotations

import copy
import hashlib
import json
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
HERE = Path(__file__).resolve().parent
ARCHIVE = ROOT / "archive/legacy-generation-2026-09-14/root"
LEDGER = HERE / "legacy-requirement-direct-semantic-review-wave43.jsonl"
META = HERE / "legacy-requirement-direct-semantic-review-wave43.meta.json"
CATALOG_PATH = ROOT / "docs/governance/legacy-asset-phase-product-classification-bootstrap.jsonl"
CROSSWALK_PATH = ROOT / "docs/governance/legacy-requirement-implementation-crosswalk-bootstrap.jsonl"
DECOMPOSITION_PATH = ROOT / "docs/governance/legacy-ir-product-unit-decomposition-bootstrap.jsonl"
RELATION_PATH = ROOT / "docs/governance/legacy-ir-document-source-relation.jsonl"
DISPOSITION_PATH = ROOT / "docs/governance/legacy-asset-disposition.jsonl"
DECISION_PATH = ROOT / "docs/governance/legacy-asset-decisions.jsonl"
READ_AFTER_PATH = ROOT / "docs/governance/legacy-asset-copy-read-after.jsonl"
REQ_IR = ARCHIVE / "requirements-ir/requirements.json"
BATCH = "LEGACY-SEMANTIC-WAVE43-2026-09-22"
BASE = "f805a12cc16d2c776107ae224349e8863c8b602f"
MAIN_MERGE_PARENTS = [
    "6396443e150d285b0b08edd43ea52a26f85dd434",
    "3a6e04bd2188700ba71682910a26bca5045c5997",
]
REQ_SHA = "80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688"
REQUIREMENT_ASSET = "LEGACY-ASSET-A60CF91DD2AF6693E6F9"
SUPPLEMENTAL_ASSET_IDS = {"LEGACY-ASSET-D94F2C0530850989B5F4", "LEGACY-ASSET-4C617862F5CC7658A26F", "LEGACY-ASSET-74D3C8036FE339074F7C", "LEGACY-ASSET-095374F9C8C82BCD8897"}
UNITS = [
    "IRUNIT-HIL-NFR-12-HELIX-OS",
    "IRUNIT-HIL-NFR-13-HELIX-OS",
    "IRUNIT-HIL-NFR-15-HELIX-HARNESS",
    "IRUNIT-HIL-NFR-15-HELIX-OS",
    "IRUNIT-HIL-NFR-19-HELIX-HARNESS",
]

SELECTED = {
    "IRUNIT-HIL-NFR-12-HELIX-OS": {"LEGACY-ASSET-A60CF91DD2AF6693E6F9"},
    "IRUNIT-HIL-NFR-13-HELIX-OS": {"LEGACY-ASSET-A60CF91DD2AF6693E6F9", "LEGACY-ASSET-24A3D981F1ED04404AA5"},
    "IRUNIT-HIL-NFR-15-HELIX-HARNESS": {"LEGACY-ASSET-A60CF91DD2AF6693E6F9", "LEGACY-ASSET-961CEACE51E1887AC197", "LEGACY-ASSET-F2BDED5ABF936633B12D"},
    "IRUNIT-HIL-NFR-15-HELIX-OS": {"LEGACY-ASSET-A60CF91DD2AF6693E6F9", "LEGACY-ASSET-210D6B145CA997AE3CFA", "LEGACY-ASSET-CB3417C6C933B5786878"},
    "IRUNIT-HIL-NFR-19-HELIX-HARNESS": {"LEGACY-ASSET-A60CF91DD2AF6693E6F9", "LEGACY-ASSET-8DB8241A44EA54EF17A0", "LEGACY-ASSET-3D3C15358B61DC4D0324"},
}

QUERIES = {
    "IRUNIT-HIL-NFR-12-HELIX-OS": {"anchors": ["source"], "match_mode": "archive_file_contains_all_utf8_anchors"},
    "IRUNIT-HIL-NFR-13-HELIX-OS": {"anchors": ["artifact", "digest"], "match_mode": "archive_file_contains_any_utf8_anchor"},
    "IRUNIT-HIL-NFR-15-HELIX-HARNESS": {"anchors": ["CI", "ci", "artifact", "digest"], "match_mode": "archive_file_contains_any_utf8_anchor"},
    "IRUNIT-HIL-NFR-15-HELIX-OS": {"anchors": ["CI", "ci", "artifact", "digest"], "match_mode": "archive_file_contains_any_utf8_anchor"},
    "IRUNIT-HIL-NFR-19-HELIX-HARNESS": {"anchors": ["CI", "ci", "DIGEST", "artifact"], "match_mode": "archive_file_contains_any_utf8_anchor"},
}

ROW_FIELDS = {
    "artifact_evidence_kind", "asset_id", "atomization_hold", "authority_effect", "batch_id",
    "bounded_search_query", "candidate_membership_semantics", "candidate_phase_targets",
    "candidate_product_targets", "catalog_legacy_implementation_status", "classification_id",
    "connection_records", "consumer_closure_evidence", "consumer_closure_status", "counterevidence",
    "coverage", "covered_requirement_atom_ids", "covered_requirement_atoms",
    "current_requirement_implementation_status", "evidence_atom_bindings", "evidence_binding_status", "evidence_refs",
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
MISSING_EVIDENCE_REASONS = {
    ("design", "IRUNIT-HIL-NFR-12-HELIX-OS"): "crosswalk phase_and_product_candidate_asset_count is zero; no direct asset evidence was selected",
    ("implementation_source", "IRUNIT-HIL-NFR-12-HELIX-OS"): "crosswalk phase_and_product_candidate_asset_count is zero; no direct asset evidence was selected",
    ("implementation_source", "IRUNIT-HIL-NFR-13-HELIX-OS"): "crosswalk candidate pool contains no implementation_source asset available for this role; no direct asset evidence was selected",
}


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


def prior_artifact(wave: int, suffix: str) -> tuple[str, Path]:
    if wave in {37, 38, 39, 40, 41, 42}:
        rel = f"scaffold/legacy-semantic-review-wave{wave}/legacy-requirement-direct-semantic-review-wave{wave}.{suffix}"
    else:
        rel = f"docs/governance/legacy-requirement-direct-semantic-review-wave{wave}.{suffix}"
    return rel, ROOT / rel


def excerpt(path: Path, start: int, end: int) -> str:
    lines = path.read_text(errors="replace").splitlines()
    require(1 <= start <= end <= len(lines), f"excerpt bounds {path}:{start}-{end}")
    return "\n".join(lines[start - 1 : end])


def candidate_ids_for_query(catalog: dict, query: dict) -> list[str]:
    ids = []
    for asset_id, asset in catalog.items():
        body = (ARCHIVE / asset["source_path"]).read_text(errors="replace")
        if (all(anchor in body for anchor in query["anchors"])
                if query.get("match_mode") == "archive_file_contains_all_utf8_anchors"
                else any(anchor in body for anchor in query["anchors"])):
            ids.append(asset_id)
    return sorted(ids)


def expected_asset_status_receipts(asset_ids: set[str], dispositions: list[dict], decisions: list[dict], read_afters: list[dict]) -> list[dict]:
    receipts = []
    for asset_id in sorted(asset_ids):
        asset_dispositions = [row for row in dispositions if row.get("asset_id") == asset_id]
        asset_decisions = [row for row in decisions if row.get("asset_id") == asset_id]
        asset_read_afters = [row for row in read_afters if row.get("asset_id") == asset_id]
        receipts.append({
            "asset_id": asset_id,
            "disposition_records": [
                {"revision": row.get("revision"), "disposition": row.get("disposition"), "implementation_status": row.get("implementation_status"), "authority_status": row.get("authority_status"), "reuse_exclusion_class": row.get("reuse_exclusion_class"), "decision_record_ref": row.get("decision_record_ref"), "read_after_record_ref": row.get("read_after_record_ref"), "consumer_refs": sorted(row.get("consumer_refs", []))}
                for row in asset_dispositions
            ],
            "decision_ids": [
                {"decision_id": row.get("decision_id"), "decision_revision": row.get("decision_revision"), "disposition": row.get("disposition"), "consumer_refs": sorted(row.get("consumer_refs", []))}
                for row in asset_decisions
            ],
            "copy_read_after_records": [
                {"read_after_id": row.get("read_after_id"), "digest_match": row.get("digest_match"), "consumer_match": row.get("consumer_match"), "failure": row.get("failure"), "consumer_refs_observed": sorted(row.get("consumer_refs_observed", []))}
                for row in asset_read_afters
            ],
            "historical_consumer_refs": sorted({ref for row in asset_dispositions + asset_decisions for ref in row.get("consumer_refs", [])} | {ref for row in asset_read_afters for ref in row.get("consumer_refs_observed", [])}),
            "failure_status": "historical_failure_field_preserved" if asset_read_afters else "no_selected_failure_record",
        })
    return receipts


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
    require(row["review_scope"].startswith("Wave43 schema10"), f"review scope {row['review_id']}")
    require(row["unresolved"] == UNRESOLVED, f"unresolved vocabulary {row['review_id']}")
    require(row["counterevidence"] == COUNTER, f"counterevidence vocabulary {row['review_id']}")
    require(row["observed_consumer_refs"] == CONSUMERS, f"consumer vocabulary {row['review_id']}")
    require(row["consumer_closure_status"] == "pending" and row["consumer_closure_evidence"] == [], f"consumer boundary {row['review_id']}")
    require(row["authority_effect"] == "none" and row["new_build_allowed"] is False, f"authority boundary {row['review_id']}")
    require(row["legacy_execution_status"] == "not_run", f"execution boundary {row['review_id']}")
    require(row["current_requirement_implementation_status"] == "not_established", f"implementation boundary {row['review_id']}")
    require(row["phase_authority_status"] == "candidate_unchanged", f"phase boundary {row['review_id']}")
    require(row["product_alignment_status"] == "candidate_boundary_pending_human_decision", f"product boundary {row['review_id']}")
    require(row["routing_state"] == "candidate_product_routing_requires_human_review", f"routing boundary {row['review_id']}")
    require(row["source_scope_fragments"] == [], f"empty field {row['review_id']}:source_scope_fragments")
    if row["unit_candidate_id"] in {"IRUNIT-HIL-NFR-15-HELIX-HARNESS", "IRUNIT-HIL-NFR-15-HELIX-OS"}:
        require(row["source_connective_fragments"] == ["commit/tree digestと直前段receiptへbind"], f"shared connective fragments {row['review_id']}")
        require(len(row["connection_records"]) == 1 and row["connection_records"][0]["relation"] == "shared_source_span", f"shared connection {row['review_id']}")
    else:
        require(row["source_connective_fragments"] == [] and row["connection_records"] == [], f"empty connection fields {row['review_id']}")
    require(row["reuse_exclusion_class"] is None, f"reuse exclusion {row['review_id']}")
    if role == "requirement":
        require(row["evidence_atom_bindings"] == [] and row["evidence_binding_status"] == "requirement_source_exact", f"requirement bindings {row['review_id']}")
    else:
        if row["evidence_atom_bindings"]:
            require(row["evidence_binding_status"] == "literal_anchor_checked", f"literal binding status {row['review_id']}")
        else:
            require(row["evidence_binding_status"] == "semantic_relation_unresolved_no_literal_anchor", f"unresolved binding status {row['review_id']}")


def prior_edges_and_assets() -> tuple[set[tuple[str, str]], set[str], set[str]]:
    edges, assets, units = set(), set(), set()
    for wave in range(1, 43):
        _, ledger = prior_artifact(wave, "jsonl")
        for row in read_jsonl(ledger):
            role = row.get("role_kind", row.get("artifact_evidence_kind"))
            edge = (row["unit_candidate_id"], row["asset_id"])
            edges.add(edge)
            units.add(row["unit_candidate_id"])
            if role != "requirement":
                assets.add(row["asset_id"])
    return edges, assets, units


def verify_same_batch_nonrequirement_asset_edges(rows: list[dict]) -> None:
    """Reject accidental design/implementation asset reuse within this batch.

    A shared legacy asset is admissible only when every participating row names
    the other unit through an explicit ``shared_asset_edge`` connection.  A
    shared source span is a different relation and does not authorize reusing
    an asset edge.
    """
    by_asset: dict[str, list[dict]] = {}
    for row in rows:
        if row["role_kind"] != "requirement":
            by_asset.setdefault(row["asset_id"], []).append(row)
    for asset_id, asset_rows in by_asset.items():
        if len({row["unit_candidate_id"] for row in asset_rows}) < 2:
            continue
        units = {row["unit_candidate_id"] for row in asset_rows}
        for row in asset_rows:
            shared_units = {
                unit
                for connection in row.get("connection_records", [])
                if connection.get("relation") == "shared_asset_edge"
                for unit in connection.get("shared_with_units", [])
            }
            require(units - {row["unit_candidate_id"]} <= shared_units, f"same-batch non-requirement asset reuse without explicit shared relation {asset_id}")


def verify() -> None:
    rows = read_jsonl(LEDGER)
    meta = json.loads(META.read_text())
    catalog = {row["asset_id"]: row for row in read_jsonl(CATALOG_PATH)}
    dispositions = read_jsonl(DISPOSITION_PATH)
    decisions = read_jsonl(DECISION_PATH)
    read_afters = read_jsonl(READ_AFTER_PATH)
    crosswalk = {row["unit_candidate_id"]: row for row in read_jsonl(CROSSWALK_PATH)}
    decomposition = {}
    for parent in read_jsonl(DECOMPOSITION_PATH):
        for candidate in parent.get("candidate_units", []):
            decomposition[candidate["unit_candidate_id"]] = (parent, candidate)
    relations = {row["requirement_id"]: row for row in read_jsonl(RELATION_PATH)}

    expected_current_edge_count = sum(len(SELECTED[unit]) for unit in UNITS)
    expected_current_unit_count = len(UNITS)
    require(len(rows) == expected_current_edge_count and meta["record_count"] == expected_current_edge_count, "record count")
    require([row["review_id"] for row in rows] == [f"LSRW43-EDGE-{i:03d}" for i in range(1, expected_current_edge_count + 1)], "review order")
    require(meta["schema_revision"] == 10 and meta["batch_id"] == BATCH, "schema/batch")
    require(meta["current_tree_revision"] == BASE and meta["parent_revision"] == BASE and meta["stacked_pr_parent_revision"] == BASE, "base lineage")
    require(meta["main_merge_revision"] == BASE and meta["main_merge_parents"] == MAIN_MERGE_PARENTS, "merge lineage")
    require(meta["source_main_base_revision"] == BASE and meta["wave42_exact_head"] == "49c76ff82bb67c7ba652d67a428b8ff4cf1f8698", "source base")
    require(meta["ancestor_base_gate"] == {"required_base_revision": BASE, "mode": "base_or_descendant", "checked_by": "validate.py"}, "ancestor base gate")
    head = subprocess.run(["git", "rev-parse", "HEAD"], cwd=ROOT, capture_output=True, text=True, check=False)
    require(head.returncode == 0 and head.stdout.strip(), "git head available")
    ancestor = subprocess.run(["git", "merge-base", "--is-ancestor", BASE, head.stdout.strip()], cwd=ROOT, capture_output=True, check=False)
    require(ancestor.returncode == 0, "required base is ancestor")
    require(meta["reviewed_unit_ids"] == UNITS, "unit order")
    require(meta["semantic_link_counts"] == {"confirmed": expected_current_unit_count, "rejected": 0, "unresolved": expected_current_edge_count - expected_current_unit_count}, "semantic counts")
    require(meta["output_sha256"] == file_digest(LEDGER), "ledger digest")
    expected_atom_count = len({atom["atom_id"] for row in rows for atom in row["covered_requirement_atoms"]})
    expected_composite_count = len(meta["source_atomization_holds"])
    require(meta["semantic_atom_count"] == expected_atom_count and meta["composite_unresolved_count"] == expected_composite_count, "atomization counts")
    require(meta["asset_status_receipts"] == expected_asset_status_receipts({asset for assets in SELECTED.values() for asset in assets}, dispositions, decisions, read_afters), "asset decision/failure/consumer receipts")
    inspected = set(meta["inspected_legacy_asset_ids"])
    selected_assets = {asset for assets in SELECTED.values() for asset in assets}
    require(inspected == selected_assets | SUPPLEMENTAL_ASSET_IDS and len(inspected) == 12, "inspected asset denominator")
    require(len(meta["supplemental_asset_receipts"]) == 4, "supplemental receipt count")
    for receipt in meta["supplemental_asset_receipts"]:
        aid = receipt["asset_id"]
        require(aid in SUPPLEMENTAL_ASSET_IDS and receipt["selected_role_edge"] is False, f"supplemental identity {aid}")
        asset = catalog[aid]
        require(receipt["source_path"] == asset["source_path"] and receipt["source_sha256"] == asset["source_sha256"], f"supplemental source {aid}")
        require(file_digest(ARCHIVE / asset["source_path"]).removeprefix("sha256:") == asset["source_sha256"], f"supplemental archive digest {aid}")
        require(receipt["artifact_evidence_kind"] == asset["artifact_evidence_kind"] and receipt["classification_id"] == asset["classification_id"], f"supplemental catalog {aid}")
        require(receipt["legacy_execution_status"] == "not_run" and receipt["current_implementation"] == "unknown_pending_direct_current_review" and receipt["degradation"] == "unknown_pending_direct_current_review", f"supplemental unknown boundary {aid}")
        prior_asset_ids = prior_edges_and_assets()[1]
        require(aid not in prior_asset_ids, f"supplemental prior asset reuse {aid}")
        require(receipt["decision_count"] == len([row for row in decisions if row.get("asset_id") == aid]) and receipt["read_after_count"] == len([row for row in read_afters if row.get("asset_id") == aid]), f"supplemental status receipts {aid}")
    require(meta["legacy_execution_performed"] is False and meta["new_build_allowed"] is False and meta["authority_effect"] == "none", "execution/authority")
    require(file_digest(REQ_IR).removeprefix("sha256:") == REQ_SHA, "requirement digest")
    for row in rows:
        require(set(row) == ROW_FIELDS, f"row schema {row['review_id']}")
    verify_same_batch_nonrequirement_asset_edges(rows)

    # Every declared input is digest-bound, including current four-product boundary docs.
    for path, value in meta["inputs"].items():
        target = ROOT / path
        require(target.is_file() and file_digest(target) == value, f"input digest {path}")
    prior_batches = []
    for wave in range(1, 43):
        _, ledger = prior_artifact(wave, "jsonl")
        _, meta_path = prior_artifact(wave, "meta.json")
        prior_batches.append({"batch_id": json.loads(meta_path.read_text())["batch_id"], "ledger_sha256": file_digest(ledger), "meta_sha256": file_digest(meta_path)})
    require(meta["prior_review_batches"] == prior_batches, "prior lineage")

    current_edges = {(row["unit_candidate_id"], row["asset_id"]) for row in rows}
    expected_edges = {(unit, asset) for unit, assets in SELECTED.items() for asset in assets}
    require(current_edges == expected_edges, "selected edges")
    require(meta["reviewed_edges"] == [{"asset_id": row["asset_id"], "unit_candidate_id": row["unit_candidate_id"]} for row in rows], "reviewed edge order")
    prior_edges, prior_assets, prior_units = prior_edges_and_assets()
    require(not current_edges & prior_edges, "prior unit/asset edge overlap")
    require(not ({row["asset_id"] for row in rows if row["role_kind"] != "requirement"} & prior_assets), "prior implementation/design asset overlap")
    cumulative_units = prior_units | set(UNITS)
    cumulative_edges = prior_edges | current_edges
    require(len(set(current_edges)) == expected_current_edge_count and len(set(UNITS)) == expected_current_unit_count, "current wave dynamic counts")
    require(meta["cumulative_reviewed_unit_count"] == len(cumulative_units) and meta["cumulative_reviewed_edge_count"] == len(cumulative_edges) and meta["remaining_unit_count"] == len(decomposition) - len(cumulative_units), "cumulative counts")

    by_unit = {unit: [row for row in rows if row["unit_candidate_id"] == unit] for unit in UNITS}
    expected_missing = {("design", "IRUNIT-HIL-NFR-12-HELIX-OS"), ("implementation_source", "IRUNIT-HIL-NFR-12-HELIX-OS"), ("implementation_source", "IRUNIT-HIL-NFR-13-HELIX-OS")}
    actual_missing = {(item["role_kind"], item["unit_candidate_id"]) for item in meta["missing_evidence_receipts"]}
    require(actual_missing == expected_missing, "missing evidence keyset")
    for item in meta["missing_evidence_receipts"]:
        missing_key = (item.get("role_kind"), item.get("unit_candidate_id"))
        require(item.get("reason") == MISSING_EVIDENCE_REASONS.get(missing_key), f"missing evidence reason {missing_key}")
        require(item["status"] == "missing_evidence_recorded" and item["current_implementation"] == "unknown" and item["degradation"] == "unknown" and item["consumer_closure"] == "pending" and item["legacy_execution"] == "not_run", "missing evidence boundary")
        if item["reason"].startswith("crosswalk phase_and_product_candidate_asset_count"):
            require(item["phase_pool_asset_count"] == 0, "missing zero-pool boundary")
        else:
            require(item["phase_pool_asset_count"] > 0, "missing nonzero-pool boundary")
            pool_ids = crosswalk[item["unit_candidate_id"]]["candidate_asset_pool"]["phase_and_product_candidate_asset_ids"]
            if item["reason"].startswith("crosswalk implementation_source candidates are already consumed"):
                role_ids = {asset_id for asset_id in pool_ids if catalog[asset_id]["artifact_evidence_kind"] == item["role_kind"]}
                require(role_ids and role_ids <= prior_assets, f"missing consumed role pool boundary {missing_key}")
            else:
                require(not any(catalog[asset_id]["artifact_evidence_kind"] == item["role_kind"] for asset_id in pool_ids), f"missing role pool contains direct evidence {missing_key}")
    for unit in UNITS:
        require(len(by_unit[unit]) == len(SELECTED[unit]), f"unit chain length {unit}")
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
        require(len(hold) == 1 and hold[0]["shared_atom_ids"] == [] and hold[0]["composite_unresolved_count"] == 1, f"atomization hold {unit}")
        require(hold[0]["status"] == "product_boundary_shared_atom_hold", f"atomization status {unit}")
        atom_ids = req["covered_requirement_atom_ids"]
        require(atom_ids and atom_ids == [atom["atom_id"] for atom in req["covered_requirement_atoms"]], f"atom order {unit}")
        for atom in req["covered_requirement_atoms"]:
            indexes = atom["source_span_indexes"]
            require(indexes == sorted(set(indexes)) and all(isinstance(i, int) and 0 <= i < len(req["source_text_spans"]) for i in indexes), f"atom indexes {unit}")
            require(atom["source_fragments"] == [req["source_text_spans"][i] for i in indexes], f"atom fragments {unit}")
            require(atom["text"] in req["source_statement_text"], f"atom literal {unit}")
            if unit in {"IRUNIT-HIL-NFR-15-HELIX-HARNESS", "IRUNIT-HIL-NFR-15-HELIX-OS"}:
                counterpart = "IRUNIT-HIL-NFR-15-HELIX-OS" if unit.endswith("HARNESS") else "IRUNIT-HIL-NFR-15-HELIX-HARNESS"
                expected_shared = [counterpart] if any(fragment in atom["text"] for fragment in ["commit/tree digestと直前段receiptへbind"]) else []
                require(atom["shared_with_units"] == expected_shared, f"shared atom counterpart {unit}")
        for row in by_unit[unit]:
            verify_role(row)
            require(row["batch_id"] == BATCH and row["schema_revision"] == 10, f"row identity {row['review_id']}")
            require(row["product_scope"] == req["product_scope"] and row["phase_candidates"] == req["phase_candidates"], f"row scope {row['review_id']}")
            require(row["covered_requirement_atoms"] == req["covered_requirement_atoms"], f"atom preservation {row['review_id']}")
            require(row["covered_requirement_atom_ids"] == atom_ids, f"atom IDs {row['review_id']}")
            asset = catalog[row["asset_id"]]
            require(row["artifact_evidence_kind"] == row["role_kind"] == asset["artifact_evidence_kind"], f"catalog role {row['review_id']}")
            require(row["classification_id"] == asset["classification_id"] and row["candidate_phase_targets"] == asset["candidate_phase_targets"] and row["candidate_product_targets"] == asset["candidate_product_targets"], f"catalog identity {row['review_id']}")
            require(row["catalog_legacy_implementation_status"] == asset["legacy_implementation_status"], f"catalog implementation status {row['review_id']}")
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
        require(aggregate["unit_candidate_id"] in UNITS and aggregate["reviewed_edge_count"] == len(SELECTED[aggregate["unit_candidate_id"]]), "aggregate count")
        expected_unresolved = len(SELECTED[aggregate["unit_candidate_id"]]) - 1
        require(aggregate["semantic_link_counts"] == {"confirmed": 1, "rejected": 0, "unresolved": expected_unresolved} and aggregate["direct_confirmed_implementation_asset_ids"] == [], "aggregate status")

    # Meaningful fail-closed checks: stale binding, extra authority, and an
    # asset re-use mutation must all be rejected by the same validation rules.
    controlled = next(row for row in rows if row["role_kind"] == "design")
    bad_scope = copy.deepcopy(controlled)
    bad_scope["source_scope_fragments"] = ["invented-current-scope"]
    try:
        verify_role(bad_scope)
    except AssertionError:
        pass
    else:
        raise AssertionError("negative invented source scope accepted")
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
    print("Wave43 static schema10 verification: PASS (source chain, boundary, lineage and negative mutations)")


if __name__ == "__main__":
    verify()
