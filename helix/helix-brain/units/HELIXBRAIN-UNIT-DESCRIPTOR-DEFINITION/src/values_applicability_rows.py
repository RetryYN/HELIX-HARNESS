"""BRAIN032 F03/N03 値と適用 — 1行評価（_build_f03_row）実装。"""

from __future__ import annotations

import copy
from typing import Any

from descriptor_definitions import (
    _binding_same,
    _copy_refs_in_source_order,
    _ordered,
    _presence,
    _ref_same,
    _ref_shape_ok,
    _root_occurrences,
)
from values_applicability_reads import (
    N03_BACKFLOW_ID,
    _PROBLEM_REASONS,
    _f03_stop,
    _problem,
    _read_f03_fact_meaning,
    _read_f03_field_descriptor_target,
    _read_f03_field_owner_record,
)

def _build_f03_row(
    orig_def_reader: Any,
    reason_mat_builder: Any,
    event_axis_emitter: Any,
    validated: dict[str, Any],
    index: int,
    field: dict[str, Any],
    *,
    has_f03_mode: bool,
) -> tuple[dict[str, Any], list[dict[str, Any]], list[dict[str, Any]]]:
    raw = validated["input"]
    field_locator = f"/section_fields/{index}"
    binding = raw["binding"]
    field_ref = field.get("ref")
    field_members = {
        "ref",
        "descriptor_slot_ref",
        "parent_section_ref",
        "meaning_fact_refs",
        "requiredness_fact_refs",
        "normative_rule_refs",
        "oracle_refs",
        "value_fact_refs",
        "applicability_ref",
    }
    if set(field.keys()) != field_members or not isinstance(field_ref, dict) or not isinstance(binding, dict):
        raise NotImplementedError(f"SectionField closed shape branch: Backflow {N03_BACKFLOW_ID}")
    if "applicability_records" not in raw or not isinstance(raw["applicability_records"], list):
        raise _f03_stop("applicability_records_absent_or_shape", "applicability_records is absent or not an array")

    definition_read = orig_def_reader(
        validated, field_locator, field, has_f03_mode=has_f03_mode
    )

    if "applicability_ref" not in field:
        raise NotImplementedError(f"field applicability absent branch: Backflow {N03_BACKFLOW_ID}")
    applicability_ref = field["applicability_ref"]
    if applicability_ref is not None and not isinstance(applicability_ref, dict):
        raise NotImplementedError(f"field applicability Ref type branch: Backflow {N03_BACKFLOW_ID}")
    if applicability_ref is None and not has_f03_mode:
        raise NotImplementedError(f"field applicability absent/null branch: Backflow {N03_BACKFLOW_ID}")

    applicability_request_locator = field_locator + "/applicability_ref"
    applicability_read = _read_f03_field_owner_record(
        validated,
        "field_applicability",
        field_locator,
        field,
        applicability_request_locator,
        applicability_ref,
    )

    value_reads: list[dict[str, Any]] = []
    values = raw.get("values")
    value_refs = field.get("value_fact_refs")
    if not isinstance(values, list) or not isinstance(value_refs, list):
        raise NotImplementedError(f"SectionField.value_fact_refs absence/null/type branch: Backflow {N03_BACKFLOW_ID}")
    for value_index, value_ref in enumerate(value_refs):
        if not isinstance(value_ref, dict):
            raise NotImplementedError(f"SectionField.value_fact_refs non-Ref branch: Backflow {N03_BACKFLOW_ID}")
        matching_values = [row for row in values if _ref_same(row.get("ref"), value_ref)]
        if len(matching_values) > 1:
            raise NotImplementedError(f"duplicate same-ref ValueFact body branch: Backflow {N03_BACKFLOW_ID}")
        if matching_values and (
            not _ref_same(matching_values[0].get("subject_ref"), field_ref)
            or not _binding_same(matching_values[0].get("binding"), binding)
        ):
            raise NotImplementedError(f"ValueFact subject/full Binding mismatch branch: Backflow {N03_BACKFLOW_ID}")
        source_ref = matching_values[0].get("source_ref") if matching_values else None
        value_read = _read_f03_field_owner_record(
            validated,
            "value",
            field_locator,
            field,
            f"{field_locator}/value_fact_refs/{value_index}",
            value_ref,
            source_ref,
        )
        value_reads.append(value_read)
        if matching_values and "applicability_ref" in matching_values[0]:
            value_app_ref = matching_values[0]["applicability_ref"]
            if value_app_ref is not None:
                if not isinstance(value_app_ref, dict):
                    raise NotImplementedError(f"ValueFact.applicability_ref type branch: Backflow {N03_BACKFLOW_ID}")
                val_app_read = _read_f03_field_owner_record(
                    validated,
                    "value_applicability",
                    field_locator,
                    field,
                    f"/values/{_root_occurrences(raw, 'values', value_ref)[0]['index']}/applicability_ref",
                    value_app_ref,
                    subject_ref=matching_values[0].get("subject_ref"),
                )
                if val_app_read["state"] != "unknown":
                    raise _f03_stop("value_applicability_supplied", "ValueFact.applicability_ref non-null resolved/conflict evaluation is outside this slice")
                value_reads.append(val_app_read)

    parent_reads: list[dict[str, Any]] = []
    parent_ref = field.get("parent_section_ref")
    if parent_ref is not None:
        if not isinstance(parent_ref, dict):
            raise NotImplementedError(f"SectionField.parent_section_ref type branch: Backflow {N03_BACKFLOW_ID}")
        if has_f03_mode:
            for app_rec in raw.get("applicability_records", []):
                if isinstance(app_rec, dict) and _ref_same(app_rec.get("subject_ref"), parent_ref):
                    parent_reads.append(
                        _read_f03_field_owner_record(
                            validated,
                            "parent_section",
                            field_locator,
                            field,
                            field_locator + "/parent_section_ref",
                            app_rec.get("ref"),
                            app_rec.get("source_ref"),
                            subject_ref=parent_ref,
                        )
                    )
        else:
            parent_reads.append(
                _read_f03_field_owner_record(
                    validated,
                    "parent_section",
                    field_locator,
                    field,
                    field_locator + "/parent_section_ref",
                    parent_ref,
                    subject_ref=parent_ref,
                )
            )

    knowledge_ref = binding["knowledge_ref"]
    knowledge_owner = knowledge_ref.get("owner") if isinstance(knowledge_ref.get("owner"), str) else None
    events: list[dict[str, Any]] = []
    public_axes: list[dict[str, Any]] = []

    for j_idx, judgment in enumerate(definition_read["judgments"]):
        j_branch = judgment["branch"]
        j_state = judgment["state"]
        j_cause = judgment["cause"]
        mat = reason_mat_builder(
            j_branch,
            field_locator,
            field_locator + "/meaning_fact_refs",
            [r["locator"] for r in definition_read["owner_read"]["root_occurrences"]],
            [r["locator"] for r in definition_read["owner_read"]["source_occurrences"]],
            _presence(field.get("meaning_fact_refs"), present="meaning_fact_refs" in field),
            judgment["original_reason"],
            _presence(present=False),
            _presence(present=False),
            _presence(present=False),
            knowledge_ref,
            _presence(j_cause, present=True),
        )
        ev, ax = event_axis_emitter(
            j_branch,
            field_ref,
            binding,
            "field.definition",
            j_state,
            judgment["original_refs"],
            knowledge_owner,
            mat,
            [j_idx],
        )
        events.append(ev)
        public_axes.append(ax)

    owner_empty = (
        field.get("meaning_fact_refs") == []
        and field.get("requiredness_fact_refs") == []
        and field.get("normative_rule_refs") == []
        and field.get("oracle_refs") == []
        and field.get("value_fact_refs") == []
        and applicability_ref is None
    )
    if (
        definition_read["owner_read"]["state"] == "resolved"
        and not owner_empty
        and not value_reads
        and applicability_ref is None
        and not any(pr["state"] == "resolved" for pr in parent_reads)
    ):
        raise _f03_stop(
            "empty_value_fact_refs_non_empty_owner",
            "resolved non-empty SectionField without N/A or explicit applicability unknown requires value_fact_refs",
        )
    if (
        definition_read["owner_read"]["state"] == "resolved"
        and not owner_empty
        and not value_reads
        and applicability_read["state"] == "resolved"
        and applicability_read["root_occurrences"][0]["original_value"].get("decision") == "applicable"
    ):
        raise _f03_stop(
            "empty_value_fact_refs_non_empty_owner",
            "applicable SectionField requires value_fact_refs",
        )
    case_active = bool(value_reads) or (applicability_ref is not None) or any(
        pr["state"] == "resolved" for pr in parent_reads
    )

    if case_active:
        resolved_parent_na: dict[str, Any] | None = None
        resolved_parent_read: dict[str, Any] | None = None
        for pr in parent_reads:
            if pr["state"] == "resolved" and pr["root_occurrences"]:
                p_rec = pr["root_occurrences"][0]["original_value"]
                if p_rec.get("decision") == "not_applicable":
                    if p_rec.get("owner") is None or p_rec.get("reason") is None or p_rec.get("reentry_condition") is None:
                        raise _f03_stop("na_incomplete_branch", "parent not_applicable record lacks owner/reason/reentry_condition")
                    resolved_parent_na = p_rec
                    resolved_parent_read = pr
                    break

        if applicability_ref is None:
            core_owner = (
                resolved_parent_na.get("owner")
                if isinstance(resolved_parent_na, dict) and isinstance(resolved_parent_na.get("owner"), str)
                else None
            )
            if resolved_parent_na is not None and resolved_parent_read is not None:
                app_mat = reason_mat_builder(
                    "applicability_null",
                    field_locator,
                    applicability_request_locator,
                    [r["locator"] for r in resolved_parent_read["root_occurrences"]],
                    [r["locator"] for r in resolved_parent_read["source_occurrences"]],
                    _presence(None, present=True),
                    _presence(resolved_parent_na.get("reason"), present="reason" in resolved_parent_na),
                    _presence(resolved_parent_na.get("owner"), present="owner" in resolved_parent_na),
                    _presence(resolved_parent_na.get("decision"), present="decision" in resolved_parent_na),
                    _presence(resolved_parent_na.get("reentry_condition"), present="reentry_condition" in resolved_parent_na),
                    knowledge_ref,
                    _presence(present=False),
                )
            else:
                if value_reads and value_reads[0]["root_occurrences"]:
                    v_src = value_reads[0]["root_occurrences"][0]["original_value"].get("source_ref")
                    if isinstance(v_src, dict) and isinstance(v_src.get("owner"), str):
                        core_owner = v_src["owner"]
                app_mat = reason_mat_builder(
                    "applicability_null",
                    field_locator,
                    applicability_request_locator,
                    [],
                    [],
                    _presence(None, present=True),
                    _presence(present=False),
                    _presence(present=False),
                    _presence(present=False),
                    _presence(present=False),
                    knowledge_ref,
                    _presence(present=False),
                )
            ev, ax = event_axis_emitter(
                "applicability_null",
                field_ref,
                binding,
                "applicability.evaluation",
                "unknown",
                [knowledge_ref],
                core_owner,
                app_mat,
                [],
            )
            events.append(ev)
            public_axes.append(ax)
        elif applicability_read["state"] == "resolved":
            app_rec = applicability_read["root_occurrences"][0]["original_value"]
            app_owner = app_rec.get("owner") if isinstance(app_rec.get("owner"), str) else knowledge_owner
            decision = app_rec.get("decision")
            if decision == "applicable":
                app_branch, app_state = "applicability_applicable", "applicable"
            elif decision == "not_applicable":
                if app_rec.get("owner") is None or app_rec.get("reason") is None or app_rec.get("reentry_condition") is None:
                    raise _f03_stop("na_incomplete_branch", "ApplicabilityRecord decision=not_applicable lacks owner/reason/reentry_condition")
                app_branch, app_state = "applicability_na", "not_applicable"
            elif decision == "unknown":
                app_branch, app_state = "applicability_unknown", "unknown"
            else:
                raise _f03_stop("na_incomplete_branch", f"invalid ApplicabilityRecord.decision: {decision}")
            app_refs = [app_rec.get("ref"), knowledge_ref, app_rec.get("source_ref")]
            app_mat = reason_mat_builder(
                app_branch,
                field_locator,
                applicability_request_locator,
                [r["locator"] for r in applicability_read["root_occurrences"]],
                [r["locator"] for r in applicability_read["source_occurrences"]],
                _presence(decision, present="decision" in app_rec),
                _presence(app_rec.get("reason"), present="reason" in app_rec),
                _presence(app_rec.get("owner"), present="owner" in app_rec),
                _presence(decision, present="decision" in app_rec),
                _presence(app_rec.get("reentry_condition"), present="reentry_condition" in app_rec),
                knowledge_ref,
                _presence(present=False),
            )
            ev, ax = event_axis_emitter(
                app_branch,
                field_ref,
                binding,
                "applicability.evaluation",
                app_state,
                app_refs,
                app_owner,
                app_mat,
                [],
            )
            events.append(ev)
            public_axes.append(ax)
        else:
            app_mat = reason_mat_builder(
                "applicability_unknown",
                field_locator,
                applicability_request_locator,
                [r["locator"] for r in applicability_read["root_occurrences"]],
                [r["locator"] for r in applicability_read["source_occurrences"]],
                _presence(applicability_ref, present=True),
                _presence(present=False),
                _presence(present=False),
                _presence(present=False),
                _presence(present=False),
                knowledge_ref,
                _presence(present=False),
            )
            ev, ax = event_axis_emitter(
                "applicability_unknown",
                field_ref,
                binding,
                "applicability.evaluation",
                "unknown",
                [applicability_ref],
                knowledge_owner,
                app_mat,
                [],
            )
            events.append(ev)
            public_axes.append(ax)

        for v_read in value_reads:
            if v_read["request"]["kind"] != "value":
                continue
            v_occs = v_read["root_occurrences"]
            v_rec = v_occs[0]["original_value"] if v_occs else None
            if v_read["state"] == "resolved" and isinstance(v_rec, dict):
                v_src = v_rec.get("source_ref")
                v_owner = v_src.get("owner") if isinstance(v_src, dict) and isinstance(v_src.get("owner"), str) else knowledge_owner
                v_refs = [v_rec.get("ref"), knowledge_ref, v_src]
                if v_rec.get("value") is not None and v_rec.get("origin") == "product_input":
                    v_branch, v_state = "value_supplied", "supplied"
                elif v_rec.get("value") is None and v_rec.get("origin") in ("absent", "reference_fixture"):
                    v_branch, v_state = "value_unknown", "unknown"
                else:
                    raise _f03_stop("carrier_or_source_record_shape", "unclosed ValueFact value/origin combination")
            else:
                v_owner = knowledge_owner
                v_refs = [v_rec.get("ref"), v_rec.get("source_ref")] if isinstance(v_rec, dict) else []
                v_branch, v_state = "value_unknown", "unknown"

            v_mat = reason_mat_builder(
                v_branch,
                field_locator,
                v_read["request"]["request_locator"],
                [r["locator"] for r in v_occs],
                [r["locator"] for r in v_read["source_occurrences"]],
                _presence(v_rec.get("value"), present="value" in v_rec) if isinstance(v_rec, dict) else _presence(present=False),
                _presence(v_rec.get("reason"), present="reason" in v_rec) if isinstance(v_rec, dict) else _presence(present=False),
                _presence(present=False),
                _presence(present=False),
                _presence(present=False),
                knowledge_ref,
                _presence(present=False),
            )
            ev, ax = event_axis_emitter(
                v_branch,
                field_ref,
                binding,
                "field.value",
                v_state,
                v_refs,
                v_owner,
                v_mat,
                [],
            )
            events.append(ev)
            public_axes.append(ax)

        if applicability_ref is None:
            if resolved_parent_na is not None and resolved_parent_read is not None:
                p_owner = (
                    resolved_parent_na.get("owner")
                    if isinstance(resolved_parent_na.get("owner"), str)
                    else None
                )
                p_refs = [resolved_parent_na.get("ref"), knowledge_ref, resolved_parent_na.get("source_ref")]
                fapp_mat = reason_mat_builder(
                    "parent_na_no_transfer",
                    field_locator,
                    applicability_request_locator,
                    [r["locator"] for r in resolved_parent_read["root_occurrences"]],
                    [r["locator"] for r in resolved_parent_read["source_occurrences"]],
                    _presence(None, present=True),
                    _presence(resolved_parent_na.get("reason"), present="reason" in resolved_parent_na),
                    _presence(resolved_parent_na.get("owner"), present="owner" in resolved_parent_na),
                    _presence(resolved_parent_na.get("decision"), present="decision" in resolved_parent_na),
                    _presence(resolved_parent_na.get("reentry_condition"), present="reentry_condition" in resolved_parent_na),
                    knowledge_ref,
                    _presence(present=False),
                )
                ev, ax = event_axis_emitter(
                    "parent_na_no_transfer",
                    field_ref,
                    binding,
                    "field.applicability",
                    "unknown",
                    p_refs,
                    p_owner,
                    fapp_mat,
                    [],
                )
                events.append(ev)
                public_axes.append(ax)
            else:
                f_owner: str | None = None
                if value_reads and value_reads[0]["root_occurrences"]:
                    v_src = value_reads[0]["root_occurrences"][0]["original_value"].get("source_ref")
                    if isinstance(v_src, dict) and isinstance(v_src.get("owner"), str):
                        f_owner = v_src["owner"]
                fapp_mat = reason_mat_builder(
                    "field_unknown",
                    field_locator,
                    applicability_request_locator,
                    [],
                    [],
                    _presence(None, present=True),
                    _presence(present=False),
                    _presence(present=False),
                    _presence(present=False),
                    _presence(present=False),
                    knowledge_ref,
                    _presence(present=False),
                )
                ev, ax = event_axis_emitter(
                    "field_unknown",
                    field_ref,
                    binding,
                    "field.applicability",
                    "unknown",
                    [knowledge_ref],
                    f_owner,
                    fapp_mat,
                    [],
                )
                events.append(ev)
                public_axes.append(ax)
        elif applicability_read["state"] == "resolved":
            app_rec = applicability_read["root_occurrences"][0]["original_value"]
            app_owner = app_rec.get("owner") if isinstance(app_rec.get("owner"), str) else knowledge_owner
            decision = app_rec.get("decision")
            if decision == "applicable":
                f_branch, f_state = "field_applicable", "applicable"
            elif decision == "not_applicable":
                f_branch, f_state = "field_na", "not_applicable"
            else:
                f_branch, f_state = "field_unknown", "unknown"
            f_refs = [app_rec.get("ref"), knowledge_ref, app_rec.get("source_ref")]
            fapp_mat = reason_mat_builder(
                f_branch,
                field_locator,
                applicability_request_locator,
                [r["locator"] for r in applicability_read["root_occurrences"]],
                [r["locator"] for r in applicability_read["source_occurrences"]],
                _presence(decision, present="decision" in app_rec),
                _presence(app_rec.get("reason"), present="reason" in app_rec),
                _presence(app_rec.get("owner"), present="owner" in app_rec),
                _presence(decision, present="decision" in app_rec),
                _presence(app_rec.get("reentry_condition"), present="reentry_condition" in app_rec),
                knowledge_ref,
                _presence(present=False),
            )
            ev, ax = event_axis_emitter(
                f_branch,
                field_ref,
                binding,
                "field.applicability",
                f_state,
                f_refs,
                app_owner,
                fapp_mat,
                [],
            )
            events.append(ev)
            public_axes.append(ax)
        else:
            fapp_mat = reason_mat_builder(
                "field_unknown",
                field_locator,
                applicability_request_locator,
                [r["locator"] for r in applicability_read["root_occurrences"]],
                [r["locator"] for r in applicability_read["source_occurrences"]],
                _presence(applicability_ref, present=True),
                _presence(present=False),
                _presence(present=False),
                _presence(present=False),
                _presence(present=False),
                knowledge_ref,
                _presence(present=False),
            )
            ev, ax = event_axis_emitter(
                "field_unknown",
                field_ref,
                binding,
                "field.applicability",
                "unknown",
                [applicability_ref],
                knowledge_owner,
                fapp_mat,
                [],
            )
            events.append(ev)
            public_axes.append(ax)

    row = {
        "field_locator": field_locator,
        "field": copy.deepcopy(field),
        "definition_read": definition_read,
        "value_reads": value_reads,
        "applicability_read": applicability_read,
        "parent_reads": parent_reads,
        "events": events,
        "axis_indices": [],
        "finding_indices": [],
    }
    all_problems = (
        copy.deepcopy(definition_read["problems"])
        + [problem for read in value_reads for problem in read["problems"]]
        + copy.deepcopy(applicability_read["problems"])
        + [problem for read in parent_reads for problem in read["problems"]]
    )
    return row, public_axes, all_problems


