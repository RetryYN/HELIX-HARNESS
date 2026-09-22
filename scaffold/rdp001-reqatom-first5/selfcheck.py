#!/usr/bin/env python3
"""REQATOM A1 first five の意味境界を守る否定例。"""

from __future__ import annotations

import copy
import json
import tempfile
from pathlib import Path

import validate


def run_case(name: str, mutate, expected: str | None = None) -> None:
    with tempfile.TemporaryDirectory(prefix="rdp001-reqatom-first5-selfcheck-") as temp_dir:
        temp = Path(temp_dir)
        original_prop = validate.PROP
        original_inventory = validate.INVENTORY
        proposals = [copy.deepcopy(row) for row in validate.load_jsonl(original_prop)]
        inventory = json.loads(original_inventory.read_text(encoding="utf-8"))
        mutate(proposals, inventory)
        proposal_path = temp / "proposals.jsonl"
        inventory_path = temp / "inventory.json"
        proposal_text = "".join(json.dumps(row, ensure_ascii=False, separators=(",", ":")) + "\n" for row in proposals)
        proposal_path.write_text(proposal_text, encoding="utf-8")
        inventory["proposal_sha256"] = validate.sha256(proposal_text.encode("utf-8"))
        inventory_path.write_text(json.dumps(inventory, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        validate.PROP = proposal_path
        validate.INVENTORY = inventory_path
        try:
            errors = validate.check()
        finally:
            validate.PROP = original_prop
            validate.INVENTORY = original_inventory
        if not errors or (expected is not None and not any(expected in error for error in errors)):
            raise AssertionError(f"{name}: validatorが改変を受理した")
        print(f"PASS {name}: {errors[0]}")


def main() -> int:
    baseline = validate.check()
    if baseline:
        for error in baseline:
            print("FAIL baseline", error)
        return 1
    print("PASS baseline")

    run_case(
        "coverage line loss",
        lambda rows, inventory: rows[0]["line_coverage"]["consumed_once"].pop(),
    )
    run_case(
        "coverage duplicate",
        lambda rows, inventory: rows[0]["line_coverage"]["consumed_once"].append(rows[0]["line_coverage"]["consumed_once"][0]),
    )
    run_case(
        "exact source text drift",
        lambda rows, inventory: rows[0]["candidate_atoms"][0].update(exact_source_text="改変"),
    )
    run_case(
        "normalized statement reversal with refreshed digest",
        lambda rows, inventory: rows[0]["candidate_atoms"][0].update(normalized_statement="旧sourceは独自の用語定義を必須とする。"),
        "normalized_statementが独立canonical意味と不一致",
    )
    run_case(
        "identity relations emptied with refreshed digest",
        lambda rows, inventory: rows[0]["candidate_atoms"][0].update(existing_identity_relations=[]),
        "existing_identity_relationsが独立canonical関係と不一致",
    )
    run_case(
        "atom nested key injection",
        lambda rows, inventory: rows[0]["candidate_atoms"][0].update(ZZZ=True),
        "E_KEYSET:proposal[0].candidate_atoms[0]",
    )
    run_case(
        "unit key injection",
        lambda rows, inventory: rows[0].update(ZZZ=True),
        "E_KEYSET:proposal[0]",
    )
    run_case(
        "source line digest drift",
        lambda rows, inventory: rows[0]["input_content_line_digests"].update({"REQSRC-LINE-00001": "sha256:" + "0" * 64}),
    )
    run_case(
        "authority promotion",
        lambda rows, inventory: rows[0].update(authority_claim="adopted"),
    )
    run_case(
        "successor assignment",
        lambda rows, inventory: rows[0].update(successor_requirement_ids=["HARNESS-L2-001"]),
    )
    run_case(
        "decision record generation",
        lambda rows, inventory: rows[0].update(decision_record={"decision": "approve"}),
    )
    run_case(
        "implementation status promotion",
        lambda rows, inventory: rows[0]["candidate_atoms"][0]["status_preservation"].update(implementation_status="implemented"),
    )
    run_case(
        "four-product denominator mutation",
        lambda rows, inventory: rows[0]["four_product_denominator"].pop("HELIX-Web-OS"),
    )
    run_case(
        "old unattended merge conflict removal",
        lambda rows, inventory: [
            atom.update(possible_conflicts=["current conflict removed"])
            for atom in rows[2]["candidate_atoms"]
        ],
    )
    print("PASS all 14 negative selfchecks")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
