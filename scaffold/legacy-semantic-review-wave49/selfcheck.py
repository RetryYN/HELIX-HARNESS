#!/usr/bin/env python3
"""Run Wave49 validation and explicit fail-closed mutations."""
from __future__ import annotations

import copy
import importlib.util
import json
import tempfile
from pathlib import Path

HERE = Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location("wave49_validator", HERE / "validate.py")
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
        with tempfile.TemporaryDirectory(prefix="wave49-selfcheck-") as tmp:
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
        with tempfile.TemporaryDirectory(prefix="wave49-meta-selfcheck-") as tmp:
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


def rejected_document(label: str, module_attr: str, mutate) -> None:
    original_path = getattr(module, module_attr)
    document = json.loads(original_path.read_text())
    try:
        with tempfile.TemporaryDirectory(prefix="wave49-document-selfcheck-") as tmp:
            path = Path(tmp) / original_path.name
            mutate(document)
            path.write_text(json.dumps(document, ensure_ascii=False, sort_keys=True, indent=2) + "\n")
            setattr(module, module_attr, path)
            module.verify()
    except AssertionError:
        print(f"PASS negative: {label}")
    else:
        raise AssertionError(f"negative accepted: {label}")
    finally:
        setattr(module, module_attr, original_path)


def mutate_ancestor_gate(meta) -> None:
    meta["ancestor_base_gate"]["required_base_revision"] = "0" * 40


def mutate_source_span(mutated_rows) -> None:
    row = next(row for row in mutated_rows if row["role_kind"] == "requirement")
    row["source_text_spans"][0] = "invented source obligation"


def mutate_source_overlap(mutated_rows) -> None:
    requirement_rows = [row for row in mutated_rows if row["role_kind"] == "requirement"]
    requirement_rows[2]["source_requirement_id"] = requirement_rows[0]["source_requirement_id"]
    requirement_rows[2]["source_text_spans"] = copy.deepcopy(requirement_rows[0]["source_text_spans"])


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
    row = next(row for row in mutated_rows if row["role_kind"] == "design")
    row["connection_records"] = [{
        "relation": "shared_source_span",
        "shared_with_units": ["IRUNIT-HIL-NFR-30-HELIX-OS"],
        "source_fragments": ["invented shared source"],
    }]


def mutate_role_inversion(mutated_rows) -> None:
    design = next(row for row in mutated_rows if row["role_kind"] == "design")
    design["semantic_relation"] = "same_requirement_id_exact_source_contract_not_implementation"


def mutate_inferred_meaning(mutated_rows) -> None:
    design = next(row for row in mutated_rows if row["role_kind"] == "design")
    design["covered_requirement_atoms"][0]["text"] = "inferred implementation is complete"


def mutate_direct_semantic_link(mutated_rows) -> None:
    design = next(row for row in mutated_rows if row["role_kind"] == "design")
    design["candidate_membership_semantics"] = "direct_semantic_link"


def mutate_legacy_evidence_promotion(mutated_rows) -> None:
    design = next(row for row in mutated_rows if row["role_kind"] == "design")
    design["legacy_asset_evidence_state"] = "current_design_authority"


def mutate_nonrequirement_source_spans(mutated_rows) -> None:
    design = next(row for row in mutated_rows if row["role_kind"] == "design")
    design["source_text_spans"] = list(design["source_text_spans"]) + ["invented nonrequirement span"]


def mutate_coverage_contract(mutated_rows) -> None:
    design = next(row for row in mutated_rows if row["role_kind"] == "design")
    design["coverage"] = dict(design["coverage"])
    design["coverage"]["normal"] = "direct semantic evidence"


def mutate_atomization_hold(mutated_rows) -> None:
    design = next(row for row in mutated_rows if row["role_kind"] == "design")
    design["atomization_hold"] = "atomization_admitted"


def mutate_routing_candidate(mutated_rows) -> None:
    design = next(row for row in mutated_rows if row["role_kind"] == "design")
    design["routing_candidate"] = "HELIX-Web"


def mutate_selection_route(mutated_rows) -> None:
    design = next(row for row in mutated_rows if row["role_kind"] == "design")
    design["selection_route"] = "direct_semantic_match"


def mutate_bounded_search_query(mutated_rows) -> None:
    design = next(row for row in mutated_rows if row["role_kind"] == "design")
    design["bounded_search_query"] = {"anchors": ["invented"], "match_mode": "archive_file_contains_any_utf8_anchor"}


def mutate_prior_asset_reuse(mutated_rows) -> None:
    prior_assets = module.prior_edges_and_assets()[1]
    mutated_rows[0]["asset_id"] = next(iter(prior_assets))


def mutate_same_batch_asset_reuse(mutated_rows) -> None:
    design_rows = [row for row in mutated_rows if row["role_kind"] == "design"]
    assert len(design_rows) >= 2
    design_rows[0]["asset_id"] = design_rows[1]["asset_id"]


def mutate_independent_pool_membership(mutated_rows) -> None:
    # Replace a selected design with a catalog design that the bounded query can
    # see but the unit's independent phase/product pool does not contain.
    catalog = {row["asset_id"]: row for row in module.read_jsonl(module.CATALOG_PATH)}
    crosswalk = {row["unit_candidate_id"]: row for row in module.read_jsonl(module.CROSSWALK_PATH)}
    row = next(row for row in mutated_rows if row["role_kind"] == "design")
    pool = set(crosswalk[row["unit_candidate_id"]]["candidate_asset_pool"]["phase_and_product_candidate_asset_ids"])
    ids = module.candidate_ids_for_query(catalog, row["bounded_search_query"])
    replacement = next(
        asset_id for asset_id in ids
        if asset_id not in pool and asset_id not in module.SELECTED[row["unit_candidate_id"]]
        and catalog[asset_id]["artifact_evidence_kind"] == "design"
    )
    row["asset_id"] = replacement


def mutate_authority_promotion(mutated_rows) -> None:
    mutated_rows[0]["authority_effect"] = "current_authority"


def mutate_phase_promotion(mutated_rows) -> None:
    mutated_rows[0]["phase_authority_status"] = "admitted"


def mutate_implementation_promotion(mutated_rows) -> None:
    requirement = next(row for row in mutated_rows if row["role_kind"] == "requirement")
    requirement["current_requirement_implementation_status"] = "current_implementation_complete"


def mutate_unresolved_binding_promotion(mutated_rows) -> None:
    design = next(row for row in mutated_rows if row["role_kind"] == "design" and not row["evidence_atom_bindings"])
    design["evidence_binding_status"] = "literal_anchor_checked"


def mutate_missing_receipt(meta) -> None:
    meta["missing_evidence_receipts"] = meta["missing_evidence_receipts"][:-1]


def mutate_missing_reason(meta) -> None:
    meta["missing_evidence_receipts"][0]["reason"] = "ZZZ"


def mutate_selected_role_asset_count(meta) -> None:
    meta["selected_role_asset_count"] = 8


def mutate_plan_count(plan) -> None:
    plan["counts"]["selected_role_assets"] = 8


def mutate_inventory_count(inventory) -> None:
    inventory["counts"]["inspected_legacy_assets"] = 12


def mutate_pool_consumed_overclaim(meta) -> None:
    reconciliation = next(
        item for item in meta["candidate_pool_reconciliations"]
        if item["unit_candidate_id"] == "IRUNIT-HIL-TR-04-HELIX-HARNESS" and item["role_kind"] == "implementation_source"
    )
    reconciliation["consumed_asset_ids"] = list(reconciliation["consumed_asset_ids"]) + ["LEGACY-ASSET-INJECTED"]
    reconciliation["consumed_asset_count"] = len(reconciliation["consumed_asset_ids"])


def mutate_pool_unexamined_omission(meta) -> None:
    reconciliation = next(
        item for item in meta["candidate_pool_reconciliations"]
        if item["unit_candidate_id"] == "IRUNIT-HIL-TR-04-HELIX-HARNESS" and item["role_kind"] == "implementation_source"
    )
    reconciliation["unexamined_asset_ids"] = ["LEGACY-ASSET-INJECTED"]
    reconciliation["unexamined_asset_count"] = 1


def mutate_design_reconciliation_omission(meta) -> None:
    receipt = next(
        item for item in meta["missing_evidence_receipts"]
        if item["unit_candidate_id"] == "IRUNIT-HIL-TR-04-HELIX-HARNESS" and item["role_kind"] == "design"
    )
    del receipt["candidate_pool_reconciliation"]


def mutate_design_unexamined_hiding(meta) -> None:
    reconciliation = next(
        item for item in meta["candidate_pool_reconciliations"]
        if item["unit_candidate_id"] == "IRUNIT-HIL-TR-04-HELIX-HARNESS" and item["role_kind"] == "design"
    )
    reconciliation["unexamined_asset_ids"] = ["LEGACY-ASSET-INJECTED"]
    reconciliation["unexamined_asset_count"] = 1


def mutate_degradation_promotion(meta) -> None:
    meta["missing_evidence_receipts"][0]["degradation"] = "current_degradation_admitted"


def mutate_meta_status(meta) -> None:
    meta["status"] = "reviewed"


def mutate_meta_consumer_closure(meta) -> None:
    meta["consumer_closure_status"] = "closed"


def mutate_meta_source_revision(meta) -> None:
    meta["source_revision"] = "current-generation"


def mutate_meta_requirement_digest(meta) -> None:
    meta["source_requirement_ir_sha256"] = "0" * 64


def mutate_prior_cumulative_counts(meta) -> None:
    meta["cumulative_reviewed_unit_count"] = 210
    meta["cumulative_reviewed_edge_count"] = 585


def reject_wave48_copy_residue() -> None:
    """Reject stale Wave48 template text in human-facing Wave49 artifacts."""
    forbidden = (
        "Wave48 legacy semantic review Scaffold",
        "SCF-B-0093",
        "36accee66242338ded01dcc24d44148faadd3045",
        "IRUNIT-HIL-NFR-29-HELIX-HARNESS",
        "IRUNIT-HIL-NFR-32-HELIX-HARNESS",
        "IRUNIT-HIL-NFR-33-HELIX-HARNESS",
        "199 reviewed",
    )
    for path in (HERE / "README.md", HERE / "plan.json", HERE / "inventory.json"):
        text = path.read_text()
        assert not any(marker in text for marker in forbidden), f"stale Wave48 copy residue: {path}"


reject_wave48_copy_residue()


rejected_meta("ancestor base gate tamper", mutate_ancestor_gate)
rejected("source span injection", mutate_source_span)
rejected("cross-unit source span reuse", mutate_source_overlap)
rejected("atom identity injection", mutate_atom_identity)
rejected("unsupported product routing", mutate_product_scope)
rejected("stale source anchor", mutate_stale_anchor)
rejected("shared source connection deletion", mutate_shared_connection)
rejected("design/requirement semantic inversion", mutate_role_inversion)
rejected("inferred implementation meaning", mutate_inferred_meaning)
rejected("direct semantic link promotion", mutate_direct_semantic_link)
rejected("legacy asset evidence promotion", mutate_legacy_evidence_promotion)
rejected("non-requirement source span drift", mutate_nonrequirement_source_spans)
rejected("coverage contract tamper", mutate_coverage_contract)
rejected("atomization hold promotion", mutate_atomization_hold)
rejected("routing candidate promotion", mutate_routing_candidate)
rejected("selection route promotion", mutate_selection_route)
rejected("bounded search query tamper", mutate_bounded_search_query)
rejected("same-batch non-requirement asset reuse without explicit shared relation", mutate_same_batch_asset_reuse)
rejected("independent phase/product pool membership", mutate_independent_pool_membership)
rejected("prior implementation asset reuse", mutate_prior_asset_reuse)
rejected("current authority promotion", mutate_authority_promotion)
rejected("phase admission promotion", mutate_phase_promotion)
rejected("current implementation promotion", mutate_implementation_promotion)
rejected("unresolved literal binding promotion", mutate_unresolved_binding_promotion)
rejected_meta("missing evidence receipt deletion", mutate_missing_receipt)
rejected_meta("missing evidence reason tamper", mutate_missing_reason)
rejected_meta("implementation candidate consumed asset ID overclaim", mutate_pool_consumed_overclaim)
rejected_meta("implementation candidate unexamined asset ID omission", mutate_pool_unexamined_omission)
rejected_meta("design missing role reconciliation omission", mutate_design_reconciliation_omission)
rejected_meta("design unexamined asset hiding", mutate_design_unexamined_hiding)
rejected_meta("selected role asset count mismatch", mutate_selected_role_asset_count)
rejected_document("plan count mismatch", "PLAN", mutate_plan_count)
rejected_document("inventory count mismatch", "INVENTORY", mutate_inventory_count)
rejected_meta("degradation promotion", mutate_degradation_promotion)
rejected_meta("meta status promotion", mutate_meta_status)
rejected_meta("meta consumer closure promotion", mutate_meta_consumer_closure)
rejected_meta("meta source revision tamper", mutate_meta_source_revision)
rejected_meta("meta requirement digest tamper", mutate_meta_requirement_digest)
rejected_meta("prior cumulative counts left unchanged", mutate_prior_cumulative_counts)

print("Wave49 selfcheck: PASS (validator plus thirty-nine negative mutations)")
