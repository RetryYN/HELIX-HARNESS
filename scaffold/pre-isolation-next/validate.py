#!/usr/bin/env python3
"""RDP-001 PREISOLATION 次候補のread-only静的検証。

選定6 pathのholding／asset／phase台帳、固定Git object、全体diff分母、変更hunk、
候補分類、製品境界、否定条件を照合する。旧archiveのruntime／test／CIは実行しない。
"""
from __future__ import annotations

import argparse
import hashlib
import json
import re
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
DEFAULT_MANIFEST = ROOT / "scaffold/pre-isolation-next/rdp001-preiso-next-6path.json"
DEFAULT_INVENTORY = ROOT / "scaffold/pre-isolation-next/rdp001-preiso-next-semantic-diff-inventory.json"
HOLDING_REL = "docs/governance/pre-isolation-revision-delta-source-holding.jsonl"
ASSET_REL = "docs/governance/legacy-asset-disposition.jsonl"
PHASE_REL = "docs/governance/legacy-asset-phase-product-classification-bootstrap.jsonl"
BASELINE = "6fabd12512a3659fff4a956692cdd61faeeb16ce"
PRE_ISOLATION = "2d4991042be55268bac30a8bbcdac45b3865030a"
ARCHIVE = "064280b5c1c5c98f949e6e3be5ef87cbe4a4b658"
EXPECTED_IDS = [f"PREISO-REV-{i:06d}" for i in range(3, 9)]
EXPECTED = {
    "PREISO-REV-000003": ("docs/design/harness/L1-requirements/business-requirements.md", "requirement_or_prototype_source", 2),
    "PREISO-REV-000004": ("docs/design/harness/L1-requirements/nfr.md", "requirement_or_prototype_source", 2),
    "PREISO-REV-000005": ("docs/design/harness/L1-requirements/technical-requirements.md", "requirement_or_prototype_source", 1),
    "PREISO-REV-000006": ("docs/design/harness/L3-functional/nfr-grade.md", "requirement_or_prototype_source", 3),
    "PREISO-REV-000007": ("docs/design/helix/L1-requirements/hybrid-rebaseline-v0.5.0-remediation-delta.md", "requirement_or_prototype_source", 4),
    "PREISO-REV-000008": ("docs/design/helix/L1-requirements/pillar-requirements.md", "requirement_or_prototype_source", 12),
}
EXPECTED_SOURCE_OWNERS = {
    "PREISO-REV-000003": ("HELIX-HARNESS", "HELIX-OS"),
    "PREISO-REV-000004": ("HELIX-HARNESS", "HELIX-OS"),
    "PREISO-REV-000005": ("HELIX-HARNESS", "HELIX-OS"),
    "PREISO-REV-000006": ("HELIX-HARNESS", "HELIX-OS"),
    "PREISO-REV-000007": ("unresolved", None),
    "PREISO-REV-000008": ("unresolved", None),
}
PRIOR_IDS = ["PREISO-REV-000001", "PREISO-REV-000002", "PREISO-REV-000015", "PREISO-REV-000016", "PREISO-REV-000026", "PREISO-REV-000060"]
EXPECTED_COUNTS = {"requirement": 7, "constraint": 8, "provenance": 7, "generated_metadata": 2, "unresolved": 0}
EXPECTED_NEGATIVE_IDS = {
    "NEXT-NEG-BASELINE-PREISO-DIGEST", "NEXT-NEG-DIFF-HUNK-COVERAGE", "NEXT-NEG-HOLDING-PATH-CATEGORY",
    "NEXT-NEG-LEGACY-EXECUTION", "NEXT-NEG-PHASE-IMPLEMENTATION", "NEXT-NEG-OWNER-COLLAPSE",
    "NEXT-NEG-CLASSIFICATION-LOSS", "NEXT-NEG-AUTHORITY-SUCCESSOR",
}
# Fragment order follows git diff order for the six fixed source paths.
EXPECTED_FRAGMENT_META = {}
def _meta(numbers, classification, owner, secondary):
    for number in numbers:
        EXPECTED_FRAGMENT_META[f"RDP001-NEXT-DIFF-{number:03d}"] = (classification, owner, secondary)
_meta([1], "constraint", "HELIX-HARNESS", "HELIX-OS")
_meta([2], "provenance", "unresolved", "HELIX-OS")
_meta([3], "requirement", "HELIX-HARNESS", "HELIX-OS")
_meta([4], "provenance", "unresolved", "HELIX-OS")
_meta([5], "requirement", "unresolved", "HELIX-OS")
_meta([6], "provenance", "unresolved", "HELIX-OS")
_meta([7], "requirement", "unresolved", "HELIX-OS")
_meta([8], "provenance", "unresolved", "HELIX-OS")
_meta([9], "generated_metadata", "unresolved", None)
_meta([10, 11, 12], "constraint", "unresolved", None)
_meta([13], "generated_metadata", "unresolved", None)
_meta([14], "constraint", "unresolved", None)
_meta([15, 16], "requirement", "unresolved", None)
_meta([17], "constraint", "unresolved", None)
_meta([18], "provenance", "unresolved", None)
_meta([19], "requirement", "unresolved", None)
_meta([20], "constraint", "unresolved", None)
_meta([21], "provenance", "unresolved", None)
_meta([22], "requirement", "unresolved", None)
_meta([23], "constraint", "unresolved", None)
_meta([24], "provenance", "unresolved", None)
EXPECTED_FRAGMENT_IDS = set(EXPECTED_FRAGMENT_META)
EXPECTED_REVIEWED_SUBUNITS = {
    "RDP001-NEXT-DIFF-010": [
        "RDP001-NEXT-SU-010-A", "RDP001-NEXT-SU-010-B", "RDP001-NEXT-SU-010-C",
        "RDP001-NEXT-SU-010-D", "RDP001-NEXT-SU-010-E",
    ],
    "RDP001-NEXT-DIFF-014": [
        "RDP001-NEXT-SU-014-A", "RDP001-NEXT-SU-014-B", "RDP001-NEXT-SU-014-C",
        "RDP001-NEXT-SU-014-D",
    ],
    "RDP001-NEXT-DIFF-015": ["RDP001-NEXT-SU-015-P0", "RDP001-NEXT-SU-015-P1"],
    "RDP001-NEXT-DIFF-016": ["RDP001-NEXT-SU-016-P6", "RDP001-NEXT-SU-016-P7"],
    "RDP001-NEXT-DIFF-022": ["RDP001-NEXT-SU-022-P6", "RDP001-NEXT-SU-022-P9"],
}
EXPECTED_SUBUNIT_SPANS = {
    "RDP001-NEXT-SU-010-A": (EXPECTED["PREISO-REV-000007"][0], 25, 25),
    "RDP001-NEXT-SU-010-B": (EXPECTED["PREISO-REV-000007"][0], 26, 27),
    "RDP001-NEXT-SU-010-C": (EXPECTED["PREISO-REV-000007"][0], 28, 28),
    "RDP001-NEXT-SU-010-D": (EXPECTED["PREISO-REV-000007"][0], 29, 29),
    "RDP001-NEXT-SU-010-E": (EXPECTED["PREISO-REV-000007"][0], 30, 30),
    "RDP001-NEXT-SU-014-A": (EXPECTED["PREISO-REV-000008"][0], 20, 20),
    "RDP001-NEXT-SU-014-B": (EXPECTED["PREISO-REV-000008"][0], 22, 24),
    "RDP001-NEXT-SU-014-C": (EXPECTED["PREISO-REV-000008"][0], 25, 25),
    "RDP001-NEXT-SU-014-D": (EXPECTED["PREISO-REV-000008"][0], 26, 27),
    "RDP001-NEXT-SU-015-P0": (EXPECTED["PREISO-REV-000008"][0], 50, 50),
    "RDP001-NEXT-SU-015-P1": (EXPECTED["PREISO-REV-000008"][0], 51, 51),
    "RDP001-NEXT-SU-016-P6": (EXPECTED["PREISO-REV-000008"][0], 55, 55),
    "RDP001-NEXT-SU-016-P7": (EXPECTED["PREISO-REV-000008"][0], 56, 56),
    "RDP001-NEXT-SU-022-P6": (EXPECTED["PREISO-REV-000008"][0], 109, 109),
    "RDP001-NEXT-SU-022-P9": (EXPECTED["PREISO-REV-000008"][0], 109, 109),
}
EXPECTED_SUBUNIT_OWNER_CANDIDATES = ["HELIX-HARNESS", "HELIX-OS"]
EXPECTED_SEMANTIC_DENOMINATOR = (
    "24 hunk fragments remain non-atomic; 15 subunits are review-only decomposition candidates "
    "and do not establish semantic atom coverage"
)
HOLDING_KEYS = [
    "source_revision_item_id", "source_path", "baseline_commit", "baseline_blob_oid", "baseline_file_sha256",
    "pre_isolation_commit", "pre_isolation_blob_oid", "pre_isolation_file_sha256", "archive_path", "archive_commit",
    "source_category", "revision_relation", "baseline_revision_state", "pre_isolation_revision_state",
    "meaning_change_applied", "successor_requirement_ids", "human_decision_ref", "authority_effect",
]
ASSET_KEYS = [
    "asset_id", "source_sha256", "asset_class", "disposition", "implementation_status", "consumer_refs",
    "product_target", "source_authority_state", "target_authority_state", "carry_forward_state", "decision_status",
    "executability_status", "external_effect_status",
]
PHASE_KEYS = [
    "classification_id", "phase_classification_status", "candidate_phase_targets", "candidate_product_targets",
    "product_classification_status", "consumer_closure_status", "consumer_refs", "implementation_evidence_state",
    "legacy_execution_performed", "legacy_implementation_status", "unresolved",
]
DIFF_HUNK = re.compile(r"^@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @")


def fail(errors: list[str], message: str) -> None:
    errors.append(message)


def file_digest(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def read_json(path: Path, errors: list[str]) -> dict:
    try:
        value = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        fail(errors, f"JSONを読めない: {path}: {exc}")
        return {}
    if not isinstance(value, dict):
        fail(errors, f"JSONがobjectではない: {path}")
        return {}
    return value


def read_jsonl(path: Path, errors: list[str]) -> list[dict]:
    records: list[dict] = []
    try:
        lines = path.read_text(encoding="utf-8").splitlines()
    except OSError as exc:
        fail(errors, f"台帳を読めない: {path}: {exc}")
        return records
    for line_no, line in enumerate(lines, 1):
        if not line.strip():
            continue
        try:
            value = json.loads(line)
        except json.JSONDecodeError as exc:
            fail(errors, f"台帳JSON不正: {path}:{line_no}: {exc}")
            continue
        if not isinstance(value, dict):
            fail(errors, f"台帳recordがobjectではない: {path}:{line_no}")
            continue
        records.append(value)
    return records


def git_blob(commit: str, path: str, errors: list[str]) -> bytes | None:
    result = subprocess.run(["git", "cat-file", "blob", f"{commit}:{path}"], cwd=ROOT, capture_output=True, check=False)
    if result.returncode != 0:
        fail(errors, f"Git blobを読めない: {commit}:{path}")
        return None
    return result.stdout


def line_span(blob: bytes, start: int, end: int) -> bytes | None:
    if not isinstance(start, int) or not isinstance(end, int) or start < 1 or end < start - 1:
        return None
    lines = blob.splitlines(keepends=True)
    if start == end + 1:
        return b""
    if end > len(lines):
        return None
    return b"".join(lines[start - 1:end])


def check_span(errors: list[str], label: str, blob: bytes, declaration: dict) -> None:
    actual = line_span(blob, declaration.get("start_line"), declaration.get("end_line"))
    if actual is None:
        fail(errors, f"{label} line span不正")
        return
    actual_text = actual.decode("utf-8", errors="replace")
    if declaration.get("exact_text") != actual_text:
        fail(errors, f"{label} exact_text不一致")
    actual_sha = "sha256:" + hashlib.sha256(actual).hexdigest()
    if declaration.get("sha256") != actual_sha:
        fail(errors, f"{label} SHA-256不一致")


def changed_end(start: int, count: int) -> int:
    return start + count - 1 if count else start - 1


def parse_diff(errors: list[str], paths: list[str] | None = None) -> list[tuple[str, int, int, int, int]]:
    command = ["git", "diff", "--unified=0", "--no-renames", BASELINE, PRE_ISOLATION]
    if paths is not None:
        command += ["--", *paths]
    result = subprocess.run(command, cwd=ROOT, capture_output=True, text=True, check=False)
    if result.returncode != 0:
        fail(errors, f"Git diffを読めない: {result.stderr.strip()}")
        return []
    current: str | None = None
    hunks: list[tuple[str, int, int, int, int]] = []
    for line in result.stdout.splitlines():
        if line.startswith("diff --git a/"):
            marker = line[len("diff --git a/"):]
            left, right = marker.split(" b/", 1)
            current = right if left == right else None
            if current is None:
                fail(errors, f"renameまたはpath差替えを検出: {line}")
        elif line.startswith("@@ "):
            match = DIFF_HUNK.match(line)
            if match is None or current is None:
                fail(errors, f"Git diff hunk header不正: {line}")
                continue
            old_start = int(match.group(1)); old_count = int(match.group(2) or 1)
            new_start = int(match.group(3)); new_count = int(match.group(4) or 1)
            hunks.append((current, old_start, changed_end(old_start, old_count), new_start, changed_end(new_start, new_count)))
    return hunks


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--manifest", type=Path, default=DEFAULT_MANIFEST)
    parser.add_argument("--inventory", type=Path, default=DEFAULT_INVENTORY)
    args = parser.parse_args()
    errors: list[str] = []
    manifest = read_json(args.manifest, errors)
    inventory = read_json(args.inventory, errors)
    holding_path = ROOT / HOLDING_REL; asset_path = ROOT / ASSET_REL; phase_path = ROOT / PHASE_REL
    holding = read_jsonl(holding_path, errors); assets = read_jsonl(asset_path, errors); phases = read_jsonl(phase_path, errors)
    holding_by_id = {r.get("source_revision_item_id"): r for r in holding}
    assets_by_path = {r.get("source_path"): r for r in assets}
    phases_by_asset = {r.get("asset_id"): r for r in phases}

    if manifest.get("schema") != "helix-scaffold-preisolation-next-manifest.v1": fail(errors, "manifest schema不正")
    for field, expected in (("status", "candidate_pending_semantic_equivalence_review"), ("authority_effect", "none"), ("meaning_change_applied", False), ("successor_requirement_ids", []), ("human_decision_ref", None), ("equivalence_claim", None)):
        if manifest.get(field) != expected: fail(errors, f"manifest {field}が固定候補境界と不一致")
    comparison = manifest.get("comparison", {})
    expected_comparison = {"baseline_commit": BASELINE, "pre_isolation_commit": PRE_ISOLATION, "archive_commit": ARCHIVE, "full_diff_file_count": 400, "full_diff_hunk_count": 492, "selected_file_count": 6, "selected_hunk_count": 24, "unprocessed_selected_scope_file_count": 394, "unprocessed_selected_scope_hunk_count": 468}
    for field, expected in expected_comparison.items():
        if comparison.get(field) != expected: fail(errors, f"comparison {field}不一致")
    if comparison.get("old_runtime_test_ci_execution") is not False: fail(errors, "old_runtime_test_ci_executionはfalseに固定する")
    if comparison.get("method") != "read-only Git object bytes; exact changed hunk spans and UTF-8 SHA-256": fail(errors, "comparison method不一致")
    prior = comparison.get("prior_reviewed_scope", {})
    if prior != {"request_id": "GUI-1934-REVIEW-02", "source_revision_item_ids": PRIOR_IDS, "file_count": 6, "hunk_count": 9}: fail(errors, "#1934 prior review scopeが固定値と不一致")
    if comparison.get("combined_reviewed_scope") != {"file_count": 12, "hunk_count": 33}: fail(errors, "combined reviewed scope不一致")
    if comparison.get("combined_unprocessed_scope") != {"file_count": 388, "hunk_count": 459}: fail(errors, "combined unprocessed scope不一致")

    scope = manifest.get("scope", {})
    if scope.get("diff_scope") != "selected_source_items_only": fail(errors, "manifest diff_scope不一致")
    if scope.get("selected_source_revision_item_ids") != EXPECTED_IDS: fail(errors, "selected source ID順序不一致")
    if scope.get("prior_reviewed_source_revision_item_ids") != PRIOR_IDS: fail(errors, "prior reviewed ID集合不一致")
    if set(EXPECTED_IDS) & set(PRIOR_IDS): fail(errors, "今回scopeと#1934 scopeが重複")

    for key, rel, count in (("holding_provenance", HOLDING_REL, 333), ("asset_provenance", ASSET_REL, None), ("phase_provenance", PHASE_REL, None)):
        prov = manifest.get(key, {})
        path = ROOT / rel
        if prov.get("path") != rel or prov.get("sha256") != file_digest(path): fail(errors, f"{key} digest不一致")
        if count is not None and prov.get("record_count") != count: fail(errors, f"{key} record_count不一致")
    if manifest.get("holding_provenance", {}).get("selected_record_count") != 6: fail(errors, "selected holding record count不一致")

    expected_boundary = {
        ("docs/concept/product-boundary.md", "097f27311060c56e387cf49fe6ec75731e5fd9dc04ac1a4be987d285e02ee038"),
        ("docs/helix-harness/L1-planning/product-intent.md", "a49da594e9593557eb42cbfe54edc7e9751ce40fea95d1fe9367f5780184ee04"),
        ("docs/helix-os/L1-planning/system-intent.md", "0f7f30d9d6984578f09c31ed1ef4e826d7c360bf752297982bde5201e7e99ca8"),
    }
    actual_boundary = {(s.get("path"), s.get("sha256")) for s in manifest.get("product_boundary", {}).get("sources", [])}
    if actual_boundary != expected_boundary: fail(errors, "product boundary source集合不一致")
    for path, expected_sha in expected_boundary:
        if file_digest(ROOT / path) != expected_sha: fail(errors, f"product boundary source digest stale: {path}")

    paths = manifest.get("paths")
    if not isinstance(paths, list) or len(paths) != 6: fail(errors, "manifest pathsは6件でなければならない")
    paths = paths if isinstance(paths, list) else []
    path_by_id: dict[str, dict] = {}
    for decl in paths:
        item_id = decl.get("source_revision_item_id")
        if item_id in path_by_id: fail(errors, f"source ID重複: {item_id}")
        path_by_id[item_id] = decl
        expected = EXPECTED.get(item_id)
        if expected is None: fail(errors, f"未知source ID: {item_id}"); continue
        expected_path, expected_category, _ = expected
        if decl.get("source_path") != expected_path: fail(errors, f"{item_id} source_path不一致")
        if decl.get("source_category") != expected_category: fail(errors, f"{item_id} source_category不一致")
        owner, secondary = EXPECTED_SOURCE_OWNERS[item_id]
        if decl.get("product_owner_candidate") != owner or decl.get("secondary_consumer_candidate") != secondary: fail(errors, f"{item_id} owner候補不一致")
        row = holding_by_id.get(item_id)
        if row is None: fail(errors, f"{item_id} holding record欠落"); continue
        for field in HOLDING_KEYS:
            if decl.get(field) != row.get(field): fail(errors, f"{item_id} holding field不一致: {field}")
        if row.get("baseline_commit") != BASELINE or row.get("pre_isolation_commit") != PRE_ISOLATION or row.get("archive_commit") != ARCHIVE: fail(errors, f"{item_id} revision不一致")
        if row.get("revision_relation") != "changed_before_archive_pending_semantic_equivalence_review": fail(errors, f"{item_id} revision relation不一致")
        if row.get("baseline_revision_state") != "preserved_git_revision_pending_review" or row.get("pre_isolation_revision_state") != "preserved_archive_revision_pending_review": fail(errors, f"{item_id} revision state不一致")
        if row.get("meaning_change_applied") is not False or row.get("successor_requirement_ids") != [] or row.get("human_decision_ref") is not None or row.get("authority_effect") != "none": fail(errors, f"{item_id} authority境界不一致")
        asset = assets_by_path.get(expected_path)
        if asset is None: fail(errors, f"{item_id} asset ledger欠落"); continue
        phase = phases_by_asset.get(asset.get("asset_id"))
        if phase is None: fail(errors, f"{item_id} phase ledger欠落"); continue
        for field in ASSET_KEYS:
            if decl.get("legacy_asset", {}).get(field) != asset.get(field): fail(errors, f"{item_id} asset snapshot不一致: {field}")
        for field in PHASE_KEYS:
            if decl.get("phase_classification", {}).get(field) != phase.get(field): fail(errors, f"{item_id} phase snapshot不一致: {field}")
        if phase.get("phase_classification_status") != "multi_phase_candidate" or phase.get("consumer_closure_status") != "pending" or phase.get("legacy_execution_performed") is not False: fail(errors, f"{item_id} phase未確認境界不一致")
        if phase.get("product_classification_status") != "candidate_needs_semantic_review": fail(errors, f"{item_id} product classificationがreview pendingでない")
        baseline = git_blob(BASELINE, expected_path, errors); pre = git_blob(PRE_ISOLATION, expected_path, errors); archive = git_blob(ARCHIVE, row.get("archive_path", ""), errors)
        if baseline is not None:
            if hashlib.sha1(f"blob {len(baseline)}\0".encode() + baseline).hexdigest() != row.get("baseline_blob_oid") or hashlib.sha256(baseline).hexdigest() != row.get("baseline_file_sha256"): fail(errors, f"{item_id} baseline blob/digest不一致")
        if pre is not None:
            if hashlib.sha1(f"blob {len(pre)}\0".encode() + pre).hexdigest() != row.get("pre_isolation_blob_oid") or hashlib.sha256(pre).hexdigest() != row.get("pre_isolation_file_sha256"): fail(errors, f"{item_id} pre-isolation blob/digest不一致")
        if pre is not None and archive is not None and pre != archive: fail(errors, f"{item_id} archive snapshot bytes不一致")

    if set(path_by_id) != set(EXPECTED_IDS): fail(errors, "manifest source ID集合不一致")
    actual_full_files = subprocess.run(["git", "diff", "--name-only", "--no-renames", BASELINE, PRE_ISOLATION], cwd=ROOT, capture_output=True, text=True, check=True).stdout.splitlines()
    full_hunks = parse_diff(errors)
    if len(actual_full_files) != 400 or len(full_hunks) != 492: fail(errors, f"全体diff分母不一致: files={len(actual_full_files)} hunks={len(full_hunks)}")
    selected_paths = [EXPECTED[item][0] for item in EXPECTED_IDS]
    selected_hunks = parse_diff(errors, selected_paths)
    if len(set(path for path, *_ in selected_hunks)) != 6 or len(selected_hunks) != 24: fail(errors, f"selected diff scope不一致: files={len(set(path for path, *_ in selected_hunks))} hunks={len(selected_hunks)}")

    if inventory.get("schema") != "helix-scaffold-preisolation-next-semantic-diff.v1": fail(errors, "inventory schema不正")
    for field, expected in (("status", "candidate_pending_semantic_equivalence_review"), ("authority_effect", "none"), ("meaning_change_applied", False), ("successor_requirement_ids", []), ("human_decision_ref", None), ("equivalence_claim", None)):
        if inventory.get(field) != expected: fail(errors, f"inventory {field}が固定候補境界と不一致")
    if inventory.get("comparison") != comparison or inventory.get("diff_scope") != scope: fail(errors, "manifest／inventory comparisonまたはscope不一致")
    source_items = inventory.get("source_items")
    if source_items != paths: fail(errors, "inventory source_itemsとmanifest paths不一致")
    if inventory.get("classification_unit") != "hunk_fragment": fail(errors, "classification_unitはhunk_fragmentに固定する")
    if inventory.get("classification_counts_are_not_semantic_atom_counts") is not True:
        fail(errors, "classification_counts_are_not_semantic_atom_countsはtrueに固定する")
    semantic_atomization = inventory.get("semantic_atomization")
    if not isinstance(semantic_atomization, dict):
        fail(errors, "semantic_atomizationはobjectでなければならない")
        semantic_atomization = {}
    semantic_expectations = {
        "status": "not_started",
        "hunk_level_classification_only": True,
        "semantic_atomization_complete": False,
        "semantic_atom_count": 0,
        "hunk_fragment_count": 24,
        "compound_hunk_hold_count": 24,
        "semantic_subunit_reviewed_fragment_ids": sorted(EXPECTED_REVIEWED_SUBUNITS),
        "semantic_subunit_reviewed_fragment_count": 5,
        "semantic_subunit_count": 15,
        "fully_unsubdivided_fragment_count": 19,
        "remaining_semantic_denominator": EXPECTED_SEMANTIC_DENOMINATOR,
    }
    for field, expected in semantic_expectations.items():
        if semantic_atomization.get(field) != expected:
            fail(errors, f"semantic_atomization {field}が固定境界と不一致")
    if not isinstance(semantic_atomization.get("review_note"), str) or not semantic_atomization.get("review_note"):
        fail(errors, "semantic_atomization review_note欠落")
    fragments = inventory.get("fragments")
    if not isinstance(fragments, list) or len(fragments) != 24: fail(errors, "fragmentsは24件でなければならない")
    fragments = fragments if isinstance(fragments, list) else []
    seen_fragments: set[str] = set(); inventory_hunks=[]; observed_counts={k:0 for k in EXPECTED_COUNTS}
    for fragment in fragments:
        if not isinstance(fragment, dict): fail(errors, "fragmentがobjectではない"); continue
        fid=fragment.get("fragment_id")
        if fid in seen_fragments: fail(errors, f"fragment ID重複: {fid}")
        seen_fragments.add(fid)
        expected_meta=EXPECTED_FRAGMENT_META.get(fid)
        if expected_meta is None: fail(errors, f"未知fragment ID: {fid}"); continue
        cls, owner, secondary=expected_meta
        if fragment.get("classification") != cls or fragment.get("product_owner_candidate") != owner or fragment.get("secondary_consumer_candidate") != secondary: fail(errors, f"{fid} classification／owner不一致")
        if fragment.get("candidate_kind") != ("metadata" if cls in {"provenance", "generated_metadata"} else cls): fail(errors, f"{fid} candidate_kind不一致")
        if fragment.get("classification_unit") != "hunk_fragment": fail(errors, f"{fid} classification_unitはhunk_fragment")
        if fragment.get("hunk_level_classification_only") is not True: fail(errors, f"{fid} hunk_level_classification_onlyはtrue")
        if fragment.get("semantic_atomization_status") != "not_atomized": fail(errors, f"{fid} semantic_atomization_statusはnot_atomized")
        compound_hold = fragment.get("compound_hunk_hold")
        if not isinstance(compound_hold, dict):
            fail(errors, f"{fid} compound_hunk_hold欠落")
        else:
            if compound_hold.get("hold_id") != f"RDP001-NEXT-HOLD-{fid}": fail(errors, f"{fid} compound_hunk_hold ID不一致")
            if compound_hold.get("status") != "held_as_compound_hunk": fail(errors, f"{fid} compound_hunk_hold status不一致")
            if compound_hold.get("semantic_atom_count") != 0: fail(errors, f"{fid} compound_hunk_hold semantic_atom_countは0")
            if not isinstance(compound_hold.get("reason"), str) or not compound_hold.get("reason"): fail(errors, f"{fid} compound_hunk_hold reason欠落")
            if not isinstance(compound_hold.get("remaining_semantic_unit_count"), str) or not compound_hold.get("remaining_semantic_unit_count"): fail(errors, f"{fid} compound_hunk_hold denominator欠落")
        if fragment.get("source_revision_item_id") not in EXPECTED_IDS: fail(errors, f"{fid} source ID不正")
        if not isinstance(fragment.get("normalized_statement"), str) or len(fragment.get("normalized_statement", "")) < 20: fail(errors, f"{fid} normalized_statement欠落")
        if re.fullmatch(r"(?:requirement|constraint|metadata|provenance) [A-Z0-9_-]+", fragment.get("normalized_statement", "")): fail(errors, f"{fid} normalized_statement placeholder")
        if not fragment.get("unresolved_meaning") or not fragment.get("possible_conflicts"): fail(errors, f"{fid} unresolved review boundary欠落")
        observed_counts[cls] += 1
        path=fragment.get("source_path"); expected_path=EXPECTED.get(fragment.get("source_revision_item_id"), (None,None,None))[0]
        if path != expected_path: fail(errors, f"{fid} source path不一致")
        b=fragment.get("baseline", {}); p=fragment.get("pre_isolation", {})
        if not isinstance(b,dict) or not isinstance(p,dict): fail(errors, f"{fid} baseline/pre span不正"); continue
        inventory_hunks.append((path,b.get("start_line"),b.get("end_line"),p.get("start_line"),p.get("end_line")))
        bb=git_blob(BASELINE,path,errors); pb=git_blob(PRE_ISOLATION,path,errors)
        if bb is not None: check_span(errors,f"{fid} baseline",bb,b)
        if pb is not None: check_span(errors,f"{fid} pre-isolation",pb,p)
        if b.get("exact_text") == p.get("exact_text"): fail(errors, f"{fid} changed fragment textが同一")
        if not fragment.get("retained_negative_ids"): fail(errors, f"{fid} retained negative欠落")
        expected_subunit_ids = EXPECTED_REVIEWED_SUBUNITS.get(fid, [])
        actual_subunits = fragment.get("semantic_subunits")
        if not isinstance(actual_subunits, list):
            fail(errors, f"{fid} semantic_subunitsは配列でなければならない")
            actual_subunits = []
        actual_subunit_ids = [s.get("semantic_subunit_id") if isinstance(s, dict) else None for s in actual_subunits]
        if actual_subunit_ids != expected_subunit_ids:
            fail(errors, f"{fid} semantic_subunits ID集合または順序不一致")
        parent_source_id = fragment.get("source_revision_item_id")
        parent_source_path = fragment.get("source_path")
        parent_start = p.get("start_line")
        parent_end = p.get("end_line")
        expected_negative_ids = set(fragment.get("retained_negative_ids", []))
        for subunit in actual_subunits:
            if not isinstance(subunit, dict):
                fail(errors, f"{fid} semantic subunitがobjectではない")
                continue
            subunit_id = subunit.get("semantic_subunit_id")
            expected_span = EXPECTED_SUBUNIT_SPANS.get(subunit_id)
            if expected_span is None:
                fail(errors, f"{fid} 未知semantic subunit ID: {subunit_id}")
                continue
            if subunit.get("source_fragment_id") != fid: fail(errors, f"{subunit_id} source_fragment_id不一致")
            if subunit.get("source_revision_item_id") != parent_source_id: fail(errors, f"{subunit_id} source_revision_item_id不一致")
            if subunit.get("source_path") != expected_span[0] or subunit.get("source_path") != parent_source_path: fail(errors, f"{subunit_id} source_path不一致")
            if subunit.get("semantic_status") != "candidate_pending_review": fail(errors, f"{subunit_id} semantic_statusはcandidate_pending_review")
            if subunit.get("candidate_kind") != "unresolved": fail(errors, f"{subunit_id} candidate_kindはunresolved")
            if subunit.get("owner_candidate") != "unresolved": fail(errors, f"{subunit_id} owner_candidateはunresolved")
            if subunit.get("owner_candidates") != EXPECTED_SUBUNIT_OWNER_CANDIDATES: fail(errors, f"{subunit_id} owner_candidates不一致")
            if not isinstance(subunit.get("meaning_candidate"), str) or len(subunit.get("meaning_candidate", "")) < 20: fail(errors, f"{subunit_id} meaning_candidate欠落")
            if not isinstance(subunit.get("retained_conditions"), list) or not subunit.get("retained_conditions"): fail(errors, f"{subunit_id} retained_conditions欠落")
            subunit_negative_ids = subunit.get("retained_negative_ids")
            if not isinstance(subunit_negative_ids, list) or not subunit_negative_ids or not set(subunit_negative_ids).issubset(expected_negative_ids | EXPECTED_NEGATIVE_IDS): fail(errors, f"{subunit_id} retained_negative_ids不正")
            if not isinstance(subunit.get("questions"), list) or not subunit.get("questions"): fail(errors, f"{subunit_id} questions欠落")
            source_span = subunit.get("source_span")
            if not isinstance(source_span, dict):
                fail(errors, f"{subunit_id} source_span欠落")
                continue
            if source_span.get("revision") != "pre_isolation" or source_span.get("commit") != PRE_ISOLATION: fail(errors, f"{subunit_id} source revision不一致")
            if (source_span.get("start_line"), source_span.get("end_line")) != expected_span[1:]: fail(errors, f"{subunit_id} source span line不一致")
            if source_span.get("start_line", 0) < parent_start or source_span.get("end_line", 0) > parent_end: fail(errors, f"{subunit_id} source spanがparent hunk外")
            subunit_blob = git_blob(PRE_ISOLATION, subunit.get("source_path"), errors)
            if subunit_blob is not None: check_span(errors, f"{subunit_id} semantic subunit source grounding", subunit_blob, source_span)
            if subunit_id.startswith("RDP001-NEXT-SU-022-") and subunit.get("shared_source_span") is not True: fail(errors, f"{subunit_id} shared_source_spanはtrue")
            if not subunit_id.startswith("RDP001-NEXT-SU-022-") and subunit.get("shared_source_span") is True: fail(errors, f"{subunit_id} shared_source_spanは022以外で許可しない")
    if seen_fragments != EXPECTED_FRAGMENT_IDS: fail(errors, "fragment ID集合不一致")
    expected_subunit_ids = {subunit_id for subunits in EXPECTED_REVIEWED_SUBUNITS.values() for subunit_id in subunits}
    actual_subunit_ids = {
        subunit.get("semantic_subunit_id")
        for fragment in fragments if isinstance(fragment, dict)
        for subunit in fragment.get("semantic_subunits", []) if isinstance(subunit, dict)
    }
    if actual_subunit_ids != expected_subunit_ids: fail(errors, "semantic subunit ID集合不一致")
    if inventory.get("classification_counts") != observed_counts or observed_counts != EXPECTED_COUNTS: fail(errors, f"hunk classification counts不一致: {observed_counts}")
    if sorted(inventory_hunks) != sorted(selected_hunks): fail(errors, "Git diff hunkとinventory spanの集合不一致")

    negatives=inventory.get("retained_negatives")
    if not isinstance(negatives,list) or len(negatives)!=len(EXPECTED_NEGATIVE_IDS): fail(errors,"retained_negatives件数不一致")
    negatives=negatives if isinstance(negatives,list) else []
    negative_ids=[]
    for negative in negatives:
        nid=negative.get("negative_id") if isinstance(negative,dict) else None
        negative_ids.append(nid)
        if nid not in EXPECTED_NEGATIVE_IDS: fail(errors, f"unknown negative ID: {nid}")
        if not isinstance(negative.get("meaning"),str) or not negative.get("meaning"): fail(errors, f"{nid} meaning欠落")
    if set(negative_ids)!=EXPECTED_NEGATIVE_IDS: fail(errors,"negative ID集合不一致")
    referenced=set()
    for fragment in fragments:
        if isinstance(fragment,dict): referenced.update(fragment.get("retained_negative_ids",[]))
    if referenced != EXPECTED_NEGATIVE_IDS: fail(errors,"fragmentとnegativeの参照集合不一致")

    if errors:
        print("FAIL: RDP-001 PREISOLATION next 6-path candidate")
        for error in errors: print(f"- {error}")
        return 1
    print("PASS: RDP-001 PREISOLATION next 6-path candidate (read-only static check)")
    print("scope=6 selected paths / 24 hunks; full denominator=400 files / 492 hunks; selected remainder=394 files / 468 hunks")
    print("combined with GUI-1934=12 reviewed files / 33 hunks; combined remainder=388 files / 459 hunks")
    print("hunk_classification_counts=requirement:7; constraint:8; provenance:7; generated_metadata:2; unresolved:0; retained_negatives=8")
    print("semantic_atomization=not_started; semantic_atoms=0; hunk_classification_only=24; review_only_subunits=15; compound_hunk_holds=24")
    print("authority_effect=none; semantic_equivalence=unresolved; legacy runtime/test/CI execution=forbidden")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
