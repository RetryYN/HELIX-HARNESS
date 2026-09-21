#!/usr/bin/env python3
"""RDP-001 要件含有差分候補4 pathのread-only静的検証。"""
from __future__ import annotations

import argparse
import hashlib
import json
import re
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
BASELINE = "6fabd12512a3659fff4a956692cdd61faeeb16ce"
PRE_ISOLATION = "2d4991042be55268bac30a8bbcdac45b3865030a"
ARCHIVE = "064280b5c1c5c98f949e6e3be5ef87cbe4a4b658"
SELECTED_IDS = [f"PREISO-REV-{n:06d}" for n in range(330, 334)]
EXPECTED_PATHS = {
    SELECTED_IDS[0]: "docs/test-design/helix/L1-pillar-operational-test-design.md",
    SELECTED_IDS[1]: "docs/test-design/helix/L2-screen-ux-test-design.md",
    SELECTED_IDS[2]: "docs/test-design/helix/L3-pillar-acceptance-test-design.md",
    SELECTED_IDS[3]: "tests/vmodel-pair.test.ts",
}
EXPECTED_CATEGORIES = {
    SELECTED_IDS[0]: "verification_source",
    SELECTED_IDS[1]: "verification_source",
    SELECTED_IDS[2]: "verification_source",
    SELECTED_IDS[3]: "other_legacy_asset",
}
EXPECTED_ASSETS = {
    EXPECTED_PATHS[SELECTED_IDS[0]]: "LEGACY-ASSET-A177ACE0F87CF894BA23",
    EXPECTED_PATHS[SELECTED_IDS[1]]: "LEGACY-ASSET-73C1830CFD650CEFDCF3",
    EXPECTED_PATHS[SELECTED_IDS[2]]: "LEGACY-ASSET-44DD86E3DEC09E65EF51",
    EXPECTED_PATHS[SELECTED_IDS[3]]: "LEGACY-ASSET-330DCC777CF2F7C5331E",
}
INPUT_DIGESTS = {
    "docs/governance/pre-isolation-revision-delta-source-holding.jsonl": "d61a36db8e053d9006d11a09d1c60fd86413f32daa4a766aaeae2bc849130180",
    "docs/governance/legacy-asset-disposition.jsonl": "cd73ac407937ad86c6be2c0b27d70863b1873fe39c2d6c0f89620e648dccad8c",
    "docs/governance/legacy-asset-phase-product-classification-bootstrap.jsonl": "2188f236cb7ed316772ee1fcf413f3b098f702cb4c9d9b3dad09a72db7468c1f",
    "docs/governance/requirement-atomization-review-contract.md": "adf39ac913498acd6370788e9e510b29cb0b88fa165bfa497ac489956e76c9ba",
}
NEGATIVE_IDS = {
    "REQNEXT4-NEG-BASELINE-PROVENANCE", "REQNEXT4-NEG-HUNK-COVERAGE", "REQNEXT4-NEG-PRIOR-OVERLAP", "REQNEXT4-NEG-PRIOR-LINEAGE",
    "REQNEXT4-NEG-METADATA-ONLY-EXCLUSION", "REQNEXT4-NEG-ATOM-CLAIM", "REQNEXT4-NEG-ARCHIVE-EXECUTION",
    "REQNEXT4-NEG-CLOSURE-CLAIM",
}
PRIOR_SCOPES = [
    {"request_ref": "PR-1943", "status": "integrated", "source_revision_item_id_range": [[1, 22], [26, 26], [60, 60]], "file_count": 24, "hunk_count": 91},
    {"request_ref": "PR-1946", "status": "integrated", "source_revision_item_id_range": [[23, 25], [27, 43]], "file_count": 20, "hunk_count": 21},
    {"request_ref": "PR-1949", "status": "integrated", "source_revision_item_id_range": [[44, 59], [61, 84]], "file_count": 40, "hunk_count": 40},
    {"request_ref": "PR-1951", "status": "integrated", "candidate_ref": "e99781d1a6135195bbe5d20a63c80d0fc70af46e", "candidate_ref_role": "historical_round1_candidate_ref", "status_at_selection": "unmerged_candidate", "status_at_rebaseline": "integrated_in_latest_main", "integration_commit": "4007b22dbcad45640ba0ee87393f6d2e290640ad", "integration_head": "a14310ad225d02727f046da03963ae94ead0718a", "source_revision_item_id_range": [[85, 144]], "file_count": 60, "hunk_count": 60},
]
HUNK_RE = re.compile(r"^@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @")


def read_json(path: Path, errors: list[str]) -> dict:
    try:
        value = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        errors.append(f"JSONを読めない: {path}: {exc}")
        return {}
    if not isinstance(value, dict):
        errors.append(f"JSONがobjectではない: {path}")
        return {}
    return value


def read_jsonl(path: Path, errors: list[str]) -> list[dict]:
    records: list[dict] = []
    try:
        lines = path.read_text(encoding="utf-8").splitlines()
    except OSError as exc:
        errors.append(f"台帳を読めない: {path}: {exc}")
        return records
    for no, line in enumerate(lines, 1):
        if not line.strip():
            continue
        try:
            value = json.loads(line)
        except json.JSONDecodeError as exc:
            errors.append(f"台帳JSON不正 {path}:{no}: {exc}")
            continue
        if isinstance(value, dict):
            records.append(value)
        else:
            errors.append(f"台帳recordがobjectではない {path}:{no}")
    return records


def git_bytes(commit: str, path: str, errors: list[str]) -> bytes | None:
    result = subprocess.run(["git", "cat-file", "blob", f"{commit}:{path}"], cwd=ROOT, capture_output=True, check=False)
    if result.returncode:
        errors.append(f"Git blobを読めない: {commit}:{path}")
        return None
    return result.stdout


def span(blob: bytes, start: int, end: int) -> bytes | None:
    if not isinstance(start, int) or not isinstance(end, int) or start < 1 or end < start - 1:
        return None
    if start == end + 1:
        return b""
    lines = blob.splitlines(keepends=True)
    if end > len(lines):
        return None
    return b"".join(lines[start - 1:end])


def end_line(start: int, count: int) -> int:
    return start + count - 1 if count else start - 1


def parse_diff(errors: list[str], paths: list[str] | None = None) -> list[tuple[str, int, int, int, int]]:
    command = ["git", "diff", "--unified=0", "--no-renames", BASELINE, PRE_ISOLATION]
    if paths:
        command += ["--", *paths]
    result = subprocess.run(command, cwd=ROOT, capture_output=True, text=True, check=False)
    if result.returncode:
        errors.append(f"Git diffを読めない: {result.stderr.strip()}")
        return []
    current: str | None = None
    hunks: list[tuple[str, int, int, int, int]] = []
    for line in result.stdout.splitlines():
        if line.startswith("diff --git a/"):
            marker = line[len("diff --git a/"):]
            left, right = marker.split(" b/", 1)
            current = right if left == right else None
            if current is None:
                errors.append(f"renameまたはpath差替えを検出: {line}")
        elif line.startswith("@@ "):
            match = HUNK_RE.match(line)
            if match is None or current is None:
                errors.append(f"Git diff hunk header不正: {line}")
                continue
            old_start = int(match.group(1)); old_count = int(match.group(2) or 1)
            new_start = int(match.group(3)); new_count = int(match.group(4) or 1)
            hunks.append((current, old_start, end_line(old_start, old_count), new_start, end_line(new_start, new_count)))
    return hunks


def sha256_file(path: Path) -> str | None:
    try:
        return hashlib.sha256(path.read_bytes()).hexdigest()
    except OSError:
        return None


def git_blob_oid(value: bytes) -> str:
    return hashlib.sha1(b"blob " + str(len(value)).encode("ascii") + b"\0" + value).hexdigest()


def validate(manifest: dict, inventory: dict) -> list[str]:
    errors: list[str] = []
    holding = read_jsonl(ROOT / "docs/governance/pre-isolation-revision-delta-source-holding.jsonl", errors)
    assets = read_jsonl(ROOT / "docs/governance/legacy-asset-disposition.jsonl", errors)
    phases = read_jsonl(ROOT / "docs/governance/legacy-asset-phase-product-classification-bootstrap.jsonl", errors)
    holding_by_id = {r.get("source_revision_item_id"): r for r in holding}
    assets_by_path = {r.get("source_path"): r for r in assets}
    phase_by_asset = {r.get("asset_id"): r for r in phases}

    if len(holding) != 333:
        errors.append(f"source holding record数不一致: {len(holding)}")
    for path, expected in INPUT_DIGESTS.items():
        actual = sha256_file(ROOT / path)
        if actual != expected:
            errors.append(f"input digest不一致: {path}: {actual}")

    fixed = {"status": "candidate_pending_semantic_equivalence_review", "authority_effect": "none", "meaning_change_applied": False, "successor_requirement_ids": [], "human_decision_ref": None, "equivalence_claim": None}
    for key, value in fixed.items():
        if manifest.get(key) != value or inventory.get(key) != value:
            errors.append(f"candidate boundary不一致: {key}")
    if manifest.get("schema") != "helix-scaffold-preisolation-requirement-next4-manifest.v1":
        errors.append("manifest schema不正")
    if inventory.get("schema") != "helix-scaffold-preisolation-requirement-next4-semantic-diff.v1":
        errors.append("inventory schema不正")
    provenance = manifest.get("provenance", {})
    for key, value in {"baseline_commit": BASELINE, "pre_isolation_commit": PRE_ISOLATION, "archive_commit": ARCHIVE}.items():
        if provenance.get(key) != value:
            errors.append(f"provenance {key}不一致")
    if provenance.get("old_runtime_test_ci_execution") is not False:
        errors.append("旧runtime／test／CI実行はfalseに固定する")
    if manifest.get("prior_scopes") != PRIOR_SCOPES:
        errors.append("prior scope lineage不一致")

    scope = manifest.get("selection_basis", {})
    if scope.get("selected_source_revision_item_ids") != SELECTED_IDS:
        errors.append("selected source ID順序不一致")
    if scope.get("metadata_only_excluded_source_revision_item_id_range") != [145, 329]:
        errors.append("metadata-only除外範囲不一致")
    if scope.get("metadata_only_excluded_change") != "registry_source_digest-only":
        errors.append("metadata-only除外理由不一致")
    if inventory.get("scope", {}).get("selected_source_revision_item_ids") != SELECTED_IDS:
        errors.append("inventory selected scope不一致")
    if inventory.get("scope", {}).get("prior_selected_id_range") != [1, 144]:
        errors.append("prior selected scope不一致")

    source_rows = manifest.get("source_items", [])
    if [r.get("source_revision_item_id") for r in source_rows] != SELECTED_IDS:
        errors.append("manifest source_items順序不一致")
    for row in source_rows:
        sid = row.get("source_revision_item_id"); path = row.get("source_path")
        expected_path = EXPECTED_PATHS.get(sid); hold = holding_by_id.get(sid)
        if expected_path is None or hold is None:
            errors.append(f"selected sourceが未知またはholding欠落: {sid}"); continue
        if path != expected_path or hold.get("source_path") != expected_path:
            errors.append(f"path不一致: {sid}")
        if row.get("source_category") != EXPECTED_CATEGORIES[sid] or hold.get("source_category") != EXPECTED_CATEGORIES[sid]:
            errors.append(f"source category不一致: {sid}")
        asset = assets_by_path.get(path); phase = phase_by_asset.get(row.get("asset_id"))
        if asset is None or asset.get("asset_id") != EXPECTED_ASSETS[path] or row.get("asset_id") != asset.get("asset_id"):
            errors.append(f"asset provenance不一致: {sid}")
        if phase is None:
            errors.append(f"phase snapshot欠落: {sid}")
        elif phase.get("consumer_closure_status") != "pending" or phase.get("legacy_execution_performed") is not False:
            errors.append(f"phase／execution boundary不一致: {sid}")
        if hold and (hold.get("meaning_change_applied") is not False or hold.get("successor_requirement_ids") != [] or hold.get("human_decision_ref") is not None):
            errors.append(f"holding authority boundary不一致: {sid}")
        if hold:
            baseline_blob = git_bytes(BASELINE, path, errors)
            pre_blob = git_bytes(PRE_ISOLATION, path, errors)
            archive_blob = git_bytes(ARCHIVE, hold.get("archive_path", ""), errors)
            for label, value, sha_key, oid_key in (
                ("baseline", baseline_blob, "baseline_file_sha256", "baseline_blob_oid"),
                ("pre-isolation", pre_blob, "pre_isolation_file_sha256", "pre_isolation_blob_oid"),
            ):
                if value is not None:
                    if hashlib.sha256(value).hexdigest() != hold.get(sha_key):
                        errors.append(f"holding {label} file SHA-256不一致: {sid}")
                    if git_blob_oid(value) != hold.get(oid_key):
                        errors.append(f"holding {label} blob OID不一致: {sid}")
            if archive_blob is not None and pre_blob is not None and archive_blob != pre_blob:
                errors.append(f"archive／pre-isolation bytes不一致: {sid}")
            if asset is not None and asset.get("source_sha256") != hold.get("pre_isolation_file_sha256"):
                errors.append(f"asset／holding source digest不一致: {sid}")

    full_hunks = parse_diff(errors)
    selected_paths = [EXPECTED_PATHS[sid] for sid in SELECTED_IDS]
    selected_hunks = parse_diff(errors, selected_paths)
    if len({p for p, *_ in full_hunks}) != 400 or len(full_hunks) != 492:
        errors.append(f"全体diff denominator不一致: files={len({p for p, *_ in full_hunks})} hunks={len(full_hunks)}")
    if len({p for p, *_ in selected_hunks}) != 4 or len(selected_hunks) != 28:
        errors.append(f"selected diff denominator不一致: files={len({p for p, *_ in selected_hunks})} hunks={len(selected_hunks)}")

    fragments = inventory.get("fragments", [])
    if len(fragments) != 28:
        errors.append(f"fragment件数不一致: {len(fragments)}")
    expected_fragment_ids = {f"REQNEXT4-DIFF-{n:03d}" for n in range(1, 29)}
    if {f.get("fragment_id") for f in fragments} != expected_fragment_ids:
        errors.append("fragment ID集合不一致")
    actual_fragment_hunks: list[tuple[str, int, int, int, int]] = []
    class_counts = {"requirement_bearing": 0, "authority_or_status_boundary": 0}
    for fragment in fragments:
        fid = fragment.get("fragment_id"); sid = fragment.get("source_revision_item_id"); path = fragment.get("source_path")
        if sid not in EXPECTED_PATHS or path != EXPECTED_PATHS.get(sid):
            errors.append(f"fragment source identity不一致: {fid}"); continue
        classification = fragment.get("classification")
        if classification not in class_counts:
            errors.append(f"fragment classification不正: {fid}")
        else:
            class_counts[classification] += 1
        hold = fragment.get("compound_hunk_hold", {})
        if hold.get("status") != "held_as_compound_hunk" or hold.get("semantic_atom_count") != 0:
            errors.append(f"compound hunk hold不一致: {fid}")
        if not isinstance(fragment.get("normalized_statement"), str) or not fragment.get("unresolved_meaning"):
            errors.append(f"review boundary欠落: {fid}")
        if not set(fragment.get("retained_negative_ids", [])) <= NEGATIVE_IDS or not fragment.get("retained_negative_ids"):
            errors.append(f"negative参照不正: {fid}")
        b = fragment.get("baseline", {}); p = fragment.get("pre_isolation", {})
        old = (path, b.get("start_line"), b.get("end_line"), p.get("start_line"), p.get("end_line"))
        actual_fragment_hunks.append(old)
        baseline_blob = git_bytes(BASELINE, path, errors); pre_blob = git_bytes(PRE_ISOLATION, path, errors)
        if baseline_blob is not None:
            value = span(baseline_blob, b.get("start_line"), b.get("end_line"))
            if value is None or b.get("sha256") != "sha256:" + hashlib.sha256(value).hexdigest():
                errors.append(f"baseline span／digest不一致: {fid}")
        if pre_blob is not None:
            value = span(pre_blob, p.get("start_line"), p.get("end_line"))
            if value is None or p.get("sha256") != "sha256:" + hashlib.sha256(value).hexdigest():
                errors.append(f"pre-isolation span／digest不一致: {fid}")
        if b.get("sha256") == p.get("sha256"):
            errors.append(f"changed hunk textが同一: {fid}")
        if fragment.get("hunk_number") != sum(1 for x in fragments if x.get("source_revision_item_id") == sid and x.get("hunk_number", 0) <= fragment.get("hunk_number", 0)):
            errors.append(f"hunk numberが不連続: {fid}")
    if sorted(actual_fragment_hunks) != sorted(selected_hunks):
        errors.append("inventory hunk spanとGit diff hunkの集合不一致")
    if class_counts != {"requirement_bearing": 22, "authority_or_status_boundary": 6}:
        errors.append(f"classification counts不一致: {class_counts}")
    atom = inventory.get("semantic_atomization", {})
    for key, value in {"status": "not_started", "semantic_atomization_complete": False, "semantic_atom_count": 0, "hunk_fragment_count": 28, "compound_hunk_hold_count": 28, "uncovered_semantic_hunk_count": 28}.items():
        if atom.get(key) != value:
            errors.append(f"semantic_atomization {key}不一致")

    metadata_hunks = 0
    for n in range(145, 330):
        sid = f"PREISO-REV-{n:06d}"; row = holding_by_id.get(sid)
        if row is None:
            errors.append(f"metadata-only holding欠落: {sid}"); continue
        diff = subprocess.run(["git", "diff", "--unified=0", "--no-renames", BASELINE, PRE_ISOLATION, "--", row["source_path"]], cwd=ROOT, capture_output=True, text=True, check=False).stdout
        changes = [line for line in diff.splitlines() if (line.startswith("+") or line.startswith("-")) and not line.startswith(("+++", "---"))]
        if len(changes) != 2 or any("registry_source_digest:" not in line for line in changes):
            errors.append(f"metadata-only除外条件不成立: {sid}")
        metadata_hunks += sum(line.startswith("@@ ") for line in diff.splitlines())
    if metadata_hunks != 185:
        errors.append(f"metadata-only hunk count不一致: {metadata_hunks}")
    negatives = inventory.get("retained_negatives", [])
    negative_ids = [n.get("negative_id") for n in negatives]
    if (len(negatives) != len(NEGATIVE_IDS) or set(negative_ids) != NEGATIVE_IDS
            or manifest.get("negative_case_ids") != negative_ids
            or any(not n.get("rejects") for n in negatives)):
        errors.append("negative case集合不一致")
    return errors


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--manifest", type=Path, default=ROOT / "scaffold/pre-isolation-requirement-next4/rdp001-preiso-requirement-next4.json")
    parser.add_argument("--inventory", type=Path, default=ROOT / "scaffold/pre-isolation-requirement-next4/rdp001-preiso-requirement-next4-semantic-diff-inventory.json")
    args = parser.parse_args()
    errors: list[str] = []
    manifest = read_json(args.manifest, errors); inventory = read_json(args.inventory, errors)
    errors.extend(validate(manifest, inventory))
    if errors:
        print("FAIL: RDP-001 requirement-bearing next4 candidate")
        print("\n".join(f"- {error}" for error in errors))
        return 1
    print("PASS: RDP-001 requirement-bearing next4 candidate (read-only static check)")
    print("selected=4 files / 28 hunks; prior=144 files / 212 hunks; combined=148 files / 240 hunks; remaining full diff=252 files / 252 hunks")
    print("source holding remaining=185 metadata-only records; holding-external new-path diff=67 files / 67 hunks")
    print("semantic_atoms=0; compound_hunk_holds=28; requirement_or_verification_hunks=22; authority_or_status_hunks=6; old runtime/test/CI execution=False")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
