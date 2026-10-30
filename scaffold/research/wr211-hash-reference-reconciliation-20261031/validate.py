#!/usr/bin/env python3
"""静的に削除済み参照hashを元sourceから再構成する。実装algorithmは呼ばない。"""
from __future__ import annotations

import copy
import hashlib
import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
L8_PATH = "docs/helix-harness/L8-unit-verification/semantic-asset-lineage.json"
L5_PATH = "docs/helix-harness/L5-detail-design/semantic-asset-lineage.json"
L8_BASE = "4bee77125480c578068aa0760d2f6b33c497d53a"
L5_REVISION = "572ad5be595b2f052c72199f5edcc52c92f82dda"


def require(condition: bool, message: str) -> None:
    if not condition:
        raise ValueError(message)


def git_bytes(revision: str, path: str) -> bytes:
    return subprocess.check_output(["git", "-C", str(ROOT), "show", f"{revision}:{path}"])


def json_bytes(data: bytes, label: str):
    try:
        return json.loads(data)
    except (UnicodeDecodeError, json.JSONDecodeError) as exc:
        raise ValueError(f"{label}: JSONを読めません: {exc}") from exc


def pointer(root, pointer: str):
    require(pointer.startswith("/"), f"RFC6901 pointerではありません: {pointer}")
    value = root
    for token in pointer[1:].split("/"):
        token = token.replace("~1", "/").replace("~0", "~")
        value = value[int(token)] if isinstance(value, list) else value[token]
    return value


def remove_exact(obj, key: str, label: str) -> None:
    require(isinstance(obj, dict) and key in obj, f"{label}: 許可した削除対象がありません")
    del obj[key]


def canonical_sha256(value) -> str:
    encoded = json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode("utf-8")
    return hashlib.sha256(encoded).hexdigest()


def main() -> int:
    current = json_bytes((ROOT / L8_PATH).read_bytes(), L8_PATH)
    baseline = json_bytes(git_bytes(L8_BASE, L8_PATH), f"{L8_BASE}:{L8_PATH}")
    l5 = json_bytes(git_bytes(L5_REVISION, L5_PATH), f"{L5_REVISION}:{L5_PATH}")
    audit = current["candidate_case_supplements"]["hash_reference_reconciliation"]
    require(audit["revision"] == L8_BASE, "L8 baseline revisionがaudit記録と異なります")

    old_cases = {case["id"]: case for case in baseline["additional_unit_cases"]}
    new_cases = {case["id"]: case for case in current["additional_unit_cases"]}

    # 3 body hashは固定L8履歴値をsource Refとraw fixture bytesで再構成する。
    body_ids = (
        "HARNESS-L8-053-ADD-22",
        "HARNESS-L8-053-ADD-23",
        "HARNESS-L8-053-ADD-24",
    )
    for case_id in body_ids:
        old = old_cases[case_id]
        new = new_cases[case_id]
        old_address = old["source_whole_identity"]["reason_qualification_addresses"][0]
        source_ref = old_address["source_ref"]
        envelope = old["typed_input"]["non_applicability_sources"][0]
        body_hash = hashlib.sha256(envelope["content_bytes"].encode("utf-8")).hexdigest()
        require(old_address["source_body_sha256"] == source_ref["sha256"] == body_hash,
                f"{case_id}: body hashをsource Refとcontent_bytesから再構成できません")
        require("source_body_sha256" not in new["source_whole_identity"]["reason_qualification_addresses"][0],
                f"{case_id}: 重複body hashがまだ残っています")

    # 6 freeze hashは指定した3 case/3 summary pointerから中央provenance pinへ戻す。
    central_old = baseline["candidate_case_supplements"]["source_failure_freeze_provenance"]
    central_new = current["candidate_case_supplements"]["source_failure_freeze_provenance"]
    require(central_new == central_old, "中央freeze監査参照が変更されています")
    freeze_hash = central_new["sha256"]
    freeze_ids = (
        "HARNESS-L8-053-ADD-25",
        "HARNESS-L8-053-ADD-26",
        "HARNESS-L8-053-ADD-27",
    )
    for case_id in freeze_ids:
        old = old_cases[case_id]
        new = new_cases[case_id]
        require(old["source_whole_identity"]["source_freeze_sha256"] == freeze_hash,
                f"{case_id}: historical case freeze hashが中央参照と不一致")
        require("source_freeze_sha256" not in new["source_whole_identity"],
                f"{case_id}: 重複case freeze hashが残っています")
    old_summaries = baseline["candidate_case_supplements"]["case_mapping_and_complete_values"]
    new_summaries = current["candidate_case_supplements"]["case_mapping_and_complete_values"]
    require(len(old_summaries) == len(new_summaries) == 6, "case summary数が変わっています")
    for index in (3, 4, 5):
        require(old_summaries[index]["source_freeze_sha256"] == freeze_hash,
                f"summary {index}: historical freeze hashが中央参照と不一致")
        require("source_freeze_sha256" not in new_summaries[index],
                f"summary {index}: 重複freeze hashが残っています")

    # 4 rule hashは固定候補file bytesとpointerを使って再計算する。
    old_binding = baseline["candidate_l5_binding"]
    new_binding = current["candidate_l5_binding"]
    require(new_binding["revision"] == L5_REVISION, "L5 candidate revision pinが異なります")
    require(hashlib.sha256(git_bytes(L5_REVISION, L5_PATH)).hexdigest() == new_binding["sha256"],
            "L5 candidate whole-file SHA-256がrevision bytesと不一致")
    old_rules = old_binding["rule_bindings"]
    new_rules = new_binding["rule_bindings"]
    require(len(old_rules) == len(new_rules) == 4, "L5 rule binding数が変わっています")
    for old, new in zip(old_rules, new_rules, strict=True):
        require(old["pointer"] == new["pointer"] and old["rule_id"] == new["rule_id"],
                "L5 rule pointer/IDが変更されています")
        rule = pointer(l5, old["pointer"])
        require(rule["id"] == old["rule_id"], f"{old['pointer']}: rule ID不一致")
        require(canonical_sha256(rule) == old["value_canonical_sha256"],
                f"{old['pointer']}: historical canonical value hashを再構成できません")
        require("value_canonical_sha256" not in new, f"{old['pointer']}: duplicate value hashが残っています")

    # baseline/current全体を比較し、許可された13 pointerと2 metadata追補だけを除外する。
    old_all = copy.deepcopy(baseline)
    new_all = copy.deepcopy(current)
    old_case_index = {case["id"]: case for case in old_all["additional_unit_cases"]}
    new_case_index = {case["id"]: case for case in new_all["additional_unit_cases"]}
    for case_id in body_ids:
        remove_exact(
            old_case_index[case_id]["source_whole_identity"]["reason_qualification_addresses"][0],
            "source_body_sha256",
            f"{case_id}/source_body_sha256",
        )
    for case_id in freeze_ids:
        remove_exact(old_case_index[case_id]["source_whole_identity"], "source_freeze_sha256", f"{case_id}/source_freeze_sha256")
    for index in (3, 4, 5):
        remove_exact(old_all["candidate_case_supplements"]["case_mapping_and_complete_values"][index],
                     "source_freeze_sha256", f"case_mapping_and_complete_values/{index}/source_freeze_sha256")
    for index in range(4):
        remove_exact(old_all["candidate_l5_binding"]["rule_bindings"][index],
                     "value_canonical_sha256", f"candidate_l5_binding/rule_bindings/{index}/value_canonical_sha256")
    remove_exact(new_all["candidate_l5_binding"], "revision", "candidate_l5_binding/revision")
    remove_exact(new_all["candidate_case_supplements"], "hash_reference_reconciliation",
                 "candidate_case_supplements/hash_reference_reconciliation")
    require(old_all == new_all, "許可した13 pointer削除・2 metadata追補以外にL8 JSON差分があります")

    qualification_hashes = []
    def visit(value):
        if isinstance(value, dict):
            if "subject_sha256" in value:
                qualification_hashes.append(value["subject_sha256"])
            for child in value.values():
                visit(child)
        elif isinstance(value, list):
            for child in value:
                visit(child)

    old_qualification_hashes = []
    def visit_old(value):
        if isinstance(value, dict):
            if "subject_sha256" in value:
                old_qualification_hashes.append(value["subject_sha256"])
            for child in value.values():
                visit_old(child)
        elif isinstance(value, list):
            for child in value:
                visit_old(child)

    visit(current)
    visit_old(baseline)
    require(old_qualification_hashes == qualification_hashes, "Qualification subject_sha256 typed valuesが変化しています")
    require(len(qualification_hashes) == 30, "Qualification typed hashが30件ではありません")

    print("PASS: 3 source-body hashes reconstructed from historical fields, source refs, and fixture bytes")
    print("PASS: 6 freeze hashes reconstructed from historical pointers and the retained central path/hash")
    print("PASS: 4 canonical rule hashes reconstructed from pinned L5 revision and JSON pointers")
    print("PASS: whole L8 JSON differs only at the 13 authorized pointers and 2 audit metadata additions")
    print("PASS: typed inputs/oracles unchanged; 30 Qualification subject hashes retained")
    print("LIMIT: central freeze payload is a local-only file, not a distributable Git source")
    print("LIMIT: this audit does not establish missing raw-source availability, output/owner values, or 4-way status")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except (KeyError, IndexError, TypeError, ValueError, subprocess.CalledProcessError) as exc:
        print(f"FAIL: {exc}", file=sys.stderr)
        raise SystemExit(1)
