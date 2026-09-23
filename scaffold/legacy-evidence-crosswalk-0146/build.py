#!/usr/bin/env python3
"""SCF-B-0146の固定BASE再導出generator。旧archiveは実行せずGit bytesだけを読む。"""

from __future__ import annotations

import json
import hashlib
import re
import subprocess
from pathlib import Path

from common import (
    BASE_COMMIT,
    BUNDLE_REL,
    CANONICAL_INPUTS,
    FIELD_SPECS,
    INPUT_PATHS,
    NEGATIVE_CASE_CODES,
    ROOT,
    SOURCE_PARTITIONS,
    check_base_ancestor,
    counts,
    derive_all,
    input_digests,
    sha256_obj,
)


BUNDLE = Path(__file__).resolve().parent
FOCUSED_IDS = (
    "HIL-BR-02", "HIL-BR-06", "HIL-BR-16", "HIL-BR-20",
    "HIL-FR-01", "HIL-FR-12", "HIL-FR-23",
)
ARCHIVE_SNAPSHOT = "2d4991042be55268bac30a8bbcdac45b3865030a"
ARCHIVE_ROOT = "archive/legacy-generation-2026-09-14/root/"


def git_blob(commit, path):
    result = subprocess.run(
        ["git", "-C", str(ROOT), "show", f"{commit}:{path}"],
        stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=False,
    )
    if result.returncode:
        raise ValueError(f"{commit}:{path}を読めない")
    return result.stdout


def focused_projection(records):
    """BASE原文・manifest・asset ledgersから7行を再構成する。"""
    manifest_bytes = git_blob(BASE_COMMIT, "archive/legacy-generation-2026-09-14/MANIFEST.sha256")
    manifest = {}
    for line in manifest_bytes.decode("utf-8").splitlines():
        digest, path = line.split("  ", 1)
        manifest[path] = digest
    requirement_path = "requirements-ir/requirements.json"
    requirement_archive_path = ARCHIVE_ROOT + requirement_path
    requirements = json.loads(git_blob(ARCHIVE_SNAPSHOT, requirement_path))
    l1_rel = "docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md"
    l1_path = ARCHIVE_ROOT + l1_rel
    l1_text = git_blob(ARCHIVE_SNAPSHOT, l1_rel).decode("utf-8")
    l9_rel = "docs/test-design/helix/L9-infinity-loop-platform-system-test-design.md"
    l9_path = ARCHIVE_ROOT + l9_rel
    l9_lines = git_blob(ARCHIVE_SNAPSHOT, l9_rel).decode("utf-8").splitlines()
    by_id = {row["subject"]["unit_candidate_id"]: row for row in records}
    unit_source = {}
    for path in SOURCE_PARTITIONS:
        for line_no, line in enumerate(git_blob(BASE_COMMIT, path).decode("utf-8").splitlines(), 1):
            source = json.loads(line)
            unit_source[source["unit_candidate_id"]] = source
    dispositions = [json.loads(line) for line in git_blob(BASE_COMMIT, CANONICAL_INPUTS[2]).decode("utf-8").splitlines() if line.strip()]
    decisions = [json.loads(line) for line in git_blob(BASE_COMMIT, CANONICAL_INPUTS[3]).decode("utf-8").splitlines() if line.strip()]
    read_afters = [json.loads(line) for line in git_blob(BASE_COMMIT, CANONICAL_INPUTS[4]).decode("utf-8").splitlines() if line.strip()]
    disposition_by_id = {x["asset_id"]: x for x in dispositions}
    read_after_by_id = {x["read_after_id"]: x for x in read_afters}
    manifest_paths = set(manifest)
    receipt_relpaths = [
        "docs/governance/evidence/PR-1679/vitest-targeted.json",
        "docs/governance/evidence/PR-1699/vitest-targeted.json",
        "docs/governance/evidence/PR-1767/vitest-targeted.json",
    ]
    if any(path not in manifest_paths for path in receipt_relpaths):
        raise ValueError("focused receipt search scopeがBASE archive manifestにない")
    receipt_scope = {
        "directory": ARCHIVE_ROOT + "docs/governance/evidence",
        "files_reviewed": [ARCHIVE_ROOT + path for path in receipt_relpaths],
        "receipt_artifacts": [
            {"path": ARCHIVE_ROOT + path, "sha256": "sha256:" + manifest[path]}
            for path in receipt_relpaths
        ],
        "result": "3件のreceiptのtestResultsに対象sourceと同名のtest fileはなく、unit_candidate_id／requirement atomへのbindingも無いため対象候補として紐付けていない",
    }
    output = []
    for rid in FOCUSED_IDS:
        atom = requirements[rid]
        unit_ids = [row["subject"]["unit_candidate_id"] for row in records
                    if row["subject"].get("source_requirement_id") == rid]
        req = {
            "manifest_match": True, "path": requirement_archive_path,
            "sha256": "sha256:" + manifest[requirement_path],
        }
        l1_artifact = {
            "manifest_match": True, "path": l1_path,
            "sha256": "sha256:" + manifest[l1_rel],
        }
        l1_row = next(line for line in l1_text.splitlines() if f"**{rid}**" in line)
        tests = []
        for line_no, line in enumerate(l9_lines, 1):
            match = re.match(r"^\|\s*(HST-[^ |]+)\s*\|", line)
            if rid in line and match:
                tests.append({
                    "artifact": {"manifest_match": True, "path": l9_path, "sha256": "sha256:" + manifest[l9_rel]},
                    "line": line_no, "row": line, "test_id": match.group(1),
                })
        direct_assets = []
        seen_assets = set()
        for unit_id in unit_ids:
            source_row = unit_source[unit_id]
            contribution = {}
            for entry in source_row.get("semantic_review_edges", []) or []:
                edge = entry.get("edge") if isinstance(entry, dict) and isinstance(entry.get("edge"), dict) else entry
                if isinstance(edge, dict) and edge.get("asset_id"):
                    contribution.setdefault(edge["asset_id"], edge.get("legacy_requirement_implementation_contribution"))
            for asset in source_row.get("old_asset_evidence", {}).get("assets", []) or []:
                asset_id = asset.get("asset_id")
                rel = asset.get("source_path") or asset.get("ledger_record", {}).get("source_path")
                if not rel:
                    rel = asset.get("archive_path", "").split("/root/", 1)[-1]
                if not asset_id or not rel or rel == "requirements-ir/requirements.json" or asset_id in seen_assets:
                    continue
                archive_path = ARCHIVE_ROOT + rel
                if rel not in manifest:
                    raise ValueError(f"focused direct assetがBASE manifestにない: {rel}")
                if asset_id not in contribution:
                    raise ValueError(f"focused direct assetにsemantic edge contributionがない: {asset_id}")
                kind = ("plan" if "/docs/plans/" in archive_path else
                        "test_design" if "/docs/test-design/" in archive_path else
                        "design" if "/docs/design/" in archive_path else "source")
                direct_assets.append({
                    "asset_id": asset_id,
                    "crosswalk_contribution": contribution[asset_id],
                    "kind": kind,
                    "manifest_match": True,
                    "path": archive_path,
                    "sha256": "sha256:" + manifest[rel],
                })
                seen_assets.add(asset_id)
        test_definitions = []
        for asset in direct_assets:
            if asset["kind"] != "source":
                continue
            basename = Path(asset["path"]).stem
            rel = f"tests/{basename}.test.ts"
            if rel in manifest:
                test_definitions.append({
                    "manifest_match": True,
                    "path": ARCHIVE_ROOT + rel,
                    "sha256": "sha256:" + manifest[rel],
                    "source_basename": basename,
                })
        history = []
        for unit_id in unit_ids:
            source_row = unit_source[unit_id]
            for asset in source_row.get("old_asset_evidence", {}).get("assets", []) or []:
                asset_id = asset.get("asset_id")
                disposition = disposition_by_id.get(asset_id)
                if not disposition or disposition.get("disposition") != "source_snapshot_preservation":
                    continue
                read_ref = disposition.get("read_after_record_ref")
                read_id = read_ref.rsplit("#", 1)[-1] if isinstance(read_ref, str) else None
                read_after = read_after_by_id.get(read_id)
                asset_decisions = [x for x in decisions if x.get("asset_id") == asset_id]
                observed = {
                    "asset_disposition": disposition.get("disposition"),
                    "asset_id": asset_id,
                    "asset_revision_current": disposition.get("revision"),
                    "copy_read_after_ref": read_ref,
                    "copy_read_after_result": read_after.get("result") if read_after else None,
                    "decision_record_refs": [f"{CANONICAL_INPUTS[3]}#{x.get('decision_id')}" for x in asset_decisions],
                    "latest_decision_status": disposition.get("decision_status"),
                    "observed_asset_consumers": disposition.get("consumer_refs"),
                    "scope_limit": "要求sourceのread-only同一digest保全とasset consumer observationのみ。unit implementation、unit acceptance、unit consumer closure、formal product placementを示さない",
                    "unit_candidate_id": unit_id,
                }
                if observed not in history:
                    history.append(observed)
        statement = atom["statement"]
        projection = {
            "schema": "legacy-evidence-crosswalk-0146/v1/focused-investigation",
            "requirement_id": rid,
            "requirement_artifact": req,
            "requirement_atom": {
                "acceptance_ids": atom["acceptance_ids"],
                "downstream_obligation": atom["downstream_obligation"],
                "pointer": atom["source"]["canonical_pointer"],
                "semantic_digest": statement["semantic_digest"],
                "statement": statement["text"],
                "system_test_id": atom["system_test_id"],
            },
            "legacy_l1_source": {"artifact": l1_artifact, "row": l1_row},
            "unit_candidate_ids": unit_ids,
            "missing_evidence_by_unit": [
                {
                    "unit_candidate_id": unit_id,
                    "acceptance_atoms": atom["acceptance_ids"],
                    "missing": {
                        "acceptance": "verdict, evidence refs tied to unit/requirement atom, revision, and acceptance receipt digest",
                        "consumer": "consumer identity, closure receipt, decision ref, read-after ref, and unit/requirement relation",
                        "failure": "failure code, observed status/exit, revision, receipt digest, and atom/edge relation",
                        "human_decision": "decision ID, authority, field-specific verdict/classification, and decision revision",
                    },
                }
                for unit_id in unit_ids
            ],
            "system_test_design_candidates": tests,
            "status_effect": "none; existing SCF-B-0146 status_partition remains authoritative for this research bundle and unchanged",
            "archive_manifest": {"path": "archive/legacy-generation-2026-09-14/MANIFEST.sha256", "sha256": "sha256:" + hashlib.sha256(manifest_bytes).hexdigest(), "snapshot_commit": ARCHIVE_SNAPSHOT},
            "asset_level_history_observations": history,
            "direct_asset_candidates": direct_assets,
            "historical_run_receipt_candidates": [],
            "run_receipt_search_scope": receipt_scope,
            "test_definition_candidates": test_definitions,
        }
        output.append(projection)
    return output


def main():
    if not check_base_ancestor():
        raise SystemExit("E_BASE_NOT_ANCESTOR: 固定BASEが現HEADの祖先ではない")
    records, crosswalk, decomposition, ledger = derive_all()
    bundle_counts = counts(records)
    expected = {
        "records": 218,
        "product_units": 217,
        "connections": 1,
        "semantic_review_edges": 598,
        "unique_semantic_review_edges": 598,
        "unique_old_assets": 355,
        "status_fields": {
            "old_implementation": {"unknown": 218},
            "old_degradation": {"unknown": 218},
            "old_failure": {"unknown": 218},
            "consumer": {"pending": 218},
            "current_implementation": {"unknown": 218},
            "acceptance": {"unknown": 218},
            "unimplemented": {"not_assessed": 218},
        },
    }
    if any(bundle_counts.get(key) != value for key, value in expected.items() if key != "status_fields"):
        raise SystemExit(f"E_EXPECTED_COUNTS: {bundle_counts}")
    if bundle_counts["status_fields"] != expected["status_fields"]:
        raise SystemExit(f"E_EXPECTED_STATUS: {bundle_counts['status_fields']}")
    inventory = {
        "schema": "legacy-evidence-crosswalk-0146/v1/inventory",
        "binding_id": "SCF-B-0146",
        "bundle_kind": "research-only-static-crosswalk",
        "authority_effect": "none",
        "base": {
            "repository": "HELIX-HARNESS",
            "branch": "main",
            "commit": BASE_COMMIT,
            "required_ancestor": BASE_COMMIT,
            "input_mode": "git_object_bytes_at_fixed_base",
        },
        "scope": {
            "source_partition_paths": list(SOURCE_PARTITIONS),
            "canonical_relation_paths": list(CANONICAL_INPUTS),
            "excluded_as_oracle": [
                "scaffold/fr-os-first10-evidence-0129/evidence.jsonl",
                "scaffold/fr-harness-first10-evidence-0132/evidence.jsonl",
            ],
            "subject_kinds": {
                "product_unit": 217,
                "connection": 1,
            },
            "connection_ids": [
                record["subject"]["unit_candidate_id"]
                for record in records
                if record["subject"]["subject_kind"] == "connection"
            ],
        },
        "counts": bundle_counts,
        "input_digests": input_digests(),
        "status_expectations": {
            field: {
                "status": spec["expected_status"],
                "count": 218,
                "reason_code": spec["reason_code"],
                "direct_evidence_present": False,
            }
            for field, spec in FIELD_SPECS.items()
        },
        "required_evidence_schema": FIELD_SPECS,
        "negative_case_codes": NEGATIVE_CASE_CODES,
        "prohibited_inference": [
            "source/design/requirement presence is not unit implementation",
            "static coverage.failure is not a failure receipt",
            "pending consumer references are not closure",
            "current source candidate is not current implementation",
            "missing evidence is not explicit non-implementation",
            "connection record is not a product unit",
        ],
        "record_set_digest": "sha256:" + sha256_obj([r["subject"]["unit_candidate_id"] for r in records]),
        "status_partition_digest": "sha256:" + sha256_obj([
            [r["subject"]["unit_candidate_id"], r["status_partition"]] for r in records
        ]),
    }
    (BUNDLE / "evidence.jsonl").write_text(
        "".join(json.dumps(record, ensure_ascii=False, sort_keys=True) + "\n" for record in records),
        encoding="utf-8",
    )
    (BUNDLE / "focused-investigation.jsonl").write_text(
        "".join(json.dumps(record, ensure_ascii=False, sort_keys=True, separators=(",", ":")) + "\n" for record in focused_projection(records)),
        encoding="utf-8",
    )
    (BUNDLE / "inventory.json").write_text(
        json.dumps(inventory, ensure_ascii=False, indent=2, sort_keys=True) + "\n",
        encoding="utf-8",
    )
    print(json.dumps({"bundle": BUNDLE_REL, "counts": bundle_counts, "base": BASE_COMMIT}, ensure_ascii=False, sort_keys=True))


if __name__ == "__main__":
    main()
