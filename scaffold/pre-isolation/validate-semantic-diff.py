#!/usr/bin/env python3
"""RDP-001 6経路 semantic diff inventory のread-only静的確認。

候補inventoryの行spanを既知Git blobから再抽出し、fragmentと保持negativeの
exact text／SHA-256、6 source／9 fragmentの対応、候補分類数を確認する。
この検査は意味同値、要求採否、authority、実装、受入を判定しない。
"""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import subprocess
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
DEFAULT_INVENTORY = ROOT / "scaffold/pre-isolation/rdp001-6path-semantic-diff-inventory.json"
BASELINE_COMMIT = "6fabd12512a3659fff4a956692cdd61faeeb16ce"
PRE_ISOLATION_COMMIT = "2d4991042be55268bac30a8bbcdac45b3865030a"
EXPECTED_SOURCES = {
    "PREISO-REV-000001": ("config/workflow-classification-catalog.v1.json", "other_legacy_asset"),
    "PREISO-REV-000002": ("config/workflow-execution-policy.v1.json", "other_legacy_asset"),
    "PREISO-REV-000015": (
        "docs/design/helix/L3-requirements/workflow-classification-registry.v1.json",
        "requirement_or_prototype_source",
    ),
    "PREISO-REV-000016": (
        "docs/design/helix/L3-requirements/workflow-execution-policy-registry.v1.json",
        "requirement_or_prototype_source",
    ),
    "PREISO-REV-000026": ("docs/governance/helix-harness-requirements_v1.3.md", "core_upstream_source"),
    "PREISO-REV-000060": ("docs/plans/PLAN-L3-82-authority-vocabulary-separation.md", "legacy_plan_source"),
}
DIFF_SCOPE = "selected_source_items_only"
DIFF_SCOPE_NOTE = "2 commit全体は400 files／492 hunksであり、この候補はそのうち6 path／9 hunkのみを対象とする。"
EXPECTED_SOURCE_OWNERS = {
    "PREISO-REV-000001": ("HELIX-HARNESS", None),
    "PREISO-REV-000002": ("HELIX-HARNESS", "HELIX-OS"),
    "PREISO-REV-000015": ("HELIX-HARNESS", None),
    "PREISO-REV-000016": ("HELIX-HARNESS", "HELIX-OS"),
    "PREISO-REV-000026": ("HELIX-HARNESS", None),
    "PREISO-REV-000060": ("unresolved", None),
}
EXPECTED_FRAGMENT_OWNERS = {
    "RDP001-DIFF-001": ("HELIX-HARNESS", None),
    "RDP001-DIFF-002": ("HELIX-HARNESS", "HELIX-OS"),
    "RDP001-DIFF-003": ("HELIX-HARNESS", None),
    "RDP001-DIFF-004": ("HELIX-HARNESS", "HELIX-OS"),
    "RDP001-DIFF-005": ("HELIX-HARNESS", "HELIX-OS"),
    "RDP001-DIFF-006": ("HELIX-HARNESS", None),
    "RDP001-DIFF-007": ("HELIX-HARNESS", None),
    "RDP001-DIFF-008": ("HELIX-HARNESS", "HELIX-OS"),
    "RDP001-DIFF-009": ("unresolved", None),
}
EXPECTED_PHASE_CANDIDATES: list[str] = []
EXPECTED_PHASE_AUTHORITY_STATUS = "unresolved_no_direct_phase_candidate"
EXPECTED_LEGACY_IMPLEMENTATION_STATUS = "unknown"
EXPECTED_FRAGMENT_IDS = {
    "RDP001-DIFF-001",
    "RDP001-DIFF-002",
    "RDP001-DIFF-003",
    "RDP001-DIFF-004",
    "RDP001-DIFF-005",
    "RDP001-DIFF-006",
    "RDP001-DIFF-007",
    "RDP001-DIFF-008",
    "RDP001-DIFF-009",
}
ALLOWED_CLASSIFICATIONS = {"requirement", "constraint", "provenance", "generated_metadata", "unresolved"}
ALLOWED_CANDIDATE_KINDS = {"requirement", "constraint", "metadata", "unresolved"}
ALLOWED_OWNERS = {"HELIX-HARNESS", "HELIX-OS", "unresolved"}
EXPECTED_COUNTS = {
    "requirement": 1,
    "constraint": 2,
    "provenance": 4,
    "generated_metadata": 2,
    "unresolved": 0,
}
EXPECTED_NEGATIVE_IDS = {
    "NEG-CLASS-CATALOG-FAIL-CLOSE",
    "NEG-EXEC-CATALOG-FAIL-CLOSE",
    "NEG-CLASS-REGISTRY-FAIL-CLOSE",
    "NEG-EXEC-REGISTRY-FAIL-CLOSE",
    "NEG-HREQ-STATUS-NOCOMPLETION",
    "NEG-HREQ-L2-NO-AUTHORITY",
    "NEG-HREQ-JSON-NODUAL",
    "NEG-PLAN-NO-RUNTIME-AUTO",
}
DIFF_HUNK = re.compile(r"^@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@")


def fail(errors: list[str], message: str) -> None:
    errors.append(message)


def git_blob_bytes(commit: str, source_path: str, label: str, errors: list[str]) -> bytes | None:
    result = subprocess.run(
        ["git", "cat-file", "blob", f"{commit}:{source_path}"],
        cwd=ROOT,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        check=False,
    )
    if result.returncode != 0:
        fail(errors, f"{label}のGit blobを読めない: {commit}:{source_path}")
        return None
    return result.stdout


def line_span(blob: bytes, start_line: int, end_line: int) -> bytes | None:
    if not isinstance(start_line, int) or not isinstance(end_line, int):
        return None
    if start_line < 1 or end_line < start_line - 1:
        return None
    lines = blob.splitlines(keepends=True)
    if start_line == end_line + 1:
        return b""
    if end_line > len(lines):
        return None
    return b"".join(lines[start_line - 1 : end_line])


def check_span(errors: list[str], label: str, blob: bytes, declaration: object) -> None:
    if not isinstance(declaration, dict):
        fail(errors, f"{label} span declarationがobjectではない")
        return
    start_line = declaration.get("start_line")
    end_line = declaration.get("end_line")
    actual = line_span(blob, start_line, end_line)
    if actual is None:
        fail(errors, f"{label} line span不正またはblob末尾超過: {start_line}-{end_line}")
        return
    expected_text = declaration.get("exact_text")
    if not isinstance(expected_text, str):
        fail(errors, f"{label} exact_textがstringではない")
        return
    actual_text = actual.decode("utf-8", errors="replace")
    if actual_text != expected_text:
        fail(errors, f"{label} exact_text不一致")
    expected_sha = declaration.get("sha256")
    actual_sha = "sha256:" + hashlib.sha256(actual).hexdigest()
    if actual_sha != expected_sha:
        fail(errors, f"{label} SHA-256不一致: {actual_sha}")


def changed_line_end(start_line: int, count: int) -> int:
    return start_line + count - 1 if count else start_line - 1


def git_diff_hunks(errors: list[str]) -> list[tuple[str, int, int, int, int]]:
    paths = [source_path for source_path, _category in EXPECTED_SOURCES.values()]
    result = subprocess.run(
        [
            "git",
            "diff",
            "--unified=0",
            "--no-renames",
            BASELINE_COMMIT,
            PRE_ISOLATION_COMMIT,
            "--",
            *paths,
        ],
        cwd=ROOT,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
        check=False,
    )
    if result.returncode != 0:
        fail(errors, f"baseline/pre-isolation git diffを読めない: {result.stderr.strip()}")
        return []
    current_path: str | None = None
    hunks: list[tuple[str, int, int, int, int]] = []
    for line in result.stdout.splitlines():
        if line.startswith("diff --git a/"):
            marker = line[len("diff --git a/") :]
            if " b/" not in marker:
                fail(errors, f"git diff path header不正: {line}")
                current_path = None
            else:
                left_path, right_path = marker.split(" b/", 1)
                if left_path != right_path:
                    fail(errors, f"renameまたはpath差替えを検出: {line}")
                    current_path = None
                else:
                    current_path = right_path
        elif line.startswith("@@ "):
            match = DIFF_HUNK.match(line)
            if match is None or current_path is None:
                fail(errors, f"git diff hunk header不正: {line}")
                continue
            old_start = int(match.group(1))
            old_count = int(match.group(2) or "1")
            new_start = int(match.group(3))
            new_count = int(match.group(4) or "1")
            hunks.append(
                (
                    current_path,
                    old_start,
                    changed_line_end(old_start, old_count),
                    new_start,
                    changed_line_end(new_start, new_count),
                )
            )
    return hunks


def main() -> int:
    parser = argparse.ArgumentParser(description="RDP-001 semantic diff inventory static check")
    parser.add_argument("--inventory", type=Path, default=DEFAULT_INVENTORY)
    args = parser.parse_args()
    errors: list[str] = []
    try:
        inventory = json.loads(args.inventory.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        print(f"FAIL: semantic diff inventoryを読めない: {exc}")
        return 1

    if inventory.get("schema") != "helix-scaffold-preisolation-semantic-diff.v1":
        fail(errors, "inventory schema不正")
    if inventory.get("status") != "candidate_pending_semantic_equivalence_review":
        fail(errors, "inventory statusはsemantic equivalence review pendingに固定する")
    if inventory.get("authority_effect") != "none":
        fail(errors, "inventory authority_effectはnoneに固定する")
    if inventory.get("diff_scope") != DIFF_SCOPE:
        fail(errors, "diff_scopeはselected_source_items_onlyに固定する")
    if inventory.get("diff_scope_note") != DIFF_SCOPE_NOTE:
        fail(errors, "diff_scope_noteが6 path／9 hunkの限定を明示していない")
    for field, expected in (("meaning_change_applied", False), ("successor_requirement_ids", []), ("human_decision_ref", None), ("equivalence_claim", None)):
        if inventory.get(field) != expected:
            fail(errors, f"inventory {field}が候補境界に反する")

    comparison = inventory.get("comparison", {})
    if comparison.get("baseline_commit") != BASELINE_COMMIT:
        fail(errors, "comparison baseline_commit不一致")
    if comparison.get("pre_isolation_commit") != PRE_ISOLATION_COMMIT:
        fail(errors, "comparison pre_isolation_commit不一致")
    if comparison.get("old_runtime_test_ci_execution") is not False:
        fail(errors, "old_runtime_test_ci_executionはfalseに固定する")
    if comparison.get("method") != "read-only Git blob bytes; exact changed line spans and UTF-8 SHA-256":
        fail(errors, "comparison method不一致")

    sources = inventory.get("source_items")
    if not isinstance(sources, list) or len(sources) != len(EXPECTED_SOURCES):
        fail(errors, "source_itemsは6件でなければならない")
        sources = sources if isinstance(sources, list) else []
    source_by_id: dict[str, dict] = {}
    for source in sources:
        if not isinstance(source, dict):
            fail(errors, "source itemがobjectではない")
            continue
        item_id = source.get("source_revision_item_id")
        if item_id in source_by_id:
            fail(errors, f"source item ID重複: {item_id}")
        source_by_id[item_id] = source
        expected = EXPECTED_SOURCES.get(item_id)
        if expected is None:
            fail(errors, f"未知のsource revision item ID: {item_id}")
            continue
        expected_path, expected_category = expected
        if source.get("source_path") != expected_path:
            fail(errors, f"{item_id} source_path不一致")
        if source.get("source_category") != expected_category:
            fail(errors, f"{item_id} source_category不一致")
        expected_owner, expected_secondary = EXPECTED_SOURCE_OWNERS[item_id]
        if source.get("product_owner_candidate") != expected_owner:
            fail(errors, f"{item_id} product_owner_candidateが固定候補と不一致")
        if source.get("secondary_consumer_candidate") != expected_secondary:
            fail(errors, f"{item_id} secondary_consumer_candidateが固定候補と不一致")
        if source.get("phase_candidates") != EXPECTED_PHASE_CANDIDATES:
            fail(errors, f"{item_id} phase_candidatesは未確認の空集合に固定する")
        if source.get("phase_authority_status") != EXPECTED_PHASE_AUTHORITY_STATUS:
            fail(errors, f"{item_id} phase_authority_statusが未確認状態と不一致")
        if source.get("legacy_implementation_status") != EXPECTED_LEGACY_IMPLEMENTATION_STATUS:
            fail(errors, f"{item_id} legacy_implementation_statusがunknownでない")
        # source itemのfragment_idsは下のfragment参照と同じ固定集合で照合する。
        expected_fragment_ids_by_source = {
            "PREISO-REV-000001": {"RDP001-DIFF-001"},
            "PREISO-REV-000002": {"RDP001-DIFF-002"},
            "PREISO-REV-000015": {"RDP001-DIFF-003"},
            "PREISO-REV-000016": {"RDP001-DIFF-004", "RDP001-DIFF-005"},
            "PREISO-REV-000026": {"RDP001-DIFF-006", "RDP001-DIFF-007", "RDP001-DIFF-008"},
            "PREISO-REV-000060": {"RDP001-DIFF-009"},
        }
        if set(source.get("fragment_ids", [])) != expected_fragment_ids_by_source[item_id]:
            fail(errors, f"{item_id} fragment_ids集合が固定対応と不一致")
    if set(source_by_id) != set(EXPECTED_SOURCES):
        fail(errors, "source revision item ID集合が6件の期待集合と不一致")

    fragments = inventory.get("fragments")
    if not isinstance(fragments, list) or len(fragments) != len(EXPECTED_FRAGMENT_IDS):
        fail(errors, "fragmentsは9件でなければならない")
        fragments = fragments if isinstance(fragments, list) else []
    fragment_by_id: dict[str, dict] = {}
    observed_counts = {classification: 0 for classification in ALLOWED_CLASSIFICATIONS}
    inventory_hunks: list[tuple[str, int, int, int, int]] = []
    for fragment in fragments:
        if not isinstance(fragment, dict):
            fail(errors, "fragmentがobjectではない")
            continue
        fragment_id = fragment.get("fragment_id")
        if fragment_id in fragment_by_id:
            fail(errors, f"fragment ID重複: {fragment_id}")
        fragment_by_id[fragment_id] = fragment
        if fragment_id not in EXPECTED_FRAGMENT_IDS:
            fail(errors, f"未知のfragment ID: {fragment_id}")
        item_id = fragment.get("source_revision_item_id")
        if item_id not in EXPECTED_SOURCES:
            fail(errors, f"{fragment_id} source revision itemが不正")
        elif fragment_id not in source_by_id.get(item_id, {}).get("fragment_ids", []):
            fail(errors, f"{fragment_id} source itemのfragment_idsに未登録")
        classification = fragment.get("classification")
        if classification not in ALLOWED_CLASSIFICATIONS:
            fail(errors, f"{fragment_id} classification不正")
        else:
            observed_counts[classification] += 1
        if fragment.get("candidate_kind") not in ALLOWED_CANDIDATE_KINDS:
            fail(errors, f"{fragment_id} candidate_kind不正")
        expected_owner, expected_secondary = EXPECTED_FRAGMENT_OWNERS.get(fragment_id, (None, None))
        if fragment.get("product_owner_candidate") != expected_owner:
            fail(errors, f"{fragment_id} product_owner_candidateが固定候補と不一致")
        if fragment.get("secondary_consumer_candidate") != expected_secondary:
            fail(errors, f"{fragment_id} secondary_consumer_candidateが固定候補と不一致")
        if fragment.get("phase_candidates") != EXPECTED_PHASE_CANDIDATES:
            fail(errors, f"{fragment_id} phase_candidatesは未確認の空集合に固定する")
        if fragment.get("phase_authority_status") != EXPECTED_PHASE_AUTHORITY_STATUS:
            fail(errors, f"{fragment_id} phase_authority_statusが未確認状態と不一致")
        if fragment.get("legacy_implementation_status") != EXPECTED_LEGACY_IMPLEMENTATION_STATUS:
            fail(errors, f"{fragment_id} legacy_implementation_statusがunknownでない")
        if not isinstance(fragment.get("unresolved_meaning"), list) or not fragment.get("unresolved_meaning"):
            fail(errors, f"{fragment_id} unresolved_meaningを空にしない")
        source_path = EXPECTED_SOURCES.get(item_id, (None, None))[0]
        if source_path is None:
            continue
        baseline_decl = fragment.get("baseline", {})
        pre_decl = fragment.get("pre_isolation", {})
        if (
            isinstance(baseline_decl, dict)
            and isinstance(pre_decl, dict)
            and isinstance(baseline_decl.get("start_line"), int)
            and isinstance(baseline_decl.get("end_line"), int)
            and isinstance(pre_decl.get("start_line"), int)
            and isinstance(pre_decl.get("end_line"), int)
        ):
            inventory_hunks.append(
                (
                    source_path,
                    baseline_decl["start_line"],
                    baseline_decl["end_line"],
                    pre_decl["start_line"],
                    pre_decl["end_line"],
                )
            )
        baseline_blob = git_blob_bytes(BASELINE_COMMIT, source_path, f"{fragment_id} baseline", errors)
        pre_blob = git_blob_bytes(PRE_ISOLATION_COMMIT, source_path, f"{fragment_id} pre-isolation", errors)
        if baseline_blob is not None:
            check_span(errors, f"{fragment_id} baseline", baseline_blob, fragment.get("baseline"))
        if pre_blob is not None:
            check_span(errors, f"{fragment_id} pre-isolation", pre_blob, fragment.get("pre_isolation"))
        if isinstance(baseline_decl, dict) and isinstance(pre_decl, dict) and baseline_decl.get("exact_text") == pre_decl.get("exact_text"):
            fail(errors, f"{fragment_id} changed fragmentのbaseline/pre-isolation textが同一")
    if set(fragment_by_id) != EXPECTED_FRAGMENT_IDS:
        fail(errors, "fragment ID集合が9件の期待集合と不一致")
    if inventory.get("classification_counts") != observed_counts:
        fail(errors, f"classification_counts不一致: declared={inventory.get('classification_counts')} actual={observed_counts}")
    if observed_counts != EXPECTED_COUNTS:
        fail(errors, f"classificationの候補集計不一致: {observed_counts}")
    diff_hunks = git_diff_hunks(errors)
    if sorted(diff_hunks) != sorted(inventory_hunks):
        fail(
            errors,
            "Git diff hunkとinventory spanの集合不一致: "
            f"diff={sorted(diff_hunks)} inventory={sorted(inventory_hunks)}",
        )

    negatives = inventory.get("retained_negatives")
    if not isinstance(negatives, list) or len(negatives) != 8:
        fail(errors, "retained_negativesは8件でなければならない")
        negatives = negatives if isinstance(negatives, list) else []
    negative_by_id: dict[str, dict] = {}
    for negative in negatives:
        if not isinstance(negative, dict):
            fail(errors, "retained negativeがobjectではない")
            continue
        negative_id = negative.get("negative_id")
        if negative_id in negative_by_id:
            fail(errors, f"negative ID重複: {negative_id}")
        negative_by_id[negative_id] = negative
        item_id = negative.get("source_revision_item_id")
        expected_path = EXPECTED_SOURCES.get(item_id, (None, None))[0]
        if expected_path is None:
            fail(errors, f"{negative_id} source revision itemが不正")
            continue
        if negative.get("source_path") != expected_path:
            fail(errors, f"{negative_id} source_path不一致")
        if negative.get("commit") != PRE_ISOLATION_COMMIT:
            fail(errors, f"{negative_id} commit不一致")
        blob = git_blob_bytes(PRE_ISOLATION_COMMIT, expected_path, f"{negative_id}", errors)
        if blob is not None:
            check_span(errors, negative_id, blob, negative)
        if not isinstance(negative.get("meaning"), str) or not negative.get("meaning"):
            fail(errors, f"{negative_id} meaningを空にしない")
    if set(negative_by_id) != EXPECTED_NEGATIVE_IDS:
        fail(errors, "retained negative ID集合が固定8件と不一致")
    referenced_negative_ids: set[str] = set()
    for fragment in fragments:
        if isinstance(fragment, dict):
            referenced_negative_ids.update(fragment.get("retained_negative_ids", []))
    if referenced_negative_ids != set(negative_by_id):
        fail(errors, "fragmentとretained_negativesの参照集合が不一致")

    if errors:
        print("FAIL: RDP-001 6-path semantic diff inventory")
        for error in errors:
            print(f"- {error}")
        return 1
    print("PASS: RDP-001 6-path semantic diff inventory (read-only static check)")
    print("diff_scope=selected_source_items_only; sources=6; fragments=9; diff_hunks=9; requirement=1; constraint=2; provenance=4; generated_metadata=2; unresolved=0")
    print(f"retained_negatives=8; equivalence_claim={inventory.get('equivalence_claim')}; authority_effect={inventory.get('authority_effect')}; runtime/test execution=forbidden")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
