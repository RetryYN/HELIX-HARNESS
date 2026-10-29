#!/usr/bin/env python3
"""Recompute WR181 OS015 composite-class finite upper bounds from L4 source."""

from __future__ import annotations

import json
import math
from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]
L4_PATH = ROOT / "docs/helix-os/L4-basic-design/management-authority-source-record.json"
L5_PATH = ROOT / "docs/helix-os/L5-detail-design/management-authority-source-record.json"


def load(path: Path) -> dict:
    with path.open(encoding="utf-8") as handle:
        return json.load(handle)


def main() -> None:
    l4 = load(L4_PATH)
    l5 = load(L5_PATH)
    contract = l4["diagnostic_contract"]
    constants = contract["algorithm_dependencies"]
    formal = l5["formal_reference"]["constants"]

    assert constants["names"] == ["target_a", "target_b"]
    assert constants["phases"] == ["inspect", "classify", "correct"]
    assert constants["facets"] == contract["facets"]
    assert len(constants["codes"]) == 26
    assert len(contract["source_fields"]) == 20
    assert len(contract["event_fields"]) == 9
    assert len(contract["classification_fields"]) == 14
    assert formal["names"] == constants["names"]
    assert formal["phases"] == constants["phases"]
    assert formal["facets"] == constants["facets"]

    source = len(contract["source_fields"])
    event = len(contract["event_fields"])
    classification = len(contract["classification_fields"])

    # Each cmp can emit two unknown findings (one for each pointer) or one conflict.
    # The new-classification arm is conservatively bounded by summing mutually
    # exclusive classify/correct branches as well as every fixed comparison.
    per_target = {
        "source_cmp": 2 * source,
        "event_cmp": 2 * event,
        "whole_event_mutation": 1,
        "authority_origin": 2 + 1 + 1,
        "authority_state": 2 + 1 + 1,
        "old_classification_mutation": 1,
        "unresolved_history": 2 + 1,
        "classify_prior": 2,
        "new_classification": 2 * classification + 2 + 2 * 2 + 2 * 2 + 1 + 4 + 1,
        "history": 2 + 1,
        "current_claim": 1,
        "generated_claims": 3,
    }
    per_target_total = sum(per_target.values())
    global_findings = 2  # phase_unresolved and whole_registry_claim
    total = len(constants["names"]) * per_target_total + global_findings

    code_count = len(constants["codes"])
    code_multisets = math.comb(code_count + total, code_count) - 1
    owner_ref_count = len(l5["functions"]) + len(l5["contracts"])
    key_upper_bound = (
        3 * (len(contract["facets"]) + 1) * 3 * owner_ref_count * code_multisets
    )
    facet_vectors_per_target = 3 ** len(contract["facets"])

    print(f"targets={len(constants['names'])}")
    print(f"phases={len(constants['phases'])}")
    print(f"source_fields={source}; event_fields={event}; classification_fields={classification}")
    print(f"facets={len(contract['facets'])}; finding_codes={code_count}")
    print("per_target_finding_bound_terms:")
    for label, count in per_target.items():
        print(f"  {label}={count}")
    print(f"per_target_finding_upper_bound={per_target_total}")
    print(f"global_finding_upper_bound={global_findings}")
    print(f"total_finding_upper_bound={total}")
    print(f"facet_vectors_per_target={facet_vectors_per_target}")
    print(f"two_target_facet_vector_pairs={facet_vectors_per_target ** 2}")
    print(f"ordered_finding_code_multiset_upper_bound={code_multisets}")
    print(f"owner_ref_candidate_upper_bound={owner_ref_count}")
    print(f"coarse_class_key_upper_bound={key_upper_bound}")


if __name__ == "__main__":
    main()
