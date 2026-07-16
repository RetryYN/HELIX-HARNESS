#!/usr/bin/env python3
"""Reproduce the independent candidate-route and Design AC edge review receipt."""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import zipfile
from pathlib import Path

import yaml


ROOT = Path(__file__).resolve().parents[2]
PACKAGE_PREFIX = "HELIX-HYBRID-CORE-REQUIREMENTS-REBASELINE_v0.4.0/"
ROUTE_PATH = ROOT / "docs/governance/generated/helix-rebaseline-v040-zero-edge-routes-51-v1.json"
CLOSURE_PATH = ROOT / "docs/governance/design-harness-ac-closure-edges.yaml"
OUTPUT_PATH = ROOT / "docs/governance/generated/helix-rebaseline-v040-route51-design-ac18-review-v1.json"


def sha256_bytes(value: bytes) -> str:
    return hashlib.sha256(value).hexdigest()


def read(path: str) -> str:
    return (ROOT / path).read_text(encoding="utf-8")


def markdown_rows(text: str, prefix: str) -> dict[str, str]:
    rows: dict[str, str] = {}
    for line in text.splitlines():
        if match := re.match(rf"^\| ({re.escape(prefix)}\d+) \|", line):
            rows.setdefault(match.group(1), line)
    return rows


def expand_hil_ids(value: str) -> set[str]:
    ids: set[str] = set()
    for match in re.finditer(r"HIL-(BR|FR|TR|NFR)-(\d+(?:/\d+)*)", value):
        ids.update(f"HIL-{match.group(1)}-{number}" for number in match.group(2).split("/"))
    return ids


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--source-zip", required=True, type=Path)
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()

    zip_bytes = args.source_zip.read_bytes()
    source_digest = sha256_bytes(zip_bytes)
    routes = json.loads(ROUTE_PATH.read_text(encoding="utf-8"))
    closure = yaml.safe_load(CLOSURE_PATH.read_text(encoding="utf-8"))
    with zipfile.ZipFile(args.source_zip) as archive:
        catalog_bytes = archive.read(PACKAGE_PREFIX + "requirements/requirements-catalog.yaml")
        ac_bytes = archive.read(PACKAGE_PREFIX + "requirements/acceptance-criteria.yaml")
        trace_bytes = archive.read(PACKAGE_PREFIX + "requirements/traceability.yaml")
    catalog = yaml.safe_load(catalog_bytes)
    source_acs = yaml.safe_load(ac_bytes)
    source_trace = yaml.safe_load(trace_bytes)

    catalog_by_id = {row["id"]: row for row in catalog["requirements"]}
    source_ac_ids = {row["id"] for row in source_acs["acceptance_criteria"]}
    refined_targets = {
        edge["to"] for edge in source_trace["edges"] if edge["type"] == "refined_into"
    }
    zero_edge_ids = set(catalog_by_id) - refined_targets

    l1 = read("docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md")
    l3 = read("docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md")
    l4 = read("docs/design/helix/L4-basic-design/infinity-loop-platform-basic-design.md")
    design_trace = read("docs/governance/design-harness-requirement-trace-ledger.md")
    assertions = read("docs/governance/infinity-loop-assertion-coverage-ledger.md")
    hat = read("docs/test-design/helix/L3-infinity-loop-acceptance-test-design.md")
    visual = "\n".join(
        [
            read("docs/test-design/helix/L8-L11-visual-design-harness-verification.md"),
            read("docs/governance/visual-design-harness-verification-ledger.md"),
        ]
    )
    l1_ids = set(re.findall(r"^\| \*\*(HIL-(?:BR|FR|TR|NFR)-\d+)\*\* \|", l1, re.M))
    l3_rows = markdown_rows(l3, "HR-FR-HIL-")
    hat_rows = markdown_rows(hat, "HAT-HIL-")

    design_trace_rows: dict[str, list[str]] = {}
    for line in design_trace.splitlines():
        if match := re.match(r"^\| (HBR-DH-\d+) \|", line):
            design_trace_rows[match.group(1)] = [cell.strip() for cell in line.strip("|").split("|")]

    route_reviews = []
    route_errors = []
    disposition_counts: dict[str, int] = {}
    for row in routes["rows"]:
        requirement_id = row["requirement_id"]
        source = catalog_by_id.get(requirement_id)
        errors: list[str] = []
        if source is None:
            errors.append("catalog_requirement_missing")
        else:
            if source["statement"] != row["statement"] or source["title"] != row["title"]:
                errors.append("catalog_semantic_payload_mismatch")
            actual_refs = sorted(atom["source_ref"] for atom in row["source_atoms"])
            if sorted(source["sources"]) != actual_refs:
                errors.append("source_ref_set_mismatch")
        if requirement_id not in zero_edge_ids:
            errors.append("not_in_recomputed_zero_edge_set")
        target_count = len(row["targets"]["requirement_ids"])
        if row["area"] == "design_harness":
            trace_row = design_trace_rows.get(requirement_id)
            if trace_row is None:
                errors.append("design_trace_row_missing")
            else:
                expected = next((value for value in ("redesign", "harden", "adopt") if trace_row[-1].startswith(value)), None)
                if expected != row["disposition"]:
                    errors.append("candidate_disposition_mismatch")
                trace_targets = expand_hil_ids(trace_row[3])
                for target in row["targets"]["requirement_ids"]:
                    if target not in l1_ids or target not in trace_targets:
                        errors.append(f"target_requirement_mismatch:{target}")
                for component in row["targets"]["component_ids"]:
                    if component not in trace_row[4]:
                        errors.append(f"component_mismatch:{component}")
                for candidate in row["targets"]["verification_candidate_ids"]:
                    if candidate not in trace_row[5]:
                        errors.append(f"verification_candidate_mismatch:{candidate}")
        elif row["disposition"] != "defer" or target_count != 0:
            errors.append("unreviewed_non_design_route_must_remain_deferred_and_unbound")
        if row["coverage"] is not False or row["authority"]["status"] != "pending_independent_review":
            errors.append("candidate_authority_or_coverage_escalation")
        disposition_counts[row["disposition"]] = disposition_counts.get(row["disposition"], 0) + 1
        route_errors.extend(f"{requirement_id}:{error}" for error in errors)
        route_reviews.append(
            {
                "requirement_id": requirement_id,
                "disposition": row["disposition"],
                "semantic_review": "pass" if not errors else "fail",
                "target_count": target_count,
                "coverage_credit": False,
                "errors": errors,
            }
        )

    closure_reviews = []
    closure_errors = []
    for edge in closure["edges"]:
        errors: list[str] = []
        source_ac_id = edge["source_ac_id"]
        if source_ac_id not in source_ac_ids:
            errors.append("source_ac_missing_from_archive")
        l3_lines = [l3_rows.get(identifier, "") for identifier in edge["l3_requirement_ids"]]
        if any(not line for line in l3_lines):
            errors.append("l3_requirement_missing")
        for l1_id in edge["l1_requirement_ids"]:
            if l1_id not in l1_ids:
                errors.append(f"l1_requirement_missing:{l1_id}")
            if not any(l1_id in line for line in l3_lines):
                errors.append(f"l1_to_l3_join_missing:{l1_id}")
            assertion_line = next((line for line in assertions.splitlines() if line.startswith(f"| {l1_id} |")), "")
            if not assertion_line:
                errors.append(f"assertion_or_l4_component_missing:{l1_id}")
            else:
                component_cell = assertion_line.strip("|").split("|")[-3].strip()
                for component in [value.strip() for value in component_cell.split(";")]:
                    if component and component not in l4 and component not in design_trace:
                        errors.append(f"l4_obligation_missing:{l1_id}:{component}")
        for hac_id in edge["hac_ids"]:
            if not any(hac_id in line for line in l3_lines):
                errors.append(f"hac_to_l3_join_missing:{hac_id}")
            if not any(hac_id in line for line in hat_rows.values()):
                errors.append(f"hac_to_hat_join_missing:{hac_id}")
        for test_id in edge["test_ids"]:
            if test_id.startswith("HAT-") and test_id not in hat_rows:
                errors.append(f"hat_missing:{test_id}")
            if test_id.startswith("VIS-") and test_id not in visual:
                errors.append(f"visual_responsibility_missing:{test_id}")
        closure_errors.extend(f"{source_ac_id}:{error}" for error in errors)
        closure_reviews.append(
            {
                "source_ac_id": source_ac_id,
                "closure_case_id": edge["closure_case_id"],
                "primary_layer": edge["primary_layer"],
                "semantic_review": "pass" if not errors else "fail",
                "execution_state": "designed_not_executed",
                "coverage_credit": False,
                "errors": errors,
            }
        )

    invariant_errors = []
    if source_digest != routes["source_package_sha256"] or source_digest != closure["source_digest"].removeprefix("sha256:"):
        invariant_errors.append("source_archive_digest_mismatch")
    if len(routes["rows"]) != 51 or set(row["requirement_id"] for row in routes["rows"]) != zero_edge_ids:
        invariant_errors.append("route51_denominator_or_set_mismatch")
    if disposition_counts != {"adopt": 12, "defer": 32, "harden": 3, "redesign": 4}:
        invariant_errors.append("disposition_count_mismatch")
    if len(closure["edges"]) != 18 or len({edge["source_ac_id"] for edge in closure["edges"]}) != 18:
        invariant_errors.append("design_ac18_denominator_or_uniqueness_mismatch")
    if closure["coverage_credit"] is not False or closure["execution_state"] != "designed_not_executed":
        invariant_errors.append("closure_authority_or_execution_escalation")

    all_errors = invariant_errors + route_errors + closure_errors
    receipt = {
        "artifact_id": "HELIX-REBASELINE-V040-ROUTE51-DESIGN-AC18-REVIEW-V1",
        "schema_version": "helix.rebaseline.route51-design-ac18-review.v1",
        "status": "independent_semantic_review_pass_candidate_only" if not all_errors else "independent_semantic_review_fail",
        "authority": "review-only-no-freeze-no-execution",
        "source_package_sha256": source_digest,
        "input_digests": {
            "requirements_catalog_sha256": sha256_bytes(catalog_bytes),
            "acceptance_criteria_sha256": sha256_bytes(ac_bytes),
            "traceability_sha256": sha256_bytes(trace_bytes),
            "route_candidate_sha256": sha256_bytes(ROUTE_PATH.read_bytes()),
            "design_ac_closure_sha256": sha256_bytes(CLOSURE_PATH.read_bytes()),
        },
        "route_review": {
            "denominator": 51,
            "reviewed": len(route_reviews),
            "disposition_counts": disposition_counts,
            "verified_source_edge_count": 0,
            "residual_unverified_source_edge_count": 51,
            "coverage_credit": False,
            "classification_errors": len(route_errors),
            "rows": route_reviews,
        },
        "design_ac_closure_review": {
            "denominator": 18,
            "reviewed": len(closure_reviews),
            "executed": 0,
            "verified": 0,
            "coverage_credit": False,
            "edge_errors": len(closure_errors),
            "rows": closure_reviews,
        },
        "invariants": {
            "candidate_is_not_verified": True,
            "execution_remains_zero": True,
            "authority_escalation_detected": any("authority" in error for error in all_errors),
            "errors": invariant_errors,
        },
    }
    rendered = (json.dumps(receipt, ensure_ascii=False, sort_keys=True, separators=(",", ":")) + "\n").encode()
    if args.check:
        if not OUTPUT_PATH.exists() or OUTPUT_PATH.read_bytes() != rendered:
            raise SystemExit("review receipt replay mismatch")
    else:
        OUTPUT_PATH.write_bytes(rendered)
    print(json.dumps({"status": receipt["status"], "route_rows": len(route_reviews), "closure_rows": len(closure_reviews), "errors": len(all_errors), "output_sha256": sha256_bytes(rendered)}, ensure_ascii=False))
    return 0 if not all_errors else 1


if __name__ == "__main__":
    raise SystemExit(main())
