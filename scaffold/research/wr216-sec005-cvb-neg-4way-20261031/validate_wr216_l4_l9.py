#!/usr/bin/env python3
"""Static validator for WR216 SEC005 credential-value-boundary L4/L9 negative classifications (PR-A R3)."""

from __future__ import annotations

import hashlib
import json
import subprocess
import sys
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[3]
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


def resolve_json_pointer(doc: Any, pointer: str) -> Any:
    if pointer == "" or pointer == "#":
        return doc
    if pointer.startswith("#"):
        pointer = pointer[1:]
    if not pointer.startswith("/"):
        raise ValueError(f"Invalid JSON Pointer: {pointer}")
    cur = doc
    for raw_token in pointer.split("/")[1:]:
        token = raw_token.replace("~1", "/").replace("~0", "~")
        if isinstance(cur, list):
            cur = cur[int(token)]
        elif isinstance(cur, dict):
            if token not in cur:
                raise KeyError(f"Token {token!r} not found at {pointer}")
            cur = cur[token]
        else:
            raise TypeError(f"Cannot traverse {type(cur)} at {pointer}")
    return cur


def load_git_json(rev: str, rel_path: str) -> Any:
    out = subprocess.check_output(["git", "-C", str(ROOT), "show", f"{rev}:{rel_path}"])
    return json.loads(out.decode("utf-8"))


def main() -> int:
    failures: list[str] = []

    # 1. Verify frozen blind-derivation.json (R1 history) and blind-derivation-r2.json (R2 fresh blind derivation)
    blind_r1_sha = hashlib.sha256(BLIND_R1_PATH.read_bytes()).hexdigest()
    if blind_r1_sha != EXPECTED_BLIND_R1_SHA256:
        failures.append(
            f"blind_r1_sha256_mismatch: {blind_r1_sha} != {EXPECTED_BLIND_R1_SHA256}"
        )
    blind_r2_sha = hashlib.sha256(BLIND_R2_PATH.read_bytes()).hexdigest()
    if blind_r2_sha != EXPECTED_BLIND_R2_SHA256:
        failures.append(
            f"blind_r2_sha256_mismatch: {blind_r2_sha} != {EXPECTED_BLIND_R2_SHA256}"
        )

    blind_r2 = json.loads(BLIND_R2_PATH.read_text(encoding="utf-8"))
    l4 = json.loads((ROOT / L4_REL).read_text(encoding="utf-8"))
    l9 = json.loads((ROOT / L9_REL).read_text(encoding="utf-8"))
    l5 = json.loads((ROOT / L5_REL).read_text(encoding="utf-8"))
    l8 = json.loads((ROOT / L8_REL).read_text(encoding="utf-8"))
    comp = json.loads(COMP_PATH.read_text(encoding="utf-8"))

    # Verify prior R2 Step A freeze (59457953..., comment 6534537441) is recorded in comparison.json
    prior_freeze = comp.get("pre_comparison_freeze_r2", {}).get(
        "prior_step_a_freeze", {}
    )
    if prior_freeze.get("sha256") != EXPECTED_BLIND_R2_PRIOR_SHA256:
        failures.append("prior_step_a_freeze_sha256_mismatch")
    if (
        prior_freeze.get("issue_comment_url")
        != "https://github.com/RetryYN/HELIX-HARNESS/issues/3510#issuecomment-6534537441"
    ):
        failures.append("prior_step_a_freeze_comment_url_mismatch")
    if (
        prior_freeze.get("derived_by", {}).get("session_id")
        != "ca41e156-9926-495d-bb4c-e87ecb1d7a24"
    ):
        failures.append("prior_step_a_freeze_session_id_mismatch")
    if len(prior_freeze.get("prior_17_classifications_inventory", [])) != 17:
        failures.append("prior_step_a_freeze_inventory_count_mismatch")
    if (
        len(
            prior_freeze.get("diff_from_59457953_to_92670bde", {}).get(
                "contract_diffs", []
            )
        )
        != 3
    ):
        failures.append("prior_step_a_freeze_contract_diffs_mismatch")

    # Verify all 24 candidates in blind-derivation-r2.json are compared in comparison.json
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
        failures.append(
            f"r2_blind_24_comparison_mismatch: {len(r2_ids)} vs {len(comp_r2_ids)}"
        )

    # 2. Verify composite_class_formation in L4 and preservation against base_main_sha
    ccf = l4.get("diagnostic_contract", {}).get("composite_class_formation")
    required_ccf_keys = {
        "purpose",
        "finding_sequence",
        "axis_projection",
        "overall_classification",
        "expected_state",
        "class_reuse",
        "non_goals",
    }
    if not isinstance(ccf, dict) or not required_ccf_keys.issubset(ccf.keys()):
        failures.append("l4_missing_or_incomplete_composite_class_formation")

    base_rev = comp["base_main_sha"]
    l4_base = load_git_json(base_rev, L4_REL)
    l9_base = load_git_json(base_rev, L9_REL)

    l4_copy = json.loads(json.dumps(l4))
    l4_copy.pop("failure_classifications", None)
    l4_copy.get("diagnostic_contract", {}).pop("composite_class_formation", None)
    if (
        l4_copy.get("remaining", [])[:4] != l4_base.get("remaining", [])
        or len(l4_copy.get("remaining", [])) != 7
    ):
        failures.append("l4_remaining_base_mismatch")
    l4_copy["remaining"] = l4_base["remaining"]
    for c in l4_copy.get("contracts", []):
        c.pop("negative_classifications", None)
        c.pop("unit_only_negative_classifications", None)
        c.pop("invariant_non_class_dispositions", None)
        c.pop("negative_classifications_disposition", None)
    if l4_copy != l4_base:
        failures.append("l4_existing_fields_modified")

    l9_copy = json.loads(json.dumps(l9))
    l9_copy.pop("negative_class_assignment_audit", None)
    if (
        l9_copy.get("remaining", [])[:4] != l9_base.get("remaining", [])
        or len(l9_copy.get("remaining", [])) != 7
    ):
        failures.append("l9_remaining_base_mismatch")
    l9_copy["remaining"] = l9_base["remaining"]
    for c in l9_copy.get("cases", []):
        for nc in c.get("negative_cases", []):
            nc.pop("negative_class_assignment", None)
            nc.pop("negative_class_ref", None)
    if l9_copy != l9_base:
        failures.append("l9_existing_fields_or_cases_modified")

    # 3. Verify L4 classes (17 in F01, 9 in F02, 0 in B01, 26 total) and no downward refs
    c0_neg = l4["contracts"][0].get("negative_classifications", [])
    c1_neg = l4["contracts"][1].get("negative_classifications", [])
    c2_neg = l4["contracts"][2].get("negative_classifications", [])
    top_fc = l4.get("failure_classifications", [])
    if (len(c0_neg), len(c1_neg), len(c2_neg), len(top_fc)) != (17, 9, 0, 26):
        failures.append(
            f"unexpected_l4_class_counts: {(len(c0_neg), len(c1_neg), len(c2_neg), len(top_fc))}"
        )

    doc_cache: dict[str, Any] = {L4_REL: l4, L9_REL: l9, L5_REL: l5, L8_REL: l8}

    def check_pointer_list(
        ptrs: list[dict[str, str]], forbid_downward: bool = False
    ) -> None:
        for p_obj in ptrs:
            rel = p_obj["path"]
            ptr = p_obj["pointer"]
            if forbid_downward and any(
                layer_tag in rel for layer_tag in ("L5-", "L8-", "L9-")
            ):
                failures.append(f"downward_reference_in_l4: {rel}#{ptr}")
            if rel not in doc_cache:
                doc_cache[rel] = json.loads((ROOT / rel).read_text(encoding="utf-8"))
            try:
                resolve_json_pointer(doc_cache[rel], ptr)
            except Exception as exc:
                failures.append(f"broken_pointer: {rel}#{ptr} ({exc})")

    l4_class_by_code: dict[str, tuple[int, int, dict[str, Any]]] = {}
    for ci, c_neg in enumerate([c0_neg, c1_neg, c2_neg]):
        for idx, cr in enumerate(c_neg):
            code = cr["code"]
            if code in l4_class_by_code:
                failures.append(f"duplicate_l4_class_code: {code}")
            l4_class_by_code[code] = (ci, idx, cr)
            check_pointer_list(cr["source_pointers"], forbid_downward=True)
            fcs = cr["expected"]["finding_codes"]
            axis = cr["axis"]
            if len(fcs) == 1 and not isinstance(axis, str):
                failures.append(f"single_finding_axis_not_str: {code} -> {axis}")
            if len(fcs) > 1 and (
                not isinstance(axis, list) or len(axis) != len(fcs)
            ):
                failures.append(
                    f"composite_finding_axis_not_ordered_list: {code} -> {axis} vs {fcs}"
                )

    for tr in top_fc:
        check_pointer_list(tr["source_pointers"], forbid_downward=True)
        code = tr["class_id"]
        if code in l4_class_by_code:
            _, _, cr = l4_class_by_code[code]
            if tr.get("expected_axis") != cr.get("axis") or tr.get(
                "expected_state"
            ) != cr.get("state"):
                failures.append(f"top_fc_axis_or_state_mismatch: {code}")

    # Check specific composite classes highlighted in R2 F2 Major
    expiry_comp = l4_class_by_code.get(
        "SEC005_F01_CAPABILITY_EXPIRY_BINDING_AND_OBSERVATION_UNRESOLVED"
    )
    if (
        not expiry_comp
        or expiry_comp[2].get("axis")
        != ["use_binding_state", "capability_state_projection"]
    ):
        failures.append("expiry_composite_class_missing_second_axis")
    for cls_code in (
        "SEC005_F01_REQUEST_CLASSIFICATION_BINDING_AND_CLASS_UNRESOLVED",
        "SEC005_F01_REQUEST_CLASSIFICATION_CONFLICT_AND_CLASS_UNRESOLVED",
    ):
        cls_comp = l4_class_by_code.get(cls_code)
        if not cls_comp or cls_comp[2].get("axis") != [
            "use_binding_state",
            "use_binding_state",
        ]:
            failures.append(f"classification_composite_axis_mismatch: {cls_code}")

    for u_item in l4["contracts"][0].get("unit_only_negative_classifications", []):
        check_pointer_list(u_item["source_pointers"], forbid_downward=True)
        if (
            u_item.get("axis") != "use_binding_state"
            or u_item.get("state") != "unresolved"
        ):
            failures.append("unit_only_class_unresolved_missing_axis_or_state")
    for inv_item in l4["contracts"][1].get("invariant_non_class_dispositions", []):
        check_pointer_list(inv_item["source_pointers"], forbid_downward=True)
    for b_item in (
        l4["contracts"][2]
        .get("negative_classifications_disposition", {})
        .get("families", [])
    ):
        check_pointer_list(b_item["source_pointers"], forbid_downward=True)

    # 4. Verify L9 assignments and audit counts (69 assigned, 0 unassigned)
    audit = l9.get("negative_class_assignment_audit", {})
    member_counts = {code: 0 for code in l4_class_by_code}
    assigned_total = 0
    unassigned_ids: list[str] = []

    for ci, c in enumerate(l9["cases"]):
        for ni, nc in enumerate(c["negative_cases"]):
            asgn = nc.get("negative_class_assignment")
            ref = nc.get("negative_class_ref")
            if asgn is None or ref is None:
                unassigned_ids.append(nc["id"])
                continue
            assigned_total += 1
            code = asgn["classification"]
            if ref != code:
                failures.append(
                    f"negative_class_ref_mismatch: {nc['id']} {ref} != {code}"
                )
            if code not in l4_class_by_code:
                failures.append(f"unknown_classification_in_l9: {nc['id']} -> {code}")
                continue
            member_counts[code] += 1
            l4_ci, l4_idx, cr = l4_class_by_code[code]
            if l4_ci != ci:
                failures.append(
                    f"contract_mismatch: {nc['id']} in contract {ci} assigned to {code} in contract {l4_ci}"
                )
            ep = nc["expected_proposal"]
            if ep["condition"] != cr["expected"]["condition"]:
                failures.append(f"condition_mismatch: {nc['id']}")
            if [f["code"] for f in ep["findings"]] != cr["expected"]["finding_codes"]:
                failures.append(f"finding_codes_mismatch: {nc['id']}")
            axis = cr["axis"]
            if isinstance(axis, str):
                if ep.get(axis) != cr["state"]:
                    failures.append(
                        f"axis_state_mismatch: {nc['id']} {axis}={ep.get(axis)} vs {cr['state']}"
                    )
            elif isinstance(axis, list):
                if ep.get(axis[0]) != cr["state"]:
                    failures.append(
                        f"leading_axis_state_mismatch: {nc['id']} {axis[0]}={ep.get(axis[0])} vs {cr['state']}"
                    )
                if (
                    code
                    == "SEC005_F01_CAPABILITY_EXPIRY_BINDING_AND_OBSERVATION_UNRESOLVED"
                    and ep.get(axis[1]) != "unknown"
                ):
                    failures.append(
                        f"second_axis_state_mismatch: {nc['id']} {axis[1]}={ep.get(axis[1])} != unknown"
                    )
            else:
                failures.append(f"invalid_axis_type: {nc['id']} {axis}")
            for f_obj in ep["findings"]:
                if f_obj["return_owner"] != cr["backflow_owner"]:
                    failures.append(f"return_owner_mismatch: {nc['id']}")
            check_pointer_list(asgn["source_pointers"], forbid_downward=False)

    if assigned_total != 69:
        failures.append(f"expected_69_assigned_got_{assigned_total}")
    if len(unassigned_ids) != 0:
        failures.append(f"expected_0_unassigned_got_{len(unassigned_ids)}")
    if any(cnt == 0 for cnt in member_counts.values()):
        failures.append(f"zero_member_class_detected: {member_counts}")
    if audit.get("class_member_count_by_code") != member_counts:
        failures.append("audit_class_member_count_mismatch")
    if audit.get("unassigned_single_contract_negative_cases") != []:
        failures.append("expected_empty_unassigned_single_contract_negative_cases")

    # 5. Verify L8 vs L9 arithmetic in audit
    f01_deltas = sum(
        x["delta_l9_minus_l8"]
        for x in audit["l8_vs_l9_granularity_classification"][
            "f01_l8_33_vs_l9_55_diff_plus_22"
        ]
    )
    f02_deltas = sum(
        x["delta_l9_minus_l8"]
        for x in audit["l8_vs_l9_granularity_classification"][
            "f02_l8_9_vs_l9_14_diff_plus_5"
        ]
    )
    b01_deltas = sum(
        x["delta_l9_minus_l8"]
        for x in audit["l8_vs_l9_granularity_classification"][
            "b01_l8_1_vs_l9_0_diff_minus_1"
        ]
    )
    if (33 + f01_deltas, 9 + f02_deltas, 1 + b01_deltas) != (55, 14, 0):
        failures.append(
            f"l8_vs_l9_delta_sum_mismatch: {(33 + f01_deltas, 9 + f02_deltas, 1 + b01_deltas)}"
        )

    report = {
        "passed": len(failures) == 0,
        "blind_r1_sha256": blind_r1_sha,
        "blind_r2_prior_sha256": prior_freeze.get("sha256"),
        "blind_r2_sha256": blind_r2_sha,
        "l4_class_count": len(top_fc),
        "l9_assigned_count": assigned_total,
        "l9_unassigned_count": len(unassigned_ids),
        "zero_member_classes": [k for k, v in member_counts.items() if v == 0],
        "failures": failures,
    }
    print(json.dumps(report, indent=2, ensure_ascii=False))
    return 0 if not failures else 1


if __name__ == "__main__":
    sys.exit(main())
