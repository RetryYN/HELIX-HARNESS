#!/usr/bin/env python3
"""Wave36 schema10 research-premise verifier.

静的な文書・台帳・旧資産スナップショットだけを検査する。archive の
runtime、test、CI は import/run しない。候補は権威または採用ではない。
"""
from __future__ import annotations

import hashlib
import json
from copy import deepcopy
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
ARCHIVE = ROOT / "archive/legacy-generation-2026-09-14/root"
LEDGER = ROOT / "docs/governance/legacy-requirement-direct-semantic-review-wave36.jsonl"
META = ROOT / "docs/governance/legacy-requirement-direct-semantic-review-wave36.meta.json"
CATALOG = ROOT / "docs/governance/legacy-asset-phase-product-classification-bootstrap.jsonl"
CROSSWALK = ROOT / "docs/governance/legacy-requirement-implementation-crosswalk-bootstrap.jsonl"
DECOMPOSITION = ROOT / "docs/governance/legacy-ir-product-unit-decomposition-bootstrap.jsonl"
REQ_IR = ARCHIVE / "requirements-ir/requirements.json"
BATCH = "LEGACY-SEMANTIC-WAVE36-2026-09-22"
PARENT = "19f5febe6af7fe8455aeb5b8fba03be41a4d3d38"
MAIN_MERGE_REVISION = "fbeee47920ed8b2992ae123b00c224ff88987c50"
MAIN_MERGE_PARENTS = ['f122d65e1435b4709fbb7b07fbb8e42b70f0b110', '81144b44b16064bc864b01bd83830455bb7bada3']
REQ_SHA = "80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688"
UNITS = ['IRUNIT-HIL-FR-56-HELIX-HARNESS', 'IRUNIT-HIL-FR-57-HELIX-HARNESS', 'IRUNIT-HIL-FR-58-HELIX-OS', 'IRUNIT-HIL-FR-59-HELIX-OS', 'IRUNIT-HIL-FR-63-HELIX-OS', 'IRUNIT-HIL-FR-68-HELIX-OS', 'IRUNIT-HIL-FR-69-HELIX-OS']

SELECTED = {
 'IRUNIT-HIL-FR-56-HELIX-HARNESS': {'LEGACY-ASSET-DF48E86F1E92DB436CFF', 'LEGACY-ASSET-E4B3D8EF713FE0549819', 'LEGACY-ASSET-A60CF91DD2AF6693E6F9'},
 'IRUNIT-HIL-FR-57-HELIX-HARNESS': {'LEGACY-ASSET-C6CF7E1C334856500558', 'LEGACY-ASSET-CD76B4A6C8DC02604258', 'LEGACY-ASSET-A60CF91DD2AF6693E6F9'},
 'IRUNIT-HIL-FR-58-HELIX-OS': {'LEGACY-ASSET-E4CD3DA31B73501A05DF', 'LEGACY-ASSET-72A14BF6650AA764DC91', 'LEGACY-ASSET-A60CF91DD2AF6693E6F9'},
 'IRUNIT-HIL-FR-59-HELIX-OS': {'LEGACY-ASSET-B1B02A5714A3F015231E', 'LEGACY-ASSET-745B755F2F4CC4E190ED', 'LEGACY-ASSET-A60CF91DD2AF6693E6F9'},
 'IRUNIT-HIL-FR-63-HELIX-OS': {'LEGACY-ASSET-5F1B03D68F2FA5E7B9C3', 'LEGACY-ASSET-183216D28B5B8136B1AB', 'LEGACY-ASSET-A60CF91DD2AF6693E6F9'},
 'IRUNIT-HIL-FR-68-HELIX-OS': {'LEGACY-ASSET-81D47891C96849D54045', 'LEGACY-ASSET-378EAFE0B7F76B481118', 'LEGACY-ASSET-A60CF91DD2AF6693E6F9'},
 'IRUNIT-HIL-FR-69-HELIX-OS': {'LEGACY-ASSET-32426F512D55EB049591', 'LEGACY-ASSET-F30B72631F44921CDD4D', 'LEGACY-ASSET-A60CF91DD2AF6693E6F9'},
}

REQ_DIGESTS = {
 'HIL-FR-56': 'sha256:50309a18a0fb01c0232964b13e339ff415ccc6a0d9c2472e279b393443b9e539',
 'HIL-FR-57': 'sha256:58171916df9edf46974d0241fc75879809fb314dd78d4ab24448b73442120065',
 'HIL-FR-58': 'sha256:1f3226818758cf15d8d60ffe6f435b6c8e524203664bb3414b2bfd61b10f41fe',
 'HIL-FR-59': 'sha256:62bab0d1ae5a31f495494d6a93047746ddb77d64e3830f194faeb9079f05289c',
 'HIL-FR-63': 'sha256:868712720ee331daaafb3a3103e052e82e89ded6270aa48838349c38ea53b0e3',
 'HIL-FR-68': 'sha256:c9a0c409d5b73089fea4e0868d95677f1f855ccc30e749b1960c3377a8e89845',
 'HIL-FR-69': 'sha256:7ab8b55c8728190a18d93cc2aa6848fbb35c8233feb23e671163dd83f926bd9e',
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
# These are deliberately separate per role.  A row must not become valid by
# borrowing the vocabulary or the empty-field contract of another evidence
# role.  The values below are the role contracts already present in the
# Wave36 rows; they are not inferred from the current implementation.
ROLE_POLICIES = {
    "requirement": {
        "artifact_evidence_kind": "requirement",
        "semantic_link_status": "confirmed",
        "semantic_relation": "same_requirement_id_exact_source_contract_not_implementation",
        "legacy_requirement_implementation_contribution": "contract_only_no_implementation_claim",
        "evidence_ref_count": 2,
        "evidence_atom_bindings": "empty",
        "review_scope": "Wave36 schema10 research-premise candidate: exact requirement source / product boundary / phase candidate / catalog asset role",
        "unresolved": (
            "exact_head_independent_review_pending",
            "human_product_authority_decision_pending",
            "successor_assignment_unassigned",
            "product_boundary_human_decision_pending",
            "candidate_product_routing_requires_human_review",
            "source_atomization_review_pending",
            "unit_split_requires_independent_review",
            "consumer_closure_pending",
            "legacy_execution_not_run",
        ),
        "counterevidence": (
            "Requirement／候補assetの静的snapshotであり実装・実行証拠ではない",
            "候補assetの存在は同一要求IDの実装成立・consumer closure・authorityを示さない",
            "source／phase／product candidateはresearch-premiseの静的候補であり、現行設計・実装へ昇格しない",
        ),
        "observed_consumer_refs": ("requirement-carry-forward-ledgers", "requirement-atomization-review"),
    },
    "design": {
        "artifact_evidence_kind": "design",
        "semantic_link_status": "unresolved",
        "semantic_relation": "design_contract_evidence",
        "legacy_requirement_implementation_contribution": "design_contract_only_no_implementation_claim",
        "evidence_ref_count": 1,
        "evidence_atom_bindings": "required",
        "review_scope": "Wave36 schema10 research-premise candidate: exact requirement source / product boundary / phase candidate / catalog asset role",
        "unresolved": (
            "exact_head_independent_review_pending",
            "human_product_authority_decision_pending",
            "successor_assignment_unassigned",
            "product_boundary_human_decision_pending",
            "candidate_product_routing_requires_human_review",
            "source_atomization_review_pending",
            "unit_split_requires_independent_review",
            "consumer_closure_pending",
            "legacy_execution_not_run",
        ),
        "counterevidence": (
            "Requirement／候補assetの静的snapshotであり実装・実行証拠ではない",
            "候補assetの存在は同一要求IDの実装成立・consumer closure・authorityを示さない",
            "source／phase／product candidateはresearch-premiseの静的候補であり、現行設計・実装へ昇格しない",
        ),
        "observed_consumer_refs": ("requirement-carry-forward-ledgers", "requirement-atomization-review"),
    },
    "implementation_source": {
        "artifact_evidence_kind": "implementation_source",
        "semantic_link_status": "unresolved",
        "semantic_relation": "implementation_candidate_only",
        "legacy_requirement_implementation_contribution": "implementation_candidate_only",
        "evidence_ref_count": 1,
        "evidence_atom_bindings": "required",
        "review_scope": "Wave36 schema10 research-premise candidate: exact requirement source / product boundary / phase candidate / catalog asset role",
        "unresolved": (
            "exact_head_independent_review_pending",
            "human_product_authority_decision_pending",
            "successor_assignment_unassigned",
            "product_boundary_human_decision_pending",
            "candidate_product_routing_requires_human_review",
            "source_atomization_review_pending",
            "unit_split_requires_independent_review",
            "consumer_closure_pending",
            "legacy_execution_not_run",
        ),
        "counterevidence": (
            "Requirement／候補assetの静的snapshotであり実装・実行証拠ではない",
            "候補assetの存在は同一要求IDの実装成立・consumer closure・authorityを示さない",
            "source／phase／product candidateはresearch-premiseの静的候補であり、現行設計・実装へ昇格しない",
        ),
        "observed_consumer_refs": ("requirement-carry-forward-ledgers", "requirement-atomization-review"),
    },
}

# Empty values are meaningful only in these fields for this Wave36 snapshot.
# In particular, pending consumer closure requires an empty evidence list;
# the four review-boundary fields above are always mandatory.
ROLE_ALLOWED_EMPTY_FIELDS = {
    "requirement": {"source_scope_fragments", "source_connective_fragments", "evidence_atom_bindings", "connection_records", "consumer_closure_evidence", "reuse_exclusion_class"},
    "design": {"source_scope_fragments", "source_connective_fragments", "connection_records", "consumer_closure_evidence", "reuse_exclusion_class"},
    "implementation_source": {"source_scope_fragments", "source_connective_fragments", "connection_records", "consumer_closure_evidence", "reuse_exclusion_class"},
}
META_FIELDS = {
    "authority_effect", "batch_id", "bounded_search_receipts", "consumer_closure_status",
    "cumulative_reviewed_edge_count", "cumulative_reviewed_unit_count", "current_tree_revision",
    "inputs", "legacy_execution_performed", "main_merge_parents", "main_merge_revision",
    "missing_evidence_receipts", "new_build_allowed", "output_sha256", "parent_revision",
    "phase_rows", "prior_fixed_input_digests", "prior_review_batches", "record_count",
    "remaining_unit_count", "reviewed_edges", "reviewed_unit_ids", "schema_revision",
    "semantic_link_counts", "source_atomization_holds", "source_main_base_revision",
    "source_requirement_asset_id", "source_requirement_ir_sha256", "source_revision",
    "stacked_pr_parent_revision", "status", "unit_aggregates", "wave16_candidate_input_digests",
    "wave16_candidate_merge_base", "wave16_candidate_ref", "wave16_candidate_root",
    "wave17_candidate_input_digests", "wave17_candidate_parent", "wave17_candidate_ref",
    "wave17_candidate_root", "wave17_commit_parent", "wave17_commit_ref", "wave17_commit_root",
    "wave18_candidate_input_digests", "wave18_candidate_parent", "wave18_candidate_ref",
    "wave18_candidate_root", "wave18_exact_head",
    "wave19_candidate_input_digests", "wave19_candidate_parent", "wave19_candidate_ref", "wave19_candidate_root", "wave19_exact_head",
    "wave20_candidate_input_digests", "wave20_candidate_parent", "wave20_candidate_ref", "wave20_candidate_root", "wave20_exact_head",
    "wave21_candidate_input_digests", "wave21_candidate_parent", "wave21_candidate_ref", "wave21_candidate_root", "wave21_exact_head",
}
EXPECTED_INPUT_PATHS = {
    "archive/legacy-generation-2026-09-14/MANIFEST.sha256",
    "docs/governance/legacy-asset-phase-product-classification-bootstrap.jsonl",
    "docs/governance/legacy-ir-product-unit-decomposition-bootstrap.jsonl",
    "docs/governance/legacy-requirement-implementation-crosswalk-bootstrap.jsonl",
    "docs/governance/phase-capability-inventory.json",
} | {
    f"docs/governance/legacy-requirement-direct-semantic-review-wave{wave}.{suffix}"
    for wave in range(1, 36)
    for suffix in ("jsonl", "meta.json")
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


def excerpt(path: Path, start: int, end: int) -> str:
    lines = path.read_text(errors="replace").splitlines()
    require(1 <= start <= end <= len(lines), f"excerpt bounds {path}:{start}-{end}")
    return "\n".join(lines[start - 1 : end])


def selected_excerpt(row: dict, indexes: list[int]) -> str:
    require(indexes == sorted(set(indexes)) and indexes, f"binding indexes {row['review_id']}")
    require(all(0 <= i < len(row["evidence_refs"]) for i in indexes), f"binding range {row['review_id']}")
    return "\n".join(
        excerpt(ROOT / row["evidence_refs"][i]["archive_path"],
                row["evidence_refs"][i]["line_start"],
                row["evidence_refs"][i]["line_end"])
        for i in indexes
    )


def source_span_window(row: dict, atom: dict) -> str:
    source = row["source_statement_text"]
    spans = row["source_text_spans"]
    indexes = atom["source_span_indexes"]
    require(indexes == list(range(indexes[0], indexes[-1] + 1)), f"source span continuity {row['review_id']}")
    cursor = 0
    positions = []
    for span in spans:
        start = source.find(span, cursor)
        require(start >= cursor, f"source span order {row['review_id']}")
        positions.append((start, start + len(span)))
        cursor = start + len(span)
    end = positions[indexes[-1]][1]
    while end < len(source) and source[end] in "。．.!?！？、，,;；:：)]）】》」』”’\"'":
        end += 1
    return source[positions[indexes[0]][0] : end]


def verify_binding(row: dict, binding: dict, joined: str) -> None:
    atoms = {atom["atom_id"]: atom for atom in row["covered_requirement_atoms"]}
    atom = atoms.get(binding["atom_id"])
    require(atom is not None, f"binding atom {row['review_id']}")
    require(binding["match_mode"] == "controlled_term_set_partial", f"binding mode {row['review_id']}")
    require(binding["required_terms"] and binding["source_fragment_anchors"], f"binding terms {row['review_id']}")
    mapping = binding.get("anchor_evidence_terms", {})
    require(set(mapping) <= set(binding["source_fragment_anchors"]), f"anchor map {row['review_id']}")
    source_window = source_span_window(row, atom)
    for anchor in binding["source_fragment_anchors"]:
        require(anchor in atom["text"] and anchor in source_window, f"atom anchor {row['review_id']}")
        if anchor not in joined:
            terms = mapping.get(anchor, [])
            require(terms and all(term in joined for term in terms), f"excerpt anchor {row['review_id']}")
    require(all(term in joined for term in binding["required_terms"]), f"binding terms joined {row['review_id']}")


def verify_role_contract(row: dict) -> None:
    """Enforce the independent vocabulary and empty-field contract per role."""
    role = row["role_kind"]
    policy = ROLE_POLICIES.get(role)
    require(policy is not None, f"unknown role vocabulary {row['review_id']}")
    prefix = row["review_id"]

    for field in ("unresolved", "counterevidence", "review_scope", "observed_consumer_refs"):
        value = row[field]
        require(value not in (None, "", []), f"required role field empty {prefix}:{field}")

    require(row["artifact_evidence_kind"] == policy["artifact_evidence_kind"], f"role artifact kind {prefix}")
    require(row["semantic_link_status"] == policy["semantic_link_status"], f"role semantic status {prefix}")
    require(row["semantic_relation"] == policy["semantic_relation"], f"role semantic relation {prefix}")
    require(
        row["legacy_requirement_implementation_contribution"] == policy["legacy_requirement_implementation_contribution"],
        f"role implementation contribution {prefix}",
    )
    require(len(row["evidence_refs"]) == policy["evidence_ref_count"], f"role evidence ref count {prefix}")
    require(row["review_scope"] == policy["review_scope"], f"role review scope {prefix}")
    require(tuple(row["unresolved"]) == policy["unresolved"], f"role unresolved vocabulary {prefix}")
    require(tuple(row["counterevidence"]) == policy["counterevidence"], f"role counterevidence vocabulary {prefix}")
    require(tuple(row["observed_consumer_refs"]) == policy["observed_consumer_refs"], f"role consumer vocabulary {prefix}")

    for field in ROLE_ALLOWED_EMPTY_FIELDS[role]:
        value = row[field]
        if field == "reuse_exclusion_class":
            require(value is None, f"allowed-empty field mutated {prefix}:{field}")
        else:
            require(value == [], f"allowed-empty field mutated {prefix}:{field}")

    if policy["evidence_atom_bindings"] == "empty":
        require(row["evidence_atom_bindings"] == [], f"requirement evidence binding must be empty {prefix}")
    else:
        require(row["evidence_atom_bindings"], f"non-requirement evidence binding missing {prefix}")
    require(row["consumer_closure_status"] == "pending" and row["consumer_closure_evidence"] == [], f"consumer closure boundary {prefix}")
    for field in ("source_text_spans", "covered_requirement_atom_ids", "covered_requirement_atoms", "evidence_refs"):
        require(row[field], f"required role structure empty {prefix}:{field}")
    require(row["source_requirement_pointer"] and row["source_requirement_legacy_markdown_span"], f"source pointer empty {prefix}")

def verify_atom_provenance(row: dict, requirement: dict, requirement_excerpt: str) -> None:
    source_atoms = {atom["atom_id"]: atom for atom in requirement["covered_requirement_atoms"]}
    for atom in row["covered_requirement_atoms"]:
        require(atom["atom_id"] in source_atoms and atom == source_atoms[atom["atom_id"]], f"atom provenance {row['review_id']}")
    if row["role_kind"] == "requirement":
        for atom in row["covered_requirement_atoms"]:
            indexes = atom["source_span_indexes"]
            source_spans = requirement["source_text_spans"]
            require(indexes == sorted(set(indexes)) and indexes and all(type(i) is int and 0 <= i < len(source_spans) for i in indexes), f"atom indexes {row['review_id']}")
            require(atom["source_fragments"] == [source_spans[i] for i in indexes], f"atom fragments {row['review_id']}")
            require(all(fragment in row["source_statement_text"] and fragment in requirement_excerpt for fragment in atom["source_fragments"]), f"atom source grounding {row['review_id']}")
            require(atom["text"] in row["source_statement_text"] and atom["text"] in requirement_excerpt, f"atom literal source {row['review_id']}")


def phase_projection(crosswalk: dict) -> list[dict]:
    return [
        {
            "phase_id": p["phase_id"],
            "current_status": p["current_status"],
            "legacy_capability_status": p["legacy_capability_status"],
            "transition_assessment": p["transition_assessment"],
            "gap": p["gap"],
            "catalog_asset_count": p["phase_candidate_asset_count"],
            "product_intersection_count": p["phase_and_product_candidate_asset_count"],
        }
        for p in crosswalk.get("phase_capability_evidence", [])
    ]


def prior_edges_and_assets() -> tuple[set[tuple[str, str]], set[str], set[str]]:
    edges, assets, units = set(), set(), set()
    for wave in range(1, 36):
        for row in read_jsonl(ROOT / f"docs/governance/legacy-requirement-direct-semantic-review-wave{wave}.jsonl"):
            edge = (row["unit_candidate_id"], row["asset_id"])
            edges.add(edge)
            units.add(row["unit_candidate_id"])
            if row.get("role_kind", row.get("artifact_evidence_kind")) != "requirement":
                assets.add(row["asset_id"])
    return edges, assets, units


def verify_prior_lineage(meta: dict) -> None:
    require(len(meta["prior_review_batches"]) == 35, "prior batch count")
    for wave, item in enumerate(meta["prior_review_batches"], 1):
        path = ROOT / f"docs/governance/legacy-requirement-direct-semantic-review-wave{wave}.jsonl"
        mpath = ROOT / f"docs/governance/legacy-requirement-direct-semantic-review-wave{wave}.meta.json"
        prior_meta = json.loads(mpath.read_text())
        require(item["batch_id"] == prior_meta["batch_id"], f"prior batch id {wave}")
        require(item["ledger_sha256"] == file_digest(path) and item["meta_sha256"] == file_digest(mpath), f"prior batch digest {wave}")


def candidate_ids_for_query(catalog: dict, query: dict) -> list[str]:
    ids = []
    for asset_id, asset in catalog.items():
        try:
            body = (ARCHIVE / asset["source_path"]).read_text(errors="replace")
        except OSError:
            body = ""
        if any(anchor in body for anchor in query["anchors"]):
            ids.append(asset_id)
    return sorted(ids)


def verify_candidate_receipt(unit: str, receipt: dict, candidate_ids: list[str]) -> None:
    require(candidate_ids == sorted(candidate_ids) and len(candidate_ids) == len(set(candidate_ids)), f"candidate set order/duplicates {unit}")
    selected = receipt["selected_asset_ids"]
    require(selected == sorted(selected) and len(selected) == len(set(selected)), f"selected order/duplicates {unit}")
    require(set(selected) <= set(candidate_ids), f"selected subset {unit}")
    require(selected == sorted(SELECTED[unit]), f"selected receipt {unit}")
    remaining = sorted(set(candidate_ids) - set(selected))
    require(receipt["candidate_asset_count"] == len(candidate_ids), f"candidate count {unit}")
    require(receipt["candidate_asset_count"] == len(selected) + len(remaining), f"candidate partition count {unit}")
    require(receipt["candidate_asset_ids_sha256"] == canonical(candidate_ids), f"candidate receipt {unit}")
    require(receipt["unreviewed_asset_count"] == len(remaining) and receipt["unreviewed_asset_ids_sha256"] == canonical(remaining), f"remaining receipt {unit}")


def verify() -> None:
    rows = read_jsonl(LEDGER)
    meta = json.loads(META.read_text())
    catalog = {row["asset_id"]: row for row in read_jsonl(CATALOG)}
    crosswalk = {row["unit_candidate_id"]: row for row in read_jsonl(CROSSWALK)}
    decomposition = {}
    for parent in read_jsonl(DECOMPOSITION):
        for candidate in parent.get("candidate_units", []):
            decomposition[candidate["unit_candidate_id"]] = (parent, candidate)

    require(set(meta) == META_FIELDS, "meta fields")
    require(len(rows) == 21 and meta["record_count"] == 21, "record count")
    require(meta["schema_revision"] == 10 and meta["batch_id"] == BATCH, "schema/batch")
    require(meta["current_tree_revision"] == PARENT and meta["parent_revision"] == PARENT and meta["stacked_pr_parent_revision"] == PARENT, "parent/current")
    require(meta["main_merge_revision"] == MAIN_MERGE_REVISION and meta["main_merge_parents"] == MAIN_MERGE_PARENTS, "merge lineage")
    require(meta["source_main_base_revision"] == MAIN_MERGE_REVISION and meta["reviewed_unit_ids"] == UNITS, "source base/units")
    require([r["review_id"] for r in rows] == [f"LSRW36-EDGE-{i:03d}" for i in range(1, 22)], "review order")
    require(meta["output_sha256"] == file_digest(LEDGER), "ledger digest")
    require(meta["semantic_link_counts"] == {"confirmed": 7, "rejected": 0, "unresolved": 14}, "semantic counts")
    require(meta["authority_effect"] == "none" and meta["consumer_closure_status"] == "pending", "authority")
    require(meta["legacy_execution_performed"] is False and meta["new_build_allowed"] is False, "execution")
    require(file_digest(REQ_IR).removeprefix("sha256:") == REQ_SHA, "requirement IR digest")
    for row in rows:
        require(set(row) == ROW_FIELDS, f"row fields {row['review_id']}")
    verify_prior_lineage(meta)

    require(set(meta["inputs"]) == EXPECTED_INPUT_PATHS, "input path set")
    for name, value in meta["inputs"].items():
        path = ROOT / name
        require(path.is_file() and file_digest(path) == value, f"input digest {name}")

    current_edges = {(r["unit_candidate_id"], r["asset_id"]) for r in rows}
    expected_edges = {(unit, asset) for unit, assets in SELECTED.items() for asset in assets}
    require(current_edges == expected_edges and len(current_edges) == 21, "selected edges")
    current_nonreq_assets = [r["asset_id"] for r in rows if r["role_kind"] != "requirement"]
    require(len(current_nonreq_assets) == 14 and len(set(current_nonreq_assets)) == 14, "current asset uniqueness")
    ledger_edges = [{"asset_id": r["asset_id"], "unit_candidate_id": r["unit_candidate_id"]} for r in rows]
    require(meta["reviewed_edges"] == ledger_edges, "reviewed_edges exact ledger")
    prior_edges, prior_assets, prior_units = prior_edges_and_assets()
    require(not current_edges & prior_edges, "prior edge overlap")
    require(not ({r["asset_id"] for r in rows if r["role_kind"] != "requirement"} & prior_assets), "prior implementation asset overlap")
    require(len(prior_units | set(UNITS)) == 145, "cumulative units")
    require(len(prior_edges | current_edges) == 432, "cumulative edges")
    require(meta["cumulative_reviewed_unit_count"] == 145 and meta["cumulative_reviewed_edge_count"] == 432 and meta["remaining_unit_count"] == 73, "cumulative receipt")
    require(meta["missing_evidence_receipts"] == [], "missing evidence receipts")

    by_unit = {unit: [r for r in rows if r["unit_candidate_id"] == unit] for unit in UNITS}
    for unit in UNITS:
        require(len(by_unit[unit]) == 3, f"unit row count {unit}")
        parent, candidate = decomposition[unit]
        requirement = by_unit[unit][0]
        req_id = parent["source_requirement_id"]
        require(requirement["role_kind"] == "requirement" and requirement["source_requirement_id"] == req_id, f"requirement row {unit}")
        require(candidate["unit_kind"] == "product_unit" and candidate["product_target"] == requirement["product_scope"][0], f"product join {unit}")
        require(requirement["phase_candidates"] == candidate["direct_phase_candidates"], f"decomposition phase join {unit}")
        require(requirement["source_text_spans"] == candidate["source_text_spans"], f"decomposition span join {unit}")
        require(crosswalk[unit]["direct_phase_candidates"] == requirement["phase_candidates"], f"crosswalk phase join {unit}")
        require(requirement["source_statement_semantic_digest"] == REQ_DIGESTS[req_id], f"requirement semantic digest {unit}")
        require(meta["phase_rows"][unit] == phase_projection(crosswalk[unit]), f"phase rows {unit}")
        hold = next((h for h in meta["source_atomization_holds"] if h.get("unit_candidate_id") == unit), None)
        expected_shared = []
        require(hold is not None and hold["status"] == "product_boundary_shared_atom_hold" and hold["shared_atom_ids"] == expected_shared, f"product boundary hold {unit}")
        require(all(r["atomization_hold"] == requirement["atomization_hold"] for r in by_unit[unit]), f"atomization hold {unit}")

        req_excerpt = selected_excerpt(requirement, list(range(len(requirement["evidence_refs"]))))
        for row in by_unit[unit]:
            verify_role_contract(row)
            require(row["batch_id"] == BATCH and row["schema_revision"] == 10, f"row identity {row['review_id']}")
            require(row["product_scope"] == requirement["product_scope"] and row["phase_candidates"] == requirement["phase_candidates"], f"row scope {row['review_id']}")
            require(row["authority_effect"] == "none" and row["consumer_closure_status"] == "pending" and row["consumer_closure_evidence"] == [], f"row authority {row['review_id']}")
            require(row["legacy_execution_status"] == "not_run" and row["current_requirement_implementation_status"] == "not_established" and row["new_build_allowed"] is False, f"row execution {row['review_id']}")
            require(row["candidate_membership_semantics"] == "bounded_global_search_candidate_only_not_semantic_evidence", f"candidate semantics {row['review_id']}")
            require(row["covered_requirement_atom_ids"] == [a["atom_id"] for a in row["covered_requirement_atoms"]], f"atom order {row['review_id']}")
            asset = catalog[row["asset_id"]]
            require(row["artifact_evidence_kind"] == row["role_kind"] == asset["artifact_evidence_kind"], f"catalog kind {row['review_id']}")
            require(row["classification_id"] == asset["classification_id"] and row["candidate_phase_targets"] == asset["candidate_phase_targets"] and row["candidate_product_targets"] == asset["candidate_product_targets"], f"catalog identity {row['review_id']}")
            require(row["source_path"] == asset["source_path"], f"catalog source path {row['review_id']}")
            require(row["source_sha256"] == (REQ_SHA if row["role_kind"] == "requirement" else asset["source_sha256"]), f"source sha {row['review_id']}")
            source = ARCHIVE / row["source_path"]
            require(source.is_file() and file_digest(source).removeprefix("sha256:") == row["source_sha256"], f"archive source sha {row['review_id']}")
            evidence_parts = []
            for ref in row["evidence_refs"]:
                path = ROOT / ref["archive_path"]
                require(path.is_file() and ref["artifact_role"] == row["role_kind"] and ref["excerpt_status"] == "static_read_only", f"evidence ref {row['review_id']}")
                text = excerpt(path, ref["line_start"], ref["line_end"])
                require(ref["excerpt_sha256"] == digest(text.encode()) and ref["source_requirement_relation"] == row["semantic_relation"], f"evidence digest {row['review_id']}")
                evidence_parts.append(text)
            evidence = "\n".join(evidence_parts)
            verify_atom_provenance(row, requirement, req_excerpt if row["role_kind"] == "requirement" else evidence)
            if row["role_kind"] == "requirement":
                require(row["semantic_link_status"] == "confirmed" and row["semantic_relation"] == "same_requirement_id_exact_source_contract_not_implementation", f"requirement contract {row['review_id']}")
                require(row["source_statement_text"] in evidence and all(span in evidence for span in row["source_text_spans"]), f"exact requirement source {row['review_id']}")
                require(any(ref["archive_path"].endswith("requirements.json") for ref in row["evidence_refs"]) and any(ref["archive_path"].endswith("infinity-loop-platform-requirements.md") for ref in row["evidence_refs"]), f"source anchors {row['review_id']}")
            else:
                require(row["semantic_link_status"] == "unresolved" and any("実装" in x and "実行" in x for x in row["counterevidence"]), f"candidate limitation {row['review_id']}")
                for binding in row["evidence_atom_bindings"]:
                    verify_binding(row, binding, selected_excerpt(row, binding["evidence_ref_indexes"]))

    # Bounded search receipts are recomputed from catalog source paths and exact anchors.
    for unit, receipt in meta["bounded_search_receipts"].items():
        require(unit in UNITS and receipt["catalog_record_count"] == len(catalog), f"search receipt shape {unit}")
        require(receipt["query"] == by_unit[unit][0]["bounded_search_query"], f"search query {unit}")
        ids = candidate_ids_for_query(catalog, receipt["query"])
        verify_candidate_receipt(unit, receipt, ids)
        pool = crosswalk[unit]["candidate_asset_pool"]
        pool_ids = sorted(pool["phase_and_product_candidate_asset_ids"])
        require(receipt["phase_pool_asset_count"] == pool["phase_and_product_candidate_asset_count"] and receipt["phase_pool_asset_ids_sha256"] == canonical(pool_ids), f"phase pool receipt {unit}")

    for aggregate in meta["unit_aggregates"]:
        require(aggregate["unit_candidate_id"] in UNITS and aggregate["reviewed_edge_count"] == 3, "aggregate count")
        require(aggregate["semantic_link_counts"] == {"confirmed": 1, "rejected": 0, "unresolved": 2}, "aggregate semantics")
        require(aggregate["direct_confirmed_implementation_asset_ids"] == [] and aggregate["phase_authority_status"] == "candidate_unchanged", "aggregate authority")

    # Fail-closed negative checks keep the verifier sensitive to stale anchors/extra authority claims.
    controlled = next(r for r in rows if r["role_kind"] == "design")
    binding = controlled["evidence_atom_bindings"][0]
    bad = deepcopy(binding)
    bad["source_fragment_anchors"] = ["stale-anchor"]
    try:
        verify_binding(controlled, bad, selected_excerpt(controlled, binding["evidence_ref_indexes"]))
    except AssertionError:
        pass
    else:
        raise AssertionError("negative stale-anchor case accepted")
    receipt_unit = UNITS[0]
    receipt = meta["bounded_search_receipts"][receipt_unit]
    candidate_ids = candidate_ids_for_query(catalog, receipt["query"])
    outside = "LEGACY-ASSET-WAVE36-OUTSIDE-CANDIDATE"
    require(outside not in candidate_ids, "negative candidate setup collision")
    bad_receipt = deepcopy(receipt)
    bad_receipt["selected_asset_ids"] = sorted([*bad_receipt["selected_asset_ids"], outside])
    try:
        verify_candidate_receipt(receipt_unit, bad_receipt, candidate_ids)
    except AssertionError as exc:
        require(str(exc) == f"selected subset {receipt_unit}", "negative candidate-outside wrong failure")
    else:
        raise AssertionError("negative candidate-outside case accepted")
    def expect_role_rejection(label: str, original: dict, mutate, needle: str) -> None:
        bad_row = deepcopy(original)
        mutate(bad_row)
        try:
            verify_role_contract(bad_row)
        except AssertionError as exc:
            require(needle in str(exc), f"negative {label} wrong failure")
        else:
            raise AssertionError(f"negative {label} accepted")

    requirement_row = next(r for r in rows if r["role_kind"] == "requirement")
    implementation_row = next(r for r in rows if r["role_kind"] == "implementation_source")
    expect_role_rejection(
        "role-semantic-inversion",
        controlled,
        lambda row: row.update(semantic_relation=requirement_row["semantic_relation"]),
        "role semantic relation",
    )
    expect_role_rejection(
        "unresolved-empty",
        requirement_row,
        lambda row: row.update(unresolved=[]),
        "required role field empty",
    )
    expect_role_rejection(
        "counterevidence-empty",
        controlled,
        lambda row: row.update(counterevidence=[]),
        "required role field empty",
    )
    expect_role_rejection(
        "counterevidence-bogus-token",
        controlled,
        lambda row: row.update(counterevidence=[*row["counterevidence"], "bogus-counterevidence"]),
        "role counterevidence vocabulary",
    )
    expect_role_rejection(
        "review-scope-empty",
        implementation_row,
        lambda row: row.update(review_scope=""),
        "required role field empty",
    )
    expect_role_rejection(
        "review-scope-bogus-token",
        implementation_row,
        lambda row: row.update(review_scope="bogus-review-scope"),
        "role review scope",
    )
    expect_role_rejection(
        "consumer-refs-empty",
        requirement_row,
        lambda row: row.update(observed_consumer_refs=[]),
        "required role field empty",
    )
    expect_role_rejection(
        "implementation-binding-empty",
        implementation_row,
        lambda row: row.update(evidence_atom_bindings=[]),
        "non-requirement evidence binding missing",
    )
    expect_role_rejection(
        "requirement-binding-injected",
        requirement_row,
        lambda row: row.update(evidence_atom_bindings=[{"bogus": True}]),
        "allowed-empty field mutated",
    )
    expect_role_rejection(
        "bogus-unresolved-token",
        controlled,
        lambda row: row.update(unresolved=[*row["unresolved"], "bogus-token"]),
        "role unresolved vocabulary",
    )
    expect_role_rejection(
        "bogus-consumer-reference",
        implementation_row,
        lambda row: row.update(observed_consumer_refs=["bogus-consumer"]),
        "role consumer vocabulary",
    )
    expect_role_rejection(
        "forbidden-empty-field-injection",
        controlled,
        lambda row: row.update(connection_records=[{"bogus": True}]),
        "allowed-empty field mutated",
    )
    injected = deepcopy(controlled)
    injected["merge_admission"] = "granted"
    require(set(injected) != ROW_FIELDS, "extra authority field accepted")
    print("Wave36 static schema10 verification: PASS (role contracts and negative mutations included)")


if __name__ == "__main__":
    verify()
