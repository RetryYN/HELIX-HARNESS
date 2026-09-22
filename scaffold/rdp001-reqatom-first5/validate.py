#!/usr/bin/env python3
"""REQATOM A1 first five の source digest／coverage／境界静的検証。"""

from __future__ import annotations

import hashlib
import json
from pathlib import Path


HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
QUEUE = ROOT / "docs/governance/legacy-requirement-atomization-review-queue.jsonl"
LEDGER = ROOT / "docs/governance/legacy-requirement-semantic-line-carry-forward.jsonl"
SOURCE = ROOT / "docs/governance/requirements-source/legacy-documents/docs/design/harness/L1-requirements/business-requirements.md"
ARCHIVE_SOURCE = ROOT / "archive/legacy-generation-2026-09-14/root/docs/design/harness/L1-requirements/business-requirements.md"
PROP = HERE / "proposals.jsonl"
INVENTORY = HERE / "inventory.json"

UNIT_IDS = [f"REQATOM-QUEUE-{n:04d}" for n in range(1, 6)]
PRODUCTS = ["HELIX-HARNESS", "HELIX-OS", "HELIX-Web", "HELIX-Web-OS"]
KINDS = ["requirement", "constraint", "acceptance", "premise", "rationale", "example", "navigation", "metadata", "unresolved", "connection"]
GRANULARITIES = ["unit", "connection", "composite", "unresolved"]
RELATIONS = ["exact", "partial", "adds-condition", "conflicts", "example-of", "rationale-for", "unrelated", "unresolved"]


# Fixed reviewer contracts independent of mutable proposal bytes.
EXPECTED_NORMALIZED_STATEMENTS = {'A1-0001-01': 'business sourceはL0のSSoT用語・業界標準・Bounded Contextを参照し、独自の用語定義を行わない。',
 'A1-0001-02': '旧business sourceはBR 10件（BR-01〜08、BR-21、BR-22）とUX 3件を確定件数として宣言する。',
 'A1-0001-03': '旧sourceはNFR 15件をnfr.mdの正本として宣言し、NFR-09/10欠番とNFR-17統合セキュリティ追加を明記する。',
 'A1-0001-04': '旧L3 PLANはbusiness sub-docの全件をdependencies.requiresへ列挙する接続規約を持つ。',
 'A1-0002-01': '旧sourceは社内開発チーム前提を、1人の開発者がAIへ委譲するsolo＋AI agent rosterへ写像し、機械機構は不変とする。',
 'A1-0003-01': 'AI実装エージェントへ安全に開発を委譲するための検証・開発基盤が旧source時点で存在しない。',
 'A1-0003-02': 'AI委譲後も回帰を壊さず、設計・実装・テストの整合を機械強制する仕組みが必要である。',
 'A1-0003-03': 'POはL0企画・L1業務要求・L2デザインモック・L3承認のみを担うという旧actor boundaryを保持する。',
 'A1-0003-04': '旧sourceはL3起草からL7実装までをAI agent rosterが無人完走する工程接続として記述する。',
 'A1-0003-05': '旧sourceはL8〜L14検証をAI agent rosterが無人完走する実行接続として記述する。',
 'A1-0003-06': '旧sourceはPR/CI/merge/tagまでAI agent rosterが無人完走する範囲として列挙する。',
 'A1-0004-01': 'HELIXはAI実装エージェントへ安全に開発を委譲する検証・開発基盤を提供する。',
 'A1-0004-02': 'V-model L0-L14の全工程についてPLAN管理・gate判定・trace整合を機械強制し、工程規律を保つ。',
 'A1-0004-03': '旧sourceはsolo前提で人間1名（PO）とAI agent roster（tl/qa/aim/uiux）が全工程を回す接続を記述する。',
 'A1-0004-04': 'この文脈でHELIX-HARNESSは仕組みを実装・配布するrepository／harness package名として扱う。',
 'A1-0005-01': '本プロダクトの価値はprocess・safety・automationを偏らせず統合することであり、単一要素への最適化を禁ずる。'}
EXPECTED_IDENTITY_RELATIONS = {'A1-0001-01': [{'identity': 'current-l1:HARNESS-L1-001', 'relation': 'unresolved'}],
 'A1-0001-02': [{'identity': 'legacy-source:business-requirement-count-declaration', 'relation': 'exact'}],
 'A1-0001-03': [{'identity': 'legacy-source:nfr-count-declaration', 'relation': 'exact'}],
 'A1-0001-04': [{'identity': 'current-l1:HARNESS-L1-003', 'relation': 'partial'}],
 'A1-0002-01': [{'identity': 'current-l1:HARNESS-L1-004', 'relation': 'partial'},
                {'identity': 'current-l1:HELIXOS-L1-003', 'relation': 'unresolved'}],
 'A1-0003-01': [{'identity': 'current-l1:HARNESS-L1-001', 'relation': 'partial'}],
 'A1-0003-02': [{'identity': 'current-l1:HARNESS-L1-003', 'relation': 'partial'},
                {'identity': 'current-l1:HARNESS-L1-004', 'relation': 'partial'}],
 'A1-0003-03': [{'identity': 'current-l1:HARNESS-L1-004', 'relation': 'partial'},
                {'identity': 'current-l1:HELIXOS-L1-003', 'relation': 'unresolved'}],
 'A1-0003-04': [{'identity': 'current-l1:HARNESS-L1-001', 'relation': 'partial'},
                {'identity': 'current-l1:HELIXOS-L1-003', 'relation': 'unresolved'}],
 'A1-0003-05': [{'identity': 'current-l1:HELIXOS-L1-003', 'relation': 'partial'},
                {'identity': 'current-l1:HARNESS-L1-004', 'relation': 'unresolved'}],
 'A1-0003-06': [{'identity': 'current-l1:HELIXOS-L1-004', 'relation': 'conflicts'}],
 'A1-0004-01': [{'identity': 'current-l1:HARNESS-L1-001', 'relation': 'partial'}],
 'A1-0004-02': [{'identity': 'current-l1:HARNESS-L1-001', 'relation': 'partial'},
                {'identity': 'current-l1:HARNESS-L1-003', 'relation': 'partial'},
                {'identity': 'current-l1:HARNESS-L1-004', 'relation': 'partial'}],
 'A1-0004-03': [{'identity': 'current-l1:HARNESS-L1-004', 'relation': 'partial'},
                {'identity': 'current-l1:HELIXOS-L1-003', 'relation': 'unresolved'}],
 'A1-0004-04': [{'identity': 'current-boundary:HARNESS-external-product', 'relation': 'partial'}],
 'A1-0005-01': [{'identity': 'current-l1:HARNESS-L1-001', 'relation': 'partial'},
                {'identity': 'current-l1:HARNESS-L1-003', 'relation': 'partial'},
                {'identity': 'current-l1:HARNESS-L1-004', 'relation': 'partial'}]}
EXPECTED_KEYSETS = {'atom': {'actor_candidate',
          'authority_boundary',
          'candidate_atom_id',
          'candidate_granularity',
          'candidate_kind',
          'candidate_target',
          'consumer_candidate',
          'evidence_or_acceptance_conditions',
          'exact_source_text',
          'existing_identity_relations',
          'failure_or_stop_conditions',
          'legacy_failure_candidate',
          'negative_or_exception_conditions',
          'normalized_statement',
          'possible_conflicts',
          'questions',
          'retained_meaning',
          'source_line_ids',
          'status_preservation'},
 'atom_status': {'carry_forward',
                 'degradation_status',
                 'implementation_status',
                 'phase_status',
                 'source_authority',
                 'successor_status',
                 'target_authority'},
 'consumer': {'current_status', 'legacy_refs'},
 'failure': {'status', 'conditions'},
 'inputs': {'archive_source_path',
            'archive_source_sha256',
            'legacy_asset_consumer_refs',
            'legacy_asset_decision_ref',
            'legacy_asset_decision_status',
            'legacy_asset_disposition',
            'legacy_asset_id',
            'legacy_asset_implementation_status',
            'legacy_asset_product_target',
            'legacy_asset_read_after_consumer_match',
            'legacy_asset_read_after_consumer_refs',
            'legacy_asset_read_after_digest_match',
            'legacy_asset_read_after_failure',
            'legacy_asset_read_after_id',
            'legacy_asset_read_after_result',
            'legacy_asset_revision',
            'queue_path',
            'queue_sha256',
            'semantic_line_ledger_path',
            'semantic_line_ledger_sha256',
            'source_path',
            'source_sha256'},
 'inventory': {'authority_effect',
               'candidate_atom_count',
               'four_product_denominator',
               'generated_at',
               'input_line_count',
               'inputs',
               'proposal_sha256',
               'proposal_status',
               'review_unit_count',
               'review_unit_ids',
               'schema_revision',
               'source_commit',
               'status_preservation',
               'unresolved_target_candidate_atom_count'},
 'inventory_status': {'carry_forward',
                      'decision_record',
                      'degradation_status',
                      'implementation_status',
                      'phase_status',
                      'source_authority',
                      'successor_requirement_ids',
                      'target_authority'},
 'line_coverage': {'shared_context', 'consumed_once', 'unresolved'},
 'product_entry': {'candidate_atom_count', 'status'},
 'products': {'HELIX-Web', 'HELIX-HARNESS', 'HELIX-OS', 'HELIX-Web-OS'},
 'proposal': {'authority_claim',
              'candidate_atoms',
              'decision_record',
              'four_product_denominator',
              'input_content_line_digests',
              'input_content_line_ids',
              'input_heading_path',
              'input_source_line_range',
              'input_source_path',
              'input_source_revision',
              'line_coverage',
              'meaning_change_applied',
              'proposal_status',
              'review_sequence',
              'review_unit_id',
              'successor_requirement_ids'},
 'relation': {'relation', 'identity'}}


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


def check() -> list[str]:
    errors: list[str] = []
    try:
        inventory = json.loads(INVENTORY.read_text(encoding="utf-8"))
        proposals = load_jsonl(PROP)
        queue_rows = {row["review_unit_id"]: row for row in load_jsonl(QUEUE)}
        ledger_rows = {row["content_line_id"]: row for row in load_jsonl(LEDGER)}
    except (OSError, ValueError, KeyError, json.JSONDecodeError) as exc:
        return [f"入力読み込み失敗: {exc}"]


    def check_keys(value: object, expected: set[str], label: str) -> None:
        if not isinstance(value, dict) or set(value) != expected:
            errors.append(f"E_KEYSET:{label}")

    check_keys(inventory, EXPECTED_KEYSETS["inventory"], "inventory")
    check_keys(inventory.get("inputs"), EXPECTED_KEYSETS["inputs"], "inventory.inputs")
    check_keys(inventory.get("four_product_denominator"), EXPECTED_KEYSETS["products"], "inventory.four_product_denominator")
    check_keys(inventory.get("status_preservation"), EXPECTED_KEYSETS["inventory_status"], "inventory.status_preservation")
    for product in PRODUCTS:
        check_keys(inventory.get("four_product_denominator", {}).get(product), EXPECTED_KEYSETS["product_entry"], f"inventory.four_product_denominator.{product}")
    for index, proposal in enumerate(proposals):
        label = f"proposal[{index}]"
        check_keys(proposal, EXPECTED_KEYSETS["proposal"], label)
        check_keys(proposal.get("line_coverage"), EXPECTED_KEYSETS["line_coverage"], label + ".line_coverage")
        unit_id = proposal.get("review_unit_id")
        if unit_id in queue_rows:
            check_keys(proposal.get("input_content_line_digests"), set(queue_rows[unit_id]["content_line_ids"]), label + ".input_content_line_digests")
        check_keys(proposal.get("four_product_denominator"), EXPECTED_KEYSETS["products"], label + ".four_product_denominator")
        for product in PRODUCTS:
            check_keys(proposal.get("four_product_denominator", {}).get(product), EXPECTED_KEYSETS["product_entry"], label + f".four_product_denominator.{product}")
        for atom_index, atom in enumerate(proposal.get("candidate_atoms", [])):
            atom_label = label + f".candidate_atoms[{atom_index}]"
            check_keys(atom, EXPECTED_KEYSETS["atom"], atom_label)
            for relation_index, relation in enumerate(atom.get("existing_identity_relations", [])):
                check_keys(relation, EXPECTED_KEYSETS["relation"], atom_label + f".existing_identity_relations[{relation_index}]")
            check_keys(atom.get("legacy_failure_candidate"), EXPECTED_KEYSETS["failure"], atom_label + ".legacy_failure_candidate")
            check_keys(atom.get("consumer_candidate"), EXPECTED_KEYSETS["consumer"], atom_label + ".consumer_candidate")
            check_keys(atom.get("status_preservation"), EXPECTED_KEYSETS["atom_status"], atom_label + ".status_preservation")

    if inventory.get("schema_revision") != 1:
        errors.append("inventory schema_revision が1でない")
    if inventory.get("authority_effect") != "none":
        errors.append("inventory authority_effect が none でない")
    if inventory.get("proposal_status") != "needs_independent_review":
        errors.append("inventory proposal_status が needs_independent_review でない")
    if inventory.get("source_commit") != "4a195555fed7f5e67e7839be232570972dc6e2ae":
        errors.append("source_commit が指定された exact main でない")

    inputs = inventory.get("inputs", {})
    expected_files = {
        "queue_sha256": QUEUE,
        "semantic_line_ledger_sha256": LEDGER,
        "source_sha256": SOURCE,
        "archive_source_sha256": ARCHIVE_SOURCE,
    }
    for field, path in expected_files.items():
        if not path.is_file():
            errors.append(f"入力source不存在: {path}")
        elif inputs.get(field) != file_sha(path):
            errors.append(f"inventory {field} が実体digestと不一致")
    if not SOURCE.is_file() or not ARCHIVE_SOURCE.is_file():
        return errors
    if file_sha(SOURCE) != file_sha(ARCHIVE_SOURCE):
        errors.append("現行read-only source snapshotとarchive sourceのdigestが不一致")
    if inputs.get("legacy_asset_id") != "LEGACY-ASSET-9F48ADEEB477DCA54039":
        errors.append("legacy asset id がbusiness source snapshotと不一致")
    if inputs.get("legacy_asset_disposition") != "source_snapshot_preservation":
        errors.append("legacy asset disposition がsource_snapshot_preservationでない")
    if inputs.get("legacy_asset_implementation_status") != "non_executable_read_only_source":
        errors.append("legacy asset implementation_status がnon_executable_read_only_sourceでない")
    if inputs.get("legacy_asset_product_target") != "unresolved":
        errors.append("legacy asset product_targetをunresolved以外へ昇格している")
    if inputs.get("legacy_asset_decision_status") != "pending_human_confirmation":
        errors.append("legacy asset decision statusをpending以外へ昇格している")
    if inputs.get("legacy_asset_consumer_refs") != ["requirement-carry-forward-ledgers", "requirement-atomization-review"]:
        errors.append("legacy asset consumer_refsが既存台帳と不一致")
    if inputs.get("legacy_asset_read_after_id") != "READ-REQ-SNAPSHOT-9F48ADEEB477DCA54039":
        errors.append("legacy asset read-after idが不一致")
    if inputs.get("legacy_asset_read_after_result") != "pass":
        errors.append("legacy asset read-after resultをpass以外へ改変")
    if inputs.get("legacy_asset_read_after_digest_match") is not True or inputs.get("legacy_asset_read_after_consumer_match") is not True:
        errors.append("legacy asset read-after digest／consumer matchがtrueでない")
    if inputs.get("legacy_asset_read_after_failure") is not None:
        errors.append("legacy asset read-after failureをnull以外へ改変")
    if inputs.get("legacy_asset_read_after_consumer_refs") != ["requirement-carry-forward-ledgers", "requirement-atomization-review"]:
        errors.append("legacy asset read-after consumer refsが不一致")

    if [row.get("review_unit_id") for row in proposals] != UNIT_IDS:
        errors.append("proposalのunit順序または集合がREQATOM-QUEUE-0001..0005でない")
    if inventory.get("review_unit_ids") != UNIT_IDS or inventory.get("review_unit_count") != 5:
        errors.append("inventory review unit分母が不一致")
    if len(proposals) != 5:
        errors.append(f"proposal行数が5でない: {len(proposals)}")

    source_lines = SOURCE.read_text(encoding="utf-8").splitlines()
    all_input_ids: list[str] = []
    all_atoms: list[dict] = []
    target_counts = {product: 0 for product in PRODUCTS}
    unresolved_targets = 0
    for proposal in proposals:
        unit_id = proposal.get("review_unit_id")
        queue = queue_rows.get(unit_id)
        if not queue:
            errors.append(f"queueにないreview_unit_id: {unit_id}")
            continue
        expected_ids = queue["content_line_ids"]
        input_ids = proposal.get("input_content_line_ids")
        if input_ids != expected_ids:
            errors.append(f"{unit_id}: input_content_line_idsがqueueと不一致")
        all_input_ids.extend(input_ids or [])
        if proposal.get("input_source_path") != queue["source_path"] or proposal.get("input_source_revision") != queue["source_file_sha256"]:
            errors.append(f"{unit_id}: source path／revisionがqueueと不一致")
        if proposal.get("input_source_line_range") != [queue["source_line_start"], queue["source_line_end"]]:
            errors.append(f"{unit_id}: source line rangeがqueueと不一致")
        coverage = proposal.get("line_coverage", {})
        consumed = coverage.get("consumed_once", [])
        unresolved = coverage.get("unresolved", [])
        shared = coverage.get("shared_context", [])
        if len(consumed) != len(set(consumed)) or len(unresolved) != len(set(unresolved)):
            errors.append(f"{unit_id}: line coverage内で重複")
        if set(consumed) & set(unresolved):
            errors.append(f"{unit_id}: consumed_onceとunresolvedが重複")
        if set(consumed) | set(unresolved) != set(expected_ids):
            errors.append(f"{unit_id}: input lineがcoverageで全量被覆されていない")
        if set(shared) & set(expected_ids):
            errors.append(f"{unit_id}: shared_contextに当該unitの入力lineが混入")
        digest_map = proposal.get("input_content_line_digests", {})
        atoms = proposal.get("candidate_atoms", [])
        atom_line_refs = []
        for candidate in atoms:
            all_atoms.append(candidate)
            atom_id = candidate.get("candidate_atom_id")
            line_ids = candidate.get("source_line_ids", [])
            atom_line_refs.extend(line_ids)
            if not atom_id:
                errors.append(f"{unit_id}: candidate_atom_id欠落")
            if not line_ids or not set(line_ids) <= set(expected_ids):
                errors.append(f"{unit_id}/{atom_id}: source_line_idsが入力unit外または欠落")
            if candidate.get("candidate_kind") not in KINDS:
                errors.append(f"{unit_id}/{atom_id}: candidate_kind不正")
            if candidate.get("candidate_target") not in PRODUCTS + ["unresolved"]:
                errors.append(f"{unit_id}/{atom_id}: candidate_target不正")
            if candidate.get("candidate_granularity") not in GRANULARITIES:
                errors.append(f"{unit_id}/{atom_id}: candidate_granularity不正")
            if candidate.get("normalized_statement") != EXPECTED_NORMALIZED_STATEMENTS.get(atom_id):
                errors.append(f"{unit_id}/{atom_id}: normalized_statementが独立canonical意味と不一致")
            if candidate.get("existing_identity_relations") != EXPECTED_IDENTITY_RELATIONS.get(atom_id):
                errors.append(f"{unit_id}/{atom_id}: existing_identity_relationsが独立canonical関係と不一致")
            relations = candidate.get("existing_identity_relations")
            if not isinstance(relations, list):
                errors.append(f"{unit_id}/{atom_id}: existing_identity_relations欠落")
            else:
                for relation in relations:
                    if relation.get("relation") not in RELATIONS or not relation.get("identity"):
                        errors.append(f"{unit_id}/{atom_id}: existing identity relation不正")
            for line_id in line_ids:
                line = ledger_rows.get(line_id)
                if not line:
                    errors.append(f"{unit_id}/{atom_id}: semantic ledgerにないline {line_id}")
                    continue
                if line.get("source_file_sha256") != queue["source_file_sha256"]:
                    errors.append(f"{unit_id}/{atom_id}: line source digestがqueueと不一致")
                if line.get("source_line_sha256") != digest_map.get(line_id):
                    errors.append(f"{unit_id}/{atom_id}: line digest mapがledgerと不一致")
                line_number = line.get("source_line")
                if not isinstance(line_number, int) or not (1 <= line_number <= len(source_lines)):
                    errors.append(f"{unit_id}/{atom_id}: source line number範囲外")
                    continue
                if source_lines[line_number - 1] != line.get("source_line_text"):
                    errors.append(f"{unit_id}/{atom_id}: working tree source textがledgerと不一致")
                if candidate.get("exact_source_text") != line.get("source_line_text"):
                    errors.append(f"{unit_id}/{atom_id}: exact_source_textがledgerと不一致")
                if line.get("source_line_sha256") != "sha256:" + sha256(line["source_line_text"].encode("utf-8")):
                    errors.append(f"{unit_id}/{atom_id}: ledger line digest自体が不一致")
            for key in ("retained_meaning", "actor_candidate", "authority_boundary", "failure_or_stop_conditions", "evidence_or_acceptance_conditions", "negative_or_exception_conditions", "possible_conflicts", "questions"):
                if not isinstance(candidate.get(key), list) or not candidate.get(key):
                    errors.append(f"{unit_id}/{atom_id}: {key}が空または配列でない")
            failure_candidate = candidate.get("legacy_failure_candidate", {})
            if failure_candidate.get("status") != "source_meaning_preserved; current_failure_contract_unresolved":
                errors.append(f"{unit_id}/{atom_id}: legacy failure contractを昇格または改変")
            if failure_candidate.get("conditions") != candidate.get("failure_or_stop_conditions"):
                errors.append(f"{unit_id}/{atom_id}: legacy failure conditionsが不一致")
            consumer_candidate = candidate.get("consumer_candidate", {})
            if consumer_candidate.get("legacy_refs") != ["requirement-carry-forward-ledgers", "requirement-atomization-review"] or consumer_candidate.get("current_status") != "unresolved":
                errors.append(f"{unit_id}/{atom_id}: consumer statusを昇格または改変")
            status = candidate.get("status_preservation", {})
            expected_status = {
                "source_authority": "confirmed (legacy source declaration)",
                "target_authority": "none",
                "carry_forward": "preserved_pending_atomization",
                "implementation_status": "unknown",
                "degradation_status": "unknown",
                "successor_status": "unassigned",
            }
            for key, value in expected_status.items():
                if status.get(key) != value:
                    errors.append(f"{unit_id}/{atom_id}: status_preservation.{key}を昇格または改変")
            target = candidate.get("candidate_target")
            if target in target_counts:
                target_counts[target] += 1
            else:
                unresolved_targets += 1
        if not set(consumed) <= set(atom_line_refs):
            errors.append(f"{unit_id}: consumed_onceの全lineが少なくとも1 atomに現れない")
        if proposal.get("authority_claim") != "none":
            errors.append(f"{unit_id}: authority_claimがnoneでない")
        if proposal.get("proposal_status") != "needs_independent_review":
            errors.append(f"{unit_id}: proposal_statusがneeds_independent_reviewでない")
        if proposal.get("meaning_change_applied") is not False:
            errors.append(f"{unit_id}: meaning_change_appliedがfalseでない")
        if proposal.get("successor_requirement_ids") != []:
            errors.append(f"{unit_id}: successor requirementが空でない")
        if proposal.get("decision_record") is not None:
            errors.append(f"{unit_id}: decision_recordがnullでない")
        denominator = proposal.get("four_product_denominator", {})
        if set(denominator) != set(PRODUCTS):
            errors.append(f"{unit_id}: four-product denominatorが4製品で閉じていない")
        for product in PRODUCTS:
            if not isinstance(denominator.get(product, {}).get("candidate_atom_count"), int):
                errors.append(f"{unit_id}: denominator {product} count不正")
        if unit_id == "REQATOM-QUEUE-0003":
            if not any("merge" in conflict or "権限" in conflict for atom in atoms for conflict in atom.get("possible_conflicts", [])):
                errors.append("REQATOM-QUEUE-0003: merge／権限境界のconflictが保持されていない")

    if len(all_input_ids) != len(set(all_input_ids)):
        errors.append("unit間でinput content line idが重複")
    if inventory.get("input_line_count") != len(all_input_ids) or inventory.get("input_line_count") != 7:
        errors.append("inventory input_line_countが7でない")
    if inventory.get("candidate_atom_count") != len(all_atoms) or len(all_atoms) != 16:
        errors.append("inventory candidate_atom_countが16でない")
    if inventory.get("four_product_denominator") != {
        "HELIX-HARNESS": {"candidate_atom_count": target_counts["HELIX-HARNESS"], "status": "candidate_only"},
        "HELIX-OS": {"candidate_atom_count": target_counts["HELIX-OS"], "status": "candidate_only"},
        "HELIX-Web": {"candidate_atom_count": 0, "status": "no_direct_source_evidence"},
        "HELIX-Web-OS": {"candidate_atom_count": 0, "status": "no_direct_source_evidence"},
    }:
        errors.append("inventory four-product denominatorがatom集計と不一致")
    if inventory.get("unresolved_target_candidate_atom_count") != unresolved_targets:
        errors.append("unresolved target candidate atom countが不一致")
    status = inventory.get("status_preservation", {})
    for key, value in {
        "source_authority": "confirmed (legacy queue declaration)",
        "target_authority": "none",
        "carry_forward": "preserved_pending_atomization",
        "implementation_status": "unknown",
        "degradation_status": "unknown",
        "successor_requirement_ids": [],
        "decision_record": None,
    }.items():
        if status.get(key) != value:
            errors.append(f"inventory status_preservation.{key}を昇格または改変")
    if inventory.get("proposal_sha256") != file_sha(PROP):
        errors.append("inventory proposal_sha256がproposals.jsonlと不一致")
    return errors


def main() -> int:
    errors = check()
    if errors:
        for error in errors:
            print("FAIL", error)
        return 1
    print("PASS REQATOM A1 first five: units=5 input_lines=7 atoms=16")
    print("PASS four-product denominator: HARNESS=12 OS=2 Web=0 Web-OS=0 unresolved_target=2")
    print("PASS source／archive digest and semantic line closure; authority/successor/decision remain none")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
