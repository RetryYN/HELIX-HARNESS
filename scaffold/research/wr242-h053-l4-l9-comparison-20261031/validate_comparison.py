#!/usr/bin/env python3
"""Read-only integrity check for the frozen WR242 comparison and R1 addendum."""
from __future__ import annotations

import hashlib
import json
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
HERE = Path(__file__).resolve().parent
BASE = "dd07a3498be74f32519adf42a221caf51e547ea1"
LATEST_MAIN = "216c22400e2823eff6126982a44459b4a938fe70"
BLIND_SHA = "5e69cd0c3c472090947fec9454d892ffa2caa24ed0aa2a1b2540f7d9c18f408b"
COMPARISON_SHA = "ee245db3d4dab87aea212c6fe2f5f44f00f34fbfcd35faebb63fdd5fe88aa437"
SUMMARY_SHA = "a025836db3757b3dded20ff6407a73064d18ac515b20922122c232c95ae6ffb9"
BASE_CHECKER_SHA = "cfd12c5bc4a1dd45351858488b476af0025d35deca7027da35bb1373818b129d"
LATEST_CHECKER_SHA = "e751526d67cd8df11e5aac1c5a1a178dfbd0fecc3f2ed21f995b7dda11ea4d5d"


def sha(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def load(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def git_blob(revision: str, path: str) -> bytes:
    return subprocess.run(
        ["git", "show", f"{revision}:{path}"], cwd=ROOT, check=True,
        stdout=subprocess.PIPE, stderr=subprocess.PIPE,
    ).stdout


def pointer(value, pointer: str):
    current = value
    for token in pointer.lstrip("/").split("/") if pointer else []:
        token = token.replace("~1", "/").replace("~0", "~")
        current = current[int(token)] if isinstance(current, list) else current[token]
    return current


def canonical_hash(value) -> str:
    data = json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode()
    return sha(data)


def main() -> None:
    blind_path = HERE / "blind-source-only.json"
    comparison_path = HERE / "comparison.json"
    summary_path = HERE / "verification-summary.json"
    addendum_path = HERE / "review-r1-addendum.json"
    blind_raw, comparison_raw, summary_raw = (
        blind_path.read_bytes(), comparison_path.read_bytes(), summary_path.read_bytes()
    )
    assert sha(blind_raw) == BLIND_SHA
    assert sha(comparison_raw) == COMPARISON_SHA
    assert sha(summary_raw) == SUMMARY_SHA
    blind, comparison, summary, addendum = (
        json.loads(blind_raw), json.loads(comparison_raw), json.loads(summary_raw), load(addendum_path)
    )
    assert blind["source_revision"] == BASE
    assert blind["hash_verification"]["verified_leaf_count"] == 32
    assert blind["hash_verification"]["all_match"] is True

    # Resolve each frozen source leaf from its declared base Git object.
    resolved = 0
    for leaf in blind["source_leaf_inventory"]:
        source = leaf["source"]
        assert source["revision"] == BASE
        raw = git_blob(BASE, source["path"])
        assert sha(raw) == blind["source_hashes"][
            {"docs/helix-harness/L4-basic-design/semantic-asset-lineage.json": "l4",
             "docs/helix-harness/L3-requirements/functional-requirements.json": "l3f",
             "docs/helix-harness/L3-requirements/business-requirements.json": "l3b",
             "docs/helix-harness/L10-verification/functional-verification.json": "l10f",
             "docs/helix-harness/L10-verification/business-verification.json": "l10b"}[source["path"]]
        ]
        doc = json.loads(raw)
        assert canonical_hash(pointer(doc, source["pointer"])) == source["value_sha256"]
        assert (ROOT / source["path"]).read_bytes() == raw
        resolved += 1
    assert resolved == 32

    rows = comparison["current_l4_l9_correspondence"]["rows"]
    assert len(rows) == 38
    candidate_ids = {x["candidate_id"] for x in blind["provisional_candidates"]}
    leaf_ids = {x["leaf_id"] for x in blind["source_leaf_inventory"]}
    for row in rows:
        assert row["l4_pointer"] and row["l9_case_pointer"]
        assert len(row["l4_oracle_refs"]) == 1
        assert row["l4_oracle_refs"][0] == row["l9_case_id"]
        assert all(row["legacy_casewise_checks"].values())
        assert set(row["source_only_candidate_groups"]) <= candidate_ids
        assert set(row["candidate_source_leaf_ids"]) <= leaf_ids
        assert row["candidate_relation"] == "contract_level_source_support_only; not a case/class membership"
    assert comparison["decision"]["canonical_l4_l9_changed"] is False
    assert summary["check_child_base_measurement"]["negative_4way"]["failures"] == 76
    assert summary["check_child_base_measurement"]["negative_4way"]["matched"] == 0

    # The addendum corrects, rather than mutates, the time-fixed comparison.
    assert addendum["applies_to"]["historical_comparison_sha256"] == COMPARISON_SHA
    assert addendum["applies_to"]["historical_verification_summary_sha256"] == SUMMARY_SHA
    assert addendum["applies_to"]["fixed_blind_sha256"] == BLIND_SHA
    assert addendum["supersedes"][0]["status"] == "retracted_as_categorical_conclusion"
    assert "not performed in this PR" in addendum["supersedes"][0]["replacement"]
    assert addendum["review_findings"]["F1"]["h053_casewise_facts"]["one_to_one_existing_oracle_refs"] == 38
    assert addendum["review_findings"]["F1"]["base_checker_diagnostic"]["failure_attribute_counts"] == {
        "change_or_condition": 38, "expected": 38
    }
    assert addendum["review_findings"]["F2"]["expected_axis_contract"] == (
        "non-empty string or ordered non-empty string array"
    )

    # Verify both checker revisions from immutable Git objects without executing either.
    base_checker = git_blob(BASE, "scaffold/tools/design_verification_checker.py")
    latest_checker = git_blob(LATEST_MAIN, "scaffold/tools/design_verification_checker.py")
    assert sha(base_checker) == BASE_CHECKER_SHA
    assert sha(latest_checker) == LATEST_CHECKER_SHA
    assert addendum["checker_rebinding_history"]["latest_main_at_recheck"] == LATEST_MAIN
    assert addendum["checker_rebinding_history"]["latest_main_ref"] == "refs/codex-readback/wr244-main"
    assert addendum["checker_rebinding_history"]["latest_main_ancestry_checks"]["pr_3982_merge_2684816_is_ancestor"] is True
    assert addendum["checker_rebinding_history"]["latest_main_ancestry_checks"]["pr_3981_merge_03141af4_is_ancestor"] is True
    for commit in ("2684816ad6179cc3535e4a6c297e61d10fd75ca0", "03141af4af6c5c3d9dc1f1bf075f29d96928d0f7"):
        subprocess.run(
            ["git", "merge-base", "--is-ancestor", commit, "refs/codex-readback/wr244-main"],
            cwd=ROOT, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE,
        )
    rebinding = addendum["checker_rebinding_history"]
    assert rebinding["pre_rebind_latest_main_diagnostic"]["latest_main_stale_count"] == 1
    assert rebinding["pre_rebind_latest_main_diagnostic"]["stale_path"] == "scaffold/tools/design_verification_checker.py"
    assert rebinding["post_rebind_latest_main_validation"]["scfctl_validate_bindings"] == 187
    assert rebinding["post_rebind_latest_main_validation"]["scfctl_validate_failures"] == 0
    assert rebinding["post_rebind_latest_main_validation"]["scfctl_stale"] == 0
    latest_measurement = rebinding["latest_main_checker_measurement"]
    assert latest_measurement["negative_4way_failure_attribute_counts"] == {"change_or_condition": 38, "expected": 38}
    assert latest_measurement["negative_4way_mode"] == "legacy_casewise_four_layer"
    merge_result = addendum["latest_main_virtual_merge"]["overlay_result"]
    assert merge_result["scfctl_validate_bindings"] == 187
    assert merge_result["scfctl_validate_failures"] == 0
    assert merge_result["scfctl_stale_after_rebind"] == 0

    binding = load(ROOT / "scaffold/bindings/SCF-B-0203.json")
    assert all(not x["path"].startswith("scaffold/") for x in binding["upstream"])
    assert any("5e69cd0c3c472090947fec9454d892ffa2caa24ed0aa2a1b2540f7d9c18f408b" in x for x in binding["verification"]["oracles"])
    assert any(BASE_CHECKER_SHA in x for x in binding["verification"]["oracles"])
    assert any(LATEST_CHECKER_SHA in x for x in binding["verification"]["oracles"])

    print(json.dumps({
        "read_only": True,
        "frozen_blind_sha_ok": True,
        "frozen_comparison_sha_ok": True,
        "frozen_summary_sha_ok": True,
        "source_leaf_hashes_reverified": resolved,
        "l4_l9_casewise_rows_verified": len(rows),
        "all_candidate_group_leaf_links_resolve": True,
        "r1_conclusion_retracted_in_addendum": True,
        "qa_axis_contract_recorded": addendum["review_findings"]["F2"]["expected_axis_contract"],
        "base_checker_sha_verified": BASE_CHECKER_SHA,
        "latest_main_checker_sha_verified": LATEST_CHECKER_SHA,
        "scaffold_upstream_paths": 0,
        "historical_outputs_rewritten": False,
    }, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
