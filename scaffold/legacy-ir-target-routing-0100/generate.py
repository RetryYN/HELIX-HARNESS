#!/usr/bin/env python3
"""SCF-B-0100 の静的な18件bridgeを再生成する。旧archiveはread-onlyで読む。"""
from __future__ import annotations

import hashlib
import json
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
BUNDLE = Path(__file__).resolve().parent
OLD_IR = "archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json"
BASE_HEAD = "36784d25aa4cc53d89c28c2ff81b4009db234605"
IDS = {
    "HIL-BR-19", "HIL-FR-27", "HIL-FR-33", "HIL-FR-34", "HIL-NFR-09",
    "HIL-NFR-14", "HIL-NFR-19", "HIL-NFR-25", "HIL-TR-01", "HIL-TR-02",
    "HIL-TR-03", "HIL-TR-04", "HIL-TR-05", "HIL-TR-06", "HIL-TR-07",
    "HIL-TR-08", "HIL-TR-09", "HIL-TR-11",
}
BOUNDARY_LINES = {
    "HELIX-HARNESS": 36,
    "HELIX-OS": 37,
    "HELIX-Web": 38,
    "HELIX-Web-OS": 39,
}


def base_bytes(path: str) -> bytes:
    """すべてのsource snapshotを固定BASEのGit objectから読む。"""
    return subprocess.check_output(["git", "show", f"{BASE_HEAD}:{path}"], cwd=ROOT)


def sha_file(path: Path | str) -> str:
    source = str(path.relative_to(ROOT)) if isinstance(path, Path) else path
    return hashlib.sha256(base_bytes(source)).hexdigest()


def rel(path: str) -> Path:
    return ROOT / path


def blob(path: str) -> str:
    return subprocess.check_output(["git", "rev-parse", f"{BASE_HEAD}:{path}"], cwd=ROOT, text=True).strip()


def jsonl(path: str):
    rows, lines = [], {}
    for number, raw in enumerate(base_bytes(path).decode("utf-8").splitlines(), 1):
        if not raw.strip():
            continue
        item = json.loads(raw)
        rows.append(item)
        key = item.get("requirement_id") or item.get("source_requirement_id")
        if key:
            lines[key] = number
    return rows, lines


def composite_lines(path: str, first: str, second: str) -> dict:
    result = {}
    for number, raw in enumerate(base_bytes(path).decode("utf-8").splitlines(), 1):
        if not raw.strip():
            continue
        item = json.loads(raw)
        result[(item.get(first), item.get(second))] = number
    return result


def ref(path: str, line: int, pointer: str | None = None) -> dict:
    result = {"path": path, "blob": blob(path), "line": line}
    if pointer:
        result["json_pointer"] = pointer
    return result


def line_anchor(path: str, line: int) -> tuple[str, str]:
    """テキスト文書の実行行と、その改行を除いた行bytesのdigestを返す。"""
    lines = base_bytes(path).decode("utf-8").splitlines()
    if line < 1 or line > len(lines):
        raise ValueError(f"line out of range: {path}:{line}")
    text = lines[line - 1]
    return text, hashlib.sha256(text.encode("utf-8")).hexdigest()


def statement_line_anchor(requirement_id: str) -> tuple[int, str, str]:
    """整形JSON上の statement.text の実行行と行テキストdigestを返す。"""
    lines = base_bytes(OLD_IR).decode("utf-8").splitlines()
    found_id = None
    in_statement = False
    for number, line in enumerate(lines, 1):
        if f'"requirement_id": "{requirement_id}"' in line:
            found_id = number
            continue
        if found_id is None:
            continue
        if '"statement": {' in line:
            in_statement = True
            continue
        if in_statement and '"text": ' in line:
            digest = hashlib.sha256(line.encode("utf-8")).hexdigest()
            return number, line, digest
        if found_id and number > found_id and line.startswith("  \"HIL-"):
            break
    raise ValueError(f"statement.text line not found: {requirement_id}")


def product_boundary_refs() -> list[dict]:
    refs = []
    for product in ("HELIX-HARNESS", "HELIX-OS", "HELIX-Web", "HELIX-Web-OS"):
        line = BOUNDARY_LINES[product]
        text, digest = line_anchor("docs/concept/product-boundary.md", line)
        refs.append({
            "product": product,
            "path": "docs/concept/product-boundary.md",
            "blob": blob("docs/concept/product-boundary.md"),
            "line": line,
            "line_text": text,
            "line_text_sha256": digest,
        })
    return refs


def asset_record(asset_id: str, ledger_rows, phase_rows, decisions, read_afters, ledger_lines):
    ledger = ledger_rows.get(asset_id)
    if ledger is None:
        return {"asset_id": asset_id, "ledger_match": False}
    phase = phase_rows.get(asset_id)
    return {
        "asset_id": asset_id,
        "ledger_match": True,
        "ledger_ref": ref("docs/governance/legacy-asset-disposition.jsonl", ledger_lines[asset_id]),
        "source_path": ledger.get("source_path"),
        "source_sha256": ledger.get("source_sha256"),
        "asset_revision": ledger.get("revision"),
        "disposition": ledger.get("disposition"),
        "asset_class": ledger.get("asset_class"),
        "implementation_status": ledger.get("implementation_status"),
        "authority_status": ledger.get("authority_status"),
        "consumer_refs": ledger.get("consumer_refs", []),
        "rights_status": ledger.get("rights_status"),
        "executability_status": ledger.get("executability_status"),
        "secret_status": ledger.get("secret_status"),
        "external_effect_status": ledger.get("external_effect_status"),
        "history": {
            "decision_ids": decisions.get(asset_id, []),
            "copy_read_after_ids": read_afters.get(asset_id, []),
            "status": "recorded" if decisions.get(asset_id) or read_afters.get(asset_id) else "no_matching_record",
        },
        "failure": {
            "status": "unreviewed_pending_semantic_review",
            "evidence_refs": [
                "docs/governance/audits/source-rebaseline/legacy-ci-ai-runtime-source-inventory.md",
                "docs/governance/audits/source-rebaseline/legacy-ci-consumer-relation-inventory.md",
            ],
        },
        "consumer": {
            "closure_status": ledger.get("consumer_refs") and "pending" or "not_observed_pending",
            "consumer_refs": ledger.get("consumer_refs", []),
            "classification_consumer_refs": (phase or {}).get("consumer_refs", []),
        },
        "phase_candidate": {
            "classification_id": (phase or {}).get("classification_id"),
            "candidate_phase_targets": (phase or {}).get("candidate_phase_targets", []),
            "legacy_execution_performed": (phase or {}).get("legacy_execution_performed", False),
            "implementation_evidence_state": (phase or {}).get("implementation_evidence_state"),
            "product_classification_status": (phase or {}).get("product_classification_status"),
        },
    }


def main() -> None:
    queue_rows, queue_lines = jsonl("docs/governance/legacy-ir-target-routing-queue.jsonl")
    routing_rows, routing_lines = jsonl("docs/governance/legacy-ir-product-routing-bootstrap.jsonl")
    decomposition_rows, decomposition_lines = jsonl("docs/governance/legacy-ir-product-unit-decomposition-bootstrap.jsonl")
    crosswalk_rows, crosswalk_lines = jsonl("docs/governance/legacy-requirement-implementation-crosswalk-bootstrap.jsonl")
    crosswalk_lines = composite_lines("docs/governance/legacy-requirement-implementation-crosswalk-bootstrap.jsonl", "source_requirement_id", "unit_candidate_id")
    correction_rows, correction_lines = jsonl("docs/governance/legacy-ir-product-routing-corrections.jsonl")
    ledger_rows, ledger_lines = jsonl("docs/governance/legacy-asset-disposition.jsonl")
    ledger_lines = {item["asset_id"]: number for number, raw in enumerate(base_bytes("docs/governance/legacy-asset-disposition.jsonl").decode("utf-8").splitlines(), 1) if raw.strip() for item in [json.loads(raw)]}
    phase_rows, _ = jsonl("docs/governance/legacy-asset-phase-product-classification-bootstrap.jsonl")
    phase_rows = {r["asset_id"]: r for r in phase_rows}
    decisions, _ = jsonl("docs/governance/legacy-asset-decisions.jsonl")
    decisions_map = {}
    for item in decisions:
        decisions_map.setdefault(item.get("asset_id"), []).append(item.get("decision_id"))
    read_rows, _ = jsonl("docs/governance/legacy-asset-copy-read-after.jsonl")
    read_map = {}
    for item in read_rows:
        read_map.setdefault(item.get("asset_id"), []).append(item.get("read_after_id"))
    ledger_rows = {r["asset_id"]: r for r in ledger_rows}
    crosswalk = {(r.get("source_requirement_id"), r.get("unit_candidate_id")): r for r in crosswalk_rows}
    routing = {r["source_requirement_id"]: r for r in routing_rows}
    decomposition = {r["source_requirement_id"]: r for r in decomposition_rows}
    queue = {r["requirement_id"]: r for r in queue_rows}
    corrections = {r["source_requirement_id"]: r for r in correction_rows}
    old_ir = json.loads(base_bytes(OLD_IR))

    records = []
    for requirement_id in (x for x in queue if x in IDS):
        q = queue[requirement_id]
        d = decomposition[requirement_id]
        r = routing[requirement_id]
        source = old_ir[requirement_id]
        statement = source["statement"]
        statement_line, statement_line_text, statement_line_digest = statement_line_anchor(requirement_id)
        units = []
        all_asset_ids = set()
        for unit in d.get("candidate_units", []):
            unit_id = unit["unit_candidate_id"]
            x = crosswalk.get((requirement_id, unit_id), {})
            reps = x.get("representative_legacy_assets", [])
            asset_ids = [a["asset_id"] for a in reps]
            all_asset_ids.update(asset_ids)
            target = unit.get("product_target")
            units.append({
                "unit_kind": unit.get("unit_kind"),
                "unit_candidate_id": unit_id,
                "candidate_product": target,
                "responsibility_summary": unit.get("responsibility_summary"),
                "source_text_spans": unit.get("source_text_spans", []),
                "direct_phase_candidates": unit.get("direct_phase_candidates", []),
                "phase_classification_status": unit.get("phase_classification_status"),
                "semantic_coverage_status": unit.get("semantic_coverage_status"),
                "shared_source_overlaps": unit.get("shared_source_overlaps", []),
                "crosswalk_status": {
                    "crosswalk_ref": ref("docs/governance/legacy-requirement-implementation-crosswalk-bootstrap.jsonl", crosswalk_lines[(requirement_id, unit_id)]),
                    "legacy_requirement_implementation_status": x.get("legacy_requirement_implementation_status", "unknown"),
                    "current_requirement_implementation_status": x.get("current_requirement_implementation_status", "not_established"),
                    "consumer_closure_status": x.get("consumer_closure_status", "pending"),
                    "direct_legacy_asset_link_status": x.get("direct_legacy_asset_link_status", "pending"),
                    "direct_legacy_asset_links": x.get("direct_legacy_asset_links", []),
                    "legacy_execution_performed": x.get("legacy_execution_performed", False),
                    "new_build_allowed": x.get("new_build_allowed", False),
                },
                "evidence_refs": [
                    ref(OLD_IR, statement_line, f"requirements.json#/{requirement_id}/statement/text"),
                    ref("docs/governance/legacy-ir-target-routing-queue.jsonl", queue_lines[requirement_id]),
                    ref("docs/governance/legacy-ir-product-routing-bootstrap.jsonl", routing_lines[requirement_id]),
                    ref("docs/governance/legacy-ir-product-unit-decomposition-bootstrap.jsonl", decomposition_lines[requirement_id]),
                    ref("docs/concept/product-boundary.md", BOUNDARY_LINES[target]),
                ],
                "candidate_legacy_assets": [asset_record(asset_id, ledger_rows, phase_rows, decisions_map, read_map, ledger_lines) for asset_id in asset_ids],
            })

        candidate_shape = {"single_product": "unit", "split_required": "unit_set", "cross_product_connection": "connection"}.get(d.get("routing_candidate"), "unresolved")
        human = [
            "queueのunresolved_targetと、routing/decompositionのcandidateを同一視せず、対象revision付きで候補を採否する",
            "candidate unitごとのprimary responsibility、unit／connection／composite境界、単一ownerの有無を人間が決める",
            "successor ID、保持atom、未被覆atom、対象別L2/L11への接続を人間が決める",
            "exact HEADの独立意味reviewを完了し、原文の義務・例外・停止・failure・evidenceを照合する",
            "旧asset候補の直接意味link、source/history/failure/consumer closureを個別にレビューする",
        ]
        if "runtime_or_technology" in q.get("unresolved_reason", ""):
            human.append("技術名をHARNESS提供契約、HELIX-OS内部制約、L3技術選定のどこで拘束するかを決める")
        if "domain_design" in q.get("unresolved_reason", ""):
            human.append("Domain Object規律をHARNESS設計契約、HELIX-OS設計制約、L3設計方式のどこへ適用するかを決める")
        if "source_meaning_change_review_pending" in d.get("unresolved_reasons", []):
            human.append("旧sourceの意味変更要（ADR-010のNode transactional boundaryとの衝突）を保持・言換え・変更のいずれにするか決める")
        if "routing_correction_pending_existing_ledger_unchanged" in d.get("unresolved_reasons", []):
            human.append("HIL-TR-04の横断platform制約について、既存routingを変更するかを対象revision付きで決める")
        if requirement_id == "HIL-NFR-25":
            human.append("全consumerへの一律強制を避け、対象設計方式と根拠を確認する")
        meaning = [
            {"kind": "queue_vs_prior_candidate", "queue_target_resolution_status": q.get("target_resolution_status"), "queue_candidate_product_targets": q.get("candidate_product_targets", []), "prior_routing_candidate_targets": r.get("candidate_product_targets", []), "decomposition_candidate_targets": d.get("candidate_product_targets", []), "interpretation": "状態差分を記録するだけでqueueを変更しない"},
            {"kind": "candidate_vs_authority", "routing_classification_state": r.get("classification_state"), "decomposition_classification_state": d.get("classification_state"), "authority_effect": "none", "successor_assignment_status": d.get("successor_assignment_status")},
            {"kind": "boundary_projection", "candidate_products": d.get("candidate_product_targets", []), "web_and_webos_candidate": False, "interpretation": "Web/Web-OS候補がないことから不要性や正式除外を推論しない"},
            {"kind": "legacy_evidence", "implementation_status": "unknown_pending_direct_asset_semantic_review", "failure_status": "unreviewed_pending_semantic_review", "consumer_closure_status": "pending", "legacy_execution_performed": False},
        ]
        if requirement_id in corrections:
            meaning.append({"kind": "routing_correction", "correction_state": corrections[requirement_id].get("correction_state"), "interpretation": "未承認correctionはeffective routingへ昇格させない"})
        records.append({
            "schema_revision": 1,
            "bridge_record_id": f"SCF-B-0100-{requirement_id}",
            "source_requirement_id": requirement_id,
            "queue_status": {
                "target_resolution_status": q.get("target_resolution_status"),
                "candidate_product_targets": q.get("candidate_product_targets", []),
                "original_target_assessment": q.get("original_target_assessment"),
                "unresolved_reason": q.get("unresolved_reason"),
                "queue_ref": ref("docs/governance/legacy-ir-target-routing-queue.jsonl", queue_lines[requirement_id]),
            },
            "source_exact": {
                "path": OLD_IR,
                "blob": blob(OLD_IR),
                "line": statement_line,
                "line_text": statement_line_text,
                "line_text_sha256": statement_line_digest,
                "json_pointer": f"requirements.json#/{requirement_id}/statement/text",
                "source_file_sha256": sha_file(OLD_IR),
                "statement_text": statement["text"],
                "statement_semantic_digest": statement["semantic_digest"],
                "requirement_revision": source.get("revision"),
                "source_metadata": source.get("source"),
            },
            "prior_routing": {
                "candidate_product_targets": r.get("candidate_product_targets", []),
                "routing_candidate": r.get("routing_candidate"),
                "classification_state": r.get("classification_state"),
                "routing_rationale": r.get("routing_rationale"),
                "routing_ref": ref("docs/governance/legacy-ir-product-routing-bootstrap.jsonl", routing_lines[requirement_id]),
                "meaning_change_applied": r.get("meaning_change_applied"),
                "authority_effect": r.get("authority_effect"),
            },
            "decomposition_candidate": {
                "candidate_product_targets": d.get("candidate_product_targets", []),
                "routing_candidate": d.get("routing_candidate"),
                "candidate_shape": candidate_shape,
                "classification_state": d.get("classification_state"),
                "decomposition_ref": ref("docs/governance/legacy-ir-product-unit-decomposition-bootstrap.jsonl", decomposition_lines[requirement_id]),
                "candidate_units": units,
                "unresolved_reasons": d.get("unresolved_reasons", []),
                "routing_correction_pending_notes": d.get("routing_correction_pending_notes", []),
                "direct_phase_review_pending_notes": d.get("direct_phase_review_pending_notes", []),
            },
            "product_boundary": {
                "evaluated_products": ["HELIX-HARNESS", "HELIX-OS", "HELIX-Web", "HELIX-Web-OS"],
                "boundary_refs": product_boundary_refs(),
                "interpretation": "HARNESSは工程・提供契約、HELIX-OSは管理・Worker・CI・状態・改善の責務。candidateは正式ownerを確定しない。",
                "interpretation_sha256": hashlib.sha256("HARNESSは工程・提供契約、HELIX-OSは管理・Worker・CI・状態・改善の責務。candidateは正式ownerを確定しない。".encode("utf-8")).hexdigest(),
            },
            "legacy_asset_review": {
                "crosswalk_record_count": len(units),
                "candidate_asset_ids": sorted(all_asset_ids),
                "asset_review_scope": "phase／product candidate pool and representative assets only; no direct semantic link",
                "assets": [asset_record(asset_id, ledger_rows, phase_rows, decisions_map, read_map, ledger_lines) for asset_id in sorted(all_asset_ids)],
                "source_history_failure_consumer_refs": [
                    "docs/governance/legacy-asset-disposition.jsonl",
                    "docs/governance/legacy-asset-phase-product-classification-bootstrap.jsonl",
                    "docs/governance/legacy-asset-decisions.jsonl",
                    "docs/governance/legacy-asset-copy-read-after.jsonl",
                    "docs/governance/audits/source-rebaseline/legacy-ci-ai-runtime-source-inventory.md",
                    "docs/governance/audits/source-rebaseline/legacy-ci-consumer-relation-inventory.md",
                ],
                "consumer_closure_status": "pending",
                "failure_closure_status": "unreviewed",
                "history_closure_status": "pending",
            },
            "human_decisions_remaining": human,
            "meaning_differences": meaning,
            "authority_effect": "none",
            "meaning_change_applied": False,
            "successor_assignment_status": "unassigned",
            "legacy_execution_performed": False,
        })

    records.sort(key=lambda item: item["source_requirement_id"])
    (BUNDLE / "research.jsonl").write_text("".join(json.dumps(item, ensure_ascii=False, sort_keys=True) + "\n" for item in records), encoding="utf-8")
    inputs = [
        OLD_IR,
        "docs/governance/legacy-ir-target-routing-queue.jsonl",
        "docs/governance/legacy-ir-product-routing-bootstrap.jsonl",
        "docs/governance/legacy-ir-product-routing-corrections.jsonl",
        "docs/governance/legacy-ir-product-unit-decomposition-bootstrap.jsonl",
        "docs/governance/legacy-requirement-implementation-crosswalk-bootstrap.jsonl",
        "docs/concept/product-boundary.md",
        "docs/governance/legacy-asset-disposition.jsonl",
        "docs/governance/legacy-asset-phase-product-classification-bootstrap.jsonl",
        "docs/governance/legacy-asset-decisions.jsonl",
        "docs/governance/legacy-asset-copy-read-after.jsonl",
        "docs/governance/audits/source-rebaseline/legacy-ci-ai-runtime-source-inventory.md",
        "docs/governance/audits/source-rebaseline/legacy-ci-consumer-relation-inventory.md",
    ]
    inventory = {
        "schema_revision": 1,
        "binding_id": "SCF-B-0100",
        "status": "research_only_candidate",
        "authority_effect": "none",
        "source_revision": "legacy-generation-2026-09-14",
        "base_head": BASE_HEAD,
        "source_snapshot": {
            "kind": "fixed_git_object",
            "base_head": BASE_HEAD,
            "blob_command": "git rev-parse <BASE>:<path>",
            "bytes_command": "git show <BASE>:<path>",
            "working_tree_used_for_source_digest": False,
        },
        "record_count": len(records),
        "requirement_ids": [item["source_requirement_id"] for item in records],
        "candidate_shape_counts": {shape: sum(item["decomposition_candidate"]["candidate_shape"] == shape for item in records) for shape in ("unit", "unit_set", "connection", "composite", "unresolved")},
        "candidate_product_counts": {product: sum(any(u["candidate_product"] == product for u in item["decomposition_candidate"]["candidate_units"]) for item in records) for product in ("HELIX-HARNESS", "HELIX-OS", "HELIX-Web", "HELIX-Web-OS")},
        "input_digests": [{"path": path, "sha256": sha_file(rel(path)), "blob": blob(path)} for path in inputs],
        "queue_unchanged": True,
        "legacy_execution_performed": False,
        "known_open_conditions": ["queue_target_resolution_pending", "exact_head_independent_review_pending", "human_product_authority_decision_pending", "successor_assignment_unassigned", "legacy_asset_direct_link_pending", "history_failure_consumer_closure_pending"],
        "negative_cases": ["duplicate_id", "missing_id", "source_statement_digest_tamper", "source_exact_reference_tamper", "source_line_anchor_tamper", "source_line_digest_tamper", "queue_status_tamper", "boundary_blob_tamper", "boundary_interpretation_tamper", "candidate_product_boundary_tamper", "authority_promotion", "legacy_asset_digest_tamper", "legacy_execution_promotion", "base_ancestor_tamper", "base_object_digest_tamper"],
    }
    (BUNDLE / "inventory.json").write_text(json.dumps(inventory, ensure_ascii=False, indent=2, sort_keys=True) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
