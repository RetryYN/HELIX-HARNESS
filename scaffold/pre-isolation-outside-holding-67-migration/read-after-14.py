#!/usr/bin/env python3
"""Capture the post-append 14 live source holdings without rewriting the old 13 capture."""
from __future__ import annotations
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
REGISTER = ROOT / "docs/governance/management-provisional-requirement-register.jsonl"
SNAPSHOT = ROOT / "docs/governance/management-provisional-requirement-register-pre-append-3df81ad.jsonl"
CAPTURE = "f122d65e1435b4709fbb7b07fbb8e42b70f0b110"


def sha(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def load(path: Path) -> list[dict]:
    return [json.loads(line) for line in path.read_text(encoding="utf-8").splitlines() if line.strip()]


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
    historical = load(SNAPSHOT)
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
        "historical_snapshot_sha256": sha(SNAPSHOT),
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
