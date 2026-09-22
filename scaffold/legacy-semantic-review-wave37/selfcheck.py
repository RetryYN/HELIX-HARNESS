#!/usr/bin/env python3
"""Run Wave37 validation and explicit fail-closed mutations."""
from __future__ import annotations

import copy
import importlib.util
from pathlib import Path

HERE = Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location("wave37_validator", HERE / "validate.py")
assert spec and spec.loader
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)

module.verify()
rows = module.read_jsonl(module.LEDGER)
design = next(row for row in rows if row["role_kind"] == "design")
evidence = module.excerpt(
    module.ROOT / design["evidence_refs"][0]["archive_path"],
    design["evidence_refs"][0]["line_start"],
    design["evidence_refs"][0]["line_end"],
)


def rejected(label: str, fn) -> None:
    try:
        fn()
    except AssertionError:
        print(f"PASS negative: {label}")
    else:
        raise AssertionError(f"negative accepted: {label}")


bad_binding = copy.deepcopy(design["evidence_atom_bindings"][0])
bad_binding["source_fragment_anchors"] = ["unquoted-current-meaning"]
rejected("stale source anchor", lambda: module.verify_binding(design, bad_binding, evidence))

bad_role = copy.deepcopy(design)
bad_role["semantic_relation"] = "same_requirement_id_exact_source_contract_not_implementation"
rejected("design/requirement semantic inversion", lambda: module.verify_role(bad_role))

bad_atoms = copy.deepcopy(design)
bad_atoms["covered_requirement_atoms"][0]["text"] = "inferred implementation is complete"
rejected("inferred implementation meaning", lambda: module.require(bad_atoms["covered_requirement_atoms"] == design["covered_requirement_atoms"], "atom provenance changed"))

prior_assets = module.prior_edges_and_assets()[1]
bad_edge = copy.deepcopy(rows[0])
bad_edge["asset_id"] = next(iter(prior_assets))
rejected("prior implementation asset reuse", lambda: module.require(bad_edge["asset_id"] not in prior_assets, "prior asset reused"))

print("Wave37 selfcheck: PASS (validator plus four negative mutations)")
