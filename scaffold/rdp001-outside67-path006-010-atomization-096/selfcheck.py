#!/usr/bin/env python3
"""Static validator negative mutations for the PATH-006..010 research bundle."""
from __future__ import annotations

import copy
import importlib.util
import json
import tempfile
from pathlib import Path

HERE = Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location("path_atomization_validator", HERE / "validate.py")
assert spec and spec.loader
v = importlib.util.module_from_spec(spec)
spec.loader.exec_module(v)


def read(path):
    if path.suffix == ".json":
        return json.loads(path.read_text(encoding="utf-8"))
    return [json.loads(line) for line in path.read_text(encoding="utf-8").splitlines() if line.strip()]


def write(path: Path, data):
    if path.suffix == ".json":
        path.write_text(json.dumps(data, ensure_ascii=False, sort_keys=True, indent=2) + "\n", encoding="utf-8")
    else:
        path.write_text("".join(json.dumps(row, ensure_ascii=False, sort_keys=True) + "\n" for row in data), encoding="utf-8")


def rejected(label, mutate):
    originals = {name: getattr(v, name) for name in ("INV", "SELECTED", "ATOMS", "REUSED", "COVERAGE", "DIFFS", "LEGACY")}
    with tempfile.TemporaryDirectory(prefix="outside67-path-atomization-096-") as tmp:
        root = Path(tmp)
        data = {name: read(path) for name, path in (("inv", v.INV), ("selected", v.SELECTED), ("atoms", v.ATOMS), ("reused", v.REUSED), ("coverage", v.COVERAGE), ("diffs", v.DIFFS), ("legacy", v.LEGACY))}
        mutate(data)
        paths = {"inv": root / "inventory.json", "selected": root / "selected-source-items.jsonl", "atoms": root / "semantic-atoms.jsonl", "reused": root / "reused-atom-references.jsonl", "coverage": root / "line-coverage.jsonl", "diffs": root / "source-diffs.json", "legacy": root / "legacy-evidence.jsonl"}
        for name, path in paths.items():
            write(path, data[name])
        v.INV, v.SELECTED, v.ATOMS, v.REUSED, v.COVERAGE, v.DIFFS, v.LEGACY = (paths["inv"], paths["selected"], paths["atoms"], paths["reused"], paths["coverage"], paths["diffs"], paths["legacy"])
        try:
            v.validate()
        except AssertionError:
            print(f"PASS negative: {label}")
        else:
            raise AssertionError(f"negative accepted: {label}")
        finally:
            for name, path in originals.items():
                setattr(v, name, path)


v.validate()

rejected("partial research promoted to path atomization complete", lambda d: d["inv"]["research_completion"].__setitem__("path_atomization_complete", True))
rejected("base revision drift", lambda d: d["inv"]["scope"].__setitem__("base_origin_main", "0" * 40))
rejected("67-pair denominator drift", lambda d: d["inv"]["scope"].__setitem__("holding_path_revision_pair_denominator", 68))
rejected("selected path identity drift", lambda d: d["selected"][0].__setitem__("source_item_id", "OUTSIDE67-PATH-010"))
rejected("snapshot metadata tamper", lambda d: d["selected"][0]["pre_isolation"].__setitem__("sha256", "0" * 64))
rejected("current counterpart digest tamper", lambda d: d["selected"][0]["current_counterpart"].__setitem__("sha256", "0" * 64))
rejected("source diff promotion", lambda d: d["diffs"]["OUTSIDE67-PATH-006"].__setitem__("meaning_equivalence", "equivalent"))
rejected("new atom duplicate identity", lambda d: d["atoms"][1].__setitem__("atom_id", d["atoms"][0]["atom_id"]))
rejected("new atom product promotion", lambda d: d["atoms"][0].__setitem__("candidate_product", "HELIX-OS"))
rejected("new atom source text tamper", lambda d: d["atoms"][0]["source_fragment"].__setitem__("text", "tampered"))
rejected("new atom revision text tamper", lambda d: d["atoms"][0]["revision_pair"]["pre_isolation"].__setitem__("exact_source_text", "tampered\n"))
rejected("new atom unknown field", lambda d: d["atoms"][0].__setitem__("invented", True))
rejected("reused atom duplicate identity", lambda d: d["reused"][1].__setitem__("atom_id", d["reused"][0]["atom_id"]))
rejected("reused atom digest tamper", lambda d: d["reused"][0].__setitem__("source_atom_sha256", "0" * 64))
rejected("line coverage duplicate or omission", lambda d: d["coverage"][1].__setitem__("source_line", d["coverage"][0]["source_line"]))
rejected("line coverage text tamper", lambda d: d["coverage"][0].__setitem__("pre_text", "tampered"))
rejected("line category overlap mutation", lambda d: d["coverage"][0].__setitem__("category", "atomized_candidate"))
rejected("PATH-008 unreferenced line cannot become metadata", lambda d: next(row for row in d["coverage"] if row["source_item_id"] == "OUTSIDE67-PATH-008" and row["source_line"] == 15).__setitem__("category", "metadata_only"))
rejected("legacy implementation promotion", lambda d: d["legacy"][0].__setitem__("implementation_status", "implemented"))
rejected("legacy ledger digest pin tamper", lambda d: d["inv"]["scope"]["legacy_ledger_sha256"].__setitem__(next(iter(d["inv"]["scope"]["legacy_ledger_sha256"])), "0" * 64))
rejected("legacy ledger digest tamper", lambda d: d["legacy"][0].__setitem__("ledger_sha256", "0" * 64))
rejected("legacy hit or no-hit tamper", lambda d: d["legacy"][0].__setitem__("lookup", "no_exact_text_hit" if d["legacy"][0]["lookup"] == "exact_text_hit" else "exact_text_hit"))
rejected("legacy anchor tamper", lambda d: d["legacy"][0]["anchors"].append({"line": 999, "text_sha256": "0" * 64, "matched_terms": []}))
rejected("line accounting count drift", lambda d: d["inv"]["line_accounting"].__setitem__("selected_line_residual_count", 1))
rejected("formal product boundary promotion", lambda d: d["inv"]["four_products"][0].__setitem__("status", "formal"))
rejected("root authority promotion", lambda d: d["inv"].__setitem__("authority_effect", "adopted"))

print("outside67 PATH-006..010 atomization selfcheck: PASS (baseline + 26 negative cases)")
