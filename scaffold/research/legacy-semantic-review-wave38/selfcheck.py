#!/usr/bin/env python3
"""Run Wave38 validation and explicit fail-closed mutations."""
from __future__ import annotations

import copy
import importlib.util
import json
import tempfile
from pathlib import Path

HERE = Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location("wave38_validator", HERE / "validate.py")
assert spec and spec.loader
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)

module.verify()
rows = module.read_jsonl(module.LEDGER)


def rejected(label: str, mutate) -> None:
    original_ledger = module.LEDGER
    original_meta = module.META
    meta = json.loads(original_meta.read_text())
    mutated_rows = copy.deepcopy(rows)
    mutate(mutated_rows)
    try:
        with tempfile.TemporaryDirectory(prefix="wave38-selfcheck-") as tmp:
            root = Path(tmp)
            ledger = root / original_ledger.name
            ledger.write_text(
                "".join(
                    json.dumps(row, ensure_ascii=False, sort_keys=True, separators=(",", ":")) + "\n"
                    for row in mutated_rows
                )
            )
            mutated_meta = copy.deepcopy(meta)
            mutated_meta["output_sha256"] = module.file_digest(ledger)
            meta_path = root / original_meta.name
            meta_path.write_text(json.dumps(mutated_meta, ensure_ascii=False, sort_keys=True, indent=2) + "\n")
            module.LEDGER = ledger
            module.META = meta_path
            module.verify()
    except AssertionError:
        print(f"PASS negative: {label}")
    else:
        raise AssertionError(f"negative accepted: {label}")
    finally:
        module.LEDGER = original_ledger
        module.META = original_meta


def mutate_stale_anchor(mutated_rows) -> None:
    design = next(row for row in mutated_rows if row["role_kind"] == "design" and row["evidence_atom_bindings"])
    design["evidence_atom_bindings"][0]["source_fragment_anchors"] = ["unquoted-current-meaning"]


def mutate_role_inversion(mutated_rows) -> None:
    design = next(row for row in mutated_rows if row["role_kind"] == "design")
    design["semantic_relation"] = "same_requirement_id_exact_source_contract_not_implementation"


def mutate_inferred_meaning(mutated_rows) -> None:
    design = next(row for row in mutated_rows if row["role_kind"] == "design")
    design["covered_requirement_atoms"][0]["text"] = "inferred implementation is complete"


def mutate_prior_asset_reuse(mutated_rows) -> None:
    prior_assets = module.prior_edges_and_assets()[1]
    mutated_rows[0]["asset_id"] = next(iter(prior_assets))


def mutate_authority_promotion(mutated_rows) -> None:
    mutated_rows[0]["authority_effect"] = "current_authority"


def mutate_phase_promotion(mutated_rows) -> None:
    mutated_rows[0]["phase_authority_status"] = "admitted"


def mutate_implementation_promotion(mutated_rows) -> None:
    implementation = next(row for row in mutated_rows if row["role_kind"] == "implementation_source")
    implementation["catalog_legacy_implementation_status"] = "current_implementation_complete"


def mutate_unresolved_binding_promotion(mutated_rows) -> None:
    design = next(row for row in mutated_rows if row["role_kind"] == "design" and not row["evidence_atom_bindings"])
    design["evidence_binding_status"] = "literal_anchor_checked"


rejected("stale source anchor", mutate_stale_anchor)
rejected("design/requirement semantic inversion", mutate_role_inversion)
rejected("inferred implementation meaning", mutate_inferred_meaning)
rejected("prior implementation asset reuse", mutate_prior_asset_reuse)
rejected("current authority promotion", mutate_authority_promotion)
rejected("phase admission promotion", mutate_phase_promotion)
rejected("current implementation promotion", mutate_implementation_promotion)
rejected("unresolved literal binding promotion", mutate_unresolved_binding_promotion)

print("Wave38 selfcheck: PASS (validator plus eight negative mutations)")
