#!/usr/bin/env python3
"""PHCAP-12/13 static research premise inventory generator."""
from __future__ import annotations

import hashlib
import json
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
ARCHIVE = ROOT / "archive/legacy-generation-2026-09-14/root"
PHASE_INV = ROOT / "docs/governance/phase-capability-inventory.json"
DISP = ROOT / "docs/governance/legacy-asset-disposition.jsonl"
PHASE = ROOT / "docs/governance/legacy-asset-phase-product-classification-bootstrap.jsonl"
DECISIONS = ROOT / "docs/governance/legacy-asset-decisions.jsonl"
INV = HERE / "inventory.json"
FAILURE_CONSUMER_INTERPRETATION = "historical source failure/consumer descriptions remain candidate evidence; current execution, read-after, and closure are unknown"
ORIGIN = "fbeee47920ed8b2992ae123b00c224ff88987c50"
ARCHIVE_PREFIX = "archive/legacy-generation-2026-09-14/root/"

ASSET_ORDER = [
    "LEGACY-ASSET-D107FD145A2588FAAD09",
    "LEGACY-ASSET-D6816E22DAF2E990410B",
    "LEGACY-ASSET-4FED0B46C22941761357",
    "LEGACY-ASSET-188DE92635DFB97B0200",
    "LEGACY-ASSET-50A93B0E753DC3840E03",
    "LEGACY-ASSET-A2E186B3A66077923537",
    "LEGACY-ASSET-8686BB8CF396BAF57F2E",
    "LEGACY-ASSET-0CC674CB78470B86E7A8",
    "LEGACY-ASSET-EA1DFC00D984068C2444",
]

SPAN_SPECS = {
    ASSET_ORDER[0]: [(1, 33, "D107-01", "historical independent review boundary and sealed receipt contract"), (35, 40, "D107-02", "historical non-runtime and later-slice boundary")],
    ASSET_ORDER[1]: [(1, 44, "D681-01", "historical cross-review admission input and independence contract"), (45, 80, "D681-02", "historical fail-close and receipt lifecycle candidate")],
    ASSET_ORDER[2]: [(1, 42, "4FED-01", "historical review receipt and PLAN binding boundary"), (43, 56, "4FED-02", "historical receipt evidence and terminal binding candidate")],
    ASSET_ORDER[3]: [(1, 33, "188D-01", "historical review lane closure digest boundary"), (34, 80, "188D-02", "historical closure manifest and provider material candidate")],
    ASSET_ORDER[4]: [(1, 27, "50A9-01", "historical worker review system-test design and negative cases")],
    ASSET_ORDER[5]: [(1, 55, "A2E-01", "historical review receipt/PLAN binding test fixture and cases"), (56, 120, "A2E-02", "historical receipt drift and failure test cases")],
    ASSET_ORDER[6]: [(1, 50, "8686-01", "historical merge admission requirement and same-HEAD receipt boundary"), (51, 100, "8686-02", "historical merge readiness and identity gate candidate")],
    ASSET_ORDER[7]: [(1, 36, "0CC6-01", "historical merge admission system-test design and negative cases")],
    ASSET_ORDER[8]: [(1, 65, "EA1D-01", "historical GitHub cross-review admission input and decision envelope"), (66, 140, "EA1D-02", "historical admission failure reasons and read-after candidate")],
}

CURRENT_REFS = [
    ("BOUNDARY-UNIT-CONNECTION", "docs/concept/product-boundary.md", "ALL", "boundary_current_ref", "Concept", 12, 44, "four-product unit and connection boundary"),
    ("OS-REVIEW-HANDOFF", "docs/governance/feature-tickets/FT-OS-REVIEWHANDOFF-001.md", "HELIX-OS", "direct_current_ref", "Feature candidate", 1, 64, "review handoff candidate and authority boundary"),
    ("GITHUB-UPSTREAM-MODEL", "docs/governance/github-upstream-operating-model.md", "HELIX-OS", "direct_current_ref", "Governance", 112, 169, "review and merge admission operating candidate"),
    ("MERGE-REHOST-ASSESSMENT", "docs/governance/audits/source-rebaseline/legacy-reviewed-merge-rehost-assessment-2026-09-20.md", "HELIX-OS", "direct_current_ref", "Audit", 1, 82, "legacy reviewed merge rehost assessment boundary"),
    ("HARNESS-L2", "docs/helix-harness/L2-requirements/product-requirements.md", "HELIX-HARNESS", "direct_current_ref", "L2", 1, 45, "HARNESS V-model and review contract candidate"),
    ("OS-L2", "docs/helix-os/L2-requirements/governance-requirements.md", "HELIX-OS", "direct_current_ref", "L2", 1, 45, "OS progression and evidence governance candidate"),
    ("WEB-L2", "docs/helix-web/L2-requirements/product-requirements.md", "HELIX-Web", "adjacent_current_ref", "L2", 1, 45, "Web user-facing product boundary candidate"),
    ("WEBOS-L2", "docs/helix-web-os/L2-requirements/service-governance-requirements.md", "HELIX-Web-OS", "adjacent_current_ref", "L2", 1, 38, "Web-OS service boundary candidate"),
    ("HARNESS-L11", "docs/helix-harness/L11-acceptance/product-acceptance.md", "HELIX-HARNESS", "direct_current_ref", "L11", 1, 45, "HARNESS acceptance remains draft/unexecuted"),
    ("OS-L11", "docs/helix-os/L11-acceptance/governance-acceptance.md", "HELIX-OS", "direct_current_ref", "L11", 1, 45, "OS acceptance remains draft/unexecuted"),
    ("WEB-L11", "docs/helix-web/L11-acceptance/product-acceptance.md", "HELIX-Web", "adjacent_current_ref", "L11", 1, 31, "Web acceptance remains draft/unexecuted"),
    ("WEBOS-L11", "docs/helix-web-os/L11-acceptance/service-acceptance.md", "HELIX-Web-OS", "adjacent_current_ref", "L11", 1, 24, "Web-OS acceptance remains draft/unexecuted"),
]


def sha(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def jsonl(path: Path) -> list[dict]:
    return [json.loads(line) for line in path.read_text(encoding="utf-8").splitlines() if line.strip()]


def line_text(path: Path, start: int, end: int) -> str:
    lines = path.read_text(encoding="utf-8").splitlines()
    assert 1 <= start <= end <= len(lines), (path, start, end, len(lines))
    return "\n".join(lines[start - 1:end]) + "\n"


def phase_snapshot(row: dict) -> dict:
    return row


def ledger_snapshot(row: dict) -> dict:
    keys = [
        "revision", "source_revision", "source_path", "source_sha256", "asset_class",
        "reuse_exclusion_class", "product_target", "authority_status", "disposition",
        "implementation_status", "consumer_refs", "decision_record_ref", "executability_status",
        "external_effect_status",
    ]
    return {key: row.get(key) for key in keys}


def make_anchor(path: Path, start: int, end: int, anchor_id: str, meaning: str) -> dict:
    text = line_text(path, start, end)
    return {
        "anchor_id": anchor_id,
        "line_start": start,
        "line_end": end,
        "exact_text": text,
        "sha256": sha(text.encode("utf-8")),
        "meaning": meaning,
    }


def current_ref(spec: tuple) -> dict:
    ref_id, rel, product, classification, layer, start, end, role = spec
    path = ROOT / rel
    text = line_text(path, start, end)
    return {
        "ref_id": ref_id,
        "path": rel,
        "product": product,
        "classification": classification,
        "layer": layer,
        "start_line": start,
        "end_line": end,
        "exact_text": text,
        "line_sha256": sha(text.encode("utf-8")),
        "sha256": sha(path.read_bytes()),
        "role": role,
        "implementation_status": "not_evidence",
        "execution_status": "not_run",
    }


disp_rows = jsonl(DISP)
phase_rows = jsonl(PHASE)
decision_rows = jsonl(DECISIONS)
disp = {row["asset_id"]: row for row in disp_rows}
phase = {row["asset_id"]: row for row in phase_rows}
phase_inventory = json.loads(PHASE_INV.read_text(encoding="utf-8"))
phase_records = {row["task_id"]: row for row in phase_inventory["records"]}
phase12_ids = {row["asset_id"] for row in phase_rows if "PHCAP-12" in row.get("candidate_phase_targets", [])}
phase13_ids = {row["asset_id"] for row in phase_rows if "PHCAP-13" in row.get("candidate_phase_targets", [])}
selected_decision_rows = [row for row in decision_rows if row.get("asset_id") in ASSET_ORDER]
decision_matching_asset_ids = [
    aid for aid in ASSET_ORDER
    if any(row.get("asset_id") == aid for row in selected_decision_rows)
]
decision_match_count = len(selected_decision_rows)
scf003_path = ROOT / "scaffold/bindings/SCF-B-0003.json"
scf003 = json.loads(scf003_path.read_text(encoding="utf-8"))

assets = []
for aid in ASSET_ORDER:
    old = disp[aid]
    cls = phase[aid]
    source = ARCHIVE / old["source_path"]
    anchors = [make_anchor(source, start, end, sid, meaning) for start, end, sid, meaning in SPAN_SPECS[aid]]
    anchor_ids = [row["anchor_id"] for row in anchors]
    candidates = {
        ASSET_ORDER[0]: ["HELIX-OS review progression and independent reviewer candidate"],
        ASSET_ORDER[1]: ["HARNESS review contract", "OS merge admission progression", "Web-OS bounded observation candidate"],
        ASSET_ORDER[2]: ["OS PLAN/review evidence consumer candidate"],
        ASSET_ORDER[3]: ["OS review lane closure candidate"],
        ASSET_ORDER[4]: ["OS verification/evidence consumer candidate"],
        ASSET_ORDER[5]: ["OS receipt/PLAN binding consumer candidate"],
        ASSET_ORDER[6]: ["HARNESS requirement and OS merge admission candidate"],
        ASSET_ORDER[7]: ["HARNESS/OS merge admission verification candidate", "Web/Web-OS adjacent evidence candidate"],
        ASSET_ORDER[8]: ["OS admission evaluator consumer candidate"],
    }[aid]
    assets.append({
        "asset_id": aid,
        "source_path": old["source_path"],
        "archive_path": ARCHIVE_PREFIX + old["source_path"],
        "source_revision": old["source_revision"],
        "source_sha256": old["source_sha256"],
        "source_line_count": len(source.read_text(encoding="utf-8").splitlines()),
        "artifact_evidence_kind": cls.get("artifact_evidence_kind"),
        "implementation_evidence_state": cls.get("implementation_evidence_state"),
        "legacy_layers": cls.get("phase_assessments", []),
        "ledger_snapshot": ledger_snapshot(old),
        "phase_classification_snapshot": phase_snapshot(cls),
        "decision_history": {"matching_count": 0, "matching_records": [], "status": "no_matching_append_only_decision_record"},
        "source_anchors": anchors,
        "failure_evidence": {
            "status": "source_contract_only_unexecuted",
            "execution_receipts": 0,
            "anchor_ids": anchor_ids[:1],
            "finding": "historical review/admission failure or negative boundary candidate; no current execution or pass is inferred",
        },
        "consumer_evidence": {
            "status": "candidate_only_closure_pending",
            "consumer_refs": [],
            "anchor_ids": anchor_ids[-1:],
            "candidates": candidates,
            "finding": "historical consumer or trace candidate; current consumer read-after and closure remain unknown",
        },
    })

units = [
    {
        "unit_id": "PHCAP12-13-UNIT-HARNESS",
        "product": "HELIX-HARNESS",
        "status": "research_premise_candidate",
        "current_capability": "V-model review contract, evidence vocabulary, and merge-facing obligation candidate",
        "current_evidence_status": "direct_candidate_refs",
        "current_implementation_status": "unknown",
        "legacy_transition_status": "degraded_to_candidate_contract",
        "authority_status": "candidate_unresolved",
        "acceptance_status": "draft_unexecuted",
        "current_ref_ids": ["BOUNDARY-UNIT-CONNECTION", "HARNESS-L2", "HARNESS-L11"],
        "legacy_asset_ids": [ASSET_ORDER[1], ASSET_ORDER[6], ASSET_ORDER[7]],
        "unresolved": ["formal owner", "L2/L11 adoption", "current implementation", "consumer closure"],
    },
    {
        "unit_id": "PHCAP12-13-UNIT-OS",
        "product": "HELIX-OS",
        "status": "research_premise_candidate",
        "current_capability": "review handoff, progression, receipt/finding, and merge admission management candidate",
        "current_evidence_status": "direct_candidate_refs",
        "current_implementation_status": "unknown",
        "legacy_transition_status": "degraded_to_manual_or_candidate_contract",
        "authority_status": "candidate_unresolved",
        "acceptance_status": "draft_unexecuted",
        "current_ref_ids": ["BOUNDARY-UNIT-CONNECTION", "OS-REVIEW-HANDOFF", "GITHUB-UPSTREAM-MODEL", "MERGE-REHOST-ASSESSMENT", "OS-L2", "OS-L11"],
        "legacy_asset_ids": ASSET_ORDER,
        "unresolved": ["canonical receipt schema", "DB convergence", "current CI", "formal owner", "consumer closure"],
    },
    {
        "unit_id": "PHCAP12-13-UNIT-WEB",
        "product": "HELIX-Web",
        "status": "adjacent_boundary_only",
        "current_capability": "user-facing review/result presentation boundary candidate",
        "current_evidence_status": "adjacent_refs_only",
        "current_implementation_status": "unknown",
        "legacy_transition_status": "unresolved_adjacent_candidate",
        "authority_status": "adjacent_candidate_only",
        "acceptance_status": "draft_unexecuted",
        "current_ref_ids": ["BOUNDARY-UNIT-CONNECTION", "WEB-L2", "WEB-L11"],
        "legacy_asset_ids": [ASSET_ORDER[7]],
        "unresolved": ["PHCAP-12/13 direct evidence", "owner", "review consumer", "implementation"],
    },
    {
        "unit_id": "PHCAP12-13-UNIT-WEBOS",
        "product": "HELIX-Web-OS",
        "status": "adjacent_boundary_only",
        "current_capability": "tenant/job/service observation boundary and permitted export candidate",
        "current_evidence_status": "adjacent_refs_only",
        "current_implementation_status": "unknown",
        "legacy_transition_status": "unresolved_adjacent_candidate",
        "authority_status": "adjacent_candidate_only",
        "acceptance_status": "draft_unexecuted",
        "current_ref_ids": ["BOUNDARY-UNIT-CONNECTION", "WEBOS-L2", "WEBOS-L11"],
        "legacy_asset_ids": [ASSET_ORDER[1], ASSET_ORDER[6], ASSET_ORDER[7]],
        "unresolved": ["service consumer scope", "credential/state separation", "implementation", "acceptance"],
    },
]

edges = [
    {"edge_id": "CONN-HARNESS-OS-REVIEW-CONTRACT", "from": "HELIX-HARNESS", "to": "HELIX-OS", "kind": "contract_to_progression", "status": "candidate", "authority_effect": "none", "meaning": "HARNESS review/evidence vocabulary may constrain OS progression and admission; no authority or implementation is inferred."},
    {"edge_id": "CONN-OS-HARNESS-RECEIPT-PROJECTION", "from": "HELIX-OS", "to": "HELIX-HARNESS", "kind": "receipt_to_contract_feedback", "status": "candidate", "authority_effect": "none", "meaning": "OS receipt/finding projection may feed HARNESS contract review; a receipt does not create approval or acceptance."},
    {"edge_id": "CONN-OS-WEB-PROJECT-RESULT", "from": "HELIX-OS", "to": "HELIX-Web", "kind": "project_to_user_result", "status": "adjacent_candidate", "authority_effect": "none", "meaning": "OS may expose scoped project/review result state to Web; Web has no WBS, ticket, or merge authority."},
    {"edge_id": "CONN-WEB-WEBOS-SERVICE-REQUEST", "from": "HELIX-Web", "to": "HELIX-Web-OS", "kind": "user_request_to_service", "status": "adjacent_candidate", "authority_effect": "none", "meaning": "Web user operation may reach Web-OS service state through a bounded contract; tenant state and credentials remain separate."},
    {"edge_id": "CONN-WEBOS-OS-OBSERVATION-EXPORT", "from": "HELIX-Web-OS", "to": "HELIX-OS", "kind": "scoped_observation_export", "status": "adjacent_candidate", "authority_effect": "none", "meaning": "Permitted service observation may be exported to OS improvement/review evidence; raw tenant data and writer authority are not shared."},
]

consumer_candidates = [
    {"consumer_id": "CONSUMER-HARNESS-REVIEW-CONTRACT", "product": "HELIX-HARNESS", "candidate_input": "review/evidence contract", "observed": False, "closure_status": "pending", "evidence_status": "candidate_only", "authority_effect": "none"},
    {"consumer_id": "CONSUMER-OS-PROGRESSION-ADMISSION", "product": "HELIX-OS", "candidate_input": "receipt/finding/merge admission state", "observed": False, "closure_status": "pending", "evidence_status": "candidate_only", "authority_effect": "none"},
    {"consumer_id": "CONSUMER-WEB-RESULT-PRESENTATION", "product": "HELIX-Web", "candidate_input": "scoped review/project result", "observed": False, "closure_status": "pending", "evidence_status": "adjacent_candidate_only", "authority_effect": "none"},
    {"consumer_id": "CONSUMER-WEBOS-SERVICE-OBSERVATION", "product": "HELIX-Web-OS", "candidate_input": "bounded service observation/export", "observed": False, "closure_status": "pending", "evidence_status": "adjacent_candidate_only", "authority_effect": "none"},
]

current_refs = [current_ref(spec) for spec in CURRENT_REFS]
phase_joins = []
for phase_id in ("PHCAP-12", "PHCAP-13"):
    selected = [aid for aid in ASSET_ORDER if phase_id in phase[aid].get("candidate_phase_targets", [])]
    phase_joins.append({"phase_id": phase_id, "selected_asset_ids": selected, "interpretation": "candidate phase join only; no admission, owner, or successor is generated"})

inventory = {
    "schema": "phcap12-13-review-research/v1",
    "status": "research_premise_candidate",
    "authority_effect": "none",
    "meaning_change_applied": False,
    "successor_requirement_ids": [],
    "human_decision_ref": None,
    "equivalence_claim": None,
    "old_runtime_test_ci_execution": False,
    "base": {
        "repository": "HELIX-HARNESS",
        "commit": ORIGIN,
        "origin": "origin/main",
        "branch": "research/phcap12-13-review",
        "worktree": "/home/tenni/.helix-worktrees/phcap12-13-review",
        "captured_at": "2026-09-22",
        "rebaseline_rule": "origin/mainがcapture commitから変化したらstopし、rebaseline後にledger・source・current ref digestを再取得する。候補をcurrent扱いしない",
    },
    "ledger_provenance": {
        "phase_inventory_path": "docs/governance/phase-capability-inventory.json",
        "phase_inventory_sha256": sha(PHASE_INV.read_bytes()),
        "asset_ledger_path": "docs/governance/legacy-asset-disposition.jsonl",
        "asset_ledger_sha256": sha(DISP.read_bytes()),
        "phase_classification_path": "docs/governance/legacy-asset-phase-product-classification-bootstrap.jsonl",
        "phase_classification_sha256": sha(PHASE.read_bytes()),
        "decision_ledger_path": "docs/governance/legacy-asset-decisions.jsonl",
        "decision_ledger_sha256": sha(DECISIONS.read_bytes()),
        "asset_record_count": len(disp_rows),
        "phase_record_count": len(phase_rows),
        "decision_record_count": len(decision_rows),
        "selected_asset_count": len(ASSET_ORDER),
        "matching_decision_record_count": decision_match_count,
    },
    "tasks": [
        {"task_id": "PHCAP-12", "phase_record_snapshot": phase_records["PHCAP-12"]},
        {"task_id": "PHCAP-13", "phase_record_snapshot": phase_records["PHCAP-13"]},
    ],
    "scope": {
        "phase_ids": ["PHCAP-12", "PHCAP-13"],
        "product_targets": ["HELIX-HARNESS", "HELIX-OS", "HELIX-Web", "HELIX-Web-OS"],
        "legacy_asset_ids": ASSET_ORDER,
        "selected_source_asset_count": len(ASSET_ORDER),
        "source_anchor_count": sum(len(a["source_anchors"]) for a in assets),
        "candidate_asset_counts": {"PHCAP-12": len(phase12_ids), "PHCAP-13": len(phase13_ids), "both": len(phase12_ids & phase13_ids), "either": len(phase12_ids | phase13_ids)},
        "closure_rule": "PHCAP-12/13 representative assets and current refs only; unselected asset, failure, consumer, and implementation closure remains residual",
    },
    "product_units": units,
    "candidate_connections": edges,
    "candidate_phase_joins": phase_joins,
    "legacy_phase_assessment": {
        "assets": assets,
        "decision_matching_asset_ids": decision_matching_asset_ids,
        "phase_summary_is_historical_only": True,
    },
    "current_evidence": {
        "implementation_status": "unknown",
        "operation_status": "unknown",
        "acceptance_status": "unknown",
        "refs": current_refs,
        "scaffold_context": {
            "binding_id": "SCF-B-0003",
            "path": "scaffold/bindings/SCF-B-0003.json",
            "sha256": sha(scf003_path.read_bytes()),
            "state": scf003.get("state"),
            "authority_effect": "none",
            "implementation_status": "scaffold_only",
            "acceptance_status": "unknown",
            "meaning": "GUI notification scaffold is a bounded operating projection; it does not establish independent review, canonical receipt, CI, DB convergence, merge authority, or requirement adoption",
        },
    },
    "failure_consumer_residual": {
        "failure_execution_receipts": 0,
        "selected_asset_consumer_refs": [],
        "consumer_closure_status": "pending",
        "consumer_candidates": consumer_candidates,
        "interpretation": FAILURE_CONSUMER_INTERPRETATION,
        "interpretation_sha256": sha(FAILURE_CONSUMER_INTERPRETATION.encode("utf-8")),
    },
    "unresolved": [
        "PHCAP-12 review receipt schema、delivery、再開、provider boundaryの正式化",
        "PHCAP-13 canonical merge admission、current CI、DB convergence、main read-afterの再導出",
        "HARNESSとOSのunit／connection／composite splitと正式owner",
        "Web／Web-OSのdirect evidence、service scope、consumer identity",
        "旧sourceのimplemented／test design記述と現行implementation statusの差分",
        "failure finding、receipt、consumer read-after、closureの現行証拠",
        "旧assetの意味再利用、再導出、置換、退役に関する人間decision",
        "L2/L11 adoption、successor requirement、正式なacceptanceとrelease境界",
    ],
    "verification_contract": {
        "evidence_kind": "scaffold",
        "negative_cases": [
            "authority、successor、human decision、equivalenceを候補から生成する",
            "current implementation、operation、acceptance、product ownerをunknownから昇格する",
            "Web／Web-OSの隣接refをPHCAP-12/13 direct evidenceへ昇格する",
            "old source／test／runtimeをexecution、oracle、pass、fallbackへ昇格する",
            "consumer candidate、pending、failure receipt 0をclosureへ変換する",
            "unit／connection候補をapproved authority、shared writer、shared stateへ変換する",
            "unit capability／transition、connection meaning、phase join interpretationを反転する",
            "phase candidate joinをadmission、successor、要求採否へ変換する",
            "source／ledger/current ref digestまたはexact anchorを改変する",
            "origin/main変更後にrebaselineなしでcandidateをcurrent扱いする",
        ],
    },
    "counts": {
        "selected_legacy_assets": len(ASSET_ORDER),
        "source_anchors": sum(len(a["source_anchors"]) for a in assets),
        "current_refs": len(current_refs),
        "product_units": len(units),
        "candidate_connections": len(edges),
        "candidate_phase_joins": len(phase_joins),
        "consumer_candidates": len(consumer_candidates),
        "decision_records_found": decision_match_count,
        "failure_execution_receipts": 0,
        "legacy_consumer_refs_observed": 0,
    },
}
INV.write_text(json.dumps(inventory, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print(f"wrote {INV}: {len(assets)} selected assets, {len(current_refs)} current refs, {sum(len(a['source_anchors']) for a in assets)} source anchors")
