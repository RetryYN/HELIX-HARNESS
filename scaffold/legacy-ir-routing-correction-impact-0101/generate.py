#!/usr/bin/env python3
"""SCF-B-0103: PO未承認routing correction 7件の影響を静的に投影する。"""
from __future__ import annotations

import hashlib
import json
import subprocess
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
BUNDLE = Path(__file__).resolve().parent
BASE_HEAD = "36784d25aa4cc53d89c28c2ff81b4009db234605"
IDS = (
    "HIL-FR-01", "HIL-FR-11", "HIL-FR-15", "HIL-FR-16",
    "HIL-FR-37", "HIL-FR-41", "HIL-FR-57",
)
PRODUCTS = ("HELIX-HARNESS", "HELIX-OS", "HELIX-Web", "HELIX-Web-OS")
L1_LINES = {
    "HELIX-HARNESS": ("docs/helix-harness/L1-planning/product-intent.md", 22),
    "HELIX-OS": ("docs/helix-os/L1-planning/system-intent.md", 22),
    "HELIX-Web": ("docs/helix-web/L1-planning/product-intent.md", 24),
    "HELIX-Web-OS": ("docs/helix-web-os/L1-planning/system-intent.md", 15),
}
BOUNDARY_LINES = {
    "HELIX-HARNESS": 36,
    "HELIX-OS": 37,
    "HELIX-Web": 38,
    "HELIX-Web-OS": 39,
}
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
SPLIT_RESPONSIBILITY = {
    "HIL-FR-01": "HARNESS候補: intakeからmerge／issueまでの工程順序を定義する規範。OS候補のstate運転・digest binding・event causalityと境界を再審査する。",
    "HIL-FR-11": "OS候補: Agent Registryの登録・版・保持を管理運転する規範。HARNESS候補のagent contract語彙・意味と境界を再審査する。",
    "HIL-FR-15": "HARNESS候補: ZIP metadata／trace等をHELIX契約へ変換する規範。OS候補の取込実行・観測・記録と境界を再審査する。",
    "HIL-FR-16": "HARNESS候補: 機能単位比較とadopt／harden／redesign／reject判断の規範。OS候補の観測・記録運転と境界を再審査する。",
    "HIL-FR-37": "HARNESS候補: atomic behavior定義とcoverage分母の規範。OS候補のextractor実行・記録と境界を再審査する。",
    "HIL-FR-41": "OS候補: template version、適用履歴、利用結果、改善の管理運転。HARNESS候補のschema・必須論点・適用条件の規範と境界を再審査する。",
    "HIL-FR-57": "OS候補: Judgment Pack Registryの版・保持を管理運転する規範。HARNESS候補の観点・反証質問・停止条件の意味と境界を再審査する。",
}
BOUNDARY_INTERPRETATION = "HARNESSはV-model・工程・要求・設計・検証・外部提供の規範、HELIX-OSはauthority・Worker・CI・log・state・改善・配布の運転統制を持つ。管理対象と規則所有を同一ownerへ潰さず、correctionは正式routingへ昇格しない。"
LEGACY_EVIDENCE_PATHS = (LEDGER, PHASE, DECISIONS, READ_AFTER, FAILURE, CONSUMER)


def base_bytes(path: str) -> bytes:
    return subprocess.check_output(["git", "show", f"{BASE_HEAD}:{path}"], cwd=ROOT)


def blob(path: str) -> str:
    return subprocess.check_output(["git", "rev-parse", f"{BASE_HEAD}:{path}"], cwd=ROOT, text=True).strip()


def digest_bytes(value: bytes) -> str:
    return hashlib.sha256(value).hexdigest()


def digest_text(value: str) -> str:
    return digest_bytes(value.encode("utf-8"))


def file_digest(path: str) -> str:
    return digest_bytes(base_bytes(path))


def lines(path: str) -> list[str]:
    return base_bytes(path).decode("utf-8").splitlines()


def line_ref(path: str, line: int, label: str | None = None) -> dict:
    text = lines(path)[line - 1]
    result = {
        "path": path,
        "blob": blob(path),
        "line": line,
        "line_text": text,
        "line_text_sha256": digest_text(text),
    }
    if label:
        result["label"] = label
    return result


def jsonl_rows(path: str) -> tuple[list[dict], dict[int, str]]:
    rows, raw_by_line = [], {}
    for number, raw in enumerate(base_bytes(path).decode("utf-8").splitlines(), 1):
        if raw.strip():
            rows.append(json.loads(raw))
            raw_by_line[number] = raw
    return rows, raw_by_line


def jsonl_ref(path: str, line: int, label: str | None = None) -> dict:
    _, raw_by_line = jsonl_rows(path)
    result = line_ref(path, line, label)
    result["row_sha256"] = digest_text(raw_by_line[line])
    return result


def index_rows(path: str, key: str) -> tuple[dict, dict]:
    rows, _ = jsonl_rows(path)
    by_key, line_by_key = {}, {}
    for number, raw in enumerate(base_bytes(path).decode("utf-8").splitlines(), 1):
        if not raw.strip():
            continue
        item = json.loads(raw)
        value = item.get(key)
        if value is not None:
            by_key[value] = item
            line_by_key[value] = number
    return by_key, line_by_key


def statement_anchor(requirement_id: str) -> tuple[int, str, str]:
    source_lines = lines(OLD_IR)
    found = False
    in_statement = False
    for number, text in enumerate(source_lines, 1):
        if f'"requirement_id": "{requirement_id}"' in text:
            found = True
            continue
        if not found:
            continue
        if '"statement": {' in text:
            in_statement = True
            continue
        if in_statement and '"text": ' in text:
            return number, text, digest_text(text)
        if text.startswith('  "HIL-'):
            break
    raise ValueError(f"statement.text not found: {requirement_id}")


def asset_snapshot(asset: dict, ledger: dict, ledger_line: int, phase: dict | None, phase_line: int | None, decisions: list[tuple[int, dict]], reads: list[tuple[int, dict]]) -> dict:
    asset_id = asset["asset_id"]
    ledger_row = ledger.get(asset_id)
    if ledger_row is None:
        return {"asset_id": asset_id, "ledger_match": False}
    return {
        "asset_id": asset_id,
        "ledger_match": True,
        "source_path": ledger_row.get("source_path"),
        "source_sha256": ledger_row.get("source_sha256"),
        "disposition": ledger_row.get("disposition"),
        "implementation_status": ledger_row.get("implementation_status"),
        "artifact_evidence_kind": asset.get("artifact_evidence_kind"),
        "legacy_implementation_status": asset.get("legacy_implementation_status"),
        "implementation_evidence_state": asset.get("implementation_evidence_state"),
        "direct_requirement_semantic_link": asset.get("direct_requirement_semantic_link"),
        "consumer_closure_status": asset.get("consumer_closure_status"),
        "consumer_refs_observed": asset.get("consumer_refs_observed", []),
        "unresolved": asset.get("unresolved", []),
        "phase_ids": asset.get("phase_ids", []),
        "ledger_ref": jsonl_ref(LEDGER, ledger_line, "legacy asset disposition"),
        "phase_ref": jsonl_ref(PHASE, phase_line, "phase/product candidate") if phase and phase_line else None,
        "history": {
            "decision_ids": [x.get("decision_id") for _, x in decisions],
            "decision_refs": [jsonl_ref(DECISIONS, n, "decision history") for n, _ in decisions],
            "read_after_ids": [x.get("read_after_id") for _, x in reads],
            "read_after_refs": [jsonl_ref(READ_AFTER, n, "copy/read-after history") for n, _ in reads],
            "closure_status": "recorded" if decisions or reads else "no_matching_record",
        },
        "failure_consumer_refs": [
            line_ref(FAILURE, 1, "legacy source/runtime/failure static inventory"),
            line_ref(CONSUMER, 1, "legacy consumer relation static inventory"),
        ],
        "failure_status": "unreviewed_pending_semantic_review",
        "consumer_closure": "pending",
    }


def wave_snapshot(requirement_id: str) -> list[dict]:
    path = WAVE_FILES[requirement_id]
    rows, raw_by_line = jsonl_rows(path)
    result = []
    for number, row in enumerate(rows, 1):
        if row.get("source_requirement_id") != requirement_id:
            continue
        # rows are contiguous in each wave, but derive the physical line again.
        physical_line = next(line for line, raw in raw_by_line.items() if json.loads(raw) == row)
        result.append({
            "ref": jsonl_ref(path, physical_line, "wave semantic review row"),
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
    return result


def wave_doc_refs(requirement_id: str) -> list[dict]:
    wave_number = int(WAVE_FILES[requirement_id].split("wave")[1].split(".")[0])
    return [line_ref(path, 1, "wave method/premise") for path in WAVE_METHODS[wave_number] if path]


def l1_evidence() -> list[dict]:
    return [
        dict(line_ref(path, line, f"{product} current L1"), product=product)
        for product, (path, line) in L1_LINES.items()
    ]


def boundary_evidence() -> dict:
    refs = [
        dict(line_ref(BOUNDARY_PATH, line, "product boundary table"), product=product)
        for product, line in BOUNDARY_LINES.items()
    ]
    refs.extend(line_ref(BOUNDARY_PATH, line, "boundary context") for line in BOUNDARY_CONTEXT_LINES)
    return {
        "path": BOUNDARY_PATH,
        "blob": blob(BOUNDARY_PATH),
        "file_sha256": file_digest(BOUNDARY_PATH),
        "refs": refs,
        "interpretation": BOUNDARY_INTERPRETATION,
        "interpretation_sha256": digest_text(BOUNDARY_INTERPRETATION),
    }


def main() -> None:
    corrections, correction_lines = index_rows(CORRECTIONS, "source_requirement_id")
    routing, routing_lines = index_rows(ROUTING, "source_requirement_id")
    decomp, decomp_lines = index_rows(DECOMP, "source_requirement_id")
    crosswalk_rows, crosswalk_lines = jsonl_rows(CROSSWALK)
    crosswalk = {(x.get("source_requirement_id"), x.get("unit_candidate_id")): x for x in crosswalk_rows}
    crosswalk_line_map = {(x.get("source_requirement_id"), x.get("unit_candidate_id")): line for line, raw in enumerate(base_bytes(CROSSWALK).decode("utf-8").splitlines(), 1) if raw.strip() for x in [json.loads(raw)]}
    ledger, ledger_lines = index_rows(LEDGER, "asset_id")
    phase, phase_lines = index_rows(PHASE, "asset_id")
    decisions_rows, _ = jsonl_rows(DECISIONS)
    reads_rows, _ = jsonl_rows(READ_AFTER)
    decisions_by_asset = {}
    for number, raw in enumerate(base_bytes(DECISIONS).decode("utf-8").splitlines(), 1):
        if raw.strip():
            item = json.loads(raw)
            decisions_by_asset.setdefault(item.get("asset_id"), []).append((number, item))
    reads_by_asset = {}
    for number, raw in enumerate(base_bytes(READ_AFTER).decode("utf-8").splitlines(), 1):
        if raw.strip():
            item = json.loads(raw)
            reads_by_asset.setdefault(item.get("asset_id"), []).append((number, item))
    old_ir = json.loads(base_bytes(OLD_IR))
    boundary = boundary_evidence()
    l1 = l1_evidence()

    records = []
    for rid in IDS:
        corr = corrections[rid]
        route = routing[rid]
        d = decomp[rid]
        source = old_ir[rid]
        unit = d["candidate_units"][0]
        uid = unit["unit_candidate_id"]
        cross = crosswalk[(rid, uid)]
        source_line, source_line_text, source_line_digest = statement_anchor(rid)
        before_products = list(d["candidate_product_targets"])
        after_products = list(corr["product_targets_after"])
        added_products = sorted(set(after_products) - set(before_products))
        assert len(added_products) == 1
        added_product = added_products[0]
        candidate_added_id = f"SCF-PROJECTED-{rid}-{added_product}"
        assets = []
        for asset in cross.get("representative_legacy_assets", []):
            aid = asset["asset_id"]
            assets.append(asset_snapshot(
                asset, ledger, ledger_lines.get(aid), phase.get(aid), phase_lines.get(aid),
                decisions_by_asset.get(aid, []), reads_by_asset.get(aid, []),
            ))
        assets.sort(key=lambda x: x["asset_id"])
        before_unit = {
            "unit_candidate_id": uid,
            "unit_kind": unit.get("unit_kind"),
            "candidate_product": unit.get("product_target"),
            "responsibility_summary": unit.get("responsibility_summary"),
            "source_text_spans": unit.get("source_text_spans", []),
            "direct_phase_candidates": unit.get("direct_phase_candidates", []),
            "phase_classification_status": unit.get("phase_classification_status"),
            "semantic_coverage_status": unit.get("semantic_coverage_status"),
            "successor_assignment_status": d.get("successor_assignment_status"),
            "crosswalk_ref": jsonl_ref(CROSSWALK, crosswalk_line_map[(rid, uid)], "affected current unit"),
            "crosswalk_status": {
                "legacy_requirement_implementation_status": cross.get("legacy_requirement_implementation_status"),
                "current_requirement_implementation_status": cross.get("current_requirement_implementation_status"),
                "consumer_closure_status": cross.get("consumer_closure_status"),
                "direct_legacy_asset_links": cross.get("direct_legacy_asset_links", []),
                "legacy_execution_performed": cross.get("legacy_execution_performed"),
                "new_build_allowed": cross.get("new_build_allowed"),
            },
            "candidate_asset_ids": [x["asset_id"] for x in assets],
        }
        record = {
            "schema_revision": 1,
            "binding_id": "SCF-B-0103",
            "record_id": f"SCF-B-0103-{rid}",
            "source_requirement_id": rid,
            "source_exact": {
                "path": OLD_IR,
                "blob": blob(OLD_IR),
                "line": source_line,
                "line_text": source_line_text,
                "line_text_sha256": source_line_digest,
                "json_pointer": f"requirements.json#/{rid}/statement/text",
                "source_file_sha256": file_digest(OLD_IR),
                "statement_text": source["statement"]["text"],
                "statement_semantic_digest": source["statement"]["semantic_digest"],
                "revision": source.get("revision"),
            },
            "correction_exact": {
                "correction_id": corr.get("correction_id"),
                "routing_registration_id": corr.get("routing_registration_id"),
                "source_statement_semantic_digest": corr.get("source_statement_semantic_digest"),
                "from_classification_revision": corr.get("from_classification_revision"),
                "product_targets_before": corr.get("product_targets_before"),
                "routing_candidate_before": corr.get("routing_candidate_before"),
                "product_targets_after": corr.get("product_targets_after"),
                "routing_candidate_after": corr.get("routing_candidate_after"),
                "correction_rationale": corr.get("correction_rationale"),
                "correction_state": corr.get("correction_state"),
                "authority_effect": corr.get("authority_effect"),
                "meaning_change_applied": corr.get("meaning_change_applied"),
                "ref": jsonl_ref(CORRECTIONS, correction_lines[rid], "PO-pending correction"),
            },
            "before": {
                "routing": {
                    "candidate_product_targets": route.get("candidate_product_targets"),
                    "routing_candidate": route.get("routing_candidate"),
                    "classification_state": route.get("classification_state"),
                    "authority_effect": route.get("authority_effect"),
                    "meaning_change_applied": route.get("meaning_change_applied"),
                    "ref": jsonl_ref(ROUTING, routing_lines[rid], "153 routing candidate"),
                },
                "decomposition": {
                    "candidate_product_targets": d.get("candidate_product_targets"),
                    "routing_candidate": d.get("routing_candidate"),
                    "classification_state": d.get("classification_state"),
                    "successor_assignment_status": d.get("successor_assignment_status"),
                    "unit_set": [before_unit],
                    "ref": jsonl_ref(DECOMP, decomp_lines[rid], "current decomposition candidate"),
                },
                "unit_connection_composite": {
                    "unit_count": 1,
                    "connection_count": 0,
                    "composite_count": 0,
                    "interpretation": "現行候補はproduct unit 1件。connection/compositeを生成しない。",
                },
            },
            "after_proposal": {
                "applied": False,
                "authority_effect": "none",
                "meaning_change_applied": False,
                "new_build_allowed": False,
                "formal_routing_updated": False,
                "candidate_product_targets": after_products,
                "routing_candidate": corr.get("routing_candidate_after"),
                "candidate_shape": "unit_set",
                "human_split_responsibility": SPLIT_RESPONSIBILITY[rid],
                "projected_added_unit": {
                    "projected_unit_candidate_id": candidate_added_id,
                    "candidate_product": added_product,
                    "unit_kind": "product_unit",
                    "source_text_spans": [],
                    "phase_candidates": [],
                    "phase_status": "pending_human_direct_phase_review",
                    "consumer_closure_status": "pending_no_edge_generated",
                    "successor_assignment_status": "unassigned",
                    "candidate_assets": [],
                    "status": "projection_only_not_a_decomposition_record",
                },
                "unit_impact": {
                    "current_unit_ids": [uid],
                    "projected_after_unit_ids": [uid, candidate_added_id],
                    "current_unit_count": 1,
                    "projected_unit_count": 2,
                    "applied_unit_count_delta": 0,
                    "hypothetical_unit_count_delta_if_adopted": 1,
                },
                "phase_impact": {
                    "before_phase_candidates": unit.get("direct_phase_candidates", []),
                    "projected_added_unit_phase_candidates": [],
                    "applied_phase_link_delta": 0,
                    "phase_candidate_units_current": 188,
                    "phase_candidate_units_projected_scaffold_only": 188,
                    "unresolved_phase_units_current": 30,
                    "unresolved_phase_units_projected_scaffold_only": 37,
                    "phase_links_current": 321,
                    "phase_links_projected_scaffold_only": 321,
                    "human_action": "既存unitと追加候補unitの両方についてphase責務・source spanを対象revision付きで再審査する。既存phaseを新unitへ自動移送しない。",
                },
                "consumer_impact": {
                    "before_unit_consumer_closure_status": cross.get("consumer_closure_status"),
                    "before_direct_legacy_asset_links": cross.get("direct_legacy_asset_links", []),
                    "projected_added_unit_consumer_edges": [],
                    "applied_consumer_edge_delta": 0,
                    "human_action": "追加候補のconsumer、source/history/failure relationを直接意味linkとして再審査する。pendingをclosureへ昇格しない。",
                },
                "successor_impact": {
                    "before_successor_assignment_status": d.get("successor_assignment_status"),
                    "projected_added_unit_successor_assignment_status": "unassigned",
                    "projected_successor_ids": [],
                    "applied_successor_delta": 0,
                    "human_action": "保持atom、未被覆atom、successor ID、L2/L11接続を人間が決める。",
                },
                "connection_composite_impact": {
                    "before_connection_count": 0,
                    "projected_connection_count": 0,
                    "before_composite_count": 0,
                    "projected_composite_count": 0,
                    "applied_connection_delta": 0,
                    "interpretation": "split_requiredは二つの候補unitを示すだけで、connection/composite成立を生成しない。",
                },
            },
            "product_boundary": boundary,
            "l1_evidence": l1,
            "wave_semantic_review": {
                "review_rows": wave_snapshot(rid),
                "method_premise_refs": wave_doc_refs(rid),
                "interpretation": "waveはexact source atom、候補phase/product、未完consumer／boundary reviewを保持する静的semantic review候補であり、correctionのPO承認や実装証拠ではない。",
            },
            "legacy_asset_evidence": {
                "crosswalk_record_count": cross.get("crosswalk_record_count"),
                "crosswalk_ref": jsonl_ref(CROSSWALK, crosswalk_line_map[(rid, uid)], "affected implementation crosswalk"),
                "candidate_assets": assets,
                "source_history_failure_consumer_refs": [line_ref(path, 1, "static legacy evidence inventory") for path in LEGACY_EVIDENCE_PATHS],
                "implementation_status": cross.get("legacy_requirement_implementation_status"),
                "consumer_closure_status": cross.get("consumer_closure_status"),
                "failure_closure_status": cross.get("failure_closure_status"),
                "history_closure_status": cross.get("history_closure_status"),
                "legacy_execution_performed": cross.get("legacy_execution_performed"),
                "new_build_allowed": cross.get("new_build_allowed"),
            },
            "human_judgment_remaining": [
                "POがcorrection before／afterの意味差分を対象revision付きで採否するまでeffective routingへ昇格しない。",
                "normative contract／ruleとOSの運転・記録・保持をどのsource atomへ割り当てるかを決め、追加unitのexact source spanを固定する。",
                "unit、connection、compositeの境界、single ownerの有無、phase、consumer、successor、L2/L11接続を別々に決める。",
                "旧asset候補のsource/history/failure/consumerを直接意味linkへ昇格するかを個別に判断する。",
            ],
            "authority_effect": "none",
            "successor_assignment_status": "unassigned",
            "legacy_execution_performed": False,
        }
        records.append(record)

    records.sort(key=lambda x: x["source_requirement_id"])
    (BUNDLE / "impact.jsonl").write_text("".join(json.dumps(x, ensure_ascii=False, sort_keys=True) + "\n" for x in records), encoding="utf-8")

    all_decomp, _ = jsonl_rows(DECOMP)
    all_units = [u for x in all_decomp for u in x.get("candidate_units", [])]
    current_products = Counter(u.get("product_target") for u in all_units if u.get("unit_kind") == "product_unit")
    current_connections = sum(u.get("unit_kind") == "cross_product_connection" for u in all_units)
    inputs = [OLD_IR, CORRECTIONS, ROUTING, DECOMP, CROSSWALK, BOUNDARY_PATH, *[x[0] for x in L1_LINES.values()], LEDGER, PHASE, DECISIONS, READ_AFTER, FAILURE, CONSUMER, *sorted(set(WAVE_FILES.values()))]
    for pair in WAVE_METHODS.values():
        inputs.extend(path for path in pair if path)
    inputs = list(dict.fromkeys(inputs))
    inventory = {
        "schema_revision": 1,
        "binding_id": "SCF-B-0103",
        "status": "research_only_candidate",
        "authority_effect": "none",
        "base_head": BASE_HEAD,
        "source_snapshot": {
            "kind": "fixed_git_object",
            "base_head": BASE_HEAD,
            "blob_command": "git rev-parse <BASE>:<path>",
            "bytes_command": "git show <BASE>:<path>",
            "working_tree_used_for_source_digest": False,
        },
        "record_count": len(records),
        "requirement_ids": [x["source_requirement_id"] for x in records],
        "current_decomposition": {
            "record_count": len(all_decomp),
            "unit_count": len(all_units),
            "product_unit_count": sum(u.get("unit_kind") == "product_unit" for u in all_units),
            "product_counts": {p: current_products.get(p, 0) for p in PRODUCTS},
            "connection_count": current_connections,
            "composite_count": 0,
            "phase_candidate_units": sum(bool(u.get("direct_phase_candidates")) for u in all_units),
            "unresolved_phase_units": sum(not u.get("direct_phase_candidates") for u in all_units),
            "phase_links": sum(len(u.get("direct_phase_candidates", [])) for u in all_units),
            "successor_assigned": 0,
        },
        "projected_after_if_all_seven_adopted": {
            "applied": False,
            "unit_count": len(all_units) + len(records),
            "product_unit_count": sum(u.get("unit_kind") == "product_unit" for u in all_units) + len(records),
            "product_counts": {"HELIX-HARNESS": current_products.get("HELIX-HARNESS", 0) + 4, "HELIX-OS": current_products.get("HELIX-OS", 0) + 3, "HELIX-Web": 0, "HELIX-Web-OS": 0},
            "connection_count": current_connections,
            "composite_count": 0,
            "phase_candidate_units": sum(bool(u.get("direct_phase_candidates")) for u in all_units),
            "unresolved_phase_units": sum(not u.get("direct_phase_candidates") for u in all_units) + len(records),
            "phase_links": sum(len(u.get("direct_phase_candidates", [])) for u in all_units),
            "successor_assigned": 0,
            "consumer_edges_generated": 0,
        },
        "input_digests": [{"path": p, "blob": blob(p), "sha256": file_digest(p)} for p in inputs],
        "correction_state": "proposed_pending_po_review",
        "formal_routing_updated": False,
        "existing_ledgers_updated": False,
        "successor_updated": False,
        "legacy_execution_performed": False,
        "new_build_allowed": False,
        "negative_cases": ["duplicate_id", "missing_id", "correction_digest_tamper", "source_anchor_tamper", "before_candidate_tamper", "wave_digest_tamper", "boundary_reference_tamper", "l1_reference_tamper", "impact_count_tamper", "authority_promotion", "asset_digest_tamper", "asset_set_tamper", "human_judgment_tamper", "successor_promotion", "input_digest_tamper", "base_ancestor_tamper", "input_set_missing", "input_set_duplicate", "input_set_extra"],
    }
    (BUNDLE / "inventory.json").write_text(json.dumps(inventory, ensure_ascii=False, indent=2, sort_keys=True) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
