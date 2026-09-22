#!/usr/bin/env python3
"""REQATOM A1 0006--0010 の source、coverage、product境界を静的検査する。"""

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
ASSETS = ROOT / "docs/governance/legacy-asset-disposition.jsonl"
DECISIONS = ROOT / "docs/governance/legacy-asset-decisions.jsonl"
COPY_READ_AFTER = ROOT / "docs/governance/legacy-asset-copy-read-after.jsonl"
PROP = HERE / "proposals.jsonl"
INVENTORY = HERE / "inventory.json"

UNIT_IDS = [f"REQATOM-QUEUE-{n:04d}" for n in range(6, 11)]
PRODUCTS = ["HELIX-HARNESS", "HELIX-OS", "HELIX-Web", "HELIX-Web-OS"]
KINDS = ["requirement", "constraint", "acceptance", "premise", "rationale", "example", "navigation", "metadata", "unresolved", "connection"]
GRANULARITIES = ["unit", "connection", "composite", "unresolved"]
RELATIONS = ["exact", "partial", "adds-condition", "conflicts", "example-of", "rationale-for", "unrelated", "unresolved"]
SOURCE_COMMIT = "2654cf936719dee21dfbf1ceb8140163400f081a"
ASSET_ID = "LEGACY-ASSET-9F48ADEEB477DCA54039"
DECISION_ID = "REQ-SNAPSHOT-CORRECTION-9F48ADEEB477DCA54039"
READ_AFTER_ID = "READ-REQ-SNAPSHOT-9F48ADEEB477DCA54039"
EXPECTED_INVENTORY_KEYS = {
    "schema_revision", "generated_at", "authority_effect", "proposal_status", "source_commit", "inputs",
    "review_unit_ids", "review_unit_count", "input_line_count", "candidate_atom_count",
    "four_product_denominator", "unresolved_target_candidate_atom_count", "status_preservation", "proposal_sha256",
}
EXPECTED_INPUT_KEYS = {
    "queue_path", "queue_sha256", "semantic_line_ledger_path", "semantic_line_ledger_sha256", "source_path",
    "source_sha256", "archive_source_path", "archive_source_sha256", "legacy_asset_id", "legacy_asset_revision",
    "legacy_asset_disposition", "legacy_asset_implementation_status", "legacy_asset_product_target",
    "legacy_asset_decision_status", "legacy_asset_decision_ref", "legacy_asset_correction_decision",
    "legacy_asset_correction_supersedes", "legacy_asset_read_after_id", "legacy_asset_read_after_result",
    "legacy_asset_read_after_digest_match", "legacy_asset_read_after_consumer_match", "legacy_asset_read_after_failure",
    "legacy_asset_consumer_refs", "legacy_asset_read_after_consumer_refs",
}
EXPECTED_INVENTORY_PRODUCT_KEYS = {"candidate_atom_count", "status"}
EXPECTED_STATUS_PRESERVATION_KEYS = {
    "source_authority", "target_authority", "carry_forward", "implementation_status", "degradation_status",
    "phase_status", "successor_requirement_ids", "decision_record",
}
EXPECTED_PROPOSAL_KEYS = {
    "review_unit_id", "review_sequence", "input_source_path", "input_source_revision", "input_heading_path",
    "input_source_line_range", "input_content_line_ids", "input_content_line_digests", "line_coverage",
    "candidate_atoms", "four_product_denominator", "authority_claim", "proposal_status",
    "meaning_change_applied", "successor_requirement_ids", "decision_record",
}
EXPECTED_LINE_COVERAGE_KEYS = {"consumed_once", "unresolved", "shared_context"}
EXPECTED_ATOM_KEYS = {
    "candidate_atom_id", "source_line_ids", "exact_source_text", "normalized_statement", "candidate_kind",
    "candidate_target", "candidate_granularity", "existing_identity_relations", "retained_meaning",
    "actor_candidate", "authority_boundary", "failure_or_stop_conditions", "evidence_or_acceptance_conditions",
    "negative_or_exception_conditions", "legacy_failure_candidate", "consumer_candidate", "possible_conflicts",
    "questions", "candidate_inference", "status_preservation",
}
EXPECTED_RELATION_KEYS = {"identity", "relation"}
EXPECTED_LEGACY_FAILURE_KEYS = {"status", "conditions"}
EXPECTED_CONSUMER_KEYS = {"legacy_refs", "current_status"}
EXPECTED_ATOM_STATUS_KEYS = {
    "source_authority", "target_authority", "carry_forward", "implementation_status", "degradation_status",
    "phase_status", "successor_status",
}
EXPECTED_PRODUCT_KEYS = {"HELIX-HARNESS", "HELIX-OS", "HELIX-Web", "HELIX-Web-OS"}

# This is intentionally independent of proposals.jsonl.  It is the bounded
# semantic contract for the ten atom IDs, rather than a digest copied from the
# candidate file under review.
EXPECTED_NORMALIZED_STATEMENTS = {
    "A1-0006-01": "旧business文書がBR-01〜08を収める業務要求節へ進むことを示す。",
    "A1-0007-01": "旧business要求表の列見出しがID・業務要求・出所(trace)の三欄を宣言する。",
    "A1-0008-01": "旧business文書がUX-01〜03を収めるUX要求節へ進むことを示す。",
    "A1-0009-01": "旧UX要求表の列見出しがID・UX/価値要求・出所(trace)の三欄を宣言する。",
    "A1-0010-01": "旧sourceはPOをscope・受入・最終承認と業務要求定義の主体として記述する。",
    "A1-0010-02": "旧sourceはPOのscope・受入・最終承認というactor役割を記述する。HELIX-OS接続は別途確認する候補であり、旧sourceの機能記述ではない。",
    "A1-0010-03": "旧sourceはAI agent rosterを実装・レビュー・検証agentとして記述し、workerとverifierの分離およびL0-L3人間承認境界をharnessが機械強制する対象とする。",
    "A1-0010-04": "旧sourceはAI agent roster、worker≠verifier、L0-L3人間承認境界を記述する。HELIX-OS接続は別途確認する候補であり、旧sourceの機能記述ではない。",
    "A1-0010-05": "旧sourceはHELIX運用者を、HELIXを超個人開発基盤として使う本人であり、社内・チーム利用の展開先はHELIX-HARNESS packageと記述する。",
    "A1-0010-06": "旧sourceはHELIX運用者とHARNESS packageの展開先を記述する。HELIX-OS接続は別途確認する候補であり、旧sourceの配布機能記述ではない。",
}
EXPECTED_NORMALIZED_STATEMENTS_DIGEST = "d40fa1ab5669a20721672d740906e77e9f6538b105dff766216b39a1e55512f6"


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


def check_keys(errors: list[str], value: object, expected: set[str], label: str) -> None:
    """Fail closed when any inventory/proposal object gains or loses a field."""
    if not isinstance(value, dict):
        errors.append(f"{label}: objectではない")
        return
    if set(value) != expected:
        errors.append(f"{label}: keyset不一致")


def normalized_statement_digest(statements: dict[str, str]) -> str:
    canonical = "\n".join(f"{atom_id}\t{statements[atom_id]}" for atom_id in sorted(statements)) + "\n"
    return sha256(canonical.encode("utf-8"))


def check() -> list[str]:
    errors: list[str] = []
    try:
        inventory = json.loads(INVENTORY.read_text(encoding="utf-8"))
        proposals = load_jsonl(PROP)
        queue_rows = {row["review_unit_id"]: row for row in load_jsonl(QUEUE)}
        ledger_rows = {row["content_line_id"]: row for row in load_jsonl(LEDGER)}
        asset_rows = {row["asset_id"]: row for row in load_jsonl(ASSETS)}
        decision_rows = {row["decision_id"]: row for row in load_jsonl(DECISIONS)}
        read_rows = {row["read_after_id"]: row for row in load_jsonl(COPY_READ_AFTER)}
    except (OSError, ValueError, KeyError, json.JSONDecodeError) as exc:
        return [f"入力読み込み失敗: {exc}"]

    # Inventory and proposals are closed scaffold interfaces.  Check every
    # object before semantic validation so added fields cannot become silent
    # evidence (for example merge_admission or verified flags).
    check_keys(errors, inventory, EXPECTED_INVENTORY_KEYS, "inventory")
    check_keys(errors, inventory.get("inputs"), EXPECTED_INPUT_KEYS, "inventory.inputs")
    check_keys(errors, inventory.get("four_product_denominator"), EXPECTED_PRODUCT_KEYS, "inventory.four_product_denominator")
    if isinstance(inventory.get("four_product_denominator"), dict):
        for product in PRODUCTS:
            check_keys(errors, inventory["four_product_denominator"].get(product), EXPECTED_INVENTORY_PRODUCT_KEYS, f"inventory.four_product_denominator.{product}")
    check_keys(errors, inventory.get("status_preservation"), EXPECTED_STATUS_PRESERVATION_KEYS, "inventory.status_preservation")

    for proposal_index, proposal in enumerate(proposals):
        label = f"proposal[{proposal_index}]"
        check_keys(errors, proposal, EXPECTED_PROPOSAL_KEYS, label)
        if not isinstance(proposal, dict):
            continue
        check_keys(errors, proposal.get("line_coverage"), EXPECTED_LINE_COVERAGE_KEYS, label + ".line_coverage")
        check_keys(errors, proposal.get("four_product_denominator"), EXPECTED_PRODUCT_KEYS, label + ".four_product_denominator")
        if isinstance(proposal.get("four_product_denominator"), dict):
            for product in PRODUCTS:
                check_keys(errors, proposal["four_product_denominator"].get(product), EXPECTED_INVENTORY_PRODUCT_KEYS, f"{label}.four_product_denominator.{product}")
        unit_id = proposal.get("review_unit_id")
        queue = queue_rows.get(unit_id)
        if queue:
            check_keys(errors, proposal.get("input_content_line_digests"), set(queue.get("content_line_ids", [])), label + ".input_content_line_digests")
        else:
            check_keys(errors, proposal.get("input_content_line_digests"), set(), label + ".input_content_line_digests")
        atoms = proposal.get("candidate_atoms")
        if not isinstance(atoms, list):
            errors.append(label + ".candidate_atoms: 配列ではない")
            continue
        for atom_index, atom in enumerate(atoms):
            atom_label = f"{label}.candidate_atoms[{atom_index}]"
            check_keys(errors, atom, EXPECTED_ATOM_KEYS, atom_label)
            if not isinstance(atom, dict):
                continue
            relations = atom.get("existing_identity_relations")
            if not isinstance(relations, list):
                errors.append(atom_label + ".existing_identity_relations: 配列ではない")
            else:
                for relation_index, relation in enumerate(relations):
                    check_keys(errors, relation, EXPECTED_RELATION_KEYS, f"{atom_label}.existing_identity_relations[{relation_index}]")
            check_keys(errors, atom.get("legacy_failure_candidate"), EXPECTED_LEGACY_FAILURE_KEYS, atom_label + ".legacy_failure_candidate")
            check_keys(errors, atom.get("consumer_candidate"), EXPECTED_CONSUMER_KEYS, atom_label + ".consumer_candidate")
            check_keys(errors, atom.get("status_preservation"), EXPECTED_ATOM_STATUS_KEYS, atom_label + ".status_preservation")

    if inventory.get("schema_revision") != 1:
        errors.append("inventory schema_revision が1でない")
    if inventory.get("authority_effect") != "none":
        errors.append("inventory authority_effect が none でない")
    if inventory.get("proposal_status") != "needs_independent_review":
        errors.append("inventory proposal_status が needs_independent_review でない")
    if inventory.get("source_commit") != SOURCE_COMMIT:
        errors.append("source_commit が origin/main の exact revision でない")

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
    if inputs.get("legacy_asset_id") != ASSET_ID:
        errors.append("legacy asset id がbusiness source snapshotと不一致")
    asset = asset_rows.get(ASSET_ID, {})
    if asset.get("revision") != 3 or asset.get("disposition") != "source_snapshot_preservation":
        errors.append("asset catalogのrevision/dispositionがbusiness sourceと不一致")
    if asset.get("implementation_status") != "non_executable_read_only_source":
        errors.append("asset catalog implementation_statusを昇格または改変")
    if asset.get("product_target") != "unresolved" or asset.get("decision_status") != "pending_human_confirmation":
        errors.append("asset catalog product/decision statusを昇格または改変")
    decision = decision_rows.get(DECISION_ID, {})
    if decision.get("asset_revision_before") != 2 or decision.get("asset_revision_after") != 3:
        errors.append("append-only correction decisionのasset revisionが不一致")
    if decision.get("product_target") != "unresolved" or decision.get("decision_status") != "pending_human_confirmation":
        errors.append("correction decisionのpending statusを改変")
    if decision.get("supersedes_decision_id") != "REQ-SNAPSHOT-9F48ADEEB477DCA54039":
        errors.append("correction decisionのsupersedesが不一致")
    read = read_rows.get(READ_AFTER_ID, {})
    if read.get("asset_revision") != 2 or read.get("result") != "pass" or read.get("digest_match") is not True or read.get("consumer_match") is not True:
        errors.append("read-afterの過去観測を改変")
    if read.get("failure") is not None:
        errors.append("read-after failureはnullである必要がある")
    if asset.get("consumer_refs") != ["requirement-carry-forward-ledgers", "requirement-atomization-review"]:
        errors.append("asset consumer refsが不一致")
    if read.get("consumer_refs_observed") != asset.get("consumer_refs"):
        errors.append("read-after consumer refsがasset catalogと不一致")

    if [row.get("review_unit_id") for row in proposals] != UNIT_IDS:
        errors.append("proposalのunit順序または集合がREQATOM-QUEUE-0006..0010でない")
    if inventory.get("review_unit_ids") != UNIT_IDS or inventory.get("review_unit_count") != 5:
        errors.append("inventory review unit分母が不一致")
    if len(proposals) != 5:
        errors.append(f"proposal行数が5でない: {len(proposals)}")

    source_lines = SOURCE.read_text(encoding="utf-8").splitlines()
    all_input_ids: list[str] = []
    all_atoms: list[dict] = []
    normalized_statements: dict[str, str] = {}
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
        atom_line_refs: list[str] = []
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
            target = candidate.get("candidate_target")
            if target not in PRODUCTS + ["unresolved"]:
                errors.append(f"{unit_id}/{atom_id}: candidate_target不正")
            if candidate.get("candidate_granularity") not in GRANULARITIES:
                errors.append(f"{unit_id}/{atom_id}: candidate_granularity不正")
            relations = candidate.get("existing_identity_relations")
            if not isinstance(relations, list) or not relations:
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
            if not candidate.get("normalized_statement"):
                errors.append(f"{unit_id}/{atom_id}: normalized_statement欠落")
            expected_statement = EXPECTED_NORMALIZED_STATEMENTS.get(atom_id)
            if expected_statement is None:
                errors.append(f"{unit_id}/{atom_id}: canonical normalized_statementのatom IDが未知")
            elif candidate.get("normalized_statement") != expected_statement:
                errors.append(f"{unit_id}/{atom_id}: normalized_statementがcanonical意味と不一致")
            if atom_id:
                normalized_statements[atom_id] = candidate.get("normalized_statement")
            inference = candidate.get("candidate_inference")
            if not isinstance(inference, list) or any(not isinstance(item, str) or not item.strip() for item in inference):
                errors.append(f"{unit_id}/{atom_id}: candidate_inferenceが配列でない")
            if target == "HELIX-OS" and candidate.get("candidate_granularity") == "connection":
                if not inference or not any("current product-boundary comparison" in item for item in inference):
                    errors.append(f"{unit_id}/{atom_id}: OS接続の現行推論がcandidate_inferenceへ分離されていない")
                if "旧source" not in candidate.get("normalized_statement", "") or "記述ではない" not in candidate.get("normalized_statement", ""):
                    errors.append(f"{unit_id}/{atom_id}: normalized_statementが旧source意味とOS推論を分離していない")
                source_overreach_terms = ("decision", "revision", "記録", "Worker", "CI", "permission", "導入", "更新", "復旧", "結果追跡", "distribution")
                retained_text = " ".join(candidate.get("retained_meaning", []))
                if any(term in retained_text for term in source_overreach_terms):
                    errors.append(f"{unit_id}/{atom_id}: retained_meaningへOS機能・現行管理意味を混入")
            for key in ("retained_meaning", "actor_candidate", "authority_boundary", "failure_or_stop_conditions", "evidence_or_acceptance_conditions", "negative_or_exception_conditions", "possible_conflicts", "questions"):
                value = candidate.get(key)
                if not isinstance(value, list) or not value or any(not isinstance(item, str) or not item.strip() for item in value):
                    errors.append(f"{unit_id}/{atom_id}: {key}が空または不正")
            failure = candidate.get("failure_or_stop_conditions")
            legacy_failure = candidate.get("legacy_failure_candidate", {})
            if legacy_failure.get("status") != "source_meaning_preserved; current_failure_contract_unresolved":
                errors.append(f"{unit_id}/{atom_id}: legacy failure contractを昇格または改変")
            if legacy_failure.get("conditions") != failure:
                errors.append(f"{unit_id}/{atom_id}: legacy failure conditionsが不一致")
            consumer = candidate.get("consumer_candidate", {})
            if consumer.get("legacy_refs") != ["requirement-carry-forward-ledgers", "requirement-atomization-review"] or consumer.get("current_status") != "unresolved":
                errors.append(f"{unit_id}/{atom_id}: consumer statusを昇格または改変")
            status = candidate.get("status_preservation", {})
            expected_status = {
                "source_authority": "confirmed (legacy source declaration)",
                "target_authority": "none",
                "carry_forward": "preserved_pending_atomization",
                "implementation_status": "unknown",
                "degradation_status": "unknown",
                "phase_status": "legacy declaration preserved; current phase placement unresolved",
                "successor_status": "unassigned",
            }
            for key, value in expected_status.items():
                if status.get(key) != value:
                    errors.append(f"{unit_id}/{atom_id}: status_preservation.{key}を昇格または改変")
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
            count = denominator.get(product, {}).get("candidate_atom_count")
            if not isinstance(count, int) or count < 0:
                errors.append(f"{unit_id}: denominator {product} count不正")
        if unit_id == "REQATOM-QUEUE-0010":
            conflict_text = " ".join(conflict for atom_row in atoms for conflict in atom_row.get("possible_conflicts", []))
            if not any(word in conflict_text for word in ("権限", "review", "authority", "責務")):
                errors.append("REQATOM-QUEUE-0010: actor／authority／review conflictが保持されていない")

    if len(all_input_ids) != len(set(all_input_ids)):
        errors.append("unit間でinput content line idが重複")
    atom_ids = [atom_row.get("candidate_atom_id") for atom_row in all_atoms]
    if len(atom_ids) != len(set(atom_ids)):
        errors.append("candidate_atom_idが重複")
    if inventory.get("input_line_count") != len(all_input_ids) or inventory.get("input_line_count") != 7:
        errors.append("inventory input_line_countが7でない")
    if inventory.get("candidate_atom_count") != len(all_atoms) or len(all_atoms) != 10:
        errors.append("inventory candidate_atom_countが10でない")
    if set(normalized_statements) != set(EXPECTED_NORMALIZED_STATEMENTS):
        errors.append("normalized_statementのatom ID集合がcanonical集合と不一致")
    if normalized_statement_digest(normalized_statements) != EXPECTED_NORMALIZED_STATEMENTS_DIGEST:
        errors.append("normalized_statement canonical集合digestが不一致")
    expected_counts = {
        "HELIX-HARNESS": {"candidate_atom_count": target_counts["HELIX-HARNESS"], "status": "candidate_only"},
        "HELIX-OS": {"candidate_atom_count": target_counts["HELIX-OS"], "status": "candidate_only"},
        "HELIX-Web": {"candidate_atom_count": 0, "status": "no_direct_source_evidence"},
        "HELIX-Web-OS": {"candidate_atom_count": 0, "status": "no_direct_source_evidence"},
    }
    if inventory.get("four_product_denominator") != expected_counts:
        errors.append("inventory four-product denominatorがatom集計と不一致")
    if inventory.get("unresolved_target_candidate_atom_count") != unresolved_targets or unresolved_targets != 2:
        errors.append("unresolved target candidate atom countが不一致")
    for key, value in {
        "source_authority": "confirmed (legacy queue declaration)",
        "target_authority": "none",
        "carry_forward": "preserved_pending_atomization",
        "implementation_status": "unknown",
        "degradation_status": "unknown",
        "successor_requirement_ids": [],
        "decision_record": None,
    }.items():
        if inventory.get("status_preservation", {}).get(key) != value:
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
    print("PASS REQATOM A1 next five: units=5 input_lines=7 atoms=10")
    print("PASS four-product denominator: HARNESS=5 OS=3 Web=0 Web-OS=0 unresolved_target=2")
    print("PASS source/archive digest, asset decision/read-after, semantic line closure")
    print("PASS authority/successor/implementation/degradation/phase remain unresolved")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
