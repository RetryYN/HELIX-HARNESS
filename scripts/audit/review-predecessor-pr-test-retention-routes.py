#!/usr/bin/env python3
"""71 predecessor PRのtest/oracle routeとretention manifestを独立監査する。"""

from __future__ import annotations

import argparse
import collections
import hashlib
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
CANDIDATE = ROOT / "docs/governance/generated/predecessor-pr-test-retention-routes-71-v1.json"
RECON = ROOT / "docs/governance/generated/predecessor-pr-semantic-reconciliation-71-v1.json"
OUTPUT = ROOT / "docs/governance/generated/predecessor-pr-test-retention-routes-71-independent-review-v1.json"
L1 = ROOT / "docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md"
L3 = ROOT / "docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md"
HAT = ROOT / "docs/test-design/helix/L3-infinity-loop-acceptance-test-design.md"
HST = ROOT / "docs/test-design/helix/L10-infinity-loop-platform-system-test-design.md"
VISUAL = ROOT / "docs/test-design/helix/L8-L11-visual-design-harness-verification.md"

REQUIRED_SCHEMA = {
    "identity": {"repository_id", "pr_number", "head_oid", "merge_oid", "workflow_run_id", "workflow_attempt", "check_suite_id", "check_run_id"},
    "lineage": {"event_name", "base_ref", "head_ref", "head_sha", "merge_sha", "workflow_path", "workflow_sha", "pr_title_sha256", "commit_range_manifest_sha256", "changed_path_manifest_sha256", "behavior_family_manifest_sha256", "semantic_reconciliation_sha256"},
    "result": {"check_name", "app_slug", "status", "conclusion", "started_at", "completed_at"},
    "evidence": {"annotations_manifest_sha256", "artifact_manifest_sha256", "sanitized_log_sha256", "test_report_sha256", "provenance_manifest_sha256"},
}


def compact_digest(value: object) -> str:
    raw = json.dumps(value, ensure_ascii=False, separators=(",", ":")).encode()
    return hashlib.sha256(raw).hexdigest()


def file_digest(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    candidate = json.loads(CANDIDATE.read_text(encoding="utf-8"))
    reconciliation = {row["pr_id"]: row for row in json.loads(RECON.read_text(encoding="utf-8"))["records"]}
    authority = {"l1": L1.read_text(), "l3": L3.read_text(), "hat": HAT.read_text(), "hst": HST.read_text(), "visual": VISUAL.read_text()}
    hat_by_hr = {}
    visual_by_hat = {}
    visual_ids = set(re.findall(r"VIS-L(?:8|9|10|11)-[A-Z]\d+", authority["visual"]))
    for line in authority["hat"].splitlines():
        match = re.match(r"^\| (HAT-HIL-\d+) \|", line)
        if not match:
            continue
        hat_id = match.group(1)
        for hr_id in re.findall(r"HR-FR-HIL-\d+", line):
            hat_by_hr[hr_id] = hat_id
        visual_by_hat[hat_id] = sorted(set(re.findall(r"VIS-L(?:8|9|10|11)-[A-Z]\d+", line)) & visual_ids)
    hst_by_hil = collections.defaultdict(list)
    for line in authority["hst"].splitlines():
        match = re.match(r"^\| (HST-HIL-\d+) \|", line)
        if not match:
            continue
        for hil_id in re.findall(r"HIL-(?:BR|FR|TR|NFR)-\d+", line):
            if match.group(1) not in hst_by_hil[hil_id]:
                hst_by_hil[hil_id].append(match.group(1))
    schema = candidate["retention_schema"]
    findings = []
    counts = collections.Counter()
    manifests = []
    sha40 = re.compile(r"^[0-9a-f]{40}$")
    sha64 = re.compile(r"^[0-9a-f]{64}$")

    schema_issues = []
    for section, required in REQUIRED_SCHEMA.items():
        if not required.issubset(set(schema.get(section, []))):
            schema_issues.append(f"retention_schema_{section}_field_missing")
    if not {"secret", "credential", "PII", "unsanitized_raw_payload"}.issubset(set(schema.get("exclusions", []))):
        schema_issues.append("secret_pii_exclusion_incomplete")
    if candidate["retention_schema_sha256"] != compact_digest(schema):
        schema_issues.append("retention_schema_digest_mismatch")

    for row in candidate["records"]:
        source = reconciliation.get(row["pr_id"])
        route = row["test_oracle_route"]
        retention = row["historical_check_retention"]
        issues = list(schema_issues)
        all_ids = {
            "hil": (route["hil_ids"], authority["l1"]), "hr": (route["hr_ids"], authority["l3"]),
            "hat": (route["hat_ids"], authority["hat"]), "hst": (route["hst_ids"], authority["hst"]),
            "visual": (route["visual_test_ids"], authority["visual"]),
        }
        for kind, (ids, text) in all_ids.items():
            if any(identifier not in text for identifier in ids):
                issues.append(f"{kind}_reference_missing")
        expected_hat = sorted({hat_by_hr[identifier] for identifier in route["hr_ids"] if identifier in hat_by_hr})
        expected_hst = sorted({hst for identifier in route["hil_ids"] for hst in hst_by_hil.get(identifier, [])})
        expected_visual = sorted({visual for identifier in expected_hat for visual in visual_by_hat.get(identifier, [])})
        if route["hat_ids"] != expected_hat:
            issues.append("hr_hat_exact_edge_mismatch")
        if route["hst_ids"] != expected_hst:
            issues.append("hil_hst_exact_edge_mismatch")
        if route["visual_test_ids"] != expected_visual:
            issues.append("hat_visual_exact_edge_mismatch")
        family_routes = route.get("family_routes", [])
        exact_family_routes = [item for item in family_routes if item.get("status") == "family_specific_candidate_not_verified"]
        gaps = [item for item in family_routes if item.get("status") == "challenge_gap_obligation"]
        aligned = [item for item in family_routes if item.get("status") == "independent_review_aligned"]
        if sorted(item.get("family") for item in family_routes) != sorted(source["source_evidence"]["behavior_families"]):
            issues.append("behavior_family_route_denominator_mismatch")
        if route["oracle_route_status"] == "candidate_exact_ids_semantic_aligned_not_verified":
            if len(aligned) != len(family_routes) or route["hil_ids"] != source["final_candidate"]["hil_ids"] or route["hr_ids"] != source["final_candidate"]["hr_ids"]:
                issues.append("aligned_reconciliation_binding_mismatch")
        else:
            if aligned:
                issues.append("rerouted_record_contains_unreviewed_aligned_family")
            for item in exact_family_routes:
                item_hat = sorted({hat_by_hr[identifier] for identifier in item.get("hr_ids", []) if identifier in hat_by_hr})
                item_hst = sorted({hst for identifier in item.get("hil_ids", []) for hst in hst_by_hil.get(identifier, [])})
                if not item.get("hil_ids") or not item.get("hr_ids") or item.get("hat_ids") != item_hat or item.get("hst_ids") != item_hst:
                    issues.append("family_specific_exact_edge_mismatch")
                if not set(item.get("hil_ids", [])).issubset(source["final_candidate"]["hil_ids"]) or not set(item.get("hr_ids", [])).issubset(source["final_candidate"]["hr_ids"]):
                    issues.append("family_specific_reconciliation_intersection_mismatch")
            if route["hil_ids"] != sorted({identifier for item in exact_family_routes for identifier in item.get("hil_ids", [])}) or route["hr_ids"] != sorted({identifier for item in exact_family_routes for identifier in item.get("hr_ids", [])}):
                issues.append("family_specific_aggregate_route_mismatch")
            if route.get("challenge_gap_obligations") != gaps:
                issues.append("challenge_gap_projection_mismatch")
            for gap in gaps:
                if not gap.get("obligation_id") or not gap.get("required_resolution") or gap.get("hil_ids") or gap.get("hr_ids"):
                    issues.append("challenge_gap_obligation_incomplete")
            if gaps and route["oracle_route_status"] != "family_specific_partial_challenge_gap_not_verified":
                issues.append("partial_gap_status_mismatch")
            if not gaps and route["oracle_route_status"] != "family_specific_candidate_not_verified":
                issues.append("family_specific_status_mismatch")
        if route["visual_test_ids"] and "ui_visual" not in route.get("behavior_families", []):
            issues.append("visual_edge_without_visual_behavior")
        binding = retention["identity_binding"]
        if not sha40.fullmatch(binding.get("head_oid", "")) or not sha40.fullmatch(binding.get("merge_oid", "")):
            issues.append("git_sha_lineage_invalid")
        for field in ("pr_title_sha256", "commit_range_manifest_sha256", "changed_path_manifest_sha256", "behavior_family_manifest_sha256", "semantic_reconciliation_sha256"):
            if not sha64.fullmatch(binding.get(field, "")):
                issues.append("semantic_lineage_digest_invalid")
        expected = compact_digest({
            "pr_id": source["pr_id"], "head_oid": source["source_evidence"]["head_oid"],
            "merge_oid": source["source_evidence"]["merge_oid"], "title": source["title"],
            "commit_range_digest": source["source_evidence"]["commit_range_digest"],
            "changed_path_digest": source["source_evidence"]["changed_path_digest"],
            "behavior_families": source["source_evidence"]["behavior_families"],
            "final_candidate": source["final_candidate"], "route": route, "required_fields": schema,
        })
        if retention["expected_manifest_sha256"] != expected:
            issues.append("expected_manifest_digest_mismatch")
        manifests.append(retention["expected_manifest_sha256"])
        if any(row[key] for key in ("trusted", "current", "runtime_verified", "coverage_credit")):
            issues.append("forbidden_authority_or_coverage_credit")
        for issue in set(issues):
            counts[issue] += 1
        findings.append({
            "pr_id": row["pr_id"], "repository_id": row["repository_id"], "number": row["number"],
            "title": source["title"], "behavior_families": source["source_evidence"]["behavior_families"],
            "route_fingerprint_sha256": route.get("route_fingerprint_sha256"),
            "issues": sorted(set(issues)),
            "candidate_correction": "semantic_review_required_not_complete" if issues else "candidate_semantically_aligned_not_verified",
            "trusted": False, "current": False, "runtime_verified": False, "coverage_credit": False,
        })

    if len(set(manifests)) != 71:
        counts["expected_manifest_digest_not_unique"] += 71 - len(set(manifests))
    payload = {
        "schema_version": "helix.predecessor-pr-test-retention-routes-independent-review.v1",
        "status": "independent_review_complete_candidates_not_trusted",
        "sources": {
            "candidate": {"path": str(CANDIDATE.relative_to(ROOT)), "sha256": file_digest(CANDIDATE)},
            "reconciliation": {"path": str(RECON.relative_to(ROOT)), "sha256": file_digest(RECON)},
            **{key: {"path": str(path.relative_to(ROOT)), "sha256": file_digest(path)} for key, path in {"L1": L1, "L3": L3, "HAT": HAT, "HST": HST, "Visual": VISUAL}.items()},
        },
        "summary": {
            "records_reviewed": len(findings), "unique_pr_ids": len({r["pr_id"] for r in findings}),
            "unique_expected_manifest_sha256": len(set(manifests)), "issue_counts": dict(sorted(counts.items())),
            "records_with_findings": sum(bool(r["issues"]) for r in findings),
            "semantic_aligned_not_verified": sum(row["test_oracle_route"]["oracle_route_status"] == "candidate_exact_ids_semantic_aligned_not_verified" for row in candidate["records"]),
            "family_specific_not_verified": sum(row["test_oracle_route"]["oracle_route_status"] == "family_specific_candidate_not_verified" for row in candidate["records"]),
            "family_specific_partial_challenge_gap": sum(row["test_oracle_route"]["oracle_route_status"] == "family_specific_partial_challenge_gap_not_verified" for row in candidate["records"]),
            "challenge_gap_obligations": sum(len(row["test_oracle_route"].get("challenge_gap_obligations", [])) for row in candidate["records"]),
            "blocked_no_current_test_id": sum(not row["test_oracle_route"]["hat_ids"] and not row["test_oracle_route"]["hst_ids"] for row in candidate["records"]),
            "trusted": 0, "current": 0, "runtime_verified": 0, "coverage_credit_true": 0,
        },
        "schema_checks": {"required_field_groups": REQUIRED_SCHEMA, "secret_pii_exclusions_required": ["secret", "credential", "PII", "unsanitized_raw_payload"], "issues": schema_issues},
        "findings": findings,
    }
    assert len(findings) == 71 and len(set(manifests)) == 71
    assert not any(r["trusted"] or r["current"] or r["runtime_verified"] or r["coverage_credit"] for r in findings)
    encoded = (json.dumps(payload, ensure_ascii=False, indent=2, sort_keys=True, default=lambda value: sorted(value) if isinstance(value, set) else value) + "\n").encode()
    if args.check:
        if not OUTPUT.exists() or OUTPUT.read_bytes() != encoded:
            print(f"STALE: {OUTPUT.relative_to(ROOT)}")
            return 1
        print(f"OK: {OUTPUT.relative_to(ROOT)}")
        return 0
    OUTPUT.write_bytes(encoded)
    print(f"WROTE: {OUTPUT.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
