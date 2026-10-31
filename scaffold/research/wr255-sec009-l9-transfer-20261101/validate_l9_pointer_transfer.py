#!/usr/bin/env python3
"""SEC009 L9 nested pointer transfer validation (static, read-only by default)."""
from __future__ import annotations

import argparse
import hashlib
import json
import re
import subprocess
import sys
from collections import Counter
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[3]
HERE = Path(__file__).resolve().parent
L4 = "docs/helix-security/L4-basic-design/revoke-quarantine-propagation.json"
L5 = "docs/helix-security/L5-detail-design/revoke-quarantine-propagation.json"
L9 = "docs/helix-security/L9-integration-verification/revoke-quarantine-propagation.json"
BASE_REV = "ad2dfaf6f434fbb81cd34988d4bd76212380f3a5"
HISTORY_REV = "c50eb21b34f034262ced3f8052d2502fb84c57c9"
HISTORY_L4_SHA256 = "d46e39cad2e2a90cfc532fa57226a4d650336e794a375f07e1cc2e6cbba15eb3"
L4_R2_ALIAS_SHA256 = "00376c402930e1287e9e0e896804b1de8a20390f8abbea8377b70712f868b9da"
NESTED = re.compile(r"^/contracts/(\d+)/negative_classifications/(\d+)$")
COLLECTION = re.compile(r"^/contracts/(\d+)/negative_classifications$")
HISTORIC_LOCATIONS = {
    "/negative_class_assignment_audit/unassigned_single_contract_negative_cases/0/source_pointers/0/pointer",
    "/negative_class_assignment_audit/unassigned_single_contract_negative_cases/1/source_pointers/0/pointer",
    "/negative_class_assignment_audit/unassigned_single_contract_negative_cases/1/source_pointers/1/pointer",
}
FIELD_MAP = {
    "code": "class_id",
    "change": "condition",
    "axis": "expected_axis",
    "state": "expected_state",
    "backflow_owner": "backflow_owner",
    "expected": "expected",
    "expected_preserved": "expected_preserved",
    "expected_side_effect_count": "side_effect_count",
    "source_pointers": "source_pointers",
}


def fail(message: str) -> None:
    raise ValueError(message)


def sha(raw: bytes) -> str:
    return hashlib.sha256(raw).hexdigest()


def read_at(revision: str, path: str) -> bytes:
    return subprocess.check_output(["git", "show", f"{revision}:{path}"], cwd=ROOT)


def read_json(path: str) -> Any:
    return json.loads((ROOT / path).read_text(encoding="utf-8"))


def parse_l4_reference(value: str) -> tuple[str | None, str]:
    if "#" in value:
        path, pointer = value.split("#", 1)
        if path != L4:
            fail(f"予期しないL4参照path: {value}")
        return path, pointer
    return None, value


def resolve(doc: Any, pointer: str) -> Any:
    if pointer == "":
        return doc
    if not pointer.startswith("/"):
        fail(f"不正なJSON Pointer: {pointer}")
    value = doc
    for token in pointer[1:].split("/"):
        token = token.replace("~1", "/").replace("~0", "~")
        if isinstance(value, list):
            value = value[int(token)]
        elif isinstance(value, dict):
            value = value[token]
        else:
            fail(f"JSON Pointerを解決できない: {pointer}")
    return value


def walk_strings(node: Any, path: str = "") -> list[tuple[str, str]]:
    found: list[tuple[str, str]] = []
    if isinstance(node, dict):
        for key, value in node.items():
            found.extend(walk_strings(value, f"{path}/{key}"))
    elif isinstance(node, list):
        for index, value in enumerate(node):
            found.extend(walk_strings(value, f"{path}/{index}"))
    elif isinstance(node, str):
        found.append((path, node))
    return found


def nested_reference(value: str) -> tuple[str | None, str] | None:
    if "/contracts/" not in value or "/negative_classifications" not in value:
        return None
    try:
        path, pointer = parse_l4_reference(value)
    except ValueError:
        return None
    if NESTED.fullmatch(pointer) or COLLECTION.fullmatch(pointer):
        return path, pointer
    return None


def canonical_class_rows(l4: dict[str, Any]) -> tuple[dict[str, int], dict[str, dict[str, Any]]]:
    rows = l4.get("failure_classifications")
    if not isinstance(rows, list):
        fail("L4 failure_classificationsが配列でない")
    indexes: dict[str, int] = {}
    objects: dict[str, dict[str, Any]] = {}
    for index, row in enumerate(rows):
        if not isinstance(row, dict) or not isinstance(row.get("class_id"), str):
            fail(f"L4 canonical class row不正: {index}")
        class_id = row["class_id"]
        if class_id in indexes:
            fail(f"L4 canonical class ID重複: {class_id}")
        indexes[class_id] = index
        objects[class_id] = row
    return indexes, objects


def nested_class_rows(l4: dict[str, Any]) -> dict[str, tuple[str, dict[str, Any]]]:
    found: dict[str, tuple[str, dict[str, Any]]] = {}
    for contract_index, contract in enumerate(l4.get("contracts", [])):
        for row_index, row in enumerate(contract.get("negative_classifications", [])):
            class_id = row.get("code")
            if not isinstance(class_id, str) or class_id in found:
                fail(f"nested L4 class codeが欠落または重複: {class_id}")
            found[class_id] = (f"/contracts/{contract_index}/negative_classifications/{row_index}", row)
    return found


def compare_aliases(old_rows: dict[str, tuple[str, dict[str, Any]]], indexes: dict[str, int], canonical: dict[str, dict[str, Any]]) -> list[dict[str, Any]]:
    if len(old_rows) != 30 or not set(old_rows).issubset(indexes):
        fail("R2の30 nested classと現行canonical classが一致しない")
    proof = []
    for class_id, (old_pointer, old_row) in old_rows.items():
        new_row = canonical[class_id]
        fields: dict[str, Any] = {}
        for old_key, new_key in FIELD_MAP.items():
            same_type = type(old_row.get(old_key)) is type(new_row.get(new_key))
            same_value = old_row.get(old_key) == new_row.get(new_key)
            fields[old_key] = {"canonical_field": new_key, "type_equal": same_type, "value_equal": same_value}
            if not same_type or not same_value:
                fail(f"class alias field mismatch: {class_id}.{old_key} -> {new_key}")
        reconstructed = new_row.get("condition") + " " + new_row.get("expected_preserved", {}).get("contract_detail", "")
        expected_text = old_row.get("expected_text")
        if type(expected_text) is not str or type(reconstructed) is not str or expected_text != reconstructed:
            fail(f"expected_textをcanonical fieldから同値再構成できない: {class_id}")
        expected_classification = new_row.get("expected_classification")
        if type(expected_classification) is not type(old_row.get("expected", {}).get("condition")) or expected_classification != old_row.get("expected", {}).get("condition"):
            fail(f"期待分類のaliasが一致しない: {class_id}")
        proof.append({
            "class_id": class_id,
            "old_pointer": old_pointer,
            "canonical_pointer": f"/failure_classifications/{indexes[class_id]}",
            "field_aliases": fields,
            "expected_classification_equal": True,
            "expected_text_reconstruction": {
                "source_fields": ["condition", "expected_preserved.contract_detail"],
                "separator": " ",
                "type_equal": True,
                "value_equal": True,
                "sha256": sha(reconstructed.encode("utf-8")),
            },
        })
    return proof


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--record", action="store_true", help="内容hash名の新規監査JSONを排他的に保存")
    args = parser.parse_args()

    base_l9_bytes = read_at(BASE_REV, L9)
    current_l9_bytes = (ROOT / L9).read_bytes()
    base_l4_bytes = read_at(BASE_REV, L4)
    current_l4_bytes = (ROOT / L4).read_bytes()
    base_l5_bytes = read_at(BASE_REV, L5)
    current_l5_bytes = (ROOT / L5).read_bytes()
    history_l4_bytes = read_at(HISTORY_REV, L4)
    if sha(history_l4_bytes) != HISTORY_L4_SHA256:
        fail("固定R2 L4 history SHA-256が不一致")
    if sha(current_l4_bytes) != L4_R2_ALIAS_SHA256:
        fail("現行L4 pinが期待revisionの値と異なる")
    if current_l4_bytes != base_l4_bytes or current_l5_bytes != base_l5_bytes:
        fail("今回のL9移行でL4/L5 sourceが変更されている")
    base_l9 = json.loads(base_l9_bytes)
    current_l9 = json.loads(current_l9_bytes)
    current_l4 = json.loads(current_l4_bytes)
    history_l4 = json.loads(history_l4_bytes)
    history_old = nested_class_rows(history_l4)
    indexes, canonical = canonical_class_rows(current_l4)
    alias_proof = compare_aliases(history_old, indexes, canonical)

    before_refs = {path: value for path, value in walk_strings(base_l9) if nested_reference(value) is not None}
    current_strings = dict(walk_strings(current_l9))
    after_raw_nested = {path: value for path, value in current_strings.items() if nested_reference(value) is not None}
    after_refs = {path: current_strings.get(path) for path in before_refs}
    if len(before_refs) != 583 or len(after_raw_nested) != 3 or any(not isinstance(value, str) for value in after_refs.values()):
        fail(f"L9 nested ref件数が不一致: before={len(before_refs)} after_nested={len(after_raw_nested)}")
    if len(before_refs) != len(set(before_refs)):
        fail("L9 base consumer locationが重複")

    # Each R2 consumer is either redirected to its same class alias or retained
    # as one of the three fixed-history audit references. All nonpointer bytes
    # and all other L9 meaning must stay unchanged.
    retained = []
    redirected = 0
    section_counts: Counter[str] = Counter()
    historical_targets: list[dict[str, Any]] = []
    reverse_rewrites: dict[str, str] = {}
    for location, old_value in before_refs.items():
        old_path, old_pointer = nested_reference(old_value)  # type: ignore[misc]
        if location in HISTORIC_LOCATIONS:
            if old_pointer != old_value and old_path not in (None, L4):
                fail(f"歴史pointer path不一致: {location}")
            if location not in after_refs or after_refs[location] != old_value:
                fail(f"固定履歴pointerは変更せず保持する: {location}")
            target = resolve(history_l4, old_pointer)
            if location == "/negative_class_assignment_audit/unassigned_single_contract_negative_cases/0/source_pointers/0/pointer":
                if not isinstance(target, list) or len(target) != 14:
                    fail("R2の14-class collectionが固定履歴で解決しない")
                ids = [row.get("code") for row in target]
                if any(not isinstance(item, str) or item not in indexes for item in ids):
                    fail("R2 collectionのclass IDが現行canonical aliasにない")
                current_collection = resolve(current_l4, old_pointer)
                if type(current_collection) is not list or current_collection != target:
                    fail("R2 14-class collectionの順序・値が現行L4に維持されていない")
                historical_targets.append({"consumer_location": location, "case_id": "SEC009-COMPOUND-OS-UNKNOWN-CREDENTIAL-UNAPPLIED-WORKER-CONTINUES", "pointer": old_pointer, "target_type": "array", "element_count": len(target), "class_ids": ids})
            else:
                if not isinstance(target, dict) or target.get("code") not in indexes:
                    fail(f"R2未割当class候補が固定履歴にない: {location}")
                current_target = resolve(current_l4, old_pointer)
                if type(current_target) is not dict or current_target != target:
                    fail(f"未割当候補の現行L4 nested valueが固定historyと異なる: {location}")
                historical_targets.append({"consumer_location": location, "pointer": old_pointer, "class_id": target["code"], "target_type": "object", "value_sha256": sha(json.dumps(target, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode("utf-8"))})
            retained.append(location)
            continue

        ref_path, pointer = parse_l4_reference(old_value)
        match = NESTED.fullmatch(pointer)
        if match is None:
            fail(f"非歴史consumerがclass row以外を指す: {location} => {old_value}")
        old_target = resolve(history_l4, pointer)
        class_id = old_target.get("code") if isinstance(old_target, dict) else None
        if class_id not in indexes:
            fail(f"nested classに対応するcanonical aliasがない: {location} => {old_value}")
        new_pointer = f"/failure_classifications/{indexes[class_id]}"
        replacement = f"{ref_path}#{new_pointer}" if ref_path else new_pointer
        if after_refs.get(location) != replacement:
            fail(f"consumer redirect先がclass aliasと一致しない: {location}")
        # Prove all assigned class consumers resolve to the same code/semantic
        # data using the full field proof; this also covers code/expected_text.
        new_target = resolve(current_l4, new_pointer)
        if new_target.get("class_id") != class_id:
            fail(f"consumer redirect先class ID不一致: {location}")
        reverse_rewrites[location] = old_value
        redirected += 1
        section_counts[location.split("/")[1]] += 1

    if redirected != 580 or len(retained) != 3 or section_counts != Counter({"cases": 550, "negative_class_assignment_audit": 30}):
        fail(f"L9 redirect分割が不一致: redirected={redirected}, retained={len(retained)}, sections={dict(section_counts)}")

    # Restore only the 580 pointer strings in memory and compare the full L9
    # JSON with its pre-migration fixed revision. No other source field changed.
    restored = json.loads(json.dumps(current_l9, ensure_ascii=False))
    def set_at(root: Any, pointer: str, value: str) -> None:
        tokens = pointer.strip("/").split("/")
        node = root
        for token in tokens[:-1]:
            token = token.replace("~1", "/").replace("~0", "~")
            node = node[int(token)] if isinstance(node, list) else node[token]
        leaf = tokens[-1].replace("~1", "/").replace("~0", "~")
        if isinstance(node, list):
            node[int(leaf)] = value
        else:
            node[leaf] = value
    for location, value in reverse_rewrites.items():
        set_at(restored, location, value)
    if restored != base_l9:
        fail("580 pointer書換え以外にL9 source semantic差分がある")

    # The 3 retained pointers resolve identically at the fixed R2 revision and
    # at the current L4. Keep L5's 30 raw refs and the binding pending.
    l5 = read_json(L5)
    l5_nested = [(path, value) for path, value in walk_strings(l5) if nested_reference(value) is not None]
    if len(l5_nested) != 30:
        fail(f"L5 nested pointer件数が予期せず変化: {len(l5_nested)}")
    binding = read_json("scaffold/bindings/SCF-B-0209.json")
    if binding.get("status") != "pending" and binding.get("replacement", {}).get("status") != "pending":
        # Current binding schema stores replacement.status; tolerate the known
        # state field only when it still explicitly remains pending.
        fail("SCF-B-0209 transfer状態がpendingでない")
    l9_pins = [row for row in binding.get("upstream", []) if row.get("path") == L9]
    if len(l9_pins) != 1 or l9_pins[0].get("sha256") != sha(current_l9_bytes):
        fail("SCF-B-0209 L9 current pinが移行後bytesと不一致")

    result = {
        "schema": "wr255-sec009-l9-pointer-transfer.v1",
        "evidence_kind": "scaffold",
        "authority_effect": "none",
        "source_revisions": {"pre_transfer_l9": BASE_REV, "fixed_r2_history": HISTORY_REV},
        "source_sha256": {"pre_transfer_l9": sha(base_l9_bytes), "current_l9": sha(current_l9_bytes), "current_l4": sha(current_l4_bytes), "fixed_r2_l4": sha(history_l4_bytes)},
        "L9_pointer_disposition": {"pre_transfer_nested_string_count": len(before_refs), "redirected_to_current_L4_alias": redirected, "retained_fixed_history_references": len(retained), "redirected_by_section": dict(section_counts), "retained_locations": retained},
        "current_alias_proof": {"class_count": len(alias_proof), "fields": FIELD_MAP, "all_types_and_values_equal": True, "expected_text_reconstruction_count": len(alias_proof), "classes": alias_proof},
        "fixed_history": {"revision": HISTORY_REV, "L4_sha256": HISTORY_L4_SHA256, "retained_targets": historical_targets, "all_targets_equal_current_nested_values": True},
        "L5_pending": {"current_nested_pointer_count": len(l5_nested), "changed": False},
        "L4_nested_payloads": {"changed": False, "retained_for_L5_and_fixed_history": True},
        "SCF-B-0209": {"status": "pending", "check_replacement": "not run; other V-pair/L5 consumers remain", "retire": "not eligible"},
    }
    rendered = json.dumps(result, ensure_ascii=False, indent=2) + "\n"
    if args.record:
        target = HERE / f"l9-pointer-transfer-audit-{sha(current_l9_bytes)[:16]}.json"
        if target.exists():
            if target.read_text(encoding="utf-8") != rendered:
                fail(f"既存監査artifactを上書きしない: {target.name}")
        else:
            target.write_text(rendered, encoding="utf-8")
        result["audit_path"] = str(target.relative_to(ROOT))
    print(json.dumps({
        "status": "PASS",
        "pre_transfer_nested": len(before_refs),
        "redirected_to_current_alias": redirected,
        "retained_fixed_history": len(retained),
        "alias_class_count": len(alias_proof),
        "expected_text_reconstruction_count": len(alias_proof),
        "L5_nested_refs_unchanged": len(l5_nested),
        "SCF-B-0209": "pending",
        "audit_path": result.get("audit_path"),
    }, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except (KeyError, IndexError, TypeError, ValueError, OSError, subprocess.CalledProcessError) as exc:
        print(f"FAIL: {exc}", file=sys.stderr)
        raise SystemExit(1)
