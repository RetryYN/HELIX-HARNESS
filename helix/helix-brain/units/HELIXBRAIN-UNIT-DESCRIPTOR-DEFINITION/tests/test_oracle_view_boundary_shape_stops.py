"""FN4の公開shape停止だけを実際の同call比較から確かめる。

正常Contextはfn0の実ValidatedSupplyと公開fn1/fn3のComparisonから作る。
各subTestはそのdeep copyを意図的に型不正へ変異させ、L4で閉じた
ValidatedSupply / Comparison / Bindingの外形を拒否する停止IDだけを観測する。
これらの人工的に不正なContextをfn0が返す、又は意味判定が完了したとは主張しない。
"""

from __future__ import annotations

import copy
import unittest

from descriptor_definitions import (
    compare_descriptor_definitions,
    compare_identity_versions_and_trace,
    compare_oracle_and_view_boundary,
    validate_supply_input,
)
from identity_input_fixtures import normal_input


FN1 = "compare_descriptor_definitions"
FN3 = "compare_identity_versions_and_trace"
FN4_BACKFLOW = "Backflow HELIXBRAIN-L6-032-FN4-ORACLE"


class TestOracleViewBoundaryShapeStops(unittest.TestCase):
    def _normal_context(self):
        """実fn0→fn1/fn3だけで、変異前の基準Contextを作る。"""
        raw = normal_input()
        raw_before = copy.deepcopy(raw)
        validated = validate_supply_input(raw)
        self.assertEqual(validated["input_issues"], [])
        self.assertEqual(validated["input"], raw_before)
        validated_before = copy.deepcopy(validated)

        definitions = compare_descriptor_definitions({"validated": validated})
        identity_trace = compare_identity_versions_and_trace({"validated": validated})
        self.assertEqual(definitions["producer_symbol"], FN1)
        self.assertEqual(identity_trace["producer_symbol"], FN3)
        self.assertEqual(definitions["input_binding"], raw_before["binding"])
        self.assertEqual(identity_trace["input_binding"], raw_before["binding"])
        self.assertEqual(
            set(definitions), {"axes", "findings", "producer_symbol", "input_binding"}
        )
        self.assertEqual(
            set(identity_trace),
            {"axes", "findings", "producer_symbol", "input_binding"},
        )
        context = {
            "validated": validated,
            "definitions": definitions,
            "identity_trace": identity_trace,
        }
        return raw, raw_before, validated, validated_before, context

    def _assert_shape_stop(
        self, context, *, stop_id, raw, raw_before, validated, validated_before, case
    ):
        context_before = copy.deepcopy(context)
        with self.subTest(case=case):
            with self.assertRaises(NotImplementedError) as caught:
                compare_oracle_and_view_boundary(context)
            message = str(caught.exception)
            self.assertIn(f"F05/F06/unclosed/{stop_id};", message)
            self.assertIn(FN4_BACKFLOW, message)
            self.assertEqual(context, context_before)
            self.assertEqual(raw, raw_before)
            self.assertEqual(validated, validated_before)

    def test_oracle_context_shape_stop_covers_nonobject_missing_and_extra(self):
        """L4 same_callのContextは同じ3 memberのobjectに限る。"""
        raw, raw_before, validated, validated_before, base = self._normal_context()
        for name in ("nonobject", "missing_member", "extra_member"):
            context = copy.deepcopy(base)
            if name == "nonobject":
                context = [context]
            elif name == "missing_member":
                context.pop("identity_trace")
            else:
                context["frame"] = {}
            self._assert_shape_stop(
                context,
                stop_id="oracle_context_shape",
                raw=raw,
                raw_before=raw_before,
                validated=validated,
                validated_before=validated_before,
                case=name,
            )

    def test_validated_supply_shape_stop_covers_object_members_and_arrays(self):
        """L4 ValidatedSupplyの必須memberとarray containerを個別に確かめる。"""
        raw, raw_before, validated, validated_before, base = self._normal_context()
        cases = (
            ("missing_member", lambda value: value.pop("unusable_source_refs")),
            ("extra_member", lambda value: value.update({"unmodeled": []})),
            (
                "input_issues_nonarray",
                lambda value: value.update({"input_issues": None}),
            ),
            (
                "unusable_source_refs_nonarray",
                lambda value: value.update({"unusable_source_refs": None}),
            ),
        )
        for name in ("nonobject", *(item[0] for item in cases)):
            context = copy.deepcopy(base)
            if name == "nonobject":
                context["validated"] = "not-a-ValidatedSupply"
            else:
                change = next(change for case, change in cases if case == name)
                change(context["validated"])
            self._assert_shape_stop(
                context,
                stop_id="validated_supply_shape",
                raw=raw,
                raw_before=raw_before,
                validated=validated,
                validated_before=validated_before,
                case=name,
            )

    def test_validated_input_type_stop_uses_only_an_ill_formed_context(self):
        """scalar inputは成功fn0出力でなく、不正Context由来の停止対象。"""
        raw, raw_before, validated, validated_before, base = self._normal_context()
        context = copy.deepcopy(base)
        context["validated"]["input"] = "not-a-decoded-SupplyInput"
        self._assert_shape_stop(
            context,
            stop_id="validated_input_type",
            raw=raw,
            raw_before=raw_before,
            validated=validated,
            validated_before=validated_before,
            case="scalar_input",
        )

    def test_each_comparison_shape_stop_is_fixed_for_both_operands(self):
        """L4 Comparison外形の各member違反をdefinitions/identity_trace別に止める。"""
        raw, raw_before, validated, validated_before, base = self._normal_context()
        cases = (
            ("nonobject", lambda value: None),
            ("missing_member", lambda value: value.pop("axes")),
            ("extra_member", lambda value: value.update({"unmodeled": []})),
            ("axes_nonarray", lambda value: value.update({"axes": None})),
            ("findings_nonarray", lambda value: value.update({"findings": None})),
            (
                "producer_nonstring",
                lambda value: value.update({"producer_symbol": None}),
            ),
            (
                "input_binding_nondict",
                lambda value: value.update({"input_binding": "not-a-Binding"}),
            ),
        )
        for operand in ("definitions", "identity_trace"):
            for name, change in cases:
                context = copy.deepcopy(base)
                if name == "nonobject":
                    context[operand] = None
                else:
                    change(context[operand])
                self._assert_shape_stop(
                    context,
                    stop_id=f"{operand}_comparison_shape",
                    raw=raw,
                    raw_before=raw_before,
                    validated=validated,
                    validated_before=validated_before,
                    case=f"{operand}_{name}",
                )

    def test_input_binding_shape_stop_rejects_nonobject_binding(self):
        """不正なValidatedSupply派生値だけでbinding shapeの停止を観測する。"""
        raw, raw_before, validated, validated_before, base = self._normal_context()
        context = copy.deepcopy(base)
        context["validated"]["input"]["binding"] = []
        self._assert_shape_stop(
            context,
            stop_id="input_binding_shape",
            raw=raw,
            raw_before=raw_before,
            validated=validated,
            validated_before=validated_before,
            case="binding_array",
        )


if __name__ == "__main__":
    unittest.main()
