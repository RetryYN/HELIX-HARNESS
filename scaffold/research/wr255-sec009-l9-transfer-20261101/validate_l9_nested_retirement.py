#!/usr/bin/env python3
"""SEC009 L9 nested-case retirement verification (read-only unless --record)."""
from __future__ import annotations

import argparse
import hashlib
import json
import subprocess
import sys
from collections import Counter
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[3]
HERE = Path(__file__).resolve().parent
L3B = "docs/helix-security/L3-requirements/business-requirements.json"
L3F = "docs/helix-security/L3-requirements/functional-requirements.json"
L4 = "docs/helix-security/L4-basic-design/revoke-quarantine-propagation.json"
L8 = "docs/helix-security/L8-unit-verification/revoke-quarantine-propagation.json"
L9 = "docs/helix-security/L9-integration-verification/revoke-quarantine-propagation.json"
L10B = "docs/helix-security/L10-verification/business-verification.json"
L10F = "docs/helix-security/L10-verification/functional-verification.json"
PRE_REMOVAL_REV = "22076e0c0f5aa3fe7b8933dfa556565900623487"
PRE_REMOVAL_L9_SHA256 = "8296d811f95f94d9391a15a597839ee7f9d47b32dd7c7b780312821fc1c52a19"
PREVIOUS_AUDIT = HERE / "l9-pointer-transfer-audit-8296d811f95f94d9.json"
HISTORY_L4_REV = "c50eb21b34f034262ced3f8052d2502fb84c57c9"
HISTORY_L4_SHA256 = "d46e39cad2e2a90cfc532fa57226a4d650336e794a375f07e1cc2e6cbba15eb3"
L4_SHA256 = "00376c402930e1287e9e0e896804b1de8a20390f8abbea8377b70712f868b9da"
R1_ASSIGNMENTS = {
    "SEC009-COMPOUND-OS-UNKNOWN-CREDENTIAL-UNAPPLIED-WORKER-CONTINUES": (
        "/cases/1/negative_cases/205",
        "SEC009_F01_RECIPIENT_COMPOSITE_FINDINGS",
        [
            "/cases/1/negative_cases/205/expected_proposal/recipient_correspondence",
            "/cases/1/negative_cases/205/expected_proposal/findings",
        ],
    ),
    "SEC009-RECOVERY-PRIOR-SOURCE-MISSING": (
        "/cases/2/negative_cases/40",
        "SEC009_F02_ISOLATION_RECOVERY_BINDING_UNRESOLVED",
        [
            "/cases/2/negative_cases/40/expected_proposal/isolation_correspondence",
            "/cases/2/negative_cases/40/expected_proposal/recovery_correspondence",
            "/cases/2/negative_cases/40/expected_proposal/findings",
        ],
    ),
}


def fail(message: str) -> None:
    raise ValueError(message)


def sha(raw: bytes) -> str:
    return hashlib.sha256(raw).hexdigest()


def canon(value: Any) -> str:
    raw = json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode()
    return sha(raw)


def git_blob(revision: str, path: str) -> bytes:
    return subprocess.check_output(["git", "-C", str(ROOT), "show", f"{revision}:{path}"])


def load(path: str) -> Any:
    return json.loads((ROOT / path).read_text(encoding="utf-8"))


def resolve(root: Any, pointer: str) -> Any:
    if pointer == "":
        return root
    if not pointer.startswith("/"):
        fail(f"不正なJSON Pointer: {pointer}")
    value = root
    for raw in pointer[1:].split("/"):
        token = raw.replace("~1", "/").replace("~0", "~")
        value = value[int(token)] if isinstance(value, list) else value[token]
    return value


def source_pin(l9: dict[str, Any], path: str) -> tuple[str, str]:
    matches = [item for item in l9["source_pins"] if item["path"] == path]
    if len(matches) != 1:
        fail(f"L9 source_pinsに一意の参照がない: {path}")
    return matches[0]["revision"], matches[0]["sha256"]


def pinned_source(l9: dict[str, Any], path: str) -> dict[str, Any]:
    revision, expected_sha = source_pin(l9, path)
    raw = git_blob(revision, path)
    if sha(raw) != expected_sha:
        fail(f"固定source pin SHA不一致: {path}@{revision}")
    if (ROOT / path).read_bytes() != raw:
        fail(f"現行上流sourceがL9 fixed pinと異なる: {path}")
    return json.loads(raw)


def lookup_by_id(rows: list[dict[str, Any]], key: str, label: str) -> dict[str, dict[str, Any]]:
    result: dict[str, dict[str, Any]] = {}
    for row in rows:
        item_id = row.get(key)
        if not isinstance(item_id, str) or item_id in result:
            fail(f"{label} ID欠落または重複: {item_id}")
        result[item_id] = row
    return result


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--record", action="store_true", help="一意のhash名で監査JSONを新規作成")
    args = parser.parse_args()

    prior_bytes = git_blob(PRE_REMOVAL_REV, L9)
    if sha(prior_bytes) != PRE_REMOVAL_L9_SHA256:
        fail("nested撤去前のL9固定blob SHA不一致")
    prior = json.loads(prior_bytes)
    current = load(L9)
    l4_bytes = (ROOT / L4).read_bytes()
    if sha(l4_bytes) != L4_SHA256:
        fail("L4 current canonical SHA不一致")
    l4 = json.loads(l4_bytes)
    history_l4_bytes = git_blob(HISTORY_L4_REV, L4)
    if sha(history_l4_bytes) != HISTORY_L4_SHA256:
        fail("L4 R2 fixed history SHA不一致")
    history_l4 = json.loads(history_l4_bytes)

    # Reuse the immutable prior measurement for the 30 aliases and the three
    # fixed R2 history targets; this validator does not duplicate that evidence.
    previous_audit = json.loads(PREVIOUS_AUDIT.read_text(encoding="utf-8"))
    alias_proof = previous_audit["current_alias_proof"]
    if alias_proof.get("class_count") != 30 or alias_proof.get("all_types_and_values_equal") is not True or alias_proof.get("expected_text_reconstruction_count") != 30:
        fail("旧監査の30 taxonomy alias型・値照合が成立していない")
    if previous_audit["fixed_history"].get("revision") != HISTORY_L4_REV or previous_audit["fixed_history"].get("L4_sha256") != HISTORY_L4_SHA256 or previous_audit["fixed_history"].get("all_targets_equal_current_nested_values") is not True:
        fail("旧監査のR2履歴対象pointer照合が成立していない")
    if len(alias_proof.get("classes", [])) != 30 or any(
        not all(item.get("type_equal") is True and item.get("value_equal") is True for item in row["field_aliases"].values())
        or row.get("expected_text_reconstruction", {}).get("value_equal") is not True
        for row in alias_proof["classes"]
    ):
        fail("旧監査の個別alias型・値proofに不一致がある")

    prior_groups = lookup_by_id(prior["cases"], "id", "撤去前L9 contract group")
    current_groups = lookup_by_id(current["cases"], "id", "現行L9 contract group")
    if set(prior_groups) != set(current_groups):
        fail("L9 case group IDが撤去前後で不一致")
    removed_fields = {"negative_cases", "positive_cases", "source_case_refs"}
    if len(prior_groups) != 3:
        fail("L9 single-contract group数が3でない")

    old_case_rows: dict[str, tuple[str, str, dict[str, Any]]] = {}
    given_values: set[str] = set()
    when_values: set[str] = set()
    group_counts: dict[str, Counter[str]] = {}
    for group_id, old_group in prior_groups.items():
        new_group = current_groups[group_id]
        if any(field in new_group for field in removed_fields):
            fail(f"撤去対象sectionが残存: {group_id}")
        if {k: v for k, v in old_group.items() if k not in removed_fields} != new_group:
            fail(f"L9 groupの保持fieldが不一致: {group_id}")
        counts: Counter[str] = Counter()
        for key, state in (("positive_cases", "positive"), ("negative_cases", "negative")):
            for nested in old_group[key]:
                case_id = nested["id"]
                if case_id in old_case_rows:
                    fail(f"nested source ID重複: {case_id}")
                if nested.get("execution_state") != "not_executed" or nested.get("actual_observation") != "not_observed":
                    fail(f"未観測caseの状態表記が想定外: {case_id}")
                given_values.add(canon(nested.get("given")))
                when_values.add(canon(nested.get("when")))
                old_case_rows[case_id] = (group_id, state, nested)
                counts[state] += 1
        group_counts[group_id] = counts
        if len(old_group["source_case_refs"]) != sum(counts.values()):
            fail(f"source_case_refsとnested rowsの件数不一致: {group_id}")

    if len(old_case_rows) != 285 or len(given_values) != 1 or len(when_values) != 1:
        fail("撤去前285件のcase/given/when共通性が不一致")
    if sum(c["positive"] for c in group_counts.values()) != 8 or sum(c["negative"] for c in group_counts.values()) != 277:
        fail("撤去前のpositive/negative構成が8/277でない")

    prior_rows = lookup_by_id(prior["integration_cases"], "id", "撤去前integration_case")
    current_rows = lookup_by_id(current["integration_cases"], "id", "現行integration_case")
    if set(prior_rows) != set(current_rows) or set(prior_rows) != set(old_case_rows):
        fail("nested source roster・integration_cases間の285 ID bijection不成立")
    contracts = lookup_by_id(l4["contracts"], "id", "L4 contract")
    classes = lookup_by_id(l4["failure_classifications"], "class_id", "L4 canonical class")
    contract_index = {row["id"]: i for i, row in enumerate(l4["contracts"])}
    class_index = {row["class_id"]: i for i, row in enumerate(l4["failure_classifications"])}
    l3_business = pinned_source(prior, L3B)
    l3_functional = pinned_source(prior, L3F)
    l10_business = pinned_source(prior, L10B)
    l10_functional = pinned_source(prior, L10F)
    l3_rows = lookup_by_id(l3_business["requirements"] + l3_functional["requirements"], "id", "L3 requirement")
    l10_rows = lookup_by_id(l10_business["cases"] + l10_functional["cases"], "id", "L10 system oracle")

    l9_self_refs_before = 0
    l4_class_refs_retained = 0
    positive_sources = 0
    for case_id, old_row in prior_rows.items():
        new_row = current_rows[case_id]
        old_self = [pointer for pointer in old_row.get("source_pointers", []) if pointer.get("path") == L9]
        if len(old_self) != 1 or resolve(prior, old_self[0]["pointer"]).get("id") != case_id:
            fail(f"撤去前integration rowのL9自己pointerが一意にcase IDへ解決しない: {case_id}")
        l9_self_refs_before += 1
        if {k: v for k, v in old_row.items() if k != "source_pointers"} != {k: v for k, v in new_row.items() if k != "source_pointers"}:
            fail(f"integration rowのcondition/expectation等が変更された: {case_id}")
        old_group_id, old_state, _ = old_case_rows[case_id]
        contract_id = old_row["contract_ref"]
        if contract_id not in contracts or list(prior_groups).index(old_group_id) != contract_index[contract_id]:
            fail(f"integration rowのcontract/group参照不一致: {case_id}")
        contract = contracts[contract_id]
        group = current_groups[old_group_id]
        requirement_id = group["requirement_ref"]
        oracle_id = group["system_oracle_ref"]
        if contract["requirement_ref"] != requirement_id or contract["system_oracle_ref"] != oracle_id:
            fail(f"L4 contractからgroup requirement/oracleへの参照不一致: {case_id}")
        requirement = l3_rows.get(requirement_id)
        oracle = l10_rows.get(oracle_id)
        if not requirement or requirement.get("oracle_ref") != oracle_id or not oracle or oracle.get("requirement_ref") != requirement_id:
            fail(f"L3/L10 oracle chain不成立: {case_id}")
        if new_row["population_state"] != old_state:
            fail(f"population_stateがnested sourceと不一致: {case_id}")
        if new_row.get("oracle_id") is not None or new_row.get("test_citation") is not None:
            fail(f"未観測caseに個別oracle/test citationが設定された: {case_id}")
        pointers = new_row.get("source_pointers")
        if not isinstance(pointers, list) or any(p.get("path") == L9 for p in pointers):
            fail(f"integration_casesのself pointerが残る: {case_id}")
        if old_state == "positive":
            expected = [{"path": L4, "pointer": f"/contracts/{contract_index[contract_id]}"}]
            if pointers != expected:
                fail(f"positive caseのL4 contract source pointer不一致: {case_id}")
            if new_row.get("condition", {}).get("premise_status") != "case_marker_only_not_observed":
                fail(f"positive conditionが設計markerとして明示されていない: {case_id}")
            resolve(l4, expected[0]["pointer"])
            positive_sources += 1
        else:
            class_id = new_row.get("negative_class_ref")
            if class_id not in classes:
                fail(f"negative caseのL4 class参照なし: {case_id}")
            expected = [{"path": L4, "pointer": f"/failure_classifications/{class_index[class_id]}"}]
            if pointers != expected:
                fail(f"negative caseのL4 canonical class source pointer不一致: {case_id}")
            class_row = classes[class_id]
            if class_row.get("design_ref") != contract_id:
                fail(f"negative caseのL4 class owner/contract不一致: {case_id}")
            resolve(l4, expected[0]["pointer"])
            l4_class_refs_retained += 1

    if positive_sources != 8 or l4_class_refs_retained != 277:
        fail("positive/negative source pointerの内訳が8/277でない")
    if l9_self_refs_before != 285:
        fail("撤去前integration rowのL9自己pointer数が285でない")
    if current["multi_contract_residual"] != prior["multi_contract_residual"] or len(current["multi_contract_residual"]["source_case_refs"]) != 71:
        fail("71件のmulti_contract_residualが撤去前と一致しない")

    # Current L8 consumers point to the retained three group envelopes, not removed children.
    l8 = load(L8)
    group_refs = []
    for row in l8.get("cases", []):
        value = row.get("l9_case_pointer")
        if isinstance(value, str) and value.startswith(L9 + "#"):
            pointer = value.split("#", 1)[1]
            target = resolve(current, pointer)
            expected_group_id = row.get("id", "").replace("HELIXSECURITY-L8-", "HELIXSECURITY-L9-", 1)
            if target.get("id") != expected_group_id:
                fail(f"L8 l9_case_pointerのgroup ID不一致: {value}")
            if target.get("requirement_ref") != row.get("requirement_ref") or target.get("system_oracle_ref") != row.get("system_oracle_ref"):
                fail(f"L8からL9 groupのrequirement/oracle参照が一致しない: {value}")
            if any(field in target for field in removed_fields):
                fail(f"L8が撤去対象sectionを要求している: {value}")
            group_refs.append(pointer)
    if len(group_refs) != 3 or len(set(group_refs)) != 3:
        fail("L8からの3 group envelope参照を解決できない")
    unit_refs = [row.get("integration_case_ref") for row in l8.get("unit_cases", [])]
    if len(unit_refs) != 285 or len(set(unit_refs)) != 285 or set(unit_refs) != set(current_rows):
        fail("L8 unit_casesの285 integration_case_refがcurrent L9 rosterと一致しない")

    # R1 assignment pointers remain only as history; current targets are explicit integration rows.
    audit = current["negative_class_assignment_audit_r2_addendum"]
    if audit.get("prior_case_pointer_revision") != PRE_REMOVAL_REV:
        fail("R1 nested assignment pointerのhistory pin不一致")
    maps = {row["case_id"]: row for row in audit.get("current_mapping", [])}
    if set(maps) != set(R1_ASSIGNMENTS):
        fail("R1 assignment pointerのcurrent mapが2件でない")
    for case_id, (old_pointer, class_id, source_pointers) in R1_ASSIGNMENTS.items():
        mapping = maps[case_id]
        if mapping.get("prior_case_pointer") != old_pointer or mapping.get("class_id") != class_id:
            fail(f"R1 assignment history mapping不一致: {case_id}")
        prior_target = resolve(prior, old_pointer)
        current_target = resolve(current, mapping["current_case_pointer"])
        if prior_target.get("id") != case_id or current_target.get("id") != case_id or current_target.get("negative_class_ref") != class_id:
            fail(f"R1 assignment history/current target不一致: {case_id}")
        expected_history = {
            "negative_class_assignment_audit": {"case_pointer": old_pointer, "source_pointers": source_pointers},
            "negative_class_assignment_audit_r1_addendum": {"case_pointer": old_pointer},
        }
        if mapping.get("historical_audit_pointers") != expected_history:
            fail(f"R2/R1 prior audit pointerが固定history mappingにない: {case_id}")
        for pointer in source_pointers:
            resolve(prior, pointer)

    # The 30 fixed taxonomy refs still use the canonical current aliases; the three R2 refs stay historic.
    taxonomy = current["negative_class_assignment_audit"]["fixed_taxonomy_source_pointers"]
    if len(taxonomy) != 30:
        fail("canonical taxonomy source pointer数が30でない")
    for row in taxonomy:
        ref = row["L4"]
        if ref["path"] != L4:
            fail(f"taxonomy pointerが現行L4 path以外: {row['code']}")
        target = resolve(l4, ref["pointer"])
        if target.get("class_id") != row["code"]:
            fail(f"taxonomy canonical alias class ID不一致: {row['code']}")
    historic = []
    for row in current["negative_class_assignment_audit"]["unassigned_single_contract_negative_cases"]:
        for ref in row.get("source_pointers", []):
            if ref.get("path") == L4 and "/contracts/" in ref.get("pointer", "") and "negative_classifications" in ref.get("pointer", ""):
                target = resolve(history_l4, ref["pointer"])
                if resolve(l4, ref["pointer"]) != target:
                    fail("R2 historical nested L4 targetのcurrent resolutionが変化")
                historic.append(ref["pointer"])
    if len(historic) != 3:
        fail(f"R2固定履歴pointer件数が3でない: {len(historic)}")

    current_bytes = (ROOT / L9).read_bytes()
    report = {
        "evidence_kind": "scaffold",
        "validator": "validate_l9_nested_retirement.py",
        "pre_removal_revision": PRE_REMOVAL_REV,
        "pre_removal_l9_sha256": PRE_REMOVAL_L9_SHA256,
        "current_l9_sha256": sha(current_bytes),
        "current_l4_sha256": sha(l4_bytes),
        "result": "PASS",
        "retired_sections": ["cases[].negative_cases", "cases[].positive_cases", "cases[].source_case_refs"],
        "case_roster": {"retained_integration_cases": len(current_rows), "positive": positive_sources, "negative": l4_class_refs_retained, "retired_nested_case_rows": len(old_case_rows)},
        "given_when": {"pre_removal_unique_given_values": len(given_values), "pre_removal_unique_when_values": len(when_values), "row_specific_condition_and_expectation_unchanged": True},
        "system_oracle": {"L3_L10_chain_resolved": True, "L10_oracle_rows": 3, "individual_oracle_and_test_citation": "null; 未観測"},
        "current_consumers": {"pre_removal_L9_integration_self_pointers": l9_self_refs_before, "L8_group_envelopes_resolved": len(group_refs), "L8_unit_case_refs": len(unit_refs), "current_L9_integration_self_pointers": 0, "L4_taxonomy_aliases": 30, "fixed_R2_history_refs": 3},
        "R1_assignment_history_mappings": len(maps),
        "multi_contract_residual_count": len(current["multi_contract_residual"]["source_case_refs"]),
        "bytes": {"before": len(prior_bytes), "after": len(current_bytes), "reduction": len(prior_bytes) - len(current_bytes)},
    }
    if args.record:
        out = HERE / f"l9-nested-retirement-audit-{report['current_l9_sha256'][:16]}.json"
        raw = (json.dumps(report, ensure_ascii=False, indent=2) + "\n").encode()
        with out.open("xb") as stream:
            stream.write(raw)
        print(f"監査を新規記録: {out.relative_to(ROOT)}")
    else:
        print(json.dumps(report, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except (KeyError, IndexError, TypeError, ValueError, subprocess.CalledProcessError) as error:
        print(f"FAIL: {error}", file=sys.stderr)
        raise SystemExit(1)
