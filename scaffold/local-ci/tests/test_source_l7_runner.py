from __future__ import annotations

import sys
import unittest
from pathlib import Path
from unittest.mock import patch

_LOCAL_CI = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(_LOCAL_CI))

import source_l7_runner as suite_runner  # noqa: E402
from common import canonical_bytes, sha256  # noqa: E402


class SourceL7RunnerTests(unittest.TestCase):
    def test_inventory_digest_binds_165_formal_rows_and_199_exact_identities(self):
        value = suite_runner.inventory_value()
        self.assertEqual(len(value["formal_mapping"]), 165)
        self.assertEqual(len({row["formal_l7_id"] for row in value["formal_mapping"]}), 165)
        self.assertEqual(sum(row["coverage_kind"] == "primary_callable" for row in value["formal_mapping"]), 139)
        self.assertEqual(sum(row["coverage_kind"] == "owner_or_fixture_stub" for row in value["formal_mapping"]), 26)
        self.assertEqual(len(value["expected_discovery_ids"]), 199)
        self.assertEqual(value["expected_discovery_ids_sha256"],
                         sha256(("\n".join(value["expected_discovery_ids"]) + "\n").encode()))
        self.assertEqual(suite_runner.inventory_digest(), sha256(canonical_bytes(value)))

    def test_maximum_complete_failure_frame_fits_the_bounded_supervisor_capture(self):
        ids = list(suite_runner.EXPECTED_DISCOVERY_IDS)
        frames = []
        for count_key, ids_key in (("failure_count", "failed_ids"),
                                   ("error_count", "error_ids"),
                                   ("skip_count", "skipped_ids")):
            result = {"failure_count": 0, "failed_ids": [], "error_count": 0, "error_ids": [],
                      "skip_count": 0, "skipped_ids": []}
            result[count_key] = 199
            result[ids_key] = ids
            worst = {"schema_version": 1, "suite_id": suite_runner.SUITE_ID, "complete": True,
                     "discovered_test_ids": ids, "executed_test_ids": ids,
                     "test_count": 199, **result, "exit_code": 1, "state": "fail"}
            frames.append(canonical_bytes(worst) + b"\n")
        self.assertGreater(max(map(len, frames)), 32768)
        self.assertLessEqual(max(map(len, frames)), suite_runner.RESULT_MAX_BYTES)

    def test_l7_row_expansions_bind_all_fixed_formal_ids(self):
        source = "\n".join("`" + row["formal_l7_id"] + "`" for row in suite_runner.FORMAL_MAPPING).encode()
        self.assertTrue(suite_runner.l7_formal_ids_present(source))
        missing_one = source.replace(b"`CK-K1-UT-001`", b"`CK-K1-UT-001-REMOVED`")
        self.assertFalse(suite_runner.l7_formal_ids_present(missing_one))

    def test_discovery_mismatch_stops_before_any_test_execution(self):
        class FakeCase:
            def id(self): return suite_runner.EXPECTED_DISCOVERY_IDS[0]
        class FakeSuite:
            def __iter__(self): return iter([FakeCase()])
        with patch.object(suite_runner.unittest, "TextTestRunner") as invoked:
            result, code = suite_runner._run_discovered_suite(FakeSuite())
        self.assertEqual(code, 2)
        self.assertEqual(result["diagnostic"], {"classification": "Unknown", "reason": "conflict"})
        invoked.assert_not_called()


if __name__ == "__main__":
    unittest.main()
