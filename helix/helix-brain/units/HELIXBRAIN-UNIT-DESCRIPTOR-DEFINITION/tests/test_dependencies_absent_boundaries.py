"""故障注入したFN6 Contextのdependencies境界を固定する。

契約根拠:
- L4 #/claim_boundary_projection_contract/finite_domain/other_carriers
  はdependenciesのabsenceと供給値を区別し、供給値をabsentへ変換しない。
- L5 #/logical_input_structure/schema/$defs/DependencySelection と
  #/logical_input_structure/schema/$defs/SupplyInput/properties/dependencies は、
  正規入力のdependenciesをobject又はabsentとする。

ここではnormal rawから実FN0と実FN1を呼んだ後、failure-injection専用の
ValidatedSupplyコピーへnull/arrayを注入する。{}はDependencySelection objectとして
実FN0が保持し、FN6の既存selector境界で停止する。failure injectionはFN0がnull/arrayを
受理するという契約を表さず、正常なdecoded SupplyInputの意味も変更しない。
"""

from __future__ import annotations

import copy
import unittest

from dependencies_handoff import compare_dependencies_and_handoff
from descriptor_definitions import compare_descriptor_definitions, validate_supply_input
from supply_input_fixtures import base_input, load_document


BACKFLOW = "HELIXBRAIN-L6-032-B02-FN6-PATH"


class TestDependenciesAbsentBoundaries(unittest.TestCase):
    def test_injected_non_object_dependencies_preserve_fn1_and_stop_at_fn6_guard(self) -> None:
        raw = base_input(load_document())
        raw_before = copy.deepcopy(raw)

        validated = validate_supply_input(raw)
        self.assertEqual(validated["input_issues"], [])
        self.assertEqual(validated["input"], raw_before)
        validated_before = copy.deepcopy(validated)

        # Keep a real same-call FN1 Comparison; fault injection touches only a
        # private copy of ValidatedSupply after FN0 has completed.
        definitions = compare_descriptor_definitions({"validated": validated})
        self.assertEqual(definitions["producer_symbol"], "compare_descriptor_definitions")
        definitions_before = copy.deepcopy(definitions)

        malformed_context_values = (
            (
                None,
                "F09/B02/dependencies_container_shape: dependencies must be an object; "
                f"Backflow {BACKFLOW}",
            ),
            (
                [],
                "F09/B02/dependencies_container_shape: dependencies must be an object; "
                f"Backflow {BACKFLOW}",
            ),
        )

        for injected_dependencies, expected_stop in malformed_context_values:
            with self.subTest(injected_dependencies=injected_dependencies):
                injected_validated = copy.deepcopy(validated)
                injected_validated["input"]["dependencies"] = copy.deepcopy(
                    injected_dependencies
                )
                self.assertEqual(
                    set(injected_validated), set(validated),
                    "failure injection must preserve the ValidatedSupply shape",
                )
                expected_injected = copy.deepcopy(validated)
                expected_injected["input"]["dependencies"] = copy.deepcopy(
                    injected_dependencies
                )
                self.assertEqual(injected_validated, expected_injected)

                with self.assertRaises(NotImplementedError) as caught:
                    compare_dependencies_and_handoff({
                        "validated": injected_validated,
                        "definitions": definitions,
                    })
                self.assertEqual(str(caught.exception), expected_stop)
                self.assertEqual(injected_validated, expected_injected)

                self.assertEqual(raw, raw_before)
                self.assertEqual(validated, validated_before)
                self.assertEqual(definitions, definitions_before)

    def test_empty_dependency_object_reaches_fn6_through_real_fn0_fn1(self) -> None:
        # DependencySelection is an object whose members are optional. An empty
        # object therefore passes FN0's container check, but is outside FN6's
        # B02 slice and stops at the existing selector boundary.
        raw = base_input(load_document())
        raw["dependencies"] = {}
        raw_before = copy.deepcopy(raw)

        validated = validate_supply_input(raw)
        self.assertEqual(validated["input_issues"], [])
        self.assertEqual(validated["input"], raw_before)
        validated_before = copy.deepcopy(validated)
        definitions = compare_descriptor_definitions({"validated": validated})
        definitions_before = copy.deepcopy(definitions)

        with self.assertRaises(NotImplementedError) as caught:
            compare_dependencies_and_handoff({
                "validated": validated,
                "definitions": definitions,
            })
        self.assertEqual(
            str(caught.exception),
            "F09/conditional_selector: dependencies.core_return_requested is missing, "
            "non-boolean, or True (outside B02 normal-dependency slice); "
            f"Backflow {BACKFLOW}",
        )
        self.assertEqual(raw, raw_before)
        self.assertEqual(validated, validated_before)
        self.assertEqual(definitions, definitions_before)


if __name__ == "__main__":
    unittest.main()
