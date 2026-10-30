"""Case input builders and independent L4/L5/L8/L9 expectation helpers for FN13."""

import copy
import hashlib
import json
from pathlib import Path
import sys
from unittest.mock import patch

UNIT_ROOT = Path(__file__).resolve().parents[1]
FIXTURE_PATH = UNIT_ROOT / "tests" / "fixtures" / "general_proposal_exchange.json"
sys.path.insert(0, str(UNIT_ROOT / "src"))
sys.path.insert(0, str(UNIT_ROOT / "tests"))

from application_applicability import compare_applicability  # noqa: E402
from application_candidate_universe import compare_candidate_universe  # noqa: E402
from application_required_axes import compare_required_axes  # noqa: E402
from application_validation_detail import validate_application_input_detail  # noqa: E402
import product_template_application  # noqa: E402
from test_application_input import (  # noqa: E402
    _fixture_normal_input,
    _input_for_recipe,
    _rebuild_source_graph,
)

with FIXTURE_PATH.open(encoding="utf-8") as _stream:
    GPE_FIXTURE = json.load(_stream)


def serialize_compact_utf8(obj):
    """Serialize JSON object preserving member/array order with compact separators."""
    text = json.dumps(obj, ensure_ascii=False, separators=(",", ":"))
    digest = hashlib.sha256(text.encode("utf-8")).hexdigest()
    return text, digest


def default_relation_occurrence():
    """Return a deep copy of the pinned default RelationOccurrence."""
    return copy.deepcopy(
        GPE_FIXTURE["operation_record_seed"]["relation_occurrences"][0]
    )


def build_base_request(
    validation_input=None,
    relation_occurrences=None,
    proposed_source=None,
    qualify_source1=False,
    contradict_source1_and_2=False,
):
    """Build a RawProviderRequest from pinned fixture seeds and caller parameters."""
    req = copy.deepcopy(GPE_FIXTURE["raw_provider_request_seed"])
    seed = copy.deepcopy(GPE_FIXTURE["operation_record_seed"])
    s1_lit = GPE_FIXTURE["target_source1_literal"]
    s2_lit = GPE_FIXTURE["target_source2_literal"]

    if validation_input is None:
        validation_input = {"tag": "native", "raw": _fixture_normal_input()}
    payload = {
        "caller_inputs": {
            "validation_input": copy.deepcopy(validation_input),
            "source_result_reference_projection": copy.deepcopy(
                seed["source_result_reference_projection"]
            ),
        },
        "proposed_source": copy.deepcopy(
            proposed_source if proposed_source is not None else seed["proposed_source"]
        ),
        "relation_occurrences": copy.deepcopy(
            relation_occurrences
            if relation_occurrences is not None
            else seed["relation_occurrences"]
        ),
    }
    op_body = {
        "records": [
            {
                "subject_ref": seed["subject_ref"],
                "section_key": seed["section_key"],
                "record_kind": seed["record_kind"],
                "payload": payload,
                "owner": seed["owner"],
            }
        ]
    }

    op_text, op_sha = serialize_compact_utf8(op_body)
    req["source_occurrences"][0]["source_json_utf8"] = op_text
    req["source_occurrences"][0]["source_sha256"] = op_sha
    req["qualification_inputs"][0]["source_sha256"] = op_sha
    req["qualification_root_inputs"][0]["allowed_source_sha256"] = op_sha

    req["source_occurrences"][1]["source_json_utf8"] = s1_lit["source_json_utf8"]
    req["source_occurrences"][1]["source_sha256"] = s1_lit["utf8_sha256"]
    req["source_occurrences"][2]["source_json_utf8"] = s2_lit["source_json_utf8"]
    req["source_occurrences"][2]["source_sha256"] = s2_lit["utf8_sha256"]

    if qualify_source1:
        s1_body = json.loads(s1_lit["source_json_utf8"])
        s1_body["records"][0]["subject_ref"]["identity"] = (
            "FIXTURE-F03-TWIN-DISTINCT-SUBJECT"
        )
        s1_body["records"][0]["payload"]["events"][0]["binding"]["template_ref"][
            "identity"
        ] = "T1-twin-conflict"
        s1_text, s1_sha = serialize_compact_utf8(s1_body)
        req["source_occurrences"][1]["source_json_utf8"] = s1_text
        req["source_occurrences"][1]["source_sha256"] = s1_sha
        q1 = copy.deepcopy(req["qualification_inputs"][1])
        q1["ref"]["identity"] = "QUAL-F03-SOURCE1-QUALIFIED"
        q1["root_ref"]["identity"] = "ROOT-F03-SOURCE1-QUALIFIED"
        q1["source_ref"] = copy.deepcopy(req["source_occurrences"][1]["source_ref"])
        q1["source_sha256"] = s1_sha
        q1["subject_refs"] = [copy.deepcopy(s1_body["records"][0]["subject_ref"])]
        r1 = copy.deepcopy(req["qualification_root_inputs"][1])
        r1["ref"]["identity"] = "ROOT-F03-SOURCE1-QUALIFIED"
        r1["allowed_source_sha256"] = s1_sha
        r1["allowed_subject_refs"] = [
            copy.deepcopy(s1_body["records"][0]["subject_ref"])
        ]
        req["source_occurrences"][1]["qualification_ref"] = copy.deepcopy(q1["ref"])
        req["qualification_inputs"].append(q1)
        req["qualification_root_inputs"].append(r1)

    if contradict_source1_and_2:
        s1_body = json.loads(s1_lit["source_json_utf8"])
        s2_body = json.loads(s2_lit["source_json_utf8"])
        extra_rec = copy.deepcopy(s2_body["records"][0])
        extra_rec["subject_ref"]["identity"] = "FIXTURE-F03-SURVIVING-RECORD"
        s2_body["records"].append(extra_rec)
        s2_text, s2_sha = serialize_compact_utf8(s2_body)
        req["source_occurrences"][2]["source_json_utf8"] = s2_text
        req["source_occurrences"][2]["source_sha256"] = s2_sha
        req["qualification_inputs"][1]["source_sha256"] = s2_sha
        req["qualification_inputs"][1]["subject_refs"].append(
            copy.deepcopy(extra_rec["subject_ref"])
        )
        req["qualification_root_inputs"][1]["allowed_source_sha256"] = s2_sha
        req["qualification_root_inputs"][1]["allowed_subject_refs"].append(
            copy.deepcopy(extra_rec["subject_ref"])
        )
        s1_sha = s1_lit["utf8_sha256"]
        q1 = copy.deepcopy(req["qualification_inputs"][1])
        q1["ref"]["identity"] = "QUAL-F03-CONTRADICT-A"
        q1["root_ref"]["identity"] = "ROOT-F03-CONTRADICT-A"
        q1["source_ref"] = copy.deepcopy(req["source_occurrences"][1]["source_ref"])
        q1["source_sha256"] = s1_sha
        q1["subject_refs"] = [copy.deepcopy(s1_body["records"][0]["subject_ref"])]
        r1 = copy.deepcopy(req["qualification_root_inputs"][1])
        r1["ref"]["identity"] = "ROOT-F03-CONTRADICT-A"
        r1["allowed_source_sha256"] = s1_sha
        r1["allowed_subject_refs"] = [
            copy.deepcopy(s1_body["records"][0]["subject_ref"])
        ]
        req["source_occurrences"][1]["qualification_ref"] = copy.deepcopy(q1["ref"])
        req["qualification_inputs"].append(q1)
        req["qualification_root_inputs"].append(r1)

    return req


def build_empty_universe_raw_input():
    """Build F02-qualified-empty raw application input from pinned recipe."""
    raw = _input_for_recipe("CORE-ADD-INPUT-09")
    raw["templates"] = []
    raw["application_policies"] = []
    _rebuild_source_graph(raw)
    return raw


def build_na_only_raw_input():
    """Build F03-valid-NA-only raw application input from pinned recipe."""
    return _input_for_recipe("CORE-NORMAL-UNIT-NA")


def build_mixed_na_candidate_raw_input():
    """Build Probe 0 mixed NA + required candidate raw application input."""
    raw = _input_for_recipe("CORE-NORMAL-UNIT-NA")
    sc2 = copy.deepcopy(_fixture_normal_input()["semantic_comparisons"][0])
    sc2["ref"]["identity"] = "SYNTHETIC-SC-valid-sibling"
    sc2["same_meaning"] = True
    raw["semantic_comparisons"].append(sc2)
    cond2 = copy.deepcopy(_fixture_normal_input()["conditions"][0])
    cond2["ref"]["identity"] = "SYNTHETIC-COND-valid-sibling"
    cond2["template_ref"]["identity"] = "SYNTHETIC-T-valid-sibling"
    cond2["semantic_comparison_ref"]["identity"] = "SYNTHETIC-SC-valid-sibling"
    raw["conditions"].append(cond2)
    t2 = copy.deepcopy(raw["templates"][0])
    t2["ref"]["identity"] = "SYNTHETIC-T-valid-sibling"
    raw["templates"].append(t2)
    m2 = copy.deepcopy(raw["universes"][0]["members"][0])
    m2["identity"] = "SYNTHETIC-T-valid-sibling"
    raw["universes"][0]["members"].append(m2)
    p2 = copy.deepcopy(raw["application_policies"][0])
    p2["ref"]["identity"] = "policy-sibling"
    p2["template_ref"]["identity"] = "SYNTHETIC-T-valid-sibling"
    p2["condition_refs"][0]["identity"] = "SYNTHETIC-COND-valid-sibling"
    raw["application_policies"].append(p2)
    _rebuild_source_graph(raw)
    return raw


def build_residual_valid_sibling_raw_input():
    """Build Case 10 F04-residual-valid-sibling raw application input."""
    raw = _fixture_normal_input()
    raw["conditions"][0]["semantic_comparison_ref"] = None
    raw["conditions"][0]["condition_value"] = None
    cond2 = copy.deepcopy(_fixture_normal_input()["conditions"][0])
    cond2["ref"]["identity"] = "SYNTHETIC-COND-valid-sibling"
    cond2["template_ref"]["identity"] = "SYNTHETIC-T-valid-sibling"
    raw["conditions"].append(cond2)
    m2 = copy.deepcopy(raw["universes"][0]["members"][0])
    m2["identity"] = "SYNTHETIC-T-valid-sibling"
    raw["universes"][0]["members"].append(m2)
    p2 = copy.deepcopy(raw["application_policies"][0])
    p2["ref"]["identity"] = "policy-sibling"
    p2["template_ref"]["identity"] = "SYNTHETIC-T-valid-sibling"
    p2["condition_refs"][0]["identity"] = "SYNTHETIC-COND-valid-sibling"
    raw["application_policies"].append(p2)
    _rebuild_source_graph(raw)
    return raw


def build_exactness_defect_raw_input():
    """Build Probe 6 exactness_defect raw input where member 0 template snapshot is absent."""
    raw = _fixture_normal_input()
    raw["templates"] = []
    _rebuild_source_graph(raw)
    return raw


def compute_upstream_comparisons(raw_input):
    """Run already-implemented FN0/FN1/FN2/FN3 to obtain upstream context objects."""
    val = validate_application_input_detail({"tag": "native", "raw": raw_input})
    c0 = compare_required_axes({"validated": val["validated"]})
    c1 = compare_candidate_universe(
        {"validated": val["validated"], "compare_required_axes": c0}
    )
    c2 = compare_applicability(
        {
            "validated": val["validated"],
            "compare_required_axes": c0,
            "compare_candidate_universe": c1,
        }
    )
    return val, c0, c1, c2


def call_fn13(
    testcase,
    request,
    header_port_mode="returned",
    authority_port_mode="returned",
    legacy_f02_only=False,
):
    """Invoke publish_general_proposal_exchange_public and verify effect=none."""
    func = getattr(
        product_template_application, "publish_general_proposal_exchange_public", None
    )
    if not callable(func):
        testcase.fail(
            "FN13 public publish_general_proposal_exchange_public is not implemented"
        )
    before = copy.deepcopy(request)
    patches = []
    if header_port_mode != "returned":
        patches.append(
            patch(
                "general_proposal_exchange_publication.supply_core_proposal_publication_header",
                side_effect=(
                    LookupError("header port unavailable")
                    if header_port_mode == "unavailable"
                    else TimeoutError("header port return_unobserved")
                ),
            )
        )
    if authority_port_mode != "returned":
        patches.append(
            patch(
                "general_proposal_exchange_publication.supply_core_proposal_publication_authority",
                side_effect=(
                    LookupError("authority port unavailable")
                    if authority_port_mode == "unavailable"
                    else TimeoutError("authority port return_unobserved")
                ),
            )
        )
    if legacy_f02_only:
        patches.append(
            patch(
                "general_proposal_exchange_native.compare_candidate_universe_detail",
                side_effect=lambda ctx: compare_candidate_universe(ctx),
            )
        )
    for p in patches:
        p.start()
    try:
        result = func(request)
    finally:
        for p in reversed(patches):
            p.stop()
    testcase.assertEqual(
        request, before, "FN13 must not mutate its input (effect=none)"
    )
    return result


def expected_body_issue(
    path, state, detail, backflow_owner, axis, source_ref, related_source_refs=None
):
    """Build an expected 7-member LocalIssue for body_issues."""
    return {
        "path": path,
        "state": state,
        "detail": detail,
        "backflow_owner": backflow_owner,
        "axis": axis,
        "source_ref": copy.deepcopy(source_ref),
        "related_source_refs": copy.deepcopy(related_source_refs or []),
    }


def expected_publication_issue(path, state, detail, axis, source_ref=None):
    """Build an expected LocalIssue for publication_issues with L5 member ordering."""
    issue = {
        "path": path,
        "state": state,
        "detail": detail,
        "backflow_owner": "CORE",
        "axis": axis,
    }
    if source_ref is not None:
        issue["source_ref"] = copy.deepcopy(source_ref)
    issue["related_source_refs"] = []
    return issue


def assert_public_endpoint_structure(testcase, pub):
    """Verify GeneralProposalPublicationReturn ordered members and candidate record."""
    testcase.assertEqual(
        list(pub.keys()),
        [
            "general_view",
            "header_port",
            "header_decode",
            "authority_port",
            "source_candidate",
            "publication_issues",
        ],
    )
    testcase.assertEqual(
        list(pub["general_view"].keys()),
        [
            "attempt_capture",
            "membership_capture",
            "universe_observation",
            "relation_observations",
            "proposed_body",
            "body_issues",
        ],
    )
    sc = pub["source_candidate"]
    testcase.assertEqual(sc["tag"], "formed")
    testcase.assertEqual(
        list(sc["value"].keys()),
        [
            "source_ref",
            "owner",
            "source_json_utf8",
            "source_sha256",
            "decoded_raw_records",
            "qualification_ref",
            "qualifications",
            "qualification_roots",
        ],
    )
    rec = sc["value"]["decoded_raw_records"][0]
    testcase.assertEqual(
        list(rec.keys()),
        ["subject_ref", "section_key", "record_kind", "payload", "owner"],
    )
    testcase.assertNotIn(
        "same_candidate_cross_mechanism_private_type_binding",
        json.dumps(pub, ensure_ascii=False),
    )


def assert_header_port_failure(testcase, pub, expected_state, expected_detail):
    """Verify F08 header port failure propagation and issue shape."""
    testcase.assertEqual(pub["general_view"]["proposed_body"]["tag"], "formed")
    testcase.assertEqual(pub["header_port"]["tag"], expected_state)
    testcase.assertIn("request", pub["header_port"])
    testcase.assertNotIn("raw_return", pub["header_port"])
    hp_ref = [{"pointer": "/header_port"}]
    testcase.assertEqual(
        pub["header_decode"], {"tag": "unreached", "diagnostic_refs": hp_ref}
    )
    testcase.assertEqual(
        pub["authority_port"], {"tag": "not_called", "blocked_by": hp_ref}
    )
    testcase.assertEqual(
        pub["source_candidate"], {"tag": "unformed", "diagnostic_refs": hp_ref}
    )
    testcase.assertEqual(
        pub["publication_issues"],
        [
            expected_publication_issue(
                "header_port", expected_state, expected_detail, "publication_header"
            )
        ],
    )
    testcase.assertNotIn("source_ref", pub["publication_issues"][0])


def assert_authority_port_failure(testcase, pub, expected_state, expected_detail):
    """Verify F08 authority port failure propagation and 7-member issue shape."""
    testcase.assertEqual(pub["header_port"]["tag"], "returned")
    testcase.assertEqual(pub["header_decode"]["tag"], "formed")
    testcase.assertEqual(pub["authority_port"]["tag"], expected_state)
    testcase.assertIn("request", pub["authority_port"])
    testcase.assertNotIn("raw_return", pub["authority_port"])
    testcase.assertEqual(
        pub["source_candidate"],
        {"tag": "unformed", "diagnostic_refs": [{"pointer": "/authority_port"}]},
    )
    hdr_src_ref = pub["header_port"]["raw_return"]["source_ref"]
    testcase.assertEqual(
        pub["publication_issues"],
        [
            expected_publication_issue(
                "authority_port",
                expected_state,
                expected_detail,
                "publication_authority",
                hdr_src_ref,
            )
        ],
    )
    testcase.assertEqual(
        list(pub["publication_issues"][0].keys()),
        [
            "path",
            "state",
            "detail",
            "backflow_owner",
            "axis",
            "source_ref",
            "related_source_refs",
        ],
    )


def rename_all_identifiers(value, in_id_field=False):
    """Bulk-rename Ref identity/revision/owner and scope strings while preserving enum literals."""
    if isinstance(value, str):
        return f"renamed::{value}" if in_id_field else value
    if isinstance(value, list):
        return [rename_all_identifiers(item, in_id_field=False) for item in value]
    if isinstance(value, dict):
        renamed = {}
        id_keys = {
            "identity",
            "revision",
            "owner",
            "product",
            "project",
            "tenant",
            "environment",
        }
        for k, v in value.items():
            renamed[k] = rename_all_identifiers(v, in_id_field=(k in id_keys))
        return renamed
    return copy.deepcopy(value)


def build_renamed_request(req_orig):
    """Build a bulk-renamed RawProviderRequest with consistent source digests."""
    op_body_ren = rename_all_identifiers(
        json.loads(req_orig["source_occurrences"][0]["source_json_utf8"])
    )
    raw_in_ren = op_body_ren["records"][0]["payload"]["caller_inputs"][
        "validation_input"
    ]["raw"]
    _rebuild_source_graph(raw_in_ren)
    s1_body_ren = rename_all_identifiers(
        json.loads(req_orig["source_occurrences"][1]["source_json_utf8"])
    )
    s2_body_ren = rename_all_identifiers(
        json.loads(req_orig["source_occurrences"][2]["source_json_utf8"])
    )
    req_ren = rename_all_identifiers(req_orig)
    op_txt, op_sha = serialize_compact_utf8(op_body_ren)
    s1_txt, _ = serialize_compact_utf8(s1_body_ren)
    s2_txt, s2_sha = serialize_compact_utf8(s2_body_ren)
    req_ren["source_occurrences"][0]["source_json_utf8"] = op_txt
    req_ren["source_occurrences"][0]["source_sha256"] = op_sha
    req_ren["qualification_inputs"][0]["source_sha256"] = op_sha
    req_ren["qualification_root_inputs"][0]["allowed_source_sha256"] = op_sha
    req_ren["source_occurrences"][1]["source_json_utf8"] = s1_txt
    req_ren["source_occurrences"][2]["source_json_utf8"] = s2_txt
    req_ren["source_occurrences"][2]["source_sha256"] = s2_sha
    req_ren["qualification_inputs"][1]["source_sha256"] = s2_sha
    req_ren["qualification_root_inputs"][1]["allowed_source_sha256"] = s2_sha
    return req_ren
