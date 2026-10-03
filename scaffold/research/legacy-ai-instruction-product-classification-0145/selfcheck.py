#!/usr/bin/env python3
"""Run the exact ordered fail-closed negative cases declared by the inventory."""
from __future__ import annotations

import json
import shutil
import tempfile
from pathlib import Path

import generate as g
import validate as v


def parse_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def write_json(path: Path, value) -> None:
    path.write_text(json.dumps(value, ensure_ascii=False, sort_keys=True, indent=2) + "\n", encoding="utf-8")


def target_row(rows: list[dict], *, wave: bool = False) -> dict:
    for row in rows:
        if (not wave) or row.get("wave_semantic_links"):
            return row
    raise AssertionError("required mutation target missing")


def mutate(case: str, bundle: Path, binding_path: Path) -> None:
    ledger_path = bundle / "classification-research.jsonl"
    inventory_path = bundle / "inventory.json"
    ledger = [json.loads(line) for line in ledger_path.read_text(encoding="utf-8").splitlines() if line.strip()]
    inventory = parse_json(inventory_path)
    binding = parse_json(binding_path)
    row = target_row(ledger)

    if case == "target_omission":
        ledger.pop()
    elif case == "target_duplicate":
        ledger.append(dict(ledger[0]))
    elif case == "target_extra":
        extra = dict(ledger[0])
        extra["asset_id"] = "LEGACY-ASSET-SELFHECK-EXTRA"
        extra["source_path"] = "selfcheck-extra.md"
        extra["source_sha256"] = "0" * 64
        ledger.append(extra)
    elif case == "overlap_injection":
        row["asset_id"] = "LEGACY-ASSET-3AC78FD8A01E0F9811C5"
    elif case == "source_identity_tamper":
        row["source_sha256"] = "0" * 64
    elif case == "source_blob_tamper":
        row["source_exact"]["sha256"] = "sha256:" + "0" * 64
    elif case == "source_anchor_tamper":
        row["source_exact"]["semantic_anchor"]["line_text"][0] += " tampered"
    elif case == "source_coverage_tamper":
        row["source_exact"]["anchor_line_coverage"]["coverage_ratio"] = 0.0
    elif case == "manual_category_tamper":
        row["classification"]["category"] = "direct_product_basis"
    elif case == "manual_product_tamper":
        row["classification"]["candidate_products"].append("HELIX-Web")
    elif case == "manual_product_basis_tamper":
        row["classification"]["product_basis"].clear()
    elif case == "manual_counterevidence_tamper":
        row["classification"]["counterevidence"].clear()
    elif case == "phase_candidate_tamper":
        row["phase_evidence"]["candidate_phase_targets"].append("phase-forgery")
    elif case == "implementation_status_tamper":
        row["implementation_evidence"]["current_product_implementation_status"] = "implemented"
    elif case == "history_failure_tamper":
        row["legacy_history_failure_consumer"]["historical_context"][0]["sha256"] = "sha256:" + "0" * 64
    elif case == "consumer_closure_tamper":
        row["legacy_history_failure_consumer"]["failure_consumer_static"]["consumer_closure_status"] = "closed"
    elif case == "wave44_edge_tamper":
        wave_row = target_row(ledger, wave=True)
        wave_row["wave_semantic_links"][0]["row_sha256"] = "sha256:" + "0" * 64
    elif case == "authority_promotion":
        row["authority_effect"] = "formal"
    elif case == "new_build_promotion":
        row["new_build_allowed"] = True
    elif case == "inventory_target_tamper":
        inventory["research_scope"]["target_ids"].pop()
    elif case == "inventory_category_count":
        inventory["classification_counts"]["direct_product_basis"] += 1
    elif case == "inventory_overlap_tamper":
        inventory["overlap_status"]["combined_prior_id_overlap"] = 1
    elif case == "inventory_input_tamper":
        inventory["input_digests"][0]["sha256"] = "sha256:" + "0" * 64
    elif case == "profile_pin_tamper":
        path = bundle / "semantic-profile.json"
        path.write_bytes(path.read_bytes() + b" ")
    elif case == "snapshot_2090_inventory_tamper":
        path = bundle / "upstream/pr-2090-inventory.json"
        path.write_bytes(path.read_bytes() + b" ")
    elif case == "snapshot_2090_tamper":
        path = bundle / "upstream/pr-2090-classification-research.jsonl"
        path.write_bytes(path.read_bytes() + b" ")
    elif case == "binding_omission":
        binding["upstream"].pop()
    elif case == "binding_extra":
        binding["upstream"].append({"path": "unbound/extra", "sha256": "0" * 64})
    elif case == "binding_stale":
        binding["upstream"][0]["sha256"] = "0" * 64
    elif case == "malformed_json":
        inventory_path.write_text('{"schema_revision":', encoding="utf-8")
        return
    elif case == "duplicate_json_key":
        raw = inventory_path.read_text(encoding="utf-8").lstrip()
        inventory_path.write_text('{"schema_revision": 1,' + raw[1:], encoding="utf-8")
        return
    elif case == "archive_symlink_mode":
        row["source_exact"]["archive_mode"] = "120000"
    elif case == "archive_nonregular_type":
        row["source_exact"]["archive_type"] = "tree"
    elif case == "archive_path_mismatch":
        row["source_exact"]["archive_path"] += ".changed"
    elif case == "manifest_mismatch":
        row["source_exact"]["archive_manifest_sha256"] = "sha256:" + "0" * 64
    elif case == "typed_bool_alias":
        row["source_exact"]["archive_manifest_match"] = 1
    elif case == "typed_number_alias":
        inventory["research_scope"]["target_count"] = float(inventory["research_scope"]["target_count"])
    elif case == "record_null_object":
        row["source_exact"] = None
    elif case == "inventory_null_scope":
        inventory["research_scope"] = None
    elif case == "output_byte_tamper":
        lines = ledger_path.read_bytes().splitlines(keepends=True)
        ledger_path.write_bytes(b"".join(reversed(lines)))
        return
    elif case == "record_extra_key":
        row["unexpected_review_key"] = "not allowed"
    elif case == "inventory_extra_key":
        inventory["unexpected_review_key"] = "not allowed"
    elif case == "binding_metadata_tamper":
        binding["reason"] += " changed"
    elif case == "negative_case_order_tamper":
        inventory["negative_cases_expected_order"].reverse()
    elif case == "audit_report_tamper":
        audit_report = bundle / "independent-source-audit.json"
        audit_report.write_bytes(audit_report.read_bytes() + b" ")
        digest = g.tagged(audit_report.read_bytes())
        for item in inventory["input_digests"]:
            if item["path"] == g.AUDIT_REPORT_PATH:
                item["sha256"] = digest
                item["bytes"] = audit_report.stat().st_size
        for item in binding["upstream"]:
            if item["path"] == g.AUDIT_REPORT_PATH:
                item["sha256"] = digest.removeprefix("sha256:")
    elif case == "profile_authority_tamper":
        profile_path = bundle / "semantic-profile.json"
        profile = parse_json(profile_path)
        profile["records"][0]["authority_effect"] = "formal"
        write_json(profile_path, profile)
    elif case == "fixed_input_head_drift":
        return
    else:
        raise AssertionError(f"no mutation implemented for {case}")

    ledger_bytes = "".join(json.dumps(item, ensure_ascii=False, sort_keys=True, separators=(",", ":")) + "\n" for item in ledger).encode("utf-8")
    ledger_path.write_bytes(ledger_bytes)
    inventory["output_sha256"] = g.tagged(ledger_bytes)
    write_json(inventory_path, inventory)
    if case.startswith("binding_") or case in {"binding_metadata_tamper", "audit_report_tamper"}:
        write_json(binding_path, binding)


def main() -> int:
    bundle = g.BUNDLE
    binding = g.BINDING
    expected = tuple(g.EXPECTED_NEGATIVE_CASES)
    inventory = parse_json(bundle / "inventory.json")
    if tuple(inventory.get("negative_cases_expected_order", [])) != expected:
        print("SCF-B-0145 selfcheck FAIL negative-case order differs from generator")
        return 1
    results = []
    for case in expected:
        with tempfile.TemporaryDirectory(prefix=f"scf-b-0145-{case}-") as temp_name:
            temp = Path(temp_name)
            case_bundle = temp / "bundle"
            shutil.copytree(bundle, case_bundle)
            case_binding = temp / "SCF-B-0145.json"
            shutil.copy2(binding, case_binding)
            mutate(case, case_bundle, case_binding)
            original_profile_pin = g.PROFILE_SHA256
            if case == "profile_authority_tamper":
                g.PROFILE_SHA256 = g.tagged((case_bundle / "semantic-profile.json").read_bytes())
            original_git_bytes = g.git_bytes
            if case == "fixed_input_head_drift":
                def drifted_git_bytes(revision: str, path: str) -> bytes:
                    if revision == "HEAD" and path == g.PHASE:
                        return b"drifted fixed-base input\n"
                    return original_git_bytes(revision, path)
                g.git_bytes = drifted_git_bytes
            try:
                ok, code = v.validate(case_bundle, case_binding)
            finally:
                g.PROFILE_SHA256 = original_profile_pin
                g.git_bytes = original_git_bytes
            if ok:
                print(f"SCF-B-0145 selfcheck FAIL {case}: mutation passed")
                return 1
            expected_code = {
                "target_omission": "E_TARGET_OMISSION", "target_duplicate": "E_TARGET_DUPLICATE",
                "target_extra": "E_TARGET_EXTRA", "overlap_injection": "E_OVERLAP",
                "source_identity_tamper": "E_SOURCE", "source_blob_tamper": "E_ARCHIVE_BLOB",
                "source_anchor_tamper": "E_SOURCE_ANCHOR", "source_coverage_tamper": "E_SOURCE_COVERAGE",
                "manual_category_tamper": "E_MANUAL_CATEGORY", "manual_product_tamper": "E_MANUAL_PRODUCT",
                "manual_product_basis_tamper": "E_MANUAL_PRODUCT_BASIS", "manual_counterevidence_tamper": "E_MANUAL_COUNTEREVIDENCE",
                "phase_candidate_tamper": "E_PHASE", "implementation_status_tamper": "E_IMPLEMENTATION",
                "history_failure_tamper": "E_HISTORY_FAILURE", "consumer_closure_tamper": "E_CONSUMER_CLOSURE",
                "wave44_edge_tamper": "E_WAVE44", "authority_promotion": "E_AUTHORITY",
                "new_build_promotion": "E_NEW_BUILD", "inventory_target_tamper": "E_INVENTORY_TARGET",
                "inventory_category_count": "E_INVENTORY_CATEGORY", "inventory_overlap_tamper": "E_OVERLAP",
                "inventory_input_tamper": "E_INVENTORY_INPUT", "profile_pin_tamper": "E_PROFILE_PIN",
                "snapshot_2090_inventory_tamper": "E_RESEARCH_INPUT", "snapshot_2090_tamper": "E_RESEARCH_INPUT",
                "binding_omission": "E_BINDING_OMISSION", "binding_extra": "E_BINDING_EXTRA",
                "binding_stale": "E_BINDING_STALE", "malformed_json": "E_JSON",
                "duplicate_json_key": "E_JSON", "archive_symlink_mode": "E_ARCHIVE_MODE",
                "archive_nonregular_type": "E_ARCHIVE_TYPE", "archive_path_mismatch": "E_ARCHIVE_PATH",
                "manifest_mismatch": "E_ARCHIVE_MANIFEST",
                "typed_bool_alias": "E_ARCHIVE_MANIFEST", "typed_number_alias": "E_INVENTORY_TARGET",
                "record_null_object": "E_RECORD", "inventory_null_scope": "E_INVENTORY",
                "output_byte_tamper": "E_OUTPUT_DIGEST", "record_extra_key": "E_RECORD",
                "inventory_extra_key": "E_INVENTORY", "binding_metadata_tamper": "E_BINDING",
                "negative_case_order_tamper": "E_NEGATIVE_CASES", "audit_report_tamper": "E_AUDIT_REPORT",
                "profile_authority_tamper": "E_PROFILE_AUTHORITY", "fixed_input_head_drift": "E_INPUT_DRIFT",
            }[case]
            if code != expected_code:
                print(f"SCF-B-0145 selfcheck FAIL {case}: got={code} expected={expected_code}")
                return 1
            results.append(case)
    print(f"SCF-B-0145 selfcheck PASS exact_negative_cases={len(results)} ordered=true")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
