"""FN8 B02 claim-shape checks and explicitly stopped semantic subassertions."""

import copy
import json
from pathlib import Path
import sys
import unittest

UNIT_ROOT = Path(__file__).resolve().parents[1]
REPOSITORY_ROOT = UNIT_ROOT.parents[3]
L8_PATH = (
    REPOSITORY_ROOT
    / "docs/helix-harness/L8-unit-verification/product-template-application.json"
)

if str(UNIT_ROOT / "src") not in sys.path:
    sys.path.insert(0, str(UNIT_ROOT / "src"))

import product_template_application as pta  # noqa: E402
from test_application_input import _fixture_normal_input, _rebuild_source_graph  # noqa: E402

with L8_PATH.open("r", encoding="utf-8") as stream:
    _L8 = json.load(stream)

_B02_CASES = _L8["cases"][1]["negative_cases"]

# These subassertions remain stopped until L8 supplies typed paired evidence.
# In particular, Claim.proposed_value.basis is a claim, not evidence of an
# observed alternative obligation set or a qualified scope/meaning comparison.
_STOPPED_SEMANTIC_SUBASSERTIONS = {
    "HARNESS-L8-009-B02-NEG-01": "No paired returned obligation refs establish a concrete AI-only missing/extra obligation.",
    "HARNESS-L8-009-B02-NEG-02": "No paired returned obligation refs establish a concrete language-only missing/extra obligation.",
    "HARNESS-L8-009-B02-NEG-03": "No alternate typed binding/candidate-set evidence establishes a different domain/risk/scope with the same set.",
    "HARNESS-L8-009-B02-NEG-04": "No second obligation set or count observation establishes equal count with different content.",
}


def _claim_from_l8_typed_mutation(raw, case_row):
    mutation = case_row["typed_mutation"]
    synthetic_value = mutation["synthetic_value"]
    return {
        "ref": {
            "identity": "fn8-negative-claim",
            "revision": "synthetic-A",
            "scope": copy.deepcopy(raw["binding"]["product_scope"]),
            "owner": "synthetic-core-owner",
            "source_locator": None,
            "sha256": None,
        },
        "subject_ref": copy.deepcopy(raw["binding"]["template_ref"]),
        "binding": copy.deepcopy(raw["binding"]),
        "actor": "synthetic-core-owner",
        "kind": synthetic_value["kind"],
        "proposed_value": {
            key: copy.deepcopy(value)
            for key, value in synthetic_value.items()
            if key != "kind"
        },
        "basis_refs": [copy.deepcopy(raw["binding"]["requirement_ref"])],
    }


class TestFn8B02NegativeClaimRefinement(unittest.TestCase):
    """Check the L8 plans fit existing carriers without claiming absent facts."""

    def test_l8_negative_claim_mutations_fit_the_existing_claim_carrier(self):
        self.assertEqual(len(_B02_CASES), 4)
        self.assertEqual(
            {row["id"] for row in _B02_CASES},
            set(_STOPPED_SEMANTIC_SUBASSERTIONS),
        )

        for row in _B02_CASES:
            with self.subTest(case_id=row["id"]):
                mutation = row["typed_mutation"]
                self.assertEqual(mutation["target"], "claims")
                self.assertEqual(mutation["operation"], "append")
                raw = _fixture_normal_input()
                claim = _claim_from_l8_typed_mutation(raw, row)
                raw["claims"].append(claim)
                _rebuild_source_graph(raw)

                validated = pta.validate_application_input(raw)

                self.assertIsNotNone(validated["input"])
                self.assertEqual(validated["input"]["claims"][-1], claim)
                self.assertEqual(
                    claim["proposed_value"],
                    {
                        key: value
                        for key, value in mutation["synthetic_value"].items()
                        if key != "kind"
                    },
                )

    def test_unqualified_negative_plans_do_not_gain_invented_ref_assertions(self):
        for case_id, stop_reason in _STOPPED_SEMANTIC_SUBASSERTIONS.items():
            with self.subTest(case_id=case_id):
                self.assertTrue(case_id.startswith("HARNESS-L8-009-B02-NEG-"))
                self.assertTrue(stop_reason)


if __name__ == "__main__":
    unittest.main()
