#!/usr/bin/env python3
"""Static validator for the PHCAP-15 deploy classification-gap scaffold."""

from __future__ import annotations

import hashlib
import json
import sys
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[2]
INVENTORY_PATH = Path(__file__).with_name("inventory.json")
EXPECTED_IDS = {
    "LEGACY-ASSET-042D2B732DC68AA7EE9A",
    "LEGACY-ASSET-578A66F54CD01046B7BA",
    "LEGACY-ASSET-18BB86CC5625C31430B8",
    "LEGACY-ASSET-FA8D4E24D8399E8350F1",
    "LEGACY-ASSET-327A88B2141C43045AF1",
    "LEGACY-ASSET-BADD68B87BA5BE0F3906",
    "LEGACY-ASSET-7995556682FC5493C37E",
}
EXPECTED_PRODUCTS = {"HELIX-HARNESS", "HELIX-OS", "HELIX-Web", "HELIX-Web-OS"}
EXPECTED_POOL = {
    "rows": 78,
    "historical_unresolved": 75,
    "source_snapshot_pending": 3,
    "selected": 7,
    "outside_selected": 71,
}
EXPECTED_PHASE = {
    "task_id": "PHCAP-15",
    "current_status": "draft_requirement",
    "legacy_capability_status": "documented_partial",
    "transition_assessment": "degraded_to_draft",
}
EXPECTED_DENOMINATOR = {
    "archive_manifest_assets": 4020,
    "asset_disposition_rows": 4020,
    "asset_disposition_unresolved": 3991,
}
EXPECTED_CAPTURE_SCOPE = (
    "PHCAP-15 Deploy classification gap; seven old asset candidates, four product boundary "
    "candidates, and implementation/failure/consumer evidence"
)
EXPECTED_ARCHIVE_READ_MODE = "static_bytes_spans_digests_only"
EXPECTED_UNIT_BOUNDARIES = {
    "HELIX-HARNESS": "工程・artifact内容・consumer利用条件の候補。配布運転はHELIX-OS側へ分離する候補。",
    "HELIX-OS": "project authority、release準備、artifact受渡し、配布運転を統制する候補。展開先runtime authorityは吸収しない。",
    "HELIX-Web": "利用者向けWeb体験の候補。展開後のtenant、service state、配備、監視、復旧はWeb-OSへ分離する候補。",
    "HELIX-Web-OS": "Web展開先のtenant、service runtime、配備、監視、復旧の候補。HELIX-OSとはauthority、state、credential、writerを分離する候補。",
}
EXPECTED_PRODUCT_EVIDENCE_STATUS = {
    "HELIX-HARNESS": "four_product_boundary_candidate_only",
    "HELIX-OS": "current_l2_draft_candidate",
    "HELIX-Web": "boundary_candidate_no_direct_phcap15_evidence",
    "HELIX-Web-OS": "current_l2_draft_candidate",
}
EXPECTED_EVIDENCE_GAP_INTERPRETATIONS = {
    "decision": "個別採否・再利用・replacementの判断行は無く、旧資産はunresolvedのまま",
    "failure": "sourceのfailure条件、negative test、local audit境界はfailure outcome receiptではない",
    "consumer": "consumer identity、scope、revision、read-after、handoff closureは未確定",
    "implementation": "旧source／test／runtime evidenceは候補であり、現行implementation evidenceはunknown",
}
EXPECTED_PROHIBITED_INFERENCE = [
    "PHCAP-15 pool membership is a classification candidate only; it is not a requirement link or product ownership.",
    "legacy artifact layer, source presence, command names, test source, or runtime-state prose do not establish current implementation, pass, deployment, or acceptance.",
    "phase transition_assessment degraded_to_draft is phase-level inventory language; it is not a per-asset current degraded/unimplemented verdict.",
    "absence of direct HELIX-Web deployment refs is unknown and is not a non-implementation finding.",
    "empty consumer_refs and pending closure are evidence gaps, not proof that no consumer ever existed.",
    "this scaffold and its validation do not create authority, requirement adoption, successor, owner, implementation, acceptance, release, deployment, or human decision.",
]
EXPECTED_REQUIRED_COMMANDS = [
    "python3 -B scaffold/phcap15-deploy-gap-research/validate.py",
    "python3 -B scaffold/phcap15-deploy-gap-research/selfcheck.py",
    "python3 -B scaffold/tools/scfctl.py validate",
    "python3 -B scaffold/tools/scfctl.py stale",
    "python3 -B scaffold/tools/scfctl.py residuals",
    "git diff --check",
]
EXPECTED_NEGATIVE_CASES = [
    "pool membership to requirement/product link promotion",
    "archive source to current implementation/pass/deployment promotion",
    "phase degraded_to_draft to per-asset degraded/unimplemented promotion",
    "failure condition or negative test to observed failure receipt",
    "empty consumer refs to no-consumer proof or pending to closure",
    "current product boundary candidate to authority/owner/adoption",
    "digest/span/source path/denominator mutation",
]
EXPECTED_ANCHOR_COUNTS = {
    "LEGACY-ASSET-042D2B732DC68AA7EE9A": 3,
    "LEGACY-ASSET-578A66F54CD01046B7BA": 4,
    "LEGACY-ASSET-18BB86CC5625C31430B8": 4,
    "LEGACY-ASSET-FA8D4E24D8399E8350F1": 1,
    "LEGACY-ASSET-327A88B2141C43045AF1": 3,
    "LEGACY-ASSET-BADD68B87BA5BE0F3906": 2,
    "LEGACY-ASSET-7995556682FC5493C37E": 2,
}
EXPECTED_ANCHOR_MEANINGS = {
    "LEGACY-ASSET-042D2B732DC68AA7EE9A": [
        "rollback planなしのdeployを完成扱いせず、監視提案に検証commandを要求する",
        "Pushからstaging／prod deployまでの旧工程列を記述する",
        "health／ready checkを記述する",
    ],
    "LEGACY-ASSET-578A66F54CD01046B7BA": [
        "同一artifact promotionを定義するが、実deployment・credential・cloud resource作成を行わない",
        "staging／production分離、approval receipt、rollback／health／monitoring bindingと拒否条件を定義する",
        "rollback／health／monitoring evidenceとdeployment audit logを要求する",
        "L3要件がL6/L7実装と実cloud deploymentを先取りしないと明記する",
    ],
    "LEGACY-ASSET-18BB86CC5625C31430B8": [
        "deploy gate順序、rollback基準、証跡責務を定義する",
        "pre-deploy gateとfailure時のblockを定義する",
        "post-deploy smoke、rollback trigger／procedure、rollback後のfailure追跡を定義する",
        "gate／smoke／monitoring／evidence／recoveryのchecklistを定義する",
    ],
    "LEGACY-ASSET-FA8D4E24D8399E8350F1": [
        "version-up dry-run CLIがrelease tag、migration、rollback、release gateのplan-only結果を投影する",
    ],
    "LEGACY-ASSET-327A88B2141C43045AF1": [
        "version-up readinessのdry-run、rollback plan、release gate構造を型で表す",
        "activation approval／dry-run／rollback／exit条件を要求するrecord fieldsを定義する",
        "no-prod-writeとrollback rehearsalを含むactivation evidence集合を定義する",
    ],
    "LEGACY-ASSET-BADD68B87BA5BE0F3906": [
        "consumer doctorが生成consumer setupを検査する旧test source",
        "consumer CIのread-only smoke-test contract違反をfail-closeする旧test source",
    ],
    "LEGACY-ASSET-7995556682FC5493C37E": [
        "local verification bandとproduction deploy／post-deploy observation／PO signoffの境界を明記する",
        "旧test／doctor commandを列挙しつつproduction deploymentとfinal signoffではないと閉じる",
    ],
}
EXPECTED_KEYSETS = {
    "root": frozenset({"schema", "capture", "phase", "denominator", "products", "assets", "evidence_gaps", "prohibited_inference", "verification_contract"}),
    "root.capture": frozenset({"basis_revision", "basis_ref", "observed_at", "worktree", "authority_effect", "new_build_allowed", "scope", "archive_read_mode", "old_execution_performed"}),
    "root.phase": frozenset({"task_id", "title", "current_status", "current_evidence_products", "current_refs", "legacy_layers_evidenced", "legacy_capability_status", "transition_assessment", "gap_statement", "new_build_allowed", "authority_effect", "source"}),
    "root.phase.source": frozenset({"path", "sha256"}),
    "root.denominator": frozenset({"archive_manifest_assets", "asset_disposition_rows", "asset_disposition_unresolved", "phcap15_classification_pool_rows", "phcap15_pool_historical_unresolved", "phcap15_pool_source_snapshot_pending", "selected_representative_rows", "selected_rows_still_unresolved", "pool_rows_outside_selected_scope", "pool_coverage_statement"}),
    "root.products[]": frozenset({"product_id", "unit_boundary", "current_evidence_status", "refs"}),
    "root.products[].refs[]": frozenset({"path", "line_start", "line_end", "span_sha256", "file_sha256"}),
    "root.assets[]": frozenset({"asset_id", "source_path", "archive_path", "artifact_evidence_kind", "source_file_sha256", "source_line_count", "candidate_phase_targets", "candidate_product_targets", "phase_classification_status", "product_classification_status", "implementation_evidence_state", "legacy_execution_performed", "legacy_implementation_status", "disposition", "consumer_closure_status", "consumer_refs", "decision_matches", "copy_read_after_matches", "anchors", "current_interpretation"}),
    "root.assets[].anchors[]": frozenset({"line_start", "line_end", "span_sha256", "meaning"}),
    "root.assets[].current_interpretation": frozenset({"implementation", "degradation", "failure", "consumer"}),
    "root.evidence_gaps": frozenset({"decision", "failure", "consumer", "implementation"}),
    "root.evidence_gaps.decision": frozenset({"selected_asset_decision_matches", "selected_asset_copy_read_after_matches", "interpretation"}),
    "root.evidence_gaps.failure": frozenset({"selected_failure_receipts", "interpretation"}),
    "root.evidence_gaps.consumer": frozenset({"selected_consumer_refs_nonempty", "selected_consumer_closure_pending", "interpretation"}),
    "root.evidence_gaps.implementation": frozenset({"old_source_implementation_candidates", "old_test_candidates", "old_runtime_evidence_candidates", "current_implementation_evidence", "interpretation"}),
    "root.verification_contract": frozenset({"archive_execution", "current_implementation_claim", "required_commands", "negative_cases"}),
}


def sha256_bytes(value: bytes) -> str:
    return hashlib.sha256(value).hexdigest()


def sha256_file(path: Path) -> str:
    return sha256_bytes(path.read_bytes())


def read_jsonl(path: Path) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    for line_number, line in enumerate(path.read_text(encoding="utf-8").splitlines(), 1):
        try:
            value = json.loads(line)
        except json.JSONDecodeError as exc:
            raise ValueError(f"JSONL_PARSE:{path}:{line_number}:{exc}") from exc
        if not isinstance(value, dict):
            raise ValueError(f"JSONL_ROW:{path}:{line_number}")
        rows.append(value)
    return rows


def span_digest(path: Path, line_start: int, line_end: int) -> str:
    lines = path.read_text(encoding="utf-8").splitlines(keepends=True)
    if line_start < 1 or line_end < line_start or line_end > len(lines):
        return "INVALID_SPAN"
    return sha256_bytes("".join(lines[line_start - 1 : line_end]).encode("utf-8"))


def add(errors: list[str], code: str, detail: str) -> None:
    errors.append(f"{code}:{detail}")


def validate_keysets(value: object) -> list[str]:
    errors: list[str] = []

    def walk(node: object, path: str) -> None:
        expected = EXPECTED_KEYSETS.get(path)
        if expected is not None:
            if not isinstance(node, dict):
                errors.append(f"E_KEYSET_TYPE:{path}")
            elif set(node) != expected:
                errors.append(f"E_KEYSET:{path}")
        if isinstance(node, dict):
            for key, child in node.items():
                walk(child, f"{path}.{key}")
        elif isinstance(node, list):
            for child in node:
                if isinstance(child, (dict, list)):
                    walk(child, f"{path}[]")

    walk(value, "root")
    return errors


def validate_inventory(data: dict[str, Any], root: Path = ROOT) -> list[str]:
    errors: list[str] = validate_keysets(data)
    expected_top = {
        "schema", "capture", "phase", "denominator", "products", "assets",
        "evidence_gaps", "prohibited_inference", "verification_contract",
    }
    if set(data) != expected_top:
        add(errors, "E_KEYS", f"top={sorted(data)}")
    if data.get("schema") != "phcap15-deploy-gap-research/v1":
        add(errors, "E_SCHEMA", str(data.get("schema")))

    capture = data.get("capture", {})
    if capture.get("basis_ref") != "origin/main":
        add(errors, "E_BASIS", "basis_ref")
    if capture.get("basis_revision") != "2ff4f888249b350afb624e359eaa8e3f3ea6defb":
        add(errors, "E_BASIS", "basis_revision")
    if capture.get("authority_effect") != "none" or capture.get("new_build_allowed") is not False:
        add(errors, "E_AUTHORITY", "capture boundary promoted")
    if capture.get("scope") != EXPECTED_CAPTURE_SCOPE:
        add(errors, "E_CAPTURE_SCOPE", "capture scope changed")
    if capture.get("archive_read_mode") != EXPECTED_ARCHIVE_READ_MODE:
        add(errors, "E_ARCHIVE_READ_MODE", "archive read mode is not static-only")
    if capture.get("old_execution_performed") is not False:
        add(errors, "E_OLD_EXECUTION", "old execution must remain false")

    phase = data.get("phase", {})
    for key, expected in EXPECTED_PHASE.items():
        if phase.get(key) != expected:
            add(errors, "E_PHASE", f"{key}={phase.get(key)!r}")
    if phase.get("new_build_allowed") is not False or phase.get("authority_effect") != "inventory_and_work_projection_only":
        add(errors, "E_PHASE_BOUNDARY", "phase boundary")
    phase_source = phase.get("source", {})
    phase_path = root / phase_source.get("path", "")
    if not phase_path.is_file() or sha256_file(phase_path) != phase_source.get("sha256"):
        add(errors, "E_PHASE_SOURCE", str(phase_source.get("path")))

    denominator = data.get("denominator", {})
    for key, expected in EXPECTED_DENOMINATOR.items():
        if denominator.get(key) != expected:
            add(errors, "E_DENOMINATOR", f"{key}={denominator.get(key)!r}")
    for key, expected in {
        "phcap15_classification_pool_rows": EXPECTED_POOL["rows"],
        "phcap15_pool_historical_unresolved": EXPECTED_POOL["historical_unresolved"],
        "phcap15_pool_source_snapshot_pending": EXPECTED_POOL["source_snapshot_pending"],
        "selected_representative_rows": EXPECTED_POOL["selected"],
        "pool_rows_outside_selected_scope": EXPECTED_POOL["outside_selected"],
    }.items():
        if denominator.get(key) != expected:
            add(errors, "E_DENOMINATOR", f"{key}={denominator.get(key)!r}")

    products = data.get("products", [])
    if {p.get("product_id") for p in products} != EXPECTED_PRODUCTS or len(products) != 4:
        add(errors, "E_PRODUCTS", "four product units changed")
    for product in products:
        product_id = product.get("product_id")
        if product.get("unit_boundary") != EXPECTED_UNIT_BOUNDARIES.get(product_id):
            add(errors, "E_PRODUCT_UNIT_BOUNDARY", str(product_id))
        if product.get("current_evidence_status") != EXPECTED_PRODUCT_EVIDENCE_STATUS.get(product_id):
            add(errors, "E_PRODUCT_EVIDENCE_STATUS", str(product_id))
        for ref in product.get("refs", []):
            path = root / ref.get("path", "")
            if not path.is_file():
                add(errors, "E_CURRENT_REF", ref.get("path", ""))
                continue
            if sha256_file(path) != ref.get("file_sha256"):
                add(errors, "E_CURRENT_DIGEST", ref.get("path", ""))
            if span_digest(path, ref.get("line_start", 0), ref.get("line_end", 0)) != ref.get("span_sha256"):
                add(errors, "E_CURRENT_SPAN", ref.get("path", ""))

    disposition_path = root / "docs/governance/legacy-asset-disposition.jsonl"
    classification_path = root / "docs/governance/legacy-asset-phase-product-classification-bootstrap.jsonl"
    decision_path = root / "docs/governance/legacy-asset-decisions.jsonl"
    read_after_path = root / "docs/governance/legacy-asset-copy-read-after.jsonl"
    try:
        disposition = {row["asset_id"]: row for row in read_jsonl(disposition_path)}
        classification_rows = read_jsonl(classification_path)
        decisions = read_jsonl(decision_path)
        read_afters = read_jsonl(read_after_path)
    except (OSError, KeyError, ValueError) as exc:
        add(errors, "E_LEDGER_READ", str(exc))
        return errors

    pool = [row for row in classification_rows if "PHCAP-15" in row.get("candidate_phase_targets", [])]
    if len(disposition) != 4020 or len(pool) != EXPECTED_POOL["rows"]:
        add(errors, "E_LEDGER_DENOMINATOR", f"disposition={len(disposition)} pool={len(pool)}")
    pool_ids = {row.get("asset_id") for row in pool}
    pool_unresolved = sum(disposition.get(asset_id, {}).get("disposition") == "unresolved" for asset_id in pool_ids)
    pool_snapshots = sum(disposition.get(asset_id, {}).get("disposition") == "source_snapshot_preservation" for asset_id in pool_ids)
    if pool_unresolved != EXPECTED_POOL["historical_unresolved"] or pool_snapshots != EXPECTED_POOL["source_snapshot_pending"]:
        add(errors, "E_POOL_STATE", f"unresolved={pool_unresolved} snapshots={pool_snapshots}")
    if sum(row.get("disposition") == "unresolved" for row in disposition.values()) != 3991:
        add(errors, "E_GLOBAL_DENOMINATOR", "unresolved asset disposition denominator")

    assets = data.get("assets", [])
    if len(assets) != 7 or {asset.get("asset_id") for asset in assets} != EXPECTED_IDS:
        add(errors, "E_ASSETS", "selected representative set changed")
    classification = {row.get("asset_id"): row for row in pool}
    for asset in assets:
        asset_id = asset.get("asset_id")
        old = disposition.get(asset_id)
        candidate = classification.get(asset_id)
        if asset_id not in EXPECTED_IDS or old is None or candidate is None:
            add(errors, "E_ASSET_JOIN", str(asset_id))
            continue
        if asset_id not in pool_ids:
            add(errors, "E_POOL_LINK", asset_id)
        archive_path = root / asset.get("archive_path", "")
        if not archive_path.is_file():
            add(errors, "E_ARCHIVE_PATH", asset.get("archive_path", ""))
            continue
        if sha256_file(archive_path) != asset.get("source_file_sha256") or sha256_file(archive_path) != old.get("source_sha256"):
            add(errors, "E_ARCHIVE_DIGEST", asset_id)
        if len(archive_path.read_text(encoding="utf-8").splitlines()) != asset.get("source_line_count"):
            add(errors, "E_ARCHIVE_LINES", asset_id)
        expected_meanings = EXPECTED_ANCHOR_MEANINGS.get(asset_id, [])
        if len(asset.get("anchors", [])) != EXPECTED_ANCHOR_COUNTS.get(asset_id):
            add(errors, "E_ANCHOR_COUNT", asset_id)
        if [anchor.get("meaning") for anchor in asset.get("anchors", [])] != expected_meanings:
            add(errors, "E_ANCHOR_MEANINGS", asset_id)
        for anchor in asset.get("anchors", []):
            if span_digest(archive_path, anchor.get("line_start", 0), anchor.get("line_end", 0)) != anchor.get("span_sha256"):
                add(errors, "E_ANCHOR_DIGEST", f"{asset_id}:{anchor.get('line_start')}-{anchor.get('line_end')}")
        for key in ("artifact_evidence_kind", "candidate_phase_targets", "candidate_product_targets", "implementation_evidence_state", "legacy_execution_performed", "legacy_implementation_status", "consumer_closure_status", "consumer_refs"):
            if asset.get(key) != candidate.get(key):
                add(errors, "E_CLASSIFICATION", f"{asset_id}:{key}")
        if asset.get("disposition") != old.get("disposition") or old.get("disposition") != "unresolved":
            add(errors, "E_DISPOSITION", asset_id)
        if old.get("consumer_refs") != [] or asset.get("consumer_refs") != [] or asset.get("consumer_closure_status") != "pending":
            add(errors, "E_CONSUMER_PROMOTION", asset_id)
        if asset.get("legacy_execution_performed") is not False or asset.get("legacy_implementation_status") != "unknown":
            add(errors, "E_IMPLEMENTATION_PROMOTION", asset_id)
        if sum(row.get("asset_id") == asset_id for row in decisions) != asset.get("decision_matches"):
            add(errors, "E_DECISION_COUNT", asset_id)
        if sum(row.get("asset_id") == asset_id for row in read_afters) != asset.get("copy_read_after_matches"):
            add(errors, "E_READ_AFTER_COUNT", asset_id)
        current = asset.get("current_interpretation", {})
        if current.get("implementation") != "unknown":
            add(errors, "E_CURRENT_IMPLEMENTATION", asset_id)
        if current.get("failure", "").startswith("no failure receipt") is False and "no failure" not in current.get("failure", ""):
            add(errors, "E_FAILURE_PROMOTION", asset_id)
        if "unknown" not in current.get("consumer", "") and "pending" not in current.get("consumer", ""):
            add(errors, "E_CONSUMER_INTERPRETATION", asset_id)

    evidence = data.get("evidence_gaps", {})
    if evidence.get("decision", {}).get("selected_asset_decision_matches") != 0:
        add(errors, "E_DECISION_GAP", "decision matches")
    if evidence.get("failure", {}).get("selected_failure_receipts") != 0:
        add(errors, "E_FAILURE_GAP", "failure receipts")
    if evidence.get("consumer", {}).get("selected_consumer_refs_nonempty") != 0 or evidence.get("consumer", {}).get("selected_consumer_closure_pending") != 7:
        add(errors, "E_CONSUMER_GAP", "consumer gap")
    for key, expected in EXPECTED_EVIDENCE_GAP_INTERPRETATIONS.items():
        if evidence.get(key, {}).get("interpretation") != expected:
            add(errors, "E_EVIDENCE_GAP_INTERPRETATION", key)
    if data.get("prohibited_inference") != EXPECTED_PROHIBITED_INFERENCE:
        add(errors, "E_INFERENCE_GUARD", "prohibited inference guard changed")
    verification = data.get("verification_contract", {})
    if verification.get("archive_execution") != "forbidden":
        add(errors, "E_VERIFY_ARCHIVE_EXECUTION", "archive execution must be forbidden")
    if verification.get("current_implementation_claim") != "unknown_only":
        add(errors, "E_VERIFY_CURRENT_IMPL", "current implementation claim changed")
    if verification.get("required_commands") != EXPECTED_REQUIRED_COMMANDS:
        add(errors, "E_VERIFY_REQUIRED_COMMANDS", "required commands changed")
    if verification.get("negative_cases") != EXPECTED_NEGATIVE_CASES:
        add(errors, "E_VERIFY_NEGATIVE_CASES", "negative cases changed")
    return errors


def main() -> int:
    try:
        data = json.loads(INVENTORY_PATH.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        print(f"E_INVENTORY_READ:{exc}", file=sys.stderr)
        return 2
    errors = validate_inventory(data)
    if errors:
        for error in errors:
            print(error, file=sys.stderr)
        print(f"PHCAP-15 deploy gap validation: FAIL ({len(errors)} errors)", file=sys.stderr)
        return 1
    print("PHCAP-15 deploy gap validation: PASS (static ledger/source/span/unknown checks)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
