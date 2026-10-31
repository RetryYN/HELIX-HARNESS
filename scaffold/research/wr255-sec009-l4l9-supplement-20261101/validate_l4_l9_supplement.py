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
L5_L8_CANDIDATE_REVISION = "e7dd88b8f987de4cb5af6707489ea356a0c4c79a"
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
BASE_REVISION = "c14adddf2678c7a69d76420c451df3f05b1251ab"


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


def write_immutable_jsonl(path: Path, rows: list[dict[str, Any]]) -> None:
    rendered = "".join(json.dumps(row, ensure_ascii=False, separators=(",", ":")) + "\n" for row in rows)
    if path.exists():
        if path.read_text(encoding="utf-8") != rendered:
            raise ValueError(f"append-only evidence path already exists with different bytes: {path.name}")
        return
    path.write_text(rendered, encoding="utf-8")


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
    l4_digest = sha256(ROOT / PATHS["l4"])
    validator_digest = sha256(HERE / "validate_l4_l9_supplement.py")
    output_stem = f"{l9_revision[:8]}-{L5_L8_CANDIDATE_REVISION[:8]}-{l4_digest[:8]}-{validator_digest[:8]}"
    row_audit_name = f"l9-row-audit-{output_stem}.jsonl"
    pointer_summary_name = f"pointer-consumer-audit-{output_stem}.json"
    pointer_rows_name = f"pointer-consumer-audit-{output_stem}.jsonl"
    positive_review_name = f"positive-source-review-{output_stem}.json"
    checker_report_name = f"overlay-check-child-{output_stem}.json"
    summary_name = f"overlay-summary-{output_stem}.json"
    l3b = load_repo_json(PATHS["l3_business"])
    l3f = load_repo_json(PATHS["l3_functional"])
    l4 = load_repo_json(PATHS["l4"])
    l9_current = load_repo_json(PATHS["l9"])
    l9 = json.loads(subprocess.check_output(["git", "show", f"{BASE_REVISION}:{PATHS['l9']}"], cwd=ROOT, text=True))
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
            # Presence with nulls matches L8's explicitly unclosed positive rows.
            row["condition"] = None
            row["expected"] = None
            row["expected_preserved"] = None
            positive_rows.append({
                "case_id": case_id,
                "l9_source_pointer": l9_case_pointer,
                "given": given,
                "minimum_contract_meaning": "行別期待は未確定。下記のL3/L10契約文言は契約単位の根拠として記録し、行固有の結果には変換しない。",
            })
            row_audit.append({
                "case_id": case_id,
                "population_state": "positive_unclosed",
                "l9_source_pointer": l9_case_pointer,
                "l9_given_sha256": sha_value(given),
                "condition": None,
                "expected": None,
                "expected_preserved": None,
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
    write_immutable_jsonl(HERE / row_audit_name, row_audit)

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
    write_immutable_json(HERE / pointer_summary_name, pointer_summary)
    write_immutable_jsonl(HERE / pointer_rows_name, consumer_rows)

    # The 8 positive rows have contract-level meaning but lack case-level source inputs.
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
        },
        "positive_rows": positive_rows,
        "minimum_meaning_findings": [
            {"case_id": row["case_id"], "minimum": f"条件付きの意味のみ。case markerのunselected and absentをシナリオとして採る場合、L3 F01/L10 B01では当該recipientの不在を選択済みstop対象の欠落として数えない。selected setの入力がないため、具体的なexpected objectは作らない。({row['case_id'].split('-ONLY-',1)[-1].split('-UNSELECTED',1)[0]})"}
            for row in positive_rows[:5]
        ] + [
            {"case_id": positive_rows[5]["case_id"], "minimum": "行別結果は導けない。empty-set markerだけでは適用対象のoperationやrecipientの有無が分からず、L3/L10の契約は条件付きのまま。"},
            {"case_id": positive_rows[6]["case_id"], "minimum": "行別のrecovery対象選択は導けない。L3 F02はidentity-bound isolation/recoveryを求めるが、L9 givenにidentityやstateの値がない。"},
            {"case_id": positive_rows[7]["case_id"], "minimum": "L3 F02/L10 F02はgeneral-meaning unknownを無関係なglobal stopへ広げることを認めない。行のexpected category/scope入力がないため、positive期待全体は未確定。"},
        ],
        "decision": "これらはsourceの解釈として記録するだけである。L9 expected_proposal、L8期待値、個別oracle ID、test citationは補わない。",
    }
    write_immutable_json(HERE / positive_review_name, review)

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
    write_immutable_json(HERE / checker_report_name, report)
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
            "positive_rows_unclosed": len(positive_rows),
            "negative_expected_source": "L4 failure_classifications only",
            "positive_expected_source": "none; unresolved values are null",
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
    print(json.dumps({"L4_L9_pair": report["L4_L9_pair"].get("passed"), "L5_L8_pair": report["L5_L8_pair"].get("passed"), "matched": neg.get("matched_case_count"), "failures": len(neg.get("failures", [])), "positive_unclosed": len(positive_rows), "pointer_audit_L8": len(pointer_audit["layers"]["L8"]["consumer_rows"]), "pointer_audit_L9": len(pointer_audit["layers"]["L9"]["consumer_rows"]), "summary": summary_name}, ensure_ascii=False))
    return 0


def sha_value(value: Any) -> str:
    return hashlib.sha256(json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode()).hexdigest()


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except (KeyError, IndexError, ValueError, OSError, subprocess.CalledProcessError) as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        raise SystemExit(1)
