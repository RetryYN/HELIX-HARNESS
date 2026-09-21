#!/usr/bin/env python3
"""静的なWave17 ledger verifier。

旧archiveのruntime/test/hook/CI/adapterは実行しない。Wave16の未マージ候補は
stacked branchのcurrent treeから固定digestで読み、shallow cloneでも検証できる。
Wave16再レビューで追加されたcontrolled anchor接地gateをdesign/implementationへ継承する。
"""
from __future__ import annotations

import hashlib
import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
ARCHIVE = ROOT / "archive/legacy-generation-2026-09-14/root"
LEDGER = ROOT / "docs/governance/legacy-requirement-direct-semantic-review-wave17.jsonl"
META = ROOT / "docs/governance/legacy-requirement-direct-semantic-review-wave17.meta.json"
CATALOG = ROOT / "docs/governance/legacy-asset-phase-product-classification-bootstrap.jsonl"
CROSSWALK = ROOT / "docs/governance/legacy-requirement-implementation-crosswalk-bootstrap.jsonl"
DECOMPOSITION = ROOT / "docs/governance/legacy-ir-product-unit-decomposition-bootstrap.jsonl"
REV = "6dad906ed9a52c9e49611931645db2f298c6bf6a"
WAVE16_SHA = "74bfd04f7aa2384e1e30856ec6c29282b764e8c5"
WAVE16_REF = WAVE16_SHA
WAVE16_CANDIDATE_INPUT_DIGESTS = {
    "docs/governance/legacy-requirement-direct-semantic-review-wave16.jsonl": "sha256:dccec0a2a8f3f6f64bbd3cee2f43680d8bfc3447e2ad392c2f690625322288f6",
    "docs/governance/legacy-requirement-direct-semantic-review-wave16.meta.json": "sha256:31392b688592d2087cfe3bd7309ebbb7fcf86baa3a5135441f0c61f56cd3fad3",
}
INPUTS_SHA256 = "sha256:a271f76f123f64b6443f50099d72c34e8c716cb41e7d6b823c8bfd71e8ca2180"
BATCH = "LEGACY-SEMANTIC-WAVE17-2026-09-21"
REQ_SHA = "80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688"

UNITS = {
    "IRUNIT-HIL-BR-15-HELIX-OS": {
        "product": ["HELIX-OS"],
        "req": "HIL-BR-15",
        "phases": ["PHCAP-03", "PHCAP-07", "PHCAP-09"],
        "spans": ["将来のproduct-data sourceをversioned connectorで取り込み、由来・鮮度・schema・authorityを保持した正規projectionとして設計判断、coverage、impact、Issue routing、docgen/detectorへ供給する。"],
        "edge_count": 2,
    },
    "IRUNIT-HIL-BR-16-HELIX-HARNESS": {
        "product": ["HELIX-HARNESS"],
        "req": "HIL-BR-16",
        "phases": ["PHCAP-07", "PHCAP-11"],
        "spans": ["検証をslice統合前のimpact CI、candidate固定後のfull CI、GitHub PR上の外部CIの3段に固定し", "各段のSHA/treeと直前段からのlineageがgreenでなければ次段へ進めない"],
        "edge_count": 3,
    },
    "IRUNIT-HIL-BR-16-HELIX-OS": {
        "product": ["HELIX-OS"],
        "req": "HIL-BR-16",
        "phases": ["PHCAP-11"],
        "spans": ["各段のSHA/treeと直前段からのlineageがgreenでなければ次段へ進めない", "style内統合によるSHA変更はpredecessor bindingで追跡する"],
        "edge_count": 3,
    },
}
ATOM_IDS = {
    "IRUNIT-HIL-BR-15-HELIX-OS": {"BR15-OS-A01", "BR15-OS-A02", "BR15-OS-A03"},
    "IRUNIT-HIL-BR-16-HELIX-HARNESS": {"BR16-HARNESS-A01", "BR16-HARNESS-A02"},
    "IRUNIT-HIL-BR-16-HELIX-OS": {"BR16-OS-A01", "BR16-OS-A02"},
}
SHARED = "各段のSHA/treeと直前段からのlineageがgreenでなければ次段へ進めない"


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


def git_blob(revision: str, relative_path: str) -> bytes:
    return subprocess.check_output(["git", "show", f"{revision}:{relative_path}"], cwd=ROOT)


def git_commit_exists(revision: str) -> bool:
    return subprocess.run(["git", "cat-file", "-e", f"{revision}^{{commit}}"], cwd=ROOT, capture_output=True).returncode == 0


def optional_git_blob(revision: str, relative_path: str) -> bytes | None:
    result = subprocess.run(["git", "show", f"{revision}:{relative_path}"], cwd=ROOT, capture_output=True)
    return result.stdout if result.returncode == 0 else None


def wave16_tree_bytes(relative_path: str) -> bytes:
    path = ROOT / relative_path
    require(path.is_file(), f"stacked Wave16 input missing: {relative_path}")
    data = path.read_bytes()
    require(relative_path in WAVE16_CANDIDATE_INPUT_DIGESTS, f"unpin Wave16 input: {relative_path}")
    require(sha_bytes(data) == WAVE16_CANDIDATE_INPUT_DIGESTS[relative_path], f"Wave16 input pin: {relative_path}")
    return data


def read_jsonl_bytes(data: bytes) -> list[dict]:
    return [json.loads(line) for line in data.decode().splitlines() if line.strip()]


def excerpt(path: Path, start: int, end: int) -> str:
    lines = path.read_text(errors="replace").splitlines()
    require(1 <= start <= end <= len(lines), f"excerpt bounds {path}:{start}-{end}")
    return "\n".join(lines[start - 1 : end]) + "\n"


def source_path(record: dict) -> Path:
    return ARCHIVE / record["source_path"]


def prior_sources() -> tuple[set[tuple[str, str]], set[tuple[str, str, str]], set[str]]:
    edges: set[tuple[str, str]] = set()
    assets: set[tuple[str, str, str]] = set()
    units: set[str] = set()
    for wave in range(1, 16):
        ledger = ROOT / f"docs/governance/legacy-requirement-direct-semantic-review-wave{wave}.jsonl"
        rows = read_jsonl(ledger)
        for row in rows:
            edges.add((row["unit_candidate_id"], row["asset_id"]))
            units.add(row["unit_candidate_id"])
            if row["artifact_evidence_kind"] != "requirement":
                assets.add((row["asset_id"], row["source_path"], row["source_sha256"]))
    candidate_ledger_rel = "docs/governance/legacy-requirement-direct-semantic-review-wave16.jsonl"
    for row in read_jsonl_bytes(wave16_tree_bytes(candidate_ledger_rel)):
        edges.add((row["unit_candidate_id"], row["asset_id"]))
        units.add(row["unit_candidate_id"])
        if row["artifact_evidence_kind"] != "requirement":
            assets.add((row["asset_id"], row["source_path"], row["source_sha256"]))
    return edges, assets, units


def verify() -> None:
    rows = read_jsonl(LEDGER)
    meta = json.loads(META.read_text())
    require(set(meta) == {"authority_effect", "batch_id", "bounded_search_receipts", "consumer_closure_status", "cumulative_reviewed_edge_count", "cumulative_reviewed_unit_count", "inputs", "legacy_execution_performed", "new_build_allowed", "output_sha256", "parent_revision", "prior_review_batches", "record_count", "reviewed_edges", "reviewed_unit_ids", "schema_revision", "semantic_link_counts", "source_revision", "status", "unit_aggregates", "wave16_candidate_ref", "wave16_candidate_merge_base", "wave16_candidate_root", "wave16_candidate_head", "wave16_candidate_input_digests", "stacked_pr_parent_revision", "source_main_base_revision", "missing_evidence_receipts", "phase_rows", "remaining_unit_count"}, "meta fields")
    catalog = {row["asset_id"]: row for row in read_jsonl(CATALOG)}
    full_wave16_object = git_commit_exists(WAVE16_SHA)
    full_base_object = git_commit_exists(REV)
    if full_wave16_object and full_base_object:
        require(subprocess.run(["git", "merge-base", "--is-ancestor", REV, WAVE16_SHA], cwd=ROOT, capture_output=True).returncode == 0, "wave16 merge base")
    require(len(catalog) == 4020, "catalog count")
    require(len(rows) == 8 and meta["record_count"] == 8, "record count")
    require(meta["schema_revision"] == 10 and meta["batch_id"] == BATCH, "schema/batch")
    require(meta["parent_revision"] == REV and meta["source_main_base_revision"] == REV, "source main base")
    require(meta["stacked_pr_parent_revision"] == WAVE16_SHA and meta["wave16_candidate_ref"] == WAVE16_REF and meta["wave16_candidate_head"] == WAVE16_SHA, "stacked parent revision")
    require(meta["wave16_candidate_merge_base"] == REV, "wave16 merge base")
    require(meta["wave16_candidate_input_digests"] == WAVE16_CANDIDATE_INPUT_DIGESTS, "Wave16 input digest pin")
    require(meta["wave16_candidate_root"] == "stacked-tree:current-commit", "stacked tree root")
    require(meta["output_sha256"] == sha_file(LEDGER), "ledger digest")
    require(meta["semantic_link_counts"] == {"confirmed": 3, "rejected": 0, "unresolved": 5}, "status counts")
    require(meta["cumulative_reviewed_unit_count"] == 50 and meta["cumulative_reviewed_edge_count"] == 149 and meta["remaining_unit_count"] == 168, "cumulative counts")
    all_units = {unit["unit_candidate_id"] for entry in read_jsonl(DECOMPOSITION) for unit in entry.get("candidate_units", [])}
    prior_edges, prior_assets, prior_units = prior_sources()
    require(len(all_units) == 218 and len(all_units - (prior_units | set(meta["reviewed_unit_ids"]))) == 168, "crosswalk remaining units")
    require(not meta["legacy_execution_performed"] and not meta["new_build_allowed"], "authority boundary")
    require(meta["reviewed_unit_ids"] == list(UNITS), "unit order")

    current_edges = {(row["unit_candidate_id"], row["asset_id"]) for row in rows}
    expected_edges = {
        (unit, "LEGACY-ASSET-A60CF91DD2AF6693E6F9") for unit in UNITS
    } | {
        ("IRUNIT-HIL-BR-15-HELIX-OS", "LEGACY-ASSET-C3DE79BA9451172F3E43"),
        ("IRUNIT-HIL-BR-16-HELIX-HARNESS", "LEGACY-ASSET-E9998EF887555DBB2751"),
        ("IRUNIT-HIL-BR-16-HELIX-HARNESS", "LEGACY-ASSET-CA0C7F22EA2ACBBF417E"),
        ("IRUNIT-HIL-BR-16-HELIX-OS", "LEGACY-ASSET-11770E4E81583B408E67"),
        ("IRUNIT-HIL-BR-16-HELIX-OS", "LEGACY-ASSET-F151382D9513557AF632"),
    }
    require(current_edges == expected_edges, "selected edges")
    require(not current_edges & prior_edges, "prior edge overlap")
    current_nonreq = {(r["asset_id"], r["source_path"], r["source_sha256"]) for r in rows if r["artifact_evidence_kind"] != "requirement"}
    require(not current_nonreq & prior_assets, "prior nonrequirement asset overlap")
    require(len(prior_units | set(UNITS)) == 50, "unit cumulative")
    require(len(prior_edges | current_edges) == 149, "edge cumulative")

    by_key = {(row["unit_candidate_id"], row["role_kind"]): row for row in rows}
    require(len(by_key) == 8, "role uniqueness")
    decomposition = {}
    for entry in read_jsonl(DECOMPOSITION):
        for candidate in entry.get("candidate_units", []):
            decomposition[candidate["unit_candidate_id"]] = (entry, candidate)
    required_parent_flags = {
        "IRUNIT-HIL-BR-15-HELIX-OS": {"direct_phase_review_pending", "routing_correction_pending_direct_phase_review", "human_product_authority_decision_pending", "successor_assignment_unassigned", "candidate_product_routing_requires_human_review", "source_atomization_review_pending"},
        "IRUNIT-HIL-BR-16-HELIX-HARNESS": {"product_unit_boundary_human_decision_pending", "unit_split_requires_independent_review", "human_product_authority_decision_pending", "successor_assignment_unassigned", "candidate_product_routing_requires_human_review", "source_atomization_review_pending"},
        "IRUNIT-HIL-BR-16-HELIX-OS": {"product_unit_boundary_human_decision_pending", "unit_split_requires_independent_review", "human_product_authority_decision_pending", "successor_assignment_unassigned", "candidate_product_routing_requires_human_review", "source_atomization_review_pending"},
    }
    expected_semantic_digests = {
        "HIL-BR-15": "sha256:5f5450b0a801f1f4c6650a0b4ddb87d5eee23400f2126332ed0038ed06f01115",
        "HIL-BR-16": "sha256:8e9887486ff78af21e31dbed2c1c713928bc397fdfa50aa1703549511f9356df",
    }
    for unit, spec in UNITS.items():
        require(unit in decomposition, f"decomposition unit {unit}")
        parent, candidate = decomposition[unit]
        require(candidate["unit_kind"] == "product_unit", f"unit kind {unit}")
        require(candidate["product_target"] == spec["product"][0], f"decomposition product {unit}")
        require(candidate["direct_phase_candidates"] == spec["phases"], f"decomposition phases {unit}")
        require(candidate["source_text_spans"] == spec["spans"], f"decomposition spans {unit}")
        require(parent["source_requirement_id"] == spec["req"] and parent["source_statement_semantic_digest"] == expected_semantic_digests[spec["req"]], f"decomposition requirement {unit}")
        require(set(parent["unresolved_reasons"]) >= required_parent_flags[unit], f"decomposition unresolved flags {unit}")
        crosswalk = next(item for item in read_jsonl(CROSSWALK) if item.get("unit_candidate_id") == unit)
        phase_projection = [{"phase_id": phase["phase_id"], "current_status": phase["current_status"], "legacy_capability_status": phase["legacy_capability_status"], "transition_assessment": phase["transition_assessment"], "gap": phase["gap"], "catalog_asset_count": phase["phase_candidate_asset_count"], "product_intersection_count": phase["phase_and_product_candidate_asset_count"]} for phase in crosswalk["phase_capability_evidence"]]
        require(meta["phase_rows"][unit] == phase_projection, f"crosswalk phase rows {unit}")
        overlaps = candidate.get("shared_source_overlaps", [])
        if unit == "IRUNIT-HIL-BR-15-HELIX-OS":
            require(overlaps == [], "BR15 shared overlap")
        else:
            require(len(overlaps) == 1 and overlaps[0]["source_text"] == SHARED and overlaps[0]["review_state"] == "product_boundary_pending_human_decision", f"BR16 shared overlap {unit}")
        coverage = next(item["atom_coverage_receipt"] for item in meta["unit_aggregates"] if item["unit_candidate_id"] == unit)
        implementation_unresolved = sorted({atom for row in rows if row["unit_candidate_id"] == unit and row["role_kind"] == "implementation_source" and row["semantic_link_status"] == "unresolved" for atom in row["covered_requirement_atom_ids"]})
        atom_ids = {atom["atom_id"] for atom in coverage["atom_inventory"]}
        require(coverage["implementation_unresolved_atom_ids"] == implementation_unresolved, f"implementation unresolved coverage {unit}")
        require(coverage["implementation_uncovered_atom_ids"] == sorted(atom_ids - set(implementation_unresolved) - set(coverage["implementation_confirmed_atom_ids"])), f"implementation uncovered coverage {unit}")
        for field in ("implementation_unresolved_atom_ids", "implementation_uncovered_atom_ids"):
            require(coverage[field + "_sha256"] == canonical(coverage[field]), f"coverage digest {unit}:{field}")
    require([row["review_id"] for row in rows] == [f"LSRW17-EDGE-{i:03d}" for i in range(1, 9)], "review order")
    require(meta["reviewed_edges"] == [{"unit_candidate_id": row["unit_candidate_id"], "asset_id": row["asset_id"]} for row in rows], "reviewed edge receipt")
    require(all(row["batch_id"] == BATCH and row["schema_revision"] == 10 for row in rows), "row identity")

    for unit, spec in UNITS.items():
        unit_rows = [row for row in rows if row["unit_candidate_id"] == unit]
        require(len(unit_rows) == spec["edge_count"], f"edge count {unit}")
        require(all(row["product_scope"] == spec["product"] for row in unit_rows), f"product scope {unit}")
        require(all(row["phase_candidates"] == spec["phases"] for row in unit_rows), f"phase candidates {unit}")
        require(all(row["source_requirement_id"] == spec["req"] for row in unit_rows), f"requirement id {unit}")
        require(all(row["source_text_spans"] == spec["spans"] for row in unit_rows), f"source spans {unit}")
        require(set(unit_rows[0]["covered_requirement_atom_ids"]) == ATOM_IDS[unit], f"contract atoms {unit}")
        for row in unit_rows:
            require(row["authority_effect"] == "none" and row["consumer_closure_status"] == "pending", f"row state {row['review_id']}")
            require(row["legacy_execution_status"] == "not_run" and row["current_requirement_implementation_status"] == "not_established", f"execution state {row['review_id']}")
            require(row["candidate_membership_semantics"] == "bounded_global_search_candidate_only_not_semantic_evidence", f"membership {row['review_id']}")
            require(row["bounded_search_query"] == meta["bounded_search_receipts"][unit]["query"], f"query {row['review_id']}")
            require(row["covered_requirement_atoms"] == [next(a for a in unit_rows[0]["covered_requirement_atoms"] if a["atom_id"] == atom) for atom in row["covered_requirement_atom_ids"]], f"atom order {row['review_id']}")
            require(row["source_statement_semantic_digest"] == ("sha256:5f5450b0a801f1f4c6650a0b4ddb87d5eee23400f2126332ed0038ed06f01115" if spec["req"] == "HIL-BR-15" else "sha256:8e9887486ff78af21e31dbed2c1c713928bc397fdfa50aa1703549511f9356df"), f"source semantic digest {row['review_id']}")
            asset = catalog[row["asset_id"]]
            require(row["artifact_evidence_kind"] == asset["artifact_evidence_kind"], f"kind {row['review_id']}")
            require(row["classification_id"] == asset["classification_id"], f"classification {row['review_id']}")
            require(row["candidate_phase_targets"] == asset["candidate_phase_targets"], f"candidate phase {row['review_id']}")
            require(row["candidate_product_targets"] == asset["candidate_product_targets"], f"candidate product {row['review_id']}")
            require(row["source_sha256"] == (REQ_SHA if row["role_kind"] == "requirement" else asset["source_sha256"]), f"asset digest {row['review_id']}")
            require(row["source_path"] == asset["source_path"], f"asset path {row['review_id']}")
            path = source_path(row)
            require(path.is_file() and sha_file(path).removeprefix("sha256:") == row["source_sha256"], f"archive digest {row['review_id']}")
            require(row["evidence_refs"], f"evidence refs {row['review_id']}")
            texts = []
            for ref in row["evidence_refs"]:
                start, end = ref["line_start"], ref["line_end"]
                require(ref["archive_path"] == str(path.relative_to(ROOT)) and ref["artifact_role"] == row["role_kind"] and ref["source_requirement_relation"] == row["semantic_relation"], f"evidence reference metadata {row['review_id']}")
                text = excerpt(path, start, end)
                texts.append(text)
                require(ref["excerpt_sha256"] == sha_bytes(text.encode()), f"excerpt digest {row['review_id']}:{start}")
                require(ref["excerpt_status"] == "static_read_only", f"excerpt state {row['review_id']}")
            joined = "\n".join(texts)
            require(all(span in joined for span in row["source_text_spans"] if row["role_kind"] == "requirement"), f"requirement source span {row['review_id']}")
            if row["semantic_link_status"] == "confirmed":
                require(row["role_kind"] == "requirement" and row["semantic_relation"] == "same_requirement_id_exact_source_contract_not_implementation", f"confirmed relation {row['review_id']}")
            else:
                require(row["semantic_link_status"] == "unresolved" and row["counterevidence"], f"unresolved evidence {row['review_id']}")
                require(row["role_kind"] in {"design", "implementation_source"}, f"unresolved role {row['review_id']}")
                require(all(binding["match_mode"] == "controlled_term_set_partial" for binding in row["evidence_atom_bindings"]), f"controlled gate {row['review_id']}")
                for binding in row["evidence_atom_bindings"]:
                    atom = next(a for a in row["covered_requirement_atoms"] if a["atom_id"] == binding["atom_id"])
                    require(binding["required_terms"] and binding["source_fragment_anchors"], f"binding terms {row['review_id']}")
                    mapped = binding.get("anchor_evidence_terms", {})
                    require(set(mapped) <= set(binding["source_fragment_anchors"]), f"anchor mapping scope {row['review_id']}")
                    for anchor in binding["source_fragment_anchors"]:
                        require(anchor in atom["text"] and any(anchor in fragment for fragment in atom["source_fragments"]), f"anchor atom grounding {row['review_id']}")
                        if anchor in joined:
                            continue
                        mapped_terms = mapped.get(anchor, [])
                        require(bool(mapped_terms) and all(term in binding["required_terms"] and term in joined for term in mapped_terms), f"anchor excerpt grounding {row['review_id']}")
                    require(all(term in joined for term in binding["required_terms"]), f"required terms {row['review_id']}")
            if row["role_kind"] in {"design", "implementation_source"}:
                require(any("実装" in item and "実行" in item for item in row["counterevidence"]), f"implementation limit {row['review_id']}")

    # Lossless source atomization and shared-span boundary.
    br15 = by_key[("IRUNIT-HIL-BR-15-HELIX-OS", "requirement")]["covered_requirement_atoms"]
    require(br15[0]["text"] + "、" + br15[1]["text"] + br15[2]["text"] + "。" == UNITS["IRUNIT-HIL-BR-15-HELIX-OS"]["spans"][0], "BR15 atom loss")
    h_atoms = by_key[("IRUNIT-HIL-BR-16-HELIX-HARNESS", "requirement")]["covered_requirement_atoms"]
    os_atoms = by_key[("IRUNIT-HIL-BR-16-HELIX-OS", "requirement")]["covered_requirement_atoms"]
    require(h_atoms[1]["text"] == SHARED and os_atoms[0]["text"] == SHARED, "BR16 shared atom")
    require(h_atoms[1]["shared_with_units"] == ["IRUNIT-HIL-BR-16-HELIX-OS"] and os_atoms[0]["shared_with_units"] == ["IRUNIT-HIL-BR-16-HELIX-HARNESS"], "BR16 shared peer")
    require(sum(1 for row in rows if row["role_kind"] == "requirement" and SHARED in row["source_text_spans"]) == 2, "shared source retained")
    require("implementation_source" not in {row["role_kind"] for row in rows if row["unit_candidate_id"] == "IRUNIT-HIL-BR-15-HELIX-OS"}, "BR15 false implementation edge")
    missing = meta["missing_evidence_receipts"]
    require(len(missing) == 1 and missing[0]["unit_candidate_id"] == "IRUNIT-HIL-BR-15-HELIX-OS", "BR15 missing receipt")
    require("src/product-data/" in missing[0]["archive_path_absent"], "BR15 missing path")
    require(not (ARCHIVE / "src/product-data").exists(), "BR15 archive path unexpectedly present")
    for term in missing[0]["searched_terms"]:
        require(not any(term in path.read_text(errors="replace") for path in (ARCHIVE / "src").rglob("*") if path.is_file()), f"BR15 direct source search hit {term}")
    require(set(missing[0]["searched_terms"]) == {"ProductDataConnector", "ProductDataProjection", "HIL_PRODUCT_DIRECT_WRITE_FORBIDDEN"}, "BR15 bounded search terms")
    catalog_match_counts = {}
    for term in missing[0]["searched_terms"]:
        catalog_match_counts[term] = sum(1 for asset in catalog.values() if asset["artifact_evidence_kind"] == "implementation_source" and term in (ARCHIVE / asset["source_path"]).read_text(errors="replace"))
    require(catalog_match_counts == missing[0]["catalog_implementation_source_match_counts"] == {term: 0 for term in missing[0]["searched_terms"]}, "BR15 catalog-wide implementation search counts")

    for unit, receipt in meta["bounded_search_receipts"].items():
        require(receipt["catalog_record_count"] == 4020, f"receipt catalog {unit}")
        anchors = receipt["query"]["anchors"]
        candidate_ids = []
        for asset_id, asset in catalog.items():
            path = ARCHIVE / asset["source_path"]
            try:
                body = path.read_text(errors="replace")
            except OSError:
                body = ""
            if any(anchor in body for anchor in anchors):
                candidate_ids.append(asset_id)
        candidate_ids.sort()
        require(receipt["candidate_asset_count"] == len(candidate_ids), f"receipt candidate count {unit}")
        require(receipt["candidate_asset_ids_sha256"] == canonical(candidate_ids), f"receipt candidate digest {unit}")
        expected_selected = sorted({row["asset_id"] for row in rows if row["unit_candidate_id"] == unit})
        require(set(expected_selected) <= set(candidate_ids), f"selected outside bounded search {unit}")
        require(receipt["selected_asset_ids"] == expected_selected, f"receipt selected {unit}")
        remaining = sorted(set(candidate_ids) - set(expected_selected))
        require(receipt["unreviewed_asset_count"] == len(remaining), f"receipt remaining count {unit}")
        require(receipt["unreviewed_asset_ids_sha256"] == canonical(remaining), f"receipt remaining digest {unit}")

    # Meta input digests and explicit Wave16 candidate bytes.
    expected_inputs = {"archive/legacy-generation-2026-09-14/MANIFEST.sha256", "docs/governance/legacy-asset-phase-product-classification-bootstrap.jsonl", "docs/governance/legacy-requirement-implementation-crosswalk-bootstrap.jsonl", "docs/governance/legacy-ir-product-unit-decomposition-bootstrap.jsonl", "docs/governance/phase-capability-inventory.json"}
    expected_inputs.update(f"docs/governance/legacy-requirement-direct-semantic-review-wave{wave}.{suffix}" for wave in range(1, 16) for suffix in ("jsonl", "meta.json"))
    expected_inputs.update({"wave16_candidate/legacy-requirement-direct-semantic-review-wave16.jsonl", "wave16_candidate/legacy-requirement-direct-semantic-review-wave16.meta.json"})
    require(set(meta["inputs"]) == expected_inputs, "input path set")
    require(canonical(meta["inputs"]) == INPUTS_SHA256, "input digest map pin")
    for name, digest in meta["inputs"].items():
        if name.startswith("wave16_candidate/"):
            relative = "docs/governance/" + name.removeprefix("wave16_candidate/")
            blob = wave16_tree_bytes(relative)
            require(sha_bytes(blob) == digest, f"input digest {name}")
            if full_wave16_object:
                object_blob = optional_git_blob(WAVE16_SHA, relative)
                require(object_blob is not None and object_blob == blob, f"Wave16 object input {name}")
        else:
            path = ROOT / name
            require(path.is_file() and sha_file(path) == digest, f"input digest {name}")
            if full_base_object:
                object_blob = optional_git_blob(REV, name)
                require(object_blob is not None and sha_bytes(object_blob) == digest, f"parent revision input {name}")
    w16ledger_blob = wave16_tree_bytes("docs/governance/legacy-requirement-direct-semantic-review-wave16.jsonl")
    w16meta_blob = wave16_tree_bytes("docs/governance/legacy-requirement-direct-semantic-review-wave16.meta.json")
    w16meta = json.loads(w16meta_blob)
    require(w16meta["batch_id"] == "LEGACY-SEMANTIC-WAVE16-2026-09-21", "wave16 candidate batch")
    require(w16meta["output_sha256"] == sha_bytes(w16ledger_blob), "wave16 candidate ledger digest")
    for input_name, input_digest in w16meta["inputs"].items():
        input_path = ROOT / input_name
        require(input_path.is_file() and sha_file(input_path) == input_digest, f"wave16 input digest {input_name}")
        if full_wave16_object:
            object_blob = optional_git_blob(WAVE16_SHA, input_name)
            require(object_blob is not None and sha_bytes(object_blob) == input_digest, f"wave16 input object {input_name}")
    expected_prior = []
    for wave in range(1, 16):
        stem = f"docs/governance/legacy-requirement-direct-semantic-review-wave{wave}"
        prior_meta = json.loads((ROOT / f"{stem}.meta.json").read_text())
        expected_prior.append({"batch_id": prior_meta["batch_id"], "ledger_sha256": sha_file(ROOT / f"{stem}.jsonl"), "meta_sha256": sha_file(ROOT / f"{stem}.meta.json")})
    expected_prior.append({"batch_id": w16meta["batch_id"], "ledger_sha256": sha_bytes(w16ledger_blob), "meta_sha256": sha_bytes(w16meta_blob), "candidate_ref": WAVE16_REF, "merge_base": REV})
    require(meta["prior_review_batches"] == expected_prior, "prior review batches exact")
    require(meta["wave16_candidate_root"] == "stacked-tree:current-commit", "stacked tree root")

    status_text = (ROOT / "docs/governance/audits/source-rebaseline/legacy-requirement-direct-semantic-review-wave17-status-2026-09-21.md").read_text()
    expected_phase_lines = ["| " + " | ".join((unit, UNITS[unit]["product"][0], phase["phase_id"], phase["current_status"], phase["legacy_capability_status"], phase["transition_assessment"], phase["gap"])) + " |" for unit in UNITS for phase in meta["phase_rows"][unit]]
    actual_phase_lines = [line for line in status_text.splitlines() if line.startswith("| IRUNIT-HIL-BR-") and len(line.split("|")) == 9]
    require(actual_phase_lines == expected_phase_lines, "status phase rows exact")
    expected_coverage_lines = []
    for unit in UNITS:
        coverage = next(item["atom_coverage_receipt"] for item in meta["unit_aggregates"] if item["unit_candidate_id"] == unit)
        fields = ("atom_inventory", "contract_confirmed_atom_ids", "design_confirmed_atom_ids", "design_unresolved_atom_ids", "implementation_confirmed_atom_ids", "implementation_unresolved_atom_ids", "implementation_uncovered_atom_ids", "no_evidence_atom_ids")
        expected_coverage_lines.append("| " + " | ".join([unit] + [str(len(coverage[field])) for field in fields]) + " |")
    actual_coverage_lines = [line for line in status_text.splitlines() if line.startswith("| IRUNIT-HIL-BR-") and len(line.split("|")) == 11]
    require(actual_coverage_lines == expected_coverage_lines, "status coverage rows exact")

    docs = "\n".join((ROOT / p).read_text() for p in [
        "docs/governance/audits/source-rebaseline/legacy-requirement-direct-semantic-review-wave17-method-2026-09-21.md",
        "docs/governance/audits/source-rebaseline/legacy-requirement-direct-semantic-review-wave17-premise-packet-2026-09-21.md",
        "docs/governance/audits/source-rebaseline/legacy-requirement-direct-semantic-review-wave17-status-2026-09-21.md",
        "docs/governance/audits/source-rebaseline/legacy-requirement-direct-semantic-review-wave17-review-response-2026-09-21.md",
    ])
    for marker in [REV, WAVE16_REF, "stacked PR parent", "Wave16 ledger/meta are available in the current tree", "direct_phase_review_pending", "routing_correction_pending_direct_phase_review", "product_unit_boundary_human_decision_pending", "runtime、test、hook、CI、adapterは実行していない", "候補membershipはsemantic evidenceではない"]:
        require(marker in docs, f"document marker {marker}")
    print("legacy requirement direct semantic review wave17: schema10 / 8 edges / 7 atoms / confirmed3 rejected0 unresolved5 / cumulative50 units149 edges / 168 units remaining / static verification passed")


if __name__ == "__main__":
    try:
        verify()
    except Exception as exc:
        print(f"FAIL: {exc}")
        sys.exit(1)
