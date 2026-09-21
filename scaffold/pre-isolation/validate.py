#!/usr/bin/env python3
"""RDP-001 PREISOLATION 6-path coherence のread-only静的確認。

holding台帳、候補manifest、製品境界source、Git objectのsource bytesだけを読み、
archive内のruntime/test/CIを実行しない。合格は意味同値、要求採否、authority、実装、
受入の成立を示さない。
"""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import subprocess
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
DEFAULT_MANIFEST = ROOT / "scaffold/pre-isolation/rdp001-revision-coherence-6path.json"
HOLDING_REL = "docs/governance/pre-isolation-revision-delta-source-holding.jsonl"
SHA256 = re.compile(r"^[0-9a-f]{64}$")
OID = re.compile(r"^[0-9a-f]{40}$")

EXPECTED = {
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
EXPECTED_METADATA = {
    "PREISO-REV-000015": {
        "schema_version": "helix-workflow-classification-registry.v1",
        "registry_version": "1.1.6",
        "requirements_version": "1.3.14",
    },
    "PREISO-REV-000001": {
        "schema_version": "helix-workflow-classification-catalog.v1",
        "projection_role": "generated_projection",
        "registry_version": "1.1.6",
        "requirements_version": "1.3.14",
    },
    "PREISO-REV-000016": {
        "schema_version": "helix-workflow-execution-policy-registry.v1",
        "registry_version": "1.2.3",
        "requirements_version": "1.3.14",
    },
    "PREISO-REV-000002": {
        "schema_version": "helix-workflow-execution-policy.v1",
        "projection_role": "generated_projection",
        "registry_version": "1.2.3",
        "requirements_version": "1.3.14",
    },
}
METADATA_PATHS = {
    "PREISO-REV-000001": {
        "schema_version": "schema_version",
        "projection_role": "projection_role",
        "registry_version": "source_registry.registry_version",
        "requirements_version": "source_registry.requirements_version",
    },
    "PREISO-REV-000002": {
        "schema_version": "schema_version",
        "projection_role": "projection_role",
        "registry_version": "source_registry.registry_version",
        "requirements_version": "source_registry.requirements_version",
    },
    "PREISO-REV-000015": {
        "schema_version": "schema_version",
        "registry_version": "registry_version",
        "requirements_version": "requirements_version",
    },
    "PREISO-REV-000016": {
        "schema_version": "schema_version",
        "registry_version": "registry_version",
        "requirements_version": "requirements_version",
    },
}
BASELINE_COMMIT = "6fabd12512a3659fff4a956692cdd61faeeb16ce"
PRE_ISOLATION_COMMIT = "2d4991042be55268bac30a8bbcdac45b3865030a"
ARCHIVE_COMMIT = "064280b5c1c5c98f949e6e3be5ef87cbe4a4b658"
REVISION_RELATION = "changed_before_archive_pending_semantic_equivalence_review"


def digest(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def fail(errors: list[str], message: str) -> None:
    errors.append(message)


def load_holding(path: Path, errors: list[str]) -> dict[str, dict]:
    records: dict[str, dict] = {}
    try:
        lines = path.read_text(encoding="utf-8").splitlines()
    except OSError as exc:
        fail(errors, f"holding台帳を読めない: {exc}")
        return records
    for line_no, line in enumerate(lines, 1):
        if not line.strip():
            continue
        try:
            record = json.loads(line)
        except json.JSONDecodeError as exc:
            fail(errors, f"holding台帳JSON不正 line={line_no}: {exc}")
            continue
        item_id = record.get("source_revision_item_id")
        if item_id in records:
            fail(errors, f"holding台帳ID重複: {item_id}")
        records[item_id] = record
    return records


def check_digest_field(errors: list[str], value: object, label: str, pattern: re.Pattern[str]) -> None:
    if not isinstance(value, str) or not pattern.fullmatch(value):
        fail(errors, f"{label}の形式不正")


def git_blob_bytes(commit: str, source_path: str, label: str, errors: list[str]) -> bytes | None:
    """既知commitのblobをread-onlyで取得する。shell/runtimeは起動しない。"""
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


def git_blob_oid(blob: bytes) -> str:
    header = f"blob {len(blob)}\0".encode("ascii")
    return hashlib.sha1(header + blob).hexdigest()


def check_blob_revision(errors: list[str], item_id: str, revision_name: str, blob: bytes,
                        expected_sha: str, expected_oid: str) -> None:
    actual_sha = hashlib.sha256(blob).hexdigest()
    if actual_sha != expected_sha:
        fail(errors, f"{item_id} {revision_name} file SHA-256不一致: {actual_sha}")
    actual_oid = git_blob_oid(blob)
    if actual_oid != expected_oid:
        fail(errors, f"{item_id} {revision_name} Git blob OID不一致: {actual_oid}")


MISSING = object()


def json_field(value: object, dotted_path: str) -> object:
    current = value
    for component in dotted_path.split("."):
        if not isinstance(current, dict) or component not in current:
            return MISSING
        current = current[component]
    return current


def main() -> int:
    parser = argparse.ArgumentParser(description="RDP-001 PREISOLATION 6-path static coherence check")
    parser.add_argument("--manifest", type=Path, default=DEFAULT_MANIFEST)
    args = parser.parse_args()
    errors: list[str] = []

    try:
        manifest = json.loads(args.manifest.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        print(f"FAIL: manifestを読めない: {exc}")
        return 1

    holding_path = ROOT / HOLDING_REL
    holding = load_holding(holding_path, errors)
    if holding_path.is_file():
        actual_holding_digest = digest(holding_path)
        declared_holding_digest = manifest.get("holding", {}).get("sha256")
        if declared_holding_digest != actual_holding_digest:
            fail(errors, f"holding台帳digest不一致: declared={declared_holding_digest} actual={actual_holding_digest}")

    if manifest.get("schema") != "helix-scaffold-preisolation-revision-coherence.v1":
        fail(errors, "manifest schema不正")
    if manifest.get("kind") != "scaffold":
        fail(errors, "candidate kindはscaffoldでなければならない")
    if manifest.get("authority_effect") != "none":
        fail(errors, "candidate authority_effectはnoneに固定する")
    if manifest.get("product_boundary", {}).get("product") != "HELIX-HARNESS":
        fail(errors, "product boundaryはHELIX-HARNESSに固定する")

    holding_meta = manifest.get("holding", {})
    for key, expected in (
        ("baseline_commit", BASELINE_COMMIT),
        ("pre_isolation_commit", PRE_ISOLATION_COMMIT),
        ("archive_commit", ARCHIVE_COMMIT),
    ):
        if holding_meta.get(key) != expected:
            fail(errors, f"holding.{key}不一致")
    if holding_meta.get("required_record_count") != len(EXPECTED):
        fail(errors, "holding.required_record_countは6")

    paths = manifest.get("paths")
    if not isinstance(paths, list) or len(paths) != len(EXPECTED):
        fail(errors, "manifest pathsは6件でなければならない")
        paths = paths if isinstance(paths, list) else []
    manifest_ids: set[str] = set()
    manifest_paths: set[str] = set()
    pre_isolation_json: dict[str, object] = {}
    for entry in paths:
        item_id = entry.get("source_revision_item_id")
        source_path = entry.get("source_path")
        if item_id in manifest_ids:
            fail(errors, f"manifest ID重複: {item_id}")
        manifest_ids.add(item_id)
        if source_path in manifest_paths:
            fail(errors, f"manifest path重複: {source_path}")
        manifest_paths.add(source_path)
        expected_path_category = EXPECTED.get(item_id)
        if expected_path_category is None:
            fail(errors, f"対象外または未知の台帳ID: {item_id}")
            continue
        expected_path, expected_category = expected_path_category
        if source_path != expected_path:
            fail(errors, f"{item_id} source_path不一致")
        if entry.get("source_category") != expected_category:
            fail(errors, f"{item_id} source_category不一致")
        if entry.get("authority_effect") != "none":
            fail(errors, f"{item_id} authority_effect不一致")
        if entry.get("meaning_change_applied") is not False:
            fail(errors, f"{item_id} meaning_change_appliedはfalse")
        if entry.get("successor_requirement_ids") != []:
            fail(errors, f"{item_id} successor_requirement_idsは空でなければならない")
        if entry.get("human_decision_ref") is not None:
            fail(errors, f"{item_id} human_decision_refはnullでなければならない")
        if item_id in EXPECTED_METADATA and entry.get("declared_metadata") != EXPECTED_METADATA[item_id]:
            fail(errors, f"{item_id} declared_metadata不一致")
        record = holding.get(item_id)
        if record is None:
            fail(errors, f"holding台帳に欠落: {item_id}")
            continue
        for field in ("source_path", "archive_path", "source_category", "baseline_commit", "pre_isolation_commit", "archive_commit",
                      "revision_relation", "baseline_revision_state", "pre_isolation_revision_state",
                      "meaning_change_applied", "successor_requirement_ids", "human_decision_ref", "authority_effect"):
            if entry.get(field) is not None and entry.get(field) != record.get(field):
                fail(errors, f"{item_id} manifest/holding {field}不一致")
        if record.get("revision_relation") != REVISION_RELATION:
            fail(errors, f"{item_id} revision_relation不一致")
        if record.get("baseline_revision_state") != "preserved_git_revision_pending_review":
            fail(errors, f"{item_id} baseline_revision_state不一致")
        if record.get("pre_isolation_revision_state") != "preserved_archive_revision_pending_review":
            fail(errors, f"{item_id} pre_isolation_revision_state不一致")
        expected_archive_path = "archive/legacy-generation-2026-09-14/root/" + source_path
        if entry.get("archive_path") != expected_archive_path:
            fail(errors, f"{item_id} archive_pathがsource_pathのsnapshotではない")
        for revision_name in ("baseline", "pre_isolation"):
            revision = entry.get(revision_name, {})
            commit_key = f"{revision_name}_commit"
            oid_key = f"{revision_name}_blob_oid"
            sha_key = f"{revision_name}_file_sha256"
            if revision.get("commit") != record.get(commit_key):
                fail(errors, f"{item_id} {revision_name}.commit不一致")
            if revision.get("blob_oid") != record.get(oid_key):
                fail(errors, f"{item_id} {revision_name}.blob_oid不一致")
            if revision.get("file_sha256") != record.get(sha_key):
                fail(errors, f"{item_id} {revision_name}.file_sha256不一致")
            check_digest_field(errors, revision.get("blob_oid"), f"{item_id} {revision_name}.blob_oid", OID)
            check_digest_field(errors, revision.get("file_sha256"), f"{item_id} {revision_name}.file_sha256", SHA256)

            revision_blob = git_blob_bytes(
                record.get(commit_key, ""),
                source_path,
                f"{item_id} {revision_name}",
                errors,
            )
            if revision_blob is not None:
                check_blob_revision(
                    errors,
                    item_id,
                    revision_name,
                    revision_blob,
                    record.get(sha_key, ""),
                    record.get(oid_key, ""),
                )
                if revision_name == "pre_isolation" and item_id in {"PREISO-REV-000001", "PREISO-REV-000002", "PREISO-REV-000015", "PREISO-REV-000016"}:
                    try:
                        parsed = json.loads(revision_blob.decode("utf-8"))
                        pre_isolation_json[item_id] = parsed
                        for metadata_key, expected_metadata_value in EXPECTED_METADATA.get(item_id, {}).items():
                            metadata_path = METADATA_PATHS[item_id][metadata_key]
                            actual_metadata_value = json_field(parsed, metadata_path)
                            if actual_metadata_value is MISSING:
                                fail(errors, f"{item_id} pre-isolation metadata fieldが未定義: {metadata_path}")
                            elif actual_metadata_value != expected_metadata_value:
                                fail(errors, f"{item_id} pre-isolation metadata値不一致: {metadata_key}")
                    except (UnicodeDecodeError, json.JSONDecodeError) as exc:
                        fail(errors, f"{item_id} pre-isolation consumer JSON不正: {exc}")

        archive_blob = git_blob_bytes(
            record.get("archive_commit", ""),
            entry.get("archive_path", ""),
            f"{item_id} archive snapshot",
            errors,
        )
        pre_isolation_blob = git_blob_bytes(
            record.get("pre_isolation_commit", ""),
            source_path,
            f"{item_id} pre-isolation archive comparison",
            errors,
        )
        if archive_blob is not None and pre_isolation_blob is not None:
            if archive_blob != pre_isolation_blob:
                fail(errors, f"{item_id} archive snapshotとpre-isolation blobがbyte不一致")
            if git_blob_oid(archive_blob) != record.get("pre_isolation_blob_oid"):
                fail(errors, f"{item_id} archive snapshotのblob OIDがpre-isolationと不一致")
            if hashlib.sha256(archive_blob).hexdigest() != record.get("pre_isolation_file_sha256"):
                fail(errors, f"{item_id} archive snapshotのSHA-256がpre-isolationと不一致")

    if manifest_ids != set(EXPECTED):
        fail(errors, f"manifest対象ID集合不一致: {sorted(manifest_ids)}")
    for item_id, (source_path, source_category) in EXPECTED.items():
        record = holding.get(item_id)
        if record is None:
            fail(errors, f"holding台帳の必須6行が欠落: {item_id}")
            continue
        if record.get("source_path") != source_path or record.get("source_category") != source_category:
            fail(errors, f"holding台帳の対象path/category不一致: {item_id}")

    for source in manifest.get("product_boundary", {}).get("sources", []):
        source_path = ROOT / source.get("path", "")
        if not source_path.is_file():
            fail(errors, f"product boundary source欠落: {source.get('path')}")
            continue
        if source.get("sha256") != digest(source_path):
            fail(errors, f"product boundary source digest不一致: {source.get('path')}")

    expected_edges = {
        ("PREISO-REV-000015", "PREISO-REV-000026", "authority_source"): (
            "authority.source",
            "authority.source_digest",
            "docs/governance/helix-harness-requirements_v1.3.md",
        ),
        ("PREISO-REV-000016", "PREISO-REV-000026", "authority_source"): (
            "authority.source",
            "authority.source_digest",
            "docs/governance/helix-harness-requirements_v1.3.md",
        ),
        ("PREISO-REV-000001", "PREISO-REV-000015", "generated_from_registry"): (
            "source_registry.path",
            "source_registry.registry_source_digest",
            "docs/design/helix/L3-requirements/workflow-classification-registry.v1.json",
        ),
        ("PREISO-REV-000001", "PREISO-REV-000026", "requirements_source_digest"): (
            None,
            "source_registry.requirements_source_digest",
            None,
        ),
        ("PREISO-REV-000016", "PREISO-REV-000015", "classification_registry_input"): (
            "classification_registry.path",
            "classification_registry.source_digest",
            "docs/design/helix/L3-requirements/workflow-classification-registry.v1.json",
        ),
        ("PREISO-REV-000002", "PREISO-REV-000016", "generated_from_registry"): (
            "source_registry.path",
            "source_registry.policy_registry_source_digest",
            "docs/design/helix/L3-requirements/workflow-execution-policy-registry.v1.json",
        ),
        ("PREISO-REV-000002", "PREISO-REV-000015", "classification_registry_input"): (
            None,
            "source_registry.classification_registry_source_digest",
            None,
        ),
        ("PREISO-REV-000002", "PREISO-REV-000026", "requirements_source_digest"): (
            None,
            "source_registry.requirements_source_digest",
            None,
        ),
    }
    edges = manifest.get("registry_provenance")
    actual_edges = set()
    if not isinstance(edges, list):
        fail(errors, "registry_provenanceはlistでなければならない")
        edges = []
    for edge in edges:
        key = (edge.get("consumer_item_id"), edge.get("source_item_id"), edge.get("relation"))
        actual_edges.add(key)
        if key not in expected_edges:
            fail(errors, f"registry provenance edgeが不正: {key}")
        else:
            expected_path_field, expected_digest_field, expected_path_value = expected_edges[key]
            if edge.get("consumer_declared_path_field") != expected_path_field:
                fail(errors, f"registry provenance path field不一致: {key}")
            if edge.get("consumer_declared_digest_field") != expected_digest_field:
                fail(errors, f"registry provenance digest field不一致: {key}")
            if edge.get("source_path_value") != expected_path_value:
                fail(errors, f"registry provenance source path value不一致: {key}")
            source_record = holding.get(edge.get("source_item_id"), {})
            expected_digest = "sha256:" + str(source_record.get("pre_isolation_file_sha256", ""))
            if edge.get("source_digest_value") != expected_digest:
                fail(errors, f"registry provenance source digest value不一致: {key}")
            consumer = pre_isolation_json.get(edge.get("consumer_item_id"), MISSING)
            if consumer is MISSING:
                fail(errors, f"registry provenance consumerのpre-isolation JSONが未取得: {key}")
            else:
                path_field = edge.get("consumer_declared_path_field")
                path_value = edge.get("source_path_value")
                if path_field is None:
                    if path_value is not None:
                        fail(errors, f"registry provenance path fieldなしなのにpath値がある: {key}")
                else:
                    actual_path = json_field(consumer, path_field)
                    if actual_path is MISSING:
                        fail(errors, f"registry provenance consumer path fieldが未定義: {key} field={path_field}")
                    elif actual_path != path_value:
                        fail(errors, f"registry provenance consumer path値不一致: {key}")
                digest_field = edge.get("consumer_declared_digest_field")
                actual_digest = json_field(consumer, digest_field) if isinstance(digest_field, str) else MISSING
                if actual_digest is MISSING:
                    fail(errors, f"registry provenance consumer digest fieldが未定義: {key} field={digest_field}")
                elif actual_digest != edge.get("source_digest_value"):
                    fail(errors, f"registry provenance consumer digest値不一致: {key}")
        if edge.get("status") != "declared_in_pre_isolation_revision_pending_review":
            fail(errors, f"registry provenance status不一致: {key}")
        if edge.get("consumer_item_id") not in EXPECTED or edge.get("source_item_id") not in EXPECTED:
            fail(errors, f"registry provenanceが未知IDを参照: {key}")
    if actual_edges != set(expected_edges):
        fail(errors, "registry provenance edge集合が不足または過剰")

    if errors:
        print("FAIL: RDP-001 PREISOLATION 6-path coherence")
        for error in errors:
            print(f"- {error}")
        return 1
    print("PASS: RDP-001 PREISOLATION 6-path coherence (read-only static candidate check)")
    print("authority_effect=none; semantic_equivalence=unresolved; runtime/test execution=forbidden")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
