#!/usr/bin/env python3
"""Generate a read-only PHCAP-02/03 evidence-gap audit scaffold."""

from __future__ import annotations

import hashlib
import json
import subprocess
from collections import Counter
from pathlib import Path


HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
ORIGIN = "2fa9aca42ff3ffdd5dea9b2186c49ee50db7dc2c"
BRANCH = "research/phcap02-03-audit"
ARCHIVE_PREFIX = "archive/legacy-generation-2026-09-14/root/"
PHASE_PATH = "docs/governance/phase-capability-inventory.json"
ROUTING_PATH = "docs/governance/legacy-ir-product-routing-bootstrap.jsonl"
REGISTER_PATH = "docs/governance/management-provisional-requirement-register.jsonl"
ASSET_PATH = "docs/governance/legacy-asset-disposition.jsonl"
PHASE_ASSET_PATH = "docs/governance/legacy-asset-phase-product-classification-bootstrap.jsonl"
DECISIONS_PATH = "docs/governance/legacy-asset-decisions.jsonl"
OUTSIDE_67_PATH = "scaffold/pre-isolation-outside-holding-67/report.json"
PRODUCTS = ["HELIX-HARNESS", "HELIX-OS", "HELIX-Web", "HELIX-Web-OS"]

SELECTED = [
    {
        "asset_id": "LEGACY-ASSET-2F4C154611460DD55358",
        "anchors": [(1, 13), (128, 153)],
        "anchor_meanings": [
            "旧sourceはrequirement intake全体ではなくlifecycle fenceを宣言する",
            "pureな恒久／置換可能／撤去判定とactivation probeを実装する",
        ],
    },
    {
        "asset_id": "LEGACY-ASSET-3DED4B36AC6A8AD9A68C",
        "anchors": [(16, 23), (27, 35), (42, 50)],
        "anchor_meanings": [
            "event／candidate projectionは移行用pure componentでwrite authorityを持たない",
            "strict event APIとfailure条件を設計する",
            "candidate lifecycle、human decision、projection再構築の境界を設計する",
        ],
    },
    {
        "asset_id": "LEGACY-ASSET-4DF51DE06C57917FEA9C",
        "anchors": [(30, 47), (82, 116)],
        "anchor_meanings": [
            "旧testはlifecycle fenceのpositive／negative oracleを記述する",
            "旧testはold adapterの残存・早期撤去・probe反転を対象とする",
        ],
    },
    {
        "asset_id": "LEGACY-ASSET-90ECC62DFFEDE09800F0",
        "anchors": [(15, 29), (85, 107)],
        "anchor_meanings": [
            "L4 refinement authorityはbaseline／delta／admissionの設計境界を記述する",
            "failure reachabilityとcurrent実在性束縛は空で、統合完了を主張しない",
        ],
    },
    {
        "asset_id": "LEGACY-ASSET-8D1C0205DFCCE5C0359D",
        "anchors": [(62, 68), (98, 110), (131, 154)],
        "anchor_meanings": [
            "approved／frozenのみをimplementation bindingへ使う設計条件を記述する",
            "source／downstream／approval欠落のfailure codeを列挙する",
            "pure validator以外のfailure mutation、DB統合、frozen bundleは未実装と明記する",
        ],
    },
    {
        "asset_id": "LEGACY-ASSET-41F787DD7C89B20A3732",
        "anchors": [(29, 33), (39, 47), (117, 127)],
        "anchor_meanings": [
            "translationはpure判定とinjected portへ分離する設計契約である",
            "旧detail文書はfailure caseと75件の静的分母を記述する",
            "型・failure code・authority／obligation contractを宣言する",
        ],
    },
    {
        "asset_id": "LEGACY-ASSET-33E80E6D11CC51ADA817",
        "anchors": [(38, 55), (82, 119)],
        "anchor_meanings": [
            "旧implementation sourceはrequirements binding config schemaだけをparseする",
            "config parse結果とmissing-file fallbackを返すが分類projectionを実装しない",
        ],
    },
]


def sha(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def read_jsonl(path: Path) -> list[dict]:
    return [json.loads(line) for line in path.read_text(encoding="utf-8").splitlines() if line.strip()]


def git_archive_bytes(path: str) -> bytes:
    return subprocess.run(
        ["git", "show", f"origin/main:{ARCHIVE_PREFIX}{path}"],
        cwd=ROOT,
        check=True,
        stdout=subprocess.PIPE,
    ).stdout


def span_text(lines: list[str], start: int, end: int) -> str:
    return "\n".join(lines[start - 1 : end])


def count_values(records: list[dict], field: str) -> dict[str, int]:
    return dict(sorted(Counter(str(record.get(field)) for record in records).items()))


def phase_record(records: list[dict], task_id: str) -> dict:
    return next(record for record in records if record.get("task_id") == task_id)


def outside_67_audit() -> dict:
    """Record overlap only; the 67-path report is not treated as a phase join."""
    path = ROOT / OUTSIDE_67_PATH
    report = json.loads(path.read_text(encoding="utf-8"))
    rows = report.get("rows", [])
    return {
        "report_path": OUTSIDE_67_PATH,
        "report_sha256": sha(path.read_bytes()),
        "record_count": len(rows),
        "path_set_sha256": report.get("external_path_set_sha256"),
        "all_legacy_catalog_record_count_zero": all(row.get("legacy_catalog_record_count") == 0 for row in rows),
        "phase_scope_counts": dict(sorted(Counter(row.get("phase_scope") for row in rows).items())),
        "product_scope_counts": dict(sorted(Counter(row.get("product_scope") for row in rows).items())),
        "potential_l2_upstream_count": sum(row.get("phase_scope") == "L2-requirements" for row in rows),
        "potential_upstream_crosswalk_count": sum(row.get("phase_scope") == "upstream-governance-or-crosswalk" for row in rows),
        "downstream_l11_count": sum(row.get("phase_scope") == "L11-acceptance" for row in rows),
        "direct_phcap02_or_03_join_count": 0,
        "classification": "path_based_adjacent_only_no_direct_phcap02_phcap03_join",
        "interpretation": "67件はL1/L2/L11 draftまたはupstream/crosswalkのpath候補であり、PHCAP-02/03の登録identity・phase join・要件atomとは断定しない。",
    }


def build() -> dict:
    phase_inventory = json.loads((ROOT / PHASE_PATH).read_text(encoding="utf-8"))
    phase_records = phase_inventory["records"]
    routing = read_jsonl(ROOT / ROUTING_PATH)
    register = read_jsonl(ROOT / REGISTER_PATH)
    disposition_records = {record["asset_id"]: record for record in read_jsonl(ROOT / ASSET_PATH)}
    phase_asset_records = {record["asset_id"]: record for record in read_jsonl(ROOT / PHASE_ASSET_PATH)}
    decision_records = read_jsonl(ROOT / DECISIONS_PATH)

    assets = []
    for selected in SELECTED:
        disposition = disposition_records[selected["asset_id"]]
        classification = phase_asset_records[selected["asset_id"]]
        blob = git_archive_bytes(disposition["source_path"])
        lines = blob.decode("utf-8").splitlines()
        anchors = []
        for index, ((start, end), meaning) in enumerate(zip(selected["anchors"], selected["anchor_meanings"]), 1):
            exact = span_text(lines, start, end)
            anchors.append(
                {
                    "anchor_id": f"{selected['asset_id']}-A{index:02d}",
                    "line_start": start,
                    "line_end": end,
                    "sha256": sha(exact.encode("utf-8")),
                    "exact_text": exact,
                    "meaning": meaning,
                }
            )
        assets.append(
            {
                "asset_id": selected["asset_id"],
                "source_path": disposition["source_path"],
                "archive_path": ARCHIVE_PREFIX + disposition["source_path"],
                "source_sha256": disposition["source_sha256"],
                "source_bytes": len(blob),
                "source_line_count": len(lines),
                "source_anchors": anchors,
                "asset_class": disposition["asset_class"],
                "authority_status": disposition["authority_status"],
                "disposition": disposition["disposition"],
                "legacy_implementation_status": disposition["implementation_status"],
                "legacy_execution_performed": classification["legacy_execution_performed"],
                "implementation_evidence_state": classification["implementation_evidence_state"],
                "candidate_phase_targets": classification["candidate_phase_targets"],
                "candidate_product_targets": classification["candidate_product_targets"],
                "phase_classification_status": classification["phase_classification_status"],
                "product_classification_status": classification["product_classification_status"],
                "consumer_refs": disposition["consumer_refs"],
                "consumer_closure_status": classification["consumer_closure_status"],
                "decision_record_ref": disposition["decision_record_ref"],
                "failure_evidence": {
                    "status": "source_contract_or_test_design_only_unexecuted",
                    "execution_receipts": 0,
                    "observed_failure_status": "unknown",
                    "anchor_ids": [anchor["anchor_id"] for anchor in anchors if "failure" in anchor["meaning"] or "failure" in anchor["exact_text"].lower()],
                },
                "consumer_evidence": {
                    "status": "source_candidate_only_closure_pending",
                    "consumer_refs": disposition["consumer_refs"],
                    "read_after_receipts": 0,
                    "anchor_ids": [anchor["anchor_id"] for anchor in anchors if "consumer" in anchor["meaning"].lower() or "downstream" in anchor["exact_text"].lower()],
                },
            }
        )

    phase_audit = {}
    for task_id in ("PHCAP-02", "PHCAP-03"):
        candidates = [record for record in phase_asset_records.values() if task_id in record.get("candidate_phase_targets", [])]
        phase_audit[task_id] = {
            "record_count": len(candidates),
            "artifact_evidence_kind": count_values(candidates, "artifact_evidence_kind"),
            "implementation_evidence_state": count_values(candidates, "implementation_evidence_state"),
            "legacy_implementation_status": count_values(candidates, "legacy_implementation_status"),
            "consumer_closure_status": count_values(candidates, "consumer_closure_status"),
            "phase_classification_status": count_values(candidates, "phase_classification_status"),
            "product_classification_status": count_values(candidates, "product_classification_status"),
            "legacy_execution_performed": count_values(candidates, "legacy_execution_performed"),
            "decision_record_ref": count_values(candidates, "decision_record_ref"),
            "candidate_product_target_sets": count_values(candidates, "candidate_product_targets"),
            "product_assessment_lengths": count_values(candidates, "product_assessments"),
        }

    exact_product_set = tuple(PRODUCTS)
    routing_audit = {
        "record_count": len(routing),
        "evaluated_product_set_counts": count_values(routing, "evaluated_product_set"),
        "records_with_exact_four_product_evaluations": sum(
            1 for record in routing if tuple(record.get("evaluated_product_set", [])) == exact_product_set and len(record.get("product_evaluations", [])) == 4
        ),
        "classification_state_counts": count_values(routing, "classification_state"),
        "routing_candidate_counts": count_values(routing, "routing_candidate"),
        "candidate_product_target_counts": count_values(routing, "candidate_product_targets"),
        "phase_field_presence": {field: sum(field in record for record in routing) for field in ("phase_candidates", "candidate_phase_targets")},
        "legacy_evidence_field_presence": {
            field: sum(field in record for record in routing)
            for field in ("legacy_implementation_status", "implementation_status", "failure_status", "degraded_status", "consumer_closure_status")
        },
        "successor_assignment_status_counts": count_values(routing, "successor_assignment_status"),
    }

    management_audit = {
        "record_count": len(register),
        "registration_kind_counts": count_values(register, "registration_kind"),
        "product_target_counts": count_values(register, "product_target"),
        "requirement_candidate_count": sum(1 for record in register if record.get("registration_kind") == "requirement_candidate"),
        "source_holding_unassigned_count": sum(1 for record in register if record.get("registration_kind") == "source_holding" and record.get("product_target") == "unassigned_cross_product"),
    }

    matching_decisions = [record for record in decision_records if record.get("asset_id") in disposition_records]
    phase_snapshots = {task_id: phase_record(phase_records, task_id) for task_id in ("PHCAP-02", "PHCAP-03")}
    gaps = [
        {
            "gap_id": "PHCAP-02-PRODUCT-001",
            "phase": "PHCAP-02",
            "kind": "four_product_join_missing",
            "evidence": ["phase-capability-inventory:PHCAP-02", "legacy-ir-product-routing-bootstrap:153/153 exact four-product evaluation"],
            "finding": "PHCAP-02 capabilityのproduct_targets／current evidence_productsがHELIX-OSだけであること自体はphase scopeである。欠落は、登録された各requirement origin／target productを、四製品routingのincluded/excluded/unresolved評価へrevision-boundでtraceできるphase joinがないこと。",
            "required_evidence": "PHCAP-02 registered requirement identity／source atomごとのorigin・target productと、四製品routing評価を結ぶrevision-bound traceability（capability自体のWeb／Web-OS target追加を意味しない）",
        },
        {
            "gap_id": "PHCAP-02-REGISTER-001",
            "phase": "PHCAP-02",
            "kind": "requirement_candidate_missing",
            "evidence": ["management-provisional-requirement-register:32 source_holding / 0 requirement_candidate"],
            "finding": "仮登録はsource_holdingをunassigned_cross_productで保持するだけで、PHCAP-02のproduct-specific requirement_candidate登録がない。",
            "required_evidence": "candidate identity、product target、parent revision、source atom coverage、human decisionの別record",
        },
        {
            "gap_id": "PHCAP-02-IMPLEMENTATION-001",
            "phase": "PHCAP-02",
            "kind": "legacy_implementation_conflict",
            "evidence": ["phase-capability-inventory:implemented_with_tests", "selected legacy assets: implementation_status=unknown / execution=false"],
            "finding": "phaseのimplemented_with_testsはasset-level実装成立を裏付けない。代表3 assetはunknown、source/testはunexecutedである。",
            "required_evidence": "current implementation identity、revision、実行receipt、consumer read-after",
        },
        {
            "gap_id": "PHCAP-02-FAILURE-CONSUMER-001",
            "phase": "PHCAP-02",
            "kind": "failure_consumer_closure_missing",
            "evidence": ["42 phase candidates: legacy_execution=false=42, consumer_closure=pending=42, decision=null=42"],
            "finding": "failure/degradedの観測receipt、consumer refs、decision recordがなく、旧sourceのfailure条件を観測結果へ昇格できない。",
            "required_evidence": "failure/degraded observation、recovery/retry result、consumer closure、append-only decision record",
        },
        {
            "gap_id": "PHCAP-03-PRODUCT-001",
            "phase": "PHCAP-03",
            "kind": "phase_product_join_missing",
            "evidence": ["phase-capability-inventory:PHCAP-03 current H/OS", "legacy-ir-product-routing-bootstrap:153/153 exact four-product evaluation"],
            "finding": "PHCAP-03 capabilityのproduct_targets／current evidence_productsがHARNESS/OSだけであることはphase scopeである。欠落は、分類対象のregistered requirement origin／target productを四製品routingのincluded/excluded/unresolved評価へrevision-boundでtraceするphase joinがないこと。",
            "required_evidence": "分類対象のrequirement identity／source atomと四製品評価、excluded reason、unresolved、routing revisionのtraceability（capability自体のWeb／Web-OS target追加を意味しない）",
        },
        {
            "gap_id": "PHCAP-03-LEGACY-001",
            "phase": "PHCAP-03",
            "kind": "legacy_implementation_conflict",
            "evidence": ["phase-capability-inventory:implemented_partial", "161 phase candidates: implementation unknown=160, non_executable=1, execution=false=161"],
            "finding": "implemented_partialは旧design/config/test/sourceの存在分類であり、current implementation evidenceではない。",
            "required_evidence": "classification implementationの現行identity、実行可能なrevision、独立検証receipt、degraded/unimplemented disposition",
        },
        {
            "gap_id": "PHCAP-03-FAILURE-CONSUMER-001",
            "phase": "PHCAP-03",
            "kind": "failure_consumer_closure_missing",
            "evidence": ["161 phase candidates: consumer_closure=pending=161, decision=null=161"],
            "finding": "旧failure matrix／validator contractは静的設計として存在するが、実行failure、degraded state、consumer closureのreceiptがない。",
            "required_evidence": "failure/degraded/unimplemented stateを区別する観測receipt、consumer read-after、decision record",
        },
        {
            "gap_id": "PHCAP-03-BOUNDARY-001",
            "phase": "PHCAP-03",
            "kind": "harness_os_boundary_unresolved",
            "evidence": ["FT-HARNESS-REQENG-001", "FT-OS-REQCLASS-001", "selected L4/L5/L6 legacy sources"],
            "finding": "HARNESS semantic coreとOS classification projectionの接続・authority・consumer contractは候補段階で、正式L3/L10へ凍結されていない。",
            "required_evidence": "source atom別のunit/connection/split decision、authority owner、versioned consumer contract、L3/L10 pair",
        },
    ]

    return {
        "schema": "phcap02-03-registration-classification-evidence-gap/v1",
        "candidate_id": "PHCAP-02-03-EVIDENCE-GAP-0034",
        "status": "research_premise_candidate",
        "authority_effect": "none",
        "meaning_change_applied": False,
        "successor_requirement_ids": [],
        "human_decision_ref": None,
        "equivalence_claim": None,
        "old_runtime_test_ci_execution": False,
        "base": {
            "origin_main_commit": ORIGIN,
            "branch": BRANCH,
            "worktree": str(Path.cwd()),
            "rebaseline": {"origin_main_at_start": ORIGIN, "origin_main_at_final": ORIGIN, "changed": False},
        },
        "scope": {
            "phase_ids": ["PHCAP-02", "PHCAP-03"],
            "approved_products": PRODUCTS,
            "phase_current_evidence_products": {"PHCAP-02": ["HELIX-OS"], "PHCAP-03": ["HELIX-HARNESS", "HELIX-OS"]},
            "selected_legacy_asset_ids": [asset["asset_id"] for asset in assets],
            "selection_rule": "phase bootstrap candidates whose representative assets are named by PHCAP-02/03 inventory; exact source/ledger evidence only",
        },
        "phase_records": phase_snapshots,
        "phase_candidate_aggregates": phase_audit,
        "product_routing_audit": routing_audit,
        "management_register_audit": management_audit,
        "outside_holding_67_audit": outside_67_audit(),
        "legacy_assets": assets,
        "source_observations": [
            {"path": "archive/legacy-generation-2026-09-14/root/docs/design/helix/L6-function-design/requirement-discovery-event-projection.md", "lines": "16-23", "observation": "draft移行用pure component、DB/GitHub/filesystem/L3 write authorityなし、未実装interview engineを実装済みと扱わない"},
            {"path": "archive/legacy-generation-2026-09-14/root/docs/design/helix/L6-function-design/requirement-discovery-event-projection.md", "lines": "27-50", "observation": "strict event failureとcandidate projection不変条件を設計するが、runtime execution receiptではない"},
            {"path": "archive/legacy-generation-2026-09-14/root/docs/design/helix/L4-basic-design/requirement-refinement-authority.md", "lines": "85-107", "observation": "design-reality bindingのdeclared_failure_codesとfailure_reachabilityが空"},
            {"path": "archive/legacy-generation-2026-09-14/root/docs/design/helix/L5-detail/requirement-refinement-authority.md", "lines": "153-154", "observation": "failure mutation、manifest/view/DB統合、frozen bundleは未実装と明記"},
            {"path": "archive/legacy-generation-2026-09-14/root/docs/plans/PLAN-L6-88-requirement-discovery-event-projection.md", "lines": "93-99", "observation": "PLAN confirmはdesign/test pair freezeだけで、runtime完了やcanonical cutoverを意味しない"},
            {"path": "archive/legacy-generation-2026-09-14/root/docs/plans/PLAN-L7-487-requirement-discovery-event-projection.md", "lines": "126-147", "observation": "旧planはpure APIとmutation oracleの工程・closureを記述するが、新世代の実装証拠へ昇格しない"},
        ],
        "decisions": {
            "selected_asset_ids": [asset["asset_id"] for asset in assets],
            "matching_append_only_decision_record_count": len(matching_decisions),
            "per_asset": {asset["asset_id"]: 0 for asset in assets},
        },
        "failure_residual": {
            "selected_asset_failure_records": 0,
            "current_product_failure_receipts": 0,
            "current_l10_execution_receipts": 0,
            "degraded_observation_receipts": 0,
            "unimplemented_disposition_receipts": 0,
        },
        "consumer_residual": {
            "selected_asset_ledger_consumer_refs": [],
            "current_consumer_read_after_receipts": 0,
            "consumer_closure_status": "pending",
        },
        "gaps": gaps,
        "prohibited_inference": [
            "phase capability_status implemented_with_tests／implemented_partialをcurrent implementationへ昇格しない",
            "旧sourceのfailure／degradation条件をobserved failure／degraded stateへ変換しない",
            "旧test design／test sourceをexecuted pass、oracle、CI evidenceへ昇格しない",
            "四製品routing候補をphase capability target、successor、owner、承認、要求採否へ昇格しない",
            "phase candidate targetをPHCAP authorityまたはL3/L10完了へ昇格しない",
            "consumer refs空・decision record不在をclosureまたはapprovalへ変換しない",
            "source document presenceをunimplementedの断定へ使わない",
        ],
    }


if __name__ == "__main__":
    (HERE / "inventory.json").write_text(json.dumps(build(), ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
