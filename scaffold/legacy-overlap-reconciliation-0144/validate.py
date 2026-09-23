#!/usr/bin/env python3
"""Independent fail-closed validator for SCF-B-0144 (does not import generator)."""
from __future__ import annotations

import ast
import hashlib
import json
import subprocess
import sys
from collections import Counter
from functools import lru_cache
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
BUNDLE = ROOT / "scaffold/legacy-overlap-reconciliation-0144"
BINDING = ROOT / "scaffold/bindings/SCF-B-0144.json"
PREVIOUS_BASE = "2c94d171e9b1f2cb28aaceedf591129fb8e4db2e"
BASE = "7afee33ae892fe1a3cf1085fac4e02d923ece01d"
ARCHIVE_BASE = "5562f04da0f3205f9aa58205ec0d478419fc4f2e"
INITIAL_TARGET = "886c2436a71e079913c395693c2edd9ddce52113"
PREVIOUS_TARGET = "8c8cf851b47c88f6d814dc828a38743fc3cd45b3"
TARGET = "c55ffc91b08aabb0a0216168b3cf2b1e5fe6bf03"
TARGET_ROOT = "scaffold/legacy-implementation-residual-0126"
TARGET_GEN = f"{TARGET_ROOT}/generate.py"
TARGET_INV = f"{TARGET_ROOT}/inventory.json"
TARGET_ROWS = f"{TARGET_ROOT}/classification-research.jsonl"
TARGET_BINDING = "scaffold/bindings/SCF-B-0126.json"
MAIN_BUNDLES = (
    "scaffold/legacy-asset-product-classification-0107/classification-research.jsonl",
    "scaffold/legacy-lint-candidate-product-classification-0128/classification-research.jsonl",
    "scaffold/legacy-lint-product-classification-0108/classification-research.jsonl",
    "scaffold/legacy-runtime-product-classification-0117/classification-research.jsonl",
    "scaffold/legacy-runtime-residual-product-classification-0133/classification-research.jsonl",
    "scaffold/legacy-schema-product-classification-0120/classification-research.jsonl",
    "scaffold/legacy-source-product-classification-0123/classification-research.jsonl",
    "scaffold/legacy-state-db-product-classification-0127/classification-research.jsonl",
)
PHASE = "docs/governance/legacy-asset-phase-product-classification-bootstrap.jsonl"
DISPOSITION = "docs/governance/legacy-asset-disposition.jsonl"
DECISIONS = "docs/governance/legacy-asset-decisions.jsonl"
READ_AFTER = "docs/governance/legacy-asset-copy-read-after.jsonl"
MANIFEST = "archive/legacy-generation-2026-09-14/MANIFEST.sha256"
BOUNDARY = "docs/concept/product-boundary.md"
FAILURE = "docs/governance/audits/source-rebaseline/legacy-ci-ai-runtime-source-inventory.md"
CONSUMER = "docs/governance/audits/source-rebaseline/legacy-ci-consumer-relation-inventory.md"
L1_PATHS = {
    "HELIX-HARNESS": "docs/helix-harness/L1-planning/product-intent.md",
    "HELIX-OS": "docs/helix-os/L1-planning/system-intent.md",
    "HELIX-Web": "docs/helix-web/L1-planning/product-intent.md",
    "HELIX-Web-OS": "docs/helix-web-os/L1-planning/system-intent.md",
}
PRODUCTS = tuple(L1_PATHS)
PROFILE_REASON = (
    "This implementation_source asset is absent from the prior research asset-ID set; "
    "no direct product evidence is retained, so it remains insufficient basis pending dedicated review."
)
ARCHIVE_PREFIX = "archive/legacy-generation-2026-09-14/root/"
EXPECTED_NEGATIVE_CASES = [
    "N01-json-duplicate-key",
    "N02-target-set-omission",
    "N03-target-set-duplicate",
    "N04-main-result-mutation",
    "N05-target-result-mutation",
    "N06-source-sha-alias",
    "N07-source-span-tamper",
    "N08-l1-evidence-tamper",
    "N09-reason-evidence-tamper",
    "N10-formal-authority-promotion",
    "N11-phase-status-promotion",
    "N12-upstream-digest-stale",
    "N13-output-digest-stale",
    "N14-scope-membership-evidence-tamper",
    "N15-json-nan",
    "N16-json-infinity",
    "N17-json-negative-infinity",
]


class CheckError(Exception):
    pass


def require(ok: bool, code: str, detail: str) -> None:
    if not ok:
        raise CheckError(f"{code} {detail}")


def digest(data: bytes) -> str:
    return "sha256:" + hashlib.sha256(data).hexdigest()


def canonical(value: object) -> bytes:
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":"), allow_nan=False).encode()


def pairs_no_duplicate(pairs: list[tuple[str, object]]) -> dict:
    out = {}
    for key, value in pairs:
        if key in out:
            raise ValueError(f"duplicate JSON key {key}")
        out[key] = value
    return out


def reject_json_constant(value: str):
    raise ValueError(f"non-standard JSON constant: {value}")


@lru_cache(maxsize=None)
def git_bytes(revision: str, path: str) -> bytes:
    try:
        return subprocess.check_output(["git", "show", f"{revision}:{path}"], cwd=ROOT)
    except subprocess.CalledProcessError as exc:
        raise CheckError(f"E_INPUT_MISSING {revision}:{path}") from exc


@lru_cache(maxsize=None)
def tree_entry(revision: str, path: str) -> dict:
    raw = subprocess.check_output(["git", "ls-tree", revision, "--", path], cwd=ROOT, text=True)
    rows = [line for line in raw.splitlines() if line]
    require(len(rows) == 1 and "\t" in rows[0], "E_SOURCE_TREE", f"exact path {revision}:{path}")
    header, actual = rows[0].split("\t", 1)
    mode, typ, oid = header.split()
    require(actual == path and typ == "blob" and mode in {"100644", "100755"}, "E_SOURCE_TREE", f"type/mode/path {revision}:{path}")
    return {"path": actual, "mode": mode, "type": typ, "blob": oid}


def parse_json_bytes(raw: bytes, code: str, label: str):
    try:
        return json.loads(raw.decode("utf-8"), object_pairs_hook=pairs_no_duplicate, parse_constant=reject_json_constant)
    except (UnicodeDecodeError, json.JSONDecodeError, TypeError, ValueError) as exc:
        raise CheckError(f"{code} {label}: {exc}") from exc


def parse_jsonl_bytes(raw: bytes, label: str) -> list[tuple[int, dict]]:
    rows = []
    try:
        lines = raw.decode("utf-8").splitlines()
    except UnicodeDecodeError as exc:
        raise CheckError(f"E_JSON {label}: {exc}") from exc
    for number, line in enumerate(lines, 1):
        if not line.strip():
            continue
        try:
            row = json.loads(line, object_pairs_hook=pairs_no_duplicate, parse_constant=reject_json_constant)
        except (json.JSONDecodeError, TypeError, ValueError) as exc:
            raise CheckError(f"E_JSON {label}:{number}: {exc}") from exc
        require(isinstance(row, dict), "E_JSON", f"{label}:{number} must be object")
        rows.append((number, row))
    return rows


def ast_literal(tree: ast.Module, name: str):
    for node in tree.body:
        if isinstance(node, ast.Assign) and any(isinstance(t, ast.Name) and t.id == name for t in node.targets):
            return ast.literal_eval(node.value)
        if isinstance(node, ast.AnnAssign) and isinstance(node.target, ast.Name) and node.target.id == name:
            return ast.literal_eval(node.value)
    raise CheckError(f"E_TARGET_METHOD missing literal {name}")


def pinned_target_method():
    source = git_bytes(TARGET, TARGET_GEN).decode("utf-8")
    tree = ast.parse(source, filename=TARGET_GEN)
    paths = ast_literal(tree, "UNRESEARCHED_PREFIX_ASSET_PATHS")
    require(len(paths) == 53 and len({x[0] for x in paths}) == 53 and len({x[1] for x in paths}) == 53, "E_TARGET_METHOD", "53 unique ID/path literals")
    by_path = {path: aid for aid, path in paths}
    reason = ast_literal(tree, "UNRESEARCHED_PROFILE_REASON")
    l1 = ast_literal(tree, "L1")
    products = ast_literal(tree, "PRODUCTS")
    l1_ranges = ast_literal(tree, "L1_RANGES")
    boundary_ranges = ast_literal(tree, "BOUNDARY_RANGES")
    require(reason == PROFILE_REASON and tuple(products) == PRODUCTS and l1 == L1_PATHS, "E_TARGET_METHOD", "fallback/L1 literals drift")
    fragments = (
        "def unique_anchor_marker(path: str) -> str:",
        "if marker and sum(marker in candidate for candidate in lines) == 1:",
        'REVIEW_SPECS[_path] = p("insufficient_basis", [], unique_anchor_marker(_path), UNRESEARCHED_PROFILE_REASON, 1)',
    )
    require(all(x in source for x in fragments), "E_TARGET_METHOD", "static fallback implementation drift")
    return by_path, l1, boundary_ranges, l1_ranges


def manifest_digest(revision: str, source_path: str) -> str:
    hits = []
    for line in git_bytes(revision, MANIFEST).decode("utf-8", errors="replace").splitlines():
        if line.endswith(" " + source_path):
            sha, path = line.split(maxsplit=1)
            if path == source_path:
                hits.append("sha256:" + sha)
    require(len(hits) == 1, "E_MANIFEST", f"{source_path} entry count={len(hits)}")
    return hits[0]


def target_span(source: bytes) -> dict:
    lines = source.decode("utf-8", errors="replace").splitlines()
    for no, line in enumerate(lines, 1):
        marker = line.strip()
        if marker and sum(marker in candidate for candidate in lines) == 1:
            return {
                "marker": marker, "line_start": no, "line_end": no,
                "line_text": [line], "line_text_sha256": digest(line.encode("utf-8")),
                "marker_sha256": digest(marker.encode("utf-8")),
                "interpretation": PROFILE_REASON,
                "products_considered": list(PRODUCTS),
                "source_selection_method": "#2078 unique_anchor_marker reproduced from pinned generator literal/helper",
            }
    raise CheckError("E_TARGET_METHOD no unique marker")


def static_range(revision: str, path: str, start: int, end: int) -> dict:
    data = git_bytes(revision, path)
    lines = data.decode("utf-8", errors="replace").splitlines()
    require(1 <= start <= end <= len(lines), "E_PRODUCT_EVIDENCE", f"range {revision}:{path}:{start}-{end}")
    text_lines = lines[start - 1:end]
    entry = tree_entry(revision, path)
    return {
        "path": path, "blob": entry["blob"], "line_start": start, "line_end": end,
        "line_text": text_lines, "line_text_sha256": digest("\n".join(text_lines).encode("utf-8")),
        "source_revision": revision,
    }


def expected_target_boundary(l1: dict, branges: list, lranges: dict) -> dict:
    return {
        "status": "reconstructed_from_pinned_target_helper; not emitted as an overlap-row counterevidence field",
        "product_boundary": {
            "path": BOUNDARY,
            "sha256": digest(git_bytes(ARCHIVE_BASE, BOUNDARY)),
            "ranges": [static_range(ARCHIVE_BASE, BOUNDARY, a, b) for a, b in branges],
        },
        "four_product_l1_comparison_pool": {
            product: {
                "path": l1[product], "sha256": digest(git_bytes(ARCHIVE_BASE, l1[product])),
                "ranges": [static_range(ARCHIVE_BASE, l1[product], a, b) for a, b in lranges[product]],
            }
            for product in PRODUCTS
        },
        "counterevidence_authored_by_target_overlap_result": None,
        "interpretation": "No target-specific counterevidence was persisted for excluded overlap rows. This four-product boundary/L1 pool is supplied for human comparison only.",
    }


def main_row_map() -> dict[str, list[dict]]:
    by_id = {}
    for bundle in MAIN_BUNDLES:
        for line, row in parse_jsonl_bytes(git_bytes(BASE, bundle), bundle):
            if not isinstance(row.get("asset_id"), str):
                raise CheckError(f"E_MAIN_RESULT {bundle}:{line} missing ID")
            by_id.setdefault(row["asset_id"], []).append({"bundle": bundle, "line": line, "row": row, "row_sha256": digest(canonical(row))})
    require(len(by_id) == 429, "E_MAIN_RESULT", f"fixed union has {len(by_id)} IDs, expected 429")
    for aid, sources in by_id.items():
        identity = {(source["row"].get("source_exact", {}).get("source_path"), source["row"].get("source_exact", {}).get("sha256")) for source in sources}
        require(len(identity) == 1, "E_MAIN_RESULT", f"same-ID source path/SHA alias {aid}")
        for source in sources:
            row = source["row"]
            nested = row.get("classification") if isinstance(row.get("classification"), dict) else {}
            category = row.get("classification_category") or nested.get("category")
            products = row.get("candidate_products", nested.get("candidate_products", []))
            require(same_candidate_invariant(category, products), "E_MAIN_RESULT", f"category/product invariant {aid}")
            require(all(p in PRODUCTS for p in products), "E_MAIN_RESULT", f"product outside four-product set {aid}")
    return by_id


def current_main_union_ids(prior_main_by_id: dict[str, list[dict]]) -> set[str]:
    current_rows = parse_jsonl_bytes(git_bytes(BASE, TARGET_ROWS), TARGET_ROWS)
    pinned_rows = parse_jsonl_bytes(git_bytes(TARGET, TARGET_ROWS), TARGET_ROWS)
    require(current_rows == pinned_rows, "E_MAIN_UNION", "merged #2078 residual records differ from immutable c55 candidate")
    target_ids = [row.get("asset_id") for _, row in current_rows]
    require(len(target_ids) == 67 and len(set(target_ids)) == 67 and not (set(target_ids) & set(prior_main_by_id)), "E_MAIN_UNION", "current main union must be prior 429 plus 67 disjoint #2078 residual IDs")
    return set(prior_main_by_id) | set(target_ids)


def phase_context(aid: str) -> dict:
    phase_rows = {row.get("asset_id"): (line, row) for line, row in parse_jsonl_bytes(git_bytes(ARCHIVE_BASE, PHASE), PHASE)}
    dispositions = {row.get("asset_id"): (line, row) for line, row in parse_jsonl_bytes(git_bytes(ARCHIVE_BASE, DISPOSITION), DISPOSITION)}
    require(aid in phase_rows and aid in dispositions, "E_PHASE_STATE", f"missing target phase/disposition {aid}")
    pn, p = phase_rows[aid]
    dn, d = dispositions[aid]
    return {
        "phase": {
            "path": PHASE, "line": pn, "row_sha256": digest(canonical(p)),
            "source_path": p.get("source_path"), "source_sha256": p.get("source_sha256"),
            "product_classification_status": p.get("product_classification_status"),
            "artifact_evidence_kind": p.get("artifact_evidence_kind"),
            "implementation_evidence_state": p.get("implementation_evidence_state"),
            "legacy_implementation_status": p.get("legacy_implementation_status"),
            "candidate_phase_targets": p.get("candidate_phase_targets") or [],
            "candidate_product_targets": p.get("candidate_product_targets") or [],
            "legacy_execution_performed": p.get("legacy_execution_performed"),
        },
        "disposition": {
            "path": DISPOSITION, "line": dn, "row_sha256": digest(canonical(d)),
            "disposition": d.get("disposition"), "asset_class": d.get("asset_class"),
            "implementation_status": d.get("implementation_status"), "product_target": d.get("product_target"),
            "consumer_refs": sorted(d.get("consumer_refs", [])),
            "decision_record_ref": d.get("decision_record_ref"), "read_after_record_ref": d.get("read_after_record_ref"),
        },
        "scope_note": "Inputs reconstructed from the #2078 fixed BASE for review context; overlap row itself stores no phase/history output.",
    }


def target_history(aid: str) -> dict:
    decisions = [(n, r) for n, r in parse_jsonl_bytes(git_bytes(ARCHIVE_BASE, DECISIONS), DECISIONS) if r.get("asset_id") == aid]
    read_after = [(n, r) for n, r in parse_jsonl_bytes(git_bytes(ARCHIVE_BASE, READ_AFTER), READ_AFTER) if r.get("asset_id") == aid]
    return {
        "decisions": [{"path": DECISIONS, "line": n, "row_sha256": digest(canonical(r)), "decision_id": r.get("decision_id"), "product_target": r.get("product_target"), "disposition": r.get("disposition")} for n, r in decisions],
        "read_after": [{"path": READ_AFTER, "line": n, "row_sha256": digest(canonical(r)), "read_after_id": r.get("read_after_id"), "result": r.get("result"), "digest_match": r.get("digest_match"), "consumer_match": r.get("consumer_match")} for n, r in read_after],
        "failure_consumer_static": {
            "failure": {"path": FAILURE, "blob": tree_entry(ARCHIVE_BASE, FAILURE)["blob"], "sha256": digest(git_bytes(ARCHIVE_BASE, FAILURE)), "read_mode": "git_object_static_read_only"},
            "consumer": {"path": CONSUMER, "blob": tree_entry(ARCHIVE_BASE, CONSUMER)["blob"], "sha256": digest(git_bytes(ARCHIVE_BASE, CONSUMER)), "read_mode": "git_object_static_read_only"},
        },
        "closure_status": "asset-level consumer closure is not inferred from historical refs",
    }


def same_candidate_invariant(category: str, products: list) -> bool:
    if category == "direct_product_basis":
        return len(products) == 1
    if category == "multi_product_conflict":
        return len(products) >= 2
    if category == "insufficient_basis":
        return products == []
    return False


def expected_scope_membership(entry: dict, asset_id: str, path_to_id: dict[str, str], main_union_ids: set[str]) -> dict:
    return {
        "fallback_profile_contains_asset_id": path_to_id.get(entry.get("source_path")) == asset_id,
        "fallback_profile_reason_claims_asset_absent": "absent from the prior research asset-ID set" in PROFILE_REASON,
        "main_union_contains_asset_id": asset_id in main_union_ids,
        "main_union_asset_count": len(main_union_ids),
        "prior_main_candidate_union_asset_count": 429,
        "merged_2078_residual_asset_count": 67,
        "target_overlap_status": entry.get("overlap_status"),
    }


def expected_target_scope(entry: dict, asset_id: str, path_to_id: dict[str, str], main_union_ids: set[str]) -> dict:
    return {
        "main_union_scope": "current_main_product_research_union (496 IDs = prior candidate union 429 + merged #2078 residual 67; comparison uses the prior source-specific candidate records)",
        "target_overlap_scope": entry.get("research_scope"),
        "target_generator_scope": "new_residual_after_main_product_union; overlap candidates are excluded from emitted 67-record target JSONL",
        "target_fallback_profile_scope": "UNRESEARCHED_PREFIX_ASSET_PATHS (53 static ID/path literals); generic rationale refers to absent prior research IDs",
        "scope_membership_evidence": expected_scope_membership(entry, asset_id, path_to_id, main_union_ids),
    }


def expected_reason_types(main: dict, target_span_value: dict, main_spans: list, scope: dict) -> list[str]:
    # Exact candidate signals are repeated independently from generate.py.
    membership = scope["scope_membership_evidence"]
    types = []
    if (
        scope["target_overlap_scope"] == "existing_main_product_research_union"
        and membership["target_overlap_status"] == "same_source_different_candidate_result"
        and membership["fallback_profile_contains_asset_id"] is True
        and membership["fallback_profile_reason_claims_asset_absent"] is True
        and membership["main_union_contains_asset_id"] is True
    ):
        types.append("scope_difference")
    line_text_sha = digest("\n".join(target_span_value["line_text"]).encode("utf-8"))
    if not main_spans or any((x.get("line_start"), x.get("line_end"), x.get("line_text_sha256")) != (target_span_value["line_start"], target_span_value["line_end"], line_text_sha) for x in main_spans):
        types.append("evidence_span_difference")
    if main.get("manual_semantic_review", {}).get("status") and main_spans and target_span_value.get("interpretation") == PROFILE_REASON and main.get("classification_reason"):
        types.append("research_method_state_difference")
    if main.get("classification_category") != "insufficient_basis" or main.get("candidate_products") != []:
        types.append("classification_rule_difference")
    return types or ["unresolved"]


def expected_main_rebaseline() -> dict:
    paths = sorted(set((*MAIN_BUNDLES, BOUNDARY, PHASE, DISPOSITION, DECISIONS, READ_AFTER, MANIFEST, FAILURE, CONSUMER, *L1_PATHS.values())))
    comparisons = []
    for path in paths:
        previous = tree_entry(PREVIOUS_BASE, path)
        current = tree_entry(BASE, path)
        require(previous["blob"] == current["blob"] and previous["mode"] == current["mode"], "E_MAIN_REBASELINE", f"fixed input changed between main revisions: {path}")
        comparisons.append({"path": path, "blob": current["blob"], "mode": current["mode"]})
    changed_scaffold = subprocess.check_output(["git", "diff", "--name-only", PREVIOUS_BASE, BASE, "--", "scaffold"], cwd=ROOT, text=True).splitlines()
    added_scaffold = subprocess.check_output(["git", "diff", "--name-only", "--diff-filter=A", PREVIOUS_BASE, BASE, "--", "scaffold"], cwd=ROOT, text=True).splitlines()
    prior_main_by_id = main_row_map()
    merged_2078_objects = []
    for path in (TARGET_BINDING, f"{TARGET_ROOT}/PR-DRAFT.md", f"{TARGET_ROOT}/README.md", TARGET_ROWS, TARGET_GEN, TARGET_INV, f"{TARGET_ROOT}/selfcheck.py", f"{TARGET_ROOT}/validate.py"):
        current = tree_entry(BASE, path)
        pinned = tree_entry(TARGET, path)
        require(current["blob"] == pinned["blob"] and current["mode"] == pinned["mode"], "E_MAIN_REBASELINE", f"merged #2078 object differs from immutable c55 pin: {path}")
        merged_2078_objects.append({"path": path, "blob": current["blob"], "mode": current["mode"]})
    current_ids = current_main_union_ids(prior_main_by_id)
    target_ids = current_ids - set(prior_main_by_id)
    union_evidence = {
        "prior_main_candidate_union_count": len(prior_main_by_id),
        "merged_2078_residual_count": len(target_ids),
        "merged_2078_residual_ids_sha256": digest(canonical(sorted(target_ids))),
        "merged_2078_residual_disjoint_from_prior_main": True,
        "current_main_union_count": len(current_ids),
    }
    require(added_scaffold == sorted([TARGET_BINDING, f"{TARGET_ROOT}/PR-DRAFT.md", f"{TARGET_ROOT}/README.md", TARGET_ROWS, TARGET_GEN, TARGET_INV, f"{TARGET_ROOT}/selfcheck.py", f"{TARGET_ROOT}/validate.py"]), "E_MAIN_REBASELINE", "unexpected Scaffold additions in main rebaseline")
    prior_scaffold_changes = [path for path in changed_scaffold if path not in added_scaffold]
    require(not prior_scaffold_changes, "E_MAIN_REBASELINE", "unexpected existing Scaffold changes in main rebaseline")
    return {
        "previous_main_revision": PREVIOUS_BASE,
        "current_main_revision": BASE,
        "unchanged_fixed_input_count": len(comparisons),
        "unchanged_fixed_inputs": comparisons,
        "new_scaffold_paths": added_scaffold,
        "other_scaffold_changes": changed_scaffold,
        "merged_2078_objects": merged_2078_objects,
        "current_main_union": union_evidence,
    }


def expected_input_keys(ids: list[str]) -> set[tuple[str, str]]:
    keys = {(BASE, path) for path in MAIN_BUNDLES}
    keys |= {(TARGET, path) for path in (TARGET_GEN, TARGET_INV, TARGET_ROWS, TARGET_BINDING)}
    keys |= {(BASE, path) for path in (BOUNDARY, PHASE, DISPOSITION, DECISIONS, READ_AFTER, MANIFEST, FAILURE, CONSUMER, *L1_PATHS.values())}
    keys |= {(ARCHIVE_BASE, ARCHIVE_PREFIX + row_source_path(aid)) for aid in ids}
    return keys


def calculate_repin_stability(current_inv: dict) -> dict:
    previous_inv = parse_json_bytes(git_bytes(PREVIOUS_TARGET, TARGET_INV), "E_JSON", TARGET_INV)
    def rows(inv):
        return sorted(inv.get("overlap_reconciliation", {}).get("entries", []), key=lambda x: x.get("asset_id", ""))
    old_rows = rows(previous_inv)
    new_rows = rows(current_inv)
    old_conflicts = [x for x in old_rows if x.get("overlap_status") == "same_source_different_candidate_result"]
    new_conflicts = [x for x in new_rows if x.get("overlap_status") == "same_source_different_candidate_result"]
    require(len(old_rows) == len(new_rows) == 53 and len(old_conflicts) == len(new_conflicts) == 36, "E_REPIN_STABILITY", "previous/current overlap counts changed")
    old_ids = [x["asset_id"] for x in old_conflicts]
    new_ids = [x["asset_id"] for x in new_conflicts]
    old_sources = [(x["asset_id"], x["source_path"], x["source_sha256"]) for x in old_conflicts]
    new_sources = [(x["asset_id"], x["source_path"], x["source_sha256"]) for x in new_conflicts]
    old_candidates = [(x["asset_id"], x["target_category"], x["target_products"], x["existing_candidate_results"]) for x in old_conflicts]
    new_candidates = [(x["asset_id"], x["target_category"], x["target_products"], x["existing_candidate_results"]) for x in new_conflicts]
    return {
        "from_head": PREVIOUS_TARGET,
        "to_head": TARGET,
        "overlap_count_previous": len(old_rows), "overlap_count_current": len(new_rows),
        "conflict_count_previous": len(old_conflicts), "conflict_count_current": len(new_conflicts),
        "previous_overlap_rows_sha256": digest(canonical(old_rows)), "current_overlap_rows_sha256": digest(canonical(new_rows)),
        "previous_conflict_id_set_sha256": digest(canonical(old_ids)), "current_conflict_id_set_sha256": digest(canonical(new_ids)),
        "previous_conflict_source_identity_sha256": digest(canonical(old_sources)), "current_conflict_source_identity_sha256": digest(canonical(new_sources)),
        "previous_conflict_candidate_results_sha256": digest(canonical(old_candidates)), "current_conflict_candidate_results_sha256": digest(canonical(new_candidates)),
        "overlap_rows_unchanged": old_rows == new_rows,
        "conflict_id_set_unchanged": old_ids == new_ids,
        "conflict_source_identity_unchanged": old_sources == new_sources,
        "conflict_target_and_main_candidate_summaries_unchanged": old_candidates == new_candidates,
        "recomputed_main_candidate_result_rows": len(new_conflicts),
        "changed_overlap_row_count": sum(a != b for a, b in zip(old_rows, new_rows)) + abs(len(old_rows) - len(new_rows)),
        "history_only_previous_pin": True,
    }


def row_source_path(aid: str) -> str:
    inv = parse_json_bytes(git_bytes(TARGET, TARGET_INV), "E_JSON", TARGET_INV)
    hits = [r for r in inv["overlap_reconciliation"]["entries"] if r.get("asset_id") == aid and r.get("overlap_status") == "same_source_different_candidate_result"]
    require(len(hits) == 1, "E_TARGET_SET", f"no unique overlap entry {aid}")
    return hits[0]["source_path"]


def validate_bundle(bundle_dir: Path = BUNDLE) -> dict:
    records_path = bundle_dir / "classification-reconciliation.jsonl"
    inventory_path = bundle_dir / "inventory.json"
    records = [row for _, row in parse_jsonl_bytes(records_path.read_bytes(), str(records_path))]
    inv = parse_json_bytes(inventory_path.read_bytes(), "E_JSON", str(inventory_path))
    require(isinstance(inv, dict), "E_JSON", "inventory must be object")
    target_inv = parse_json_bytes(git_bytes(TARGET, TARGET_INV), "E_JSON", TARGET_INV)
    overlap_rows = target_inv.get("overlap_reconciliation", {}).get("entries", [])
    conflicts = [x for x in overlap_rows if x.get("overlap_status") == "same_source_different_candidate_result"]
    require(len(overlap_rows) == 53 and len(conflicts) == 36, "E_TARGET_SET", f"pinned overlap counts {len(overlap_rows)}/{len(conflicts)}")
    emitted_target_rows = parse_jsonl_bytes(git_bytes(TARGET, TARGET_ROWS), TARGET_ROWS)
    emitted_ids = [row.get("asset_id") for _, row in emitted_target_rows]
    require(len(emitted_ids) == 67 and len(set(emitted_ids)) == 67 and not (set(emitted_ids) & {r["asset_id"] for r in conflicts}), "E_TARGET_SET", "#2078 emitted target must be exact 67 new IDs disjoint from 36 conflicts")
    expected_ids = sorted(x["asset_id"] for x in conflicts)
    ids = [r.get("asset_id") for r in records]
    require(len(records) == 36 and ids == sorted(ids) and ids == expected_ids and len(set(ids)) == 36, "E_TARGET_SET", "exact ordered 36 conflict IDs required")
    require(inv.get("base_revision") == BASE and inv.get("archive_revision") == ARCHIVE_BASE and inv.get("target_head_pin") == TARGET, "E_INVENTORY_PIN", "revision lock drift")
    require(inv.get("main_rebaseline") == expected_main_rebaseline(), "E_MAIN_REBASELINE", "main fixed-input blob comparison missing or stale")
    require(inv.get("initial_target_head_pin") == INITIAL_TARGET and inv.get("target_head_pin_history") == [
        {"head": INITIAL_TARGET, "status": "initial_pin", "note": "first comparison pin requested before PR #2078 advanced"},
        {"head": PREVIOUS_TARGET, "status": "previous_repin", "note": "PR #2078 advanced from the initial pin; overlap53/conflict36 IDs and source identities were rechecked"},
        {"head": TARGET, "status": "current_repin", "note": "PR #2078 advanced from 8c8cf851; overlap53/conflict36 IDs, source identities, and candidate summaries were recomputed and remained unchanged; target inventory/generator pins were refreshed"},
    ], "E_INVENTORY_PIN", "target HEAD pin history drift")
    repin = calculate_repin_stability(target_inv)
    require(inv.get("repin_stability_from_previous_head") == repin and repin["history_only_previous_pin"] is True and repin["changed_overlap_row_count"] == 0, "E_REPIN_STABILITY", "previous/current #2078 pin comparison changed or missing")
    require(inv.get("subject_count") == 36 and inv.get("new_asset_research_count") == 0 and inv.get("adds_assets_to_main_union") is False, "E_INVENTORY_PIN", "new research denominator drift")
    require(inv.get("target_overlap_count") == 53 and inv.get("other_overlap_same_result_count") == 17 and inv.get("main_union_asset_count") == 496 and inv.get("prior_main_candidate_union_asset_count") == 429 and inv.get("merged_2078_residual_asset_count") == 67, "E_INVENTORY_PIN", "current/prior union denominator drift")
    prior_main_by_id = main_row_map()
    current_union_ids = current_main_union_ids(prior_main_by_id)
    current_union_evidence = {
        "prior_main_candidate_union_count": len(prior_main_by_id),
        "merged_2078_residual_count": len(current_union_ids - set(prior_main_by_id)),
        "merged_2078_residual_ids_sha256": digest(canonical(sorted(current_union_ids - set(prior_main_by_id)))),
        "merged_2078_residual_disjoint_from_prior_main": True,
        "current_main_union_count": len(current_union_ids),
    }
    require(inv.get("current_main_union") == current_union_evidence, "E_MAIN_UNION", "current main union evidence is stale")
    require(inv.get("target_head_follow_policy", "").startswith(f"STOP the current baseline/review if PR #2078 advances beyond {TARGET} or main advances beyond {BASE}."), "E_INVENTORY_PIN", "explicit target/main stop-and-rebaseline policy required")
    require(inv.get("difference_reason_vocabulary") == ["scope_difference", "evidence_span_difference", "research_method_state_difference", "classification_rule_difference", "unresolved"], "E_REASON_EVIDENCE", "reason vocabulary drift")
    require(inv.get("semantic_interpretation_conflict_count") == 0 and inv.get("semantic_interpretation_conflict_policy") == "A semantic interpretation conflict requires both sides to have independently researched source-specific evidence and to retain incompatible interpretations. The #2078 rows here are generic insufficient-basis fallbacks, so the 36 records contain zero such conflicts.", "E_REASON_EVIDENCE", "semantic interpretation conflict policy/count drift")
    require(inv.get("negative_cases") == EXPECTED_NEGATIVE_CASES, "E_NEGATIVE_CASES", "ordered expected negative case set drift")
    target_by_id = {x["asset_id"]: x for x in conflicts}
    main_by_id = prior_main_by_id
    path_to_id, l1_map, boundary_ranges, l1_ranges = pinned_target_method()
    actual_reason_counts = Counter()
    main_category_counts = Counter()
    target_category_counts = Counter()
    for row in records:
        aid = row["asset_id"]
        entry = target_by_id[aid]
        results = main_by_id.get(aid, [])
        require(len(results) == 1, "E_MAIN_RESULT", f"main row cardinality {aid}={len(results)}")
        main_record = results[0]["row"]
        require(path_to_id.get(entry["source_path"]) == aid, "E_TARGET_RESULT", f"target generic profile ID/path mismatch {aid}")
        source = row.get("source_identity", {})
        require(source.get("source_path") == entry["source_path"] and source.get("source_sha256") == entry["source_sha256"], "E_SOURCE_IDENTITY", f"source path/SHA does not match overlap pin {aid}")
        archive_path = ARCHIVE_PREFIX + entry["source_path"]
        tree = tree_entry(ARCHIVE_BASE, archive_path)
        data = git_bytes(ARCHIVE_BASE, archive_path)
        sha = digest(data)
        require(sha == entry["source_sha256"], "E_SOURCE_IDENTITY", f"archive bytes SHA mismatch {aid}")
        require(tree["blob"] == source["archive_provenance"].get("blob") and tree["type"] == "blob" and tree["mode"] in {"100644", "100755"}, "E_SOURCE_IDENTITY", f"archive tree metadata mismatch {aid}")
        require(manifest_digest(ARCHIVE_BASE, entry["source_path"]) == sha, "E_SOURCE_IDENTITY", f"archive MANIFEST mismatch {aid}")
        main_exact = main_record.get("source_exact", {})
        require(main_exact.get("source_path") == entry["source_path"] and main_exact.get("sha256") == sha and main_exact.get("blob") == tree["blob"], "E_SOURCE_IDENTITY", f"main side path/SHA/blob mismatch {aid}")
        target_source = [x for x in target_inv.get("archive_source_provenance", []) if x.get("asset_id") == aid]
        require(len(target_source) == 1, "E_SOURCE_IDENTITY", f"target archive provenance missing {aid}")
        tse = target_source[0]["source_exact"]
        require(target_source[0].get("source_path") == entry["source_path"] and tse.get("sha256") == sha and tse.get("blob") == tree["blob"], "E_SOURCE_IDENTITY", f"target side path/SHA/blob mismatch {aid}")
        target_exact = source.get("target_overlap_source_exact", {})
        for key in ("archive_path", "blob", "bytes", "line_count", "ledger_source_sha256", "sha256", "mode", "type", "ledger_digest_match", "archive_manifest_sha256", "archive_manifest_match", "archive_manifest_resolution", "read_mode"):
            require(target_exact.get(key) == tse.get(key), "E_SOURCE_IDENTITY", f"target overlap source metadata mismatch {aid}:{key}")
        require(source.get("identity_checks") == {
            "main_and_target_source_path_equal": True,
            "main_and_target_source_sha256_equal": True,
            "archive_blob_sha_manifest_all_match": True,
            "type_blob_regular_mode": True,
        }, "E_SOURCE_IDENTITY", f"identity proof flags missing {aid}")
        target = row.get("target_2078_result", {})
        target_result = target.get("classification_result", {})
        require(target_result.get("category") == entry["target_category"] and target_result.get("candidate_products") == entry["target_products"] == [], "E_TARGET_RESULT", f"target result mismatch {aid}")
        require(target_result.get("reason") == PROFILE_REASON and target_result.get("result_origin", "").startswith("#2078 generate.py literal profile"), "E_TARGET_RESULT", f"target fallback reason/provenance mismatch {aid}")
        tspan = target_span(data)
        require(target.get("source_spans", {}).get("semantic_span") == tspan, "E_SOURCE_SPAN", f"reconstructed target span mismatch {aid}")
        require(target.get("source_spans", {}).get("emission_status", "").startswith("reconstructed from pinned helper"), "E_SOURCE_SPAN", f"target span falsely represented as emitted {aid}")
        main_context = row.get("main_existing_result", {})
        main_result = main_context.get("result", {})
        main_cat = main_record.get("classification_category")
        main_products = main_record.get("candidate_products", [])
        require(main_result.get("category") == main_cat and main_result.get("candidate_products") == main_products and main_result.get("reason") == main_record.get("classification_reason"), "E_MAIN_RESULT", f"main candidate result mismatch {aid}")
        require(same_candidate_invariant(main_cat, main_products) and same_candidate_invariant(target_result["category"], target_result["candidate_products"]), "E_MAIN_RESULT", f"category/product invariant {aid}")
        if main_cat != "insufficient_basis" or main_products != []:
            pass
        require(main_context.get("method", {}).get("bundle") == results[0]["bundle"] and main_context.get("method", {}).get("row") == results[0]["line"] and main_context.get("method", {}).get("row_sha256") == results[0]["row_sha256"], "E_MAIN_RESULT", f"main row provenance mismatch {aid}")
        require(main_context.get("source_spans") == main_exact.get("semantic_anchors"), "E_SOURCE_SPAN", f"main source spans changed {aid}")
        require(main_context.get("product_boundary_evidence") == main_record.get("boundary_evidence") and main_context.get("l1_evidence") == main_record.get("l1_evidence"), "E_PRODUCT_EVIDENCE", f"main boundary/L1 evidence changed {aid}")
        require(main_context.get("counterevidence") == main_record.get("manual_semantic_review", {}).get("boundary_counterevidence", []), "E_PRODUCT_EVIDENCE", f"main counterevidence changed {aid}")
        require(bool(main_context.get("counterevidence")), "E_PRODUCT_EVIDENCE", f"main counterevidence missing {aid}")
        for product in main_products:
            require(product in PRODUCTS and product in main_record.get("l1_evidence", {}), "E_PRODUCT_EVIDENCE", f"main candidate outside four products or L1 absent {aid}")
        expected_pool = expected_target_boundary(l1_map, boundary_ranges, l1_ranges)
        require(target.get("product_boundary_and_l1") == expected_pool, "E_PRODUCT_EVIDENCE", f"target boundary/L1 pool changed {aid}")
        counter = target.get("counterevidence", {})
        require(counter.get("status") == "not_recorded_for_overlap_row" and "counterevidence_authored_by_target_overlap_result" not in counter, "E_PRODUCT_EVIDENCE", f"target counterevidence availability misrepresented {aid}")
        require(counter.get("available_human_counterevidence") == expected_pool["four_product_l1_comparison_pool"], "E_PRODUCT_EVIDENCE", f"target L1 comparison pool changed {aid}")
        require(target.get("method", {}).get("classification_rule") == "insufficient_basis; candidate_products=[]" and target.get("method", {}).get("selection", "").endswith("span length 1"), "E_TARGET_RESULT", f"target method drift {aid}")
        require(target.get("method", {}).get("generator_source_sha256") == digest(git_bytes(TARGET, TARGET_GEN)) and target.get("method", {}).get("inventory_overlap_row_sha256") == digest(canonical(entry)), "E_TARGET_RESULT", f"target revision evidence pin mismatch {aid}")
        require(target.get("phase_implementation_context") == phase_context(aid), "E_PHASE_STATE", f"target phase/implementation context mismatch {aid}")
        require(target.get("history_failure_consumer_context") == target_history(aid), "E_PHASE_STATE", f"target history/failure/consumer context mismatch {aid}")
        require(main_context.get("phase_implementation_context", {}).get("phase_ledger") == main_record.get("phase_ledger") and main_context.get("phase_implementation_context", {}).get("legacy_history_failure_consumer") == main_record.get("legacy_history_failure_consumer"), "E_PHASE_STATE", f"main phase/history evidence changed {aid}")
        require(row.get("authority_effect") == "none" and row.get("formal_asset_classification_updated") is False and row.get("formal_route_updated") is False and row.get("phase_admission_updated") is False and row.get("successor_assignment") is None and row.get("implementation_status_promoted") is False and row.get("consumer_closure_created") is False and row.get("new_build_allowed") is False, "E_AUTHORITY", f"formal boundary changed {aid}")
        resolution = row.get("resolution", {})
        require(resolution.get("status") == "comparison_state_reconciled; main_candidate_disposition_unapproved" and resolution.get("comparison_treatment") == "research_method_state_difference" and resolution.get("semantic_conflict_decision_required") is False and resolution.get("main_candidate_disposition") == "unapproved; retain for the ordinary candidate disposition process; this comparison neither approves nor rejects it" and resolution.get("questions") == [] and resolution.get("winner_selected") is False and resolution.get("formal_route_created") is False, "E_AUTHORITY", f"comparison incorrectly requests a per-asset conflict decision or changes candidate disposition {aid}")
        target_scope = target.get("method", {}).get("scope", {})
        expected_scope = expected_target_scope(entry, aid, path_to_id, current_union_ids)
        require(target_scope == expected_scope, "E_REASON_EVIDENCE", f"scope membership evidence mismatch {aid}")
        actual_reasons = [x.get("type") for x in row.get("difference_reason_candidates", [])]
        expected_reasons = expected_reason_types(main_record, tspan, main_exact.get("semantic_anchors", []), expected_scope)
        require(actual_reasons == expected_reasons and all(x in inv["difference_reason_vocabulary"] for x in actual_reasons), "E_REASON_EVIDENCE", f"reason candidate set mismatch {aid}")
        require("interpretation_conflict" not in actual_reasons, "E_REASON_EVIDENCE", f"fallback treated as independent semantic interpretation {aid}")
        if "research_method_state_difference" in actual_reasons:
            require(main_record.get("manual_semantic_review", {}).get("status") and main_exact.get("semantic_anchors") and target_result.get("reason") == PROFILE_REASON and target.get("method", {}).get("classification_rule") == "insufficient_basis; candidate_products=[]", "E_REASON_EVIDENCE", f"research-state difference lacks independent main research and generic target fallback evidence {aid}")
        for reason in row["difference_reason_candidates"]:
            require(reason.get("evidence_refs") and isinstance(reason.get("basis"), str) and reason["basis"], "E_REASON_EVIDENCE", f"unsubstantiated reason {aid}")
            if reason.get("type") == "research_method_state_difference":
                require(reason.get("evidence_refs") == ["main.manual_semantic_review", "main.source_spans", "target.profile_reason", "target.method.classification_rule"], "E_REASON_EVIDENCE", f"research-state evidence references mismatch {aid}")
                require(reason.get("basis") == "The main side has source-specific semantic review and spans, while #2078 supplies only a generic insufficient-basis fallback for an unresearched-prefix set. This records research, method, and state difference; it is not a semantic interpretation conflict because both sides did not independently research the source.", "E_REASON_EVIDENCE", f"research-state basis mismatch {aid}")
            if reason.get("type") == "scope_difference":
                require(reason.get("evidence_refs") == ["target.scope.scope_membership_evidence", "target.overlap_result", "main.input_union"], "E_REASON_EVIDENCE", f"scope evidence references mismatch {aid}")
                require(reason.get("basis") == "The #2078 UNRESEARCHED_PREFIX_ASSET_PATHS fallback reason asserts this asset ID was absent from prior research, while its overlap row and the retained source-specific result place it in the prior 429-ID union. The current main union is 496 after adding 67 disjoint residual assets; this is a research-scope difference for human review, not a semantic conflict.", "E_REASON_EVIDENCE", f"scope evidence basis mismatch {aid}")
        main_category_counts[main_cat] += 1
        target_category_counts[target_result["category"]] += 1
        actual_reason_counts.update(actual_reasons)
    require(inv.get("category_counts_main_existing") == dict(sorted(main_category_counts.items())), "E_INVENTORY_PIN", "main category count drift")
    require(inv.get("category_counts_target_2078") == dict(sorted(target_category_counts.items())), "E_INVENTORY_PIN", "target category count drift")
    require(inv.get("difference_reason_candidate_counts") == dict(sorted(actual_reason_counts.items())), "E_INVENTORY_PIN", "reason count drift")
    require(actual_reason_counts["research_method_state_difference"] == 36 and actual_reason_counts["interpretation_conflict"] == 0, "E_REASON_EVIDENCE", "generic target fallback must yield 36 research-state differences and zero semantic interpretation conflicts")
    raw_records = records_path.read_bytes()
    require(inv.get("outputs", {}).get("records_sha256") == digest(raw_records) and inv.get("outputs", {}).get("records_bytes") == len(raw_records) and inv.get("outputs", {}).get("record_count") == len(records), "E_OUTPUT_DIGEST", "records output digest/size/count stale")
    expected_inv_hash = digest(canonical({k: v for k, v in inv.items() if k != "inventory_sha256"}))
    require(inv.get("inventory_sha256") == expected_inv_hash, "E_OUTPUT_DIGEST", "inventory self digest stale")
    expected_keys = expected_input_keys(expected_ids)
    input_rows = inv.get("input_digests", [])
    input_keys = [(x.get("revision"), x.get("path")) for x in input_rows]
    require(len(input_keys) == len(set(input_keys)) and set(input_keys) == expected_keys, "E_INPUT_DIGEST", "upstream exact path/revision set mismatch")
    for item in input_rows:
        path, rev = item["path"], item["revision"]
        current = git_bytes(rev, path)
        tree = tree_entry(rev, path)
        require(item.get("sha256") == digest(current) and item.get("bytes") == len(current) and item.get("blob") == tree["blob"] and item.get("type") == tree["type"] and item.get("mode") == tree["mode"], "E_INPUT_DIGEST", f"upstream digest/tree mismatch {rev}:{path}")
    target_pins = inv.get("target_overlap_reconciliation_pin", {})
    require(target_pins.get("inventory_sha256") == digest(git_bytes(TARGET, TARGET_INV)) and target_pins.get("target_generator_sha256") == digest(git_bytes(TARGET, TARGET_GEN)) and target_pins.get("target_records_sha256") == digest(git_bytes(TARGET, TARGET_ROWS)), "E_TARGET_RESULT", "#2078 target object pin changed")
    require(target_pins.get("overlap_rows_sha256") == digest(canonical(conflicts)), "E_TARGET_RESULT", "#2078 overlap rows pin changed")
    # Binding upstreams must be local, non-archive inputs at the fixed main revision.
    binding = parse_json_bytes(BINDING.read_bytes(), "E_JSON", str(BINDING))
    expected_artifacts = binding.get("artifacts", [])
    require(str(BINDING.relative_to(ROOT)) in expected_artifacts and str(records_path.relative_to(ROOT)) in expected_artifacts and str(inventory_path.relative_to(ROOT)) in expected_artifacts, "E_BINDING", "artifact registration incomplete")
    local_inputs = {x["path"]: x["sha256"].removeprefix("sha256:") for x in input_rows if x["revision"] == BASE and not x["archive_static_only"] and not x["path"].startswith("archive/")}
    binding_inputs = {x.get("path"): x.get("sha256") for x in binding.get("upstream", [])}
    require(binding_inputs == local_inputs, "E_BINDING", "binding upstream must exactly match fixed-main nonarchive input digests")
    require(binding.get("id") == "SCF-B-0144" and binding.get("kind") == "scaffold", "E_BINDING", "binding identity/kind")
    require(binding.get("replacement", {}).get("status") == "pending" and binding.get("replacement", {}).get("formal_artifacts") == [], "E_BINDING", "formal replacement present")
    require(any("LABO" in s for s in binding.get("operations", {}).get("forbidden", [])), "E_BINDING", "LABO exclusion absent")
    require(binding.get("verification", {}).get("negative_cases") == inv.get("negative_cases"), "E_NEGATIVE_CASES", "binding/inventory negative case lists differ")
    return {"records": len(records), "main_categories": dict(main_category_counts), "target_categories": dict(target_category_counts), "reason_counts": dict(actual_reason_counts), "input_digests": len(input_rows)}


def manifest_digest(revision: str, source_path: str) -> str:
    found = []
    for line in git_bytes(revision, MANIFEST).decode("utf-8", errors="replace").splitlines():
        if line.endswith(" " + source_path):
            sha, path = line.split(maxsplit=1)
            if path == source_path:
                found.append("sha256:" + sha)
    require(len(found) == 1, "E_SOURCE_IDENTITY", f"manifest line count {source_path}")
    return found[0]


def main() -> int:
    try:
        stats = validate_bundle()
    except CheckError as exc:
        print(str(exc), file=sys.stderr)
        return 1
    print(f"SCF-B-0144 validate PASS records={stats['records']} main={stats['main_categories']} target={stats['target_categories']} reasons={stats['reason_counts']} inputs={stats['input_digests']}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
