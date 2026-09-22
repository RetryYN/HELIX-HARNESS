#!/usr/bin/env python3
"""SCF-B-0103の静的validator。旧archiveの実行面は呼び出さない。"""
from __future__ import annotations

import hashlib
import json
import subprocess
import sys
from functools import lru_cache
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
BUNDLE = Path(__file__).resolve().parent
BASE_HEAD = "36784d25aa4cc53d89c28c2ff81b4009db234605"
IDS = {"HIL-FR-01", "HIL-FR-11", "HIL-FR-15", "HIL-FR-16", "HIL-FR-37", "HIL-FR-41", "HIL-FR-57"}
PRODUCTS = ("HELIX-HARNESS", "HELIX-OS", "HELIX-Web", "HELIX-Web-OS")
L1_LINES = {
    "HELIX-HARNESS": ("docs/helix-harness/L1-planning/product-intent.md", 22),
    "HELIX-OS": ("docs/helix-os/L1-planning/system-intent.md", 22),
    "HELIX-Web": ("docs/helix-web/L1-planning/product-intent.md", 24),
    "HELIX-Web-OS": ("docs/helix-web-os/L1-planning/system-intent.md", 15),
}
BOUNDARY_LINES = {"HELIX-HARNESS": 36, "HELIX-OS": 37, "HELIX-Web": 38, "HELIX-Web-OS": 39}
BOUNDARY_CONTEXT_LINES = (59, 60, 61, 86, 87, 88, 89)
BOUNDARY_PATH = "docs/concept/product-boundary.md"
OLD_IR = "archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json"
CORRECTIONS = "docs/governance/legacy-ir-product-routing-corrections.jsonl"
ROUTING = "docs/governance/legacy-ir-product-routing-bootstrap.jsonl"
DECOMP = "docs/governance/legacy-ir-product-unit-decomposition-bootstrap.jsonl"
CROSSWALK = "docs/governance/legacy-requirement-implementation-crosswalk-bootstrap.jsonl"
LEDGER = "docs/governance/legacy-asset-disposition.jsonl"
PHASE = "docs/governance/legacy-asset-phase-product-classification-bootstrap.jsonl"
DECISIONS = "docs/governance/legacy-asset-decisions.jsonl"
READ_AFTER = "docs/governance/legacy-asset-copy-read-after.jsonl"
FAILURE = "docs/governance/audits/source-rebaseline/legacy-ci-ai-runtime-source-inventory.md"
CONSUMER = "docs/governance/audits/source-rebaseline/legacy-ci-consumer-relation-inventory.md"
WAVE_FILES = {
    "HIL-FR-01": "docs/governance/legacy-requirement-direct-semantic-review-wave23.jsonl",
    "HIL-FR-11": "docs/governance/legacy-requirement-direct-semantic-review-wave27.jsonl",
    "HIL-FR-15": "docs/governance/legacy-requirement-direct-semantic-review-wave28.jsonl",
    "HIL-FR-16": "docs/governance/legacy-requirement-direct-semantic-review-wave28.jsonl",
    "HIL-FR-37": "docs/governance/legacy-requirement-direct-semantic-review-wave34.jsonl",
    "HIL-FR-41": "docs/governance/legacy-requirement-direct-semantic-review-wave33.jsonl",
    "HIL-FR-57": "docs/governance/legacy-requirement-direct-semantic-review-wave36.jsonl",
}
WAVE_METHODS = {
    23: ("docs/governance/audits/source-rebaseline/legacy-requirement-direct-semantic-review-wave23-method-2026-09-21.md", "docs/governance/audits/source-rebaseline/legacy-requirement-direct-semantic-review-wave23-premise-packet-2026-09-21.md"),
    27: ("docs/governance/audits/source-rebaseline/legacy-requirement-direct-semantic-review-wave27-method-2026-09-22.md", "docs/governance/audits/source-rebaseline/legacy-requirement-direct-semantic-review-wave27-premise-packet-2026-09-22.md"),
    28: ("docs/governance/audits/source-rebaseline/legacy-requirement-direct-semantic-review-wave28-method-2026-09-22.md", "docs/governance/audits/source-rebaseline/legacy-requirement-direct-semantic-review-wave28-premise-packet-2026-09-22.md"),
    33: (None, "docs/governance/audits/source-rebaseline/legacy-requirement-direct-semantic-review-wave33-premise-packet-2026-09-22.md"),
    34: ("docs/governance/audits/source-rebaseline/legacy-requirement-direct-semantic-review-wave34-method-2026-09-22.md", "docs/governance/audits/source-rebaseline/legacy-requirement-direct-semantic-review-wave34-premise-packet-2026-09-22.md"),
    36: ("docs/governance/audits/source-rebaseline/legacy-requirement-direct-semantic-review-wave36-method-2026-09-22.md", "docs/governance/audits/source-rebaseline/legacy-requirement-direct-semantic-review-wave36-premise-packet-2026-09-22.md"),
}
BOUNDARY_INTERPRETATION = "HARNESSはV-model・工程・要求・設計・検証・外部提供の規範、HELIX-OSはauthority・Worker・CI・log・state・改善・配布の運転統制を持つ。管理対象と規則所有を同一ownerへ潰さず、correctionは正式routingへ昇格しない。"
EXPECTED_INPUT_PATHS = [
    OLD_IR, CORRECTIONS, ROUTING, DECOMP, CROSSWALK, BOUNDARY_PATH,
    "docs/helix-harness/L1-planning/product-intent.md",
    "docs/helix-os/L1-planning/system-intent.md",
    "docs/helix-web/L1-planning/product-intent.md",
    "docs/helix-web-os/L1-planning/system-intent.md",
    LEDGER, PHASE, DECISIONS, READ_AFTER, FAILURE, CONSUMER,
    "docs/governance/legacy-requirement-direct-semantic-review-wave23.jsonl",
    "docs/governance/legacy-requirement-direct-semantic-review-wave27.jsonl",
    "docs/governance/legacy-requirement-direct-semantic-review-wave28.jsonl",
    "docs/governance/legacy-requirement-direct-semantic-review-wave33.jsonl",
    "docs/governance/legacy-requirement-direct-semantic-review-wave34.jsonl",
    "docs/governance/legacy-requirement-direct-semantic-review-wave36.jsonl",
    "docs/governance/audits/source-rebaseline/legacy-requirement-direct-semantic-review-wave23-method-2026-09-21.md",
    "docs/governance/audits/source-rebaseline/legacy-requirement-direct-semantic-review-wave23-premise-packet-2026-09-21.md",
    "docs/governance/audits/source-rebaseline/legacy-requirement-direct-semantic-review-wave27-method-2026-09-22.md",
    "docs/governance/audits/source-rebaseline/legacy-requirement-direct-semantic-review-wave27-premise-packet-2026-09-22.md",
    "docs/governance/audits/source-rebaseline/legacy-requirement-direct-semantic-review-wave28-method-2026-09-22.md",
    "docs/governance/audits/source-rebaseline/legacy-requirement-direct-semantic-review-wave28-premise-packet-2026-09-22.md",
    "docs/governance/audits/source-rebaseline/legacy-requirement-direct-semantic-review-wave33-premise-packet-2026-09-22.md",
    "docs/governance/audits/source-rebaseline/legacy-requirement-direct-semantic-review-wave34-method-2026-09-22.md",
    "docs/governance/audits/source-rebaseline/legacy-requirement-direct-semantic-review-wave34-premise-packet-2026-09-22.md",
    "docs/governance/audits/source-rebaseline/legacy-requirement-direct-semantic-review-wave36-method-2026-09-22.md",
    "docs/governance/audits/source-rebaseline/legacy-requirement-direct-semantic-review-wave36-premise-packet-2026-09-22.md",
]
EXPECTED_AFTER = {rid: ["HELIX-HARNESS", "HELIX-OS"] for rid in IDS}
BEFORE_PRODUCT = {
    "HIL-FR-01": "HELIX-OS", "HIL-FR-11": "HELIX-HARNESS", "HIL-FR-15": "HELIX-OS",
    "HIL-FR-16": "HELIX-OS", "HIL-FR-37": "HELIX-OS", "HIL-FR-41": "HELIX-HARNESS",
    "HIL-FR-57": "HELIX-HARNESS",
}
EXPECTED_HUMAN_JUDGMENT = [
    "POがcorrection before／afterの意味差分を対象revision付きで採否するまでeffective routingへ昇格しない。",
    "normative contract／ruleとOSの運転・記録・保持をどのsource atomへ割り当てるかを決め、追加unitのexact source spanを固定する。",
    "unit、connection、compositeの境界、single ownerの有無、phase、consumer、successor、L2/L11接続を別々に決める。",
    "旧asset候補のsource/history/failure/consumerを直接意味linkへ昇格するかを個別に判断する。",
]
EXPECTED_NEGATIVE_CASES = [
    "duplicate_id", "record_count_guard", "missing_id", "correction_digest_tamper", "source_anchor_tamper", "source_digest_tamper", "before_candidate_tamper", "routing_reference_guard", "unit_impact_guard", "wave_digest_tamper", "wave_method_reference_guard", "boundary_reference_tamper", "l1_reference_tamper", "impact_count_tamper", "authority_promotion", "asset_digest_tamper", "asset_set_tamper", "human_judgment_tamper", "successor_promotion", "after_proposal_guard", "consumer_impact_guard", "successor_impact_guard", "projected_unit_guard", "impact_interpretation_guard", "asset_reference_guard", "asset_state_guard", "boundary_interpretation_guard", "correction_reference_guard", "crosswalk_reference_guard", "crosswalk_state_guard", "decomp_reference_guard", "failure_consumer_reference_guard", "history_reference_guard", "history_state_guard", "source_missing_guard", "wave_asset_guard", "input_digest_tamper", "input_set_missing", "input_set_duplicate", "input_set_extra", "input_blob_guard", "base_head_guard", "source_provenance_guard", "current_counts_guard", "inventory_guard", "legacy_execution_guard", "inventory_authority_guard", "base_ancestor_tamper",
]
WAVE_INTERPRETATION = "waveはexact source atom、候補phase/product、未完consumer／boundary reviewを保持する静的semantic review候補であり、correctionのPO承認や実装証拠ではない。"
BEFORE_UNIT_IMPACT_INTERPRETATION = "current decomposition candidate unit/connection/composite counts are derived from its fixed-BASE candidate_units"
PHASE_IMPACT_HUMAN_ACTION = "既存unitと追加候補unitの両方についてphase責務・source spanを対象revision付きで再審査する。既存phaseを新unitへ自動移送しない。"
CONSUMER_IMPACT_HUMAN_ACTION = "追加候補のconsumer、source/history/failure relationを直接意味linkとして再審査する。pendingをclosureへ昇格しない。"
SUCCESSOR_IMPACT_HUMAN_ACTION = "保持atom、未被覆atom、successor ID、L2/L11接続を人間が決める。"
CONNECTION_IMPACT_INTERPRETATION = "split_requiredは二つの候補unitを示すだけで、connection/composite成立を生成しない。"
SPLIT_RESPONSIBILITY = {
    "HIL-FR-01": "HARNESS候補: intakeからmerge／issueまでの工程順序を定義する規範。OS候補のstate運転・digest binding・event causalityと境界を再審査する。",
    "HIL-FR-11": "OS候補: Agent Registryの登録・版・保持を管理運転する規範。HARNESS候補のagent contract語彙・意味と境界を再審査する。",
    "HIL-FR-15": "HARNESS候補: ZIP metadata／trace等をHELIX契約へ変換する規範。OS候補の取込実行・観測・記録と境界を再審査する。",
    "HIL-FR-16": "HARNESS候補: 機能単位比較とadopt／harden／redesign／reject判断の規範。OS候補の観測・記録運転と境界を再審査する。",
    "HIL-FR-37": "HARNESS候補: atomic behavior定義とcoverage分母の規範。OS候補のextractor実行・記録と境界を再審査する。",
    "HIL-FR-41": "OS候補: template version、適用履歴、利用結果、改善の管理運転。HARNESS候補のschema・必須論点・適用条件の規範と境界を再審査する。",
    "HIL-FR-57": "OS候補: Judgment Pack Registryの版・保持を管理運転する規範。HARNESS候補の観点・反証質問・停止条件の意味と境界を再審査する。",
}


def error(code: str, message: str) -> str:
    return f"{code}: {message}"


@lru_cache(maxsize=None)
def base_bytes(path: str) -> bytes:
    return subprocess.check_output(["git", "show", f"{BASE_HEAD}:{path}"], cwd=ROOT)


@lru_cache(maxsize=None)
def blob(path: str) -> str:
    return subprocess.check_output(["git", "rev-parse", f"{BASE_HEAD}:{path}"], cwd=ROOT, text=True).strip()


def sha(value: bytes | str) -> str:
    return hashlib.sha256(value if isinstance(value, bytes) else value.encode("utf-8")).hexdigest()


def line_ref_expected(path: str, line: int, label: str | None = None):
    text = base_bytes(path).decode("utf-8").splitlines()[line - 1]
    result = {"path": path, "blob": blob(path), "line": line, "line_text": text, "line_text_sha256": sha(text)}
    if label:
        result["label"] = label
    return result


def jsonl_rows(path: str):
    rows, raw_by_line = [], {}
    for number, raw in enumerate(base_bytes(path).decode("utf-8").splitlines(), 1):
        if raw.strip():
            rows.append(json.loads(raw))
            raw_by_line[number] = raw
    return rows, raw_by_line


def index_rows(path: str, key: str):
    by_key, line_by_key = {}, {}
    for number, raw in enumerate(base_bytes(path).decode("utf-8").splitlines(), 1):
        if raw.strip():
            item = json.loads(raw)
            by_key[item.get(key)] = item
            line_by_key[item.get(key)] = number
    return by_key, line_by_key


def expected_jsonl_ref(path: str, line: int, label: str | None = None):
    raw = base_bytes(path).decode("utf-8").splitlines()[line - 1]
    result = line_ref_expected(path, line, label)
    result["row_sha256"] = sha(raw)
    return result


def wave_doc_refs_expected(requirement_id: str) -> list[dict]:
    wave_number = int(WAVE_FILES[requirement_id].split("wave")[1].split(".")[0])
    return [line_ref_expected(path, 1, "wave method/premise") for path in WAVE_METHODS[wave_number] if path]


def ancestor_errors(base: str = BASE_HEAD, head: str = "HEAD"):
    if subprocess.run(["git", "merge-base", "--is-ancestor", base, head], cwd=ROOT, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL).returncode:
        return [error("E_BASE_NOT_ANCESTOR", f"base={base} head={head}")]
    return []


def validate_inventory(inventory: dict, check_ancestor: bool = True):
    errors = []
    if inventory.get("base_head") != BASE_HEAD:
        errors.append(error("E_BASE_HEAD", f"base_head={inventory.get('base_head')}"))
    elif check_ancestor:
        errors.extend(ancestor_errors(inventory.get("base_head")))
    snapshot = inventory.get("source_snapshot", {})
    if snapshot.get("kind") != "fixed_git_object" or snapshot.get("base_head") != BASE_HEAD or snapshot.get("working_tree_used_for_source_digest") is not False:
        errors.append(error("E_SOURCE_PROVENANCE", "source snapshot provenance must be fixed BASE Git object"))
    if inventory.get("record_count") != 7 or inventory.get("requirement_ids") != sorted(IDS):
        errors.append(error("E_INVENTORY", "record_count/requirement_ids不一致"))
    if inventory.get("schema_revision") != 1 or inventory.get("binding_id") != "SCF-B-0103" or inventory.get("status") != "research_only_candidate" or inventory.get("correction_state") != "proposed_pending_po_review":
        errors.append(error("E_INVENTORY", "schema/binding/status/correction state drift"))
    snapshot = inventory.get("source_snapshot", {})
    if snapshot.get("blob_command") != "git rev-parse <BASE>:<path>" or snapshot.get("bytes_command") != "git show <BASE>:<path>":
        errors.append(error("E_SOURCE_PROVENANCE", "source snapshot command drift"))
    if inventory.get("authority_effect") != "none":
        errors.append(error("E_AUTHORITY_BOUNDARY", "inventory authority_effect must remain none"))
    if inventory.get("negative_cases") != EXPECTED_NEGATIVE_CASES:
        errors.append(error("E_INVENTORY", "negative_cases declaration must equal executable selfcheck cases"))
    actual_input_paths = [entry.get("path") for entry in inventory.get("input_digests", [])]
    if actual_input_paths != EXPECTED_INPUT_PATHS or len(actual_input_paths) != len(set(actual_input_paths)):
        errors.append(error("E_INPUT_SET", "input digest path集合／順序／重複が期待集合と不一致"))
    for entry in inventory.get("input_digests", []):
        path = entry.get("path")
        try:
            expected_blob, expected_sha = blob(path), sha(base_bytes(path))
        except (subprocess.CalledProcessError, IndexError, UnicodeDecodeError):
            errors.append(error("E_INPUT_DIGEST", f"input missing or unreadable: {path}"))
            continue
        if entry.get("blob") != expected_blob:
            errors.append(error("E_INPUT_BLOB", f"fixed BASE blob drift: {path}"))
        if entry.get("sha256") != expected_sha:
            errors.append(error("E_INPUT_DIGEST", f"fixed BASE bytes digest drift: {path}"))
    if inventory.get("formal_routing_updated") is not False or inventory.get("existing_ledgers_updated") is not False or inventory.get("successor_updated") is not False:
        errors.append(error("E_AUTHORITY_BOUNDARY", "formal ledger/routing/successor marked updated"))
    if inventory.get("legacy_execution_performed") is not False or inventory.get("new_build_allowed") is not False:
        errors.append(error("E_LEGACY_EXECUTION", "legacy execution or new build promoted"))
    current = inventory.get("current_decomposition", {})
    expected_current = {"record_count": 153, "unit_count": 218, "product_unit_count": 217, "product_counts": {"HELIX-HARNESS": 85, "HELIX-OS": 132, "HELIX-Web": 0, "HELIX-Web-OS": 0}, "connection_count": 1, "composite_count": 0, "phase_candidate_units": 188, "unresolved_phase_units": 30, "phase_links": 321, "successor_assigned": 0}
    if current != expected_current:
        errors.append(error("E_CURRENT_COUNTS", "current decomposition counts drift"))
    projected = inventory.get("projected_after_if_all_seven_adopted", {})
    expected_projected = {"applied": False, "unit_count": 225, "product_unit_count": 224, "product_counts": {"HELIX-HARNESS": 89, "HELIX-OS": 135, "HELIX-Web": 0, "HELIX-Web-OS": 0}, "connection_count": 1, "composite_count": 0, "phase_candidate_units": 188, "unresolved_phase_units": 37, "phase_links": 321, "successor_assigned": 0, "consumer_edges_generated": 0}
    if projected != expected_projected:
        errors.append(error("E_IMPACT_COUNT", "projected after counts drift"))
    return errors


def statement_anchor(rid: str):
    found, in_statement = False, False
    for number, text in enumerate(base_bytes(OLD_IR).decode("utf-8").splitlines(), 1):
        if f'"requirement_id": "{rid}"' in text:
            found = True
            continue
        if not found:
            continue
        if '"statement": {' in text:
            in_statement = True
            continue
        if in_statement and '"text": ' in text:
            return number, text, sha(text)
        if text.startswith('  "HIL-'):
            break
    return None, None, None


def validate_records(records: list[dict]):
    errors = []
    corrections, correction_lines = index_rows(CORRECTIONS, "source_requirement_id")
    routing, routing_lines = index_rows(ROUTING, "source_requirement_id")
    decomp, decomp_lines = index_rows(DECOMP, "source_requirement_id")
    all_decomp_units = [unit for item in decomp.values() for unit in item.get("candidate_units", [])]
    derived_current_phase_candidates = sum(bool(unit.get("direct_phase_candidates")) for unit in all_decomp_units)
    derived_current_unresolved_phase = sum(not unit.get("direct_phase_candidates") for unit in all_decomp_units)
    derived_current_phase_links = sum(len(unit.get("direct_phase_candidates", [])) for unit in all_decomp_units)
    derived_current_connections = sum(unit.get("unit_kind") == "cross_product_connection" for unit in all_decomp_units)
    derived_current_composites = sum(unit.get("unit_kind") == "composite" for unit in all_decomp_units)
    crosswalk_rows, _ = jsonl_rows(CROSSWALK)
    crosswalk = {(x.get("source_requirement_id"), x.get("unit_candidate_id")): x for x in crosswalk_rows}
    crosswalk_line = {(x.get("source_requirement_id"), x.get("unit_candidate_id")): n for n, raw in enumerate(base_bytes(CROSSWALK).decode("utf-8").splitlines(), 1) if raw.strip() for x in [json.loads(raw)]}
    ledger, ledger_lines = index_rows(LEDGER, "asset_id")
    phase, phase_lines = index_rows(PHASE, "asset_id")
    decisions_by_asset, reads_by_asset = {}, {}
    for path, target in ((DECISIONS, decisions_by_asset), (READ_AFTER, reads_by_asset)):
        for n, raw in enumerate(base_bytes(path).decode("utf-8").splitlines(), 1):
            if raw.strip():
                item = json.loads(raw)
                target.setdefault(item.get("asset_id"), []).append((n, item))
    old_ir = json.loads(base_bytes(OLD_IR))
    ids = [x.get("source_requirement_id") for x in records]
    if len(ids) != len(set(ids)):
        errors.append(error("E_ID_DUPLICATE", "record ID重複"))
    if set(ids) != IDS:
        errors.append(error("E_ID_SET", f"7件exact set不一致 missing={sorted(IDS-set(ids))} extra={sorted(set(ids)-IDS)}"))
    if len(records) != 7:
        errors.append(error("E_ID_COUNT", f"record count={len(records)}"))

    for record in records:
        rid = record.get("source_requirement_id")
        if rid not in IDS:
            continue
        if record.get("schema_revision") != 1 or record.get("binding_id") != "SCF-B-0103" or record.get("record_id") != f"SCF-B-0103-{rid}":
            errors.append(error("E_INVENTORY", f"{rid}: record schema/binding/id mismatch"))
        corr, route, dec = corrections.get(rid), routing.get(rid), decomp.get(rid)
        if not all((corr, route, dec, old_ir.get(rid))):
            errors.append(error("E_SOURCE_MISSING", f"{rid}: correction/routing/decomp/IR missing"))
            continue
        src = record.get("source_exact", {})
        if src.get("path") != OLD_IR:
            errors.append(error("E_SOURCE_MISSING", f"{rid}: source_exact path is outside fixed old IR"))
        expected_line, expected_text, expected_line_sha = statement_anchor(rid)
        source = old_ir[rid]
        for key, expected in (("path", OLD_IR), ("blob", blob(OLD_IR)), ("line", expected_line), ("line_text", expected_text), ("line_text_sha256", expected_line_sha), ("json_pointer", f"requirements.json#/{rid}/statement/text"), ("source_file_sha256", sha(base_bytes(OLD_IR))), ("statement_text", source["statement"]["text"]), ("statement_semantic_digest", source["statement"]["semantic_digest"])):
            if src.get(key) != expected:
                errors.append(error("E_SOURCE_ANCHOR" if key in ("line", "line_text", "line_text_sha256", "json_pointer") else "E_SOURCE_DIGEST", f"{rid}: source_exact {key} mismatch"))
        if src.get("revision") != source.get("revision"):
            errors.append(error("E_SOURCE_PROVENANCE", f"{rid}: source revision mismatch"))
        exact_corr = record.get("correction_exact", {})
        for key in ("correction_id", "routing_registration_id", "source_statement_semantic_digest", "from_classification_revision", "product_targets_before", "routing_candidate_before", "product_targets_after", "routing_candidate_after", "correction_rationale", "correction_state", "authority_effect", "meaning_change_applied"):
            if exact_corr.get(key) != corr.get(key):
                errors.append(error("E_CORRECTION_DIGEST" if key in ("source_statement_semantic_digest", "correction_rationale") else "E_CORRECTION_STATE", f"{rid}: correction {key} mismatch"))
        if exact_corr.get("ref") != expected_jsonl_ref(CORRECTIONS, correction_lines[rid], "PO-pending correction"):
            errors.append(error("E_CORRECTION_REFERENCE", f"{rid}: correction ref mismatch"))
        if corr.get("source_statement_semantic_digest") != source["statement"].get("semantic_digest"):
            errors.append(error("E_CORRECTION_DIGEST", f"{rid}: correction/source statement digest mismatch"))
        if corr.get("correction_state") != "proposed_pending_po_review" or corr.get("authority_effect") != "none" or corr.get("meaning_change_applied") is not False:
            errors.append(error("E_AUTHORITY_BOUNDARY", f"{rid}: correction source is not pending/no-effect"))
        if corr.get("product_targets_before") != route.get("candidate_product_targets") or corr.get("routing_candidate_before") != route.get("routing_candidate"):
            errors.append(error("E_BEFORE_CANDIDATE", f"{rid}: correction before differs from routing candidate"))

        before = record.get("before", {})
        br = before.get("routing", {})
        bd = before.get("decomposition", {})
        if br.get("candidate_product_targets") != route.get("candidate_product_targets") or br.get("routing_candidate") != route.get("routing_candidate") or br.get("classification_state") != route.get("classification_state") or br.get("authority_effect") != route.get("authority_effect") or br.get("meaning_change_applied") != route.get("meaning_change_applied"):
            errors.append(error("E_BEFORE_CANDIDATE", f"{rid}: routing before mismatch"))
        if br.get("ref") != expected_jsonl_ref(ROUTING, routing_lines[rid], "153 routing candidate"):
            errors.append(error("E_ROUTING_REFERENCE", f"{rid}: routing ref mismatch"))
        if bd.get("candidate_product_targets") != dec.get("candidate_product_targets") or bd.get("routing_candidate") != dec.get("routing_candidate") or bd.get("classification_state") != dec.get("classification_state") or bd.get("successor_assignment_status") != dec.get("successor_assignment_status"):
            errors.append(error("E_BEFORE_CANDIDATE", f"{rid}: decomposition before mismatch"))
        if bd.get("ref") != expected_jsonl_ref(DECOMP, decomp_lines[rid], "current decomposition candidate"):
            errors.append(error("E_DECOMP_REFERENCE", f"{rid}: decomposition ref mismatch"))
        if bd.get("unit_set") is None or len(bd["unit_set"]) != 1:
            errors.append(error("E_UNIT_IMPACT", f"{rid}: before unit set must contain one unit"))
            continue
        unit = dec.get("candidate_units", [])[0]
        bu = bd["unit_set"][0]
        uid = unit.get("unit_candidate_id")
        for key, expected in (("unit_candidate_id", uid), ("unit_kind", unit.get("unit_kind")), ("candidate_product", unit.get("product_target")), ("responsibility_summary", unit.get("responsibility_summary")), ("source_text_spans", unit.get("source_text_spans", [])), ("direct_phase_candidates", unit.get("direct_phase_candidates", [])), ("phase_classification_status", unit.get("phase_classification_status")), ("semantic_coverage_status", unit.get("semantic_coverage_status"))):
            if bu.get(key) != expected:
                errors.append(error("E_BEFORE_CANDIDATE", f"{rid}/{uid}: unit {key} mismatch"))
        if bu.get("successor_assignment_status") != dec.get("successor_assignment_status"):
            errors.append(error("E_SUCCESSOR", f"{rid}/{uid}: before unit successor state mismatch"))
        if bu.get("crosswalk_ref") != expected_jsonl_ref(CROSSWALK, crosswalk_line[(rid, uid)], "affected current unit"):
            errors.append(error("E_CROSSWALK_REFERENCE", f"{rid}/{uid}: crosswalk ref mismatch"))
        x = crosswalk.get((rid, uid))
        if x is None:
            errors.append(error("E_SOURCE_MISSING", f"{rid}/{uid}: crosswalk missing"))
            continue
        cs = bu.get("crosswalk_status", {})
        for key in ("legacy_requirement_implementation_status", "current_requirement_implementation_status", "consumer_closure_status", "direct_legacy_asset_links", "successor_assignment_status", "legacy_execution_performed", "new_build_allowed"):
            if cs.get(key) != x.get(key, [] if key == "direct_legacy_asset_links" else None):
                errors.append(error("E_CROSSWALK_STATE", f"{rid}/{uid}: crosswalk {key} mismatch"))
        if cs.get("direct_legacy_asset_links") not in ([], None) or cs.get("legacy_execution_performed") is not False or cs.get("new_build_allowed") is not False:
            errors.append(error("E_AUTHORITY_BOUNDARY", f"{rid}/{uid}: crosswalk promoted"))
        consumer = record.get("after_proposal", {}).get("consumer_impact", {})
        if consumer.get("before_unit_consumer_closure_status") != x.get("consumer_closure_status") or consumer.get("before_direct_legacy_asset_links") != x.get("direct_legacy_asset_links", []):
            errors.append(error("E_CONSUMER_IMPACT", f"{rid}/{uid}: consumer before projection differs from fixed BASE crosswalk"))
        if consumer.get("projected_added_unit_consumer_edges") != []:
            errors.append(error("E_CONSUMER_IMPACT", f"{rid}/{uid}: projected added-unit consumer edges must be empty"))

        after = record.get("after_proposal", {})
        if after.get("applied") is not False or after.get("authority_effect") != "none" or after.get("meaning_change_applied") is not False or after.get("formal_routing_updated") is not False or after.get("new_build_allowed") is not False:
            errors.append(error("E_AUTHORITY_BOUNDARY", f"{rid}: after proposal applied/formalized"))
        if after.get("candidate_product_targets") != EXPECTED_AFTER[rid] or after.get("routing_candidate") != "split_required" or after.get("candidate_shape") != "unit_set":
            errors.append(error("E_AFTER_PROPOSAL", f"{rid}: correction after mismatch"))
        if after.get("human_split_responsibility") != SPLIT_RESPONSIBILITY[rid] or after.get("human_split_responsibility_sha256") != sha(SPLIT_RESPONSIBILITY[rid]):
            errors.append(error("E_IMPACT_INTERPRETATION", f"{rid}: split responsibility interpretation mismatch"))
        added = after.get("projected_added_unit", {})
        expected_added = (set(EXPECTED_AFTER[rid]) - {BEFORE_PRODUCT[rid]}).pop()
        if added.get("candidate_product") != expected_added or added.get("unit_kind") != "product_unit" or added.get("source_text_spans") != [] or added.get("phase_candidates") != [] or added.get("phase_status") != "pending_human_direct_phase_review" or added.get("candidate_assets") != [] or added.get("consumer_closure_status") != "pending_no_edge_generated" or added.get("successor_assignment_status") != "unassigned" or added.get("status") != "projection_only_not_a_decomposition_record":
            errors.append(error("E_AFTER_PROPOSAL", f"{rid}: projected unit boundary changed"))
        impact = after.get("unit_impact", {})
        derived_unit_ids = [u.get("unit_candidate_id") for u in dec.get("candidate_units", [])]
        if impact.get("current_unit_ids") != derived_unit_ids or impact.get("projected_after_unit_ids") != derived_unit_ids + [added.get("projected_unit_candidate_id")] or impact.get("current_unit_count") != len(derived_unit_ids) or impact.get("projected_unit_count") != len(derived_unit_ids) + 1 or impact.get("applied_unit_count_delta") != 0 or impact.get("hypothetical_unit_count_delta_if_adopted") != 1:
            errors.append(error("E_IMPACT_COUNT", f"{rid}: unit impact count mismatch"))
        unit_conn = before.get("unit_connection_composite", {})
        if unit_conn.get("unit_count") != len(derived_unit_ids) or unit_conn.get("connection_count") != sum(u.get("unit_kind") == "cross_product_connection" for u in dec.get("candidate_units", [])) or unit_conn.get("composite_count") != sum(u.get("unit_kind") == "composite" for u in dec.get("candidate_units", [])):
            errors.append(error("E_UNIT_IMPACT", f"{rid}: before unit/connection/composite counts mismatch"))
        phase_impact = after.get("phase_impact", {})
        if phase_impact.get("before_phase_candidates") != unit.get("direct_phase_candidates", []) or phase_impact.get("projected_added_unit_phase_candidates") != [] or phase_impact.get("phase_candidate_units_current") != derived_current_phase_candidates or phase_impact.get("phase_candidate_units_projected_scaffold_only") != derived_current_phase_candidates or phase_impact.get("unresolved_phase_units_current") != derived_current_unresolved_phase or phase_impact.get("unresolved_phase_units_projected_scaffold_only") != derived_current_unresolved_phase + 1 or phase_impact.get("phase_links_current") != derived_current_phase_links or phase_impact.get("phase_links_projected_scaffold_only") != derived_current_phase_links:
            errors.append(error("E_IMPACT_COUNT", f"{rid}: phase impact counts mismatch"))
        if after.get("successor_impact", {}).get("before_successor_assignment_status") != dec.get("successor_assignment_status") or after.get("successor_impact", {}).get("before_successor_assignment_status") != x.get("successor_assignment_status") or after.get("successor_impact", {}).get("projected_added_unit_successor_assignment_status") != "unassigned":
            errors.append(error("E_SUCCESSOR", f"{rid}/{uid}: successor before/projected assignment mismatch"))
        for key in ("applied_phase_link_delta", "applied_consumer_edge_delta"):
            if after.get("phase_impact", {}).get(key, after.get("consumer_impact", {}).get(key)) != 0:
                errors.append(error("E_IMPACT_COUNT", f"{rid}: applied impact delta {key} must be zero"))
        if after.get("successor_impact", {}).get("projected_successor_ids") != [] or after.get("successor_impact", {}).get("applied_successor_delta") != 0:
            errors.append(error("E_SUCCESSOR", f"{rid}: successor projected"))
        conn_impact = after.get("connection_composite_impact", {})
        if conn_impact.get("before_connection_count") != derived_current_connections or conn_impact.get("projected_connection_count") != derived_current_connections or conn_impact.get("before_composite_count") != derived_current_composites or conn_impact.get("projected_composite_count") != derived_current_composites or conn_impact.get("applied_connection_delta") != 0:
            errors.append(error("E_UNIT_IMPACT", f"{rid}: connection/composite projected"))
        if before.get("unit_connection_composite", {}).get("interpretation") != BEFORE_UNIT_IMPACT_INTERPRETATION or before.get("unit_connection_composite", {}).get("interpretation_sha256") != sha(BEFORE_UNIT_IMPACT_INTERPRETATION):
            errors.append(error("E_IMPACT_INTERPRETATION", f"{rid}: before impact interpretation mismatch"))
        if phase_impact.get("human_action") != PHASE_IMPACT_HUMAN_ACTION or phase_impact.get("human_action_sha256") != sha(PHASE_IMPACT_HUMAN_ACTION):
            errors.append(error("E_IMPACT_INTERPRETATION", f"{rid}: phase human action mismatch"))
        consumer = after.get("consumer_impact", {})
        if consumer.get("human_action") != CONSUMER_IMPACT_HUMAN_ACTION or consumer.get("human_action_sha256") != sha(CONSUMER_IMPACT_HUMAN_ACTION):
            errors.append(error("E_IMPACT_INTERPRETATION", f"{rid}: consumer human action mismatch"))
        successor = after.get("successor_impact", {})
        if successor.get("human_action") != SUCCESSOR_IMPACT_HUMAN_ACTION or successor.get("human_action_sha256") != sha(SUCCESSOR_IMPACT_HUMAN_ACTION):
            errors.append(error("E_IMPACT_INTERPRETATION", f"{rid}: successor human action mismatch"))
        if conn_impact.get("interpretation") != CONNECTION_IMPACT_INTERPRETATION or conn_impact.get("interpretation_sha256") != sha(CONNECTION_IMPACT_INTERPRETATION):
            errors.append(error("E_IMPACT_INTERPRETATION", f"{rid}: connection/composite interpretation mismatch"))

        boundary = record.get("product_boundary", {})
        if boundary.get("path") != BOUNDARY_PATH or boundary.get("blob") != blob(BOUNDARY_PATH) or boundary.get("file_sha256") != sha(base_bytes(BOUNDARY_PATH)):
            errors.append(error("E_BOUNDARY_REFERENCE", f"{rid}: boundary file ref mismatch"))
        expected_boundary_refs = [dict(line_ref_expected(BOUNDARY_PATH, line, "product boundary table"), product=product) for product, line in BOUNDARY_LINES.items()]
        expected_boundary_refs += [line_ref_expected(BOUNDARY_PATH, line, "boundary context") for line in BOUNDARY_CONTEXT_LINES]
        if boundary.get("refs") != expected_boundary_refs:
            errors.append(error("E_BOUNDARY_REFERENCE", f"{rid}: boundary line/blob/digest mismatch"))
        if boundary.get("interpretation") != BOUNDARY_INTERPRETATION or boundary.get("interpretation_sha256") != sha(BOUNDARY_INTERPRETATION):
            errors.append(error("E_BOUNDARY_INTERPRETATION", f"{rid}: boundary interpretation mismatch"))
        expected_l1 = [dict(line_ref_expected(path, line, f"{product} current L1"), product=product) for product, (path, line) in L1_LINES.items()]
        if record.get("l1_evidence") != expected_l1:
            errors.append(error("E_L1_REFERENCE", f"{rid}: four-product L1 evidence mismatch"))

        wave_rows, wave_raw = jsonl_rows(WAVE_FILES[rid])
        expected_wave = []
        for line, raw in wave_raw.items():
            row = json.loads(raw)
            if row.get("source_requirement_id") != rid:
                continue
            expected_wave.append({
                "ref": expected_jsonl_ref(WAVE_FILES[rid], line, "wave semantic review row"),
                "artifact_evidence_kind": row.get("artifact_evidence_kind"),
                "asset_id": row.get("asset_id"),
                "candidate_product_targets": row.get("candidate_product_targets", []),
                "candidate_phase_targets": row.get("candidate_phase_targets", []),
                "covered_requirement_atom_ids": row.get("covered_requirement_atom_ids", []),
                "boundary_review_states": sorted({a.get("boundary_review_state") for a in row.get("covered_requirement_atoms", [])}),
                "atomization_hold": row.get("atomization_hold"),
                "catalog_legacy_implementation_status": row.get("catalog_legacy_implementation_status"),
                "consumer_closure_status": row.get("consumer_closure_status"),
                "authority_effect": row.get("authority_effect"),
                "new_build_allowed": row.get("new_build_allowed"),
                "semantic_link_status": row.get("semantic_link_status"),
            })
        wave_review = record.get("wave_semantic_review", {})
        for observed in wave_review.get("review_rows", []):
            if observed.get("asset_id") not in ledger:
                errors.append(error("E_WAVE_ASSET", f"{rid}/{observed.get('asset_id')}: Wave candidate asset missing from legacy ledger"))
        if wave_review.get("review_rows") != expected_wave or len(expected_wave) != 3:
            errors.append(error("E_WAVE_DIGEST", f"{rid}: Wave semantic review rows/digests mismatch"))
        if wave_review.get("method_premise_refs") != wave_doc_refs_expected(rid):
            errors.append(error("E_WAVE_METHOD_REFERENCE", f"{rid}: method/premise refs mismatch"))
        if wave_review.get("interpretation") != WAVE_INTERPRETATION or wave_review.get("interpretation_sha256") != sha(WAVE_INTERPRETATION):
            errors.append(error("E_WAVE_METHOD_REFERENCE", f"{rid}: Wave interpretation mismatch"))
        for wave in expected_wave:
            if wave.get("asset_id") not in ledger:
                errors.append(error("E_WAVE_ASSET", f"{rid}/{wave.get('asset_id')}: Wave candidate asset missing from legacy ledger"))

        for asset in record.get("legacy_asset_evidence", {}).get("candidate_assets", []):
            aid = asset.get("asset_id")
            ledger_row = ledger.get(aid)
            if ledger_row is None:
                errors.append(error("E_ASSET", f"{rid}/{aid}: ledger missing"))
                continue
            if asset.get("source_path") != ledger_row.get("source_path") or asset.get("source_sha256") != ledger_row.get("source_sha256"):
                errors.append(error("E_ASSET", f"{rid}/{aid}: source path/digest mismatch"))
            if asset.get("ledger_ref") != expected_jsonl_ref(LEDGER, ledger_lines[aid], "legacy asset disposition"):
                errors.append(error("E_ASSET_REFERENCE", f"{rid}/{aid}: ledger ref mismatch"))
            if asset.get("phase_ref") is not None and asset.get("phase_ref") != expected_jsonl_ref(PHASE, phase_lines[aid], "phase/product candidate"):
                errors.append(error("E_ASSET_REFERENCE", f"{rid}/{aid}: phase ref mismatch"))
            if asset.get("direct_requirement_semantic_link") is not False or asset.get("consumer_closure_status") != "pending" or asset.get("consumer_closure") != "pending" or asset.get("failure_status") != "unreviewed_pending_semantic_review":
                errors.append(error("E_ASSET_STATE", f"{rid}/{aid}: direct link/failure/consumer promoted"))
            expected_decisions = decisions_by_asset.get(aid, [])
            expected_reads = reads_by_asset.get(aid, [])
            history = asset.get("history", {})
            if history.get("decision_ids") != [x.get("decision_id") for _, x in expected_decisions] or history.get("read_after_ids") != [x.get("read_after_id") for _, x in expected_reads] or history.get("closure_status") != ("recorded" if expected_decisions or expected_reads else "no_matching_record"):
                errors.append(error("E_HISTORY_STATE", f"{rid}/{aid}: history state mismatch"))
            expected_failure_refs = [line_ref_expected(FAILURE, 1, "legacy source/runtime/failure static inventory"), line_ref_expected(CONSUMER, 1, "legacy consumer relation static inventory")]
            if asset.get("failure_consumer_refs") != expected_failure_refs:
                errors.append(error("E_FAILURE_CONSUMER_REFERENCE", f"{rid}/{aid}: source/failure/consumer refs mismatch"))
            for ref_key, path in (("decision_refs", DECISIONS), ("read_after_refs", READ_AFTER)):
                # Compare each retained history reference against its fixed BASE row.
                actual_refs = asset.get("history", {}).get(ref_key, [])
                source_rows = decisions_by_asset.get(aid, []) if path == DECISIONS else reads_by_asset.get(aid, [])
                label = "decision history" if path == DECISIONS else "copy/read-after history"
                if actual_refs != [expected_jsonl_ref(path, n, label) for n, _ in source_rows]:
                    errors.append(error("E_HISTORY_REFERENCE", f"{rid}/{aid}: history ref mismatch"))

            expected_asset = {
                "asset_id": aid,
                "ledger_match": True,
                "source_path": ledger_row.get("source_path"),
                "source_sha256": ledger_row.get("source_sha256"),
                "disposition": ledger_row.get("disposition"),
                "implementation_status": ledger_row.get("implementation_status"),
                "artifact_evidence_kind": next((asset_row.get("artifact_evidence_kind") for asset_row in x.get("representative_legacy_assets", []) if asset_row.get("asset_id") == aid), None),
                "legacy_implementation_status": next((asset_row.get("legacy_implementation_status") for asset_row in x.get("representative_legacy_assets", []) if asset_row.get("asset_id") == aid), None),
                "implementation_evidence_state": next((asset_row.get("implementation_evidence_state") for asset_row in x.get("representative_legacy_assets", []) if asset_row.get("asset_id") == aid), None),
                "direct_requirement_semantic_link": next((asset_row.get("direct_requirement_semantic_link") for asset_row in x.get("representative_legacy_assets", []) if asset_row.get("asset_id") == aid), None),
                "consumer_closure_status": next((asset_row.get("consumer_closure_status") for asset_row in x.get("representative_legacy_assets", []) if asset_row.get("asset_id") == aid), None),
                "consumer_refs_observed": next((asset_row.get("consumer_refs_observed", []) for asset_row in x.get("representative_legacy_assets", []) if asset_row.get("asset_id") == aid), []),
                "unresolved": next((asset_row.get("unresolved", []) for asset_row in x.get("representative_legacy_assets", []) if asset_row.get("asset_id") == aid), []),
                "phase_ids": next((asset_row.get("phase_ids", []) for asset_row in x.get("representative_legacy_assets", []) if asset_row.get("asset_id") == aid), []),
            }
            actual_projection = {key: asset.get(key) for key in expected_asset}
            if actual_projection != expected_asset:
                errors.append(error("E_ASSET_STATE", f"{rid}/{aid}: legacy asset state/source fields mismatch"))
            if asset.get("failure_status") != "unreviewed_pending_semantic_review" or asset.get("consumer_closure") != "pending":
                errors.append(error("E_ASSET_STATE", f"{rid}/{aid}: failure/consumer closure promoted"))

        candidate_assets = record.get("legacy_asset_evidence", {}).get("candidate_assets", [])
        expected_asset_ids = sorted(a.get("asset_id") for a in x.get("representative_legacy_assets", []))
        actual_asset_ids = [a.get("asset_id") for a in candidate_assets]
        if actual_asset_ids != expected_asset_ids or len(actual_asset_ids) != len(set(actual_asset_ids)):
            errors.append(error("E_ASSET_SET", f"{rid}/{uid}: candidate asset ID集合がcrosswalkと不一致"))
        if bu.get("candidate_asset_ids") != expected_asset_ids:
            errors.append(error("E_ASSET_SET", f"{rid}/{uid}: before unit asset ID集合がcrosswalkと不一致"))
        legacy_evidence = record.get("legacy_asset_evidence", {})
        if legacy_evidence.get("implementation_status") != x.get("legacy_requirement_implementation_status") or legacy_evidence.get("consumer_closure_status") != x.get("consumer_closure_status") or legacy_evidence.get("failure_closure_status") != x.get("failure_closure_status") or legacy_evidence.get("history_closure_status") != x.get("history_closure_status") or legacy_evidence.get("crosswalk_record_count") != x.get("crosswalk_record_count") or legacy_evidence.get("legacy_execution_performed") is not False or legacy_evidence.get("new_build_allowed") is not False:
            errors.append(error("E_ASSET_STATE", f"{rid}: legacy_asset_evidence state mismatch"))
        if legacy_evidence.get("crosswalk_ref") != expected_jsonl_ref(CROSSWALK, crosswalk_line[(rid, uid)], "affected implementation crosswalk"):
            errors.append(error("E_CROSSWALK_REFERENCE", f"{rid}/{uid}: legacy evidence crosswalk ref mismatch"))
        expected_static_refs = [
            line_ref_expected(LEDGER, 1, "static legacy evidence inventory"),
            line_ref_expected(PHASE, 1, "static legacy evidence inventory"),
            line_ref_expected(DECISIONS, 1, "static legacy evidence inventory"),
            line_ref_expected(READ_AFTER, 1, "static legacy evidence inventory"),
            line_ref_expected(FAILURE, 1, "static legacy evidence inventory"),
            line_ref_expected(CONSUMER, 1, "static legacy evidence inventory"),
        ]
        if legacy_evidence.get("source_history_failure_consumer_refs") != expected_static_refs:
            errors.append(error("E_FAILURE_CONSUMER_REFERENCE", f"{rid}: static source/history/failure/consumer refs mismatch"))
        if record.get("human_judgment_remaining") != EXPECTED_HUMAN_JUDGMENT:
            errors.append(error("E_HUMAN_JUDGMENT", f"{rid}: human judgment項目の欠落・改変"))

        if record.get("authority_effect") != "none" or record.get("successor_assignment_status") != "unassigned" or record.get("legacy_execution_performed") is not False:
            errors.append(error("E_AUTHORITY_BOUNDARY", f"{rid}: record authority/successor/execution promoted"))
    return errors


def main() -> int:
    records = [json.loads(line) for line in (BUNDLE / "impact.jsonl").read_text(encoding="utf-8").splitlines() if line.strip()]
    errors = validate_records(records)
    inventory = json.loads((BUNDLE / "inventory.json").read_text(encoding="utf-8"))
    errors.extend(validate_inventory(inventory))
    if errors:
        print("\n".join(errors), file=sys.stderr)
        return 1
    print("SCF-B-0103 validate: PASS records=7 current_units=218 projected_units=225 applied=false")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
