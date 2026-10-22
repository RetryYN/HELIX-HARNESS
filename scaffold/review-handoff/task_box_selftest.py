#!/usr/bin/env python3
"""Task-box integration tests through real packet and GUI-mailbox functions."""
import copy
import unittest

import gui_mailbox as g
import packet as p
import task_box as b


class BoxChecks(unittest.TestCase):
    def setUp(self):
        self.now = 1_800_000_000.0
        self.head = p.git("rev-parse", "HEAD").decode().strip()
        self.data = {"version": 1, "lanes": {}, "observed": {}, "messages": {}}
        g.bind(self.data, "claude", "claude-session", "execution", 600, self.now)
        g.bind(self.data, "codex", "codex-session", "review_merge", 600, self.now)

    def request(self, request_id, purpose="bounded task"):
        request = {"schema": "scaffold-work-request.v1", "evidence_kind": "scaffold", "authority_effect": "none",
                   "request_id": request_id, "repository": "RetryYN/HELIX-HARNESS", "issue": 3570,
                   "base_sha": self.head, "dispatcher": "claude", "worker": "codex", "purpose": purpose,
                   "scope": ["one finite task"], "route": "vscode_gui_mailbox", "references": p.references(self.head)}
        request["payload_sha256"] = p.sha(p.encode(request))
        p.validate_work(request, self.head)
        return request

    def manifest(self, count=3):
        requests = [self.request("REQ-%d" % index) for index in range(count)]
        lanes = [{"mode": "serial", "wait_for": "result", "requests": requests[:2]}]
        if count > 2:
            lanes.append({"mode": "parallel", "wait_for": "result", "requests": requests[2:]})
        return {"schema": b.SCHEMA, "evidence_kind": "scaffold", "authority_effect": "none",
                "box_id": "BOX-3570", "lanes": lanes}

    def dispatch(self, manifest=None, data=None):
        target = self.data if data is None else data
        def send_child(staged, event_id, request):
            return g.send(staged, "claude", "claude-session", event_id, "work_request", request,
                          None, 60, self.now)
        return b.send_box(target, manifest or self.manifest(), send_child)

    def claim_ack(self, event_id, now=None):
        current = self.now if now is None else now
        message = g.claim(self.data, "codex", "codex-session", current)
        self.assertIsNotNone(message)
        self.assertEqual(message["payload"]["event_id"], event_id)
        g.ack(self.data, event_id, "codex", "codex-session", message["digest"],
              message["claim"]["nonce"], current)
        return message

    def incomplete(self, request):
        return {"schema": "scaffold-work-result.v1", "evidence_kind": "scaffold", "authority_effect": "none",
                "request_id": request["request_id"], "request_payload_sha256": request["payload_sha256"],
                "issue": request["issue"], "base_sha": request["base_sha"],
                "dispatcher": request["dispatcher"], "worker": request["worker"], "result": "incomplete",
                "result_sha": None, "branch": None, "summary": ["test incomplete"]}

    def test_parallel_serial_claim_result_and_waiting_ttl(self):
        manifest = self.manifest()
        sent = self.dispatch(manifest)
        self.assertEqual([m["payload"]["event_id"] for m in sent], ["BOX-3570-0", "BOX-3570-1", "BOX-3570-2"])
        self.assertNotIn("messages", self.data["task_boxes"]["BOX-3570"])
        self.claim_ack("BOX-3570-0")
        waiting = self.data["messages"]["BOX-3570-1"]
        waiting_expiry = waiting["expires"]
        result = self.incomplete(manifest["lanes"][0]["requests"][0])
        g.send(self.data, "codex", "codex-session", "RESULT-0", "work_result",
               manifest["lanes"][0]["requests"][0], result, 60, self.now)
        self.assertFalse(b.can_claim(self.data, "BOX-3570-1"))
        self.assertTrue(self.data["messages"]["BOX-3570-1"].get("work_waiting"))
        self.assertEqual(self.data["messages"]["BOX-3570-1"]["expires"], waiting_expiry)
        self.claim_ack("BOX-3570-2", self.now + 30)
        self.assertEqual(self.data["messages"]["BOX-3570-2"]["expires"], self.now + 90)
        self.assertIsNone(g.claim(self.data, "codex", "codex-session", self.now + 31))

    def test_release_does_not_open_serial_successor(self):
        self.dispatch(self.manifest(2))
        g.release_work(self.data, "claude", "claude-session", "codex", self.now, "BOX-3570-0")
        self.assertFalse(b.can_claim(self.data, "BOX-3570-1"))
        self.assertIsNone(g.claim(self.data, "codex", "codex-session", self.now + 20))
        self.assertTrue(self.data["messages"]["BOX-3570-1"].get("work_waiting"))

    def test_capacity_failure_rolls_back_entire_box(self):
        for index in range(4):
            request = self.request("PREFILL-%d" % index)
            g.send(self.data, "claude", "claude-session", "PREFILL-EVENT-%d" % index,
                   "work_request", request, None, 60, self.now)
        before = p.encode(self.data)
        manifest = {"schema": b.SCHEMA, "evidence_kind": "scaffold", "authority_effect": "none",
                    "box_id": "OVER-CAPACITY", "lanes": [{"mode": "serial", "wait_for": "result",
                    "requests": [self.request("BOX-A"), self.request("BOX-B")]}]}
        with self.assertRaisesRegex(ValueError, "未完了依頼上限"):
            self.dispatch(manifest)
        self.assertEqual(p.encode(self.data), before)

    def test_five_child_limit_and_manifest_retry_binding(self):
        six = {"schema": b.SCHEMA, "evidence_kind": "scaffold", "authority_effect": "none", "box_id": "SIX",
               "lanes": [{"mode": "serial", "wait_for": "merge",
                          "requests": [self.request("S-%d" % n) for n in range(6)]}]}
        with self.assertRaisesRegex(ValueError, "上限は5件"):
            self.dispatch(six)
        manifest = self.manifest(2)
        first = self.dispatch(manifest)
        second = self.dispatch(manifest)
        self.assertEqual(first, second)
        changed = copy.deepcopy(manifest)
        changed_request = changed["lanes"][0]["requests"][0]
        changed_request["purpose"] = "different"
        changed_request.pop("payload_sha256")
        changed_request["payload_sha256"] = p.sha(p.encode(changed_request))
        with self.assertRaisesRegex(ValueError, "異なる再利用"):
            self.dispatch(changed)

    def test_cleanup_uses_assignment_and_retention_not_child_status(self):
        self.dispatch(self.manifest(2))
        g.release_work(self.data, "claude", "claude-session", "codex", self.now, "BOX-3570-0")
        g.release_work(self.data, "claude", "claude-session", "codex", self.now, "BOX-3570-1")
        b.cleanup(self.data, set(), self.now + 5, 10)
        self.assertIn("BOX-3570", self.data["task_boxes"])
        b.cleanup(self.data, set(), self.now + 15, 10)
        self.assertNotIn("task_boxes", self.data)


if __name__ == "__main__":
    unittest.main()
