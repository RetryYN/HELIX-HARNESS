#!/usr/bin/env python3
"""Negative selfcheck for the static outside67 bundle."""

from __future__ import annotations

import json
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path


HERE = Path(__file__).resolve()
TARGET = HERE.parent
VALIDATOR = TARGET / "validate.py"
REL = "scaffold/rdp001-outside67-concept-freeze-followup-087/"


def run(root: Path):
    return subprocess.run([sys.executable, "-B", str(VALIDATOR), "--root", str(root)], capture_output=True, text=True)


def mutate_json(path: Path, mutate) -> None:
    value = json.loads(path.read_text(encoding="utf-8"))
    mutate(value)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def mutate_lines(path: Path, index: int, mutate) -> None:
    rows = [json.loads(line) for line in path.read_text(encoding="utf-8").splitlines()]
    mutate(rows[index])
    path.write_text("".join(json.dumps(row, ensure_ascii=False, sort_keys=True) + "\n" for row in rows), encoding="utf-8")


def main() -> int:
    cases = []
    with tempfile.TemporaryDirectory(prefix="outside67-concept-freeze-087-selfcheck-") as temp:
        source_root = TARGET.parents[1]
        root = Path(temp) / "repo"
        shutil.copytree(source_root, root)
        mutate_json(root / (REL + "inventory.json"), lambda value: value["scope"].__setitem__("worktree", str(root)))
        baseline = run(root)
        if baseline.returncode:
            print("FAIL baseline\n" + baseline.stdout + baseline.stderr)
            return 1

        def case(name, change, expected):
            candidate = Path(temp) / name
            shutil.copytree(root, candidate)
            mutate_json(candidate / (REL + "inventory.json"), lambda value: value["scope"].__setitem__("worktree", str(candidate)))
            change(candidate)
            result = run(candidate)
            output = result.stdout + result.stderr
            cases.append((name, result.returncode != 0 and expected in output, output))

        case("product", lambda root: mutate_lines(root / (REL + "product-units.jsonl"), 0, lambda row: row.__setitem__("candidate_product", "HELIX-OS")), "E_UNIT_BOUNDARY")
        case("unknown", lambda root: mutate_lines(root / (REL + "product-units.jsonl"), 0, lambda row: row.__setitem__("consumer_status", "closed")), "E_UNIT_UNKNOWN")
        case("duplicate", lambda root: mutate_lines(root / (REL + "product-units.jsonl"), 1, lambda row: row["source_anchor"]["pre_isolation"].__setitem__("line", 3)), "E_DUP_ANCHOR")
        case("fragment", lambda root: mutate_lines(root / (REL + "product-units.jsonl"), 0, lambda row: row.__setitem__("source_fragment", "tampered")), "E_FRAGMENT")
        case("counterpart", lambda root: mutate_lines(root / (REL + "selected-source-items.jsonl"), 0, lambda row: row["archive_counterpart"].__setitem__("sha256", "tampered")), "E_COUNTERPART")
        case("counterpart-relation", lambda root: mutate_json(root / (REL + "evidence-scan.json"), lambda value: value.__setitem__("current_counterpart_hash_equal_archive_ids", [])), "E_SCAN_RELATION")
        case("nonoverlap", lambda root: mutate_json(root / (REL + "inventory.json"), lambda value: value["selection"].__setitem__("candidate_ids", ["OUTSIDE67-PATH-008"])), "E_SELECTION")
        case("scope", lambda root: mutate_json(root / (REL + "inventory.json"), lambda value: value["scope"].__setitem__("remaining_after_candidate_selection", 11)), "E_SCOPE:remaining_after_candidate_selection")
        case("denominator", lambda root: mutate_json(root / (REL + "ledger.json"), lambda value: value.__setitem__("source_anchor_count", 24)), "E_LEDGER")
        case("root-authority", lambda root: mutate_json(root / (REL + "inventory.json"), lambda value: value.__setitem__("old_runtime_test_ci_execution", True)), "E_AUTHORITY")
        case("source-diff", lambda root: mutate_json(root / (REL + "source-diffs.json"), lambda value: value["items"][1].__setitem__("status", "same")), "E_DIFF:OUTSIDE67-PATH-021")
        case("snapshot", lambda root: (root / (REL + "source-snapshots/OUTSIDE67-PATH-017/pre-isolation.md")).write_text("tampered\n", encoding="utf-8"), "E_SNAPSHOT:OUTSIDE67-PATH-017:pre_isolation")
        failed = [item for item in cases if not item[1]]
        if failed:
            print("FAIL negative cases: " + ",".join(item[0] for item in failed))
            print("\n".join(item[2] for item in failed))
            return 1
    print("PASS outside67 concept/freeze follow-up selfcheck: baseline + 12 negative cases")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
