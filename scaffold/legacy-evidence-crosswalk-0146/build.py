#!/usr/bin/env python3
"""SCF-B-0146の固定BASE再導出generator。旧archiveは実行せずGit bytesだけを読む。"""

from __future__ import annotations

import json
from pathlib import Path

from common import (
    BASE_COMMIT,
    BUNDLE_REL,
    CANONICAL_INPUTS,
    FIELD_SPECS,
    INPUT_PATHS,
    NEGATIVE_CASE_CODES,
    SOURCE_PARTITIONS,
    check_base_ancestor,
    counts,
    derive_all,
    input_digests,
    sha256_obj,
)


BUNDLE = Path(__file__).resolve().parent


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
    (BUNDLE / "inventory.json").write_text(
        json.dumps(inventory, ensure_ascii=False, indent=2, sort_keys=True) + "\n",
        encoding="utf-8",
    )
    print(json.dumps({"bundle": BUNDLE_REL, "counts": bundle_counts, "base": BASE_COMMIT}, ensure_ascii=False, sort_keys=True))


if __name__ == "__main__":
    main()
