"""Independent owner-order and canonical-digest examples from L5/L8."""

import copy
import unittest

from test_project_cross_design_candidate_refs import _FIXTURE, _call_fn11


def _owner(source, recipient):
    return {
        "responsibility_source": source,
        "recipient": recipient,
        "qualification": "not_established_by_projection",
    }


class TestProjectCrossDesignCandidateRefOwnerAndDigest(unittest.TestCase):
    def test_absent_candidate_collection_has_only_the_input_source_candidate(self):
        packet = copy.deepcopy(_FIXTURE["input_packet"])
        del packet["brain_supply_analysis"]["candidate_refs"]

        result = _call_fn11(self, packet)

        self.assertEqual(result["candidate_refs_presence"], "absent")
        self.assertNotIn("candidate_refs", result)
        self.assertEqual(
            result["return_owner_candidates"],
            [_owner("knowledge_definition_or_version", "BRAIN")],
        )

    def test_mixed_known_and_unknown_occurrences_keep_order_and_dedupe(self):
        packet = copy.deepcopy(_FIXTURE["input_packet"])
        candidate = {
            "identity": "item-A",
            "revision": "rev-A",
            "scope": {"product": "product-A"},
            "owner": "owner-A",
        }
        mismatch = {
            "identity": "item-A",
            "revision": "rev-B",
            "scope": {"product": "product-A"},
            "owner": "owner-A",
        }
        unknown = {
            "identity": "item-A",
            "scope": {"product": "product-A"},
            "owner": "owner-A",
        }
        packet["brain_supply_analysis"]["candidate_refs"] = [candidate]
        packet["core_application"]["universes"] = [
            {"members": [mismatch, copy.deepcopy(mismatch), unknown]}
        ]
        packet["core_application"]["templates"] = []

        result = _call_fn11(self, packet)

        self.assertEqual(
            result["links"][0]["universe_results"][0]["return_owner_candidates"],
            [
                _owner("knowledge_definition_or_version", "BRAIN"),
                _owner(
                    "product_requirement_or_application_contract_unresolved",
                    "unresolved",
                ),
            ],
        )
        self.assertEqual(
            result["links"][0]["return_owner_candidates"],
            result["links"][0]["universe_results"][0]["return_owner_candidates"],
        )

    def test_corresponding_link_has_no_owner_candidate(self):
        packet = copy.deepcopy(_FIXTURE["input_packet"])
        packet["brain_supply_analysis"]["candidate_refs"] = [
            copy.deepcopy(packet["brain_supply_analysis"]["candidate_refs"][0])
        ]
        packet["core_application"]["universes"] = [
            copy.deepcopy(packet["core_application"]["universes"][0])
        ]
        packet["core_application"]["templates"] = [
            copy.deepcopy(packet["core_application"]["templates"][0])
        ]

        result = _call_fn11(self, packet)

        self.assertEqual(
            result["links"][0]["projection_state"], "corresponding_in_fixture"
        )
        self.assertEqual(result["links"][0]["return_owner_candidates"], [])
        self.assertEqual(
            result["links"][0]["universe_results"][0]["return_owner_candidates"], []
        )

    def test_empty_and_invalid_collections_have_specified_digest_presence(self):
        empty_packet = copy.deepcopy(_FIXTURE["input_packet"])
        empty_packet["brain_supply_analysis"]["candidate_refs"] = []
        empty_packet["core_application"]["universes"] = []
        empty_packet["core_application"]["templates"] = []

        empty_result = _call_fn11(self, empty_packet)

        self.assertEqual(empty_result["universes_presence"], "empty")
        self.assertEqual(empty_result["universe_count"], 0)
        self.assertEqual(
            empty_result["universes_sha256"],
            "4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945",
        )
        self.assertEqual(empty_result["templates_presence"], "empty")
        self.assertEqual(empty_result["template_non_ref_sha256"], [])

        invalid_packet = copy.deepcopy(empty_packet)
        invalid_packet["core_application"]["universes"] = {"members": []}
        invalid_packet["core_application"]["templates"] = "not-an-array"

        invalid_result = _call_fn11(self, invalid_packet)

        self.assertEqual(invalid_result["universes_presence"], "invalid_type")
        self.assertIsNone(invalid_result["universes_sha256"])
        self.assertEqual(invalid_result["templates_presence"], "invalid_type")
        self.assertIsNone(invalid_result["template_non_ref_sha256"])

    def test_value_collection_digests_preserve_array_order_and_strip_only_ref(self):
        packet = copy.deepcopy(_FIXTURE["input_packet"])
        packet["brain_supply_analysis"]["candidate_refs"] = [
            {"identity": "candidate", "revision": "r", "scope": {}, "owner": "o"}
        ]
        packet["core_application"]["universes"] = [{"members": ["x", "x"]}]
        packet["core_application"]["templates"] = [
            {"ref": {"identity": "ignored-ref"}, "name": "t"}
        ]

        result = _call_fn11(self, packet)

        self.assertEqual(result["universes_presence"], "value")
        self.assertEqual(
            result["universes_sha256"],
            "07082af87ef3e2076d9a51252dade2e81cd15cd735ad95e5735b2d8ebb745953",
        )
        self.assertEqual(
            result["links"][0]["universe_results"][0]["universe_members_sha256"],
            "841feef2ec2a4ecece5abd450cf3384d2f2d8619947bf022175e12bc20115558",
        )
        self.assertEqual(result["templates_presence"], "value")
        self.assertEqual(
            result["template_non_ref_sha256"],
            ["3647a67649228b62fe3d139c47f7a3c673c31ce57da824082b6654fc0b15751f"],
        )

    def test_empty_members_array_has_digest_of_empty_array(self):
        packet = copy.deepcopy(_FIXTURE["input_packet"])
        packet["brain_supply_analysis"]["candidate_refs"] = [
            {"identity": "candidate", "revision": "r", "scope": {}, "owner": "o"}
        ]
        packet["core_application"]["universes"] = [{"members": []}]
        packet["core_application"]["templates"] = []

        result = _call_fn11(self, packet)

        universe = result["links"][0]["universe_results"][0]
        self.assertEqual(universe["universe_members_presence"], "empty")
        self.assertEqual(
            universe["universe_members_sha256"],
            "4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945",
        )

    def test_invalid_members_do_not_receive_member_digest(self):
        packet = copy.deepcopy(_FIXTURE["input_packet"])
        packet["brain_supply_analysis"]["candidate_refs"] = [
            {"identity": "candidate", "revision": "r", "scope": {}, "owner": "o"}
        ]
        packet["core_application"]["universes"] = [{"members": "not-an-array"}]
        packet["core_application"]["templates"] = []

        result = _call_fn11(self, packet)

        universe = result["links"][0]["universe_results"][0]
        self.assertEqual(universe["universe_members_presence"], "invalid_type")
        self.assertIsNone(universe["universe_members_sha256"])


if __name__ == "__main__":
    unittest.main()
