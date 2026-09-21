#!/usr/bin/env python3
"""RDP-001 PREISOLATION-002 の8 review-only subunitを静的検証する。

旧Git objectはsource bytesの照合だけに使う。archive/runtime/test/CIは実行しない。
"""
from __future__ import annotations

import argparse
import hashlib
import json
import re
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
HERE = Path(__file__).resolve().parent
DEFAULT_MANIFEST = HERE / "rdp001-preiso002-atomization.json"
DEFAULT_INVENTORY = HERE / "rdp001-preiso002-semantic-atom-inventory.json"
HOLDING_REL = "docs/governance/pre-isolation-revision-delta-source-holding.jsonl"
ASSET_REL = "docs/governance/legacy-asset-disposition.jsonl"
PHASE_REL = "docs/governance/legacy-asset-phase-product-classification-bootstrap.jsonl"
DECISION_REL = "docs/governance/legacy-asset-decisions.jsonl"
BASELINE = "6fabd12512a3659fff4a956692cdd61faeeb16ce"
PRE_ISOLATION = "2d4991042be55268bac30a8bbcdac45b3865030a"
ARCHIVE = "064280b5c1c5c98f949e6e3be5ef87cbe4a4b658"
PARENT_REF = "a14310ad225d02727f046da03963ae94ead0718a"
PARENT_MANIFEST = "scaffold/pre-isolation-research-next60/rdp001-preiso-research-next60.json"
PARENT_INVENTORY = "scaffold/pre-isolation-research-next60/rdp001-preiso-research-next60-semantic-diff-inventory.json"
EXPECTED_IDS = ["PREISO-REV-000089", "PREISO-REV-000096", "PREISO-REV-000103", "PREISO-REV-000110", "PREISO-REV-000117", "PREISO-REV-000124", "PREISO-REV-000131", "PREISO-REV-000138"]
EXPECTED_PATHS = {
    "PREISO-REV-000089": "docs/plans/PLAN-L7-570-design-elicitation-typed-classification.md",
    "PREISO-REV-000096": "docs/plans/PLAN-L7-577-github-execution-episode-location-projection.md",
    "PREISO-REV-000103": "docs/plans/PLAN-L7-584-current-location-workflow-identity.md",
    "PREISO-REV-000110": "docs/plans/PLAN-L7-639-luna-worker-model-registry.md",
    "PREISO-REV-000117": "docs/plans/PLAN-L7-647-typed-backfill-pending-routing.md",
    "PREISO-REV-000124": "docs/plans/PLAN-L7-654-distribution-devos-instruction-authority.md",
    "PREISO-REV-000131": "docs/plans/PLAN-L7-661-lite-requirements-manifest-oracle.md",
    "PREISO-REV-000138": "docs/plans/PLAN-L7-668-project-hook-authority-surface-projector.md",
}
EXPECTED_LINES = {"PREISO-REV-000089": 12, "PREISO-REV-000096": 13, "PREISO-REV-000103": 12, "PREISO-REV-000110": 63, "PREISO-REV-000117": 35, "PREISO-REV-000124": 12, "PREISO-REV-000131": 36, "PREISO-REV-000138": 13}
EXPECTED_NEGATIVES = {"RDP002-NEG-DIGEST", "RDP002-NEG-ATOM-PROMOTION", "RDP002-NEG-PRODUCT-PROMOTION", "RDP002-NEG-IMPLEMENTATION-CLOSURE", "RDP002-NEG-DECISION-ABSENCE", "RDP002-NEG-ARCHIVE-EXECUTION", "RDP002-NEG-HUNK-ATOM-CONFLATION", "RDP002-NEG-BASE-FRESHNESS"}
DIGEST_LINE = "  registry_source_digest: sha256:"
DIFF_HUNK = re.compile(r"^@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @")

def fail(errors: list[str], msg: str) -> None:
    errors.append(msg)

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
    try:
        lines = path.read_text(encoding="utf-8").splitlines()
    except OSError as exc:
        fail(errors, f"JSONLを読めない: {path}: {exc}")
        return []
    records = []
    for number, line in enumerate(lines, 1):
        if not line.strip():
            continue
        try:
            value = json.loads(line)
        except json.JSONDecodeError as exc:
            fail(errors, f"JSONL不正 {path}:{number}: {exc}")
            continue
        if isinstance(value, dict):
            records.append(value)
        else:
            fail(errors, f"JSONL recordがobjectではない {path}:{number}")
    return records

def sha256_bytes(value: bytes) -> str:
    return hashlib.sha256(value).hexdigest()

def sha256_file(path: Path) -> str:
    return sha256_bytes(path.read_bytes())

def git_blob(commit: str, path: str, errors: list[str]) -> bytes | None:
    result = subprocess.run(["git", "cat-file", "blob", f"{commit}:{path}"], cwd=ROOT, capture_output=True, check=False)
    if result.returncode:
        fail(errors, f"Git blobを読めない: {commit}:{path}")
        return None
    return result.stdout

def git_json(commit: str, path: str, errors: list[str]) -> dict:
    blob = git_blob(commit, path, errors)
    if blob is None:
        return {}
    try:
        value = json.loads(blob)
    except json.JSONDecodeError as exc:
        fail(errors, f"parent artifact JSON不正 {commit}:{path}: {exc}")
        return {}
    if not isinstance(value, dict):
        fail(errors, f"parent artifactがobjectではない: {commit}:{path}")
        return {}
    return value

def line_span(blob: bytes, start: int, end: int) -> bytes | None:
    if not isinstance(start, int) or not isinstance(end, int) or start < 1 or end < start:
        return None
    lines = blob.splitlines(keepends=True)
    if end > len(lines):
        return None
    return b"".join(lines[start - 1:end])

def check_span(errors: list[str], label: str, blob: bytes, declaration: dict) -> None:
    actual = line_span(blob, declaration.get("start_line"), declaration.get("end_line"))
    if actual is None:
        fail(errors, f"{label} line span不正")
        return
    expected = declaration.get("exact_text")
    if expected != actual.decode("utf-8", errors="replace"):
        fail(errors, f"{label} exact_text不一致")
    if declaration.get("sha256") != "sha256:" + sha256_bytes(actual):
        fail(errors, f"{label} SHA-256不一致")

def changed_end(start: int, count: int) -> int:
    return start + count - 1 if count else start - 1

def parse_diff(errors: list[str], paths: list[str] | None = None) -> list[tuple[str, int, int, int, int]]:
    command = ["git", "diff", "--unified=0", "--no-renames", BASELINE, PRE_ISOLATION]
    if paths:
        command += ["--", *paths]
    result = subprocess.run(command, cwd=ROOT, capture_output=True, text=True, check=False)
    if result.returncode:
        fail(errors, f"Git diffを読めない: {result.stderr.strip()}")
        return []
    current = None
    hunks = []
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

def expected_comparison() -> dict:
    return {
        "baseline_commit": BASELINE, "pre_isolation_commit": PRE_ISOLATION, "archive_commit": ARCHIVE,
        "method": "read-only Git object bytes; exact changed hunk spans and UTF-8 SHA-256", "old_runtime_test_ci_execution": False,
        "source_holding_record_count": 333, "full_diff_file_count": 400, "full_diff_hunk_count": 492,
        "parent_candidate_file_count": 60, "parent_candidate_hunk_count": 60, "parent_candidate_review_only_subunit_count": 8,
        "parent_candidate_semantic_atom_count": 0, "combined_selected_before_parent_file_count": 84,
        "combined_selected_before_parent_hunk_count": 152, "residual_before_parent_file_count": 316,
        "residual_before_parent_hunk_count": 340, "combined_selected_through_parent_file_count": 144,
        "combined_selected_through_parent_hunk_count": 212, "remaining_after_parent_file_count": 256,
        "remaining_after_parent_hunk_count": 280, "source_holding_selected_before_parent_count": 84,
        "source_holding_parent_count": 60, "source_holding_remaining_record_count": 189,
        "current_atomization_subunit_count": 8, "current_atomization_candidate_count": 8,
        "current_atomization_accepted_atom_count": 0, "current_atomization_unresolved_count": 8,
        "current_compound_hunk_hold_count": 8, "candidate_worktree_base_commit": "c354b7d9177ad3ea92dec30c66c36e6ce2d66ae3",
        "base_freshness_gate": False, "base_update_rebase_performed": False,
        "base_update_policy": "source input digest is fixed; later base update is review-side test-merge handling, not candidate freshness validation",
    }

def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--manifest", type=Path, default=DEFAULT_MANIFEST)
    parser.add_argument("--inventory", type=Path, default=DEFAULT_INVENTORY)
    args = parser.parse_args()
    errors: list[str] = []
    manifest = read_json(args.manifest, errors); inventory = read_json(args.inventory, errors)
    holding = read_jsonl(ROOT / HOLDING_REL, errors); assets = read_jsonl(ROOT / ASSET_REL, errors)
    phases = read_jsonl(ROOT / PHASE_REL, errors); decisions = read_jsonl(ROOT / DECISION_REL, errors)
    holding_by_id = {r.get("source_revision_item_id"): r for r in holding}
    assets_by_path = {r.get("source_path"): r for r in assets}
    phases_by_asset = {r.get("asset_id"): r for r in phases}
    decision_asset_ids = {r.get("asset_id") for r in decisions}

    for key, expected in [("schema", "helix-scaffold-preisolation-002-atomization-manifest.v1"), ("candidate_id", "RDP-001-PREISOLATION-002"), ("candidate_kind", "research_premise"), ("status", "candidate_pending_semantic_equivalence_review"), ("authority_effect", "none"), ("meaning_change_applied", False), ("successor_requirement_ids", []), ("human_decision_ref", None), ("equivalence_claim", None)]:
        if manifest.get(key) != expected:
            fail(errors, f"manifest {key}が固定候補境界と不一致")
    for key, expected in [("schema", "helix-scaffold-preisolation-002-atomization-inventory.v1"), ("candidate_id", "RDP-001-PREISOLATION-002"), ("candidate_kind", "research_premise"), ("status", "candidate_pending_semantic_equivalence_review"), ("authority_effect", "none"), ("meaning_change_applied", False), ("successor_requirement_ids", []), ("human_decision_ref", None), ("equivalence_claim", None)]:
        if inventory.get(key) != expected:
            fail(errors, f"inventory {key}が固定候補境界と不一致")
    comparison = manifest.get("comparison", {})
    for key, expected in expected_comparison().items():
        if comparison.get(key) != expected:
            fail(errors, f"comparison {key}不一致")
    if inventory.get("comparison") != comparison:
        fail(errors, "inventory comparison不一致")

    scope = manifest.get("scope", {})
    if scope != inventory.get("scope"):
        fail(errors, "manifest／inventory scope不一致")
    if scope.get("selected_source_revision_item_ids") != EXPECTED_IDS or scope.get("selected_source_paths") != [EXPECTED_PATHS[i] for i in EXPECTED_IDS]:
        fail(errors, "selected source ID／path集合不一致")
    if scope.get("parent_candidate_ref") != PARENT_REF or scope.get("parent_candidate_status_at_selection") != "unmerged_candidate" or scope.get("parent_candidate_status_at_atomization") != "unmerged_candidate":
        fail(errors, "parent candidate status／ref不一致")

    parent_manifest = git_json(PARENT_REF, PARENT_MANIFEST, errors)
    parent_inventory = git_json(PARENT_REF, PARENT_INVENTORY, errors)
    parent_scope = parent_manifest.get("scope", {})
    parent_ids = parent_scope.get("selected_source_revision_item_ids", [])
    if parent_ids != [f"PREISO-REV-{n:06d}" for n in range(85, 145)]:
        fail(errors, "parent candidate selected ID denominator不一致")
    parent_review_ids = parent_inventory.get("semantic_atomization", {}).get("semantic_subunit_reviewed_fragment_ids", [])
    expected_parent_review = [f"RDP001-RESEARCH60-DIFF-{n:03d}" for n in (5, 12, 19, 26, 33, 40, 47, 54)]
    if parent_review_ids != expected_parent_review:
        fail(errors, "parent review-only subunit集合不一致")
    parent_manifest_sha = hashlib.sha256(git_blob(PARENT_REF, PARENT_MANIFEST, errors) or b"").hexdigest()
    parent_inventory_sha = hashlib.sha256(git_blob(PARENT_REF, PARENT_INVENTORY, errors) or b"").hexdigest()
    parent_artifacts = manifest.get("parent_candidate_artifacts", {})
    if parent_artifacts.get("ref") != PARENT_REF or parent_artifacts.get("manifest_sha256") != parent_manifest_sha or parent_artifacts.get("inventory_sha256") != parent_inventory_sha:
        fail(errors, "parent artifact digest不一致")

    source_digests = manifest.get("source_input_digests", {})
    if source_digests != inventory.get("source_input_digests"):
        fail(errors, "source_input_digests不一致")
    for rel, digest in source_digests.items():
        path = ROOT / rel
        if not path.is_file() or sha256_file(path) != digest:
            fail(errors, f"source input staleまたは欠落: {rel}")

    rows = manifest.get("subunits", [])
    atoms = inventory.get("atoms", [])
    if [r.get("source_revision_item_id") for r in rows] != EXPECTED_IDS:
        fail(errors, "manifest subunitsのID順序不一致")
    if [r.get("source_revision_item_id") for r in atoms] != EXPECTED_IDS:
        fail(errors, "inventory atomsのID順序不一致")
    if len(rows) != 8 or len(atoms) != 8:
        fail(errors, "8 subunit／atom recordsが揃っていない")
    selected_hunks = parse_diff(errors, [EXPECTED_PATHS[i] for i in EXPECTED_IDS]); full_hunks = parse_diff(errors)
    if len({p for p, *_ in full_hunks}) != 400 or len(full_hunks) != 492:
        fail(errors, f"全体Git hunk denominator不一致: files={len({p for p, *_ in full_hunks})} hunks={len(full_hunks)}")
    if len({p for p, *_ in selected_hunks}) != 8 or len(selected_hunks) != 8:
        fail(errors, f"selected Git hunk denominator不一致: files={len({p for p, *_ in selected_hunks})} hunks={len(selected_hunks)}")

    expected_text_base = "  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89\n"
    expected_text_pre = "  registry_source_digest: sha256:1ce90d804f6dd44bcd13a72c1dff6bde6a4b6137bd46650ef2a70367bee8501c\n"
    expected_hunks = []
    for row, atom in zip(rows, atoms):
        sid = row.get("source_revision_item_id"); path = EXPECTED_PATHS.get(sid)
        if path is None or row.get("source_path") != path or atom.get("source_path") != path:
            fail(errors, f"{sid} path不一致"); continue
        if row.get("source_holding_snapshot") != holding_by_id.get(sid):
            fail(errors, f"{sid} source holding snapshot不一致")
        holding_row = holding_by_id.get(sid); asset = assets_by_path.get(path); phase = phases_by_asset.get(asset.get("asset_id")) if asset else None
        if holding_row is None or asset is None or phase is None:
            fail(errors, f"{sid} ledger snapshot欠落"); continue
        if row.get("legacy_asset_snapshot") != asset or row.get("phase_classification_snapshot") != phase:
            fail(errors, f"{sid} asset／phase snapshot不一致")
        archive_blob = git_blob(ARCHIVE, holding_row.get("archive_path", ""), errors)
        if archive_blob is not None and sha256_bytes(archive_blob) != holding_row.get("pre_isolation_file_sha256"):
            fail(errors, f"{sid} archive source SHA-256がholdingと不一致")
        if asset.get("asset_id") in decision_asset_ids or row.get("decision_history", {}).get("record_count") != 0 or row.get("decision_history", {}).get("matching_asset_decision_records") != []:
            fail(errors, f"{sid} decision historyが該当0件境界と不一致")
        if row.get("legacy_implementation_status") != asset.get("implementation_status") or row.get("consumer_closure_status") != phase.get("consumer_closure_status") or row.get("ledger_consumer_refs") != phase.get("consumer_refs"):
            fail(errors, f"{sid} implementation／consumer snapshot不一致")
        baseline = row.get("baseline", {}); pre = row.get("pre_isolation", {}); line = EXPECTED_LINES[sid]
        atom_baseline = atom.get("baseline", {}); atom_pre = atom.get("pre_isolation", {})
        for span, atom_span, label, commit, text in [(baseline, atom_baseline, "baseline", BASELINE, expected_text_base), (pre, atom_pre, "pre-isolation", PRE_ISOLATION, expected_text_pre)]:
            if span.get("commit") != commit or span.get("start_line") != line or span.get("end_line") != line or span.get("exact_text") != text:
                fail(errors, f"{sid} {label} exact span declaration不一致")
            if atom_span != span:
                fail(errors, f"{sid} inventory {label} exact span不一致")
            blob = git_blob(commit, path, errors)
            if blob is not None: check_span(errors, f"{sid} {label}", blob, span)
        for record, label in ((row, "manifest"), (atom, "inventory")):
            if record.get("classification") != "research_premise" or record.get("candidate_kind") != "research_premise" or record.get("classification_unit") != "hunk_fragment" or record.get("hunk_level_classification_only") is not True:
                fail(errors, f"{sid} {label} hunk／atom classification boundary不一致")
            hold = record.get("compound_hunk_hold", {})
            if hold.get("hold_id") != f"RDP001-PREISO002-HOLD-{record.get('source_fragment_id')}" or hold.get("status") != "held_as_compound_hunk" or hold.get("semantic_atom_count") != 0:
                fail(errors, f"{sid} {label} compound hunk hold不一致")
        if row.get("semantic_atom") is not None or row.get("atom_status") != "unresolved_not_atomized":
            fail(errors, f"{sid} atom promotionを検出")
        if atom.get("semantic_atom") is not None or atom.get("atom_status") != "unresolved_not_atomized":
            fail(errors, f"{sid} inventory atom promotionを検出")
        if atom.get("source_fragment_id") != row.get("source_fragment_id") or atom.get("semantic_subunit_id") != row.get("semantic_subunit_id"):
            fail(errors, f"{sid} atom source identity不一致")
        for field in ("candidate_product_targets", "candidate_phase_targets", "phase_classification_status", "product_classification_status", "legacy_implementation_status", "consumer_closure_status", "ledger_consumer_refs", "semantic_atom", "atom_status"):
            if atom.get(field) != row.get(field):
                fail(errors, f"{sid} atom {field} snapshot不一致")
        if row.get("candidate_product_targets") != phase.get("candidate_product_targets") or row.get("candidate_phase_targets") != phase.get("candidate_phase_targets"):
            fail(errors, f"{sid} candidate product／phase snapshot不一致")
        expected_hunks.append((path, line, line, line, line))

    atomization = inventory.get("semantic_atomization", {})
    atom_expected = {"status":"bounded_review_complete_unresolved", "hunk_level_classification_only":True, "semantic_atomization_complete":False, "semantic_atom_count":0, "accepted_atom_count":0, "hunk_fragment_count":8, "compound_hunk_hold_count":8, "semantic_subunit_count":8, "unresolved_atomization_count":8}
    for key, value in atom_expected.items():
        if atomization.get(key) != value:
            fail(errors, f"semantic_atomization {key}不一致")
    if inventory.get("classification_unit") != "hunk_fragment" or inventory.get("classification_counts_are_not_semantic_atom_counts") is not True:
        fail(errors, "hunk classification／atomization distinction不一致")
    negative_ids = {n.get("negative_id") for n in manifest.get("retained_negatives", []) if isinstance(n, dict)}
    if negative_ids != EXPECTED_NEGATIVES or {n.get("negative_id") for n in inventory.get("retained_negatives", [])} != EXPECTED_NEGATIVES:
        fail(errors, "negative case集合不一致")
    if sorted(expected_hunks) != sorted(selected_hunks):
        fail(errors, "selected Git hunkと8 exact spanの集合不一致")
    for row in rows:
        source = row.get("legacy_source_evidence", {})
        for field in ("behavior_contract", "responsibility", "failure_or_unresolved", "legacy_declared_consumer_candidates", "removal_trigger"):
            if not source.get(field):
                fail(errors, f"{row.get('source_revision_item_id')} old source {field} evidence欠落")
    if errors:
        print("FAIL: RDP-001 PREISOLATION-002 semantic atomization")
        print("\n".join(f"- {e}" for e in errors))
        return 1
    print("PASS: RDP-001 PREISOLATION-002 semantic atomization (read-only static check)")
    print("Git denominator=400 files / 492 hunks; parent next60=60 files / 60 hunks; parent combined=144 files / 212 hunks; remaining=256 files / 280 hunks")
    print("review-only subunits=8; selected exact paths/hunks=8 / 8; semantic atoms=0; compound hunk holds=8; unresolved atomization=8")
    print("decision matches=0; legacy implementation=unknown; consumer closure=pending; authority_effect=none; old runtime/test/CI execution=false")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
