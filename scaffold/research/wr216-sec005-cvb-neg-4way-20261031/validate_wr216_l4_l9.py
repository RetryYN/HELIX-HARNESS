#!/usr/bin/env python3
"""Static validator for WR216/WR264 SEC005 credential-value-boundary explicit 4-way negative classifications."""

from __future__ import annotations

import hashlib
import json
import subprocess
import sys
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[3]
sys.path.insert(0, str(ROOT / "scaffold/tools"))
import design_verification_checker as dvc  # noqa: E402

BLIND_R1_PATH = (
    ROOT / "scaffold/research/wr216-sec005-cvb-neg-4way-20261031/blind-derivation.json"
)
BLIND_R2_PATH = (
    ROOT
    / "scaffold/research/wr216-sec005-cvb-neg-4way-20261031/blind-derivation-r2.json"
)
COMP_PATH = (
    ROOT / "scaffold/research/wr216-sec005-cvb-neg-4way-20261031/comparison.json"
)
L4_REL = "docs/helix-security/L4-basic-design/credential-value-boundary.json"
L9_REL = (
    "docs/helix-security/L9-integration-verification/credential-value-boundary.json"
)
L5_REL = "docs/helix-security/L5-detail-design/credential-value-boundary.json"
L8_REL = "docs/helix-security/L8-unit-verification/credential-value-boundary.json"

EXPECTED_BLIND_R1_SHA256 = (
    "b18b662713eb94c3d6bc5a3443128c6c8112f61308886647d0d1f2372f754bf6"
)
EXPECTED_BLIND_R2_PRIOR_SHA256 = (
    "5945795304fd043dbfddea54322fc943ea8c1cca9b1a7d2aa3a9a6f120261f09"
)
EXPECTED_BLIND_R2_SHA256 = (
    "92670bdec0283d3700bb871751487c92f93ec025d2995eab002236cb8fadb85f"
)
PR3980_L4_BYTES = 222017
PR3980_L9_BYTES = 755453


def main() -> int:
    failures: list[str] = []

    # 1. Verify frozen blind-derivation.json and blind-derivation-r2.json
    blind_r1_sha = hashlib.sha256(BLIND_R1_PATH.read_bytes()).hexdigest()
    if blind_r1_sha != EXPECTED_BLIND_R1_SHA256:
        failures.append(f"blind_r1_sha256_mismatch: {blind_r1_sha}")
    blind_r2_sha = hashlib.sha256(BLIND_R2_PATH.read_bytes()).hexdigest()
    if blind_r2_sha != EXPECTED_BLIND_R2_SHA256:
        failures.append(f"blind_r2_sha256_mismatch: {blind_r2_sha}")

    blind_r2 = json.loads(BLIND_R2_PATH.read_text(encoding="utf-8"))
    l4_bytes = (ROOT / L4_REL).read_bytes()
    l9_bytes = (ROOT / L9_REL).read_bytes()
    l5_bytes = (ROOT / L5_REL).read_bytes()
    l8_bytes = (ROOT / L8_REL).read_bytes()

    l4 = json.loads(l4_bytes.decode("utf-8"))
    l9 = json.loads(l9_bytes.decode("utf-8"))
    l5 = json.loads(l5_bytes.decode("utf-8"))
    l8 = json.loads(l8_bytes.decode("utf-8"))
    comp = json.loads(COMP_PATH.read_text(encoding="utf-8"))

    # 2. Verify prior R2 Step A freeze and 24 blind candidates in comparison.json
    prior_freeze = comp.get("pre_comparison_freeze_r2", {}).get(
        "prior_step_a_freeze", {}
    )
    if prior_freeze.get("sha256") != EXPECTED_BLIND_R2_PRIOR_SHA256:
        failures.append("prior_step_a_freeze_sha256_mismatch")
    r2_ids = [
        item["classification_id"]
        for c in blind_r2.get("contracts", [])
        for item in c.get("negative_failure_classifications", [])
    ]
    comp_r2_ids = [
        item["r2_classification_id"]
        for item in comp.get("r2_blind_24_root_by_root_comparison", [])
    ]
    if len(r2_ids) != 24 or r2_ids != comp_r2_ids:
        failures.append("r2_blind_24_comparison_mismatch")

    # 3. Verify L4 folded single table, new_parent_link, and byte reduction vs #3980 merge
    if len(l4_bytes) >= PR3980_L4_BYTES:
        failures.append(f"l4_bytes_not_reduced: {len(l4_bytes)} >= {PR3980_L4_BYTES}")
    if len(l9_bytes) >= PR3980_L9_BYTES:
        failures.append(f"l9_bytes_not_reduced: {len(l9_bytes)} >= {PR3980_L9_BYTES}")
    for ci, c in enumerate(l4.get("contracts", [])):
        if "negative_classifications" in c:
            failures.append(f"l4_contract_{ci}_still_has_negative_classifications")
        if "unit_only_negative_classifications" in c:
            failures.append(
                f"l4_contract_{ci}_still_has_unit_only_negative_classifications"
            )
    c_refs = [len(c.get("negative_class_refs", [])) for c in l4.get("contracts", [])]
    top_fc = l4.get("failure_classifications", [])
    if (c_refs, len(top_fc)) != ([17, 9, 0], 26):
        failures.append(f"unexpected_l4_folded_counts: {(c_refs, len(top_fc))}")
    if l4.get("negative_equivalence_classes") != {
        "source_rows": "failure_classifications"
    }:
        failures.append("l4_missing_negative_equivalence_classes_marker")

    # Verify zero L8 references in L4 and L9
    if "L8-unit-verification" in l4_bytes.decode("utf-8"):
        failures.append("l4_contains_l8_reference")
    if "L8-unit-verification" in l9_bytes.decode("utf-8"):
        failures.append("l9_contains_l8_reference")

    # 4. Verify L5 failure_rules (26) and unit_case_rows (37) and L8 unit_cases (69) + standalone_unit_cases (37)
    if l5.get("negative_equivalence_classes") != {"source_rows": "failure_rules"}:
        failures.append("l5_missing_negative_equivalence_classes_marker")
    if len(l5.get("failure_rules", [])) != 26:
        failures.append(
            f"l5_failure_rules_count_mismatch: {len(l5.get('failure_rules', []))}"
        )
    if len(l5.get("unit_case_rows", [])) != 37:
        failures.append(
            f"l5_unit_case_rows_count_mismatch: {len(l5.get('unit_case_rows', []))}"
        )
    if len(l9.get("negative_equivalence_classes", [])) != 26:
        failures.append("l9_neg_eq_classes_count_mismatch")
    if len(l9.get("integration_cases", [])) != 69:
        failures.append("l9_integration_cases_count_mismatch")
    if len(l8.get("negative_equivalence_classes", [])) != 26:
        failures.append("l8_neg_eq_classes_count_mismatch")
    if len(l8.get("unit_cases", [])) != 69:
        failures.append("l8_unit_cases_count_mismatch")
    if len(l8.get("standalone_unit_cases", [])) != 37:
        failures.append("l8_standalone_unit_cases_count_mismatch")
    if "literal_materialization_contract" in l8:
        failures.append("l8_still_has_literal_materialization_contract")

    # 5. Run design_verification_checker check-child and pointer checks across all 4 files
    out = subprocess.check_output(
        [
            sys.executable,
            str(ROOT / "scaffold/tools/design_verification_checker.py"),
            "check-child",
            "--root",
            str(ROOT),
            "--l4",
            L4_REL,
            "--l9",
            L9_REL,
            "--l5",
            L5_REL,
            "--l8",
            L8_REL,
        ],
        text=True,
    )
    child_rep = json.loads(out)
    if not child_rep.get("passed"):
        failures.append("check_child_failed")
    neg4 = child_rep.get("negative_4way", {})
    if (
        neg4.get("comparison_mode") != "explicit_negative_equivalence_classes"
        or neg4.get("parent_link_mode") != "new_parent_link"
        or not neg4.get("passed")
        or len(neg4.get("failures", [])) != 0
    ):
        failures.append("negative_4way_explicit_check_failed")

    for rel in (L4_REL, L9_REL, L5_REL, L8_REL):
        ptr_res = dvc.check_json_pointer(ROOT, rel)
        if not ptr_res.get("passed"):
            failures.append(f"json_pointer_check_failed:{rel}")

    report = {
        "passed": len(failures) == 0,
        "blind_r1_sha256": blind_r1_sha,
        "blind_r2_prior_sha256": prior_freeze.get("sha256"),
        "blind_r2_sha256": blind_r2_sha,
        "l4_bytes": len(l4_bytes),
        "l9_bytes": len(l9_bytes),
        "l5_bytes": len(l5_bytes),
        "l8_bytes": len(l8_bytes),
        "comparison_mode": neg4.get("comparison_mode"),
        "parent_link_mode": neg4.get("parent_link_mode"),
        "matched_case_count": neg4.get("matched_case_count"),
        "standalone_unit_case_count": len(l8.get("standalone_unit_cases", [])),
        "failures": failures,
    }
    print(json.dumps(report, indent=2, ensure_ascii=False))
    return 0 if not failures else 1


if __name__ == "__main__":
    sys.exit(main())
