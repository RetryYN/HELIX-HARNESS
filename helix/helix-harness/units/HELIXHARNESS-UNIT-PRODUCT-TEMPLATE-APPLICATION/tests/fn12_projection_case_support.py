"""Support helpers for FN12 project_source_result_references unit test cases."""

import copy


def presence_of(container, key):
    """Return Presence<JsonValue> mirror for key in container."""
    if isinstance(container, dict) and key in container:
        return {"presence": "present", "value": copy.deepcopy(container[key])}
    return {"presence": "absent"}


def build_four_dispositions_packet(fixture):
    """Construct the 4-disposition base packet from compact fixture operands."""
    rows = [copy.deepcopy(fixture["row_0_required"])]
    envelopes = [copy.deepcopy(fixture["envelope_0_required"])]
    for variant in fixture["disposition_variants"]:
        row = copy.deepcopy(fixture["row_0_required"])
        row["application_policy_ref"]["identity"] = variant["policy_identity"]
        row["disposition"] = variant["disposition"]
        row["condition_pairs"] = copy.deepcopy(variant["condition_pairs"])
        row["obligation_refs"] = copy.deepcopy(variant["obligation_refs"])
        if "na_attributes" in variant:
            row["na_attributes"] = copy.deepcopy(variant["na_attributes"])
        if "computed_only_semantic_comparison" in variant:
            row["semantic_comparison"] = copy.deepcopy(
                variant["computed_only_semantic_comparison"]
            )
        rows.append(row)

        env = copy.deepcopy(fixture["envelope_0_required"])
        env["source_envelope_ref"]["identity"] = variant["envelope_identity"]
        env["result_ref"]["identity"] = variant["result_identity"]
        env["row_binding"]["application_policy_ref"]["identity"] = variant[
            "policy_identity"
        ]
        env["material"]["disposition"] = variant["disposition"]
        env["material"]["condition_pairs"] = copy.deepcopy(variant["condition_pairs"])
        env["material"]["obligation_refs"] = copy.deepcopy(variant["obligation_refs"])
        if "na_attributes" in variant:
            env["material"]["na_attributes"] = copy.deepcopy(variant["na_attributes"])
        envelopes.append(env)
    return {
        "application_input": copy.deepcopy(fixture["application_input"]),
        "computed_rows": rows,
        "source_envelopes": envelopes,
    }


def build_single_row_packet(fixture, row_index=0):
    """Construct a single-row, single-envelope packet for disposition index 0..3."""
    four = build_four_dispositions_packet(fixture)
    return {
        "application_input": four["application_input"],
        "computed_rows": [four["computed_rows"][row_index]],
        "source_envelopes": [four["source_envelopes"][row_index]],
    }


def make_expected_row(
    packet,
    row_index,
    candidates,
    source_relation,
    source_relation_reason,
    diff_paths=None,
    miss_paths=None,
    owner="not_required",
):
    """Build a complete 21-field ResultRow expectation for packet.computed_rows[row_index]."""
    computed_row = packet["computed_rows"][row_index]
    cand_list = copy.deepcopy(candidates)
    return {
        "application_policy_ref": presence_of(computed_row, "application_policy_ref"),
        "template_ref": presence_of(computed_row, "template_ref"),
        "binding": presence_of(computed_row, "binding"),
        "computed_disposition": presence_of(computed_row, "disposition"),
        "computed_condition_pairs": presence_of(computed_row, "condition_pairs"),
        "computed_obligation_refs": presence_of(computed_row, "obligation_refs"),
        "computed_na_attributes": presence_of(computed_row, "na_attributes"),
        "source_envelopes_input": presence_of(packet, "source_envelopes"),
        "source_candidate_envelopes": cand_list,
        "candidate_count": len(cand_list),
        "source_result_ref_claims": [presence_of(c, "result_ref") for c in cand_list],
        "source_qualification_claims": [
            presence_of(c, "qualification_claim") for c in cand_list
        ],
        "source_relation": source_relation,
        "source_relation_reason": source_relation_reason,
        "source_relation_difference_paths": list(diff_paths or []),
        "source_relation_missing_paths": list(miss_paths or []),
        "actual_source_qualification": "not_established",
        "logical_backflow_owner": owner,
        "actual_recipient_qualification": "not_established",
        "decision_impact": "none",
        "source_role_claims": [presence_of(c, "role") for c in cand_list],
    }


def add_single_row_case(
    cases_out,
    fixture,
    case_id,
    base_row_index,
    mutate_fn,
    candidates_fn,
    source_relation,
    source_relation_reason,
    diff_paths=None,
    miss_paths=None,
    owner="unknown",
):
    """Mutate a single-row base packet and append (case_id, packet, expected_projection)."""
    packet = build_single_row_packet(fixture, base_row_index)
    if mutate_fn is not None:
        mutate_fn(packet)
    candidates = candidates_fn(packet) if callable(candidates_fn) else candidates_fn
    row_exp = make_expected_row(
        packet,
        0,
        candidates,
        source_relation,
        source_relation_reason,
        diff_paths=diff_paths,
        miss_paths=miss_paths,
        owner=owner,
    )
    cases_out.append((case_id, packet, {"rows": [row_exp], "input_findings": []}))
