#!/usr/bin/env python3
"""Generate the bounded PHCAP-10/11 static research inventory.

Only repository text, JSON ledgers and archive bytes are read.  No legacy
runtime, test, workflow or CI is imported or executed.
"""
from __future__ import annotations

import hashlib
import json
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
ORIGIN = "43bd941b5fea92e132566e0004e9b9a03f1f84f5"

ASSETS = [
    {
        "asset_id": "LEGACY-ASSET-F67008331E92FA0A5773",
        "source_path": "docs/design/helix/L4-basic-design/worker-isolation-broker.md",
        "archive_path": "archive/legacy-generation-2026-09-14/root/docs/design/helix/L4-basic-design/worker-isolation-broker.md",
        "phase": "PHCAP-10",
        "layers": ["L4"],
        "evidence_kind": "design",
        "classification_id": "LASPH-0533",
        "candidate_phase_targets": ["PHCAP-10"],
        "candidate_product_targets": ["HELIX-HARNESS", "HELIX-OS"],
        "anchors": [(19, 28), (46, 57)],
        "exclusion": None,
    },
    {
        "asset_id": "LEGACY-ASSET-25EB3B29EA909B050987",
        "source_path": "docs/design/helix/L5-detail/worker-lifecycle-receipt.md",
        "archive_path": "archive/legacy-generation-2026-09-14/root/docs/design/helix/L5-detail/worker-lifecycle-receipt.md",
        "phase": "PHCAP-10",
        "layers": ["L5"],
        "evidence_kind": "design",
        "classification_id": "LASPH-0599",
        "candidate_phase_targets": ["PHCAP-10", "PHCAP-16"],
        "candidate_product_targets": ["HELIX-OS", "HELIX-Web-OS"],
        "anchors": [(19, 40), (48, 58)],
        "exclusion": None,
    },
    {
        "asset_id": "LEGACY-ASSET-6DA5F7026F38B4C091AF",
        "source_path": "docs/design/helix/L6-function-design/worker-output-admission.md",
        "archive_path": "archive/legacy-generation-2026-09-14/root/docs/design/helix/L6-function-design/worker-output-admission.md",
        "phase": "PHCAP-10",
        "layers": ["L6"],
        "evidence_kind": "design",
        "classification_id": "LASPH-0761",
        "candidate_phase_targets": ["PHCAP-10"],
        "candidate_product_targets": ["HELIX-OS"],
        "anchors": [(19, 43)],
        "exclusion": None,
    },
    {
        "asset_id": "LEGACY-ASSET-44F2DE5EBB3DF3A4744A",
        "source_path": "src/orchestration/loop-runner.ts",
        "archive_path": "archive/legacy-generation-2026-09-14/root/src/orchestration/loop-runner.ts",
        "phase": "PHCAP-10",
        "layers": ["L7 implementation"],
        "evidence_kind": "implementation_source",
        "classification_id": "LASPH-3098",
        "candidate_phase_targets": ["PHCAP-10"],
        "candidate_product_targets": ["HELIX-OS"],
        "anchors": [(40, 98), (120, 140)],
        "exclusion": "legacy_runtime_cli_or_adapter",
    },
    {
        "asset_id": "LEGACY-ASSET-08488BBF033F37F536AB",
        "source_path": "tests/provider-process-lifecycle.test.ts",
        "archive_path": "archive/legacy-generation-2026-09-14/root/tests/provider-process-lifecycle.test.ts",
        "phase": "PHCAP-10",
        "layers": ["L7 implementation/test"],
        "evidence_kind": "test_source",
        "classification_id": "LASPH-3797",
        "candidate_phase_targets": ["PHCAP-10"],
        "candidate_product_targets": [],
        "anchors": [(130, 150), (193, 228)],
        "exclusion": "legacy_test_fixture_or_oracle",
    },
    {
        "asset_id": "LEGACY-ASSET-DA012A9B04D5BE9419CE",
        "source_path": "docs/design/helix/L3-requirements/ci-system-synthesis-requirements.md",
        "archive_path": "archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/ci-system-synthesis-requirements.md",
        "phase": "PHCAP-11",
        "layers": ["L3"],
        "evidence_kind": "requirement",
        "classification_id": "LASPH-0441",
        "candidate_phase_targets": ["PHCAP-11", "PHCAP-18"],
        "candidate_product_targets": ["HELIX-HARNESS", "HELIX-OS", "HELIX-Web", "HELIX-Web-OS"],
        "anchors": [(25, 32), (37, 55), (58, 70), (75, 107)],
        "exclusion": None,
    },
    {
        "asset_id": "LEGACY-ASSET-D888FB040D52499EE09E",
        "source_path": "docs/design/helix/L4-basic-design/impact-ci-recovery.md",
        "archive_path": "archive/legacy-generation-2026-09-14/root/docs/design/helix/L4-basic-design/impact-ci-recovery.md",
        "phase": "PHCAP-11",
        "layers": ["L4"],
        "evidence_kind": "design",
        "classification_id": "LASPH-0512",
        "candidate_phase_targets": ["PHCAP-11", "PHCAP-17"],
        "candidate_product_targets": ["HELIX-HARNESS", "HELIX-OS", "HELIX-Web-OS"],
        "anchors": [(17, 34), (70, 88), (96, 113)],
        "exclusion": None,
    },
    {
        "asset_id": "LEGACY-ASSET-E9998EF887555DBB2751",
        "source_path": "docs/design/helix/L6-function-design/ci-verification-plan.md",
        "archive_path": "archive/legacy-generation-2026-09-14/root/docs/design/helix/L6-function-design/ci-verification-plan.md",
        "phase": "PHCAP-11",
        "layers": ["L6"],
        "evidence_kind": "design",
        "classification_id": "LASPH-0616",
        "candidate_phase_targets": ["PHCAP-11"],
        "candidate_product_targets": ["HELIX-HARNESS", "HELIX-OS"],
        "anchors": [(16, 44)],
        "exclusion": None,
    },
    {
        "asset_id": "LEGACY-ASSET-CA0C7F22EA2ACBBF417E",
        "source_path": "src/runtime/ci-critical-path-scheduler.ts",
        "archive_path": "archive/legacy-generation-2026-09-14/root/src/runtime/ci-critical-path-scheduler.ts",
        "phase": "PHCAP-11",
        "layers": ["L7 implementation/workflow"],
        "evidence_kind": "implementation_source",
        "classification_id": "LASPH-3143",
        "candidate_phase_targets": ["PHCAP-11"],
        "candidate_product_targets": ["HELIX-OS"],
        "anchors": [(199, 234), (350, 390)],
        "exclusion": "legacy_runtime_cli_or_adapter",
    },
    {
        "asset_id": "LEGACY-ASSET-1C7E5C0B33364FBF9EC6",
        "source_path": ".github/workflows/harness-check.yml",
        "archive_path": "archive/legacy-generation-2026-09-14/root/.github/workflows/harness-check.yml",
        "phase": "PHCAP-11",
        "layers": ["L7 implementation/workflow"],
        "evidence_kind": "configuration",
        "classification_id": "LASPH-0050",
        "candidate_phase_targets": ["PHCAP-11", "PHCAP-17", "PHCAP-20"],
        "candidate_product_targets": ["HELIX-HARNESS", "HELIX-OS", "HELIX-Web-OS"],
        "anchors": [(1, 35), (60, 95)],
        "exclusion": "legacy_ci_workflow",
    },
    {
        "asset_id": "LEGACY-ASSET-8DE0535125B1E39C6FEA",
        "source_path": "docs/test-design/helix/ci-system-synthesis-acceptance.md",
        "archive_path": "archive/legacy-generation-2026-09-14/root/docs/test-design/helix/ci-system-synthesis-acceptance.md",
        "phase": "PHCAP-11",
        "layers": ["L10 test design"],
        "evidence_kind": "test_design",
        "classification_id": "LASPH-2802",
        "candidate_phase_targets": ["PHCAP-07", "PHCAP-11"],
        "candidate_product_targets": ["HELIX-HARNESS", "HELIX-OS"],
        "anchors": [(1, 46)],
        "exclusion": "legacy_test_design_or_oracle",
    },
]

REFS = [
    ("CUR-BOUNDARY-FOUR", "docs/concept/product-boundary.md", 32, 39, "boundary_candidate", "four product entry points"),
    ("CUR-BOUNDARY-OWNERSHIP", "docs/concept/product-boundary.md", 54, 70, "boundary_candidate", "four product responsibility and OS/Web-OS connection"),
    ("CUR-HARNESS-L2-CI", "docs/helix-harness/L2-requirements/product-requirements.md", 28, 33, "direct_current_ref", "HARNESS excludes Worker and CI operation"),
    ("CUR-OS-L2-WORKER-CI", "docs/helix-os/L2-requirements/governance-requirements.md", 57, 61, "direct_current_ref", "OS Worker and CI governance candidate"),
    ("CUR-OS-BOOTSTRAP", "docs/governance/decisions/capability-lease-bootstrap-approval-2026-09-20.md", 72, 80, "direct_current_ref", "bootstrap does not establish executor or implementation"),
    ("CUR-CI-CANDIDATE-BOUNDARY", "docs/governance/candidates/next-generation-ci-requirements.md", 21, 32, "direct_current_ref", "new CI candidate and four-way responsibility split"),
    ("CUR-CI-CANDIDATE-REBUILD", "docs/governance/candidates/next-generation-ci-requirements.md", 66, 82, "direct_current_ref", "new CI reconstruction order and stop conditions"),
    ("CUR-WEB-L2-BOUNDARY", "docs/helix-web/L2-requirements/product-requirements.md", 46, 59, "adjacent_boundary_ref", "Web owns user-facing product boundary; CI/Worker remain elsewhere"),
    ("CUR-WEBOS-L2-BOUNDARY", "docs/helix-web-os/L2-requirements/service-governance-requirements.md", 33, 38, "adjacent_boundary_ref", "Web-OS service runtime and bounded OS export"),
]

PHASE_RECORDS = None


def sha(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def read_jsonl(path: Path) -> list[dict]:
    return [json.loads(line) for line in path.read_text(encoding="utf-8").splitlines() if line.strip()]


def text_span(path: Path, start: int, end: int) -> str:
    lines = path.read_text(encoding="utf-8").splitlines()
    return "\n".join(lines[start - 1:end])


def phase_record(task_id: str) -> dict:
    global PHASE_RECORDS
    if PHASE_RECORDS is None:
        PHASE_RECORDS = json.loads((ROOT / "docs/governance/phase-capability-inventory.json").read_text(encoding="utf-8"))["records"]
    return next(x for x in PHASE_RECORDS if x["task_id"] == task_id)


def build_asset(item: dict, disposition: dict, catalog: dict) -> dict:
    source = ROOT / item["archive_path"]
    anchors = []
    for index, (start, end) in enumerate(item["anchors"], 1):
        exact = text_span(source, start, end)
        anchors.append({
            "anchor_id": f"{item['asset_id']}-A{index:02d}",
            "line_start": start,
            "line_end": end,
            "sha256": sha(exact.encode("utf-8")),
            "exact_text": exact,
            "meaning": "static source span; no execution, pass or authority claim",
        })
    return {
        "asset_id": item["asset_id"],
        "source_path": item["source_path"],
        "archive_path": item["archive_path"],
        "source_sha256": disposition["source_sha256"],
        "source_line_count": len(source.read_text(encoding="utf-8").splitlines()),
        "artifact_evidence_kind": item["evidence_kind"],
        "phase_role": item["phase"],
        "layers_evidenced": item["layers"],
        "classification_id": item["classification_id"],
        "candidate_phase_targets": catalog["candidate_phase_targets"],
        "candidate_product_targets": catalog["candidate_product_targets"],
        "phase_classification_status": catalog["phase_classification_status"],
        "product_classification_status": catalog["product_classification_status"],
        "asset_class": disposition["asset_class"],
        "authority_status": disposition["authority_status"],
        "disposition": disposition["disposition"],
        "legacy_implementation_status": disposition["implementation_status"],
        "implementation_evidence_state": catalog["implementation_evidence_state"],
        "legacy_execution_performed": catalog["legacy_execution_performed"],
        "reuse_exclusion_class": disposition["reuse_exclusion_class"],
        "consumer_refs": disposition["consumer_refs"],
        "consumer_closure_status": catalog["consumer_closure_status"],
        "decision_record_ref": disposition["decision_record_ref"],
        "unresolved": catalog["unresolved"],
        "source_anchors": anchors,
        "failure_evidence": {"status": "historical_contract_only_unexecuted", "execution_receipts": 0, "anchor_ids": [a["anchor_id"] for a in anchors]},
        "consumer_evidence": {"status": "candidate_only_closure_pending", "consumer_refs": [], "anchor_ids": [a["anchor_id"] for a in anchors]},
    }


def make_ref(ref_id: str, path: str, start: int, end: int, classification: str, meaning: str) -> dict:
    p = ROOT / path
    exact = text_span(p, start, end)
    return {"ref_id": ref_id, "path": path, "sha256": sha(p.read_bytes()), "line_start": start, "line_end": end, "line_sha256": sha(exact.encode("utf-8")), "exact_text": exact, "classification": classification, "meaning": meaning}


def main() -> None:
    disposition_rows = {x["asset_id"]: x for x in read_jsonl(ROOT / "docs/governance/legacy-asset-disposition.jsonl")}
    catalog_rows = {x["asset_id"]: x for x in read_jsonl(ROOT / "docs/governance/legacy-asset-phase-product-classification-bootstrap.jsonl")}
    decision_rows = read_jsonl(ROOT / "docs/governance/legacy-asset-decisions.jsonl")
    assets = [build_asset(item, disposition_rows[item["asset_id"]], catalog_rows[item["asset_id"]]) for item in ASSETS]
    decision_counts = {
        asset["asset_id"]: sum(1 for row in decision_rows if row.get("asset_id") == asset["asset_id"])
        for asset in assets
    }
    decision_total = sum(decision_counts.values())
    refs = [make_ref(*item) for item in REFS]
    phases = [phase_record("PHCAP-10"), phase_record("PHCAP-11")]
    units = [
        {"unit_id": "PHCAP10-11-UNIT-HARNESS", "product": "HELIX-HARNESS", "status": "research_premise_candidate", "authority_status": "candidate_unresolved", "phase_status": {"PHCAP-10": "missing_direct_phase_ref", "PHCAP-11": "candidate"}, "current_implementation_status": "unknown", "current_worker_status": "unknown_due_to_missing_direct_ref", "current_ci_status": "candidate_unexecuted", "direct_current_ref_ids": ["CUR-HARNESS-L2-CI", "CUR-CI-CANDIDATE-BOUNDARY", "CUR-CI-CANDIDATE-REBUILD"], "adjacent_ref_ids": ["CUR-BOUNDARY-FOUR", "CUR-BOUNDARY-OWNERSHIP"], "old_asset_ids": [a["asset_id"] for a in assets if "HELIX-HARNESS" in a["candidate_product_targets"]], "unresolved": ["PHCAP-10 current.evidence_products excludes HELIX-HARNESS", "PHCAP-11 remains candidate and unexecuted", "no formal CI profile, oracle registry, L3/L10 implementation or acceptance receipt"]},
        {"unit_id": "PHCAP10-11-UNIT-OS", "product": "HELIX-OS", "status": "research_premise_candidate", "authority_status": "candidate_unresolved", "phase_status": {"PHCAP-10": "draft_requirement_and_bootstrap_decision", "PHCAP-11": "candidate"}, "current_implementation_status": "unknown", "current_worker_status": "limited_bootstrap_without_executor", "current_ci_status": "candidate_unexecuted", "direct_current_ref_ids": ["CUR-OS-L2-WORKER-CI", "CUR-OS-BOOTSTRAP", "CUR-CI-CANDIDATE-BOUNDARY", "CUR-CI-CANDIDATE-REBUILD"], "adjacent_ref_ids": ["CUR-BOUNDARY-FOUR", "CUR-BOUNDARY-OWNERSHIP"], "old_asset_ids": [a["asset_id"] for a in assets if "HELIX-OS" in a["candidate_product_targets"]], "unresolved": ["bootstrap decision does not establish lease, executor implementation or operation_change", "formal L2/L11 and L3/L10 remain unestablished", "old implementation and tests are unexecuted historical evidence"]},
        {"unit_id": "PHCAP10-11-UNIT-WEB", "product": "HELIX-Web", "status": "research_premise_candidate", "authority_status": "candidate_unresolved", "phase_status": {"PHCAP-10": "missing_direct_phase_ref", "PHCAP-11": "missing_direct_phase_ref"}, "current_implementation_status": "unknown", "current_worker_status": "unknown_due_to_missing_direct_ref", "current_ci_status": "unknown_due_to_missing_direct_ref", "direct_current_ref_ids": [], "adjacent_ref_ids": ["CUR-BOUNDARY-FOUR", "CUR-BOUNDARY-OWNERSHIP", "CUR-WEB-L2-BOUNDARY"], "old_asset_ids": [a["asset_id"] for a in assets if "HELIX-Web" in a["candidate_product_targets"]], "unresolved": ["PHCAP-10/11 current.evidence_products exclude HELIX-Web", "Web L2/L11 are adjacent draft boundary only", "absence of direct ref is not an unimplemented claim"]},
        {"unit_id": "PHCAP10-11-UNIT-WEBOS", "product": "HELIX-Web-OS", "status": "research_premise_candidate", "authority_status": "candidate_unresolved", "phase_status": {"PHCAP-10": "missing_direct_phase_ref", "PHCAP-11": "missing_direct_phase_ref"}, "current_implementation_status": "unknown", "current_worker_status": "unknown_due_to_missing_direct_ref", "current_ci_status": "unknown_due_to_missing_direct_ref", "direct_current_ref_ids": [], "adjacent_ref_ids": ["CUR-BOUNDARY-FOUR", "CUR-BOUNDARY-OWNERSHIP", "CUR-WEBOS-L2-BOUNDARY"], "old_asset_ids": [a["asset_id"] for a in assets if "HELIX-Web-OS" in a["candidate_product_targets"]], "unresolved": ["PHCAP-10/11 current.evidence_products exclude HELIX-Web-OS", "Web-OS L2/L11 are adjacent draft boundary only", "service runtime, CI and worker implementation remain unknown"]},
    ]
    edges = []
    for asset in assets:
        for product in asset["candidate_product_targets"]:
            unit = next(u for u in units if u["product"] == product)
            edges.append({"edge_id": f"EDGE-{len(edges)+1:03d}", "asset_id": asset["asset_id"], "unit_id": unit["unit_id"], "product": product, "relation": "legacy_asset_to_product_candidate", "status": "unresolved_candidate", "implementation_status": "unknown", "consumer_status": "pending", "authority_effect": "none"})
        if not asset["candidate_product_targets"]:
            edges.append({"edge_id": f"EDGE-{len(edges)+1:03d}", "asset_id": asset["asset_id"], "unit_id": None, "product": None, "relation": "legacy_asset_product_unresolved", "status": "unresolved_candidate", "implementation_status": "unknown", "consumer_status": "pending", "authority_effect": "none"})

    current_products = {"PHCAP-10": ["HELIX-OS"], "PHCAP-11": ["HELIX-HARNESS", "HELIX-OS"]}
    data = {
        "schema": "phcap10-11-worker-ci-static/v1",
        "status": "research_premise_candidate",
        "authority_effect": "none",
        "meaning_change_applied": False,
        "successor_requirement_ids": [],
        "human_decision_ref": None,
        "equivalence_claim": None,
        "old_runtime_test_ci_execution": False,
        "base": {"repository": "HELIX-HARNESS", "origin_main_commit": ORIGIN, "branch": "audit/phcap10-11-worker-ci-static", "worktree": str(ROOT), "captured_at": "2026-09-22", "candidate_parent_status": "origin/main snapshot; no authority inferred from branch, issue, review or CI"},
        "rebaseline": {"stop_condition": "If origin/main changes from origin_main_commit, stop and rebaseline before treating this candidate as current; do not rebase automatically.", "origin_main_at_start": ORIGIN, "origin_main_at_final": ORIGIN, "changed": False},
        "task": {"task_ids": ["PHCAP-10", "PHCAP-11"], "phases": ["worker_execution", "ci_test"], "title": "Worker execution and CI/Test", "inventory_path": "docs/governance/phase-capability-inventory.json", "inventory_sha256": sha((ROOT / "docs/governance/phase-capability-inventory.json").read_bytes()), "phase_record_snapshots": phases},
        "scope": {"product_targets": ["HELIX-HARNESS", "HELIX-OS", "HELIX-Web", "HELIX-Web-OS"], "phase_current_evidence_products": current_products, "legacy_asset_ids": [a["asset_id"] for a in assets], "legacy_layer_reach": {"PHCAP-10": ["L4", "L5", "L6", "L7 implementation/test"], "PHCAP-11": ["L3", "L4", "L6", "L7 implementation/workflow", "L10 test design"]}, "closure_rule": "11 representative assets only; all other phase assets, full consumer closure, product unit split and successor review remain residual", "candidate_units": units, "candidate_edges": edges},
        "current_evidence": {"phase_direct_products": current_products, "implementation_status": "unknown", "acceptance_status": "unknown", "worker_status": "draft_requirement_and_bootstrap_decision", "ci_status": "candidate_unexecuted", "refs": refs, "formal_ci_profile_status": "unknown_not_constructed", "formal_oracle_registry_status": "unknown_not_constructed"},
        "legacy_phase_assessment": {"phase_records": phases, "assets": assets, "decision_matches": decision_total, "asset_level_implementation_claim": False, "legacy_execution_performed": False},
        "failure_residual": {"execution_receipts": 0, "status": "historical_source_only_unexecuted", "failure_consumer_closure": "pending"},
        "consumer_residual": {"selected_asset_consumer_refs": [], "consumer_closure_status": "pending", "closure_scope": "selected assets only; no full graph claim"},
        "decisions": {"selected_asset_ids": [a["asset_id"] for a in assets], "matching_append_only_decision_record_count": decision_total, "per_asset": decision_counts},
        "gaps": ["正式L2/L11、L3/L10、Worker runtime、CI profile、oracle registry、consumer read-afterは未成立", "PHCAP-10のcurrent direct evidenceはHELIX-OSだけであり、bootstrap decisionはexecutor実装やlease存在を成立させない", "PHCAP-11のcurrent direct evidenceはHARNESS／OS候補だけで、新世代CIは未構築・未実行", "HELIX-Web／HELIX-Web-OSにPHCAP-10/11 direct current refがなく、missingはunknownとして保持する", "旧phase-level capability_statusは代表assetの歴史的要約であり、selected assetの実装・pass・operationalを示さない", "複数phase／複数製品候補のunit・connection・composite分割とformal ownerは未解決"],
        "prohibited_inference": ["旧sourceの存在からimplemented/tested/verified/operationalを生成しない", "旧CI green、旧test design、旧runtime sourceを新世代CIのoracle・baseline・fallbackにしない", "product_targetsやpathからproduct owner、要求採否、successorを確定しない", "Web／Web-OS direct ref欠落から未実装と推定しない", "Scaffold validator/selfcheckの合格からL2/L11承認、L3/L10、CI green、完了、外部作用を生成しない", "bootstrap approvalからlease、executor、SCF-B-0004、operation_changeの成立を推定しない"],
        "counts": {"product_units": len(units), "candidate_edges": len(edges), "legacy_assets": len(assets), "source_anchors": sum(len(a["source_anchors"]) for a in assets), "current_refs": len(refs), "decision_matches": decision_total, "failure_execution_receipts": 0, "consumer_closed_assets": 0, "phase_direct_product_pairs": sum(len(v) for v in current_products.values()), "missing_direct_product_pairs": 4},
    }
    (HERE / "inventory.json").write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"wrote {HERE / 'inventory.json'}: assets={len(assets)} anchors={data['counts']['source_anchors']} edges={len(edges)} refs={len(refs)}")


if __name__ == "__main__":
    main()
