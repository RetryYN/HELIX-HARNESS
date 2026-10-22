#!/usr/bin/env python3
"""One inspect collects work without claiming reviews or bypassing after."""
import copy
from contextlib import redirect_stdout, redirect_stderr
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

    def cli(self, store, *selector):
        state, self.cli_output, self.cli_error = g.state, io.StringIO(), io.StringIO()
        argv = ["gui_mailbox.py", "inspect", "--runtime", "codex", "--session", "worker", *selector]
        with patch.object(g, "state", lambda: state(store)), patch("sys.argv", argv), \
                redirect_stdout(self.cli_output), redirect_stderr(self.cli_error):
            g.main()

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
        self.assertTrue(all(i.get("acked_at") is not None for i in g.work_items(self.data, "codex")))
        self.assertTrue(all(r["status"] == "acked" for r in self.inspect()["requests"]))

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
        self.flow.send("C")
        g.bind(self.data, "codex", "worker", "execution", 1, self.now)
        self.assertEqual(g.claim(self.data, "codex", "worker", self.now)["status"], "claimed")
        g.bind(self.data, "codex", "replacement", "execution", 7200, self.now+2)
        result = self.inspect(self.now+2, "replacement")
        self.assertEqual(result["requests"], [])
        self.assertEqual(result["other_sessions"][0]["event_id"], "A")
        self.assertIsNone(result["other_sessions"][0].get("untrusted_data"))
        self.assertTrue(all(not r["eligible"] and not r.get("untrusted_data") for r in result["other_sessions"]))
        self.assertEqual({r["status"] for r in result["other_sessions"]}, {"acked", "claimed", "queued"})
        self.data["messages"]["C"]["payload"]["request"] = ["tampered-old-session"]
        older = self.inspect(self.now+2, "replacement")["other_sessions"]
        self.assertTrue(next(r for r in older if r["event_id"] == "C").get("diagnostic"))
        self.assertEqual(self.data["messages"]["A"]["payload"]["receiver_session"], "worker")
        self.data["messages"].pop("A")
        self.data["issued"][a["payload_sha256"]].pop("worker_session")
        self.assertIsNone(self.inspect(self.now+2, "replacement")["other_sessions"][0].get("untrusted_data"))

    def test_cancelled_descendants_are_removed_from_batch(self):
        a = self.flow.send("A"); self.flow.send("B", "A"); self.flow.send("C", "B")
        del self.data["issued"][a["payload_sha256"]]
        result = self.inspect()
        self.assertEqual([r["event_id"] for r in result["requests"]], ["A"])
        self.assertEqual({r["event_id"] for r in result["cancellations"]}, {"B", "C"})
        self.assertTrue(all(self.data["messages"][n]["status"] == "cancelled" for n in "BC"))

    def test_outcome_failures_return_cancellation_reasons_after_compact(self):
        for outcome in ("incomplete", "declined", "release", "expired"):
            with self.subTest(outcome=outcome):
                self.setUp(); a = self.flow.send("A", ttl=600 if outcome in ("incomplete", "declined") else 1)
                self.flow.send("B", "A"); self.flow.send("C", "B")
                if outcome in ("incomplete", "declined"):
                    self.flow.result(a, outcome)
                elif outcome == "release": g.release_work(self.data,"claude","dispatcher","codex",self.now,"A")
                self.inspect(self.now+110); g.compact(self.data, self.now+110)
                cancellations = self.inspect(self.now+110)["cancellations"]
                self.assertTrue({"B", "C"}.issubset({r["event_id"] for r in cancellations}))
                self.assertTrue(all(r["status"] == "cancelled" and r["cancel_reason"] for r in cancellations))
        boundary = self.now+110+g.CLOSED_RETENTION_SECONDS
        g.bind(self.data, "codex", "worker", "execution", 7200, boundary)
        self.assertEqual(self.inspect(boundary)["cancellations"], [])

    def test_expired_slot_is_reclaimed_and_duplicate_event_is_rejected(self):
        self.flow.send("A", ttl=1); self.flow.send("B")
        self.assertEqual([r["event_id"] for r in self.inspect(self.now+2)["requests"]], ["B"])
        self.assertEqual(len(g.work_items(self.data, "codex")), 1)
        self.data.setdefault("work_queue", {})["codex"] = [copy.deepcopy(g.work_items(self.data,"codex")[0])]
        with self.assertRaises(ValueError): self.inspect(self.now+2)

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
            self.cli(store, "--all")
            saved = json.loads((store/"state.json").read_text())
            shown = json.loads(self.cli_output.getvalue())["requests"][0]["untrusted_data"]
            self.assertEqual(shown["claim"], saved["messages"]["A"]["claim"])

    def test_cli_rejects_corruption_and_invalid_selectors_without_output_or_state_change(self):
        self.flow.send("A"); self.flow.send("B")
        self.data["messages"]["B"]["payload"]["request"]["purpose"] = "tampered"
        with tempfile.TemporaryDirectory() as directory:
            store = g.Path(directory); path = store/"state.json"; path.write_text(json.dumps(self.data))
            before = path.read_bytes()
            for selector in (("--all",), (), ("--all", "--id", "A")):
                with self.assertRaises(SystemExit): self.cli(store, *selector)
                self.assertEqual(path.read_bytes(), before)
                self.assertEqual(self.cli_output.getvalue(), "")

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
        self.assertIn("inspect --id", notice)
        self.assertNotIn("subagent", notice)
        self.assertNotIn("UNTRUSTED-PROSE", notice)
        self.assertIn("inspect --all", g.notification(self.data["messages"]["A"]))
        self.assertIn("subagent", g.notification(self.data["messages"]["A"]))


if __name__ == "__main__":
    unittest.main()
