#!/usr/bin/env python3
"""旧Requirement IRの製品unit分解候補を静的検査する。"""

import hashlib
import json
import re
from collections import Counter
from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]
ROUTING = ROOT / "docs/governance/legacy-ir-product-routing-bootstrap.jsonl"
SOURCE = ROOT / "archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json"
OUTPUT = ROOT / "docs/governance/legacy-ir-product-unit-decomposition-bootstrap.jsonl"
META = ROOT / "docs/governance/legacy-ir-product-unit-decomposition-bootstrap.meta.json"
PRODUCTS = {"HELIX-HARNESS", "HELIX-OS", "HELIX-Web", "HELIX-Web-OS"}
PHASES = {f"PHCAP-{number:02d}" for number in range(1, 21)}


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def jsonl(path):
    return [json.loads(line) for line in path.read_text().splitlines()]


def require(condition, message):
    if not condition:
        raise ValueError(message)


def main():
    routing = jsonl(ROUTING)
    source = json.loads(SOURCE.read_text())
    output = jsonl(OUTPUT)
    meta = json.loads(META.read_text())
    require(len(routing) == len(output) == 153, "record count mismatch")
    require([row["source_requirement_id"] for row in output] == [row["source_requirement_id"] for row in routing], "requirement exact set/order mismatch")
    unit_ids = set()

    for index, (route, row) in enumerate(zip(routing, output), 1):
        requirement_id = route["source_requirement_id"]
        original = source[requirement_id]
        require(row["decomposition_id"] == f"IRDECOMP-{index:03d}", "decomposition id sequence mismatch")
        require(row["source_requirement_id"] == requirement_id, "source requirement mismatch")
        require(row["statement_text"] == original["statement"]["text"], "statement text mismatch")
        require(row["source_statement_semantic_digest"] == original["statement"]["semantic_digest"] == route["source_statement_semantic_digest"], "statement digest mismatch")
        require(row["routing_registration_id"] == route["routing_registration_id"], "routing identity mismatch")
        require(row["routing_candidate"] == route["routing_candidate"], "routing candidate mismatch")
        require(row["candidate_product_targets"] == route["candidate_product_targets"], "product target mismatch")
        require(set(row["candidate_product_targets"]) <= PRODUCTS, "unknown product")
        require(row["authority_effect"] == "none" and row["meaning_change_applied"] is False, "authority or meaning change overclaim")
        require(row["successor_assignment_status"] == "unassigned" and not row["successor_requirement_ids"], "successor overclaim")
        require(row["source_pointer"] == f"archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json#/{requirement_id}", "source pointer mismatch")
        require(row["classification_state"] == "candidate_decomposition_pending_exact_head_independent_review", "classification state overclaim")
        require("exact_head_independent_review_pending" in row["unresolved_reasons"], "exact-head review pending flag missing")
        require("human_product_authority_decision_pending" in row["unresolved_reasons"], "human authority pending flag missing")
        require("successor_assignment_unassigned" in row["unresolved_reasons"], "successor pending flag missing")
        require(row["candidate_review_notes"], "candidate review notes missing")
        routing_correction = bool(row["routing_correction_pending_notes"])
        require(routing_correction == ("routing_correction_pending_existing_ledger_unchanged" in row["unresolved_reasons"]), "routing correction boundary mismatch")
        phase_review = bool(row["direct_phase_review_pending_notes"])
        require(phase_review == ("direct_phase_review_pending" in row["unresolved_reasons"]), "direct phase review boundary mismatch")

        units = row["candidate_units"]
        if row["routing_candidate"] == "single_product":
            require(len(units) == 1 and units[0]["unit_kind"] == "product_unit", "single product unit mismatch")
            require(units[0]["product_target"] == row["candidate_product_targets"][0], "single product owner mismatch")
            require(units[0]["source_text_spans"] == [row["statement_text"]], "single product must retain full statement")
        elif row["routing_candidate"] == "split_required":
            require(len(units) == len(row["candidate_product_targets"]) == 2, "split unit count mismatch")
            require(sorted(unit["product_target"] for unit in units) == sorted(row["candidate_product_targets"]), "split product coverage mismatch")
            require("product_unit_boundary_human_decision_pending" in row["unresolved_reasons"], "split decision flag missing")
            spans = [span for unit in units for span in unit["source_text_spans"]]
            clauses = [part.strip(" 、。；;|") for part in re.split(r"[。；;|]", row["statement_text"]) if part.strip(" 、。；;|")]
            require(all(any(clause in span or span in clause for span in spans) for clause in clauses), "split source clause coverage mismatch")
        else:
            require(row["routing_candidate"] == "cross_product_connection", "unknown routing candidate")
            require(len(units) == 1 and units[0]["unit_kind"] == "cross_product_connection", "connection unit mismatch")
            require(units[0]["connected_product_targets"] == row["candidate_product_targets"], "connection endpoint mismatch")
            require("connection_contract_human_decision_pending" in row["unresolved_reasons"], "connection decision flag missing")

        for unit in units:
            require(unit["unit_candidate_id"] not in unit_ids, "duplicate unit id")
            unit_ids.add(unit["unit_candidate_id"])
            require(unit["authority_effect"] == "none", "unit authority overclaim")
            require(unit["semantic_coverage_status"] == "pending_exact_head_independent_review", "semantic coverage overclaim")
            require(unit["responsibility_summary"].strip() and unit["semantic_coverage_note"].strip(), "empty unit meaning")
            require(unit["source_text_spans"] and all(span and span in row["statement_text"] for span in unit["source_text_spans"]), "source span mismatch")
            require(set(unit["direct_phase_candidates"]) <= PHASES, "unknown phase")
            expected_phase_state = "candidate_pending_exact_head_independent_review" if unit["direct_phase_candidates"] else "unresolved"
            require(unit["phase_classification_status"] == expected_phase_state, "phase state mismatch")
            if unit["unit_kind"] == "product_unit":
                require(unit["product_target"] in row["candidate_product_targets"], "unit product mismatch")

    require(len(unit_ids) == 218 == meta["unit_count"], "unit count mismatch")
    require(meta["record_count"] == 153, "meta record count mismatch")
    require(meta["routing_counts"] == dict(sorted(Counter(row["routing_candidate"] for row in output).items())), "routing count mismatch")
    require(meta["unit_kind_counts"] == dict(sorted(Counter(unit["unit_kind"] for row in output for unit in row["candidate_units"]).items())), "unit kind count mismatch")
    require(meta["product_unit_counts"] == dict(sorted(Counter(unit.get("product_target", "cross_product_connection") for row in output for unit in row["candidate_units"]).items())), "product unit count mismatch")
    require(meta["phase_classification_counts"] == dict(sorted(Counter(unit["phase_classification_status"] for row in output for unit in row["candidate_units"]).items())), "phase classification count mismatch")
    require(meta["routing_correction_pending_requirement_ids"] == [row["source_requirement_id"] for row in output if row["routing_correction_pending_notes"]], "routing correction ID mismatch")
    require(meta["output_sha256"] == "sha256:" + sha(OUTPUT), "output digest mismatch")
    for item in meta["source_inputs"]:
        require(item["sha256"] == "sha256:" + sha(ROOT / item["path"]), "source input digest mismatch")
    print("legacy-ir-product-units: ok records=153 units=218")


if __name__ == "__main__":
    main()
