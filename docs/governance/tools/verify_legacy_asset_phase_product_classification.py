#!/usr/bin/env python3
"""旧asset候補台帳のidentity、digest、状態境界、既知のconfidence上限を静的検査する。"""

import collections
import hashlib
import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]
LEDGER = ROOT / "docs/governance/legacy-asset-disposition.jsonl"
OUTPUT = ROOT / "docs/governance/legacy-asset-phase-product-classification-bootstrap.jsonl"
META = ROOT / "docs/governance/legacy-asset-phase-product-classification-bootstrap.meta.json"
ARCHIVE = ROOT / "archive/legacy-generation-2026-09-14/root"
PHASES = {f"PHCAP-{number:02d}" for number in range(1, 21)}
PRODUCTS = {"HELIX-HARNESS", "HELIX-OS", "HELIX-Web", "HELIX-Web-OS"}
EVIDENCE_PREFIXES = (
    "inventory:representative_asset:", "basename:", "frontmatter:", "path:",
    "heading:", "subject:", "subject_path:", "body:",
)
EVIDENCE_STATES = {
    "plan": {"document_present", "non_executable_source_snapshot"},
    "test_source": {"test_source_present_unexecuted"},
    "implementation_source": {"implementation_source_present_unexecuted"},
    "design": {"document_present", "non_executable_source_snapshot"},
    "test_design": {"test_design_present_unexecuted"},
    "operation_document": {"document_present"},
    "unknown": {"document_present"},
    "runtime_state_evidence": {"runtime_state_evidence_present_unverified"},
    "requirement": {"document_present", "non_executable_source_snapshot"},
    "configuration": {"configuration_present_unexecuted"},
    "workflow": {"workflow_present_unexecuted"},
}


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def load_jsonl(path):
    return [json.loads(line) for line in path.read_text().splitlines()]


def require(condition, message):
    if not condition:
        raise ValueError(message)


def direct_high_evidence(phase, evidence):
    return any(
        item.startswith("inventory:representative_asset:")
        or (item.startswith("basename:") and not (phase == "PHCAP-11" and "doctor" in item.lower()))
        or (item.startswith("frontmatter:") and not item.startswith(("frontmatter:layer=", "frontmatter:status:")))
        for item in evidence
    )


def main():
    source = load_jsonl(LEDGER)
    output = load_jsonl(OUTPUT)
    meta = json.loads(META.read_text())
    require(len(source) == len(output) == 4020, "record count mismatch")
    require([row["asset_id"] for row in source] == [row["asset_id"] for row in output], "asset exact set/order mismatch")
    source_by_id = {row["asset_id"]: row for row in source}
    require(len(source_by_id) == 4020, "duplicate source asset_id")

    for row in output:
        original = source_by_id[row["asset_id"]]
        require((row["source_path"], row["source_sha256"]) == (original["source_path"], original["source_sha256"]), "source identity mismatch")
        require(sha(ARCHIVE / row["source_path"]) == row["source_sha256"], "archive digest mismatch")
        require(set(row["candidate_phase_targets"]) <= PHASES, "unknown phase")
        require(set(row["candidate_product_targets"]) <= PRODUCTS, "unknown product")
        require(row["artifact_evidence_kind"] in EVIDENCE_STATES, "unknown artifact kind vocabulary")
        require(row["implementation_evidence_state"] in EVIDENCE_STATES[row["artifact_evidence_kind"]], "artifact/evidence state mismatch")
        if row["source_path"].startswith("src/"):
            require(row["artifact_evidence_kind"] == "implementation_source", "src path is not implementation source")
        require(row["authority_effect"] == "none" and row["legacy_execution_performed"] is False, "authority/execution overclaim")
        require(row["consumer_closure_status"] == "pending", "consumer closure overclaim")
        for assessment in row["phase_assessments"]:
            evidence = assessment["evidence"]
            require(evidence and all(item.startswith(EVIDENCE_PREFIXES) for item in evidence), "invalid phase evidence")
            if assessment["confidence"] == "high":
                require(direct_high_evidence(assessment["phase"], evidence), "high confidence lacks direct evidence")
        for assessment in row["product_assessments"]:
            require(assessment["confidence"] == "low", "product confidence overclaim")
            require(assessment["evidence_status"] == "direct_product_boundary_evidence_pending", "product evidence overclaim")

    require(meta["record_count"] == 4020, "meta record count mismatch")
    require(meta["output_sha256"] == "sha256:" + sha(OUTPUT), "output digest mismatch")
    counts = dict(sorted(collections.Counter(row["phase_classification_status"] for row in output).items()))
    require(meta["phase_classification_counts"] == counts, "phase count mismatch")
    for item in meta["source_inputs"]:
        require(item["sha256"] == "sha256:" + sha(ROOT / item["path"]), "source input digest mismatch")
    print(f"legacy-asset-classification: ok records={len(output)} archive_sha={len(output)}")


if __name__ == "__main__":
    main()
