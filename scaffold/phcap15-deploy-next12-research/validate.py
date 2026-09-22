#!/usr/bin/env python3
"""PHCAP-15 Deploy next12 research premise; static checks only."""
from __future__ import annotations

import hashlib
import json
from pathlib import Path
from typing import Any

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
INV_PATH = HERE / "inventory.json"
BASE_COMMIT = "8f002b4d2594ea341ca0515f691eeac21139c947"
POOL_PATH = ROOT / "docs/governance/legacy-asset-phase-product-classification-bootstrap.jsonl"
DISPOSITION_PATH = ROOT / "docs/governance/legacy-asset-disposition.jsonl"
DECISIONS_PATH = ROOT / "docs/governance/legacy-asset-decisions.jsonl"
PHASE_PATH = ROOT / "docs/governance/phase-capability-inventory.json"
ARCHIVE_ROOT = ROOT / "archive/legacy-generation-2026-09-14/root"

SELECTED_IDS = [
    "LEGACY-ASSET-9F48ADEEB477DCA54039",
    "LEGACY-ASSET-D4DBE31CF7179061E284",
    "LEGACY-ASSET-3530C6D5B44F55C1692A",
    "LEGACY-ASSET-9B1B5B55B610942F3216",
    "LEGACY-ASSET-0CC9B511C4846B2D7489",
    "LEGACY-ASSET-8EB1660DDE8803009282",
    "LEGACY-ASSET-FC1E6AE8D3FD1352413B",
    "LEGACY-ASSET-A569CF70586E9679DB01",
    "LEGACY-ASSET-3C4A61F623B392DC88D6",
    "LEGACY-ASSET-03B06987CECB57AC4AE2",
    "LEGACY-ASSET-2224C11CCDA22CAAFF23",
    "LEGACY-ASSET-3D576E223565C34899F1",
]
REVIEWED = {
    "pr_2001": {
        "pr_number": 2001,
        "head": "c864cebfbda69707529cbb0307625eac1b543add",
        "asset_ids": ["LEGACY-ASSET-042D2B732DC68AA7EE9A", "LEGACY-ASSET-578A66F54CD01046B7BA", "LEGACY-ASSET-18BB86CC5625C31430B8", "LEGACY-ASSET-FA8D4E24D8399E8350F1", "LEGACY-ASSET-327A88B2141C43045AF1", "LEGACY-ASSET-BADD68B87BA5BE0F3906", "LEGACY-ASSET-7995556682FC5493C37E"],
    },
    "pr_2004": {
        "pr_number": 2004,
        "head": "2642d3f88e4c44233ea649a83a7fb739c9d20430",
        "asset_ids": ["LEGACY-ASSET-7D081AD1F95E968FA77C", "LEGACY-ASSET-1C02673C4901B24D963D", "LEGACY-ASSET-0AD2FD852BAB0CEC864B", "LEGACY-ASSET-99E3BCA46E08C4A328FC", "LEGACY-ASSET-17C4BF78919578FEBB18", "LEGACY-ASSET-A2F6A697D7FFFD490B57", "LEGACY-ASSET-897CAC574F146D976BD7", "LEGACY-ASSET-FD0947CF40FB2B301664", "LEGACY-ASSET-9E033C3E39BE107D4CF1", "LEGACY-ASSET-3E3D84D599ED0476926B", "LEGACY-ASSET-92811340BD843B5EC3FD", "LEGACY-ASSET-7E68FC7E2F08FD31B0C1"],
    },
    "scf_b0037": {
        "binding_path": "scaffold/bindings/SCF-B-0037.json",
        "asset_ids": ["LEGACY-ASSET-54330A68064B58B22259", "LEGACY-ASSET-1251704E0BE627232E00", "LEGACY-ASSET-189702B332643A3BFDAF"],
    },
    "third12": {
        "binding_path": "scaffold/bindings/SCF-B-0059.json",
        "asset_ids": ["LEGACY-ASSET-A297D67A1D8AD6EE6D6B", "LEGACY-ASSET-0C5F0695490FA5D87419", "LEGACY-ASSET-EC07511FF3E241F15359", "LEGACY-ASSET-809D616D0D7D844F5720", "LEGACY-ASSET-B5B5E71B2AF1459D59A1", "LEGACY-ASSET-13604CA85F3B7D8D5055", "LEGACY-ASSET-D63398C5A382549DC905", "LEGACY-ASSET-320E6F0B93975C430B1D", "LEGACY-ASSET-3CB7630AEBBC5932E11D", "LEGACY-ASSET-26391F9FB236CBD4D270", "LEGACY-ASSET-2149C3FCC5A18EB50185", "LEGACY-ASSET-FAAFFA616A44F65911EB"],
    },
}
EXPECTED_KINDS = {
    "LEGACY-ASSET-9F48ADEEB477DCA54039": "requirement source snapshot",
    "LEGACY-ASSET-D4DBE31CF7179061E284": "compatibility baseline configuration",
    "LEGACY-ASSET-3530C6D5B44F55C1692A": "L7 serverless read-only share plan",
    "LEGACY-ASSET-9B1B5B55B610942F3216": "L7 version-up activation readiness plan",
    "LEGACY-ASSET-0CC9B511C4846B2D7489": "L7 verification profile gate plan",
    "LEGACY-ASSET-8EB1660DDE8803009282": "verification and cutover plan",
    "LEGACY-ASSET-FC1E6AE8D3FD1352413B": "deployment adapter template",
    "LEGACY-ASSET-A569CF70586E9679DB01": "canonical reuse authority implementation source",
    "LEGACY-ASSET-3C4A61F623B392DC88D6": "identifier rename implementation source",
    "LEGACY-ASSET-03B06987CECB57AC4AE2": "state projection implementation source",
    "LEGACY-ASSET-2224C11CCDA22CAAFF23": "setup template implementation source",
    "LEGACY-ASSET-3D576E223565C34899F1": "identifier rename test source",
}
EXPECTED_ANCHOR_COUNTS = {aid: 2 for aid in SELECTED_IDS}
EXPECTED_ANCHOR_COUNTS["LEGACY-ASSET-8EB1660DDE8803009282"] = 3
EXPECTED_ANCHOR_COUNTS["LEGACY-ASSET-FC1E6AE8D3FD1352413B"] = 1
EXPECTED_ANCHOR_MEANINGS = {
    "LEGACY-ASSET-9F48ADEEB477DCA54039": ["L1 business scope and HELIX-HARNESS product framing", "BR/UX to L14 operational test mapping; source requirement is not current acceptance"],
    "LEGACY-ASSET-D4DBE31CF7179061E284": ["grandfathered compatibility references marked forbidden", "append-only compatibility baseline ends in historical reference rules"],
    "LEGACY-ASSET-3530C6D5B44F55C1692A": ["future version parked and external activation approval boundary", "read-only bundle and no-deploy/no-write constraints"],
    "LEGACY-ASSET-9B1B5B55B610942F3216": ["activation readiness remains plan-only with pending evidence", "external activation, permission and action-binding approval remain out of scope"],
    "LEGACY-ASSET-0CC9B511C4846B2D7489": ["verification profile and right-arm gate coverage scope", "execution manifest, external tools and production release remain out of scope"],
    "LEGACY-ASSET-8EB1660DDE8803009282": ["verification band and cutover backfill route registration", "local machine verification and handover do not establish production deploy or UAT", "completed checklist text is historical source evidence, not a current receipt"],
    "LEGACY-ASSET-FC1E6AE8D3FD1352413B": ["historical devops-deploy adapter role, declared review tools and embedded command guidance; source was not invoked"],
    "LEGACY-ASSET-A569CF70586E9679DB01": ["blocked canonical reuse authority path set", "runtime assertion source is unexecuted and does not establish current authority"],
    "LEGACY-ASSET-3C4A61F623B392DC88D6": ["identifier rename cutover type and dependency surface", "cutover approval parser keeps missing approval blocked"],
    "LEGACY-ASSET-03B06987CECB57AC4AE2": ["projection event and rebuild input contract", "unresolved plan joins are recorded as findings in source logic, not current execution receipts"],
    "LEGACY-ASSET-2224C11CCDA22CAAFF23": ["consumer Claude agent and command template generation surface", "template source is historical implementation evidence and was not executed"],
    "LEGACY-ASSET-3D576E223565C34899F1": ["identifier rename semantic frontier and approval-gated classification", "test fixture cutover packet remains blocked without approval"],
}
EXPECTED_UNRESOLVED = ["semantic product split", "phase admission", "product owner", "current implementation/degradation/acceptance", "failure outcome", "consumer closure", "successor/decision"]
EXPECTED_CONSUMERS = {aid: [] for aid in SELECTED_IDS}
EXPECTED_CONSUMERS["LEGACY-ASSET-9F48ADEEB477DCA54039"] = ["requirement-carry-forward-ledgers", "requirement-atomization-review"]
EXPECTED_DECISION_MATCHES = {aid: 0 for aid in SELECTED_IDS}
EXPECTED_DECISION_MATCHES["LEGACY-ASSET-9F48ADEEB477DCA54039"] = 2
EXPECTED_COPY_READ_AFTER = {aid: 0 for aid in SELECTED_IDS}
EXPECTED_COPY_READ_AFTER["LEGACY-ASSET-9F48ADEEB477DCA54039"] = 1
PROHIBITED_INFERENCE = [
    "pool membership is a phase classification candidate only and does not create a requirement link or product owner",
    "source presence, implementation source, test source, runtime-state text or old command claims do not establish current implementation, operation, acceptance, deployment or pass",
    "source snapshot preservation or historical decision records do not create current authority or requirement adoption",
    "phase candidate targets do not admit an asset to PHCAP-15",
    "product candidate membership does not create authority, owner or routing",
    "empty consumer_refs and pending closure do not prove no historical consumer",
    "no failure receipt does not prove no historical failure or rollback",
    "missing direct Web evidence does not establish non-implementation",
    "archive is static reference only and not runtime, test, CI or fallback",
]
REQUIRED_COMMANDS = [
    "python3 -B scaffold/phcap15-deploy-next12-research/validate.py",
    "python3 -B scaffold/phcap15-deploy-next12-research/selfcheck.py",
    "python3 scaffold/tools/scfctl.py validate",
    "python3 scaffold/tools/scfctl.py stale",
    "python3 scaffold/tools/scfctl.py residuals",
    "git diff --check",
]
NEGATIVE_CASES = [
    "pool denominator/remaining count tamper",
    "overlap with #2001/#2004/SCF-B-0037/third12",
    "selected asset ID duplication",
    "source file digest tamper",
    "source anchor exact text tamper",
    "phase admission promotion",
    "current implementation promotion",
    "current degradation promotion",
    "failure receipt invention",
    "consumer closure invention",
    "decision match/read-after tamper",
    "four-product boundary/owner promotion",
    "root nested keyset tamper",
    "provenance nested keyset tamper",
    "scope nested keyset tamper",
    "anchor meaning tamper",
    "anchor count deletion",
    "selected anchor count tamper",
    "unresolved body deletion",
    "semantic kind drift",
    "equivalence claim promotion",
    "prohibited inference body tamper",
    "required command tamper",
    "negative case contract tamper",
]
PRODUCT_EXPECTED = {
    "HELIX-HARNESS": ("工程・artifact内容・consumer条件の境界候補。配布運転を所有しない候補。", "boundary_candidate_only"),
    "HELIX-OS": ("project authority、release準備、artifact受渡し、deployment evidence統制の候補。展開先runtime authorityを吸収しない。", "candidate_unresolved"),
    "HELIX-Web": ("利用者向けWeb体験の候補。直接deployment evidenceの不在は未実装を意味しない。", "boundary_candidate_only"),
    "HELIX-Web-OS": ("tenant/service runtime、配備、監視、復旧の候補。OSとはauthority/stateを分離する。", "candidate_unresolved"),
}
EXPECTED_LEDGER_HASHES = {
    "docs/governance/phase-capability-inventory.json": ("9face795f98c660bec02d46106f08a25ba189633f6b555b563a0c7951e173f0c", None),
    "docs/governance/legacy-asset-disposition.jsonl": ("cd73ac407937ad86c6be2c0b27d70863b1873fe39c2d6c0f89620e648dccad8c", 4020),
    "docs/governance/legacy-asset-phase-product-classification-bootstrap.jsonl": ("2188f236cb7ed316772ee1fcf413f3b098f702cb4c9d9b3dad09a72db7468c1f", 4020),
    "docs/governance/legacy-asset-decisions.jsonl": ("cbf7c18fbf0faea7745677091d440e40ba48345740a786404258e705a3cbd59f", 58),
    "archive/legacy-generation-2026-09-14/MANIFEST.sha256": ("10eda61dae461ec505fcabce89b42327bfbb968534793daf3a4758127a7dacc6", None),
}
# The decision-ledger hash above is checked against the captured upstream value below as well.
EXPECTED_LEDGER_HASHES["docs/governance/legacy-asset-decisions.jsonl"] = ("cbf7c18fbf0faea7745677091d440e40ba48345740a786404258e705a3cbd59f", 58)


def digest_bytes(value: bytes) -> str:
    return hashlib.sha256(value).hexdigest()


def digest_file(path: Path) -> str:
    return digest_bytes(path.read_bytes())


def jsonl(path: Path) -> list[dict[str, Any]]:
    return [json.loads(line) for line in path.read_text(encoding="utf-8").splitlines() if line.strip()]


def span_text(path: Path, start: int, end: int) -> str | None:
    lines = path.read_text(encoding="utf-8").splitlines()
    if start < 1 or end < start or end > len(lines):
        return None
    return "\n".join(lines[start - 1:end])


def validate_keysets(data: dict[str, Any]) -> list[str]:
    expected = {
        "root": {"schema", "status", "authority_effect", "meaning_change_applied", "successor_requirement_ids", "human_decision_ref", "equivalence_claim", "old_archive_runtime_test_ci_execution", "base", "task", "provenance", "denominator", "scope", "product_boundary_candidates", "assets", "aggregate_evidence", "prohibited_inference", "verification_contract", "counts"},
        "root.base": {"origin_main_commit", "origin_main_at_start", "origin_main_at_final", "changed", "worktree", "captured_at", "stop_condition"},
        "root.task": {"task_id", "phase", "title", "phase_inventory_path", "phase_inventory_snapshot"},
        "root.task.phase_inventory_snapshot": {"status", "product_targets", "evidence_products", "refs", "legacy_layers_evidenced", "maximum_layer_evidenced", "legacy_capability_status", "transition_assessment", "gaps", "new_build_allowed", "authority_effect"},
        "root.provenance": {"ledgers", "phase_pool_basis", "reviewed_sets", "existing_binding"},
        "root.provenance.reviewed_sets.pr_2001": {"pr_number", "head", "asset_ids"},
        "root.provenance.reviewed_sets.pr_2004": {"pr_number", "head", "asset_ids"},
        "root.provenance.reviewed_sets.scf_b0037": {"binding_path", "asset_ids"},
        "root.provenance.reviewed_sets.third12": {"binding_path", "asset_ids"},
        "root.denominator": {"pool_rows", "pool_unique_asset_ids", "pr_2001_selected_rows", "pr_2004_selected_rows", "scf_b0037_selected_rows", "third12_selected_rows", "already_reviewed_excluded_rows", "followup_selected_rows", "reviewed_or_selected_total", "remaining_unreviewed_rows", "pool_coverage_statement"},
        "root.scope": {"pool_asset_ids", "excluded_scopes", "selected_asset_ids", "remaining_unreviewed_asset_ids", "overlap_checks"},
        "root.scope.excluded_scopes.pr_2001": {"pr_number", "head", "asset_ids"},
        "root.scope.excluded_scopes.pr_2004": {"pr_number", "head", "asset_ids"},
        "root.scope.excluded_scopes.scf_b0037": {"binding_path", "asset_ids"},
        "root.scope.excluded_scopes.third12": {"binding_path", "asset_ids"},
        "root.scope.overlap_checks": {"selected_vs_pr_2001", "selected_vs_pr_2004", "selected_vs_scf_b0037", "selected_vs_third12", "pool_duplicate_ids"},
        "root.product_boundary_candidates": {"defined_products", "products", "current_implementation_claim", "authority_effect", "product_owner_status"},
        "root.product_boundary_candidates.products[]": {"product", "status", "boundary", "current_evidence_status", "current_authority_status", "current_implementation_status", "refs", "owner_status"},
        "root.product_boundary_candidates.products[].refs[]": {"path", "line_start", "line_end", "file_sha256", "span_sha256"},
        "root.assets[]": {"asset_id", "semantic_diversity_kind", "phase_ledger_line", "disposition_ledger_line", "source_path", "archive_path", "source_revision", "source_file_sha256", "source_line_count", "ledger_source_sha256", "artifact_evidence_kind", "source_anchors", "candidate_phase_targets", "phase_classification_status", "phase_admission", "candidate_product_targets", "product_classification_status", "product_owner_status", "legacy_implementation_status", "implementation_evidence_state", "legacy_execution_performed", "current_implementation_status", "current_operation_status", "current_acceptance_status", "current_degradation_status", "disposition", "authority_status", "decision_matches", "decision_record_refs", "copy_read_after_matches", "consumer_closure_status", "consumer_refs", "failure_evidence", "consumer_evidence", "unresolved"},
        "root.assets[].source_anchors[]": {"line_start", "line_end", "source_span_sha256", "exact_text", "meaning"},
        "root.assets[].failure_evidence": {"status", "execution_receipts", "source_failure_or_stop_conditions_observed", "failure_outcome_observed", "unknown"},
        "root.assets[].consumer_evidence": {"status", "consumer_refs_observed", "consumer_closure_observed", "unknown"},
        "root.aggregate_evidence": {"selected_asset_count", "selected_asset_decision_matches", "selected_asset_copy_read_after_matches", "selected_failure_execution_receipts", "selected_consumer_refs_nonempty", "selected_consumer_closure_pending", "selected_implementation_statuses", "current_implementation_status", "current_degradation_status", "current_phase_admission"},
        "root.aggregate_evidence.selected_implementation_statuses": {"legacy_source_snapshot", "legacy_unknown", "current_unknown", "current_degradation_unknown"},
        "root.verification_contract": {"requires_exact_source_spans", "requires_source_archive_digest_reconciliation", "requires_pool_nonoverlap", "requires_four_product_candidate_boundary", "unknowns_must_remain_explicit", "old_archive_runtime_test_ci_execution", "required_commands", "negative_cases"},
        "root.counts": {"pool_rows", "selected_rows", "excluded_rows", "remaining_unreviewed_rows", "four_products", "selected_source_anchors", "selected_decision_matches", "selected_copy_read_after_matches", "selected_consumer_refs_nonempty"},
    }
    errors: list[str] = []
    ledger_prefix = "root.provenance.ledgers."
    ledger_paths = {ledger_prefix + path for path in EXPECTED_LEDGER_HASHES}

    def walk(value: object, path: str) -> None:
        keys = expected.get(path)
        if keys is None and path in ledger_paths:
            keys = {"sha256", "records"}
        if keys is not None and (not isinstance(value, dict) or set(value) != keys):
            errors.append("KEYSET:" + path)
        if isinstance(value, dict):
            for key, child in value.items():
                walk(child, f"{path}.{key}")
        elif isinstance(value, list):
            for child in value:
                if isinstance(child, (dict, list)):
                    walk(child, path + "[]")
    walk(data, "root")
    return errors


def validate(data: dict[str, Any], check_files: bool = True) -> list[str]:
    errors = validate_keysets(data)
    def req(condition: bool, code: str) -> None:
        if not condition:
            errors.append(code)
    req(data.get("schema") == "phcap15-deploy-next12-research/v1", "SCHEMA")
    req(data.get("status") == "research_premise_candidate", "STATUS")
    req(data.get("authority_effect") == "none" and data.get("meaning_change_applied") is False, "AUTHORITY_EFFECT")
    req(data.get("successor_requirement_ids") == [] and data.get("human_decision_ref") is None and data.get("equivalence_claim") is None, "PROMOTION_FIELDS")
    req(data.get("old_archive_runtime_test_ci_execution") is False, "OLD_EXECUTION")
    base=data.get("base",{})
    req(base.get("origin_main_commit") == BASE_COMMIT and base.get("origin_main_at_start") == BASE_COMMIT and base.get("origin_main_at_final") == BASE_COMMIT and base.get("changed") is False, "BASE")
    req(base.get("worktree") == "/home/tenni/.helix-worktrees/phcap15-deploy-next12" and base.get("captured_at") == "2026-09-22", "WORKTREE_CAPTURE")
    task=data.get("task",{})
    req(task.get("task_id") == "PHCAP-15" and task.get("phase") == "deploy" and task.get("title") == "Deploy", "TASK")
    req(task.get("phase_inventory_path") == "docs/governance/phase-capability-inventory.json", "PHASE_PATH")
    expected_snapshot={"status":"draft_requirement","product_targets":["HELIX-Web-OS","HELIX-OS"],"evidence_products":["HELIX-OS","HELIX-Web-OS"],"refs":["docs/helix-web-os/L2-requirements/service-governance-requirements.md","docs/helix-os/L2-requirements/governance-requirements.md"],"legacy_layers_evidenced":["L13 post-deploy","L13 plan"],"maximum_layer_evidenced":"L13","legacy_capability_status":"documented_partial","transition_assessment":"degraded_to_draft","gaps":"旧世代にはpost-deploy evidenceと計画があったが、現行Web-OS authorityへの適合は未評価。 deployment authority、tenant/runtime境界、実装・検証は未成立","new_build_allowed":False,"authority_effect":"inventory_and_work_projection_only"}
    req(task.get("phase_inventory_snapshot") == expected_snapshot, "PHASE_SNAPSHOT")
    prov=data.get("provenance",{})
    req(prov.get("phase_pool_basis") == "candidate_phase_targets contains PHCAP-15" and prov.get("existing_binding") == "scaffold/bindings/SCF-B-0060.json", "PROVENANCE")
    req(set(prov.get("ledgers",{})) == set(EXPECTED_LEDGER_HASHES), "LEDGER_KEYS")
    for path,(expected_hash,records) in EXPECTED_LEDGER_HASHES.items():
        ref=prov.get("ledgers",{}).get(path,{})
        req(set(ref) == {"sha256", "records"}, "LEDGER_REF_KEYS:"+path)
        req(ref.get("sha256") == expected_hash and ref.get("records") == records, "LEDGER_REF:"+path)
        source=ROOT/path
        req(source.is_file(), "LEDGER_MISSING:"+path)
        if source.is_file() and check_files:
            req(digest_file(source) == expected_hash, "LEDGER_SHA:"+path)
            if records is not None:
                req(len(jsonl(source)) == records, "LEDGER_RECORDS:"+path)
    req(prov.get("reviewed_sets") == REVIEWED, "REVIEWED_SETS")
    pool_rows=jsonl(POOL_PATH); dispositions={r.get("asset_id"):r for r in jsonl(DISPOSITION_PATH)}; classifications={r.get("asset_id"):r for r in pool_rows}; decisions=jsonl(DECISIONS_PATH)
    pool=[r.get("asset_id") for r in pool_rows if "PHCAP-15" in r.get("candidate_phase_targets",[])]
    excluded=[aid for group in REVIEWED.values() for aid in group["asset_ids"]]
    remaining=[aid for aid in pool if aid not in set(excluded)|set(SELECTED_IDS)]
    scope=data.get("scope",{})
    req(scope.get("pool_asset_ids") == pool and len(pool)==78 and len(set(pool))==78, "POOL_SCOPE")
    req(scope.get("excluded_scopes") == REVIEWED, "EXCLUDED_SCOPES")
    req(scope.get("selected_asset_ids") == SELECTED_IDS and len(set(SELECTED_IDS))==12, "SELECTED_SCOPE")
    req(scope.get("remaining_unreviewed_asset_ids") == remaining and len(remaining)==32, "REMAINING_SCOPE")
    req(scope.get("overlap_checks") == {"selected_vs_pr_2001":[],"selected_vs_pr_2004":[],"selected_vs_scf_b0037":[],"selected_vs_third12":[],"pool_duplicate_ids":[]}, "OVERLAP_CHECKS")
    denominator=data.get("denominator",{})
    expected_denominator={"pool_rows":78,"pool_unique_asset_ids":78,"pr_2001_selected_rows":7,"pr_2004_selected_rows":12,"scf_b0037_selected_rows":3,"third12_selected_rows":12,"already_reviewed_excluded_rows":34,"followup_selected_rows":12,"reviewed_or_selected_total":46,"remaining_unreviewed_rows":32,"pool_coverage_statement":"PHCAP-15 pool 78件から既存4束34件を除外した時点の残分母44件から次の12件を選択。既存4束と本束を合わせた46件をレビュー済み／選択済み範囲として固定し、残る32件は未レビュー分母として保持する。"}
    req(denominator == expected_denominator, "DENOMINATOR")
    boundary=data.get("product_boundary_candidates",{})
    req(boundary.get("defined_products") == list(PRODUCT_EXPECTED) and boundary.get("current_implementation_claim") is False and boundary.get("authority_effect") == "none" and boundary.get("product_owner_status") == "unresolved", "PRODUCT_ROOT")
    for product in boundary.get("products",[]):
        name=product.get("product"); expected=PRODUCT_EXPECTED.get(name)
        req(expected is not None and product.get("boundary") == expected[0] and product.get("current_evidence_status") == expected[1], "PRODUCT_BOUNDARY:"+str(name))
        req(product.get("status") == "research_premise_candidate" and product.get("current_authority_status") == "none" and product.get("current_implementation_status") == "unknown" and product.get("owner_status") == "unresolved", "PRODUCT_STATUS:"+str(name))
        for ref in product.get("refs",[]):
            path=ROOT/ref.get("path",""); text=span_text(path,ref.get("line_start",0),ref.get("line_end",0)) if path.is_file() else None
            req(path.is_file() and digest_file(path) == ref.get("file_sha256") and text is not None and digest_bytes(text.encode("utf-8")) == ref.get("span_sha256"), "PRODUCT_REF:"+str(name))
    asset_rows={a.get("asset_id"):a for a in data.get("assets",[])}
    req(list(asset_rows) == SELECTED_IDS, "ASSET_ORDER")
    for aid in SELECTED_IDS:
        asset=asset_rows.get(aid,{})
        d=dispositions.get(aid,{})
        c=classifications.get(aid,{})
        archive=ARCHIVE_ROOT/d.get("source_path","")
        decision_rows=[row for row in decisions if row.get("asset_id")==aid]
        expected_refs=["docs/governance/legacy-asset-decisions.jsonl#"+str(row.get("decision_id")) for row in decision_rows]
        req(asset.get("semantic_diversity_kind") == EXPECTED_KINDS[aid], "SEMANTIC_KIND:"+aid)
        req(asset.get("source_path") == d.get("source_path") == c.get("source_path"), "SOURCE_PATH:"+aid)
        req(asset.get("archive_path") == "archive/legacy-generation-2026-09-14/root/"+str(d.get("source_path")), "ARCHIVE_PATH:"+aid)
        req(asset.get("source_revision") == d.get("source_revision") == c.get("source_revision"), "SOURCE_REVISION:"+aid)
        req(asset.get("candidate_phase_targets") == c.get("candidate_phase_targets") and asset.get("candidate_product_targets") == c.get("candidate_product_targets"), "CANDIDATE_TARGETS:"+aid)
        req(asset.get("phase_classification_status") == c.get("phase_classification_status") and asset.get("product_classification_status") == c.get("product_classification_status"), "CLASSIFICATION_STATUS:"+aid)
        req(asset.get("phase_admission") == "unresolved_candidate_only" and asset.get("product_owner_status") == "unresolved", "ADMISSION_OWNER:"+aid)
        req(asset.get("legacy_implementation_status") == d.get("implementation_status") and asset.get("implementation_evidence_state") == c.get("implementation_evidence_state") and asset.get("legacy_execution_performed") is False, "LEGACY_IMPLEMENTATION:"+aid)
        req(asset.get("current_implementation_status") == "unknown" and asset.get("current_operation_status") == "unknown" and asset.get("current_acceptance_status") == "unknown" and asset.get("current_degradation_status") == "unknown", "CURRENT_UNKNOWN:"+aid)
        req(asset.get("disposition") == d.get("disposition") and asset.get("authority_status") == "historical", "DISPOSITION_AUTHORITY:"+aid)
        req(asset.get("decision_matches") == EXPECTED_DECISION_MATCHES[aid] == len(decision_rows) and asset.get("decision_record_refs") == expected_refs, "DECISIONS:"+aid)
        req(asset.get("copy_read_after_matches") == EXPECTED_COPY_READ_AFTER[aid] == int(bool(d.get("read_after_record_ref"))), "READ_AFTER:"+aid)
        expected_consumer=EXPECTED_CONSUMERS[aid]
        req(asset.get("consumer_refs") == expected_consumer == d.get("consumer_refs") == c.get("consumer_refs"), "CONSUMERS:"+aid)
        req(asset.get("consumer_closure_status") == "pending" and asset.get("unresolved") == EXPECTED_UNRESOLVED, "CLOSURE_UNRESOLVED:"+aid)
        failure=asset.get("failure_evidence",{}); consumer=asset.get("consumer_evidence",{})
        req(failure == {"status":"source_boundary_only_unexecuted","execution_receipts":0,"source_failure_or_stop_conditions_observed":True,"failure_outcome_observed":False,"unknown":["historical execution outcome","failure/rollback receipt","current failure behavior and owner"]}, "FAILURE_EVIDENCE:"+aid)
        req(consumer.get("consumer_refs_observed") == expected_consumer and consumer.get("consumer_closure_observed") is False and consumer.get("unknown") == ["consumer identity scope/revision","read-after/current runtime handoff","closure decision"], "CONSUMER_EVIDENCE:"+aid)
        req(archive.is_file(), "ARCHIVE_MISSING:"+aid)
        if archive.is_file():
            actual_text=archive.read_text(encoding="utf-8")
            req(asset.get("source_file_sha256") == digest_file(archive) == d.get("source_sha256") == c.get("source_sha256"), "SOURCE_SHA:"+aid)
            req(asset.get("ledger_source_sha256") == c.get("source_sha256"), "LEDGER_SOURCE_SHA:"+aid)
            req(asset.get("source_line_count") == len(actual_text.splitlines()), "SOURCE_LINES:"+aid)
            req(asset.get("artifact_evidence_kind") == c.get("artifact_evidence_kind"), "ARTIFACT_KIND:"+aid)
            meanings=[anchor.get("meaning") for anchor in asset.get("source_anchors",[])]
            req(len(asset.get("source_anchors",[])) == EXPECTED_ANCHOR_COUNTS[aid], "ANCHOR_COUNT:"+aid)
            req(meanings == EXPECTED_ANCHOR_MEANINGS[aid], "ANCHOR_MEANINGS:"+aid)
            for anchor in asset.get("source_anchors",[]):
                actual=span_text(archive,anchor.get("line_start",0),anchor.get("line_end",0))
                req(actual == anchor.get("exact_text") and actual is not None, "ANCHOR_TEXT:"+aid)
                if actual is not None:
                    req(digest_bytes(actual.encode("utf-8")) == anchor.get("source_span_sha256"), "ANCHOR_SHA:"+aid)
    aggregate=data.get("aggregate_evidence",{})
    req(aggregate == {"selected_asset_count":12,"selected_asset_decision_matches":2,"selected_asset_copy_read_after_matches":1,"selected_failure_execution_receipts":0,"selected_consumer_refs_nonempty":1,"selected_consumer_closure_pending":12,"selected_implementation_statuses":{"legacy_source_snapshot":1,"legacy_unknown":11,"current_unknown":12,"current_degradation_unknown":12},"current_implementation_status":"unknown","current_degradation_status":"unknown","current_phase_admission":"unresolved_candidate_only"}, "AGGREGATE")
    req(data.get("prohibited_inference") == PROHIBITED_INFERENCE, "PROHIBITED_INFERENCE")
    verification=data.get("verification_contract",{})
    req(verification.get("required_commands") == REQUIRED_COMMANDS and verification.get("negative_cases") == NEGATIVE_CASES, "VERIFICATION_CONTRACT")
    req(data.get("counts") == {"pool_rows":78,"selected_rows":12,"excluded_rows":34,"remaining_unreviewed_rows":32,"four_products":4,"selected_source_anchors":24,"selected_decision_matches":2,"selected_copy_read_after_matches":1,"selected_consumer_refs_nonempty":1}, "COUNTS")
    return errors


if __name__ == "__main__":
    payload = json.loads(INV_PATH.read_text(encoding="utf-8"))
    problems = validate(payload)
    if problems:
        print("FAIL PHCAP15 next12")
        print("\n".join(problems))
        raise SystemExit(1)
    print("PASS PHCAP15 next12: pool=78 prior_reviewed=34 selected=12 remaining=32")
    print("PASS source/archive/ledger digest, exact spans, implementation/failure/consumer/decision unknown boundaries")
    print("PASS four-product candidate boundary and no authority/implementation/degradation promotion")
