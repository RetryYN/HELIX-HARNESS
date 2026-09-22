#!/usr/bin/env python3
"""Static validator for the PHCAP-15 Deploy pool-12 research premise."""

from __future__ import annotations

import argparse
import hashlib
import json
import sys
from pathlib import Path


POOL_EXPECTED = 78
SELECTED_EXPECTED = 12
PR2001_IDS = {
    "LEGACY-ASSET-042D2B732DC68AA7EE9A",
    "LEGACY-ASSET-578A66F54CD01046B7BA",
    "LEGACY-ASSET-18BB86CC5625C31430B8",
    "LEGACY-ASSET-FA8D4E24D8399E8350F1",
    "LEGACY-ASSET-327A88B2141C43045AF1",
    "LEGACY-ASSET-BADD68B87BA5BE0F3906",
    "LEGACY-ASSET-7995556682FC5493C37E",
}
PR2004_IDS = {
    "LEGACY-ASSET-7D081AD1F95E968FA77C",
    "LEGACY-ASSET-1C02673C4901B24D963D",
    "LEGACY-ASSET-0AD2FD852BAB0CEC864B",
    "LEGACY-ASSET-99E3BCA46E08C4A328FC",
    "LEGACY-ASSET-17C4BF78919578FEBB18",
    "LEGACY-ASSET-A2F6A697D7FFFD490B57",
    "LEGACY-ASSET-897CAC574F146D976BD7",
    "LEGACY-ASSET-FD0947CF40FB2B301664",
    "LEGACY-ASSET-9E033C3E39BE107D4CF1",
    "LEGACY-ASSET-3E3D84D599ED0476926B",
    "LEGACY-ASSET-92811340BD843B5EC3FD",
    "LEGACY-ASSET-7E68FC7E2F08FD31B0C1",
}
SCF0037_IDS = {
    "LEGACY-ASSET-54330A68064B58B22259",
    "LEGACY-ASSET-1251704E0BE627232E00",
    "LEGACY-ASSET-189702B332643A3BFDAF",
}
PRODUCTS = {"HELIX-HARNESS", "HELIX-OS", "HELIX-Web", "HELIX-Web-OS"}
BASE_COMMIT = "562e176c36844474b63424ec06beefe2f7722d18"
BASE_WORKTREE = "/home/tenni/.helix-worktrees/phcap15-deploy-pool12"

EXPECTED_EQUIVALENCE_CLAIM = None
EXPECTED_UNRESOLVED = [
    "semantic product split",
    "phase admission",
    "product owner",
    "current implementation/degradation/acceptance",
    "failure outcome",
    "consumer closure",
    "successor/decision",
]
EXPECTED_SEMANTIC_DIVERSITY_KINDS = {
    "LEGACY-ASSET-A297D67A1D8AD6EE6D6B": "catalog/package",
    "LEGACY-ASSET-0C5F0695490FA5D87419": "catalog/release-version",
    "LEGACY-ASSET-EC07511FF3E241F15359": "design/catalog",
    "LEGACY-ASSET-809D616D0D7D844F5720": "design/function-spec",
    "LEGACY-ASSET-B5B5E71B2AF1459D59A1": "requirement/functional",
    "LEGACY-ASSET-13604CA85F3B7D8D5055": "governance/document-map",
    "LEGACY-ASSET-D63398C5A382549DC905": "audit/design-consistency",
    "LEGACY-ASSET-320E6F0B93975C430B1D": "plan/release-bundle",
    "LEGACY-ASSET-3CB7630AEBBC5932E11D": "plan/lifecycle-operations",
    "LEGACY-ASSET-26391F9FB236CBD4D270": "implementation-source/lint",
    "LEGACY-ASSET-2149C3FCC5A18EB50185": "test-source/runtime-guidance",
    "LEGACY-ASSET-FAAFFA616A44F65911EB": "test-design/unit",
}
EXPECTED_ARTIFACT_EVIDENCE_KINDS = {
    "LEGACY-ASSET-A297D67A1D8AD6EE6D6B": "unknown",
    "LEGACY-ASSET-0C5F0695490FA5D87419": "unknown",
    "LEGACY-ASSET-EC07511FF3E241F15359": "design",
    "LEGACY-ASSET-809D616D0D7D844F5720": "design",
    "LEGACY-ASSET-B5B5E71B2AF1459D59A1": "requirement",
    "LEGACY-ASSET-13604CA85F3B7D8D5055": "operation_document",
    "LEGACY-ASSET-D63398C5A382549DC905": "operation_document",
    "LEGACY-ASSET-320E6F0B93975C430B1D": "plan",
    "LEGACY-ASSET-3CB7630AEBBC5932E11D": "plan",
    "LEGACY-ASSET-26391F9FB236CBD4D270": "implementation_source",
    "LEGACY-ASSET-2149C3FCC5A18EB50185": "test_source",
    "LEGACY-ASSET-FAAFFA616A44F65911EB": "test_design",
}
EXPECTED_PROHIBITED_INFERENCE = [
    "pool membership is a phase classification candidate only; it never admits an asset to PHCAP-15",
    "source presence, design/requirement/plan/implementation-source/test-source evidence or old command names do not establish current implementation, operation, acceptance, deployment or pass",
    "phase candidate targets do not admit assets to PHCAP-15 and candidate product targets do not assign a product owner",
    "current L1/L2/L11 candidate text does not generate authority, owner, implementation or acceptance",
    "empty consumer_refs and pending closure do not prove no historical consumer",
    "missing direct Web evidence does not establish non-implementation",
    "old review evidence, green commands or test source are not current execution receipts",
    "archive is static reference only and not runtime, test, CI or fallback",
]

# These are validator-owned pins.  They deliberately do not come from the
# candidate inventory, so adding/removing a field, anchor, or interpretation
# cannot make the validator accept the changed candidate.
KEYSETS = {
    "root": frozenset(
        {
            "aggregate_evidence",
            "assets",
            "authority_effect",
            "base",
            "counts",
            "denominator",
            "equivalence_claim",
            "human_decision_ref",
            "meaning_change_applied",
            "old_archive_runtime_test_ci_execution",
            "product_boundary_candidates",
            "prohibited_inference",
            "provenance",
            "schema",
            "scope",
            "status",
            "successor_requirement_ids",
            "task",
            "verification_contract",
        }
    ),
    "base": frozenset({"branch", "captured_at", "changed", "origin_main_at_final", "origin_main_at_start", "origin_main_commit", "stop_condition", "worktree"}),
    "task": frozenset({"phase", "phase_inventory_path", "phase_inventory_snapshot", "task_id", "title"}),
    "task.phase_inventory_snapshot": frozenset({"authority_effect", "evidence_products", "gaps", "legacy_capability_status", "legacy_layers_evidenced", "maximum_layer_evidenced", "new_build_allowed", "product_targets", "refs", "status", "transition_assessment"}),
    "provenance": frozenset({"existing_binding", "failure_consumer_evidence", "ledgers", "phase_pool_basis", "pr_2001_head", "pr_2001_inventory", "pr_2004_head", "pr_2004_inventory"}),
    "provenance.failure_consumer_evidence": frozenset({"copy_read_after_ledger", "decision_ledger", "dedicated_consumer_ledger_paths", "dedicated_failure_ledger_paths", "interpretation", "search_scope"}),
    "provenance.ledgers": frozenset({"archive/legacy-generation-2026-09-14/MANIFEST.sha256", "docs/governance/legacy-asset-copy-read-after.jsonl", "docs/governance/legacy-asset-decisions.jsonl", "docs/governance/legacy-asset-disposition.jsonl", "docs/governance/legacy-asset-phase-product-classification-bootstrap.jsonl", "docs/governance/phase-capability-inventory.json"}),
    "provenance.ledgers.<entry>": frozenset({"records", "sha256"}),
    "denominator": frozenset({"already_reviewed_excluded_rows", "followup_selected_rows", "next_selected_rows", "pool_coverage_statement", "pool_rows", "pool_unique_asset_ids", "pr_2001_selected_rows", "pr_2004_selected_rows", "previously_reviewed_excluded_rows", "remaining_unreviewed_rows", "reviewed_or_selected_total", "scf_b0037_selected_rows"}),
    "scope": frozenset({"excluded_scopes", "overlap_checks", "pool_asset_ids", "remaining_unreviewed_asset_ids", "selected_asset_ids"}),
    "scope.excluded_scopes": frozenset({"pr_2001", "pr_2004", "scf_b0037"}),
    "scope.excluded_scopes.pr_2001": frozenset({"asset_ids", "evidence_worktree", "head", "pr_number"}),
    "scope.excluded_scopes.pr_2004": frozenset({"asset_ids", "evidence_worktree", "head", "pr_number"}),
    "scope.excluded_scopes.scf_b0037": frozenset({"asset_ids", "binding_path"}),
    "scope.overlap_checks": frozenset({"pool_duplicate_ids", "selected_vs_pr_2001", "selected_vs_pr_2004", "selected_vs_scf_b0037"}),
    "product_boundary_candidates": frozenset({"authority_effect", "current_implementation_claim", "defined_products", "product_owner_status", "products"}),
    "product_boundary_candidates.products[]": frozenset({"boundary", "current_authority_status", "current_evidence_status", "current_implementation_status", "owner_status", "product", "refs", "status"}),
    "product_boundary_candidates.products[].refs[]": frozenset({"file_sha256", "line_end", "line_start", "path", "span_sha256"}),
    "aggregate_evidence": frozenset({"current_degradation_status", "current_implementation_status", "current_phase_admission", "selected_asset_copy_read_after_matches", "selected_asset_count", "selected_asset_decision_matches", "selected_consumer_closure_pending", "selected_consumer_refs_nonempty", "selected_failure_execution_receipts", "selected_implementation_statuses"}),
    "verification_contract": frozenset({"negative_cases", "old_archive_runtime_test_ci_execution", "requires_exact_source_spans", "requires_four_product_candidate_boundary", "requires_pool_nonoverlap", "requires_source_archive_digest_reconciliation", "unknowns_must_remain_explicit"}),
    "counts": frozenset({"evidence_kinds", "excluded_rows", "four_products", "pool_rows", "remaining_unreviewed_rows", "selected_rows", "selected_source_anchors"}),
    "assets[]": frozenset({"archive_path", "artifact_evidence_kind", "asset_id", "authority_status", "candidate_phase_targets", "candidate_product_targets", "consumer_closure_status", "consumer_evidence", "consumer_refs", "copy_read_after_matches", "current_acceptance_status", "current_degradation_status", "current_implementation_status", "current_operation_status", "decision_matches", "decision_record_refs", "disposition", "disposition_ledger_line", "failure_evidence", "implementation_evidence_state", "ledger_source_sha256", "legacy_execution_performed", "legacy_implementation_status", "phase_admission", "phase_classification_status", "phase_ledger_line", "product_classification_status", "product_owner_status", "semantic_diversity_kind", "source_anchors", "source_file_sha256", "source_line_count", "source_path", "source_revision", "unresolved"}),
    "assets[].failure_evidence": frozenset({"execution_receipts", "failure_outcome_observed", "source_failure_or_stop_conditions_observed", "status", "unknown"}),
    "assets[].consumer_evidence": frozenset({"consumer_closure_observed", "consumer_refs_observed", "status", "unknown"}),
    "assets[].source_anchors[]": frozenset({"exact_text", "line_end", "line_start", "meaning", "source_span_sha256"}),
}

# Each entry pins the expected anchor order, minimum source span and the
# human-readable meaning.  The source text is checked separately against the
# archive; the digest here prevents a candidate from silently selecting a
# different valid line in that source.
EXPECTED_ANCHOR_SPECS = {
    "LEGACY-ASSET-A297D67A1D8AD6EE6D6B": (
        (9, 9, "d2d03ce2e08bbb3f5006282d09c3cdaed43afc37086081e97664a71fb7e1fe28", "package/artifact boundary and separation of deliverable from outcome"),
        (11, 11, "e59e3b81e8e9588f8f9f217a4990f034e7d416af4ef1ac740cb45870b3a45fcc", "development, release, deployment and operations responsibility scope"),
        (24, 24, "2f85eb1995c48340337b3b955ed9780c06f6e9f417bcfff6e5beb6572bb2b29c", "worker result and execution provenance evidence candidate"),
        (29, 29, "f0b23b372f42884bcfeb08e097b9e05d893193dea5c155a853ee93ae844d152d", "release artifact, provenance, compatibility and rollback candidate"),
    ),
    "LEGACY-ASSET-0C5F0695490FA5D87419": (
        (9, 9, "b5e027c8158fdb048be8a111d9e1373ac0bcfc81b07153fe4406cb4f1423584b", "package versus release ownership and artifact separation"),
        (11, 11, "811c1a88fb664e67e1414faa459bbb013d118af0332c82257e8833eff30ef8c0", "release slice and rollback unit"),
        (48, 48, "c2caff50e018449f6bef53a28c27ce0b2530c9232766bf673b001bfd42df4f8d", "clean consumer validation and promotion candidate"),
        (49, 49, "924b0735a1acc8efed872a16abc36137af09082e3b89891a1b0f321064bdf72a", "deployment, health observation and rollback candidate"),
    ),
    "LEGACY-ASSET-EC07511FF3E241F15359": (
        (2, 2, "4ecdb47d03cfdc898c85cb8ebc6fa4b8dd9d4dc9ee737dc826ffd452367249ff", "current authority reference is cited as governing source"),
        (5, 5, "43bdde60a2fe3e850b41cab9dcb10ff5f2d4bd7356695ac52d6f5e9d62017bed", "design catalog status semantics require real artifact evidence"),
        (7, 7, "358827e8e737083ff106bfe5e249dc96665337fbbbcf4b0e65079cffe8671287", "design catalog schema identity"),
        (102, 102, "89f24a80f45f40192d797e9829bfff67b24b34124c964aa5e73453453f4ad8ff", "distribution release design reference"),
    ),
    "LEGACY-ASSET-809D616D0D7D844F5720": (
        (42, 42, "59aaaae352f1e466bcd95ba6699b33f2e4ede6af22606d626a3ab8ba4caf15b0", "function signature, precondition, postcondition and failure design table"),
        (56, 56, "9fa9c581db4beec7ebf30e21b859f605bb0750ca97583362792e00533d897495", "unit-test contract and missing requirement coverage rule"),
        (64, 64, "3e63392808abdc1a6e4500aa1eac9ff0f3097d3c7717640fe7aa607197cb7dfe", "projection event writes evidence row without rewriting source docs"),
    ),
    "LEGACY-ASSET-B5B5E71B2AF1459D59A1": (
        (25, 25, "a169e239de64cb0d41cc4835b2a7ec931c6dd4994b3f3e88358a4456d651b41a", "L12 acceptance coverage contract"),
        (32, 32, "f598ef035f4f98d34aa93c36e019fe8ac287fb378fc64bfc0533e9a6ae616006", "L3 functional requirement purpose and L7 input boundary"),
        (58, 58, "5943c76c04db6cc93fb31e03eb2e4a8ba9389477eefd8c1a7bbf46991461b50d", "CI failure correction versus rerun decision candidate"),
        (60, 60, "15790ea8b6abe26930bb66049fd0b1625df54d8866eb491067b9411e5e1891ec", "fullback activation and approval decision candidate"),
    ),
    "LEGACY-ASSET-13604CA85F3B7D8D5055": (
        (58, 58, "86bee5b63f795bf0255d391d27504ded2aea46f999d1455bd2feecfe03a58378", "L7 implementation and test artifact mapping"),
        (62, 62, "1e5c34e50c66b7d7fc2647178145a915b99686335753c898229f725165ae9be6", "L11 review and UAT mapping"),
        (63, 63, "64ac8a8c19829221f62858615cdd41c2281f300bf8bfdc85afaa4b91470c9c15", "L12 deployment and acceptance mapping"),
    ),
    "LEGACY-ASSET-D63398C5A382549DC905": (
        (13, 13, "cf2cc7485386a58ed158ab9d9c8369ddd7b6cefa45d89111c3eb56c19497a68d", "semantic continuity audit purpose"),
        (16, 16, "d8124f8af50973ca23125110bccb9f883d91580f39e4e75ccab21ca6bfb10f8e", "proved status requires design, test design and implementation evidence"),
        (30, 30, "8b846ad1bb437526ee0cd0a4cae05de94937dafdb518834b78c737c5586c6670", "green selected slice versus remaining implementation target"),
    ),
    "LEGACY-ASSET-320E6F0B93975C430B1D": (
        (31, 31, "5b13bd247d791e449f23d57800d4bdb91870b6790439b6cd69174bd68bc4bf9f", "release module bundle behavior contract identity"),
        (42, 42, "8730a1130cfafce737fdb6caf0ba169d71f72c1922202bf3318e598b0df9863e", "fail-close contract failure conditions"),
        (44, 44, "75562532c162ac55711f34234a0a8014d23c4535ad4affa9114607810179ebfd", "runtime, builder and publish are separated from plan scope"),
    ),
    "LEGACY-ASSET-3CB7630AEBBC5932E11D": (
        (39, 39, "b92646bf263985269cf8cfebcd4cb24d6892a8c745e2e748084f13a5668213d4", "release, distribution, operation and security preconditions"),
        (41, 41, "faa330b1be545e3d39cbc991de96f8c88f251cd270f7bacdb603dc57b55aa56a", "release/deployment and observation authority invariants"),
        (42, 42, "9a2d36a433a34fb3418f178f1a7de84da4ad371d3c89d96e83248dfa290ce9ec", "fail-close conditions for target, digest, rollback, health and approval"),
    ),
    "LEGACY-ASSET-26391F9FB236CBD4D270": (
        (81, 81, "b94a94e196786494780664d1383f6b6213e3459764debd4bc9f1b18d812ddfd0", "approval check status vocabulary"),
        (91, 91, "2ab86f1c05fb1df42ee3b130452e695fb60e30ee0e271fb5f79445e01f3e3b7f", "approval snapshot evidence structure"),
        (110, 110, "640bba32f3bbdcf75b875a2d39e66da2d861a74cb04ac9d2837dc980cccd5c18", "pending and invalid approval statuses"),
    ),
    "LEGACY-ASSET-2149C3FCC5A18EB50185": (
        (12, 12, "b443623f7b2fe73a59580a52fe9cd468e2b6ffc2d42b87b3e0a55b9ff4b51e98", "L13 post-deploy source path reference in test source"),
        (25, 25, "6521ad67b60e7ca998b9f64ca2856e99fbaf1c969aa3a05abfb1c0043c0ff48a", "npm test execution guidance text in source"),
        (41, 41, "7e83219dff84cd8581f3b35c3803cf59e29c560dbf5249673cd7d684da751f3b", "consumer setup and package authority guidance in source"),
    ),
    "LEGACY-ASSET-FAAFFA616A44F65911EB": (
        (57, 57, "35db8419804c9ed019b2b83c34ea195a2fe8d16070ff759faaf9ea96e48178fe", "legacy shim and current L8 authority boundary"),
        (71, 71, "606a268bff29b250e315cc264bd6da17bfe5522b73ca2c72c8253d6b7b303652", "missing design/evidence fail-close condition"),
        (75, 75, "2b6c64bf79d972767deee5bb172068b63978bf83d44c442261e6c6a3ccd33b9c", "L6 signature, DbC and edge coverage test-design contract"),
    ),
}


def digest_bytes(value: bytes) -> str:
    return hashlib.sha256(value).hexdigest()


def digest_file(path: Path) -> str:
    return digest_bytes(path.read_bytes())


def jsonl(path: Path) -> list[dict]:
    return [json.loads(line) for line in path.read_text(encoding="utf-8").splitlines()]


def fail(errors: list[str], code: str, detail: str) -> None:
    errors.append(f"{code}: {detail}")


def line_span(path: Path, start: int, end: int) -> str:
    lines = path.read_text(encoding="utf-8").splitlines()
    return "\n".join(lines[start - 1 : end])


def validate_keysets(value: object) -> list[str]:
    """Reject unknown or missing keys at every pinned inventory hierarchy."""

    errors: list[str] = []

    def expected_for(path: str):
        lookup = path.removeprefix("root.")
        if lookup in KEYSETS:
            return KEYSETS[lookup]
        if lookup.startswith("provenance.ledgers."):
            return KEYSETS["provenance.ledgers.<entry>"]
        return None

    def walk(node: object, path: str) -> None:
        if isinstance(node, dict):
            wanted = expected_for(path)
            if wanted is None:
                fail(errors, "KEYSET_UNPINNED", path)
                return
            actual = frozenset(node)
            if actual != wanted:
                fail(errors, "KEYSET", f"{path}: expected={sorted(wanted)!r} actual={sorted(actual)!r}")
            for key, child in node.items():
                walk(child, f"{path}.{key}")
        elif isinstance(node, list):
            dict_items = [item for item in node if isinstance(item, dict)]
            if dict_items and len(dict_items) != len(node):
                fail(errors, "KEYSET_ARRAY_MIXED", path)
            for item in dict_items:
                walk(item, f"{path}[]")

    walk(value, "root")
    return errors


def validate_anchor_spec(errors: list[str], asset_id: str, anchors: object) -> None:
    expected = EXPECTED_ANCHOR_SPECS.get(asset_id)
    if expected is None:
        fail(errors, "ANCHOR_ASSET_SET", f"unexpected asset anchor set {asset_id}")
        return
    if not isinstance(anchors, list) or len(anchors) != len(expected):
        fail(errors, "ANCHOR_SET", f"{asset_id}: expected {len(expected)} anchors")
        return
    for index, (anchor, spec) in enumerate(zip(anchors, expected)):
        if not isinstance(anchor, dict):
            fail(errors, "ANCHOR_RECORD", f"{asset_id}[{index}] is not an object")
            continue
        start, end, text_sha256, meaning = spec
        if (anchor.get("line_start"), anchor.get("line_end")) != (start, end):
            fail(errors, "ANCHOR_COORDINATES", f"{asset_id}[{index}]")
        if digest_bytes(str(anchor.get("exact_text", "")).encode("utf-8")) != text_sha256:
            fail(errors, "ANCHOR_TEXT_PIN", f"{asset_id}[{index}]")
        if anchor.get("meaning") != meaning:
            fail(errors, "ANCHOR_MEANING", f"{asset_id}[{index}]")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", type=Path, default=Path(__file__).resolve().parents[2])
    parser.add_argument("--inventory", type=Path, default=Path(__file__).resolve().with_name("inventory.json"))
    args = parser.parse_args()
    root = args.root.resolve()
    inventory_path = args.inventory.resolve()
    errors: list[str] = []

    try:
        inv = json.loads(inventory_path.read_text(encoding="utf-8"))
    except Exception as exc:  # pragma: no cover - a malformed candidate is a validation error
        print(f"FAIL PHCAP15-FOLLOWUP: inventory unreadable: {exc}")
        return 1
    if not isinstance(inv, dict):
        print("FAIL PHCAP15-FOLLOWUP: inventory root must be an object")
        return 1

    expected_paths = {
        "phase_inventory": root / "docs/governance/phase-capability-inventory.json",
        "disposition": root / "docs/governance/legacy-asset-disposition.jsonl",
        "phase_ledger": root / "docs/governance/legacy-asset-phase-product-classification-bootstrap.jsonl",
        "decisions": root / "docs/governance/legacy-asset-decisions.jsonl",
        "copy_read_after": root / "docs/governance/legacy-asset-copy-read-after.jsonl",
        "manifest": root / "archive/legacy-generation-2026-09-14/MANIFEST.sha256",
    }
    errors.extend(validate_keysets(inv))
    if inv.get("schema") != "phcap15-deploy-pool12-research/v1":
        fail(errors, "SCHEMA", "schema mismatch")
    if inv.get("authority_effect") != "none" or inv.get("meaning_change_applied") is not False:
        fail(errors, "AUTHORITY_EFFECT", "authority_effect must be none and meaning_change_applied false")
    if inv.get("old_archive_runtime_test_ci_execution") is not False:
        fail(errors, "OLD_EXECUTION", "old archive/runtime/test/CI execution must remain false")

    base = inv.get("base", {})
    if any(base.get(k) != BASE_COMMIT for k in ("origin_main_commit", "origin_main_at_start", "origin_main_at_final")):
        fail(errors, "BASE", "origin/main exact commit drifted")
    if base.get("changed") is not False:
        fail(errors, "REBASELINE", "origin/main changed flag must remain false")
    if base.get("worktree") != BASE_WORKTREE:
        fail(errors, "BASE_WORKTREE", "worktree path does not match this isolated pool12 worktree")
    if inv.get("equivalence_claim") != EXPECTED_EQUIVALENCE_CLAIM:
        fail(errors, "EQUIVALENCE_CLAIM", "equivalence claim must remain null")

    phase_rows = jsonl(expected_paths["phase_ledger"])
    disposition_rows = jsonl(expected_paths["disposition"])
    decision_rows = jsonl(expected_paths["decisions"])
    copy_read_after_rows = jsonl(expected_paths["copy_read_after"])
    phase_by_id = {row["asset_id"]: row for row in phase_rows}
    disposition_by_id = {row["asset_id"]: row for row in disposition_rows}
    pool = [row["asset_id"] for row in phase_rows if "PHCAP-15" in (row.get("candidate_phase_targets") or [])]
    pool_set = set(pool)
    if len(pool) != POOL_EXPECTED or len(pool_set) != POOL_EXPECTED:
        fail(errors, "POOL_DENOMINATOR", f"expected unique PHCAP-15 pool {POOL_EXPECTED}, got {len(pool)}/{len(pool_set)}")

    scope = inv.get("scope", {})
    if scope.get("pool_asset_ids") != pool:
        fail(errors, "POOL_SCOPE", "inventory pool IDs do not match phase ledger order")
    excluded = scope.get("excluded_scopes", {})
    pr_ids = set(excluded.get("pr_2001", {}).get("asset_ids", []))
    pr2004_ids = set(excluded.get("pr_2004", {}).get("asset_ids", []))
    scf_ids = set(excluded.get("scf_b0037", {}).get("asset_ids", []))
    selected = scope.get("selected_asset_ids", [])
    selected_set = set(selected)
    remaining = set(scope.get("remaining_unreviewed_asset_ids", []))
    if pr_ids != PR2001_IDS:
        fail(errors, "PR2001_SCOPE", "PR #2001 exclusion set changed")
    if scf_ids != SCF0037_IDS:
        fail(errors, "SCF0037_SCOPE", "SCF-B-0037 exclusion set changed")
    if pr2004_ids != PR2004_IDS:
        fail(errors, "PR2004_SCOPE", "PR #2004 exclusion set changed")
    if len(selected) != SELECTED_EXPECTED or len(selected_set) != SELECTED_EXPECTED:
        fail(errors, "SELECTED_COUNT", "selected follow-up set must contain 12 unique assets")
    if not selected_set <= pool_set:
        fail(errors, "SELECTED_POOL", "selected asset is outside PHCAP-15 pool")
    if selected_set & (pr_ids | pr2004_ids | scf_ids):
        fail(errors, "NON_OVERLAP", "selected asset overlaps PR #2001, PR #2004 or SCF-B-0037")
    expected_remaining = pool_set - pr_ids - pr2004_ids - scf_ids - selected_set
    if remaining != expected_remaining:
        fail(errors, "REMAINING", f"remaining set mismatch: expected {len(expected_remaining)}, got {len(remaining)}")

    denominator = inv.get("denominator", {})
    expected_counts = {
        "pool_rows": 78,
        "pool_unique_asset_ids": 78,
        "pr_2001_selected_rows": 7,
        "pr_2004_selected_rows": 12,
        "scf_b0037_selected_rows": 3,
        "previously_reviewed_excluded_rows": 22,
        "already_reviewed_excluded_rows": 22,
        "next_selected_rows": 12,
        "followup_selected_rows": 12,
        "reviewed_or_selected_total": 34,
        "remaining_unreviewed_rows": 44,
    }
    for key, expected in expected_counts.items():
        if denominator.get(key) != expected:
            fail(errors, "DENOMINATOR", f"{key} expected {expected}, got {denominator.get(key)}")

    provenance = inv.get("provenance", {})
    for key, path in expected_paths.items():
        rel = {
            "phase_inventory": "docs/governance/phase-capability-inventory.json",
            "disposition": "docs/governance/legacy-asset-disposition.jsonl",
            "phase_ledger": "docs/governance/legacy-asset-phase-product-classification-bootstrap.jsonl",
            "decisions": "docs/governance/legacy-asset-decisions.jsonl",
            "copy_read_after": "docs/governance/legacy-asset-copy-read-after.jsonl",
            "manifest": "archive/legacy-generation-2026-09-14/MANIFEST.sha256",
        }[key]
        if not path.exists():
            fail(errors, "PROVENANCE", f"missing {rel}")
            continue
        recorded = provenance.get("ledgers", {}).get(rel, {}).get("sha256")
        actual = digest_file(path)
        if recorded != actual:
            fail(errors, "LEDGER_DIGEST", f"{rel} digest mismatch")

    def rows_for_asset(rows: list[dict], asset_id: str) -> list[dict]:
        return [row for row in rows if row.get("asset_id") == asset_id]

    boundary = inv.get("product_boundary_candidates", {})
    if set(boundary.get("defined_products", [])) != PRODUCTS:
        fail(errors, "PRODUCT_SET", "four-product boundary set changed")
    product_rows = boundary.get("products", [])
    if {row.get("product") for row in product_rows} != PRODUCTS:
        fail(errors, "PRODUCT_ROWS", "four product candidate rows are incomplete")
    if boundary.get("authority_effect") != "none" or boundary.get("current_implementation_claim") is not False:
        fail(errors, "PRODUCT_PROMOTION", "product boundary cannot create authority or implementation claim")
    for product in product_rows:
        if product.get("current_authority_status") != "none" or product.get("current_implementation_status") != "unknown":
            fail(errors, "PRODUCT_STATUS", f"{product.get('product')} status promoted")
        for ref in product.get("refs", []):
            path = root / ref["path"]
            if not path.exists():
                fail(errors, "PRODUCT_REF", f"missing current boundary ref {ref['path']}")
                continue
            if digest_file(path) != ref.get("file_sha256"):
                fail(errors, "PRODUCT_REF_DIGEST", f"current boundary digest mismatch {ref['path']}")
            text = line_span(path, ref["line_start"], ref["line_end"])
            if digest_bytes(text.encode("utf-8")) != ref.get("span_sha256"):
                fail(errors, "PRODUCT_REF_SPAN", f"current boundary span mismatch {ref['path']}")

    asset_rows = inv.get("assets", [])
    if [row.get("asset_id") for row in asset_rows] != selected:
        fail(errors, "ASSET_ORDER", "asset rows must follow selected_asset_ids")
    if len(asset_rows) != SELECTED_EXPECTED:
        fail(errors, "ASSET_COUNT", "asset detail rows must contain 12 records")
    if {row.get("asset_id") for row in asset_rows} != set(EXPECTED_ANCHOR_SPECS):
        fail(errors, "ANCHOR_ASSET_SET", "asset rows do not match independently pinned anchor assets")
    for asset in asset_rows:
        aid = asset.get("asset_id")
        validate_anchor_spec(errors, aid, asset.get("source_anchors"))
        if aid not in selected_set:
            fail(errors, "ASSET_ID", f"unexpected selected asset {aid}")
            continue
        if asset.get("semantic_diversity_kind") != EXPECTED_SEMANTIC_DIVERSITY_KINDS.get(aid):
            fail(errors, "SEMANTIC_DIVERSITY_KIND", f"semantic diversity kind changed {aid}")
        if asset.get("artifact_evidence_kind") != EXPECTED_ARTIFACT_EVIDENCE_KINDS.get(aid):
            fail(errors, "ARTIFACT_EVIDENCE_KIND", f"artifact evidence kind changed {aid}")
        if asset.get("unresolved") != EXPECTED_UNRESOLVED:
            fail(errors, "UNRESOLVED_BODY", f"unresolved evidence changed {aid}")
        phase = phase_by_id.get(aid)
        disp = disposition_by_id.get(aid)
        if phase is None or disp is None:
            fail(errors, "ASSET_LEDGER", f"missing ledger row for {aid}")
            continue
        archive = root / "archive/legacy-generation-2026-09-14/root" / phase["source_path"]
        if not archive.exists():
            fail(errors, "ARCHIVE_SOURCE", f"missing archive source {aid}")
            continue
        actual_sha = digest_file(archive)
        if asset.get("source_file_sha256") != actual_sha or asset.get("ledger_source_sha256") != phase.get("source_sha256") or phase.get("source_sha256") != actual_sha:
            fail(errors, "SOURCE_DIGEST", f"source/archive/ledger digest mismatch {aid}")
        if asset.get("source_path") != phase.get("source_path") or asset.get("source_revision") != phase.get("source_revision"):
            fail(errors, "SOURCE_IDENTITY", f"source identity mismatch {aid}")
        if asset.get("source_line_count") != len(archive.read_text(encoding="utf-8").splitlines()):
            fail(errors, "SOURCE_LINES", f"source line count mismatch {aid}")
        if "PHCAP-15" not in (asset.get("candidate_phase_targets") or []) or asset.get("phase_admission") != "unresolved_candidate_only":
            fail(errors, "PHASE_PROMOTION", f"phase admission promoted or missing {aid}")
        if asset.get("candidate_phase_targets") != phase.get("candidate_phase_targets"):
            fail(errors, "PHASE_TARGETS", f"phase candidate targets changed {aid}")
        if asset.get("candidate_product_targets") != phase.get("candidate_product_targets"):
            fail(errors, "PRODUCT_TARGETS", f"product candidate targets changed {aid}")
        if asset.get("product_owner_status") != "unresolved":
            fail(errors, "OWNER_PROMOTION", f"product owner promoted {aid}")
        for key in ("legacy_implementation_status", "current_implementation_status", "current_operation_status", "current_acceptance_status", "current_degradation_status"):
            if asset.get(key) != "unknown":
                fail(errors, "IMPLEMENTATION_PROMOTION", f"{key} promoted for {aid}")
        if asset.get("legacy_execution_performed") is not False or asset.get("disposition") != "unresolved" or asset.get("authority_status") != "historical":
            fail(errors, "LEGACY_STATUS", f"legacy status promoted for {aid}")
        if asset.get("decision_matches") != 0 or asset.get("decision_record_refs"):
            fail(errors, "DECISION_PROMOTION", f"decision history invented for {aid}")
        if len(rows_for_asset(decision_rows, aid)) != asset.get("decision_matches"):
            fail(errors, "DECISION_LEDGER", f"decision ledger match count mismatch {aid}")
        if asset.get("copy_read_after_matches") != 0:
            fail(errors, "COPY_PROMOTION", f"copy/read-after history invented for {aid}")
        if len(rows_for_asset(copy_read_after_rows, aid)) != asset.get("copy_read_after_matches"):
            fail(errors, "COPY_LEDGER", f"copy/read-after ledger match count mismatch {aid}")
        if asset.get("consumer_closure_status") != "pending" or asset.get("consumer_refs"):
            fail(errors, "CONSUMER_PROMOTION", f"consumer closure promoted for {aid}")
        failure = asset.get("failure_evidence", {})
        if failure.get("execution_receipts") != 0 or failure.get("failure_outcome_observed") is not False:
            fail(errors, "FAILURE_PROMOTION", f"failure receipt/outcome invented for {aid}")
        consumer = asset.get("consumer_evidence", {})
        if consumer.get("consumer_closure_observed") is not False:
            fail(errors, "CONSUMER_EVIDENCE", f"consumer closure invented for {aid}")
        for anchor in asset.get("source_anchors", []):
            start, end = anchor.get("line_start"), anchor.get("line_end")
            if not isinstance(start, int) or not isinstance(end, int) or start < 1 or end < start:
                fail(errors, "SOURCE_SPAN", f"invalid span {aid}")
                continue
            text = line_span(archive, start, end)
            if text != anchor.get("exact_text"):
                fail(errors, "SOURCE_TEXT", f"exact source span mismatch {aid}:{start}-{end}")
            if digest_bytes(text.encode("utf-8")) != anchor.get("source_span_sha256"):
                fail(errors, "SOURCE_SPAN_DIGEST", f"source span digest mismatch {aid}:{start}-{end}")

    selected_anchor_total = sum(len(asset.get("source_anchors", [])) for asset in asset_rows)
    expected_inventory_counts = {
        "pool_rows": len(pool),
        "selected_rows": len(selected),
        "excluded_rows": len(pr_ids | pr2004_ids | scf_ids),
        "remaining_unreviewed_rows": len(expected_remaining),
        "four_products": len(PRODUCTS),
        "selected_source_anchors": selected_anchor_total,
        "evidence_kinds": sorted({asset.get("artifact_evidence_kind") for asset in asset_rows}),
    }
    if inv.get("counts") != expected_inventory_counts:
        fail(errors, "COUNTS", f"inventory counts mismatch: expected={expected_inventory_counts!r} got={inv.get('counts')!r}")
    if inv.get("prohibited_inference") != EXPECTED_PROHIBITED_INFERENCE:
        fail(errors, "PROHIBITED_INFERENCE", "prohibited inference text changed")

    aggregate = inv.get("aggregate_evidence", {})
    aggregate_expected = {
        "selected_asset_count": 12,
        "selected_asset_decision_matches": 0,
        "selected_asset_copy_read_after_matches": 0,
        "selected_failure_execution_receipts": 0,
        "selected_consumer_refs_nonempty": 0,
        "selected_consumer_closure_pending": 12,
        "selected_implementation_statuses": ["unknown"],
        "current_implementation_status": "unknown",
        "current_degradation_status": "unknown",
        "current_phase_admission": "unresolved_candidate_only",
    }
    for key, expected in aggregate_expected.items():
        if aggregate.get(key) != expected:
            fail(errors, "AGGREGATE", f"{key} expected {expected}, got {aggregate.get(key)}")

    if errors:
        print("FAIL PHCAP15-DEPLOY-POOL12")
        print("\n".join(errors))
        return 1
    print("PASS PHCAP15 deploy pool12: pool=78 excluded=22 selected=12 remaining=44")
    print("PASS source/archive digest, exact spans, phase/asset/decision/copy/failure/consumer unknowns")
    print("PASS four-product candidate boundary and no authority/implementation promotion")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
