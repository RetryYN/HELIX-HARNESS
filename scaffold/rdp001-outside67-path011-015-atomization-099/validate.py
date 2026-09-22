#!/usr/bin/env python3
"""Fail-closed static validator for PATH-011..015 atomization."""
from __future__ import annotations

import hashlib
import json
import subprocess
from collections import Counter, defaultdict
from pathlib import Path

from source_classification import derive_source_diff, generic_metadata_line, metadata_line_numbers

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
BASE = "72b9f368a044709437841c5e862f01802b1a88ec"
PRE = "2d4991042be55268bac30a8bbcdac45b3865030a"
ARCH = "064280b5c1c5c98f949e6e3be5ef87cbe4a4b658"
HOLDING_REL = "docs/governance/pre-isolation-outside-holding-67-source-holding.jsonl"
REGISTER_REL = "docs/governance/management-provisional-requirement-register.jsonl"
PRIOR = ROOT / "scaffold/rdp001-outside67-web-webos-l2-gap-057/semantic-atoms.jsonl"
SELECTED_IDS = [f"OUTSIDE67-PATH-{n:03d}" for n in range(11, 16)]
FOUR_PRODUCTS = ["HELIX-HARNESS", "HELIX-OS", "HELIX-Web", "HELIX-Web-OS"]
LEDGERS = [
    "docs/governance/legacy-asset-disposition.jsonl",
    "docs/governance/legacy-asset-decisions.jsonl",
    "docs/governance/legacy-asset-copy-read-after.jsonl",
    "docs/governance/legacy-asset-decision-log.md",
    "docs/governance/legacy-asset-phase-product-classification-bootstrap.jsonl",
    "docs/governance/legacy-requirement-implementation-crosswalk-bootstrap.jsonl",
    "docs/governance/legacy-ir-product-unit-decomposition-bootstrap.jsonl",
]


def fail(code: str, detail: str = "") -> None:
    raise AssertionError(code + (": " + detail if detail else ""))


def sha(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def blob_oid(data: bytes) -> str:
    return hashlib.sha1(f"blob {len(data)}\0".encode() + data).hexdigest()


def git_show(revision: str, path: str) -> bytes:
    return subprocess.check_output(["git", "show", f"{revision}:{path}"], cwd=ROOT)


def read_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def read_jsonl(path: Path):
    return [json.loads(line) for line in path.read_text(encoding="utf-8").splitlines() if line.strip()]


def atom_digest(atom: dict) -> str:
    return sha(json.dumps(atom, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode("utf-8"))


def check_ancestor() -> None:
    proc = subprocess.run(["git", "merge-base", "--is-ancestor", BASE, "HEAD"], cwd=ROOT)
    if proc.returncode != 0:
        fail("E_BASE_NOT_ANCESTOR", BASE)


def check_inventory(inv: dict) -> None:
    expected = {"schema", "candidate_id", "scaffold_binding_id", "status", "authority_effect", "meaning_change_applied", "successor_requirement_ids", "human_decision_ref", "formal_register_append", "old_runtime_test_ci_execution", "research_completion", "scope", "source_holding", "classification_basis", "four_products", "documents", "line_accounting", "semantic_atoms", "legacy_evidence", "findings", "unresolved_questions", "prohibited_inference", "residuals", "verification_scope"}
    if set(inv) != expected:
        fail("E_INVENTORY_KEYS")
    if inv["scaffold_binding_id"] != "SCF-B-0099" or inv["status"] != "findings_only" or inv["authority_effect"] != "none" or inv["meaning_change_applied"] or inv["successor_requirement_ids"] or inv["human_decision_ref"] is not None or inv["formal_register_append"] or inv["old_runtime_test_ci_execution"]:
        fail("E_INVENTORY_PROMOTION")
    scope = inv["scope"]
    if scope["base_origin_main"] != BASE or scope["base_origin_main_observed_at_start"] != BASE or scope["holding_path_revision_pair_denominator"] != 67 or scope["holding_record_count"] != 67 or scope["selected_path_revision_pair_count"] != 5 or scope["selected_source_document_count"] != 5 or scope["unexplored_path_revision_pair_count"] != 62:
        fail("E_DENOMINATOR")
    if scope["holding_sha256"] != sha(git_show(BASE, HOLDING_REL)) or scope["management_register_sha256"] != sha(git_show(BASE, REGISTER_REL)):
        fail("E_UPSTREAM_DIGEST")
    for path, digest in scope["legacy_ledger_sha256"].items():
        if path not in LEDGERS or digest != sha(git_show(BASE, path)):
            fail("E_LEDGER_BASE_DIGEST", path)
    if inv["source_holding"]["selected_item_ids"] != SELECTED_IDS or inv["source_holding"]["selected_ordinals"] != [11, 12, 13, 14, 15] or inv["source_holding"]["unselected_count"] != 62:
        fail("E_SELECTED_SCOPE")
    if any(row["product"] not in FOUR_PRODUCTS or row["status"] != "boundary_candidate_only" or row["authority_effect"] != "none" for row in inv["four_products"]):
        fail("E_PRODUCT_BOUNDARY")
    if inv["research_completion"]["path_atomization_complete"] or inv["research_completion"]["selected_line_residual_count"] != 0:
        fail("E_COMPLETION_PROMOTION")
    for key in ("findings", "unresolved_questions", "prohibited_inference"):
        for row in inv[key]:
            if set(row) != {"id", "status", "text"} or not row["id"] or not row["text"]:
                fail("E_CATALOG_KEYSET", key)


def source_holdings() -> dict[str, dict]:
    rows = [json.loads(line) for line in git_show(BASE, HOLDING_REL).decode().splitlines() if line.strip()]
    by = {row["source_item_id"]: row for row in rows}
    if set(SELECTED_IDS) - set(by):
        fail("E_HOLDING_SCOPE")
    return {sid: by[sid] for sid in SELECTED_IDS}


def check_selected(rows: list[dict], holds: dict[str, dict]) -> dict[str, tuple[list[str], list[str]]]:
    if [row.get("source_item_id") for row in rows] != SELECTED_IDS:
        fail("E_SELECTED_ORDER")
    snapshots = {}
    for row in rows:
        sid = row["source_item_id"]
        hold = holds[sid]
        if row["candidate_product_status"] != "unknown_path_based_candidate_only" or row["candidate_phase_status"] != "unknown_path_based_candidate_only" or row["status"]["authority_effect"] != "none" or row["status"]["implementation_status"] != "unknown" or row["status"]["degradation_status"] != "unknown" or row["status"]["failure_status"] != "unknown" or row["status"]["consumer_status"] != "unknown" or row["status"]["decision_status"] != "unknown":
            fail("E_SELECTED_PROMOTION", sid)
        pre = git_show(PRE, hold["source_path"])
        arch = git_show(ARCH, hold["source_path"])
        for side, data, meta in (("pre_isolation", pre, row["pre_isolation"]), ("archive_revision", arch, row["archive_revision"])):
            if meta["commit"] != (PRE if side == "pre_isolation" else ARCH) or meta["bytes"] != len(data) or meta["sha256"] != sha(data) or meta["blob_oid"] != blob_oid(data) or meta["line_count"] != len(data.decode().splitlines()):
                fail("E_SOURCE_METADATA", sid)
            snap = HERE / "source-snapshots" / sid / ("pre-isolation.md" if side == "pre_isolation" else "archive-revision.md")
            if not snap.exists() or snap.read_bytes() != data:
                fail("E_SNAPSHOT", sid + ":" + side)
        snapshots[sid] = (pre.decode().splitlines(), arch.decode().splitlines())
        if row["source_path"] != hold["source_path"] or row["candidate_product"] != hold["reported_path_scope"]["product_scope"] or row["candidate_phase"] != hold["reported_path_scope"]["phase_scope"]:
            fail("E_HOLDING_LABEL", sid)
    return snapshots


def check_atoms(atoms: list[dict], reused: list[dict], snapshots, holds) -> None:
    prior = [json.loads(line) for line in PRIOR.read_text(encoding="utf-8").splitlines() if line.strip() and json.loads(line).get("source_item_id") == "OUTSIDE67-PATH-011"]
    prior_by_id = {row["atom_id"]: row for row in prior}
    pre_lines, _ = snapshots["OUTSIDE67-PATH-011"]
    valid_prior = {row["atom_id"] for row in prior if row["atomization_status"] == "atomized_candidate" and row["source_fragment"]["line"] not in metadata_line_numbers(pre_lines)}
    if len(reused) != len(valid_prior) or {row["atom_id"] for row in reused} != valid_prior:
        fail("E_REUSED_ATOM_SCOPE")
    for ref in reused:
        old = prior_by_id.get(ref["atom_id"])
        if ref["source_item_id"] != "OUTSIDE67-PATH-011" or ref["source_bundle"] != "scaffold/rdp001-outside67-web-webos-l2-gap-057" or ref["source_atom_sha256"] != atom_digest(old) or old["atomization_status"] != "atomized_candidate" or ref["category"] != "atomized_candidate":
            fail("E_REUSED_ATOM_DIGEST", ref["atom_id"])
    if len({row["atom_id"] for row in atoms}) != len(atoms) or any(row["source_item_id"] == "OUTSIDE67-PATH-011" for row in atoms):
        fail("E_NEW_ATOM_DUPLICATE_OR_PRIOR")
    for row in atoms:
        sid = row["source_item_id"]
        if sid not in SELECTED_IDS[1:] or set(row) != {"action", "actor", "atom_id", "atomization_status", "authority_effect", "candidate_granularity", "candidate_inference", "candidate_kind", "candidate_phase", "candidate_product", "candidate_product_candidates", "condition", "consumer_status", "current_degradation_status", "current_implementation_status", "current_requirement_status", "decision_status", "degradation_status", "diff_observation", "failure_status", "human_decision_ref", "implementation_status", "inference_status", "inherited_predicate", "legacy_degradation_status", "legacy_implementation_status", "legacy_source_requirement_id", "meaning_change_applied", "negative_or_guard", "normalized_statement", "normalized_statement_status", "phase_status", "retained_meaning", "revision_pair", "semantic_action", "semantic_condition", "semantic_subject", "sequence", "source_fragment", "source_item_id", "source_line_shared", "source_ordinal", "source_path", "source_semantic_status", "source_support", "successor_requirement_ids", "unresolved_questions", "span_kind"}:
            fail("E_ATOM_KEYS", row.get("atom_id", ""))
        line = row["source_fragment"]["line"]
        pre, arch = snapshots[sid]
        if line < 1 or line > len(pre) or pre[line - 1] != arch[line - 1] or line in metadata_line_numbers(pre) or generic_metadata_line(pre[line - 1]) or row["atomization_status"] != "atomized_candidate" or row["source_fragment"]["text"] != pre[line - 1]:
            fail("E_ATOM_LINE_BOUNDARY", row["atom_id"])
        if row["candidate_product"] != "unresolved_cross_product" or row["candidate_product_candidates"] != FOUR_PRODUCTS or row["authority_effect"] != "none" or row["candidate_inference"] or row["inference_status"] != "none" or row["implementation_status"] != "unknown" or row["degradation_status"] != "unknown" or row["current_implementation_status"] != "unknown" or row["current_degradation_status"] != "unknown" or row["failure_status"] != "unknown" or row["consumer_status"] != "unknown" or row["decision_status"] != "unknown" or row["phase_status"] != "unknown_path_based_candidate_only" or row["successor_requirement_ids"] or row["human_decision_ref"] is not None or row["meaning_change_applied"]:
            fail("E_ATOM_PROMOTION", row["atom_id"])


def check_diffs(source_diffs: dict, snapshots) -> None:
    if set(source_diffs) != set(SELECTED_IDS):
        fail("E_DIFF_SCOPE")
    for sid in SELECTED_IDS:
        expected = derive_source_diff(*snapshots[sid])
        actual = source_diffs[sid]
        if set(actual) != set(expected):
            fail("E_DIFF_KEYS", sid)
        if actual != expected:
            fail("E_DIFF_DERIVATION", sid)
        if actual["meaning_equivalence"] != "unresolved":
            fail("E_MEANING_EQUIVALENCE_PROMOTION", sid)


def check_coverage(coverage: list[dict], snapshots, reused, atoms, inv) -> None:
    expected_keys = set()
    for sid in SELECTED_IDS:
        pre, arch = snapshots[sid]
        expected_keys |= {(sid, "pre", n) for n in range(1, len(pre) + 1)}
        expected_keys |= {(sid, "archive", n) for n in range(1, len(arch) + 1)}
    actual_pre = [(row["source_item_id"], row["pre_line"]) for row in coverage if row["pre_line"] is not None]
    actual_arch = [(row["source_item_id"], row["archive_line"]) for row in coverage if row["archive_line"] is not None]
    if len(actual_pre) != len(set(actual_pre)) or len(actual_arch) != len(set(actual_arch)) or set(actual_pre) != {(sid, n) for sid in SELECTED_IDS for n in range(1, len(snapshots[sid][0]) + 1)} or set(actual_arch) != {(sid, n) for sid in SELECTED_IDS for n in range(1, len(snapshots[sid][1]) + 1)}:
        fail("E_LINE_COVERAGE_SCOPE")
    atom_by_line = {(row["source_item_id"], row["source_fragment"]["line"]): row["atom_id"] for row in atoms}
    reused_by_line = defaultdict(list)
    for row in reused:
        reused_by_line[(row["source_item_id"], row["source_line"])].append(row["atom_id"])
    counts = Counter()
    for row in coverage:
        sid = row["source_item_id"]
        pre, arch = snapshots[sid]
        if row["pre_line"] is not None and row["pre_text"] != pre[row["pre_line"] - 1]:
            fail("E_COVERAGE_PRE_TEXT", sid)
        if row["archive_line"] is not None and row["archive_text"] != arch[row["archive_line"] - 1]:
            fail("E_COVERAGE_ARCH_TEXT", sid)
        if row["pre_text"] is not None and row["pre_line_sha256"] != sha(row["pre_text"].encode()):
            fail("E_COVERAGE_PRE_DIGEST", sid)
        if row["archive_text"] is not None and row["archive_line_sha256"] != sha(row["archive_text"].encode()):
            fail("E_COVERAGE_ARCH_DIGEST", sid)
        if row["category"] not in {"atomized_candidate", "metadata_only", "composite_unresolved"}:
            fail("E_COVERAGE_CATEGORY", sid)
        pre_metadata = metadata_line_numbers(pre)
        archive_metadata = metadata_line_numbers(arch)
        pre_is_metadata = row["pre_line"] is None or row["pre_line"] in pre_metadata or generic_metadata_line(row["pre_text"] or "")
        archive_is_metadata = row["archive_line"] is None or row["archive_line"] in archive_metadata or generic_metadata_line(row["archive_text"] or "")
        if row["category"] == "metadata_only" and not (pre_is_metadata and archive_is_metadata):
            fail("E_NORMATIVE_METADATA_FALLBACK", f"{sid}:{row.get('pre_line')}:{row.get('archive_line')}")
        if row["pre_line"] is not None and row["archive_line"] is not None and pre_is_metadata and archive_is_metadata and row["category"] != "metadata_only":
            fail("E_METADATA_CATEGORY", f"{sid}:{row['pre_line']}:{row['archive_line']}")
        expected_atoms = reused_by_line.get((sid, row["pre_line"]), []) if sid == "OUTSIDE67-PATH-011" else ([atom_by_line[(sid, row["pre_line"])]] if (sid, row["pre_line"]) in atom_by_line else [])
        if row["atom_ids"] != expected_atoms:
            fail("E_COVERAGE_ATOM_IDS", sid)
        if (row["category"] == "atomized_candidate") != bool(row["atom_ids"]):
            fail("E_COVERAGE_ATOMIZED_BIDIRECTIONAL", f"{sid}:{row.get('pre_line')}:{row.get('archive_line')}")
        counts[row["category"]] += 1
    line_accounting = inv["line_accounting"]
    if dict(counts) != line_accounting["category_counts"] or line_accounting["unique_coverage_record_count"] != len(coverage) or line_accounting["selected_line_residual_count"] != 0 or line_accounting["path011_reused_atom_count"] != len(reused) or line_accounting["new_atom_count"] != len(atoms) or line_accounting["total_atom_references"] != len(reused) + len(atoms):
        fail("E_LINE_ACCOUNTING")


def check_legacy(rows: list[dict], holds) -> None:
    if len(rows) != len(SELECTED_IDS) * len(LEDGERS):
        fail("E_LEGACY_COUNT")
    for row in rows:
        sid, path = row["source_item_id"], row["ledger_path"]
        if sid not in SELECTED_IDS or path not in LEDGERS or row["scan_commit"] != BASE or any(row[key] != "unknown" for key in ("implementation_status", "degradation_status", "failure_status", "consumer_status", "decision_status")) or row["no_inference_from_absence"] is not True:
            fail("E_LEGACY_BOUNDARY", sid)
        data = git_show(BASE, path)
        if row["ledger_sha256"] != sha(data):
            fail("E_LEGACY_DIGEST", path)
        hold = holds[sid]
        terms = [sid, hold["source_path"], hold["pre_isolation"]["blob_oid"], hold["archive"]["blob_oid"]]
        anchors = []
        for no, line in enumerate(data.decode("utf-8", errors="replace").splitlines(), 1):
            matched = [term for term in terms if term in line]
            if matched:
                anchors.append({"line": no, "text_sha256": sha(line.encode()), "matched_terms": matched})
        want = "exact_text_hit" if anchors else "no_exact_text_hit"
        if row["lookup"] != want or row["anchors"] != anchors:
            fail("E_LEGACY_LOOKUP", sid + ":" + path)


def validate(inv=None, selected=None, atoms=None, reused=None, coverage=None, legacy=None, source_diffs=None, holds=None, snapshots=None):
    check_ancestor()
    inv = read_json(HERE / "inventory.json") if inv is None else inv
    selected = read_jsonl(HERE / "selected-source-items.jsonl") if selected is None else selected
    atoms = read_jsonl(HERE / "semantic-atoms.jsonl") if atoms is None else atoms
    reused = read_jsonl(HERE / "reused-atom-references.jsonl") if reused is None else reused
    coverage = read_jsonl(HERE / "line-coverage.jsonl") if coverage is None else coverage
    legacy = read_jsonl(HERE / "legacy-evidence.jsonl") if legacy is None else legacy
    source_diffs = read_json(HERE / "source-diffs.json") if source_diffs is None else source_diffs
    holds = source_holdings() if holds is None else holds
    snapshots = check_selected(selected, holds) if snapshots is None else snapshots
    check_inventory(inv)
    check_atoms(atoms, reused, snapshots, holds)
    check_diffs(source_diffs, snapshots)
    check_coverage(coverage, snapshots, reused, atoms, inv)
    check_legacy(legacy, holds)
    print("PASS validate: PATH-011..015 full pre/archive coverage, reused PATH-011 candidates, new atoms and three-category accounting")


if __name__ == "__main__":
    validate()
