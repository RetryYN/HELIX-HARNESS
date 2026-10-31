#!/usr/bin/env python3
"""WR265 L8 U-ID table static validator; read-only unless --record PATH is explicit."""
from __future__ import annotations
import argparse
import hashlib
import json
import os
from pathlib import Path
import re
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[3]
BASE = "b3ddf6f1d0a6cf2009e5f81a90f21c4292300185"
L8 = "docs/helix-connect/L8-unit-verification/retry-deduplication-conflict.json"
L5 = "docs/helix-connect/L5-detail-design/retry-deduplication-conflict.json"
L9 = "docs/helix-connect/L9-integration-verification/retry-deduplication-conflict.json"
L4 = "docs/helix-connect/L4-basic-design/retry-deduplication-conflict.json"
L3 = "docs/helix-connect/L3-requirements/functional-requirements.json"
L10 = "docs/helix-connect/L10-verification/functional-verification.json"
HISTORY = "scaffold/research/wr265-connect-retry-l8-slim-20261101/evidence-history.json"
SUMMARY_ROOT = "scaffold/research/wr265-connect-retry-l8-slim-20261101/"
EXPECTED_HISTORY_ARCHIVES = {
    "history-before-r5": {"commit":"869675e43871daa3034eeaacc78a157eb234cc01", "path":HISTORY, "blob":"b37fe920b1b63252808448d66b24a8beba3a3389", "sha256":"405fa952b942527a3d8c106cc2e9c05dc48213433fc4bceda1388e971f94b081", "bytes":27367, "kind":"history_json", "restore_command":f"git show 869675e43871daa3034eeaacc78a157eb234cc01:{HISTORY} > /tmp/wr265-history-before-r5.json"},
    "history-through-r6": {"commit":"ef3b6adef8dc60b9ba67380a8e00891694f4633e", "path":HISTORY, "blob":"dbc65e36ccfdc26495676e2f207e719b8f8aa761", "sha256":"aea11fed54702d2852144ef5ffbe4bb8da19c8276976e67ea15e76567c8a14fa", "bytes":40499, "kind":"history_json", "restore_command":f"git show ef3b6adef8dc60b9ba67380a8e00891694f4633e:{HISTORY} > /tmp/wr265-history-through-r6.json"},
    "summary-r0": {"commit":"8e3ea7474ead919b2f86dfc2c2b14c1b875ca707", "path":SUMMARY_ROOT+"verification-summary.json", "blob":"bb44e994788e0033994382686d4e623d71a92e5f", "sha256":"7ce0c0145a5c383a7bc02f627680412df86f9275df96c3c9b1b2396b76498a94", "bytes":1991, "kind":"summary_json", "restore_command":f"git show 8e3ea7474ead919b2f86dfc2c2b14c1b875ca707:{SUMMARY_ROOT}verification-summary.json > /tmp/wr265-summary-initial.json"},
    "summary-r5": {"commit":"869675e43871daa3034eeaacc78a157eb234cc01", "path":SUMMARY_ROOT+"verification-summary-main-overlay-r5.json", "blob":"42d5b1031c3f2d4af034a683da8cd9c445b0335a", "sha256":"2331b3458c129633371ff8dd73fb98d3c4abb08602911e0c5087b999058393b4", "bytes":4959, "kind":"summary_json", "restore_command":f"git show 869675e43871daa3034eeaacc78a157eb234cc01:{SUMMARY_ROOT}verification-summary-main-overlay-r5.json > /tmp/wr265-summary-r5.json"},
    "summary-r7": {"commit":"ef3b6adef8dc60b9ba67380a8e00891694f4633e", "path":SUMMARY_ROOT+"verification-summary-main-overlay-r7.json", "blob":"737893b37638b3906551c05acd82537020c49264", "sha256":"fa9e39b20b6a93fd295a84c61d8a341f8239d8061da84ee090e004cbd588637b", "bytes":4959, "kind":"summary_json", "restore_command":f"git show ef3b6adef8dc60b9ba67380a8e00891694f4633e:{SUMMARY_ROOT}verification-summary-main-overlay-r7.json > /tmp/wr265-summary-r7.json"},
}


def load(path):
    return json.loads((ROOT / path).read_text(encoding="utf-8"))


def resolve_pointer(document, pointer):
    value = document
    for token in pointer.lstrip("/").split("/"):
        token = token.replace("~1", "/").replace("~0", "~")
        value = value[token]
    return value


def validate_history_archives(history):
    errors = []
    archive_sources = {item.get("id"): item for item in history.get("archive_sources", [])}
    if set(archive_sources) != set(EXPECTED_HISTORY_ARCHIVES):
        errors.append("history archive source IDs do not match the fixed historical commits")
    for archive_id, expected in EXPECTED_HISTORY_ARCHIVES.items():
        source = archive_sources.get(archive_id)
        if source is None:
            continue
        for field, expected_value in expected.items():
            if source.get(field) != expected_value:
                errors.append(f"{archive_id}: {field} differs from fixed historical source metadata")
        try:
            archived_bytes = subprocess.check_output(["git", "show", f"{expected['commit']}:{expected['path']}"], cwd=ROOT)
            archived_blob = subprocess.check_output(["git", "rev-parse", f"{expected['commit']}:{expected['path']}"], cwd=ROOT, text=True).strip()
        except subprocess.CalledProcessError:
            errors.append(f"{archive_id}: historical Git object cannot be read")
            continue
        if archived_blob != expected["blob"] or hashlib.sha256(archived_bytes).hexdigest() != expected["sha256"] or len(archived_bytes) != expected["bytes"]:
            errors.append(f"{archive_id}: historical Git object blob/SHA-256/byte length differs")

    records = history.get("archived_summaries", [])
    expected_records = {
        "summary-r0-initial": ("WR265-RETRY-L8-CURRENT-STATIC-R1", "summary-r0", None, "7ce0c0145a5c383a7bc02f627680412df86f9275df96c3c9b1b2396b76498a94", 1991),
        "summary-r1-overlay": ("WR265-RETRY-L8-CURRENT-STATIC-R1", "history-before-r5", "/superseded_overlay_attempt/result", "d5a13a2ac377bc11f250761e0bc9741fa6f58064dd953c0336b21a2ae678515e", 4266),
        "summary-r2-overlay": ("WR265-RETRY-L8-CURRENT-STATIC-R2", "history-before-r5", "/superseded_overlay_r2_summary/result", "aa1ddc4e307747e3e6dc0b205fdc77293835a492fd6703fbe7ef7ef042bed097", 4266),
        "summary-r3-overlay": ("WR265-RETRY-L8-CURRENT-STATIC-R3", "history-before-r5", "/superseded_overlay_r3_summary/result", "288e0e563de0c4a48179a9ad2ae9fff7f4052a4abfa44601cc1ca0e85a39b5a0", 4266),
        "summary-r4-overlay": ("WR265-RETRY-L8-CURRENT-STATIC-R4", "history-before-r5", "/superseded_overlay_r4_summary/result", "b83b58a170410290145e33b6b8599fb1dda3e75df9f5ac7501e5522b7e019261", 4550),
        "summary-r5-overlay": ("WR265-RETRY-L8-CURRENT-STATIC-R5", "summary-r5", None, "2331b3458c129633371ff8dd73fb98d3c4abb08602911e0c5087b999058393b4", 4959),
        "summary-r6-overlay": ("WR265-RETRY-L8-CURRENT-STATIC-R6", "history-through-r6", "/superseded_overlay_r6_summary/result", "212c458d6804537c849533325c1f54a3abeafdb890d89dc58df87347cf222652", 4959),
        "summary-r7-overlay": ("WR265-RETRY-L8-CURRENT-STATIC-R7", "summary-r7", None, "fa9e39b20b6a93fd295a84c61d8a341f8239d8061da84ee090e004cbd588637b", 4959),
    }
    records_by_key = {item.get("archive_key"): item for item in records}
    if set(records_by_key) != set(expected_records) or len(records_by_key) != len(records):
        errors.append("archived summary references are missing, duplicated, or unexpected")
    for archive_key, (expected_id, archive_id, pointer, expected_sha, expected_bytes) in expected_records.items():
        record = records_by_key.get(archive_key)
        if record is None:
            continue
        if record.get("record_id") != expected_id or record.get("archive_id") != archive_id or record.get("json_pointer") != pointer or record.get("sha256") != expected_sha or record.get("bytes") != expected_bytes:
            errors.append(f"{archive_key}: compact archive pointer/SHA-256/byte length differs")
            continue
        source = archive_sources.get(archive_id)
        if source is None:
            errors.append(f"{archive_key}: archive source {archive_id} is unresolved")
            continue
        try:
            source_bytes = subprocess.check_output(["git", "show", f"{source['commit']}:{source['path']}"], cwd=ROOT)
            summary_bytes = source_bytes if pointer is None else (json.dumps(resolve_pointer(json.loads(source_bytes), pointer), ensure_ascii=False, indent=2) + "\n").encode("utf-8")
            summary = json.loads(summary_bytes)
        except (subprocess.CalledProcessError, KeyError, TypeError, ValueError, json.JSONDecodeError):
            errors.append(f"{archive_key}: summary cannot be extracted from the pinned history blob/path")
            continue
        if summary.get("record_id") != expected_id or hashlib.sha256(summary_bytes).hexdigest() != expected_sha or len(summary_bytes) != expected_bytes:
            errors.append(f"{archive_key}: extracted summary record ID/SHA-256/byte length differs")
    def contains_embedded_result(value):
        if isinstance(value, dict):
            return "result" in value or any(contains_embedded_result(child) for child in value.values())
        if isinstance(value, list):
            return any(contains_embedded_result(child) for child in value)
        return False
    if contains_embedded_result(history):
        errors.append("current evidence-history must reference old summary objects, not embed result objects")
    archive_view = {
        "archive_sources":[{k:v[k] for k in ("id","kind","commit","path","blob","sha256","bytes")} for v in history.get("archive_sources", [])],
        "archived_summaries":[{k:v.get(k) for k in ("archive_key","record_id","archive_id","json_pointer","sha256","bytes")} for v in records],
    }
    return errors, archive_view


def pointer_for(case, obligation_index, case_index):
    return f"/verification_obligations/{obligation_index}/concrete_cases/{case_index}"


def changed_leaves(before, after, path=""):
    if type(before) is not type(after):
        return [path]
    if isinstance(before, dict):
        result = []
        for key in sorted(set(before) | set(after)):
            child = f"{path}/{key}"
            if key not in before or key not in after:
                result.append(child)
            else:
                result.extend(changed_leaves(before[key], after[key], child))
        return result
    if isinstance(before, list):
        result = []
        if len(before) != len(after):
            result.append(f"{path}/length")
        for index, (left, right) in enumerate(zip(before, after)):
            result.extend(changed_leaves(left, right, f"{path}/{index}"))
        return result
    return [path] if before != after else []


def raw_case(case):
    return json.loads(case["independent_source_packet"]["raw_utf8"])


FN_TO_GROUP = {"FN-C004-01": "F01", "FN-C004-02": "F02", "FN-C004-03": "F03"}


def counterexample(case, raw, baseline, function_ref, requirement_ref):
    """Describe only source input conditions; do not read the L9 oracle result."""
    fn = FN_TO_GROUP[function_ref]
    changes = changed_leaves(baseline, raw)
    changed_array_paths = [path[:-len("/length")] for path in changes if path.endswith("/length")]
    conditions = []
    for path in changes:
        if any(path.startswith(array_path + "/") and path != array_path + "/length" for array_path in changed_array_paths):
            continue
        if path.startswith("/claims/"):
            name = path.rsplit("/", 1)[1]
            if raw.get("claims", {}).get(name) is True:
                conditions.append(f"入力 claim {name} が主張されている")
            elif name in raw.get("claims", {}):
                conditions.append(f"入力 claim {name} は主張されていない")
            continue
        if path == "/original_policy/max_total_attempts":
            limit = raw.get("original_policy", {}).get("max_total_attempts", MISSING)
            cumulative = raw.get("original_cumulative_attempts", MISSING)
            if limit is MISSING or limit is None:
                conditions.append("original_policy.max_total_attempts 入力は未提示またはnull")
            elif isinstance(limit, int) and isinstance(cumulative, int) and limit <= cumulative:
                conditions.append("元policy上限は元の累積attempt数以下")
            else:
                conditions.append("元policy上限は元の累積attempt数より大きい")
            continue
        if path == "/submitted_policy/max_total_attempts":
            submitted = raw.get("submitted_policy", {}).get("max_total_attempts", MISSING)
            original = raw.get("original_policy", {}).get("max_total_attempts", MISSING)
            relation = "未提示" if submitted is MISSING else "null" if submitted is None else "original_policyと異なる" if not same_json(submitted, original) else "original_policyと同じ"
            conditions.append(f"submitted_policy.max_total_attempts は {relation}")
            continue
        if path in ("/original_cumulative_attempts", "/submitted_cumulative_attempts"):
            key = path[1:]
            value = raw.get(key, MISSING)
            if value is MISSING or value is None:
                conditions.append(f"{key} 入力は未提示またはnull")
            else:
                other_key = "submitted_cumulative_attempts" if key == "original_cumulative_attempts" else "original_cumulative_attempts"
                other = raw.get(other_key, MISSING)
                if other is MISSING or other is None:
                    relation = "比較側の累積attempt数が未提示またはnull"
                elif key == "submitted_cumulative_attempts" and type(value) is int and type(other) is int and value < other:
                    relation = "元の累積attempt数から減少しており、budget reset入力"
                elif key == "submitted_cumulative_attempts" and type(value) is int and type(other) is int and value > other:
                    relation = "元の累積attempt数より増加"
                elif same_json(value, other):
                    relation = "元の累積attempt数を維持"
                else:
                    relation = "元の累積attempt数と異なる"
                conditions.append(f"{key} は提示され、{relation}")
            continue
        if path in ("/original_effect_state", "/original_effect_observation/state", "/submitted_effect_observation/state"):
            key = path.rsplit("/", 1)[1]
            parent = raw
            for part in path.strip("/").split("/")[:-1]:
                parent = parent.get(part, {}) if isinstance(parent, dict) else {}
            value = parent.get(key, MISSING) if isinstance(parent, dict) else MISSING
            label = "元effect observation" if path.startswith("/original") else "提出effect observation"
            if value == "not_observed":
                after_retry = parent.get("after_retry", MISSING) if isinstance(parent, dict) else MISSING
                if after_retry is MISSING:
                    after_context = "after_retry欄は未提示"
                elif after_retry is None:
                    after_context = "after_retry欄はnull"
                elif isinstance(after_retry, list):
                    after_context = {0: "after_retry欄は空", 1: "after_retry欄には単一のeffect項目がある", 2: "after_retry欄には複数のeffect項目がある"}.get(min(len(after_retry), 2))
                else:
                    after_context = "after_retry欄は配列以外の値"
                meaning = f"not_observedでeffect未観測（{after_context}）"
            elif value == "observed_in_fixture_only":
                meaning = "observed_in_fixture_onlyの範囲だけ観測"
            else:
                meaning = f"入力状態は {'未提示' if value is MISSING else 'null' if value is None else value}"
            conditions.append(f"{label} stateは{meaning}")
            continue
        if path in ("/original_effect_before", "/original_effect_after", "/submitted_effect_after"):
            value = raw.get(path[1:], MISSING)
            label = path[1:]
            if value is MISSING or value is None:
                meaning = "null/未提示"
            elif isinstance(value, list):
                meaning = {0: "空配列", 1: "単一要素のみ", 2: "複数要素"}.get(min(len(value), 2), "複数要素")
            else:
                meaning = "配列以外の値"
            conditions.append(f"{label} は{meaning}")
            continue
        if path in ("/original_effect_observation/after_retry", "/submitted_effect_observation/after_retry"):
            observation_key = "original_effect_observation" if path.startswith("/original") else "submitted_effect_observation"
            state_path = f"/{observation_key}/state"
            if state_path in changes:
                continue
            value = raw.get(observation_key, {}).get("after_retry", MISSING)
            meaning = "nullでretry後のeffect状態は未提示" if value is None else "未提示" if value is MISSING else "retry後effect snapshotが提示" if isinstance(value, list) else "配列以外の値"
            conditions.append(f"{observation_key}.after_retry は{meaning}")
            continue
        attempt_identity = re.fullmatch(r"/(original|submitted)_attempts/(\d+)/identity", path)
        if attempt_identity:
            array_key, index = f"{attempt_identity.group(1)}_attempts", int(attempt_identity.group(2))
            attempts = raw.get(array_key, [])
            identity = attempts[index].get("identity", MISSING) if index < len(attempts) and isinstance(attempts[index], dict) else MISSING
            duplicated = any(i != index and isinstance(item, dict) and same_json(item.get("identity", MISSING), identity) for i, item in enumerate(attempts)) if identity is not MISSING else False
            ordinal = "先行するattemptと同一identity" if duplicated else "先行attemptと異なるidentity" if index and index < len(attempts) else "identity入力の差"
            conditions.append(f"{array_key} の{index + 1}件目は{ordinal}（identity値は省略）")
            continue
        if path.startswith("/submitted_retry/"):
            field = path.split("/")[-1]
            value = raw.get("submitted_retry", {}).get(field, MISSING)
            original = raw.get("original_operation", {}).get(field, MISSING)
            conditions.append(f"submitted_retry.{field} は {'未提示' if value is MISSING else 'original_operationと異なる' if value != original else '提示されoriginal_operationと同じ'}")
            continue
        if path.startswith("/original_incoming/"):
            field = path.split("/")[-1]
            value = raw.get("original_incoming", {}).get(field, MISSING)
            original = raw.get("original_operation", {}).get(field, MISSING)
            conditions.append(f"original_incoming.{field} は {'未提示' if value is MISSING else 'null' if value is None else 'original_operationと異なる' if value != original else 'original_operationと同じ'}")
            continue
        if path.startswith("/submitted_incoming/"):
            field = path.split("/")[-1]
            value = raw.get("submitted_incoming", {}).get(field, MISSING)
            original = raw.get("original_incoming", {}).get(field, MISSING)
            conditions.append(f"submitted_incoming.{field} は {'未提示' if value is MISSING else 'original_incomingと異なる' if value != original else 'original_incomingと同じ'}")
            continue
        if path.startswith("/original_effect_target/") or path.startswith("/submitted_effect_target/"):
            target, field = path.lstrip("/").split("/", 1)
            value = raw.get(target, {}).get(field, MISSING)
            conditions.append(f"{target}.{field} は {'未提示' if value is MISSING else 'original_operationと異なる' if value != raw.get('original_operation', {}).get(field, MISSING) else 'original_operationと同じ'}")
            continue
        if path.startswith("/original_effect_observation/target/") or path.startswith("/submitted_effect_observation/target/") or path.startswith("/original_receiver_contract/target/") or ((path.startswith("/original_history/") or path.startswith("/submitted_history/")) and "/target/" in path):
            parts = path.strip("/").split("/")
            field = parts[-1]
            target = raw
            for part in parts[:-1]:
                target = target.get(part, {}) if isinstance(target, dict) else {}
            value = target.get(field, MISSING) if isinstance(target, dict) else MISSING
            original = raw.get("original_operation", {}).get(field, MISSING)
            conditions.append(f"{path} のtarget.{field} は {'未提示' if value is MISSING else 'original_operationと異なる' if not same_json(value, original) else 'original_operationと同じ'}")
            continue
        if path.endswith("/length"):
            array_path = path[:-len("/length")]
            value = raw
            for part in array_path.strip("/").split("/"):
                value = value.get(part, MISSING) if isinstance(value, dict) else MISSING
            category = "未提示" if value is MISSING or not isinstance(value, list) else "空" if not value else "単一" if len(value) == 1 else "複数"
            if array_path in ("/original_effect_observation/before", "/original_effect_observation/after_first", "/original_effect_observation/after_retry", "/submitted_effect_observation/before", "/submitted_effect_observation/after_first", "/submitted_effect_observation/after_retry", "/original_effect_before", "/original_effect_after", "/submitted_effect_after"):
                label = array_path.rsplit("/", 1)[-1]
                if category == "空": meaning = "snapshotは空（効果項目なし）"
                elif category == "単一": meaning = "snapshotは単一の効果項目"
                elif category == "複数": meaning = "snapshotは複数の効果項目"
                else: meaning = "snapshotは未提示または配列でない"
                conditions.append(f"{array_path.rsplit('/', 1)[0]} の {label} {meaning}")
            elif array_path == "/submitted_history":
                original_history = raw.get("original_history", MISSING)
                if category == "空" and isinstance(original_history, list) and original_history:
                    meaning = "提出historyが空で、元historyは提示されている"
                else:
                    meaning = f"提出historyの件数区分は{category}"
                conditions.append(meaning)
            elif array_path == "/submitted_unfinished":
                original_unfinished = raw.get("original_unfinished", MISSING)
                if category == "空" and original_unfinished not in (MISSING, None, [], {}):
                    meaning = "提出unfinished/recovery入力が空で、元入力は提示されている"
                else:
                    meaning = f"提出unfinished/recovery入力の件数区分は{category}"
                conditions.append(meaning)
            else:
                conditions.append(f"{array_path} 入力arrayの要素数区分は {category}")
            continue
        if path in ("/original_result_state", "/original_expiry_state", "/original_permission_state", "/original_compatibility_state", "/original_ack_state"):
            key = path[1:]
            value = raw.get(key, MISSING)
            conditions.append(f"{key} 入力状態は {'未提示' if value is MISSING else 'null' if value is None else value}")
            continue
        if path == "/retry_selected":
            conditions.append(f"retry_selected 入力は {raw.get('retry_selected')}")
            continue
        conditions.append(f"入力項目 {path or '/'} は同機能の先頭固定caseと異なる（値は複製しない）")
    if not conditions:
        if fn == "F01":
            conditions = ["retry target全fieldはoriginal operationに対応し、attemptは区別され、effect snapshotが観測済み"]
        elif fn == "F02":
            conditions = ["original incoming digestはoriginal operation digestと同じで、effect observationが提示される"]
        else:
            conditions = ["policyと累積attemptの入力が提示され、retry result stateが与えられる"]
    return f"{requirement_ref} の固定L9 raw source入力条件: " + "；".join(conditions) + "。"


MISSING = object()


RULE_TEXT = {
    "F01": {
        0: "retry_targetの非対応fieldをoperation-ownerへ返す",
        1: "attempt binding不足をoperation-ownerへ返す",
        2: "receiver contract識別情報の不足をreceiver-contract-ownerへ返す",
        3: "effect observation内容の差をreceiver-ownerへ返す",
        4: "effect targetの差をreceiver-ownerへ返す",
        5: "one-effect観測条件で効果を分類し、観測不足はunknownのまま保持する",
        6: "attempt identity/ordinal重複をoperation-ownerへ返す",
        7: "receiver contract targetの差をreceiver-contract-ownerへ返す",
    },
    "F02": {
        0: "提出incoming間の内容差をoperation-ownerへ返す",
        1: "incomingと元operationのbinding差をoperation-ownerへ返す",
        2: "effect target差をreceiver-ownerへ返す",
        3: "元operation/incoming digest関係でcandidate actionを選び、digest差をoperation-ownerへ返す",
        4: "衝突後のreceiver effect増分をreceiver-ownerへ返す",
        5: "effect内容差をreceiver-ownerへ返す",
        6: "衝突前effectのunknownをunknown_original_informationとしてreceiver-ownerへ返す",
    },
    "F03": {
        0: "retry target差をoperation-ownerへ返す",
        1: "policy内容差をconnection-contract-ownerへ返す",
        2: "累積attempt差をoperation-ownerへ返す",
        3: "元policyと累積値から有限retry budgetを判定しoperation-ownerへ返す",
        4: "history件数不整合をoperation-ownerへ返す",
        5: "history内容差をoperation-ownerへ返す",
        6: "history target差をindex別にoperation-ownerへ返す",
        7: "unfinished/recovery差をoperation-ownerへ返す",
        8: "retryabilityに応じてbusiness_nonretryableはbusiness-owner、それ以外のunknownはoperation-ownerへ返す",
        9: "expiry停止状態をHELIX-SECURITYへ返す",
        10: "permission停止状態をHELIX-SECURITYへ返す",
        11: "compatibility停止状態をendpoint-contract-ownerへ返す",
        12: "terminal ACKをalready_terminalとしてoperation-ownerへ返す",
    },
}


def same_json(left, right):
    return type(left) is type(right) and left == right


def compare_record(left, right, fields, unknown_original=()):
    result = {}
    for field in fields:
        a = left.get(field, MISSING) if isinstance(left, dict) else MISSING
        b = right.get(field, MISSING) if isinstance(right, dict) else MISSING
        if a is MISSING or b is MISSING:
            result[field] = "missing"
        elif field in unknown_original and a is None:
            result[field] = "unknown_original_information"
        else:
            result[field] = "content_corresponding_in_fixture" if same_json(a, b) else "content_conflict"
    return result


def rule_refs_for(fn, raw, l5):
    """Statically match declared L5 failure-rule predicates to fixed input shape."""
    table = l5["branch_tables"][fn]
    rules = set()
    if fn == "F01":
        target_fields = table["target_fields_order"]
        target_results = compare_record(raw.get("original_operation"), raw.get("submitted_retry"), target_fields)
        if raw.get("retry_selected") is True and any(v != "content_corresponding_in_fixture" for v in target_results.values()): rules.add(0)
        original_attempts, submitted_attempts = raw.get("original_attempts"), raw.get("submitted_attempts")
        bound = isinstance(original_attempts, list) and isinstance(submitted_attempts, list) and len(original_attempts) > 0 and len(original_attempts) == len(submitted_attempts)
        if bound:
            for a, b in zip(original_attempts, submitted_attempts):
                if not isinstance(a, dict) or not isinstance(b, dict) or not same_json(a.get("identity", MISSING), b.get("identity", MISSING)) or not same_json(a.get("ordinal", MISSING), b.get("ordinal", MISSING)):
                    bound = False
                if any(v != "content_corresponding_in_fixture" for v in compare_record(a.get("target"), raw.get("original_operation"), target_fields).values()) or any(v != "content_corresponding_in_fixture" for v in compare_record(b.get("target"), raw.get("original_operation"), target_fields).values()):
                    bound = False
        if raw.get("retry_selected") is True and not bound: rules.add(1)
        contract = raw.get("original_receiver_contract", {})
        contract_strings = [contract.get(k, MISSING) for k in ("identity", "revision", "rule")]
        if any(v is MISSING or v is None or v == "" for v in contract_strings): rules.add(2)
        obs_fields = table["effect_fields_order"]
        obs_diff = compare_record(raw.get("original_effect_observation"), raw.get("submitted_effect_observation"), obs_fields, unknown_original=("after_retry",))
        if any(v != "content_corresponding_in_fixture" for v in obs_diff.values()): rules.add(3)
        effect_target = compare_record(raw.get("original_operation"), raw.get("original_effect_observation", {}).get("target"), target_fields)
        if any(v != "content_corresponding_in_fixture" for v in effect_target.values()): rules.add(4)
        if raw.get("retry_selected") is True and bound and all(v is not MISSING and v not in (None, "") for v in contract_strings):
            before = raw.get("original_effect_observation", {}).get("before", MISSING)
            first = raw.get("original_effect_observation", {}).get("after_first", MISSING)
            retry = raw.get("original_effect_observation", {}).get("after_retry", MISSING)
            observed = raw.get("original_effect_observation", {}).get("state") == "observed_in_fixture_only"
            one_effect = observed and isinstance(before, list) and isinstance(first, list) and isinstance(retry, list) and len(before) == 0 and len(first) == 1 and len(retry) == len(first) and same_json(first, retry)
            target_unbound = any(v != "content_corresponding_in_fixture" for v in effect_target.values())
            obs_unmatched = any(v != "content_corresponding_in_fixture" for v in obs_diff.values())
            if not one_effect or target_unbound or obs_unmatched: rules.add(5)
        keys = table.get("attempt_distinctness_keys", [])
        if any(not isinstance(raw.get("submitted_attempts"), list) or len({json.dumps(a.get(k), sort_keys=True, ensure_ascii=False) for a in raw["submitted_attempts"]}) != len(raw["submitted_attempts"]) for k in keys): rules.add(6)
        receiver_target = compare_record(raw.get("original_operation"), contract.get("target"), target_fields)
        if any(v != "content_corresponding_in_fixture" for v in receiver_target.values()): rules.add(7)
        if raw.get("retry_selected") is False: return []
    elif fn == "F02":
        incoming_fields = table["incoming_fields_order"]
        binding_fields = table["binding_fields_order"]
        a, b = raw.get("original_incoming"), raw.get("submitted_incoming")
        incoming_results = compare_record(a, b, incoming_fields, unknown_original=("digest",))
        if any(v != "content_corresponding_in_fixture" for v in incoming_results.values()): rules.add(0)
        binding_results = compare_record(raw.get("original_operation"), a, binding_fields)
        if any(v != "content_corresponding_in_fixture" for v in binding_results.values()): rules.add(1)
        target_fields = l5["branch_tables"]["F01"]["target_fields_order"]
        effect_target = compare_record(raw.get("original_operation"), raw.get("original_effect_target"), target_fields)
        submitted_effect_target = compare_record(raw.get("original_effect_target"), raw.get("submitted_effect_target"), target_fields)
        target_unbound = any(v != "content_corresponding_in_fixture" for v in effect_target.values()) or any(v != "content_corresponding_in_fixture" for v in submitted_effect_target.values())
        if target_unbound: rules.update((2, 4))
        operation_digest = raw.get("original_operation", {}).get("digest", MISSING)
        incoming_digest = a.get("digest", MISSING) if isinstance(a, dict) else MISSING
        digest_relation = "unknown" if operation_digest in (MISSING, None) or incoming_digest in (MISSING, None) else "same_digest" if same_json(operation_digest, incoming_digest) else "different_digest"
        if digest_relation != "same_digest": rules.add(3)
        before, after = raw.get("original_effect_before", MISSING), raw.get("original_effect_after", MISSING)
        effect_state = raw.get("original_effect_state")
        if effect_state == "observed_in_fixture_only" and not isinstance(before, list):
            rules.update((4, 5, 6))
        elif effect_state != "observed_in_fixture_only" or not isinstance(before, list) or not isinstance(after, list) or not same_json(before, after): rules.add(4)
        content = compare_record({"after": raw.get("original_effect_after", MISSING)}, {"after": raw.get("submitted_effect_after", MISSING)}, ["after"], unknown_original=("after",))
        if next(iter(content.values())) != "content_corresponding_in_fixture": rules.add(5)
    else:
        target_fields = table["target_fields_order"]
        target_results = compare_record(raw.get("original_operation"), raw.get("submitted_retry"), target_fields)
        if any(v != "content_corresponding_in_fixture" for v in target_results.values()): rules.add(0)
        policy_fields = table["policy_fields_order"]
        policy_results = compare_record(raw.get("original_policy"), raw.get("submitted_policy"), policy_fields, unknown_original=("max_total_attempts",))
        if any(v != "content_corresponding_in_fixture" for v in policy_results.values()): rules.add(1)
        ca, cb = raw.get("original_cumulative_attempts", MISSING), raw.get("submitted_cumulative_attempts", MISSING)
        cumulative_result = "missing" if ca is MISSING or cb is MISSING else "unknown_original_information" if ca is None else "content_corresponding_in_fixture" if same_json(ca, cb) else "content_conflict"
        if cumulative_result != "content_corresponding_in_fixture": rules.add(2)
        limit = raw.get("original_policy", {}).get("max_total_attempts", MISSING)
        if limit in (MISSING, None) or ca in (MISSING, None) or not isinstance(limit, int) or not isinstance(ca, int):
            budget_result = "unknown_budget"
        else:
            budget_result = "exhausted" if ca >= limit else "within_original_limit"
        if budget_result != "within_original_limit": rules.add(3)
        history = raw.get("original_history", MISSING)
        if not isinstance(history, list) or not isinstance(ca, int) or len(history) != ca: rules.add(4)
        if not same_json(raw.get("original_history", MISSING), raw.get("submitted_history", MISSING)): rules.add(5)
        if isinstance(history, list) and any(any(v != "content_corresponding_in_fixture" for v in compare_record(raw.get("original_operation"), item.get("target"), target_fields).values()) for item in history if isinstance(item, dict)): rules.add(6)
        if not same_json(raw.get("original_unfinished", MISSING), raw.get("submitted_unfinished", MISSING)): rules.add(7)
        retryable = raw.get("original_policy", {}).get("retryable_result_states", [])
        result_state = raw.get("original_result_state", MISSING)
        if result_state is MISSING or result_state not in retryable: rules.add(8)
        if raw.get("original_expiry_state") != "valid_in_fixture_only": rules.add(9)
        if raw.get("original_permission_state") != "valid_in_fixture_only": rules.add(10)
        if raw.get("original_compatibility_state") != "compatible_in_fixture_only": rules.add(11)
        if raw.get("original_ack_state") == "received_terminal": rules.add(12)
        if raw.get("retry_selected") is False: return []
    return sorted(rules)


def independent_outcome_facts(fn, raw, l5, rules):
    """Derive a small expected-fact set by reading L5 comparisons and emit owners."""
    table = l5["branch_tables"][fn]
    facts = []
    owner = table.get("owner_by_area", {})

    def add(area, field, result, assigned_owner=None):
        facts.append((area, field, result, assigned_owner or owner.get(area)))

    def add_record(area, left, right, fields, assigned_owner=None, unknown_original=()):
        for field, result in compare_record(left, right, fields, unknown_original).items():
            if result != "content_corresponding_in_fixture":
                add(area, field, result, assigned_owner)

    if fn == "F01":
        target_fields = table["target_fields_order"]
        if 0 in rules:
            add_record("retry_target", raw.get("original_operation"), raw.get("submitted_retry"), target_fields)
        if 1 in rules:
            original, submitted = raw.get("original_attempts"), raw.get("submitted_attempts")
            if not isinstance(original, list) or not isinstance(submitted, list) or not original or len(original) != len(submitted):
                result = "missing"
            elif any(any(v != "content_corresponding_in_fixture" for v in compare_record(a.get("target"), raw.get("original_operation"), target_fields).values()) or any(v != "content_corresponding_in_fixture" for v in compare_record(b.get("target"), raw.get("original_operation"), target_fields).values()) for a,b in zip(original,submitted)):
                result = "content_conflict"
            else:
                result = "unknown"
            add("retry_target", "attempt_binding", result)
        if 2 in rules:
            add("receiver_contract_target", "identity_revision_or_rule", "missing")
        if 3 in rules:
            add_record("effect_content", raw.get("original_effect_observation"), raw.get("submitted_effect_observation"), table["effect_fields_order"], unknown_original=("after_retry",))
        if 4 in rules:
            add_record("effect_target", raw.get("original_operation"), raw.get("original_effect_observation", {}).get("target"), target_fields)
        if 5 in rules:
            observation = raw.get("original_effect_observation", {})
            before, first, retry = observation.get("before", MISSING), observation.get("after_first", MISSING), observation.get("after_retry", MISSING)
            observed = observation.get("state") == "observed_in_fixture_only"
            if not observed or not all(isinstance(x, list) for x in (before, first, retry)):
                effect_result = "unknown_unobserved"
            elif len(before) == 0 and len(first) == 1 and len(retry) == 1 and same_json(first, retry):
                effect_result = "one_effect_retained_in_fixture_only"
            else:
                effect_result = "duplicate_or_conflicting_effect"
            target_unbound = any(v != "content_corresponding_in_fixture" for v in compare_record(raw.get("original_operation"), observation.get("target"), target_fields).values())
            observation_diff = any(v != "content_corresponding_in_fixture" for v in compare_record(observation, raw.get("submitted_effect_observation"), table["effect_fields_order"], unknown_original=("after_retry",)).values())
            if target_unbound or observation_diff:
                effect_result = "unknown_or_conflicting_effect_binding"
            add("receiver_effect", "delta", effect_result)
        if 6 in rules:
            add("attempt_distinction", "identity_and_ordinal", "duplicate_attempt_identity")
        if 7 in rules:
            add_record("receiver_contract_target", raw.get("original_operation"), raw.get("original_receiver_contract", {}).get("target"), target_fields)
    elif fn == "F02":
        incoming_fields, binding_fields = table["incoming_fields_order"], table["binding_fields_order"]
        if 0 in rules:
            add_record("incoming_content", raw.get("original_incoming"), raw.get("submitted_incoming"), incoming_fields, unknown_original=("digest",))
        if 1 in rules:
            add_record("operation_binding", raw.get("original_operation"), raw.get("original_incoming"), binding_fields)
        target_fields = l5["branch_tables"]["F01"]["target_fields_order"]
        if 2 in rules:
            add_record("receiver_effect_target", raw.get("original_operation"), raw.get("original_effect_target"), target_fields)
        operation_digest = raw.get("original_operation", {}).get("digest", MISSING)
        incoming_digest = raw.get("original_incoming", {}).get("digest", MISSING)
        digest_relation = "unknown" if operation_digest in (MISSING, None) or incoming_digest in (MISSING, None) else "same_digest" if same_json(operation_digest, incoming_digest) else "different_digest"
        if 3 in rules:
            add("digest_relation", "digest", digest_relation)
        if 4 in rules:
            before, after = raw.get("original_effect_before", MISSING), raw.get("original_effect_after", MISSING)
            target_left = compare_record(raw.get("original_operation"), raw.get("original_effect_target"), target_fields)
            target_right = compare_record(raw.get("original_effect_target"), raw.get("submitted_effect_target"), target_fields)
            if raw.get("original_effect_state") != "observed_in_fixture_only" or not isinstance(before, list) or not isinstance(after, list):
                effect_result = "unknown_unobserved"
            elif any(v != "content_corresponding_in_fixture" for v in target_left.values()) or any(v != "content_corresponding_in_fixture" for v in target_right.values()):
                effect_result = "unknown_or_conflicting_effect_binding"
            else:
                effect_result = "no_increment_in_fixture_only" if same_json(before, after) else "conflict_side_effect"
            add("receiver_effect", "after_conflict", effect_result)
        if 5 in rules:
            effect_content = compare_record({"after": raw.get("original_effect_after", MISSING)}, {"after": raw.get("submitted_effect_after", MISSING)}, ["after"], unknown_original=("after",))
            if effect_content["after"] != "content_corresponding_in_fixture":
                add("effect_content", "after_conflict", effect_content["after"])
        if 6 in rules:
            add("effect_content", "before", "unknown_original_information")
    else:
        target_fields, policy_fields = table["target_fields_order"], table["policy_fields_order"]
        if 0 in rules:
            add_record("retry_target", raw.get("original_operation"), raw.get("submitted_retry"), target_fields)
        if 1 in rules:
            add_record("policy_content", raw.get("original_policy"), raw.get("submitted_policy"), policy_fields, unknown_original=("max_total_attempts",))
        ca, cb = raw.get("original_cumulative_attempts", MISSING), raw.get("submitted_cumulative_attempts", MISSING)
        cumulative = "missing" if ca is MISSING or cb is MISSING else "unknown_original_information" if ca is None else "content_corresponding_in_fixture" if same_json(ca, cb) else "content_conflict"
        if 2 in rules:
            add("cumulative_attempts", "value", cumulative)
        limit = raw.get("original_policy", {}).get("max_total_attempts", MISSING)
        if limit in (MISSING, None) or ca in (MISSING, None) or type(limit) is not int or type(ca) is not int:
            budget = "unknown_budget"
        else:
            budget = "exhausted" if ca >= limit else "within_original_limit"
        if 3 in rules:
            add("retry_budget", "remaining", budget)
        history = raw.get("original_history", MISSING)
        if 4 in rules:
            add("cumulative_history", "count", "unknown_or_conflicting_history")
        if 5 in rules:
            add("history_content", "value", "content_conflict" if not same_json(history, raw.get("submitted_history", MISSING)) else "content_corresponding_in_fixture")
        if 6 in rules and isinstance(history, list):
            for index, item in enumerate(history):
                for field, result in compare_record(raw.get("original_operation"), item.get("target"), target_fields).items():
                    if result != "content_corresponding_in_fixture": add(f"history_target_{index}", field, result, owner.get("history_target"))
        if 7 in rules:
            add("unfinished_content", "value", "content_conflict" if not same_json(raw.get("original_unfinished", MISSING), raw.get("submitted_unfinished", MISSING)) else "content_corresponding_in_fixture")
        if 8 in rules:
            state = raw.get("original_result_state", MISSING)
            result = "business_nonretryable" if state == "business_nonretryable" else "unknown"
            assigned_owner = "business-owner" if state == "business_nonretryable" else "operation-owner"
            add("retryable_result", "state", result, assigned_owner)
        for index, key, area, owner_name, mapping in (
            (9,"original_expiry_state","original_expiry_state","HELIX-SECURITY",{"expired":"expired","unknown":"unknown"}),
            (10,"original_permission_state","original_permission_state","HELIX-SECURITY",{"revoked":"revoked","unknown":"unknown"}),
            (11,"original_compatibility_state","original_compatibility_state","endpoint-contract-owner",{"stale":"stale","incompatible":"incompatible","unknown":"unknown"}),
        ):
            if index in rules:
                value = raw.get(key, MISSING)
                add(area, "state", mapping.get(value, "unknown"), owner_name)
        if 12 in rules:
            add("ack_state", "state", "already_terminal")
    return facts


def derive_expected(row, case, raw, baseline, l3, l4, l5):
    fn = FN_TO_GROUP[row["function_ref"]]
    changes = changed_leaves(baseline, raw)
    rules = rule_refs_for(fn, raw, l5)
    rule_base = f"/branch_tables/{fn}/failure_rules"
    assertions = [name for name, value in raw.get("claims", {}).items() if value is True and f"/claims/{name}" in changes]
    facts = independent_outcome_facts(fn, raw, l5, rules)
    status = "unverified" if assertions else "independently_derived"
    l3_id = f"HELIXCONNECT-L3-004-{fn}"
    l4_id = f"HELIXCONNECT-L4-004-{fn}"
    l3_req = next((item for item in l3.get("requirements", []) if item.get("id") == l3_id), None)
    l4_contract = next((item for item in l4.get("contracts", []) if item.get("id") == l4_id), None)
    refs = []
    if raw.get("retry_selected") is False:
        if fn == "F01":
            refs.append(f"{L5}#/branch_tables/F01/selected_false")
        elif fn == "F03":
            refs.append(f"{L5}#/calculation_programs/FN-C004-03/ordered_steps/18")
        statements = ["selected_false branchではnot_selected_unobservedとし、attempt/effectを主張しない"]
    elif not rules and fn == "F01":
        refs.append(f"{L5}#/branch_tables/F01/effect_set_rule")
        statements = ["effect_set_ruleのone-effect条件を満たす場合だけ同一再送の効果一回分をfixture内で保持する"]
    elif not rules and fn == "F02":
        refs.append(f"{L5}#/branch_tables/F02/candidate_action_rules")
        statements = ["同digestかつincoming/operation bindingが一致するときcandidate actionはsame_content_candidate_onlyであり、異digest衝突とはしない"]
    elif not rules and fn == "F03":
        refs.append(f"{L5}#/calculation_programs/FN-C004-03/ordered_steps/18")
        statements = ["candidate conditionの元budget/retryability/target/history/unfinished/expiry/permission/compatibility条件を満たす場合だけqualification候補とし、実attemptを主張しない"]
    else:
        refs.extend(f"{L5}#{rule_base}/{i}" for i in rules)
        statements = [RULE_TEXT[fn][i] for i in rules]
    if not l3_req or not l4_contract:
        status = "unverified"
    if assertions:
        text = "未検証: この入力claimのacceptance/rejection semanticsは共通の承認済みL3/L4根拠およびL5 ruleから独立確定できない。適用可能な既存L5 branch境界は " + "；".join(statements) + "。"
    elif statements:
        fact_text = "；独立導出したL5期待値: " + "、".join(f"{area}.{field}={result}→{assigned_owner}" for area,field,result,assigned_owner in facts) if facts else ""
        text = "独立期待: 共通のexpectation_derivationに示す承認済みL3 requirement・L4 contractと既存L5 ruleに従い、" + "；".join(statements) + fact_text + "。実retry/receiver effectは主張しない。"
    else:
        status = "unverified"
        text = "未検証: 固定L3/L4/L5からこの入力に対する期待を独立導出できない。L9 expected_materialは比較参照のみ。"
    return {"status": status, "text": text, "basis_refs": refs, "rule_indices": rules, "asserted_claims": assertions, "changes": changes, "outcome_facts": facts}


def check():
    doc, l3, l4, l5, l9, l10, history = load(L8), load(L3), load(L4), load(L5), load(L9), load(L10), load(HISTORY)
    errors = []
    archive_errors, archive_view = validate_history_archives(history)
    errors.extend(archive_errors)
    old_bytes = subprocess.check_output(["git", "show", f"{BASE}:{L8}"], cwd=ROOT)
    old = json.loads(old_bytes)
    old_ids = [c["id"] for c in old["cases"]]
    expected_historical_source = {"commit":BASE,"path":L8,"blob":subprocess.check_output(["git", "rev-parse", f"{BASE}:{L8}"], cwd=ROOT, text=True).strip(),"sha256":hashlib.sha256(old_bytes).hexdigest(),"bytes":len(old_bytes),"restore_command":f"git show {BASE}:{L8} > {L8}"}
    if history.get("historical_source") != expected_historical_source:
        errors.append("historical L8 source commit/blob/SHA-256/bytes/restore command do not resolve")
    order_hash = hashlib.sha256(("\n".join(old_ids)+"\n").encode("utf-8")).hexdigest()
    if history.get("historical_structure") != {"case_count":len(old_ids),"case_ids_order_sha256":order_hash,"case_ids_order_source":"historical_source commit/path; validator re-reads it"}:
        errors.append("compact historical case count/order digest does not resolve from the fixed source")
    ids = [c.get("id") for c in doc.get("cases", [])]
    if ids != old_ids:
        errors.append("case ID/order differs from fixed pre-edit source")
    if len(ids) != 69:
        errors.append(f"case count is {len(ids)}, expected 69")
    source_index = {}
    for ob_index, obligation in enumerate(l9["verification_obligations"]):
        for case_index, case in enumerate(obligation["concrete_cases"]):
            source_index[case["id"]] = (ob_index, case_index, case)
    expected_by_id = {case_id: value[2] for case_id, value in source_index.items()}
    if set(ids) != set(expected_by_id):
        errors.append("L8 and L9 case ID sets differ")
    base_function_by_id = {case["id"]: case["function_ref"] for case in old["cases"]}
    expected_uids = [f"U-C004-{i:03d}" for i in range(1, len(ids) + 1)]
    uids = [row.get("u_id") for row in doc.get("cases", [])]
    if uids != expected_uids or len(set(uids)) != len(ids):
        errors.append("U-ID sequence must be unique U-C004-001..069 in case order")
    l5_function_by_case = {}
    for trace in l5.get("obligation_trace", []):
        for case_id in trace.get("case_ids", []):
            l5_function_by_case[case_id] = trace.get("function_ref")
    if set(l5_function_by_case) != set(ids):
        errors.append("existing L5 obligation_trace consumer has unresolved or extra case IDs")
    baseline_by_fn = {}
    fn_by_requirement = {"HELIXCONNECT-L3-004-F01":"F01", "HELIXCONNECT-L3-004-F02":"F02", "HELIXCONNECT-L3-004-F03":"F03"}
    for obligation in l9["verification_obligations"]:
        if obligation.get("concrete_cases"):
            group = fn_by_requirement.get(obligation.get("requirement_ref"))
            if group:
                baseline_by_fn[group] = raw_case(obligation["concrete_cases"][0])
    if set(doc.get("removed_materials", {})) != {"decision_ref", "git_commit", "path", "meaning", "removed_key_rule", "use_boundary"}:
        errors.append("removed_materials must contain exactly the six required keys")
    if "DT-VT-105" not in doc.get("removed_materials", {}).get("use_boundary", ""):
        errors.append("removed_materials does not name DT-VT-105")
    derivation_boundary = doc.get("expectation_derivation", {}).get("boundary", "")
    if not all(term in derivation_boundary for term in ("L3", "L4", "L5", "L9 expected_material", "unverified")):
        errors.append("expectation derivation does not separate L3/L4/L5 expected source from L9 comparison")
    derivation_functions = doc.get("expectation_derivation", {}).get("functions", {})
    if set(derivation_functions) != set(FN_TO_GROUP):
        errors.append("shared expectation_derivation must map exactly the three existing L5 function_ref values")
    for fnref, entry in derivation_functions.items():
        group = FN_TO_GROUP.get(fnref)
        if not group:
            continue
        l3_id, l4_id = f"HELIXCONNECT-L3-004-{group}", f"HELIXCONNECT-L4-004-{group}"
        l3_index = next((i for i,x in enumerate(l3.get("requirements", [])) if x.get("id") == l3_id), None)
        l4_index = next((i for i,x in enumerate(l4.get("contracts", [])) if x.get("id") == l4_id), None)
        if l3_index is None or l4_index is None:
            errors.append(f"{fnref}: approved L3 or L4 expectation source is unresolved")
        elif entry.get("requirement_source_ref") != f"{L3}#/requirements/{l3_index}" or entry.get("design_contract_source_ref") != f"{L4}#/contracts/{l4_index}":
            errors.append(f"{fnref}: shared L3/L4 expectation source pointer is stale or unresolved")
    owner_note = doc.get("F03_retryable_result_owner_resolution", "")
    l5_rules = l5.get("branch_tables", {}).get("F03", {}).get("failure_rules", [])
    if len(l5_rules) <= 8 or l5_rules[8].get("owner_ref") != "business_nonretryableならbusiness-owner、それ以外の未知状態ならoperation-ownerへ返す。":
        errors.append("L5 F03 conditional retryable-result owner rule changed")
    l4_contracts = {item.get("id"): item for item in l4.get("contracts", [])}
    l4_f03 = l4_contracts.get("HELIXCONNECT-L4-004-F03", {})
    l10_f03 = next((item for item in l10.get("cases", []) if item.get("id") == "HELIXCONNECT-L10-004-F03"), {})
    if not all(term in owner_note for term in ("business-owner", "operation-owner", "L5", "L9", "L4", "L10")):
        errors.append("L8 does not state the F03 conditional owner resolution and source boundaries")
    if l4_f03.get("output_meanings") != ["停止地点/元累積/局所理由と返し先", "原policy/履歴/未完と追加attempt候補"]:
        errors.append("L4 F03 owner-output boundary differs from recorded owner resolution")
    if l10_f03.get("failure_observation") != "operation owner/SEC/contract ownerの該当境界へ返す。":
        errors.append("L10 F03 owner observation differs from recorded owner resolution")
    forbidden = {"source_packet_ref", "typed_arguments", "raw_utf8", "expected_return", "sha256", "hash_map", "COPY", "mutation_steps", "l5_function_ref", "l9_basic_branches"}
    def walk(value, trail=""):
        if isinstance(value, dict):
            for k, v in value.items():
                if k in forbidden:
                    errors.append(f"forbidden material key at {trail}/{k}")
                walk(v, f"{trail}/{k}")
        elif isinstance(value, list):
            for i, v in enumerate(value):
                walk(v, f"{trail}/{i}")
    walk(doc)
    matched = 0
    comparisons = []
    for row in doc["cases"]:
        src = expected_by_id.get(row["id"])
        if src is None:
            continue
        fn = FN_TO_GROUP.get(row.get("function_ref"), "")
        if not fn:
            errors.append(f"{row['id']}: function_ref does not resolve to an existing L5 public function")
            continue
        raw = raw_case(src)
        baseline = baseline_by_fn.get(fn, {})
        if row.get("function_ref") != base_function_by_id.get(row["id"]) or row.get("function_ref") != l5_function_by_case.get(row["id"]):
            errors.append(f"{row['id']}: original function_ref is missing or does not resolve through L5 obligation_trace")
        if row.get("u_id") != f"U-C004-{ids.index(row['id'])+1:03d}":
            errors.append(f"{row['id']}: U-ID does not correspond to its fixed case order")
        ob_index, case_index, _ = source_index[row["id"]]
        requirement_ref = l9["verification_obligations"][ob_index].get("requirement_ref", "")
        if row.get("counterexample") != counterexample(src, raw, baseline, row["function_ref"], requirement_ref):
            errors.append(f"{row['id']}: counterexample must contain only source-derived input conditions")
        vague_counterexample_markers = ("同機能の先頭固定caseと異なる", "もう一方と異なる", "一方と異なる")
        if any(marker in row.get("counterexample", "") for marker in vague_counterexample_markers):
            errors.append(f"{row['id']}: counterexample omits the meaning of its fixed-source input difference")
        source_pointer = f"/verification_obligations/{ob_index}/concrete_cases/{case_index}/independent_source_packet/raw_utf8"
        baseline_case_index = 0
        baseline_pointer = f"/verification_obligations/{ob_index}/concrete_cases/{baseline_case_index}/independent_source_packet/raw_utf8"
        if row.get("counterexample_source_ref") != {"document": L9, "pointer": source_pointer, "comparison_baseline_pointer": baseline_pointer}:
            errors.append(f"{row['id']}: counterexample source pointer does not resolve to fixed L9 raw input")
        derived = derive_expected(row, src, raw, baseline, l3, l4, l5)
        if row.get("expected") != derived["text"] or row.get("expected_status") != derived["status"] or row.get("expected_basis_refs") != derived["basis_refs"]:
            errors.append(f"{row['id']}: expected must derive from approved L3/L4 and existing L5 rules, independent of L9 expected_material")
        if "L9 condition/outcome witness" in row.get("counterexample", "") or "expected_material" in row.get("expected", ""):
            errors.append(f"{row['id']}: counterexample/expected duplicates or derives from L9 oracle outcome")
        if row.get("oracle_id") != src.get("system_oracle_ref"):
            errors.append(f"{row['id']}: oracle identity differs")
        if row.get("oracle_id") not in {case.get("id") for case in l10.get("cases", [])}:
            errors.append(f"{row['id']}: L10 oracle consumer does not resolve")
        if row.get("expected_oracle_ref", {}).get("document") != L9:
            errors.append(f"{row['id']}: expected oracle document differs")
        if row.get("expected_oracle_ref", {}).get("pointer") != f"/verification_obligations/{ob_index}/concrete_cases/{case_index}/expected_material":
            errors.append(f"{row['id']}: oracle pointer does not resolve to its L9 expected_material")
        fnid = {"F01":"FN-C004-01", "F02":"FN-C004-02", "F03":"FN-C004-03"}.get(fn)
        if not fnid or fnid not in l5.get("calculation_programs", {}):
            errors.append(f"{row['id']}: no matching existing L5 calculation program")
        else:
            matched += 1
        # The L9 expected_material is compared with the independent L3/L5 derivation only.
        reason_map = {
            "F01":{"retry_target":0,"receiver_contract_target":7,"effect_content":3,"effect_target":4,"receiver_effect":5,"attempt_distinction":6},
            "F02":{"incoming_content":0,"operation_binding":1,"receiver_effect_target":2,"digest_relation":3,"receiver_effect":4,"effect_content":5},
            "F03":{"retry_target":0,"policy_content":1,"cumulative_attempts":2,"retry_budget":3,"cumulative_history":4,"history_content":5,"history_target":6,"unfinished_content":7,"retryable_result":8,"original_expiry_state":9,"original_permission_state":10,"original_compatibility_state":11,"ack_state":12},
        }
        oracle_reasons = src["expected_material"].get("failure_reasons", src["expected_material"].get("stop_reasons", []))
        oracle_rules = {reason_map[fn].get(item.get("area"), 6 if fn == "F03" and item.get("area", "").startswith("history_target_") else None) for item in oracle_reasons}
        oracle_rules.discard(None)
        oracle_facts = {(item.get("area"), item.get("field"), item.get("result"), item.get("return_owner")) for item in oracle_reasons}
        independent_facts = set(derived["outcome_facts"])
        if derived["status"] == "unverified":
            oracle_comparison = "partial_unverified"
        elif oracle_rules.issubset(set(derived["rule_indices"])) and oracle_facts == independent_facts:
            oracle_comparison = "aligned_with_independent_L3_L5_outcome_facts"
        else:
            oracle_comparison = "comparison_conflict_unresolved"
            errors.append(f"{row['id']}: L9 expected_material comparison conflicts with independently derived L5 outcome facts or rule refs")
        l5_owner_by_area = l5["branch_tables"][fn].get("owner_by_area", {})
        for item in oracle_reasons:
            area = item.get("area", "")
            expected_owner = l5_owner_by_area.get("history_target") if fn == "F03" and area.startswith("history_target_") else l5_owner_by_area.get(area)
            if fn == "F03" and area == "retryable_result":
                expected_owner = "business-owner" if item.get("result") == "business_nonretryable" else "operation-owner"
            if item.get("return_owner") != expected_owner:
                errors.append(f"{row['id']}: L9 owner comparison disagrees with the existing L5 conditional owner contract for {area}")
        comparisons.append({"u_id": row["u_id"], "status": oracle_comparison})
    source_revision = subprocess.check_output(["git", "rev-parse", "HEAD"], cwd=ROOT, text=True).strip()
    current_bytes = (ROOT / L8).read_bytes()
    report = {
        "schema":"wr265-static-verification.v1", "evidence_kind":"scaffold", "authority_effect":"none",
        "record_id":"WR265-RETRY-L8-CURRENT-STATIC-R1",
        "target":L8, "target_revision":source_revision, "target_sha256":hashlib.sha256(current_bytes).hexdigest(),
        "source_pins": {path: hashlib.sha256((ROOT / path).read_bytes()).hexdigest() for path in (L3,L4,L5,L9,L10)},
        "historical_source":history["historical_source"], "historical_summary_archive":archive_view,
        "checks":{"case_identity_order":"evaluated","u_id_and_original_function_ref":"evaluated","input_only_counterexamples":"evaluated","independent_L3_L4_L5_expectations":"evaluated","L9_oracle_comparison_only":"evaluated","existing_L5_L9_L10_consumers":"evaluated","removed_materials_and_forbidden_material":"evaluated","immutable_summary_history_recovery":"evaluated"},
        "rows_checked":matched, "expected_status_counts":{status:sum(1 for row in doc["cases"] if row.get("expected_status")==status) for status in sorted({row.get("expected_status") for row in doc["cases"]})}, "l9_comparison_status_counts":{status:sum(1 for item in comparisons if item["status"]==status) for status in sorted({item["status"] for item in comparisons})}, "result":"FAIL" if errors else "PASS_STATIC_ONLY",
        "errors":errors,
        "not_evaluated":["L5 algorithm execution","product test","real receiver effect",f"{sum(1 for row in doc['cases'] if row.get('expected_status')=='unverified')} row claim-level expectations explicitly marked unverified","approval or formal L8 completion","design_verification_checker child semantics"],
        "interpretation":"PASS_STATIC_ONLY is a static structure/source comparison only. It is not execution, approval, formal verification, or completion."
    }
    commands = [
        ("scfctl_validate", [sys.executable, "-B", "scaffold/tools/scfctl.py", "validate"]),
        ("scfctl_stale", [sys.executable, "-B", "scaffold/tools/scfctl.py", "stale"]),
        ("design_verification_checker_check_child", [sys.executable, "-B", "scaffold/tools/design_verification_checker.py", "check-child", "--root", ".", "--l4", "docs/helix-connect/L4-basic-design/retry-deduplication-conflict.json", "--l9", L9, "--l5", L5, "--l8", L8]),
    ]
    overlay = {"revision": source_revision, "checks": {}}
    for name, command in commands:
        result = subprocess.run(command, cwd=ROOT, capture_output=True, text=True)
        entry = {"command": " ".join(command), "exit_code": result.returncode}
        if name == "scfctl_validate":
            entry["summary"] = result.stdout.strip().splitlines()[-1] if result.stdout.strip() else result.stderr.strip()
        elif name == "scfctl_stale":
            entry["summary"] = result.stdout.strip() or result.stderr.strip()
        else:
            parsed = json.loads(result.stdout)
            entry["overall_passed"] = parsed.get("passed")
            entry["L4_L9_pair"] = {"status": parsed["L4_L9_pair"].get("status"), "not_evaluated_reason": parsed["L4_L9_pair"].get("not_evaluated_reason")}
            entry["L5_L8_pair"] = {"status": parsed["L5_L8_pair"].get("status"), "not_evaluated_reason": parsed["L5_L8_pair"].get("not_evaluated_reason")}
            entry["negative_4way"] = {"status": parsed["negative_4way"].get("status"), "not_evaluated_reason": parsed["negative_4way"].get("not_evaluated_reason"), "counts": parsed["negative_4way"].get("counts"), "matched_case_count": parsed["negative_4way"].get("matched_case_count")}
            entry["ownership_caps"] = [{"check": item.get("check"), "layer": item.get("layer"), "passed": item.get("passed"), "failure_count": len(item.get("failures", []))} for item in parsed.get("ownership_caps", [])]
            entry["pins"] = [{"file": item.get("file"), "status": item.get("status"), "passed": item.get("passed"), "not_evaluated_reason": item.get("not_evaluated_reason")} for item in parsed.get("pins", []) if item.get("file") in (L5, L8)]
        overlay["checks"][name] = entry
    report["latest_main_overlay"] = overlay
    return report


def main():
    ap=argparse.ArgumentParser()
    ap.add_argument("--record", metavar="NEW_PATH", help="write one new report path with O_EXCL; default is read-only")
    ap.add_argument("--record-id", default="WR265-RETRY-L8-CURRENT-STATIC-R8", help="unique ID for the explicitly recorded summary")
    args=ap.parse_args()
    report=check()
    report["record_id"] = args.record_id
    if args.record:
        path=Path(args.record)
        if not path.is_absolute(): path=ROOT/path
        path.parent.mkdir(parents=True,exist_ok=True)
        fd=os.open(path, os.O_WRONLY|os.O_CREAT|os.O_EXCL, 0o644)
        with os.fdopen(fd,"w",encoding="utf-8") as f:
            json.dump(report,f,ensure_ascii=False,indent=2); f.write("\n")
    print(json.dumps(report,ensure_ascii=False,indent=2))
    return 0 if report["result"]=="PASS_STATIC_ONLY" else 1

if __name__=="__main__":
    raise SystemExit(main())
