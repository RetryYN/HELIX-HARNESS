#!/usr/bin/env python3
"""Generate a research-only cross-analysis of all 30 held phase units.

The generator reads fixed Git object bytes and immutable taxonomy bytes. It
never executes archive code, tests, runtime, hooks, adapters, or CI.
"""
from __future__ import annotations

import hashlib
import json
import subprocess
from pathlib import Path
from typing import Any

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
BASE = "5562f04da0f3205f9aa58205ec0d478419fc4f2e"
BINDING_ID = "SCF-B-0134"
SCHEMA = "phase-gap-cross-analysis-0134/v1"
TAXONOMY_COMMIT = "78e23a622bc9c40183269e22a59c566d22b93435"
TAXONOMY_PATH = "scaffold/phase-status-taxonomy-0105/units.jsonl"
TAXONOMY_SHA256 = "e6f78052a998afbd0af43769fd639486a07e04472b79823e7cddff0a662600d4"
TAXONOMY_BLOB_OID = "c55fdcc06c23d53a5b2949ccf1a239c6064e6a8f"
TAXONOMY_INVENTORY_PATH = "scaffold/phase-status-taxonomy-0105/inventory.json"
TAXONOMY_INVENTORY_SHA256 = "89ddd6361743d37e809b2e5cd7aba217886770b5688787822426f6aa3bd123d2"
TAXONOMY_INVENTORY_BLOB_OID = "e3430907c65b3c74cf3f799875ca0f1c34fdc35e"
TAXONOMY_SNAPSHOT = "scaffold/phase-gap-cross-analysis-0134/phase-status-taxonomy-0105.units.jsonl"
IR = "archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json"
RDP = "docs/governance/requirement-disposition-review-program.md"
RDP_OVERLAP = "docs/governance/requirement-overlap-review-program.md"
RDP_SUBSTITUTABILITY = "docs/governance/requirement-technical-substitutability-review-program.md"
RDP_SCREEN = "docs/governance/audits/source-rebaseline/l2d-s1-01-input-holding-screen.jsonl"
PHCAP = "docs/governance/phase-capability-inventory.json"
PHCAP20_README = "scaffold/phcap20-memory-research/README.md"
PHCAP20_INVENTORY = "scaffold/phcap20-memory-research/inventory.json"
BOUNDARY = "docs/concept/product-boundary.md"
DECISION = "docs/governance/decisions/concept-v4.1-and-four-l1-approval-2026-09-17.md"
L1_PATHS = [
    "docs/helix-harness/L1-planning/product-intent.md",
    "docs/helix-os/L1-planning/system-intent.md",
    "docs/helix-web/L1-planning/product-intent.md",
    "docs/helix-web-os/L1-planning/system-intent.md",
]
WAVE_PATHS = [
    *(f"docs/governance/legacy-requirement-direct-semantic-review-wave{i}.jsonl" for i in range(1, 37)),
    *(f"scaffold/legacy-semantic-review-wave{i}/legacy-requirement-direct-semantic-review-wave{i}.jsonl" for i in range(37, 51)),
]
CONTEXT_PATHS = [RDP, RDP_OVERLAP, RDP_SUBSTITUTABILITY, RDP_SCREEN, PHCAP, PHCAP20_README, PHCAP20_INVENTORY, BOUNDARY, DECISION, *L1_PATHS]
BASE_INPUT_PATHS = [IR, *WAVE_PATHS, *CONTEXT_PATHS]
PHCAP_IDS = [f"PHCAP-{n:02d}" for n in range(1, 21)]
PHCAP_16_20 = [f"PHCAP-{n:02d}" for n in range(16, 21)]

TARGET_UNIT_IDS = [
    "IRUNIT-HIL-BR-14-HELIX-OS", "IRUNIT-HIL-BR-24-HELIX-OS",
    "IRUNIT-HIL-FR-17-HELIX-OS", "IRUNIT-HIL-FR-18-HELIX-OS",
    "IRUNIT-HIL-FR-19-HELIX-HARNESS", "IRUNIT-HIL-FR-20-HELIX-OS",
    "IRUNIT-HIL-FR-21-HELIX-OS", "IRUNIT-HIL-FR-23-HELIX-OS",
    "IRUNIT-HIL-FR-24-HELIX-OS", "IRUNIT-HIL-FR-31-HELIX-OS",
    "IRUNIT-HIL-FR-33-HELIX-HARNESS", "IRUNIT-HIL-FR-33-HELIX-OS",
    "IRUNIT-HIL-FR-46-HELIX-OS", "IRUNIT-HIL-FR-52-HELIX-OS",
    "IRUNIT-HIL-FR-53-HELIX-OS", "IRUNIT-HIL-NFR-02-HELIX-HARNESS",
    "IRUNIT-HIL-NFR-03-HELIX-HARNESS", "IRUNIT-HIL-NFR-05-HELIX-OS",
    "IRUNIT-HIL-NFR-06-HELIX-OS", "IRUNIT-HIL-NFR-07-HELIX-OS",
    "IRUNIT-HIL-NFR-11-HELIX-OS", "IRUNIT-HIL-NFR-12-HELIX-OS",
    "IRUNIT-HIL-NFR-23-HELIX-OS", "IRUNIT-HIL-NFR-30-HELIX-OS",
    "IRUNIT-HIL-NFR-31-HELIX-OS", "IRUNIT-HIL-NFR-32-HELIX-OS",
    "IRUNIT-HIL-TR-04-HELIX-HARNESS", "IRUNIT-HIL-TR-04-HELIX-OS",
    "IRUNIT-HIL-TR-07-HELIX-OS", "IRUNIT-HIL-TR-08-HELIX-HARNESS",
]

REASON_CLASS_DEFS = {
    "SOURCE_AUTHORITY_CUSTODY_GAP": {
        "description": "原文のsource custody／要求定義authorityが閉じず、phase責務の主語をcurrent contractへ接続できない",
        "next_action": "RDP source atomization、current contract、authority receipt、product／unit boundary decisionを揃える",
    },
    "PHCAP_BOUNDARY_GAP": {
        "description": "prototype／re-entry／ingestion等のphase境界が競合し、PHCAP直接責務を原文だけで決められない",
        "next_action": "候補phaseと全競合PHCAPのcurrent boundary contract、phase reviewer判断、consumer closureを揃える",
    },
    "CROSS_PHASE_COMPETITION": {
        "description": "横断制約だがPHCAP-01〜15の具体能力との意味接続候補があり、phase非適用を導けない",
        "next_action": "shared capability／connection／phaseを全PHCAP境界で比較し、product／phase authorityをhuman decisionする",
    },
    "CROSS_PHASE_UNRESOLVED": {
        "description": "横断制約として読めるが、PHCAP-16〜20を含む全20境界の除外も直接責務も未立証",
        "next_action": "全PHCAP-01〜20の直接責務・除外sourceを確認し、phase非適用を保留したままhuman reviewへ送る",
    },
}

MINIMUM_CONDITIONS = [
    "current source contractが責務主語、対象product、input/output、acceptance、failure/recovery、revision/digestを固定する",
    "PHCAP-01〜20の競合境界を直接照合し、candidate／connection／shared capability／非適用の理由を原文anchorで分離する",
    "product ownerとphase authority reviewerがunit／connection／composite、target product、L2/L11 successorを明示決定する",
    "名前付きcurrent consumerのreceipt/read-after、failure/recovery、stale/re-entry、rollback/retention境界でclosureする",
]

# Each entry is deliberately independent of #2082/#2084. The source anchor,
# taxonomy status, candidate phases, and Wave edges are re-derived below.
PLANS = {
    "IRUNIT-HIL-BR-14-HELIX-OS": ("SOURCE_AUTHORITY_CUSTODY_GAP", ["ref authority receipt for advertised heads/tags/pull refs and exact source custody", "atomic behavior decomposition coverage from source to requirement/design/test/Gate"], ["HELIX-OS product owner decides unit versus connection/composite and authority owner"], ["named current atomization/design/test/Gate consumers with read-after receipt and successor"]),
    "IRUNIT-HIL-BR-24-HELIX-OS": ("SOURCE_AUTHORITY_CUSTODY_GAP", ["current requirement-definition contract mapped to PHCAP-02 through PHCAP-07", "authority/classification/scope/acceptance/template/revision ledger closure"], ["HELIX-OS product and requirement authority decide target unit and successor"], ["named requirement/design/acceptance consumers with revision closure and read-after"]),
    "IRUNIT-HIL-FR-17-HELIX-OS": ("PHCAP_BOUNDARY_GAP", ["current screen applicability contract with prototype_required/not_applicable receipt", "skip reason, decider, input digest, and re-entry trigger contract"], ["phase reviewer decides screen gate versus continuation/re-entry responsibility"], ["consumer of skip/prototype receipt and re-entry task with closure/read-after"]),
    "IRUNIT-HIL-FR-18-HELIX-OS": ("PHCAP_BOUNDARY_GAP", ["Prototype Builder artifact/state replay contract with screen ID, operation, transition, fixture, and mock boundary", "direct comparison of PHCAP-01/06 and PHCAP-16 through PHCAP-20"], ["phase/product reviewer decides HARNESS design versus OS operation/state ownership"], ["named artifact runner and requirement/prototype consumer with replay receipt and recovery"]),
    "IRUNIT-HIL-FR-19-HELIX-HARNESS": ("PHCAP_BOUNDARY_GAP", ["walkthrough receipt and iteration checkpoint contract", "requirements delta/no_delta to L1 reflection and prototype recreation contract"], ["HARNESS authority decides walkthrough responsibility and L1 reflection owner"], ["named L1/requirements consumer with delta acceptance, read-after, and re-creation closure"]),
    "IRUNIT-HIL-FR-20-HELIX-OS": ("PHCAP_BOUNDARY_GAP", ["Screen Gate current receipt contract for artifact, walkthrough, requirement reflection, prototype agreement, or skip", "L1 freeze/L3 fail-close authority mapped to PHCAP-04/05/07/11 and PHCAP-16 through PHCAP-20"], ["phase authority decides gate versus acceptance/verification/operation responsibility"], ["named L1 freeze/L3 consumer with fail-close, re-entry, and read-after receipt"]),
    "IRUNIT-HIL-FR-21-HELIX-OS": ("CROSS_PHASE_COMPETITION", ["immutable source snapshot and Git authority receipt contract", "retention/stale invalidation contract compared with PHCAP-11 and PHCAP-16 through PHCAP-20"], ["OS owner and phase reviewer decide custody versus CI/operations/memory responsibility"], ["named snapshot/atomization consumer with stale invalidation and read-after closure"]),
    "IRUNIT-HIL-FR-23-HELIX-OS": ("CROSS_PHASE_COMPETITION", ["connector registry current contract for schema, credential reference, policy, sync, owner, and enable receipt", "design/operations/incident boundary compared with PHCAP-06 and PHCAP-16 through PHCAP-20"], ["OS/product owner decides connector design versus operation/security responsibility"], ["named connector consumer with enable/disable, failure, recovery, and closure receipt"]),
    "IRUNIT-HIL-FR-24-HELIX-OS": ("PHCAP_BOUNDARY_GAP", ["ingestion data contract for snapshot, watermark, provenance, freshness, tombstone, and schema drift", "retention/purge/continuation boundary compared with PHCAP-02/10/16 through PHCAP-20"], ["phase reviewer decides requirement registration versus worker/data operation and memory boundary"], ["named read projection consumer with mapping, drift, rollback, and read-after closure"]),
    "IRUNIT-HIL-FR-31-HELIX-OS": ("PHCAP_BOUNDARY_GAP", ["re-entry current contract for stale edge, affected layer, re-approval, and re-freeze receipt", "direct boundary comparison with PHCAP-16 through PHCAP-20 continuation responsibility"], ["phase/product authority decides redesign re-entry versus continuation and assigns successor"], ["named stale/re-freeze consumer with pre-merge rejection and read-after closure"]),
    "IRUNIT-HIL-FR-33-HELIX-HARNESS": ("CROSS_PHASE_COMPETITION", ["active-surface dependency coverage contract and classified ledger", "CI/release/design boundary compared with PHCAP-04/11 and PHCAP-16 through PHCAP-20"], ["HARNESS owner decides normative coverage contract versus OS execution responsibility"], ["named dependency ledger/CI consumer with allowlist, failure, and read-after closure"]),
    "IRUNIT-HIL-FR-33-HELIX-OS": ("CROSS_PHASE_UNRESOLVED", ["active Bun count and OS CI/release consumer contract", "all PHCAP-01 through PHCAP-20 boundary comparison"], ["OS/HARNESS owner boundary and phase reviewer decision"], ["named CI/release consumer with classified ledger closure"]),
    "IRUNIT-HIL-FR-46-HELIX-OS": ("CROSS_PHASE_COMPETITION", ["layer ledger catalog contract for node/edge/authority/gate/revision", "verification and source custody comparison with PHCAP-11 and PHCAP-16 through PHCAP-20"], ["OS owner and phase reviewer decide ledger registry versus verification/operation responsibility"], ["named ledger consumer with coverage receipt, revision read-after, and failure closure"]),
    "IRUNIT-HIL-FR-52-HELIX-OS": ("CROSS_PHASE_COMPETITION", ["canonicalization transaction contract with CAS, atomic writes, rollback, and conflict receipt", "canonicalization/memory boundary compared with PHCAP-11 and PHCAP-16 through PHCAP-20"], ["write authority owner decides transaction versus memory/continuation responsibility"], ["named canonical consumer with before/after revision, rollback, and read-after closure"]),
    "IRUNIT-HIL-FR-53-HELIX-OS": ("CROSS_PHASE_COMPETITION", ["immutable asset identity/revision contract for rename, split, merge, supersede, and semantic diff", "design identity versus PHCAP-06 and retention/history versus PHCAP-16 through PHCAP-20"], ["authority/oracle owner decides design identity versus retention/history responsibility"], ["named asset consumer with split/merge disposition, oracle, rollback, and closure"]),
    "IRUNIT-HIL-NFR-02-HELIX-HARNESS": ("CROSS_PHASE_COMPETITION", ["role separation contract for worker, verifier, and knowledge promoter", "memory promotion authority compared with PHCAP-04 and PHCAP-16 through PHCAP-20"], ["HARNESS/OS owner decides role and knowledge-promotion authority"], ["named verifier/promoter consumer with independent receipt and closure"]),
    "IRUNIT-HIL-NFR-03-HELIX-HARNESS": ("CROSS_PHASE_COMPETITION", ["reverse processing and no phase-skip contract with checkpoint/uncompleted state", "workflow/design boundary compared with PHCAP-04/06 and PHCAP-16 through PHCAP-20"], ["HARNESS owner and phase reviewer decide workflow obligation versus operation/state responsibility"], ["named checkpoint consumer with unfinished obligation, re-entry, and read-after closure"]),
    "IRUNIT-HIL-NFR-05-HELIX-OS": ("CROSS_PHASE_UNRESOLVED", ["untrusted input/intake security contract separating command, metadata, and evidence", "all PHCAP-01 through PHCAP-20 boundary comparison"], ["security/product owner decides intake boundary and phase relation"], ["named intake consumer with quarantine, rejection, and closure receipt"]),
    "IRUNIT-HIL-NFR-06-HELIX-OS": ("CROSS_PHASE_COMPETITION", ["action-binding approval contract for auth, PII, secret, license, migration, destructive and external actions", "security boundary compared with PHCAP-03/11/15 and PHCAP-16 through PHCAP-20"], ["authority owner decides approval responsibility and phase/product route"], ["named action consumer with approval, denial, rollback, and read-after closure"]),
    "IRUNIT-HIL-NFR-07-HELIX-OS": ("CROSS_PHASE_UNRESOLVED", ["scope gate contract for complexity, public surface, operation debt, and minimum proof", "all PHCAP-01 through PHCAP-20 boundary comparison"], ["scope/phase reviewer decides gate responsibility and target product"], ["named scope/oracle consumer with rejection reason, re-entry, and closure"]),
    "IRUNIT-HIL-NFR-11-HELIX-OS": ("CROSS_PHASE_UNRESOLVED", ["screen prototype/skip evidence contract and overlap with FR-17/FR-20", "all PHCAP-01 through PHCAP-20 boundary comparison"], ["product and phase reviewer decide UI applicability responsibility"], ["named prototype/skip consumer with receipt and read-after closure"]),
    "IRUNIT-HIL-NFR-12-HELIX-OS": ("CROSS_PHASE_UNRESOLVED", ["source coverage custody contract with path/entry, digest, and extraction time", "retention and source authority comparison across all PHCAP-01 through PHCAP-20"], ["source authority owner decides custody versus memory/retention responsibility"], ["named coverage consumer with stale detection and read-after closure"]),
    "IRUNIT-HIL-NFR-23-HELIX-OS": ("CROSS_PHASE_UNRESOLVED", ["acyclic scope derivation graph and authoritative-root contract", "all PHCAP-01 through PHCAP-20 boundary comparison"], ["graph authority owner decides structural constraint versus phase responsibility"], ["named graph consumer with cycle rejection, recovery, and closure"]),
    "IRUNIT-HIL-NFR-30-HELIX-OS": ("PHCAP_BOUNDARY_GAP", ["authoring/canonicalization current contract defining reversible policy and true authority escalation", "direct comparison of canonicalization, memory, continuation, and retention boundaries"], ["authority reviewer decides escalation and canonicalization phase responsibility"], ["named authoring/canonical consumer with receipt, rollback, and read-after closure"]),
    "IRUNIT-HIL-NFR-31-HELIX-OS": ("CROSS_PHASE_UNRESOLVED", ["all-or-nothing authoring/ledger/trace/projection/receipt contract with fault outcome", "atomicity and memory/continuation boundary comparison across all PHCAP"], ["write authority owner decides atomic transaction versus phase responsibility"], ["named projection consumer with fault-injection receipt, rollback, and closure"]),
    "IRUNIT-HIL-NFR-32-HELIX-OS": ("CROSS_PHASE_UNRESOLVED", ["semantic change contract requiring authority, impact, pair, oracle, rollback, and stale propagation", "revision/rollback and retention boundary comparison across all PHCAP"], ["authority/oracle owner decides change management versus retention responsibility"], ["named downstream consumer with stale propagation, rollback, and read-after closure"]),
    "IRUNIT-HIL-TR-04-HELIX-HARNESS": ("CROSS_PHASE_UNRESOLVED", ["portable/compatibility profile contract for Linux, macOS, and Windows", "all PHCAP-01 through PHCAP-20 boundary comparison"], ["HARNESS owner decides portability contract and product scope"], ["named portability consumer with profile result, failure, and closure"]),
    "IRUNIT-HIL-TR-04-HELIX-OS": ("CROSS_PHASE_UNRESOLVED", ["OS runtime portability and compatibility profile contract", "all PHCAP-01 through PHCAP-20 boundary comparison"], ["OS owner decides runtime environment responsibility and authority"], ["named runtime consumer with profile result, recovery, and closure"]),
    "IRUNIT-HIL-TR-07-HELIX-OS": ("PHCAP_BOUNDARY_GAP", ["L4 write-authority decision record and current state/continuation contract", "SQLite event/projection versus PHCAP-16 through PHCAP-20 boundary comparison"], ["L4 authority reviewer decides Node write authority, Python read model, and continuation owner"], ["named event/projection consumer with restart, recovery, and read-after closure"]),
    "IRUNIT-HIL-TR-08-HELIX-HARNESS": ("CROSS_PHASE_COMPETITION", ["versioned Node/Python JSON Lines transport contract and envelope receipt", "transport versus worker/CI/review comparison with PHCAP-10/11/12 and PHCAP-16 through PHCAP-20"], ["HARNESS owner decides normative transport contract versus OS execution responsibility"], ["named IPC consumer with sequence/deadline failure, retry, and closure"]),
}

NEGATIVE_CASE_CODES = [
    "E_BUNDLE", "E_SCHEMA", "E_BINDING", "E_BASE_COMMIT", "E_BASE_NOT_ANCESTOR",
    "E_TAXONOMY_NOT_ANCESTOR", "E_TAXONOMY_BLOB", "E_SOURCE_INPUT_DIGEST", "E_SOURCE_ANCHOR",
    "E_TARGET_SET", "E_WAVE_EDGE_COVERAGE", "E_ASSET_EVIDENCE", "E_TAXONOMY_COVERAGE",
    "E_TAXONOMY_STATUS", "E_MATRIX_RULE", "E_INVENTORY_DECLARATION", "E_REASON_CLASS",
    "E_ANALYSIS_EVIDENCE", "E_CONSUMER_EVIDENCE", "E_PHASE_AUTHORITY_SEPARATION",
    "E_PRODUCT_AUTHORITY_SEPARATION", "E_AUTHORITY_BOUNDARY", "E_MINIMUM_CONDITIONS",
]


def run_git(*args: str, text: bool = False) -> bytes | str:
    result = subprocess.run(["git", *args], cwd=ROOT, stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=False, text=text)
    if result.returncode != 0:
        raise ValueError(result.stderr if text else result.stderr.decode("utf-8", errors="replace"))
    return result.stdout


def base_bytes(path: str) -> bytes:
    return run_git("show", f"{BASE}:{path}")  # type: ignore[return-value]


def immutable_bytes(path: str) -> bytes:
    return run_git("show", f"{TAXONOMY_COMMIT}:{path}")  # type: ignore[return-value]


def digest(raw: bytes, prefix: bool = True) -> str:
    value = hashlib.sha256(raw).hexdigest()
    return f"sha256:{value}" if prefix else value


def base_json(path: str) -> Any:
    return json.loads(base_bytes(path).decode("utf-8"))


def base_jsonl(path: str) -> list[dict[str, Any]]:
    return [json.loads(line) for line in base_bytes(path).decode("utf-8").splitlines() if line.strip()]


def taxonomy_rows() -> list[dict[str, Any]]:
    raw = immutable_bytes(TAXONOMY_PATH)
    if digest(raw, prefix=False) != TAXONOMY_SHA256:
        raise ValueError("taxonomy source digest mismatch")
    blob = run_git("rev-parse", f"{TAXONOMY_COMMIT}:{TAXONOMY_PATH}", text=True).strip()
    if blob != TAXONOMY_BLOB_OID:
        raise ValueError("taxonomy source blob mismatch")
    rows = [json.loads(line) for line in raw.decode("utf-8").splitlines() if line.strip()]
    selected = [row for row in rows if row.get("unit_candidate_id") in TARGET_UNIT_IDS]
    if [row.get("unit_candidate_id") for row in selected] != TARGET_UNIT_IDS or len(selected) != 30:
        raise ValueError("taxonomy target set/order mismatch")
    return selected


def edge_rows(rows: list[dict[str, Any]]) -> list[dict[str, Any]]:
    wanted = [ref for row in rows for ref in row.get("wave_review", {}).get("edge_refs", [])]
    found: dict[str, dict[str, Any]] = {}
    for path in WAVE_PATHS:
        for edge in base_jsonl(path):
            if edge.get("review_id") in wanted:
                found[edge["review_id"]] = edge
    if set(found) != set(wanted) or len(found) != 66:
        raise ValueError("Wave edge set mismatch")
    return [found[ref] for ref in wanted]


def edge_summary(edge: dict[str, Any]) -> dict[str, Any]:
    return {key: edge.get(key) for key in (
        "review_id", "asset_id", "source_requirement_id", "source_path", "source_sha256",
        "source_statement_semantic_digest", "candidate_phase_targets", "phase_candidates",
        "candidate_product_targets", "consumer_closure_status", "consumer_evidence_count",
        "current_requirement_implementation_status", "legacy_execution_status", "legacy_implementation_status",
        "semantic_link_status", "semantic_relation", "failure_finding", "coverage_constraint",
    )}


def source_anchor(row: dict[str, Any], ir: dict[str, Any]) -> dict[str, Any]:
    req = row["requirement_id"]
    anchor = row["source_anchor"]
    if ir[req]["statement"]["text"] != anchor["statement_text"]:
        raise ValueError(f"source statement mismatch: {req}")
    return {
        "archive_path": anchor["archive_path"], "json_pointer": anchor["json_pointer"],
        "line_start": anchor["line_start"], "line_end": anchor["line_end"],
        "source_text_spans": anchor.get("source_text_spans", []),
        "statement_text": anchor["statement_text"],
        "statement_text_sha256": digest(anchor["statement_text"].encode("utf-8")),
        "statement_semantic_digest": anchor["statement_semantic_digest"],
        "static_only": True,
    }


def plans_inventory() -> dict[str, Any]:
    classes: dict[str, dict[str, Any]] = {}
    for unit_id in TARGET_UNIT_IDS:
        reason = PLANS[unit_id][0]
        classes.setdefault(reason, {**REASON_CLASS_DEFS[reason], "unit_ids": []})["unit_ids"].append(unit_id)
    for value in classes.values():
        value["unit_ids"] = list(value["unit_ids"])
        value["unit_count"] = len(value["unit_ids"])
    return classes


def build_bundle() -> tuple[dict[str, Any], list[dict[str, Any]]]:
    rows = taxonomy_rows()
    ir = base_json(IR)
    edges = edge_rows(rows)
    edge_by_id = {edge["review_id"]: edge for edge in edges}
    edges_by_unit = {row["unit_candidate_id"]: [edge_by_id[ref] for ref in row["wave_review"]["edge_refs"]] for row in rows}
    asset_ids = sorted({edge["asset_id"] for edge in edges})
    if len(asset_ids) != 38:
        raise ValueError("legacy asset count mismatch")
    analyses: list[dict[str, Any]] = []
    for row in rows:
        unit_id = row["unit_candidate_id"]
        if unit_id not in PLANS:
            raise ValueError(f"missing fixed plan: {unit_id}")
        reason, source_evidence, human_decision, consumer_evidence = PLANS[unit_id]
        taxonomy = row["taxonomy"]
        phase_context = row["phase_context"]
        if taxonomy["formal_phase_candidate"] is not None or taxonomy["direct_phase_candidate_count"] != 0:
            raise ValueError(f"taxonomy direct phase expectation changed: {unit_id}")
        analyses.append({
            "schema": SCHEMA + "/unit", "unit_candidate_id": unit_id,
            "requirement_id": row["requirement_id"], "crosswalk_id": row["crosswalk_id"],
            "product_scope_candidate": row["product_scope_candidate"],
            "source_anchor": source_anchor(row, ir),
            "taxonomy": {
                "status": taxonomy["status"], "matrix_rule_id": taxonomy["matrix_rule_id"],
                "candidate_statement": taxonomy["candidate_statement"],
                "judgment_waiting": taxonomy["judgment_waiting"],
                "authority_phase_status": taxonomy["authority_phase_status"],
                "formal_phase_candidate": taxonomy["formal_phase_candidate"],
                "direct_phase_candidate_count": taxonomy["direct_phase_candidate_count"],
                "authority_boundary": row["authority_boundary"],
            },
            "candidate_phase_targets": phase_context["observed_asset_candidate_phases"],
            "wave_edge_ids": row["wave_review"]["edge_refs"],
            "wave_edges": [edge_summary(edge) for edge in edges_by_unit[unit_id]],
            "legacy_asset_ids": sorted({edge["asset_id"] for edge in edges_by_unit[unit_id]}),
            "reason_class": reason,
            "reason_description": REASON_CLASS_DEFS[reason]["description"],
            "required_source_evidence": source_evidence,
            "required_human_decision": human_decision,
            "required_consumer_evidence": consumer_evidence,
            "next_action": REASON_CLASS_DEFS[reason]["next_action"],
            "product_review": {
                "candidate_products": row["product_context"]["candidate_products"],
                "authority_product": None, "status": "candidate_scope_only",
            },
            "phase_result": {
                "direct_phase_evidence_count": 0, "formal_phase_candidate": None,
                "phase_non_applicability": {"status": "not_proven", "excluded_phase_ids": [], "pending_phase_ids": PHCAP_IDS},
            },
            "authority_boundary": {
                "formal_crosswalk_modified": False, "formal_phase_authority_modified": False,
                "formal_product_authority_modified": False, "implementation_claim_generated": False,
                "unimplemented_claim_generated": False, "degradation_claim_generated": False,
                "failure_receipt_generated": False, "consumer_closure_generated": False,
                "successor_assigned": False, "old_archive_executed": False,
            },
            "static_only": True,
        })
    wave_scan_rows = sum(len(base_jsonl(path)) for path in WAVE_PATHS)
    status_counts: dict[str, int] = {}
    rule_counts: dict[str, int] = {}
    for row in rows:
        status = row["taxonomy"]["status"]
        rule = row["taxonomy"]["matrix_rule_id"]
        status_counts[status] = status_counts.get(status, 0) + 1
        rule_counts[rule] = rule_counts.get(rule, 0) + 1
    inventory = {
        "schema": SCHEMA, "binding_id": BINDING_ID, "status": "research_only_scaffold_candidate",
        "authority_effect": "none", "new_build": False,
        "base": {"repository": "HELIX-HARNESS", "commit": BASE, "branch": "main", "required_ancestor": BASE},
        "taxonomy_snapshot": {
            "commit": TAXONOMY_COMMIT, "path": TAXONOMY_PATH, "sha256": TAXONOMY_SHA256,
            "blob_oid": TAXONOMY_BLOB_OID, "inventory_path": TAXONOMY_INVENTORY_PATH,
            "inventory_sha256": TAXONOMY_INVENTORY_SHA256, "inventory_blob_oid": TAXONOMY_INVENTORY_BLOB_OID,
            "snapshot_artifact": TAXONOMY_SNAPSHOT,
        },
        "scope": {
            "unit_count": 30, "target_unit_ids": TARGET_UNIT_IDS,
            "product_counts": {"HELIX-OS": 24, "HELIX-HARNESS": 6},
            "taxonomy_status_counts": status_counts, "matrix_rule_counts": rule_counts,
            "wave_scan_file_count": 50, "wave_scan_row_count": wave_scan_rows,
            "semantic_review_edge_count": len(edges), "unique_old_asset_count": len(asset_ids),
            "direct_phase_evidence_count": 0, "formal_phase_candidate_count": 0,
            "phase_nonapplicability_proven": 0, "excluded_phase_count": 0,
            "pending_all_20_count": 30,
            "full_phcap_boundary_review": {"phase_ids": PHCAP_IDS, "status": "pending_all_20", "non_applicability_proven": False},
        },
        "reason_classes": plans_inventory(),
        "formal_judgment_minimum_conditions": MINIMUM_CONDITIONS,
        "input_snapshot": [{"path": path, "sha256": digest(base_bytes(path), prefix=False), "source": "fixed_BASE"} for path in BASE_INPUT_PATHS],
        "oracle_dependencies": [],
        "analysis_path": "analysis.jsonl",
        "unit_ids": TARGET_UNIT_IDS,
        "negative_case_codes": NEGATIVE_CASE_CODES,
        "authority_boundary": {
            "formal_crosswalk_modified": False, "formal_phase_authority_modified": False,
            "formal_product_authority_modified": False, "implementation_claim_generated": False,
            "unimplemented_claim_generated": False, "degradation_claim_generated": False,
            "failure_receipt_generated": False, "consumer_closure_generated": False,
            "successor_assigned": False, "old_archive_executed": False,
        },
    }
    return inventory, analyses


def write_bundle(inventory: dict[str, Any], analyses: list[dict[str, Any]]) -> None:
    (HERE / "inventory.json").write_text(json.dumps(inventory, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    with (HERE / "analysis.jsonl").open("w", encoding="utf-8") as handle:
        for row in analyses:
            handle.write(json.dumps(row, ensure_ascii=False, sort_keys=True, separators=(",", ":")) + "\n")
    (HERE / "phase-status-taxonomy-0105.units.jsonl").write_bytes(immutable_bytes(TAXONOMY_PATH))


if __name__ == "__main__":
    write_bundle(*build_bundle())
    print("SCF-B-0134 bundle generated: 30 units, 66 edges, 38 assets")
