#!/usr/bin/env python3
"""PATH-006..010 source-line/atom candidate scaffold validator.

The check is static and fail-closed. It validates exact Git-object metadata, the full
183-line selected scope, the reused PATH-008 atom references, and the separation between
candidate evidence and formal product/phase/owner/implementation decisions.
"""
from __future__ import annotations

import hashlib
import json
import subprocess
from collections import Counter, defaultdict
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
BASE = "16f694ae07cdb2d56e15045054c147c7a15d3275"
PRE = "2d4991042be55268bac30a8bbcdac45b3865030a"
ARCH = "064280b5c1c5c98f949e6e3be5ef87cbe4a4b658"
HOLDING = ROOT / "docs/governance/pre-isolation-outside-holding-67-source-holding.jsonl"
REGISTER = ROOT / "docs/governance/management-provisional-requirement-register.jsonl"
INV = HERE / "inventory.json"
SELECTED = HERE / "selected-source-items.jsonl"
ATOMS = HERE / "semantic-atoms.jsonl"
REUSED = HERE / "reused-atom-references.jsonl"
COVERAGE = HERE / "line-coverage.jsonl"
DIFFS = HERE / "source-diffs.json"
LEGACY = HERE / "legacy-evidence.jsonl"
PRIOR_ATOMS = ROOT / "scaffold/rdp001-outside67-web-webos-l2-gap-057/semantic-atoms.jsonl"

PRODUCTS = ["HELIX-HARNESS", "HELIX-OS", "HELIX-Web", "HELIX-Web-OS"]
SELECTED_IDS = [f"OUTSIDE67-PATH-{n:03d}" for n in range(6, 11)]
SOURCE_INFO = {
    "OUTSIDE67-PATH-006": {"source_path": "docs/design/helix-os/README.md", "current_path": "docs/helix-os/README.md", "product": "HELIX-OS", "phase": "L1-L2-entry", "bundle": "scaffold/rdp001-outside67-product-entry-followup-076"},
    "OUTSIDE67-PATH-007": {"source_path": "docs/design/helix-web-os/L1-planning/system-intent.md", "current_path": "docs/helix-web-os/L1-planning/system-intent.md", "product": "HELIX-Web-OS", "phase": "L1-planning", "bundle": "scaffold/rdp001-outside67-boundary-followup-073"},
    "OUTSIDE67-PATH-008": {"source_path": "docs/design/helix-web-os/L2-requirements/service-governance-requirements.md", "current_path": "docs/helix-web-os/L2-requirements/service-governance-requirements.md", "product": "HELIX-Web-OS", "phase": "L2-requirements", "bundle": "scaffold/rdp001-outside67-web-webos-l2-gap-057"},
    "OUTSIDE67-PATH-009": {"source_path": "docs/design/helix-web-os/README.md", "current_path": "docs/helix-web-os/README.md", "product": "HELIX-Web-OS", "phase": "L1-L2-entry", "bundle": "scaffold/rdp001-outside67-product-entry-followup-076"},
    "OUTSIDE67-PATH-010": {"source_path": "docs/design/helix-web/L1-planning/product-intent.md", "current_path": "docs/helix-web/L1-planning/product-intent.md", "product": "HELIX-Web", "phase": "L1-planning", "bundle": "scaffold/rdp001-outside67-boundary-followup-073"},
}
METADATA_LINES = {
    "OUTSIDE67-PATH-006": {1, 2, 4, 11, 15, 16, 17, 22},
    "OUTSIDE67-PATH-007": {1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 17, 18, 24, 25, 26, 27, 28, 36, 37, 38, 42, 45, 46, 47},
    "OUTSIDE67-PATH-009": {1, 2, 8, 9, 10, 11, 12},
    "OUTSIDE67-PATH-010": {1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 17, 18, 21, 22, 23, 27, 28, 29, 36, 38, 39, 44, 45, 46, 50, 51, 52},
}
ATOMIZED_LINES = {"OUTSIDE67-PATH-006": {3, 8, 10, 23}, "OUTSIDE67-PATH-009": set(), "OUTSIDE67-PATH-007": set(), "OUTSIDE67-PATH-010": set()}
EXPECTED_COUNTS = {"OUTSIDE67-PATH-006": {"metadata_only": 8, "atomized_candidate": 4, "composite_unresolved": 13}, "OUTSIDE67-PATH-007": {"metadata_only": 27, "atomized_candidate": 0, "composite_unresolved": 23}, "OUTSIDE67-PATH-008": {"metadata_only": 0, "atomized_candidate": 6, "composite_unresolved": 32}, "OUTSIDE67-PATH-009": {"metadata_only": 7, "atomized_candidate": 0, "composite_unresolved": 7}, "OUTSIDE67-PATH-010": {"metadata_only": 32, "atomized_candidate": 0, "composite_unresolved": 24}}
OLD_LEDGER_PATHS = [
    "docs/governance/legacy-asset-disposition.jsonl", "docs/governance/legacy-asset-decisions.jsonl", "docs/governance/legacy-asset-copy-read-after.jsonl", "docs/governance/legacy-asset-decision-log.md", "docs/governance/legacy-asset-phase-product-classification-bootstrap.jsonl", "docs/governance/legacy-requirement-implementation-crosswalk-bootstrap.jsonl", "docs/governance/legacy-ir-product-unit-decomposition-bootstrap.jsonl",
]
ATOM_KEYS = {"action", "actor", "atom_id", "atomization_status", "authority_effect", "candidate_granularity", "candidate_inference", "candidate_kind", "candidate_phase", "candidate_product", "candidate_product_candidates", "condition", "consumer_status", "current_degradation_status", "current_implementation_status", "current_requirement_status", "decision_status", "degradation_status", "diff_observation", "failure_status", "human_decision_ref", "implementation_status", "inference_status", "inherited_predicate", "legacy_degradation_status", "legacy_implementation_status", "legacy_source_requirement_id", "meaning_change_applied", "negative_or_guard", "normalized_statement", "normalized_statement_status", "phase_status", "retained_meaning", "revision_pair", "semantic_action", "semantic_condition", "semantic_subject", "sequence", "source_fragment", "source_item_id", "source_line_shared", "source_ordinal", "source_path", "source_semantic_status", "source_support", "successor_requirement_ids", "unresolved_questions", "span_kind"}


def fail(code: str, detail: str = "") -> None:
    raise AssertionError(code + ((":" + detail) if detail else ""))


def sha(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def blob_oid(data: bytes) -> str:
    return hashlib.sha1(f"blob {len(data)}\0".encode() + data).hexdigest()


def read_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def read_jsonl(path: Path):
    return [json.loads(line) for line in path.read_text(encoding="utf-8").splitlines() if line.strip()]


def git_show(revision: str, path: str) -> bytes:
    try:
        return subprocess.check_output(["git", "show", f"{revision}:{path}"], cwd=ROOT)
    except subprocess.CalledProcessError:
        fail("E_CURRENT_PATH", path)


def snapshot(sid: str, side: str) -> bytes:
    name = "pre-isolation.md" if side == "pre" else "archive-revision.md"
    return (HERE / "source-snapshots" / sid / name).read_bytes()


def category(sid: str, line_no: int) -> str:
    if sid == "OUTSIDE67-PATH-008":
        refs = REUSED_ROWS
        line_refs = [row for row in refs if row["source_line"] == line_no]
        if any(row["category"] == "atomized_candidate" for row in line_refs):
            return "atomized_candidate"
        return "composite_unresolved"
    if line_no in METADATA_LINES[sid]:
        return "metadata_only"
    if line_no in ATOMIZED_LINES[sid]:
        return "atomized_candidate"
    return "composite_unresolved"


REUSED_ROWS = read_jsonl(REUSED) if REUSED.is_file() else []


def validate_inventory(inv: dict) -> None:
    expected = {"schema", "candidate_id", "research_completion", "status", "authority_effect", "meaning_change_applied", "successor_requirement_ids", "human_decision_ref", "formal_register_append", "old_runtime_test_ci_execution", "scope", "source_holding", "classification_basis", "four_products", "documents", "line_accounting", "semantic_atoms", "legacy_evidence", "findings", "unresolved_questions", "prohibited_inference", "residuals", "verification_scope"}
    if set(inv) != expected:
        fail("E_INV_KEYS")
    if inv["schema"] != "rdp001-outside67-path006-010-atomization/v1" or inv["candidate_id"] != "RDP-001-OUTSIDE67-PATH006-010-ATOMIZATION-0096":
        fail("E_IDENTITY")
    if inv["status"] != "findings_only" or inv["authority_effect"] != "none" or inv["meaning_change_applied"] or inv["successor_requirement_ids"] or inv["human_decision_ref"] is not None or inv["formal_register_append"] or inv["old_runtime_test_ci_execution"]:
        fail("E_ROOT_BOUNDARY")
    completion = inv["research_completion"]
    if completion != {"status": "partial_research", "selected_path_line_coverage": "complete", "selected_line_residual_count": 0, "semantic_atomization": "candidate_only_partial", "path_atomization_complete": False, "unselected_path_revision_pair_count": 62}:
        fail("E_COMPLETION")
    scope = inv["scope"]
    if scope["base_origin_main"] != BASE or scope["base_origin_main_observed_at_start"] != BASE or scope["holding_path_revision_pair_denominator"] != 67 or scope["holding_record_count"] != 67 or scope["selected_path_revision_pair_count"] != 5 or scope["unexplored_path_revision_pair_count"] != 62 or scope["base_drift_observed"] or scope["base_rebaseline_count"] != 0:
        fail("E_SCOPE")
    expected_ledger_digests = {rel: sha(git_show(BASE, rel)) for rel in OLD_LEDGER_PATHS}
    if scope.get("legacy_ledger_sha256") != expected_ledger_digests:
        fail("E_LEGACY_LEDGER_PIN")
    head = subprocess.check_output(["git", "rev-parse", "HEAD"], cwd=ROOT, text=True).strip()
    if subprocess.run(["git", "merge-base", "--is-ancestor", BASE, head], cwd=ROOT, check=False).returncode:
        fail("E_BASE_NOT_ANCESTOR")
    if scope["holding_sha256"] != sha(HOLDING.read_bytes()) or scope["management_register_sha256"] != sha(REGISTER.read_bytes()):
        fail("E_LEDGER_DIGEST")
    holding = read_jsonl(HOLDING)
    if len(holding) != 67 or len({row["source_item_id"] for row in holding}) != 67:
        fail("E_HOLDING_DENOM")
    if inv["source_holding"] != {"registration_id": "MPR-SH-OUTSIDE67-001", "source_atom_count": 67, "path_revision_pair_denominator": 67, "selected_item_ids": SELECTED_IDS, "selected_ordinals": [6, 7, 8, 9, 10], "unselected_count": 62, "coverage_result": "source_preserved_candidate_atomization_only", "product_target": "unassigned_cross_product", "authority_effect": "none"}:
        fail("E_HOLDING_SCOPE")
    if [p["product"] for p in inv["four_products"]] != PRODUCTS or any(p != {"product": p["product"], "status": "boundary_candidate_only", "authority_effect": "none"} for p in inv["four_products"]):
        fail("E_FOUR_PRODUCTS")


def validate_sources(inv: dict, selected: list[dict], diffs: dict) -> dict[str, dict]:
    if [row["source_item_id"] for row in selected] != SELECTED_IDS:
        fail("E_SELECTED_ORDER")
    holds = {row["source_item_id"]: row for row in read_jsonl(HOLDING)}
    if len(selected) != 5 or len({row["source_item_id"] for row in selected}) != 5:
        fail("E_SELECTED_DENOM")
    for row in selected:
        sid = row["source_item_id"]
        info = SOURCE_INFO[sid]
        if row["source_path"] != info["source_path"] or row["source_unit"] != "path_revision_pair" or row["artifact_kind"] != "markdown" or row["source_ordinal"] != int(sid.rsplit("-", 1)[1]):
            fail("E_SOURCE_IDENTITY", sid)
        h = holds[sid]
        for field, side, expected_commit in (("pre_isolation", "pre", PRE), ("archive_revision", "archive", ARCH)):
            data = snapshot(sid, side)
            m = row[field]
            if m["commit"] != expected_commit or m["blob_oid"] != h["pre_isolation" if side == "pre" else "archive"]["blob_oid"] or m["bytes"] != len(data) or m["sha256"] != sha(data) or m["line_count"] != len(data.decode().splitlines()):
                fail("E_SNAPSHOT_META", sid)
            if sha(data) != h["pre_isolation" if side == "pre" else "archive"]["sha256"] or blob_oid(data) != h["pre_isolation" if side == "pre" else "archive"]["blob_oid"]:
                fail("E_SNAPSHOT_HOLDING", sid)
        if snapshot(sid, "pre") != snapshot(sid, "archive") or row["source_relation"] != "pre_archive_same_current_relocation_and_content_drift":
            fail("E_PRE_ARCH_DIFF", sid)
        current = git_show(BASE, info["current_path"])
        cur = row["current_counterpart"]
        if cur["commit"] != BASE or cur["path"] != info["current_path"] or cur["blob_oid"] != blob_oid(current) or cur["bytes"] != len(current) or cur["sha256"] != sha(current) or cur["line_count"] != len(current.decode().splitlines()):
            fail("E_CURRENT_DIGEST", sid)
        if row["holding"]["reported_product_scope"] != h["reported_path_scope"]["product_scope"] or row["holding"]["reported_phase_scope"] != h["reported_path_scope"]["phase_scope"]:
            fail("E_HOLDING_ANCHOR", sid)
        if sid not in diffs or diffs[sid]["status"] != "same" or diffs[sid]["hunk_count"] != 0 or diffs[sid]["unified_diff"] != [] or diffs[sid]["meaning_equivalence"] != "unresolved" or diffs[sid]["source_ref"] != info["bundle"]:
            fail("E_DIFF_RECORD", sid)
    return holds


def validate_legacy(rows: list[dict], holds: dict[str, dict]) -> None:
    if len(rows) != 35:
        fail("E_LEGACY_DENOM")
    expected = {(sid, path) for sid in SELECTED_IDS for path in OLD_LEDGER_PATHS}
    got = {(row.get("source_item_id"), row.get("ledger_path")) for row in rows}
    if got != expected:
        fail("E_LEGACY_SCOPE")
    expected_keys = {
        "source_item_id", "ledger_path", "scan_commit", "ledger_sha256", "lookup", "anchors",
        "implementation_status", "degradation_status", "failure_status", "consumer_status",
        "decision_status", "no_inference_from_absence",
    }
    for row in rows:
        if set(row) != expected_keys:
            fail("E_LEGACY_KEYS", row.get("source_item_id", ""))
        for key in ("implementation_status", "degradation_status", "failure_status", "consumer_status", "decision_status"):
            if row.get(key) != "unknown":
                fail("E_LEGACY_PROMOTION", row.get("source_item_id", ""))
        if row.get("no_inference_from_absence") is not True or row.get("lookup") not in ("exact_text_hit", "no_exact_text_hit"):
            fail("E_LEGACY_BOUNDARY")
        sid = row["source_item_id"]
        ledger_path = row["ledger_path"]
        if row["scan_commit"] != BASE:
            fail("E_LEGACY_SCAN_COMMIT", sid)
        ledger_bytes = git_show(BASE, ledger_path)
        if row["ledger_sha256"] != sha(ledger_bytes):
            fail("E_LEGACY_DIGEST", f"{sid}:{ledger_path}")
        hold = holds[sid]
        terms = [sid, hold["source_path"], hold["pre_isolation"]["blob_oid"], hold["archive"]["blob_oid"]]
        expected_anchors = []
        for line_no, line in enumerate(ledger_bytes.decode("utf-8", errors="replace").splitlines(), 1):
            matched_terms = [term for term in terms if term in line]
            if matched_terms:
                expected_anchors.append({"line": line_no, "text_sha256": sha(line.encode("utf-8")), "matched_terms": matched_terms})
        expected_lookup = "exact_text_hit" if expected_anchors else "no_exact_text_hit"
        if row["lookup"] != expected_lookup:
            fail("E_LEGACY_LOOKUP", f"{sid}:{ledger_path}")
        if row["anchors"] != expected_anchors:
            fail("E_LEGACY_ANCHORS", f"{sid}:{ledger_path}")


def validate_atom(atom: dict, sid: str, line_no: int, text: str, cat: str) -> None:
    if set(atom) != ATOM_KEYS or atom["source_item_id"] != sid or atom["source_fragment"]["line"] != line_no or atom["atomization_status"] != cat or atom["span_kind"] != cat:
        fail("E_ATOM_KEYS_OR_ID", atom.get("atom_id", ""))
    if atom["candidate_product"] != "unresolved_cross_product" or atom["candidate_product_candidates"] != PRODUCTS or atom["authority_effect"] != "none" or atom["meaning_change_applied"] or atom["successor_requirement_ids"] or atom["human_decision_ref"] is not None:
        fail("E_ATOM_PROMOTION", atom["atom_id"])
    for key in ("implementation_status", "degradation_status", "failure_status", "consumer_status", "decision_status", "phase_status", "legacy_implementation_status", "current_implementation_status", "legacy_degradation_status", "current_degradation_status"):
        if atom[key] not in ("unknown", "unknown_path_based_candidate_only"):
            fail("E_ATOM_STATUS", atom["atom_id"])
    if atom["current_requirement_status"] != "not_current_requirement" or atom["source_semantic_status"] != "candidate_only" or atom["source_line_shared"] or atom["candidate_inference"] or atom["inference_status"] != "none":
        fail("E_ATOM_BOUNDARY", atom["atom_id"])
    line_hash = sha(text.encode())
    for side in ("pre_isolation", "archive"):
        pair = atom["revision_pair"][side]
        if pair["commit"] != (PRE if side == "pre_isolation" else ARCH) or pair["exact_source_text"] != text + "\n" or pair["line_start"] != line_no or pair["line_end"] != line_no or pair["line_sha256"] != line_hash or pair["byte_sha256"] != line_hash:
            fail("E_ATOM_REVISION", atom["atom_id"])
    frag = atom["source_fragment"]
    if cat == "atomized_candidate":
        if atom["candidate_granularity"] != "unit" or frag != {"character_start": 0, "character_end": len(text), "line": line_no, "status": "exact", "text": text} or atom["action"] != text or atom["semantic_action"] != text or atom["normalized_statement"] != {"status": "source_supported", "text": text, "source_ref": "source_fragment"} or atom["source_support"]["action"] != {"status": "exact", "text": text}:
            fail("E_ATOM_SOURCE_SUPPORT", atom["atom_id"])
    else:
        want_status = "metadata_only" if cat == "metadata_only" else "unresolved_composite"
        if atom["candidate_granularity"] != cat or frag != {"character_start": 0, "character_end": None, "line": line_no, "status": "unresolved", "text": None} or atom["action"] != "unresolved" or atom["normalized_statement"] != {"status": want_status, "text": text, "source_ref": "source_span"} or any(atom["source_support"][key] != {"status": "unresolved", "text": None} for key in ("actor", "action", "condition", "guard", "sequence")) or atom["source_support"]["source_fragment_text"] is not None:
            fail("E_ATOM_COMPOSITE_BOUNDARY", atom["atom_id"])
    if atom["retained_meaning"] != {"status": "preserved_source_meaning", "items": [text], "source_ref": "source_fragment" if cat == "atomized_candidate" else "source_span"}:
        fail("E_ATOM_RETAINED_MEANING", atom["atom_id"])
    if atom["unresolved_questions"]["status"] != "open_unknowns" or atom["unresolved_questions"]["scope"] != "atom" or not atom["unresolved_questions"]["items"]:
        fail("E_ATOM_QUESTIONS", atom["atom_id"])


def validate_atoms(atoms: list[dict], reused: list[dict], coverage: list[dict]) -> None:
    if len(atoms) != 145 or len({a["atom_id"] for a in atoms}) != 145 or any(a["source_item_id"] == "OUTSIDE67-PATH-008" for a in atoms):
        fail("E_NEW_ATOM_DENOM")
    if len(reused) != 74 or len({r["atom_id"] for r in reused}) != 74:
        fail("E_REUSED_ATOM_DENOM")
    prior = {a["atom_id"]: a for a in read_jsonl(PRIOR_ATOMS) if a.get("source_item_id") == "OUTSIDE67-PATH-008"}
    if set(r["atom_id"] for r in reused) != set(prior):
        fail("E_REUSED_ATOM_SCOPE")
    for ref in reused:
        a = prior[ref["atom_id"]]
        line = a["source_fragment"].get("line") or a["revision_pair"]["pre_isolation"]["line_start"]
        cat = "atomized_candidate" if a["atomization_status"] == "atomized_candidate" else "composite_unresolved"
        digest = sha(json.dumps(a, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode())
        if ref["source_item_id"] != "OUTSIDE67-PATH-008" or ref["source_line"] != line or ref["category"] != cat or ref["source_bundle"] != SOURCE_INFO["OUTSIDE67-PATH-008"]["bundle"] or ref["source_atom_sha256"] != digest:
            fail("E_REUSED_ATOM_DIGEST", ref["atom_id"])
    atom_by_line = {(a["source_item_id"], a["source_fragment"]["line"]): a for a in atoms}
    for a in atoms:
        sid, line_no = a["source_item_id"], a["source_fragment"]["line"]
        if sid not in SOURCE_INFO or sid == "OUTSIDE67-PATH-008":
            fail("E_ATOM_SCOPE", a.get("atom_id", ""))
        validate_atom(a, sid, line_no, snapshot(sid, "pre").decode().splitlines()[line_no - 1], category(sid, line_no))
    expected_cov = [(sid, n) for sid in SELECTED_IDS for n in range(1, len(snapshot(sid, "pre").decode().splitlines()) + 1)]
    if len(coverage) != 183 or [(r["source_item_id"], r["source_line"]) for r in coverage] != expected_cov:
        fail("E_COVERAGE_DENOM")
    if len({(r["source_item_id"], r["source_line"]) for r in coverage}) != 183:
        fail("E_COVERAGE_UNIQUE")
    counts = Counter()
    per_path = defaultdict(Counter)
    for row in coverage:
        sid, n = row["source_item_id"], row["source_line"]
        text = snapshot(sid, "pre").decode().splitlines()[n - 1]
        cat = category(sid, n)
        if set(row) != {"coverage_id", "source_item_id", "source_line", "archive_line", "pre_text", "archive_text", "pre_line_sha256", "archive_line_sha256", "category", "atom_ids", "accounting_source"} or row["archive_line"] != n or row["pre_text"] != text or row["archive_text"] != text or row["pre_line_sha256"] != sha(text.encode()) or row["archive_line_sha256"] != sha(text.encode()) or row["category"] != cat:
            fail("E_COVERAGE_ANCHOR", sid + f":{n}")
        want_ids = [r["atom_id"] for r in reused if r["source_line"] == n] if sid == "OUTSIDE67-PATH-008" else [atom_by_line[(sid, n)]["atom_id"]]
        if row["atom_ids"] != want_ids:
            fail("E_COVERAGE_ATOM_IDS", sid + f":{n}")
        counts[cat] += 1; per_path[sid][cat] += 1
    normalized_per_path = {sid: {kind: per_path[sid][kind] for kind in ("metadata_only", "atomized_candidate", "composite_unresolved")} for sid in SELECTED_IDS}
    if dict(counts) != {"metadata_only": 74, "atomized_candidate": 10, "composite_unresolved": 99} or normalized_per_path != EXPECTED_COUNTS:
        fail("E_CATEGORY_COUNTS")
    return


def validate(inv=None, selected=None, atoms=None, reused=None, coverage=None, diffs=None, legacy=None):
    inv = read_json(INV) if inv is None else inv
    selected = read_jsonl(SELECTED) if selected is None else selected
    atoms = read_jsonl(ATOMS) if atoms is None else atoms
    reused = read_jsonl(REUSED) if reused is None else reused
    coverage = read_jsonl(COVERAGE) if coverage is None else coverage
    diffs = read_json(DIFFS) if diffs is None else diffs
    legacy = read_jsonl(LEGACY) if legacy is None else legacy
    global REUSED_ROWS
    REUSED_ROWS = reused
    validate_inventory(inv)
    holds = validate_sources(inv, selected, diffs)
    validate_atoms(atoms, reused, coverage)
    validate_legacy(legacy, holds)
    line_accounting = inv["line_accounting"]
    if line_accounting["unique_source_line_count"] != 183 or line_accounting["category_counts"] != {"metadata_only": 74, "atomized_candidate": 10, "composite_unresolved": 99} or line_accounting["selected_line_residual_count"] != 0 or line_accounting["path008_reused_atom_count"] != 74 or line_accounting["new_atom_count"] != 145 or line_accounting["total_atom_references"] != 219:
        fail("E_INVENTORY_ACCOUNTING")
    if inv["semantic_atoms"] != {"new_atom_file": "semantic-atoms.jsonl", "new_atom_count": 145, "reused_atom_file": "reused-atom-references.jsonl", "reused_atom_count": 74, "line_coverage_file": "line-coverage.jsonl", "atomized_candidate_line_count": 10, "metadata_only_line_count": 74, "composite_unresolved_line_count": 99}:
        fail("E_INVENTORY_ATOMS")
    print("PASS validate: PATH-006..010 183/183 source lines, 10 atomized + 74 metadata-only + 99 composite_unresolved, PATH-008 reused=74")


if __name__ == "__main__":
    validate()
