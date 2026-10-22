#!/usr/bin/env python3
"""Optional after dependency tests through real mailbox/packet functions."""
import copy
import unittest
import gui_mailbox as g
import packet as p


class SerialChecks(unittest.TestCase):
    def setUp(self):
        self.now = 1800000000
        self.head = p.git("rev-parse", "HEAD").decode().strip()
        self.base = p.git("rev-parse", "HEAD^").decode().strip()
        self.data = dict(version=1, lanes={}, observed={}, messages={})
        g.bind(self.data, "claude", "dispatcher", "review_merge", 7200, self.now)
        g.bind(self.data, "codex", "worker", "execution", 7200, self.now)

    def request(self, event, after=None):
        r = dict(schema="scaffold-work-request.v1", evidence_kind="scaffold", authority_effect="none",
                 request_id=event, repository="RetryYN/HELIX-HARNESS", issue=3570, base_sha=self.base,
                 dispatcher="claude", worker="codex", purpose="finite test", scope=["serial"],
                 route="vscode_gui_mailbox", references=p.references(self.base))
        if after is not None: r["after"] = after
        r["payload_sha256"] = p.sha(p.encode(r))
        p.validate_work(r, self.base)
        return r

    def send(self, event, after=None, ttl=60):
        r = self.request(event, after)
        g.send(self.data, "claude", "dispatcher", event, "work_request", r, None, ttl, self.now)
        return r

    def claim(self, expected, at=None):
        at = self.now if at is None else at
        m = g.claim(self.data, "codex", "worker", at)
        self.assertEqual(m["payload"]["event_id"] if m else None, expected)
        if m: g.ack(self.data, expected, "codex", "worker", m["digest"], m["claim"]["nonce"], at)

    def result(self, request, kind="proposal"):
        r = {k:request[k] for k in ("request_id", "issue", "base_sha", "dispatcher", "worker")}
        r.update(schema="scaffold-work-result.v1", evidence_kind="scaffold", authority_effect="none",
                 request_payload_sha256=request["payload_sha256"], result=kind,
                 result_sha=self.head if kind == "proposal" else None,
                 branch="test/serial" if kind == "proposal" else None, summary=["finite result"])
        g.send(self.data, "codex", "worker", request["request_id"]+"-"+kind, "work_result",
               request, r, 60, self.now+100)

    def test_serial_and_parallel_after_ack_body_removal(self):
        a = self.send("A"); b = self.send("B", "A"); self.send("D", "B"); self.send("C")
        self.claim("A"); g.compact(self.data, self.now)
        self.assertNotIn("A", self.data["messages"])
        self.claim("C", self.now+100)
        self.claim(None, self.now+101)
        self.result(a)
        self.claim("B", self.now+102)
        self.assertEqual(self.data["messages"]["B"]["expires"], self.now+162)
        self.claim(None, self.now+103)
        self.result(b)
        self.claim("D", self.now+104)

    def test_failure_release_and_expiry_cancel_only_descendants(self):
        for outcome in ("incomplete", "declined", "release", "expired"):
            with self.subTest(outcome=outcome):
                self.setUp(); a = self.send("A", ttl=1); self.send("B", "A"); self.send("D", "B"); self.send("C")
                if outcome in ("incomplete", "declined"):
                    self.claim("A"); self.result(a, outcome)
                elif outcome == "release":
                    g.release_work(self.data, "claude", "dispatcher", "codex", self.now, "A")
                self.claim("C", self.now+10)
                self.assertEqual({i["event_id"] for i in g.work_items(self.data,"codex")}, {"C"})
                g.compact(self.data, self.now+10)
                self.assertEqual(self.data["closed"]["B"]["status"], "cancelled")
                self.assertEqual(self.data["closed"]["D"]["status"], "cancelled")
                self.assertTrue(self.data["closed"]["B"]["cancel_reason"].startswith("after:A:"))
                self.assertTrue(self.data["closed"]["D"]["cancel_reason"].startswith("after:B:"))

    def test_parent_result_survives_retention_while_child_waits(self):
        a = self.send("A"); self.send("B", "A"); self.claim("A"); self.result(a)
        g.compact(self.data, self.now+90000)
        g.bind(self.data, "codex", "worker", "execution", 7200, self.now+90000)
        self.claim("B", self.now+90001)

    def test_old_result_retry_does_not_rewind_later_failure(self):
        a = self.send("A"); self.claim("A")
        self.result(a); self.result(a, "incomplete"); self.result(a)
        self.assertEqual(g.dependency_state(self.data, "A")[0], "failed")

    def test_after_identity_and_original_result_binding(self):
        self.send("A")
        before = copy.deepcopy(self.data)
        with self.assertRaises(ValueError): self.send("B", "missing")
        self.assertEqual(self.data, before)
        b = self.send("B", "A")
        altered = dict(b, after="elsewhere")
        with self.assertRaises(ValueError): p.validate_work(altered, self.base)
        g.bind(self.data, "codex", "replacement", "execution", 7200, self.now+7201)
        with self.assertRaises(ValueError): self.send("D", "A")


if __name__ == "__main__":
    unittest.main()
