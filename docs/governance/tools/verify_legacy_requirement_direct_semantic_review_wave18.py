#!/usr/bin/env python3
"""Wave18 schema10 research-premise verifier.

旧archiveは静的read-onlyで参照する。runtime、test、hook、CI、adapterは実行しない。
Wave16/17は現行stacked treeのledger/metaを固定SHA mapで読み、浅いcloneでも再現可能な形で要求source・asset・crosswalk・phaseのidentityと未解決境界を検査する。
"""
from __future__ import annotations

import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
ARCHIVE = ROOT / "archive/legacy-generation-2026-09-14/root"
LEDGER = ROOT / "docs/governance/legacy-requirement-direct-semantic-review-wave18.jsonl"
META = ROOT / "docs/governance/legacy-requirement-direct-semantic-review-wave18.meta.json"
CATALOG = ROOT / "docs/governance/legacy-asset-phase-product-classification-bootstrap.jsonl"
CROSSWALK = ROOT / "docs/governance/legacy-requirement-implementation-crosswalk-bootstrap.jsonl"
DECOMPOSITION = ROOT / "docs/governance/legacy-ir-product-unit-decomposition-bootstrap.jsonl"
REQ_IR = ARCHIVE / "requirements-ir/requirements.json"
RAW_REQ = ARCHIVE / "docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md"
REV = "6dad906ed9a52c9e49611931645db2f298c6bf6a"
W16 = "74bfd04f7aa2384e1e30856ec6c29282b764e8c5"
W17 = "cd88a4e24bc95613548edc17076b9a1d3dceb538"
WAVE16_INPUT_DIGESTS = {
    "docs/governance/legacy-requirement-direct-semantic-review-wave16.jsonl": "sha256:dccec0a2a8f3f6f64bbd3cee2f43680d8bfc3447e2ad392c2f690625322288f6",
    "docs/governance/legacy-requirement-direct-semantic-review-wave16.meta.json": "sha256:31392b688592d2087cfe3bd7309ebbb7fcf86baa3a5135441f0c61f56cd3fad3",
}
WAVE17_INPUT_DIGESTS = {
    "docs/governance/legacy-requirement-direct-semantic-review-wave17.jsonl": "sha256:85a32507150f1a1658aff45c5e2d3a2213f3b229ccf10fedffce5ef0c02bafac",
    "docs/governance/legacy-requirement-direct-semantic-review-wave17.meta.json": "sha256:aa0ed16c81f52526c60d7d3013ed93a18e644335cda154a31215cd98ff4a11e3",
}
BATCH = "LEGACY-SEMANTIC-WAVE18-2026-09-21"
REQ_SHA = "80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688"
UNITS = [
    "IRUNIT-HIL-BR-17-HELIX-OS",
    "IRUNIT-HIL-BR-18-HELIX-OS",
    "IRUNIT-HIL-BR-19-HELIX-HARNESS",
    "IRUNIT-HIL-BR-19-HELIX-OS",
]
ASSETS = {
    "IRUNIT-HIL-BR-17-HELIX-OS": {
        "LEGACY-ASSET-A60CF91DD2AF6693E6F9",
        "LEGACY-ASSET-1BE290A45D9095E0F803",
        "LEGACY-ASSET-7188688E58AC57AF27CC",
    },
    "IRUNIT-HIL-BR-18-HELIX-OS": {
        "LEGACY-ASSET-A60CF91DD2AF6693E6F9",
        "LEGACY-ASSET-D4E9C31E6AE7D18CA11D",
        "LEGACY-ASSET-1C71A99A33A288FF901D",
    },
    "IRUNIT-HIL-BR-19-HELIX-HARNESS": {
        "LEGACY-ASSET-A60CF91DD2AF6693E6F9",
        "LEGACY-ASSET-F54C515C9BB8965C1F4A",
        "LEGACY-ASSET-F38F4C78F60DF814428A",
    },
    "IRUNIT-HIL-BR-19-HELIX-OS": {
        "LEGACY-ASSET-A60CF91DD2AF6693E6F9",
        "LEGACY-ASSET-F54C515C9BB8965C1F4A",
        "LEGACY-ASSET-4AB89A46AE3C74CD5584",
    },
}
REQ_DIGESTS = {
    "HIL-BR-17": "sha256:e55bdf0ac2daabc541038f11887fd2099993870993dc131097955ca9f817c1a1",
    "HIL-BR-18": "sha256:e13f07c964cce52474bd87f8b2dc688e0c80e5c142260b32e2086886be523db8",
    "HIL-BR-19": "sha256:95d7e1242d77cdba8ed1447e36382caf4e23413b6d5a3d40241feffa5a6521d1",
}


def fail(message: str) -> None:
    raise AssertionError(message)


def require(condition: bool, message: str) -> None:
    if not condition:
        fail(message)


def sha_bytes(data: bytes) -> str:
    return "sha256:" + hashlib.sha256(data).hexdigest()


def sha_file(path: Path) -> str:
    return sha_bytes(path.read_bytes())


def canonical(value: object) -> str:
    return sha_bytes(json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode())


def read_jsonl(path: Path) -> list[dict]:
    return [json.loads(line) for line in path.read_text().splitlines() if line.strip()]


def read_jsonl_bytes(data: bytes) -> list[dict]:
    return [json.loads(line) for line in data.decode().splitlines() if line.strip()]


def excerpt(path: Path, start: int, end: int) -> str:
    lines = path.read_text(errors="replace").splitlines()
    require(1 <= start <= end <= len(lines), f"excerpt bounds {path}:{start}-{end}")
    return "\n".join(lines[start - 1 : end])


def source_path(row: dict) -> Path:
    return ARCHIVE / row["source_path"]


def verify_controlled_binding(row: dict, binding: dict, joined: str) -> None:
    """Require controlled anchors to remain traceable through the full evidence chain."""
    atom = next(
        (item for item in row["covered_requirement_atoms"] if item["atom_id"] == binding["atom_id"]),
        None,
    )
    require(atom is not None, f"binding atom {row['review_id']}")
    require(binding["required_terms"] and binding["source_fragment_anchors"], f"binding terms {row['review_id']}")
    mapped = binding.get("anchor_evidence_terms", {})
    require(set(mapped) <= set(binding["source_fragment_anchors"]), f"anchor mapping scope {row['review_id']}")
    for anchor in binding["source_fragment_anchors"]:
        require(
            anchor in atom["text"] and any(anchor in fragment for fragment in atom["source_fragments"]),
            f"anchor atom grounding {row['review_id']}:{binding['atom_id']}",
        )
        if anchor in joined:
            continue
        mapped_terms = mapped.get(anchor, [])
        require(
            bool(mapped_terms)
            and all(term in binding["required_terms"] and term in joined for term in mapped_terms),
            f"anchor excerpt grounding {row['review_id']}:{binding['atom_id']}",
        )
    require(all(term in joined for term in binding["required_terms"]), f"required terms {row['review_id']}")


def expect_binding_failure(row: dict, binding: dict, joined: str, label: str) -> None:
    try:
        verify_controlled_binding(row, binding, joined)
    except AssertionError:
        return
    fail(f"negative binding case accepted: {label}")


def prior_sources() -> tuple[set[tuple[str, str]], set[tuple[str, str, str]], set[str]]:
    edges: set[tuple[str, str]] = set()
    assets: set[tuple[str, str, str]] = set()
    units: set[str] = set()
    for wave in range(1, 18):
        path = ROOT / f"docs/governance/legacy-requirement-direct-semantic-review-wave{wave}.jsonl"
        for row in read_jsonl(path):
            edges.add((row["unit_candidate_id"], row["asset_id"]))
            units.add(row["unit_candidate_id"])
            if row["artifact_evidence_kind"] != "requirement":
                assets.add((row["asset_id"], row["source_path"], row["source_sha256"]))
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
        for phase in crosswalk["phase_capability_evidence"]
    ]


def verify() -> None:
    rows = read_jsonl(LEDGER)
    meta = json.loads(META.read_text())
    catalog_rows = read_jsonl(CATALOG)
    catalog = {row["asset_id"]: row for row in catalog_rows}
    crosswalk = {row["unit_candidate_id"]: row for row in read_jsonl(CROSSWALK)}
    decomposition = {}
    for parent in read_jsonl(DECOMPOSITION):
        for candidate in parent.get("candidate_units", []):
            decomposition[candidate["unit_candidate_id"]] = (parent, candidate)

    require(len(rows) == 12 and meta["record_count"] == 12, "record count")
    require(meta["schema_revision"] == 10 and meta["batch_id"] == BATCH, "schema/batch")
    require(meta["parent_revision"] == W17 and meta["source_main_base_revision"] == REV and meta["stacked_pr_parent_revision"] == W17, "stacked/base revision")
    require(meta["source_revision"] == "legacy-generation-2026-09-14" and meta["current_tree_revision"] == W17, "source/tree revision")
    require(meta["reviewed_unit_ids"] == UNITS, "unit order")
    require([row["review_id"] for row in rows] == [f"LSRW18-EDGE-{i:03d}" for i in range(1, 13)], "review order")
    require(all(row["schema_revision"] == 10 and row["batch_id"] == BATCH for row in rows), "row identity")
    require(meta["output_sha256"] == sha_file(LEDGER), "ledger digest")
    require(meta["cumulative_reviewed_unit_count"] == 54 and meta["cumulative_reviewed_edge_count"] == 161 and meta["remaining_unit_count"] == 164, "cumulative counts")
    require(meta["semantic_link_counts"] == {"confirmed": 4, "rejected": 0, "unresolved": 8}, "semantic counts")
    require(not meta["legacy_execution_performed"] and not meta["new_build_allowed"], "authority boundary meta")
    require(len(catalog) == 4020, "catalog count")
    require(sha_file(REQ_IR).removeprefix("sha256:") == REQ_SHA, "requirement asset digest")

    current_edges = {(row["unit_candidate_id"], row["asset_id"]) for row in rows}
    expected_edges = {(unit, asset) for unit, assets in ASSETS.items() for asset in assets}
    require(current_edges == expected_edges and len(current_edges) == 12, "selected asset edges")
    prior_edges, prior_assets, prior_units = prior_sources()
    require(not current_edges & prior_edges, "prior edge overlap")
    current_nonreq = {(row["asset_id"], row["source_path"], row["source_sha256"]) for row in rows if row["role_kind"] != "requirement"}
    require(not current_nonreq & prior_assets, "prior nonrequirement asset overlap")
    require(len(prior_units | set(UNITS)) == 54, "unit cumulative set")
    require(len(prior_edges | current_edges) == 161, "edge cumulative set")

    # All prior ledger/meta bytes are current-tree inputs pinned by fixed digest maps.
    expected_inputs = {
        "archive/legacy-generation-2026-09-14/MANIFEST.sha256",
        "docs/governance/legacy-asset-phase-product-classification-bootstrap.jsonl",
        "docs/governance/legacy-requirement-implementation-crosswalk-bootstrap.jsonl",
        "docs/governance/legacy-ir-product-unit-decomposition-bootstrap.jsonl",
        "docs/governance/phase-capability-inventory.json",
    }
    expected_inputs.update(
        f"docs/governance/legacy-requirement-direct-semantic-review-wave{wave}.{suffix}"
        for wave in range(1, 18) for suffix in ("jsonl", "meta.json")
    )
    require(set(meta["inputs"]) == expected_inputs, "input path set")
    for name, digest in meta["inputs"].items():
        path = ROOT / name
        require(path.is_file() and sha_file(path) == digest, f"tree input digest {name}")
    require(meta["wave16_candidate_input_digests"] == WAVE16_INPUT_DIGESTS, "Wave16 fixed digest map")
    require(meta["wave17_candidate_input_digests"] == WAVE17_INPUT_DIGESTS, "Wave17 fixed digest map")
    require(meta["prior_fixed_input_digests"] == {"wave16": WAVE16_INPUT_DIGESTS, "wave17": WAVE17_INPUT_DIGESTS}, "prior fixed digest map")
    require(meta["wave16_candidate_ref"] == W16 and meta["wave16_candidate_merge_base"] == REV, "wave16 overlay receipt")
    require(meta["wave16_candidate_root"] == "current-tree:stacked-wave17", "wave16 current-tree root")
    require(meta["wave17_candidate_ref"] == W17 and meta["wave17_candidate_parent"] == W16, "wave17 stacked receipt")
    require(meta["wave17_candidate_root"] == "current-tree:wave17", "wave17 current-tree root")
    for wave, expected in ((16, WAVE16_INPUT_DIGESTS), (17, WAVE17_INPUT_DIGESTS)):
        ledger_path = ROOT / f"docs/governance/legacy-requirement-direct-semantic-review-wave{wave}.jsonl"
        meta_path = ROOT / f"docs/governance/legacy-requirement-direct-semantic-review-wave{wave}.meta.json"
        require(sha_file(ledger_path) == expected[str(ledger_path.relative_to(ROOT))], f"prior {wave} ledger fixed digest")
        require(sha_file(meta_path) == expected[str(meta_path.relative_to(ROOT))], f"prior {wave} meta fixed digest")
        prior_meta = json.loads(meta_path.read_text())
        require(prior_meta["output_sha256"] == sha_file(ledger_path), f"prior {wave} ledger receipt")
        require(prior_meta["parent_revision"] == REV, f"prior {wave} parent")
        require(prior_meta["cumulative_reviewed_unit_count"] == (47 if wave == 16 else 50), f"prior {wave} units")
        require(prior_meta["cumulative_reviewed_edge_count"] == (141 if wave == 16 else 149), f"prior {wave} edges")
    expected_prior = []
    for wave in range(1, 16):
        stem = ROOT / f"docs/governance/legacy-requirement-direct-semantic-review-wave{wave}"
        prior_meta = json.loads((stem.with_suffix(".meta.json")).read_text())
        expected_prior.append({"batch_id": prior_meta["batch_id"], "ledger_sha256": sha_file(stem.with_suffix(".jsonl")), "meta_sha256": sha_file(stem.with_suffix(".meta.json"))})
    expected_prior.append({"batch_id": "LEGACY-SEMANTIC-WAVE16-2026-09-21", "ledger_sha256": WAVE16_INPUT_DIGESTS["docs/governance/legacy-requirement-direct-semantic-review-wave16.jsonl"], "meta_sha256": WAVE16_INPUT_DIGESTS["docs/governance/legacy-requirement-direct-semantic-review-wave16.meta.json"], "candidate_ref": W16, "merge_base": REV})
    expected_prior.append({"batch_id": "LEGACY-SEMANTIC-WAVE17-2026-09-21", "ledger_sha256": WAVE17_INPUT_DIGESTS["docs/governance/legacy-requirement-direct-semantic-review-wave17.jsonl"], "meta_sha256": WAVE17_INPUT_DIGESTS["docs/governance/legacy-requirement-direct-semantic-review-wave17.meta.json"], "commit_ref": W17, "parent_revision": W16, "source_main_base_revision": REV})
    require(meta["prior_review_batches"] == expected_prior, "prior review batches exact")

    by_unit = {unit: [row for row in rows if row["unit_candidate_id"] == unit] for unit in UNITS}
    require(all(len(items) == 3 for items in by_unit.values()), "unit edge counts")
    for unit, unit_rows in by_unit.items():
        parent, candidate = decomposition[unit]
        requirement = next(row for row in unit_rows if row["role_kind"] == "requirement")
        req = requirement["source_requirement_id"]
        require(candidate["unit_kind"] == "product_unit", f"unit kind {unit}")
        require(candidate["product_target"] == requirement["product_scope"][0], f"product join {unit}")
        require(requirement["phase_candidates"] == candidate["direct_phase_candidates"], f"phase join {unit}")
        require(requirement["source_text_spans"] == candidate["source_text_spans"], f"decomposition spans {unit}")
        require(parent["source_requirement_id"] == req and parent["source_statement_semantic_digest"] == REQ_DIGESTS[req], f"requirement join {unit}")
        require(requirement["source_statement_semantic_digest"] == REQ_DIGESTS[req], f"source digest {unit}")
        require(requirement["product_alignment_status"] == "candidate_boundary_pending_human_decision" or requirement["product_alignment_status"] == "product_unit_semantic_candidate_boundary_pending", f"product boundary {unit}")
        require(unit in crosswalk and meta["phase_rows"][unit] == phase_projection(crosswalk[unit]), f"phase rows {unit}")
        require(meta["unit_aggregates"][[x["unit_candidate_id"] for x in meta["unit_aggregates"]].index(unit)]["reviewed_edge_count"] == 3, f"aggregate edge count {unit}")

        atom_ids = requirement["covered_requirement_atom_ids"]
        require(atom_ids == [atom["atom_id"] for atom in requirement["covered_requirement_atoms"]], f"atom order {unit}")
        require(all(row["covered_requirement_atoms"] == requirement["covered_requirement_atoms"] or set(row["covered_requirement_atom_ids"]).issubset(set(atom_ids)) for row in unit_rows), f"atom inventory {unit}")
        for row in unit_rows:
            require(row["source_requirement_id"] == req and row["product_scope"] == requirement["product_scope"], f"unit identity {row['review_id']}")
            require(row["phase_candidates"] == candidate["direct_phase_candidates"], f"row phases {row['review_id']}")
            require(row["authority_effect"] == "none" and row["consumer_closure_status"] == "pending", f"row authority {row['review_id']}")
            require(row["legacy_execution_status"] == "not_run" and row["current_requirement_implementation_status"] == "not_established", f"row execution {row['review_id']}")
            require(row["new_build_allowed"] is False and row["candidate_membership_semantics"] == "bounded_global_search_candidate_only_not_semantic_evidence", f"row admission {row['review_id']}")
            asset = catalog[row["asset_id"]]
            require(row["artifact_evidence_kind"] == asset["artifact_evidence_kind"] == row["role_kind"], f"asset kind {row['review_id']}")
            require(row["classification_id"] == asset["classification_id"], f"classification {row['review_id']}")
            require(row["candidate_phase_targets"] == asset["candidate_phase_targets"], f"candidate phase {row['review_id']}")
            require(row["candidate_product_targets"] == asset["candidate_product_targets"], f"candidate product {row['review_id']}")
            require(row["source_path"] == asset["source_path"], f"asset path {row['review_id']}")
            expected_source_sha = REQ_SHA if row["role_kind"] == "requirement" else asset["source_sha256"]
            require(row["source_sha256"] == expected_source_sha, f"asset source digest {row['review_id']}")
            path = source_path(row)
            require(path.is_file() and sha_file(path).removeprefix("sha256:") == row["source_sha256"], f"archive source digest {row['review_id']}")
            require(row["evidence_refs"], f"evidence refs {row['review_id']}")
            joined = "\n".join(excerpt(ARCHIVE / ref["archive_path"].removeprefix("archive/legacy-generation-2026-09-14/root/"), ref["line_start"], ref["line_end"]) for ref in row["evidence_refs"])
            for ref in row["evidence_refs"]:
                evidence_path = ROOT / ref["archive_path"]
                require(evidence_path.is_file(), f"evidence path {row['review_id']}")
                text = excerpt(evidence_path, ref["line_start"], ref["line_end"])
                require(ref["excerpt_sha256"] == sha_bytes(text.encode()), f"excerpt digest {row['review_id']}")
                require(ref["excerpt_status"] == "static_read_only" and ref["artifact_role"] == row["role_kind"], f"excerpt state {row['review_id']}")
                require(ref["source_requirement_relation"] == row["semantic_relation"], f"evidence relation {row['review_id']}")
            if row["role_kind"] == "requirement":
                require(all(span in joined for span in row["source_text_spans"]), f"requirement span {row['review_id']}")
                require(row["source_statement_text"] in joined, f"full requirement statement {row['review_id']}")
                require(row["semantic_link_status"] == "confirmed" and row["semantic_relation"] == "same_requirement_id_exact_source_contract_not_implementation", f"requirement contract {row['review_id']}")
            else:
                require(row["semantic_link_status"] == "unresolved" and row["counterevidence"], f"unresolved evidence {row['review_id']}")
                require(any("実装" in item and "実行" in item for item in row["counterevidence"]), f"implementation limit {row['review_id']}")
                require(all(binding["match_mode"] == "controlled_term_set_partial" for binding in row["evidence_atom_bindings"]), f"controlled anchor {row['review_id']}")
                for binding in row["evidence_atom_bindings"]:
                    verify_controlled_binding(row, binding, joined)

    # BR17 exact identity: do not replace the source fragment with a loose paraphrase.
    br17_req = next(row for row in by_unit["IRUNIT-HIL-BR-17-HELIX-OS"] if row["role_kind"] == "requirement")
    atoms = {atom["atom_id"]: atom for atom in br17_req["covered_requirement_atoms"]}
    require(atoms["BR17-OS-A02"]["text"] == "独立責務・別設計・lifecycle・性能改善だけを", "BR17 A02 exact fragment")
    require(atoms["BR17-OS-A05"]["text"] == "Issue、Universal Reverse、memory要約、Codex ready queueへ同一causality chainで接続する", "BR17 A05 chain")
    require(br17_req["source_connective_fragments"] == ["`successor_issue`として"], "BR17 connector retained")
    require("`successor_issue`として" not in br17_req["source_text_spans"], "BR17 decomposition gap is explicit")
    require(br17_req["connection_records"][0]["status"] == "upstream_decomposition_connector_gap_hold" and not br17_req["connection_records"][0]["successor_identity_claimed"], "BR17 connector hold")
    require("lossless_atomization_not_claimed" in br17_req["atomization_hold"], "BR17 lossless hold")
    wave5 = [row for row in read_jsonl(ROOT / "docs/governance/legacy-requirement-direct-semantic-review-wave5.jsonl") if row.get("unit_candidate_id") == "IRUNIT-HIL-BR-17-HELIX-HARNESS" and row.get("artifact_evidence_kind") == "requirement"]
    require(wave5 and "`current_pr_fix`としてwriterへ返し" in wave5[0]["source_text_spans"] and "独立責務・別設計・lifecycle・性能改善だけを`successor_issue`として" in wave5[0]["source_text_spans"], "Wave5 BR17 identity")
    h_atoms = {atom["atom_id"]: atom for atom in wave5[0]["covered_requirement_atoms"]}
    require(h_atoms["BR17-HARNESS-A05"]["text"] == "独立責務・別設計・lifecycle・性能改善だけを後続候補とする" and h_atoms["BR17-HARNESS-A06"]["text"] == "successor_issueとして扱う", "Wave5 current_pr_fix/successor identity")

    # Negative controls: stale anchors and missing excerpt mappings must fail closed.
    controlled_row = next(row for row in rows if row["review_id"] == "LSRW18-EDGE-002")
    controlled_binding = next(
        binding for binding in controlled_row["evidence_atom_bindings"] if binding["atom_id"] == "BR17-OS-A01"
    )
    controlled_joined = "\n".join(
        excerpt(
            ROOT / ref["archive_path"],
            ref["line_start"],
            ref["line_end"],
        )
        for ref in controlled_row["evidence_refs"]
    )
    stale_anchor = dict(controlled_binding)
    stale_anchor["source_fragment_anchors"] = ["stale-anchor"]
    expect_binding_failure(controlled_row, stale_anchor, controlled_joined, "stale anchor")
    missing_mapping = dict(controlled_binding)
    missing_mapping["anchor_evidence_terms"] = {}
    expect_binding_failure(controlled_row, missing_mapping, controlled_joined, "missing anchor mapping")

    # Bounded receipts are reproducible from static catalog/archive reads.
    for unit, receipt in meta["bounded_search_receipts"].items():
        require(receipt["catalog_record_count"] == 4020 and receipt["query"] == by_unit[unit][0]["bounded_search_query"], f"receipt identity {unit}")
        candidate_ids = []
        for asset_id, asset in catalog.items():
            path = ARCHIVE / asset["source_path"]
            try:
                body = path.read_text(errors="replace")
            except OSError:
                body = ""
            if any(anchor in body for anchor in receipt["query"]["anchors"]):
                candidate_ids.append(asset_id)
        candidate_ids.sort()
        require(receipt["candidate_asset_count"] == len(candidate_ids), f"receipt count {unit}")
        require(receipt["candidate_asset_ids_sha256"] == canonical(candidate_ids), f"receipt candidates {unit}")
        selected = sorted(ASSETS[unit])
        require(receipt["selected_asset_ids"] == selected and set(selected) <= set(candidate_ids), f"receipt selected {unit}")
        remaining = sorted(set(candidate_ids) - set(selected))
        require(receipt["unreviewed_asset_count"] == len(remaining) and receipt["unreviewed_asset_ids_sha256"] == canonical(remaining), f"receipt remaining {unit}")

    # Phase and aggregate receipts retain explicit implementation/degradation state.
    for aggregate in meta["unit_aggregates"]:
        require(aggregate["unit_candidate_id"] in UNITS and aggregate["new_build_allowed"] is False, "aggregate boundary")
        require(aggregate["consumer_closure_status"] == "pending" and aggregate["current_requirement_implementation_status"] == "not_established", "aggregate state")
    require(any("upstream_decomposition_connector_gap_hold" == item["status"] for item in meta["source_atomization_holds"]), "meta connector hold")
    print("Wave18 static schema10 verification: PASS")


if __name__ == "__main__":
    verify()
