#!/usr/bin/env python3
"""Run Wave41 validation and explicit fail-closed mutations."""
from __future__ import annotations

import copy
import importlib.util
import json
import tempfile
from pathlib import Path

HERE = Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location("wave41_validator", HERE / "validate.py")
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
        with tempfile.TemporaryDirectory(prefix="wave41-selfcheck-") as tmp:
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


def rejected_meta(label: str, mutate) -> None:
    original_meta = module.META
    meta = json.loads(original_meta.read_text())
    try:
        with tempfile.TemporaryDirectory(prefix="wave41-meta-selfcheck-") as tmp:
            meta_path = Path(tmp) / original_meta.name
            mutate(meta)
            meta_path.write_text(json.dumps(meta, ensure_ascii=False, sort_keys=True, indent=2) + "\n")
            module.META = meta_path
            module.verify()
    except AssertionError:
        print(f"PASS negative: {label}")
    else:
        raise AssertionError(f"negative accepted: {label}")
    finally:
        module.META = original_meta


def mutate_ancestor_gate(meta) -> None:
    meta["ancestor_base_gate"]["required_base_revision"] = "0" * 40


def mutate_source_span(mutated_rows) -> None:
    row = next(row for row in mutated_rows if row["role_kind"] == "requirement")
    row["source_text_spans"][0] = "invented source obligation"


def mutate_atom_identity(mutated_rows) -> None:
    row = next(row for row in mutated_rows if row["role_kind"] == "requirement")
    row["covered_requirement_atoms"][0]["atom_id"] = "injected-atom"


def mutate_product_scope(mutated_rows) -> None:
    row = next(row for row in mutated_rows if row["role_kind"] == "requirement")
    row["product_scope"] = ["HELIX-Web"]


def mutate_stale_anchor(mutated_rows) -> None:
    design = next(row for row in mutated_rows if row["role_kind"] == "design")
    design["source_scope_fragments"] = ["invented-current-scope"]


def mutate_shared_connection(mutated_rows) -> None:
    shared = next(row for row in mutated_rows if row["unit_candidate_id"] == "IRUNIT-HIL-NFR-07-HELIX-OS")
    shared["connection_records"] = []


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


def mutate_missing_receipt(meta) -> None:
    meta["missing_evidence_receipts"] = meta["missing_evidence_receipts"][:-1]


def mutate_missing_reason(meta) -> None:
    meta["missing_evidence_receipts"][0]["reason"] = "ZZZ"


rejected_meta("ancestor base gate tamper", mutate_ancestor_gate)
rejected("source span injection", mutate_source_span)
rejected("atom identity injection", mutate_atom_identity)
rejected("unsupported product routing", mutate_product_scope)
rejected("stale source anchor", mutate_stale_anchor)
rejected("shared source connection deletion", mutate_shared_connection)
rejected("design/requirement semantic inversion", mutate_role_inversion)
rejected("inferred implementation meaning", mutate_inferred_meaning)
rejected("prior implementation asset reuse", mutate_prior_asset_reuse)
rejected("current authority promotion", mutate_authority_promotion)
rejected("phase admission promotion", mutate_phase_promotion)
rejected("current implementation promotion", mutate_implementation_promotion)
rejected("unresolved literal binding promotion", mutate_unresolved_binding_promotion)
rejected_meta("missing evidence receipt deletion", mutate_missing_receipt)
rejected_meta("missing evidence reason tamper", mutate_missing_reason)

print("Wave41 selfcheck: PASS (validator plus fourteen negative mutations)")
