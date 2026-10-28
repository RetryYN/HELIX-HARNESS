"""fn3 identity claim predicates の読取を担う。"""

from __future__ import annotations
import copy
from typing import Any
from descriptor_definitions import (
    _binding_same,
    _json_equal,
    _ref_same,
    _wire_binding_shape_ok,
    _wire_ref_shape_ok,
)
from identity_trace_support import (
    _FN3_FINDING_PREFIXES,
    _fn3_diag,
    _fn3_finding,
    _fn3_predicate_finding_reason,
    _fn3_presence,
    _fn3_qualification_rows,
    _fn3_root_rows,
    _fn3_source_rows,
    _fn3_stop,
    _fn3_valid_source,
)


def _fn3_identity_claim_candidate(
    raw: dict[str, Any],
    source_index: int,
    source: dict[str, Any],
    trace_reads: list[dict[str, Any]],
    unusable: list[Any],
) -> dict[str, Any] | None:
    """Return a candidate only from its qualified source and same-call native trace."""
    content = source.get("content")
    source_ref = source.get("ref")
    source_binding = content.get("binding") if isinstance(content, dict) else None
    template_ref = (
        source_binding.get("template_ref") if isinstance(source_binding, dict) else None
    )
    if (
        not _wire_ref_shape_ok(source_ref)
        or not _wire_binding_shape_ok(source_binding)
        or not _wire_ref_shape_ok(template_ref)
        or not _fn3_valid_source(raw, source, unusable)
    ):
        return None

    # The same private DescriptorTraceRead must show this body, its record/provenance,
    # and a fact from this qualified source under the body's own Binding.
    for read in trace_reads:
        slot_read = read.get("slot_read", {})
        fact_read = read.get("fact_read", {})
        slot = (
            slot_read.get("value") if slot_read.get("presence") == "supplied" else None
        )
        fact = (
            fact_read.get("value") if fact_read.get("presence") == "supplied" else None
        )
        slot_binding = slot.get("binding") if isinstance(slot, dict) else None
        if (
            read.get("state") != "resolved"
            or source_index not in read.get("source_indices", [])
            or not isinstance(slot_binding, dict)
            or not _binding_same(slot_binding, source_binding)
            or not isinstance(fact, dict)
            or not _ref_same(fact.get("source_ref"), source_ref)
            or not isinstance(fact.get("binding"), dict)
            or not _binding_same(fact["binding"], source_binding)
        ):
            continue

        # A resolved chain must include this source's own KnowledgeRecord provenance,
        # not just an unrelated resolved source elsewhere in the same snapshot.
        record_by_index = {}
        for row in read.get("knowledge_records", []):
            if not isinstance(row, dict) or not isinstance(row.get("index"), int):
                continue
            original = row.get("original_read", {}).get("value")
            if isinstance(original, dict) and _ref_same(
                original.get("ref"), source_binding.get("knowledge_ref")
            ):
                record_by_index[row["index"]] = original
        provenance_linked = any(
            isinstance(row, dict)
            and row.get("relation") == "corresponding"
            and row.get("knowledge_record_index") in record_by_index
            and _ref_same(row.get("original_read", {}).get("value"), source_ref)
            for row in read.get("provenance_refs", [])
        )
        if not provenance_linked:
            continue

        # Tie the public fact back to a fact inside this source's native descriptor group.
        groups = content.get("descriptor_facts")
        if not isinstance(groups, list):
            continue
        for group_index, group in enumerate(groups):
            if not isinstance(group, dict) or not isinstance(group.get("facts"), list):
                continue
            group_locator = (
                f"/sources/{source_index}/content/descriptor_facts/{group_index}"
            )
            if not any(
                row.get("locator") == group_locator
                for row in read.get("body_groups", [])
                if isinstance(row, dict)
            ):
                continue
            for fact_index, original_fact in enumerate(group["facts"]):
                if not isinstance(original_fact, dict):
                    continue
                public_fact_body = copy.deepcopy(fact)
                owner_fact_body = copy.deepcopy(original_fact)
                public_fact_body.pop("source_ref", None)
                owner_fact_body.pop("source_ref", None)
                if (
                    _ref_same(original_fact.get("ref"), fact.get("ref"))
                    and _ref_same(original_fact.get("source_ref"), source_ref)
                    and isinstance(original_fact.get("binding"), dict)
                    and _binding_same(original_fact["binding"], source_binding)
                    and _json_equal(owner_fact_body, public_fact_body)
                ):
                    qualification_ref = source.get("qualification_ref")
                    qualification_rows = _fn3_qualification_rows(raw, qualification_ref)
                    root_rows = []
                    for _qi, qualification in qualification_rows:
                        if _ref_same(qualification.get("subject_ref"), source_ref):
                            root_rows.extend(
                                _fn3_root_rows(raw, qualification.get("root_ref"))
                            )
                    if not qualification_rows or not root_rows:
                        continue
                    return {
                        "source_index": source_index,
                        "source": source,
                        "template_ref": template_ref,
                        "binding": source_binding,
                        "trace_read": read,
                        "fact_locator": f"{group_locator}/facts/{fact_index}",
                        "qualification_indices": [i for i, _ in qualification_rows],
                        "root_indices": [i for i, _ in root_rows],
                        "record_indices": sorted(record_by_index),
                    }
    return None


def _fn3_identity_claim_findings(
    raw: dict[str, Any],
    binding: dict[str, Any],
    unusable: list[Any],
    findings: list[dict[str, Any]],
    trace_reads: list[dict[str, Any]],
) -> None:
    claims = raw.get("claims", [])
    sources = raw.get("sources", [])
    identity_kinds = ("same_template_identity", "template_identity", "template_version")
    role_kind = {
        "image_only": "template_identity",
        "semantic_json": "template_identity",
        "tool_node_only": "template_version",
    }
    role_predicate = {
        "image_only": ("image_identity_inference", "template.identity"),
        "tool_node_only": ("tool_node_identity_inference", "template.version"),
    }
    for ci, claim in enumerate(claims):
        if not isinstance(claim, dict):
            raise _fn3_stop(
                "unclosed/identity_claim/claim_not_object",
                f"/claims/{ci} is not a decoded Claim",
            )
        kind = claim.get("kind")
        if kind not in identity_kinds:
            continue
        claim_subject = claim.get("subject_ref")
        claim_binding = claim.get("binding")
        if not _wire_ref_shape_ok(claim_subject):
            raise _fn3_stop(
                "unclosed/identity_claim/subject_ref_shape",
                f"/claims/{ci}/subject_ref is outside the L4 wire Ref shape",
            )
        if not _wire_binding_shape_ok(claim_binding):
            raise _fn3_stop(
                "unclosed/identity_claim/binding_shape",
                f"/claims/{ci}/binding is outside the L4 wire Binding shape",
            )

        proposed = claim.get("proposed_value")
        if (
            kind == "template_version"
            and binding.get("version_target") is not None
            and _json_equal(proposed, binding.get("version_target"))
        ):
            raise _fn3_stop(
                "F04-NEG-10/unclosed/version_target_as_actual",
                f"F04-NEG-10/unclosed/version_target_as_actual at /claims/{ci}",
            )
        if not isinstance(proposed, dict):
            raise _fn3_stop(
                "unclosed/identity_claim/proposed_value_type",
                f"/claims/{ci}/proposed_value is not an object for this identity predicate",
            )

        if kind == "same_template_identity":
            if proposed.get("same_filename") is not True:
                continue
            basis = claim.get("basis_refs")
            if not isinstance(basis, list):
                raise _fn3_stop(
                    "unclosed/identity_claim/filename_basis_refs_type",
                    f"/claims/{ci}/basis_refs is not an array",
                )
            if len(basis) != 2:
                raise _fn3_stop(
                    "unclosed/identity_claim/filename_basis_refs_count",
                    f"/claims/{ci}/basis_refs must contain exactly two original Refs",
                )
            if any(not _wire_ref_shape_ok(ref) for ref in basis):
                raise _fn3_stop(
                    "unclosed/identity_claim/filename_basis_ref_shape",
                    f"/claims/{ci}/basis_refs contains a value outside the L4 wire Ref shape",
                )
            candidates = []
            complete = isinstance(trace_reads, list)
            if complete:
                for basis_index, basis_ref in enumerate(basis):
                    matching = _fn3_source_rows(raw, basis_ref)
                    # A nullable digest cannot pick a winning physical source occurrence.
                    if len(matching) != 1:
                        complete = False
                        break
                    source_index, source = matching[0]
                    candidate = _fn3_identity_claim_candidate(
                        raw, source_index, source, trace_reads, unusable
                    )
                    if candidate is None or not isinstance(
                        source.get("ref", {}).get("source_locator"), str
                    ):
                        complete = False
                        break
                    candidate["basis_index"] = basis_index
                    candidates.append(candidate)
            if complete and len({c["source_index"] for c in candidates}) == 2:
                candidates.sort(key=lambda c: c["source_index"])
                first, second = candidates
                same_filename = first["source"]["ref"].get("source_locator") == second[
                    "source"
                ]["ref"].get("source_locator")
                distinct_identity = (
                    first["template_ref"].get("identity") is not None
                    and second["template_ref"].get("identity") is not None
                    and not _json_equal(
                        first["template_ref"].get("identity"),
                        second["template_ref"].get("identity"),
                    )
                )
                if same_filename and distinct_identity:
                    observations = [
                        {
                            "locator": f"/claims/{ci}/kind",
                            "original_read": _fn3_presence(raw, f"/claims/{ci}/kind"),
                        },
                        {
                            "locator": f"/claims/{ci}/proposed_value/same_filename",
                            "original_read": _fn3_presence(
                                raw, f"/claims/{ci}/proposed_value/same_filename"
                            ),
                        },
                        {
                            "locator": f"/claims/{ci}/subject_ref",
                            "original_read": _fn3_presence(
                                raw, f"/claims/{ci}/subject_ref"
                            ),
                        },
                    ]
                    for candidate in candidates:
                        si = candidate["source_index"]
                        observations.extend(
                            [
                                {
                                    "locator": f"/claims/{ci}/basis_refs/{candidate['basis_index']}",
                                    "original_read": _fn3_presence(
                                        raw,
                                        f"/claims/{ci}/basis_refs/{candidate['basis_index']}",
                                    ),
                                },
                                {
                                    "locator": f"/sources/{si}/ref/source_locator",
                                    "original_read": _fn3_presence(
                                        raw, f"/sources/{si}/ref/source_locator"
                                    ),
                                },
                                {
                                    "locator": f"/sources/{si}/content/binding/template_ref",
                                    "original_read": _fn3_presence(
                                        raw,
                                        f"/sources/{si}/content/binding/template_ref",
                                    ),
                                },
                                {
                                    "locator": candidate["fact_locator"],
                                    "original_read": _fn3_presence(
                                        raw, candidate["fact_locator"]
                                    ),
                                },
                            ]
                        )
                        for qi in candidate["qualification_indices"]:
                            observations.append(
                                {
                                    "locator": f"/qualifications/{qi}",
                                    "original_read": _fn3_presence(
                                        raw, f"/qualifications/{qi}"
                                    ),
                                }
                            )
                        for ri in candidate["root_indices"]:
                            observations.append(
                                {
                                    "locator": f"/qualification_roots/{ri}",
                                    "original_read": _fn3_presence(
                                        raw, f"/qualification_roots/{ri}"
                                    ),
                                }
                            )
                        for ri in candidate["record_indices"]:
                            observations.append(
                                {
                                    "locator": f"/knowledge_records/{ri}/provenance_refs",
                                    "original_read": _fn3_presence(
                                        raw, f"/knowledge_records/{ri}/provenance_refs"
                                    ),
                                }
                            )
                    rule_ref = "HELIXBRAIN-L5-032-R-filename_identity_join"
                    reason = _fn3_diag(
                        _FN3_FINDING_PREFIXES["filename_identity_join"],
                        {
                            "code": "filename_identity_join",
                            "rule_ref": rule_ref,
                            "predicate_observations": observations,
                        },
                    )
                    findings.append(
                        _fn3_finding(
                            "filename_identity_join",
                            claim_subject,
                            claim_binding,
                            "identity_claim",
                            "conflict",
                            [c["source"]["ref"] for c in candidates],
                            reason,
                        )
                    )
            continue

        basis_role = proposed.get("basis_role")
        if not isinstance(basis_role, str) or basis_role not in role_kind:
            raise _fn3_stop(
                "unclosed/identity_claim/basis_role",
                f"/claims/{ci}/proposed_value/basis_role is outside the fixed identity predicates",
            )
        if kind != role_kind[basis_role]:
            raise _fn3_stop(
                "unclosed/identity_claim/kind_role_mismatch",
                f"/claims/{ci}/kind and basis_role do not form a fixed identity predicate",
            )
        if basis_role == "semantic_json":
            continue
        basis = claim.get("basis_refs")
        if not isinstance(basis, list):
            raise _fn3_stop(
                "unclosed/identity_claim/basis_refs_type",
                f"/claims/{ci}/basis_refs is absent, null, or not an array",
            )
        if not basis:
            raise _fn3_stop(
                "unclosed/identity_claim/basis_refs_empty",
                f"/claims/{ci}/basis_refs is empty",
            )
        if any(not _wire_ref_shape_ok(ref) for ref in basis):
            raise _fn3_stop(
                "unclosed/identity_claim/basis_ref_shape",
                f"/claims/{ci}/basis_refs contains a value outside the L4 wire Ref shape",
            )
        participating = [
            copy.deepcopy(source["ref"])
            for source in sources
            if isinstance(source, dict)
            and _wire_ref_shape_ok(source.get("ref"))
            and any(_ref_same(source["ref"], basis_ref) for basis_ref in basis)
        ]
        predicate_observations = [
            (f"/claims/{ci}/kind", "claim kind"),
            (f"/claims/{ci}/proposed_value/basis_role", "claim basis role"),
            (f"/claims/{ci}/subject_ref", "claim subject"),
            (f"/claims/{ci}/binding", "claim Binding"),
        ]
        for basis_index, ref in enumerate(basis):
            predicate_observations.append(
                (f"/claims/{ci}/basis_refs/{basis_index}", "claim basis Ref")
            )
            for source_index, source in _fn3_source_rows(raw, ref):
                if _wire_ref_shape_ok(source.get("ref")):
                    predicate_observations.append(
                        (f"/sources/{source_index}/ref", "basis source Ref occurrence")
                    )
        code, axis = role_predicate[basis_role]
        reason = _fn3_predicate_finding_reason(raw, code, predicate_observations)
        findings.append(
            _fn3_finding(
                code,
                claim_subject,
                claim_binding,
                axis,
                "unknown",
                participating,
                reason,
            )
        )
