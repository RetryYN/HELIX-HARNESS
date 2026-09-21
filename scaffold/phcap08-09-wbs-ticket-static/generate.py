#!/usr/bin/env python3
"""PHCAP-08/09 read-only static evidence inventory generator."""
from __future__ import annotations
import hashlib
import json
import re
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
ARCHIVE = ROOT / "archive/legacy-generation-2026-09-14/root"
DISP = ROOT / "docs/governance/legacy-asset-disposition.jsonl"
PHASE = ROOT / "docs/governance/legacy-asset-phase-product-classification-bootstrap.jsonl"
DECISIONS = ROOT / "docs/governance/legacy-asset-decisions.jsonl"
PHASE_INV = ROOT / "docs/governance/phase-capability-inventory.json"
INV = HERE / "inventory.json"


def sha(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def read_jsonl(path: Path):
    return [json.loads(line) for line in path.read_text(encoding="utf-8").splitlines() if line.strip()]


def archive_path(source_path: str) -> str:
    return "archive/legacy-generation-2026-09-14/root/" + source_path


def line_text(path: Path, start: int, end: int) -> str:
    lines = path.read_text(encoding="utf-8").splitlines()
    assert 1 <= start <= end <= len(lines), (path, start, end, len(lines))
    return "\n".join(lines[start - 1 : end]) + "\n"


def make_span(path: Path, start: int, end: int, span_id: str, role: str) -> dict:
    text = line_text(path, start, end)
    return {
        "span_id": span_id,
        "start_line": start,
        "end_line": end,
        "sha256": sha(text.encode("utf-8")),
        "exact_text": text,
        "role": role,
    }


def source_spec(asset_id: str, source_path: str, spans: list[tuple[int, int, str, str]],
                failure_span_ids: list[str], consumer_span_ids: list[str],
                evidence_summary: str) -> dict:
    ap = ARCHIVE / source_path
    old = disposition[asset_id]
    ph = phase_by_id[asset_id]
    assert ap.is_file(), ap
    raw = ap.read_bytes()
    assert sha(raw) == old["source_sha256"], (asset_id, sha(raw), old["source_sha256"])
    span_rows = [make_span(ap, s, e, sid, role) for s, e, sid, role in spans]
    span_ids = {row["span_id"] for row in span_rows}
    assert set(failure_span_ids) <= span_ids
    assert set(consumer_span_ids) <= span_ids
    decision_matches = [row for row in decisions if asset_id in json.dumps(row, ensure_ascii=False)]
    assert not decision_matches, asset_id
    ledger_keys = [
        "revision", "asset_class", "reuse_exclusion_class", "product_target",
        "authority_status", "disposition", "implementation_status", "consumer_refs",
        "decision_record_ref", "executability_status", "external_effect_status",
    ]
    ledger = {key: old.get(key) for key in ledger_keys}
    return {
        "asset_id": asset_id,
        "source_path": source_path,
        "archive_path": archive_path(source_path),
        "source_sha256": old["source_sha256"],
        "source_line_count": len(ap.read_text(encoding="utf-8").splitlines()),
        "evidence_kind": ph.get("artifact_evidence_kind"),
        "implementation_evidence_state": ph.get("implementation_evidence_state"),
        "legacy_reached_layers": legacy_layers[asset_id],
        "implementation_status_scope": "historical source presence only; current implementation unknown",
        "source_spans": span_rows,
        "ledger_record": ledger,
        "phase_classification_record": ph,
        "decision_history": {
            "matching_decision_record_count": 0,
            "matching_decision_records": [],
            "status": "no_matching_append_only_decision_record",
            "interpretation": "absence remains unknown; no adoption, rejection, owner, successor or consumer closure is generated",
        },
        "failure_evidence": [
            {
                "span_id": sid,
                "kind": "historical_failure_or_negative_boundary_candidate",
                "execution_status": "not_executed",
                "finding": evidence_summary,
            }
            for sid in failure_span_ids
        ],
        "consumer_evidence": [
            {
                "span_id": sid,
                "kind": "historical_consumer_or_trace_candidate",
                "closure_status": "pending",
                "finding": evidence_summary,
            }
            for sid in consumer_span_ids
        ],
    }


def current_ref(ref_id: str, path: str, product: str, classification: str,
                layer: str, start: int, end: int, role: str) -> dict:
    p = ROOT / path
    text = line_text(p, start, end)
    return {
        "ref_id": ref_id,
        "path": path,
        "product": product,
        "classification": classification,
        "layer": layer,
        "start_line": start,
        "end_line": end,
        "sha256": sha(p.read_bytes()),
        "line_sha256": sha(text.encode("utf-8")),
        "exact_text": text,
        "role": role,
        "implementation_status": "not_evidence",
        "execution_status": "not_run",
    }


disposition_rows = read_jsonl(DISP)
disposition = {row["asset_id"]: row for row in disposition_rows}
phase_rows = read_jsonl(PHASE)
phase_by_id = {row["asset_id"]: row for row in phase_rows}
decisions = read_jsonl(DECISIONS)
phase_inventory = json.loads(PHASE_INV.read_text(encoding="utf-8"))
phase_records = {row["task_id"]: row for row in phase_inventory["records"]}

legacy_layers = {
    "LEGACY-ASSET-D27D4A1511BFD43623A9": ["L3 requirement source"],
    "LEGACY-ASSET-78D55762187C612C93C4": ["L7 implementation source"],
    "LEGACY-ASSET-DE68E15724FB6EC258AB": ["L7 plan/operation source"],
    "LEGACY-ASSET-B1B5271C3933B1F0F345": ["L6 plan source"],
    "LEGACY-ASSET-3A15E5645D2D2A59DFF5": ["L3 requirement source"],
    "LEGACY-ASSET-BE8B151A0094B754FF20": ["L10 acceptance design source"],
    "LEGACY-ASSET-06C7FAF2A0981A4778AC": ["L3 plan source"],
}

selected_specs = [
    source_spec(
        "LEGACY-ASSET-D27D4A1511BFD43623A9",
        "docs/design/helix/L3-requirements/lifecycle-stage-completion-goals.md",
        [(21, 36, "D27-01", "historical authority and V-model pair boundary"),
         (45, 68, "D27-02", "stage exit contract and required evidence"),
         (80, 84, "D27-03", "L3 requirement and failure/trace obligations"),
         (97, 107, "D27-04", "implementation trace and verification obligations")],
        ["D27-03", "D27-04"], ["D27-01", "D27-02"],
        "historical completion/failure/trace obligation; no current oracle or pass is inferred",
    ),
    source_spec(
        "LEGACY-ASSET-78D55762187C612C93C4",
        "src/state-db/current-location.ts",
        [(17, 40, "78-01", "project model and operation status vocabulary"),
         (93, 116, "78-02", "acceptance traceability data model"),
         (589, 620, "78-03", "current location, roadmap and closure snapshot data model")],
        ["78-02", "78-03"], ["78-01", "78-03"],
        "historical state/roadmap data model; source execution and current implementation remain unknown",
    ),
    source_spec(
        "LEGACY-ASSET-DE68E15724FB6EC258AB",
        "docs/governance/plan-descent-baseline.json",
        [(1, 20, "DE68-01", "historical plan baseline metadata and plan identifiers"),
         (193, 217, "DE68-02", "historical plan set tail and operational plan candidates")],
        ["DE68-02"], ["DE68-01"],
        "historical plan/roadmap candidate; no plan execution or completion is inferred",
    ),
    source_spec(
        "LEGACY-ASSET-B1B5271C3933B1F0F345",
        "docs/plans/PLAN-L6-01-function-spec.md",
        [(1, 18, "B1-01", "historical plan metadata and approval fields"),
         (43, 55, "B1-02", "function design scope with WBS textual mention"),
         (79, 84, "B1-03", "WBS checklist and explicit unfinished items")],
        ["B1-03"], ["B1-01", "B1-02"],
        "textual WBS near-equivalent candidate; exact WBS artifact identity is not established",
    ),
    source_spec(
        "LEGACY-ASSET-3A15E5645D2D2A59DFF5",
        "docs/governance/candidates/execution-ticket-requirements.md",
        [(1, 25, "3A-01", "ticket candidate metadata and authority boundary"),
         (81, 87, "3A-02", "ticket/assignment/measurement responsibility separation"),
         (121, 143, "3A-03", "ExecutionTicket and Assignment data contract"),
         (186, 206, "3A-04", "ticket functional requirements and deterministic compiler candidate"),
         (246, 286, "3A-05", "closure, projection and legacy transition candidate boundaries")],
        ["3A-01", "3A-04", "3A-05"], ["3A-02", "3A-05"],
        "historical ticket contract/failure boundary candidate; no compiler, admission or close execution is inferred",
    ),
    source_spec(
        "LEGACY-ASSET-BE8B151A0094B754FF20",
        "docs/governance/candidates/execution-ticket-acceptance.md",
        [(1, 18, "BE8-01", "acceptance candidate metadata and explicit unexecuted oracle boundary"),
         (25, 53, "BE8-02", "ticket acceptance and negative cases"),
         (125, 135, "BE8-03", "end-to-end failure, retry and later finding candidate")],
        ["BE8-01", "BE8-02", "BE8-03"], ["BE8-03"],
        "historical acceptance/test design only; all oracle execution and closure remain unknown",
    ),
    source_spec(
        "LEGACY-ASSET-06C7FAF2A0981A4778AC",
        "docs/plans/PLAN-L3-88-execution-ticket-bench-authority.md",
        [(1, 50, "06C-01", "plan candidate metadata, authority and contract boundary"),
         (68, 83, "06C-02", "generated ticket candidate artifacts and non-runtime scope"),
         (90, 108, "06C-03", "candidate-only transition and runtime non-goal")],
        ["06C-01", "06C-03"], ["06C-02"],
        "historical plan/contract candidate; explicit non-runtime scope does not prove current implementation",
    ),
]

selected_assets = {row["asset_id"]: row for row in selected_specs}

ticket_source_paths = sorted(
    row["source_path"] for row in disposition_rows
    if "ticket" in row.get("source_path", "").lower()
)
ticket_catalog = []
for path in ticket_source_paths:
    old = next(row for row in disposition_rows if row["source_path"] == path)
    ph = phase_by_id[old["asset_id"]]
    ticket_catalog.append({
        "asset_id": old["asset_id"],
        "source_path": path,
        "source_sha256": old["source_sha256"],
        "source_line_count": len((ARCHIVE / path).read_text(encoding="utf-8").splitlines()),
        "ledger_state": {key: old.get(key) for key in [
            "revision", "asset_class", "reuse_exclusion_class", "product_target", "authority_status",
            "disposition", "implementation_status", "consumer_refs", "decision_record_ref",
            "executability_status", "external_effect_status",
        ]},
        "phase_classification_record": ph,
        "source_expanded": old["asset_id"] in selected_assets,
    })

# WBS path/name/content audit is intentionally separate from textual near-equivalent candidates.
wbs_term = re.compile(r"(?i)\bWBS\b|work[- ]breakdown")
archive_files = sorted(p for p in ARCHIVE.rglob("*") if p.is_file())
archive_filename_matches = [
    str(p.relative_to(ROOT)) for p in archive_files
    if re.search(r"(?i)wbs|work[- ]breakdown", p.name)
]
archive_content_matches = []
for p in archive_files:
    try:
        text = p.read_text(encoding="utf-8")
    except UnicodeDecodeError:
        continue
    if wbs_term.search(text):
        archive_content_matches.append(str(p.relative_to(ROOT)))
legacy_wbs_paths = sorted(
    row["source_path"] for row in disposition_rows
    if "wbs" in row.get("source_path", "").lower()
)
legacy_work_breakdown_paths = sorted(
    row["source_path"] for row in disposition_rows
    if "work-breakdown" in row.get("source_path", "").lower()
)
exact_basename_matches = sorted(
    str(p.relative_to(ROOT)) for p in archive_files
    if p.name.lower() in {"wbs.md", "wbs.json", "wbs.yaml", "wbs.yml", "wbs.ts", "wbs.js"}
)
archive_hidden_component_file_count = sum(
    any(part.startswith(".") for part in p.relative_to(ARCHIVE).parts)
    for p in archive_files
)

current_refs = [
    current_ref("BOUNDARY-UNIT-CONNECTION", "docs/concept/product-boundary.md", "ALL", "boundary_current_ref", "Concept", 12, 29, "four-product unit/connection responsibility statements"),
    current_ref("BOUNDARY-IDENTITY-LOOP", "docs/concept/product-boundary.md", "ALL", "boundary_current_ref", "Concept", 32, 44, "four product entrances and unit/connection separation"),
    current_ref("HARNESS-L2", "docs/helix-harness/L2-requirements/product-requirements.md", "HELIX-HARNESS", "direct_current_ref", "L2", 1, 36, "HARNESS normative V-model and OS separation candidate"),
    current_ref("OS-L2", "docs/helix-os/L2-requirements/governance-requirements.md", "HELIX-OS", "direct_current_ref", "L2", 1, 35, "OS management/trace and no-implementation candidate"),
    current_ref("WEB-L2", "docs/helix-web/L2-requirements/product-requirements.md", "HELIX-Web", "adjacent_current_ref", "L2", 1, 31, "Web user-facing product boundary candidate"),
    current_ref("WEBOS-L2", "docs/helix-web-os/L2-requirements/service-governance-requirements.md", "HELIX-Web-OS", "adjacent_current_ref", "L2", 1, 34, "Web-OS service runtime boundary candidate"),
    current_ref("HARNESS-L11", "docs/helix-harness/L11-acceptance/product-acceptance.md", "HELIX-HARNESS", "direct_current_ref", "L11", 1, 38, "HARNESS acceptance remains draft/unexecuted"),
    current_ref("OS-L11", "docs/helix-os/L11-acceptance/governance-acceptance.md", "HELIX-OS", "direct_current_ref", "L11", 1, 42, "OS acceptance remains draft/unexecuted"),
    current_ref("WEB-L11", "docs/helix-web/L11-acceptance/product-acceptance.md", "HELIX-Web", "adjacent_current_ref", "L11", 1, 31, "Web acceptance remains draft/unexecuted"),
    current_ref("WEBOS-L11", "docs/helix-web-os/L11-acceptance/service-acceptance.md", "HELIX-Web-OS", "adjacent_current_ref", "L11", 1, 24, "Web-OS acceptance remains draft/unexecuted"),
]

# Keep phase inventory records as snapshots; validator compares them byte-for-byte as JSON values.
all_ticket_ids = [row["asset_id"] for row in ticket_catalog]
phase_joins = [
    {
        "phase_id": "PHCAP-08",
        "selected_asset_ids": [aid for aid in selected_assets if "PHCAP-08" in phase_by_id[aid].get("candidate_phase_targets", [])],
        "catalog_asset_ids": [aid for aid in selected_assets if "PHCAP-08" in phase_by_id[aid].get("candidate_phase_targets", [])],
        "interpretation": "WBS candidate joins remain semantic candidates; B1 is textual near-equivalent and is not a same-name WBS asset",
    },
    {
        "phase_id": "PHCAP-09",
        "selected_asset_ids": [aid for aid in selected_assets if "PHCAP-09" in phase_by_id[aid].get("candidate_phase_targets", [])],
        "catalog_asset_ids": [aid for aid in all_ticket_ids if "PHCAP-09" in phase_by_id[aid].get("candidate_phase_targets", [])],
        "interpretation": "all nine ticket-path assets are candidate joins; only three are expanded with source spans in this bounded candidate",
    },
]

inventory = {
    "schema": "phcap08-09-wbs-ticket-research/v1",
    "status": "research_premise_candidate",
    "authority_effect": "none",
    "meaning_change_applied": False,
    "successor_requirement_ids": [],
    "human_decision_ref": None,
    "equivalence_claim": None,
    "old_runtime_test_ci_execution": False,
    "candidate_transition": {
        "from": "legacy_reference_only",
        "to": "research_premise_candidate",
        "degradation": "wbs_same_name_zero_ticket_candidate_rederived",
        "authority_effect": "none",
        "meaning": "旧資産のsource／phase／product／failure／consumer候補を静的に保持し、WBS同名資産0とticket path候補9を現行実装・authority・受入へ昇格させない",
        "current_gap_status": "unknown",
    },
    "base": {
        "repository": "HELIX-HARNESS",
        "commit": "b27e61f079edf64eeddc43eb8095159b19730b94",
        "branch": "audit/phcap08-09-wbs-ticket-static",
        "origin": "origin/main",
        "worktree": "/home/tenni/.helix-worktrees/phcap08-09-wbs-ticket-static",
        "captured_at": "2026-09-22",
        "rebaseline_rule": "origin/mainが変化したらこの候補をcurrentと扱わず、台帳・本文digestを再取得する",
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
        "asset_record_count": len(disposition_rows),
        "phase_record_count": len(phase_rows),
        "decision_record_count": len(decisions),
        "selected_asset_count": len(selected_assets),
        "ticket_path_asset_count": len(ticket_catalog),
        "matching_decision_record_count": 0,
    },
    "tasks": [
        {"task_id": "PHCAP-08", "inventory_record": phase_records["PHCAP-08"]},
        {"task_id": "PHCAP-09", "inventory_record": phase_records["PHCAP-09"]},
    ],
    "scope": {
        "product_units": ["HELIX-HARNESS", "HELIX-OS", "HELIX-Web", "HELIX-Web-OS"],
        "selected_legacy_asset_ids": list(selected_assets),
        "ticket_path_asset_ids": all_ticket_ids,
        "bounded_source_asset_count": len(selected_assets),
        "source_span_count": sum(len(row["source_spans"]) for row in selected_specs),
        "closure_rule": "selected PHCAP-08/09 representatives and all ticket path catalog rows only; all unselected asset, failure, consumer and implementation closure remains residual",
    },
    "product_units": [
        {
            "product": "HELIX-HARNESS",
            "status": "direct_current_candidate",
            "unit_boundary": "V-model、workflow vocabulary、WBS normative shape、ticket contract候補を所有する提供product。OSのWorker/CI/log/管理運転は所有しない。",
            "phase_evidence": ["PHCAP-08", "PHCAP-09"],
            "current_refs": ["HARNESS-L2", "HARNESS-L11"],
            "legacy_asset_ids": ["LEGACY-ASSET-D27D4A1511BFD43623A9", "LEGACY-ASSET-B1B5271C3933B1F0F345", "LEGACY-ASSET-3A15E5645D2D2A59DFF5", "LEGACY-ASSET-06C7FAF2A0981A4778AC"],
            "implementation_status": "unknown",
            "acceptance_status": "draft_unexecuted",
            "authority_status": "candidate_only",
        },
        {
            "product": "HELIX-OS",
            "status": "direct_current_candidate",
            "unit_boundary": "project群のWBS ledger、progression、ticket生成・登録・統制、Worker/CI/log/改善の管理候補。HARNESSの規範語彙を独自上書きしない。",
            "phase_evidence": ["PHCAP-08", "PHCAP-09"],
            "current_refs": ["OS-L2", "OS-L11"],
            "legacy_asset_ids": ["LEGACY-ASSET-D27D4A1511BFD43623A9", "LEGACY-ASSET-78D55762187C612C93C4", "LEGACY-ASSET-DE68E15724FB6EC258AB", "LEGACY-ASSET-3A15E5645D2D2A59DFF5", "LEGACY-ASSET-BE8B151A0094B754FF20"],
            "implementation_status": "unknown",
            "acceptance_status": "draft_unexecuted",
            "authority_status": "candidate_only",
        },
        {
            "product": "HELIX-Web",
            "status": "adjacent_boundary_only",
            "unit_boundary": "利用者向けdashboard・操作・成果表示の個別product。PHCAP-08/09のdirect current evidence、ticket/WBS owner、実装・受入は未確定。",
            "phase_evidence": [],
            "current_refs": ["BOUNDARY-UNIT-CONNECTION", "BOUNDARY-IDENTITY-LOOP", "WEB-L2", "WEB-L11"],
            "legacy_asset_ids": ["LEGACY-ASSET-78D55762187C612C93C4", "LEGACY-ASSET-3A15E5645D2D2A59DFF5"],
            "implementation_status": "unknown",
            "acceptance_status": "draft_unexecuted",
            "authority_status": "adjacent_candidate_only",
        },
        {
            "product": "HELIX-Web-OS",
            "status": "adjacent_boundary_only",
            "unit_boundary": "Web展開先のtenant・job・service state・配備・監視・復旧を担う独立service runtime。WBS/ticket authorityを吸収しない。",
            "phase_evidence": [],
            "current_refs": ["BOUNDARY-UNIT-CONNECTION", "BOUNDARY-IDENTITY-LOOP", "WEBOS-L2", "WEBOS-L11"],
            "legacy_asset_ids": ["LEGACY-ASSET-D27D4A1511BFD43623A9", "LEGACY-ASSET-78D55762187C612C93C4", "LEGACY-ASSET-DE68E15724FB6EC258AB", "LEGACY-ASSET-3A15E5645D2D2A59DFF5"],
            "implementation_status": "unknown",
            "acceptance_status": "draft_unexecuted",
            "authority_status": "adjacent_candidate_only",
        },
    ],
    "candidate_connections": [
        {"connection_id": "CONN-WBS-HARNESS-OS", "from": "HELIX-HARNESS", "to": "HELIX-OS", "kind": "normative_to_management_projection", "status": "candidate", "meaning": "HARNESSのWBS normative shapeをOSのmanagement ledger/progressionへ接続する候補。単体完了から接続成立を推定しない。"},
        {"connection_id": "CONN-TICKET-HARNESS-OS", "from": "HELIX-HARNESS", "to": "HELIX-OS", "kind": "contract_to_issuer", "status": "candidate", "meaning": "HARNESSのticket vocabulary/contractとOSのissuer/registration/projectionを分離接続する候補。Issueはauthorityでない。"},
        {"connection_id": "CONN-OS-WEB-PROJECT", "from": "HELIX-OS", "to": "HELIX-Web", "kind": "project_control", "status": "adjacent_candidate", "meaning": "OSがWeb projectを管理する候補。Web固有の利用者体験とticket/WBS authorityは混同しない。"},
        {"connection_id": "CONN-WEBOS-OS-IMPROVEMENT", "from": "HELIX-Web-OS", "to": "HELIX-OS", "kind": "scoped_log_telemetry_export", "status": "adjacent_candidate", "meaning": "許可されたservice log/telemetryを改善候補へ投影する接続候補。service runtimeのwriter/state/credentialは共有しない。"},
    ],
    "candidate_phase_joins": phase_joins,
    "wbs_name_audit": {
        "search_regex": "(?i)\\bWBS\\b|work[- ]breakdown",
        "legacy_disposition_source_path_wbs_matches": legacy_wbs_paths,
        "legacy_disposition_source_path_work_breakdown_matches": legacy_work_breakdown_paths,
        "exact_basename_matches": exact_basename_matches,
        "archive_file_count": len(archive_files),
        "archive_hidden_component_file_count": archive_hidden_component_file_count,
        "archive_filename_match_count": len(archive_filename_matches),
        "archive_content_term_match_count": len(archive_content_matches),
        "archive_content_term_match_paths": archive_content_matches,
        "same_name_asset_ids": [],
        "same_name_asset_count": 0,
        "near_equivalent_candidates": [
            {
                "asset_id": "LEGACY-ASSET-B1B5271C3933B1F0F345",
                "source_path": "docs/plans/PLAN-L6-01-function-spec.md",
                "reason": "本文タイトル・scope・checklistにWBS語彙があるが、WBS専用artifact filename/pathではなく、台帳もlegacy_plan_or_work_contractである。",
                "same_name_identity": False,
                "semantic_equivalence": "unresolved",
                "source_span_ids": ["B1-01", "B1-02", "B1-03"],
            }
        ],
        "representative_near_capability_candidates": [
            {"asset_id": "LEGACY-ASSET-D27D4A1511BFD43623A9", "capability": "stage completion/requirements trace", "same_name_identity": False},
            {"asset_id": "LEGACY-ASSET-78D55762187C612C93C4", "capability": "current location/roadmap/state data model", "same_name_identity": False},
            {"asset_id": "LEGACY-ASSET-DE68E15724FB6EC258AB", "capability": "plan/roadmap baseline", "same_name_identity": False},
        ],
        "interpretation": "同名WBS assetは0。archive本文45ファイルの語彙ヒットと等価能力候補は、WBS identity・実装・authority・semantic equivalenceを証明しない。",
        "interpretation_sha256": "9f92e27c2c6e6f2b16c2feea54b92198603e31bb2621994bd3541470104619b7",
    },
    "ticket_path_audit": {
        "match_rule": "legacy-asset-disposition.source_path contains 'ticket' case-insensitive",
        "path_match_count": len(ticket_catalog),
        "path_match_asset_ids": all_ticket_ids,
        "selected_representative_asset_ids": ["LEGACY-ASSET-3A15E5645D2D2A59DFF5", "LEGACY-ASSET-BE8B151A0094B754FF20", "LEGACY-ASSET-06C7FAF2A0981A4778AC"],
        "asset_catalog": ticket_catalog,
        "interpretation": "ticket path 9件はcandidate source catalog。代表3件だけ本文exact spanを展開し、残り6件はsource path/hashとphase/ledger stateの範囲に留める。",
        "interpretation_sha256": "345e32b2408dcf5323dc2a388d80583b2a000e2a30dcc6df76f200b68593e05c",
    },
    "legacy_assets": selected_specs,
    "current_refs": current_refs,
    "failure_consumer_boundary": {
        "selected_asset_ledger_consumer_refs_observed": 0,
        "selected_asset_phase_consumer_refs_observed": 0,
        "failure_receipts_observed": 0,
        "consumer_closure_observed": 0,
        "legacy_execution_flags_all_false": True,
        "current_l2_l11_execution": "all referenced L2/L11 docs remain draft/freeze_blocking and acceptance text says unexecuted",
        "interpretation": "failure/consumer text is historical candidate evidence only; no current failure receipt, consumer closure, implementation, acceptance or pass is generated",
    },
    "unresolved": [
        "WBS語彙と旧PLAN/current-location/roadmap/stateのsemantic equivalence",
        "HARNESS WBS normative shapeとOS ledger/progression/acceptanceの正式owner・接続",
        "PHCAP-08 WBSとPHCAP-09 ticket derivationのL2採否、L1 parent束縛、L11受入",
        "ticket contractとOS issuer、GitHub projection、Issueの非authority境界の正式化",
        "四製品のunit/connection/composite分割とWeb/Web-OSの直接evidence",
        "旧sourceに記載されたimplementation/design/test presenceと現行implementation statusの差分",
        "旧failure/consumer relationから現行failure receipt・consumer closureを導出できるか",
        "正式owner、successor requirement、human decision、replacement/retirement",
    ],
    "counts": {
        "semantic_atoms": 0,
        "source_spans": sum(len(row["source_spans"]) for row in selected_specs),
        "selected_legacy_assets": len(selected_specs),
        "ticket_path_assets": len(ticket_catalog),
        "current_refs": len(current_refs),
        "product_units": 4,
        "candidate_connections": 4,
        "candidate_phase_joins": len(phase_joins),
        "wbs_same_name_assets": 0,
        "wbs_archive_filename_matches": len(archive_filename_matches),
        "wbs_archive_content_term_matches": len(archive_content_matches),
        "decision_records_found": 0,
        "legacy_consumer_refs_observed": 0,
        "failure_receipts_observed": 0,
    },
}
INV.write_text(json.dumps(inventory, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print(f"wrote {INV}: {len(selected_specs)} selected assets, {len(ticket_catalog)} ticket paths, {len(archive_content_matches)} archive text matches")
