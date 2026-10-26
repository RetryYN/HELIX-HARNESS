"""FN1 native read bundlesと同call origin linkの原index保持を確認する。

根拠: L5 index_types/{MeaningPairAnnotatedRead,MeaningReadOriginObservation,
MeaningProblemScope,MeaningSupportOrigin,MeaningProblemLink,ApplicabilityJudgmentLink}、
/definition_meaning_core/call_return_closure/{pair_call_schedule,
meaning_reader_bundle,meaning_event_cardinality,na_public_projection}。
"""

from __future__ import annotations

import copy
import unittest

from descriptor_definition_walk import evaluate_descriptor_definition_walk
from descriptor_definitions import validate_supply_input
from supply_input_fixtures import base_input, load_document


def _presence(value):
    return {"presence": "supplied", "value": copy.deepcopy(value)}


class TestDescriptorDefinitionWalkLinks(unittest.TestCase):
    def test_normal_native_reads_keep_source_presence_and_direct_local_links(self):
        """L7 normalの各1-fact slotは空pair返却、read問題とNA linkは元indexを指す。"""
        raw = base_input(load_document())
        raw_before = copy.deepcopy(raw)
        validated = validate_supply_input(raw)
        self.assertIsInstance(validated["input"], dict, "setup: L7 normal fixture decodes")
        validated_before = copy.deepcopy(validated)
        self.assertTrue(all(len(slot["facts"]) == 1 for slot in raw["descriptors"]))

        result = evaluate_descriptor_definition_walk({"validated": validated})
        native = result["native_material"]
        assessments = result["evaluation"]["assessments"]
        origins = native["judgment_origins"]
        self.assertEqual(len(assessments), len(origins))

        slots = {
            f"/descriptors/{index}": slot
            for index, slot in enumerate(raw["descriptors"])
        }
        facts = {
            (slot_locator, f"{slot_locator}/facts/0"): slot["facts"][0]
            for slot_locator, slot in slots.items()
        }

        # L5 requires one real annotated pair-helper call for every existing slot.
        # The L7 fixture has exactly one fact per slot, so there are zero pair candidates.
        pair_reads = native["pair_reads"]
        self.assertEqual(len(pair_reads), len(slots))
        self.assertEqual({row["slot_locator"] for row in pair_reads}, set(slots))
        for row in pair_reads:
            self.assertEqual(set(row), {"slot_locator", "result"})
            self.assertEqual(set(row["result"]), {"axes", "origins"})
            self.assertEqual(row["result"]["axes"], [])
            self.assertEqual(row["result"]["origins"], [])

        # Each single source/provenance mismatch is target-scoped to its read.
        meaning_reads = native["meaning_reads"]
        meaning_origins = native["meaning_read_origins"]
        self.assertEqual(len(meaning_reads), len(facts))
        self.assertEqual(len(meaning_origins), len(meaning_reads))
        meaning_index_by_locators = {}
        for index, read in enumerate(meaning_reads):
            key = (read["slot_locator"], read["fact_locator"])
            self.assertIn(key, facts)
            meaning_index_by_locators[key] = index
            self.assertEqual(read["binding"], _presence(slots[read["slot_locator"]]["binding"]))
            self.assertEqual(len(read["problems"]), 1)
            problem = read["problems"][0]
            self.assertEqual(problem["cause"], "source_unresolved")
            self.assertEqual(problem["source_index"], 0)
            self.assertEqual(problem["locator"], "/sources/0")
            self.assertEqual(problem["source_ref"], _presence(raw["sources"][0]["ref"]))

            observation = meaning_origins[index]
            self.assertEqual(set(observation), {"meaning_read_index", "problem_scopes", "support_origins"})
            self.assertEqual(observation["meaning_read_index"], index)
            self.assertEqual(observation["problem_scopes"], [{"problem_index": 0, "relevance": "target"}])
            self.assertEqual(observation["support_origins"], [])

        applicability_reads = native["applicability_reads"]
        batches = native["applicability_judgment_batches"]
        self.assertEqual(len(applicability_reads), len(slots))
        self.assertEqual(len(batches), len(slots))
        app_index_by_slot = {row["slot_locator"]: index for index, row in enumerate(applicability_reads)}
        batch_index_by_slot = {row["slot_locator"]: index for index, row in enumerate(batches)}
        self.assertEqual(set(app_index_by_slot), set(slots))
        self.assertEqual(set(batch_index_by_slot), set(slots))
        for slot_locator, read_index in app_index_by_slot.items():
            self.assertEqual(applicability_reads[read_index]["request"], _presence(None))
            batch = batches[batch_index_by_slot[slot_locator]]
            self.assertEqual(batch["applicability_read_index"], read_index)
            self.assertEqual(batch["slot_locator"], slot_locator)
            self.assertEqual(len(batch["judgments"]), 1)
            judgment = batch["judgments"][0]
            self.assertEqual(judgment["slot_locator"], slot_locator)
            self.assertEqual(judgment["binding"], _presence(slots[slot_locator]["binding"]))
            self.assertIn(judgment["subject_ref"]["presence"], ("supplied", "absent"))

        # Every primary definition origin links its actual read and same-bundle problem index.
        # Every NA origin links the read and exact batch/judgment location, without value search.
        for assessment, origin in zip(assessments, origins):
            axis = assessment["axis_name"]
            if axis.endswith(".definition"):
                self.assertEqual(len(assessment["fact_locators"]), 1)
                fact_locator = assessment["fact_locators"][0]
                slot_locator = assessment["slot_locators"][0]
                meaning_index = meaning_index_by_locators[(slot_locator, fact_locator)]
                fact = facts[(slot_locator, fact_locator)]
                self.assertEqual(origin["meaning_read_indices"], [meaning_index])
                self.assertEqual(origin["meaning_problem_links"], [
                    {"meaning_read_index": meaning_index, "problem_index": 0}
                ])
                self.assertEqual(origin["meaning_support_links"], [])
                self.assertEqual(origin["applicability_read_indices"], [])
                self.assertEqual(origin["applicability_judgment_links"], [])
                self.assertEqual(origin["subject_ref"], _presence(fact["ref"]))
                self.assertEqual(origin["binding"], _presence(slots[slot_locator]["binding"]))
                self.assertEqual(origin["pair_origin_links"], [])
            elif axis.endswith(".definition_applicability"):
                slot_locator = origin["slot_locators"][0]
                read_index = app_index_by_slot[slot_locator]
                batch_index = batch_index_by_slot[slot_locator]
                judgment = batches[batch_index]["judgments"][0]
                self.assertEqual(origin["meaning_read_indices"], [])
                self.assertEqual(origin["meaning_problem_links"], [])
                self.assertEqual(origin["meaning_support_links"], [])
                self.assertEqual(origin["applicability_read_indices"], [read_index])
                self.assertEqual(origin["applicability_judgment_links"], [
                    {"batch_index": batch_index, "judgment_index": 0}
                ])
                self.assertEqual(origin["subject_ref"], judgment["subject_ref"])
                self.assertEqual(origin["binding"], judgment["binding"])
                self.assertEqual(origin["pair_origin_links"], [])

        self.assertEqual(raw, raw_before)
        self.assertEqual(validated, validated_before)


if __name__ == "__main__":
    unittest.main()
