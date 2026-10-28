"""WR65 ClaimUse consumer tests from real same-call walk material."""

from __future__ import annotations

import copy
import hashlib
import json
import unittest

from claim_boundary_input_fixtures import finite_claim_input
from descriptor_claim_input_fixtures import descriptor_claim_input
from descriptor_definitions import validate_supply_input
from descriptor_definition_walk import evaluate_descriptor_definition_walk
from descriptor_target_frame import build_descriptor_claim_uses


_USE_FIELDS = {
    "claim_locator",
    "claim",
    "target_read",
    "intent_read",
    "assessment_indices",
    "unmatched_match_indices",
    "basis_source_indices",
    "unresolved_basis_ref_indices",
    "basis_class",
    "missing_support_indices",
    "undefined_support_indices",
    "route",
    "route_reason",
    "primary_definition_assessment_indices",
}
_I05_RAW_SHA256 = "bcfcec04ae67e55dc87df2f24742d582e2f40e8b1254516c76438643aa15583a"
_ROUTE_NONE_REASON = (
    "既存rule87及びrule93のpredicateに明確に該当しない。"
    "原target・意図・各定義状態は同呼出し観測へ保持する。"
)
_STOP_PREFIX = "F05/F06/unclosed/descriptor_claim_uses; owner=knowledge_owner;"
_BACKFLOW = "Backflow HELIXBRAIN-L6-032-FN4-ORACLE"


def _canonical_sha256(value):
    encoded = json.dumps(
        value, ensure_ascii=False, sort_keys=True, separators=(",", ":")
    ).encode("utf-8")
    return hashlib.sha256(encoded).hexdigest()


def _with_nonfill_claim(raw, source_claim, kind, proposed_value):
    claim = copy.deepcopy(source_claim)
    claim["subject_ref"] = copy.deepcopy(raw["binding"]["template_ref"])
    claim["binding"] = copy.deepcopy(raw["binding"])
    claim["actor"] = "BRAIN"
    claim["kind"] = kind
    claim["proposed_value"] = copy.deepcopy(proposed_value)
    return claim


def _actual_walk(raw, testcase):
    raw_before = copy.deepcopy(raw)
    validated = validate_supply_input(raw)
    testcase.assertIsNotNone(
        validated["input"], "setup: FN0 must retain this raw input"
    )
    testcase.assertEqual(validated["input"], raw_before)
    testcase.assertEqual(validated["input_issues"], [])
    testcase.assertEqual(validated["unusable_source_refs"], [])
    validated_before = copy.deepcopy(validated)
    walk = evaluate_descriptor_definition_walk({"validated": validated})
    testcase.assertEqual(raw, raw_before)
    testcase.assertEqual(validated, validated_before)
    return raw_before, validated, validated_before, walk


def _build_and_assert_preserved(raw, testcase):
    raw_before, validated, validated_before, walk = _actual_walk(raw, testcase)
    walk_before = copy.deepcopy(walk)
    caught = None
    uses = None
    try:
        uses = build_descriptor_claim_uses(
            validated,
            walk["evaluation"],
            walk["target_reads"],
            walk["intent_reads"],
        )
    except Exception as error:
        caught = error
    finally:
        testcase.assertEqual(raw, raw_before, "raw input must remain unchanged")
        testcase.assertEqual(
            validated, validated_before, "FN0 result must remain unchanged"
        )
        testcase.assertEqual(
            walk, walk_before, "same-call evaluation and reads must remain unchanged"
        )
    testcase.assertIsNone(caught, f"builder unexpectedly stopped: {caught!r}")
    return validated, walk, uses


class TestClaimUseNonfillConsumer(unittest.TestCase):
    """Fill-only ClaimUse projection over the existing same-call walk values."""

    def test_i05_nonfill_only_has_no_claim_use_and_preserves_same_call_material(self):
        raw = descriptor_claim_input("positive")
        source_claim = copy.deepcopy(raw["claims"][0])
        self.assertTrue(raw["candidates"], "setup: I05 uses an existing candidate Ref")
        claim = _with_nonfill_claim(
            raw,
            source_claim,
            "product_template_adoption",
            raw["candidates"][0],
        )
        claim["basis_refs"] = []
        raw["claims"] = [claim]
        self.assertEqual(_canonical_sha256(raw), _I05_RAW_SHA256)
        raw_before = copy.deepcopy(raw)

        validated, walk, uses = _build_and_assert_preserved(raw, self)

        self.assertEqual(raw, raw_before)
        self.assertEqual(validated["input"]["claims"], [claim])
        self.assertEqual(walk["target_reads"], [])
        self.assertEqual(walk["intent_reads"], [])
        self.assertEqual(uses, [])

    def test_mixed_occurrences_build_uses_only_for_original_fill_locators(self):
        raw = finite_claim_input("none")
        fill = copy.deepcopy(raw["claims"][0])
        before = _with_nonfill_claim(raw, fill, "requirements_agreement", True)
        after = _with_nonfill_claim(raw, fill, "design_completion", True)
        raw["claims"] = [before, copy.deepcopy(fill), after, copy.deepcopy(fill)]
        raw_before = copy.deepcopy(raw)

        validated, walk, uses = _build_and_assert_preserved(raw, self)

        expected_indices = [1, 3]
        expected_locators = ["/claims/1", "/claims/3"]
        self.assertEqual(raw, raw_before)
        self.assertEqual(
            [read["claim_locator"] for read in walk["target_reads"]], expected_locators
        )
        self.assertEqual(
            [read["claim_locator"] for read in walk["intent_reads"]], expected_locators
        )
        self.assertEqual(len(uses), 2)
        self.assertEqual([use["claim_locator"] for use in uses], expected_locators)
        for use, claim_index, target_read, intent_read in zip(
            uses, expected_indices, walk["target_reads"], walk["intent_reads"]
        ):
            original_claim = raw_before["claims"][claim_index]
            self.assertEqual(use["claim"], original_claim)
            self.assertEqual(use["target_read"], target_read)
            self.assertEqual(use["intent_read"], intent_read)
            self.assertEqual(
                use["target_read"]["claim_locator"], f"/claims/{claim_index}"
            )
            self.assertEqual(
                use["intent_read"]["claim_locator"], f"/claims/{claim_index}"
            )
            self.assertEqual(use["target_read"]["claim"], original_claim)
            self.assertEqual(use["intent_read"]["claim"], original_claim)
        self.assertNotIn("/claims/0", [use["claim_locator"] for use in uses])
        self.assertNotIn("/claims/2", [use["claim_locator"] for use in uses])
        self.assertEqual(validated["input"]["claims"], raw_before["claims"])

    def test_existing_fill_only_control_keeps_closed_use_shape_and_route(self):
        raw = descriptor_claim_input("positive")
        raw_before = copy.deepcopy(raw)

        _validated, walk, uses = _build_and_assert_preserved(raw, self)

        self.assertEqual(raw, raw_before)
        self.assertEqual(len(uses), 1)
        use = uses[0]
        self.assertEqual(set(use), _USE_FIELDS)
        self.assertEqual(use["claim_locator"], "/claims/0")
        self.assertEqual(use["claim"], raw_before["claims"][0])
        self.assertEqual(use["target_read"], walk["target_reads"][0])
        self.assertEqual(use["intent_read"], walk["intent_reads"][0])
        self.assertEqual(use["route"], "none")
        self.assertEqual(use["route_reason"], _ROUTE_NONE_REASON)
        self.assertEqual(use["missing_support_indices"], [])
        self.assertEqual(use["undefined_support_indices"], [])

    def test_one_member_protocol_corruption_keeps_the_existing_stop(self):
        raw = finite_claim_input("none")
        fill = copy.deepcopy(raw["claims"][0])
        raw["claims"] = [
            _with_nonfill_claim(raw, fill, "requirements_agreement", True),
            copy.deepcopy(fill),
            _with_nonfill_claim(raw, fill, "design_completion", True),
            copy.deepcopy(fill),
        ]
        raw_before, validated, validated_before, walk = _actual_walk(raw, self)
        walk_before = copy.deepcopy(walk)

        cases = (
            ("target_missing", lambda r, i: r.pop(), "same_walk_claim_count"),
            ("intent_missing", lambda r, i: i.pop(), "same_walk_claim_count"),
            (
                "target_extra",
                lambda r, i: r.append(copy.deepcopy(r[-1])),
                "same_walk_claim_count",
            ),
            (
                "intent_extra",
                lambda r, i: i.append(copy.deepcopy(i[-1])),
                "same_walk_claim_count",
            ),
            (
                "target_locator",
                lambda r, i: r[1].update(claim_locator="/claims/1"),
                "same_walk_read_mismatch",
            ),
            (
                "intent_locator",
                lambda r, i: i[1].update(claim_locator="/claims/1"),
                "same_walk_read_mismatch",
            ),
        )
        for case, mutate, stop_branch in cases:
            with self.subTest(protocol_clone=case):
                target_reads = copy.deepcopy(walk["target_reads"])
                intent_reads = copy.deepcopy(walk["intent_reads"])
                mutate(target_reads, intent_reads)
                target_reads_before = copy.deepcopy(target_reads)
                intent_reads_before = copy.deepcopy(intent_reads)
                caught = None
                try:
                    build_descriptor_claim_uses(
                        validated,
                        walk["evaluation"],
                        target_reads,
                        intent_reads,
                    )
                except Exception as error:
                    caught = error
                finally:
                    self.assertEqual(raw, raw_before)
                    self.assertEqual(validated, validated_before)
                    self.assertEqual(walk, walk_before)
                    self.assertEqual(target_reads, target_reads_before)
                    self.assertEqual(intent_reads, intent_reads_before)

                self.assertIsNotNone(caught)
                self.assertIsInstance(caught, NotImplementedError)
                self.assertEqual(
                    str(caught), f"{_STOP_PREFIX} {stop_branch}; {_BACKFLOW}"
                )


if __name__ == "__main__":
    unittest.main()
