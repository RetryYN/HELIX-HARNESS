#!/usr/bin/env python3
"""Validate the bounded four-product L1 semantic evidence candidate."""

from __future__ import annotations

import copy
import hashlib
import importlib.util
import json
import subprocess
import sys
from pathlib import Path


HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
INV = HERE / "inventory.json"
EXPECTED_BASE = "3df81ad27157c471e004083783f37a5860eaa2ee"
EXPECTED_RELATIONS = {
    "HELIX-HARNESS": "partial",
    "HELIX-OS": "partial",
    "HELIX-Web": "exact",
    "HELIX-Web-OS": "exact",
}
EXPECTED_CURRENT_SHA = {
    "HELIX-HARNESS": "a49da594e9593557eb42cbfe54edc7e9751ce40fea95d1fe9367f5780184ee04",
    "HELIX-OS": "0f7f30d9d6984578f09c31ed1ef4e826d7c360bf752297982bde5201e7e99ca8",
    "HELIX-Web": "26815032e130d63fa3cef273847c029cbfc959a4d1a7c74e648a7044fc6d9756",
    "HELIX-Web-OS": "600caa1388278abe43c06f01c53f565146c2f2ddd2165f6a8c9e63cbb174a34c",
}
EXPECTED_DECISION_SHA = "b512098481cb282d066b37383cfcd932ef137e86e604a46f965fc605d52698f2"
EXPECTED_BOUNDARY_SHA = "097f27311060c56e387cf49fe6ec75731e5fd9dc04ac1a4be987d285e02ee038"
EXPECTED_DISPOSITION_PROGRAM_SHA = "9a341973f3f66fcd8223a354f69553c7f9b096526d2652de906777884675ad59"
EXPECTED_WORK_ENTRY_SHA = "6bccf1003ad3200a56740322db2589340f675a73a5b64d4444de793aed35f995"
EXPECTED_PRE_ISOLATION = "2d4991042be55268bac30a8bbcdac45b3865030a"
EXPECTED_ARCHIVE = "064280b5c1c5c98f949e6e3be5ef87cbe4a4b658"
HISTORICAL_REGISTER_PATH = "docs/governance/management-provisional-requirement-register-pre-append-3df81ad.jsonl"
EXPECTED_REGISTER_SHA = "4e43fadaec48dcb0399e73eff148419671d4ac87fd4f8f68899dadf186ce5b8b"
EXPECTED_INVENTORY_SHA = "12513f6df96440afd4813f3295fc7c3d5c17df5766cf5b671c1307c43a71f17e"
EXPECTED_GENERATOR_SHA = "c4ac3e5c8636f9b9e25346cc7b77d16fc6a17c6d5f926448240ccccae34598f1"
EXPECTED_CASES = {
    "HELIX-HARNESS": ("OUTSIDE67-L1-HARNESS", "docs/design/harness/L1-planning/product-intent.md", "docs/helix-harness/L1-planning/product-intent.md", "HDEC-HARNESS-L1-01", "partial_substantive_subset"),
    "HELIX-OS": ("OUTSIDE67-L1-OS", "docs/design/helix-os/L1-planning/system-intent.md", "docs/helix-os/L1-planning/system-intent.md", "HDEC-HELIXOS-L1-01", "partial_refined_boundary"),
    "HELIX-Web": ("OUTSIDE67-L1-WEB", "docs/design/helix-web/L1-planning/product-intent.md", "docs/helix-web/L1-planning/product-intent.md", "HDEC-HELIXWEB-L1-01", "exact_substantive_content"),
    "HELIX-Web-OS": ("OUTSIDE67-L1-WEB-OS", "docs/design/helix-web-os/L1-planning/system-intent.md", "docs/helix-web-os/L1-planning/system-intent.md", "HDEC-HELIXWEBOS-L1-01", "exact_substantive_content"),
}
EXPECTED_ANCHOR_KINDS = {
    "HELIX-HARNESS": ["old_current_exact", "current_addition", "old_current_exact", "decision_approved_sha", "boundary_owner"],
    "HELIX-OS": ["old_current_exact_except_one", "semantic_refinement", "semantic_refinement", "old_current_exact", "decision_approved_sha", "boundary_owner"],
    "HELIX-Web": ["old_current_exact", "old_current_exact", "old_current_exact", "decision_approved_sha", "boundary_owner"],
    "HELIX-Web-OS": ["old_current_exact", "old_current_exact", "old_current_exact", "decision_approved_sha", "boundary_owner"],
}
EXPECTED_GAP_SHA = {
    "HELIX-HARNESS": "b76e154b4e29a8ca5c26174799c84544d687154625073a7340fcfd10df481d9f",
    "HELIX-OS": "e323e797d25c9c2c67f5124769f67625e8df522c0fa9dbd6343ff52670892a24",
    "HELIX-Web": "6c40d3111443a98b491063b8cf18c2cf15c21411d3c47f4e5a7783935b0a2c45",
    "HELIX-Web-OS": "bda921b05068fe0c37e6994f953b70f98a1bc35d9434c232fb9b56b536b5dc57",
}
EXPECTED_FINDINGS_SHA = "dc0efbe6c698bdc6ebd138798722b82c291cdfc6e82f4d379d6dc153cc951328"
EXPECTED_PROHIBITED_SHA = "def278fb081f492b066e6abc156a577656cbbc54e274b9384ea4a32958094559"


if hashlib.sha256((HERE / "generate.py").read_bytes()).hexdigest() != EXPECTED_GENERATOR_SHA:
    raise SystemExit("E_GENERATOR_PIN")
spec = importlib.util.spec_from_file_location("l1_generator", HERE / "generate.py")
generator = importlib.util.module_from_spec(spec)
assert spec.loader is not None
spec.loader.exec_module(generator)
EXPECTED = generator.build()


def fail(errors: list[str], condition: bool, message: str) -> None:
    if not condition:
        errors.append(message)


def digest(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def git_bytes(commit: str, path: str) -> bytes:
    return subprocess.run(["git", "show", f"{commit}:{path}"], cwd=ROOT, check=True, stdout=subprocess.PIPE).stdout


def git_oid(commit: str, path: str) -> str:
    return subprocess.run(["git", "rev-parse", f"{commit}:{path}"], cwd=ROOT, check=True, text=True, stdout=subprocess.PIPE).stdout.strip()


def exact_locations(value: object, target: str, prefix: str = "") -> list[str]:
    found = []
    if isinstance(value, dict):
        for key, child in value.items():
            location = f"{prefix}.{key}" if prefix else key
            if child == target:
                found.append(location)
            found += exact_locations(child, target, location)
    elif isinstance(value, list):
        for index, child in enumerate(value):
            found += exact_locations(child, target, f"{prefix}[{index}]")
    return found


def independent_evidence_errors(inv: dict) -> list[str]:
    """Check source facts without using generate.py or its case specifications."""
    errors: list[str] = []
    scope = inv.get("scope", {})
    fail(errors, scope.get("pre_isolation_commit") == EXPECTED_PRE_ISOLATION, "E_PRE_COMMIT_PIN")
    fail(errors, scope.get("archive_commit") == EXPECTED_ARCHIVE, "E_ARCHIVE_COMMIT_PIN")
    fail(errors, scope.get("work_entry_path") == "docs/governance/new-generation-start-here.md", "E_WORK_ENTRY_PATH")
    fail(errors, scope.get("work_entry_sha256") == EXPECTED_WORK_ENTRY_SHA == digest((ROOT / "docs/governance/new-generation-start-here.md").read_bytes()), "E_WORK_ENTRY_DIGEST")
    register_path = ROOT / HISTORICAL_REGISTER_PATH
    register_bytes = register_path.read_bytes()
    fail(errors, scope.get("management_register_path") == HISTORICAL_REGISTER_PATH, "E_REGISTER_PATH")
    fail(errors, scope.get("management_register_capture_commit") == EXPECTED_BASE, "E_REGISTER_CAPTURE")
    fail(errors, scope.get("management_register_sha256") == EXPECTED_REGISTER_SHA == digest(register_bytes), "E_REGISTER_DIGEST")
    register = [json.loads(line) for line in register_bytes.splitlines() if line.strip()]
    superseded = {row["supersedes_registration_id"] for row in register if row.get("supersedes_registration_id")}
    live = [row for row in register if row["registration_id"] not in superseded]
    fail(errors, len(live) == 13, "E_REGISTER_LIVE_COUNT")
    actual_holdings = {row["registration_id"]: row for row in live}
    recorded_holdings = {row.get("registration_id"): row for row in inv.get("live_holdings", [])}
    fail(errors, set(actual_holdings) == set(recorded_holdings), "E_HOLDING_SET")
    atom_sets: dict[str, list[dict]] = {}
    for row in live:
        ref = row["source_atom_set_ref"]
        raw = (ROOT / ref).read_bytes()
        atom_sets[row["registration_id"]] = [json.loads(line) for line in raw.splitlines() if line.strip()]
        recorded = recorded_holdings.get(row["registration_id"], {})
        fail(errors, recorded.get("source_atom_set_ref") == ref and recorded.get("source_atom_set_sha256") == digest(raw) and recorded.get("source_atom_set_record_count") == len(atom_sets[row["registration_id"]]), f"E_HOLDING_SOURCE:{row['registration_id']}")
    first15 = json.loads((ROOT / "scaffold/pre-isolation-outside-holding-first15/inventory.json").read_text(encoding="utf-8"))
    first15_rows = {row["path"]: row for row in first15["paths"]}
    decision = (ROOT / "docs/governance/decisions/concept-v4.1-and-four-l1-approval-2026-09-17.md").read_bytes()
    boundary = (ROOT / "docs/concept/product-boundary.md").read_bytes()
    fail(errors, scope.get("first15_inventory_sha256") == digest((ROOT / "scaffold/pre-isolation-outside-holding-first15/inventory.json").read_bytes()), "E_FIRST15_DIGEST")
    fail(errors, scope.get("decision_record_sha256") == digest(decision), "E_DECISION_DIGEST")
    fail(errors, scope.get("product_boundary_sha256") == digest(boundary), "E_BOUNDARY_DIGEST")
    cases = inv.get("cases", [])
    fail(errors, digest(json.dumps(inv.get("findings"), ensure_ascii=False, sort_keys=True).encode()) == EXPECTED_FINDINGS_SHA, "E_FINDINGS_PIN")
    fail(errors, digest(json.dumps(inv.get("prohibited_inference"), ensure_ascii=False, sort_keys=True).encode()) == EXPECTED_PROHIBITED_SHA, "E_PROHIBITED_PIN")
    fail(errors, {case.get("product") for case in cases} == set(EXPECTED_CASES), "E_CASE_PRODUCTS")
    for case in cases:
        product = case.get("product")
        if product not in EXPECTED_CASES:
            continue
        case_id, old_path, current_path, decision_id, label = EXPECTED_CASES[product]
        fail(errors, case.get("case_id") == case_id and case.get("semantic_relation_label") == label, f"E_CASE_ID_LABEL:{product}")
        gap = case.get("semantic_gap")
        fail(errors, isinstance(gap, str) and digest(gap.encode()) == EXPECTED_GAP_SHA[product], f"E_SEMANTIC_GAP:{product}")
        old = case.get("old_source", {})
        archive = case.get("archive_source", {})
        current = case.get("current_approved_l1", {})
        fail(errors, old.get("path") == old_path and current.get("path") == current_path, f"E_CASE_PATH:{product}")
        fail(errors, old.get("commit") == EXPECTED_PRE_ISOLATION and archive.get("commit") == EXPECTED_ARCHIVE and current.get("commit") == EXPECTED_BASE, f"E_CASE_COMMIT:{product}")
        fail(errors, current.get("decision_id") == decision_id, f"E_DECISION_ID:{product}")
        old_bytes = git_bytes(EXPECTED_PRE_ISOLATION, old_path)
        archive_bytes = git_bytes(EXPECTED_ARCHIVE, old_path)
        current_bytes = git_bytes(EXPECTED_BASE, current_path)
        old_oid = git_oid(EXPECTED_PRE_ISOLATION, old_path)
        first15_row = first15_rows.get(old_path, {})
        fail(errors, first15_row.get("pre_isolation", {}).get("blob_oid") == old_oid, f"E_FIRST15_BLOB:{product}")
        fail(errors, old.get("blob_oid") == old_oid and old.get("sha256") == digest(old_bytes) and old.get("bytes") == len(old_bytes), f"E_OLD_GIT:{product}")
        fail(errors, old.get("reported_blob_oid") == old_oid and old.get("reported_blob_oid_matches_git") is (first15_row.get("pre_isolation", {}).get("blob_oid") == old_oid), f"E_OLD_REPORTED:{product}")
        fail(errors, archive.get("blob_oid") == git_oid(EXPECTED_ARCHIVE, old_path) and archive.get("sha256") == digest(archive_bytes) and archive.get("bytes") == len(archive_bytes) and archive.get("relation_to_pre_isolation") == ("same" if archive_bytes == old_bytes else "different"), f"E_ARCHIVE_GIT:{product}")
        fail(errors, current.get("blob_oid") == git_oid(EXPECTED_BASE, current_path) and current.get("sha256") == digest(current_bytes) and current.get("bytes") == len(current_bytes), f"E_CURRENT_GIT:{product}")
        by_id = {row.get("registration_id"): row for row in case.get("live_holding_relations", [])}
        fail(errors, set(by_id) == set(actual_holdings), f"E_CASE_HOLDING_SET:{product}")
        all_empty = True
        for registration_id, source_rows in atom_sets.items():
            recorded = by_id.get(registration_id, {})
            for target, count_key, evidence_key in ((old_path, "path_match_count", "path_match_evidence"), (old_oid, "pre_isolation_blob_match_count", "blob_match_evidence"), (digest(old_bytes), "pre_isolation_sha256_match_count", "sha256_match_evidence")):
                hits = [f"{index}:{location}" for index, item in enumerate(source_rows, 1) for location in exact_locations(item, target)]
                fail(errors, recorded.get(count_key) == len(hits) and recorded.get(evidence_key) == hits, f"E_HOLDING_SCAN:{product}:{registration_id}:{count_key}")
                all_empty = all_empty and not hits
            counts_empty = all(recorded.get(key) == 0 for key in ("path_match_count", "pre_isolation_blob_match_count", "pre_isolation_sha256_match_count"))
            fail(errors, recorded.get("relation") == ("no_exact_path_or_blob_or_sha_match" if counts_empty else "match_requires_review"), f"E_HOLDING_CLASS:{product}:{registration_id}")
        fail(errors, case.get("existing_holding_relation") == ("no_exact_path_or_blob_or_sha_match_in_13_live_holdings" if all_empty else "match_requires_review"), f"E_HOLDING_SUMMARY:{product}")
        source_bytes = {"old": old_bytes, "current": current_bytes, "decision": decision, "boundary": boundary}
        fail(errors, [anchor.get("kind") for anchor in case.get("line_anchored_evidence", [])] == EXPECTED_ANCHOR_KINDS[product], f"E_ANCHOR_KINDS:{product}")
        for index, anchor in enumerate(case.get("line_anchored_evidence", [])):
            for kind, entry in anchor.items():
                if kind not in source_bytes:
                    continue
                lines = source_bytes[kind].decode("utf-8").splitlines()
                start, end = entry.get("line_start"), entry.get("line_end")
                if not isinstance(start, int) or not isinstance(end, int) or start < 1 or end < start or end > len(lines):
                    errors.append(f"E_ANCHOR_RANGE:{product}:{index}:{kind}")
                    continue
                selected = lines[start - 1:end]
                expected_ref = {"old": f"{EXPECTED_PRE_ISOLATION}:{old_path}", "current": f"{EXPECTED_BASE}:{current_path}", "decision": "docs/governance/decisions/concept-v4.1-and-four-l1-approval-2026-09-17.md", "boundary": "docs/concept/product-boundary.md"}[kind]
                fail(errors, entry.get("ref") == expected_ref and entry.get("text") == selected and entry.get("sha256") == digest("\n".join(selected).encode("utf-8")), f"E_ANCHOR_SOURCE:{product}:{index}:{kind}")
            kind = anchor.get("kind")
            if kind in ("old_current_exact", "old_current_exact_except_one"):
                old_lines = anchor.get("old", {}).get("text", [])
                current_lines = anchor.get("current", {}).get("text", [])
                mismatches = sum(a != b for a, b in zip(old_lines, current_lines)) + abs(len(old_lines) - len(current_lines))
                fail(errors, mismatches == 0 if kind == "old_current_exact" else mismatches <= 1, f"E_ANCHOR_EQUALITY:{product}:{index}")
            elif kind == "semantic_refinement":
                fail(errors, anchor.get("old", {}).get("text") != anchor.get("current", {}).get("text"), f"E_REFINEMENT:{product}:{index}")
            elif kind == "decision_approved_sha":
                text = "\n".join(anchor.get("decision", {}).get("text", []))
                fail(errors, decision_id in text and digest(current_bytes) in text, f"E_DECISION_ANCHOR:{product}:{index}")
                fail(errors, current.get("decision_line") == anchor.get("decision", {}).get("line_start") == anchor.get("decision", {}).get("line_end"), f"E_DECISION_LINE:{product}:{index}")
            elif kind == "boundary_owner":
                text = "\n".join(anchor.get("boundary", {}).get("text", []))
                boundary_label = "HARNESS" if product == "HELIX-HARNESS" else product
                fail(errors, f"| {boundary_label} |" in text, f"E_BOUNDARY_ANCHOR:{product}:{index}")
                fail(errors, case.get("product_boundary", {}).get("line") == anchor.get("boundary", {}).get("line_start") == anchor.get("boundary", {}).get("line_end"), f"E_BOUNDARY_LINE:{product}:{index}")
        if product in ("HELIX-Web", "HELIX-Web-OS"):
            def body(data: bytes) -> bytes:
                return data.split(b"---\n", 2)[-1]
            fail(errors, body(old_bytes) == body(current_bytes), f"E_EXACT_BODY:{product}")
    return errors


def validate(inv: dict) -> list[str]:
    errors: list[str] = []
    fail(errors, inv == EXPECTED, "E_INVENTORY_NOT_REGENERATED")
    fail(errors, digest((HERE / "generate.py").read_bytes()) == EXPECTED_GENERATOR_SHA, "E_GENERATOR_PIN")
    fail(errors, digest((json.dumps(inv, ensure_ascii=False, indent=2) + "\n").encode("utf-8")) == EXPECTED_INVENTORY_SHA, "E_INVENTORY_PIN")
    fail(errors, inv.get("schema") == "rdp001-preisolation-outside-l1-semantic/v1", "E_SCHEMA")
    fail(errors, inv.get("status") == "findings_only", "E_STATUS")
    fail(errors, inv.get("authority_effect") == "none", "E_AUTHORITY")
    fail(errors, inv.get("meaning_change_applied") is False, "E_MEANING")
    fail(errors, inv.get("successor_requirement_ids") == [] and inv.get("human_decision_ref") is None, "E_DECISION_BOUNDARY")
    fail(errors, inv.get("formal_source_holding_created") is False, "E_FORMAL_HOLDING")
    fail(errors, inv.get("old_runtime_test_ci_execution") is False, "E_OLD_EXECUTION")
    scope = inv.get("scope", {})
    fail(errors, scope.get("current_head") == EXPECTED_BASE, "E_BASE")
    fail(errors, scope.get("selected_old_path_count") == 4, "E_SELECTION")
    fail(errors, scope.get("approved_products") == ["HELIX-HARNESS", "HELIX-OS", "HELIX-Web", "HELIX-Web-OS"], "E_PRODUCTS")
    fail(errors, scope.get("management_register_path") == HISTORICAL_REGISTER_PATH, "E_REGISTER_PATH")
    fail(errors, scope.get("live_holding_count") == 13, "E_HOLDINGS")
    fail(errors, scope.get("decision_record_sha256") == EXPECTED_DECISION_SHA, "E_DECISION_SHA")
    fail(errors, scope.get("product_boundary_sha256") == EXPECTED_BOUNDARY_SHA, "E_BOUNDARY_SHA")
    fail(errors, scope.get("disposition_program_sha256") == EXPECTED_DISPOSITION_PROGRAM_SHA, "E_DISPOSITION_PROGRAM_SHA")
    fail(errors, scope.get("work_entry_sha256") == EXPECTED_WORK_ENTRY_SHA, "E_WORK_ENTRY_SHA")
    try:
        fail(errors, subprocess.run(["git", "merge-base", "--is-ancestor", EXPECTED_BASE, "HEAD"], cwd=ROOT).returncode == 0, "E_BASE_NOT_ANCESTOR")
    except OSError as exc:
        errors.append(f"E_GIT:{exc}")

    holdings = inv.get("live_holdings", [])
    fail(errors, len(holdings) == 13, "E_LIVE_HOLDINGS")
    fail(errors, len({row.get("registration_id") for row in holdings}) == 13, "E_LIVE_HOLDING_IDS")
    fail(errors, all(row.get("registration_kind") == "source_holding" and row.get("product_target") == "unassigned_cross_product" and row.get("authority_effect") == "none" for row in holdings), "E_LIVE_HOLDING_BOUNDARY")

    cases = inv.get("cases", [])
    fail(errors, len(cases) == 4, "E_CASE_COUNT")
    for case in cases:
        product = case.get("product")
        fail(errors, EXPECTED_RELATIONS.get(product) == case.get("semantic_relation"), f"E_RELATION:{product}")
        fail(errors, case.get("current_approved_l1", {}).get("sha256") == EXPECTED_CURRENT_SHA.get(product), f"E_CURRENT_SHA:{product}")
        fail(errors, case.get("existing_holding_relation") == "no_exact_path_or_blob_or_sha_match_in_13_live_holdings", f"E_HOLDING_RELATION:{product}")
        fail(errors, case.get("preservation_disposition") == "source_holding_required_before_semantic_disposition", f"E_PRESERVATION:{product}")
        fail(errors, case.get("semantic_evidence_role") == "evidence_only_not_source_holding", f"E_EVIDENCE_ROLE:{product}")
        fail(errors, case.get("source_holding_precondition") == "required_before_semantic_disposition", f"E_HOLDING_PRECONDITION:{product}")
        fail(errors, case.get("formal_source_holding_created") is False, f"E_FORMAL_CASE_HOLDING:{product}")
        fail(errors, case.get("authority_effect") == "none" and case.get("meaning_change_applied") is False, f"E_CASE_AUTHORITY:{product}")
        fail(errors, case.get("successor_requirement_ids") == [] and case.get("human_decision_ref") is None, f"E_CASE_DECISION:{product}")
        fail(errors, case.get("old_runtime_test_ci_execution") is False, f"E_CASE_EXECUTION:{product}")
        old = case.get("old_source", {})
        archive = case.get("archive_source", {})
        fail(errors, old.get("reported_blob_oid_matches_git") is True, f"E_OLD_BLOB:{product}")
        fail(errors, old.get("blob_oid") == old.get("reported_blob_oid"), f"E_OLD_REPORT_BLOB:{product}")
        fail(errors, archive.get("relation_to_pre_isolation") == "same", f"E_ARCHIVE_RELATION:{product}")
        fail(errors, case.get("current_approved_l1", {}).get("decision_id", "").startswith("HDEC-"), f"E_DECISION_ID:{product}")
        relations = case.get("live_holding_relations", [])
        fail(errors, len(relations) == 13, f"E_RELATION_COUNT:{product}")
        for relation in relations:
            fail(errors, relation.get("relation") == "no_exact_path_or_blob_or_sha_match", f"E_EXACT_MATCH:{product}:{relation.get('registration_id')}")
            fail(errors, relation.get("path_match_count") == relation.get("pre_isolation_blob_match_count") == relation.get("pre_isolation_sha256_match_count") == 0, f"E_MATCH_COUNTS:{product}:{relation.get('registration_id')}")
    aggregate = inv.get("aggregate", {})
    fail(errors, aggregate.get("semantic_relation_counts") == {"exact": 2, "partial": 2, "unresolved": 0}, "E_RELATION_AGGREGATE")
    fail(errors, aggregate.get("holding_exact_match_count") == 0, "E_HOLDING_AGGREGATE")
    fail(errors, aggregate.get("preservation_unresolved_count") == 4, "E_PRESERVATION_AGGREGATE")
    fail(errors, inv.get("source_holding_rule") == "new_source_requires_source_holding_before_semantic_disposition", "E_SOURCE_HOLDING_RULE")
    fail(errors, len(inv.get("prohibited_inference", [])) == 6, "E_PROHIBITED_BOUNDARY")
    errors.extend(independent_evidence_errors(inv))
    return errors


if __name__ == "__main__":
    errors = validate(json.loads(INV.read_text(encoding="utf-8")))
    if errors:
        print("FAIL outside-67 L1 semantic validator")
        print("\n".join(errors))
        sys.exit(1)
    print("PASS outside-67 L1 semantic validator: 4 cases / 2 exact / 2 partial / 13 holdings")
