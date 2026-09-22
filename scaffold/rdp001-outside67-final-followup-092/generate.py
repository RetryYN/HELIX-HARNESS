#!/usr/bin/env python3
"""Generate the static outside67 final 048/049/050/051/053 research bundle."""

from __future__ import annotations

import difflib
import hashlib
import json
import subprocess
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
OUT = Path(__file__).resolve().parent
WORKTREE_PROVENANCE = "/home/tenni/HELIX-HARNESS-outside-final-next5"
PRE = "2d4991042be55268bac30a8bbcdac45b3865030a"
ARCH = "064280b5c1c5c98f949e6e3be5ef87cbe4a4b658"
HISTORICAL = "3df81ad27157c471e004083783f37a5860eaa2ee"
HEAD = "36accee66242338ded01dcc24d44148faadd3045"
PREVIOUS_HEAD = "15c2a145c06aedb4e1a081e288e5b302dc4182cf"
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
    "OUTSIDE67-PATH-048",
    "OUTSIDE67-PATH-049",
    "OUTSIDE67-PATH-050",
    "OUTSIDE67-PATH-051",
    "OUTSIDE67-PATH-053",
]
SOURCE_PATHS = {
    "OUTSIDE67-PATH-048": "docs/governance/audits/l2-requirements/pillar-target-crosswalk.md",
    "OUTSIDE67-PATH-049": "docs/governance/audits/l2-requirements/product-requirement-placement-audit-2026-09-14.md",
    "OUTSIDE67-PATH-050": "docs/governance/audits/l2-requirements/refinement-target-crosswalk.md",
    "OUTSIDE67-PATH-051": "docs/governance/audits/l2-requirements/requirements-v1.3-target-crosswalk.md",
    "OUTSIDE67-PATH-053": "docs/governance/candidates/helix-concept-v4.1.md",
}
COUNTERPARTS = {
    "OUTSIDE67-PATH-048": "docs/governance/audits/source-rebaseline/pillar-target-crosswalk.md",
    "OUTSIDE67-PATH-049": "docs/governance/audits/source-rebaseline/product-requirement-placement-audit-2026-09-14.md",
    "OUTSIDE67-PATH-050": "docs/governance/audits/source-rebaseline/refinement-target-crosswalk.md",
    "OUTSIDE67-PATH-051": "docs/governance/audits/source-rebaseline/requirements-v1.3-target-crosswalk.md",
    "OUTSIDE67-PATH-053": "docs/concept/helix-concept-v4.1.md",
}
ANCHOR_LINES = {
    "OUTSIDE67-PATH-048": [3, 7, 11, 14, 25],
    "OUTSIDE67-PATH-049": [3, 14, 21, 30, 42],
    "OUTSIDE67-PATH-050": [3, 6, 25, 31, 36],
    "OUTSIDE67-PATH-051": [3, 7, 13, 25, 38],
    "OUTSIDE67-PATH-053": [3, 5, 23, 37, 62],
}
KINDS = {
    "OUTSIDE67-PATH-048": [
        "pillar_crosswalk_date_boundary",
        "pillar_crosswalk_scope_boundary",
        "pillar_crosswalk_harness_boundary",
        "pillar_crosswalk_pair_boundary",
        "pillar_crosswalk_gap_boundary",
    ],
    "OUTSIDE67-PATH-049": [
        "placement_audit_date_boundary",
        "placement_audit_owner_boundary",
        "placement_audit_result_boundary",
        "placement_audit_webos_boundary",
        "placement_audit_closure_boundary",
    ],
    "OUTSIDE67-PATH-050": [
        "refinement_crosswalk_source_boundary",
        "refinement_crosswalk_digest_boundary",
        "refinement_crosswalk_approval_boundary",
        "refinement_crosswalk_authority_boundary",
        "refinement_crosswalk_json_boundary",
    ],
    "OUTSIDE67-PATH-051": [
        "requirements_crosswalk_date_boundary",
        "requirements_crosswalk_scope_boundary",
        "requirements_crosswalk_measurement_boundary",
        "requirements_crosswalk_legacy_boundary",
        "requirements_crosswalk_split_boundary",
    ],
    "OUTSIDE67-PATH-053": [
        "concept_candidate_version_boundary",
        "concept_candidate_authority_boundary",
        "concept_candidate_definition_boundary",
        "concept_candidate_product_boundary",
        "concept_candidate_vocabulary_boundary",
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
        (ROOT / "scaffold/rdp001-outside67-residual-followup-090/inventory.json").read_text(
            encoding="utf-8"
        )
    )
    existing = previous["scope"]["existing_reviewed_ids"] + previous["scope"]["candidate_ids"]
    assert len(existing) == 62 and not set(existing) & set(IDS)
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
        "base_drift_reason": "#2039 exact reviewed HEAD ad11da4 was merged into main at 36accee; this final bundle was rebaselined onto that merge HEAD. If the reviewed parent lineage changes before push, stop and rebaseline.",
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
        "remaining_before_candidate_selection": 5,
        "candidate_ids": IDS,
        "candidate_count": 5,
        "remaining_after_candidate_selection": 0,
        "accounting_status": "provisional_67_of_67_research_no_formal_holding_admission",
        "unexplored_scope": "all outside67 path_revision_pair not in the existing 62 or this five-source research set; formal requirement and product accounting remain outside this path research",
        "pre_isolation_commit": PRE,
        "archive_commit": ARCH,
        "historical_capture_commit": HISTORICAL,
        "source_unit": "path_revision_pair",
        "requirement_atoms_are_not_path_pairs": True,
        "batch_width_observed": 5,
        "batch_width_policy": "width 5 is the observed verification width for this bundle; no safe batch upper bound is asserted; a later batch requires independent source-chain review from then-current origin/main",
        "origin_main_rebaseline_required_after_2016_merge": False,
        "parent_pr_number": 2039,
        "parent_branch": "research/outside67-next5-residual-090",
        "parent_exact_head": "ad11da4a854e1a25a1cb0663450d54cce0e8684c",
        "parent_merged_main_head": HEAD,
        "parent_head_change_stop_condition": "if reviewed parent HEAD differs from ad11da4 before merge, or merged main HEAD differs from parent_merged_main_head before push, stop and rebaseline",
        "binding_reservation": "SCF-B-0092",
        "binding_registration_status": "registered",
    }
    documents = [
        {"source_item_id": sid, "source_path": SOURCE_PATHS[sid], "current_counterpart_path": COUNTERPARTS[sid]}
        for sid in IDS
    ]
    inventory = {
        "schema": "rdp001-outside67-followup/v1",
        "candidate_id": "RDP-001-OUTSIDE67-FINAL-FOLLOWUP-048-049-050-051-053",
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
            "reviewed_count": 62,
            "combined_reviewed_and_candidate_count": 67,
            "remaining_after_research": 0,
            "accounting_status": "provisional_67_of_67_no_formal_holding_admission",
        },
        "selection": {
            "candidate_ids": IDS,
            "excluded_existing_ids": existing,
            "reason": "the final five ascending residual path_revision_pairs after SCF-B-0090 fixed 62/67; 048/049/050/051 preserve governance crosswalk and placement evidence, and 053 preserves the Concept candidate source without exact ID/path overlap",
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
            "048/049/050/051/053 cover the final five source paths without formal requirement identity.",
            "048/050/051/053 differ and 049 is byte-equal between pre-isolation and archive; current counterpart path, hash, and drift relations are retained as observations.",
            "All five holding rows remain not_started with catalog count zero and null human decision; ledger/path exact hits are reported as an evidence boundary and do not establish absence, completion, or approval.",
        ],
        "unresolved_questions": [
            "multi-duty line decomposition and connection graph are incomplete; each selected line remains composite_unresolved until an independent atomization review",
            "formal requirement identity and four-product owner decision are not present",
            "legacy/current implementation, degradation, failure, consumer and decision closure remain unknown",
            "path relocation and revision hash differences require separate semantic review",
            "parent HEAD change on #2039 requires stop and rebaseline before any final-bundle continuation",
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
            "binding_reservation": "SCF-B-0092",
            "binding_registration_status": "registered",
            "base_origin_main": HEAD,
            "base_origin_main_previous": PREVIOUS_HEAD,
            "candidate_ids": IDS,
            "existing_reviewed_count": 62,
            "candidate_count": 5,
            "combined_count": 67,
            "denominator": 67,
            "remaining_after_research": 0,
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
    print("generated outside67 final 048/049/050/051/053 static bundle")
