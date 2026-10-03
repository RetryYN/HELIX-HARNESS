#!/usr/bin/env python3
"""REQATOM A1 0006--0010 の境界を守る意味のある否定例。"""

from __future__ import annotations

import copy
import json
import tempfile
from pathlib import Path

import validate


def run_case(name: str, mutate, refresh_proposal_digest: bool = False) -> None:
    with tempfile.TemporaryDirectory(prefix="rdp001-reqatom-next5-selfcheck-") as temp_dir:
        temp = Path(temp_dir)
        original_prop = validate.PROP
        original_inventory = validate.INVENTORY
        proposals = [copy.deepcopy(row) for row in validate.load_jsonl(original_prop)]
        inventory = json.loads(original_inventory.read_text(encoding="utf-8"))
        mutate(proposals, inventory)
        proposal_path = temp / "proposals.jsonl"
        inventory_path = temp / "inventory.json"
        proposal_text = "".join(json.dumps(row, ensure_ascii=False, separators=(",", ":")) + "\n" for row in proposals)
        if refresh_proposal_digest:
            inventory["proposal_sha256"] = validate.sha256(proposal_text.encode("utf-8"))
        proposal_path.write_text(proposal_text, encoding="utf-8")
        inventory_path.write_text(json.dumps(inventory, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        validate.PROP = proposal_path
        validate.INVENTORY = inventory_path
        try:
            errors = validate.check()
        finally:
            validate.PROP = original_prop
            validate.INVENTORY = original_inventory
        if not errors:
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
        "normalized meaning reversal with refreshed digest",
        lambda rows, inventory: rows[4]["candidate_atoms"][0].update(
            normalized_statement="旧sourceはPOをscope・受入・最終承認の主体としない。"
        ),
        refresh_proposal_digest=True,
    )
    run_case(
        "source line digest drift",
        lambda rows, inventory: rows[0]["input_content_line_digests"].update({"REQSRC-LINE-00008": "sha256:" + "0" * 64}),
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
        "implementation status promotion",
        lambda rows, inventory: rows[4]["candidate_atoms"][0]["status_preservation"].update(implementation_status="implemented"),
    )
    run_case(
        "degradation status promotion",
        lambda rows, inventory: rows[4]["candidate_atoms"][0]["status_preservation"].update(degradation_status="degraded"),
    )
    run_case(
        "phase placement promotion",
        lambda rows, inventory: rows[4]["candidate_atoms"][0]["status_preservation"].update(phase_status="L3"),
    )
    run_case(
        "four-product denominator mutation",
        lambda rows, inventory: rows[0]["four_product_denominator"].pop("HELIX-Web-OS"),
    )
    run_case(
        "actor conflict removal",
        lambda rows, inventory: [
            atom.update(possible_conflicts=["conflict removed"])
            for atom in rows[4]["candidate_atoms"]
        ],
    )
    run_case(
        "OS current inference merged into retained meaning",
        lambda rows, inventory: rows[4]["candidate_atoms"][1]["retained_meaning"].append("OSのCI／permission運転を追加"),
    )
    run_case(
        "OS current inference separation removed",
        lambda rows, inventory: rows[4]["candidate_atoms"][1].update(candidate_inference=[]),
    )
    run_case(
        "Web direct evidence promotion",
        lambda rows, inventory: rows[2]["candidate_atoms"][0].update(candidate_target="HELIX-Web"),
    )
    run_case(
        "nested unknown key injection",
        lambda rows, inventory: rows[4]["candidate_atoms"][0].update(verified=True),
    )
    run_case(
        "inventory unknown key injection",
        lambda rows, inventory: inventory.update(merge_admission="granted"),
    )
    print("PASS all 17 negative selfchecks")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
