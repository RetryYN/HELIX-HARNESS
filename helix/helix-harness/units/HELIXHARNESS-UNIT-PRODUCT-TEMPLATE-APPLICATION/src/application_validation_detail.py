"""Native FN0 detailed validation writer for the H009 F05 P1 contract."""

from __future__ import annotations

import copy
from typing import Any

from application_input_schema import _shape_issues
from application_source_checks import _MISSING, _ref_relation
from application_validation_detail_support import (
    _LOOKUP_REASONS,
    _aggregate_causes,
    _check_result,
    _field_value,
    _input_unobserved_cause,
    _issue_for_check,
    _issue_for_lookup,
    _literal,
    _location,
    _lookup_cause,
    _original,
    _qualification_checks,
    _read_path,
    _root_checks,
    _shape_failure,
    _source_checks,
)


def validate_application_input_detail(
    validation_input: dict[str, Any],
) -> dict[str, Any]:
    """Return native ValidationDetailedReturn without creating a decoder result."""
    raw = validation_input["raw"]
    issues = _shape_issues(raw)
    if issues:
        return _shape_failure(raw, validation_input, issues)

    public_issues = []
    unusable = []
    arrays = []
    for member in ("sources", "qualifications", "qualification_roots"):
        arrays.append(_read_path(raw, f"/{member}"))
    sources = raw.get("sources", _MISSING)
    qualifications = raw.get("qualifications", _MISSING)
    roots = raw.get("qualification_roots", _MISSING)
    source_rows = []
    for source_index, source in enumerate(sources if isinstance(sources, list) else []):
        prefix = f"/sources/{source_index}"
        source_checks = _source_checks(raw, source_index, source)
        source_causes = _aggregate_causes(source_checks)
        qref = _field_value(source, "qualification_ref")
        qmatches = [
            (index, qualification)
            for index, qualification in enumerate(
                qualifications if isinstance(qualifications, list) else []
            )
            if isinstance(qualification, dict)
            and _ref_relation(qref, _field_value(qualification, "ref"))
            == "corresponding"
        ]
        lookup_cause = None
        qrows = []
        route_states = []
        if qref is _MISSING or qref is None:
            read = _read_path(raw, f"{prefix}/qualification_ref")
            lookup_cause = _lookup_cause(
                "source_qualification_ref_unformed",
                _original(read),
                _literal(
                    "Qualification.ref",
                    "/f05_detail_contract/validation_cause_diagnostic_contract/lookup_patterns/0/right_literal",
                ),
            )
        elif not qmatches:
            read = _read_path(raw, f"{prefix}/qualification_ref")
            lookup_cause = _lookup_cause(
                "qualification_lookup_unresolved",
                _original(read),
                _original(arrays[1]),
            )
        for qualification_index, qualification in qmatches:
            qprefix = f"/qualifications/{qualification_index}"
            qchecks = _qualification_checks(
                raw, source_index, qualification_index, source, qualification
            )
            qcauses = _aggregate_causes(qchecks)
            root_ref = _field_value(qualification, "root_ref")
            rmatches = [
                (index, root)
                for index, root in enumerate(roots if isinstance(roots, list) else [])
                if isinstance(root, dict)
                and _ref_relation(root_ref, root) == "corresponding"
            ]
            qlookup = None
            rrows = []
            if root_ref is _MISSING:
                read = _read_path(raw, f"{qprefix}/root_ref")
                qlookup = _lookup_cause(
                    "qualification_root_ref_unformed",
                    _original(read),
                    _literal(
                        "independent qualification_roots Ref",
                        "/f05_detail_contract/validation_cause_diagnostic_contract/lookup_patterns/2/right_literal",
                    ),
                )
            elif not rmatches:
                read = _read_path(raw, f"{qprefix}/root_ref")
                qlookup = _lookup_cause(
                    "root_lookup_unresolved",
                    _original(read),
                    _original(arrays[2]),
                )
            for root_index, root in rmatches:
                rchecks = _root_checks(
                    raw,
                    source_index,
                    qualification_index,
                    root_index,
                    source,
                    qualification,
                    root,
                )
                rcauses = _aggregate_causes(rchecks)
                rrows.append(
                    {
                        "root_index": root_index,
                        "original_root": copy.deepcopy(root),
                        "locator": _location(
                            "validation_input", f"/qualification_roots/{root_index}"
                        ),
                        "checks": rchecks,
                        "causes": rcauses,
                    }
                )
                route_states.append(_check_result(qchecks + rchecks))
            if qlookup is not None:
                qcauses.append(qlookup)
                route_states.append(
                    _check_result(qchecks + [{"result": "unestablished"}])
                )
            elif not rmatches:
                route_states.append(
                    _check_result(qchecks + [{"result": "unestablished"}])
                )
            qcauses.extend(cause for row in rrows for cause in row["causes"])
            qrows.append(
                {
                    "qualification_index": qualification_index,
                    "original_qualification": copy.deepcopy(qualification),
                    "locator": _location(
                        "validation_input", f"/qualifications/{qualification_index}"
                    ),
                    "root_ref": _read_path(raw, f"{qprefix}/root_ref"),
                    "root_occurrences": rrows,
                    "checks": qchecks,
                    "causes": qcauses,
                }
            )
        if lookup_cause is not None:
            source_causes.append(lookup_cause)
            route_states.append("unestablished")
        source_causes.extend(cause for row in qrows for cause in row["causes"])
        own_state = _check_result(source_checks)
        if "corresponding" in route_states:
            route_state = "corresponding"
        elif "unestablished" in route_states:
            route_state = "unestablished"
        elif route_states:
            route_state = "different"
        else:
            route_state = "unestablished"
        if "different" in (own_state, route_state):
            usability = {"tag": "unusable", "causes": copy.deepcopy(source_causes)}
        elif "unestablished" in (own_state, route_state):
            usability = {"tag": "unestablished", "causes": copy.deepcopy(source_causes)}
        else:
            usable_q_indices = [
                local_index
                for local_index, row in enumerate(qrows)
                if any(
                    _check_result(row["checks"] + rootrow["checks"]) == "corresponding"
                    for rootrow in row["root_occurrences"]
                )
            ]
            usability = {
                "tag": "usable",
                "check_indices": list(range(len(source_checks))),
                "qualification_indices": usable_q_indices,
            }
        source_rows.append(
            {
                "source_index": source_index,
                "locator": _location("validation_input", prefix),
                "original_source": copy.deepcopy(source),
                "qualification_ref": _read_path(raw, f"{prefix}/qualification_ref"),
                "qualification_occurrences": qrows,
                "checks": source_checks,
                "usability": usability,
                "causes": source_causes,
            }
        )
        source_ref = source.get("ref") if isinstance(source.get("ref"), dict) else None
        for check in source_checks[:2]:
            if check["causes"]:
                public_issues.append(_issue_for_check(check, source_ref))
        if lookup_cause is not None:
            pointer_index = 0 if qref is _MISSING or qref is None else 1
            public_issues.append(
                _issue_for_lookup(
                    lookup_cause,
                    _LOOKUP_REASONS[
                        "source_qualification_ref_unformed"
                        if pointer_index == 0
                        else "qualification_lookup_unresolved"
                    ],
                    source_ref,
                )
            )
        for qualification_row in qrows:
            for check in qualification_row["checks"]:
                if check["causes"]:
                    public_issues.append(_issue_for_check(check, source_ref))
            qualification_lookup = next(
                (
                    cause
                    for cause in qualification_row["causes"]
                    if cause["rule_pointer"].endswith("lookup_patterns/2")
                    or cause["rule_pointer"].endswith("lookup_patterns/3")
                ),
                None,
            )
            if qualification_lookup is not None:
                pointer_index = (
                    2
                    if qualification_lookup["rule_pointer"].endswith(
                        "lookup_patterns/2"
                    )
                    else 3
                )
                identifier = (
                    "qualification_root_ref_unformed"
                    if pointer_index == 2
                    else "root_lookup_unresolved"
                )
                public_issues.append(
                    _issue_for_lookup(
                        qualification_lookup,
                        _LOOKUP_REASONS[identifier],
                        source_ref,
                    )
                )
            for root_row in qualification_row["root_occurrences"]:
                for check in root_row["checks"]:
                    if check["causes"]:
                        public_issues.append(_issue_for_check(check, source_ref))
        public_state = _check_result(source_checks[:2])
        if "different" in (public_state, route_state) or "unestablished" in (
            public_state,
            route_state,
        ):
            if source_ref is not None:
                unusable.append(copy.deepcopy(source_ref))
    all_causes = [
        copy.deepcopy(cause) for row in source_rows for cause in row["causes"]
    ]
    return {
        "original_raw_input": copy.deepcopy(validation_input),
        "validated": {
            "input": copy.deepcopy(raw),
            "input_issues": public_issues,
            "unusable_source_refs": unusable,
        },
        "source_observations": {
            "sources_read": arrays[0],
            "qualifications_read": arrays[1],
            "roots_read": arrays[2],
            "source_occurrences": source_rows,
            "causes": all_causes,
        },
    }
