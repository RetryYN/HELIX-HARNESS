"""F05 projection leaves backed by existing semantic record occurrences."""

from __future__ import annotations

import copy

from application_requirement_gaps_occurrences import _location, _member_read, _present


def _source_usability_for_record(record_occurrence, source_observations):
    existing_causes = record_occurrence.get("causes")
    source_unresolved = (
        isinstance(existing_causes, list)
        and any(
            isinstance(cause, dict) and cause.get("kind") == "source_unresolved"
            for cause in existing_causes
        )
    )
    if not isinstance(source_observations, dict):
        if source_unresolved:
            return True, []
        raise NotImplementedError("WR154-P2 F05 source usability observation is pending")
    observations = source_observations.get("source_occurrences")
    indices = record_occurrence.get("source_observation_indices")
    if not isinstance(observations, list) or not isinstance(indices, list) or not indices:
        if source_unresolved:
            return True, []
        raise NotImplementedError("WR154-P2 F05 source usability observation is pending")

    unformed = False
    causes = []
    for observation_index in indices:
        if (
            not isinstance(observation_index, int)
            or isinstance(observation_index, bool)
            or observation_index < 0
            or observation_index >= len(observations)
        ):
            raise NotImplementedError("WR154-P2 F05 source usability observation is pending")
        usability = observations[observation_index].get("usability")
        if (
            not isinstance(usability, dict)
            or usability.get("tag") not in {"usable", "unusable", "unestablished"}
        ):
            raise NotImplementedError("WR154-P2 F05 source usability shape is pending")
        if usability["tag"] != "usable":
            observation_causes = observations[observation_index].get("causes")
            if not isinstance(observation_causes, list) or not observation_causes:
                raise NotImplementedError("WR154-P2 F05 source usability cause is pending")
            unformed = True
            causes.extend(copy.deepcopy(observation_causes))
    return unformed, causes


def _axis_definition_projection_attempt(
    record_occurrence,
    record_link,
    declaration_occurrence,
    declaration_link,
    owner_binding_links,
    source_observations=None,
):
    """Write a pre-matched, formed definition/AxisFact/axis_value attempt.

    The caller must already have established the declaration's field, binding,
    material Ref, role, carrier, form, source/body, and owner correspondence.
    This leaf only copies the declared whole value and its reason Read.
    """
    record_pointer = record_occurrence["origin"]["locator"]["pointer"]
    record = record_occurrence["original_record"]["value"]
    value_read = _member_read(record, record_pointer, "value")
    reason_read = _member_read(record, record_pointer, "reason")
    owner_links = copy.deepcopy(owner_binding_links)
    source_unformed, source_causes = _source_usability_for_record(
        record_occurrence, source_observations
    )
    record_causes = copy.deepcopy(record_occurrence.get("causes", []))
    record_owner_bindings = record_occurrence.get("owner_bindings")
    if not isinstance(record_owner_bindings, list):
        raise NotImplementedError("WR154-R2-STOP-F06-AXIS-OWNER-LINK-01")
    owner_causes = [
        copy.deepcopy(cause)
        for owner_binding in record_owner_bindings
        for cause in owner_binding.get("causes", [])
    ]
    owner_bindings_form = bool(record_owner_bindings) and all(
        owner_binding["result"] == "corresponding"
        for owner_binding in record_owner_bindings
    )
    declaration_owner_bindings = declaration_occurrence.get("owner_bindings")
    if not isinstance(declaration_owner_bindings, list):
        raise NotImplementedError("WR154-R2-STOP-F06-DECLARATION-OWNER-LINK-01")
    declaration_owner_bindings_form = bool(declaration_owner_bindings) and all(
        owner_binding["result"] == "corresponding"
        for owner_binding in declaration_owner_bindings
    )
    declaration_owner_causes = [
        copy.deepcopy(cause)
        for owner_binding in declaration_owner_bindings
        for cause in owner_binding.get("causes", [])
    ]
    declaration_body_unformed = declaration_occurrence["body"]["tag"] != "formed"
    declaration_body_causes = copy.deepcopy(
        declaration_occurrence["body"].get("causes", [])
    )
    if declaration_body_unformed and not declaration_body_causes:
        raise NotImplementedError("WR154-R2-STOP-F06-DECLARATION-BODY-CAUSE-01")
    prerequisite_causes = [
        *copy.deepcopy(source_causes),
        *record_causes,
        *([] if owner_bindings_form else owner_causes),
        *declaration_body_causes,
        *([] if declaration_owner_bindings_form else declaration_owner_causes),
    ]
    if (
        source_unformed
        or record_causes
        or not owner_bindings_form
        or declaration_body_unformed
        or not declaration_owner_bindings_form
    ):
        return {
            "record_link": copy.deepcopy(record_link),
            "basis": {
                "tag": "declaration",
                "declaration_link": copy.deepcopy(declaration_link),
            },
            "owner_binding_links": owner_links,
            "result": {"tag": "unformed", "causes": prerequisite_causes},
            "causes": copy.deepcopy(prerequisite_causes),
        }
    declaration_body = declaration_occurrence["body"]["value"]
    return {
        "record_link": copy.deepcopy(record_link),
        "basis": {
            "tag": "declaration",
            "declaration_link": copy.deepcopy(declaration_link),
        },
        "owner_binding_links": owner_links,
        "result": {
            "tag": "formed",
            "value": {
                "payload": value_read,
                "reason": reason_read,
                "original_whole": copy.deepcopy(value_read),
                "form": "axis_value",
                "value_role": None,
                "reason_role": copy.deepcopy(declaration_body["reason_role"]),
            },
        },
        "causes": [],
    }


def _native_definition_projection_attempt(
    input_value,
    record_occurrence,
    record_link,
    operand_link,
    owner_binding_links,
    source_observations=None,
):
    """Project an existing SemanticRecord meaning as a definition whole."""
    origin = record_occurrence["origin"]
    if origin["collection"] != "semantic_records":
        raise NotImplementedError("WR154-R2-STOP-F07-AXIS-01")
    record = record_occurrence["original_record"]["value"]
    record_owner_bindings = record_occurrence["owner_bindings"]

    owner_causes = [
        copy.deepcopy(cause)
        for binding in record_occurrence["owner_bindings"]
        for cause in binding["causes"]
    ]
    source_unformed, source_causes = _source_usability_for_record(
        record_occurrence, source_observations
    )
    source_body_causes = [
        *source_causes,
        *copy.deepcopy(record_occurrence.get("causes", [])),
    ]
    source_body_unformed = source_unformed or bool(
        record_occurrence.get("causes", [])
    )
    if len(owner_binding_links) != len(record_owner_bindings):
        raise NotImplementedError("WR154-R2-STOP-F07-OWNER-LINK-01")
    owner_bindings_form = bool(record_owner_bindings) and all(
        binding["result"] == "corresponding"
        for binding in record_owner_bindings
    )
    record_pointer = origin["locator"]["pointer"]
    meaning_pointer = f"{record_pointer}/meaning"
    meaning_read = _member_read(record, record_pointer, "meaning")
    if meaning_read["tag"] != "present":
        raise NotImplementedError("WR154-R2-STOP-F07-MEANING-READ-01")
    meaning = meaning_read["value"]
    if isinstance(meaning, dict):
        reason_read = _member_read(meaning, meaning_pointer, "reason")
    else:
        reason_read = {
            "tag": "unreached",
            "requested": _location(f"{meaning_pointer}/reason"),
            "reached": _location(meaning_pointer),
            "reached_value": copy.deepcopy(meaning),
        }
    owner_links = copy.deepcopy(owner_binding_links)
    if owner_bindings_form and not source_body_unformed:
        projection_result = {
            "tag": "formed",
            "value": {
                "payload": copy.deepcopy(meaning_read),
                "reason": reason_read,
                "original_whole": copy.deepcopy(meaning_read),
                "form": "semantic_whole",
                "value_role": None,
                "reason_role": "no_reason",
            },
        }
    else:
        projection_causes = [*source_body_causes, *owner_causes]
        projection_result = {"tag": "unformed", "causes": projection_causes}
    if owner_bindings_form and not source_body_unformed:
        projection_causes = []
    return {
        "record_link": copy.deepcopy(record_link),
        "basis": {
            "tag": "native_definition_whole",
            "operand_link": copy.deepcopy(operand_link),
            "meaning_read": meaning_read,
            "owner_binding_links": owner_links,
        },
        "owner_binding_links": owner_links,
        "result": projection_result,
        "causes": projection_causes,
    }
