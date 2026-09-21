#!/usr/bin/env python3
"""Build the outside-67 historical-capture migration evidence."""

from __future__ import annotations

import hashlib
import json
import subprocess
from pathlib import Path


HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
CURRENT_REGISTER = ROOT / "docs/governance/management-provisional-requirement-register.jsonl"
HISTORICAL_REGISTER = ROOT / "docs/governance/management-provisional-requirement-register-pre-append-3df81ad.jsonl"
SOURCE_SET = ROOT / "docs/governance/pre-isolation-outside-holding-67-source-holding.jsonl"
PROPOSAL = HERE / "proposed-register-record.json"
READ_AFTER = HERE / "read-after-14.json"
CAPTURE = "3df81ad27157c471e004083783f37a5860eaa2ee"
LATEST_MAIN = "1c6912ad34b9a7950206188ad364e3a712dc9e6b"
PR1975 = "2c0f287dda2cd9252cd64255cfa4cdf695653754"
PR1978 = "d272a97b3e55401fa75ad41670fbeefd18f8a4cf"


def sha(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def load(path: Path) -> list[dict]:
    return [json.loads(line) for line in path.read_text(encoding="utf-8").splitlines() if line.strip()]


def live(rows: list[dict]) -> list[dict]:
    superseded = {row.get("supersedes_registration_id") for row in rows if row.get("supersedes_registration_id")}
    return [row for row in rows if row.get("registration_id") not in superseded]


def build() -> dict:
    current = load(CURRENT_REGISTER)
    historical = load(HISTORICAL_REGISTER)
    source = load(SOURCE_SET)
    proposal = json.loads(PROPOSAL.read_text(encoding="utf-8"))
    read_after = json.loads(READ_AFTER.read_text(encoding="utf-8"))
    current_live = live(current)
    historical_live = live(historical)
    captured_register = subprocess.run(
        ["git", "show", f"{CAPTURE}:docs/governance/management-provisional-requirement-register.jsonl"],
        cwd=ROOT,
        check=True,
        stdout=subprocess.PIPE,
    ).stdout
    return {
        "schema": "rdp001-preisolation-outside-holding-67-migration/v1",
        "candidate_id": "RDP-001-PREISO-OUTSIDE-HOLDING-67-MIGRATION-0040",
        "status": "migration_candidate",
        "authority_effect": "none",
        "meaning_change_applied": False,
        "semantic_disposition": "not_started",
        "formal_register_append": True,
        "old_runtime_test_ci_execution": False,
        "base": {
            "latest_main_commit": LATEST_MAIN,
            "historical_capture_commit": CAPTURE,
            "historical_capture_is_ancestor_of_latest_main": True,
            "rebaseline_required_before_admission": True,
        },
        "historical_capture": {
            "register_path": str(HISTORICAL_REGISTER.relative_to(ROOT)),
            "register_sha256": sha(HISTORICAL_REGISTER.read_bytes()),
            "register_record_count": len(historical),
            "live_holding_count": len(historical_live),
            "source_revision": CAPTURE,
            "preserved_without_rewrite": HISTORICAL_REGISTER.read_bytes() == captured_register,
        },
        "formal_append": {
            "register_path": str(CURRENT_REGISTER.relative_to(ROOT)),
            "register_sha256": sha(CURRENT_REGISTER.read_bytes()),
            "register_record_count": len(current),
            "live_holding_count": len(current_live),
            "appended_registration_id": proposal["registration_id"],
            "source_set_path": str(SOURCE_SET.relative_to(ROOT)),
            "source_set_sha256": sha(SOURCE_SET.read_bytes()),
            "source_item_count": len(source),
            "append_only_prefix_preserved": CURRENT_REGISTER.read_bytes().startswith(HISTORICAL_REGISTER.read_bytes()),
        },
        "read_after": {
            "path": str(READ_AFTER.relative_to(ROOT)),
            "sha256": sha(READ_AFTER.read_bytes()),
            "register_sha256": read_after["register_sha256"],
            "live_holding_count": read_after["live_holding_count"],
            "historical_13_preserved": read_after["historical_capture_preserved"],
            "added_registration_ids": read_after["added_registration_ids"],
        },
        "unmerged_dependencies": [
            {
                "reference": "PR #1975",
                "local_ref": "remotes/pr/1975",
                "head": PR1975,
                "status": "unmerged",
                "required_migration": "SCF-B-0036 validator/generator/inventoryを3df historical register／disposition snapshotへ束縛し、14-holding current read-afterを別artifactにする。merge後にBinding upstreamをrebaselineする",
            },
            {
                "reference": "PR #1978",
                "local_ref": "remotes/pr/1978",
                "head": PR1978,
                "status": "stacked_on_exact_head_unmerged",
                "required_migration": "exact HEADを確認後、register参照をhistorical snapshotへ切り替え、current 14-holding read-afterとBinding digestを更新する",
            },
        ],
        "affected_historical_captures": [
            "scaffold/pre-isolation-outside-holding-first15/inventory.json",
            "scaffold/phcap02-03-registration-classification-audit/inventory.json",
            "scaffold/rdp001-delegated-doc003-unprocessed8/report.json",
            "scaffold/rdp001-unassessed-atom-audit/report.json",
            "scaffold/pre-isolation-outside-l1-semantic/inventory.json (PR #1975未merge)",
            "docs/governance/phase-capability-inventory.json (kept at main capture digest; separate migration record required)",
            "scaffold/bindings/SCF-B-0027.json",
            "scaffold/bindings/SCF-B-0029.json",
            "scaffold/bindings/SCF-B-0034.json",
            "scaffold/bindings/SCF-B-0035.json",
            "scaffold/bindings/SCF-B-0036.json (PR #1975未merge)",
        ],
        "issue_projection": {
            "issue": 1813,
            "status": "separate_update_required",
            "reason": "RDP-001 projectionは13 holding時点のsource program digestと分母を投影しており、外部Issueはこの候補から変更しない",
        },
        "source_set": {
            "path": str(SOURCE_SET.relative_to(ROOT)),
            "sha256": sha(SOURCE_SET.read_bytes()),
            "count": len(source),
            "unit": "path_revision_pair",
            "requirement_atoms": False,
            "authority_effect": "none",
            "semantic_disposition": "not_started",
        },
        "prohibited_inference": [
            "historical 13-holding captureを14 holdingとして再生成・上書きしない",
            "path_revision_pairをrequirement atom、requirement identity、successorへ変換しない",
            "source_holding登録をsemantic adoption、product owner、phase authority、implementationへ昇格しない",
            "append成功を人間承認、要求採用、実装完了、Issue closeへ解釈しない",
            "旧archive runtime、test、CI、hook、adapterを実行しない",
        ],
    }


if __name__ == "__main__":
    (HERE / "migration.json").write_text(json.dumps(build(), ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
