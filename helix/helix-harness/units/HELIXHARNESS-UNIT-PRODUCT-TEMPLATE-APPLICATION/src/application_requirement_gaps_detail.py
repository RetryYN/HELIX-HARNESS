"""Staged native writer for H009 F05 detailed returns.

The implementation includes F01-F04, bounded native field material, and the
global LegacyObligationOrigin branch of F14. Other targeted field/proposal
branches remain guarded until their L5 writers are connected.
"""

from __future__ import annotations

import copy

from application_input_schema import _json_equal
from application_source_checks import _ref_relation
from application_requirement_gaps_occurrences import _record_occurrences_for_operand
from application_requirement_gaps_owner_bindings import (
    _owner_bindings_for_record_occurrence,
    _role_owner_pairs_for_field,
)
from application_requirement_gaps_projection import (
    _axis_definition_projection_attempt,
    _native_definition_projection_attempt,
    _source_usability_for_record,
)
from application_requirement_gaps_selection import _field_selection


_ROOT_REQUEST = "f05_request"
_ROOT_INPUT = "validation_input"
_F05_RULES = "/f05_detail_contract/context_header_cause_contract"


def _loc(root, pointer):
    return {"root": root, "pointer": pointer}


def _present(root, pointer, value):
    return {
        "tag": "present",
        "location": _loc(root, pointer),
        "value": copy.deepcopy(value),
    }


def _named(name, read):
    return {"name": name, "read": read}


def _original(read):
    return {"tag": "original", "read": copy.deepcopy(read)}


def _literal(value, pointer):
    return {"tag": "normative_literal", "value": value, "rule_pointer": pointer}


def _cause(kind, target, left, right, rule_pointer):
    return {
        "kind": kind,
        "target": copy.deepcopy(target),
        "left": copy.deepcopy(left),
        "right": copy.deepcopy(right),
        "rule_pointer": rule_pointer,
    }


def _predecessor_context_causes(request):
    causes = []
    for member, symbol in (
        ("compare_applicability", "compare_applicability"),
        ("compare_kind_obligation_trace", "compare_kind_obligation_trace"),
    ):
        predecessor = request[member]
        base = f"/{member}"
        if predecessor["tag"] == "not_called":
            entry = f"{_F05_RULES}/context_patterns/0"
            target = _loc(_ROOT_REQUEST, base)
            left = _original(_present(_ROOT_REQUEST, base, predecessor))
            right = _literal("returned", f"{entry}/right_literal")
            causes.append(_cause("context_unformed", target, left, right, entry))
            continue

        comparison = predecessor["comparison"]
        actual_symbol = comparison["producer_symbol"]
        if actual_symbol != symbol:
            entry = f"{_F05_RULES}/context_patterns/1"
            target = _loc(_ROOT_REQUEST, f"{base}/comparison/producer_symbol")
            left = _original(
                _present(
                    _ROOT_REQUEST,
                    f"{base}/comparison/producer_symbol",
                    actual_symbol,
                )
            )
            right = _literal(
                symbol,
                f"{_F05_RULES}/context_patterns/1/right_literals/{member}",
            )
            causes.append(_cause("target_mismatch", target, left, right, entry))

        parent = request["validation"]["validated"]["input"]
        parent_binding = parent.get("binding") if isinstance(parent, dict) else None
        compared_binding = comparison.get("input_binding")
        if (
            isinstance(parent_binding, dict)
            and isinstance(compared_binding, dict)
            and not _json_equal(parent_binding, compared_binding)
        ):
            entry = f"{_F05_RULES}/context_patterns/2"
            target = _loc(_ROOT_REQUEST, f"{base}/comparison/input_binding")
            left = _original(
                _present(
                    _ROOT_REQUEST,
                    f"{base}/comparison/input_binding",
                    compared_binding,
                )
            )
            right = _original(_present(_ROOT_INPUT, "/binding", parent_binding))
            causes.append(_cause("target_mismatch", target, left, right, entry))
    return causes


def _original_operands(request):
    return [
        _named(
            "validated",
            _present(
                _ROOT_REQUEST,
                "/validation/validated",
                request["validation"]["validated"],
            ),
        ),
        _named(
            "compare_applicability",
            _present(
                _ROOT_REQUEST,
                "/compare_applicability",
                request["compare_applicability"],
            ),
        ),
        _named(
            "compare_kind_obligation_trace",
            _present(
                _ROOT_REQUEST,
                "/compare_kind_obligation_trace",
                request["compare_kind_obligation_trace"],
            ),
        ),
    ]


def _context_formation(request):
    operands = _original_operands(request)
    causes = _predecessor_context_causes(request)
    if causes:
        result = {"tag": "unformed", "causes": causes}
    else:
        result = {
            "tag": "formed",
            "value": {
                "validated": copy.deepcopy(request["validation"]["validated"]),
                "compare_applicability": copy.deepcopy(
                    request["compare_applicability"]["comparison"]
                ),
                "compare_kind_obligation_trace": copy.deepcopy(
                    request["compare_kind_obligation_trace"]["comparison"]
                ),
            },
        }
    return {"original_operands": operands, "result": result}


def _header_formation(request):
    validated = request["validation"]["validated"]
    input_value = validated["input"]
    if input_value is None:
        requested = _loc(_ROOT_REQUEST, "/validation/validated/input/binding")
        reached = _loc(_ROOT_REQUEST, "/validation/validated/input")
        binding_read = {
            "tag": "unreached",
            "requested": requested,
            "reached": reached,
            "reached_value": None,
        }
        pattern = 0
        target = _loc(_ROOT_REQUEST, "/validation/validated/input")
    elif "binding" not in input_value:
        requested = _loc(_ROOT_INPUT, "/binding")
        parent = _loc(_ROOT_INPUT, "")
        binding_read = {
            "tag": "absent",
            "requested": requested,
            "parent": parent,
            "parent_value": copy.deepcopy(input_value),
        }
        pattern = 1
        target = requested
    else:
        binding = input_value["binding"]
        binding_read = _present(_ROOT_INPUT, "/binding", binding)
        return {
            "binding_read": binding_read,
            "result": {"tag": "formed", "value": copy.deepcopy(binding)},
        }

    entry = f"{_F05_RULES}/header_read_and_patterns/{pattern}"
    left = _original(binding_read)
    right = _literal(
        "CoreApplicationBinding object",
        f"{entry}/right_literal",
    )
    cause = _cause("header_unformed", target, left, right, entry)
    return {
        "binding_read": binding_read,
        "result": {"tag": "unformed", "causes": [cause]},
    }


def _f01_stopped(request, context, header):
    causes = []
    if context["result"]["tag"] == "unformed":
        causes.extend(copy.deepcopy(context["result"]["causes"]))
    if header["result"]["tag"] == "unformed":
        causes.extend(copy.deepcopy(header["result"]["causes"]))
    if not causes:
        return None
    return {
        "original_request": copy.deepcopy(request),
        "context_formation": context,
        "header_formation": header,
        "comparison": {"tag": "unformed", "causes": copy.deepcopy(causes)},
        "owner_material": {
            "tag": "raw_only",
            "original_request": copy.deepcopy(request),
            "causes": copy.deepcopy(causes),
        },
    }


def _selection_scope_outside(input_value, occurrence, index, member):
    parent_binding = input_value["binding"]
    field_binding = occurrence.get("binding")
    if not isinstance(field_binding, dict):
        return None
    parent_scope = parent_binding.get("product_scope")
    local_scope = field_binding.get("product_scope")
    if not isinstance(parent_scope, dict) or not isinstance(local_scope, dict):
        return None
    if _json_equal(parent_scope, local_scope):
        return None

    item_pointer = f"/{member}/{index}"
    scope_pointer = f"{item_pointer}/binding/product_scope"
    parent_read = _present(_ROOT_INPUT, "/binding/product_scope", parent_scope)
    local_read = _present(_ROOT_INPUT, scope_pointer, local_scope)
    rule_pointer = "/f05_detail_contract/selection_contract/branches"
    cause = _cause(
        "target_mismatch",
        _loc(_ROOT_INPUT, scope_pointer),
        _original(local_read),
        _original(parent_read),
        rule_pointer,
    )
    original_operands = [
        _named("parent_binding", _present(_ROOT_INPUT, "/binding", parent_binding)),
        _named(
            "field_binding",
            _present(_ROOT_INPUT, f"{item_pointer}/binding", field_binding),
        ),
    ]
    return {
        "tag": "outside",
        "original_operands": original_operands,
        "causes": [cause],
    }


def _return_link(pointer):
    return {"root": "f05_return", "pointer": pointer}


def _summary_cause(kind, target, left, right, rule_pointer):
    return _cause(kind, target, left, right, rule_pointer)


def _basis_unresolved_causes(field_index, operand_index, records, role):
    if role != "product_value":
        return []
    causes = []
    for record_occurrence in records:
        record_pointer = record_occurrence["origin"]["locator"]["pointer"]
        record = record_occurrence["original_record"]["value"]
        collection = record_occurrence["origin"]["collection"]
        if collection == "semantic_records" and "meaning" not in record:
            meaning_read = {
                "tag": "absent",
                "requested": _loc(_ROOT_INPUT, f"{record_pointer}/meaning"),
                "parent": _loc(_ROOT_INPUT, record_pointer),
                "parent_value": copy.deepcopy(record),
            }
        elif collection == "semantic_records":
            meaning_read = _present(
                _ROOT_INPUT, f"{record_pointer}/meaning", record["meaning"]
            )
        elif collection == "axis_facts":
            if "value" in record:
                meaning_read = _present(
                    _ROOT_INPUT, f"{record_pointer}/value", record["value"]
                )
            else:
                meaning_read = {
                    "tag": "absent",
                    "requested": _loc(_ROOT_INPUT, f"{record_pointer}/value"),
                    "parent": _loc(_ROOT_INPUT, record_pointer),
                    "parent_value": copy.deepcopy(record),
                }
        else:
            continue
        causes.append(
            _summary_cause(
                "declaration_unresolved",
                _loc(
                    _ROOT_INPUT,
                    f"/field_inputs/{field_index}/value_fact_refs/{operand_index}",
                ),
                _original(meaning_read),
                _literal(
                    "original product_value role/form/value_role basis",
                    "/f05_detail_contract/field_summary_and_custody_writer_contract/patterns/1/cause/right/value",
                ),
                "/f05_detail_contract/field_summary_and_custody_writer_contract/patterns/1",
            )
        )
    return causes


def _has_unhandled_field_evidence_or_projection_declaration(input_value, field):
    for record in input_value.get("semantic_records", []):
        if not isinstance(record, dict):
            continue
        if record.get("kind") == "field_definition_evidence":
            return True
        meaning = record.get("meaning")
        is_declaration = record.get("kind") == "field_material_projection_declaration" or (
            isinstance(meaning, dict)
            and meaning.get("kind") == "field_material_projection_declaration"
        )
        if not is_declaration:
            continue
        if (
            not isinstance(meaning, dict)
            or not isinstance(meaning.get("binding"), dict)
            or not isinstance(meaning.get("field_ref"), dict)
            or not isinstance(meaning.get("material_ref"), dict)
        ):
            return True
        if (
            _ref_relation(meaning["field_ref"], field.get("ref"))
            != "corresponding"
            or not _json_equal(meaning["binding"], field.get("binding"))
        ):
            return True
        definition_refs = field.get("definition_refs")
        if not isinstance(definition_refs, list) or not any(
            _ref_relation(meaning["material_ref"], ref) == "corresponding"
            for ref in definition_refs
        ):
            return True
        if not any(
            _ref_relation(axis.get("ref"), meaning["material_ref"])
            == "corresponding"
            and _json_equal(axis.get("binding"), meaning["binding"])
            for axis in input_value.get("axis_facts", [])
            if isinstance(axis, dict)
        ):
            return True
    return False


def _axis_projection_declaration_indices(input_value, field, requested_ref):
    indices = []
    semantic_records = input_value.get("semantic_records", [])
    if not isinstance(semantic_records, list):
        return indices
    for index, record in enumerate(semantic_records):
        if not isinstance(record, dict):
            continue
        meaning = record.get("meaning")
        is_declaration = record.get("kind") == "field_material_projection_declaration" or (
            isinstance(meaning, dict)
            and meaning.get("kind") == "field_material_projection_declaration"
        )
        if not is_declaration:
            continue
        if not isinstance(meaning, dict):
            raise NotImplementedError(
                "WR154-P2 F06 declaration meaning is pending"
            )
        if not isinstance(meaning.get("binding"), dict) or not isinstance(
            meaning.get("field_ref"), dict
        ):
            raise NotImplementedError(
                "WR154-P2 F06 declaration target members are pending"
            )
        field_relation = _ref_relation(meaning.get("field_ref"), field.get("ref"))
        binding_relation = (
            "corresponding"
            if _json_equal(meaning.get("binding"), field.get("binding"))
            else "different"
        )
        if field_relation != "corresponding" or binding_relation != "corresponding":
            continue
        material_ref = meaning.get("material_ref")
        if not isinstance(material_ref, dict):
            raise NotImplementedError(
                "WR154-P2 F06 declaration material Ref is pending"
            )
        if _ref_relation(material_ref, requested_ref) == "corresponding":
            indices.append(index)
    return indices


def _axis_independent_role_source_candidates(
    input_value, field, requested_ref, content_source_ref
):
    """Find explicit same-target semantic source candidates we cannot yet read.

    Matching target refs/binding alone does not form an independent source. It
    does, however, prevent D-Axis-0 from claiming that no such source exists.
    """
    candidates = []
    semantic_records = input_value.get("semantic_records", [])
    if not isinstance(semantic_records, list):
        return candidates
    for index, record in enumerate(semantic_records):
        if not isinstance(record, dict):
            continue
        meaning = record.get("meaning")
        if isinstance(meaning, dict) and (
            record.get("kind") == "field_material_projection_declaration"
            or meaning.get("kind") == "field_material_projection_declaration"
        ):
            continue
        source_relation = _ref_relation(record.get("source_ref"), content_source_ref)
        if source_relation == "different":
            continue
        if not isinstance(meaning, dict):
            continue
        role_members = {
            "material_role",
            "material_carrier",
            "payload_form",
            "value_role",
            "reason_role",
            "basis_refs",
        }
        if not role_members.intersection(meaning):
            continue
        binding = meaning.get("binding")
        field_ref = meaning.get("field_ref")
        material_ref = meaning.get("material_ref")
        if isinstance(binding, dict) and not _json_equal(
            binding, field.get("binding")
        ):
            continue
        if isinstance(field_ref, dict) and _ref_relation(
            field_ref, field.get("ref")
        ) == "different":
            continue
        if isinstance(material_ref, dict) and _ref_relation(
            material_ref, requested_ref
        ) == "different":
            continue
        if (
            not isinstance(binding, dict)
            or not isinstance(field_ref, dict)
            or not isinstance(material_ref, dict)
        ):
            candidates.append(index)
            continue
        if (
            _ref_relation(field_ref, field.get("ref")) != "corresponding"
            or _ref_relation(material_ref, requested_ref) != "corresponding"
        ):
            continue
        candidates.append(index)
    return candidates


def _declaration_occurrence_for_axis(
    input_value,
    source_observations,
    field,
    field_index,
    record_index,
    role_pairs,
):
    declaration = input_value["semantic_records"][record_index]
    meaning = declaration.get("meaning")
    pointer = f"/semantic_records/{record_index}/meaning"
    expected_members = {
        "kind",
        "binding",
        "field_ref",
        "material_ref",
        "material_role",
        "material_carrier",
        "payload_form",
        "value_role",
        "reason_role",
        "basis_refs",
    }
    if not isinstance(meaning, dict) or frozenset(meaning) not in {
        frozenset(expected_members),
        frozenset(expected_members - {"value_role"}),
    }:
        raise NotImplementedError("WR154-P2 F06 declaration body formation is pending")
    if (
        not isinstance(meaning["binding"], dict)
        or not isinstance(meaning["field_ref"], dict)
        or not isinstance(meaning["material_ref"], dict)
        or not isinstance(meaning["basis_refs"], list)
        or meaning["material_role"] not in {"definition", "product_value"}
        or meaning["material_carrier"] not in {"AxisFact", "SemanticRecord"}
        or meaning["payload_form"]
        not in {"axis_value", "semantic_whole", "semantic_value_envelope"}
        or meaning["reason_role"] not in {"axis_reason", "envelope_reason", "no_reason"}
    ):
        raise NotImplementedError("WR154-P2 F06 declaration body formation is pending")
    if meaning["basis_refs"]:
        raise NotImplementedError("WR154-P2 F06 declaration basis operands are pending")

    declaration_ref = declaration.get("ref")
    if not isinstance(declaration_ref, dict):
        raise NotImplementedError("WR154-P2 F06 declaration record Ref is pending")
    declaration_records = _record_occurrences_for_operand(
        input_value,
        source_observations,
        declaration_ref,
        declaration.get("binding"),
        collections=("semantic_records",),
    )
    record_occurrence = next(
        (
            occurrence
            for occurrence in declaration_records
            if occurrence["origin"]["index"] == record_index
        ),
        None,
    )
    if record_occurrence is None or not record_occurrence["body_occurrences"]:
        raise NotImplementedError("WR154-P2 F06 declaration record/body is pending")
    body_payload_unformed = any(
        body["payload_relation"] != "corresponding"
        for body in record_occurrence["body_occurrences"]
    )
    source_unformed, source_causes = _source_usability_for_record(
        record_occurrence, source_observations
    )
    body_unformed = body_payload_unformed or source_unformed
    if body_unformed and not record_occurrence["causes"] and not source_causes:
        raise NotImplementedError(
            "WR154-R2-STOP-F06-DECLARATION-BODY-CAUSE-01"
        )

    declaration_record = copy.deepcopy(record_occurrence)
    declaration_record["owner_bindings"] = _owner_bindings_for_record_occurrence(
        input_value,
        source_observations,
        declaration_record,
        "definition",
        role_pairs,
    )
    declaration_owner_causes = [
        copy.deepcopy(cause)
        for owner_binding in declaration_record["owner_bindings"]
        for cause in owner_binding["causes"]
    ]
    evidence_record = {
        key: copy.deepcopy(value)
        for key, value in declaration_record.items()
        if key != "owner_bindings"
    }
    value_role_read = _member_read(meaning, pointer, "value_role")
    body_value = {
        "binding": copy.deepcopy(meaning["binding"]),
        "field_ref": copy.deepcopy(meaning["field_ref"]),
        "material_ref": copy.deepcopy(meaning["material_ref"]),
        "material_role": meaning["material_role"],
        "material_carrier": meaning["material_carrier"],
        "payload_form": meaning["payload_form"],
        "value_role": value_role_read,
        "reason_role": meaning["reason_role"],
        "basis_refs": copy.deepcopy(meaning["basis_refs"]),
    }
    meaning_read = _present(_ROOT_INPUT, pointer, meaning)
    causes = [
        *copy.deepcopy(source_causes),
        *copy.deepcopy(declaration_record["causes"]),
        *declaration_owner_causes,
    ]
    return {
        "record": evidence_record,
        "meaning_read": meaning_read,
        "body": (
            {
                "tag": "unformed",
                "causes": [
                    *copy.deepcopy(source_causes),
                    *copy.deepcopy(declaration_record["causes"]),
                ],
            }
            if body_unformed
            else {"tag": "formed", "value": body_value}
        ),
        "basis_operands": [],
        "owner_bindings": declaration_record["owner_bindings"],
        "causes": causes,
    }


def _axis_declaration_mismatch_causes(
    input_value, field_index, operand_index, declaration_index, axis_fact_occurrence
):
    meaning = input_value["semantic_records"][declaration_index]["meaning"]
    meaning_pointer = f"/semantic_records/{declaration_index}/meaning"
    actual_carrier = {
        "axis_facts": "AxisFact",
        "semantic_records": "SemanticRecord",
    }[axis_fact_occurrence["origin"]["collection"]]
    expected_members = {
        "material_role": "definition",
        "material_carrier": actual_carrier,
        "payload_form": "axis_value",
    }
    causes = []
    for member in ("material_role", "material_carrier", "payload_form"):
        if meaning[member] == expected_members[member]:
            continue
        declaration_member_read = _present(
            _ROOT_INPUT,
            f"{meaning_pointer}/{member}",
            meaning[member],
        )
        content_pointer = axis_fact_occurrence["origin"]["locator"]["pointer"]
        content_read = _present(
            _ROOT_INPUT,
            content_pointer,
            axis_fact_occurrence["original_record"]["value"],
        )
        causes.append(
            _cause(
                "projection_unformed",
                declaration_member_read["location"],
                _original(declaration_member_read),
                _original(content_read),
                "/f05_detail_contract/projection_contract/failure",
            )
        )
    return causes


def _role_material(input_value, field, field_index, role, source_observations):
    member = "definition_refs" if role == "definition" else "value_fact_refs"
    role_name = "definition" if role == "definition" else "product_value"
    field_pointer = f"/field_inputs/{field_index}"
    if member not in field:
        refs_read = {
            "tag": "absent",
            "requested": _loc(_ROOT_INPUT, f"{field_pointer}/{member}"),
            "parent": _loc(_ROOT_INPUT, field_pointer),
            "parent_value": copy.deepcopy(field),
        }
        refs = []
    else:
        refs = field[member]
        if not isinstance(refs, list):
            raise NotImplementedError("WR154-R2-STOP-F05-REFS-SHAPE-01")
        refs_read = _present(_ROOT_INPUT, f"{field_pointer}/{member}", refs)

    operands = []
    material_causes = []
    axis_declaration_unresolved = False
    for operand_index, ref in enumerate(refs):
        ref_pointer = f"{field_pointer}/{member}/{operand_index}"
        record_occurrences = _record_occurrences_for_operand(
            input_value,
            source_observations,
            ref,
            field.get("binding"),
        )
        role_pairs = _role_owner_pairs_for_field(input_value, field, field_index, role_name)
        for occurrence in record_occurrences:
            occurrence["owner_bindings"] = _owner_bindings_for_record_occurrence(
                input_value,
                source_observations,
                occurrence,
                role_name,
                role_pairs,
            )

        operand = {
            "original_ref": _present(_ROOT_INPUT, ref_pointer, ref),
            "operand_index": operand_index,
            "role": role_name,
            "record_occurrences": record_occurrences,
            "causes": [
                copy.deepcopy(cause)
                for occurrence in record_occurrences
                for cause in occurrence["causes"]
            ],
        }
        operand_material = {
            "operand": operand,
            "declarations": [],
            "projection_attempts": [],
            "causes": [],
        }
        record_causes = [
            copy.deepcopy(cause)
            for occurrence in record_occurrences
            for cause in occurrence["causes"]
        ]
        source_causes = []
        for occurrence in record_occurrences:
            source_unformed, occurrence_source_causes = _source_usability_for_record(
                occurrence, source_observations
            )
            if source_unformed:
                source_causes.extend(occurrence_source_causes)
        operand_material["causes"].extend(copy.deepcopy(source_causes))
        material_causes.extend(copy.deepcopy(source_causes))
        if role != "definition":
            operand_material["causes"].extend(record_causes)
            material_causes.extend(record_causes)
        else:
            declaration_content_causes = [
                copy.deepcopy(cause)
                for occurrence in record_occurrences
                if occurrence["origin"]["collection"] == "axis_facts"
                and _axis_projection_declaration_indices(input_value, field, ref)
                for cause in occurrence["causes"]
            ]
            operand_material["causes"].extend(declaration_content_causes)
            material_causes.extend(declaration_content_causes)
        owner_causes = [
            copy.deepcopy(cause)
            for occurrence in record_occurrences
            for binding in occurrence["owner_bindings"]
            for cause in binding["causes"]
        ]
        operand_material["causes"].extend(owner_causes)
        material_causes.extend(owner_causes)
        for occurrence_index, occurrence in enumerate(record_occurrences):
            if role != "definition":
                continue
            if occurrence["origin"]["collection"] == "axis_facts":
                declaration_indices = _axis_projection_declaration_indices(
                    input_value, field, ref
                )
                if declaration_indices:
                    applicable_meanings = [
                        {
                            member: input_value["semantic_records"][index][
                                "meaning"
                            ].get(member)
                            for member in (
                                "binding",
                                "field_ref",
                                "material_ref",
                                "material_role",
                                "material_carrier",
                                "payload_form",
                                "reason_role",
                                "basis_refs",
                            )
                        }
                        for index in declaration_indices
                    ]
                    if any(
                        not _json_equal(applicable_meanings[0], meaning)
                        for meaning in applicable_meanings[1:]
                    ):
                        raise NotImplementedError(
                            "WR154-P2 F06 conflicting AxisFact declarations are pending"
                        )
                    base = (
                        f"/owner_material/field_results/{field_index}/value/"
                        f"definition_material/operands/{operand_index}"
                    )
                    record_link = _return_link(
                        f"{base}/operand/record_occurrences/{occurrence_index}"
                    )
                    owner_links = [
                        _return_link(
                            f"{base}/operand/record_occurrences/{occurrence_index}/"
                            f"owner_bindings/{owner_index}"
                        )
                        for owner_index, _binding in enumerate(
                            occurrence["owner_bindings"]
                        )
                    ]
                    for declaration_index in declaration_indices:
                        declaration_occurrence = _declaration_occurrence_for_axis(
                            input_value,
                            source_observations,
                            field,
                            field_index,
                            declaration_index,
                            role_pairs,
                        )
                        declaration_slot = len(operand_material["declarations"])
                        operand_material["declarations"].append(
                            declaration_occurrence
                        )
                        declaration_causes = copy.deepcopy(
                            declaration_occurrence["causes"]
                        )
                        declaration_owner_bindings_form = all(
                            owner["result"] == "corresponding"
                            for owner in declaration_occurrence["owner_bindings"]
                        )
                        if declaration_occurrence["body"]["tag"] == "unformed":
                            operand_material["causes"].extend(
                                declaration_causes
                            )
                            material_causes.extend(declaration_causes)
                        declaration_link = _return_link(
                            f"{base}/declarations/{declaration_slot}"
                        )
                        mismatch_causes = _axis_declaration_mismatch_causes(
                            input_value,
                            field_index,
                            operand_index,
                            declaration_index,
                            occurrence,
                        )
                        declaration_body_causes = copy.deepcopy(
                            declaration_occurrence["body"]["causes"]
                            if declaration_occurrence["body"]["tag"] == "unformed"
                            else []
                        )
                        if declaration_body_causes:
                            attempt = _axis_definition_projection_attempt(
                                occurrence,
                                record_link,
                                declaration_occurrence,
                                declaration_link,
                                owner_links,
                                source_observations,
                            )
                        elif mismatch_causes:
                            prerequisite_causes = [
                                *copy.deepcopy(occurrence["causes"]),
                                *[
                                    copy.deepcopy(cause)
                                    for owner in occurrence["owner_bindings"]
                                    if owner["result"] != "corresponding"
                                    for cause in owner["causes"]
                                ],
                                *(
                                    declaration_causes
                                    if not declaration_owner_bindings_form
                                    else []
                                ),
                            ]
                            attempt = {
                                "record_link": record_link,
                                "basis": {
                                    "tag": "declaration",
                                    "declaration_link": declaration_link,
                                },
                                "owner_binding_links": owner_links,
                                "result": {
                                    "tag": "unformed",
                                    "causes": [
                                        *prerequisite_causes,
                                        *mismatch_causes,
                                    ],
                                },
                                "causes": prerequisite_causes,
                            }
                        elif not declaration_owner_bindings_form:
                            attempt = _axis_definition_projection_attempt(
                                occurrence,
                                record_link,
                                declaration_occurrence,
                                declaration_link,
                                owner_links,
                                source_observations,
                            )
                        else:
                            body = declaration_occurrence["body"]["value"]
                            if (
                                body["material_role"] != "definition"
                                or body["material_carrier"] != "AxisFact"
                                or body["payload_form"] != "axis_value"
                            ):
                                raise NotImplementedError(
                                    "WR154-P2 F06 AxisFact declaration correspondence is pending"
                                )
                            attempt = _axis_definition_projection_attempt(
                                occurrence,
                                record_link,
                                declaration_occurrence,
                                declaration_link,
                                owner_links,
                                source_observations,
                            )
                        operand_material["projection_attempts"].append(attempt)
                        if attempt["result"]["tag"] == "unformed":
                            generated_projection_causes = attempt["result"][
                                "causes"
                            ][len(attempt["causes"]):]
                            operand_material["causes"].extend(
                                copy.deepcopy(generated_projection_causes)
                            )
                            material_causes.extend(
                                copy.deepcopy(generated_projection_causes)
                            )
                    continue
                record_pointer = occurrence["origin"]["locator"]["pointer"]
                axis_fact = occurrence["original_record"]["value"]
                independent_candidates = _axis_independent_role_source_candidates(
                    input_value,
                    field,
                    ref,
                    axis_fact.get("source_ref"),
                )
                if independent_candidates:
                    raise NotImplementedError(
                        "WR154-P2 F06 independent role source is pending"
                    )
                axis_value_read = _member_read(
                    axis_fact, record_pointer, "value"
                )
                cause = _summary_cause(
                    "declaration_unresolved",
                    _loc(_ROOT_INPUT, ref_pointer),
                    _original(axis_value_read),
                    _literal(
                        "原definition role/form根拠",
                        "/f05_detail_contract/field_summary_and_custody_writer_contract/"
                        "patterns/3/cause/right/value",
                    ),
                    "/f05_detail_contract/field_summary_and_custody_writer_contract/"
                    "patterns/3",
                )
                operand_material["causes"].append(copy.deepcopy(cause))
                material_causes.append(cause)
                axis_declaration_unresolved = True
                continue
            base = (
                f"/owner_material/field_results/{field_index}/value/"
                f"definition_material/operands/{operand_index}"
            )
            record_link = _return_link(
                f"{base}/operand/record_occurrences/{occurrence_index}"
            )
            owner_links = [
                _return_link(
                    f"{base}/operand/record_occurrences/{occurrence_index}/"
                    f"owner_bindings/{owner_index}"
                )
                for owner_index, _binding in enumerate(occurrence["owner_bindings"])
            ]
            attempt = _native_definition_projection_attempt(
                input_value,
                occurrence,
                record_link,
                _return_link(f"{base}/operand"),
                owner_links,
                source_observations,
            )
            operand_material["projection_attempts"].append(attempt)
            operand_material["causes"].extend(copy.deepcopy(attempt["causes"]))
            material_causes.extend(copy.deepcopy(attempt["causes"]))
        operands.append(operand_material)

    for operand_index, operand_material in enumerate(operands):
        generated = _basis_unresolved_causes(
            field_index,
            operand_index,
            operand_material["operand"]["record_occurrences"],
            role,
        )
        operand_material["causes"].extend(copy.deepcopy(generated))
        operand_material["operand"]["causes"].extend(copy.deepcopy(generated))
        material_causes.extend(generated)

    if role == "definition" and axis_declaration_unresolved:
        aggregate = {"tag": "unformed", "causes": copy.deepcopy(material_causes)}
    elif role == "definition" and any(
        attempt["result"]["tag"] == "formed"
        for operand in operands
        for attempt in operand["projection_attempts"]
    ):
        projection_links = [
            _return_link(
                f"/owner_material/field_results/{field_index}/value/definition_material/"
                f"operands/{operand_index}/projection_attempts/{attempt_index}/result/value"
            )
            for operand_index, operand in enumerate(operands)
            for attempt_index, attempt in enumerate(operand["projection_attempts"])
            if attempt["result"]["tag"] == "formed"
        ]
        aggregate = {"tag": "formed", "value": {"projection_links": projection_links}}
    elif material_causes:
        aggregate = {"tag": "unformed", "causes": copy.deepcopy(material_causes)}
    else:
        aggregate = {"tag": "unformed", "causes": []}

    return {
        "role": role_name,
        "refs_read": refs_read,
        "operands": operands,
        "aggregate": aggregate,
        "causes": material_causes,
    }


def _targeted_field(input_value, field, index, source_observations, selection):
    if _has_unhandled_field_evidence_or_projection_declaration(input_value, field):
        raise NotImplementedError("WR154-R2-STOP-F05-DECLARED-EVIDENCE-01")
    if not isinstance(field.get("binding"), dict):
        raise NotImplementedError("WR154-R2-STOP-F05-FIELD-BINDING-01")
    field_pointer = f"/field_inputs/{index}"
    definition_material = _role_material(
        input_value, field, index, "definition", source_observations
    )
    value_material = _role_material(
        input_value, field, index, "product_value", source_observations
    )
    definition_cause = _summary_cause(
        "aggregation_unestablished",
        _loc(_ROOT_INPUT, f"{field_pointer}/definition_refs"),
        _original(_present(_ROOT_INPUT, field_pointer, field)),
        _literal(
            "formed local field_definition_evidence judgment",
            "/f05_detail_contract/field_summary_and_custody_writer_contract/patterns/0/cause/right/value",
        ),
        "/f05_detail_contract/field_summary_and_custody_writer_contract/patterns/0",
    )
    definition_assessment = {
        "evidence_interpretations": [],
        "basis_occurrences": [],
        "judgment": {"tag": "unformed", "causes": [definition_cause]},
        "causes": [definition_cause],
    }
    value_causes = copy.deepcopy(value_material["causes"])
    value_assessment = {
        "judgment": {"tag": "unformed", "causes": value_causes},
        "causes": copy.deepcopy(value_causes),
    }
    field_check_causes = [definition_cause, *value_causes]
    field_check = {"tag": "unformed", "causes": copy.deepcopy(field_check_causes)}
    return {
        "tag": "evaluated",
        "value": {
            "field_index": index,
            "field_locator": _loc(_ROOT_INPUT, field_pointer),
            "original_field": copy.deepcopy(field),
            "parent_binding": _present(_ROOT_INPUT, "/binding", input_value["binding"]),
            "field_binding": _present(
                _ROOT_INPUT, f"{field_pointer}/binding", field["binding"]
            ),
            "binding_relation": (
                "corresponding"
                if _json_equal(input_value["binding"], field["binding"])
                else "different"
            ),
            "definition_material": definition_material,
            "value_material": value_material,
            "definition_assessment": definition_assessment,
            "value_assessment": value_assessment,
            "field_check": field_check,
            "recipient_materials": [],
            "causes": [*definition_material["causes"], *value_causes, definition_cause],
            "selection": selection,
        },
    }


def _raw_only_field(request, input_value, field, index, source_observations):
    selection = _selection_scope_outside(input_value, field, index, "field_inputs")
    if selection is None:
        selection = _field_selection(
            input_value,
            request["compare_applicability"]["comparison"],
            field,
            index,
        )
    if selection["tag"] == "targeted":
        return _targeted_field(input_value, field, index, source_observations, selection)
    locator = _loc(_ROOT_INPUT, f"/field_inputs/{index}")
    return {
        "tag": "raw_only",
        "field_index": index,
        "field_locator": locator,
        "original_field": copy.deepcopy(field),
        "selection": selection,
        "causes": copy.deepcopy(selection["causes"]),
    }


def _raw_only_gap(input_value, proposal, index):
    selection = _selection_scope_outside(input_value, proposal, index, "gap_proposals")
    if selection is None:
        raise NotImplementedError(
            "WR154-P2 F10-F13 targeted proposal writer is pending"
        )
    locator = _loc(_ROOT_INPUT, f"/gap_proposals/{index}")
    return {
        "tag": "raw_only",
        "proposal_index": index,
        "proposal_locator": locator,
        "original_proposal": copy.deepcopy(proposal),
        "selection": selection,
        "causes": copy.deepcopy(selection["causes"]),
    }


def _has_matching_gap_proposition(input_value, proposal):
    proposal_ref = proposal.get("ref")
    proposal_binding = proposal.get("binding")
    for record in input_value.get("semantic_records", []):
        if not isinstance(record, dict):
            continue
        meaning = record.get("meaning")
        proposition_kind = record.get("kind") == "field_gap_proposition" or (
            isinstance(meaning, dict)
            and meaning.get("kind") == "field_gap_proposition"
        )
        if not proposition_kind:
            continue
        if _ref_relation(proposal_ref, record.get("ref")) != "corresponding":
            continue
        if _json_equal(proposal_binding, record.get("binding")):
            return True
    return False


def _gap_result(input_value, proposal, index):
    selection = _selection_scope_outside(
        input_value, proposal, index, "gap_proposals"
    )
    if selection is not None:
        return _raw_only_gap(input_value, proposal, index)
    if not _has_matching_gap_proposition(input_value, proposal):
        raise NotImplementedError("WR154-R2-STOP-F10-GAP-PROPOSITION-ABSENT-01")
    raise NotImplementedError("WR154-P2 F10-F13 targeted proposal writer is pending")


def _field_check_causes(field_results):
    causes = []
    for result in field_results:
        if result["tag"] == "raw_only":
            selection = result.get("selection")
            if isinstance(selection, dict) and selection.get("tag") == "unestablished":
                selection_causes = selection.get("causes")
                if not isinstance(selection_causes, list):
                    raise NotImplementedError(
                        "WR154-R2-STOP-F02-SELECTION-CAUSE-SHAPE-01"
                    )
                if not selection_causes:
                    raise NotImplementedError(
                        "WR154-R2-STOP-F02-SELECTION-UNESTABLISHED-CAUSE-01"
                    )
                causes.extend(copy.deepcopy(selection_causes))
        if result["tag"] == "evaluated" and result["value"]["field_check"]["tag"] == "unformed":
            causes.extend(copy.deepcopy(result["value"]["field_check"]["causes"]))
            field = result["value"]["original_field"]
            index = result["value"]["field_index"]
            pointer = f"/field_inputs/{index}"
            causes.append(
                _cause(
                    "native_leaf_unformed",
                    _loc(_ROOT_INPUT, pointer),
                    _original(_present(_ROOT_INPUT, pointer, field)),
                    _literal(
                        "formed FieldCheckProjection",
                        "/f05_detail_contract/field_summary_and_custody_writer_contract/patterns/2/cause/right/value",
                    ),
                    "/f05_detail_contract/field_summary_and_custody_writer_contract/patterns/2",
                )
            )
    return causes


def _present_input_array(input_value, member):
    pointer = f"/{member}"
    if member not in input_value:
        return {
            "tag": "absent",
            "requested": _loc(_ROOT_INPUT, pointer),
            "parent": _loc(_ROOT_INPUT, ""),
            "parent_value": copy.deepcopy(input_value),
        }
    value = input_value[member]
    if not isinstance(value, list):
        raise NotImplementedError(f"WR154-P2 F02 malformed {member} shape is pending")
    return _present(_ROOT_INPUT, pointer, value)


def _member_read(parent, parent_pointer, member):
    pointer = f"{parent_pointer}/{member}"
    if member in parent:
        return _present(_ROOT_INPUT, pointer, parent[member])
    return {
        "tag": "absent",
        "requested": _loc(_ROOT_INPUT, pointer),
        "parent": _loc(_ROOT_INPUT, parent_pointer),
        "parent_value": copy.deepcopy(parent),
    }


def _obligation_material(request, input_value, proposals):
    trace = request["compare_kind_obligation_trace"]["comparison"]
    trace_material = trace["material"]
    proposal_refs = []
    origin_inputs = []
    for index, proposal in enumerate(proposals):
        refs_read = _member_read(
            proposal, f"/gap_proposals/{index}", "unfinished_obligation_refs"
        )
        proposal_refs.append(
            _named(
                f"gap_proposals/{index}/unfinished_obligation_refs",
                refs_read,
            )
        )
        if refs_read["tag"] == "absent":
            continue
        refs = refs_read["value"]
        if not isinstance(refs, list):
            raise NotImplementedError(
                "WR154-P2 F14 proposal obligation collection shape is pending"
            )
        for ref_index, requested_ref in enumerate(refs):
            if not isinstance(requested_ref, dict):
                raise NotImplementedError(
                    "WR154-P2 F14 proposal obligation Ref shape is pending"
                )
            origin_inputs.append(
                {
                    "proposal_index": index,
                    "ref_index": ref_index,
                    "requested_ref": requested_ref,
                    "ref_read": _present(
                        _ROOT_INPUT,
                        f"/gap_proposals/{index}/unfinished_obligation_refs/{ref_index}",
                        requested_ref,
                    ),
                    "requested_binding": proposal.get("binding"),
                    "match_binding": False,
                    "kind_trace_links": [],
                }
            )

    source_observations = request["validation"].get("source_observations")
    trace_obligations = trace_material.get("obligations")
    if not isinstance(source_observations, dict) or not isinstance(
        trace_obligations, list
    ):
        raise NotImplementedError("WR154-P2 F14 source/trace input is pending")
    if (
        input_value.get("obligations") is None
        or not isinstance(input_value.get("obligations"), list)
    ):
        raise NotImplementedError("WR154-P2 F14 obligation collection shape is pending")

    occurrences = []
    returned_refs = []
    causes = []
    for trace_index, trace_obligation in enumerate(trace_obligations):
        if not isinstance(trace_obligation, dict) or not isinstance(
            trace_obligation.get("ref"), dict
        ):
            raise NotImplementedError("WR154-P2 F14 kind-trace Ref is pending")
        requested_ref = trace_obligation["ref"]
        requested_binding = trace_obligation.get("binding")
        origin_inputs.append(
            {
                "proposal_index": None,
                "ref_index": trace_index,
                "requested_ref": requested_ref,
                "ref_read": _present(
                    _ROOT_REQUEST,
                    f"/compare_kind_obligation_trace/comparison/material/obligations/{trace_index}/ref",
                    requested_ref,
                ),
                "requested_binding": requested_binding,
                "match_binding": True,
                "kind_trace_links": [
                    f"/material/obligations/{trace_index}/ref",
                    f"/material/obligations/{trace_index}",
                ],
            }
        )

    for origin_input in origin_inputs:
        if origin_input["proposal_index"] is None:
            continue
        origin_input["kind_trace_links"] = [
            pointer
            for trace_index, trace_obligation in enumerate(trace_obligations)
            if _ref_relation(
                origin_input["requested_ref"], trace_obligation["ref"]
            )
            == "corresponding"
            for pointer in (
                f"/material/obligations/{trace_index}/ref",
                f"/material/obligations/{trace_index}",
            )
        ]

    for origin_input in origin_inputs:
        requested_ref = origin_input["requested_ref"]
        record_occurrences = _record_occurrences_for_operand(
            input_value,
            source_observations,
            requested_ref,
            origin_input["requested_binding"],
            collections=("obligations",),
            match_binding=origin_input["match_binding"],
        )
        if not record_occurrences:
            raise NotImplementedError("WR154-P2 F14 obligation record lookup is pending")

        record_details = []
        for record_index, record_occurrence in enumerate(record_occurrences):
            raw_index = record_occurrence["origin"]["index"]
            raw_record = input_value["obligations"][raw_index]
            condition_refs_read = _member_read(
                raw_record, f"/obligations/{raw_index}", "condition_refs"
            )
            if condition_refs_read["tag"] == "present" and not isinstance(
                condition_refs_read["value"], list
            ):
                raise NotImplementedError(
                    "WR154-P2 F14 malformed condition_refs is pending"
                )
            condition_operands = []
            condition_refs = (
                condition_refs_read["value"]
                if condition_refs_read["tag"] == "present"
                else []
            )
            for condition_index, condition_ref in enumerate(condition_refs):
                if not isinstance(condition_ref, dict):
                    raise NotImplementedError(
                        "WR154-P2 F14 malformed condition Ref is pending"
                    )
                condition_read = _present(
                    _ROOT_INPUT,
                    f"/obligations/{raw_index}/condition_refs/{condition_index}",
                    condition_ref,
                )
                condition_records = _record_occurrences_for_operand(
                    input_value,
                    source_observations,
                    condition_ref,
                    raw_record.get("binding"),
                    collections=("conditions",),
                    match_binding=False,
                )
                if not condition_records:
                    raise NotImplementedError(
                        "WR154-P2 F14 condition record lookup is pending"
                    )
                operand_causes = [
                    copy.deepcopy(cause)
                    for condition_record in condition_records
                    for cause in condition_record["causes"]
                ]
                condition_operands.append(
                    {
                        "original_ref": condition_read,
                        "operand_index": condition_index,
                        "role": "obligation_condition",
                        "record_occurrences": condition_records,
                        "causes": operand_causes,
                    }
                )
            record_details.append(
                {
                    "record_occurrence_index": record_index,
                    "condition_refs_read": condition_refs_read,
                    "condition_operands": condition_operands,
                    "reentry_ref_read": _member_read(
                        raw_record, f"/obligations/{raw_index}", "reentry_ref"
                    ),
                }
            )

        origin_causes = [
            copy.deepcopy(cause)
            for record_occurrence in record_occurrences
            for cause in record_occurrence["causes"]
        ]
        origin_causes.extend(
            copy.deepcopy(cause)
            for detail in record_details
            for operand in detail["condition_operands"]
            for cause in operand["causes"]
        )
        occurrences.append(
            {
                "proposal_index": origin_input["proposal_index"],
                "ref_index": origin_input["ref_index"],
                "ref_read": origin_input["ref_read"],
                "record_occurrences": record_occurrences,
                "record_details": record_details,
                "kind_trace_links": origin_input["kind_trace_links"],
                "causes": origin_causes,
            }
        )
        returned_refs.append(copy.deepcopy(requested_ref))
        causes.extend(copy.deepcopy(origin_causes))

    return {
        "proposal_refs": proposal_refs,
        "kind_trace_return": copy.deepcopy(trace),
        "original_obligations": _member_read(input_value, "", "obligations"),
        "required_trace_refs": _member_read(input_value, "", "required_trace_refs"),
        "trace_edges": _member_read(input_value, "", "trace_edges"),
        "trace_requirements": _member_read(input_value, "", "trace_requirements"),
        "occurrences": occurrences,
        "returned_refs": returned_refs,
        "causes": causes,
    }


def compare_requirement_gaps_detail(request, input_scope_scan):
    """Produce the staged F05 detailed return for the implemented bounded slice."""
    if (
        not isinstance(input_scope_scan, dict)
        or input_scope_scan.get("tag") != "scanned"
        or not isinstance(input_scope_scan.get("profile_observations"), list)
        or not isinstance(input_scope_scan.get("semantic_record_indices"), list)
        or not isinstance(input_scope_scan.get("semantic_records_read"), dict)
    ):
        raise NotImplementedError("WR154-R2-STOP-F13-INPUT-SCOPE-SCAN-SHAPE-01")
    if input_scope_scan["profile_observations"]:
        raise NotImplementedError("WR154-R2-STOP-F13-PROFILE-CONSUMER-01")
    context = _context_formation(request)
    header = _header_formation(request)
    stopped = _f01_stopped(request, context, header)
    if stopped is not None:
        return stopped

    input_value = request["validation"]["validated"]["input"]
    field_inputs_read = _present_input_array(input_value, "field_inputs")
    gap_proposals_read = _present_input_array(input_value, "gap_proposals")
    fields = field_inputs_read["value"]
    proposals = gap_proposals_read["value"]
    source_observations = request["validation"].get("source_observations")
    if not isinstance(source_observations, dict):
        raise NotImplementedError("WR154-P2 F03 source observation input is pending")
    field_results = [
        _raw_only_field(request, input_value, field, index, source_observations)
        for index, field in enumerate(fields)
    ]
    gap_results = [
        _gap_result(input_value, proposal, index)
        for index, proposal in enumerate(proposals)
    ]
    obligation_material = _obligation_material(request, input_value, proposals)
    binding = header["result"]["value"]
    comparison_causes = _field_check_causes(field_results)
    if comparison_causes:
        comparison = {"tag": "unformed", "causes": comparison_causes}
    else:
        comparison = {
            "tag": "formed",
            "value": {
                "producer_symbol": "compare_requirement_gaps",
                "input_binding": copy.deepcopy(binding),
                "original_axes": [],
                "findings": [],
                "material": {
                    "field_checks": [],
                    "candidate_proposals": [],
                    "unfinished_obligation_refs": [],
                },
            },
        }
    owner_causes = [
        *[
            cause
            for result in field_results
            for cause in (
                result["causes"]
                if result["tag"] == "raw_only"
                else result["value"]["causes"]
            )
        ],
        *[cause for result in gap_results for cause in result["causes"]],
    ]
    return {
        "original_request": copy.deepcopy(request),
        "context_formation": context,
        "header_formation": header,
        "comparison": comparison,
        "owner_material": {
            "tag": "evaluated",
            "original_request": copy.deepcopy(request),
            "field_inputs_read": field_inputs_read,
            "gap_proposals_read": gap_proposals_read,
            "field_results": field_results,
            "gap_results": gap_results,
            "obligation_material": obligation_material,
            "comparison_links": [],
            "causes": owner_causes,
        },
    }
