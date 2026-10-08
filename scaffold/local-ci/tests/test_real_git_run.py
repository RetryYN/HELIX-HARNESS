"""Real synthetic Git/snapshot/manifest integration, with checker launch stubbed."""
from pathlib import Path
import sys
import unittest
from unittest.mock import Mock, patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import driver
from common import CHECK_IDS, Diagnostic, canonical_bytes, sha256
from snapshot import CHECKER_PATHS, GOV_INPUTS, LEDGER_PATH, MANIFEST_PATH
from test_target import TargetTests
from test_manifest import _baseline

class RealGitRunTests(TargetTests):
    def install(self, mutation=None):
        doc, sources, ledger = _baseline()
        if mutation: mutation(doc, sources)
        sources[LEDGER_PATH] = ledger
        sources[MANIFEST_PATH] = canonical_bytes(doc)
        for path in (*CHECKER_PATHS, *GOV_INPUTS):
            sources.setdefault(path, b"synthetic checker/input bytes; never executed")
        sources["scaffold/local-ci/config.json"] = Path(driver.__file__).with_name("config.json").read_bytes()
        for path, data in sources.items():
            destination = self.root / path
            destination.parent.mkdir(parents=True, exist_ok=True)
            destination.write_bytes(data)
        self.call("add", ".")
        self.call("commit", "-qm", "synthetic CI inputs")
        self.head = self.reader.commit("HEAD")
        self.host = {"git": self.git}

    def run_ci(self):
        return driver.run_local_ci(self.root, self.head, self.head, self.host,
                                   self.root.parent / "unused-synthetic-receipt.json")

    def test_real_manifest_missing_edge_and_duplicate_definition_stop_before_checker(self):
        mutations = (
            ("missing_input", lambda doc, sources: doc["coverage_edges"].pop()),
            ("conflict", lambda doc, sources: sources.__setitem__(
                "docs/helix-harness/L4-basic-design/common-kernel.md",
                sources["docs/helix-harness/L4-basic-design/common-kernel.md"].replace(
                    b"## Section locators\n", b"- **K1-I1 duplicate definition**\n## Section locators\n"))),
        )
        for reason, mutate in mutations:
            with self.subTest(reason=reason):
                self.install(mutate)
                with patch.object(driver, "validate_runtime_config"), \
                        patch.object(driver, "run_step") as step, \
                        patch.object(driver, "write_receipt") as writer:
                    with self.assertRaises(Diagnostic) as raised:
                        self.run_ci()
                self.assertEqual((raised.exception.classification, raised.exception.reason), ("Unknown", reason))
                self.assertFalse(hasattr(raised.exception, "evidence"))
                step.assert_not_called()
                writer.assert_not_called()

    def test_child_checker_bytes_change_before_run_is_outer_stale_without_receipt(self):
        self.install()
        (self.root / "scaffold/governance/tools/gen_rulebook.py").write_bytes(b"changed child bytes only")
        with patch.object(driver, "validate_runtime_config"), \
                patch.object(driver, "run_step") as step, \
                patch.object(driver, "write_receipt") as writer:
            with self.assertRaises(Diagnostic) as raised:
                self.run_ci()
        self.assertEqual(raised.exception.classification, "Stale")
        self.assertFalse(hasattr(raised.exception, "evidence"))
        step.assert_not_called()
        writer.assert_not_called()

    def test_child_checker_live_bytes_change_is_stale_and_govcheck_never_starts(self):
        self.install()
        calls = []
        def step(root, spec, host, portable, cancel):
            calls.append(spec["check_id"])
            key = "git" if spec["check_id"] == CHECK_IDS[3] else "python"
            row = driver.unstarted(spec, "success", portable["executables"][key],
                                   portable["sandbox"]["profile_digest"])
            row.update(exit_code=0, started_at="2026-10-09T00:00:00Z",
                       finished_at="2026-10-09T00:00:01Z", stdout_sha256=sha256(b""), stderr_sha256=sha256(b""))
            if spec["check_id"] == CHECK_IDS[1]:
                (self.root / "scaffold/governance/tools/gen_rulebook.py").write_bytes(b"changed child bytes only")
            return {"execution": row, "safe_to_continue": True, "diagnostic": None}
        with patch.object(driver, "validate_runtime_config"), \
                patch.object(driver, "run_step", side_effect=step), \
                patch.object(driver, "write_receipt") as writer:
            receipt = self.run_ci()
        self.assertEqual(calls, list(CHECK_IDS[:2]))
        self.assertEqual(receipt["aggregate_state"], "stale")
        self.assertEqual([r["state"] for r in receipt["executions"]], ["success", "success", "stale", "stale", "stale"])
        writer.assert_called_once()

for _name in tuple(n for n in dir(TargetTests) if n.startswith("test_")):
    setattr(RealGitRunTests, _name, None)
del TargetTests

if __name__ == "__main__": unittest.main()
