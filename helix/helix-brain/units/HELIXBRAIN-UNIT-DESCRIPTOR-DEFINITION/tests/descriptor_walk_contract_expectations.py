"""L4/L5からFN1 walk期待の部分構造を独立構成するtest support。"""

from __future__ import annotations

import copy
import json
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[5]
L4_PATH = REPO_ROOT / "docs/helix-brain/L4-basic-design/template-semantic-supply.json"
KIND_ORDER = tuple(
    entry["value"]["descriptor"]
    for entry in json.loads(L4_PATH.read_text(encoding="utf-8"))["definition_meaning_resolution_contract"]["normative_basis_snapshot"]["entries"]
)

AXIS_FIELDS = {
    "subject_ref", "binding", "axis", "state", "original_refs", "reason", "backflow_owner",
}
ASSESSMENT_FIELDS = {
    "key", "state", "origin_branch", "slot_locators", "fact_locators",
    "comparison_axis_indices", "comparison_finding_indices", "original_axes", "axis_name",
}
ORIGIN_FIELDS = {
    "ordinal", "assessment_key", "branch", "state", "cause", "slot_locators",
    "fact_locators", "meaning_read_indices", "applicability_read_indices", "subject_ref",
    "binding", "axis_name", "original_refs", "reason", "backflow_owner",
    "finding_rule_indices", "sort_source_refs", "special_read_indices", "pair_origin_links",
    "applicability_judgment_links", "meaning_support_links", "meaning_problem_links",
    "special_support_links",
}
NATIVE_FIELDS = {
    "meaning_reads", "applicability_reads", "special_reads", "judgment_origins",
    "pair_reads", "applicability_judgment_batches", "meaning_read_origins",
}
NATIVE_MEANING_FIELDS = {
    "slot_locator", "fact_locator", "binding", "normative_frame", "acquisition_state",
    "occurrences", "supports", "problems",
}
NATIVE_PROBLEM_FIELDS = {
    "cause", "source_ref", "source_index", "locator", "original_value", "reason",
}
NATIVE_APPLICABILITY_FIELDS = {
    "slot_locator", "request", "acquisition_state", "source_occurrences", "supports", "problems",
}
NATIVE_APPLICABILITY_JUDGMENT_FIELDS = {
    "state", "origin_branch", "cause", "axis", "reason", "source_refs", "subject_ref",
    "binding", "backflow_owner", "slot_locator", "record_locator",
}


def presence(value, supplied=True):
    return {"presence": "supplied", "value": copy.deepcopy(value)} if supplied else {"presence": "absent"}


def _canonical(value):
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":"))


def _sort_refs(values):
    return sorted((copy.deepcopy(value) for value in values if isinstance(value, dict)), key=_canonical)


def _component(value, supplied=True):
    return (1, _canonical(value)) if supplied else (0, "")


def _path_presence(container, member):
    if not isinstance(container, dict) or member not in container:
        return None, False
    return container[member], True


def _axis_sort_key(event):
    origin = event["origin"]
    binding = origin["binding"]
    binding_value = binding.get("value") if binding.get("presence") == "supplied" else None
    template_ref = binding_value.get("template_ref") if isinstance(binding_value, dict) else None
    knowledge_ref = binding_value.get("knowledge_ref") if isinstance(binding_value, dict) else None
    template_identity, has_template_identity = _path_presence(template_ref, "identity")
    template_revision, has_template_revision = _path_presence(template_ref, "revision")
    knowledge_identity, has_knowledge_identity = _path_presence(knowledge_ref, "identity")
    knowledge_revision, has_knowledge_revision = _path_presence(knowledge_ref, "revision")
    slot_presence = origin["assessment_key"]["slot_identity"]
    source_presence = origin["sort_source_refs"]
    axis = event["axis"]["axis"]
    return (
        _component(template_identity, has_template_identity),
        _component(template_revision, has_template_revision),
        _component(knowledge_identity, has_knowledge_identity),
        _component(knowledge_revision, has_knowledge_revision),
        _component(slot_presence.get("value"), slot_presence.get("presence") == "supplied"),
        _component(source_presence.get("value"), source_presence.get("presence") == "supplied"),
        _component(axis),
    )


def _normative_snapshot():
    l4 = json.loads(L4_PATH.read_text(encoding="utf-8"))
    return l4["definition_meaning_resolution_contract"]["normative_basis_snapshot"]


def _normative_frame(kind):
    snapshot = _normative_snapshot()
    entry = next(row for row in snapshot["entries"] if row["value"]["descriptor"] == kind)
    return {
        "revision": snapshot["revision"],
        "path": snapshot["path"],
        "file_sha256": snapshot["file_sha256"],
        "catalog_pointer": snapshot["pointer"],
        "catalog_canonical_sha256": snapshot["canonical_sha256"],
        "scope": copy.deepcopy(snapshot["scope"]),
        "entry_pointer": entry["pointer"],
        "entry_canonical_sha256": entry["canonical_sha256"],
        "entry_value": copy.deepcopy(entry["value"]),
    }


def _key(slot):
    return {
        "binding": presence(slot.get("binding"), "binding" in slot),
        "slot_identity": presence(slot.get("slot_identity"), "slot_identity" in slot),
        "descriptor_kind": copy.deepcopy(slot["descriptor_kind"]),
    }


def _problem(source, source_index, cause):
    if cause == "source_unresolved":
        return {
            "cause": cause,
            "source_ref": presence(source["ref"]),
            "source_index": source_index,
            "locator": f"/sources/{source_index}",
            "original_value": presence(source),
            "reason": "当該原source又はその既存owner資格を解決できない。",
        }
    if cause == "container_absent":
        return {
            "cause": cause,
            "source_ref": presence(source["ref"]),
            "source_index": source_index,
            "locator": f"/sources/{source_index}/content/definition_meaning_operations",
            "original_value": {"presence": "absent"},
            "reason": "当該原sourceの要求されたcarrier memberが供給されていない。",
        }
    raise ValueError(f"unsupported expected meaning problem cause: {cause}")


def _axis_event(
    *, axis, slot, slot_locator, fact_locators, cause, branch, sort_refs,
    meaning_read_indices=(), applicability_read_indices=(),
    applicability_judgment_links=(), meaning_problem_links=(),
):
    key = _key(slot)
    event = {
        "axis": copy.deepcopy(axis),
        "sort_source_refs": presence(_sort_refs(sort_refs)),
        "ordinal": None,
    }
    event["assessment"] = {
        "key": key,
        "state": copy.deepcopy(axis["state"]),
        "origin_branch": branch,
        "slot_locators": [slot_locator],
        "fact_locators": list(fact_locators),
        "comparison_axis_indices": [],
        "comparison_finding_indices": [],
        "original_axes": [],
        "axis_name": axis["axis"],
    }
    event["origin"] = {
        "ordinal": None,
        "assessment_key": copy.deepcopy(key),
        "branch": branch,
        "state": copy.deepcopy(axis["state"]),
        "cause": cause,
        "slot_locators": [slot_locator],
        "fact_locators": list(fact_locators),
        "meaning_read_indices": list(meaning_read_indices),
        "applicability_read_indices": list(applicability_read_indices),
        "subject_ref": presence(axis["subject_ref"]),
        "binding": presence(axis["binding"]),
        "axis_name": axis["axis"],
        "original_refs": copy.deepcopy(axis["original_refs"]),
        "reason": copy.deepcopy(axis["reason"]),
        "backflow_owner": copy.deepcopy(axis["backflow_owner"]),
        "finding_rule_indices": [],
        "sort_source_refs": copy.deepcopy(event["sort_source_refs"]),
        "special_read_indices": [],
        "pair_origin_links": [],
        "applicability_judgment_links": copy.deepcopy(list(applicability_judgment_links)),
        "meaning_support_links": [],
        "meaning_problem_links": copy.deepcopy(list(meaning_problem_links)),
        "special_support_links": [],
    }
    return event


def expected_walk(raw, attribution_comparison, meaning_problem_specs):
    """L4/L5の独立部分期待を構成する（current walk outputを参照しない）。

    `meaning_problem_specs[(slot_index, fact_index)]` is an ordered tuple of
    `(source_index, cause)` selected from the documented source-unresolved and
    container-absent populations.
    """
    slots_by_kind = sorted(
        enumerate(raw["descriptors"]),
        key=lambda pair: (KIND_ORDER.index(pair[1]["descriptor_kind"]), pair[0]),
    )
    attr_rows = [row for row in attribution_comparison["axes"] if row["axis"] == "descriptor.attribution"]
    meanings = []
    meaning_origins = []
    applicability_reads = []
    applicability_batches = []
    pair_reads = []
    events = []

    for slot_index, slot in slots_by_kind:
        slot_locator = f"/descriptors/{slot_index}"
        kind = slot["descriptor_kind"]
        for fact_index, fact in enumerate(slot["facts"]):
            fact_locator = f"{slot_locator}/facts/{fact_index}"
            attr_matches = [
                row for row in attr_rows
                if row["subject_ref"] == fact["ref"] and row["binding"] == slot["binding"]
            ]
            if len(attr_matches) != 1:
                raise AssertionError(
                    f"L5 helper alignment expected one existing attribution axis for {fact_locator}, got {len(attr_matches)}"
                )
            attr_axis = copy.deepcopy(attr_matches[0])
            if set(attr_axis) != AXIS_FIELDS:
                raise AssertionError("the unchanged public fn1 attribution helper must retain its seven-field AxisResult")
            events.append(_axis_event(
                axis=attr_axis,
                slot=slot,
                slot_locator=slot_locator,
                fact_locators=[fact_locator],
                cause="owner_descriptor_attribution",
                branch="existing_definition_result",
                sort_refs=[fact["source_ref"]] if isinstance(fact.get("source_ref"), dict) else [],
            ))

            read_index = len(meanings)
            native_problems = [
                _problem(raw["sources"][source_index], source_index, cause)
                for source_index, cause in meaning_problem_specs[(slot_index, fact_index)]
            ]
            meanings.append({
                "slot_locator": slot_locator,
                "fact_locator": fact_locator,
                "binding": presence(slot["binding"]),
                "normative_frame": _normative_frame(kind),
                "acquisition_state": "unknown",
                "occurrences": [],
                "supports": [],
                "problems": copy.deepcopy(native_problems),
            })
            meaning_origins.append({
                "meaning_read_index": read_index,
                "problem_scopes": [
                    {"problem_index": problem_index, "relevance": "target"}
                    for problem_index in range(len(native_problems))
                ],
                "support_origins": [],
            })

            for problem_index, problem in enumerate(native_problems):
                # The public source/reference column follows L5 per_fact_definition:
                # fact.ref, fact.source_ref, then read occurrence refs. Problems
                # remain linked by their native indexes instead of being cast here.
                original_refs = [copy.deepcopy(fact["ref"]), copy.deepcopy(fact["source_ref"])]
                axis = {
                    "subject_ref": copy.deepcopy(fact["ref"]),
                    "binding": copy.deepcopy(slot["binding"]),
                    "axis": f"{kind}.definition",
                    "state": "unknown",
                    "original_refs": original_refs,
                    "reason": "当該原意味のsource又は規範に対するowner原解釈を解決できない。元原因と所在を保持する。",
                    "backflow_owner": slot["binding"]["knowledge_ref"]["owner"],
                }
                # L5 serialization_completion/sort_source_ref_column is the
                # fact source Ref followed by read.occurrences source_refs only.
                # A source_unresolved problem keeps its own source_ref in native
                # material/link but is not merged into this independent column.
                source_refs = [fact["source_ref"]] if isinstance(fact.get("source_ref"), dict) else []
                events.append(_axis_event(
                    axis=axis,
                    slot=slot,
                    slot_locator=slot_locator,
                    fact_locators=[fact_locator],
                    cause="required_source_or_interpretation_unresolved",
                    branch="source_unresolved",
                    sort_refs=source_refs,
                    meaning_read_indices=[read_index],
                    meaning_problem_links=[
                        {"meaning_read_index": read_index, "problem_index": problem_index}
                    ],
                ))

        pair_reads.append({
            "slot_locator": slot_locator,
            "result": {"axes": [], "origins": []},
        })

        app_index = len(applicability_reads)
        app_read = {
            "slot_locator": slot_locator,
            "request": presence(None),
            "acquisition_state": "unknown",
            "source_occurrences": [],
            "supports": [],
            "problems": [{
                "cause": "applicability_request_null",
                "source_ref": {"presence": "absent"},
                "source_index": None,
                "locator": slot_locator + "/definition_applicability_ref",
                "original_value": presence(None),
                "reason": "定義非適用の原参照が明示nullであり、当該原判断を解決できない。",
            }],
        }
        applicability_reads.append(app_read)
        batch_index = len(applicability_batches)
        judgment = {
            "state": "unknown",
            "origin_branch": "source_unresolved",
            "cause": "applicability_request_null",
            "axis": f"{kind}.definition_applicability",
            "reason": "定義非適用の原参照が明示nullであり、当該原判断を解決できない。",
            "source_refs": [],
            "subject_ref": presence(slot["binding"]["knowledge_ref"]),
            "binding": presence(slot["binding"]),
            "backflow_owner": slot["binding"]["knowledge_ref"]["owner"],
            "slot_locator": slot_locator,
            "record_locator": None,
        }
        applicability_batches.append({
            "applicability_read_index": app_index,
            "slot_locator": slot_locator,
            "judgments": [copy.deepcopy(judgment)],
        })
        na_axis = {
            "subject_ref": copy.deepcopy(judgment["subject_ref"]["value"]),
            "binding": copy.deepcopy(judgment["binding"]["value"]),
            "axis": judgment["axis"],
            "state": judgment["state"],
            "original_refs": [],
            "reason": judgment["reason"],
            "backflow_owner": judgment["backflow_owner"],
        }
        events.append(_axis_event(
            axis=na_axis,
            slot=slot,
            slot_locator=slot_locator,
            fact_locators=[],
            cause="applicability_request_null",
            branch="source_unresolved",
            sort_refs=[],
            applicability_read_indices=[app_index],
            applicability_judgment_links=[{"batch_index": batch_index, "judgment_index": 0}],
        ))

    # L5 exact_sort_contract: seven component keys and stable event-ordinal tie.
    for ordinal, event in enumerate(events):
        event["ordinal"] = ordinal
        event["origin"]["ordinal"] = ordinal
    sorted_events = sorted(events, key=lambda event: (_axis_sort_key(event), event["ordinal"]))
    axis_index_by_ordinal = {
        event["ordinal"]: index for index, event in enumerate(sorted_events)
    }
    for event in events:
        axis_index = axis_index_by_ordinal[event["ordinal"]]
        event["assessment"]["comparison_axis_indices"] = [axis_index]
        event["assessment"]["original_axes"] = [copy.deepcopy(sorted_events[axis_index]["axis"])]

    native = {
        "meaning_reads": meanings,
        "applicability_reads": applicability_reads,
        "special_reads": [],
        "judgment_origins": [copy.deepcopy(event["origin"]) for event in events],
        "pair_reads": pair_reads,
        "applicability_judgment_batches": applicability_batches,
        "meaning_read_origins": meaning_origins,
    }
    comparison = {
        "axes": [copy.deepcopy(event["axis"]) for event in sorted_events],
        "findings": [],
        "producer_symbol": "compare_descriptor_definitions",
        "input_binding": copy.deepcopy(raw["binding"]),
    }
    return {
        "comparison": comparison,
        "assessments": [copy.deepcopy(event["assessment"]) for event in events],
        "native_material": native,
        "target_reads": [],
        "intent_reads": [],
    }
