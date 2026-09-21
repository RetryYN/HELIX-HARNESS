#!/usr/bin/env python3
"""Wave22 schema10 research-premise verifier.

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
LEDGER = ROOT / "docs/governance/legacy-requirement-direct-semantic-review-wave22.jsonl"
META = ROOT / "docs/governance/legacy-requirement-direct-semantic-review-wave22.meta.json"
CATALOG = ROOT / "docs/governance/legacy-asset-phase-product-classification-bootstrap.jsonl"
CROSSWALK = ROOT / "docs/governance/legacy-requirement-implementation-crosswalk-bootstrap.jsonl"
DECOMPOSITION = ROOT / "docs/governance/legacy-ir-product-unit-decomposition-bootstrap.jsonl"
REQ_IR = ARCHIVE / "requirements-ir/requirements.json"
BATCH = "LEGACY-SEMANTIC-WAVE22-2026-09-21"
PARENT = "bc5aef4726ad979c10c34a43557025e77f1c25d6"
MAIN_MERGE_PARENTS = ["5fcdc80f23c0fb3e959293b9fbd751fa31eeb792", "75cdab971129c9b25830860059c8c6fadaca38b2"]
WAVE18_EXACT = "e40f7f778117864dc2271af323977ca6e4fd1e4c"
WAVE19_EXACT = "609338f19a6189b76f4e03a39fa0a2823ffadbf6"
WAVE20_EXACT = "68ab10163fe0b6025dd56fa5d34cd476f6110494"
WAVE20_PARENT = "d9d1f3d8c9521314ba6ec73d9d877390defaf00c"
WAVE20_SOURCE_BASE = "9573119070cdf8f1f70e368bc310f575e8a3538c"
CURRENT_SOURCE_BASE = "bc5aef4726ad979c10c34a43557025e77f1c25d6"
WAVE16_EXACT = "74bfd04f7aa2384e1e30856ec6c29282b764e8c5"
WAVE17_EXACT = "cd88a4e24bc95613548edc17076b9a1d3dceb538"
SOURCE_BASE = "6dad906ed9a52c9e49611931645db2f298c6bf6a"
REQ_SHA = "80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688"
UNITS = [
    "IRUNIT-HIL-BR-31-HELIX-OS",
    "IRUNIT-HIL-BR-32-HELIX-OS",
    "IRUNIT-HIL-BR-33-HELIX-HARNESS",
]
SELECTED = {
    "IRUNIT-HIL-BR-31-HELIX-OS": {"LEGACY-ASSET-A60CF91DD2AF6693E6F9", "LEGACY-ASSET-09F4CAA4129F5DF63C5E", "LEGACY-ASSET-63CA5B35FD7F7873B06C"},
    "IRUNIT-HIL-BR-32-HELIX-OS": {"LEGACY-ASSET-A60CF91DD2AF6693E6F9", "LEGACY-ASSET-7795E6A5C8D14603031D", "LEGACY-ASSET-8E94EB9298BDD0A9C52E"},
    "IRUNIT-HIL-BR-33-HELIX-HARNESS": {"LEGACY-ASSET-A60CF91DD2AF6693E6F9", "LEGACY-ASSET-8195605FB59B8B837EFF", "LEGACY-ASSET-429C4F8FB5B0332F798C"},
}
REQ_DIGESTS = {
    "HIL-BR-31": "sha256:5de1a74038ae72cb30e6f61fa68bc6d3085dc88a57d6d1c778dc42c78aff7d20",
    "HIL-BR-32": "sha256:78f34c71dbf6c0d4ad87aaea5e2275eb3cc3401fd8fcf6c567000754603563ac",
    "HIL-BR-33": "sha256:758e2ea4f82c6c068d8c8ac633a7f092573c01c078a8293e81ded4bc70eaa5ef",
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
MISSING_RECEIPT_FIELDS = {
    "candidate_asset_count", "candidate_asset_ids_sha256", "direct_phase_candidates",
    "phase_pool_asset_count", "phase_pool_asset_ids_sha256", "reason", "search_mode",
    "searched_root", "searched_terms", "selected_asset_ids", "selection_basis",
    "unit_candidate_id", "role_kind", "unreviewed_asset_count", "unreviewed_asset_ids_sha256",
}
EXPECTED_INPUT_PATHS = {
    "archive/legacy-generation-2026-09-14/MANIFEST.sha256",
    "docs/governance/legacy-asset-phase-product-classification-bootstrap.jsonl",
    "docs/governance/legacy-ir-product-unit-decomposition-bootstrap.jsonl",
    "docs/governance/legacy-requirement-implementation-crosswalk-bootstrap.jsonl",
    "docs/governance/phase-capability-inventory.json",
} | {
    f"docs/governance/legacy-requirement-direct-semantic-review-wave{wave}.{suffix}"
    for wave in range(1, 22)
    for suffix in ("jsonl", "meta.json")
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


def source_span_window(row: dict, atom: dict) -> str:
    """Return the exact source window covered by an atom's pinned unit spans."""
    source = row["source_statement_text"]
    spans = row["source_text_spans"]
    indexes = atom["source_span_indexes"]
    require(indexes == list(range(indexes[0], indexes[-1] + 1)), f"source span continuity {row['review_id']}:{atom['atom_id']}")
    cursor = 0
    positions = []
    for span in spans:
        start = source.find(span, cursor)
        require(start >= cursor, f"source span order {row['review_id']}:{atom['atom_id']}")
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
    require(set(mapping) <= set(binding["source_fragment_anchors"]), f"anchor map scope {row['review_id']}")
    source_window = source_span_window(row, atom)
    for anchor in binding["source_fragment_anchors"]:
        require(anchor in atom["text"] and anchor in source_window, f"atom anchor {row['review_id']}")
        if anchor not in joined:
            terms = mapping.get(anchor, [])
            require(terms and all(term in binding["required_terms"] and term in joined for term in terms), f"excerpt anchor {row['review_id']}")
    require(all(term in joined for term in binding["required_terms"]), f"binding term {row['review_id']}")


def verify_missing_receipt(receipt: dict, search: dict, candidate: dict, crosswalk: dict) -> None:
    require(set(receipt) == MISSING_RECEIPT_FIELDS, f"missing receipt fields {receipt.get('role_kind')}")
    pool = crosswalk["candidate_asset_pool"]
    pool_ids = sorted(pool["phase_and_product_candidate_asset_ids"])
    require(receipt["unit_candidate_id"] == candidate["unit_candidate_id"], "missing receipt unit")
    require(receipt["searched_terms"] == search["query"]["anchors"], "missing receipt terms")
    require(receipt["search_mode"] == "bounded_catalog_anchor_candidate_search_not_archive_absence", "missing receipt search mode")
    require(receipt["searched_root"] == (
        "asset_catalog_source_paths_under:archive/legacy-generation-2026-09-14/root "
        "(bounded anchor search; not archive-wide absence claim)"
    ), "missing receipt search root")
    require(receipt["candidate_asset_count"] == search["candidate_asset_count"], "missing receipt candidate count")
    require(receipt["candidate_asset_ids_sha256"] == search["candidate_asset_ids_sha256"], "missing receipt candidate digest")
    require(receipt["selected_asset_ids"] == search["selected_asset_ids"], "missing receipt selected ids")
    require(receipt["unreviewed_asset_count"] == search["unreviewed_asset_count"] == 2649, "missing receipt unreviewed count")
    require(receipt["unreviewed_asset_ids_sha256"] == search["unreviewed_asset_ids_sha256"], "missing receipt unreviewed digest")
    require(receipt["direct_phase_candidates"] == candidate["direct_phase_candidates"] == [], "missing receipt direct phase")
    require(receipt["phase_pool_asset_count"] == pool["phase_and_product_candidate_asset_count"] == 0, "missing receipt phase pool")
    require(receipt["phase_pool_asset_ids_sha256"] == canonical(pool_ids), "missing receipt phase pool digest")
    require(receipt["selection_basis"] == "direct_phase_candidates_empty_and_crosswalk_phase_product_candidate_pool_empty", "missing receipt selection basis")
    require(str(search["candidate_asset_count"]) in receipt["reason"] and str(search["unreviewed_asset_count"]) in receipt["reason"], "missing receipt reason counts")
    require("direct phase candidates=[]" in receipt["reason"] and "phase_and_product_candidate_asset_count=0" in receipt["reason"], "missing receipt reason basis")


def expected_prior_review_batches() -> list[dict]:
    expected = []
    for wave in range(1, 16):
        ledger = ROOT / f"docs/governance/legacy-requirement-direct-semantic-review-wave{wave}.jsonl"
        meta = ROOT / f"docs/governance/legacy-requirement-direct-semantic-review-wave{wave}.meta.json"
        prior_meta = json.loads(meta.read_text())
        expected.append({"batch_id": prior_meta["batch_id"], "ledger_sha256": file_digest(ledger), "meta_sha256": file_digest(meta)})
    for wave, ref, _parent, extra in (
        (16, WAVE16_EXACT, SOURCE_BASE, {"candidate_ref": WAVE16_EXACT, "merge_base": SOURCE_BASE}),
        (17, WAVE17_EXACT, WAVE16_EXACT, {"commit_ref": WAVE17_EXACT, "parent_revision": WAVE16_EXACT, "source_main_base_revision": SOURCE_BASE}),
        (18, WAVE18_EXACT, WAVE17_EXACT, {"commit_ref": WAVE18_EXACT, "parent_revision": WAVE17_EXACT, "source_main_base_revision": SOURCE_BASE}),
        (19, WAVE19_EXACT, WAVE18_EXACT, {"commit_ref": WAVE19_EXACT, "parent_revision": WAVE18_EXACT, "source_main_base_revision": SOURCE_BASE}),
        (20, WAVE20_EXACT, WAVE20_PARENT, {"commit_ref": WAVE20_EXACT, "parent_revision": WAVE20_PARENT, "source_main_base_revision": WAVE20_SOURCE_BASE}),
        (21, "418500321edbc8bc3c45f4d8d0d8c994de9f7597", "053943791ceda83366fca01d375308ba5f7deb28", {"commit_ref": "418500321edbc8bc3c45f4d8d0d8c994de9f7597", "parent_revision": "053943791ceda83366fca01d375308ba5f7deb28", "source_main_base_revision": "053943791ceda83366fca01d375308ba5f7deb28"}),
    ):
        ledger = ROOT / f"docs/governance/legacy-requirement-direct-semantic-review-wave{wave}.jsonl"
        meta = ROOT / f"docs/governance/legacy-requirement-direct-semantic-review-wave{wave}.meta.json"
        prior_meta = json.loads(meta.read_text())
        require(prior_meta["output_sha256"] == file_digest(ledger), f"prior {wave} ledger receipt")
        item = {"batch_id": prior_meta["batch_id"], "ledger_sha256": file_digest(ledger), "meta_sha256": file_digest(meta)}
        item.update(extra)
        expected.append(item)
    return expected


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
            span_indexes = atom.get("source_span_indexes")
            source_spans = requirement["source_text_spans"]
            require(
                isinstance(span_indexes, list)
                and span_indexes == sorted(set(span_indexes))
                and span_indexes
                and all(type(index) is int and 0 <= index < len(source_spans) for index in span_indexes)
                and atom["source_fragments"] == [source_spans[index] for index in span_indexes],
                f"requirement atom source span binding {row['review_id']}:{atom['atom_id']}",
            )
            require(
                atom["source_fragments"]
                and all(
                    fragment in row["source_statement_text"] and fragment in requirement_excerpt
                    for fragment in atom["source_fragments"]
                ),
                f"requirement atom source grounding {row['review_id']}:{atom['atom_id']}",
            )
            require(
                atom["text"] in row["source_statement_text"] and atom["text"] in requirement_excerpt,
                f"requirement atom literal source {row['review_id']}:{atom['atom_id']}",
            )


def verify_row_fields(row: dict) -> None:
    require(set(row) == ROW_FIELDS, f"row fields {row['review_id']}")


def verify_missing_receipts(missing: list[dict], by_unit: dict, decomposition: dict, crosswalk: dict, searches: dict) -> None:
    expected = {
        (unit, role)
        for unit, rows in by_unit.items()
        for role in ("design", "implementation_source")
        if not any(row["role_kind"] == role for row in rows)
    }
    require(isinstance(missing, list) and all(isinstance(item, dict) for item in missing), "missing receipts shape")
    actual = [(item.get("unit_candidate_id"), item.get("role_kind")) for item in missing]
    require(len(actual) == len(set(actual)) and set(actual) == expected, "missing receipts role closure")
    for receipt in missing:
        unit = receipt["unit_candidate_id"]
        require(unit in by_unit, "missing receipt unknown unit")
        _parent, candidate = decomposition[unit]
        verify_missing_receipt(receipt, searches[unit], candidate, crosswalk[unit])


def verify_br33_harness_boundary(rows_by_unit: dict[str, list[dict]], holds: list[dict]) -> None:
    """Keep the unreviewed BR33 HARNESS clause bounded while OS is prior-reviewed."""
    unit = "IRUNIT-HIL-BR-33-HELIX-HARNESS"
    for row in rows_by_unit[unit]:
        require(row["atomization_hold"] == "source_atomization_review_pending;product_boundary_pending_human_decision", f"BR33 boundary hold {row['review_id']}")
        require(row["connection_records"] == [], f"BR33 connector invention {row['review_id']}")
    hold = next(item for item in holds if item.get("unit_candidate_id") == unit)
    require(hold["row_atomization_hold"] == rows_by_unit[unit][0]["atomization_hold"], "BR33 meta boundary hold")
    require(hold["shared_atom_ids"] == [] and "connector_gap_records" not in hold, "BR33 shared/connector closure")
    atoms = rows_by_unit[unit][0]["covered_requirement_atoms"]
    require([a["atom_id"] for a in atoms] == ["BR33-HARNESS-A01"] and atoms[0]["shared_with_units"] == [], "BR33 HARNESS atom boundary")


def prior_assets_and_edges() -> tuple[set[tuple[str, str]], set[str], set[str]]:
    edges: set[tuple[str, str]] = set()
    assets: set[str] = set()
    units: set[str] = set()
    for wave in range(1, 22):
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

    require(set(meta) == META_FIELDS, "meta fields")
    require(len(rows) == 9 and meta["record_count"] == 9, "record count")
    require(meta["schema_revision"] == 10 and meta["batch_id"] == BATCH, "schema/batch")
    require(meta["parent_revision"] == PARENT and meta["stacked_pr_parent_revision"] == PARENT, "stacked parent")
    require(meta["main_merge_revision"] == PARENT and meta["main_merge_parents"] == MAIN_MERGE_PARENTS, "main merge lineage")
    require(meta["wave18_exact_head"] == WAVE18_EXACT and meta["wave18_candidate_ref"] == WAVE18_EXACT, "Wave18 exact head")
    require(meta["wave19_exact_head"] == WAVE19_EXACT and meta["wave19_candidate_ref"] == WAVE19_EXACT, "Wave19 exact head")
    require(meta["wave20_exact_head"] == WAVE20_EXACT and meta["wave20_candidate_ref"] == WAVE20_EXACT and meta["wave20_candidate_parent"] == WAVE20_PARENT, "Wave20 exact head")
    require(meta["source_main_base_revision"] == CURRENT_SOURCE_BASE, "source base is explicit")
    require(meta["reviewed_unit_ids"] == UNITS, "unit order")
    require([row["review_id"] for row in rows] == [f"LSRW22-EDGE-{i:03d}" for i in range(1, 10)], "review order")
    require(meta["output_sha256"] == file_digest(LEDGER), "ledger digest")
    require(meta["semantic_link_counts"] == {"confirmed": 3, "rejected": 0, "unresolved": 6}, "semantic counts")
    require(meta["authority_effect"] == "none" and meta["consumer_closure_status"] == "pending", "meta authority")
    require(meta["legacy_execution_performed"] is False and meta["new_build_allowed"] is False, "meta execution")
    require(file_digest(REQ_IR).removeprefix("sha256:") == REQ_SHA, "requirement digest")
    for row in rows:
        verify_row_fields(row)

    require(meta["prior_review_batches"] == expected_prior_review_batches(), "prior review batches exact")
    require(set(meta["inputs"]) == EXPECTED_INPUT_PATHS, "input path set")
    for name, value in meta["inputs"].items():
        path = ROOT / name
        require(path.is_file() and file_digest(path) == value, f"input digest {name}")

    current_edges = {(row["unit_candidate_id"], row["asset_id"]) for row in rows}
    expected_edges = {(unit, aid) for unit, aids in SELECTED.items() for aid in aids}
    require(current_edges == expected_edges, "selected edges")
    prior_edges, prior_assets, prior_units = prior_assets_and_edges()
    require(not current_edges & prior_edges, "prior edge overlap")
    require(not ({row["asset_id"] for row in rows if row["role_kind"] != "requirement"} & prior_assets), "prior asset overlap")
    require(len(prior_units | set(UNITS)) == 70, "unit cumulative count")
    require(len(prior_edges | current_edges) == 207, "edge cumulative count")
    require(meta["cumulative_reviewed_unit_count"] == 70 and meta["cumulative_reviewed_edge_count"] == 207 and meta["remaining_unit_count"] == 148, "cumulative receipt")

    require(meta["wave18_candidate_input_digests"]["docs/governance/legacy-requirement-direct-semantic-review-wave18.jsonl"] == file_digest(ROOT / "docs/governance/legacy-requirement-direct-semantic-review-wave18.jsonl"), "wave18 ledger pin")

    by_unit = {unit: [row for row in rows if row["unit_candidate_id"] == unit] for unit in UNITS}
    verify_br33_harness_boundary(by_unit, meta["source_atomization_holds"])
    verify_missing_receipts(meta["missing_evidence_receipts"], by_unit, decomposition, crosswalk, meta["bounded_search_receipts"])
    for unit, unit_rows in by_unit.items():
        require(unit_rows, f"unit rows {unit}")
        parent, candidate = decomposition[unit]
        requirement = unit_rows[0]
        req = parent["source_requirement_id"]
        require(requirement["role_kind"] == "requirement" and requirement["source_requirement_id"] == req, f"requirement row {unit}")
        require(candidate["unit_kind"] == "product_unit" and candidate["product_target"] == requirement["product_scope"][0], f"unit product {unit}")
        require(requirement["phase_candidates"] == candidate["direct_phase_candidates"] and requirement["source_text_spans"] == candidate["source_text_spans"], f"decomposition join {unit}")
        require(crosswalk[unit]["direct_phase_candidates"] == requirement["phase_candidates"], f"crosswalk direct phase join {unit}")
        require(requirement["source_statement_semantic_digest"] == REQ_DIGESTS[req], f"source semantic digest {unit}")
        require(meta["phase_rows"][unit] == phase_projection(crosswalk[unit]), f"phase rows {unit}")
        pool = crosswalk[unit]["candidate_asset_pool"]
        pool_ids = sorted(pool["phase_and_product_candidate_asset_ids"])
        require(meta["bounded_search_receipts"][unit]["phase_pool_asset_count"] == pool["phase_and_product_candidate_asset_count"], f"crosswalk phase pool count {unit}")
        require(meta["bounded_search_receipts"][unit]["phase_pool_asset_ids_sha256"] == canonical(pool_ids), f"crosswalk phase pool digest {unit}")
        product_hold = next((hold for hold in meta["source_atomization_holds"] if hold.get("unit_candidate_id") == unit and hold.get("status") == "product_boundary_shared_atom_hold"), None)
        require(product_hold is not None and product_hold["row_atomization_hold"] == requirement["atomization_hold"], f"row atomization hold link {unit}")
        requirement_atom_ids = {atom["atom_id"] for atom in requirement["covered_requirement_atoms"]}
        require(set(product_hold["shared_atom_ids"]) <= requirement_atom_ids, f"shared atom hold provenance {unit}")
        require(all(row["atomization_hold"] == requirement["atomization_hold"] for row in unit_rows), f"unit row atomization hold {unit}")
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

    # Shared source atoms retain reciprocal product links; connective clauses stay complete.
    for unit in UNITS:
        requirement = by_unit[unit][0]
        atoms = {atom["atom_id"]: atom for atom in requirement["covered_requirement_atoms"]}
        hold = next((h for h in meta["source_atomization_holds"] if h.get("unit_candidate_id") == unit and h.get("status") == "product_boundary_shared_atom_hold"), None)
        require(hold is not None and set(hold["shared_atom_ids"]) == {a["atom_id"] for a in requirement["covered_requirement_atoms"] if a["shared_with_units"]}, f"shared hold closure {unit}")
        for atom in requirement["covered_requirement_atoms"]:
            for peer in atom["shared_with_units"]:
                peer_atoms = {a["atom_id"]: a for a in by_unit[peer][0]["covered_requirement_atoms"]}
                require(any(a["text"] == atom["text"] for a in peer_atoms.values()), f"shared atom text {unit}")
        if unit == "IRUNIT-HIL-BR-29-HELIX-HARNESS":
            require(atoms["BR29-HARNESS-A02"]["text"] == "候補skillはshadow評価と独立reviewを経るまで判断gateの強制規則へ昇格しない。", "BR29 HARNESS connective atom")
        if unit == "IRUNIT-HIL-BR-29-HELIX-OS":
            require(atoms["BR29-OS-A01"]["text"] == "候補skillはshadow評価と独立reviewを経るまで判断gateの強制規則へ昇格しない。", "BR29 OS connective atom")
        if unit == "IRUNIT-HIL-BR-30-HELIX-HARNESS":
            require(atoms["BR30-HARNESS-A02"]["text"] == "専門化の根拠がないagent増殖を避け、worker/verifier/authority分離、最小context、tool/path権限、budget、停止条件を生成時に拘束する。", "BR30 HARNESS connective atom")
        if unit == "IRUNIT-HIL-BR-30-HELIX-OS":
            require(atoms["BR30-OS-A02"]["text"] == "専門化の根拠がないagent増殖を避け、worker/verifier/authority分離、最小context、tool/path権限、budget、停止条件を生成時に拘束する。", "BR30 OS connective atom")

    # Keep the inherited fail-close gates live as each wave's verifier evolves.
    def rejected(label: str, operation) -> None:
        try:
            operation()
        except AssertionError:
            return
        fail(f"negative case accepted: {label}")

    controlled = next(row for row in rows if row["role_kind"] == "design" and row["evidence_atom_bindings"])
    binding = controlled["evidence_atom_bindings"][0]
    bad = deepcopy(binding); bad["source_fragment_anchors"] = ["stale-anchor"]
    rejected("stale anchor", lambda: verify_binding(controlled, bad, selected_excerpt(controlled, binding)))
    bad = deepcopy(binding); bad["anchor_evidence_terms"] = {}
    rejected("missing anchor mapping", lambda: verify_binding(controlled, bad, selected_excerpt(controlled, binding)))
    rejected("unselected excerpt", lambda: verify_binding(controlled, binding, "unrelated excerpt"))
    injected_row = deepcopy(controlled); injected_row["merge_admission"] = "granted"
    rejected("row admission claim", lambda: verify_row_fields(injected_row))
    requirement_row = next(row for row in rows if row["role_kind"] == "requirement")
    requirement_excerpt = selected_excerpt(requirement_row, {"evidence_ref_indexes": list(range(len(requirement_row["evidence_refs"])))})
    tampered_requirement = deepcopy(requirement_row); tampered_requirement["source_statement_text"] = ""
    rejected("requirement atom grounding", lambda: verify_atom_provenance(tampered_requirement, tampered_requirement, requirement_excerpt))
    tampered_candidate = deepcopy(controlled); tampered_candidate["covered_requirement_atoms"][0]["text"] = "candidate-only atom text"
    source_requirement = by_unit[controlled["unit_candidate_id"]][0]
    rejected("candidate atom provenance", lambda: verify_atom_provenance(tampered_candidate, source_requirement, ""))
    os_requirement = by_unit["IRUNIT-HIL-BR-31-HELIX-OS"][0]
    tampered_os_requirement = deepcopy(os_requirement)
    tampered_os_requirement["covered_requirement_atoms"][0]["text"] = "任意のworker採用を実行してよい"
    os_requirement_excerpt = selected_excerpt(os_requirement, {"evidence_ref_indexes": list(range(len(os_requirement["evidence_refs"])))})
    rejected("forged reconstructed requirement atom", lambda: verify_atom_provenance(tampered_os_requirement, os_requirement, os_requirement_excerpt))
    forged_missing = [{"unit_candidate_id": UNITS[0], "role_kind": "implementation_source", "reason": "archive全体に存在しない", "searched_terms": ["ZZZ"], "searched_root": "archive/legacy-generation-2026-09-14/root"}]
    rejected("forged missing receipt", lambda: verify_missing_receipts(forged_missing, by_unit, decomposition, crosswalk, meta["bounded_search_receipts"]))

    for unit, receipt in meta["bounded_search_receipts"].items():
        require(receipt["catalog_record_count"] == len(catalog), f"catalog count {unit}")
        require(receipt["query"] == by_unit[unit][0]["bounded_search_query"], f"receipt query {unit}")
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

    print("Wave22 static schema10 verification: PASS")


if __name__ == "__main__":
    verify()
