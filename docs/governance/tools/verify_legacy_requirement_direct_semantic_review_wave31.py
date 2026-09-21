#!/usr/bin/env python3
"""Wave31 schema10 research-premise verifier.

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
LEDGER = ROOT / "docs/governance/legacy-requirement-direct-semantic-review-wave31.jsonl"
META = ROOT / "docs/governance/legacy-requirement-direct-semantic-review-wave31.meta.json"
CATALOG = ROOT / "docs/governance/legacy-asset-phase-product-classification-bootstrap.jsonl"
CROSSWALK = ROOT / "docs/governance/legacy-requirement-implementation-crosswalk-bootstrap.jsonl"
DECOMPOSITION = ROOT / "docs/governance/legacy-ir-product-unit-decomposition-bootstrap.jsonl"
REQ_IR = ARCHIVE / "requirements-ir/requirements.json"
BATCH = "LEGACY-SEMANTIC-WAVE31-2026-09-22"
PARENT = "f07aaa41ecc0c9098c6421049b0f4df5f0b8da6a"
MAIN_MERGE_REVISION = "1c6912ad34b9a7950206188ad364e3a712dc9e6b"
MAIN_MERGE_PARENTS = ['b27e61f079edf64eeddc43eb8095159b19730b94', 'a05b9f5444ba11626823683cc486db95c9d1f3a3']
REQ_SHA = "80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688"
UNITS = ["IRUNIT-HIL-FR-24-HELIX-OS", "IRUNIT-HIL-FR-25-HELIX-OS", "IRUNIT-HIL-FR-26-HELIX-OS", "IRUNIT-HIL-FR-27-HELIX-OS"]

SELECTED = {
    UNITS[0]: set(["LEGACY-ASSET-9BCBB3FAE96629A0297C", "LEGACY-ASSET-77A70068271118050C5F", "LEGACY-ASSET-A60CF91DD2AF6693E6F9"]),
    UNITS[1]: set(["LEGACY-ASSET-28B47108797C610AE0BC", "LEGACY-ASSET-65623783877D38E779BC", "LEGACY-ASSET-A60CF91DD2AF6693E6F9"]),
    UNITS[2]: set(["LEGACY-ASSET-28B47108797C610AE0BC", "LEGACY-ASSET-A1918FF3AB1C2FC43DD2", "LEGACY-ASSET-A60CF91DD2AF6693E6F9"]),
    UNITS[3]: set(["LEGACY-ASSET-FA37B89CBB3EBE4E9E8C", "LEGACY-ASSET-D1CCFACACCDB6FC251AE", "LEGACY-ASSET-A60CF91DD2AF6693E6F9"]),
}

REQ_DIGESTS = {
    "HIL-FR-24": "sha256:b021ff425efe0ba75863b33302ec3c41146b5c995ad9cfae41af926e80d152d2",
    "HIL-FR-25": "sha256:36c4ed5dec52d986c2fb907a3a77990ba8c37ca9f758659ea629bc5ad1a657f5",
    "HIL-FR-26": "sha256:76c13e750973dfd41c71441213ec6b6d17594a8639712557e88a04ecc9e914d4",
    "HIL-FR-27": "sha256:d07429d447a619e36123eef0eec84033d66bea379ac65c632db5de7794781ecb",
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
    for wave in range(1, 31)
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
    for wave in range(1, 31):
        for row in read_jsonl(ROOT / f"docs/governance/legacy-requirement-direct-semantic-review-wave{wave}.jsonl"):
            edge = (row["unit_candidate_id"], row["asset_id"])
            edges.add(edge)
            units.add(row["unit_candidate_id"])
            if row.get("role_kind", row.get("artifact_evidence_kind")) != "requirement":
                assets.add(row["asset_id"])
    return edges, assets, units


def verify_prior_lineage(meta: dict) -> None:
    require(len(meta["prior_review_batches"]) == 30, "prior batch count")
    for wave, item in enumerate(meta["prior_review_batches"], 1):
        path = ROOT / f"docs/governance/legacy-requirement-direct-semantic-review-wave{wave}.jsonl"
        mpath = ROOT / f"docs/governance/legacy-requirement-direct-semantic-review-wave{wave}.meta.json"
        prior_meta = json.loads(mpath.read_text())
        require(item["batch_id"] == prior_meta["batch_id"], f"prior batch id {wave}")
        require(item["ledger_sha256"] == file_digest(path) and item["meta_sha256"] == file_digest(mpath), f"prior batch digest {wave}")


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
    require(len(rows) == 12 and meta["record_count"] == 12, "record count")
    require(meta["schema_revision"] == 10 and meta["batch_id"] == BATCH, "schema/batch")
    require(meta["current_tree_revision"] == PARENT and meta["parent_revision"] == PARENT and meta["stacked_pr_parent_revision"] == PARENT, "parent/current")
    require(meta["main_merge_revision"] == MAIN_MERGE_REVISION and meta["main_merge_parents"] == MAIN_MERGE_PARENTS, "merge lineage")
    require(meta["source_main_base_revision"] == MAIN_MERGE_REVISION and meta["reviewed_unit_ids"] == UNITS, "source base/units")
    require([r["review_id"] for r in rows] == [f"LSRW31-EDGE-{i:03d}" for i in range(1, 13)], "review order")
    require(meta["output_sha256"] == file_digest(LEDGER), "ledger digest")
    require(meta["semantic_link_counts"] == {"confirmed": 4, "rejected": 0, "unresolved": 8}, "semantic counts")
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
    require(current_edges == expected_edges, "selected edges")
    prior_edges, prior_assets, prior_units = prior_edges_and_assets()
    require(not current_edges & prior_edges, "prior edge overlap")
    require(not ({r["asset_id"] for r in rows if r["role_kind"] != "requirement"} & prior_assets), "prior implementation asset overlap")
    require(len(prior_units | set(UNITS)) == 103, "cumulative units")
    require(len(prior_edges | current_edges) == 306, "cumulative edges")
    require(meta["cumulative_reviewed_unit_count"] == 103 and meta["cumulative_reviewed_edge_count"] == 306 and meta["remaining_unit_count"] == 115, "cumulative receipt")
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
        expected_shared = {unit: [] for unit in UNITS}[unit]
        require(hold is not None and hold["status"] == "product_boundary_shared_atom_hold" and hold["shared_atom_ids"] == expected_shared, f"product boundary hold {unit}")
        require(all(r["atomization_hold"] == requirement["atomization_hold"] for r in by_unit[unit]), f"atomization hold {unit}")

        req_excerpt = selected_excerpt(requirement, list(range(len(requirement["evidence_refs"]))))
        for row in by_unit[unit]:
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
        ids = []
        for aid, asset in catalog.items():
            try:
                body = (ARCHIVE / asset["source_path"]).read_text(errors="replace")
            except OSError:
                body = ""
            if any(anchor in body for anchor in receipt["query"]["anchors"]):
                ids.append(aid)
        ids.sort()
        require(receipt["candidate_asset_count"] == len(ids) and receipt["candidate_asset_ids_sha256"] == canonical(ids), f"candidate receipt {unit}")
        expected = sorted(SELECTED[unit])
        require(receipt["selected_asset_ids"] == expected, f"selected receipt {unit}")
        remaining = sorted(set(ids) - set(expected))
        require(receipt["unreviewed_asset_count"] == len(remaining) and receipt["unreviewed_asset_ids_sha256"] == canonical(remaining), f"remaining receipt {unit}")
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
    injected = deepcopy(controlled)
    injected["merge_admission"] = "granted"
    require(set(injected) != ROW_FIELDS, "extra authority field accepted")
    print("Wave31 static schema10 verification: PASS")


if __name__ == "__main__":
    verify()
