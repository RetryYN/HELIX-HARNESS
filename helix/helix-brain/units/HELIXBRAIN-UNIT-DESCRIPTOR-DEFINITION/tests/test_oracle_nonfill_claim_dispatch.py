"""BRAIN032 FN4 nonfill Claim dispatch unit verification tests.

Covers L4 `/oracle_view_boundary_contract/claim_dispatch`,
L4 `/oracle_view_boundary_contract/rule_projection_table/2` (Rule 70) and `/6` (Rule 74),
L5 `/fn4_nonfill_claim_detail`, and L8 U-IDs:
- `HELIXBRAIN-L8-032-F05-NEG-03` (`view_as_semantic_update` / `meaning_update_claim` / `conflict` / `knowledge_owner`)
- `HELIXBRAIN-L8-032-F06-NEG-04` (`threshold_fabricated` / `measurement.value` / `unknown` / `core_owner`)
- `HELIXBRAIN-L8-032-NORMAL-compare_oracle_and_view_boundary` (nonfill Claim dispatch boundary)
"""

from __future__ import annotations

import copy
import hashlib
import json
import unittest

from descriptor_definitions import (
    compare_descriptor_definitions,
    compare_identity_versions_and_trace,
    compare_oracle_and_view_boundary,
    validate_supply_input,
)
from oracle_binding_input_fixtures import (
    _rewrite_qualified_source_body,
    _slot_and_fact,
    _source_by_ref,
)
from oracle_projection_input_fixtures import oracle_projection_input
from supply_input_fixtures import base_input, load_document
from test_oracle_finite_carry import _finite_input


FN1 = "compare_descriptor_definitions"
FN3 = "compare_identity_versions_and_trace"
FN4 = "compare_oracle_and_view_boundary"
BACKFLOW = "Backflow HELIXBRAIN-L6-032-FN4-ORACLE"

RULE70_CODE = "view_as_semantic_update"
RULE70_REF = "HELIXBRAIN-L5-032-R-view_as_semantic_update"
RULE70_AXIS = "meaning_update_claim"
RULE70_PREFIX = "変わった原根拠は表示だけでsemantic JSON/版/stateは同じ。意味更新claimは正本/view境界と相反。"

RULE74_CODE = "threshold_fabricated"
RULE74_REF = "HELIXBRAIN-L5-032-R-threshold_fabricated"
RULE74_AXIS = "measurement.value"
RULE74_PREFIX = "measurementのowner値がunknownで、根拠のないgeneric default claimを与えている。原値unknownを保持。"

CARRY_AXES = {
    "measurement.definition",
    "completion.definition",
    "negative oracle.definition",
}

OTHER_PRODUCER_KINDS = (
    "absolute_product_choice",
    "design_completion",
    "no_gaps",
    "os_obligation_discharge",
    "product_template_adoption",
    "requirements_agreement",
    "return_definition_known",
    "return_field_applicable",
    "return_received",
    "return_source_observed",
    "return_value_supplied",
    "same_template_identity",
    "project_obligation_discharge",
    "field_not_applicable",
    "definition_missing_from_receipt",
    "upstream_authority",
    "require_before_supply",
    "labo_evaluated",
)


def _json_bytes(value: object) -> bytes:
    return json.dumps(value, ensure_ascii=False, separators=(",", ":")).encode("utf-8")


def _presence(parent: dict, member: str, locator: str) -> dict:
    if member in parent:
        return {
            "locator": f"{locator}/{member}",
            "original_read": {
                "presence": "supplied",
                "value": copy.deepcopy(parent[member]),
            },
        }
    return {
        "locator": f"{locator}/{member}",
        "original_read": {"presence": "absent"},
    }


def _add_qualified_source(
    raw: dict,
    *,
    identity: str,
    revision: str,
    role: str,
    content: dict,
    owner: str = "synthetic-knowledge-owner",
) -> dict:
    encoded = _json_bytes(content)
    digest = hashlib.sha256(encoded).hexdigest()
    scope = copy.deepcopy(raw["binding"]["knowledge_ref"]["scope"])
    source_ref = {
        "identity": identity,
        "revision": revision,
        "scope": copy.deepcopy(scope),
        "owner": owner,
        "source_locator": None,
        "sha256": digest,
    }
    qual_ref = {
        "identity": f"{identity}-qualification",
        "revision": revision,
        "scope": copy.deepcopy(scope),
        "owner": owner,
        "source_locator": None,
        "sha256": None,
    }
    root_ref = next(
        (
            copy.deepcopy(r)
            for r in raw["qualification_roots"]
            if r.get("owner") == owner
        ),
        copy.deepcopy(raw["qualification_roots"][0]),
    )
    raw["sources"].append(
        {
            "ref": copy.deepcopy(source_ref),
            "content": copy.deepcopy(content),
            "content_bytes": encoded.decode("utf-8"),
            "qualification_ref": copy.deepcopy(qual_ref),
            "role": role,
        }
    )
    raw["qualifications"].append(
        {
            "ref": copy.deepcopy(qual_ref),
            "subject_ref": copy.deepcopy(source_ref),
            "subject_sha256": digest,
            "applicable_scope": copy.deepcopy(scope),
            "qualification_body": {
                "owner": owner,
                "subject": identity,
                "logical_fixture_assumption": "合成対照の資格成立source。",
            },
            "root_ref": root_ref,
        }
    )
    return source_ref


def _public_context(
    raw: dict, test_case: unittest.TestCase, *, allow_unusable: bool = False
):
    raw_before = copy.deepcopy(raw)
    validated = validate_supply_input(raw)
    test_case.assertIsNotNone(validated["input"], "setup: FN0 must decode input")
    test_case.assertEqual(
        validated["input_issues"], [], "setup: no FN0 structural issues"
    )
    if not allow_unusable:
        test_case.assertEqual(
            validated["unusable_source_refs"], [], "setup: all sources usable"
        )
    test_case.assertEqual(validated["input"], raw_before)
    definitions = compare_descriptor_definitions({"validated": validated})
    identity_trace = compare_identity_versions_and_trace({"validated": validated})
    test_case.assertEqual(definitions["producer_symbol"], FN1)
    test_case.assertEqual(identity_trace["producer_symbol"], FN3)
    context = {
        "validated": validated,
        "definitions": definitions,
        "identity_trace": identity_trace,
    }
    return raw_before, validated, context


def _f05_neg03_input(
    *,
    view_identity: str = "synthetic-derived-view-display-rev-B",
    duplicate: bool = False,
) -> dict:
    raw = base_input(load_document())
    _slot, fact = _slot_and_fact(raw, "measurement")
    view_ref = _add_qualified_source(
        raw,
        identity=view_identity,
        revision="synthetic-rev-B",
        role="derived_view",
        content={
            "binding": copy.deepcopy(raw["binding"]),
            "rendered_view": "表示レイアウトのみ変更（意味JSON不変）",
        },
    )
    claim = {
        "subject_ref": copy.deepcopy(fact["ref"]),
        "binding": copy.deepcopy(raw["binding"]),
        "actor": "BRAIN",
        "kind": "meaning_revision_update",
        "proposed_value": {"semantic_json_change_ref": None},
        "basis_refs": [copy.deepcopy(view_ref)],
    }
    raw["claims"] = (
        [copy.deepcopy(claim), copy.deepcopy(claim)] if duplicate else [claim]
    )
    return raw


def _sync_values_source(raw: dict) -> dict:
    value_row = raw["values"][0]
    source = _source_by_ref(raw, value_row["source_ref"])
    content = copy.deepcopy(source["content"])
    if isinstance(content.get("values"), list) and content["values"]:
        content["values"] = [
            {k: copy.deepcopy(v) for k, v in row.items() if k != "source_ref"}
            for row in raw["values"]
        ]
    _old_ref, new_ref = _rewrite_qualified_source_body(raw, source, content)
    for row in raw["values"]:
        row["source_ref"] = copy.deepcopy(new_ref)
    return new_ref


def _f06_neg04_input(*, duplicate: bool = False) -> dict:
    raw = base_input(load_document())
    _slot, fact = _slot_and_fact(raw, "measurement")
    raw["values"][0]["subject_ref"] = copy.deepcopy(fact["ref"])
    raw["values"][0]["binding"] = copy.deepcopy(raw["binding"])
    raw["values"][0]["value"] = None
    _sync_values_source(raw)
    claim = {
        "subject_ref": copy.deepcopy(fact["ref"]),
        "binding": copy.deepcopy(raw["binding"]),
        "actor": "BRAIN",
        "kind": "measurement_threshold",
        "proposed_value": {"basis_origin": "generic_default"},
        "basis_refs": [],
    }
    raw["claims"] = (
        [copy.deepcopy(claim), copy.deepcopy(claim)] if duplicate else [claim]
    )
    return raw


class TestOracleNonfillClaimDispatch(unittest.TestCase):
    def test_f05_neg03_meaning_revision_update_projects_rule70_conflict(self):
        """HELIXBRAIN-L8-032-F05-NEG-03: 表示変更のみで意味更新報告するClaimをrule 70で検出する。"""
        raw = _f05_neg03_input()
        raw_before, _validated, context = _public_context(raw, self)
        context_before = copy.deepcopy(context)

        result = compare_oracle_and_view_boundary(context)

        self.assertEqual(raw, raw_before)
        self.assertEqual(context, context_before)
        self.assertEqual(result["producer_symbol"], FN4)
        self.assertEqual(result["input_binding"], raw_before["binding"])

        carry_rows = [
            row for row in context["definitions"]["axes"] if row["axis"] in CARRY_AXES
        ]
        self.assertEqual(result["axes"][: len(carry_rows)], carry_rows)

        claim = raw_before["claims"][0]
        slot_index = next(
            i
            for i, s in enumerate(raw_before["descriptors"])
            if s["descriptor_kind"] == "measurement"
        )
        fact = raw_before["descriptors"][slot_index]["facts"][0]
        view_source_index = len(raw_before["sources"]) - 1
        view_source = raw_before["sources"][view_source_index]

        expected_observations = (
            [
                _presence(claim, key, "/claims/0")
                for key in (
                    "subject_ref",
                    "binding",
                    "actor",
                    "kind",
                    "proposed_value",
                    "basis_refs",
                )
            ]
            + [
                _presence(fact, key, f"/descriptors/{slot_index}/facts/0")
                for key in ("ref", "source_ref", "binding")
            ]
            + [
                _presence(view_source, key, f"/sources/{view_source_index}")
                for key in ("ref", "role")
            ]
        )
        expected_reason = (
            RULE70_PREFIX
            + "\n"
            + json.dumps(
                {
                    "code": RULE70_CODE,
                    "rule_ref": RULE70_REF,
                    "predicate_observations": expected_observations,
                },
                ensure_ascii=False,
                sort_keys=True,
                separators=(",", ":"),
            )
        )
        expected_source_refs = [
            copy.deepcopy(raw_before["sources"][0]["ref"]),
            copy.deepcopy(view_source["ref"]),
        ]
        expected_original_refs = [
            copy.deepcopy(claim["subject_ref"]),
            copy.deepcopy(claim["basis_refs"][0]),
            copy.deepcopy(fact["ref"]),
            copy.deepcopy(fact["source_ref"]),
            copy.deepcopy(view_source["ref"]),
        ]

        self.assertEqual(len(result["findings"]), 1)
        self.assertEqual(
            result["findings"][0],
            {
                "code": RULE70_CODE,
                "rule_ref": RULE70_REF,
                "subject_ref": copy.deepcopy(claim["subject_ref"]),
                "binding": copy.deepcopy(claim["binding"]),
                "axis": RULE70_AXIS,
                "state": "conflict",
                "source_refs": expected_source_refs,
                "reason": expected_reason,
                "backflow_owner": "knowledge_owner",
            },
        )
        self.assertEqual(
            result["axes"][len(carry_rows) :],
            [
                {
                    "subject_ref": copy.deepcopy(claim["subject_ref"]),
                    "binding": copy.deepcopy(claim["binding"]),
                    "axis": RULE70_AXIS,
                    "state": "conflict",
                    "original_refs": expected_original_refs,
                    "reason": expected_reason,
                    "backflow_owner": "knowledge_owner",
                }
            ],
        )

    def test_f06_neg04_measurement_threshold_projects_rule74_unknown_and_keeps_definition_known(
        self,
    ):
        """HELIXBRAIN-L8-032-F06-NEG-04: 値unknownへの汎用既定閾値Claimをrule 74で検出し定義knownと別に返す。"""
        raw = _f06_neg04_input()
        raw_before, _validated, context = _public_context(raw, self)
        context_before = copy.deepcopy(context)

        result = compare_oracle_and_view_boundary(context)

        self.assertEqual(raw, raw_before)
        self.assertEqual(context, context_before)
        self.assertEqual(result["producer_symbol"], FN4)
        self.assertEqual(result["input_binding"], raw_before["binding"])

        measurement_def_rows = [
            row for row in result["axes"] if row["axis"] == "measurement.definition"
        ]
        self.assertEqual(len(measurement_def_rows), 1)

        claim = raw_before["claims"][0]
        vfact = raw_before["values"][0]
        expected_observations = [
            _presence(claim, key, "/claims/0")
            for key in (
                "subject_ref",
                "binding",
                "actor",
                "kind",
                "proposed_value",
                "basis_refs",
            )
        ] + [
            _presence(vfact, key, "/values/0")
            for key in ("ref", "subject_ref", "binding", "value", "source_ref")
        ]
        expected_reason = (
            RULE74_PREFIX
            + "\n"
            + json.dumps(
                {
                    "code": RULE74_CODE,
                    "rule_ref": RULE74_REF,
                    "predicate_observations": expected_observations,
                },
                ensure_ascii=False,
                sort_keys=True,
                separators=(",", ":"),
            )
        )
        expected_source_refs = [copy.deepcopy(vfact["source_ref"])]
        expected_original_refs = [
            copy.deepcopy(claim["subject_ref"]),
            copy.deepcopy(vfact["ref"]),
            copy.deepcopy(vfact["subject_ref"]),
            copy.deepcopy(vfact["source_ref"]),
        ]

        self.assertEqual(len(result["findings"]), 1)
        self.assertEqual(
            result["findings"][0],
            {
                "code": RULE74_CODE,
                "rule_ref": RULE74_REF,
                "subject_ref": copy.deepcopy(claim["subject_ref"]),
                "binding": copy.deepcopy(claim["binding"]),
                "axis": RULE74_AXIS,
                "state": "unknown",
                "source_refs": expected_source_refs,
                "reason": expected_reason,
                "backflow_owner": "core_owner",
            },
        )
        value_axes = [row for row in result["axes"] if row["axis"] == RULE74_AXIS]
        self.assertEqual(
            value_axes,
            [
                {
                    "subject_ref": copy.deepcopy(claim["subject_ref"]),
                    "binding": copy.deepcopy(claim["binding"]),
                    "axis": RULE74_AXIS,
                    "state": "unknown",
                    "original_refs": expected_original_refs,
                    "reason": expected_reason,
                    "backflow_owner": "core_owner",
                }
            ],
        )

    def test_other_producer_claim_kinds_carry_in_finite_domain_without_target_reads(
        self,
    ):
        """L4 claim_dispatch/3: 他producer担当18kindはFN4 Claim operandを作らず有限carryを成立させる。"""
        base_raw = _finite_input("absent")
        subject_ref = copy.deepcopy(base_raw["descriptors"][0]["facts"][0]["ref"])
        for kind in OTHER_PRODUCER_KINDS:
            with self.subTest(kind=kind):
                raw = copy.deepcopy(base_raw)
                raw["claims"] = [
                    {
                        "subject_ref": copy.deepcopy(subject_ref),
                        "binding": copy.deepcopy(raw["binding"]),
                        "actor": "BRAIN",
                        "kind": kind,
                        "proposed_value": {"claim_kind": kind},
                        "basis_refs": [],
                    }
                ]
                raw_before, _validated, context = _public_context(raw, self)
                result = compare_oracle_and_view_boundary(context)
                expected_carry = [
                    row
                    for row in context["definitions"]["axes"]
                    if row["axis"] in CARRY_AXES
                ]
                self.assertEqual(result["findings"], [])
                self.assertEqual(result["axes"], expected_carry)
                self.assertEqual(raw, raw_before)

    def test_combined_rules_70_71_72_74_and_other_producer_claims_project_in_rule_order(
        self,
    ):
        """L5 fn4_nonfill_claim_detail/order: 発火規則は 70 → 71 → 72 → 74 の順、各規則内は原locator順で投影する。"""
        raw, _before, _source = oracle_projection_input(
            rules=("measurement", "completion")
        )
        _slot, m_fact = _slot_and_fact(raw, "measurement")
        raw["values"][0]["subject_ref"] = copy.deepcopy(m_fact["ref"])
        raw["values"][0]["binding"] = copy.deepcopy(raw["binding"])
        raw["values"][0]["value"] = None
        _sync_values_source(raw)

        view_ref = _add_qualified_source(
            raw,
            identity="synthetic-derived-view-combined",
            revision="synthetic-rev-B",
            role="derived_view",
            content={
                "binding": copy.deepcopy(raw["binding"]),
                "rendered_view": "combined view update",
            },
        )
        raw["claims"] = [
            {
                "subject_ref": copy.deepcopy(m_fact["ref"]),
                "binding": copy.deepcopy(raw["binding"]),
                "actor": "BRAIN",
                "kind": "measurement_threshold",
                "proposed_value": {"basis_origin": "generic_default"},
                "basis_refs": [],
            },
            {
                "subject_ref": copy.deepcopy(m_fact["ref"]),
                "binding": copy.deepcopy(raw["binding"]),
                "actor": "BRAIN",
                "kind": "requirements_agreement",
                "proposed_value": {"agreed": True},
                "basis_refs": [],
            },
            {
                "subject_ref": copy.deepcopy(m_fact["ref"]),
                "binding": copy.deepcopy(raw["binding"]),
                "actor": "BRAIN",
                "kind": "meaning_revision_update",
                "proposed_value": {"semantic_json_change_ref": None},
                "basis_refs": [copy.deepcopy(view_ref)],
            },
        ]
        raw_before, _validated, context = _public_context(raw, self)
        result = compare_oracle_and_view_boundary(context)

        self.assertEqual(raw, raw_before)
        self.assertEqual(
            [f["code"] for f in result["findings"]],
            [
                "view_as_semantic_update",
                "unrelated_measurement",
                "completion_oracle_revision",
                "threshold_fabricated",
            ],
        )
        self.assertIn("/claims/2/", result["findings"][0]["reason"])
        self.assertIn("/claims/0/", result["findings"][3]["reason"])

    def test_duplicate_rule70_and_rule74_claims_preserve_distinct_claim_locators(self):
        """L5 order: 重複Claim出現をdedupせず /claims/0 と /claims/1 の各findingを順序通り返す。"""
        for kind, builder, code in (
            ("meaning_revision_update", _f05_neg03_input, RULE70_CODE),
            ("measurement_threshold", _f06_neg04_input, RULE74_CODE),
        ):
            with self.subTest(kind=kind):
                raw = builder(duplicate=True)
                raw_before, _validated, context = _public_context(raw, self)
                result = compare_oracle_and_view_boundary(context)
                self.assertEqual([f["code"] for f in result["findings"]], [code, code])
                self.assertIn("/claims/0/", result["findings"][0]["reason"])
                self.assertIn("/claims/1/", result["findings"][1]["reason"])
                self.assertEqual(raw, raw_before)

    def test_unrecognized_or_malformed_claims_stop_with_unknown_reentry(self):
        """L4 claim_dispatch/4 & L5 stop_protocol: 未知Claim.kindや未形成operandはunknown_reentryで停止しマスクしない。"""
        raw_unknown = _finite_input("absent")
        raw_unknown["claims"] = [
            {
                "subject_ref": copy.deepcopy(
                    raw_unknown["descriptors"][0]["facts"][0]["ref"]
                ),
                "binding": copy.deepcopy(raw_unknown["binding"]),
                "actor": "BRAIN",
                "kind": "unrecognized_custom_claim_kind",
                "proposed_value": None,
                "basis_refs": [],
            }
        ]
        raw_before, _v, context = _public_context(raw_unknown, self)
        with self.assertRaises(NotImplementedError) as caught:
            compare_oracle_and_view_boundary(context)
        self.assertIn("F05/F06/unknown_reentry/", str(caught.exception))
        self.assertIn("owner=knowledge_owner", str(caught.exception))
        self.assertIn(BACKFLOW, str(caught.exception))
        self.assertEqual(raw_unknown, raw_before)

        raw_r70_nonnull = _f05_neg03_input()
        raw_r70_nonnull["claims"][0]["proposed_value"]["semantic_json_change_ref"] = (
            copy.deepcopy(raw_r70_nonnull["sources"][0]["ref"])
        )
        raw_before, _v, context = _public_context(raw_r70_nonnull, self)
        with self.assertRaises(NotImplementedError) as caught:
            compare_oracle_and_view_boundary(context)
        self.assertIn("F05/F06/unknown_reentry/", str(caught.exception))
        self.assertIn("owner=knowledge_owner", str(caught.exception))
        self.assertEqual(raw_r70_nonnull, raw_before)

        raw_r70_not_view = _f05_neg03_input(view_identity="changed-view")
        raw_r70_not_view["sources"][-1]["role"] = "semantic_json"
        raw_before, _v, context = _public_context(raw_r70_not_view, self)
        with self.assertRaises(NotImplementedError) as caught:
            compare_oracle_and_view_boundary(context)
        self.assertIn("F05/F06/unknown_reentry/", str(caught.exception))
        self.assertIn("owner=knowledge_owner", str(caught.exception))
        self.assertEqual(raw_r70_not_view, raw_before)

        raw_r74_known = _f06_neg04_input()
        raw_r74_known["values"][0]["value"] = "known-owner-threshold-42"
        _sync_values_source(raw_r74_known)
        raw_before, _v, context = _public_context(raw_r74_known, self)
        with self.assertRaises(NotImplementedError) as caught:
            compare_oracle_and_view_boundary(context)
        self.assertIn("F05/F06/unknown_reentry/", str(caught.exception))
        self.assertIn("owner=core_owner", str(caught.exception))
        self.assertIn(BACKFLOW, str(caught.exception))
        self.assertEqual(raw_r74_known, raw_before)

        raw_r74_owner_basis = _f06_neg04_input()
        raw_r74_owner_basis["claims"][0]["basis_refs"] = [
            copy.deepcopy(raw_r74_owner_basis["sources"][0]["ref"])
        ]
        raw_before, _v, context = _public_context(raw_r74_owner_basis, self)
        with self.assertRaises(NotImplementedError) as caught:
            compare_oracle_and_view_boundary(context)
        self.assertIn("F05/F06/unknown_reentry/", str(caught.exception))
        self.assertIn("owner=core_owner", str(caught.exception))
        self.assertEqual(raw_r74_owner_basis, raw_before)

        raw_masked = _f05_neg03_input()
        raw_masked["claims"].append(
            {
                "subject_ref": copy.deepcopy(raw_masked["claims"][0]["subject_ref"]),
                "binding": copy.deepcopy(raw_masked["binding"]),
                "actor": "BRAIN",
                "kind": "unrecognized_second_claim",
                "proposed_value": None,
                "basis_refs": [],
            }
        )
        raw_before, _v, context = _public_context(raw_masked, self)
        with self.assertRaises(NotImplementedError) as caught:
            compare_oracle_and_view_boundary(context)
        self.assertIn("F05/F06/unknown_reentry/", str(caught.exception))
        self.assertEqual(raw_masked, raw_before)

    def test_rule70_and_rule74_counterexamples_reject_same_revision_owner_basis_and_head_selection(
        self,
    ):
        """L5 rule_operands/1 & /4: (a) semantic/view同identity・revision、(b) rule74資格semantic_json basis、(c) 複数ValueFact/descriptor factで先頭選択せずunknown_reentry停止する（M2/M4/M9/M10反例）。"""
        # (a) M2 kill: semantic_json source and derived_view source share same identity & revision -> unknown_reentry (knowledge_owner)
        raw_same_id_rev = base_input(load_document())
        _slot, fact = _slot_and_fact(raw_same_id_rev, "measurement")
        sem_ref = raw_same_id_rev["sources"][0]["ref"]
        fact["source_ref"] = copy.deepcopy(sem_ref)
        same_view_ref = _add_qualified_source(
            raw_same_id_rev,
            identity=sem_ref["identity"],
            revision=sem_ref["revision"],
            role="derived_view",
            content={
                "binding": copy.deepcopy(raw_same_id_rev["binding"]),
                "rendered_view": "表示のみ（semantic_jsonと同identity/revision）",
            },
            owner=sem_ref["owner"],
        )
        raw_same_id_rev["claims"] = [
            {
                "subject_ref": copy.deepcopy(fact["ref"]),
                "binding": copy.deepcopy(raw_same_id_rev["binding"]),
                "actor": "BRAIN",
                "kind": "meaning_revision_update",
                "proposed_value": {"semantic_json_change_ref": None},
                "basis_refs": [copy.deepcopy(same_view_ref)],
            }
        ]
        raw_before, _v, context = _public_context(raw_same_id_rev, self)
        with self.assertRaises(NotImplementedError) as caught:
            compare_oracle_and_view_boundary(context)
        self.assertIn("F05/F06/unknown_reentry/witness", str(caught.exception))
        self.assertIn("owner=knowledge_owner", str(caught.exception))
        self.assertIn(BACKFLOW, str(caught.exception))
        self.assertEqual(raw_same_id_rev, raw_before)

        # (b) M4 kill: rule74 basis_refs has qualified semantic_json source -> unknown_reentry (core_owner)
        raw_r74_sem_basis = _f06_neg04_input()
        raw_r74_sem_basis["claims"][0]["basis_refs"] = [
            copy.deepcopy(raw_r74_sem_basis["sources"][1]["ref"])
        ]
        raw_before, _v, context = _public_context(raw_r74_sem_basis, self)
        with self.assertRaises(NotImplementedError) as caught:
            compare_oracle_and_view_boundary(context)
        self.assertIn("F05/F06/unknown_reentry/witness", str(caught.exception))
        self.assertIn("owner=core_owner", str(caught.exception))
        self.assertIn(BACKFLOW, str(caught.exception))
        self.assertEqual(raw_r74_sem_basis, raw_before)

        # (c1) M9 kill: 2 ValueFacts for the same subject_ref -> do not select head, stop with unknown_reentry (core_owner)
        raw_dup_vfact = _f06_neg04_input()
        second_vfact = copy.deepcopy(raw_dup_vfact["values"][0])
        second_vfact["ref"] = copy.deepcopy(second_vfact["ref"])
        second_vfact["ref"]["identity"] = second_vfact["ref"]["identity"] + "-dup"
        second_vfact["value"] = "competing-known-threshold"
        raw_dup_vfact["values"].append(second_vfact)
        _sync_values_source(raw_dup_vfact)
        raw_before, _v, context = _public_context(raw_dup_vfact, self)
        with self.assertRaises(NotImplementedError) as caught:
            compare_oracle_and_view_boundary(context)
        self.assertIn("F05/F06/unknown_reentry/subject", str(caught.exception))
        self.assertIn("owner=core_owner", str(caught.exception))
        self.assertIn(BACKFLOW, str(caught.exception))
        self.assertEqual(raw_dup_vfact, raw_before)

        # (c2) M10 kill: 2 descriptor facts for the same subject_ref -> do not select head, stop with unknown_reentry (knowledge_owner)
        raw_dup_dfact = _f05_neg03_input()
        _mslot, mfact = _slot_and_fact(raw_dup_dfact, "measurement")
        _cslot, cfact = _slot_and_fact(raw_dup_dfact, "completion")
        cfact["ref"] = copy.deepcopy(mfact["ref"])
        sem_src = raw_dup_dfact["sources"][0]
        sem_content = copy.deepcopy(sem_src["content"])
        for dslot in sem_content.get("descriptors", []):
            if dslot.get("descriptor_kind") == "completion":
                dslot["facts"][0]["ref"] = copy.deepcopy(mfact["ref"])
        _rewrite_qualified_source_body(raw_dup_dfact, sem_src, sem_content)
        raw_before, _v, context = _public_context(raw_dup_dfact, self)
        with self.assertRaises(NotImplementedError) as caught:
            compare_oracle_and_view_boundary(context)
        self.assertIn("F05/F06/unknown_reentry/subject", str(caught.exception))
        self.assertIn("owner=knowledge_owner", str(caught.exception))
        self.assertIn(BACKFLOW, str(caught.exception))
        self.assertEqual(raw_dup_dfact, raw_before)

        # (d) R2-F3: rule74 basis_refs with unregistered/unresolved source ref -> unknown_reentry (core_owner)
        raw_r74_unregistered = _f06_neg04_input()
        unreg_ref = copy.deepcopy(raw_r74_unregistered["sources"][0]["ref"])
        unreg_ref["identity"] = "not-registered"
        raw_r74_unregistered["claims"][0]["basis_refs"] = [unreg_ref]
        raw_before, _v, context = _public_context(raw_r74_unregistered, self)
        with self.assertRaises(NotImplementedError) as caught:
            compare_oracle_and_view_boundary(context)
        self.assertIn("F05/F06/unknown_reentry/witness", str(caught.exception))
        self.assertIn("owner=core_owner", str(caught.exception))
        self.assertIn(BACKFLOW, str(caught.exception))
        self.assertEqual(raw_r74_unregistered, raw_before)

        # (e) R2-F3: rule74 basis_refs with qualified non-owner derived_view source -> fires threshold_fabricated and preserves basis witness
        raw_r74_view_basis = _f06_neg04_input()
        view_basis_ref = _add_qualified_source(
            raw_r74_view_basis,
            identity="synthetic-non-owner-view-basis",
            revision="synthetic-rev-B",
            role="derived_view",
            content={
                "binding": copy.deepcopy(raw_r74_view_basis["binding"]),
                "rendered_view": "表示用の既定閾値ラベル（owner意味資料ではない）",
            },
        )
        raw_r74_view_basis["claims"][0]["basis_refs"] = [copy.deepcopy(view_basis_ref)]
        raw_before, _v, context = _public_context(raw_r74_view_basis, self)
        result_view_basis = compare_oracle_and_view_boundary(context)
        self.assertEqual(raw_r74_view_basis, raw_before)
        self.assertEqual(len(result_view_basis["findings"]), 1)
        self.assertEqual(result_view_basis["findings"][0]["code"], RULE74_CODE)
        self.assertEqual(result_view_basis["findings"][0]["state"], "unknown")
        self.assertEqual(
            result_view_basis["findings"][0]["backflow_owner"], "core_owner"
        )
        self.assertEqual(
            result_view_basis["findings"][0]["source_refs"],
            [
                copy.deepcopy(raw_before["sources"][1]["ref"]),
                copy.deepcopy(view_basis_ref),
            ],
        )


if __name__ == "__main__":
    unittest.main()
