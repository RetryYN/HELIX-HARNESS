#!/usr/bin/env python3
"""SEC009 SCF-B-0209 L8 consumer-transfer audit (static only)."""
from __future__ import annotations

import argparse
import hashlib
import importlib.util
import json
import subprocess
import sys
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[3]
L4 = "docs/helix-security/L4-basic-design/revoke-quarantine-propagation.json"
L8 = "docs/helix-security/L8-unit-verification/revoke-quarantine-propagation.json"
L9 = "docs/helix-security/L9-integration-verification/revoke-quarantine-propagation.json"
CHECKER = "scaffold/tools/design_verification_checker.py"
HISTORY_REV = "c50eb21b34f034262ced3f8052d2502fb84c57c9"
HISTORY_L4_SHA256 = "d46e39cad2e2a90cfc532fa57226a4d650336e794a375f07e1cc2e6cbba15eb3"
PRE_TRANSFER_L8_REV = "24d7f00bdca41c3dfb1f3137655ffdbe3674cfb3"
PRE_TRANSFER_L8_SHA256 = "91da3af2c6ad997fdf265871f9776c5bed41f196fbccfc2276e1a41f42a267bb"


def fail(message: str) -> None:
    raise ValueError(message)


def read_json(path: str) -> Any:
    return json.loads((ROOT / path).read_text(encoding="utf-8"))


def read_at(revision: str, path: str) -> Any:
    raw = subprocess.check_output(["git", "show", f"{revision}:{path}"], cwd=ROOT)
    return json.loads(raw.decode("utf-8"))


def sha_bytes(raw: bytes) -> str:
    return hashlib.sha256(raw).hexdigest()


def sha_file(path: str) -> str:
    return sha_bytes((ROOT / path).read_bytes())


def resolve(doc: Any, pointer: str) -> Any:
    if pointer == "":
        return doc
    if not pointer.startswith("/"):
        fail(f"不正なJSON Pointer: {pointer}")
    value = doc
    for raw in pointer[1:].split("/"):
        part = raw.replace("~1", "/").replace("~0", "~")
        if isinstance(value, list):
            value = value[int(part)]
        elif isinstance(value, dict):
            value = value[part]
        else:
            fail(f"JSON Pointerが解決不能: {pointer}")
    return value


def esc(segment: str) -> str:
    return segment.replace("~", "~0").replace("/", "~1")


def walk_case_basis(node: Any, pointer: str = "") -> list[dict[str, Any]]:
    found: list[dict[str, Any]] = []
    if isinstance(node, dict):
        basis = node.get("basis_pointers")
        if isinstance(basis, list):
            for index, item in enumerate(basis):
                if isinstance(item, str) and item.startswith(L4 + "#"):
                    target = item.split("#", 1)[1]
                    if (
                        ("/contracts/" in target and "/negative_classifications/" in target)
                        or target.startswith("/failure_classifications/")
                    ):
                        found.append({
                            "consumer_location": f"{pointer}/basis_pointers/{index}",
                            "consumer_case_id": node.get("id"),
                            "reference": item,
                        })
        for key, value in node.items():
            found.extend(walk_case_basis(value, f"{pointer}/{esc(key)}"))
    elif isinstance(node, list):
        for index, value in enumerate(node):
            found.extend(walk_case_basis(value, f"{pointer}/{index}"))
    return found


def structured_refs(rows: list[dict[str, Any]], group: str) -> list[dict[str, Any]]:
    out = []
    for index, row in enumerate(rows):
        for key, value in row.items():
            refs = [value] if isinstance(value, dict) else value if isinstance(value, list) else []
            for ref_index, ref in enumerate(refs):
                if not isinstance(ref, dict) or ref.get("path") != L4:
                    continue
                pointer = ref.get("pointer")
                if not isinstance(pointer, str) or "/contracts/" not in pointer or "/negative_classifications" not in pointer:
                    continue
                loc = f"/{group}/{index}/{esc(key)}"
                if isinstance(value, list):
                    loc += f"/{ref_index}"
                out.append({
                    "consumer_location": loc,
                    "consumer_case_id": row.get("id") or row.get("case_id") or row.get("code"),
                    "reference": ref,
                })
    return out


def canonical_pointer_by_id(l4: dict[str, Any]) -> dict[str, str]:
    return {
        row["class_id"]: f"/failure_classifications/{index}"
        for index, row in enumerate(l4["failure_classifications"])
    }


def load_checker_module():
    spec = importlib.util.spec_from_file_location("design_verification_checker", ROOT / CHECKER)
    if spec is None or spec.loader is None:
        fail("現行checker moduleを読めない")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--record", action="store_true", help="source hash名で新規監査記録を排他的に作成")
    args = parser.parse_args()

    l4, l8, l9 = read_json(L4), read_json(L8), read_json(L9)
    historical_l4 = read_at(HISTORY_REV, L4)
    hist_bytes = subprocess.check_output(["git", "show", f"{HISTORY_REV}:{L4}"], cwd=ROOT)
    if sha_bytes(hist_bytes) != HISTORY_L4_SHA256:
        fail("固定R2履歴L4のSHA-256が一致しない")
    prior_l8_bytes = subprocess.check_output(["git", "show", f"{PRE_TRANSFER_L8_REV}:{L8}"], cwd=ROOT)
    if sha_bytes(prior_l8_bytes) != PRE_TRANSFER_L8_SHA256:
        fail("pointer移行前L8の固定履歴hashが一致しない")
    prior_l8 = json.loads(prior_l8_bytes.decode("utf-8"))
    prior_l4 = read_at(PRE_TRANSFER_L8_REV, L4)
    prior_f02_pointer = prior_l8["positive_case_expectation_source_review"]["positive_cases"][7]["L4_sources"][1]["pointer"]
    current_f02_pointer = l8["positive_case_expectation_source_review"]["positive_cases"][7]["L4_sources"][1]["pointer"]
    prior_f02_ok = False
    # The former pointer was dangling in the L4 source pinned by the prior L8 snapshot.
    try:
        resolve(prior_l4, prior_f02_pointer)
        prior_f02_ok = True
    except (KeyError, IndexError, ValueError, TypeError):
        prior_f02_ok = False
    if prior_f02_ok or current_f02_pointer != "/architecture/locality":
        fail("L8 F02 locality source pointer correction does not match source structure")
    f02_locality = resolve(l4, current_f02_pointer)
    if not isinstance(f02_locality, dict) and not isinstance(f02_locality, str):
        fail("L4 F02 locality target has an unexpected type")

    class_ptrs = canonical_pointer_by_id(l4)
    old_class_by_id: dict[str, tuple[str, dict[str, Any]]] = {}
    for contract_index, contract in enumerate(historical_l4["contracts"]):
        for class_index, old_row in enumerate(contract.get("negative_classifications", [])):
            class_id = old_row.get("code")
            if not isinstance(class_id, str) or class_id in old_class_by_id:
                fail(f"R2 nested class IDが欠落または重複: {class_id}")
            old_class_by_id[class_id] = (
                f"/contracts/{contract_index}/negative_classifications/{class_index}",
                old_row,
            )
    if len(old_class_by_id) != 30 or not set(old_class_by_id).issubset(class_ptrs):
        fail("R2 30 classと現行canonical classの集合が一致しない")

    field_map = {
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
    projection_by_class: dict[str, Any] = {}
    for class_id, (old_pointer, old_row) in old_class_by_id.items():
        current_pointer = class_ptrs[class_id]
        canonical = resolve(l4, current_pointer)
        fields = {}
        for old_field, new_field in field_map.items():
            same_type = type(old_row.get(old_field)) is type(canonical.get(new_field))
            same_value = old_row.get(old_field) == canonical.get(new_field)
            fields[old_field] = {"canonical_field": new_field, "type_equal": same_type, "value_equal": same_value}
            if not same_type or not same_value:
                fail(f"class alias field differs: {class_id}.{old_field} -> {new_field}")
        reconstructed_text = canonical.get("condition") + " " + canonical.get("expected_preserved", {}).get("contract_detail", "")
        expected_text = old_row.get("expected_text")
        text_equal = type(expected_text) is str and type(reconstructed_text) is str and expected_text == reconstructed_text
        if not text_equal:
            fail(f"expected_textを同値再構成できない: {class_id}")
        projection_by_class[class_id] = {
            "r2_pointer": old_pointer,
            "canonical_pointer": current_pointer,
            "field_map": fields,
            "legacy_code_alias": {"source_field": "code", "target_field": "class_id", "value_equal": True, "type_equal": True},
            "expected_text_reconstruction": {
                "source_fields": ["condition", "expected_preserved.contract_detail"],
                "separator": " ",
                "value_equal": True,
                "type_equal": True,
                "sha256": sha_bytes(reconstructed_text.encode("utf-8")),
            },
        }

    wrapper_rows = walk_case_basis(l8.get("cases", []), "/cases")
    if len(wrapper_rows) != 275:
        fail(f"case wrapper consumer数が275でない: {len(wrapper_rows)}")
    for row in wrapper_rows:
        reference = row["reference"]
        path, pointer = reference.split("#", 1)
        target = resolve(l4, pointer)
        class_id = target.get("class_id")
        if path != L4 or class_id not in projection_by_class or pointer != class_ptrs[class_id]:
            fail(f"case wrapperのcurrent aliasが不正: {row['consumer_location']}")
        row.update({"migration": "current_canonical_alias", "class_id": class_id, "target_pointer": pointer})

    tax_rows = l8.get("negative_class_assignment_audit", {}).get("fixed_taxonomy_source_pointers", [])
    taxonomy_consumers = []
    for index, row in enumerate(tax_rows):
        ref = row.get("L4", {})
        pointer = ref.get("pointer")
        class_id = row.get("code")
        if ref.get("path") != L4 or class_id not in projection_by_class or pointer != class_ptrs[class_id]:
            fail(f"taxonomy pointerのcurrent aliasが不正: {index}")
        taxonomy_consumers.append({
            "consumer_location": f"/negative_class_assignment_audit/fixed_taxonomy_source_pointers/{index}/L4/pointer",
            "consumer_case_id": class_id,
            "migration": "current_canonical_alias",
            "class_id": class_id,
            "target_pointer": pointer,
        })
    if len(taxonomy_consumers) != 30:
        fail(f"taxonomy consumer数が30でない: {len(taxonomy_consumers)}")

    history_consumers = []
    for row_index, row in enumerate(l8.get("negative_class_assignment_audit", {}).get("unassigned_single_contract_negative_cases", [])):
        case_id = row.get("case_id")
        for ref_index, ref in enumerate(row.get("source_pointers", [])):
            if ref.get("path") != L4 or "/negative_classifications" not in ref.get("pointer", ""):
                continue
            pointer = ref["pointer"]
            if ref.get("revision") != HISTORY_REV:
                fail(f"未割当監査pointerに固定revisionがない: {case_id} {pointer}")
            target = resolve(historical_l4, pointer)
            if pointer == "/contracts/1/negative_classifications":
                if not isinstance(target, list) or len(target) != 14:
                    fail("R2 F01 collection fan-outが14要素でない")
                codes = [x.get("code") for x in target]
                expected = [x.get("code") for x in historical_l4["contracts"][1]["negative_classifications"]]
                if codes != expected:
                    fail("R2 F01 collection順序が変わった")
            elif not isinstance(target, dict):
                fail(f"R2単体class referenceがobjectでない: {case_id} {pointer}")
            history_consumers.append({
                "consumer_location": f"/negative_class_assignment_audit/unassigned_single_contract_negative_cases/{row_index}/source_pointers/{ref_index}",
                "consumer_case_id": case_id,
                "migration": "fixed_r2_revision",
                "revision": HISTORY_REV,
                "pointer": pointer,
                "target_type": type(target).__name__,
                "target_count": len(target) if isinstance(target, list) else 1,
                "target_sha256": sha_bytes(json.dumps(target, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode("utf-8")),
                "meaning": "R2時点の未割当根拠を維持する固定参照",
            })
    if len(history_consumers) != 3:
        fail(f"historic/unassigned consumer数が3でない: {len(history_consumers)}")

    l8_consumers = wrapper_rows + taxonomy_consumers + history_consumers
    if len(l8_consumers) != 308:
        fail(f"L8 consumer総数が308でない: {len(l8_consumers)}")

    l9_wrapper_rows = walk_case_basis(l9.get("cases", []), "/cases")
    l9_tax_rows = l9.get("negative_class_assignment_audit", {}).get("fixed_taxonomy_source_pointers", [])
    l9_audit_rows = l9.get("negative_class_assignment_audit", {}).get("unassigned_single_contract_negative_cases", [])
    l9_old = []
    for row in l9_wrapper_rows:
        path, pointer = row["reference"].split("#", 1)
        if path == L4 and "/contracts/" in pointer and "/negative_classifications" in pointer:
            resolve(l4, pointer)
            l9_old.append(pointer)
    for row in l9_tax_rows:
        ref = row.get("L4", {})
        if ref.get("path") == L4 and "/negative_classifications" in ref.get("pointer", ""):
            resolve(l4, ref["pointer"])
            l9_old.append(ref["pointer"])
    for row in l9_audit_rows:
        for ref in row.get("source_pointers", []):
            if ref.get("path") == L4 and "/negative_classifications" in ref.get("pointer", ""):
                resolve(l4, ref["pointer"])
                l9_old.append(ref["pointer"])
    if len(l9_old) != 308:
        fail(f"L9 nested consumer数が308でない: {len(l9_old)}")

    checker = load_checker_module()
    pointer_report = checker.check_json_pointer(ROOT, L8, data=l8, head_rev="WORKTREE")
    if not pointer_report.get("passed"):
        fail(f"CHK-JSON-POINTERに失敗: {pointer_report.get('failures', [])[:3]}")
    explicit_mode = all(
        checker._has_negative_equivalence_marker(read_json(path))
        for path in (
            "docs/helix-security/L4-basic-design/revoke-quarantine-propagation.json",
            "docs/helix-security/L5-detail-design/revoke-quarantine-propagation.json",
            L8,
            L9,
        )
    )
    if not explicit_mode:
        fail("4層全てのexplicit class markerが揃っていない")

    source_hashes = {path: sha_file(path) for path in (L4, L8, L9, CHECKER)}
    source_revisions = {
        path: subprocess.check_output(["git", "log", "-1", "--format=%H", "--", path], cwd=ROOT, text=True).strip()
        for path in (L4, L8, L9, CHECKER)
    }
    report = {
        "schema": "sec009-scf-b-0209-pointer-transfer-audit.v1",
        "evidence_kind": "scaffold",
        "authority_effect": "none",
        "operation_effect": "none",
        "source_hashes": source_hashes,
        "source_revisions": source_revisions,
        "historical_l4": {"revision": HISTORY_REV, "sha256": HISTORY_L4_SHA256},
        "corrected_prior_pointer": {
            "source_revision": PRE_TRANSFER_L8_REV,
            "source_sha256": PRE_TRANSFER_L8_SHA256,
            "consumer_location": "/positive_case_expectation_source_review/positive_cases/7/L4_sources/1/pointer",
            "old_pointer": prior_f02_pointer,
            "old_pointer_resolved": False,
            "current_pointer": current_f02_pointer,
            "current_pointer_resolved": True,
            "reason": "L4ではF02 localityは/architecture/localityに置かれており、旧/diagnostic_contract/localityは未解決だった。旧bytesは固定Git revisionから取得できる。",
        },
        "counts": {
            "L8_total": len(l8_consumers),
            "L8_current_canonical_aliases": len(wrapper_rows) + len(taxonomy_consumers),
            "L8_case_wrappers": len(wrapper_rows),
            "L8_fixed_taxonomy_pointers": len(taxonomy_consumers),
            "L8_historical_unassigned_refs": len(history_consumers),
            "L8_historic_collection_fanout": 14,
            "L9_total": len(l9_old),
            "L9_still_on_current_nested_paths": len(l9_old),
            "canonical_classes_projection_checked": len(projection_by_class),
            "CHK_JSON_POINTER_checked": pointer_report["checked_count"],
            "CHK_JSON_POINTER_expanded": pointer_report["expanded_target_count"],
        },
        "read_behavior": {
            "active_mode": "explicit_negative_equivalence_classes",
            "explicit_mode_uses_top_level_class_tables": True,
            "CHK_JSON_POINTER": "参照先の存在解決を行う。構造化referenceのrevision fieldをgit showの固定revisionとして解決する。",
            "legacy_mode": "checkerはmarkerがない場合にnested negative_classificationsを読む。今回の移行では全4層のexplicit markerを維持する。",
            "expected_text_reader": "現行CHK-JSON-POINTERとexplicit 4-way checkerはnested expected_textを消費しない。人間向けsource意味は下記のfield projection表で検証する。",
            "explicit_marker_all_layers": explicit_mode,
            "pointer_check_passed": pointer_report["passed"],
        },
        "canonical_projection_by_class_id": projection_by_class,
        "L8_consumers": l8_consumers,
        "L9_pending_transfer": {
            "status": "separate_l4_l9_v_pair_required",
            "consumer_count": len(l9_old),
            "all_targets_resolve_current_L4_nested_paths": True,
            "reason": "L9は別V-pairの正式sourceであり、L5/L8 PRから変更しない。L9側も同じprojection/historic splitを検証し、転送完了後にのみ全体retire判定を行う。",
        },
        "retirement": {
            "SCF-B-0209_status": "pending",
            "check_replacement_performed": False,
            "retire_performed": False,
            "reason": "L9の308 consumer transferと全件reviewが未完了。L4 nested payloadを保持する。",
        },
    }

    if args.record:
        stem = f"{source_hashes[L8][:12]}-{source_hashes[L9][:12]}"
        out = ROOT / "scaffold/research/wr255-sec009-l5l8-audit-20261101" / f"pointer-transfer-audit-{stem}.json"
        rendered = json.dumps(report, ensure_ascii=False, indent=2) + "\n"
        try:
            with out.open("x", encoding="utf-8") as stream:
                stream.write(rendered)
        except FileExistsError:
            if out.read_text(encoding="utf-8") != rendered:
                fail(f"append-only evidence path already exists with different content: {out.name}")
    else:
        out = None

    print(json.dumps({"passed": True, "counts": report["counts"], "record": str(out) if out else None}, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except (KeyError, IndexError, TypeError, ValueError, OSError, subprocess.CalledProcessError) as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        raise SystemExit(1)
