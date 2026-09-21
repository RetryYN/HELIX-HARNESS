#!/usr/bin/env python3
"""Wave19 schema10 research-premise verifier.

This verifier performs static reads only.  It never imports or executes the
legacy archive.  Candidate assets are provenance evidence and remain outside
the current design/implementation authority boundary.
"""
from __future__ import annotations

import hashlib
import json
from copy import deepcopy
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
ARCHIVE = ROOT / "archive/legacy-generation-2026-09-14/root"
LEDGER = ROOT / "docs/governance/legacy-requirement-direct-semantic-review-wave19.jsonl"
META = ROOT / "docs/governance/legacy-requirement-direct-semantic-review-wave19.meta.json"
CATALOG = ROOT / "docs/governance/legacy-asset-phase-product-classification-bootstrap.jsonl"
CROSSWALK = ROOT / "docs/governance/legacy-requirement-implementation-crosswalk-bootstrap.jsonl"
DECOMPOSITION = ROOT / "docs/governance/legacy-ir-product-unit-decomposition-bootstrap.jsonl"
REQ_IR = ARCHIVE / "requirements-ir/requirements.json"
BATCH = "LEGACY-SEMANTIC-WAVE19-2026-09-21"
PARENT = "17ce6830d2d4c684c96d55705cdc65790a4fdaa4"
MAIN_MERGE_PARENTS = ["4bff98789877b5b9b3b65c181a63ea1c1d826ee3", "e40f7f778117864dc2271af323977ca6e4fd1e4c"]
WAVE18_EXACT = "e40f7f778117864dc2271af323977ca6e4fd1e4c"
SOURCE_BASE = "6dad906ed9a52c9e49611931645db2f298c6bf6a"
REQ_SHA = "80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688"
UNITS = [
    "IRUNIT-HIL-BR-23-HELIX-HARNESS",
    "IRUNIT-HIL-BR-23-HELIX-OS",
    "IRUNIT-HIL-BR-24-HELIX-HARNESS",
    "IRUNIT-HIL-BR-24-HELIX-OS",
]
SELECTED = {
    "IRUNIT-HIL-BR-23-HELIX-HARNESS": {
        "LEGACY-ASSET-A60CF91DD2AF6693E6F9",
        "LEGACY-ASSET-809D616D0D7D844F5720",
        "LEGACY-ASSET-FA8D4E24D8399E8350F1",
    },
    "IRUNIT-HIL-BR-23-HELIX-OS": {
        "LEGACY-ASSET-A60CF91DD2AF6693E6F9",
        "LEGACY-ASSET-D5630716F221DA23DB09",
        "LEGACY-ASSET-FBE72B3EBE59FF68C34B",
    },
    "IRUNIT-HIL-BR-24-HELIX-HARNESS": {
        "LEGACY-ASSET-A60CF91DD2AF6693E6F9",
        "LEGACY-ASSET-CBF2D0F8889BC4C80AF4",
        "LEGACY-ASSET-11379713A3797CAC3141",
    },
    "IRUNIT-HIL-BR-24-HELIX-OS": {"LEGACY-ASSET-A60CF91DD2AF6693E6F9"},
}
REQ_DIGESTS = {
    "HIL-BR-23": "sha256:271ec5381b718cce0fd8f0e3beacb9d0359059f88e8ea705fc7319edaa164c2d",
    "HIL-BR-24": "sha256:9727fd0b427f18eb8b6839f2f2f97d1d13ed88059b0c05738b887ed127c9809d",
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


def fail(message: str) -> None:
    raise AssertionError(message)


def require(condition: bool, message: str) -> None:
    if not condition:
        fail(message)


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


def selected_excerpt(row: dict, binding: dict) -> str:
    indexes = binding["evidence_ref_indexes"]
    require(indexes == sorted(set(indexes)) and indexes and all(type(i) is int for i in indexes), "binding indexes")
    require(all(0 <= i < len(row["evidence_refs"]) for i in indexes), "binding index range")
    return "\n".join(
        excerpt(ROOT / row["evidence_refs"][i]["archive_path"], row["evidence_refs"][i]["line_start"], row["evidence_refs"][i]["line_end"])
        for i in indexes
    )


def verify_binding(row: dict, binding: dict, joined: str) -> None:
    atoms = {atom["atom_id"]: atom for atom in row["covered_requirement_atoms"]}
    atom = atoms.get(binding["atom_id"])
    require(atom is not None, f"binding atom {row['review_id']}")
    require(binding["match_mode"] == "controlled_term_set_partial", f"binding mode {row['review_id']}")
    require(binding["required_terms"] and binding["source_fragment_anchors"], f"binding terms {row['review_id']}")
    mapping = binding.get("anchor_evidence_terms", {})
    require(set(mapping) <= set(binding["source_fragment_anchors"]), f"anchor map scope {row['review_id']}")
    for anchor in binding["source_fragment_anchors"]:
        require(anchor in atom["text"] and any(anchor in f for f in atom["source_fragments"]), f"atom anchor {row['review_id']}")
        if anchor not in joined:
            terms = mapping.get(anchor, [])
            require(terms and all(term in binding["required_terms"] and term in joined for term in terms), f"excerpt anchor {row['review_id']}")
    require(all(term in joined for term in binding["required_terms"]), f"binding term {row['review_id']}")


def verify_atom_provenance(row: dict, requirement: dict, requirement_excerpt: str) -> None:
    """Bind every candidate atom to the exact requirement atom and source text."""
    source_atoms = {atom["atom_id"]: atom for atom in requirement["covered_requirement_atoms"]}
    for atom in row["covered_requirement_atoms"]:
        require(
            atom["atom_id"] in source_atoms and atom == source_atoms[atom["atom_id"]],
            f"evidence atom provenance {row['review_id']}:{atom['atom_id']}",
        )
    if row["role_kind"] == "requirement":
        for atom in row["covered_requirement_atoms"]:
            require(
                atom["source_fragments"]
                and all(
                    fragment in row["source_statement_text"] and fragment in requirement_excerpt
                    for fragment in atom["source_fragments"]
                ),
                f"requirement atom source grounding {row['review_id']}:{atom['atom_id']}",
            )


def verify_row_fields(row: dict) -> None:
    require(set(row) == ROW_FIELDS, f"row fields {row['review_id']}")


def prior_assets_and_edges() -> tuple[set[tuple[str, str]], set[str], set[str]]:
    edges: set[tuple[str, str]] = set()
    assets: set[str] = set()
    units: set[str] = set()
    for wave in range(1, 19):
        for row in read_jsonl(ROOT / f"docs/governance/legacy-requirement-direct-semantic-review-wave{wave}.jsonl"):
            unit = row["unit_candidate_id"]
            aid = row["asset_id"]
            edges.add((unit, aid))
            units.add(unit)
            if row.get("role_kind", row.get("artifact_evidence_kind")) != "requirement":
                assets.add(aid)
    return edges, assets, units


def phase_projection(crosswalk: dict) -> list[dict]:
    return [
        {
            "phase_id": phase["phase_id"],
            "current_status": phase["current_status"],
            "legacy_capability_status": phase["legacy_capability_status"],
            "transition_assessment": phase["transition_assessment"],
            "gap": phase["gap"],
            "catalog_asset_count": phase["phase_candidate_asset_count"],
            "product_intersection_count": phase["phase_and_product_candidate_asset_count"],
        }
        for phase in crosswalk.get("phase_capability_evidence", [])
    ]


def verify() -> None:
    rows = read_jsonl(LEDGER)
    meta = json.loads(META.read_text())
    catalog = {row["asset_id"]: row for row in read_jsonl(CATALOG)}
    crosswalk = {row["unit_candidate_id"]: row for row in read_jsonl(CROSSWALK)}
    decomposition = {}
    for parent in read_jsonl(DECOMPOSITION):
        for candidate in parent.get("candidate_units", []):
            decomposition[candidate["unit_candidate_id"]] = (parent, candidate)

    require(len(rows) == 10 and meta["record_count"] == 10, "record count")
    require(meta["schema_revision"] == 10 and meta["batch_id"] == BATCH, "schema/batch")
    require(meta["parent_revision"] == PARENT and meta["stacked_pr_parent_revision"] == PARENT, "stacked parent")
    require(meta["main_merge_revision"] == PARENT and meta["main_merge_parents"] == MAIN_MERGE_PARENTS, "main merge lineage")
    require(meta["wave18_exact_head"] == WAVE18_EXACT and meta["wave18_candidate_ref"] == WAVE18_EXACT, "Wave18 exact head")
    require(meta["source_main_base_revision"] == SOURCE_BASE, "source base is explicit")
    require(meta["reviewed_unit_ids"] == UNITS, "unit order")
    require([row["review_id"] for row in rows] == [f"LSRW19-EDGE-{i:03d}" for i in range(1, 11)], "review order")
    require(meta["output_sha256"] == file_digest(LEDGER), "ledger digest")
    require(meta["semantic_link_counts"] == {"confirmed": 4, "rejected": 0, "unresolved": 6}, "semantic counts")
    require(meta["authority_effect"] == "none" and meta["consumer_closure_status"] == "pending", "meta authority")
    require(meta["legacy_execution_performed"] is False and meta["new_build_allowed"] is False, "meta execution")
    require(file_digest(REQ_IR).removeprefix("sha256:") == REQ_SHA, "requirement digest")
    for row in rows:
        verify_row_fields(row)

    current_edges = {(row["unit_candidate_id"], row["asset_id"]) for row in rows}
    expected_edges = {(unit, aid) for unit, aids in SELECTED.items() for aid in aids}
    require(current_edges == expected_edges, "selected edges")
    prior_edges, prior_assets, prior_units = prior_assets_and_edges()
    require(not current_edges & prior_edges, "prior edge overlap")
    require(not ({row["asset_id"] for row in rows if row["role_kind"] != "requirement"} & prior_assets), "prior asset overlap")
    require(len(prior_units | set(UNITS)) == 58, "unit cumulative count")
    require(len(prior_edges | current_edges) == 171, "edge cumulative count")
    require(meta["cumulative_reviewed_unit_count"] == 58 and meta["cumulative_reviewed_edge_count"] == 171 and meta["remaining_unit_count"] == 160, "cumulative receipt")

    for name, value in meta["inputs"].items():
        path = ROOT / name
        require(path.is_file() and file_digest(path) == value, f"input digest {name}")
    require(meta["wave18_candidate_input_digests"]["docs/governance/legacy-requirement-direct-semantic-review-wave18.jsonl"] == file_digest(ROOT / "docs/governance/legacy-requirement-direct-semantic-review-wave18.jsonl"), "wave18 ledger pin")

    by_unit = {unit: [row for row in rows if row["unit_candidate_id"] == unit] for unit in UNITS}
    for unit, unit_rows in by_unit.items():
        require(unit_rows, f"unit rows {unit}")
        parent, candidate = decomposition[unit]
        requirement = unit_rows[0]
        req = parent["source_requirement_id"]
        require(requirement["role_kind"] == "requirement" and requirement["source_requirement_id"] == req, f"requirement row {unit}")
        require(candidate["unit_kind"] == "product_unit" and candidate["product_target"] == requirement["product_scope"][0], f"unit product {unit}")
        require(requirement["phase_candidates"] == candidate["direct_phase_candidates"] and requirement["source_text_spans"] == candidate["source_text_spans"], f"decomposition join {unit}")
        require(requirement["source_statement_semantic_digest"] == REQ_DIGESTS[req], f"source semantic digest {unit}")
        require(meta["phase_rows"][unit] == phase_projection(crosswalk[unit]), f"phase rows {unit}")
        for row in unit_rows:
            require(row["batch_id"] == BATCH and row["schema_revision"] == 10, f"row identity {row['review_id']}")
            require(row["product_scope"] == requirement["product_scope"] and row["phase_candidates"] == requirement["phase_candidates"], f"row scope {row['review_id']}")
            require(row["authority_effect"] == "none" and row["consumer_closure_status"] == "pending" and row["consumer_closure_evidence"] == [], f"row authority {row['review_id']}")
            require(row["legacy_execution_status"] == "not_run" and row["current_requirement_implementation_status"] == "not_established" and row["new_build_allowed"] is False, f"row execution {row['review_id']}")
            require(row["candidate_membership_semantics"] == "bounded_global_search_candidate_only_not_semantic_evidence", f"membership {row['review_id']}")
            asset = catalog[row["asset_id"]]
            require(row["artifact_evidence_kind"] == row["role_kind"] == asset["artifact_evidence_kind"], f"catalog kind {row['review_id']}")
            require(row["classification_id"] == asset["classification_id"] and row["candidate_phase_targets"] == asset["candidate_phase_targets"] and row["candidate_product_targets"] == asset["candidate_product_targets"], f"catalog identity {row['review_id']}")
            require(row["source_path"] == asset["source_path"], f"catalog path {row['review_id']}")
            expected_sha = REQ_SHA if row["role_kind"] == "requirement" else asset["source_sha256"]
            require(row["source_sha256"] == expected_sha, f"source sha {row['review_id']}")
            source = ARCHIVE / row["source_path"]
            require(source.is_file() and file_digest(source).removeprefix("sha256:") == row["source_sha256"], f"archive sha {row['review_id']}")
            joined = []
            for ref in row["evidence_refs"]:
                path = ROOT / ref["archive_path"]
                require(path.is_file() and ref["artifact_role"] == row["role_kind"] and ref["excerpt_status"] == "static_read_only", f"evidence ref {row['review_id']}")
                text = excerpt(path, ref["line_start"], ref["line_end"])
                require(ref["excerpt_sha256"] == digest(text.encode()) and ref["source_requirement_relation"] == row["semantic_relation"], f"evidence digest {row['review_id']}")
                joined.append(text)
            evidence = "\n".join(joined)
            require(row["covered_requirement_atom_ids"] == [a["atom_id"] for a in row["covered_requirement_atoms"]], f"atom order {row['review_id']}")
            verify_atom_provenance(row, requirement, evidence)
            if row["role_kind"] == "requirement":
                require(row["semantic_link_status"] == "confirmed" and row["semantic_relation"] == "same_requirement_id_exact_source_contract_not_implementation", f"requirement contract {row['review_id']}")
                require(row["source_statement_text"] in evidence and all(span in evidence for span in row["source_text_spans"]), f"exact source {row['review_id']}")
                require(any(ref["archive_path"].endswith("requirements.json") for ref in row["evidence_refs"]) and any(ref["archive_path"].endswith("infinity-loop-platform-requirements.md") for ref in row["evidence_refs"]), f"IR/raw anchors {row['review_id']}")
            else:
                require(row["semantic_link_status"] == "unresolved" and row["counterevidence"] and any("実装" in x and "実行" in x for x in row["counterevidence"]), f"candidate limitation {row['review_id']}")
                for binding in row["evidence_atom_bindings"]:
                    verify_binding(row, binding, selected_excerpt(row, binding))

    # Shared atoms are retained on both sides while product authority remains pending.
    h23 = by_unit["IRUNIT-HIL-BR-23-HELIX-HARNESS"][0]["covered_requirement_atoms"]
    o23 = by_unit["IRUNIT-HIL-BR-23-HELIX-OS"][0]["covered_requirement_atoms"]
    require(h23[-1]["text"] == o23[0]["text"] == "Template Gap Issueとして改善loopへ戻す", "BR23 shared atom")
    h24 = by_unit["IRUNIT-HIL-BR-24-HELIX-HARNESS"][0]["covered_requirement_atoms"]
    o24 = by_unit["IRUNIT-HIL-BR-24-HELIX-OS"][0]["covered_requirement_atoms"]
    require(h24[0]["text"] == o24[0]["text"] and "revisionを一つの履歴へ結ぶ" in h24[2]["text"] and o24[1]["text"] == "revisionを一つの履歴へ結ぶ", "BR24 shared atoms")

    # BR24-OS has no direct phase or candidate pool; missing evidence is explicit.
    os24 = by_unit["IRUNIT-HIL-BR-24-HELIX-OS"]
    require(len(os24) == 1 and all(row["role_kind"] == "requirement" for row in os24), "BR24-OS no false asset edges")
    require(meta["phase_rows"]["IRUNIT-HIL-BR-24-HELIX-OS"] == [] and meta["bounded_search_receipts"]["IRUNIT-HIL-BR-24-HELIX-OS"]["phase_pool_asset_count"] == 0, "BR24-OS empty phase/pool")
    missing = meta["missing_evidence_receipts"]
    require({(x["role_kind"], x["unit_candidate_id"]) for x in missing} == {("design", "IRUNIT-HIL-BR-24-HELIX-OS"), ("implementation_source", "IRUNIT-HIL-BR-24-HELIX-OS")}, "BR24-OS missing receipts")

    # Stale anchors and missing mappings fail closed.
    controlled = next(row for row in rows if row["role_kind"] == "design")
    binding = controlled["evidence_atom_bindings"][0]
    bad = deepcopy(binding)
    bad["source_fragment_anchors"] = ["stale-anchor"]
    try:
        verify_binding(controlled, bad, selected_excerpt(controlled, binding))
    except AssertionError:
        pass
    else:
        fail("stale anchor accepted")
    bad = deepcopy(binding)
    bad["anchor_evidence_terms"] = {}
    try:
        verify_binding(controlled, bad, selected_excerpt(controlled, binding))
    except AssertionError:
        pass
    else:
        fail("missing anchor mapping accepted")

    injected_row = dict(next(row for row in rows if row["review_id"] == "LSRW19-EDGE-002"))
    injected_row["merge_admission"] = "granted"
    try:
        verify_row_fields(injected_row)
    except AssertionError:
        pass
    else:
        fail("negative row admission claim accepted")

    requirement_row = next(row for row in rows if row["role_kind"] == "requirement")
    requirement_excerpt = selected_excerpt(requirement_row, {"evidence_ref_indexes": list(range(len(requirement_row["evidence_refs"])))})
    tampered_requirement = deepcopy(requirement_row)
    tampered_requirement["source_statement_text"] = ""
    try:
        verify_atom_provenance(tampered_requirement, tampered_requirement, requirement_excerpt)
    except AssertionError:
        pass
    else:
        fail("negative requirement atom grounding accepted")

    candidate_row = next(row for row in rows if row["role_kind"] == "design")
    source_requirement = next(row for row in rows if row["unit_candidate_id"] == candidate_row["unit_candidate_id"] and row["role_kind"] == "requirement")
    tampered_candidate = deepcopy(candidate_row)
    tampered_candidate["covered_requirement_atoms"][0]["text"] = "candidate-only atom text"
    try:
        verify_atom_provenance(tampered_candidate, source_requirement, "")
    except AssertionError:
        pass
    else:
        fail("negative candidate atom equality accepted")

    for unit, receipt in meta["bounded_search_receipts"].items():
        require(receipt["catalog_record_count"] == len(catalog), f"catalog count {unit}")
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
        require(receipt["selected_asset_ids"] == expected and set(expected) <= set(ids), f"selected receipt {unit}")
        remaining = sorted(set(ids) - set(expected))
        require(receipt["unreviewed_asset_count"] == len(remaining) and receipt["unreviewed_asset_ids_sha256"] == canonical(remaining), f"remaining receipt {unit}")

    for aggregate in meta["unit_aggregates"]:
        unit = aggregate["unit_candidate_id"]
        require(unit in UNITS and aggregate["consumer_closure_status"] == "pending" and aggregate["current_requirement_implementation_status"] == "not_established" and aggregate["new_build_allowed"] is False, f"aggregate boundary {unit}")
        require(aggregate["direct_confirmed_implementation_asset_ids"] == [] and aggregate["phase_authority_status"] == "candidate_unchanged", f"aggregate implementation {unit}")

    print("Wave19 static schema10 verification: PASS")


if __name__ == "__main__":
    verify()
