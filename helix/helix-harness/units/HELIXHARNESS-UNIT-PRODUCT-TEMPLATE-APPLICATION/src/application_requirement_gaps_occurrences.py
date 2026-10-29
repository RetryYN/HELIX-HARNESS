"""Ordered source-record lookup primitives for native FN5 materialization."""

from __future__ import annotations

import copy

from application_input_schema import _json_equal
from application_source_checks import _ref_relation


_SOURCE_RECORD_COLLECTIONS = ("axis_facts", "semantic_records")


def _location(pointer):
    return {"root": "validation_input", "pointer": pointer}


def _present(pointer, value):
    return {
        "tag": "present",
        "location": _location(pointer),
        "value": copy.deepcopy(value),
    }


def _member_read(parent, parent_pointer, member):
    pointer = f"{parent_pointer}/{member}"
    if member in parent:
        return _present(pointer, parent[member])
    return {
        "tag": "absent",
        "requested": _location(pointer),
        "parent": _location(parent_pointer),
        "parent_value": copy.deepcopy(parent),
    }


def _matching_record_rows(
    input_value,
    requested_ref,
    requested_binding,
    collections=_SOURCE_RECORD_COLLECTIONS,
    match_binding=True,
):
    """Return all same-ref, same-binding source records in contract order."""
    rows = []
    for collection in collections:
        records = input_value.get(collection)
        if not isinstance(records, list):
            continue
        for index, record in enumerate(records):
            if not isinstance(record, dict):
                continue
            if _ref_relation(requested_ref, record.get("ref")) != "corresponding":
                continue
            if match_binding and not _json_equal(
                requested_binding, record.get("binding")
            ):
                continue
            rows.append((collection, index, copy.deepcopy(record)))
    return rows


def _matching_body_rows(source_body, collection, original_record):
    """Return body entries matching a record's collection, Ref, and payload."""
    entries = source_body.get("records")
    if not isinstance(entries, list):
        return []
    expected_payload = {
        key: copy.deepcopy(value)
        for key, value in original_record.items()
        if key != "source_ref"
    }
    rows = []
    for index, entry in enumerate(entries):
        if not isinstance(entry, dict) or entry.get("collection") != collection:
            continue
        if (
            _ref_relation(original_record.get("ref"), entry.get("ref"))
            != "corresponding"
        ):
            continue
        if not _json_equal(expected_payload, entry.get("payload")):
            continue
        rows.append((index, copy.deepcopy(entry)))
    return rows


def _body_rows_for_record_ref(source_body, collection, original_record):
    """Return every actual body entry with the record's collection and Ref."""
    entries = source_body.get("records")
    if not isinstance(entries, list):
        return []
    return [
        (index, copy.deepcopy(entry))
        for index, entry in enumerate(entries)
        if isinstance(entry, dict)
        and entry.get("collection") == collection
        and _ref_relation(original_record.get("ref"), entry.get("ref"))
        == "corresponding"
    ]


def _source_ref_lookup_cause(source_ref_read, sources):
    return {
        "kind": "source_unresolved",
        "target": source_ref_read["location"],
        "left": {"tag": "original", "read": copy.deepcopy(source_ref_read)},
        "right": {
            "tag": "original",
            "read": _present("/sources", sources),
        },
        "rule_pointer": (
            "/f05_detail_contract/field_content_source_failure_writer_contract/writers/0"
        ),
    }


def _body_payload_mismatch_cause(record, record_pointer, body_pointer, payload_read):
    return {
        "kind": "source_body_mismatch",
        "target": _location(f"{body_pointer}/payload"),
        "left": {
            "tag": "original",
            "read": _present(record_pointer, record),
        },
        "right": {"tag": "original", "read": copy.deepcopy(payload_read)},
        "rule_pointer": (
            "/f05_detail_contract/field_content_source_failure_writer_contract/writers/1"
        ),
    }


def _record_occurrences_for_operand(
    input_value,
    source_observations,
    requested_ref,
    requested_binding,
    collections=_SOURCE_RECORD_COLLECTIONS,
    match_binding=True,
):
    """Build fully linked record/body occurrences for a resolved Ref operand."""
    source_rows = source_observations["source_occurrences"]
    result = []
    for collection, index, record in _matching_record_rows(
        input_value,
        requested_ref,
        requested_binding,
        collections=collections,
        match_binding=match_binding,
    ):
        record_pointer = f"/{collection}/{index}"
        record_ref = record.get("ref")
        source_ref = record.get("source_ref")
        source_ref_read = _member_read(record, record_pointer, "source_ref")
        observation_indices = [
            observation_index
            for observation_index, observation in enumerate(source_rows)
            if _ref_relation(source_ref, observation["original_source"].get("ref"))
            == "corresponding"
        ]
        if not observation_indices:
            sources = input_value.get("sources")
            if (
                source_ref_read.get("tag") != "present"
                or source_ref is None
                or not isinstance(source_ref, dict)
                or not isinstance(sources, list)
            ):
                raise NotImplementedError(
                    "WR154-P2 F03 source-unresolved cause is pending"
                )
            matching_envelopes = [
                source
                for source in sources
                if isinstance(source, dict)
                and _ref_relation(source_ref, source.get("ref")) == "corresponding"
            ]
            if matching_envelopes:
                raise NotImplementedError(
                    "WR154-P2 F03 source-unresolved cause is pending"
                )
            lookup_cause = _source_ref_lookup_cause(
                source_ref_read, sources
            )
            record_causes = [lookup_cause]
        else:
            record_causes = []

        body_occurrences = []
        for observation_index in observation_indices:
            observation = source_rows[observation_index]
            source_index = observation["source_index"]
            sources = input_value.get("sources")
            if not isinstance(sources, list) or source_index >= len(sources):
                raise NotImplementedError(
                    "WR154-P2 F03 source occurrence mapping is pending"
                )
            source = sources[source_index]
            source_body = source.get("body")
            if not isinstance(source_body, dict):
                continue
            body_rows = _body_rows_for_record_ref(source_body, collection, record)
            if not body_rows:
                raise NotImplementedError("WR154-R2-STOP-F05-BODY-ENTRY-ABSENT-01")
            body_records = source_body["records"]
            expected_payload = {
                key: copy.deepcopy(value)
                for key, value in record.items()
                if key != "source_ref"
            }
            for body_index, entry in body_rows:
                body_pointer = f"/sources/{source_index}/body/records/{body_index}"
                if "payload" not in entry:
                    raise NotImplementedError(
                        "WR154-P2 F04 body-mismatch cause is pending"
                    )
                payload_read = _present(f"{body_pointer}/payload", entry["payload"])
                payload_relation = (
                    "corresponding"
                    if _json_equal(expected_payload, entry["payload"])
                    else "different"
                )
                causes = (
                    []
                    if payload_relation == "corresponding"
                    else [
                        _body_payload_mismatch_cause(
                            record, record_pointer, body_pointer, payload_read
                        )
                    ]
                )
                record_causes.extend(copy.deepcopy(causes))
                body_occurrences.append(
                    {
                        "source_observation_index": observation_index,
                        "source_index": source_index,
                        "source_locator": _location(f"/sources/{source_index}"),
                        "source_ref": copy.deepcopy(source["ref"]),
                        "body_index": body_index,
                        "body_locator": _location(body_pointer),
                        "original_body_entry": copy.deepcopy(entry),
                        "collection_read": _present(
                            f"/sources/{source_index}/body/records", body_records
                        ),
                        "ref_read": _present(f"{body_pointer}/ref", entry["ref"]),
                        "payload_read": payload_read,
                        "payload_relation": payload_relation,
                        "checks": [],
                        "causes": causes,
                    }
                )

        tag = {
            "axis_facts": "axis_fact",
            "semantic_records": "semantic_record",
            "obligations": "obligation",
            "conditions": "condition",
        }.get(collection, "semantic_record")
        result.append(
            {
                "origin": {
                    "collection": collection,
                    "index": index,
                    "locator": _location(record_pointer),
                },
                "original_record": {"tag": tag, "value": copy.deepcopy(record)},
                "ref_read": _member_read(record, record_pointer, "ref"),
                "binding_read": _member_read(record, record_pointer, "binding"),
                "source_ref_read": source_ref_read,
                "ref_relation": _ref_relation(requested_ref, record_ref),
                "binding_relation": (
                    "unestablished"
                    if not match_binding and "binding" not in record
                    else (
                        "corresponding"
                        if _json_equal(requested_binding, record.get("binding"))
                        else "different"
                    )
                ),
                "source_observation_indices": observation_indices,
                "body_occurrences": body_occurrences,
                "owner_bindings": [],
                "causes": record_causes,
            }
        )
    return result


def _qualification_check_links_for_source_observation(
    source_observation_index, source_observation
):
    """Return every existing source/qualification/root check at local indexes."""
    links = []

    def append_checks(qualification_index, root_index, checks):
        for check_index, _check in enumerate(checks):
            links.append(
                {
                    "source_observation_index": source_observation_index,
                    "qualification_occurrence_index": qualification_index,
                    "root_occurrence_index": root_index,
                    "check_index": check_index,
                }
            )

    append_checks(None, None, source_observation["checks"])
    for qualification_index, qualification in enumerate(
        source_observation["qualification_occurrences"]
    ):
        append_checks(qualification_index, None, qualification["checks"])
        for root_index, root in enumerate(qualification["root_occurrences"]):
            append_checks(qualification_index, root_index, root["checks"])
    return links
