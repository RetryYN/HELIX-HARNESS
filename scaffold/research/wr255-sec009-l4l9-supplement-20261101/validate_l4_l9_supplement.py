#!/usr/bin/env python3
"""Build and measure an L4-derived SEC009 L9 overlay; audit old L4 consumers."""

from __future__ import annotations

import hashlib
import json
import re
import subprocess
import sys
import tempfile
from collections import Counter
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[3]
HERE = Path(__file__).resolve().parent
OVERLAY = HERE / "overlay"
L5_L8_CANDIDATE_REVISION = "24d7f00bdca41c3dfb1f3137655ffdbe3674cfb3"
PATHS = {
    "l3_business": "docs/helix-security/L3-requirements/business-requirements.json",
    "l3_functional": "docs/helix-security/L3-requirements/functional-requirements.json",
    "l4": "docs/helix-security/L4-basic-design/revoke-quarantine-propagation.json",
    "l5": "docs/helix-security/L5-detail-design/revoke-quarantine-propagation.json",
    "l8": "docs/helix-security/L8-unit-verification/revoke-quarantine-propagation.json",
    "l9": "docs/helix-security/L9-integration-verification/revoke-quarantine-propagation.json",
    "l10_business": "docs/helix-security/L10-verification/business-verification.json",
    "l10_functional": "docs/helix-security/L10-verification/functional-verification.json",
    "checker": "scaffold/tools/design_verification_checker.py",
}
L4_PATH = PATHS["l4"]
BASE_REVISION = "6a7fbfbe134e9163976fa67319044fa0bc03973f"
POSITIVE_RECIPIENT_CASES = {
    "SEC009-ONLY-OS_ASSIGNMENT-UNSELECTED-ABSENT": "os_assignment",
    "SEC009-ONLY-WORKER_EXECUTION-UNSELECTED-ABSENT": "worker_execution",
    "SEC009-ONLY-CONNECT_COMMUNICATION-UNSELECTED-ABSENT": "connect_communication",
    "SEC009-ONLY-CREDENTIAL_USE-UNSELECTED-ABSENT": "credential_use",
    "SEC009-ONLY-ARTIFACT_ACCESS-UNSELECTED-ABSENT": "artifact_access",
}
POINTER_AUDIT_MANIFEST = HERE / "pointer-consumer-audit-history.json"
POINTER_AUDIT_ROWS = HERE / "pointer-consumer-audit-33973b4b762d.jsonl"


def positive_minimum(case_id: str) -> dict[str, Any]:
    common_preserved = {
        "unrelated_scope": "全scope停止へ広げない。",
        "actual_stop": "none",
        "actual_recovery": "none",
        "resume_authorized": False,
        "operation_effect": "none",
    }
    if case_id in POSITIVE_RECIPIENT_CASES:
        recipient = POSITIVE_RECIPIENT_CASES[case_id]
        return {
            "oracle_id": None,
            "test_citation": None,
            "condition": {"scenario": "unselected_recipient_absent", "recipient": recipient, "premise_status": "case_marker_only_not_observed"},
            "expected": {
                "recipient_scope": "選択recipientだけを照合する。未選択recipientの能力不在を選択閉包の不足にしない。",
                "operation_start": "全recipient能力の完成を任意operation開始条件にしない。",
            },
            "expected_preserved": common_preserved,
        }
    if case_id == "SEC009-EMPTY-RECIPIENT-SET":
        return {
            "oracle_id": None,
            "test_citation": None,
            "condition": {"scenario": "empty_recipient_set", "premise": "独立期待集合とpolicy.selected_recipientsが空として解決する場合", "premise_status": "case_marker_only_not_observed"},
            "expected": {
                "recipient_output": "recipient別の照合結果を空集合として出力する。",
                "missing_recipient": "空集合だけを理由にrecipient不足を生成しない。",
            },
            "expected_preserved": common_preserved,
        }
    if case_id == "SEC009-OS-OFFLINE-INDEPENDENT-RECOVERY-SELECTION":
        return {
            "oracle_id": None,
            "test_citation": None,
            "condition": {"scenario": "os_offline_independent_recovery_selection", "phase": "recovery", "premise_status": "case_marker_only_not_observed"},
            "expected": {
                "selection": "独立復旧経路の選択条件に従ってrecipientを照合する。",
                "prerequisite": "停止中OSまたは通常009応答を普遍的な開始前提にしない。",
                "state_separation": "隔離素材と復旧素材を別状態として示す。",
            },
            "expected_preserved": {"actual_stop": "none", "actual_recovery": "none", "resume_authorized": False, "operation_effect": "none"},
        }
    if case_id == "SEC009-GENERAL-MEANING-UNKNOWN":
        return {
            "oracle_id": None,
            "test_citation": None,
            "condition": {"scenario": "general_document_meaning_unknown", "premise_status": "case_marker_only_not_observed"},
            "expected": {
                "locality": "一般文書の意味unknownを全操作/全scope停止へ拡張しない。",
                "classification": "unknownだけから安全trigger分類を生成しない。",
            },
            "expected_preserved": common_preserved,
        }
    raise ValueError(f"unrecognized positive SEC009 case marker: {case_id}")


def read_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def load_repo_json(relative: str) -> Any:
    return read_json(ROOT / relative)


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def sha256_bytes(value: bytes) -> str:
    return hashlib.sha256(value).hexdigest()


def write_immutable_json(path: Path, value: Any) -> None:
    rendered = json.dumps(value, ensure_ascii=False, indent=2) + "\n"
    if path.exists():
        if path.read_text(encoding="utf-8") != rendered:
            raise ValueError(f"append-only evidence path already exists with different bytes: {path.name}")
        return
    path.write_text(rendered, encoding="utf-8")


def write_or_reuse_json(path: Path, value: Any, prefix: str) -> str:
    rendered = json.dumps(value, ensure_ascii=False, indent=2) + "\n"
    matches = [item for item in HERE.glob(f"{prefix}*.json") if item.read_text(encoding="utf-8") == rendered]
    if matches:
        return sorted(matches, key=lambda item: item.name)[-1].name
    write_immutable_json(path, value)
    return path.name


def write_immutable_jsonl(path: Path, rows: list[dict[str, Any]]) -> None:
    rendered = "".join(json.dumps(row, ensure_ascii=False, separators=(",", ":")) + "\n" for row in rows)
    if path.exists():
        if path.read_text(encoding="utf-8") != rendered:
            raise ValueError(f"append-only evidence path already exists with different bytes: {path.name}")
        return
    path.write_text(rendered, encoding="utf-8")


def write_or_reuse_jsonl(path: Path, rows: list[dict[str, Any]], prefix: str) -> str:
    rendered = "".join(json.dumps(row, ensure_ascii=False, separators=(",", ":")) + "\n" for row in rows)
    matches = [item for item in HERE.glob(f"{prefix}*.jsonl") if item.read_text(encoding="utf-8") == rendered]
    if matches:
        return sorted(matches, key=lambda item: item.name)[-1].name
    write_immutable_jsonl(path, rows)
    return path.name


def normalize_temp_paths(value: Any) -> Any:
    if isinstance(value, dict):
        return {key: normalize_temp_paths(item) for key, item in value.items()}
    if isinstance(value, list):
        return [normalize_temp_paths(item) for item in value]
    if isinstance(value, str):
        return re.sub(
            r"/tmp/wr255-sec009-overlay-[^/]+/(l5|l8)-candidate\.json",
            lambda match: f"git show {L5_L8_CANDIDATE_REVISION}:{PATHS[match.group(1)]}",
            value,
        )
    return value


def resolve(root: Any, pointer: str) -> Any:
    if pointer == "":
        return root
    if not pointer.startswith("/"):
        raise ValueError(f"invalid JSON Pointer: {pointer}")
    current = root
    for raw in pointer[1:].split("/"):
        key = raw.replace("~1", "/").replace("~0", "~")
        current = current[int(key)] if isinstance(current, list) else current[key]
    return current


def validate_positive_expectation_refs(document: Any, label: str) -> None:
    """Require every remaining positive expectation reference to resolve locally."""
    def visit(value: Any, at: str = "") -> None:
        if isinstance(value, dict):
            ref = value.get("positive_expectation_ref")
            if ref is not None:
                if not isinstance(ref, str):
                    raise ValueError(f"{label} has a non-string positive expectation ref at {at}")
                parts = ref.split("/")
                if len(parts) < 3 or parts[0] != "positive_expectation_basis":
                    raise ValueError(f"{label} has a non-local positive expectation ref at {at}: {ref}")
                try:
                    resolve(document[parts[0]], "/" + "/".join(parts[1:]))
                except (KeyError, IndexError, TypeError, ValueError) as exc:
                    raise ValueError(f"{label} has an unresolved positive expectation ref at {at}: {ref}") from exc
            for key, item in value.items():
                visit(item, f"{at}/{key}")
        elif isinstance(value, list):
            for index, item in enumerate(value):
                visit(item, f"{at}/{index}")

    visit(document)


def validate_pointer_audit_manifest(consumer_rows: list[dict[str, Any]]) -> None:
    manifest = read_json(POINTER_AUDIT_MANIFEST)
    rendered = "".join(json.dumps(row, ensure_ascii=False, separators=(",", ":")) + "\n" for row in consumer_rows).encode()
    row_files = sorted(path.name for path in HERE.glob("pointer-consumer-audit-*.jsonl"))
    if row_files != [POINTER_AUDIT_ROWS.name]:
        raise ValueError(f"pointer audit must have exactly one current JSONL file, found: {row_files}")
    if (HERE / "pointer-consumer-audit.json").exists():
        raise ValueError("expanded duplicate pointer-consumer-audit.json must remain removed from the current tree")
    if manifest.get("canonical_path") != POINTER_AUDIT_ROWS.name:
        raise ValueError("pointer audit history manifest names a different canonical row file")
    if manifest.get("canonical_sha256") != sha256_bytes(rendered):
        raise ValueError("pointer audit rows differ from the consolidated history manifest")
    if len(consumer_rows) != manifest.get("canonical_row_count"):
        raise ValueError("pointer audit row count differs from the consolidated history manifest")
    historical = manifest.get("identical_jsonl_measurements", [])
    if len(historical) != 4 or len({row.get("content_sha256") for row in historical}) != 1:
        raise ValueError("pointer audit history must enumerate four byte-identical prior JSONL measurements")
    if any(row.get("content_sha256") != sha256_bytes(rendered) for row in historical):
        raise ValueError("historical pointer audit JSONL digest differs from the canonical rows")


def all_strings(root: Any, pointer: str = ""):
    if isinstance(root, dict):
        for key, value in root.items():
            yield from all_strings(value, f"{pointer}/{key}")
    elif isinstance(root, list):
        for index, value in enumerate(root):
            yield from all_strings(value, f"{pointer}/{index}")
    elif isinstance(root, str):
        yield pointer, root


def git(*args: str) -> str:
    return subprocess.check_output(["git", *args], cwd=ROOT, text=True).strip()


def main() -> int:
    l9_revision = git("log", "-1", "--format=%H", "--", PATHS["l9"])
    l9_digest = sha256(ROOT / PATHS["l9"])
    l4_digest = sha256(ROOT / PATHS["l4"])
    validator_digest = sha256(HERE / "validate_l4_l9_supplement.py")
    output_stem = f"{l9_revision[:8]}-{l9_digest[:8]}-{L5_L8_CANDIDATE_REVISION[:8]}-{l4_digest[:8]}-{validator_digest[:8]}"
    row_audit_name = f"l9-row-audit-{output_stem}.jsonl"
    pointer_summary_name = f"pointer-consumer-audit-summary-{output_stem}.json"
    pointer_rows_name = POINTER_AUDIT_ROWS.name
    positive_review_name = f"positive-source-review-{output_stem}.json"
    checker_report_name = f"overlay-check-child-{output_stem}.json"
    summary_name = f"overlay-summary-{output_stem}.json"
    l3b = load_repo_json(PATHS["l3_business"])
    l3f = load_repo_json(PATHS["l3_functional"])
    l4 = load_repo_json(PATHS["l4"])
    l9_current = load_repo_json(PATHS["l9"])
    l9 = json.loads(subprocess.check_output(["git", "show", f"{BASE_REVISION}:{PATHS['l9']}"], cwd=ROOT, text=True))
    validate_positive_expectation_refs(l9_current, "canonical L9")
    validate_positive_expectation_refs(l9, "pinned L9 base")
    l10b = load_repo_json(PATHS["l10_business"])
    l10f = load_repo_json(PATHS["l10_functional"])
    l5_bytes = subprocess.check_output(["git", "show", f"{L5_L8_CANDIDATE_REVISION}:{PATHS['l5']}"], cwd=ROOT)
    l8_bytes = subprocess.check_output(["git", "show", f"{L5_L8_CANDIDATE_REVISION}:{PATHS['l8']}"], cwd=ROOT)
    l5 = json.loads(l5_bytes)
    l8 = json.loads(l8_bytes)
    classes = {row["class_id"]: row for row in l4["failure_classifications"]}
    class_index = {row["class_id"]: i for i, row in enumerate(l4["failure_classifications"])}

    projected_l9 = json.loads(json.dumps(l9, ensure_ascii=False))
    projection_rows = []
    positive_rows = []
    row_audit = []
    negative_given_hashes: Counter[str] = Counter()
    for row in projected_l9["integration_cases"]:
        case_id = row["id"]
        l9_case_pointer = row["source_pointers"][0]["pointer"]
        nested = resolve(l9, l9_case_pointer)
        given = nested.get("given", {})
        if row["population_state"] == "negative":
            class_id = row.get("negative_class_ref")
            if class_id not in classes:
                raise ValueError(f"negative case has no resolvable L4 class: {case_id}")
            c4 = classes[class_id]
            given_hash = hashlib.sha256(json.dumps(given, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode()).hexdigest()
            negative_given_hashes[given_hash] += 1
            if set(given) != {"evidence_limit"}:
                raise ValueError(f"L9 negative given has additional input fields; review before projection: {case_id}")
            finding_codes = c4["expected"]["finding_codes"]
            observation = {
                "condition": c4["expected"]["condition"],
                "ordered_findings": [
                    {"code": code, "return_owner": c4["backflow_owner"]}
                    for code in finding_codes
                ],
            }
            row["condition"] = c4["condition"]
            row["expected"] = c4["expected"]
            row["expected_preserved"] = c4["expected_preserved"]
            row["compact_whole_observation"] = observation
            row["source_pointers"] = row["source_pointers"] + [{
                "path": L4_PATH,
                "pointer": f"/failure_classifications/{class_index[class_id]}",
            }]
            projection_rows.append({
                "case_id": case_id,
                "class_id": class_id,
                "l9_source_pointer": l9_case_pointer,
                "l4_class_pointer": f"/failure_classifications/{class_index[class_id]}",
                "given_sha256": given_hash,
                "projected_condition_sha256": sha_value(c4["condition"]),
                "projected_expected_sha256": sha_value(c4["expected"]),
                "projected_expected_preserved_sha256": sha_value(c4["expected_preserved"]),
            })
            row_audit.append({
                "case_id": case_id,
                "population_state": "negative",
                "l9_source_pointer": l9_case_pointer,
                "l9_given_sha256": given_hash,
                "l4_class_id": class_id,
                "l4_class_pointer": f"/failure_classifications/{class_index[class_id]}",
                "condition_sha256": sha_value(c4["condition"]),
                "expected_sha256": sha_value(c4["expected"]),
                "expected_preserved_sha256": sha_value(c4["expected_preserved"]),
                "compact_observation_codes": finding_codes,
                "return_owner": c4["backflow_owner"],
            })
        else:
            if set(given) != {"evidence_limit"}:
                raise ValueError(f"L9 positive given has additional input fields; review before class-based projection: {case_id}")
            minimum = positive_minimum(case_id)
            row.update(minimum)
            positive_rows.append({
                "case_id": case_id,
                "l9_source_pointer": l9_case_pointer,
                "given": given,
                **minimum,
                "row_oracle_id": None,
                "test_citation": None,
                "measurement_status": "契約最小期待を設計済み。fixture入力と実観測は未取得。",
            })
            row_audit.append({
                "case_id": case_id,
                "population_state": "positive_contract_minimum_unobserved",
                "l9_source_pointer": l9_case_pointer,
                "l9_given_sha256": sha_value(given),
                "condition_sha256": sha_value(minimum["condition"]),
                "expected_sha256": sha_value(minimum["expected"]),
                "expected_preserved_sha256": sha_value(minimum["expected_preserved"]),
                "row_oracle_id": None,
                "test_citation": None,
            })

    if l9_current.get("integration_cases") != projected_l9.get("integration_cases"):
        raise ValueError("canonical L9 integration_cases differ from independently generated L4/L9 projection")
    if [row["id"] for row in l9_current["integration_cases"]] != [row["id"] for row in l9["integration_cases"]]:
        raise ValueError("canonical L9 row IDs or ordering differ from the pinned base")
    for key in set(l9) - {"integration_cases"}:
        if l9_current.get(key) != l9.get(key):
            raise ValueError(f"canonical L9 non-case field changed during projection: {key}")
    if len(row_audit) != 285 or len(projection_rows) != 277 or len(positive_rows) != 8:
        raise ValueError(f"unexpected SEC009 case inventory: rows={len(row_audit)} negative={len(projection_rows)} positive={len(positive_rows)}")
    row_audit_name = write_or_reuse_jsonl(HERE / row_audit_name, row_audit, "l9-row-audit-")

    # Independently audit all 308 direct L4 nested pointer fields in each layer.
    nested_pointer_re = re.compile(r"^/contracts/\d+/negative_classifications(?:/\d+)?$")
    aliases = {
        "code": "class_id",
        "change": "condition",
        "axis": "expected_axis",
        "state": "expected_state",
        "expected_side_effect_count": "side_effect_count",
        "expected": "expected",
        "expected_preserved": "expected_preserved",
        "backflow_owner": "backflow_owner",
    }
    pointer_audit = {"schema": "sec009-nested-pointer-consumer-audit.v1", "layers": {}}
    consumer_rows = []
    for layer, data in (("L8", l8), ("L9", l9_current)):
        refs = []
        wrapper_refs = []
        for occurrence, value in all_strings(data):
            if nested_pointer_re.fullmatch(value):
                refs.append((occurrence, value, "raw_pointer"))
            elif value.startswith(f"{L4_PATH}#") and nested_pointer_re.fullmatch(value.split("#", 1)[1]):
                wrapper_refs.append((occurrence, value.split("#", 1)[1], "path_pointer"))
        if len(refs) != 308 or len(wrapper_refs) != 275:
            raise ValueError(f"unexpected nested pointer inventory for {layer}: raw={len(refs)}, path={len(wrapper_refs)}")
        consumers = []
        for index, (occurrence, old_pointer, pointer_kind) in enumerate(refs, 1):
            old_target = resolve(l4, old_pointer)
            if isinstance(old_target, list):
                candidate_ids = [item["code"] for item in old_target]
                if any(class_id not in classes for class_id in candidate_ids):
                    raise ValueError(f"nested class collection has unresolved class IDs: {old_pointer}")
                candidate_pointers = [
                    f"/failure_classifications/{class_index[class_id]}"
                    for class_id in candidate_ids
                ]
                record = {
                    "consumer_id": f"{layer}-NESTED-{index:03d}",
                    "kind": "direct_collection_pointer",
                    "occurrence_pointer": occurrence,
                    "pointer_kind": pointer_kind,
                    "old_l4_pointer": old_pointer,
                    "alternate_target": {"kind": "ordered_class_id_list", "class_ids": candidate_ids},
                    "alternate_target_pointers": candidate_pointers,
                    "direct_rfc6901_target_available": False,
                    "migration_review": {
                        "status": "not_transferred",
                        "reason": "旧pointerは契約内の順序付き14分類一覧を指す。top-level classへの同等な単一JSON Pointerはなく、候補pointer一覧への置換にはconsumer側の一対多変換と再検査が必要。",
                    },
                }
                consumers.append(record)
                consumer_rows.append({
                    "layer": layer,
                    "consumer_id": record["consumer_id"],
                    "kind": "direct_collection_pointer",
                    "occurrence_pointer": occurrence,
                    "old_l4_pointer": old_pointer,
                    "alternate_class_ids": candidate_ids,
                    "alternate_pointers": candidate_pointers,
                    "migration_status": "not_transferred",
                    "migration_blocker": "COLLECTION_FAN_OUT_REQUIRED",
                })
                continue
            class_id = old_target.get("code")
            matches = [r for r in l4["failure_classifications"] if r.get("class_id") == class_id]
            if len(matches) != 1:
                raise ValueError(f"nested source has no unique top-level class for {layer} {old_pointer}")
            replacement = matches[0]
            replacement_pointer = f"/failure_classifications/{l4['failure_classifications'].index(replacement)}"
            field_comparison = {}
            for old_field, new_field in aliases.items():
                field_comparison[old_field] = {
                    "new_field": new_field,
                    "same_json_type": type(old_target.get(old_field)) is type(replacement.get(new_field)),
                    "same_value": old_target.get(old_field) == replacement.get(new_field),
                }
            old_sources = {(r.get("path"), r.get("pointer")) for r in old_target.get("source_pointers", [])}
            new_sources = {(r.get("path"), r.get("pointer")) for r in replacement.get("source_pointers", [])}
            source_coverage = old_sources.issubset(new_sources)
            missing = sorted(set(old_target) - set(aliases) - {"source_pointers", "expected_side_effect_count"})
            record = {
                "consumer_id": f"{layer}-NESTED-{index:03d}",
                "kind": "direct_class_pointer",
                "occurrence_pointer": occurrence,
                "pointer_kind": pointer_kind,
                "old_l4_pointer": old_pointer,
                "old_class_id": class_id,
                "alternate_target": {"kind": "top_level_class", "class_id": class_id, "pointer": replacement_pointer},
                "field_alias_comparison": field_comparison,
                "old_source_pointers_covered": source_coverage,
                "legacy_fields_without_identical_top_level_name_or_value": missing,
                "direct_rfc6901_target_safe_without_consumer_update": False,
                "migration_review": {
                    "status": "not_transferred",
                    "reason": "行targetは一意のtop-level classへ対応するが、旧code/change/axis/state等と新class_id/condition/expected_axis/expected_state等のfield mappingが必要。旧expected_textには同値のtop-level fieldがないため、raw pointerの置換だけでは情報保持を確認できない。",
                    "field_alias_comparison": field_comparison,
                    "unmapped_legacy_fields": missing,
                },
            }
            consumers.append(record)
            consumer_rows.append({
                "layer": layer,
                "consumer_id": record["consumer_id"],
                "kind": "direct_class_pointer",
                "occurrence_pointer": occurrence,
                "old_l4_pointer": old_pointer,
                "class_id": class_id,
                "alternate_pointer": replacement_pointer,
                "aliases_match": all(v["same_json_type"] and v["same_value"] for v in field_comparison.values()) and source_coverage,
                "unmapped_legacy_fields": missing,
                "migration_status": "not_transferred",
                "migration_blocker": "FIELD_AWARE_REDIRECT_REQUIRED",
            })
        wrapper_rows = []
        for wrapper_index, (occurrence, old_pointer, _) in enumerate(wrapper_refs, 1):
            old_target = resolve(l4, old_pointer)
            if isinstance(old_target, list):
                class_ids = [item["code"] for item in old_target]
                alt_pointers = [f"/failure_classifications/{class_index[cid]}" for cid in class_ids]
                class_id = None
                reason = "旧full-path wrapperは契約内の分類一覧を指すが、top-levelに同じ一覧の単一pointerがない。一覧pointerから複数class pointerへの変換とconsumer再検査が必要。"
                kind = "full_path_collection_wrapper"
            else:
                class_id = old_target["code"]
                class_ids = None
                alt_pointers = [f"/failure_classifications/{class_index[class_id]}"]
                reason = "対応classは一意だが、旧expected_textの同値fieldがなく、code/change/axis/state等のaliasもある。full-path文字列を替えるだけではfieldの情報保持を確認できない。"
                kind = "full_path_class_wrapper"
            wrapper_rows.append({"kind": kind, "occurrence_pointer": occurrence, "old_l4_pointer": old_pointer, "maps_to_same_raw_consumer": True})
            consumer_rows.append({
                "layer": layer,
                "consumer_id": f"{layer}-WRAPPER-{wrapper_index:03d}",
                "kind": kind,
                "occurrence_pointer": occurrence,
                "old_l4_pointer": old_pointer,
                "class_id": class_id,
                "alternate_pointers": alt_pointers,
                "alternate_class_ids": class_ids,
                "migration_status": "not_transferred",
                "migration_blocker": "COLLECTION_FAN_OUT_REQUIRED" if class_ids is not None else "FIELD_AWARE_REDIRECT_REQUIRED",
            })
        pointer_audit["layers"][layer] = {
            "direct_raw_pointer_fields": len(refs),
            "full_path_pointer_wrappers": len(wrapper_refs),
            "total_string_occurrences": len(refs) + len(wrapper_refs),
            "unique_old_targets": len({row[1] for row in refs}),
            "consumer_rows": consumers,
            "wrapper_rows": wrapper_rows,
        }
    pointer_summary = {
        "schema": pointer_audit["schema"],
        "layers": {
            layer: {
                "direct_raw_pointer_fields": data["direct_raw_pointer_fields"],
                "full_path_pointer_wrappers": data["full_path_pointer_wrappers"],
                "total_string_occurrences": data["total_string_occurrences"],
                "unique_old_targets": data["unique_old_targets"],
                "direct_class_pointer_rows": sum(r["kind"] == "direct_class_pointer" for r in data["consumer_rows"]),
                "direct_collection_pointer_rows": sum(r["kind"] == "direct_collection_pointer" for r in data["consumer_rows"]),
                "wrapper_class_rows": sum(r["kind"] == "full_path_class_wrapper" for r in data["wrapper_rows"]),
                "wrapper_collection_rows": sum(r["kind"] == "full_path_collection_wrapper" for r in data["wrapper_rows"]),
            }
            for layer, data in pointer_audit["layers"].items()
        },
        "consumer_row_file": pointer_rows_name,
        "consumer_row_count": len(consumer_rows),
        "migration_blockers": {
            "FIELD_AWARE_REDIRECT_REQUIRED": "代替top-level classは一意だが、旧expected_textに同値のfieldがなく、class fieldのaliasをconsumer側で扱う移行と再照合が必要。",
            "COLLECTION_FAN_OUT_REQUIRED": "旧contract内subsetを指す単一top-level JSON Pointerがない。順序付きclass pointer列へのconsumer変更と再照合が必要。",
        },
        "retirement_result": "退役条件未成立。consumer移行は実施しておらず、field mappingを伴うclass参照の更新とcollection pointerの一対多変換、各consumerの再照合が必要。",
    }
    pointer_summary_name = write_or_reuse_json(HERE / pointer_summary_name, pointer_summary, "pointer-consumer-audit-summary-")
    write_immutable_jsonl(HERE / pointer_rows_name, consumer_rows)
    validate_pointer_audit_manifest(consumer_rows)

    # Design contract-minimum expectations from case markers and L3/L10/L4; do
    # not copy L9 expected_proposal or infer observed fixture values.
    l10b_case = next(r for r in l10b["cases"] if r["id"] == "HELIXSECURITY-L10-009-B01")
    l10f_case = next(r for r in l10f["cases"] if r["id"] == "HELIXSECURITY-L10-009-F02")
    review = {
        "schema": "sec009-positive-minimum-meaning-review.v1",
        "authority_effect": "none",
        "source_facts": {
            "L3_B01": {"path": PATHS["l3_business"], "pointer": "/requirements/2", "obligation": l3b["requirements"][2]["obligation"]},
            "L3_F01": {"path": PATHS["l3_functional"], "pointer": "/requirements/21", "obligation": l3f["requirements"][21]["obligation"]},
            "L3_F02": {"path": PATHS["l3_functional"], "pointer": "/requirements/22", "obligation": l3f["requirements"][22]["obligation"]},
            "L10_B01": {"path": PATHS["l10_business"], "pointer": "/cases/2", "positive_input": l10b_case["positive_input"], "expected_observation": l10b_case["expected_observation"]},
            "L10_F02": {"path": PATHS["l10_functional"], "pointer": "/cases/22", "positive_input": l10f_case["positive_input"], "expected_observation": l10f_case["expected_observation"]},
            "L4_B01": {"path": PATHS["l4"], "pointer": "/contracts/0", "output_meaning": l4["contracts"][0]["output_meaning"]},
            "L4_F02": {"path": PATHS["l4"], "pointer": "/contracts/2", "output_meaning": l4["contracts"][2]["output_meaning"]},
            "L4_independent_recovery": {"path": PATHS["l4"], "pointer": "/architecture/independent_recovery", "meaning": l4["architecture"]["independent_recovery"]},
            "L4_locality": {"path": PATHS["l4"], "pointer": "/architecture/locality", "meaning": l4["architecture"]["locality"]},
        },
        "positive_rows": positive_rows,
        "minimum_meaning_findings": [
            {"case_id": row["case_id"], "condition": row["condition"], "expected": row["expected"], "expected_preserved": row["expected_preserved"], "measurement_status": row["measurement_status"]}
            for row in positive_rows
        ],
        "decision": "各行に契約最小期待を設計した。L9 expected_proposalを参照せず、具体fixture値・個別oracle ID・test citation・実観測は補っていない。givenには行別入力値がないため期待は未実測である。",
    }
    positive_review_name = write_or_reuse_json(HERE / positive_review_name, review, "positive-source-review-")

    # Read fixed L5/L8 candidate bytes from Git and use disposable temp files;
    # do not retain duplicate layer snapshots in the scaffold.
    with tempfile.TemporaryDirectory(prefix="wr255-sec009-overlay-") as tmp:
        tmp_root = Path(tmp)
        l5_tmp = tmp_root / "l5-candidate.json"
        l8_tmp = tmp_root / "l8-candidate.json"
        l5_tmp.write_bytes(l5_bytes)
        l8_tmp.write_bytes(l8_bytes)
        checker_cmd = [
            sys.executable, str(ROOT / PATHS["checker"]), "check-child", "--root", str(ROOT),
            "--l4", PATHS["l4"], "--l9", PATHS["l9"],
            "--l5", str(l5_tmp), "--l8", str(l8_tmp),
        ]
        proc = subprocess.run(checker_cmd, cwd=ROOT, text=True, capture_output=True)
    report = normalize_temp_paths(json.loads(proc.stdout))
    checker_report_name = write_or_reuse_json(HERE / checker_report_name, report, "overlay-check-child-")
    neg = report["negative_4way"]
    summary = {
        "schema": "wr255-sec009-l4-l9-overlay-summary.v1",
        "evidence_kind": "scaffold",
        "authority_effect": "none",
        "source_revisions": {
            "L4_L9_base": BASE_REVISION,
            "L9_current": l9_revision,
            "L5_L8_candidate": L5_L8_CANDIDATE_REVISION,
        },
        "validator_sha256": validator_digest,
        "source_sha256": {name: sha256(ROOT / path) for name, path in PATHS.items()},
        "overlay_sha256": {
            "l5_candidate_git_blob": sha256_bytes(l5_bytes),
            "l8_candidate_git_blob": sha256_bytes(l8_bytes),
            "l9_projection_matches_canonical": sha256(ROOT / PATHS["l9"]),
        },
        "projection": {
            "negative_rows": len(projection_rows),
            "positive_rows_with_contract_minimum_unobserved": len(positive_rows),
            "negative_expected_source": "L4 failure_classifications only",
            "positive_expected_source": "L3/L10/L4 contract meaning plus case marker; no L9 expected_proposal copy",
            "compact_observation": "ordered L4 finding_codes plus L4 backflow_owner; no L9 expected_proposal copied",
        },
        "pointer_audit": {
            layer: {key: value for key, value in data.items() if key != "consumer_rows" and key != "wrapper_rows"}
            for layer, data in pointer_audit["layers"].items()
        },
        "check_child": {
            "exit_code": proc.returncode,
            "passed": report.get("passed"),
            "L4_L9_pair_passed": report.get("L4_L9_pair", {}).get("passed"),
            "L5_L8_pair_passed": report.get("L5_L8_pair", {}).get("passed"),
            "negative_4way_matched_case_count": neg.get("matched_case_count"),
            "negative_4way_failure_count": len(neg.get("failures", [])),
            "reason_counts": dict(Counter(row.get("reason", "unknown") for row in neg.get("failures", []))),
            "report_path": checker_report_name,
        },
        "row_audit_file": row_audit_name,
        "row_audit_sha256": sha256(HERE / row_audit_name),
        "consumer_audit_file": pointer_rows_name,
        "consumer_audit_sha256": sha256(HERE / pointer_rows_name),
        "positive_review_file": positive_review_name,
    }
    write_immutable_json(HERE / summary_name, summary)
    print(json.dumps({"L4_L9_pair": report["L4_L9_pair"].get("passed"), "L5_L8_pair": report["L5_L8_pair"].get("passed"), "matched": neg.get("matched_case_count"), "failures": len(neg.get("failures", [])), "positive_contract_minimum_unobserved": len(positive_rows), "pointer_audit_L8": len(pointer_audit["layers"]["L8"]["consumer_rows"]), "pointer_audit_L9": len(pointer_audit["layers"]["L9"]["consumer_rows"]), "summary": summary_name}, ensure_ascii=False))
    return 0


def sha_value(value: Any) -> str:
    return hashlib.sha256(json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode()).hexdigest()


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except (KeyError, IndexError, ValueError, OSError, subprocess.CalledProcessError) as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        raise SystemExit(1)
