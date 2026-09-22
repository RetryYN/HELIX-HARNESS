#!/usr/bin/env python3
"""Meaningful negative checks for the static PATH-001..005 validator."""
from __future__ import annotations

import copy
import json
import tempfile
from pathlib import Path

import validate as validator

HERE = Path(__file__).resolve().parent
JSON_FILES = ["inventory.json", "plan.json", "source-diffs.json", "evidence-scan.json"]
JSONL_FILES = ["source-pairs.jsonl", "semantic-atoms.jsonl", "line-inventory.jsonl", "legacy-evidence.jsonl"]


def read(name: str):
    path = HERE / name
    if name.endswith(".json"):
        return json.loads(path.read_text(encoding="utf-8"))
    return [json.loads(line) for line in path.read_text(encoding="utf-8").splitlines() if line.strip()]


def write(path: Path, value) -> None:
    if path.suffix == ".json":
        path.write_text(json.dumps(value, ensure_ascii=False, sort_keys=True, indent=2) + "\n", encoding="utf-8")
    else:
        path.write_text("".join(json.dumps(row, ensure_ascii=False, sort_keys=True) + "\n" for row in value), encoding="utf-8")


def rejected(label: str, mutate) -> None:
    with tempfile.TemporaryDirectory(prefix="outside67-path001-005-selfcheck-") as directory:
        out = Path(directory)
        data = {name: read(name) for name in JSON_FILES + JSONL_FILES}
        mutate(data)
        for name, value in data.items():
            write(out / name, value)
        errors = validator.validate(out=out)
        if not errors:
            raise AssertionError(f"negative accepted: {label}")
        print(f"PASS negative: {label}")


if validator.validate():
    raise AssertionError("baseline validator did not pass")
print("PASS baseline: fixed-base static validation")

rejected("archive line omission", lambda d: d["line-inventory.jsonl"].pop())
rejected("archive line duplicate", lambda d: d["line-inventory.jsonl"].__setitem__(1, copy.deepcopy(d["line-inventory.jsonl"][0])))
rejected("normative line hidden as metadata", lambda d: next(r for r in d["line-inventory.jsonl"] if r["archive_line"] == 22 and r["source_item_id"] == "OUTSIDE67-PATH-001").__setitem__("line_status", "metadata_only"))
rejected("archive source text tamper", lambda d: d["semantic-atoms.jsonl"][0].__setitem__("source_fragment", "tampered"))
rejected("candidate product promotion", lambda d: d["semantic-atoms.jsonl"][0].__setitem__("candidate_product", "HELIX-OS"))
rejected("implementation promotion", lambda d: d["semantic-atoms.jsonl"][0].__setitem__("implementation_status", "implemented"))
rejected("ledger digest tamper", lambda d: d["legacy-evidence.jsonl"][0].__setitem__("ledger_sha256", "0" * 64))
rejected("current counterpart digest tamper", lambda d: d["source-pairs.jsonl"][0]["current_counterpart"].__setitem__("sha256", "0" * 64))
rejected("base revision drift", lambda d: d["inventory.json"].__setitem__("base_origin_main", "0" * 40))
rejected("formal requirement promotion", lambda d: d["inventory.json"].__setitem__("formal_requirement_unit_count", 1))

print("outside67 PATH-001..005 atomization selfcheck: PASS (baseline + 10 negative cases)")
