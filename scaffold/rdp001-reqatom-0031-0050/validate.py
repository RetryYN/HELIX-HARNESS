#!/usr/bin/env python3
"""REQATOM A1 0031--0050 の source／semantic-span／status validator。"""

from __future__ import annotations

import hashlib
import json
from pathlib import Path


HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
QUEUE = ROOT / "docs/governance/legacy-requirement-atomization-review-queue.jsonl"
LEDGER = ROOT / "docs/governance/legacy-requirement-semantic-line-carry-forward.jsonl"
ASSETS = ROOT / "docs/governance/legacy-asset-disposition.jsonl"
DECISIONS = ROOT / "docs/governance/legacy-asset-decisions.jsonl"
COPY_READ_AFTER = ROOT / "docs/governance/legacy-asset-copy-read-after.jsonl"
PLAN = HERE / "atomization_plan.json"
PROP = HERE / "proposals.jsonl"
INVENTORY = HERE / "inventory.json"

UNIT_IDS = [f"REQATOM-QUEUE-{n:04d}" for n in range(31, 51)]
PRODUCTS = ["HELIX-HARNESS", "HELIX-OS", "HELIX-Web", "HELIX-Web-OS"]
KINDS = ["requirement", "constraint", "acceptance", "premise", "rationale", "example", "navigation", "metadata", "unresolved", "connection", "composite"]
GRANULARITIES = ["unit", "connection", "composite", "unresolved"]
RELATIONS = ["exact", "partial", "adds-condition", "conflicts", "example-of", "rationale-for", "unrelated", "unresolved"]
SOURCE_COMMIT = "685c69c3c174ac6121812dade30ed75e510986e6"
CURRENT_PREFIX = "docs/governance/requirements-source/legacy-documents/"
REQUIRED_SPLIT_COUNTS = {
    "REQSRC-LINE-00086": 1,
    "REQSRC-LINE-00087": 1,
    "REQSRC-LINE-00088": 1,
    "REQSRC-LINE-00116": 1,
    "REQSRC-LINE-00138": 1,
    "REQSRC-LINE-00180": 2,
    "REQSRC-LINE-00193": 6,
}


def sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def file_sha(path: Path) -> str:
    return sha256(path.read_bytes())


def load_jsonl(path: Path) -> list[dict]:
    rows: list[dict] = []
    for line_no, line in enumerate(path.read_text(encoding="utf-8").splitlines(), 1):
        if not line.strip():
            continue
        try:
            rows.append(json.loads(line))
        except json.JSONDecodeError as exc:
            raise ValueError(f"{path}:{line_no}: JSON不正: {exc}") from exc
    return rows


def old_source_path(source_path: str) -> str:
    return source_path[len(CURRENT_PREFIX):] if source_path.startswith(CURRENT_PREFIX) else source_path


def archive_path(source_path: str) -> Path:
    return ROOT / "archive/legacy-generation-2026-09-14/root" / old_source_path(source_path)


def source_span(source_text: str, anchor: str) -> dict | None:
    starts = [index for index in range(len(source_text)) if source_text.startswith(anchor, index)]
    if len(starts) != 1:
        return None
    start = starts[0]
    return {"char_start": start, "char_end": start + len(anchor), "length": len(anchor)}


def check() -> list[str]:
    errors: list[str] = []
    try:
        inventory = json.loads(INVENTORY.read_text(encoding="utf-8"))
        proposals = load_jsonl(PROP)
        queue_rows = {row["review_unit_id"]: row for row in load_jsonl(QUEUE)}
        ledger_rows = {row["content_line_id"]: row for row in load_jsonl(LEDGER)}
        assets = {row["source_path"]: row for row in load_jsonl(ASSETS)}
        decisions = {row["decision_id"]: row for row in load_jsonl(DECISIONS)}
        read_afters = {row["read_after_id"]: row for row in load_jsonl(COPY_READ_AFTER)}
        plan = json.loads(PLAN.read_text(encoding="utf-8"))
        plan_lines = plan.get("line_specs", {})
    except (OSError, ValueError, KeyError, json.JSONDecodeError) as exc:
        return [f"入力読み込み失敗: {exc}"]

    if inventory.get("schema_revision") != 1:
        errors.append("inventory schema_revision が1でない")
    if inventory.get("source_commit") != SOURCE_COMMIT:
        errors.append("source_commit が最新origin/mainのexact revisionでない")
    if inventory.get("authority_effect") != "none":
        errors.append("authority_effect が none でない")
    if inventory.get("proposal_status") != "needs_independent_review":
        errors.append("proposal_status が needs_independent_review でない")
    if plan.get("schema_revision") != 1:
        errors.append("atomization plan schema_revision が1でない")

    inputs = inventory.get("inputs", {})
    if inputs.get("queue_sha256") != file_sha(QUEUE):
        errors.append("queue digestが不一致")
    if inputs.get("semantic_line_ledger_sha256") != file_sha(LEDGER):
        errors.append("semantic line ledger digestが不一致")
    if inputs.get("atomization_plan_sha256") != file_sha(PLAN):
        errors.append("atomization plan digestが不一致")

    expected_queue = [queue_rows.get(unit_id) for unit_id in UNIT_IDS]
    if any(row is None for row in expected_queue):
        errors.append("REQATOM-QUEUE-0031..0050に欠落がある")
        return errors
    if [row.get("review_unit_id") for row in proposals] != UNIT_IDS:
        errors.append("proposal unit順序または集合がREQATOM-QUEUE-0031..0050でない")
    if inventory.get("review_unit_ids") != UNIT_IDS or inventory.get("review_unit_count") != 20 or len(proposals) != 20:
        errors.append("review unit分母が20でない")

    source_groups = inputs.get("source_groups", [])
    actual_paths = sorted({row["source_path"] for row in expected_queue})
    if sorted(group.get("source_path") for group in source_groups) != actual_paths:
        errors.append("source_groupsがqueueのsource path集合と不一致")
    for group in source_groups:
        source_path = group.get("source_path")
        current = ROOT / source_path
        archive = archive_path(source_path)
        if not current.is_file() or not archive.is_file():
            errors.append(f"sourceまたはarchive source不存在: {source_path}")
            continue
        current_sha = file_sha(current)
        archive_sha = file_sha(archive)
        if group.get("source_sha256") != current_sha or group.get("archive_source_sha256") != archive_sha:
            errors.append(f"source group digest不一致: {source_path}")
        if current_sha != archive_sha:
            errors.append(f"現行snapshotとarchive sourceのdigest不一致: {source_path}")
        old_path = old_source_path(source_path)
        asset = assets.get(old_path)
        if not asset:
            errors.append(f"asset catalogにsource pathがない: {old_path}")
            continue
        if group.get("legacy_asset_id") != asset.get("asset_id") or asset.get("revision") != 3:
            errors.append(f"asset catalog identity/revision不一致: {old_path}")
        for group_field, asset_field, expected in [
            ("legacy_asset_disposition", "disposition", "source_snapshot_preservation"),
            ("legacy_asset_implementation_status", "implementation_status", "non_executable_read_only_source"),
            ("legacy_asset_product_target", "product_target", "unresolved"),
            ("legacy_asset_decision_status", "decision_status", "pending_human_confirmation"),
        ]:
            if group.get(group_field) != expected or asset.get(asset_field) != expected:
                errors.append(f"{source_path}: {group_field}を昇格または改変")
        decision_ref = asset.get("decision_record_ref") or ""
        decision_id = decision_ref.rsplit("#", 1)[-1]
        decision = decisions.get(decision_id, {})
        if group.get("legacy_asset_decision_ref") != decision_ref or decision.get("asset_revision_before") != 2 or decision.get("asset_revision_after") != 3:
            errors.append(f"{source_path}: append-only asset decision不一致")
        if decision.get("product_target") != "unresolved" or decision.get("decision_status") != "pending_human_confirmation":
            errors.append(f"{source_path}: correction decisionのpending statusを改変")
        read_ref = asset.get("read_after_record_ref") or ""
        read_id = read_ref.rsplit("#", 1)[-1]
        read = read_afters.get(read_id, {})
        if group.get("legacy_asset_read_after_id") != read.get("read_after_id") or read.get("result") != "pass" or read.get("digest_match") is not True or read.get("consumer_match") is not True or read.get("failure") is not None:
            errors.append(f"{source_path}: read-after観測を改変")
        if asset.get("consumer_refs") != ["requirement-carry-forward-ledgers", "requirement-atomization-review"] or read.get("consumer_refs_observed") != asset.get("consumer_refs"):
            errors.append(f"{source_path}: consumer refs不一致")

    source_cache: dict[str, list[str]] = {}
    all_input_ids: list[str] = []
    all_atoms: list[dict] = []
    all_composites: list[dict] = []
    all_atom_ids: list[str] = []
    all_composite_ids: list[str] = []
    target_counts = {product: 0 for product in PRODUCTS}
    unresolved_count = 0
    expected_line_total = 0

    for proposal in proposals:
        unit_id = proposal.get("review_unit_id")
        queue = queue_rows.get(unit_id)
        if queue is None:
            errors.append(f"unknown proposal unit: {unit_id}")
            continue
        expected_ids = queue["content_line_ids"]
        expected_line_total += len(expected_ids)
        if proposal.get("input_content_line_ids") != expected_ids:
            errors.append(f"{unit_id}: input_content_line_idsがqueueと不一致")
        all_input_ids.extend(proposal.get("input_content_line_ids") or [])
        if proposal.get("input_source_path") != queue["source_path"] or proposal.get("input_source_revision") != queue["source_file_sha256"]:
            errors.append(f"{unit_id}: source path／revision不一致")
        if proposal.get("input_source_line_range") != [queue["source_line_start"], queue["source_line_end"]]:
            errors.append(f"{unit_id}: source line range不一致")

        coverage = proposal.get("line_coverage", {})
        if "consumed_once" in coverage:
            errors.append(f"{unit_id}: legacy 1:1 consumed_once coverageを使用している")
        if coverage.get("input_lines") != expected_ids:
            errors.append(f"{unit_id}: line_coverage input_lines不一致")
        plan_for_unit = {line_id: plan_lines.get(line_id) for line_id in expected_ids}
        if any(value is None for value in plan_for_unit.values()):
            errors.append(f"{unit_id}: atomization plan line欠落")
            continue
        expected_atomized_line_ids = [line_id for line_id in expected_ids if plan_for_unit[line_id].get("atomized")]
        expected_composite_line_ids = [line_id for line_id in expected_ids if plan_for_unit[line_id].get("composite_unresolved")]
        if coverage.get("atomized_source_line_ids") != expected_atomized_line_ids or coverage.get("composite_unresolved_source_line_ids") != expected_composite_line_ids:
            errors.append(f"{unit_id}: atomization line coverage不一致")
        if coverage.get("atomized_obligation_anchors") != {line_id: [spec["anchor"] for spec in plan_for_unit[line_id].get("atomized", [])] for line_id in expected_ids}:
            errors.append(f"{unit_id}: atomized obligation coverage不一致")
        if coverage.get("composite_unresolved_anchors") != {line_id: [spec["anchor"] for spec in plan_for_unit[line_id].get("composite_unresolved", [])] for line_id in expected_ids}:
            errors.append(f"{unit_id}: composite unresolved coverage不一致")

        atoms = proposal.get("candidate_atoms", [])
        composites = proposal.get("composite_unresolved", [])
        expected_atom_count = sum(len(plan_for_unit[line_id].get("atomized", [])) for line_id in expected_ids)
        expected_composite_count = sum(len(plan_for_unit[line_id].get("composite_unresolved", [])) for line_id in expected_ids)
        if len(atoms) != expected_atom_count or proposal.get("atomized_candidate_atom_count") != expected_atom_count:
            errors.append(f"{unit_id}: atomized obligation countが一致しない（同一行内の義務欠落または水増し）")
        if len(composites) != expected_composite_count or proposal.get("composite_unresolved_count") != expected_composite_count:
            errors.append(f"{unit_id}: composite_unresolved countが一致しない")

        expected_atoms: list[tuple[str, dict, dict]] = []
        expected_composites: list[tuple[str, dict, dict]] = []
        for line_position, line_id in enumerate(expected_ids, 1):
            line = ledger_rows.get(line_id)
            if not line:
                errors.append(f"{unit_id}: semantic line ledgerにない: {line_id}")
                continue
            source_cache.setdefault(line["source_path"], (ROOT / line["source_path"]).read_text(encoding="utf-8").splitlines())
            for atom_position, spec in enumerate(plan_for_unit[line_id].get("atomized", []), 1):
                expected_atoms.append((f"A1-{queue['review_sequence']:04d}-{line_position:02d}-{atom_position:02d}", line, spec))
            for composite_position, spec in enumerate(plan_for_unit[line_id].get("composite_unresolved", []), 1):
                expected_composites.append((f"A1-CU-{queue['review_sequence']:04d}-{line_position:02d}-{composite_position:02d}", line, spec))

        spans_by_line: dict[str, list[tuple[int, int, str]]] = {}
        for index, (atom_id, line, spec) in enumerate(expected_atoms):
            candidate = atoms[index] if index < len(atoms) else {}
            actual_id = candidate.get("candidate_atom_id")
            if actual_id != atom_id:
                errors.append(f"{unit_id}: candidate_atom_idが決定規則と不一致")
            all_atoms.append(candidate)
            all_atom_ids.append(actual_id)
            line_id = line["content_line_id"]
            source_lines = source_cache[line["source_path"]]
            source_text = line["source_line_text"]
            expected_span = source_span(source_text, spec["anchor"])
            if expected_span is None:
                errors.append(f"{unit_id}/{atom_id}: plan anchorがsource lineに一意でない")
                continue
            spans_by_line.setdefault(line_id, []).append((expected_span["char_start"], expected_span["char_end"], atom_id))
            if candidate.get("source_line_ids") != [line_id] or candidate.get("source_line_text") != source_text:
                errors.append(f"{unit_id}/{atom_id}: source line identity/text不一致")
            if candidate.get("source_span") != expected_span or candidate.get("verbatim_anchor") != spec["anchor"] or candidate.get("exact_source_text") != spec["anchor"]:
                errors.append(f"{unit_id}/{atom_id}: minimum source span／verbatim anchor不一致")
            if candidate.get("retained_meaning") != [spec["anchor"]] or candidate.get("atomization_status") != "atomized":
                errors.append(f"{unit_id}/{atom_id}: retained meaningまたはatomization status不一致")
            if candidate.get("normalized_statement") != spec["normalized_statement"] or candidate.get("candidate_target") != spec["candidate_target"] or candidate.get("candidate_kind") != spec["candidate_kind"] or candidate.get("candidate_granularity") != spec["candidate_granularity"] or candidate.get("unresolved_points") != spec["unresolved_points"]:
                errors.append(f"{unit_id}/{atom_id}: semantic normalized/product/unresolved field不一致")
            if candidate.get("normalized_statement", "").startswith("旧sourceが記述する「") or candidate.get("semantic_predicate") != candidate.get("normalized_statement"):
                errors.append(f"{unit_id}/{atom_id}: normalized_statementが意味述語でない")
            for semantic_field in ("semantic_subject", "inherited_subject", "parent_context", "semantic_action", "semantic_condition", "semantic_predicate", "historical_conflict", "source_span_role"):
                if candidate.get(semantic_field) != spec.get(semantic_field) or not isinstance(candidate.get(semantic_field), str) or not candidate.get(semantic_field).strip():
                    errors.append(f"{unit_id}/{atom_id}: {semantic_field}が欠落またはplanと不一致")
            if candidate.get("typed_relation") != spec.get("typed_relation"):
                errors.append(f"{unit_id}/{atom_id}: typed_relationが欠落またはplanと不一致")
            elif not isinstance(candidate.get("typed_relation"), dict) or candidate["typed_relation"].get("authority_effect") != "none":
                errors.append(f"{unit_id}/{atom_id}: typed_relationが現行authorityへ昇格")
            if candidate.get("product_boundary") != spec.get("product_boundary"):
                errors.append(f"{unit_id}/{atom_id}: product_boundaryが欠落またはplanと不一致")
            elif not isinstance(candidate.get("product_boundary"), dict) or candidate["product_boundary"].get("authority_effect") != "none":
                errors.append(f"{unit_id}/{atom_id}: product_boundaryが現行authorityへ昇格")
            if candidate.get("candidate_kind") not in KINDS or candidate.get("candidate_granularity") not in GRANULARITIES:
                errors.append(f"{unit_id}/{atom_id}: kind/granularity不正")
            target = candidate.get("candidate_target")
            if target not in PRODUCTS + ["unresolved"]:
                errors.append(f"{unit_id}/{atom_id}: candidate_target不正")
            relations = candidate.get("existing_identity_relations")
            if not isinstance(relations, list) or not relations or any(item.get("relation") not in RELATIONS or not item.get("identity") for item in relations):
                errors.append(f"{unit_id}/{atom_id}: existing identity relation不正")
            for key in ("actor_candidate", "authority_boundary", "failure_or_stop_conditions", "evidence_or_acceptance_conditions", "negative_or_exception_conditions", "possible_conflicts", "questions", "candidate_inference"):
                value = candidate.get(key)
                if not isinstance(value, list) or not value or any(not isinstance(item, str) or not item.strip() for item in value):
                    errors.append(f"{unit_id}/{atom_id}: {key}が空または不正")
            failure = candidate.get("failure_or_stop_conditions")
            legacy_failure = candidate.get("legacy_failure_candidate", {})
            if legacy_failure.get("status") != "source_meaning_preserved; current_failure_contract_unresolved" or legacy_failure.get("conditions") != failure:
                errors.append(f"{unit_id}/{atom_id}: legacy failure status/conditionsを改変")
            consumer = candidate.get("consumer_candidate", {})
            if consumer.get("legacy_refs") != ["requirement-carry-forward-ledgers", "requirement-atomization-review"] or consumer.get("current_status") != "unresolved":
                errors.append(f"{unit_id}/{atom_id}: consumer statusを昇格または改変")
            expected_status = {"source_authority": "confirmed (legacy source declaration)", "target_authority": "none", "carry_forward": "preserved_pending_atomization", "implementation_status": "unknown", "degradation_status": "unknown", "phase_status": "legacy declaration preserved; current phase placement unresolved", "successor_status": "unassigned"}
            for key, value in expected_status.items():
                if candidate.get("status_preservation", {}).get(key) != value:
                    errors.append(f"{unit_id}/{atom_id}: status_preservation.{key}を昇格または改変")
            if target in target_counts:
                target_counts[target] += 1
            else:
                unresolved_count += 1

        for index, (composite_id, line, spec) in enumerate(expected_composites):
            record = composites[index] if index < len(composites) else {}
            all_composites.append(record)
            all_composite_ids.append(record.get("composite_unresolved_id"))
            line_id = line["content_line_id"]
            expected_span = source_span(line["source_line_text"], spec["anchor"])
            if record.get("composite_unresolved_id") != composite_id:
                errors.append(f"{unit_id}: composite_unresolved_idが決定規則と不一致")
            if expected_span is None:
                errors.append(f"{unit_id}/{composite_id}: composite plan anchorがsource lineに一意でない")
                continue
            spans_by_line.setdefault(line_id, []).append((expected_span["char_start"], expected_span["char_end"], composite_id))
            if record.get("source_line_ids") != [line_id] or record.get("source_line_text") != line["source_line_text"] or record.get("source_span") != expected_span or record.get("verbatim_anchor") != spec["anchor"] or record.get("exact_source_text") != spec["anchor"]:
                errors.append(f"{unit_id}/{composite_id}: composite source span不一致")
            if record.get("atomization_status") != "composite_unresolved" or record.get("candidate_target") != "unresolved" or record.get("unresolved_points") != spec["unresolved_points"]:
                errors.append(f"{unit_id}/{composite_id}: composite unresolved statusを改変")
            for semantic_field in ("semantic_subject", "inherited_subject", "parent_context", "semantic_action", "semantic_condition", "semantic_predicate", "historical_conflict", "source_span_role"):
                if record.get(semantic_field) != spec.get(semantic_field) or not isinstance(record.get(semantic_field), str) or not record.get(semantic_field).strip():
                    errors.append(f"{unit_id}/{composite_id}: {semantic_field}が欠落またはplanと不一致")
            if record.get("typed_relation") != spec.get("typed_relation"):
                errors.append(f"{unit_id}/{composite_id}: typed_relationが欠落またはplanと不一致")
            elif not isinstance(record.get("typed_relation"), dict) or record["typed_relation"].get("authority_effect") != "none":
                errors.append(f"{unit_id}/{composite_id}: typed_relationが現行authorityへ昇格")
            if record.get("product_boundary") != spec.get("product_boundary"):
                errors.append(f"{unit_id}/{composite_id}: product_boundaryが欠落またはplanと不一致")
            elif not isinstance(record.get("product_boundary"), dict) or record["product_boundary"].get("authority_effect") != "none":
                errors.append(f"{unit_id}/{composite_id}: product_boundaryが現行authorityへ昇格")
            if not isinstance(record.get("questions"), list) or not record["questions"]:
                errors.append(f"{unit_id}/{composite_id}: composite unresolved questionがない")

        for line_id, spans in spans_by_line.items():
            ordered = sorted(spans)
            for previous, current in zip(ordered, ordered[1:]):
                if current[0] < previous[1]:
                    errors.append(f"{unit_id}/{line_id}: 同一source line内のsemantic spanが重複: {previous[2]} / {current[2]}")

        if proposal.get("authority_claim") != "none" or proposal.get("proposal_status") != "needs_independent_review":
            errors.append(f"{unit_id}: authority/proposal statusを昇格または改変")
        if proposal.get("meaning_change_applied") is not False or proposal.get("successor_requirement_ids") != [] or proposal.get("decision_record") is not None:
            errors.append(f"{unit_id}: meaning change/successor/decisionを生成")
        denominator = proposal.get("four_product_denominator", {})
        expected_denominator = {product: {"candidate_atom_count": sum(1 for atom_row in atoms if atom_row.get("candidate_target") == product), "status": "candidate_only" if any(atom_row.get("candidate_target") == product for atom_row in atoms) else "no_direct_source_evidence"} for product in PRODUCTS}
        if denominator != expected_denominator:
            errors.append(f"{unit_id}: four-product denominatorがatom集計と不一致")

    if len(all_input_ids) != len(set(all_input_ids)):
        errors.append("unit間でinput content line id重複")
    if len(all_atom_ids) != len(set(all_atom_ids)):
        errors.append("candidate_atom_id重複")
    if len(all_composite_ids) != len(set(all_composite_ids)):
        errors.append("composite_unresolved_id重複")
    expected_atomized_total = sum(len(row.get("atomized", [])) for row in plan_lines.values())
    expected_composite_total = sum(len(row.get("composite_unresolved", [])) for row in plan_lines.values())
    if inventory.get("input_line_count") != expected_line_total or expected_line_total != 101:
        errors.append("input_line_countが101でない")
    if inventory.get("candidate_atom_count") != len(all_atoms) or inventory.get("atomized_candidate_atom_count") != len(all_atoms) or len(all_atoms) != expected_atomized_total:
        errors.append("atomized candidate atom countがatomization planと不一致")
    if inventory.get("composite_unresolved_count") != len(all_composites) or len(all_composites) != expected_composite_total:
        errors.append("composite_unresolved countがatomization planと不一致")
    for line_id, expected_count in REQUIRED_SPLIT_COUNTS.items():
        actual_count = len(plan_lines.get(line_id, {}).get("atomized", []))
        if actual_count < expected_count:
            errors.append(f"{line_id}: semantic splitが不足（{actual_count} < {expected_count}）")
    actual_counts = {product: {"candidate_atom_count": target_counts[product], "status": "candidate_only" if target_counts[product] else "no_direct_source_evidence"} for product in PRODUCTS}
    if inventory.get("four_product_denominator") != actual_counts:
        errors.append("four-product denominatorがatomized候補集計と不一致")
    if inventory.get("unresolved_target_candidate_atom_count") != unresolved_count:
        errors.append("unresolved target candidate atom countが一致しない")
    expected_inventory_status = {"source_authority": "confirmed (legacy queue declaration)", "target_authority": "none", "carry_forward": "preserved_pending_atomization", "implementation_status": "unknown", "degradation_status": "unknown", "phase_status": "legacy declaration preserved; current phase placement unresolved", "successor_requirement_ids": [], "decision_record": None}
    if any(inventory.get("status_preservation", {}).get(key) != value for key, value in expected_inventory_status.items()):
        errors.append("inventory status_preservationを昇格または改変")
    if inventory.get("proposal_sha256") != file_sha(PROP):
        errors.append("inventory proposal_sha256が不一致")
    return errors


def main() -> int:
    errors = check()
    if errors:
        for error in errors:
            print("FAIL", error)
        return 1
    inventory = json.loads(INVENTORY.read_text(encoding="utf-8"))
    print(f"PASS REQATOM A1 0031--0050: units=20 input_lines={inventory['input_line_count']} atomized_atoms={inventory['candidate_atom_count']} composite_unresolved={inventory['composite_unresolved_count']}")
    denominator = inventory["four_product_denominator"]
    print("PASS four-product denominator: " + " ".join(f"{product.removeprefix('HELIX-')}={row['candidate_atom_count']}" for product, row in denominator.items()) + f" unresolved={inventory['unresolved_target_candidate_atom_count']}")
    print("PASS source/archive digest, asset decision/read-after, exact span/anchor closure")
    print("PASS authority/successor/implementation/degradation/phase remain unresolved")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
