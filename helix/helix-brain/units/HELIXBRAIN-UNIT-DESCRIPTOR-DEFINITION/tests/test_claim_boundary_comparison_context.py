"""L5 ClaimContextの実前段結果を1箇所だけ壊す、不正protocolの停止検証。

元Contextは同rawの実FN0〜FN6から形成する。変形後の値は正規producer結果とも
成功Contextとも呼ばず、構造・producer・Bindingの否定境界だけを検証する。
"""

import copy
import unittest

from claim_boundary_input_fixtures import finite_claim_input
from descriptor_definitions import compare_claim_boundaries
from test_claim_boundaries_finite import _actual_same_call

FIELDS = (
    "definitions",
    "values_applicability",
    "identity_trace",
    "oracle_view",
    "promotion",
    "dependencies_handoff",
)
BACKFLOW = "Backflow HELIXBRAIN-L6-032-FN7-CLAIM"


class TestClaimBoundaryComparisonContext(unittest.TestCase):
    def _context(self):
        return _actual_same_call(finite_claim_input("none"))["context"]

    def _expect_stop(self, context, branch):
        before = copy.deepcopy(context)
        with self.assertRaises(NotImplementedError) as caught:
            compare_claim_boundaries(context)
        self.assertEqual(str(caught.exception), f"FN7/unclosed/{branch}; {BACKFLOW}")
        self.assertEqual(context, before)

    def test_each_comparison_keeps_closed_four_member_and_list_shapes(self):
        original = self._context()
        for member in FIELDS:
            for variant in (
                "nonobject",
                "missing",
                "extra",
                "axes_type",
                "findings_type",
            ):
                with self.subTest(member=member, variant=variant):
                    context = copy.deepcopy(original)
                    comparison = context[member]
                    if variant == "nonobject":
                        context[member] = None
                    elif variant == "missing":
                        del comparison["findings"]
                    elif variant == "extra":
                        comparison["unmodeled"] = None
                    elif variant == "axes_type":
                        comparison["axes"] = {}
                    else:
                        comparison["findings"] = {}
                    self._expect_stop(context, "comparison_shape")

    def test_each_comparison_requires_its_declared_public_producer(self):
        original = self._context()
        for member in FIELDS:
            with self.subTest(member=member):
                context = copy.deepcopy(original)
                context[member]["producer_symbol"] = "different_producer"
                self._expect_stop(context, "comparison_producer")

    def test_each_comparison_keeps_the_same_input_binding(self):
        original = self._context()
        for member in FIELDS:
            for variant in ("different_identity", "nonobject"):
                with self.subTest(member=member, variant=variant):
                    context = copy.deepcopy(original)
                    if variant == "different_identity":
                        context[member]["input_binding"]["template_ref"][
                            "identity"
                        ] += "-different"
                    else:
                        context[member]["input_binding"] = "not-a-Binding"
                    self._expect_stop(context, "comparison_binding")
