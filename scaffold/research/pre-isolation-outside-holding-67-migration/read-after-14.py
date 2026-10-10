#!/usr/bin/env python3
"""Capture the post-append 14 live source holdings without rewriting the old 13 capture."""
from __future__ import annotations
import hashlib
import json
from pathlib import Path

RELOCATED_PATHS = {'scaffold/pre-isolation-outside-holding-67': 'scaffold/research/pre-isolation-outside-holding-67', 'docs/governance/management-provisional-requirement-register-pre-append-3df81ad.jsonl': 'docs/governance/audits/requirements-stage/history-snapshots/management-provisional-requirement-register-pre-append-3df81ad.jsonl', 'docs/governance/delegated-requirement-document-reference-holding.jsonl': 'docs/governance/legacy-migration/delegated-document/delegated-requirement-document-reference-holding.jsonl', 'docs/governance/delegated-requirement-document-source-holding.jsonl': 'docs/governance/legacy-migration/delegated-document/delegated-requirement-document-source-holding.jsonl', 'docs/governance/harness-workflow-source-clause-carry-forward.jsonl': 'docs/governance/legacy-migration/harness-workflow/harness-workflow-source-clause-carry-forward.jsonl', 'docs/governance/legacy-candidate-source-line-carry-forward.jsonl': 'docs/governance/legacy-migration/candidate/legacy-candidate-source-line-carry-forward.jsonl', 'docs/governance/legacy-confirmed-requirement-identity-carry-forward.jsonl': 'docs/governance/legacy-migration/identity/legacy-confirmed-requirement-identity-carry-forward.jsonl', 'docs/governance/legacy-requirement-carry-forward.jsonl': 'docs/governance/legacy-migration/requirement/legacy-requirement-carry-forward.jsonl', 'docs/governance/legacy-requirement-semantic-line-carry-forward.jsonl': 'docs/governance/legacy-migration/requirement/legacy-requirement-semantic-line-carry-forward.jsonl', 'docs/governance/legacy-requirement-structural-heading-carry-forward.jsonl': 'docs/governance/legacy-migration/requirement/legacy-requirement-structural-heading-carry-forward.jsonl', 'docs/governance/legacy-requirement-supplementary-source-carry-forward.jsonl': 'docs/governance/legacy-migration/requirement/legacy-requirement-supplementary-source-carry-forward.jsonl', 'docs/governance/legacy-rule-atom-inventory.jsonl': 'docs/governance/audits/requirements-stage/history-snapshots/legacy-rule-atom-inventory-pre-source-correction-8955f45.jsonl', 'docs/governance/pre-isolation-outside-holding-67-source-holding.jsonl': 'docs/governance/legacy-migration/pre-isolation/pre-isolation-outside-holding-67-source-holding.jsonl', 'docs/governance/pre-isolation-revision-delta-source-holding.jsonl': 'docs/governance/legacy-migration/pre-isolation/pre-isolation-revision-delta-source-holding.jsonl', 'docs/governance/scrum-reverse-source-line-carry-forward.jsonl': 'docs/governance/legacy-migration/delegated-document/scrum-reverse-source-line-carry-forward.jsonl', 'docs/governance/management-provisional-requirement-register.jsonl': 'docs/governance/audits/requirements-stage/history-snapshots/management-provisional-requirement-register-capture-72b9f368.jsonl', 'docs/governance/phase-capability-inventory.json': 'docs/governance/audits/requirements-stage/history-snapshots/phase-capability-input0040-capture-72b9f368.json', 'docs/governance/requirement-disposition-review-program.md': 'docs/governance/audits/requirements-stage/history-snapshots/requirement-disposition-program-input0040-capture-72b9f368.md', 'docs/governance/management-provisional-requirement-registration.md': 'docs/governance/audits/requirements-stage/history-snapshots/management-registration-contract-input0040-capture-72b9f368.md', 'scaffold/pre-isolation-outside-holding-first15/': 'scaffold/research/pre-isolation-outside-holding-first15/', 'scaffold/phcap02-03-registration-classification-audit/': 'scaffold/research/phcap02-03-registration-classification-audit/', 'scaffold/rdp001-delegated-doc003-unprocessed8/': 'scaffold/research/rdp001-delegated-doc003-unprocessed8/', 'scaffold/rdp001-unassessed-atom-audit/': 'scaffold/research/rdp001-unassessed-atom-audit/', 'scaffold/pre-isolation-outside-l1-semantic/': 'scaffold/research/pre-isolation-outside-l1-semantic/', 'scaffold/pre-isolation-outside-holding-31-48/': 'scaffold/research/pre-isolation-outside-holding-31-48/', 'scaffold/outside67-global-49-67/': 'scaffold/research/outside67-global-49-67/', 'scaffold/pre-isolation-outside-holding-67-proposal/': 'scaffold/research/pre-isolation-outside-holding-67-proposal/'}


def relocated(path: Path) -> Path:
    text = str(path)
    for old, new in RELOCATED_PATHS.items():
        if old in text:
            return type(path)(text.replace(old, new, 1))
    return path


ROOT = Path(__file__).resolve().parents[3]
REGISTER = ROOT / "docs/governance/management-provisional-requirement-register.jsonl"
SNAPSHOT = ROOT / "docs/governance/management-provisional-requirement-register-pre-append-3df81ad.jsonl"
CAPTURE = "f122d65e1435b4709fbb7b07fbb8e42b70f0b110"


def sha(path: Path) -> str:
    return hashlib.sha256(relocated(path).read_bytes()).hexdigest()


def load(path: Path) -> list[dict]:
    return [json.loads(line) for line in relocated(path).read_text(encoding="utf-8").splitlines() if line.strip()]


def build() -> dict:
    register = load(REGISTER)
    superseded = {row.get("supersedes_registration_id") for row in register if row.get("supersedes_registration_id")}
    live = [row for row in register if row.get("registration_id") not in superseded]
    holdings = []
    for row in live:
        source = ROOT / row["source_atom_set_ref"]
        records = load(source)
        holdings.append({
            "registration_id": row["registration_id"],
            "source_atom_set_ref": row["source_atom_set_ref"],
            "source_atom_set_sha256": sha(source),
            "source_atom_set_record_count": len(records),
            "registration_kind": row["registration_kind"],
            "product_target": row["product_target"],
            "authority_effect": row["authority_effect"],
            "management_state": row["management_state"],
        })
    historical = load(relocated(SNAPSHOT))
    historical_superseded = {row.get("supersedes_registration_id") for row in historical if row.get("supersedes_registration_id")}
    old_ids = [row["registration_id"] for row in historical if row.get("registration_id") not in historical_superseded]
    return {
        "schema": "rdp001-source-holding-register-read-after/v1",
        "read_after_id": "RDP-001-SH-OUTSIDE67-READ-AFTER-14-001",
        "capture_commit": CAPTURE,
        "register_path": str(REGISTER.relative_to(ROOT)),
        "register_sha256": sha(REGISTER),
        "register_record_count": len(register),
        "historical_snapshot_path": str(SNAPSHOT.relative_to(ROOT)),
        "historical_snapshot_sha256": sha(relocated(SNAPSHOT)),
        "historical_snapshot_register_record_count": len(historical),
        "historical_13_registration_ids": old_ids,
        "added_registration_ids": [row["registration_id"] for row in live if row["registration_id"] not in old_ids],
        "live_holding_count": len(live),
        "live_holdings": holdings,
        "new_holding_scope": "67 path_revision_pair source items; requirement_atoms=false; semantic disposition not started",
        "authority_effect": "none",
        "meaning_change_applied": False,
        "old_runtime_test_ci_execution": False,
        "historical_capture_preserved": True,
    }


if __name__ == "__main__":
    out = Path(__file__).with_name("read-after-14.json")
    out.write_text(json.dumps(build(), ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
