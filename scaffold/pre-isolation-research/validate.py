#!/usr/bin/env python3
"""RDP-001 research-premise候補20 pathのread-only静的検証。"""
from __future__ import annotations

import argparse
import hashlib
import json
import re
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
DEFAULT_MANIFEST = ROOT / "scaffold/pre-isolation-research/rdp001-preiso-research-20path.json"
DEFAULT_INVENTORY = ROOT / "scaffold/pre-isolation-research/rdp001-preiso-research-semantic-diff-inventory.json"
HOLDING_REL = "docs/governance/pre-isolation-revision-delta-source-holding.jsonl"
ASSET_REL = "docs/governance/legacy-asset-disposition.jsonl"
PHASE_REL = "docs/governance/legacy-asset-phase-product-classification-bootstrap.jsonl"
BASELINE = "6fabd12512a3659fff4a956692cdd61faeeb16ce"
PRE_ISOLATION = "2d4991042be55268bac30a8bbcdac45b3865030a"
ARCHIVE = "064280b5c1c5c98f949e6e3be5ef87cbe4a4b658"
NUMBERS = list(range(23, 26)) + list(range(27, 44))
EXPECTED_IDS = [f"PREISO-REV-{n:06d}" for n in NUMBERS]
EXPECTED_PATHS = {
    "PREISO-REV-000023": "docs/governance/candidates/helix-concept-v4-requirements.md",
    "PREISO-REV-000024": "docs/governance/candidates/helix-concept-v4.0.md",
    "PREISO-REV-000025": "docs/governance/helix-harness-concept_v3.1.md",
    "PREISO-REV-000027": "docs/plans/PLAN-L3-1358-three-lane-capacity-profile-v05.md",
    "PREISO-REV-000028": "docs/plans/PLAN-L3-1500-concept-vision-intake.md",
    "PREISO-REV-000029": "docs/plans/PLAN-L3-1594-skill-mechanism-migration.md",
    "PREISO-REV-000030": "docs/plans/PLAN-L3-1595-rule-derivation.md",
    "PREISO-REV-000031": "docs/plans/PLAN-L3-1608-instruction-path-change-resilience.md",
    "PREISO-REV-000032": "docs/plans/PLAN-L3-1610-conversation-lifetime-reconstruction.md",
    "PREISO-REV-000033": "docs/plans/PLAN-L3-1622-producer-provenance-separation.md",
    "PREISO-REV-000034": "docs/plans/PLAN-L3-1639-bugbot-generation.md",
    "PREISO-REV-000035": "docs/plans/PLAN-L3-1642-bugbot-bounded-repair.md",
    "PREISO-REV-000036": "docs/plans/PLAN-L3-54-distribution-package-release.md",
    "PREISO-REV-000037": "docs/plans/PLAN-L3-60-workflow-catalog-projection-authority.md",
    "PREISO-REV-000038": "docs/plans/PLAN-L3-61-github-workflow-guidance-authority.md",
    "PREISO-REV-000039": "docs/plans/PLAN-L3-62-security-capability-broker-authority.md",
    "PREISO-REV-000040": "docs/plans/PLAN-L3-63-codex-native-worker-routing.md",
    "PREISO-REV-000041": "docs/plans/PLAN-L3-64-codex-native-worker-project-hook-authority.md",
    "PREISO-REV-000042": "docs/plans/PLAN-L3-65-distribution-repository-devos-authority.md",
    "PREISO-REV-000043": "docs/plans/PLAN-L3-659-commercial-license-policy.md",
}
PRIOR_IDS = [
    "PREISO-REV-000001", "PREISO-REV-000002", "PREISO-REV-000015", "PREISO-REV-000016",
    "PREISO-REV-000026", "PREISO-REV-000060", "PREISO-REV-000003", "PREISO-REV-000004",
    "PREISO-REV-000005", "PREISO-REV-000006", "PREISO-REV-000007", "PREISO-REV-000008",
    "PREISO-REV-000009", "PREISO-REV-000010", "PREISO-REV-000011", "PREISO-REV-000012",
    "PREISO-REV-000013", "PREISO-REV-000014", "PREISO-REV-000017", "PREISO-REV-000018",
    "PREISO-REV-000019", "PREISO-REV-000020", "PREISO-REV-000021", "PREISO-REV-000022",
]
EXPECTED_NEGATIVES = {
    "RP-NEG-DIGEST", "RP-NEG-HUNK-COVERAGE", "RP-NEG-LEGACY-EXECUTION", "RP-NEG-PHASE-CLOSURE",
    "RP-NEG-OWNER-UNRESOLVED", "RP-NEG-AUTHORITY-NO-SUCCESSOR", "RP-NEG-ATOM-HOLD", "RP-NEG-COUNTEREVIDENCE",
}
REVIEW_ONLY_NUMBERS = {2, 3, 5, 7, 9, 11, 13, 15}
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

def read_json(path: Path, errors: list[str]) -> dict:
    try:
        value = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        fail(errors, f"JSONを読めない: {path}: {exc}"); return {}
    if not isinstance(value, dict): fail(errors, f"JSONがobjectではない: {path}"); return {}
    return value

def read_jsonl(path: Path, errors: list[str]) -> list[dict]:
    records = []
    try: lines = path.read_text(encoding="utf-8").splitlines()
    except OSError as exc: fail(errors, f"台帳を読めない: {path}: {exc}"); return records
    for no, line in enumerate(lines, 1):
        if not line.strip(): continue
        try: value = json.loads(line)
        except json.JSONDecodeError as exc: fail(errors, f"台帳JSON不正 {path}:{no}: {exc}"); continue
        if isinstance(value, dict): records.append(value)
        else: fail(errors, f"台帳recordがobjectではない {path}:{no}")
    return records

def git_blob(commit: str, path: str, errors: list[str]) -> bytes | None:
    result = subprocess.run(["git", "cat-file", "blob", f"{commit}:{path}"], cwd=ROOT, capture_output=True, check=False)
    if result.returncode: fail(errors, f"Git blobを読めない: {commit}:{path}"); return None
    return result.stdout

def line_span(blob: bytes, start: int, end: int) -> bytes | None:
    if start == 0 and end == -1: return b""
    if not isinstance(start, int) or not isinstance(end, int) or start < 1 or end < start - 1: return None
    if start == end + 1: return b""
    lines = blob.splitlines(keepends=True)
    if end > len(lines): return None
    return b"".join(lines[start - 1:end])

def check_span(errors: list[str], label: str, blob: bytes, declaration: dict) -> None:
    actual = line_span(blob, declaration.get("start_line"), declaration.get("end_line"))
    if actual is None: fail(errors, f"{label} line span不正"); return
    if declaration.get("exact_text") != actual.decode("utf-8", errors="replace"): fail(errors, f"{label} exact_text不一致")
    if declaration.get("sha256") != "sha256:" + hashlib.sha256(actual).hexdigest(): fail(errors, f"{label} SHA-256不一致")

def changed_end(start: int, count: int) -> int: return start + count - 1 if count else start - 1

def parse_diff(errors: list[str], paths: list[str] | None = None) -> list[tuple[str, int, int, int, int]]:
    command = ["git", "diff", "--unified=0", "--no-renames", BASELINE, PRE_ISOLATION]
    if paths is not None: command += ["--", *paths]
    result = subprocess.run(command, cwd=ROOT, capture_output=True, text=True, check=False)
    if result.returncode: fail(errors, f"Git diffを読めない: {result.stderr.strip()}"); return []
    current = None; hunks = []
    for line in result.stdout.splitlines():
        if line.startswith("diff --git a/"):
            marker = line[len("diff --git a/"):]; left, right = marker.split(" b/", 1); current = right if left == right else None
            if current is None: fail(errors, f"renameまたはpath差替えを検出: {line}")
        elif line.startswith("@@ "):
            match = DIFF_HUNK.match(line)
            if match is None or current is None: fail(errors, f"Git diff hunk header不正: {line}"); continue
            old_start = int(match.group(1)); old_count = int(match.group(2) or 1); new_start = int(match.group(3)); new_count = int(match.group(4) or 1)
            hunks.append((current, old_start, changed_end(old_start, old_count), new_start, changed_end(new_start, new_count)))
    return hunks

def main() -> int:
    parser = argparse.ArgumentParser(); parser.add_argument("--manifest", type=Path, default=DEFAULT_MANIFEST); parser.add_argument("--inventory", type=Path, default=DEFAULT_INVENTORY); args = parser.parse_args()
    errors: list[str] = []; manifest = read_json(args.manifest, errors); inventory = read_json(args.inventory, errors)
    holding = read_jsonl(ROOT / HOLDING_REL, errors); assets = read_jsonl(ROOT / ASSET_REL, errors); phases = read_jsonl(ROOT / PHASE_REL, errors)
    holding_by_id = {r.get("source_revision_item_id"): r for r in holding}; assets_by_path = {r.get("source_path"): r for r in assets}; phases_by_asset = {r.get("asset_id"): r for r in phases}
    for key, value in (("schema", "helix-scaffold-preisolation-research-manifest.v1"), ("candidate_kind", "research_premise"), ("status", "candidate_pending_semantic_equivalence_review"), ("authority_effect", "none"), ("meaning_change_applied", False), ("successor_requirement_ids", []), ("human_decision_ref", None), ("equivalence_claim", None)):
        if manifest.get(key) != value: fail(errors, f"manifest {key}が固定候補境界と不一致")
    comparison = manifest.get("comparison", {})
    expected = {"baseline_commit": BASELINE, "pre_isolation_commit": PRE_ISOLATION, "archive_commit": ARCHIVE, "full_diff_file_count": 400, "full_diff_hunk_count": 492, "prior_reviewed_scope_file_count": 24, "prior_reviewed_scope_hunk_count": 91, "residual_before_current_selection_file_count": 376, "residual_before_current_selection_hunk_count": 401, "current_selected_file_count": 20, "current_selected_hunk_count": 21, "combined_selected_file_count": 44, "combined_selected_hunk_count": 112, "remaining_after_current_selection_file_count": 356, "remaining_after_current_selection_hunk_count": 380}
    for key, value in expected.items():
        if comparison.get(key) != value: fail(errors, f"comparison {key}不一致")
    if comparison.get("old_runtime_test_ci_execution") is not False: fail(errors, "old_runtime_test_ci_executionはfalseに固定する")
    if comparison.get("method") != "read-only Git object bytes; exact changed hunk spans and UTF-8 SHA-256": fail(errors, "comparison method不一致")
    expected_prior = {"request_ids": ["GUI-1934-REVIEW-02", "SCF-B-0007", "SCF-B-0009"], "integration_ref": "PR-1943", "source_revision_item_ids": PRIOR_IDS, "file_count": 24, "hunk_count": 91}
    if comparison.get("prior_reviewed_scope") != expected_prior: fail(errors, "prior reviewed scope不一致")
    scope = manifest.get("scope", {})
    if scope.get("diff_scope") != "selected_source_items_only" or scope.get("candidate_kind") != "research_premise" or scope.get("selected_source_revision_item_ids") != EXPECTED_IDS or scope.get("prior_reviewed_source_revision_item_ids") != PRIOR_IDS: fail(errors, "manifest scope不一致")
    rows = manifest.get("paths")
    if not isinstance(rows, list) or [r.get("source_revision_item_id") for r in rows] != EXPECTED_IDS: fail(errors, "manifest pathsのID順序不一致")
    rows = rows if isinstance(rows, list) else []; path_by_id = {}
    for row in rows:
        item_id = row.get("source_revision_item_id"); path_by_id[item_id] = row
        expected_path = EXPECTED_PATHS.get(item_id)
        if expected_path is None: fail(errors, f"未知のselected ID: {item_id}"); continue
        holding_row = holding_by_id.get(item_id)
        if holding_row is None: fail(errors, f"holding欠落: {item_id}"); continue
        for field in HOLDING_KEYS:
            if row.get(field) != holding_row.get(field): fail(errors, f"{item_id} holding field不一致: {field}")
        if row.get("source_path") != expected_path or row.get("candidate_kind") != "research_premise": fail(errors, f"{item_id} path／candidate kind不一致")
        if row.get("product_owner_candidate") != "unresolved" or row.get("secondary_consumer_candidate") is not None: fail(errors, f"{item_id} owner候補不一致")
        asset = assets_by_path.get(expected_path); phase = phases_by_asset.get(asset.get("asset_id")) if asset else None
        for key, source, fields in (("legacy_asset", asset, ASSET_KEYS), ("phase_classification", phase, PHASE_KEYS)):
            if source is None: fail(errors, f"{item_id} {key} snapshot欠落"); continue
            for field in fields:
                if row.get(key, {}).get(field) != source.get(field): fail(errors, f"{item_id} {key}不一致: {field}")
        if phase and (phase.get("consumer_closure_status") != "pending" or phase.get("legacy_execution_performed") is not False): fail(errors, f"{item_id} phase未確認境界不一致")
    if set(path_by_id) != set(EXPECTED_IDS): fail(errors, "manifest source ID集合不一致")
    full_hunks = parse_diff(errors); selected_paths = [EXPECTED_PATHS[i] for i in EXPECTED_IDS]; selected_hunks = parse_diff(errors, selected_paths)
    if len({p for p, *_ in full_hunks}) != 400 or len(full_hunks) != 492: fail(errors, f"全体diff分母不一致: files={len({p for p, *_ in full_hunks})} hunks={len(full_hunks)}")
    if len({p for p, *_ in selected_hunks}) != 20 or len(selected_hunks) != 21: fail(errors, f"selected diff scope不一致: files={len({p for p, *_ in selected_hunks})} hunks={len(selected_hunks)}")
    for key, value in (("schema", "helix-scaffold-preisolation-research-semantic-diff.v1"), ("candidate_kind", "research_premise"), ("status", "candidate_pending_semantic_equivalence_review"), ("authority_effect", "none"), ("meaning_change_applied", False), ("successor_requirement_ids", []), ("human_decision_ref", None), ("equivalence_claim", None)):
        if inventory.get(key) != value: fail(errors, f"inventory {key}が固定候補境界と不一致")
    if inventory.get("comparison") != comparison or inventory.get("diff_scope") != scope or inventory.get("source_items") != rows: fail(errors, "inventory comparison／scope／source items不一致")
    if inventory.get("classification_unit") != "hunk_fragment" or inventory.get("classification_counts_are_not_semantic_atom_counts") is not True: fail(errors, "hunk分類とatom境界の固定値不一致")
    atom = inventory.get("semantic_atomization", {}); atom_expected = {"status": "not_started", "hunk_level_classification_only": True, "semantic_atomization_complete": False, "semantic_atom_count": 0, "hunk_fragment_count": 21, "compound_hunk_hold_count": 21, "semantic_subunit_reviewed_fragment_count": 8, "semantic_subunit_count": 8, "fully_unsubdivided_fragment_count": 13, "remaining_semantic_denominator": "21 research-premise hunk fragments remain non-atomic; 8 subunits are review-only decomposition candidates and do not establish semantic atom coverage"}
    for key, value in atom_expected.items():
        if atom.get(key) != value: fail(errors, f"semantic_atomization {key}不一致")
    fragments = inventory.get("fragments"); fragments = fragments if isinstance(fragments, list) else []
    if len(fragments) != 21: fail(errors, f"fragments件数不一致: {len(fragments)}")
    seen = set(); inventory_hunks = []; counts = {"research_premise": 0, "unresolved": 0}
    for fragment in fragments:
        fid = fragment.get("fragment_id"); seen.add(fid); sid = fragment.get("source_revision_item_id"); path = fragment.get("source_path")
        if not isinstance(fid, str) or sid not in EXPECTED_IDS: fail(errors, f"fragment identity不正: {fid}"); continue
        if path != EXPECTED_PATHS[sid] or fragment.get("classification") != "research_premise" or fragment.get("candidate_kind") != "research_premise": fail(errors, f"{fid} path／classification不一致")
        if fragment.get("product_owner_candidate") != "unresolved" or fragment.get("secondary_consumer_candidate") is not None: fail(errors, f"{fid} owner候補不一致")
        if fragment.get("classification_unit") != "hunk_fragment" or fragment.get("hunk_level_classification_only") is not True or fragment.get("semantic_atomization_status") != "not_atomized": fail(errors, f"{fid} hunk／atom境界不一致")
        hold = fragment.get("compound_hunk_hold", {})
        if hold.get("hold_id") != f"RDP001-RESEARCH-HOLD-{fid}" or hold.get("status") != "held_as_compound_hunk" or hold.get("semantic_atom_count") != 0: fail(errors, f"{fid} compound hold不一致")
        if not isinstance(fragment.get("normalized_statement"), str) or len(fragment["normalized_statement"]) < 20 or not fragment.get("unresolved_meaning") or not fragment.get("possible_conflicts") or not fragment.get("counterevidence"): fail(errors, f"{fid} review boundary／counterevidence欠落")
        counts["research_premise"] += 1; b = fragment.get("baseline", {}); p = fragment.get("pre_isolation", {}); inventory_hunks.append((path, b.get("start_line"), b.get("end_line"), p.get("start_line"), p.get("end_line")))
        bb = git_blob(BASELINE, path, errors); pb = git_blob(PRE_ISOLATION, path, errors)
        if bb is not None: check_span(errors, f"{fid} baseline", bb, b)
        if pb is not None: check_span(errors, f"{fid} pre-isolation", pb, p)
        if b.get("exact_text") == p.get("exact_text"): fail(errors, f"{fid} changed fragment textが同一")
        negative_ids = fragment.get("retained_negative_ids", [])
        if not negative_ids or not set(negative_ids).issubset(EXPECTED_NEGATIVES): fail(errors, f"{fid} retained negative不正")
        number = int(fid.rsplit("-", 1)[1]); subs = fragment.get("semantic_subunits", []); expected_subs = [f"{fid}-SU-01"] if number in REVIEW_ONLY_NUMBERS else []
        if [s.get("semantic_subunit_id") for s in subs] != expected_subs: fail(errors, f"{fid} review-only subunit集合不一致")
        for sub in subs:
            span = sub.get("source_span", {})
            if sub.get("semantic_status") != "review_only_candidate" or sub.get("owner_candidate") != "unresolved" or sub.get("candidate_kind") != "unresolved" or sub.get("source_fragment_id") != fid: fail(errors, f"{fid} review-only subunit境界不一致")
            if span.get("revision") != "pre_isolation" or span.get("commit") != PRE_ISOLATION: fail(errors, f"{fid} subunit revision不一致")
            if pb is not None: check_span(errors, f"{fid} review-only subunit", pb, span)
    if seen != {f"RDP001-RESEARCH-DIFF-{n:03d}" for n in range(1, 22)}: fail(errors, "fragment ID集合不一致")
    if counts != {"research_premise": 21, "unresolved": 0}: fail(errors, f"classification counts不一致: {counts}")
    if sorted(inventory_hunks) != sorted(selected_hunks): fail(errors, "Git diff hunkとinventory spanの集合不一致")
    negatives = inventory.get("retained_negatives", []); negative_ids = {n.get("negative_id") for n in negatives if isinstance(n, dict)}
    if negative_ids != EXPECTED_NEGATIVES: fail(errors, "negative ID集合不一致")
    referenced = {n for f in fragments for n in f.get("retained_negative_ids", [])}
    if referenced != EXPECTED_NEGATIVES: fail(errors, "fragmentとnegativeの参照集合不一致")
    if errors:
        print("FAIL: RDP-001 research-premise 20-path candidate"); print("\n".join(f"- {e}" for e in errors)); return 1
    print("PASS: RDP-001 research-premise 20-path candidate (read-only static check)")
    print("prior reviewed=24 files / 91 hunks; current selected=20 files / 21 hunks; combined selected=44 files / 112 hunks")
    print("remaining after current selection=356 files / 380 hunks")
    print("hunk_classification_counts=research_premise:21; unresolved:0; semantic_atoms=0; compound_hunk_holds=21; review_only_subunits=8")
    print(f"authority_effect={inventory['authority_effect']}; semantic_equivalence={'unresolved' if inventory['equivalence_claim'] is None else inventory['equivalence_claim']}; legacy runtime/test/CI execution={comparison['old_runtime_test_ci_execution']}")
    return 0

if __name__ == "__main__": raise SystemExit(main())
