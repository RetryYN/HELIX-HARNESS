#!/usr/bin/env python3
"""Baseline plus negative mutation checks for the bounded research bundle."""
from __future__ import annotations

import copy
import importlib.util
import json
from pathlib import Path

HERE = Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location("path011_015_validator", HERE / "validate.py")
assert spec and spec.loader
v = importlib.util.module_from_spec(spec)
spec.loader.exec_module(v)


def load(name: str):
    path = HERE / name
    if path.suffix == ".json":
        return json.loads(path.read_text(encoding="utf-8"))
    return [json.loads(line) for line in path.read_text(encoding="utf-8").splitlines() if line.strip()]


def rejected(label: str, expected_code: str, mutate) -> None:
    data = {"inv": load("inventory.json"), "selected": load("selected-source-items.jsonl"), "atoms": load("semantic-atoms.jsonl"), "reused": load("reused-atom-references.jsonl"), "coverage": load("line-coverage.jsonl"), "legacy": load("legacy-evidence.jsonl"), "source_diffs": load("source-diffs.json")}
    mutate(data)
    try:
        v.validate(data["inv"], data["selected"], data["atoms"], data["reused"], data["coverage"], data["legacy"], data["source_diffs"])
    except AssertionError as error:
        if expected_code not in str(error):
            raise AssertionError(f"negative hit wrong guard: {label}: expected {expected_code}, got {error}")
        print("PASS negative:", label, expected_code)
    else:
        raise AssertionError("negative accepted: " + label)


v.validate()

table_lines = [
    "| ID | 要求内容 | 状態 |",
    "|:---|:---:|---:|",
    "| REQ-1 | 入力文字列 `---` を保存する | candidate |",
]
assert v.metadata_line_numbers(table_lines) == {2}, "normative table row containing --- became metadata"
assert v.generic_metadata_line("| --- | --- |"), "table separator was not metadata"
print("PASS table separator syntax and literal --- in a normative cell")

rejected("fake ledger hit / anchor", "E_LEGACY_LOOKUP", lambda d: d["legacy"][0].update({"lookup": "exact_text_hit", "anchors": [{"line": 1, "text_sha256": "0" * 64, "matched_terms": ["FAKE"]}]}))
rejected("normative line metadata fallback", "E_NORMATIVE_METADATA_FALLBACK", lambda d: next(row for row in d["coverage"] if row["source_item_id"] == "OUTSIDE67-PATH-012" and row["pre_line"] == 3).__setitem__("category", "metadata_only"))
rejected("other PATH frontmatter category drift", "E_METADATA_CATEGORY", lambda d: next(row for row in d["coverage"] if row["source_item_id"] == "OUTSIDE67-PATH-014" and row["pre_line"] == 2).__setitem__("category", "composite_unresolved"))
rejected("atomized category without atom ids", "E_COVERAGE_ATOMIZED_BIDIRECTIONAL", lambda d: next(row for row in d["coverage"] if row["source_item_id"] == "OUTSIDE67-PATH-012" and row["category"] == "composite_unresolved").__setitem__("category", "atomized_candidate"))
rejected("metadata row has unexpected atom id", "E_COVERAGE_ATOM_IDS", lambda d: next(row for row in d["coverage"] if row["category"] == "metadata_only")["atom_ids"].append("FAKE"))
rejected("reused atom digest tamper", "E_REUSED_ATOM_DIGEST", lambda d: d["reused"][0].__setitem__("source_atom_sha256", "0" * 64))
rejected("new atom source text tamper", "E_ATOM_LINE_BOUNDARY", lambda d: d["atoms"][0]["source_fragment"].__setitem__("text", "tampered"))
rejected("source line duplicate", "E_LINE_COVERAGE_SCOPE", lambda d: d["coverage"][1].__setitem__("pre_line", d["coverage"][0]["pre_line"]))
rejected("67 denominator drift", "E_DENOMINATOR", lambda d: d["inv"]["scope"].__setitem__("holding_path_revision_pair_denominator", 68))
rejected("scaffold binding identity drift", "E_INVENTORY_PROMOTION", lambda d: d["inv"].__setitem__("scaffold_binding_id", "SCF-B-0095"))
rejected("source diff status is not rederived", "E_DIFF_DERIVATION", lambda d: d["source_diffs"]["OUTSIDE67-PATH-011"].__setitem__("status", "same"))
rejected("source diff hunk is not rederived", "E_DIFF_DERIVATION", lambda d: d["source_diffs"]["OUTSIDE67-PATH-012"]["hunks"].append("@@ fake @@"))
rejected("meaning equivalence promotion", "E_MEANING_EQUIVALENCE_PROMOTION", lambda d: d["source_diffs"]["OUTSIDE67-PATH-013"].__setitem__("meaning_equivalence", "equivalent"))
rejected("product promotion", "E_ATOM_PROMOTION", lambda d: d["atoms"][0].__setitem__("candidate_product", "HELIX-OS"))
rejected("implementation promotion", "E_ATOM_PROMOTION", lambda d: d["atoms"][0].__setitem__("implementation_status", "implemented"))
rejected("successor promotion", "E_ATOM_PROMOTION", lambda d: d["atoms"][0].__setitem__("successor_requirement_ids", ["REQ-001"]))

print("outside67 PATH-011..015 atomization selfcheck: PASS (baseline + 16 negative cases)")
