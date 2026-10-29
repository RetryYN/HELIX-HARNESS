"""F05 owner relations for already linked record/body occurrences."""

from __future__ import annotations

import copy

from application_input_schema import _json_equal
from application_requirement_gaps_occurrences import (
    _member_read,
    _qualification_check_links_for_source_observation,
)


_INPUT_ROOT = "validation_input"
_OBSERVATION_ROOT = "validation_source_observations"


def _relation_from_reads(left, right):
    if left.get("tag") != "present" or right.get("tag") != "present":
        return "unestablished"
    return (
        "corresponding" if _json_equal(left["value"], right["value"]) else "different"
    )


def _source_wrapper_relation(source_observations, wrapper_owner, source_owner, links):
    """Use the existing owner/root qualification checks for wrapper relation."""
    direct = _relation_from_reads(wrapper_owner, source_owner)
    if direct == "different":
        return direct
    if direct != "corresponding":
        return "unestablished"

    observations = source_observations["source_occurrences"]
    relevant_results = []
    for link in links:
        observation = observations[link["source_observation_index"]]
        qualification_index = link["qualification_occurrence_index"]
        root_index = link["root_occurrence_index"]
        if root_index is None:
            checks = (
                observation["checks"]
                if qualification_index is None
                else observation["qualification_occurrences"][qualification_index]["checks"]
            )
        else:
            checks = observation["qualification_occurrences"][qualification_index][
                "root_occurrences"
            ][root_index]["checks"]
        check = checks[link["check_index"]]
        if check["kind"] in ("qualification_owner", "root_owner"):
            relevant_results.append(check["result"])

    if not relevant_results:
        return "unestablished"
    if "different" in relevant_results:
        return "different"
    if all(result == "corresponding" for result in relevant_results):
        return "corresponding"
    return "unestablished"


def _check_for_link(source_observations, link):
    observation = source_observations["source_occurrences"][
        link["source_observation_index"]
    ]
    qualification_index = link["qualification_occurrence_index"]
    root_index = link["root_occurrence_index"]
    if qualification_index is None:
        checks = observation["checks"]
    elif root_index is None:
        checks = observation["qualification_occurrences"][qualification_index]["checks"]
    else:
        checks = observation["qualification_occurrences"][qualification_index][
            "root_occurrences"
        ][root_index]["checks"]
    return checks[link["check_index"]]


def _source_wrapper_causes(
    source_observations, source_observation_index, wrapper_owner, source_owner, links
):
    causes = []
    missing_reads = [
        read
        for read in (wrapper_owner, source_owner)
        if read.get("tag") in ("absent", "unreached")
    ]
    for missing in missing_reads:
        causes.append(
            _owner_cause(
                "owner_binding_unestablished",
                missing["requested"],
                wrapper_owner,
                source_owner,
                "/f05_detail_contract/owner_binding_contract/source_wrapper",
            )
        )

    direct = _relation_from_reads(wrapper_owner, source_owner)
    if direct == "different":
        causes.append(
            _owner_cause(
                "owner_mismatch",
                wrapper_owner["location"],
                wrapper_owner,
                source_owner,
                "/f05_detail_contract/owner_binding_contract/source_wrapper",
            )
        )

    owner_check_links = []
    for link in links:
        check = _check_for_link(source_observations, link)
        if check["kind"] in ("qualification_owner", "root_owner"):
            owner_check_links.append((link, check))
            if check["result"] not in ("different", "unestablished"):
                continue
            kind = (
                "owner_mismatch"
                if check["result"] == "different"
                else "owner_binding_unestablished"
            )
            left_read = check["left"].get("read")
            right_read = check["right"].get("read")
            if check["result"] == "different":
                target = left_read["location"]
            elif left_read.get("tag") in ("absent", "unreached"):
                target = left_read["requested"]
            elif right_read.get("tag") in ("absent", "unreached"):
                target = right_read["requested"]
            else:
                target = left_read["location"]
            causes.append(
                {
                    "kind": kind,
                    "target": copy.deepcopy(target),
                    "left": copy.deepcopy(check["left"]),
                    "right": copy.deepcopy(check["right"]),
                    "rule_pointer": "/f05_detail_contract/owner_binding_contract/source_wrapper",
                }
            )

    if (
        wrapper_owner.get("tag") == "present"
        and source_owner.get("tag") == "present"
        and not owner_check_links
    ):
        causes.append(
            _owner_cause(
                "owner_binding_unestablished",
                {
                    "root": _OBSERVATION_ROOT,
                    "pointer": (
                        f"/source_occurrences/{source_observation_index}/"
                        "qualification_occurrences"
                    ),
                },
                wrapper_owner,
                source_owner,
                "/f05_detail_contract/owner_binding_contract/source_wrapper",
            )
        )
    return causes


def _owner_cause(kind, target, left, right, rule_pointer):
    return {
        "kind": kind,
        "target": copy.deepcopy(target),
        "left": {"tag": "original", "read": copy.deepcopy(left)},
        "right": {"tag": "original", "read": copy.deepcopy(right)},
        "rule_pointer": rule_pointer,
    }


def _owner_read(input_value, pointer, parent_pointer, parent, member):
    return _member_read(parent, parent_pointer, member)


def _ref_owner_read(input_value, pointer, ref, parent_pointer):
    if not isinstance(ref, dict):
        return {
            "tag": "unreached",
            "requested": {"root": _INPUT_ROOT, "pointer": pointer},
            "reached": {"root": _INPUT_ROOT, "pointer": parent_pointer},
            "reached_value": copy.deepcopy(ref),
        }
    return _owner_read(input_value, pointer, parent_pointer, ref, "owner")


def _role_owner_pairs_for_field(input_value, field, field_index, role):
    """Read the applicable field refs in the fixed L5 role order."""
    candidates = []
    field_pointer = f"/field_inputs/{field_index}"
    if role == "definition":
        candidates.append(
            (
                "field.template_ref",
                f"{field_pointer}/template_ref",
                field.get("template_ref"),
                f"{field_pointer}",
            )
        )
        binding = field.get("binding")
        if isinstance(binding, dict) and binding.get("knowledge_ref") is not None:
            candidates.append(
                (
                    "field.binding.knowledge_ref",
                    f"{field_pointer}/binding/knowledge_ref",
                    binding["knowledge_ref"],
                    f"{field_pointer}/binding",
                )
            )
        refs = field.get("definition_refs")
        if isinstance(refs, list):
            candidates.extend(
                (
                    "field.definition_refs",
                    f"{field_pointer}/definition_refs/{index}",
                    ref,
                    f"{field_pointer}/definition_refs",
                )
                for index, ref in enumerate(refs)
            )
    elif role == "product_value":
        refs = field.get("value_fact_refs")
        if isinstance(refs, list):
            candidates.extend(
                (
                    "field.value_fact_refs",
                    f"{field_pointer}/value_fact_refs/{index}",
                    ref,
                    f"{field_pointer}/value_fact_refs",
                )
                for index, ref in enumerate(refs)
            )
        binding = field.get("binding")
        if isinstance(binding, dict) and binding.get("requirement_ref") is not None:
            candidates.append(
                (
                    "field.binding.requirement_ref",
                    f"{field_pointer}/binding/requirement_ref",
                    binding["requirement_ref"],
                    f"{field_pointer}/binding",
                )
            )
    else:
        return []

    result = []
    for operand_role, pointer, ref, parent_pointer in candidates:
        if ref is None:
            continue
        if isinstance(ref, dict):
            ref_read = {
                "tag": "present",
                "location": {"root": _INPUT_ROOT, "pointer": pointer},
                "value": copy.deepcopy(ref),
            }
        else:
            ref_read = {
                "tag": "unreached",
                "requested": {"root": _INPUT_ROOT, "pointer": pointer},
                "reached": {"root": _INPUT_ROOT, "pointer": parent_pointer},
                "reached_value": copy.deepcopy(ref),
            }
        owner_read = _ref_owner_read(input_value, f"{pointer}/owner", ref, pointer)
        result.append(
            {
                "operand_role": operand_role,
                "operand_ref": ref_read,
                "operand_owner": owner_read,
                "relation": "unestablished",
                "causes": [],
            }
        )
    return result


def _owner_bindings_for_record_occurrence(
    input_value, source_observations, record_occurrence, role, role_pairs
):
    """Build one OwnerBinding for each actual body occurrence."""
    record_origin = record_occurrence["origin"]
    original_record = record_occurrence["original_record"]["value"]
    record_ref = original_record.get("ref")
    record_pointer = record_origin["locator"]["pointer"]
    wrapper_owner = _ref_owner_read(
        input_value,
        f"{record_pointer}/ref/owner",
        record_ref,
        f"{record_pointer}/ref",
    )
    bindings = []
    source_rows = source_observations["source_occurrences"]
    for body_occurrence in record_occurrence["body_occurrences"]:
        source_observation_index = body_occurrence["source_observation_index"]
        source_index = body_occurrence["source_index"]
        source = input_value["sources"][source_index]
        source_owner = _ref_owner_read(
            input_value,
            f"/sources/{source_index}/ref/owner",
            source.get("ref"),
            f"/sources/{source_index}/ref",
        )
        check_links = _qualification_check_links_for_source_observation(
            source_observation_index,
            source_rows[source_observation_index],
        )
        source_wrapper_relation = _source_wrapper_relation(
            source_observations,
            wrapper_owner,
            source_owner,
            check_links,
        )
        causes = _source_wrapper_causes(
            source_observations,
            source_observation_index,
            wrapper_owner,
            source_owner,
            check_links,
        )
        if source_wrapper_relation == "unestablished" and not causes:
            raise NotImplementedError("WR154-R2-STOP-OWNER-CAUSE-WRAPPER-RELATION-01")
        pairs = []
        for role_pair in role_pairs:
            pair = copy.deepcopy(role_pair)
            pair["relation"] = _relation_from_reads(
                pair["operand_owner"], wrapper_owner
            )
            if pair["relation"] == "different":
                pair["causes"] = [
                    _owner_cause(
                        "owner_mismatch",
                        pair["operand_owner"]["location"],
                        pair["operand_owner"],
                        wrapper_owner,
                        "/f05_detail_contract/owner_binding_contract/role_pairs",
                    )
                ]
            elif pair["relation"] == "unestablished":
                if (
                    pair["operand_owner"].get("tag") == "present"
                    and wrapper_owner.get("tag") == "present"
                ):
                    raise NotImplementedError("WR154-R2-STOP-OWNER-CAUSE-QUAL-READ-01")
                target_read = (
                    pair["operand_owner"]
                    if pair["operand_owner"].get("tag") in ("absent", "unreached")
                    else wrapper_owner
                )
                pair["causes"] = [
                    _owner_cause(
                        "owner_binding_unestablished",
                        target_read["requested"],
                        pair["operand_owner"],
                        wrapper_owner,
                        "/f05_detail_contract/owner_binding_contract/role_pairs",
                    )
                ]
            else:
                pair["causes"] = []
            pairs.append(pair)

        causes.extend(cause for pair in pairs for cause in pair["causes"])
        if source_wrapper_relation == "different":
            result = "different"
        elif source_wrapper_relation == "unestablished":
            result = "unestablished"
        elif any(pair["relation"] == "corresponding" for pair in pairs):
            result = "corresponding"
        elif pairs and all(pair["relation"] == "different" for pair in pairs):
            result = "different"
        else:
            result = "unestablished"

        bindings.append(
            {
                "role": role,
                "subject_record": copy.deepcopy(record_origin),
                "source_observation_index": source_observation_index,
                "wrapper_owner": copy.deepcopy(wrapper_owner),
                "source_owner": copy.deepcopy(source_owner),
                "qualification_check_links": check_links,
                "source_wrapper_relation": source_wrapper_relation,
                "role_operand_pairs": pairs,
                "result": result,
                "causes": causes,
            }
        )
    return bindings
