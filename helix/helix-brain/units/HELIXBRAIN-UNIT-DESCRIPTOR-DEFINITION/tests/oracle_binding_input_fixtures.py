"""FN4 rule 71/72用のtyped subject/obligation/oracle join入力を組み立てる。

L4 /oracle_view_boundary_contract/oracle_binding_correspondence と
/rule_projection_table/71..72、L5 OracleBinding/MeaningFactの既存Refだけを使う。
MeaningFact.meaning内のfixture追加keyは読まず、source mirrorとfn0資格chainを同期する。
"""

from __future__ import annotations

import copy
import hashlib
import json

from supply_input_fixtures import base_input, load_document


def _json_bytes(value):
    return json.dumps(value, ensure_ascii=False, separators=(",", ":")).encode("utf-8")


def _same_ref(left, right):
    return isinstance(left, dict) and isinstance(right, dict) and all(
        left.get(key) == right.get(key)
        for key in ("identity", "revision", "scope", "owner", "source_locator", "sha256")
    )


def _source_by_ref(raw, ref):
    matches = [row for row in raw["sources"] if _same_ref(row.get("ref"), ref)]
    if len(matches) != 1:
        raise ValueError("typed witness source Ref must resolve to one source")
    return matches[0]


def _qualification_for(raw, source):
    matches = [
        row for row in raw["qualifications"]
        if _same_ref(row.get("ref"), source.get("qualification_ref"))
    ]
    if source.get("qualification_ref") is None or len(matches) != 1:
        raise ValueError("source must have one matching Qualification")
    return matches[0]


def _rewrite_qualified_source_body(raw, source, content):
    """同じ原sourceのbody/bytes/digest/Qualification subjectを一括同期する。"""
    old_ref = copy.deepcopy(source["ref"])
    encoded = _json_bytes(content)
    digest = hashlib.sha256(encoded).hexdigest()
    source["content"] = copy.deepcopy(content)
    source["content_bytes"] = encoded.decode("utf-8")
    source["ref"]["sha256"] = digest
    qualification = _qualification_for(raw, source)
    qualification["subject_ref"] = copy.deepcopy(source["ref"])
    qualification["subject_sha256"] = digest

    # The owner KnowledgeRecord's provenance is a separate typed link to the
    # same source occurrence; update matching occurrences without deduplication.
    for record in raw["knowledge_records"]:
        if not isinstance(record.get("provenance_refs"), list):
            continue
        record["provenance_refs"] = [
            copy.deepcopy(source["ref"]) if _same_ref(ref, old_ref) else ref
            for ref in record["provenance_refs"]
        ]
    return old_ref, copy.deepcopy(source["ref"])


def _other_ref(ref, identity):
    result = copy.deepcopy(ref)
    result["identity"] = identity
    return result


def _slot_and_fact(raw, kind):
    slots = [row for row in raw["descriptors"] if row["descriptor_kind"] == kind]
    if len(slots) != 1 or len(slots[0]["facts"]) != 1:
        raise ValueError(f"normal input must have one {kind} slot/fact")
    return slots[0], slots[0]["facts"][0]


def oracle_binding_rule_input(rule):
    """Return an independent fn0-valid candidate for R71 or R72."""
    if rule not in {"unrelated_measurement", "completion_oracle_revision"}:
        raise ValueError("rule must select one of the two FN4 typed joins")

    raw = base_input(load_document())
    raw_before = copy.deepcopy(raw)
    oracle_rows = raw.get("oracle_bindings")
    if not isinstance(oracle_rows, list) or len(oracle_rows) != 1:
        raise ValueError("normal input requires its single typed OracleBinding")
    oracle_binding = oracle_rows[0]
    source = _source_by_ref(raw, oracle_binding["source_ref"])
    mirrored_rows = source.get("content", {}).get("oracle_bindings")
    if not isinstance(mirrored_rows, list) or len(mirrored_rows) != 1:
        raise ValueError("qualified oracle source requires one mirror OracleBinding row")
    mirrored = mirrored_rows[0]
    if "source_ref" in mirrored:
        raise ValueError("source-body OracleBinding mirror must not self-reference its source digest")

    if rule == "unrelated_measurement":
        slot, fact = _slot_and_fact(raw, "measurement")
        oracle_binding["subject_ref"] = copy.deepcopy(fact["ref"])
        oracle_binding["obligation_ref"] = _other_ref(
            fact["binding"]["requirement_ref"], "SYNTHETIC-UNRELATED-OBLIGATION"
        )
    else:
        slot, fact = _slot_and_fact(raw, "completion")
        oracle_binding["subject_ref"] = copy.deepcopy(fact["ref"])
        oracle_binding["obligation_ref"] = copy.deepcopy(fact["binding"]["requirement_ref"])
        oracle_binding["oracle_ref"] = copy.deepcopy(oracle_binding["oracle_ref"])
        oracle_binding["oracle_ref"]["revision"] = "synthetic-other-oracle-revision"

    # The nested owner-body record mirrors only its original typed fields.
    # Its source_ref is absent by schema/payload shape, avoiding a digest cycle;
    # the typed top-level OracleBinding gets the final source Ref after hashing.
    # It is not interpreted from MeaningFact.meaning.
    for key in mirrored:
        if key in oracle_binding:
            mirrored[key] = copy.deepcopy(oracle_binding[key])
    old_source_ref, new_source_ref = _rewrite_qualified_source_body(
        raw, source, source["content"]
    )
    oracle_binding["source_ref"] = copy.deepcopy(new_source_ref)

    # Keep the input fact's oracle version as the completion's typed comparison
    # value for R72; the separate OracleBinding carries the requested version.
    if rule == "completion_oracle_revision":
        if oracle_binding["oracle_ref"]["revision"] == fact["oracle_ref"]["revision"]:
            raise AssertionError("setup: completion and requested oracle revisions must differ")

    # The only deliberate changes are the selected typed OracleBinding tuple
    # and the same source's synchronized digest/qualification/provenance links.
    if len(raw["descriptors"]) != len(raw_before["descriptors"]):
        raise AssertionError("setup: preserve all descriptor facts")
    for index, (before, after) in enumerate(zip(raw_before["descriptors"], raw["descriptors"])):
        if before["descriptor_kind"] not in {"measurement", "completion"}:
            if before["facts"] != after["facts"]:
                raise AssertionError(f"setup: unrelated descriptor fact changed at {index}")
    return raw, raw_before, slot, fact, oracle_binding, source, old_source_ref, new_source_ref
