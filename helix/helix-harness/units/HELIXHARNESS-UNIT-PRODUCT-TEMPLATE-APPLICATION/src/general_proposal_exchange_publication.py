"""Publication writer (P0..P6) and port adapters for FN13 general proposal exchange."""

import copy
import hashlib
import json

from general_proposal_exchange_body import build_general_original_operation_proposal


def supply_core_proposal_publication_header(header_request):
    """Port P1: Supply CORE proposal publication header from PublicationHeaderRequest."""
    op_src_ref = header_request["operation_source_ref"]
    op_sub_ref = header_request["operation_subject_ref"]
    owner = header_request["operation_owner"]
    scope = copy.deepcopy(
        op_src_ref.get(
            "scope",
            {
                "product": "HELIX-HARNESS",
                "project": "default",
                "tenant": "default",
                "environment": "default",
            },
        )
    )
    return {
        "source_ref": {
            "scope": copy.deepcopy(scope),
            "kind": "source",
            "identity": f"{op_src_ref['identity']}::published",
            "revision": "pub1",
            "owner": owner,
        },
        "subject_ref": {
            "scope": copy.deepcopy(scope),
            "kind": "subject",
            "identity": f"{op_sub_ref['identity']}::published",
            "revision": "pub1",
            "owner": owner,
        },
        "qualification_ref": {
            "scope": copy.deepcopy(scope),
            "kind": "qualification",
            "identity": f"{op_src_ref['identity']}::qual-published",
            "revision": "pub1",
            "owner": owner,
        },
        "owner": owner,
    }


def supply_core_proposal_publication_authority(authority_request):
    """Port P4: Supply CORE proposal publication authority from PublicationAuthorityRequest."""
    hdr = authority_request["header"]
    src_ref = hdr["source_ref"]
    sub_ref = hdr["subject_ref"]
    qual_ref = hdr["qualification_ref"]
    owner = hdr["owner"]
    root_ref = {
        "scope": copy.deepcopy(src_ref["scope"]),
        "kind": "authority_root",
        "identity": f"{qual_ref['identity']}::root",
        "revision": qual_ref["revision"],
        "owner": owner,
    }
    return {
        "qualifications": [
            {
                "qualification_ref": copy.deepcopy(qual_ref),
                "source_ref": copy.deepcopy(src_ref),
                "source_sha256": authority_request["source_sha256"],
                "subject_ref": copy.deepcopy(sub_ref),
                "section_key": "F02",
                "record_kind": "core_proposal_exchange",
                "issuer": owner,
                "authority_root_ref": copy.deepcopy(root_ref),
            }
        ],
        "qualification_roots": [copy.deepcopy(root_ref)],
    }


def _extract_binding_observation(general_view):
    """Build OptionalBindingObservation from native_dispatch validated input if present."""
    nd = general_view["attempt_capture"]["native_dispatch"]
    if nd.get("tag") != "returned":
        return {"tag": "absent"}
    nd_val = nd.get("value", {})
    if nd_val.get("tag") != "formed":
        return {"tag": "absent"}
    caller_ret = (
        nd_val.get("value", {})
        .get("capture", {})
        .get("capture", {})
        .get("caller_return", {})
    )
    validated = caller_ret.get("validation", {}).get("validated", {})
    val_in = validated.get("input") if isinstance(validated, dict) else None
    if isinstance(val_in, dict) and isinstance(val_in.get("binding"), dict):
        return {
            "tag": "present",
            "location": {
                "pointer": "/attempt_capture/native_dispatch/value/value/capture/capture/caller_return/validation/validated/input/binding"
            },
            "value": copy.deepcopy(val_in["binding"]),
        }
    return {"tag": "absent"}


def publish_general_proposal_exchange(request):
    """Execute P0..P6 to build GeneralProposalPublicationReturn from RawProviderRequest."""
    req = copy.deepcopy(request)
    general_view = build_general_original_operation_proposal(req)

    if general_view["proposed_body"].get("tag") != "formed":
        blocked = [{"pointer": "/general_view/proposed_body"}]
        return {
            "general_view": general_view,
            "header_port": {
                "tag": "not_called",
                "blocked_by": copy.deepcopy(blocked),
            },
            "header_decode": {
                "tag": "unreached",
                "diagnostic_refs": copy.deepcopy(blocked),
            },
            "authority_port": {
                "tag": "not_called",
                "blocked_by": copy.deepcopy(blocked),
            },
            "source_candidate": {
                "tag": "unreached",
                "diagnostic_refs": copy.deepcopy(blocked),
            },
            "publication_issues": [],
        }

    op_idx = req["operation_source_occurrence_index"]
    op_src_occ = req["source_occurrences"][op_idx]
    op_role = general_view["attempt_capture"]["operation_role"]
    header_request = {
        "operation_source_ref": copy.deepcopy(op_src_occ["source_ref"]),
        "operation_subject_ref": copy.deepcopy(
            op_role["selected_record"]["subject_ref"]
        ),
        "operation_owner": op_src_occ["owner"],
        "operation_binding_observation": _extract_binding_observation(general_view),
        "proposed_source": copy.deepcopy(op_role["frame"]["proposed_source"]),
    }

    try:
        raw_hdr = supply_core_proposal_publication_header(copy.deepcopy(header_request))
    except LookupError:
        hp_ref = [{"pointer": "/header_port"}]
        return {
            "general_view": general_view,
            "header_port": {"tag": "unavailable", "request": header_request},
            "header_decode": {
                "tag": "unreached",
                "diagnostic_refs": copy.deepcopy(hp_ref),
            },
            "authority_port": {
                "tag": "not_called",
                "blocked_by": copy.deepcopy(hp_ref),
            },
            "source_candidate": {
                "tag": "unformed",
                "diagnostic_refs": copy.deepcopy(hp_ref),
            },
            "publication_issues": [
                {
                    "path": "header_port",
                    "state": "unavailable",
                    "detail": "原owner header portの供給がない。",
                    "backflow_owner": "CORE",
                    "axis": "publication_header",
                    "related_source_refs": [],
                }
            ],
        }
    except TimeoutError:
        hp_ref = [{"pointer": "/header_port"}]
        return {
            "general_view": general_view,
            "header_port": {"tag": "return_unobserved", "request": header_request},
            "header_decode": {
                "tag": "unreached",
                "diagnostic_refs": copy.deepcopy(hp_ref),
            },
            "authority_port": {
                "tag": "not_called",
                "blocked_by": copy.deepcopy(hp_ref),
            },
            "source_candidate": {
                "tag": "unformed",
                "diagnostic_refs": copy.deepcopy(hp_ref),
            },
            "publication_issues": [
                {
                    "path": "header_port",
                    "state": "return_unobserved",
                    "detail": "原owner header portは呼出済みだが返却を観測していない。",
                    "backflow_owner": "CORE",
                    "axis": "publication_header",
                    "related_source_refs": [],
                }
            ],
        }

    header_port = {
        "tag": "returned",
        "request": header_request,
        "raw_return": copy.deepcopy(raw_hdr),
    }
    header_decode = {"tag": "formed", "value": copy.deepcopy(raw_hdr)}

    pub_record = {
        "subject_ref": copy.deepcopy(raw_hdr["subject_ref"]),
        "section_key": "F02",
        "record_kind": "core_proposal_exchange",
        "payload": {
            "original_trace_section": copy.deepcopy(
                general_view["proposed_body"]["value"]
            ),
            "evidence": copy.deepcopy(general_view),
        },
        "owner": raw_hdr["owner"],
    }
    source_json_utf8 = json.dumps(
        {"records": [pub_record]}, ensure_ascii=False, separators=(",", ":")
    )
    source_sha256 = hashlib.sha256(source_json_utf8.encode("utf-8")).hexdigest()

    authority_request = {
        "header": copy.deepcopy(raw_hdr),
        "source_json_utf8": source_json_utf8,
        "source_sha256": source_sha256,
        "record": copy.deepcopy(pub_record),
    }

    try:
        raw_auth = supply_core_proposal_publication_authority(
            copy.deepcopy(authority_request)
        )
    except LookupError:
        ap_ref = [{"pointer": "/authority_port"}]
        return {
            "general_view": general_view,
            "header_port": header_port,
            "header_decode": header_decode,
            "authority_port": {"tag": "unavailable", "request": authority_request},
            "source_candidate": {
                "tag": "unformed",
                "diagnostic_refs": copy.deepcopy(ap_ref),
            },
            "publication_issues": [
                {
                    "path": "authority_port",
                    "state": "unavailable",
                    "detail": "原owner authority portの供給がない。",
                    "backflow_owner": "CORE",
                    "axis": "publication_authority",
                    "source_ref": copy.deepcopy(raw_hdr["source_ref"]),
                    "related_source_refs": [],
                }
            ],
        }
    except TimeoutError:
        ap_ref = [{"pointer": "/authority_port"}]
        return {
            "general_view": general_view,
            "header_port": header_port,
            "header_decode": header_decode,
            "authority_port": {
                "tag": "return_unobserved",
                "request": authority_request,
            },
            "source_candidate": {
                "tag": "unformed",
                "diagnostic_refs": copy.deepcopy(ap_ref),
            },
            "publication_issues": [
                {
                    "path": "authority_port",
                    "state": "return_unobserved",
                    "detail": "原owner authority portは呼出済みだが返却を観測していない。",
                    "backflow_owner": "CORE",
                    "axis": "publication_authority",
                    "source_ref": copy.deepcopy(raw_hdr["source_ref"]),
                    "related_source_refs": [],
                }
            ],
        }

    authority_port = {
        "tag": "returned",
        "request": authority_request,
        "raw_return": copy.deepcopy(raw_auth),
    }
    source_candidate = {
        "tag": "formed",
        "value": {
            "source_ref": copy.deepcopy(raw_hdr["source_ref"]),
            "owner": raw_hdr["owner"],
            "source_json_utf8": source_json_utf8,
            "source_sha256": source_sha256,
            "decoded_raw_records": [copy.deepcopy(pub_record)],
            "qualification_ref": copy.deepcopy(raw_hdr["qualification_ref"]),
            "qualifications": copy.deepcopy(raw_auth["qualifications"]),
            "qualification_roots": copy.deepcopy(raw_auth["qualification_roots"]),
        },
    }

    return {
        "general_view": general_view,
        "header_port": header_port,
        "header_decode": header_decode,
        "authority_port": authority_port,
        "source_candidate": source_candidate,
        "publication_issues": [],
    }
