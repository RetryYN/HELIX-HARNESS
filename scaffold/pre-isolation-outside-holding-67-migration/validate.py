#!/usr/bin/env python3
"""Independent validator for the outside-67 historical capture migration."""

from __future__ import annotations

import hashlib
import json
import subprocess
import sys
from pathlib import Path


HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
INV = HERE / "migration.json"
PROPOSAL = HERE / "proposed-register-record.json"
READ_AFTER = HERE / "read-after-14.json"
CURRENT = ROOT / "docs/governance/management-provisional-requirement-register.jsonl"
HISTORICAL = ROOT / "docs/governance/management-provisional-requirement-register-pre-append-3df81ad.jsonl"
SOURCE = ROOT / "docs/governance/pre-isolation-outside-holding-67-source-holding.jsonl"
COVERAGE = ROOT / "docs/governance/audits/source-rebaseline/pre-isolation-outside-holding-67-coverage-receipt-2026-09-22.md"
PHASE = ROOT / "docs/governance/phase-capability-inventory.json"
CAPTURE = "3df81ad27157c471e004083783f37a5860eaa2ee"
LATEST_MAIN = "f122d65e1435b4709fbb7b07fbb8e42b70f0b110"
OLD_REGISTER_SHA = "4e43fadaec48dcb0399e73eff148419671d4ac87fd4f8f68899dadf186ce5b8b"
PHASE_SHA = "9face795f98c660bec02d46106f08a25ba189633f6b555b563a0c7951e173f0c"
PR1975 = "2c0f287dda2cd9252cd64255cfa4cdf695653754"
PR1978 = "d272a97b3e55401fa75ad41670fbeefd18f8a4cf"
PR1975_MERGE = "4919cfd245ee128fee71c713c8d2d0a8cd5fcd11"
HISTORICAL_REGISTER_PATH = "docs/governance/management-provisional-requirement-register-pre-append-3df81ad.jsonl"
CURRENT_REGISTER_PATH = "docs/governance/management-provisional-requirement-register.jsonl"
EXPECTED_AFFECTED_HISTORICAL_CAPTURES = [
    "scaffold/pre-isolation-outside-holding-first15/inventory.json",
    "scaffold/phcap02-03-registration-classification-audit/inventory.json",
    "scaffold/rdp001-delegated-doc003-unprocessed8/report.json",
    "scaffold/rdp001-unassessed-atom-audit/report.json",
    "scaffold/pre-isolation-outside-l1-semantic/inventory.json",
    "docs/governance/phase-capability-inventory.json",
    "scaffold/bindings/SCF-B-0027.json",
    "scaffold/bindings/SCF-B-0029.json",
    "scaffold/bindings/SCF-B-0034.json",
    "scaffold/bindings/SCF-B-0035.json",
    "scaffold/bindings/SCF-B-0036.json",
]
EXPECTED_REPOINTED_SOURCES = [
    {"path": "scaffold/pre-isolation-outside-holding-67-proposal/generate.py", "role": "generator", "historical_register_ref": HISTORICAL_REGISTER_PATH},
    {"path": "scaffold/pre-isolation-outside-holding-67-proposal/validate.py", "role": "validator", "historical_register_ref": HISTORICAL_REGISTER_PATH},
    {"path": "scaffold/pre-isolation-outside-holding-first15/generate.py", "role": "generator", "historical_register_ref": HISTORICAL_REGISTER_PATH},
    {"path": "scaffold/pre-isolation-outside-holding-first15/validate.py", "role": "validator", "historical_register_ref": HISTORICAL_REGISTER_PATH},
    {"path": "scaffold/phcap02-03-registration-classification-audit/generate.py", "role": "generator", "historical_register_ref": HISTORICAL_REGISTER_PATH},
    {"path": "scaffold/phcap02-03-registration-classification-audit/validate.py", "role": "validator", "historical_register_ref": HISTORICAL_REGISTER_PATH},
    {"path": "scaffold/rdp001-delegated-doc003-unprocessed8/validate.py", "role": "validator", "historical_register_ref": HISTORICAL_REGISTER_PATH},
    {"path": "scaffold/rdp001-unassessed-atom-audit/validate.py", "role": "validator", "historical_register_ref": HISTORICAL_REGISTER_PATH},
    {"path": "scaffold/pre-isolation-outside-l1-semantic/generate.py", "role": "generator", "historical_register_ref": HISTORICAL_REGISTER_PATH},
    {"path": "scaffold/pre-isolation-outside-l1-semantic/validate.py", "role": "validator", "historical_register_ref": HISTORICAL_REGISTER_PATH},
]
EXPECTED_PROHIBITED_INFERENCE = [
    "historical 13-holding captureを14 holdingとして再生成・上書きしない",
    "path_revision_pairをrequirement atom、requirement identity、successorへ変換しない",
    "source_holding登録をsemantic adoption、product owner、phase authority、implementationへ昇格しない",
    "append成功を人間承認、要求採用、実装完了、Issue closeへ解釈しない",
    "旧archive runtime、test、CI、hook、adapterを実行しない",
]


def recursive_keysets(value: object, prefix: str = "") -> dict[str, set[frozenset[str]]]:
    """Collect key sets from every nested object, including every array item."""
    result: dict[str, set[frozenset[str]]] = {}

    def walk(item: object, path: str) -> None:
        if isinstance(item, dict):
            result.setdefault(path, set()).add(frozenset(item))
            for key, child in item.items():
                walk(child, f"{path}.{key}" if path else key)
        elif isinstance(item, list):
            for child in item:
                walk(child, f"{path}[]")

    walk(value, prefix)
    return result


EXPECTED_KEYSETS = {
    "": {"schema", "candidate_id", "status", "authority_effect", "meaning_change_applied", "semantic_disposition", "formal_register_append", "old_runtime_test_ci_execution", "base", "historical_capture", "formal_append", "read_after", "dependencies", "affected_historical_captures", "affected_historical_capture_count", "repointed_sources", "issue_projection", "source_set", "prohibited_inference"},
    "base": {"latest_main_commit", "historical_capture_commit", "historical_capture_is_ancestor_of_latest_main", "rebaseline_required_before_admission"},
    "historical_capture": {"register_path", "register_sha256", "register_record_count", "live_holding_count", "source_revision", "preserved_without_rewrite"},
    "formal_append": {"register_path", "register_sha256", "register_record_count", "live_holding_count", "appended_registration_id", "source_set_path", "source_set_sha256", "source_item_count", "append_only_prefix_preserved"},
    "read_after": {"path", "sha256", "register_sha256", "live_holding_count", "historical_13_preserved", "added_registration_ids"},
    "dependencies[]": {"reference", "local_ref", "head", "merge_commit", "status", "required_migration"},
    "repointed_sources[]": {"path", "role", "historical_register_ref"},
    "issue_projection": {"issue", "status", "reason"},
    "source_set": {"path", "sha256", "count", "unit", "requirement_atoms", "authority_effect", "semantic_disposition"},
}


def sha(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def load(path: Path) -> list[dict]:
    return [json.loads(line) for line in path.read_text(encoding="utf-8").splitlines() if line.strip()]


def live(rows: list[dict]) -> list[dict]:
    superseded = {row.get("supersedes_registration_id") for row in rows if row.get("supersedes_registration_id")}
    return [row for row in rows if row.get("registration_id") not in superseded]


def git_blob(ref: str, path: str) -> bytes:
    return subprocess.run(["git", "show", f"{ref}:{path}"], cwd=ROOT, check=True, stdout=subprocess.PIPE).stdout


def fail(errors: list[str], condition: bool, message: str) -> None:
    if not condition:
        errors.append(message)


def expected_holding_rows(rows: list[dict]) -> list[dict]:
    result = []
    for row in rows:
        source = ROOT / row["source_atom_set_ref"]
        source_rows = load(source)
        result.append({
            "registration_id": row["registration_id"],
            "source_atom_set_ref": row["source_atom_set_ref"],
            "source_atom_set_sha256": sha(source.read_bytes()),
            "source_atom_set_record_count": len(source_rows),
            "registration_kind": row["registration_kind"],
            "product_target": row["product_target"],
            "authority_effect": row["authority_effect"],
            "management_state": row["management_state"],
        })
    return result


def validate(inv: dict, proposal: dict, read_after: dict) -> list[str]:
    errors: list[str] = []
    keysets = recursive_keysets(inv)
    fail(errors, set(keysets) == set(EXPECTED_KEYSETS) and all(
        keysets.get(path) == {frozenset(expected)} for path, expected in EXPECTED_KEYSETS.items()
    ), "E_RECURSIVE_KEYSETS")
    current_bytes = CURRENT.read_bytes()
    historical_bytes = HISTORICAL.read_bytes()
    current_rows = load(CURRENT)
    historical_rows = load(HISTORICAL)
    source_rows = load(SOURCE)
    current_live = live(current_rows)
    historical_live = live(historical_rows)

    fail(errors, inv.get("schema") == "rdp001-preisolation-outside-holding-67-migration/v1", "E_SCHEMA")
    fail(errors, inv.get("candidate_id") == "RDP-001-PREISO-OUTSIDE-HOLDING-67-MIGRATION-0040", "E_CANDIDATE")
    fail(errors, inv.get("status") == "migration_candidate", "E_STATUS")
    fail(errors, inv.get("authority_effect") == "none", "E_AUTHORITY")
    fail(errors, inv.get("meaning_change_applied") is False and inv.get("semantic_disposition") == "not_started", "E_MEANING")
    fail(errors, inv.get("formal_register_append") is True, "E_APPEND_FLAG")
    fail(errors, inv.get("old_runtime_test_ci_execution") is False, "E_OLD_EXECUTION")
    fail(errors, inv.get("prohibited_inference") == EXPECTED_PROHIBITED_INFERENCE, "E_PROHIBITED_LITERAL")

    base = inv.get("base", {})
    fail(errors, base.get("latest_main_commit") == LATEST_MAIN, "E_LATEST_MAIN")
    fail(errors, base.get("historical_capture_commit") == CAPTURE, "E_CAPTURE")
    fail(errors, base.get("historical_capture_is_ancestor_of_latest_main") is True, "E_ANCESTOR_METADATA")
    fail(errors, base.get("rebaseline_required_before_admission") is True, "E_REBASELINE")
    try:
        fail(errors, subprocess.run(["git", "merge-base", "--is-ancestor", CAPTURE, LATEST_MAIN], cwd=ROOT).returncode == 0, "E_CAPTURE_ANCESTOR")
        fail(errors, historical_bytes == git_blob(CAPTURE, "docs/governance/management-provisional-requirement-register.jsonl"), "E_SNAPSHOT_NOT_CAPTURE")
    except (subprocess.CalledProcessError, OSError) as exc:
        errors.append(f"E_GIT:{exc}")

    fail(errors, sha(historical_bytes) == OLD_REGISTER_SHA, "E_HISTORICAL_SHA")
    fail(errors, len(historical_rows) == 32 and len(historical_live) == 13, "E_HISTORICAL_COUNT")
    historical_meta = inv.get("historical_capture", {})
    fail(errors, historical_meta.get("register_path") == str(HISTORICAL.relative_to(ROOT)), "E_HISTORICAL_PATH")
    fail(errors, historical_meta.get("register_sha256") == sha(historical_bytes), "E_HISTORICAL_INV_SHA")
    fail(errors, historical_meta.get("register_record_count") == 32 and historical_meta.get("live_holding_count") == 13, "E_HISTORICAL_INV_COUNT")
    fail(errors, historical_meta.get("source_revision") == CAPTURE and historical_meta.get("preserved_without_rewrite") is True, "E_HISTORICAL_INV_STATE")
    fail(errors, current_bytes.startswith(historical_bytes), "E_APPEND_PREFIX")
    fail(errors, len(current_rows) == 33 and len(current_live) == 14, "E_CURRENT_COUNT")
    formal_meta = inv.get("formal_append", {})
    fail(errors, formal_meta.get("register_path") == str(CURRENT.relative_to(ROOT)), "E_FORMAL_PATH")
    fail(errors, formal_meta.get("register_sha256") == sha(current_bytes), "E_FORMAL_INV_SHA")
    fail(errors, formal_meta.get("register_record_count") == 33 and formal_meta.get("live_holding_count") == 14, "E_FORMAL_INV_COUNT")
    fail(errors, formal_meta.get("appended_registration_id") == "MPR-SH-OUTSIDE67-001" and formal_meta.get("append_only_prefix_preserved") is True, "E_FORMAL_INV_STATE")
    fail(errors, len(source_rows) == 67, "E_SOURCE_COUNT")
    source_sha = sha(SOURCE.read_bytes())
    source_meta = inv.get("source_set", {})
    fail(errors, source_meta.get("path") == str(SOURCE.relative_to(ROOT)) and source_meta.get("sha256") == source_sha, "E_SOURCE_INV_SHA")
    fail(errors, source_meta.get("count") == 67 and source_meta.get("unit") == "path_revision_pair" and source_meta.get("requirement_atoms") is False, "E_SOURCE_INV_SCOPE")
    fail(errors, source_sha == proposal.get("source_atom_set_digest", "").removeprefix("sha256:"), "E_SOURCE_PROPOSAL_SHA")
    fail(errors, proposal.get("source_atom_count") == 67 and proposal.get("source_atom_set_ref") == str(SOURCE.relative_to(ROOT)), "E_SOURCE_PROPOSAL_REF")
    fail(errors, proposal.get("coverage_receipt_ref") == str(COVERAGE.relative_to(ROOT)), "E_COVERAGE_REF")
    if COVERAGE.is_file():
        receipt = COVERAGE.read_text(encoding="utf-8")
        fail(errors, source_sha in receipt and "source_item_count: `67`" in receipt and "same_blob_count: `39`" in receipt and "changed_blob_count: `28`" in receipt and "authority_effect: `none`" in receipt, "E_COVERAGE_CONTENT")
    else:
        errors.append("E_COVERAGE_MISSING")
    fail(errors, proposal.get("registration_id") == "MPR-SH-OUTSIDE67-001", "E_PROPOSAL_ID")
    fail(errors, proposal.get("registration_kind") == "source_holding", "E_PROPOSAL_KIND")
    fail(errors, proposal.get("requirement_identity") is None and proposal.get("requirement_kind") is None, "E_PROPOSAL_REQUIREMENT")
    fail(errors, proposal.get("product_target") == "unassigned_cross_product", "E_PROPOSAL_PRODUCT")
    fail(errors, proposal.get("coverage_result") == "source_preserved_unassigned", "E_PROPOSAL_COVERAGE")
    fail(errors, proposal.get("management_state") == "registered_source_holding" and proposal.get("authority_effect") == "none", "E_PROPOSAL_STATE")
    fail(errors, proposal.get("carried_atom_refs") == [] and proposal.get("preserved_pending_registration_refs") == [] and proposal.get("human_decision_disposition_refs") == [] and proposal.get("unaccounted_atom_refs") == [], "E_PROPOSAL_ATOMS")
    fail(errors, proposal.get("registered_by") == "Codex migration candidate (authority_effect:none)", "E_PROPOSAL_ACTOR")

    appended = current_rows[-1]
    fail(errors, appended == proposal, "E_REGISTER_APPEND_RECORD")
    fail(errors, appended.get("registration_id") not in {row.get("registration_id") for row in historical_rows}, "E_REGISTER_DUPLICATE")
    expected_suffix = (json.dumps(proposal, ensure_ascii=False, separators=(",", ":")) + "\n").encode("utf-8")
    fail(errors, current_bytes[len(historical_bytes):] == expected_suffix, "E_REGISTER_APPEND_BYTES")

    expected_ids = [row["registration_id"] for row in historical_live] + ["MPR-SH-OUTSIDE67-001"]
    fail(errors, [row["registration_id"] for row in current_live] == expected_ids, "E_LIVE_ID_ORDER")
    expected_holdings = expected_holding_rows(current_live)
    fail(errors, read_after.get("schema") == "rdp001-source-holding-register-read-after/v1", "E_READ_AFTER_SCHEMA")
    fail(errors, read_after.get("capture_commit") == LATEST_MAIN, "E_READ_AFTER_CAPTURE")
    fail(errors, read_after.get("register_sha256") == sha(current_bytes), "E_READ_AFTER_REGISTER_SHA")
    fail(errors, read_after.get("register_record_count") == 33 and read_after.get("live_holding_count") == 14, "E_READ_AFTER_COUNTS")
    fail(errors, read_after.get("historical_snapshot_sha256") == OLD_REGISTER_SHA and read_after.get("historical_snapshot_register_record_count") == 32, "E_READ_AFTER_SNAPSHOT")
    fail(errors, read_after.get("historical_13_registration_ids") == [row["registration_id"] for row in historical_live], "E_READ_AFTER_OLD_IDS")
    fail(errors, read_after.get("added_registration_ids") == ["MPR-SH-OUTSIDE67-001"], "E_READ_AFTER_NEW_ID")
    fail(errors, read_after.get("live_holdings") == expected_holdings, "E_READ_AFTER_HOLDINGS")
    fail(errors, read_after.get("historical_capture_preserved") is True, "E_READ_AFTER_PRESERVE")
    read_after_meta = inv.get("read_after", {})
    fail(errors, read_after_meta.get("path") == str(READ_AFTER.relative_to(ROOT)) and read_after_meta.get("sha256") == sha(READ_AFTER.read_bytes()), "E_READ_AFTER_INV_SHA")
    fail(errors, read_after_meta.get("register_sha256") == sha(current_bytes) and read_after_meta.get("live_holding_count") == 14, "E_READ_AFTER_INV_STATE")

    old_ids = {row["registration_id"] for row in historical_live}
    current_by_id = {row["registration_id"]: row for row in current_live}
    for row in historical_live:
        now = current_by_id.get(row["registration_id"])
        fail(errors, now == row, f"E_HISTORICAL_ROW_CHANGED:{row['registration_id']}")
    fail(errors, old_ids == {row["registration_id"] for row in current_live[:-1]}, "E_OLD_HOLDINGS_PRESERVED")

    fail(errors, inv.get("affected_historical_captures") == EXPECTED_AFFECTED_HISTORICAL_CAPTURES, "E_AFFECTED_CAPTURE_ARRAY")
    fail(errors, inv.get("affected_historical_capture_count") == len(EXPECTED_AFFECTED_HISTORICAL_CAPTURES), "E_AFFECTED_CAPTURE_COUNT")
    for relative in EXPECTED_AFFECTED_HISTORICAL_CAPTURES:
        fail(errors, (ROOT / relative).is_file(), f"E_AFFECTED_CAPTURE_MISSING:{relative}")
    fail(errors, inv.get("repointed_sources") == EXPECTED_REPOINTED_SOURCES, "E_REPOINTED_SOURCE_ARRAY")
    for source in EXPECTED_REPOINTED_SOURCES:
        path = ROOT / source["path"]
        fail(errors, path.is_file(), f"E_REPOINTED_SOURCE_MISSING:{source['path']}")
        if path.is_file():
            text = path.read_text(encoding="utf-8")
            fail(errors, source["historical_register_ref"] in text, f"E_REPOINTED_SOURCE_REF:{source['path']}")

    expected_snapshot_path = "management-provisional-requirement-register-pre-append-3df81ad.jsonl"
    affected_sources = [
        "scaffold/pre-isolation-outside-holding-67-proposal/generate.py",
        "scaffold/pre-isolation-outside-holding-67-proposal/validate.py",
        "scaffold/pre-isolation-outside-holding-first15/generate.py",
        "scaffold/phcap02-03-registration-classification-audit/generate.py",
        "scaffold/phcap02-03-registration-classification-audit/validate.py",
        "scaffold/rdp001-delegated-doc003-unprocessed8/validate.py",
        "scaffold/rdp001-unassessed-atom-audit/validate.py",
    ]
    for relative in affected_sources:
        text = (ROOT / relative).read_text(encoding="utf-8")
        fail(errors, expected_snapshot_path in text, f"E_SNAPSHOT_BINDING:{relative}")
    for relative in ("scaffold/bindings/SCF-B-0027.json", "scaffold/bindings/SCF-B-0029.json", "scaffold/bindings/SCF-B-0034.json", "scaffold/bindings/SCF-B-0035.json", "docs/governance/phase-capability-inventory.json"):
        text = (ROOT / relative).read_text(encoding="utf-8")
        if relative == "docs/governance/phase-capability-inventory.json":
            fail(errors, sha(PHASE.read_bytes()) == PHASE_SHA, "E_PHASE_CAPTURE_UNCHANGED")
        else:
            fail(errors, expected_snapshot_path in text, f"E_SNAPSHOT_REFERENCE:{relative}")

    program = (ROOT / "docs/governance/requirement-disposition-review-program.md").read_text(encoding="utf-8")
    contract = (ROOT / "docs/governance/management-provisional-requirement-registration.md").read_text(encoding="utf-8")
    fail(errors, "現在の十四のholding" in program and "MPR-SH-OUTSIDE67-001" in program, "E_PROGRAM_CURRENT_14")
    fail(errors, "33 revision" in contract and "14生存中holding" in contract and "management-provisional-requirement-register-pre-append-3df81ad.jsonl" in contract, "E_CONTRACT_CURRENT_14")
    deps = inv.get("dependencies", [])
    fail(errors, len(deps) == 2, "E_DEPENDENCY_COUNT")
    if len(deps) >= 2:
        fail(errors, deps[0].get("head") == PR1975 and deps[0].get("merge_commit") == PR1975_MERGE and deps[0].get("status") == "merged_on_main" and HISTORICAL_REGISTER_PATH in deps[0].get("required_migration", ""), "E_PR1975_DEPENDENCY")
        fail(errors, deps[1].get("reference") == "PR #1978" and deps[1].get("local_ref") == "remotes/pr/1978" and deps[1].get("head") == PR1978 and deps[1].get("merge_commit") == LATEST_MAIN and deps[1].get("status") == "merged_on_main" and PR1978 in deps[1].get("required_migration", ""), "E_PR1978_DEPENDENCY")
        try:
            fail(errors, subprocess.run(["git", "rev-parse", "remotes/pr/1978"], cwd=ROOT, check=True, stdout=subprocess.PIPE, text=True).stdout.strip() == PR1978, "E_PR1978_HEAD_DRIFT")
            fail(errors, subprocess.run(["git", "rev-parse", "origin/main"], cwd=ROOT, check=True, stdout=subprocess.PIPE, text=True).stdout.strip() == LATEST_MAIN, "E_MAIN_HEAD_DRIFT")
        except (subprocess.CalledProcessError, OSError) as exc:
            errors.append(f"E_DEPENDENCY_REF:{exc}")
    fail(errors, inv.get("issue_projection", {}).get("issue") == 1813 and inv.get("issue_projection", {}).get("status") == "separate_update_required", "E_ISSUE_PROJECTION")
    return errors


if __name__ == "__main__":
    if not all(path.is_file() for path in (INV, PROPOSAL, READ_AFTER)):
        print("FAIL outside-67 migration artifacts missing")
        sys.exit(1)
    errors = validate(json.loads(INV.read_text(encoding="utf-8")), json.loads(PROPOSAL.read_text(encoding="utf-8")), json.loads(READ_AFTER.read_text(encoding="utf-8")))
    if errors:
        print("FAIL outside-67 historical capture migration")
        print("\n".join(errors))
        sys.exit(1)
    print("PASS outside-67 migration: historical 13 snapshot / formal 14 live holdings / 67 path pairs")
