#!/usr/bin/env python3
"""One inspect collects work without claiming reviews or bypassing after."""
import copy
from contextlib import redirect_stdout
import io
import json
import tempfile
import unittest
from unittest.mock import patch
import gui_mailbox as g
import packet as p
import serial_selftest as fixtures


class InspectChecks(unittest.TestCase):
    def setUp(self):
        self.flow = fixtures.SerialChecks("test_serial_and_parallel_after_ack_body_removal")
        self.flow.setUp()
        self.data, self.now = self.flow.data, self.flow.now

    def inspect(self, at=None, session="worker"):
        return g.inspect_all(self.data, "codex", session, self.now if at is None else at)

    def ack(self, row):
        m = row["untrusted_data"]
        g.ack(self.data, row["event_id"], "codex", "worker", m["digest"], m["claim"]["nonce"], self.now)

    def test_five_independent_claims_unique_nonce_repeat_and_individual_ack(self):
        for name in "ABCDE": self.flow.send(name)
        rows = self.inspect()["requests"]
        self.assertEqual(len(rows), 5)
        self.assertTrue(all(r["eligible"] for r in rows))
        nonces = [r["untrusted_data"]["claim"]["nonce"] for r in rows]
        self.assertEqual(len(set(nonces)), 5)
        self.assertEqual([r["untrusted_data"]["claim"]["nonce"] for r in self.inspect()["requests"]], nonces)
        self.ack(rows[0])
        self.assertIsNone(self.inspect()["requests"][0]["untrusted_data"])
        g.compact(self.data, self.now)
        again = self.inspect()["requests"]
        self.assertIsNone(again[0]["untrusted_data"])
        self.assertEqual(len(g.work_items(self.data, "codex")), 5)
        for row in rows[1:]: self.ack(row)

    def test_waiting_body_visible_but_no_nonce_or_ttl_until_predecessor_result(self):
        a = self.flow.send("A"); b = self.flow.send("B", "A"); self.flow.send("C")
        rows = {r["event_id"]:r for r in self.inspect()["requests"]}
        waiting = rows["B"]
        self.assertFalse(waiting["eligible"])
        self.assertEqual(waiting["untrusted_data"]["payload"]["request"], b)
        self.assertIsNone(waiting["untrusted_data"]["claim"])
        self.assertTrue(self.data["messages"]["B"]["work_waiting"])
        self.assertEqual(self.data["messages"]["B"]["expires"], self.now+60)
        self.ack(rows["A"]); self.ack(rows["C"]); self.flow.result(a)
        second = {r["event_id"]:r for r in self.inspect(self.now+101)["requests"]}
        self.assertTrue(second["B"]["eligible"])
        self.assertEqual(second["B"]["untrusted_data"]["expires"], self.now+161)

    def test_old_session_and_unknown_legacy_metadata_never_rebound(self):
        a = self.flow.send("A")
        self.flow.claim("A")
        self.flow.send("B")
        g.bind(self.data, "codex", "worker", "execution", 1, self.now)
        self.assertEqual(g.claim(self.data, "codex", "worker", self.now)["status"], "claimed")
        g.bind(self.data, "codex", "replacement", "execution", 7200, self.now+2)
        result = self.inspect(self.now+2, "replacement")
        self.assertEqual(result["requests"], [])
        self.assertEqual(result["other_sessions"][0]["event_id"], "A")
        self.assertIsNone(result["other_sessions"][0].get("untrusted_data"))
        self.assertTrue(all(not r["eligible"] and not r["nonce"] for r in result["other_sessions"]))
        self.assertEqual(self.data["messages"]["A"]["payload"]["receiver_session"], "worker")
        self.data["messages"].pop("A")
        self.data["issued"][a["payload_sha256"]].pop("worker_session")
        self.assertIsNone(self.inspect(self.now+2, "replacement")["other_sessions"][0].get("untrusted_data"))

    def test_cancelled_descendants_are_removed_from_batch(self):
        a = self.flow.send("A"); self.flow.send("B", "A"); self.flow.send("C", "B")
        del self.data["issued"][a["payload_sha256"]]
        self.assertEqual([r["event_id"] for r in self.inspect()["requests"]], ["A"])

    def test_corrupt_payload_rejects_whole_batch_before_any_claim(self):
        self.flow.send("A"); self.flow.send("B")
        self.data["messages"]["B"]["payload"]["request"]["purpose"] = "tampered"
        before = copy.deepcopy(self.data)
        with self.assertRaisesRegex(ValueError, "B"): self.inspect()
        self.assertEqual(self.data, before)

    def test_cli_batch_output_matches_committed_state(self):
        self.flow.send("A")
        with tempfile.TemporaryDirectory() as directory:
            store = g.Path(directory)
            (store/"state.json").write_text(json.dumps(self.data))
            state, output = g.state, io.StringIO()
            argv = ["gui_mailbox.py", "inspect", "--runtime", "codex", "--session", "worker", "--all"]
            with patch.object(g, "state", lambda: state(store)), patch("sys.argv", argv), redirect_stdout(output):
                g.main()
            saved = json.loads((store/"state.json").read_text())
            shown = json.loads(output.getvalue())["requests"][0]["untrusted_data"]
            self.assertEqual(shown["claim"], saved["messages"]["A"]["claim"])

    def test_reviews_are_unclaimed_and_fixed_notice_contains_no_request_prose(self):
        self.flow.send("A")
        r = dict(schema="scaffold-review-request.v1", evidence_kind="scaffold", authority_effect="none",
                 request_id="REVIEW", repository="RetryYN/HELIX-HARNESS", pr=1, base_sha=self.flow.base,
                 content_sha=self.flow.head, author="claude", reviewer="codex", purpose="UNTRUSTED-PROSE",
                 scope=["bounded"], route="vscode_gui_mailbox", references=p.references(self.flow.head))
        r["payload_sha256"] = p.sha(p.encode(r)); p.validate(r, self.flow.base, self.flow.head)
        g.send(self.data, "claude", "dispatcher", "REVIEW", "review_request", r, None, 60, self.now)
        self.assertEqual(len(self.inspect()["requests"]), 1)
        self.assertEqual(self.data["messages"]["REVIEW"]["status"], "queued")
        message = g.claim(self.data, "codex", "worker", self.now)
        notice = g.notification(message)
        self.assertIn("inspect --all", notice)
        self.assertIn("subagent", notice)
        self.assertNotIn("UNTRUSTED-PROSE", notice)


if __name__ == "__main__":
    unittest.main()
