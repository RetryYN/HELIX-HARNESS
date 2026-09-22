#!/usr/bin/env python3
"""Generate the static outside67 028/039/040/042/044 research bundle."""

from __future__ import annotations

import difflib
import hashlib
import json
import subprocess
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
OUT = Path(__file__).resolve().parent
WORKTREE_PROVENANCE = "/home/tenni/HELIX-HARNESS-outside-residual-next5"
PRE = "2d4991042be55268bac30a8bbcdac45b3865030a"
ARCH = "064280b5c1c5c98f949e6e3be5ef87cbe4a4b658"
HISTORICAL = "3df81ad27157c471e004083783f37a5860eaa2ee"
HEAD = "a8f1ab1c7dce529cfb5293e1ddf4a23140877f22"
PREVIOUS_HEAD = "44814977d9d9bf457b6be2184f38f25d4f9071ad"
HOLDING = "docs/governance/pre-isolation-outside-holding-67-source-holding.jsonl"
REGISTER = "docs/governance/management-provisional-requirement-register.jsonl"
LEDGERS = [
    "docs/governance/legacy-asset-disposition.jsonl",
    "docs/governance/legacy-asset-decisions.jsonl",
    "docs/governance/legacy-asset-copy-read-after.jsonl",
    "docs/governance/legacy-asset-decision-log.md",
    "docs/governance/legacy-asset-phase-product-classification-bootstrap.jsonl",
    "docs/governance/legacy-requirement-implementation-crosswalk-bootstrap.jsonl",
    "docs/governance/legacy-ir-product-unit-decomposition-bootstrap.jsonl",
]
FOUR = ["HELIX-HARNESS", "HELIX-OS", "HELIX-Web", "HELIX-Web-OS"]
IDS = [
    "OUTSIDE67-PATH-028",
    "OUTSIDE67-PATH-039",
    "OUTSIDE67-PATH-040",
    "OUTSIDE67-PATH-042",
    "OUTSIDE67-PATH-044",
]
SOURCE_PATHS = {
    "OUTSIDE67-PATH-028": "docs/governance/audits/l2-requirements/l2-freeze-ir-proposal/system_tests.jsonpatch",
    "OUTSIDE67-PATH-039": "docs/governance/audits/l2-requirements/new-generation-investment-candidate-crosswalk.md",
    "OUTSIDE67-PATH-040": "docs/governance/audits/l2-requirements/new-generation-license-distribution-source-crosswalk.md",
    "OUTSIDE67-PATH-042": "docs/governance/audits/l2-requirements/new-generation-management-state-projection-crosswalk.md",
    "OUTSIDE67-PATH-044": "docs/governance/audits/l2-requirements/new-generation-refactoring-trigger-source-crosswalk.md",
}
COUNTERPARTS = {
    "OUTSIDE67-PATH-028": "docs/governance/audits/source-rebaseline/l2-freeze-ir-proposal/system_tests.jsonpatch",
    "OUTSIDE67-PATH-039": "docs/governance/audits/source-rebaseline/new-generation-investment-candidate-crosswalk.md",
    "OUTSIDE67-PATH-040": "docs/governance/audits/source-rebaseline/new-generation-license-distribution-source-crosswalk.md",
    "OUTSIDE67-PATH-042": "docs/governance/audits/source-rebaseline/new-generation-management-state-projection-crosswalk.md",
    "OUTSIDE67-PATH-044": "docs/governance/audits/source-rebaseline/new-generation-refactoring-trigger-source-crosswalk.md",
}
ANCHOR_LINES = {
    "OUTSIDE67-PATH-028": [3, 8, 14, 18, 34],
    "OUTSIDE67-PATH-039": [3, 7, 11, 17, 28],
    "OUTSIDE67-PATH-040": [3, 7, 11, 18, 27],
    "OUTSIDE67-PATH-042": [3, 7, 13, 21, 26],
    "OUTSIDE67-PATH-044": [3, 7, 11, 18, 29],
}
KINDS = {
    "OUTSIDE67-PATH-028": [
        "system_tests_patch_test_boundary",
        "system_tests_patch_digest_boundary",
        "system_tests_patch_statement_boundary",
        "system_tests_patch_replace_boundary",
        "system_tests_patch_freeze_boundary",
    ],
    "OUTSIDE67-PATH-039": [
        "investment_crosswalk_date_boundary",
        "investment_crosswalk_scope_boundary",
        "investment_crosswalk_classification_boundary",
        "investment_crosswalk_exclusion_boundary",
        "investment_crosswalk_reapproval_boundary",
    ],
    "OUTSIDE67-PATH-040": [
        "license_crosswalk_date_boundary",
        "license_crosswalk_scope_boundary",
        "license_crosswalk_contract_boundary",
        "license_crosswalk_rights_boundary",
        "license_crosswalk_distribution_boundary",
    ],
    "OUTSIDE67-PATH-042": [
        "projection_crosswalk_date_boundary",
        "projection_crosswalk_source_boundary",
        "projection_crosswalk_acceptance_boundary",
        "projection_crosswalk_state_boundary",
        "projection_crosswalk_rebuild_boundary",
    ],
    "OUTSIDE67-PATH-044": [
        "refactoring_crosswalk_date_boundary",
        "refactoring_crosswalk_source_boundary",
        "refactoring_crosswalk_l1_boundary",
        "refactoring_crosswalk_trigger_boundary",
        "refactoring_crosswalk_oracle_boundary",
    ],
}


def sha(value: bytes | str | Path) -> str:
    if isinstance(value, Path):
        value = value.read_bytes()
    if isinstance(value, str):
        value = value.encode()
    return hashlib.sha256(value).hexdigest()


def blob(commit: str, path: str) -> bytes:
    return subprocess.check_output(["git", "-C", str(ROOT), "show", f"{commit}:{path}"])


def blob_oid(commit: str, path: str) -> str:
    return subprocess.check_output(
        ["git", "-C", str(ROOT), "rev-parse", f"{commit}:{path}"], text=True
    ).strip()


def dump(path: Path, value: object) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def dump_lines(path: Path, values: list[object]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(
        "".join(json.dumps(value, ensure_ascii=False, sort_keys=True) + "\n" for value in values),
        encoding="utf-8",
    )


def holding_rows() -> dict[str, dict]:
    return {
        row["source_item_id"]: row
        for row in (json.loads(line) for line in (ROOT / HOLDING).read_text(encoding="utf-8").splitlines())
    }


def make() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    rows = holding_rows()
    previous = json.loads(
        (ROOT / "scaffold/rdp001-outside67-concept-freeze-followup-087/inventory.json").read_text(
            encoding="utf-8"
        )
    )
    existing = previous["scope"]["existing_reviewed_ids"] + previous["scope"]["candidate_ids"]
    assert len(existing) == 57 and not set(existing) & set(IDS)
    assert all(rows[sid]["source_path"] == SOURCE_PATHS[sid] for sid in IDS)

    current_bytes = {sid: blob(HEAD, COUNTERPARTS[sid]) for sid in IDS}
    pre_bytes = {sid: blob(PRE, SOURCE_PATHS[sid]) for sid in IDS}
    archive_bytes = {sid: blob(ARCH, SOURCE_PATHS[sid]) for sid in IDS}
    expected_diff = {sid: ("same" if pre_bytes[sid] == archive_bytes[sid] else "different") for sid in IDS}
    hash_equal = [sid for sid in IDS if current_bytes[sid] == archive_bytes[sid]]
    drift = [sid for sid in IDS if current_bytes[sid] != archive_bytes[sid]]

    snapshots: dict[str, dict[str, list[str]]] = {}
    for sid in IDS:
        pre_lines = pre_bytes[sid].decode("utf-8").splitlines()
        archive_lines = archive_bytes[sid].decode("utf-8").splitlines()
        snapshots[sid] = {"pre": pre_lines, "archive": archive_lines}
        base = OUT / "source-snapshots" / sid
        base.mkdir(parents=True, exist_ok=True)
        (base / "pre-isolation.md").write_bytes(pre_bytes[sid])
        (base / "archive-revision.md").write_bytes(archive_bytes[sid])

    diffs = []
    for sid in IDS:
        diff = "".join(
            difflib.unified_diff(
                pre_bytes[sid].decode("utf-8").splitlines(True),
                archive_bytes[sid].decode("utf-8").splitlines(True),
                fromfile="pre-isolation",
                tofile="archive-revision",
                n=3,
            )
        )
        diffs.append(
            {
                "source_item_id": sid,
                "source_path": SOURCE_PATHS[sid],
                "pre_commit": PRE,
                "archive_commit": ARCH,
                "pre_blob_oid": blob_oid(PRE, SOURCE_PATHS[sid]),
                "archive_blob_oid": blob_oid(ARCH, SOURCE_PATHS[sid]),
                "pre_sha256": sha(pre_bytes[sid]),
                "archive_sha256": sha(archive_bytes[sid]),
                "pre_bytes": len(pre_bytes[sid]),
                "archive_bytes": len(archive_bytes[sid]),
                "status": expected_diff[sid],
                "unified_diff": diff,
                "current_counterpart_path": COUNTERPARTS[sid],
                "current_counterpart_commit": HEAD,
                "current_counterpart_blob_oid": blob_oid(HEAD, COUNTERPARTS[sid]),
                "current_counterpart_sha256": sha(current_bytes[sid]),
                "current_counterpart_bytes": len(current_bytes[sid]),
                "current_counterpart_hash_matches_archive": sid in hash_equal,
                "current_counterpart_relation": (
                    "path_relocation_content_hash_equal_archive"
                    if sid in hash_equal
                    else "path_relocation_content_drift"
                ),
            }
        )
    dump(OUT / "source-diffs.json", {"schema": "rdp001-outside67-source-diffs/v1", "items": diffs})

    selected = []
    units = []
    unresolved = [
        "composite_line_decomposition",
        "product_boundary_owner",
        "phase_authority",
        "implementation",
        "degradation",
        "failure",
        "consumer",
        "decision",
        "current_counterpart_relation",
    ]
    semantic_fields = {key: "unresolved" for key in ["action", "actor", "condition", "guard", "sequence"]}
    selection_reason = (
        "旧source／判断史／failure／consumer境界に関係するlineを静的保持する。"
        "fragment外のactor/action/condition/guard/sequence、正式要求identity、owner、phase authority、"
        "implementation、degradation、failure、consumer、decisionのclosureを生成しない。"
    )
    for sid in IDS:
        row = rows[sid]
        source_lines = snapshots[sid]["pre"]
        archive_lines = snapshots[sid]["archive"]
        selected.append(
            {
                "archive_counterpart": {
                    "bytes": len(current_bytes[sid]),
                    "content_hash_matches_archive": sid in hash_equal,
                    "path": COUNTERPARTS[sid],
                    "relation": (
                        "current_counterpart_path_relocation_content_hash_equal_archive_observed"
                        if sid in hash_equal
                        else "current_counterpart_path_relocation_and_content_drift_observed"
                    ),
                    "sha256": sha(current_bytes[sid]),
                },
                "archive_revision": {
                    **row["archive"],
                    "line_count": len(archive_lines),
                    "reported_blob_oid_matches_git": blob_oid(ARCH, SOURCE_PATHS[sid]) == row["archive"]["blob_oid"],
                },
                "artifact_kind": row["artifact_kind"],
                "candidate_phase": row["reported_path_scope"]["phase_scope"],
                "candidate_product": row["reported_path_scope"]["product_scope"],
                "legacy_evidence": {
                    "consumer": "source_relation_only_no_closure",
                    "decision": "unknown_no_candidate_specific_exact_hit",
                    "exact_ledger_hits": [],
                    "failure": "unknown_source_row_only",
                },
                "phase_status": row["reported_path_scope"]["phase_status"],
                "pre_isolation": {
                    **row["pre_isolation"],
                    "line_count": len(source_lines),
                    "reported_blob_oid_matches_git": blob_oid(PRE, SOURCE_PATHS[sid]) == row["pre_isolation"]["blob_oid"],
                },
                "product_candidates": FOUR,
                "product_status": row["reported_path_scope"]["product_status"],
                "reported_holding": {
                    "human_decision_ref": row["human_decision_ref"],
                    "legacy_catalog_record_count": row["legacy_catalog_record_count"],
                    "old_runtime_test_ci_execution": row["old_runtime_test_ci_execution"],
                    "semantic_disposition": row["semantic_disposition"],
                    "source_holding_status": row["source_holding_status"],
                },
                "source_item_id": sid,
                "source_path": SOURCE_PATHS[sid],
                "source_unit": "path_revision_pair",
                "status": {
                    "authority_effect": "none",
                    "consumer_status": "unknown",
                    "current_degradation_status": "unknown",
                    "current_implementation_status": "unknown",
                    "decision_status": "unknown",
                    "degradation_status": "unknown",
                    "implementation_status": "unknown",
                    "legacy_degradation_status": "unknown",
                    "legacy_implementation_status": "unknown",
                    "failure_status": "unknown",
                    "meaning_change_applied": False,
                },
            }
        )
        for index, line_number in enumerate(ANCHOR_LINES[sid], start=1):
            fragment = source_lines[line_number - 1]
            archive_fragment = archive_lines[line_number - 1]
            unit_id = f"RDP-001-OUTSIDE67-{sid.rsplit('-', 1)[1]}-U{index:03d}"
            units.append(
                {
                    "authority_effect": "none",
                    "candidate_kind": KINDS[sid][index - 1],
                    "candidate_product": "shared-cross-product",
                    "consumer_status": "unknown",
                    "current_degradation_status": "unknown",
                    "current_implementation_status": "unknown",
                    "decision_status": "unknown",
                    "degradation_status": "unknown",
                    "diff_observation": {
                        "source_ref": "source-diffs.json",
                        "status": expected_diff[sid],
                        "text": "pre/archive relation is retained as a byte-level observation; no semantic equivalence is inferred",
                    },
                    "failure_status": "unknown",
                    "implementation_status": "unknown",
                    "inference_status": "none",
                    "legacy_degradation_status": "unknown",
                    "legacy_implementation_status": "unknown",
                    "meaning_change_applied": False,
                    "normalized_statement": {
                        "source_ref": "source_fragment",
                        "status": "source_supported_exact_fragment",
                        "text": fragment,
                    },
                    "phase_candidate": "upstream-governance-or-crosswalk",
                    "phase_status": "unknown_path_based_candidate_only",
                    "product_candidates": FOUR,
                    "product_status": "unknown_path_based_candidate_only",
                    "retained_meaning": {
                        "items": [fragment],
                        "source_ref": "source_fragment",
                        "status": "preserved_source_meaning",
                    },
                    "selection_reason": selection_reason,
                    "semantic_fields": semantic_fields,
                    "source_anchor": {
                        "pre_isolation": {
                            "commit": PRE,
                            "line": line_number,
                            "line_sha256": sha(fragment),
                            "source_fragment": fragment,
                        },
                        "archive": {
                            "commit": ARCH,
                            "line": line_number,
                            "line_sha256": sha(archive_fragment),
                            "source_fragment": archive_fragment,
                        },
                    },
                    "source_fragment": fragment,
                    "source_item_id": sid,
                    "source_path": SOURCE_PATHS[sid],
                    "source_support": "exact_line_anchor_only",
                    "successor_requirement_ids": [],
                    "unit_id": unit_id,
                    "unresolved_questions": {"items": unresolved, "scope": "unit", "status": "open_unknowns"},
                }
            )
    dump_lines(OUT / "selected-source-items.jsonl", selected)
    dump_lines(OUT / "product-units.jsonl", units)

    exact_hits = {}
    files = {}
    for ledger in LEDGERS:
        text = (ROOT / ledger).read_text(encoding="utf-8", errors="replace")
        files[ledger] = {"sha256": sha(text), "bytes": len(text.encode("utf-8"))}
        exact_hits_by_ledger = [
            token
            for token in IDS + list(SOURCE_PATHS.values())
            if token in text
        ]
        exact_hits[ledger] = sorted(set(exact_hits_by_ledger))
    dump(
        OUT / "evidence-scan.json",
        {
            "schema": "rdp001-outside67-evidence-scan/v1",
            "selected_ids": IDS,
            "existing_reviewed_ids": existing,
            "exact_ledger_hits": {sid: [] for sid in IDS},
            "exact_ledger_hits_by_file": exact_hits,
            "files": files,
            "archive_relocation_ids": IDS,
            "current_counterpart_relocation_ids": IDS,
            "current_counterpart_hash_equal_archive_ids": hash_equal,
            "current_counterpart_content_drift_ids": drift,
            "current_counterpart_drift_ids": drift,
            "current_counterpart_paths": {sid: COUNTERPARTS[sid] for sid in IDS},
            "current_counterpart_sha256": {sid: sha(current_bytes[sid]) for sid in IDS},
            "old_runtime_test_ci_execution": False,
            "source_revision_commits": {"pre_isolation": PRE, "archive": ARCH, "historical_capture": HISTORICAL, "current": HEAD},
        },
    )

    scope = {
        "worktree": WORKTREE_PROVENANCE,
        "base_origin_main": HEAD,
        "base_origin_main_expected_before_fetch": PREVIOUS_HEAD,
        "base_drift_observed": True,
        "base_drift_from": PREVIOUS_HEAD,
        "base_drift_to": HEAD,
        "base_drift_reason": "SCF-B-0090 was rebaselined from 4481497 after #2041; #2040 then advanced origin/main to a8f1ab1, so this review correction was rebaselined onto that exact latest main.",
        "read_only": True,
        "static_only": True,
        "holding_registration_id": "MPR-SH-OUTSIDE67-001",
        "holding_path": HOLDING,
        "holding_sha256": sha(ROOT / HOLDING),
        "holding_path_revision_pair_denominator": 67,
        "holding_record_count": len(rows),
        "current_live_source_holding_count": 14,
        "management_register_path": REGISTER,
        "management_register_sha256": sha(ROOT / REGISTER),
        "existing_reviewed_ids": existing,
        "remaining_before_candidate_selection": 10,
        "candidate_ids": IDS,
        "candidate_count": 5,
        "remaining_after_candidate_selection": 5,
        "accounting_status": "provisional_62_of_67_research_no_formal_holding_admission",
        "unexplored_scope": "all outside67 path_revision_pair not in the existing 57 or this five-source research set; candidate accounting remains scaffold evidence until any later holding admission",
        "pre_isolation_commit": PRE,
        "archive_commit": ARCH,
        "historical_capture_commit": HISTORICAL,
        "source_unit": "path_revision_pair",
        "requirement_atoms_are_not_path_pairs": True,
        "batch_width_observed": 5,
        "batch_width_policy": "width 5 is the observed verification width for this bundle; no safe batch upper bound is asserted; a later batch requires independent source-chain review from then-current origin/main",
        "origin_main_rebaseline_required_after_2016_merge": False,
        "binding_reservation": "SCF-B-0090",
        "binding_registration_status": "registered",
    }
    documents = [
        {"source_item_id": sid, "source_path": SOURCE_PATHS[sid], "current_counterpart_path": COUNTERPARTS[sid]}
        for sid in IDS
    ]
    inventory = {
        "schema": "rdp001-outside67-followup/v1",
        "candidate_id": "RDP-001-OUTSIDE67-RESIDUAL-FOLLOWUP-028-039-040-042-044",
        "status": "findings_only",
        "authority_effect": "none",
        "meaning_change_applied": False,
        "successor_requirement_ids": [],
        "human_decision_ref": None,
        "formal_register_append": None,
        "old_runtime_test_ci_execution": False,
        "scope": scope,
        "source_holding": {
            "registration_id": "MPR-SH-OUTSIDE67-001",
            "selected_item_ids": IDS,
            "existing_reviewed_ids": existing,
            "denominator": 67,
            "candidate_count": 5,
            "reviewed_count": 57,
            "combined_reviewed_and_candidate_count": 62,
            "remaining_after_research": 5,
            "accounting_status": "provisional_62_of_67_no_formal_holding_admission",
        },
        "selection": {
            "candidate_ids": IDS,
            "excluded_existing_ids": existing,
            "reason": "the next ascending residual path_revision_pairs after the SCF-B-0087 57/67 accounting; 028 preserves the remaining L2 freeze patch source and 039/040/042/044 preserve the next governance crosswalk sources without exact ID/path overlap",
        },
        "classification_basis": {
            "counterpart_difference": "pre/archive/current path, hash, and wording observations are retained without semantic equivalence or successor inference",
            "degradation": "unknown; no candidate-specific degradation closure is asserted",
            "failure_consumer_decision": "unknown; exact ledger/path scan is an evidence boundary only",
            "implementation": "unknown; no current or legacy implementation acceptance is inferred",
            "phase": "source path is a candidate phase hint only",
            "product": "source topic and path suggest a candidate boundary only; four-product candidates remain unresolved",
            "semantic_units": "exact source line anchors are preserved; multi-duty lines remain composite_unresolved",
        },
        "four_products": [{"product": product, "status": "candidate_boundary_only", "authority_effect": "none"} for product in FOUR],
        "documents": documents,
        "product_unit_count": len(units),
        "product_unit_ids": [unit["unit_id"] for unit in units],
        "unknown_counts": {key: 5 for key in ["implementation", "degradation", "failure", "consumer", "decision", "phase", "authority", "legacy_implementation", "current_implementation", "legacy_degradation", "current_degradation"]},
        "source_diffs": "source-diffs.json",
        "evidence_scan": "evidence-scan.json",
        "prohibited_inference": [
            "pre/archive/current hash or path observations are not semantic equivalence, authority, successor, implementation, degradation, failure, consumer closure, or decision",
            "product-specific L1/L2/L11 or crosswalk path is not current authority or implementation acceptance",
            "authority register or policy entries are not approval or completion evidence",
            "old ledger exact hit zero is not proof of absence, completion, or approval",
            "candidate line is not a fully decomposed requirement atom when multiple duties remain",
        ],
        "findings": [
            "028/039/040/042/044 cover the remaining L2 freeze system-tests patch and four governance crosswalk sources without formal requirement identity.",
            "028/039/040/042/044 are byte-equal between pre-isolation and archive. Current counterparts are path relocations; current hash relations are retained as observations.",
            "All five holding rows remain not_started with catalog count zero and null human decision; ledger/path exact hits are reported as an evidence boundary and do not establish absence, completion, or approval.",
        ],
        "unresolved_questions": [
            "multi-duty line decomposition and connection graph are incomplete; each selected line remains composite_unresolved until an independent atomization review",
            "formal requirement identity and four-product owner decision are not present",
            "legacy/current implementation, degradation, failure, consumer and decision closure remain unknown",
            "path relocation and revision hash differences require separate semantic review",
            "next batch width has no asserted safe upper bound; this bundle records only the five-source observed verification width",
        ],
        "verification_scope": [
            "source revision/blob/path receipt",
            "exact line anchor and duplicate detection",
            "four-product boundary and unknown status preservation",
            "ledger exact ID/path non-overlap",
            "canonical schema and negative mutation",
            "ancestor-only base gate",
        ],
    }
    dump(OUT / "inventory.json", inventory)
    dump(
        OUT / "meta.json",
        {
            "schema": "rdp001-outside67-followup-meta/v1",
            "bundle_id": inventory["candidate_id"],
            "binding_reservation": "SCF-B-0090",
            "binding_registration_status": "registered",
            "base_origin_main": HEAD,
            "base_origin_main_previous": PREVIOUS_HEAD,
            "candidate_ids": IDS,
            "existing_reviewed_count": 57,
            "candidate_count": 5,
            "combined_count": 62,
            "denominator": 67,
            "remaining_after_research": 5,
            "anchor_count": 25,
            "static_only": True,
            "old_runtime_test_ci_execution": False,
            "authority_effect": "none",
        },
    )
    dump(
        OUT / "ledger.json",
        {
            "schema": "rdp001-outside67-followup-ledger/v1",
            "source_holding_registration": "MPR-SH-OUTSIDE67-001",
            "denominator": 67,
            "existing_reviewed_ids": existing,
            "selected_ids": IDS,
            "selected_source_count": 5,
            "product_unit_candidate_count": 25,
            "exact_ledger_hit_count": 0,
            "source_anchor_count": 25,
            "status": "findings_only",
            "formal_admission": False,
        },
    )


if __name__ == "__main__":
    make()
    print("generated outside67 028/039/040/042/044 static bundle")
