#!/usr/bin/env python3
"""WR253 static U-ID table validation; reads only fixed source documents and git history."""
from __future__ import annotations
import hashlib
import json
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
BASE = "46864fcaa2426a480dbd037040cd4c4332c61ddd"
CURRENT_SOURCE_REVISION = BASE
L8 = "docs/helix-harness/L8-unit-verification/tdd-development-flow.json"
L9 = "docs/helix-harness/L9-integration-verification/tdd-development-flow.json"
CANDIDATE_FIELDS = ("candidate_unit_design",)
COMPACT_MEANING_AUDIT = {'HARNESS-L9-015-B01-NORMAL': {'counterexample': '正常系: 同一契約を利用者CIへ渡す。',
                               'expected': '同一契約の利用者CI利用を支援し、品質・C1・受入を分離。Provisional上限。'},
 'HARNESS-L9-015-B01-OS-CI': {'counterexample': '正常系: 同一契約をOS CIへ渡す。',
                              'expected': '同一契約のOS CI利用を支援し、品質・C1・受入を分離。Provisional上限。'},
 'HARNESS-L9-015-B01-os_only': {'counterexample': 'OS運転なしを理由に利用者CI単独利用を拒む。',
                                'expected': '同一契約の利用者CI単独利用を許す。'},
 'HARNESS-L9-015-B01-cheap_quality_failure': {'counterexample': '必要品質未達を費用・時間改善で成功扱い。',
                                              'expected': '品質未達を保ち、計測改善から成功を作らない。'},
 'HARNESS-L9-015-B01-omission_erased': {'counterexample': 'C1未回収を消去または回収済み扱い。',
                                        'expected': 'C1未回収を残し、品質・受入へ算入しない。'},
 'HARNESS-L9-015-B01-metric_as_accepted': {'counterexample': '計測改善だけから利用者受入を生成。',
                                           'expected': '品質・受入を計測値から分離する。'},
 'HARNESS-L9-015-F01-NORMAL': {'counterexample': '対象・oracleのfreezeはあるが、実装前Redは未観測。',
                               'expected': '対象freezeを保ち、Red・実装成功は未成立とする。'},
 'HARNESS-L9-015-F01-freeze_missing': {'counterexample': '対象に結ぶ凍結根拠が欠落。',
                                       'expected': 'freeze不足を保持し、成立扱いしない。'},
 'HARNESS-L9-015-F01-test_after_body': {'counterexample': '本体変更後にtest/oracleを凍結。',
                                        'expected': '後付けfreezeを拒み、順序不成立を残す。'},
 'HARNESS-L9-015-F01-foreign_oracle_revision': {'counterexample': '設計とoracleの対象revisionが不一致。',
                                                'expected': 'revision不一致をstaleとして保つ。'},
 'HARNESS-L9-015-F01-freeze_as_red': {'counterexample': '定義freezeを実Red観測の代用にする。',
                                      'expected': 'Red未観測を保ち、freezeをRedに数えない。'},
 'HARNESS-L9-015-F01-freeze_timestamp_only': {'counterexample': '時刻だけで事前freezeを証明。',
                                              'expected': '根拠不足を保ち、事前freezeとしない。'},
 'HARNESS-L9-015-F02-NORMAL': {'counterexample': '既存H0でduplicate debitが事前Redとなる系列。',
                               'expected': '合成fixture上のH0 Red候補を保持。実Red・TDD成功は未成立。'},
 'HARNESS-L9-015-F02-NEW-IMPLEMENTATION': {'counterexample': '未実装H0で必要behaviorが欠ける系列。',
                                           'expected': '合成fixture上のbehavior欠落Red候補を保持。実Red・TDD成功は未成立。'},
 'HARNESS-L9-015-F02-after_body_red': {'counterexample': '実装後Redだけで順序要件を満たす扱い。',
                                       'expected': '本体前Redの欠落を保持する。'},
 'HARNESS-L9-015-F02-foreign_pre_body_head': {'counterexample': '別revisionのHeadを本体前H0として扱う。',
                                              'expected': '対象H0の不一致を拒む。'},
 'HARNESS-L9-015-F02-environment_error': {'counterexample': '環境障害による未観測をRed扱い。',
                                          'expected': '未観測のまま保持し、Redに数えない。'},
 'HARNESS-L9-015-F02-unexecuted_red': {'counterexample': '未実行のtestをRed観測扱い。',
                                       'expected': '未実行はRed観測にしない。'},
 'HARNESS-L9-015-F02-mutation_substitute': {'counterexample': '実装後H1のmutation検出を事前Redの代用にする。',
                                            'expected': 'H0 Red欠落を保ち、H1証拠で補完しない。'},
 'HARNESS-L9-015-F03-NORMAL': {'counterexample': '同一oracleでfreeze→Red→最小body→Green→Refactor→原子CI。',
                               'expected': '同一oracleのRed→Green(1件)順と意味を保ち、TDD未完了・Provisional上限。'},
 'HARNESS-L9-015-F03-oracle_relaxed': {'counterexample': 'Greenのため凍結oracleを弱める、または差替える。',
                                       'expected': 'oracle不一致を保ち、Green完了に数えない。'},
 'HARNESS-L9-015-F03-body_before_red': {'counterexample': '実装本体変更が事前Redに先行。',
                                        'expected': 'Red欠落を保ち、後続証拠で補完しない。'},
 'HARNESS-L9-015-F03-public_change': {'counterexample': '局所Refactorでpublic contractの意味を変更。',
                                      'expected': '局所変更に閉じず上流へ戻す。'},
 'HARNESS-L9-015-F03-architecture_change': {'counterexample': '局所Refactorでarchitectureの意味を変更。',
                                            'expected': 'L4へ戻す。'},
 'HARNESS-L9-015-F03-state_change': {'counterexample': '局所Refactorでstateの意味を変更。',
                                     'expected': '対応する設計へ戻す。'},
 'HARNESS-L9-015-F03-ci_as_quality': {'counterexample': '原子CI成功だけで品質または受入成立とする。',
                                      'expected': 'CIから品質・受入を生成しない。'},
 'HARNESS-L9-015-F03-requirement_change': {'counterexample': '局所Refactor中に要求の意味を変更。',
                                           'expected': '要求を局所変更にせず該当上流へ戻す。'},
 'HARNESS-L9-015-F03-minimal_body_scope_expansion': {'counterexample': '最小本体に契約範囲外のbehaviorを追加。',
                                                     'expected': '範囲外を未解決に保ち、Greenで相殺しない。'},
 'HARNESS-L9-015-F03-green_wrong_behavior': {'counterexample': '期待debit 1に対しGreen観測は2。',
                                             'expected': 'oracle不一致をfailureとして保持する。'},
 'HARNESS-L9-015-F04-NORMAL': {'counterexample': '同一revisionの双方向traceがある。',
                               'expected': '同revision双方向traceを保ち、Provisional上限。Integrated以降は未生成。'},
 'HARNESS-L9-015-F04-reverse_trace_missing': {'counterexample': 'design/test→code traceのみで逆traceがない。',
                                              'expected': '逆trace欠落を保ち、F04未完了とする。'},
 'HARNESS-L9-015-F04-foreign_trace_revision': {'counterexample': 'traceの参照先revisionが対象と不一致。',
                                               'expected': '同一revisionの双方向traceと認めない。'},
 'HARNESS-L9-015-F04-development_as_integrated': {'counterexample': '開発単独出力からIntegrated成立を主張。',
                                                  'expected': '022の根拠が揃うまでIntegratedを生成しない。'},
 'HARNESS-L9-015-F04-ci_as_accepted': {'counterexample': '原子CI GreenだけからAccepted成立を主張。',
                                       'expected': '022の根拠が揃うまでAcceptedを生成しない。'},
 'HARNESS-L9-015-F04-ci_as_release': {'counterexample': '原子CI GreenだけからRelease成立を主張。',
                                      'expected': '022の根拠が揃うまでReleaseを生成しない。'}}


def read(path):
    return json.loads((ROOT / path).read_text(encoding="utf-8"))


def git_json(rev, path):
    return json.loads(subprocess.check_output(["git", "show", f"{rev}:{path}"], cwd=ROOT))


def pointer(doc, ref, path):
    prefix = path + "#/"
    if not ref.startswith(prefix):
        raise ValueError(f"wrong pointer document: {ref}")
    value = doc
    for part in ref[len(prefix):].split("/"):
        part = part.replace("~1", "/").replace("~0", "~")
        if isinstance(value, list):
            if not part.isdigit():
                raise ValueError(f"non-numeric RFC6901 array index: {ref}")
            value = value[int(part)]
        else:
            value = value[part]
    return value


def canonical_l9_ref(l9, ref):
    prefix = L9 + "#/"
    if not ref.startswith(prefix):
        raise ValueError(f"wrong L9 pointer: {ref}")
    parts = ref[len(prefix):].split("/")
    if len(parts) > 1 and parts[0] == "cases" and not parts[1].isdigit():
        parts[1] = str(next(i for i, row in enumerate(l9["cases"]) if row.get("id") == parts[1]))
    return prefix + "/".join(parts)


def normalized_pre_slim_l8(doc):
    """Remove only WR253's slim index and deleted expanded rows before old structural comparisons."""
    doc = json.loads(json.dumps(doc))
    doc.pop("unit_cases", None)
    doc.pop("removed_materials", None)
    for key in ("approved_object_hashes", "scope_preservation", "legacy_comparison", "expected_data_boundary", "completion", "approved_requirements", "acceptance_trace_evidence", "reverse_trace", "approved_system_oracles", "trace", "upstream_pair_snapshot", "verification_scope", "f03_head_connection_oracles"):
        doc.pop(key, None)
    boundary = doc.get("authority_boundary", {})
    for key in ("reviewed_content_head", "decision_record_sha256", "main_ancestor_check", "approved_wholes_source_revision"):
        boundary.pop(key, None)
    for case in doc.get("cases", []):
        case.pop("unit_case_rows", None)
        case.pop("unit_case_contract", None)
    return doc


def normalized_pre_slim_l5(doc):
    """Hide only the documented WR253 historical L8 pointer repair for predecessor comparisons."""
    doc = json.loads(json.dumps(doc))
    def visit(value):
        if isinstance(value, dict):
            value.pop("l8_oracle_removed_snapshot", None)
            if value.get("oracle_location") == f"{BASE}:{L8}#/f03_head_connection_oracles":
                value["oracle_location"] = f"{L8}#/f03_head_connection_oracles"
            for child in value.values():
                visit(child)
        elif isinstance(value, list):
            for child in value:
                visit(child)
    visit(doc)
    return doc


def run_checks():
    current, historical, l9 = read(L8), git_json(BASE, L8), read(L9)
    old_by_id = {row["id"]: row for row in historical["unit_cases"]}
    current_cases = {row["id"]: row for row in current["cases"]}
    old_cases = {row["id"]: row for row in historical["cases"]}
    checks = {}
    checks["historical_35_U_IDs_resolve_to_current_table"] = len(old_by_id) == 35 and sum(len(row.get("unit_case_rows", [])) for row in current["cases"]) == 35
    all_ids = []
    checks["current_rows_are_compact_and_complete"] = True
    checks["all_row_sources_resolve"] = True
    checks["all_35_old_source_and_expected_materials_match"] = True
    checks["all_35_concise_meanings_are_rowwise_audited"] = True
    checks["all_candidate_design_values_unchanged"] = True
    checks["source_pins_and_execution_boundary_preserved"] = current.get("source_pins") == historical.get("source_pins") and all(current.get("authority_boundary", {}).get(k) == historical.get("authority_boundary", {}).get(k) for k in ("delegated_decision_ref", "delegated_authoring_scope", "implementation_authorization", "actual_runtime_ci_qualification"))
    checks["all_shared_targets_and_oracles_match"] = True
    for cid, now in current_cases.items():
        old = old_cases[cid]
        ids = old["unit_case_ids"]
        rows = now.get("unit_case_rows", [])
        contract = now.get("unit_case_contract", {})
        old_rows = {row["id"]: row for row in historical["unit_cases"] if row["root_id"] == old["root_id"]}
        oracle_ids = {old_rows[uid]["system_oracle_ref"] for uid in ids}
        checks["all_shared_targets_and_oracles_match"] &= len(oracle_ids) == 1
        expected_contract_oracle = next(iter(oracle_ids)) if oracle_ids else None
        checks["current_rows_are_compact_and_complete"] &= [r.get("id") for r in rows] == ids
        checks["current_rows_are_compact_and_complete"] &= all(
            set(r) == {"id", "source_trace_ref", "expected_source_ref", "counterexample", "expected"}
            and isinstance(r.get("counterexample"), str) and bool(r["counterexample"])
            and isinstance(r.get("expected"), str) and bool(r["expected"])
            and COMPACT_MEANING_AUDIT.get(r["id"]) == {"counterexample": r["counterexample"], "expected": r["expected"]}
            for r in rows
        )
        checks["all_shared_targets_and_oracles_match"] &= contract == {
            "target_ref": old.get("l5_contract_ref"),
            "contract_oracle_id": expected_contract_oracle,
            "execution_state": "not_executed",
            "row_oracle_id": None,
            "row_oracle_status": "missing_not_created",
            "test_citation": None,
            "test_citation_status": "not_found_not_created",
        }
        checks["all_candidate_design_values_unchanged"] &= now.get("candidate_unit_design") == old.get("candidate_unit_design")
        all_ids.extend(r["id"] for r in rows)
        for row in rows:
            try:
                parts = row["source_trace_ref"].split("#/", 1)[1].split("/")
                if len(parts) < 4 or parts[0] != "cases" or not parts[1].isdigit():
                    raise ValueError("source_trace_ref must use numeric RFC6901 case index")
                resolved = pointer(l9, row["source_trace_ref"], L9)
                expected_parts = row["expected_source_ref"].split("#/", 1)[1].split("/")
                if len(expected_parts) < 3 or expected_parts[0] != "cases" or not expected_parts[1].isdigit():
                    raise ValueError("expected_source_ref must use numeric RFC6901 case index")
                pointer(l9, row["expected_source_ref"], L9)
                if resolved.get("source_ref", {}).get("identity") != "SOURCE-" + row["id"]:
                    raise ValueError("source identity does not match U-ID")
            except Exception:
                checks["all_row_sources_resolve"] = False
        for uid in ids:
            oldrow = old_by_id[uid]
            try:
                source_ref = canonical_l9_ref(l9, oldrow["source_packet_pointer"])
                payload_ref = canonical_l9_ref(l9, oldrow["payload_source_pointer"])
                expected_ref = canonical_l9_ref(l9, oldrow["expected_material_ref"])
                source = pointer(l9, source_ref, L9)
                payload = pointer(l9, payload_ref, L9)
                expected = pointer(l9, expected_ref, L9)
                l9_case = pointer(l9, source_ref.rsplit("/", 1)[0], L9)
                summary = next(row for row in rows if row["id"] == uid)
                trace = summary["source_trace_ref"]
                expected_trace = source_ref
                expected_source_ref = summary["expected_source_ref"]
                issue = l9_case.get("expected_issue")
                issue_matches = (oldrow.get("expected_issue", {}).get("state") == "absent" and issue is None) or (oldrow.get("expected_issue", {}).get("state") == "provided" and isinstance(issue, str) and oldrow["expected_issue"].get("value") == issue)
                expected_hash = hashlib.sha256(json.dumps(expected, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode()).hexdigest()
                checks["all_35_old_source_and_expected_materials_match"] &= (
                    trace == expected_trace
                    and expected_source_ref == expected_ref
                    and source.get("source_ref") == oldrow["source_packet_ref"]
                    and source.get("source_ref", {}).get("identity") == "SOURCE-" + uid
                    and source.get("byte_sha256") == oldrow["source_packet_byte_sha256"]
                    and source.get("owner_material") == payload
                    and expected_hash == oldrow["expected_material_sha256"]
                    and issue_matches
                )
                audited = COMPACT_MEANING_AUDIT.get(uid)
                checks["all_35_concise_meanings_are_rowwise_audited"] &= audited == {"counterexample": summary.get("counterexample"), "expected": summary.get("expected")}
            except Exception:
                checks["all_35_old_source_and_expected_materials_match"] = False
    checks["all_35_U_IDs_unique"] = len(all_ids) == 35 and len(set(all_ids)) == 35 and set(all_ids) == set(old_by_id)
    return checks


def main():
    checks = run_checks()
    result = {"schema": "wr253-l8-uid-table-validation.v1", "evidence_kind": "scaffold", "authority_effect": "none", "checks": checks, "passed": all(checks.values()), "not_run": ["runtime", "product tests", "CI", "algorithm"]}
    print(json.dumps(result, ensure_ascii=False, indent=2))
    return 0 if result["passed"] else 1


if __name__ == "__main__":
    raise SystemExit(main())
